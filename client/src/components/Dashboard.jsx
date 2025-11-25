import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CategoryDrilldown } from "@/components/charts/CategoryDrilldown";
import { WeeklyBar } from "@/components/charts/WeeklyBar";
import ComparisonPanel from "@/components/ComparisonPanel";
import InsightsPanel from "@/components/InsightsPanel";
import LyubishchevPanel from "@/components/LyubishchevPanel";
import DeepInsightsPanel from "@/components/DeepInsightsPanel";
import CategoryTable from "@/components/CategoryTable";
import CategoryTuner from "@/components/CategoryTuner";
import { Clock, Zap, Activity, BarChart2, Calendar as CalendarIcon, Filter, Settings } from "lucide-react";
import axios from "axios";

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [prevData, setPrevData] = useState(null); // Data for previous year
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Default to last 30 days
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [isTunerOpen, setIsTunerOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Current Period Data
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const currentRes = await axios.get("http://localhost:3000/api/analytics", {
                params: {
                    timeMin: start.toISOString(),
                    timeMax: end.toISOString()
                }
            });
            setData(currentRes.data);

            // 2. Fetch Previous Year Data (YoY Comparison)
            const prevStart = new Date(start);
            prevStart.setFullYear(prevStart.getFullYear() - 1);

            const prevEnd = new Date(end);
            prevEnd.setFullYear(prevEnd.getFullYear() - 1);

            const prevRes = await axios.get("http://localhost:3000/api/analytics", {
                params: {
                    timeMin: prevStart.toISOString(),
                    timeMax: prevEnd.toISOString()
                }
            });
            setPrevData(prevRes.data);

        } catch (err) {
            console.error(err);
            setError("Failed to load analytics. Please try reconnecting.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0f172a]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(6,182,212,0.5)]"></div>
                    <p className="text-cyan-400 animate-pulse font-mono text-sm tracking-widest">INITIALIZING...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center text-rose-400 bg-[#0f172a]">
                {error}
            </div>
        );
    }

    const { summary, distribution, weeklyTrend, weekdayVsWeekend, insights, lyubishchev, deepInsights } = data;

    // Calculate max value for weekday/weekend bars
    const maxDayHours = Math.max(weekdayVsWeekend.weekday, weekdayVsWeekend.weekend, 1);

    return (
        <div className="min-h-screen bg-[#0f172a] relative overflow-hidden text-slate-200 selection:bg-cyan-500/30">
            {/* Sizzling Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative space-y-8 w-full max-w-7xl mx-auto p-6 lg:p-10">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-10">
                    <div>
                        <h2 className="text-5xl font-black tracking-tight text-white mb-2">
                            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                                Calendar Vibes
                            </span>
                        </h2>
                        <p className="text-slate-400 flex items-center gap-2 font-medium">
                            <Activity size={16} className="text-cyan-400" />
                            AI-Powered Life Analytics
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsTunerOpen(true)}
                            className="p-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-cyan-400 rounded-xl border border-white/10 transition-all group relative"
                            title="Manage AI Rules"
                        >
                            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Tune AI
                            </span>
                        </button>

                        <div className="flex items-center gap-3 bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
                            <div className="flex items-center gap-2 px-4 py-2 text-slate-400 text-sm font-medium border-r border-white/10">
                                <CalendarIcon size={14} className="text-cyan-400" />
                                <span>Range</span>
                            </div>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent border-none text-sm text-white focus:ring-0 cursor-pointer font-mono"
                            />
                            <span className="text-slate-600">→</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent border-none text-sm text-white focus:ring-0 cursor-pointer font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Enhanced KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <GlassCard delay={0.1} className="group hover:border-cyan-500/30 transition-colors">
                        <div className="flex items-center space-x-4">
                            <div className="p-3.5 bg-cyan-500/10 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Tracked</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{summary.totalHours}<span className="text-sm text-slate-500 ml-1 font-normal">hrs</span></h3>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard delay={0.2} className="group hover:border-purple-500/30 transition-colors">
                        <div className="flex items-center space-x-4">
                            <div className="p-3.5 bg-purple-500/10 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Activities</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{summary.activeCategories}<span className="text-sm text-slate-500 ml-1 font-normal">types</span></h3>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard delay={0.3} className="group hover:border-amber-500/30 transition-colors">
                        <div className="flex items-center space-x-4">
                            <div className="p-3.5 bg-amber-500/10 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                <Zap size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Avg Session</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{summary.avgSessionLength}<span className="text-sm text-slate-500 ml-1 font-normal">hrs</span></h3>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard delay={0.4} className="group hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center space-x-4">
                            <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <BarChart2 size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Events</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{summary.totalEvents}</h3>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Lyubishchev Objective Analysis */}
                {lyubishchev && (
                    <GlassCard delay={0.45} className="border-t-4 border-t-emerald-500/50">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Activity className="text-emerald-400" size={20} />
                                </div>
                                Lyubishchev Objective Analysis
                            </h3>
                            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                SCIENTIFIC MODE
                            </span>
                        </div>
                        <LyubishchevPanel data={lyubishchev} />
                    </GlassCard>
                )}

                {/* Deep Insights Panel (Advanced Analytics) */}
                {deepInsights && (
                    <GlassCard delay={0.48} className="border-t-4 border-t-purple-500/50">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Zap className="text-purple-400" size={20} />
                                </div>
                                Deep Behavioral Analytics
                            </h3>
                            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                                ADVANCED
                            </span>
                        </div>
                        <DeepInsightsPanel data={deepInsights} />
                    </GlassCard>
                )}

                {/* Insights Panel */}
                <GlassCard delay={0.5}>
                    <InsightsPanel insights={insights} />
                </GlassCard>

                {/* YoY Comparison Panel */}
                {prevData && (
                    <GlassCard delay={0.55} className="border-t-4 border-t-blue-500/50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Activity className="text-blue-400" size={20} />
                                </div>
                                Year-Over-Year Comparison
                            </h3>
                            <span className="text-xs text-slate-400">
                                Comparing to same period last year
                            </span>
                        </div>
                        <ComparisonPanel currentData={data} previousData={prevData} />
                    </GlassCard>
                )}

                {/* Main Charts Grid */}
                <div className="space-y-6">
                    {/* 1. Visual Chart */}
                    <GlassCard delay={0.6} className="w-full border-t-4 border-t-purple-500/50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <BarChart2 className="text-purple-400" size={20} />
                                </div>
                                Category Visualization
                            </h3>
                        </div>
                        <div className="h-[450px]">
                            <CategoryDrilldown data={distribution} />
                        </div>
                    </GlassCard>

                    {/* 2. Detailed Table (New!) */}
                    <GlassCard delay={0.65} className="w-full border-t-4 border-t-cyan-500/50">
                        <CategoryTable data={distribution} />
                    </GlassCard>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <GlassCard delay={0.7}>
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Activity className="text-blue-400" size={20} />
                                Weekly Activity
                            </h3>
                            <WeeklyBar data={weeklyTrend} />
                        </GlassCard>

                        <GlassCard delay={0.8}>
                            <h3 className="text-lg font-bold text-white mb-6">Weekday vs Weekend</h3>
                            <div className="flex flex-col justify-center h-[300px] gap-8 px-8">
                                {/* Weekday Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-300">Weekday Total</span>
                                        <span className="text-blue-400 font-bold">{weekdayVsWeekend.weekday} hrs</span>
                                    </div>
                                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                            style={{ width: `${(weekdayVsWeekend.weekday / maxDayHours) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Weekend Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-300">Weekend Total</span>
                                        <span className="text-purple-400 font-bold">{weekdayVsWeekend.weekend} hrs</span>
                                    </div>
                                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-600 to-pink-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                                            style={{ width: `${(weekdayVsWeekend.weekend / maxDayHours) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Ratio Insight */}
                                <div className="mt-4 p-4 bg-gradient-to-br from-white/5 to-white/0 rounded-xl border border-white/10 text-center backdrop-blur-sm">
                                    <p className="text-slate-400 text-sm">
                                        You are <span className="text-white font-bold text-lg mx-1 drop-shadow-glow">
                                            {(weekdayVsWeekend.weekday / (weekdayVsWeekend.weekend || 1)).toFixed(1)}x
                                        </span> more active on weekdays.
                                    </p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                <CategoryTuner
                    isOpen={isTunerOpen}
                    onClose={() => setIsTunerOpen(false)}
                    onUpdate={fetchData}
                />
            </div>
        </div>
    );
}
