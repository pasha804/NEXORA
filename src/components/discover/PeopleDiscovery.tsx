import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import {
    UserPlus, UserCheck, MessageCircle, Swords,
    MapPin, Sparkles, Users, ChevronDown, Loader2, Zap
} from "lucide-react";
import { toast } from "sonner";
import { RankBadge } from "@/components/ui/RankBadge";
import { getRankInfoFromString } from "@/lib/rankSystem";
import { RankAura } from "@/components/profile/RankAura";
import { UserPreviewCard } from "@/components/profile/UserCard";

interface PeopleDiscoveryProps {
    searchQuery: string;
    filters: any;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface FilterParams {
    skill?: string;
    category?: string;
    sort?: string;
}

export const PeopleDiscovery = ({ searchQuery, filters }: PeopleDiscoveryProps) => {
    const [people, setPeople] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeFilters, setActiveFilters] = useState<FilterParams>({ sort: "newest" });
    const [activeCategory, setActiveCategory] = useState<string>("");
    const [activeSort, setActiveSort] = useState<string>("newest");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const CATEGORIES = [
        { label: "All", value: "" },
        { label: "Frontend", value: "Frontend" },
        { label: "Backend", value: "Backend" },
        { label: "AI/ML", value: "AI/ML" },
        { label: "DevOps", value: "DevOps" },
        { label: "Design", value: "Design" },
        { label: "Mobile", value: "Mobile" },
        { label: "Cybersecurity", value: "Cybersecurity" },
        { label: "Blockchain", value: "Blockchain" },
        { label: "Database", value: "Database" },
        { label: "Game Dev", value: "Game Dev" },
    ];

    const SORTS = [
        { label: "Newest", value: "newest" },
        { label: "XP High", value: "xp_high" },
        { label: "Most Followed", value: "most_followed" },
        { label: "Most Active", value: "most_active" },
    ];

    const fetchPeople = useCallback(async (pageNum: number = 1, query: string = "", filterParams: FilterParams = {}) => {
        const isFirstPage = pageNum === 1;
        if (isFirstPage) setLoading(true);
        else setLoadingMore(true);

        try {
            const token = localStorage.getItem("access_token");
            const params = new URLSearchParams({ page: String(pageNum), limit: "12" });
            if (query.trim()) params.set("q", query.trim());
            if (filterParams.skill) params.set("skill", filterParams.skill);
            if (filterParams.category) params.set("category", filterParams.category);
            if (filterParams.sort) params.set("sort", filterParams.sort);

            console.log("[DISCOVER] Fetching users from:", `${API_URL}/search/users?${params}`);
            console.log("[DISCOVER] Token exists:", !!token);

            const resp = await fetch(`${API_URL}/search/users?${params}`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });

            console.log("[DISCOVER] Response status:", resp.status);
            console.log("[DISCOVER] Response ok:", resp.ok);

            if (resp.ok) {
                const responseData = await resp.json();
                console.log("API DATA:", responseData);
                const data = responseData && typeof responseData === "object" && "data" in responseData
                    ? (responseData as any).data
                    : responseData;
                const users = data.users || [];
                console.log("[DISCOVER] Users count:", users.length);
                if (isFirstPage) {
                    setPeople(users);
                } else {
                    setPeople(prev => [...prev, ...users]);
                }
                setHasMore(Boolean(data.has_next));
            } else {
                if (isFirstPage) setPeople([]);
            }
        } catch (err) {
            console.error("Fetch people error:", err);
            if (isFirstPage) setPeople([]);
        } finally {
            if (isFirstPage) setLoading(false);
            else setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        
        const filterParams: FilterParams = { sort: activeSort };
        if (activeCategory) filterParams.category = activeCategory;
        
        // Also parse skill keywords from free-text search
        if (searchQuery) {
            const skillKeywords = ["React", "Python", "AI", "ML", "Machine Learning", "DevOps", "UI", "UX", "Mobile", "Cloud", "Data", "Security", "Blockchain", "Full Stack", "Docker", "Kubernetes", "TypeScript", "JavaScript", "Node", "Go", "Rust"];
            const matchedSkill = skillKeywords.find(k => searchQuery.toLowerCase().includes(k.toLowerCase()));
            if (matchedSkill && !filterParams.category) {
                filterParams.skill = matchedSkill;
            }
        }
        
        setActiveFilters(filterParams);
        
        debounceRef.current = setTimeout(() => {
            setPage(1);
            fetchPeople(1, searchQuery, filterParams);
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery, activeCategory, activeSort, fetchPeople]);

    // Handle filter changes from DiscoverHeader
    useEffect(() => {
        if (filters && Object.keys(filters).length > 0) {
            const newFilters: FilterParams = { ...activeFilters };
            if (filters.skillLevel?.length) newFilters.skill = filters.skillLevel[0];
            if (filters.industry?.length) newFilters.category = filters.industry[0];
            if (filters.recent) newFilters.sort = "most_active";
            if (filters.popularity === "Trending") newFilters.sort = "most_followed";
            else if (filters.popularity === "Popular") newFilters.sort = "xp_high";
            setActiveFilters(newFilters);
            fetchPeople(1, searchQuery, newFilters);
        }
    }, [filters]);

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat);
        setPage(1);
    };

