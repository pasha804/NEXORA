import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Heart,
    MessageCircle,
    Share2,
    Bookmark,
    MoreHorizontal,
    ImageIcon,
    Code2,
    Target,
    TrendingUp,
    Filter,
    ArrowRight,
    Flame,
    Zap,
    Sparkles,
    RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFeedStore, type Post } from "@/hooks/useFeedStore";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreatePostModal } from "./CreatePostModal";

export const MainFeed = () => {
    const { posts, setPosts, updatePost } = useFeedStore();
    const [activeTab, setActiveTab] = useState("For You");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

    const { isLoading, refetch } = useQuery({
        queryKey: ["feed", activeTab],
        queryFn: async () => {
            try {
                const response = await fetch(`${API_URL}/posts/feed?limit=20`);
                if (!response.ok) throw new Error("Failed to fetch feed");
                const data = await response.json();

                // Map backend fields to frontend Post type
                const mappedPosts = data.map((p: any) => ({
                    ...p,
                    author_name: p.author?.display_name || p.author?.username || "Unknown",
                    author_username: p.author?.username || "unknown",
                    author_avatar: p.author?.avatar_url,
                    author_id: p.author?.id,
                    skill_tags: p.skill_id ? [p.skill_id] : [],
                    post_type: p.post_type || "text"
                }));

                setPosts(mappedPosts);
                return mappedPosts;
            } catch (error) {
                console.error("Feed fetch error:", error);
                return [];
            }
        },
    });

    const handleLike = async (postId: number) => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_URL}/posts/${postId}/like`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Failed to like post");

            // Refetch to get updated counts
            refetch();
        } catch (error) {
            toast.error("Failed to like post");
        }
    };

    const renderMedia = (post: Post) => {
        if (post.post_type === "image" && post.media_url) {
            return (
                <div className="rounded-xl overflow-hidden mt-3 border border-white/5">
                    <img src={post.media_url} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
                </div>
            );
        }
        if (post.post_type === "code") {
            return (
                <div className="bg-[#0d1117] rounded-xl p-4 mt-3 border border-white/10 font-mono text-sm overflow-x-auto">
                    <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                        <span className="text-xs text-muted-foreground">challenge.ts</span>
                        <Badge variant="outline" className="text-[10px] h-5">TypeScript</Badge>
                    </div>
                    <pre className="text-blue-300">
                        <code>
                            {`interface Node<T> {
  value: T;
  left: Node<T> | null;
  right: Node<T> | null;
}

