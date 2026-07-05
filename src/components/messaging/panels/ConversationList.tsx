import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Search, MessageSquarePlus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMessagingStore } from "@/hooks/useMessagingStore";
import { ConversationCategory, Conversation } from "@/types/messaging";

export const ConversationList = () => {
    const { user: currentUser } = useAuth();
    const {
        conversations,
        setConversations,
        activeConversationId,
        setActiveConversation,
        searchQuery,
        setSearchQuery,
        activeCategory,
        setActiveCategory
    } = useMessagingStore();

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const resp = await fetch(`${API_URL}/messages/rooms`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (resp.ok) {
                    const data = await resp.json();

                    // Map backend Room to Conversation type
                    const mapped: Conversation[] = data.map((room: any) => {
                        const recipientData = room.recipient;
                        const roomId = (room.room_id || room.id || "").toString();

                        const rawCategory = room.category || "all";

                        return {
                            id: roomId,
                            type: 'direct' as const,
                            category: rawCategory as ConversationCategory,
                            participants: [
                                {
                                    id: currentUser?.id.toString() || "0",
                                    username: currentUser?.username || "",
                                    name: currentUser?.display_name || currentUser?.username || "",
                                    onlineStatus: "online" as const,
                                    isVerified: false,
                                    skills: []
                                },
                                {
                                    id: recipientData?.id?.toString() || "0",
                                    username: recipientData?.username || "",
                                    name: recipientData?.display_name || recipientData?.username || "",
                                    avatar: recipientData?.avatar_url,
                                    onlineStatus: (recipientData?.online_status || "offline") as any,
                                    isVerified: false,
                                    skills: []
                                }
                            ],
                            recipient: {
                                id: recipientData?.id?.toString() || "0",
                                username: recipientData?.username || "",
                                name: recipientData?.display_name || recipientData?.username || "",
                                avatar: recipientData?.avatar_url,
                                onlineStatus: (recipientData?.online_status || "offline") as any,
                                isVerified: false,
                                skills: []
                            },
                            messages: [],
                            unreadCount: room.unread_count || 0,
                            isPinned: false,
                            isMuted: false,
                            typingUsers: [],
                            createdAt: new Date(),
                            updatedAt: new Date(room.last_message_time || Date.now()),
                            lastMessage: {
                                id: "0",
                                conversationId: roomId,
                                senderId: "0",
                                type: "text" as const,
                                content: room.last_message || "No messages yet",
                                createdAt: new Date(room.last_message_time || Date.now()),
                                updatedAt: new Date(room.last_message_time || Date.now()),
                                status: "delivered" as const,
                                reactions: [],
                                isEdited: false,
                                isPinned: false,
                                readBy: []
                            }
                        };
                    });
                    setConversations(mapped);
                }
            } catch (err) {
                console.error("Fetch rooms error:", err);
            }
        };
        if (currentUser) fetchRooms();
    }, [currentUser]);

    // Filter conversations logic
    const filteredConversations = conversations.filter((conv) => {
        const matchesCategory = activeCategory === "all" || conv.category === activeCategory;
        const matchesSearch =
            searchQuery === "" ||
            conv.participants.some(
                (p) =>
                    p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.name.toLowerCase().includes(searchQuery.toLowerCase())
            ) ||
            (conv.name && conv.name.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
    });

    const categories = [
        { id: "all", label: "All", icon: "💬" },
        { id: "friends", label: "Friends", icon: "👥" },
        { id: "skill-matches", label: "Matches", icon: "🎯" },
    ];

    const formatTimestamp = (date: Date): string => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return "now";
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-white/10 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                        Messages
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            {conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
                        </span>
                    </h1>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                            <MessageSquarePlus className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                            <Settings className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl transition-all"
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="px-4 py-3 border-b border-white/5 overflow-x-auto nexora-horizontal-scroll shrink-0">
                <div className="flex gap-2 min-w-max">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id as ConversationCategory)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${activeCategory === cat.id
                                ? "bg-primary text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            <span>{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scroll-container p-2 space-y-1">
                {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                        <Search className="w-8 h-8 mb-2 opacity-20" />
                        <p>No conversations found</p>
                    </div>
                ) : (
                    filteredConversations.map((conversation) => {
                        const currentUserId = currentUser?.id.toString() || "0";
                        const otherUser = conversation.participants.find((p) => p.id !== currentUserId);
                        const displayName = conversation.name || otherUser?.name || "Unknown";
                        const isActive = activeConversationId === conversation.id;

                        return (
                            <motion.button
                                key={conversation.id}
                                onClick={() => setActiveConversation(conversation.id)}
                                whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.05)" }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full p-3 rounded-xl text-left transition-all border ${isActive
                                    ? "bg-primary/10 border-primary/30 shadow-[inset_0_0_20px_rgba(0,240,255,0.05)]"
                                    : "bg-transparent border-transparent hover:border-white/5"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-white font-bold text-lg border border-white/10 overflow-hidden">
                                            {otherUser?.avatar ? (
                                                <img src={otherUser.avatar} alt={displayName} className="w-full h-full object-cover" />
                                            ) : (
                                                displayName[0]
                                            )}
                                        </div>
                                        {otherUser?.onlineStatus === "online" && (
                                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-zinc-950 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`font-semibold text-sm truncate ${isActive ? 'text-primary' : 'text-white'}`}>
                                                {displayName}
                                                {otherUser?.isVerified && <span className="ml-1 text-primary">✓</span>}
                                            </h3>
                                            <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                                {formatTimestamp(conversation.lastMessage.createdAt)}
                                            </span>
                                        </div>


                                        {conversation.skillMatch && conversation.skillMatch > 80 && (
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">
                                                    {conversation.skillMatch}% Match
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground truncate max-w-[80%]">
                                                <span className={conversation.lastMessage.senderId === 'current-user' ? 'text-zinc-500' : ''}>
                                                    {conversation.lastMessage.senderId === 'current-user' && 'You: '}
                                                </span>
                                                {conversation.lastMessage.type === 'image' ? '📷 Image' :
                                                    conversation.lastMessage.type === 'code' ? '💻 Code Snippet' :
                                                        conversation.lastMessage.type === 'file' ? '📁 Attachment' :
                                                            conversation.lastMessage.content}
                                            </p>

                                            {conversation.unreadCount > 0 && (
                                                <span className="shrink-0 w-5 h-5 bg-primary text-black text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse">
                                                    {conversation.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })
                )}
            </div>
        </div>
    );
};
