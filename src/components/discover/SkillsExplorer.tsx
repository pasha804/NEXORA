import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Clock,
    BarChart3,
    BookOpen,
    Zap,
    ArrowRight,
    Star
} from "lucide-react";
import { toast } from "sonner";

interface Skill {
    id?: number;
    name: string;
    category: string;
    description: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    popularity: number;
    marketDemand: "Low" | "Medium" | "High" | "Very High";
    avgSalary: string;
    timeToMaster: string;
    trendDirection: "up" | "down" | "stable";
    trendPercentage: number;
    relatedSkills: string[];
    topCourses: number;
    gradient: string;
    icon: string;
}

interface SkillsExplorerProps {
    searchQuery: string;
    filters: any;
}

export const SkillsExplorer = ({ searchQuery, filters }: SkillsExplorerProps) => {
    const [skills, setSkills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

    const fetchSkills = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const url = `${API_URL}/search/?q=${encodeURIComponent(searchQuery || "")}`;
            const resp = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                setSkills(data.skills || []);
            }
        } catch (err) {
            console.error("Fetch skills error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, [searchQuery]);

    const trendingSkills = skills.slice(0, 3);
    const allSkills = skills;
    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Total Skills"
                    value={skills.length || "0"}
                    icon={BookOpen}
                    color="text-blue-400"
                />
                <StatCard
                    label="Trending Now"
                    value={Math.min(skills.length, 5)}
                    icon={TrendingUp}
                    color="text-green-400"
                />
                <StatCard
                    label="High Demand"
                    value={Math.min(skills.length, 3)}
                    icon={Zap}
                    color="text-yellow-400"
                />
                <StatCard
                    label="Your Skills"
                    value="8"
                    icon={Star}
                    color="text-purple-400"
                />
            </div>

            {/* Trending Skills Spotlight */}
            <div className="glass-card p-6 border border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-yellow-400" />
                            Trending This Week
                        </h2>
                        <p className="text-sm text-muted-foreground">Fastest growing skills in the market</p>
                    </div>
                    <Button variant="ghost" size="sm">
                        View All
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {trendingSkills.map((skill, i) => (
                        <TrendingSkillCard key={skill.id} skill={{
                            ...skill,
                            trendDirection: skill.trendDirection || "up",
                            trendPercentage: skill.trendPercentage || 0,
                            gradient: skill.gradient || "from-blue-600 to-indigo-700",
                            icon: skill.icon || skill.name[0]
                        }} index={i} />
                    ))}
                    {skills.length === 0 && !loading && (
                        <div className="col-span-full py-10 text-center text-muted-foreground text-sm italic">
                            Analyzing market trends...
                        </div>
                    )}
                </div>
            </div>

            {/* All Skills Grid */}
            <div>
                <h2 className="font-bold text-lg mb-4">Explore All Skills</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allSkills.map((skill, i) => (
                        <SkillCard key={skill.id} skill={{
                            ...skill,
                            relatedSkills: skill.relatedSkills || [],
                            topCourses: skill.topCourses || 0
                        }} index={i} />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="text-2xl font-bold">{value}</span>
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
    </div>
);

// Trending Skill Card (compact)
const TrendingSkillCard = ({ skill, index }: { skill: Skill; index: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        className="p-3 rounded-lg bg-card/50 border border-yellow-500/20 hover:border-yellow-500/50 transition-all cursor-pointer"
    >
        <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${skill.gradient} flex items-center justify-center text-white font-bold text-xs`}>
                {skill.icon}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate">{skill.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{skill.category}</p>
            </div>
            <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
                <TrendingUp className="w-3 h-3" />
                {skill.trendPercentage}%
            </div>
        </div>
    </motion.div>
);

// Full Skill Card
const SkillCard = ({ skill, index }: { skill: Skill; index: number }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);

    const handleStartLearning = () => {
        toast.success(`Added ${skill.name} to your learning path!`);
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        toast.success(isBookmarked ? "Removed from saved" : "Saved to your collection");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="glass-card p-5 hover:border-purple-500/50 transition-all group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${skill.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {skill.icon}
                    </div>
                    <div>
                        <h3 className="font-bold group-hover:text-primary transition-colors">{skill.name}</h3>
                        <p className="text-xs text-muted-foreground">{skill.category}</p>
                    </div>
                </div>
                <button
                    onClick={handleBookmark}
                    className={`transition-colors ${isBookmarked ? "text-yellow-400" : "text-muted-foreground hover:text-yellow-400"}`}
                >
                    <Star className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
                </button>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{skill.description}</p>

            {/* Market Stats */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Market Demand</span>
                    <Badge
                        variant="outline"
                        className={`text-xs ${skill.marketDemand === "Very High"
                            ? "border-green-500/50 bg-green-500/10 text-green-400"
                            : skill.marketDemand === "High"
                                ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                                : "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                            }`}
                    >
                        {skill.marketDemand}
                    </Badge>
                </div>

                {/* Popularity Bar */}
                <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Popularity</span>
                        <span className="font-bold">{skill.popularity}%</span>
                    </div>
                    <Progress value={skill.popularity} className="h-1.5" />
                </div>

                {/* Salary & Time */}
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-green-400">
                        <DollarSign className="w-3 h-3" />
                        <span className="font-bold">{skill.avgSalary}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{skill.timeToMaster}</span>
                    </div>
                </div>
            </div>

            {/* Difficulty & Trend */}
            <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="text-xs">
                    {skill.difficulty}
                </Badge>
                <div className={`flex items-center gap-1 text-xs font-bold ${skill.trendDirection === "up" ? "text-green-400" : "text-red-400"
                    }`}>
                    {skill.trendDirection === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {skill.trendPercentage}%
                </div>
            </div>

            {/* Related Skills */}
            <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Related Skills:</p>
                <div className="flex flex-wrap gap-1">
                    {skill.relatedSkills.slice(0, 3).map((related, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">
                            {related}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={handleStartLearning}>
                    <BookOpen className="w-3 h-3 mr-1" />
                    Start Learning
                </Button>
                <Button size="sm" variant="outline">
                    <BarChart3 className="w-3 h-3" />
                </Button>
            </div>
        </motion.div>
    );
};
