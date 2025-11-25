import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function GlassCard({ children, className, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                "rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl p-6",
                className
            )}
        >
            {children}
        </motion.div>
    );
}
