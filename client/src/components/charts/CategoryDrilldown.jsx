import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState } from 'react';
import EventListModal from '../EventListModal';

export function CategoryDrilldown({ data }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [excludedCategories, setExcludedCategories] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleBarClick = (data) => {
        setSelectedCategory(data);
    };

    const toggleExclusion = (categoryName) => {
        if (excludedCategories.includes(categoryName)) {
            setExcludedCategories(excludedCategories.filter(c => c !== categoryName));
        } else {
            setExcludedCategories([...excludedCategories, categoryName]);
        }
    };

    // Filter data based on excluded categories
    const chartData = data.filter(d => !excludedCategories.includes(d.name));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
                    <p className="text-white font-bold mb-1">{label}</p>
                    <p className="text-blue-400 text-sm">
                        {payload[0].value} hours
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                        Click to view details
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <div className="absolute top-6 right-6 z-20">
                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="text-xs px-3 py-1.5 rounded-lg border bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-2"
                    >
                        <span>Filter Categories</span>
                        {excludedCategories.length > 0 && (
                            <span className="bg-blue-500 text-white text-[10px] px-1.5 rounded-full">
                                {excludedCategories.length}
                            </span>
                        )}
                    </button>

                    {isFilterOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-30 max-h-60 overflow-y-auto">
                            <div className="p-2 space-y-1">
                                {data.map(cat => (
                                    <label key={cat.name} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-700/50 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!excludedCategories.includes(cat.name)}
                                            onChange={() => toggleExclusion(cat.name)}
                                            className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-offset-slate-800"
                                        />
                                        <span className={`text-xs truncate ${excludedCategories.includes(cat.name) ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                                            {cat.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-[450px] w-full" onClick={() => setIsFilterOpen(false)}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                        <XAxis type="number" stroke="#94a3b8" fontSize={12} unit="h" />
                        <YAxis
                            dataKey="name"
                            type="category"
                            stroke="#94a3b8"
                            fontSize={12}
                            width={100}
                            tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                        <Bar
                            dataKey="value"
                            radius={[0, 4, 4, 0]}
                            barSize={20}
                            onClick={handleBarClick}
                            cursor="pointer"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || '#818CF8'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-xs text-slate-500 mt-2">
                    👆 Click on a bar to see specific events
                </p>
            </div>

            <EventListModal
                isOpen={!!selectedCategory}
                onClose={() => setSelectedCategory(null)}
                category={selectedCategory}
                events={selectedCategory?.events}
            />
        </>
    );
}
