import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronDown, Zap } from "lucide-react";

interface InfiniteScrollProps {
    children: React.ReactNode;
    onLoadMore: () => void;
    hasMore: boolean;
    loading: boolean;
}

export const InfiniteScroll = ({ children, onLoadMore, hasMore, loading }: InfiniteScrollProps) => {
    useEffect(() => {
        const handleScroll = () => {
            if (loading || !hasMore) return;

            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop;
            const clientHeight = document.documentElement.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight - 500) {
                onLoadMore();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loading, hasMore, onLoadMore]);

    return <div>{children}</div>;
};

// Load More Button Component
export const LoadMoreButton = ({ onClick, loading }: { onClick: () => void; loading: boolean }) => (
    <div className="flex justify-center py-8">
        <Button
            size="lg"
            variant="outline"
            onClick={onClick}
            disabled={loading}
            className="group"
        >
            {loading ? (
                <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Loading more...
                </>
            ) : (
                <>
                    <ChevronDown className="w-4 h-4 mr-2 group-hover:translate-y-1 transition-transform" />
                    Load More
                </>
            )}
        </Button>
    </div>
);

// Real-time Update Indicator
export const RealTimeIndicator = ({ count }: { count: number }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (count > 0) {
            setShow(true);
            const timer = setTimeout(() => setShow(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [count]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
                >
                    <Button
                        variant="default"
                        className="shadow-lg bg-primary hover:bg-primary/90 gap-2"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    >
                        <Zap className="w-4 h-4" />
                        {count} new {count === 1 ? "update" : "updates"} - Click to refresh
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Pull to Refresh Component (Mobile)
export const PullToRefresh = ({ onRefresh }: { onRefresh: () => Promise<void> }) => {
    const [pulling, setPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);

    useEffect(() => {
        let startY = 0;

        const handleTouchStart = (e: TouchEvent) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (window.scrollY === 0 && startY > 0) {
                const currentY = e.touches[0].clientY;
                const distance = currentY - startY;
                if (distance > 0) {
                    setPullDistance(Math.min(distance, 100));
                    if (distance > 80) {
                        setPulling(true);
                    }
                }
            }
        };

        const handleTouchEnd = async () => {
            if (pulling) {
                await onRefresh();
            }
            setPulling(false);
            setPullDistance(0);
            startY = 0;
        };

        document.addEventListener("touchstart", handleTouchStart);
        document.addEventListener("touchmove", handleTouchMove);
        document.addEventListener("touchend", handleTouchEnd);

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [pulling, onRefresh]);

    return (
        <AnimatePresence>
            {pullDistance > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: pullDistance / 100 }}
                    className="fixed top-0 left-0 right-0 h-16 flex items-center justify-center z-50"
                >
                    <RefreshCw
                        className={`w-6 h-6 text-primary ${pulling ? "animate-spin" : ""}`}
                        style={{ transform: `rotate(${pullDistance * 3.6}deg)` }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
