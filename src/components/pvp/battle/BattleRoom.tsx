import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TaskPanel } from "./TaskPanel";
import { CodeEditor } from "./CodeEditor";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    X, Trophy, Zap, Brain, CheckCircle2, Clock, Users, Wifi, WifiOff,
    ArrowLeft, Medal, TrendingUp, TrendingDown
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { io, Socket } from "socket.io-client";

interface BattleRoomProps {
    matchId: string;
    onClose: () => void;
}

interface Challenge {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    initial_code: string;
    time_limit_minutes: number;
    xp_reward: number;
    test_cases: { input: string; output: string }[];
}

interface Player {
    id: number;
    username: string;
    avatar_url?: string | null;
    mmr?: number;
    rank?: string;
}

interface MatchDetails {
    id: string;
    status: string;
    battle_type: string;
    skill_id: string;
    start_time?: string;
    player1?: Player;
    player2?: Player;
    challenge?: Challenge;
    spectator_count: number;
}

interface MatchEndResult {
    winner_id: number | null;
    winner_username: string | null;
    is_draw: boolean;
    final_scores: { player1: number; player2: number };
    xp_rewards: { winner: number; loser: number; draw: number };
    mmr_changes: { winner: number; loser: number; draw: number };
    new_mmr: { player1: number; player2: number };
    reason?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const BattleRoom = ({ matchId, onClose }: BattleRoomProps) => {
    const { token, user } = useAuth();
    const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<MatchEndResult | null>(null);
    const [opponentSubmitted, setOpponentSubmitted] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [spectatorCount, setSpectatorCount] = useState(0);

    // Timer state (server-controlled)
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [timerStarted, setTimerStarted] = useState(false);

    // Live scores
    const [scores, setScores] = useState<{ player1: number; player2: number }>({ player1: 0, player2: 0 });

    // Personal result after submit
    const [myScore, setMyScore] = useState<number | null>(null);
    const [myFeedback, setMyFeedback] = useState<any>(null);

    const socketRef = useRef<Socket | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const isPlayer1 = matchDetails ? matchDetails.player1?.id === user?.id : false;
    const opponent = matchDetails
        ? isPlayer1 ? matchDetails.player2 : matchDetails.player1
        : null;

    // ─── Fetch initial match details via REST ───────────────────────────────
    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const res = await fetch(`${API_URL}/pvp/match/${matchId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Failed to load match");
                const data = await res.json();
                setMatchDetails(data);
                setSpectatorCount(data.spectator_count || 0);
                if (data.challenge?.initial_code) {
                    setCode(data.challenge.initial_code);
                }
                if (data.challenge) {
                    setTimeRemaining(data.challenge.time_limit_minutes * 60);
                }
            } catch {
                toast.error("Error loading battle room");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMatch();
    }, [matchId, token]);

    // ─── Socket.IO real-time connection ────────────────────────────────────
    useEffect(() => {
        if (!token || !matchId || !user) return;

        const socket = io(API_URL, {
            path: "/battle/socket.io",
            transports: ["websocket", "polling"],
            auth: { token }
        });

        socket.on("connect", () => {
            setIsConnected(true);
            // Join the match room
            socket.emit("join_match", { match_id: matchId, user_id: user.id });
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
            toast.warning("Connection lost. Reconnecting...");
        });

        socket.on("MATCH_FOUND", (data: any) => {
            if (data.challenge) {
                setMatchDetails(prev => prev ? { ...prev, ...data } : data);
                if (data.challenge.initial_code) setCode(data.challenge.initial_code);
                if (data.challenge.time_limit_minutes) {
                    setTimeRemaining(data.challenge.time_limit_minutes * 60);
                }
            }
        });

        socket.on("MATCH_START", (data: any) => {
            toast.success("⚔️ Battle has begun!");
            if (data.time_limit_seconds) {
                setTimeRemaining(data.time_limit_seconds);
            }
        });

        socket.on("TIMER_START", (data: any) => {
            setTimeRemaining(data.duration);
            setTimerStarted(true);
        });

        socket.on("TIMER_TICK", (data: any) => {
            setTimeRemaining(data.remaining);
        });

        socket.on("TIMER_END", () => {
            setTimeRemaining(0);
            toast.warning("⏰ Time's up! Submitting...");
            if (!submitted) handleFinalizeTimeout();
        });

        socket.on("PLAYER_SUBMISSION", (data: any) => {
            if (data.user_id !== user.id) {
                setOpponentSubmitted(true);
                toast.info("🎯 Opponent submitted their solution!");
            }
        });

        socket.on("SCORE_UPDATE", (data: any) => {
            setScores({
                player1: data.player1_score || 0,
                player2: data.player2_score || 0,
            });
        });

        socket.on("MATCH_END", (data: MatchEndResult) => {
            setResult(data);
            // Cancel timer
            if (timerRef.current) clearInterval(timerRef.current);
        });

        socket.on("FORFEIT", (data: any) => {
            if (data.forfeited_by !== user.id) {
                toast.success("🏆 Opponent forfeited! You win!");
            }
        });

        socket.on("PLAYER_DISCONNECTED", (data: any) => {
            if (data.user_id !== user.id) {
                toast.warning("⚠️ Opponent disconnected. 30s grace period...");
            }
        });

        socket.on("PLAYER_RECONNECTED", (data: any) => {
            if (data.user_id !== user.id) {
                toast.info("✅ Opponent reconnected.");
            }
        });

        socket.on("SPECTATOR_JOINED", (data: any) => {
            setSpectatorCount(data.spectator_count || 0);
        });

        // Receive personal judge result
        socket.on("judge_result", (data: any) => {
            if (data.user_id === user.id) {
                setMyScore(data.score);
                setMyFeedback(data.feedback);
                setIsSubmitting(false);
            }
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [matchId, token, user]);

    // ─── Handle forfeit (timeout or user action) ───────────────────────────
    const handleFinalizeTimeout = useCallback(() => {
        if (socketRef.current && !submitted) {
            socketRef.current.emit("submit_solution", {
                match_id: matchId,
                user_id: user?.id,
                code: code || "# Time expired",
            });
        }
    }, [matchId, user, code, submitted]);

    // ─── Submit handler ─────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!code.trim()) {
            toast.error("Please enter your solution before submitting.");
            return;
        }
        setIsSubmitting(true);
        setSubmitted(true);

        if (socketRef.current) {
            socketRef.current.emit("submit_solution", {
                match_id: matchId,
                user_id: user?.id,
                code,
            });
        }
        toast.info("📤 Submitted! Waiting for evaluation...");
    };

    const handleForfeit = () => {
        if (socketRef.current) {
            socketRef.current.emit("forfeit_match", { match_id: matchId, user_id: user?.id });
        }
        onClose();
    };

    // ─── Timer display ──────────────────────────────────────────────────────
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const timerColor = timeRemaining <= 60
        ? "text-red-400 animate-pulse"
        : timeRemaining <= 180
            ? "text-yellow-400"
            : "text-neon-blue";

    const myCurrentScore = isPlayer1 ? scores.player1 : scores.player2;
    const opponentCurrentScore = isPlayer1 ? scores.player2 : scores.player1;

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/95 flex items-center justify-center text-neon-blue z-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-mono">Loading Battle Arena...</p>
                </div>
            </div>
        );
    }

    const challenge = matchDetails?.challenge;

    return (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
            {/* ── Header ── */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#111] shrink-0">
                {/* Left: players */}
                <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 border-2 border-neon-blue">
                        <AvatarImage src={user?.avatar_url || undefined} />
                        <AvatarFallback className="bg-neon-blue/20 text-neon-blue text-xs font-bold">
                            {(user?.display_name || user?.username || "Y")[0]}
                        </AvatarFallback>
                    </Avatar>

                    {/* Timer */}
                    <div className={`font-mono text-xl font-bold flex items-center gap-2 bg-black/50 px-4 py-1 rounded-full border border-white/10 ${timerColor}`}>
                        <Clock className="w-4 h-4" />
                        {formatTime(timeRemaining)}
                    </div>

                    <Avatar className="w-9 h-9 border-2 border-red-500">
                        <AvatarImage src={opponent?.avatar_url || undefined} />
                        <AvatarFallback className="bg-red-500/20 text-red-400 text-xs font-bold">
                            {(opponent?.username || "OP")[0]}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Center info */}
                <div className="hidden md:flex items-center gap-4 text-xs text-gray-400">
                    <span className="px-2 py-1 bg-white/5 rounded">Match: {matchId.slice(0, 8)}</span>
                    <span className="flex items-center gap-1">
                        {isConnected
                            ? <><Wifi className="w-3 h-3 text-neon-green" /> Live</>
                            : <><WifiOff className="w-3 h-3 text-red-400" /> Reconnecting</>
                        }
                    </span>
                    {spectatorCount > 0 && (
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-gray-400" /> {spectatorCount} watching
                        </span>
                    )}
                </div>

                {/* Right: forfeit */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-400 text-xs"
                        onClick={handleForfeit}
                    >
                        Forfeit
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-4 h-4 text-gray-400" />
                    </Button>
                </div>
            </div>

            {/* ── Scoreboard Bar ── */}
            <div className="h-10 bg-black/60 border-b border-white/5 flex items-center px-6 gap-4 shrink-0">
                <div className="flex-1 flex items-center gap-2 text-xs">
                    <span className="font-bold text-neon-blue">{user?.display_name || user?.username}</span>
                    <span className="text-gray-600">vs</span>
                    <span className="font-bold text-red-400">{opponent?.username || "Opponent"}</span>
                </div>
                <div className="flex items-center gap-4 font-mono text-sm">
                    <span className="text-neon-blue font-bold">{myCurrentScore}</span>
                    <span className="text-gray-500">—</span>
                    <span className="text-red-400 font-bold">{opponentCurrentScore}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    {submitted && <span className="text-neon-green flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Submitted</span>}
                    {opponentSubmitted && <span className="text-yellow-400">| Opponent submitted</span>}
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="flex-1 grid grid-cols-2 overflow-hidden min-h-0">
                <TaskPanel
                    challenge={{
                        title: challenge?.title || "Loading challenge...",
                        description: challenge?.description || "",
                        difficulty: challenge?.difficulty || "Medium",
                        time_limit: challenge?.time_limit_minutes || 15,
                        xp_reward: challenge?.xp_reward || 100,
                    }}
                />
                <CodeEditor
                    initialCode={code}
                    onChange={(newCode) => {
                        setCode(newCode);
                        // Broadcast code update for spectators
                        if (socketRef.current) {
                            socketRef.current.emit("code_update", {
                                match_id: matchId,
                                user_id: user?.id,
                                code: newCode,
                            });
                        }
                    }}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            </div>

            {/* ── Match Result Overlay ── */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#111] border border-neon-blue/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.15)]"
                        >
                            {/* Result header */}
                            <div className={`p-8 border-b border-white/10 text-center ${result.is_draw ? "bg-gradient-to-r from-yellow-500/10 to-transparent" :
                                    result.winner_id === user?.id ? "bg-gradient-to-r from-neon-green/10 to-transparent" :
                                        "bg-gradient-to-r from-red-500/10 to-transparent"
                                }`}>
                                <div className="text-5xl mb-3">
                                    {result.is_draw ? "🤝" : result.winner_id === user?.id ? "🏆" : "💀"}
                                </div>
                                <h2 className={`text-4xl font-display font-black ${result.is_draw ? "text-yellow-400" :
                                        result.winner_id === user?.id ? "text-neon-green" : "text-red-400"
                                    }`}>
                                    {result.is_draw ? "DRAW" : result.winner_id === user?.id ? "VICTORY" : "DEFEAT"}
                                </h2>
                                {result.winner_username && !result.is_draw && (
                                    <p className="text-gray-400 text-sm mt-2">
                                        {result.winner_id === user?.id ? "You won!" : `${result.winner_username} wins`}
                                        {result.reason === "forfeit" && " (Forfeit)"}
                                    </p>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="p-8 grid grid-cols-3 gap-6 text-center">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Your Score</p>
                                    <p className="text-3xl font-black text-white">
                                        {isPlayer1 ? result.final_scores.player1 : result.final_scores.player2}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">XP Gained</p>
                                    <p className="text-3xl font-black text-neon-gold">
                                        +{result.is_draw ? result.xp_rewards.draw :
                                            result.winner_id === user?.id ? result.xp_rewards.winner : result.xp_rewards.loser}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">MMR Change</p>
                                    <div className="flex items-center justify-center gap-1">
                                        {result.is_draw ? (
                                            <p className="text-3xl font-black text-yellow-400">+{result.mmr_changes.draw}</p>
                                        ) : result.winner_id === user?.id ? (
                                            <>
                                                <TrendingUp className="w-5 h-5 text-neon-green" />
                                                <p className="text-3xl font-black text-neon-green">+{result.mmr_changes.winner}</p>
                                            </>
                                        ) : (
                                            <>
                                                <TrendingDown className="w-5 h-5 text-red-400" />
                                                <p className="text-3xl font-black text-red-400">{result.mmr_changes.loser}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Feedback */}
                            {myFeedback && (
                                <div className="px-8 pb-4">
                                    <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Brain className="w-3 h-3 text-neon-purple" /> AI Judge Feedback
                                        </h4>
                                        {myFeedback.summary && (
                                            <p className="text-sm text-gray-300 mb-2">{myFeedback.summary}</p>
                                        )}
                                        {myScore !== null && (
                                            <p className="text-xs text-gray-500">AI Score: <span className="text-neon-blue font-bold">{myScore}/100</span></p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="px-8 pb-8 flex gap-4">
                                <Button variant="ghost" className="flex-1 bg-white/5 hover:bg-white/10" onClick={onClose}>
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lobby
                                </Button>
                                <Button className="flex-1 bg-neon-blue hover:bg-neon-blue/80 text-black font-bold" onClick={onClose}>
                                    Play Again
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
