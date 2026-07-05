import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    TrendingUp,
    Eye,
    Heart,
    MessageCircle,
    Share2,
    Bookmark,
    Play,
    Flame,
    Zap,
    Award,
    Clock
} from "lucide-react";
import { toast } from "sonner";

interface TrendingContent {
    id: string;
    type: "video" | "article" | "tutorial" | "discussion" | "showcase";
    title: string;
    description: string;
    author: {
        name: string;
        avatar?: string;
        verified: boolean;
    };
    thumbnail?: string;
    tags: string[];
    stats: {
        views: number;
        likes: number;
        comments: number;
        shares: number;
    };
    trendingScore: number;
    timeAgo: string;
    duration?: string;
    featured: boolean;
}

interface TrendingContentProps {
    searchQuery: string;
    filters: any;
}

export const TrendingContent = ({ searchQuery, filters }: TrendingContentProps) => {
    const [filter, setFilter] = useState<"all" | "videos" | "articles" | "discussions">("all");
    const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("today");
    const [trendingContent, setTrendingContent] = useState<TrendingContent[]>([]);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const resp = await fetch(`${API_URL}/social/feed/trending`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (resp.ok) {
                    const data = await resp.json();
                    setTrendingContent(data.posts || []);
                }
            } catch (err) {
                console.error("Fetch trending error:", err);
            }
        };
        fetchTrending();
    }, []);

    const filteredContent = trendingContent.filter(content => {
        if (filter === "all") return true;
        if (filter === "videos") return content.type === "video";
        if (filter === "articles") return content.type === "article" || content.type === "tutorial";
        if (filter === "discussions") return content.type === "discussion";
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card p-4 border border-red-500/30 bg-gradient-to-r from-red-500/5 to-orange-500/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Flame className="w-5 h-5 text-red-400" />
                        <div>
                            <h3 className="font-bold text-sm">Trending Now</h3>
                            <p className="text-xs text-muted-foreground">
                                {filteredContent.length} viral posts • Updated 2m ago
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-400 border-red-500/30">
                            <Zap className="w-3 h-3 mr-1" />
                            Live
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={filter === "all" ? "default" : "outline"}
                        onClick={() => setFilter("all")}
                    >
                        All Content
                    </Button>
                    <Button
                        size="sm"
                        variant={filter === "videos" ? "default" : "outline"}
                        onClick={() => setFilter("videos")}
                    >
                        <Play className="w-3 h-3 mr-1" />
                        Videos
                    </Button>
                    <Button
                        size="sm"
                        variant={filter === "articles" ? "default" : "outline"}
                        onClick={() => setFilter("articles")}
                    >
                        Articles
                    </Button>
                    <Button
                        size="sm"
                        variant={filter === "discussions" ? "default" : "outline"}
                        onClick={() => setFilter("discussions")}
                    >
                        Discussions
                    </Button>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={timeRange === "today" ? "default" : "outline"}
                        onClick={() => setTimeRange("today")}
                    >
                        Today
                    </Button>
                    <Button
                        size="sm"
                        variant={timeRange === "week" ? "default" : "outline"}
                        onClick={() => setTimeRange("week")}
                    >
                        This Week
                    </Button>
                    <Button
                        size="sm"
                        variant={timeRange === "month" ? "default" : "outline"}
                        onClick={() => setTimeRange("month")}
                    >
                        This Month
                    </Button>
                </div>
            </div>

            {/* Top 3 Viral */}
            <div>
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Top 3 Viral Today
                </h2>
                <div className="space-y-4">
                    {filteredContent.slice(0, 3).map((content, i) => (
                        <TrendingCard key={content.id} content={content} index={i} rank={i + 1} />
                    ))}
                </div>
            </div>

            {/* All Trending */}
            <div>
                <h2 className="font-bold text-lg mb-4">Trending Content</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    {filteredContent.slice(3).map((content, i) => (
                        <TrendingCard key={content.id} content={content} index={i + 3} compact />
                    ))}
                </div>
            </div>
        </div>
    );
};

const TrendingCard = ({
    content,
    index,
    rank,
    compact = false
}: {
    content: TrendingContent;
    index: number;
    rank?: number;
    compact?: boolean;
}) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likes, setLikes] = useState(content.stats.likes);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);
        toast.success(isLiked ? "Removed from likes" : "Liked!");
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        toast.success(isBookmarked ? "Removed from saved" : "Saved to collection");
    };

    const handleShare = () => {
        toast.success("Link copied to clipboard!");
    };

    const getTypeIcon = () => {
        switch (content.type) {
            case "video": return <Play className="w-4 h-4" />;
            case "article": return <MessageCircle className="w-4 h-4" />;
            case "tutorial": return <Award className="w-4 h-4" />;
            default: return null;
        }
    };

    const getTypeColor = () => {
        switch (content.type) {
            case "video": return "border-red-500/30 bg-red-500/10 text-red-400";
            case "article": return "border-blue-500/30 bg-blue-500/10 text-blue-400";
            case "tutorial": return "border-purple-500/30 bg-purple-500/10 text-purple-400";
            case "discussion": return "border-green-500/30 bg-green-500/10 text-green-400";
            default: return "";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`glass-card p-5 hover:border-red-500/50 transition-all group ${content.featured ? "border-red-500/30" : ""}`}
        >
            {/* Rank Badge for Top 3 */}
            {rank && (
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-lg shadow-lg border-2 border-background">
                    #{rank}
                </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-sm">
                        {content.author.name[0]}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm truncate">{content.author.name}</h4>
                        {content.author.verified && (
                            <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-primary/20 text-primary">
                                ✓
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{content.timeAgo}</span>
                    </div>
                </div>
                <button
                    onClick={handleBookmark}
                    className={`transition-colors ${isBookmarked ? "text-yellow-400" : "text-muted-foreground hover:text-yellow-400"}`}
                >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                </button>
            </div>

            {/* Thumbnail (for videos) */}
            {content.type === "video" && !compact && (
                <div className="relative mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 aspect-video flex items-center justify-center">
                    <Play className="w-16 h-16 text-white opacity-80" />
                    {content.duration && (
                        <Badge className="absolute bottom-2 right-2 bg-black/80 text-white text-xs">
                            {content.duration}
                        </Badge>
                    )}
                </div>
            )}

            {/* Title & Description */}
            <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={`text-xs ${getTypeColor()}`}>
                        {getTypeIcon()}
                        <span className="ml-1 capitalize">{content.type}</span>
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-red-400 font-bold">
                        <TrendingUp className="w-3 h-3" />
                        {content.trendingScore}
                    </div>
                </div>
                <h3 className={`font-bold ${compact ? "text-base" : "text-lg"} mb-2 group-hover:text-primary transition-colors`}>
                    {content.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{content.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
                {content.tags.slice(0, compact ? 2 : 4).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                        #{tag}
                    </Badge>
                ))}
            </div>

            {/* Stats & Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span className="font-bold">{formatNumber(content.stats.views)}</span>
                    </div>
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1 transition-colors ${isLiked ? "text-red-400" : "hover:text-red-400"}`}
                    >
                        <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                        <span className="font-bold">{formatNumber(likes)}</span>
                    </button>
                    <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-bold">{formatNumber(content.stats.comments)}</span>
                    </div>
                </div>
                <Button size="sm" variant="ghost" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                </Button>
            </div>
        </motion.div>
    );
};

// Helper function
const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
};
