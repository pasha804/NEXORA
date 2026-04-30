import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
    Sparkles,
    Users,
    Target,
    UsersRound,
    Briefcase,
    Calendar,
    TrendingUp,
    Newspaper
} from "lucide-react";

export type DiscoverTab =
    | "for-you"
    | "people"
    | "skills"
    | "communities"
    | "projects"
    | "opportunities"
    | "events"
    | "trending";

interface DiscoverTabsProps {
    activeTab: DiscoverTab;
    onTabChange: (tab: DiscoverTab) => void;
    newCounts?: Partial<Record<DiscoverTab, number>>;
}

const tabs: Array<{
    id: DiscoverTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}> = [
        { id: "for-you", label: "For You", icon: Sparkles, color: "text-primary" },
        { id: "people", label: "People", icon: Users, color: "text-blue-400" },
        { id: "skills", label: "Skills", icon: Target, color: "text-purple-400" },
        { id: "communities", label: "Communities", icon: UsersRound, color: "text-green-400" },
        { id: "projects", label: "Projects", icon: Briefcase, color: "text-orange-400" },
        { id: "opportunities", label: "Opportunities", icon: TrendingUp, color: "text-yellow-400" },
        { id: "events", label: "Events & PvP", icon: Calendar, color: "text-pink-400" },
        { id: "trending", label: "Trending", icon: Newspaper, color: "text-red-400" },
    ];

export const DiscoverTabs = ({ activeTab, onTabChange, newCounts = {} }: DiscoverTabsProps) => {
    return (
        <div className="relative">
            {/* Desktop Tabs */}
            <div className="hidden md:flex items-center gap-2 discover-tabs-scroll">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const hasNew = newCounts[tab.id] && newCounts[tab.id]! > 0;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                relative px-5 py-3 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap
                                ${isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "bg-card/50 hover:bg-card border border-white/5 hover:border-primary/30"
                                }
                            `}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : tab.color}`} />
                            <span>{tab.label}</span>
                            {hasNew && (
                                <Badge variant="secondary" className="ml-1 px-1.5 h-5 min-w-5 bg-red-500 text-white text-[10px]">
                                    {newCounts[tab.id]}
                                </Badge>
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary rounded-lg -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Mobile Tabs - Horizontal Scroll */}
            <div className="md:hidden flex items-center gap-2 discover-tabs-scroll snap-x snap-mandatory">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const hasNew = newCounts[tab.id] && newCounts[tab.id]! > 0;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                relative px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap snap-start
                                ${isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card/50 border border-white/5"
                                }
                            `}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : tab.color}`} />
                            <span className="text-sm">{tab.label}</span>
                            {hasNew && (
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
