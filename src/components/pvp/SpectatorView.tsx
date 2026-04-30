import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Code2, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface SpectatorViewProps {
    matchId: string;
    onClose: () => void;
}

export const SpectatorView = ({ matchId, onClose }: SpectatorViewProps) => {
    const { token } = useAuth();
    const [code, setCode] = useState<string>("// Waiting for player code...");
    const [stats, setStats] = useState({ viewers: 0, p1_name: "Player 1", p2_name: "Player 2" });
    const [isConnected, setIsConnected] = useState(false);

    // Socket Connection
    useEffect(() => {
        const socket = io("http://localhost:80", {
            path: "/battle/socket.io",
            transports: ["websocket"],
            auth: { token }
        });

        socket.on("connect", () => {
            setIsConnected(true);
            socket.emit("join_match", { match_id: matchId, spectator: true });
        });

        socket.on("code_sync", (data: any) => {
            // Update the code view when a player types
            // data: { code: "...", user_id: ... }
            setCode(data.code);
        });

        socket.on("match_stats", (data: any) => {
            setStats(prev => ({ ...prev, viewers: data.viewers }));
        });

        socket.on("disconnect", () => setIsConnected(false));

        return () => {
            socket.disconnect();
        };
    }, [matchId, token]);

    return (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a]/95 flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Live Spectator</span>
                    </div>
                    <span className="text-white font-display font-bold text-lg">{stats.p1_name} vs {stats.p2_name}</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Eye className="w-4 h-4" />
                        <span>{stats.viewers} Watching</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <XIcon className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-3 overflow-hidden">
                {/* Left: Player 1 View (Simulated for MVP, ideally split screen) */}
                <div className="col-span-2 bg-[#111] border-r border-white/5 p-4 flex flex-col relative">
                    <div className="absolute top-4 right-4 z-10">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded border border-blue-500/30">PLAYER VIEW</span>
                    </div>
                    <pre className="flex-1 font-mono text-sm text-gray-300 overflow-auto p-4 custom-scrollbar">
                        <code>{code}</code>
                    </pre>
                </div>

                {/* Right: Chat & Events */}
                <div className="col-span-1 bg-black flex flex-col">
                    <div className="p-4 border-b border-white/5 font-bold text-white text-sm">
                        Live Chat
                    </div>
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                        {/* Chat Items */}
                        <div className="text-xs text-center text-muted-foreground opacity-50 py-10">
                            No messages yet.
                        </div>
                    </div>
                    <div className="p-4 border-t border-white/5">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-neon-blue/50"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const XIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M18 6 6 18" /><path d="m6 6 18 18" />
    </svg>
);
