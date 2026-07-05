import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

export const AIChatInterface = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "ai",
            content: "Hello! I'm your AI Coach. I've analyzed your recent performance trajectory. Ready to discuss your next skill optimization milestone?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: "user",
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token ? `Bearer ${token}` : ""
                },
                body: JSON.stringify({
                    message: input,
                    context: {
                        timestamp: new Date().toISOString(),
                        platform: "web"
                    }
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, {
                    role: "ai",
                    content: data.response,
                    timestamp: new Date()
                }]);
            } else {
                throw new Error("Neural link unstable. Please retry.");
            }
        } catch (err) {
            console.error("AI chat error:", err);
            setMessages(prev => [...prev, {
                role: "ai",
                content: "My processors are temporarily overloaded while analyzing the nexus. Please try again in a moment.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-card flex flex-col h-[600px] border-neon-blue/10">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-neon-blue/20 to-purple-500/20">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,163,255,0.4)]">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-black"
                        />
                    </div>
                    <div>
                        <h4 className="font-bold tracking-tight">Nexora AI Architect</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Neural Link Active
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            <Avatar className={`w-10 h-10 border-2 flex-shrink-0 shadow-lg ${msg.role === "ai"
                                    ? "border-neon-blue bg-neon-blue/10"
                                    : "border-purple-500 bg-purple-500/10"
                                }`}>
                                <AvatarFallback className="bg-transparent">
                                    {msg.role === "ai" ? (
                                        <Bot className="w-5 h-5 text-neon-blue" />
                                    ) : (
                                        <span className="text-xs font-bold text-purple-500 uppercase">User</span>
                                    )}
                                </AvatarFallback>
                            </Avatar>

                            <div className={`flex-1 max-w-[85%] ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
                                <div className={`p-4 rounded-2xl relative group transition-all duration-300 ${msg.role === "ai"
                                        ? "bg-black/40 rounded-tl-none border border-white/10 hover:border-neon-blue/30"
                                        : "bg-neon-blue/20 rounded-tr-none border border-neon-blue/30 text-right"
                                    }`}>
                                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                                        {msg.content}
                                    </p>
                                </div>
                                <span className={`text-[10px] text-muted-foreground mt-1.5 px-2 font-medium ${msg.role === "user" ? "text-right" : ""}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading Indicator */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4"
                    >
                        <Avatar className="w-10 h-10 border-2 border-neon-blue bg-neon-blue/10 flex-shrink-0 animate-pulse">
                            <AvatarFallback className="bg-transparent">
                                <Bot className="w-5 h-5 text-neon-blue" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="p-4 rounded-2xl rounded-tl-none bg-black/40 border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 h-1 bg-neon-blue rounded-full" />
                                    <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1 h-1 bg-neon-blue rounded-full" />
                                    <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1 h-1 bg-neon-blue rounded-full" />
                                </div>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Processing Neural Input</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-muted/20 border-t border-white/10">
                <div className="flex gap-3 relative">
                    <Input
                        placeholder="Inquire about skill trajectories, challenges, or architectural patterns..."
                        className="bg-black/60 border-white/10 focus:border-neon-blue/50 py-6 pr-14 text-sm"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        disabled={isLoading}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Button
                            size="icon"
                            variant="hero"
                            className="w-10 h-10 rounded-xl"
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-3 px-1">
                    <p className="text-[10px] text-muted-foreground">
                        Nexora AI Coach v4.0.1
                    </p>
                    <div className="flex gap-4">
                        <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                           <span className="w-1 h-1 rounded-full bg-neon-blue" /> Career Predict
                        </span>
                        <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                           <span className="w-1 h-1 rounded-full bg-purple-500" /> Skill Audit
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
