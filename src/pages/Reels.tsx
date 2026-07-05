import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, PlusSquare, MonitorPlay, Zap, Users, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReelFeed } from "@/components/reels/ReelFeed";
import { UploadModal } from "@/components/reels/UploadModal";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useReelStore } from "@/hooks/useReelStore";

const Reels = () => {
    const { reels, hasMore, isLoading, fetchReels } = useReelStore();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [learningMode, setLearningMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFeed, setActiveFeed] = useState<'foryou' | 'following' | 'clips'>('foryou');

    useEffect(() => {
        fetchReels(true);
    }, []);

    const handleLoadMore = useCallback(() => {
        if (!isLoading && hasMore) fetchReels();
    }, [isLoading, hasMore, fetchReels]);

    const currentUserId = localStorage.getItem("user_id");

    const filteredReels = useMemo(() => {
        return reels.filter(reel => {
            if (activeFeed === 'following') {
                if (!reel.creator.isFollowed) return false;
            } else if (activeFeed === 'clips') {
                if (reel.creator.id !== currentUserId) return false;
            }
            if (learningMode && reel.type !== 'skill-tutorial' && reel.type !== 'ai-learning') {
                return false;
            }
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesCaption = reel.caption.toLowerCase().includes(query);
                const matchesTags = reel.skillTags.some(tag => tag.toLowerCase().includes(query));
                if (!matchesCaption && !matchesTags) return false;
            }
            return true;
        });
    }, [reels, activeFeed, learningMode, searchQuery, currentUserId]);

    return (
        <div className="h-[calc(100vh-0px)] bg-black flex overflow-hidden relative">
            <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

            {/* LEFT COLUMN */}
            <div className="hidden lg:flex flex-col w-72 border-r border-white/10 bg-zinc-950 p-6 z-20 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
                        Reels
                        <span className="text-[10px] bg-primary px-1.5 rounded text-white font-mono translate-y-0.5">BETA</span>
                    </h1>
                </div>

                <div className="space-y-8 flex-1">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search topics..."
                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-primary/50 transition-all rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <Label htmlFor="learning-mode" className="text-sm font-medium text-white flex items-center gap-2 cursor-pointer">
                                <Zap className={`w-4 h-4 ${learningMode ? "text-neon-blue filled" : "text-muted-foreground"}`} />
                                Learning Mode
                            </Label>
                            <Switch
                                id="learning-mode"
                                checked={learningMode}
                                onCheckedChange={setLearningMode}
                                className="data-[state=checked]:bg-neon-blue"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground px-2 leading-relaxed">
                            Only show tutorials and educational content to boost your skills.
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">Feeds</p>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start font-medium rounded-xl h-11 ${activeFeed === 'foryou' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                            onClick={() => setActiveFeed('foryou')}
                        >
                            <MonitorPlay className={`w-4 h-4 mr-3 ${activeFeed === 'foryou' ? "text-primary" : ""}`} />
                            For You
                        </Button>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start font-medium rounded-xl h-11 ${activeFeed === 'following' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                            onClick={() => setActiveFeed('following')}
                        >
                            <Users className={`w-4 h-4 mr-3 ${activeFeed === 'following' ? "text-primary" : ""}`} />
                            Following
                        </Button>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start font-medium rounded-xl h-11 ${activeFeed === 'clips' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                            onClick={() => setActiveFeed('clips')}
                        >
                            <Upload className={`w-4 h-4 mr-3 ${activeFeed === 'clips' ? "text-primary" : ""}`} />
                            Your Clips
                        </Button>
                    </div>
                </div>

                <Button onClick={() => setIsUploadOpen(true)} variant="hero" className="w-full mt-4 h-12 text-base shadow-lg shadow-primary/25">
                    <PlusSquare className="w-5 h-5 mr-2" />
                    Upload Clip
                </Button>
            </div>

            {/* MIDDLE COLUMN */}
            {filteredReels.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-zinc-950/50">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                        <MonitorPlay className="w-10 h-10 text-primary/60" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">No Reels Yet</h2>
                    <p className="text-muted-foreground mb-6 max-w-xs">
                        {activeFeed === 'following'
                            ? "Follow creators to see their reels here."
                            : activeFeed === 'clips'
                            ? "You haven't uploaded any clips yet."
                            : "Be the first to share a skill reel with the community."}
                    </p>
                    <Button onClick={() => setIsUploadOpen(true)} variant="hero" className="gap-2">
                        <PlusSquare className="w-4 h-4" />
                        Upload First Clip
                    </Button>
                </div>
            ) : (
                <ReelFeed reels={filteredReels} onLoadMore={handleLoadMore} hasMore={hasMore} isLoading={isLoading} />
            )}

            {/* RIGHT COLUMN */}
            <div className="hidden xl:flex flex-col w-80 border-l border-white/10 bg-zinc-950 p-6 z-20">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-lg text-white">Platform Activity</h2>
                </div>
                <div className="space-y-4 mb-8">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Follow creators to see their latest activity here.
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-neon-purple/10 to-transparent border border-neon-purple/20">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        Trending Challenge
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                        "Build a counter in 5 languages" is blowing up!
                    </p>
                    <Button variant="outline" size="sm" className="w-full border-neon-purple/50 text-neon-purple hover:bg-neon-purple/20">
                        View Challenge
                    </Button>
                </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <h1 className="font-display text-xl font-bold text-white drop-shadow-md">Reels</h1>
                <Button variant="ghost" size="icon" className="text-white pointer-events-auto" onClick={() => setIsUploadOpen(true)}>
                    <PlusSquare className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
};

export default Reels;
