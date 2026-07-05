import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Swords, Trophy, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface HistoryEntry {
    match_id: string;
    result: "win" | "loss" | "draw";
    skill_id: string;
    battle_type: string;
    opponent?: {
        id: number;
        username: string;
        avatar_url?: string | null;
    };
    your_score: number;
    opponent_score: number;
    played_at: string;
}

const BATTLE_TYPE_LABELS: Record<string, string> = {
    code_challenge: "Code",
    knowledge_quiz: "Quiz",
    problem_solving: "Problem",
    timed_challenge: "Timed",
};

interface PvPMatchHistoryProps {
    userId: number;
    token: string;
}

export const PvPMatchHistory = ({ userId, token }: PvPMatchHistoryProps) => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId || !token) return;
        fetch(`${API_URL}/pvp/history/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : [])
            .then(data => setHistory(data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [userId, token]);

    if (loading) {
        return (
            <div className="glass-card p-8 flex items-center justify-center text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading battle history...
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="glass-card p-8 border-white/5 text-center text-gray-500">
                <Swords className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No battles yet. Hit the arena!</p>
            </div>
        );
    }

    const wins = history.filter(h => h.result === "win").length;
    const losses = history.filter(h => h.result === "loss").length;
    const draws = history.filter(h => h.result === "draw").length;

    return (
        <div className="glass-card p-0 border-white/5 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Swords className="w-5 h-5 text-neon-blue" /> Battle History
                </h2>
                <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-neon-green">{wins}W</span>
                    <span className="text-red-400">{losses}L</span>
                    {draws > 0 && <span className="text-yellow-400">{draws}D</span>}
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-white/5">
                {history.map((entry, i) => {
                    const isWin = entry.result === "win";
                    const isDraw = entry.result === "draw";
                    const date = new Date(entry.played_at);
                    const timeAgo = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
                    const timeLabel = timeAgo < 60
                        ? `${timeAgo}m ago`
                        : timeAgo < 1440
                            ? `${Math.floor(timeAgo / 60)}h ago`
                            : `${Math.floor(timeAgo / 1440)}d ago`;

                    return (
                        <motion.div
                            key={entry.match_id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`p-4 flex items-center gap-4 hover:bg-white/5 transition-colors ${isWin ? "border-l-2 border-neon-green" :
                                    isDraw ? "border-l-2 border-yellow-400" :
                                        "border-l-2 border-red-500"
                                }`}
                        >
                            {/* Result icon */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isWin ? "bg-neon-green/10" :
                                    isDraw ? "bg-yellow-400/10" :
                                        "bg-red-500/10"
                                }`}>
                                {isWin ? <Trophy className="w-5 h-5 text-neon-green" /> :
                                    isDraw ? <Minus className="w-5 h-5 text-yellow-400" /> :
                                        <Swords className="w-5 h-5 text-red-400" />}
                            </div>

                            {/* Opponent */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Avatar className="w-9 h-9 shrink-0">
                                    <AvatarImage src={entry.opponent?.avatar_url || undefined} />
                                    <AvatarFallback className="bg-zinc-800 text-xs">
                                        {(entry.opponent?.username || "?")[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">
                                        vs {entry.opponent?.username || "Unknown"}
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                        {BATTLE_TYPE_LABELS[entry.battle_type] || entry.battle_type}
                                        {entry.skill_id ? ` · ${entry.skill_id}` : ""}
                                    </p>
                                </div>
                            </div>

                            {/* Scores */}
                            <div className="text-right shrink-0">
                                <div className="text-sm font-mono font-bold">
                                    <span className="text-white">{entry.your_score}</span>
                                    <span className="text-gray-600 mx-1">-</span>
                                    <span className="text-gray-400">{entry.opponent_score}</span>
                                </div>
                                <p className="text-[10px] text-gray-600">{timeLabel}</p>
                            </div>

                            {/* MMR indicator */}
                            <div className="shrink-0">
                                {isWin ? <TrendingUp className="w-4 h-4 text-neon-green" /> :
                                    isDraw ? <Minus className="w-4 h-4 text-yellow-400" /> :
                                        <TrendingDown className="w-4 h-4 text-red-400" />}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
