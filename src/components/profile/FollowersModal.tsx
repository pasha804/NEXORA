import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, UserPlus, UserCheck, MessageCircle, Loader2, Users, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

interface FollowUser {
    id: number;
    username: string;
    display_name: string;
    avatar_url?: string;
    bio?: string;
    is_verified?: boolean;
    rank?: string;
    level?: number;
    followers_count?: number;
    skills?: { name: string; level: number }[];
    is_following?: boolean;
}

interface FollowersModalProps {
    open: boolean;
    onClose: () => void;
    userId: number;
    initialTab?: "followers" | "following";
    followersCount?: number;
    followingCount?: number;
    isOwnProfile?: boolean;
}

export const FollowersModal = ({
    open,
    onClose,
    userId,
    initialTab = "followers",
    followersCount = 0,
    followingCount = 0,
    isOwnProfile = false,
}: FollowersModalProps) => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [tab, setTab] = useState<"followers" | "following">(initialTab);
    const [users, setUsers] = useState<FollowUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({});
    const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});

    const fetchUsers = useCallback(async () => {
        if (!open) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const endpoint = tab === "followers"
                ? `${API_URL}/social/followers/${userId}?limit=50`
                : `${API_URL}/social/following/${userId}?limit=50`;

            const resp = await fetch(endpoint, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (resp.ok) {
                const data: FollowUser[] = await resp.json();
                setUsers(data);
                // Build following map from response
                const map: Record<number, boolean> = {};
                data.forEach(u => { map[u.id] = u.is_following ?? false; });
                setFollowingMap(map);
            }
        } catch (err) {
            console.error("Fetch followers error:", err);
        } finally {
            setLoading(false);
        }
    }, [open, tab, userId]);

    useEffect(() => {
        if (open) {
            setTab(initialTab);
            setSearch("");
        }
    }, [open, initialTab]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleFollow = async (targetId: number, targetName: string) => {
        const token = localStorage.getItem("access_token");
        if (!token) return toast.error("Please login");

        setLoadingMap(prev => ({ ...prev, [targetId]: true }));
        const isFollowing = followingMap[targetId];

        try {
            const endpoint = isFollowing
                ? `${API_URL}/social/unfollow/${targetId}`
                : `${API_URL}/social/follow/${targetId}`;
            const resp = await fetch(endpoint, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resp.ok) {
                setFollowingMap(prev => ({ ...prev, [targetId]: !isFollowing }));
                toast.success(isFollowing ? `Unfollowed ${targetName}` : `Following ${targetName}!`);
            } else {
                const data = await resp.json();
                toast.error(data.detail || "Failed");
            }
        } catch { toast.error("Network error"); }
        finally { setLoadingMap(prev => ({ ...prev, [targetId]: false })); }
    };

    const handleRemoveFollower = async (followerId: number, followerName: string) => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        try {
            const resp = await fetch(`${API_URL}/social/followers/${followerId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resp.ok) {
                setUsers(prev => prev.filter(u => u.id !== followerId));
                toast.success(`Removed ${followerName} from followers`);
            }
        } catch { toast.error("Network error"); }
    };

    const filtered = users.filter(u =>
        !search ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.display_name.toLowerCase().includes(search.toLowerCase())
    );

    if (!open) return null;

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col pointer-events-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 shrink-0">
                                <div className="flex gap-1 p-1 bg-muted/30 rounded-xl">
                                    <button
                                        onClick={() => setTab("followers")}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                            tab === "followers"
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Followers
                                        <span className="ml-1.5 text-xs opacity-70">
                                            {followersCount.toLocaleString()}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setTab("following")}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                            tab === "following"
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Following
                                        <span className="ml-1.5 text-xs opacity-70">
                                            {followingCount.toLocaleString()}
                                        </span>
                                    </button>
                                </div>
                                <Button size="icon" variant="ghost" onClick={onClose}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Search */}
                            <div className="px-5 py-3 border-b border-border/30 shrink-0">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        className="w-full bg-muted/30 border border-border/50 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Users className="w-12 h-12 text-muted-foreground/20 mb-3" />
                                        <p className="text-muted-foreground text-sm">
                                            {search ? `No results for "${search}"` : `No ${tab} yet`}
                                        </p>
                                    </div>
                                ) : (
                                    filtered.map(person => (
                                        <motion.div
                                            key={person.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all group"
                                        >
                                            {/* Avatar */}
                                            <div
                                                className="relative cursor-pointer shrink-0"
                                                onClick={() => { navigate(`/profile/${person.username}`); onClose(); }}
                                            >
                                                <Avatar className="w-12 h-12 ring-2 ring-primary/10 group-hover:ring-primary/40 transition-all">
                                                    <AvatarImage src={person.avatar_url} />
                                                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-bold">
                                                        {person.display_name?.[0]?.toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>

                                            {/* Info */}
                                            <div
                                                className="flex-1 min-w-0 cursor-pointer"
                                                onClick={() => { navigate(`/profile/${person.username}`); onClose(); }}
                                            >
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                                                        {person.display_name}
                                                    </span>
                                                    {person.is_verified && (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                                    )}
                                                    {person.rank && (
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-yellow-500/30 text-yellow-400 shrink-0">
                                                            {person.rank}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">@{person.username}</p>
                                                {person.bio && (
                                                    <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{person.bio}</p>
                                                )}
                                                {person.skills && person.skills.length > 0 && (
                                                    <div className="flex gap-1 mt-1 flex-wrap">
                                                        {person.skills.slice(0, 2).map(s => (
                                                            <span key={s.name} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                                                {s.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-1.5 shrink-0">
                                                {/* Don't show follow button for self */}
                                                {person.id !== currentUser?.id && (
                                                    <Button
                                                        size="sm"
                                                        variant={followingMap[person.id] ? "outline" : "default"}
                                                        className="h-8 px-3 text-xs"
                                                        onClick={() => handleFollow(person.id, person.display_name)}
                                                        disabled={loadingMap[person.id]}
                                                    >
                                                        {loadingMap[person.id] ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : followingMap[person.id] ? (
                                                            <><UserCheck className="w-3 h-3 mr-1" />Following</>
                                                        ) : (
                                                            <><UserPlus className="w-3 h-3 mr-1" />Follow</>
                                                        )}
                                                    </Button>
                                                )}

                                                {/* Remove follower button (own profile, followers tab) */}
                                                {isOwnProfile && tab === "followers" && person.id !== currentUser?.id && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                                                        onClick={() => handleRemoveFollower(person.id, person.display_name)}
                                                        title="Remove follower"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
