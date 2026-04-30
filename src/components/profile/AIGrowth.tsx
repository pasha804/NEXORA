import { Bot, TrendingUp } from "lucide-react";

export const AIGrowth = ({ stats }: { stats?: any }) => {
    if (!stats || stats.streak_days === undefined) {
        return (
            <div className="glass-card p-6 space-y-4 bg-gradient-to-br from-card/30 to-emerald-900/5 border-emerald-500/10 opacity-70">
                <div className="flex justify-between items-center">
                    <h3 className="font-display font-bold text-xl flex items-center gap-2 text-emerald-500/50">
                        <Bot className="w-5 h-5" />
                        AI Insights
                    </h3>
                </div>
                <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-emerald-500/20 rounded-xl">
                    Not enough activity for AI insights
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 space-y-6 bg-gradient-to-br from-card/30 to-emerald-900/10 border-emerald-500/20">
            <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-xl flex items-center gap-2 text-emerald-400">
                    <Bot className="w-5 h-5" />
                    AI Insights
                </h3>
            </div>

            <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
                    <div className="flex gap-3">
                        <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                        <div>
                            <p className="text-sm font-medium text-emerald-100">Tracking Active</p>
                            <p className="text-xs text-emerald-400/70 mt-1">
                                {stats.streak_days > 0 
                                    ? `You've maintained activity for ${stats.streak_days} days. Keep it up!` 
                                    : "Start exploring and participating to gain insights."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Learning Streak</span>
                        <span className="text-white font-bold">{stats.streak_days || 0} Days {stats.streak_days > 0 && "🔥"}</span>
                    </div>
                    <div className="h-1.5 bg-muted/30 rounded-full w-full">
                        <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min((stats.streak_days || 0) * 10, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
