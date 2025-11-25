import { useState } from "react";
import { Filter, ArrowDown, ArrowUp, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoryTable({ data }) {
    const [excludedCategories, setExcludedCategories] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'value', direction: 'desc' });

    if (!data) return null;

    // Toggle exclusion
    const toggleExclusion = (categoryName) => {
        if (excludedCategories.includes(categoryName)) {
            setExcludedCategories(excludedCategories.filter(c => c !== categoryName));
        } else {
            setExcludedCategories([...excludedCategories, categoryName]);
        }
    };

    // Filter and Sort
    const filteredData = data.filter(d => !excludedCategories.includes(d.name));

    const sortedData = [...filteredData].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const totalHours = filteredData.reduce((sum, item) => sum + item.value, 0);

    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="relative w-full">
            {/* Header & Filter */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Detailed Breakdown
                    </span>
                </h3>

                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-2 ${isFilterOpen || excludedCategories.length > 0
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                    >
                        <Filter size={14} />
                        <span>Filter</span>
                        {excludedCategories.length > 0 && (
                            <span className="bg-blue-500 text-white text-[10px] px-1.5 rounded-full">
                                {excludedCategories.length}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto ring-1 ring-white/10"
                            >
                                <div className="p-3 space-y-1">
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Select to Hide</div>
                                    {data.map(cat => (
                                        <label key={cat.name} className="flex items-center gap-3 px-2 py-2 hover:bg-white/5 rounded-lg cursor-pointer group transition-colors">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${excludedCategories.includes(cat.name)
                                                    ? 'bg-blue-500 border-blue-500'
                                                    : 'border-slate-600 group-hover:border-slate-500'
                                                }`}>
                                                {excludedCategories.includes(cat.name) && <Clock size={10} className="text-white" />}
                                            </div>
                                            <span className={`text-sm truncate transition-colors ${excludedCategories.includes(cat.name) ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-white'
                                                }`}>
                                                {cat.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/20 backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-700/50 bg-slate-800/40 text-xs uppercase tracking-wider text-slate-400">
                            <th className="p-4 font-medium w-16 text-center">#</th>
                            <th className="p-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                                Category
                            </th>
                            <th className="p-4 font-medium text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('value')}>
                                Hours {sortConfig.key === 'value' && (sortConfig.direction === 'desc' ? <ArrowDown className="inline w-3 h-3" /> : <ArrowUp className="inline w-3 h-3" />)}
                            </th>
                            <th className="p-4 font-medium w-1/3">Distribution</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30 text-sm">
                        {sortedData.map((item, index) => (
                            <tr key={item.name} className="group hover:bg-white/5 transition-colors">
                                <td className="p-4 text-center text-slate-500 font-mono text-xs">
                                    {index + 1}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                            style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}40` }}
                                        ></div>
                                        <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                                            {item.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-right font-mono text-slate-300 group-hover:text-cyan-300 transition-colors">
                                    {item.value.toFixed(1)} <span className="text-slate-600 text-xs">h</span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.value / totalHours) * 100}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-500 w-10 text-right">
                                            {Math.round((item.value / totalHours) * 100)}%
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {sortedData.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No categories found. Try adjusting your filters.
                    </div>
                )}
            </div>
        </div>
    );
}
