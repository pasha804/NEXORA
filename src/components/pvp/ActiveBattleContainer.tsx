import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Clock, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

export const ActiveBattleContainer = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeMatch, setActiveMatch] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

    useEffect(() => {
        if (!user || location.pathname.startsWith("/pvp")) {
            setActiveMatch(null);
            return;
        }

        const checkStatus = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const resp = await fetch(`${API_URL}/pvp/match/status/${user.id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (resp.ok) {
                    const data = await resp.json();
                    // Match found in_progress
                    if (data.status === "in_progress" || data.status === "matched") {
                        setActiveMatch(data);
                    } else {
                        setActiveMatch(null);
                    }
                }
            } catch (err) {
                console.error("Match status poll error:", err);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [user, location.pathname]);

    if (!activeMatch || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 right-6 z-50"
            >
                <div className="glass-card p-4 pr-12 border-primary/50 bg-gradient-to-r from-primary/20 to-purple-500/20 shadow-[0_0_20px_rgba(0,180,255,0.2)] backdrop-blur-xl relative min-w-[300px]">
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute top-2 right-2 h-6 w-6 hover:bg-white/10 rounded-full"
                        onClick={() => setIsVisible(false)}
                    >
                        <X className="w-3 h-3" />
                    </Button>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                            <div className="relative p-2 rounded-full bg-primary/20 border border-primary/30">
                                <Swords className="w-5 h-5 text-primary" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-white">Active Battle Found</h4>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                                Match ID: {activeMatch.match_id.substring(0, 8)}...
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-primary font-bold">
                                <Clock className="w-3 h-3" />
                                <span>Action Required</span>
                            </div>
                        </div>

                        <Button 
                            onClick={() => navigate("/pvp")}
                            className="bg-primary hover:bg-primary/80 text-white font-bold h-9 px-4 rounded-lg group"
                        >
                            Resume
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
