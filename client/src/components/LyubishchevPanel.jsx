import { GlassCard } from "@/components/ui/GlassCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Battery, TrendingUp, Anchor, Coffee, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LyubishchevPanel({ data }) {
    if (!data) return null;

    const { metaDistribution, metrics } = data;

    // Helper for gauge color
    const getScoreColor = (score) => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 60) return "text-yellow-400";
        return "text-rose-400";
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Meta Distribution Chart */}
                <div className="lg:col-span-1 bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center relative">
                    <h4 className="absolute top-4 left-4 text-slate-400 text-sm font-medium">Time Composition</h4>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metaDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {metaDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs w-full mt-2">
                        {metaDistribution.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-slate-300">{item.name}</span>
                                </div>
                                <span className="text-slate-500 font-mono">{item.value}h</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Objective Metrics Grid */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    {/* Recovery Score */}
                    <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Recovery Rate</p>
                                <h3 className={`text-3xl font-bold ${getScoreColor(metrics.recoveryRate)}`}>
                                    {metrics.recoveryRate}%
                                </h3>
                            </div>
                            <Battery className={getScoreColor(metrics.recoveryRate)} size={24} />
                        </div>
                        <div className="w-full bg-slate-700/50 h-2 rounded-full mt-4 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${metrics.recoveryRate >= 80 ? 'bg-emerald-500' : metrics.recoveryRate >= 60 ? 'bg-yellow-500' : 'bg-rose-500'}`}
                                style={{ width: `${metrics.recoveryRate}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Benchmark: 8h Sleep + Rest / Day</p>
                    </div>

                    {/* Investment Ratio */}
                    <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Invest / Passive Ratio</p>
                                <h3 className="text-3xl font-bold text-blue-400">
                                    {metrics.investmentRatio}x
                                </h3>
                            </div>
                            <TrendingUp className="text-blue-400" size={24} />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            {metrics.investmentRatio > 2
                                ? "Excellent! High growth focus."
                                : metrics.investmentRatio < 1
                                    ? "Warning: Passive consumption high."
                                    : "Balanced."}
                        </p>
                    </div>

                    {/* Maintenance Cost */}
                    <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Life Overhead</p>
                                <h3 className="text-3xl font-bold text-slate-300">
                                    {metrics.maintenanceRatio}%
                                </h3>
                            </div>
                            <Anchor className="text-slate-400" size={24} />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Time spent on chores & commute</p>
                    </div>

                    {/* Deep Work Blocks */}
                    <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Deep Work Blocks</p>
                                <h3 className="text-3xl font-bold text-purple-400">
                                    {metrics.deepWorkBlocks}
                                </h3>
                            </div>
                            <Coffee className="text-purple-400" size={24} />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Sessions &gt; 90 mins</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
