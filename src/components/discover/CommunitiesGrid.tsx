import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Lock, Globe, Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CommunitiesGridProps {
    searchQuery: string;
    filters: any;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

export const CommunitiesGrid = ({ searchQuery, filters }: CommunitiesGridProps) => {
    const navigate = useNavigate();
    const [communities, setCommunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCommunities = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("access_token");
                const params = new URLSearchParams({ limit: "20", offset: "0" });
                if (searchQuery.trim()) params.set("q", searchQuery.trim());

                const resp = await fetch(`${API_URL}/communities/?${params}`, {
                    headers: token ? { "Authorization": `Bearer ${token}` } : {}
                });
                if (resp.ok) {
                    const data = await resp.json();
                    setCommunities(data.communities || data || []);
                }
            } catch (err) {
                console.error("Fetch communities error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCommunities();
    }, [searchQuery]);

    const handleJoin = async (e: React.MouseEvent, communityId: number) => {
        e.stopPropagation();
        const token = localStorage.getItem("access_token");
        if (!token) return toast.error("Please login to join communities");
        try {
            const resp = await fetch(`${API_URL}/communities/${communityId}/join`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resp.ok) {
                toast.success("Joined community!");
                navigate(`/communities`);
            } else {
                const data = await resp.json();
                toast.error(data.detail || "Failed to join");
            }
        } catch { toast.error("Network error"); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-display text-xl font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        Communities
                    </h2>
                    <p className="text-sm text-muted-foreground">Skill-based groups and learning circles</p>
                </div>
                <Button size="sm" className="gap-2" onClick={() => navigate("/communities")}>
                    <Plus className="w-4 h-4" />
                    Browse All
                </Button>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="glass-card p-6 animate-pulse space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-muted/50" />
                            <div className="h-4 bg-muted/50 rounded w-3/4" />
                            <div className="h-3 bg-muted/50 rounded" />
                            <div className="h-3 bg-muted/50 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : communities.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center"
                >
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium">No communities yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Be the first to create one!</p>
                    <Button className="mt-4 gap-2" onClick={() => navigate("/communities")}>
                        <Plus className="w-4 h-4" />
                        Create Community
                    </Button>
                </motion.div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {communities.map((community, i) => (
                        <motion.div
                            key={community.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            whileHover={{ y: -4 }}
                            className="glass-card p-6 cursor-pointer hover:border-primary/50 transition-all group"
                            onClick={() => navigate(`/communities`)}
                        >
                            {/* Community Banner */}
                            <div
                                className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-lg shadow-lg"
                                style={{ background: community.theme_color || "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                            >
                                {community.logo_url
                                    ? <img src={community.logo_url} alt={community.name} className="w-full h-full rounded-xl object-cover" />
                                    : community.name?.[0]?.toUpperCase()}
                            </div>

                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold group-hover:text-primary transition-colors leading-tight">
                                    {community.name}
                                </h3>
                                {community.privacy === "private"
                                    ? <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                    : <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />}
                            </div>

                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                {community.description || "A skill-based community on Nexora"}
                            </p>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    <Users className="w-3 h-3 inline mr-1" />
                                    {community.member_count || 0} members
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs hover:bg-primary hover:text-primary-foreground transition-all"
                                    onClick={(e) => handleJoin(e, community.id)}
                                >
                                    Join
                                </Button>
                            </div>

                            {community.tags && community.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                    {community.tags.slice(0, 3).map((tag: string) => (
                                        <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
