import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, Image, Code2, Link2, Loader2, Send, AtSign, Hash, 
    BarChart3, Trophy, Target, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

interface CreatePostModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type PostType = "text" | "image" | "code" | "poll" | "achievement" | "learning";

const POST_TYPES: { id: PostType; label: string; icon: React.ElementType; color: string }[] = [
    { id: "text", label: "Text", icon: null, color: "" },
    { id: "image", label: "Image", icon: Image, color: "text-green-400" },
    { id: "code", label: "Code", icon: Code2, color: "text-blue-400" },
    { id: "poll", label: "Poll", icon: BarChart3, color: "text-purple-400" },
    { id: "achievement", label: "Achievement", icon: Trophy, color: "text-yellow-400" },
    { id: "learning", label: "Learning", icon: Target, color: "text-cyan-400" },
];

export const CreatePostModal = ({ open, onClose, onSuccess }: CreatePostModalProps) => {
    const { user } = useAuth();
    const [postType, setPostType] = useState<PostType>("text");
    const [content, setContent] = useState("");
    const [mediaUrl, setMediaUrl] = useState("");
    const [skillTags, setSkillTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [posting, setPosting] = useState(false);
    const [showPoll, setShowPoll] = useState(false);
    const [pollOptions, setPollOptions] = useState(["", ""]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePost = async () => {
        if (!content.trim()) return toast.error("Post cannot be empty");
        
        const token = localStorage.getItem("access_token");
        if (!token) {
            toast.error("Please login to post");
            return;
        }

        setPosting(true);
        try {
            const payload: Record<string, any> = {
                content: content.trim(),
                post_type: postType,
            };

            if (mediaUrl) payload.media_url = mediaUrl;
            if (skillTags.length > 0) payload.skill_tags = skillTags;
            
            if (postType === "poll" && showPoll) {
                const validOptions = pollOptions.filter(o => o.trim());
                if (validOptions.length < 2) {
                    toast.error("Poll needs at least 2 options");
                    setPosting(false);
                    return;
                }
                payload.poll = {
                    question: content,
                    options: validOptions,
                };
            }

            const resp = await fetch(`${API_URL}/posts/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (resp.ok) {
                toast.success("Post created!", { icon: "✅" });
                setContent("");
                setMediaUrl("");
                setSkillTags([]);
                onSuccess?.();
                onClose();
            } else {
                const data = await resp.json();
                toast.error(data.detail || "Failed to create post");
            }
        } catch (err) {
            console.error("Create post error:", err);
            toast.error("Network error. Please try again.");
        } finally {
            setPosting(false);
        }
    };

    const addSkillTag = (tag: string) => {
        const cleanTag = tag.replace(/^#/, "").trim();
        if (cleanTag && !skillTags.includes(cleanTag)) {
            setSkillTags(prev => [...prev, cleanTag]);
        }
        setTagInput("");
    };

    const removeSkillTag = (tag: string) => {
        setSkillTags(prev => prev.filter(t => t !== tag));
    };

    const addPollOption = () => {
        if (pollOptions.length < 6) {
            setPollOptions(prev => [...prev, ""]);
        }
    };

    const updatePollOption = (index: number, value: string) => {
        const updated = [...pollOptions];
        updated[index] = value;
        setPollOptions(updated);
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col pointer-events-auto overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                                <div>
                                    <h2 className="font-bold text-lg font-display">Create Post</h2>
                                    <p className="text-xs text-muted-foreground">Share with the community</p>
                                </div>
                                <Button size="icon" variant="ghost" onClick={onClose}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Post Type Selector */}
                            <div className="flex gap-2 px-5 py-3 overflow-x-auto border-b border-border/30">
                                {POST_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            setPostType(type.id);
                                            setShowPoll(type.id === "poll");
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                                            postType === type.id
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        }`}
                                    >
                                        {type.icon && <type.icon className={`w-3.5 h-3.5 ${type.color}`} />}
                                        {type.label}
                                    </button>
                                ))}
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {/* User Info */}
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={user?.avatar_url} />
                                        <AvatarFallback>
                                            {user?.display_name?.[0] || user?.username?.[0] || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm">{user?.display_name || user?.username}</p>
                                        <p className="text-xs text-muted-foreground">@{user?.username}</p>
                                    </div>
                                </div>

                                {/* Content Input */}
                                <div className="space-y-2">
                                    {postType === "poll" ? (
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground">Question</label>
                                            <textarea
                                                className="w-full bg-muted/30 border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                                                placeholder="Ask a question..."
                                                rows={2}
                                                value={content}
                                                onChange={e => setContent(e.target.value)}
                                            />
                                        </div>
                                    ) : (
                                        <textarea
                                            className="w-full bg-transparent text-base focus:outline-none resize-none"
                                            placeholder="What's on your mind?"
                                            rows={4}
                                            value={content}
                                            onChange={e => setContent(e.target.value)}
                                            autoFocus
                                        />
                                    )}

                                    {/* Poll Options */}
                                    {showPoll && (
                                        <div className="space-y-2 mt-4">
                                            <label className="text-xs font-medium text-muted-foreground">Options</label>
                                            {pollOptions.map((option, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full border-2 border-primary/30" />
                                                    <input
                                                        className="flex-1 bg-muted/30 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
                                                        placeholder={`Option ${i + 1}`}
                                                        value={option}
                                                        onChange={e => updatePollOption(i, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                            {pollOptions.length < 6 && (
                                                <button
                                                    onClick={addPollOption}
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    + Add option
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Media URL */}
                                    {(postType === "image" || postType === "code") && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground">
                                                {postType === "image" ? "Image URL" : "Code URL"}
                                            </label>
                                            <div className="relative">
                                                <Link2 className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    className="w-full bg-muted/30 border border-border/60 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/60"
                                                    placeholder="https://..."
                                                    value={mediaUrl}
                                                    onChange={e => setMediaUrl(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Skill Tags */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {skillTags.map(tag => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="gap-1 pr-1"
                                                >
                                                    <Hash className="w-3 h-3 text-primary" />
                                                    {tag}
                                                    <button
                                                        onClick={() => removeSkillTag(tag)}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <AtSign className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                            <input
                                                className="w-full bg-muted/30 border border-border/60 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/60"
                                                placeholder="Add skill tags..."
                                                value={tagInput}
                                                onChange={e => setTagInput(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === "Enter" || e.key === ",") {
                                                        e.preventDefault();
                                                        addSkillTag(tagInput);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-5 py-4 border-t border-border/50 bg-muted/20">
                                <div className="flex gap-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-muted-foreground hover:text-primary"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Image className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-muted-foreground hover:text-primary"
                                        onClick={() => addSkillTag("Frontend")}
                                    >
                                        <Hash className="w-4 h-4" />
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setMediaUrl(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </div>
                                <Button
                                    onClick={handlePost}
                                    disabled={posting || !content.trim()}
                                    className="gap-2"
                                >
                                    {posting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    {posting ? "Posting..." : "Post"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};