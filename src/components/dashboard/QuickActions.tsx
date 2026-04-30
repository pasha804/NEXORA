import { motion } from "framer-motion";
import { Plus, Swords, Search, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export const QuickActions = () => {
    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="fixed bottom-20 md:bottom-8 right-8 z-40 flex flex-col gap-3 items-end"
        >
            {/* Quick Action Buttons */}
            <div className="flex flex-col gap-3">
                {/* 
                  In a full implementation, these would likely be a Speed Dial 
                  or a horizontal bar on mobile. keeping it simple for now as a vertical stack
                */}
                <Button variant="outline" size="icon" className="rounded-full w-12 h-12 bg-background/80 backdrop-blur border-primary/20 hover:border-primary text-primary shadow-lg">
                    <Bot className="w-6 h-6" />
                </Button>
                <Button variant="hero" size="icon" className="rounded-full w-14 h-14 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    <Plus className="w-6 h-6" />
                </Button>
            </div>
        </motion.div>
    );
};
