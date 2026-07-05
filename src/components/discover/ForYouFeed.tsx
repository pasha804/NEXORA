import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sparkles,
    RefreshCw,
    ArrowRight,
    Users,
    Target,
    Calendar,
    Briefcase,
    TrendingUp,
    Zap
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { useSkillIntelligence } from "@/hooks/useSkillIntelligence";

interface ForYouFeedProps {
    searchQuery: string;
    filters: any;
}

export const ForYouFeed = ({ searchQuery, filters }: ForYouFeedProps) => {
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [people, setPeople] = useState<any[]>([]);
    const { data: skillIntel } = useSkillIntelligence(user?.id);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const fetchRecommendations = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const resp = await fetch(`${API_URL}/social/recommended`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                setPeople(data.slice(0, 3)); // Just show top 3 in the mini feed
            }
        } catch (err) {
            console.error("Fetch recommendations error:", err);
        }
    };

    useEffect(() => {
        if (user) fetchRecommendations();
    }, [user]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchRecommendations();
        toast.success("Feed refreshed with new recommendations!");
        setRefreshing(false);
    };

    const topSkills = user?.skills?.slice(0, 2).map(s => s.name).join(", ") || "Coding";
    const topInterests = user?.interests?.slice(0, 2).join(" and ") || "Technology";

    return (
        <div className="space-y-8">
            {/* AI Personalization Header - Enhanced */}
            <motion.div
                className="glass-card p-6 border border-primary/30 bg-gradient-to-r from-primary/10 to-purple-500/10 relative overflow-hidden"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 animate-gradient" />
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold flex items-center gap-2">
                                Personalized For You
                                <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                                    <Zap className="w-3 h-3 mr-1" />
                                    AI-Powered
                                </Badge>
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Based on your {topSkills} expertise, {topInterests} interests, and learning goals
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="hover-scale"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                </div>
            </motion.div>

            {/* People to Connect */}
            <RecommendationSection
                title="People to Connect"
                subtitle="AI-matched developers based on your skills"
                icon={Users}
                color="text-blue-400"
                viewAllLink="/discover?tab=people"
            >
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {people.map((person, i) => (
                        <PersonCardMini key={person.id} person={{
                            ...person,
                            name: person.display_name || person.username,
                            role: person.account_type || "Member",
                            avatar: person.avatar_url,
                            match: person.ai_match_score,
                            skills: person.skills || []
                        }} index={i} />
                    ))}
                    {people.length === 0 && !refreshing && (
                        <div className="col-span-full py-10 text-center text-muted-foreground text-sm italic">
                            No active peers found for your current skill profile.
                        </div>
                    )}
                </div>
            </RecommendationSection>

            {/* Skills to Learn Next */}
            <RecommendationSection
                title="Skills to Learn Next"
                subtitle="Recommended based on your career path"
                icon={Target}
                color="text-purple-400"
                viewAllLink="/discover?tab=skills"
            >
                <div className="grid sm:grid-cols-2 gap-4">
                    {(skillIntel?.skills_to_learn || []).slice(0, 4).length > 0 ? (
                        (skillIntel?.skills_to_learn || []).slice(0, 4).map((skill, i) => (
                            <SkillCardMini
                                key={i}
                                skill={
                                    "skill_name" in skill
                                        ? {
                                            name: skill.skill_name,
                                            category: skill.source,
                                            demand: "High",
                                            timeToLearn: skill.suggested_level || "2-4 weeks",
                                            gradient: "from-blue-500 to-purple-600",
                                            icon: "★",
                                        }
                                        : skill
                                }
                                index={i}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-10 text-center text-muted-foreground text-sm italic">
                            Complete more activities to get skill recommendations
                        </div>
                    )}
                </div>
            </RecommendationSection>

            {/* Upcoming Events */}
            <RecommendationSection
                title="Upcoming Events"
                subtitle="Tournaments and hackathons matching your level"
                icon={Calendar}
                color="text-pink-400"
                viewAllLink="/discover?tab=events"
            >
                <div className="space-y-3">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="glass-card p-10 border-dashed border-pink-500/20 text-center space-y-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto">
                            <Calendar className="w-8 h-8 text-pink-400 opacity-50" />
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground">Nexus Tournaments Coming Soon</h4>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                We're preparing high-stakes coding battles. Check back soon for Season 1!
                            </p>
                        </div>
                    </motion.div>
                </div>
            </RecommendationSection>

            {/* Job Opportunities */}
            <RecommendationSection
                title="Job Opportunities"
                subtitle="Top matches for your profile"
                icon={Briefcase}
                color="text-yellow-400"
                viewAllLink="/discover?tab=opportunities"
            >
                <div className="space-y-3">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="glass-card p-10 border-dashed border-yellow-500/20 text-center space-y-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
                            <Briefcase className="w-8 h-8 text-yellow-400 opacity-50" />
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground">Talent Forge In Progress</h4>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                Partnering with top tech companies to bring you skill-matched career opportunities.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </RecommendationSection>
        </div>
    );
};

// Recommendation Section Wrapper - Enhanced
const RecommendationSection = ({
    title,
    subtitle,
    icon: Icon,
    color,
    viewAllLink,
    children
}: any) => (
    <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex items-center justify-between">
            <div>
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${color}`} />
                    {title}
                </h2>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 hover-scale">
                See All
                <ArrowRight className="w-4 h-4" />
            </Button>
        </div>
        {children}
    </motion.div>
);

// Mini Person Card - Enhanced
const PersonCardMini = ({ person, index }: any) => {
    const initials = person.name
        ? person.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-4 hover:border-primary/50 transition-all cursor-pointer group"
        >
            <div className="flex items-start gap-3 mb-3">
                <Avatar className="w-12 h-12 rounded-lg ring-2 ring-primary/10 transition-all group-hover:ring-primary/40">
                    <AvatarImage src={person.avatar} alt={person.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-bold text-sm">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate group-hover:text-primary transition-colors text-sm">{person.name}</h3>
                    <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{person.role}</p>
                </div>
                {person.match && (
                    <Badge variant="secondary" className="text-[10px] bg-green-500/15 text-green-400 border-green-500/30 shrink-0">
                        {person.match}%
                    </Badge>
                )}
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
                {(person.skills || []).slice(0, 2).map((skill: any, skillIndex: number) => (
                    <Badge key={skillIndex} variant="outline" className="text-[9px] h-4 px-1.5 opacity-80">
                        {typeof skill === 'object' ? skill.name : skill}
                    </Badge>
                ))}
            </div>
            <Button size="sm" className="w-full h-8 text-xs font-bold" variant="outline">Connect</Button>
        </motion.div>
    );
};

// Mini Skill Card - Enhanced
const SkillCardMini = ({ skill, index }: any) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ delay: index * 0.05 }}
        className="glass-card p-4 hover:border-purple-500/50 transition-all cursor-pointer group"
    >
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${skill.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {skill.icon}
                </div>
                <div>
                    <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{skill.name}</h3>
                    <p className="text-xs text-muted-foreground">{skill.category}</p>
                </div>
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
        </div>
        <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Demand: <span className="text-green-400 font-bold">{skill.demand}</span></span>
            <span className="text-muted-foreground">{skill.timeToLearn}</span>
        </div>
    </motion.div>
);

// Mini Event Card - Enhanced
const EventCardMini = ({ event, index }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ x: 4 }}
        transition={{ delay: index * 0.05 }}
        className="glass-card p-4 hover:border-pink-500/50 transition-all cursor-pointer flex items-center gap-4"
    >
        <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${event.gradient} flex flex-col items-center justify-center text-white shadow-lg shrink-0`}>
            <span className="text-2xl font-bold">{event.day}</span>
            <span className="text-[10px] uppercase">{event.month}</span>
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="font-bold mb-1 truncate">{event.title}</h3>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{event.description}</p>
            <div className="flex items-center gap-3 text-xs flex-wrap">
                <Badge variant="outline" className="text-[10px]">{event.type}</Badge>
                <span className="text-yellow-400">💰 {event.prize}</span>
            </div>
        </div>
        <Button size="sm" className="shrink-0">Register</Button>
    </motion.div>
);

// Mini Job Card - Enhanced
const JobCardMini = ({ job, index }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ x: 4 }}
        transition={{ delay: index * 0.05 }}
        className="glass-card p-4 hover:border-yellow-500/50 transition-all cursor-pointer"
    >
        <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
                <h3 className="font-bold mb-1 truncate">{job.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{job.company}</p>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs shrink-0 ml-2">
                {job.match}% Match
            </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
            <span>{job.type}</span>
            <span>•</span>
            <span className="text-green-400 font-bold">{job.salary}</span>
        </div>
        <div className="flex gap-2">
            <Button size="sm" className="flex-1">Apply</Button>
            <Button size="sm" variant="outline">Save</Button>
        </div>
    </motion.div>
);
