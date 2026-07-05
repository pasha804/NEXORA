import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Heart, Flag, MessageCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReelStore } from "@/hooks/useReelStore";

interface Comment {
    id: string;
    user: {
        username: string;
        avatarUrl: string;
        isVerified?: boolean;
    };
    content: string;
    likes: number;
    timestamp: string;
    isLiked: boolean;
}

interface ReelCommentsProps {
    isOpen: boolean;
    onClose: () => void;
    reelId: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const ReelComments = ({ isOpen, onClose, reelId }: ReelCommentsProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const updateReelComments = useReelStore((s) => s.updateReelComments);

    useEffect(() => {
        if (isOpen && reelId) {
            fetchComments();
        }
    }, [isOpen, reelId]);

    const fetchComments = async () => {
        const token = localStorage.getItem("access_token");
        try {
            const resp = await fetch(`${API_URL}/reels/${reelId}/comments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (resp.ok) {
                const data = await resp.json();
                setComments(data.map((c: any) => ({
                    id: String(c.id),
                    user: {
                        username: c.user?.username || "anonymous",
                        avatarUrl: c.user?.avatar_url || "",
                        isVerified: c.user?.is_verified || false,
                    },
                    content: c.content,
                    likes: c.likes_count || 0,
                    timestamp: new Date(c.created_at).toLocaleDateString(),
                    isLiked: c.is_liked || false,
                })));
            }
        } catch (err) {
            console.error("Failed to fetch comments:", err);
        }
    };

    const handleSend = async () => {
        if (!newComment.trim()) return;
        const token = localStorage.getItem("access_token");

        try {
            const resp = await fetch(`${API_URL}/reels/${reelId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (resp.ok) {
                const c = await resp.json();
                const newCommentObj: Comment = {
                    id: String(c.id),
                    user: {
                        username: c.user?.username || "You",
                        avatarUrl: c.user?.avatar_url || "",
                        isVerified: c.user?.is_verified || false,
                    },
                    content: c.content,
                    likes: c.likes_count || 0,
                    timestamp: "Just now",
                    isLiked: false,
                };
                setComments([newCommentObj, ...comments]);
                updateReelComments(reelId, 1);
                setNewComment("");
            }
        } catch (err) {
            console.error("Failed to post comment:", err);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-md bg-zinc-950 border-l border-white/10 p-0 flex flex-col text-white">
                <SheetHeader className="p-4 border-b border-white/10">
                    <SheetTitle className="text-white">Comments ({comments.length})</SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-6">
                        {comments.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
                                <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
                                <p>No comments yet. Be the first to comment!</p>
                            </div>
                        ) : comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 group">
                                <Avatar className="w-8 h-8 border border-white/10">
                                    <AvatarImage src={comment.user.avatarUrl} />
                                    <AvatarFallback>{comment.user.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-white/90">
                                            @{comment.user.username}
                                        </span>
                                        {comment.user.isVerified && (
                                            <span className="text-[9px] bg-blue-500 text-white px-1 rounded-full">✓</span>
                                        )}
                                        <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-white/80 leading-snug">{comment.content}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <button className="text-xs text-muted-foreground hover:text-white font-medium">Reply</button>
                                        <button className="text-xs text-muted-foreground hover:text-red-400 group-hover:opacity-100 opacity-0 transition-opacity">
                                            <Flag className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <button className="text-muted-foreground hover:text-red-500 transition-colors">
                                        <Heart className={`w-4 h-4 ${comment.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                                    </button>
                                    <span className="text-[10px] text-muted-foreground">{comment.likes}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-white/10 bg-zinc-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback>ME</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 relative">
                            <Input
                                placeholder="Add a comment..."
                                className="bg-white/5 border-white/10 rounded-full pr-10 focus:border-primary/50 text-sm h-10"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-1 top-1 p-1.5 text-primary hover:text-primary/80 transition-colors bg-primary/10 rounded-full"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
