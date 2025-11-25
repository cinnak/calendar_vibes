import { GlassCard } from "@/components/ui/GlassCard";
import { Zap, Brain, BatteryWarning, AlertTriangle, Layers, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function DeepInsightsPanel({ data }) {
    if (!data) return null;

    const { fragmentation, chronotype, burnout } = data;

    // Prepare data for Chronotype Chart
    const chartData = chronotype.hourlyInvestment.map((val, i) => ({
        hour: i,
        investment: val,
        lowValue: chronotype.hourlyLowValue[i]
    }));

    const getFragmentationColor = (level) => {
        if (level === "Low") return "text-emerald-400";
        if (level === "Moderate") return "text-yellow-400";
        return "text-rose-400";
    };

    const getBurnoutColor = (risk) => {
        if (risk === "Low") return "text-emerald-400";
        if (risk === "Moderate") return "text-orange-400";
        return "text-rose-500";
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Fragmentation Index */}
            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/30 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Layers size={80} className="text-purple-500" />
                </div>

                <h4 className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-4 flex items-center gap-2">
                    <Layers size={14} className="text-purple-400" />
                    Fragmentation Index
                </h4>

                <div className="flex items-end gap-2 mb-2">
                    <span className={`text-4xl font-black ${getFragmentationColor(fragmentation.level)}`}>
                        {fragmentation.score}%
                    </span>
                    <span className="text-sm text-slate-500 mb-1">fragmented</span>
                </div>

                <div className="w-full bg-slate-700/50 h-2 rounded-full mb-4 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${fragmentation.level === "Low" ? "bg-emerald-500" :
                                fragmentation.level === "Moderate" ? "bg-yellow-500" : "bg-rose-500"
                            }`}
                        style={{ width: `${fragmentation.score}%` }}
                    ></div>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed">
                    {fragmentation.description}
                    <br />
                    <span className="text-xs text-slate-500 mt-1 block">
                        {fragmentation.level === "High"
                            ? "⚠️ Try batching tasks to reduce switching cost."
                            : "✅ Good job maintaining focus blocks."}
                    </span>
                </p>
            </div>

            {/* 2. Chronotype Alignment (Wide) */}
            <div className="lg:col-span-2 bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm relative group hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h4 className="text-slate-400 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
                            <Brain size={14} className="text-blue-400" />
                            Chronotype Alignment
                        </h4>
                        <h3 className="text-xl font-bold text-white mt-1">
                            Peak Focus: <span className="text-blue-400">{chronotype.peakWindow}</span>
                        </h3>
                    </div>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-slate-400">Deep Work</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                            <span className="text-slate-400">Shallow/Rest</span>
                        </div>
                    </div>
                </div>

                <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="investment"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorInvest)"
                            />
                            <Area
                                type="monotone"
                                dataKey="lowValue"
                                stroke="#64748b"
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                fillOpacity={1}
                                fill="url(#colorLow)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. Burnout Radar */}
            <div className="lg:col-span-3 bg-gradient-to-r from-slate-800/40 to-slate-900/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm flex items-center justify-between group hover:border-rose-500/30 transition-all">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full bg-opacity-10 ${burnout.risk === "High" ? "bg-rose-500 text-rose-500" :
                            burnout.risk === "Moderate" ? "bg-orange-500 text-orange-500" : "bg-emerald-500 text-emerald-500"
                        }`}>
                        <BatteryWarning size={24} />
                    </div>
                    <div>
                        <h4 className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Burnout Risk Radar</h4>
                        <div className="flex items-center gap-2">
                            <span className={`text-xl font-bold ${getBurnoutColor(burnout.risk)}`}>
                                {burnout.risk} Risk
                            </span>
                            {burnout.risk !== "Low" && (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    {burnout.highStressDays} High Stress Days
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-right max-w-md">
                    <p className="text-sm text-slate-300 italic">
                        "{burnout.description}"
                    </p>
                </div>
            </div>
        </div>
    );
}
