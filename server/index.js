import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import * as db from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// OAuth Setup
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

// Default user ID for single-user mode (scalable to multi-user later)
const DEFAULT_USER_ID = 1;

// Routes
app.get('/', (req, res) => {
    res.send('Calendar Vibes API is running 🚀');
});

app.get('/auth/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get or create default user
        const user = db.getOrCreateUser('default_user', null);
        db.saveTokens(user.id, tokens);

        res.redirect('http://localhost:5173?connected=true');
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.status(500).send('Authentication failed');
    }
});

// Color palette for categories
const COLOR_PALETTE = [
    "#818CF8", "#F87171", "#34D399", "#FBBF24", "#A78BFA",
    "#FB923C", "#EC4899", "#06B6D4", "#84CC16", "#F472B6"
];

// --- NORMALIZATION LOGIC ---

// 1. Synonym Map (Hardcoded for now, could be DB driven later)
const SYNONYM_MAP = {
    "外出就餐": "外出聚餐",
    "DINNER OUT": "外出聚餐",
    "EATING OUT": "外出聚餐"
};

// 2. Helper to get "Canonical Key" for grouping
function getCanonicalKey(title) {
    if (!title) return "UNTITLED";

    // Step A: Check Synonym Map first
    if (SYNONYM_MAP[title]) return SYNONYM_MAP[title].toUpperCase();

    let key = title.trim();

    // Step B: Remove trailing numbers (e.g., "Boxing 15" -> "Boxing")
    key = key.replace(/[\s\-\#]+\d+$/, '');

    // Step C: Remove Emojis (for grouping only)
    key = key.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');

    // Step D: Normalize whitespace and case
    key = key.trim().toUpperCase();

    return key;
}

// 3. Helper to pick best display name from a group
function getBestDisplayName(titles) {
    if (!titles || titles.length === 0) return "Untitled";

    // Priority 1: Is it a target in SYNONYM_MAP?
    const synonymTargets = Object.values(SYNONYM_MAP);
    const explicitTarget = titles.find(t => synonymTargets.includes(t));
    if (explicitTarget) return explicitTarget;

    // Priority 2: Has Emoji?
    const withEmoji = titles.find(t => /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/.test(t));
    if (withEmoji) return withEmoji;

    // Priority 3: All Uppercase (for acronyms like IELTS)
    const allCaps = titles.find(t => t === t.toUpperCase() && t !== t.toLowerCase());
    if (allCaps) return allCaps;

    // Priority 4: Longest string (usually most descriptive)
    return titles.reduce((a, b) => a.length >= b.length ? a : b);
}

// --- AI CLASSIFICATION ---

async function classifyWithGemini(titles) {
    if (titles.length === 0) return {};

    console.log(`[DEBUG] Gemini API Key Length: ${process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 'MISSING'}`);
    console.log(`[DEBUG] Attempting to classify ${titles.length} titles:`, titles);

    const promptText = `
    You are an intelligent time-tracking assistant for a Data Scientist who is also passionate about AI, Investment (reading annual reports, shareholder letters), and Fitness (Gym, Home Workout).

    Classify the following calendar event titles into exactly one of these 4 categories:
    1. INVESTMENT: High-value work, coding, data science, AI study, investment research, reading reports, deep work, meetings.
    2. RECOVERY: Sleep, gym, workout, meditation, rest, sports.
    3. MAINTENANCE: Chores, commute, eating, logistics, errands, shower.
    4. PASSIVE: Entertainment, games, social media, browsing, low-value leisure, TV.

    Return ONLY a valid JSON object mapping the event title to the category. Do not include markdown formatting.
    
    Titles to classify:
    ${JSON.stringify(titles)}
    `;

    const API_KEY = process.env.GEMINI_API_KEY;
    const MODELS_TO_TRY = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-pro"];

    for (const model of MODELS_TO_TRY) {
        console.log(`[DEBUG] Trying model: ${model}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }]
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.warn(`[WARN] Model ${model} failed: ${response.status} - ${errText}`);
                continue;
            }

            const data = await response.json();
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error("Invalid API response structure");
            }

            const text = data.candidates[0].content.parts[0].text;
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            console.log(`[SUCCESS] Classified using ${model}:`, parsed);
            return parsed;

        } catch (error) {
            console.error(`[ERROR] Failed with ${model}:`, error.message);
        }
    }

    console.error("[FATAL] All Gemini models failed.");
    return {};
}

// --- ANALYSIS ENGINE ---

async function analyzeEvents(events, userId = DEFAULT_USER_ID) {
    // 1. Group Raw Events by Canonical Key
    const groups = new Map();

    events.forEach(event => {
        if (!event.start.dateTime || !event.end.dateTime) return;

        const rawTitle = (event.summary || "Untitled").trim();
        const canonicalKey = getCanonicalKey(rawTitle);

        if (!groups.has(canonicalKey)) {
            groups.set(canonicalKey, {
                titles: new Set(),
                events: [],
                meta: null
            });
        }
        const group = groups.get(canonicalKey);
        group.titles.add(rawTitle);
        group.events.push(event);
    });

    // 2. Resolve Meta Categories (Cache -> AI)
    const categoryCache = db.getCategoryCache(userId);
    const keysToClassify = [];

    for (const [key, group] of groups) {
        // Try finding a cache hit for the canonical key
        if (categoryCache[key]) {
            group.meta = categoryCache[key];
            continue;
        }

        // Need to classify
        keysToClassify.push({ key, sampleTitle: getBestDisplayName(Array.from(group.titles)) });
    }

    // Batch Classify
    if (keysToClassify.length > 0) {
        const titlesToSend = keysToClassify.map(k => k.sampleTitle);
        console.log(`Classifying ${titlesToSend.length} groups...`);

        const aiResults = await classifyWithGemini(titlesToSend);

        // Map results back to groups and update cache
        const cacheEntries = [];
        keysToClassify.forEach(({ key, sampleTitle }) => {
            const meta = aiResults[sampleTitle] || 'MAINTENANCE';
            const group = groups.get(key);
            group.meta = meta;

            cacheEntries.push({
                canonicalKey: key,
                metaCategory: meta,
                displayName: sampleTitle
            });
        });

        // Bulk update cache
        if (cacheEntries.length > 0) {
            db.bulkSetCategoryCache(cacheEntries, userId);
        }
    }

    // 3. Aggregate Data
    const dailyStats = {};
    const timeOfDay = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    const weekdayVsWeekend = { weekday: 0, weekend: 0 };
    const activityDurations = [];
    const hourlyDistribution = Array(24).fill(0);
    let totalMinutes = 0;

    const mergedCategories = {};

    for (const [key, group] of groups) {
        const displayName = getBestDisplayName(Array.from(group.titles));
        const metaCategory = group.meta || 'MAINTENANCE';

        if (!mergedCategories[displayName]) {
            mergedCategories[displayName] = {
                name: displayName,
                meta: metaCategory,
                minutes: 0,
                count: 0,
                events: []
            };
        }

        group.events.forEach(event => {
            const start = new Date(event.start.dateTime);
            const end = new Date(event.end.dateTime);
            const durationMin = (end - start) / (1000 * 60);

            mergedCategories[displayName].minutes += durationMin;
            mergedCategories[displayName].count++;
            mergedCategories[displayName].events.push({
                title: event.summary,
                date: start,
                duration: durationMin
            });

            // Stats
            const hour = start.getHours();
            if (hour >= 5 && hour < 12) timeOfDay.morning += durationMin;
            else if (hour >= 12 && hour < 17) timeOfDay.afternoon += durationMin;
            else if (hour >= 17 && hour < 22) timeOfDay.evening += durationMin;
            else timeOfDay.night += durationMin;

            const dayOfWeek = start.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) weekdayVsWeekend.weekend += durationMin;
            else weekdayVsWeekend.weekday += durationMin;

            hourlyDistribution[hour] += durationMin / 60;

            const dayKey = start.toLocaleDateString('en-US', { weekday: 'short' });
            if (!dailyStats[dayKey]) {
                dailyStats[dayKey] = { day: dayKey, hours: 0, events: 0 };
            }
            dailyStats[dayKey].hours += durationMin / 60;
            dailyStats[dayKey].events++;

            activityDurations.push({ category: displayName, meta: metaCategory, duration: durationMin });
            totalMinutes += durationMin;
        });
    }

    // 4. Format Output
    let colorIndex = 0;
    Object.values(mergedCategories).forEach(cat => {
        cat.value = parseFloat((cat.minutes / 60).toFixed(1));
        cat.avgDuration = parseFloat((cat.minutes / cat.count / 60).toFixed(1));
        cat.color = COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];
        cat.events.sort((a, b) => b.duration - a.duration);
        colorIndex++;
    });

    const distribution = Object.values(mergedCategories)
        .sort((a, b) => b.value - a.value);

    // Weekly trend
    const weeklyTrend = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day =>
        dailyStats[day] ? {
            day,
            hours: parseFloat(dailyStats[day].hours.toFixed(1)),
            events: dailyStats[day].events
        } : { day, hours: 0, events: 0 }
    );

    // Time of day
    const timeOfDayData = [
        { name: "Morning", value: parseFloat((timeOfDay.morning / 60).toFixed(1)), percentage: Math.round((timeOfDay.morning / totalMinutes) * 100) },
        { name: "Afternoon", value: parseFloat((timeOfDay.afternoon / 60).toFixed(1)), percentage: Math.round((timeOfDay.afternoon / totalMinutes) * 100) },
        { name: "Evening", value: parseFloat((timeOfDay.evening / 60).toFixed(1)), percentage: Math.round((timeOfDay.evening / totalMinutes) * 100) },
        { name: "Night", value: parseFloat((timeOfDay.night / 60).toFixed(1)), percentage: Math.round((timeOfDay.night / totalMinutes) * 100) }
    ];

    // 5. LYUBISHCHEV & INSIGHTS
    const insights = [];
    const metaStats = {
        INVESTMENT: { value: 0, count: 0, deepBlocks: 0 },
        RECOVERY: { value: 0, count: 0 },
        PASSIVE: { value: 0, count: 0 },
        MAINTENANCE: { value: 0, count: 0 }
    };

    activityDurations.forEach(item => {
        const metaType = item.meta || 'MAINTENANCE';
        if (metaStats[metaType]) {
            metaStats[metaType].value += item.duration;
            metaStats[metaType].count++;
            if (metaType === 'INVESTMENT' && item.duration >= 90) {
                metaStats.INVESTMENT.deepBlocks++;
            }
        }
    });

    const totalDays = Object.keys(dailyStats).length || 1;
    const hours = {
        investment: metaStats.INVESTMENT.value / 60,
        recovery: metaStats.RECOVERY.value / 60,
        passive: metaStats.PASSIVE.value / 60,
        maintenance: metaStats.MAINTENANCE.value / 60
    };

    const BENCHMARKS = { RECOVERY_DAILY: 8 };

    const lyubishchev = {
        metaDistribution: [
            { name: "Investment", value: parseFloat(hours.investment.toFixed(1)), color: "#818CF8" },
            { name: "Recovery", value: parseFloat(hours.recovery.toFixed(1)), color: "#34D399" },
            { name: "Maintenance", value: parseFloat(hours.maintenance.toFixed(1)), color: "#94A3B8" },
            { name: "Passive", value: parseFloat(hours.passive.toFixed(1)), color: "#F472B6" }
        ],
        metrics: {
            recoveryRate: Math.min(100, Math.round((hours.recovery / (totalDays * BENCHMARKS.RECOVERY_DAILY)) * 100)),
            investmentRatio: hours.passive > 0 ? (hours.investment / hours.passive).toFixed(1) : "∞",
            maintenanceRatio: Math.round((hours.maintenance / (totalMinutes / 60)) * 100),
            deepWorkBlocks: metaStats.INVESTMENT.deepBlocks
        }
    };

    // Generate Insights
    const ignoredCategories = ['sleep', 'work', 'job', 'sleeping', 'working', '睡眠', '工作', '上班'];
    const topPersonal = distribution.find(c => !ignoredCategories.some(ignored => c.name.toLowerCase().includes(ignored)));
    if (topPersonal) {
        insights.push({
            type: "dominant",
            title: "Top Personal Focus",
            message: `Outside of work and sleep, your biggest focus is "${topPersonal.name}" (${topPersonal.value} hours).`
        });
    }

    insights.push({
        type: "focus",
        title: "Deep Focus Score",
        message: `You had ${metaStats.INVESTMENT.deepBlocks} deep work sessions (>90min).`
    });

    const avgEventsPerDay = activityDurations.length / totalDays;
    insights.push({
        type: "fragmentation",
        title: "Context Switching",
        message: `You average ${Math.round(avgEventsPerDay)} activities per day.`
    });

    const weekdayHours = weekdayVsWeekend.weekday / 60;
    const weekendHours = weekdayVsWeekend.weekend / 60;
    const ratio = weekendHours > 0 ? (weekdayHours / weekendHours).toFixed(1) : "∞";
    insights.push({
        type: "balance",
        title: "Work-Life Rhythm",
        message: `You are ${ratio}x more active on weekdays.`
    });

    // Deep Insights Algorithms
    const shortSessions = activityDurations.filter(a => a.duration < 30).length;
    const totalSessions = activityDurations.length || 1;
    const fragmentationScore = Math.round((shortSessions / totalSessions) * 100);

    let fragmentationLevel = "Low";
    if (fragmentationScore > 30) fragmentationLevel = "Moderate";
    if (fragmentationScore > 50) fragmentationLevel = "High";

    const hourlyInvestment = Array(24).fill(0);
    const hourlyLowValue = Array(24).fill(0);

    for (const [key, group] of groups) {
        const meta = group.meta || 'MAINTENANCE';
        group.events.forEach(event => {
            const start = new Date(event.start.dateTime);
            const hour = start.getHours();
            const duration = (new Date(event.end.dateTime) - start) / (1000 * 60);
            if (meta === 'INVESTMENT') hourlyInvestment[hour] += duration;
            else if (meta === 'MAINTENANCE' || meta === 'PASSIVE') hourlyLowValue[hour] += duration;
        });
    }

    let maxInvestVal = 0;
    let peakStartHour = 0;
    for (let i = 0; i < 22; i++) {
        const sum = hourlyInvestment[i] + hourlyInvestment[i + 1] + hourlyInvestment[i + 2];
        if (sum > maxInvestVal) {
            maxInvestVal = sum;
            peakStartHour = i;
        }
    }
    const peakWindow = `${peakStartHour}:00 - ${peakStartHour + 3}:00`;

    const dailyMeta = {};
    for (const [key, group] of groups) {
        const meta = group.meta || 'MAINTENANCE';
        group.events.forEach(event => {
            const day = new Date(event.start.dateTime).toDateString();
            const duration = (new Date(event.end.dateTime) - new Date(event.start.dateTime)) / (1000 * 60);
            if (!dailyMeta[day]) dailyMeta[day] = { investment: 0, recovery: 0 };
            if (meta === 'INVESTMENT') dailyMeta[day].investment += duration;
            if (meta === 'RECOVERY') dailyMeta[day].recovery += duration;
        });
    }

    let burnoutDays = 0;
    Object.values(dailyMeta).forEach(d => {
        if (d.investment > 6 * 60 && d.recovery < 6 * 60) {
            burnoutDays++;
        }
    });
    const burnoutRisk = burnoutDays > 2 ? "High" : burnoutDays > 0 ? "Moderate" : "Low";

    const deepInsights = {
        fragmentation: {
            score: fragmentationScore,
            level: fragmentationLevel,
            shortSessions,
            totalSessions,
            description: `${fragmentationScore}% of your sessions are under 30 mins.`
        },
        chronotype: {
            peakWindow,
            hourlyInvestment: hourlyInvestment.map(v => parseFloat((v / 60).toFixed(1))),
            hourlyLowValue: hourlyLowValue.map(v => parseFloat((v / 60).toFixed(1)))
        },
        burnout: {
            risk: burnoutRisk,
            highStressDays: burnoutDays,
            description: burnoutDays > 2 ? "Warning: Multiple days with high load and low recovery." : "Recovery balance looks healthy."
        }
    };

    return {
        summary: {
            totalHours: parseFloat((totalMinutes / 60).toFixed(1)),
            activeCategories: Object.keys(mergedCategories).length,
            longestSession: activityDurations.length > 0 ? Math.max(...activityDurations.map(a => a.duration)) / 60 : 0,
            totalEvents: events.filter(e => e.start.dateTime && e.end.dateTime).length,
            avgSessionLength: parseFloat((totalMinutes / (activityDurations.length || 1) / 60).toFixed(1))
        },
        distribution,
        weeklyTrend,
        timeOfDayData,
        weekdayVsWeekend: {
            weekday: parseFloat(weekdayHours.toFixed(1)),
            weekend: parseFloat(weekendHours.toFixed(1))
        },
        hourlyDistribution: hourlyDistribution.map((h, i) => ({ hour: i, value: parseFloat(h.toFixed(1)) })),
        insights,
        lyubishchev,
        deepInsights
    };
}

app.get('/api/analytics', async (req, res) => {
    // Get tokens from DB
    const user = db.getOrCreateUser('default_user', null);
    const tokens = db.getTokens(user.id);

    if (!tokens) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
        const { timeMin, timeMax } = req.query;
        let minDate, maxDate;

        if (timeMin) minDate = new Date(timeMin);
        else {
            minDate = new Date();
            minDate.setDate(minDate.getDate() - 30);
        }

        if (timeMax) maxDate = new Date(timeMax);
        else maxDate = new Date();

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: minDate.toISOString(),
            timeMax: maxDate.toISOString(),
            maxResults: 2500,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const analytics = await analyzeEvents(response.data.items, user.id);
        res.json(analytics);

    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Category Tuner Endpoints
app.get('/api/categories', (req, res) => {
    const user = db.getOrCreateUser('default_user', null);
    const cache = db.getCategoryCache(user.id);
    res.json(cache);
});

app.post('/api/categories', async (req, res) => {
    const { title, meta } = req.body;
    if (!title || !meta) {
        return res.status(400).json({ error: 'Missing title or meta category' });
    }

    const user = db.getOrCreateUser('default_user', null);
    const canonical = getCanonicalKey(title);

    db.setCategoryCache(canonical, meta, title, user.id);

    res.json({ success: true, title, meta });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`[DB] Using SQLite at: server/calendar_vibes.db`);
});
