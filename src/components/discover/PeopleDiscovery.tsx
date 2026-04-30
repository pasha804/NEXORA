import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import {
    UserPlus,
    UserCheck,
    MessageCircle,
    Swords,
    MapPin,
    Sparkles,
    Trophy,
    Users,
    ChevronDown,
    Loader2
} from "lucide-react";
import { toast } from "sonner";

interface PeopleDiscoveryProps {
    searchQuery: string;
    filters: any;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

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
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
                const data = await resp.json();
                console.log("[DISCOVER] Data:", data);
                const users = data.users || [];
                console.log("[DISCOVER] Users count:", users.length);
                if (isFirstPage) {
                    setPeople(users);
                } else {
                    setPeople(prev => [...prev, ...users]);
                }
                setHasMore(data.has_next || false);
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
        
        const filterParams: FilterParams = { sort: activeFilters.sort || "newest" };
        
        // Parse skill from search query (e.g., "React Developer" -> skill: "React")
        if (searchQuery) {
            const skillCategories = ["React", "Python", "AI", "ML", "Machine Learning", "DevOps", "UI", "UX", "Mobile", "Cloud", "Data", "Security", "Blockchain", "Full Stack"];
            const matchedCategory = skillCategories.find(cat => 
                searchQuery.toLowerCase().includes(cat.toLowerCase())
            );
            if (matchedCategory) {
                filterParams.skill = matchedCategory;
            }
            
            const categories = ["Frontend", "Backend", "AI/ML", "DevOps", "Design", "Mobile", "Cybersecurity"];
            const matchedCat = categories.find(cat => 
                searchQuery.toLowerCase().includes(cat.toLowerCase())
            );
            if (matchedCat) {
                filterParams.category = matchedCat;
            }
        }
        
        setActiveFilters(prev => ({ ...prev, ...filterParams }));
        
        debounceRef.current = setTimeout(() => {
            setPage(1);
            fetchPeople(1, searchQuery, filterParams);
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery, fetchPeople]);

    // Handle filter changes from DiscoverHeader
    useEffect(() => {
        if (filters && Object.keys(filters).length > 0) {
            const newFilters: FilterParams = { ...activeFilters };
            
            if (filters.skillLevel?.length) {
                newFilters.skill = filters.skillLevel[0];
            }
            if (filters.industry?.length) {
                newFilters.category = filters.industry[0];
            }
            if (filters.recent) {
                newFilters.sort = "most_active";
            }
            if (filters.popularity) {
                if (filters.popularity === "Trending") newFilters.sort = "most_followed";
                else if (filters.popularity === "Popular") newFilters.sort = "xp_high";
            }
            
            setActiveFilters(newFilters);
            fetchPeople(1, searchQuery, newFilters);
        }
    }, [filters]);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPeople(nextPage, searchQuery, activeFilters);
        }
    };

    return (
        <div className="space-y-6">
            {/* AI Matching Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 border border-primary/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{searchQuery ? "Search Results" : "AI-Powered Matching"}</h3>
                        <p className="text-xs text-muted-foreground">
                            {loading
                                ? "Scanning the nexus..."
                                : `${people.length} ${people.length === 1 ? "person" : "people"} found${searchQuery ? ` for "${searchQuery}"` : ""}`}
                        </p>
                    </div>
                </div>
            </motion.div>

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
                            onClick={() => {
                                setPage(1);
                                fetchPeople(1, "", { sort: "newest" });
                            }}
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
                                aiMatch: person.ai_match_score || (Math.floor(Math.random() * 20) + 75), // Fallback for demo
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
    const [messagingStatus, setMessagingStatus] = useState<{ can_message: boolean; reason: string } | null>(null);
    const [statusLoading, setStatusLoading] = useState(true);

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
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass-card p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group"
            onClick={() => navigate(`/profile/${person.username}`)}
        >
            {/* Header — Avatar & Match Score */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                    <div className="relative">
                        <Avatar className="w-16 h-16 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                            <AvatarImage src={person.avatar} alt={person.name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-bold text-lg">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        {person.onlineStatus === "online" && (
                            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold group-hover:text-primary transition-colors leading-tight">
                            {person.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">@{person.username}</p>
                        {person.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                {person.location}
                            </p>
                        )}
                    </div>
                </div>
                {person.aiMatch && (
                    <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-xs shrink-0">
                        {person.aiMatch}% Match
                    </Badge>
                )}
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                {person.rank && (
                    <div className="flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-yellow-400" />
                        <span className="font-semibold text-foreground">{person.rank}</span>
                    </div>
                )}
                <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-400" />
                    <span>{person.connections || 0} connections</span>
                </div>
                {person.mutualConnections > 0 && (
                    <span className="text-primary font-medium">{person.mutualConnections} mutual</span>
                )}
            </div>

            {/* Skills */}
            {person.skills && person.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {person.skills.slice(0, 3).map((skill: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs hover:border-primary/50 transition-colors">
                            {skill.name || skill}
                        </Badge>
                    ))}
                    {person.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                            +{person.skills.length - 3}
                        </Badge>
                    )}
                </div>
            )}

            {/* AI Reasoning */}
            <div className="text-xs text-muted-foreground mb-4 p-2.5 rounded-lg bg-primary/5 border border-primary/15 flex items-start gap-2">
                <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{person.aiReason}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <Button
                    size="sm"
                    variant={isFollowing ? "outline" : "default"}
                    className="flex-1 transition-all"
                    onClick={handleFollow}
                    disabled={followLoading}
                >
                    {followLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isFollowing ? (
                        <><UserCheck className="w-3 h-3 mr-1" />Following</>
                    ) : (
                        <><UserPlus className="w-3 h-3 mr-1" />Follow</>
                    )}
                </Button>

                {(!messagingStatus || messagingStatus.can_message) ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleMessage}
                        disabled={statusLoading}
                        className="hover:border-blue-500/50 hover:text-blue-400 transition-all"
                        title="Message"
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={messagingStatus.reason === "pending_connection" ? undefined : handleConnect}
                        disabled={statusLoading || messagingStatus.reason === "pending_connection"}
                        className={
                            messagingStatus.reason === "pending_connection"
                                ? "opacity-50 cursor-not-allowed"
                                : "border-primary/30 hover:bg-primary/10 transition-all"
                        }
                        title={messagingStatus.reason === "pending_connection" ? "Request Pending" : "Send Connection Request"}
                    >
                        {messagingStatus.reason === "pending_connection" ? "Pending" : "Connect"}
                    </Button>
                )}

                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleChallenge}
                    className="border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500/60 hover:text-orange-400 transition-all"
                    title="Challenge to PvP"
                >
                    <Swords className="w-3.5 h-3.5" />
                </Button>
            </div>
        </motion.div>
    );
};