    const handleSortChange = (sort: string) => {
        setActiveSort(sort);
        setPage(1);
    };

    const handleReset = () => {
        setActiveCategory("");
        setActiveSort("newest");
        setPage(1);
        fetchPeople(1, "", { sort: "newest" });
    };

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPeople(nextPage, searchQuery, activeFilters);
        }
    };

    return (
        <div className="space-y-5">
            {/* Category Filter Pills */}
            <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.value}
                        onClick={() => handleCategoryChange(cat.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            activeCategory === cat.value
                                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(0,163,255,0.3)]"
                                : "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground bg-background/50"
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Sort + Stats Row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* AI Matching Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 glass-card px-4 py-2.5 border border-primary/20 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 flex-1 min-w-0"
                >
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{searchQuery ? `Results for "${searchQuery}"` : activeCategory ? `${activeCategory} Developers` : "AI-Powered Matching"}</p>
                        <p className="text-[11px] text-muted-foreground">
                            {loading ? "Scanning the nexus..." : `${people.length} ${people.length === 1 ? "person" : "people"} found`}
                        </p>
                    </div>
                </motion.div>

                {/* Sort Selector */}
                <div className="flex gap-1.5 shrink-0">
                    {SORTS.map(s => (
                        <button
                            key={s.value}
                            onClick={() => handleSortChange(s.value)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                                activeSort === s.value
                                    ? "bg-primary/10 text-primary border-primary/40"
                                    : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground"
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* People Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    // Skeleton cards
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="glass-card p-6 animate-pulse space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-16 h-16 rounded-full bg-muted/50" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted/50 rounded w-3/4" />
                                    <div className="h-3 bg-muted/50 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 bg-muted/50 rounded" />
                                <div className="h-3 bg-muted/50 rounded w-5/6" />
                            </div>
                            <div className="flex gap-2">
                                <div className="h-9 bg-muted/50 rounded flex-1" />
                                <div className="h-9 w-9 bg-muted/50 rounded" />
                            </div>
                        </div>
                    ))
                ) : people.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-20 text-center glass-card border-dashed"
                    >
                        <div className="relative inline-block mb-4">
                            <Users className="w-16 h-16 mx-auto text-muted-foreground/20" />
                            <div className="absolute -top-1 -right-1">
                                <Sparkles className="w-6 h-6 text-primary/40 animate-pulse" />
                            </div>
                        </div>
                        <h4 className="text-xl font-display font-bold text-foreground/80 mb-2">The Nexus is Quiet</h4>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                            {searchQuery 
                                ? `No users matching "${searchQuery}" found in our database.` 
                                : "We couldn't find any users matching your filters."}
                        </p>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleReset}
                            className="border-primary/20 hover:bg-primary/5 transition-all"
                        >
                            Reset Search
                        </Button>
                    </motion.div>
                ) : (
                    people.map((person, i) => (
                        <PersonCard
                            key={person.id}
                            person={{
                                ...person,
                                name: person.display_name || person.username,
                                role: person.account_type || "Member",
                                avatar: person.avatar_url, // API returns avatar_url
                                xp: person.xp_points || 0,
                                aiMatch: person.ai_match_score ?? 0,
                                aiReason: person.ai_reason || "Matching skill profile detected",
                                skills: person.skills?.map((s: any) => typeof s === 'string' ? s : s.name) || [],
                                onlineStatus: person.online_status
                            }}
                            index={i}
                        />
                    ))
                )}
            </div>

            {/* Load More */}
            {!loading && hasMore && (
                <div className="flex justify-center pt-4">
                    <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="gap-2 hover:border-primary/50 transition-colors"
                    >
                        {loadingMore ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                        {loadingMore ? "Loading..." : "Load More"}
                    </Button>
                </div>
            )}
        </div>
    );
};

