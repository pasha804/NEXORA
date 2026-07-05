import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Grid, MonitorPlay, Briefcase, Bookmark, Heart, MessageCircle, Share2, Loader2 } from "lucide-react";
import { ProfessionalPortfolio } from "./ProfessionalPortfolio";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const formatRelativeTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
};

export const ContentShowcase = ({ profile }: { profile: any }) => {
    const [posts, setPosts] = useState<any[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("portfolio");

    // Fetch posts only when Posts tab is first selected
    useEffect(() => {
        if (activeTab !== "posts" || !profile?.id) return;
        if (posts.length > 0) return; // already loaded

        const fetchPosts = async () => {
            setPostsLoading(true);
            try {
                const token = localStorage.getItem("access_token");
                const resp = await fetch(`${API_URL}/social/posts?author_id=${profile.id}&limit=12`, {
                    headers: token ? { "Authorization": `Bearer ${token}` } : {}
                });
                if (resp.ok) {
                    const data = await resp.json();
                    setPosts(data.posts || data || []);
                }
            } catch { /* silent */ }
            finally { setPostsLoading(false); }
        };
        fetchPosts();
    }, [activeTab, profile?.id, posts.length]);

    return (
        <Tabs defaultValue="portfolio" className="w-full" onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-muted/30 p-1">
                    <TabsTrigger value="portfolio" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Briefcase className="w-4 h-4" />
                        Portfolio
                    </TabsTrigger>
                    <TabsTrigger value="posts" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Grid className="w-4 h-4" />
                        Posts
                    </TabsTrigger>
                    <TabsTrigger value="reels" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <MonitorPlay className="w-4 h-4" />
                        Reels
                    </TabsTrigger>
                    <TabsTrigger value="saved" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Bookmark className="w-4 h-4" />
                        Saved
                    </TabsTrigger>
                </TabsList>
            </div>

            {/* Portfolio tab */}
            <TabsContent value="portfolio" className="mt-0 space-y-6">
                <ProfessionalPortfolio profile={profile} />
            </TabsContent>

            {/* Posts tab */}
            <TabsContent value="posts">
                {postsLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                        <span className="text-muted-foreground text-sm">Loading posts…</span>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl bg-muted/5">
                        <Grid className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No posts yet</p>
                        <p className="text-xs mt-1 opacity-60">Shared posts will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post, i) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="glass-card p-5 hover:border-primary/30 transition-all"
                            >
                                {/* Post Header */}
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar className="w-9 h-9">
                                        <AvatarImage src={profile.avatar_url} />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs">
                                            {profile.display_name?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm">{profile.display_name || profile.username}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {post.created_at ? formatRelativeTime(post.created_at) : ""}
                                        </p>
                                    </div>
                                    {post.skill_tags && post.skill_tags.length > 0 && (
                                        <Badge variant="outline" className="text-xs shrink-0">
                                            {post.skill_tags[0]}
                                        </Badge>
                                    )}
                                </div>

                                {/* Post content */}
                                {post.title && (
                                    <h4 className="font-bold mb-1.5">{post.title}</h4>
                                )}
                                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line mb-3">
                                    {post.content}
                                </p>

                                {/* Media preview */}
                                {post.media_url && (
                                    <div className="rounded-xl overflow-hidden mb-3 bg-muted/30">
                                        <img
                                            src={post.media_url}
                                            alt="Post media"
                                            className="w-full max-h-72 object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                        />
                                    </div>
                                )}

                                {/* Engagement Row */}
                                <div className="flex items-center gap-5 text-sm text-muted-foreground pt-2 border-t border-border/30">
                                    <button className="flex items-center gap-1.5 hover:text-red-400 transition-colors group">
                                        <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        <span>{post.likes_count ?? 0}</span>
                                    </button>
                                    <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                                        <MessageCircle className="w-4 h-4" />
                                        <span>{post.comments_count ?? 0}</span>
                                    </button>
                                    <button className="flex items-center gap-1.5 hover:text-green-400 transition-colors ml-auto">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </TabsContent>

            {/* Reels tab */}
            <TabsContent value="reels">
                <div className="py-12 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl bg-muted/5">
                    <MonitorPlay className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No reels published</p>
                    <p className="text-xs mt-1 opacity-60">Short skill videos will appear here</p>
                </div>
            </TabsContent>

            {/* Saved tab */}
            <TabsContent value="saved">
                <div className="py-12 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl bg-muted/5">
                    <Bookmark className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No saved content</p>
                    <p className="text-xs mt-1 opacity-60">Bookmarked posts and reels appear here</p>
                </div>
            </TabsContent>
        </Tabs>
    );
};
