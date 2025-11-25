export const MOCK_SUMMARY = {
    totalHours: 42.5,
    focusRatio: 35,
    topCategory: "Deep Work",
    timeSink: "Meetings"
};

export const MOCK_DISTRIBUTION = [
    { name: "Deep Work", value: 15, color: "#818CF8" }, // Indigo
    { name: "Meetings", value: 12, color: "#F87171" },  // Red
    { name: "Admin", value: 5, color: "#FBBF24" },     // Amber
    { name: "Learning", value: 6, color: "#34D399" },   // Emerald
    { name: "Other", value: 4.5, color: "#94A3B8" }     // Slate
];

export const MOCK_WEEKLY_TREND = [
    { day: "Mon", hours: 7.5, focus: 3 },
    { day: "Tue", hours: 8.2, focus: 4 },
    { day: "Wed", hours: 6.5, focus: 2 },
    { day: "Thu", hours: 9.0, focus: 5 },
    { day: "Fri", hours: 5.5, focus: 1.5 },
    { day: "Sat", hours: 2.0, focus: 0 },
    { day: "Sun", hours: 1.0, focus: 0.5 }
];

export const MOCK_HEATMAP = Array.from({ length: 7 }, (_, dayIndex) =>
    Array.from({ length: 12 }, (_, hourIndex) => ({
        day: dayIndex,
        hour: hourIndex + 8, // 8 AM to 8 PM
        value: Math.random() > 0.7 ? Math.floor(Math.random() * 60) : 0
    }))
).flat();