const PersonCard = ({ person, index }: any) => {
    const navigate = useNavigate();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [messagingStatus, setMessagingStatus] = useState<{ can_message: boolean; reason: string } | null>(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rankStr = person.rank || "Novice";
    const rankInfo = getRankInfoFromString(rankStr);
    const isHighRank = ["Diamond", "Heroic", "Master", "Grandmaster"].includes(rankInfo.tier);
    const theme = rankInfo.theme;

    const handleMouseEnter = () => {
        if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
        previewTimeoutRef.current = setTimeout(() => setShowPreview(true), 400);
    };
    const handleMouseLeave = () => {
        if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
        setShowPreview(false);
    };

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) { setStatusLoading(false); return; }
                const resp = await fetch(`${API_URL}/messages/status/${person.id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (resp.ok) {
                    const data = await resp.json();
                    setMessagingStatus(data);
                }
            } catch { /* silent */ } finally {
                setStatusLoading(false);
            }
        };
        fetchStatus();
    }, [person.id]);

    const handleFollow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const token = localStorage.getItem("access_token");
        if (!token) return toast.error("Please login to follow");
        setFollowLoading(true);
        try {
            const endpoint = isFollowing ? `${API_URL}/social/unfollow/${person.id}` : `${API_URL}/social/follow/${person.id}`;
            const resp = await fetch(endpoint, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resp.ok) {
                setIsFollowing(!isFollowing);
                toast.success(isFollowing ? `Unfollowed ${person.name}` : `Following ${person.name}!`);
            } else {
                const data = await resp.json();
                toast.error(data.detail || "Failed");
            }
        } catch { toast.error("Network error. Try again."); }
        finally { setFollowLoading(false); }
    };

    const handleMessage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (messagingStatus && !messagingStatus.can_message) {
            toast.error(messagingStatus.reason === "no_connection"
                ? "Connect with this user first to message them."
                : messagingStatus.reason);
            return;
        }
        navigate(`/messages/${person.id}`);
    };

    const handleConnect = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const token = localStorage.getItem("access_token");
        if (!token) return toast.error("Please login to connect");
        try {
            const resp = await fetch(`${API_URL}/connections/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ receiver_id: person.id, message: "Hi! Let's connect on Nexora." })
            });
            if (resp.ok) {
                toast.success(`Connection request sent to ${person.name}`);
                setMessagingStatus({ can_message: false, reason: "pending_connection" });
            } else {
                const data = await resp.json();
                toast.error(data.detail || "Failed to send request");
            }
        } catch { toast.error("Network error. Try again."); }
    };

    const handleChallenge = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const token = localStorage.getItem("access_token");
        if (!token) return toast.error("Please login to challenge");
        try {
            const resp = await fetch(`${API_URL}/pvp/queue/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ skill_id: person.skills?.[0]?.name || "general", battle_type: "code_challenge" })
            });
            if (resp.ok) {
                toast.success("Joined matchmaking queue!");
                setTimeout(() => navigate("/pvp"), 1500);
            } else {
                const data = await resp.json();
                toast.error(data.detail || "Failed to join queue");
            }
        } catch { toast.error("Network error. Try again."); }
    };

    const initials = person.name
        ? person.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className={`relative overflow-hidden rounded-[2rem] border transition-all cursor-pointer group shadow-xl p-6`}
            style={{
              background: `linear-gradient(135deg, rgba(0,0,0,0.8), rgba(20,20,20,0.9))`,
              borderColor: isHighRank ? theme.primary.replace("rgb", "rgba").replace(")", ", 0.2)") : "rgba(255,255,255,0.05)",
              boxShadow: isHighRank ? `0 10px 30px ${theme.primary.replace("rgb", "rgba").replace(")", ", 0.1)")}` : "none",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => navigate(`/profile/${person.username}`)}
        >
            {/* Hover preview card */}
            <AnimatePresence>
                {showPreview && (
                    <div className="absolute -top-2 right-0 z-50 translate-x-[calc(100%+8px)] hidden lg:block">
                        <UserPreviewCard user={{
                            id: person.id,
                            username: person.username,
                            display_name: person.name,
                            avatar_url: person.avatar,
                            bio: person.bio || person.aiReason,
                            rank: person.rank,
                            level: person.level,
                            prestige: person.prestige || 0,
                            followers_count: person.connections || person.followers_count,
                            skills: person.skills,
                        }} />
                    </div>
                )}
            </AnimatePresence>

            {/* Dynamic Animated background for High Ranks */}
            {isHighRank && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10 group-hover:opacity-20 transition-opacity">
                    <motion.div
                        className="absolute -inset-[100%]"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        style={{ background: `conic-gradient(from 0deg at 50% 50%, transparent, ${theme.primary}, transparent 40%)` }}
                    />
                </div>
            )}

            {/* Header — Avatar & Match Score */}
            <div className="flex items-start justify-between mb-5 relative z-10">
                <div className="flex items-start gap-4">
                    <div className="relative">
                        <RankAura rank={rankStr} size="sm" intensity="high" />
                        <Avatar className={`w-16 h-16 ring-2 transition-transform duration-300 group-hover:scale-110 shadow-2xl`}
                            style={{ ringColor: isHighRank ? theme.primary : 'rgba(255,255,255,0.1)' }}
                        >
                            <AvatarImage src={person.avatar} alt={person.name} className="object-cover" />
                            <AvatarFallback className="bg-gray-800 text-white font-black text-xl">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        {rankInfo.isGrandmaster && (
                            <span className="absolute -top-2 -right-2 text-xl select-none">👑</span>
                        )}
                        {person.onlineStatus === "online" && (
                            <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
                        )}
                    </div>
                    <div>
                        <h3 className={`font-black text-lg leading-tight transition-colors text-white group-hover:text-primary`}>
                            {person.name}
                        </h3>
                        <p className="text-xs text-white/40 font-medium">@{person.username}</p>
                        {person.location && (
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                                <MapPin className="w-2.5 h-2.5" />
                                {person.location}
                            </p>
                        )}
                    </div>
                </div>
                {person.aiMatch && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-tighter h-6">
                        {person.aiMatch}% MATCH
                    </Badge>
                )}
            </div>

            {/* Rank & Level Info */}
            <div className="flex items-center gap-3 mb-5 relative z-10">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-lg">
                        {rankInfo.icon}
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${rankInfo.isGrandmaster ? 'text-gradient-animated' : ''}`} style={{ color: !rankInfo.isGrandmaster ? theme.primary : undefined }}>
                        {rankStr}
                    </div>
                 </div>
                 <div className="h-4 w-px bg-white/5" />
                 <span className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> LV {person.level || 1}
                 </span>
            </div>

            {/* AI Reasoning / Bio */}
            <div className="text-xs text-white/60 mb-5 p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-2 italic leading-relaxed">
                <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">"{person.aiReason || person.bio || 'Highly compatible developer profile detected.'}"</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 relative z-10" onClick={e => e.stopPropagation()}>
                <Button
                    size="sm"
                    variant={isFollowing ? "outline" : "default"}
                    className={`flex-1 rounded-xl font-black uppercase tracking-widest text-[10px] h-9 ${!isFollowing ? 'bg-white text-black hover:bg-white/90 shadow-xl' : 'border-white/10 text-white/70'}`}
                    onClick={handleFollow}
                    disabled={followLoading}
                >
                    {followLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : isFollowing ? "FOLLOWING" : "FOLLOW"}
                </Button>

                {(!messagingStatus || messagingStatus.can_message) ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleMessage}
                        disabled={statusLoading}
                        className="h-9 w-9 rounded-xl border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
                    >
                        <MessageCircle className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={messagingStatus.reason === "pending_connection" ? undefined : handleConnect}
                        disabled={statusLoading || messagingStatus.reason === "pending_connection"}
                        className="h-9 w-9 rounded-xl border-white/10 bg-white/5 text-white/70"
                    >
                        <Users className="w-4 h-4" />
                    </Button>
                )}

                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleChallenge}
                    className="h-9 w-9 rounded-xl border-orange-500/20 bg-orange-500/5 text-orange-400/70 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/40"
                >
                    <Swords className="w-4 h-4" />
                </Button>
            </div>
        </motion.div>
    );
};
