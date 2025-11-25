import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar } from "lucide-react";

export default function EventListModal({ isOpen, onClose, category, events }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: category?.color }}></span>
                                {category?.name}
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">
                                {events?.length} events • {category?.value} hours total
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                        {events?.map((event, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors flex justify-between items-center group"
                            >
                                <div>
                                    <h3 className="text-white font-medium mb-1 group-hover:text-blue-400 transition-colors">
                                        {event.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(event.date).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-bold text-slate-200">
                                        {event.duration < 60
                                            ? `${Math.round(event.duration)}m`
                                            : `${(event.duration / 60).toFixed(1)}h`}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {events?.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                No events found in this category.
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
