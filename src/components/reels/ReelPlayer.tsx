import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, MousePointerClick, Play, Award, MapPin, Music2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Reel, isTutorialReel, isPvPReel, isProjectReel } from "@/types/reels";
import { ReelComments } from "./ReelComments";
import { ShareModal } from "./ShareModal";
import { useReelStore } from "@/hooks/useReelStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface ReelPlayerProps {
    data: Reel;
    isActive: boolean;
}

export const ReelPlayer = ({ data, isActive }: ReelPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(data.isLiked);
    const [likeCount, setLikeCount] = useState(data.likes);
    const [isSaved, setIsSaved] = useState(data.isSaved || false);
    const [saveCount, setSaveCount] = useState(data.saves);
    const [showComments, setShowComments] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    const toggleLikeStore = useReelStore((s) => s.toggleLike);
    const toggleSaveStore = useReelStore((s) => s.toggleSave);

    // Sync with data changes
    useEffect(() => {
        setIsLiked(data.isLiked);
        setLikeCount(data.likes);
        setIsSaved(data.isSaved || false);
        setSaveCount(data.saves);
    }, [data.isLiked, data.likes, data.isSaved, data.saves]);

    // Using refs for double tap logic
    const lastTap = useRef<number>(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Auto-play/pause based on active state
    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(e => console.log("Autoplay prevented", e));
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const handleDoubleTap = (e: React.MouseEvent) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            // Success Double Tap
            handleLike(true);
            setShowHeartAnimation(true);
            setTimeout(() => setShowHeartAnimation(false), 1000);
        } else {
            togglePlay();
        }

        lastTap.current = now;
    };

    const handleLike = async (forceLike = false) => {
        const wasLiked = isLiked;
        if (wasLiked && !forceLike) {
            setLikeCount(prev => prev - 1);
            setIsLiked(false);
        } else if (!wasLiked) {
            setLikeCount(prev => prev + 1);
            setIsLiked(true);
        } else if (forceLike) {
            return;
        }

        toggleLikeStore(data.id);

        try {
            const token = localStorage.getItem("access_token");
            const resp = await fetch(`${API_URL}/reels/${data.id}/like`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!resp.ok) {
                setIsLiked(wasLiked);
                setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
                toggleLikeStore(data.id);
                toast.error("Failed to update like status");
            }
        } catch (err) {
            setIsLiked(wasLiked);
            setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
            toggleLikeStore(data.id);
        }
    };

    const handleSave = async () => {
        const wasSaved = isSaved;
        setIsSaved(!wasSaved);
        setSaveCount(prev => wasSaved ? prev - 1 : prev + 1);
        toggleSaveStore(data.id);

        try {
            const token = localStorage.getItem("access_token");
            const resp = await fetch(`${API_URL}/reels/${data.id}/save`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!resp.ok) {
                setIsSaved(wasSaved);
                setSaveCount(prev => wasSaved ? prev + 1 : prev - 1);
                toggleSaveStore(data.id);
                toast.error("Failed to save reel");
            } else {
                toast.success(wasSaved ? "Removed from saved" : "Reel saved to collections");
            }
        } catch (err) {
            setIsSaved(wasSaved);
            setSaveCount(prev => wasSaved ? prev + 1 : prev - 1);
            toggleSaveStore(data.id);
        }
    };

    return (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
            <ReelComments isOpen={showComments} onClose={() => setShowComments(false)} reelId={data.id} />
            <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} reelUrl={`https://nexora.app/reels/${data.id}`} />

            {/* Video Placeholder or Element */}
            <div
                className="absolute inset-0 bg-neutral-900 cursor-pointer"
                onClick={handleDoubleTap}
            >
                {/* Simulated Video Content */}
                <video
                    ref={videoRef}
                    src={data.videoUrl}
                    poster={data.thumbnailUrl}
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-90"
                    muted // Muted needed for autoplay usually
                />

                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                        <div className="bg-white/10 p-4 rounded-full backdrop-blur-md ring-1 ring-white/30">
                            <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                    </div>
                )}

                {/* Big Heart Animation on Double Tap */}
                <AnimatePresence>
                    {showHeartAnimation && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 1, rotate: [0, -10, 10, 0] }}
                            exit={{ scale: 0, opacity: 0, y: -100 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                        >
                            <Heart className="w-32 h-32 fill-white text-white drop-shadow-2xl" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Overlay Content */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 pb-20 md:pb-4">

                {/* Top Gradient & Badges */}
                <div>
                    <div className="h-32 bg-gradient-to-b from-black/60 to-transparent absolute top-0 left-0 right-0 z-10" />
                    <div className="relative z-20 flex justify-between items-start pt-2">
                        {isTutorialReel(data) && (
                            <div className="bg-neon-blue/20 backdrop-blur-md border border-neon-blue/50 text-neon-blue px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 pointer-events-auto">
                                <Award className="w-3 h-3" />
                                Tutorial • {data.tutorial.difficultyLevel}
                            </div>
                        )}
                        {isPvPReel(data) && (
                            <div className="bg-neon-purple/20 backdrop-blur-md border border-neon-purple/50 text-neon-purple px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 pointer-events-auto">
                                <MousePointerClick className="w-3 h-3" />
                                PvP • {data.pvp.challengeType}
                            </div>
                        )}
                        {isProjectReel(data) && (
                            <div className="bg-neon-green/20 backdrop-blur-md border border-neon-green/50 text-neon-green px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 pointer-events-auto">
                                <Zap className="w-3 h-3" />
                                Project Showcase
                            </div>
                        )}
                    </div>
                </div>


                {/* Bottom Content Area */}
                <div className="relative z-20 flex items-end gap-4 pointer-events-auto">
                    <div className="flex-1 space-y-3 mb-4 md:mb-0">
                        {/* User Info */}
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-white/20 ring-2 ring-black/50">
                                <AvatarImage src={data.creator.avatarUrl} />
                                <AvatarFallback>{data.creator.username[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-sm md:text-base cursor-pointer hover:underline shadow-black drop-shadow-md">
                                        @{data.creator.username}
                                    </span>
                                    {data.creator.isVerified && <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white">✓</div>}
                                    {!data.creator.isFollowed && (
                                        <button className="text-xs border border-white/50 text-white px-2 py-0.5 rounded-full hover:bg-white/20 transition-colors ml-2">
                                            Follow
                                        </button>
                                    )}
                                </div>
                                {/* Recommendation Reason */}
                                {data.recommendationReason && (
                                    <div className="flex items-center gap-1 text-[10px] text-white/80 bg-white/10 px-1.5 py-0.5 rounded w-fit mt-1 backdrop-blur-sm">
                                        <MapPin className="w-2.5 h-2.5" />
                                        {data.recommendationReason}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Caption & Tags */}
                        <div className="space-y-2">
                            <p className="text-white/95 text-sm md:text-base line-clamp-2 drop-shadow-lg font-medium">
                                {data.caption}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {data.skillTags.map(tag => (
                                    <span key={tag} className="text-xs font-bold text-white/70 bg-black/30 border border-white/10 px-2 py-1 rounded-md backdrop-blur-sm">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                            {/* Audio Track */}
                            <div className="flex items-center gap-2 text-white/70 text-xs mt-2 animate-pulse overflow-hidden">
                                <Music2 className="w-3 h-3" />
                                <span className="truncate max-w-[200px]">Original Audio - {data.creator.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Reaction Sidebar */}
                    <div className="flex flex-col items-center gap-6 pb-8 md:pb-0">
                        <Button variant="ghost" size="icon" className="flex flex-col gap-1 items-center hover:bg-transparent group" onClick={() => handleLike(false)}>
                            <div className={`p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/5 transition-all group-active:scale-90 ${isLiked ? "text-red-500 bg-red-500/10 border-red-500/20" : "text-white"}`}>
                                <Heart className={`w-7 h-7 ${isLiked ? "fill-current" : ""}`} />
                            </div>
                            <span className="text-xs font-bold text-white drop-shadow-md">{likeCount}</span>
                        </Button>

                        <Button variant="ghost" size="icon" className="flex flex-col gap-1 items-center hover:bg-transparent" onClick={() => setShowComments(true)}>
                            <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/5 hover:bg-white/10 transition-colors">
                                <MessageCircle className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-xs font-bold text-white drop-shadow-md">{data.comments}</span>
                        </Button>

                        <Button variant="ghost" size="icon" className="flex flex-col gap-1 items-center hover:bg-transparent" onClick={handleSave}>
                            <div className={`p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/5 transition-colors ${isSaved ? "text-yellow-400" : "text-white"}`}>
                                <Bookmark className={`w-7 h-7 ${isSaved ? "fill-current" : ""}`} />
                            </div>
                            <span className="text-xs font-bold text-white drop-shadow-md">{saveCount}</span>
                        </Button>

                        <Button variant="ghost" size="icon" className="flex flex-col gap-1 items-center hover:bg-transparent" onClick={() => setShowShare(true)}>
                            <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/5 hover:bg-white/10 transition-colors">
                                <Share2 className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-xs font-bold text-white drop-shadow-md">{data.shares}</span>
                        </Button>

                        <Button variant="ghost" size="icon" className="hover:bg-transparent mt-2">
                            <div className="w-9 h-9 rounded-full border-2 border-white/20 overflow-hidden animate-spin-slow p-[2px]">
                                <img src={data.creator.avatarUrl} alt="music" className="w-full h-full rounded-full object-cover opacity-80" />
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
