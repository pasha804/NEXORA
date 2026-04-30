import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    Flame,
    Target,
    Users,
    Swords,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TRENDING_TABS = [
    { id: "posts", label: "Trending Posts", icon: Flame, color: "text-orange-500" },
    { id: "skills", label: "Skills", icon: Target, color: "text-blue-500" },
    { id: "communities", label: "Communities", icon: Users, color: "text-purple-500" },
    { id: "creators", label: "Creators", icon: Sparkles, color: "text-yellow-500" },
    { id: "arenas", label: "PvP Arenas", icon: Swords, color: "text-red-500" },
];

export const TrendingDiscoveryStrip = () => {
    const [activeTab, setActiveTab] = useState("posts");
    const [trendingData, setTrendingData] = useState<Record<string, string[]>>({
        posts: ["#Nexora", "#Skills", "#Building"],
        skills: ["Skill Matrix", "Logic", "Design"],
        communities: ["Skill Forge", "Dev Masters", "AI Builders"],
        creators: ["@nexora", "@admin"],
        arenas: ["Logic Duel", "Quick Build"]
    });

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";
        const fetchTrends = async () => {
            try {
                const res = await fetch(`${API_URL}/social/trending/all`);
                if (!res.ok) return;
                const data = await res.json();
                setTrendingData(data);
            } catch {
                // fallback remains
            }
        };
        fetchTrends();
    }, []);

    const trendingContent = trendingData;

    return (
        <div className="glass-card p-4 overflow-hidden border-white/5">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Global Trends</h4>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none no-scrollbar">
                {TRENDING_TABS.map((tab) => (
                    <Badge
                        key={tab.id}
                        variant={activeTab === tab.id ? "default" : "secondary"}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-1.5 cursor-pointer whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                                ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-105"
                                : "bg-white/5 hover:bg-white/10 text-muted-foreground"
                            }`}
                    >
                        <tab.icon className={`w-3 h-3 ${activeTab === tab.id ? "text-white" : tab.color}`} />
                        {tab.label}
                    </Badge>
                ))}
            </div>

            <div className="flex flex-wrap gap-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-wrap gap-2 w-full"
                    >
                        {trendingContent[activeTab as keyof typeof trendingContent].map((item, i) => (
                            <Badge
                                key={item}
                                variant="outline"
                                className="bg-background/20 backdrop-blur-sm border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer px-3 py-1 text-xs"
                            >
                                {item}
                            </Badge>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
