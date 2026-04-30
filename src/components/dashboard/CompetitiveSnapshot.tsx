import { motion } from "framer-motion";
import { Trophy, Swords, Target, Crown } from "lucide-react";

export const CompetitiveSnapshot = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 h-full relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <Trophy className="w-32 h-32" />
            </div>

            <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-6">
                <Swords className="w-5 h-5 text-secondary" />
                Competitive
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary/10 p-4 rounded-xl border border-secondary/20 flex flex-col items-center justify-center text-center">
                    <Crown className="w-6 h-6 text-yellow-400 mb-2" />
                    <div className="font-bold text-lg">Silver II</div>
                    <div className="text-xs text-muted-foreground">Current Rank</div>
                </div>
                <div className="bg-neon-green/10 p-4 rounded-xl border border-neon-green/20 flex flex-col items-center justify-center text-center">
                    <Target className="w-6 h-6 text-neon-green mb-2" />
                    <div className="font-bold text-lg">64%</div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">Active Tournament</div>
                <div className="p-3 bg-muted/40 rounded-lg border border-border/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-destructive to-orange-500 flex items-center justify-center font-bold text-white text-xs text-center leading-none">
                        CODE<br />BRAWL
                    </div>
                    <div>
                        <div className="font-bold text-sm">Summer Code Brawl</div>
                        <div className="text-xs text-neon-blue">Qualifiers: 2d left</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
