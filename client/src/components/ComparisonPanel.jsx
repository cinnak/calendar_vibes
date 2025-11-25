import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

export default function ComparisonPanel({ currentData, previousData }) {
    if (!currentData || !previousData) return null;

    // Calculate differences
    const currentHours = currentData.summary.totalHours;
    const previousHours = previousData.summary.totalHours;
    const diffHours = (currentHours - previousHours).toFixed(1);
    const percentChange = previousHours > 0 ? ((diffHours / previousHours) * 100).toFixed(1) : 0;

    // Prepare chart data: Top 5 categories comparison
    const topCategories = currentData.distribution.slice(0, 5).map(c => c.name);
    const chartData = topCategories.map(catName => {
        const currentVal = currentData.distribution.find(c => c.name === catName)?.value || 0;
        const prevVal = previousData.distribution.find(c => c.name === catName)?.value || 0;
        return {
            name: catName,
            Current: currentVal,
            Previous: prevVal
        };
    });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Hours Comparison */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-slate-400 text-sm mb-1">Total Hours (YoY)</p>
                    <div className="flex items-end gap-3">
                        <h3 className="text-3xl font-bold text-white">{currentHours}h</h3>
                        <div className={`flex items-center text-sm font-medium mb-1 ${parseFloat(diffHours) > 0 ? 'text-emerald-400' : parseFloat(diffHours) < 0 ? 'text-rose-400' : 'text-slate-400'
                            }`}>
                            {parseFloat(diffHours) > 0 ? <ArrowUp size={16} /> : parseFloat(diffHours) < 0 ? <ArrowDown size={16} /> : <Minus size={16} />}
                            {Math.abs(diffHours)}h ({Math.abs(percentChange)}%)
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">vs {previousHours}h last year</p>
                </div>

                {/* Focus Score Comparison */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-slate-400 text-sm mb-1">Avg Session Length</p>
                    <div className="flex items-end gap-3">
                        <h3 className="text-3xl font-bold text-white">{currentData.summary.avgSessionLength}h</h3>
                        <span className="text-slate-500 text-sm mb-1">vs {previousData.summary.avgSessionLength}h</span>
                    </div>
                </div>

                {/* Activity Count Comparison */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-slate-400 text-sm mb-1">Active Categories</p>
                    <div className="flex items-end gap-3">
                        <h3 className="text-3xl font-bold text-white">{currentData.summary.activeCategories}</h3>
                        <span className="text-slate-500 text-sm mb-1">vs {previousData.summary.activeCategories}</span>
                    </div>
                </div>
            </div>

            {/* Comparison Chart */}
            <div className="h-[300px] w-full mt-4">
                <h4 className="text-slate-300 text-sm mb-4">Top 5 Categories: This Year vs Last Year</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Bar dataKey="Current" fill="#818CF8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Previous" fill="#475569" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