// Implement insert method...`}
                        </code>
                    </pre>
                </div>
            );
        }
        if (post.post_type === "achievement" && post.achievement) {
            return (
                <div className="mt-3 p-6 rounded-xl bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-40" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="text-6xl">{post.achievement.badge}</div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-yellow-400 mb-1">{post.achievement.title}</h3>
                            <p className="text-sm text-yellow-100/80 flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                +{post.achievement.xpGained} XP Earned
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        if (post.post_type === "poll" && post.poll) {
            return (
                <div className="mt-3 space-y-3">
                    <p className="font-medium">{post.poll.question}</p>
                    {post.poll.options.map((option, i) => {
                        const percentage = (option.votes / post.poll!.totalVotes) * 100;
                        return (
                            <div key={i} className="relative">
                                <Button
                                    variant="outline"
                                    className="w-full justify-between hover:bg-primary/10 group relative overflow-hidden"
                                >
                                    <div
                                        className="absolute left-0 top-0 h-full bg-primary/20 transition-all group-hover:bg-primary/30"
                                        style={{ width: `${percentage}%` }}
                                    />
                                    <span className="relative z-10">{option.text}</span>
                                    <span className="relative z-10 text-xs text-muted-foreground">{percentage.toFixed(0)}%</span>
                                </Button>
                            </div>
                        );
                    })}
                    <p className="text-xs text-muted-foreground">{post.poll.totalVotes} votes</p>
                </div>
            );
        }
        if (post.post_type === "learning" && post.learning) {
            return (
                <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Target className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-blue-100">{post.learning.skill}</h4>
                            <p className="text-xs text-blue-300/70">{post.learning.milestone}</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-blue-200">Progress</span>
                            <span className="text-blue-400 font-bold">{post.learning.progress}%</span>
                        </div>
                        <Progress value={post.learning.progress} className="h-2" />
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Create Post Input Trigger */}
            <div className="glass-card p-4 flex gap-4 items-center">
                <Avatar>
                    <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div 
                    className="flex-1 bg-muted/50 rounded-full h-10 px-4 flex items-center text-muted-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => setShowCreateModal(true)}
                >
                    Start a post...
                </div>
                <Button size="icon" variant="ghost" className="text-blue-400" onClick={() => setShowCreateModal(true)}>
                    <ImageIcon className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="ghost" className="text-purple-400" onClick={() => setShowCreateModal(true)}>
                    <Code2 className="w-5 h-5" />
                </Button>
            </div>

            {/* Create Post Modal */}
            <CreatePostModal 
                open={showCreateModal} 
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    // Refetch feed after successful post
                    refetch();
                }}
            />

            {/* AI Feed Sort/Filter */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scroll-container">
                    {["For You", "Following", "Trending", "DevLog", "Discussions"].map((tab) => (
                        <Badge
                            key={tab}
                            variant={activeTab === tab ? "default" : "secondary"}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 cursor-pointer transition-all ${activeTab === tab
                                ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105"
                                : "bg-white/5 hover:bg-white/10 text-muted-foreground"
                                }`}
                        >
                            {tab}
                            {tab === "For You" && <Sparkles className="w-3 h-3 ml-1 fill-current" />}
                        </Badge>
                    ))}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => refetch()}
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {posts.length === 0 && !isLoading && (
                        <div className="text-center py-20 glass-card">
                            <p className="text-muted-foreground italic">No posts found for this category.</p>
                        </div>
                    )}
                    {posts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-0 overflow-hidden"
                        >
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="cursor-pointer">
                                            <AvatarFallback>{post.author_name?.[0] || 'U'}</AvatarFallback>
                                            <AvatarImage src={post.author_avatar} />
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-sm hover:underline cursor-pointer">{post.author_name}</h4>
                                                {post.likes_count > 100 && (
                                                    <Badge variant="secondary" className="h-4 p-0 px-1 bg-orange-500/20 text-orange-500 border-0 flex items-center gap-0.5 animate-pulse">
                                                        <Flame className="w-2.5 h-2.5 fill-current" />
                                                        <span className="text-[8px] font-black italic">VIRAL</span>
                                                    </Badge>
                                                )}
                                                {post.post_type === "code" && <Badge className="h-4 text-[10px] px-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">Official</Badge>}
                                            </div>
                                            <p className="text-xs text-muted-foreground">@{post.author_username} • {post.created_at}</p>
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </div>

                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {post.content}
                                </p>

                                {renderMedia(post)}

                                <div className="flex flex-wrap gap-2 mt-3">
                                    {post.skill_tags.map(tag => (
                                        <span key={tag} className="text-xs text-primary cursor-pointer hover:underline">#{tag}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-4 py-3 border-t border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleLike(Number(post.id))}
                                        className="hover:text-red-500 hover:bg-red-500/10 gap-2 transition-all active:scale-95"
                                    >
                                        <Heart className={`w-4 h-4 ${post.likes_count > 100 ? 'fill-red-500 text-red-500' : ''}`} />
                                        <span className="text-xs font-medium">{post.likes_count}</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="hover:text-blue-500 hover:bg-blue-500/10 gap-2 transition-all">
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="text-xs font-medium">{post.comments_count}</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="hover:text-green-500 hover:bg-green-500/10">
                                        <Share2 className="w-4 h-4" />
                                    </Button>

                                    {post.likes_count > 50 && (
                                        <div className="hidden sm:flex items-center gap-1.5 ml-4 text-[10px] font-bold text-primary/60 uppercase tracking-tighter">
                                            <Zap className="w-3 h-3 fill-current animate-bounce" />
                                            Viral Velocity: High
                                        </div>
                                    )}
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Bookmark className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="py-8 text-center text-muted-foreground text-sm">
                {isLoading ? (
                    <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : posts.length > 0 ? (
                    <p className="text-xs opacity-50">You're all caught up ✓</p>
                ) : null}
            </div>
        </div>
    );
};
