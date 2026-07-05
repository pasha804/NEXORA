import { useEffect } from "react";
import { toast } from "sonner";
import { Swords, UserPlus, Trophy, MessageCircle } from "lucide-react";
import { io } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";

export const RealTimeEvents = () => {
    const { user } = useAuth();
    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

    useEffect(() => {
        if (!user) return;

        // Connect to global events namespace or main path
        const socket = io(API_URL, {
            path: "/battle/socket.io",
            transports: ["websocket"],
            auth: {
                token: localStorage.getItem("access_token")
            }
        });

        socket.on("connect", () => {
            console.log("Connected to RealTime events");
        });

        socket.on("follow_created", (data: any) => {
            if (data.following_id === user.id) {
                toast(`${data.follower_name} started following you`, {
                    icon: <UserPlus className="w-5 h-5 text-blue-500" />,
                    position: "bottom-left",
                    className: "glass-card border-l-4 border-l-blue-500"
                });
            }
        });

        socket.on("achievement_unlocked", (data: any) => {
            if (data.user_id === user.id) {
                toast(`Achievement Unlocked: ${data.name}`, {
                    icon: <Trophy className="w-5 h-5 text-yellow-500" />,
                    position: "bottom-left",
                    className: "glass-card border-l-4 border-l-yellow-500"
                });
            }
        });

        socket.on("match_found", (data: any) => {
            // Usually the PvP page handles this, but we can show a global notification
            toast("Match Found! Transitioning to arena...", {
                icon: <Swords className="w-5 h-5 text-red-500" />,
                position: "bottom-left",
                className: "glass-card border-l-4 border-l-red-500"
            });
        });

        socket.on("new_message", (data: any) => {
            if (data.receiver_id === user.id) {
                toast(`New message from ${data.sender_name}`, {
                    icon: <MessageCircle className="w-5 h-5 text-purple-500" />,
                    position: "bottom-left",
                    className: "glass-card border-l-4 border-l-purple-500"
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user, API_URL]);

    return null; // Logic only component
};
