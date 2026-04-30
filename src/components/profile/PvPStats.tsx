import { Swords, Trophy, Target } from "lucide-react";

export const PvPStats = ({ stats }: { stats?: any }) => {
    if (!stats || !stats.matches_played) {
        return (
            <div className="glass-card p-6 space-y-4 bg-gradient-to-br from-card/30 to-red-900/5 border-red-500/10 opacity-70">
                <div className="flex justify-between items-center">
                    <h3 className="font-display font-bold text-xl flex items-center gap-2 text-red-500/50">
                        <Swords className="w-5 h-5" />
                        Competitive Stats
                    </h3>
                </div>
                <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-red-500/20 rounded-xl">
                    No competitive history available
                </div>
            </div>
        );
    }
    
    const winRate = stats.matches_played > 0 
        ? Math.round((stats.battle_wins / stats.matches_played) * 100) 
        : 0;
        
    return (
        <div className="glass-card p-6 space-y-6 bg-gradient-to-br from-card/30 to-red-900/10 border-red-500/20">
            <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-xl flex items-center gap-2 text-red-500">
                    <Swords className="w-5 h-5" />
                    Competitive Stats
                </h3>
                <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold border border-red-500/20">
                    Diamond II
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-black/20 text-center">
                    <div className="text-2xl font-bold text-white">{winRate}%</div>
                    <div className="text-xs text-muted-foreground">Win Rate ({stats.battle_wins} wins)</div>
                </div>
                <div className="p-3 rounded-lg bg-black/20 text-center">
                    <div className="text-2xl font-bold text-white">{stats.total_score || 0}</div>
                    <div className="text-xs text-muted-foreground">Total Score</div>
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="text-sm font-medium text-white/80">Match History</h4>
                <div className="text-xs text-muted-foreground italic">
                    Recent matches will appear here based on your battle logs
                </div>
            </div>
        </div>
    );
};
