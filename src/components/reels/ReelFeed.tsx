import { useState, useRef, useEffect, useCallback } from "react";
import { ReelPlayer } from "./ReelPlayer";
import { useInView } from "framer-motion";
import { Reel } from "@/types/reels"; // Assuming we will update types/reels.ts or map backend data to this

interface ReelFeedProps {
    reels: any[]; // Using any for now until we unify backend/frontend types
    onLoadMore?: () => void;
}

export const ReelFeed = ({ reels, onLoadMore }: ReelFeedProps) => {
    const [currentReelIndex, setCurrentReelIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer logic to handle snap index
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
                    {/* Immersive Background Blur - Optimized */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                        {/* Only render blur if active or adjacent to improve performance */}
                        {Math.abs(currentReelIndex - index) <= 1 && (
                            <div className="w-full h-full scale-150 blur-3xl bg-gradient-to-tr from-primary/30 to-neon-purple/30 animate-pulse-slow" />
                        )}
                    </div>

                    {/* Video Player Container */}
                    <div className="w-full h-full md:h-[95%] md:w-auto md:aspect-[9/16] md:max-w-[550px] relative border-x border-white/5 shadow-2xl rounded-sm overflow-hidden ring-1 ring-white/10">
                        {/* Only render player content if active or adjacent to conserve resources */}
                        {Math.abs(currentReelIndex - index) <= 2 && (
                            <ReelPlayer data={reel} isActive={currentReelIndex === index} />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
