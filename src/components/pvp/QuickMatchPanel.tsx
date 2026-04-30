import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Swords, Code2, PenTool, Brain, BookOpen, Clock, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface QuickMatchPanelProps {
    onMatchFound?: (matchId: string) => void;
}

const SKILLS = [
    { id: "react", label: "React", icon: Code2, color: "text-neon-blue" },
    { id: "python", label: "Python", icon: Brain, color: "text-neon-green" },
    { id: "design", label: "Design", icon: PenTool, color: "text-neon-pink" },
    { id: "algorithms", label: "Algorithms", icon: Brain, color: "text-neon-purple" },
    { id: "system_design", label: "Systems", icon: Code2, color: "text-orange-400" },
    { id: "general", label: "General", icon: BookOpen, color: "text-gray-300" },
];

const BATTLE_TYPES = [
    { id: "code_challenge", label: "Code Challenge", icon: Code2, desc: "Write code solutions" },
    { id: "knowledge_quiz", label: "Knowledge Quiz", icon: BookOpen, desc: "Answer skill questions" },
    { id: "problem_solving", label: "Problem Solving", icon: Brain, desc: "System design & reasoning" },
    { id: "timed_challenge", label: "Timed Challenge", icon: Clock, desc: "Speed-focused coding" },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

export const QuickMatchPanel = ({ onMatchFound }: QuickMatchPanelProps) => {
    const { token, user } = useAuth();
    const [isSearching, setIsSearching] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState("algorithms");
    const [selectedBattleType, setSelectedBattleType] = useState("code_challenge");
    const [queueStatus, setQueueStatus] = useState<"idle" | "waiting" | "matched">("idle");
    const [queueTime, setQueueTime] = useState(0);

    // Poll for match status every 3 seconds while in queue
    useEffect(() => {
        if (queueStatus !== "waiting" || !user) return;

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}/pvp/match/status/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) return;
                const data = await res.json();

                if (data.status === "in_progress" || data.status === "matched") {
                    clearInterval(pollInterval);
                    setQueueStatus("matched");
                    setIsSearching(false);
                    toast.success("🎯 Opponent found! Battle starting...");
                    onMatchFound?.(data.match_id);
                }
            } catch (_) {
                // ignore polling errors
            }
        }, 3000);

        // Queue timer counter
        const timerInterval = setInterval(() => {
            setQueueTime(t => t + 1);
        }, 1000);

        return () => {
            clearInterval(pollInterval);
            clearInterval(timerInterval);
        };
    }, [queueStatus, user, token, onMatchFound]);

    const handleMatch = async () => {
        if (!user || !token) {
            toast.error("Please log in to battle");
            return;
        }

        setIsSearching(true);
        setQueueTime(0);

        try {
            const res = await fetch(`${API_URL}/pvp/queue/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    skill_id: selectedSkill,
                    battle_type: selectedBattleType
                })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: "Matchmaking failed" }));
                if (res.status === 429) {
                    toast.error("Rate limited: max 10 battles per hour.");
                } else {
                    toast.error(err.detail || "Matchmaking failed");
                }
                setIsSearching(false);
                return;
            }

            const data = await res.json();

            if (data.status === "matched") {
                setQueueStatus("matched");
                setIsSearching(false);
                toast.success("⚔️ Opponent found! Battle begins!");
                onMatchFound?.(data.match_id);
            } else if (data.status === "waiting") {
                setQueueStatus("waiting");
                toast.info("🔍 In queue... searching for an opponent");
                // Keep isSearching=true while in queue
            } else if (data.status === "in_progress") {
                setQueueStatus("matched");
                setIsSearching(false);
                onMatchFound?.(data.match_id);
            }
        } catch {
            toast.error("Connection error. Please try again.");
            setIsSearching(false);
        }
    };

    const handleLeaveQueue = async () => {
        try {
            await fetch(`${API_URL}/pvp/queue/leave`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (_) { }
        setIsSearching(false);
        setQueueStatus("idle");
        setQueueTime(0);
        toast.info("Left matchmaking queue.");
    };

    const formatQueueTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Main Match Config */}
            <div className="md:col-span-2 glass-card p-0 border-neon-blue/30 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Swords className="w-48 h-48 text-neon-blue" />
                </div>

                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Swords className="w-5 h-5 text-neon-blue" /> Quick Match Lobby
                    </h2>
                    {user && (
                        <p className="text-xs text-gray-400 mt-1">
                            Playing as <span className="text-neon-blue font-bold">{user.display_name || user.username}</span>
                            {" · "}<span className="text-neon-purple">MMR Loading...</span>
                        </p>
                    )}
                </div>

                <div className="p-6 flex-1 flex flex-col gap-6">
                    {/* Skill Selection */}
                    <div className="space-y-3">
                        <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Select Arena</label>
                        <div className="grid grid-cols-3 gap-2">
                            {SKILLS.map((skill) => (
                                <button
                                    key={skill.id}
                                    onClick={() => setSelectedSkill(skill.id)}
                                    disabled={isSearching}
                                    className={`relative p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-300 ${selectedSkill === skill.id
                                        ? "bg-white/10 border-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                                        : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5"
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <skill.icon className={`w-5 h-5 ${skill.color}`} />
                                    <span className="text-[10px] font-bold text-white">{skill.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Battle Type */}
                    <div className="space-y-3">
                        <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Battle Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {BATTLE_TYPES.map((bt) => (
                                <button
                                    key={bt.id}
                                    onClick={() => setSelectedBattleType(bt.id)}
                                    disabled={isSearching}
                                    className={`p-3 rounded-xl border text-left transition-all duration-300 ${selectedBattleType === bt.id
                                        ? "bg-neon-purple/10 border-neon-purple/50 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                                        : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5"
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <bt.icon className="w-3.5 h-3.5 text-neon-purple" />
                                        <span className="text-xs font-bold text-white">{bt.label}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500">{bt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="p-6 pt-0 mt-auto space-y-3">
                    {queueStatus === "waiting" && (
                        <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-xl px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                                <span className="text-sm text-neon-blue font-mono">Searching for opponent...</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400 font-mono">{formatQueueTime(queueTime)}</span>
                                <button onClick={handleLeaveQueue} className="text-gray-500 hover:text-red-400 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    <Button
                        size="lg"
                        className="w-full h-16 text-lg font-display font-bold bg-gradient-to-r from-neon-blue to-blue-600 hover:opacity-90 relative overflow-hidden group shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all"
                        onClick={handleMatch}
                        disabled={isSearching || queueStatus === "waiting"}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        {isSearching || queueStatus === "waiting" ? (
                            <span className="flex items-center gap-3 animate-pulse">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                {queueStatus === "waiting" ? "IN QUEUE..." : "CONNECTING..."}
                            </span>
                        ) : (
                            <span className="flex items-center gap-3">
                                FIND MATCH <Swords className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Daily Challenge Mini-Card */}
            <div className="glass-card p-6 border-neon-green/30 bg-gradient-to-b from-neon-green/10 to-transparent flex flex-col justify-center items-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-16 h-16 rounded-full bg-neon-green/10 flex items-center justify-center text-neon-green mb-6 border border-neon-green/30 shadow-[0_0_15px_rgba(0,255,157,0.2)] group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-white text-xl mb-1">Daily Challenge</h3>
                <p className="text-xs text-neon-green font-mono mb-4 uppercase tracking-wider">Time Limited</p>
                <p className="text-sm text-gray-300 mb-6 px-2">
                    Complete <span className="text-white font-bold">3 Ranked Matches</span> with over 80% accuracy today.
                </p>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden mb-1 border border-white/5">
                    <motion.div
                        className="bg-neon-green h-full shadow-[0_0_10px_rgba(0,255,157,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: "33%" }}
                        transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                    />
                </div>
                <div className="flex justify-between w-full text-[10px] font-mono text-muted-foreground">
                    <span>PROGRESS</span>
                    <span className="text-neon-green font-bold">1 / 3</span>
                </div>
            </div>
        </div>
    );
};
