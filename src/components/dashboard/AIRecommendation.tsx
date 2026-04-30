import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AIRecommendation = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 border-primary/20 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Brain className="w-24 h-24 rotate-12" />
            </div>

            <div className="flex items-start gap-4 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-display text-lg font-semibold text-primary mb-1">
                        AI Growth Insight
                    </h3>
                    <p className="text-sm text-foreground mb-4">
                        Based on your recent React battles, you should focus on **Performance Optimization**.
                        We've curated a challenge for you.
                    </p>
                    <Button size="sm" variant="outline" className="group">
                        Start Challenge
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};
