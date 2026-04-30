import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Video, Image, FileText, Code2, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const CreatePostFab = () => {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        { label: "Ask AI", icon: Bot, color: "bg-purple-500" },
        { label: "Code", icon: Code2, color: "bg-blue-500" },
        { label: "Media", icon: Image, color: "bg-green-500" },
        { label: "Reel", icon: Video, color: "bg-pink-500" },
        { label: "Post", icon: FileText, color: "bg-orange-500" },
    ];

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="mb-4 space-y-3 pointer-events-auto flex flex-col items-end"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        {actions.map((action, i) => (
                            <motion.div
                                key={action.label}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-3"
                            >
                                <span className="bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-md shadow-lg">
                                    {action.label}
                                </span>
                                <Button
                                    size="icon"
                                    className={`rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all ${action.color}`}
                                >
                                    <action.icon className="w-5 h-5 text-white" />
                                </Button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                size="lg"
                className={`rounded-full shadow-2xl w-14 h-14 pointer-events-auto transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                variant="hero"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Plus className="w-8 h-8" />
            </Button>
        </div>
    );
};
