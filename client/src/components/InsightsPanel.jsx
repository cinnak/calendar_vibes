import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Clock, Target, Zap } from "lucide-react";

const iconMap = {
    dominant: Target,
    diversity: Sparkles,
    timing: Clock,
    balance: TrendingUp,
    pattern: Zap
};

export default function InsightsPanel({ insights }) {
    if (!insights || insights.length === 0) return null;

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="text-yellow-400" size={24} />
                AI Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, i) => {
                    const Icon = iconMap[insight.type] || Sparkles;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="p-5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 shadow-xl hover:shadow-2xl transition-all"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                                    <Icon className="text-blue-300" size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-blue-200 mb-1">
                                        {insight.title}
                                    </h3>
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        {insight.message}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
