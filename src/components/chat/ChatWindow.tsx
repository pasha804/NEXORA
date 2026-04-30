import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MoreVertical, Phone, Video, Paperclip, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
    id: string;
    senderId: string;
    text: string;
    time: string;
}

interface ChatWindowProps {
    conversationId: string;
}

export const ChatWindow = ({ conversationId }: ChatWindowProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim()) return;

        const msg: Message = {
            id: Date.now().toString(),
            senderId: "me",
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages([...messages, msg]);
        setNewMessage("");
    };

    return (
        <div className="h-full flex flex-col glass-card rounded-none md:rounded-r-xl border-l-0">
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary/20 to-neon-purple/20 flex items-center justify-center font-bold text-secondary">
                        S
                    </div>
                    <div>
                        <h3 className="font-bold">Sarah Connor</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                            <span className="text-xs text-muted-foreground">Online</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Video className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="w-5 h-5 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Block User</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <p>No messages yet.</p>
                        <p className="text-xs">Start the conversation!</p>
                    </div>
                ) : messages.map((msg) => {
                    const isMe = msg.senderId === "me";
                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-muted text-foreground rounded-bl-none"
                                }`}>
                                <p className="text-sm">{msg.text}</p>
                                <p className={`text-[10px] mt-1 text-right ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                    {msg.time}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Button type="button" variant="ghost" size="icon" className="shrink-0">
                        <Paperclip className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <div className="flex-1 relative">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="pr-10 bg-muted/30 border-transparent focus:border-primary/50"
                        />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10">
                            <Smile className="w-5 h-5 text-muted-foreground" />
                        </Button>
                    </div>
                    <Button type="submit" variant="hero" size="icon" className="shrink-0">
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
};
