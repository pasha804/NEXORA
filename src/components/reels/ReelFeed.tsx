import { useState, useRef, useEffect, useCallback } from "react";
import { ReelPlayer } from "./ReelPlayer";
import { Reel } from "@/types/reels";
import { Loader2 } from "lucide-react";

interface ReelFeedProps {
    reels: Reel[];
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoading?: boolean;
}

export const ReelFeed = ({ reels, onLoadMore, hasMore, isLoading }: ReelFeedProps) => {
    const [currentReelIndex, setCurrentReelIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute("data-index"));
                        setCurrentReelIndex(index);
                    }
                });
            },
            { threshold: 0.6 }
        );

        const reelElements = document.querySelectorAll(".reel-container");
        reelElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [reels]);

    useEffect(() => {
        if (!sentinelRef.current || !onLoadMore || !hasMore || isLoading) return;
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) onLoadMore();
            },
            { threshold: 0.1 }
        );
        observerRef.current.observe(sentinelRef.current);
        return () => observerRef.current?.disconnect();
    }, [onLoadMore, hasMore, isLoading]);

    return (
        <div
            ref={containerRef}
            className="flex-1 h-full overflow-y-scroll snap-y snap-mandatory scrollbar-thin scroll-container relative bg-zinc-900/50"
        >
            {reels.map((reel, index) => (
                <div
                    key={reel.id}
                    data-index={index}
                    className="reel-container w-full h-full snap-start snap-always relative flex justify-center items-center bg-zinc-950/80 backdrop-blur-sm"
                >
                    <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                        {Math.abs(currentReelIndex - index) <= 1 && (
                            <div className="w-full h-full scale-150 blur-3xl bg-gradient-to-tr from-primary/30 to-neon-purple/30 animate-pulse-slow" />
                        )}
                    </div>
                    <div className="w-full h-full md:h-[95%] md:w-auto md:aspect-[9/16] md:max-w-[550px] relative border-x border-white/5 shadow-2xl rounded-sm overflow-hidden ring-1 ring-white/10">
                        {Math.abs(currentReelIndex - index) <= 2 && (
                            <ReelPlayer data={reel} isActive={currentReelIndex === index} />
                        )}
                    </div>
                </div>
            ))}
            {hasMore && (
                <div ref={sentinelRef} className="h-20 flex items-center justify-center">
                    {isLoading && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                </div>
            )}
        </div>
    );
};
