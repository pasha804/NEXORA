import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    SlidersHorizontal,
    X,
    Sparkles,
    TrendingUp,
    Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getRankInfoFromString } from "@/lib/rankSystem";

interface SearchSuggestion {
    text: string;
    type: "person" | "skill" | "community" | "trending";
    icon?: React.ReactNode;
    rank?: string;
}

interface DiscoverHeaderProps {
    onSearchChange: (query: string) => void;
    onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
    skillLevel?: string[];
    industry?: string[];
    popularity?: string;
    recent?: boolean;
}

export const DiscoverHeader = ({ onSearchChange, onFilterChange }: DiscoverHeaderProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<FilterState>({});

    // AI suggestions based on search query
    const getSuggestions = useCallback((query: string): SearchSuggestion[] => {
        if (!query) return [
            { text: "React Developers", type: "trending", icon: <TrendingUp className="w-3 h-3" />, rank: "Gold" },
            { text: "System Design", type: "trending", icon: <TrendingUp className="w-3 h-3" />, rank: "Platinum" },
            { text: "Web3 Communities", type: "trending", icon: <TrendingUp className="w-3 h-3" />, rank: "Silver" },
            { text: "AI/ML Engineers", type: "trending", icon: <TrendingUp className="w-3 h-3" />, rank: "Platinum" },
            { text: "Cloud Architects", type: "trending", icon: <TrendingUp className="w-3 h-3" />, rank: "Gold" },
        ];

        const queryLower = query.toLowerCase();
        const skillRanks: Record<string, string> = {
            "react": "Gold", "python": "Silver", "rust": "Gold",
            "ai": "Platinum", "ml": "Platinum", "machine learning": "Platinum",
            "devops": "Gold", "docker": "Silver", "kubernetes": "Gold",
            "blockchain": "Gold", "solidity": "Gold",
            "security": "Platinum", "cybersecurity": "Platinum",
        };
        const matchedRank = Object.entries(skillRanks).find(([k]) => queryLower.includes(k))?.[1];

        return [
            { text: `${query} Developers`, type: "person", rank: matchedRank || "Silver" },
            { text: `${query} Tutorial`, type: "skill" },
            { text: `${query} Community`, type: "community" },
        ];
    }, []);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setShowSuggestions(value.length > 0 || true);
        onSearchChange(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            setShowSuggestions(false);
            onSearchChange(searchQuery);
        }
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        setSearchQuery(suggestion.text);
        setShowSuggestions(false);
        onSearchChange(suggestion.text);
    };

    const toggleFilter = (category: keyof FilterState, value: any) => {
        const newFilters = { ...activeFilters };
        if (Array.isArray(newFilters[category])) {
            const arr = newFilters[category] as string[];
            if (arr.includes(value)) {
                newFilters[category] = arr.filter(v => v !== value) as any;
            } else {
                newFilters[category] = [...arr, value] as any;
            }
        } else {
            newFilters[category] = value;
        }
        setActiveFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        setActiveFilters({});
        onFilterChange({});
    };

    const activeFilterCount = Object.values(activeFilters).flat().filter(Boolean).length;

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-3xl">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
                    <Input
                        placeholder="Search people, skills, communities, projects..."
                        className="pl-12 pr-24 h-14 bg-card/50 border-primary/20 focus:border-primary text-base backdrop-blur-sm"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowSuggestions(true)}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => handleSearchChange("")}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                        <Button
                            variant={showFilters ? "default" : "outline"}
                            size="sm"
                            className="h-10 gap-2"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <Badge variant="secondary" className="ml-1 px-1.5 h-5 min-w-5 bg-primary text-primary-foreground">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </div>
                </div>

                {/* AI Suggestions Dropdown */}
                <AnimatePresence>
                    {showSuggestions && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full mt-2 w-full glass-card p-2 z-50 border border-primary/20"
                        >
                            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                                <Sparkles className="w-3 h-3 text-primary" />
                                AI Suggested
                            </div>
                            {getSuggestions(searchQuery).map((suggestion, i) => {
                                const sugRankInfo = suggestion.rank ? getRankInfoFromString(suggestion.rank) : null;
                                return (
                                    <button
                                        key={i}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-colors text-left"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion.icon || <Search className="w-4 h-4 text-muted-foreground" />}
                                        <span className="flex-1">{suggestion.text}</span>
                                        <div className="flex items-center gap-1.5">
                                            {sugRankInfo && (
                                                <span className={sugRankInfo.color + " text-[10px]"}>{sugRankInfo.icon}</span>
                                            )}
                                            <Badge variant="outline" className="text-[10px] h-5">
                                                {suggestion.type}
                                            </Badge>
                                        </div>
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-card p-6 border border-primary/20"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-primary" />
                                Advanced Filters
                            </h3>
                            {activeFilterCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    Clear All
                                </Button>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Skill Level */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Skill Level</label>
                                <div className="flex flex-wrap gap-2">
                                    {["Beginner", "Intermediate", "Advanced", "Expert"].map((level) => (
                                        <Badge
                                            key={level}
                                            variant={activeFilters.skillLevel?.includes(level) ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => toggleFilter("skillLevel", level)}
                                        >
                                            {level}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Industry */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Industry</label>
                                <div className="flex flex-wrap gap-2">
                                    {["Web Dev", "Mobile", "AI/ML", "DevOps", "Design"].map((ind) => (
                                        <Badge
                                            key={ind}
                                            variant={activeFilters.industry?.includes(ind) ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => toggleFilter("industry", ind)}
                                        >
                                            {ind}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Popularity */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Popularity</label>
                                <div className="flex flex-wrap gap-2">
                                    {["Rising", "Popular", "Trending"].map((pop) => (
                                        <Badge
                                            key={pop}
                                            variant={activeFilters.popularity === pop ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => toggleFilter("popularity", pop)}
                                        >
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            {pop}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Activity</label>
                                <Badge
                                    variant={activeFilters.recent ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleFilter("recent", !activeFilters.recent)}
                                >
                                    <Clock className="w-3 h-3 mr-1" />
                                    Active Today
                                </Badge>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Filter Chips */}
            {activeFilterCount > 0 && !showFilters && (
                <div className="flex flex-wrap gap-2">
                    {Object.entries(activeFilters).flatMap(([key, values]) =>
                        Array.isArray(values)
                            ? values.map((v) => (
                                <Badge key={`${key}-${v}`} variant="secondary" className="gap-1">
                                    {v}
                                    <X
                                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                                        onClick={() => toggleFilter(key as keyof FilterState, v)}
                                    />
                                </Badge>
                            ))
                            : values ? [
                                <Badge key={key} variant="secondary" className="gap-1">
                                    {String(values)}
                                    <X
                                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                                        onClick={() => toggleFilter(key as keyof FilterState, values)}
                                    />
                                </Badge>
                            ] : []
                    )}
                </div>
            )}
        </div>
    );
};
