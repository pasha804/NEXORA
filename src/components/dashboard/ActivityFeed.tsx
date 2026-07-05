import { motion } from "framer-motion";
import { MessageSquare, Trophy, UserPlus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type ActivityType = "message" | "pvp" | "follow" | "achievement";

interface Activity {
    id: string;
    type: ActivityType;
    content: string;
    time: string;
}

export const ActivityFeed = () => {
    const { user } = useAuth();
    const [activities, setActivities] = useState<Activity[]>([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
                const token = localStorage.getItem("token") || localStorage.getItem("access_token");
                if (!token) return;

                const resp = await fetch(`${API_URL}/notifications/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!resp.ok) return;
                const data = await resp.json();

                const mapped: Activity[] = data.slice(0, 20).map((n: any) => ({
                    id: String(n.id),
                    type:
                        n.type === "NEW_MESSAGE"
                            ? "message"
                            : n.type === "NEW_FOLLOWER"
                            ? "follow"
                            : n.type === "BATTLE_RESULT"
                            ? "pvp"
                            : "achievement",
                    content: n.title || n.message,
                    time: new Date(n.created_at).toLocaleTimeString(),
                }));
                setActivities(mapped);
            } catch (e) {
                console.error("Failed to load activity feed", e);
            }
        };
        fetchNotifications();
    }, [user]);
    const getIcon = (type: Activity["type"]) => {
        switch (type) {
            case "pvp": return <Trophy className="w-4 h-4 text-neon-magenta" />;
            case "achievement": return <Star className="w-4 h-4 text-yellow-400" />;
            case "follow": return <UserPlus className="w-4 h-4 text-primary" />;
            case "message": return <MessageSquare className="w-4 h-4 text-electric-400" />;
        }
    };

    return (
        <div className="glass-card p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-neon-blue" />
                    Activity Feed
                </h3>
                <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted/50">Live</span>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {activities.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group flex items-start gap-4 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-primary/20"
                    >
                        <div className={`mt-1 p-2 rounded-full relative overflow-hidden ${activity.type === 'pvp' ? 'bg-neon-magenta/10 text-neon-magenta' :
                                activity.type === 'achievement' ? 'bg-yellow-400/10 text-yellow-400' :
                                    activity.type === 'follow' ? 'bg-primary/10 text-primary' :
                                        'bg-blue-400/10 text-blue-400'
                            }`}>
                            {getIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground leading-relaxed group-hover:text-glow-sm transition-all duration-300">
                                {activity.content.split(/(@[\w_]+)/g).map((part, i) =>
                                    part.startsWith('@') ?
                                        <span key={i} className="text-primary font-medium cursor-pointer hover:underline">{part}</span> :
                                        part
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                {activity.time}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
