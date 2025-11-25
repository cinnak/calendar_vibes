import { useState, useEffect } from "react";
import { X, Search, Save, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const META_OPTIONS = [
    { value: "INVESTMENT", label: "Investment", color: "text-blue-400", bg: "bg-blue-500/20" },
    { value: "RECOVERY", label: "Recovery", color: "text-emerald-400", bg: "bg-emerald-500/20" },
    { value: "MAINTENANCE", label: "Maintenance", color: "text-slate-400", bg: "bg-slate-500/20" },
    { value: "PASSIVE", label: "Passive", color: "text-pink-400", bg: "bg-pink-500/20" },
];

export default function CategoryTuner({ isOpen, onClose, onUpdate }) {
    const [categories, setCategories] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // Key of item being saved

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:3000/api/categories");
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to load categories", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (title, newMeta) => {
        setSaving(title);
        try {
            await axios.post("http://localhost:3000/api/categories", {
                title,
                meta: newMeta
            });
            setCategories(prev => ({ ...prev, [title]: newMeta }));
            if (onUpdate) onUpdate(); // Trigger dashboard refresh
        } catch (err) {
            console.error("Failed to update category", err);
        } finally {
            setTimeout(() => setSaving(null), 500);
        }
    };

    const filteredKeys = Object.keys(categories).filter(key =>
        key.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto w-full max-w-2xl h-[80vh] bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                        Category Tuner
                                    </span>
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    Fine-tune how AI classifies your activities.
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search activities..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {loading ? (
                                <div className="text-center py-10 text-slate-500">Loading rules...</div>
                            ) : filteredKeys.length === 0 ? (
                                <div className="text-center py-10 text-slate-500">
                                    {searchTerm ? "No matching activities found." : "No rules cached yet."}
                                </div>
                            ) : (
                                filteredKeys.map(title => (
                                    <div key={title} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-slate-600 transition-colors group">
                                        <span className="font-medium text-slate-200 truncate mr-4 flex-1">
                                            {title}
                                        </span>

                                        <div className="flex items-center gap-3">
                                            {saving === title && (
                                                <span className="text-xs text-emerald-400 flex items-center gap-1 animate-pulse">
                                                    <Check size={12} /> Saved
                                                </span>
                                            )}

                                            <div className="relative group/select">
                                                <select
                                                    value={categories[title]}
                                                    onChange={(e) => handleUpdate(title, e.target.value)}
                                                    className={`appearance-none bg-slate-900 border border-slate-700 rounded-lg py-1.5 pl-3 pr-8 text-xs font-medium cursor-pointer focus:ring-1 focus:ring-cyan-500 outline-none transition-all
                                                        ${META_OPTIONS.find(o => o.value === categories[title])?.color}
                                                    `}
                                                >
                                                    {META_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-700 bg-slate-900/50 text-xs text-slate-500 flex justify-between items-center">
                            <span className="flex items-center gap-1">
                                <AlertCircle size={12} />
                                Changes apply immediately to all past & future events.
                            </span>
                            <span>{filteredKeys.length} rules</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
