import { useRef, useEffect, useState } from "react";
import { MessageBubble } from "@/components/messaging/messages/MessageBubble";
import { useMessagingStore } from "@/hooks/useMessagingStore";
import { Phone, Video, Info, MoreVertical, Send, Paperclip, Code, Mic, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

import { useSocialSocket } from "@/hooks/useSocialSocket";
import { useAuth } from "@/hooks/useAuth";

export const ChatWindow = () => {
    const { user: currentUser } = useAuth();
    const { activeConversationId, conversations, isRightPanelOpen, toggleRightPanel, sendMessage: storeSendMessage, setMobileView, addMessageToConversation } = useMessagingStore();
    const { sendMessage: socketSendMessage, joinChat, emitTyping } = useSocialSocket();
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    // Join room on change and fetch history
    useEffect(() => {
        if (activeConversationId) {
            joinChat(Number(activeConversationId));

            const fetchHistory = async () => {
                try {
                    const token = localStorage.getItem("access_token");
                    const resp = await fetch(`${API_URL}/messages/${activeConversationId}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (resp.ok) {
                        const data = await resp.json();
                        // Update messages in store
                        data.forEach((msg: any) => {
                            addMessageToConversation(Number(activeConversationId), {
                                id: msg.id.toString(),
                                senderId: msg.sender_id.toString(),
                                content: msg.message_text,
                                type: msg.message_type,
                                createdAt: new Date(msg.created_at),
                                status: 'delivered'
                            });
                        });
                    }
                } catch (err) {
                    console.error("History fetch error:", err);
                }
            };
            fetchHistory();
        }
    }, [activeConversationId]);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeConversation?.messages, activeConversationId]);

    const handleSend = () => {
        if (!inputValue.trim() || !activeConversation) return;

        const otherUser = activeConversation.participants.find(p => p.id !== currentUser?.id.toString());
        if (!otherUser) return;

        socketSendMessage(Number(activeConversation.id), Number(otherUser.id), inputValue);
        setInputValue("");
    };

    if (!activeConversation) {
        return (
            <div className="flex-1 flex items-center justify-center text-center p-8 text-muted-foreground bg-zinc-950/30">
                <div className="max-w-md">
                    <h2 className="text-xl font-display font-bold text-white mb-2">Welcome to Nexora Messaging</h2>
                    <p>Select a conversation from the sidebar to start chatting, collaborating, or challenging peers.</p>
                </div>
            </div>
        );
    }

    const otherUser = activeConversation.participants.find(p => p.id !== currentUser?.id.toString());
    const displayName = activeConversation.name || otherUser?.name || "Unknown";

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950/0 to-zinc-950/0">

            {/* Header */}
            <div className="h-16 border-b border-white/10 bg-zinc-950/50 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 shrink-0 z-20">
                <div className="flex items-center gap-3">
                    {/* Mobile Back Button */}
                    <button onClick={() => setMobileView('list')} className="lg:hidden mr-1 text-muted-foreground hover:text-white">
                        ←
                    </button>

                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                            {otherUser?.avatar ? <img src={otherUser.avatar} alt={displayName} className="w-full h-full object-cover" /> : displayName[0]}
                        </div>
                        {otherUser?.onlineStatus === "online" && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-zinc-950 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                        )}
                    </div>
                    <div>
                        <h2 className="font-semibold text-white leading-tight">{displayName}</h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {otherUser?.onlineStatus === 'online' ? <span className="text-green-400">● Online</span> : 'Offline'}
                            {activeConversation.typingUsers.length > 0 && <span className="text-primary animate-pulse ml-2">Typing...</span>}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hidden sm:flex">
                        <Phone className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hidden sm:flex">
                        <Video className="w-5 h-5" />
                    </Button>
                    <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`text-muted-foreground hover:text-white ${isRightPanelOpen ? 'text-primary bg-primary/10' : ''}`}
                        onClick={toggleRightPanel}
                    >
                        <Info className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto nexora-scrollbar p-4 lg:p-6 space-y-4">
                <div className="flex flex-col justify-end min-h-full">
                    {activeConversation.messages.map((msg, index) => {
                        const isOwn = msg.senderId === currentUser?.id.toString();
                        const showAvatar = !isOwn && (index === 0 || activeConversation.messages[index - 1].senderId !== msg.senderId);
                        const sender = activeConversation.participants.find(p => p.id === msg.senderId);

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <MessageBubble
                                    message={msg}
                                    isOwn={isOwn}
                                    showAvatar={showAvatar}
                                    senderName={sender?.name || sender?.username}
                                    senderAvatar={sender?.avatar}
                                />
                            </motion.div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-zinc-950/80 backdrop-blur-xl shrink-0">
                <div className="flex items-end gap-2 bg-white/5 rounded-2xl p-2 border border-white/5 focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <div className="flex gap-1 pb-2 pl-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full hover:bg-white/10">
                            <Paperclip className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full hover:bg-white/10">
                            <Code className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex-1 min-w-0">
                        <textarea
                            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-muted-foreground resize-none max-h-32 py-2 text-sm leading-relaxed scrollbar-thin scroll-container translate-y-0.5"
                            placeholder={`Message ${displayName.split(' ')[0]}...`}
                            rows={1}
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                if (activeConversationId) {
                                    emitTyping(Number(activeConversationId), true);
                                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                    typingTimeoutRef.current = setTimeout(() => {
                                        emitTyping(Number(activeConversationId), false);
                                    }, 2000);
                                }
                            }}
                            onBlur={() => {
                                if (activeConversationId) {
                                    emitTyping(Number(activeConversationId), false);
                                }
                            }}
                            onKeyDown={handleKeyDown}
                            style={{ minHeight: '40px' }}
                        />
                    </div>

                    <div className="flex gap-1 pb-2 pr-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full hover:bg-white/10">
                            <Smile className="w-4 h-4" />
                        </Button>
                        {inputValue.trim() ? (
                            <Button
                                onClick={handleSend}
                                size="icon"
                                className="h-8 w-8 bg-primary hover:bg-primary/90 text-black rounded-full shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all"
                            >
                                <Send className="w-4 h-4 ml-0.5" />
                            </Button>
                        ) : (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white rounded-full hover:bg-white/10">
                                <Mic className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-muted-foreground/50">
                        Press Enter to send, Shift + Enter for new line
                    </span>
                </div>
            </div>
        </div>
    );
};
