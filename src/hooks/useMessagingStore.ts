import { create } from 'zustand';
import { Conversation, ConversationCategory } from '@/types/messaging';

interface MessagingState {
    // Data
    conversations: Conversation[];
    activeConversationId: string | null;

    // UI State
    searchQuery: string;
    activeCategory: ConversationCategory;
    isRightPanelOpen: boolean;
    mobileView: 'list' | 'chat' | 'info';

    // Actions
    setConversations: (conversations: Conversation[]) => void;
    setActiveConversation: (id: string | null) => void;
    setSearchQuery: (query: string) => void;
    setActiveCategory: (category: ConversationCategory) => void;
    toggleRightPanel: () => void;
    setMobileView: (view: 'list' | 'chat' | 'info') => void;
    markAsRead: (conversationId: string) => void;
    sendMessage: (conversationId: string, content: string, type?: 'text' | 'image' | 'code' | 'file') => void;
    addMessageToConversation: (roomId: number, message: any) => void;
    updateConversationStatus: (userId: number, status: string) => void;
    updateTypingStatus: (roomId: number, userId: number, isTyping: boolean) => void;
}

export const useMessagingStore = create<MessagingState>((set) => ({
    conversations: [],
    activeConversationId: null,
    searchQuery: '',
    activeCategory: 'all',
    isRightPanelOpen: true,
    mobileView: 'list',

    setConversations: (conversations) => set({ conversations }),

    setActiveConversation: (id) => set({
        activeConversationId: id,
        mobileView: id ? 'chat' : 'list'
    }),

    setSearchQuery: (query) => set({ searchQuery: query }),

    setActiveCategory: (category) => set({ activeCategory: category }),

    toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

    setMobileView: (view) => set({ mobileView: view }),

    markAsRead: (id) => set((state) => ({
        conversations: state.conversations.map(c =>
            c.id === id ? { ...c, unreadCount: 0 } : c
        )
    })),

    addMessageToConversation: (roomId, message) => set((state) => ({
        conversations: state.conversations.map(c => {
            if (c.id === roomId.toString()) {
                const newMessage: any = {
                    ...message,
                    conversationId: roomId.toString(),
                    reactions: [],
                    isEdited: false,
                    isPinned: false,
                    readBy: [],
                    updatedAt: new Date()
                };
                return {
                    ...c,
                    messages: [...(c.messages || []), newMessage],
                    lastMessage: newMessage,
                    updatedAt: new Date()
                };
            }
            return c;
        })
    })),

    updateConversationStatus: (userId, status) => set((state) => ({
        conversations: state.conversations.map(c => {
            const isTarget = c.participants.some(p => p.id === userId.toString());
            if (isTarget) {
                return {
                    ...c,
                    participants: c.participants.map(p =>
                        p.id === userId.toString() ? { ...p, onlineStatus: status as any } : p
                    ),
                    recipient: c.recipient?.id === userId.toString()
                        ? { ...c.recipient, onlineStatus: status as any }
                        : c.recipient
                };
            }
            return c;
        })
    })),

    updateTypingStatus: (roomId, userId, isTyping) => set((state) => ({
        conversations: state.conversations.map(c => {
            if (c.id === roomId.toString()) {
                const typingUsers = isTyping
                    ? [...c.typingUsers.filter(id => id !== userId), userId]
                    : c.typingUsers.filter(id => id !== userId);
                return { ...c, typingUsers };
            }
            return c;
        })
    })),

    sendMessage: (conversationId, content, type = 'text') => set((state) => {
        const newMsg: any = {
            id: `msg-${Date.now()}`,
            conversationId,
            senderId: localStorage.getItem("user_id") || 'current-user',
            content,
            type,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'sent',
            reactions: [],
            isEdited: false,
            isPinned: false,
            readBy: []
        };

        return {
            conversations: state.conversations.map(c => {
                if (c.id === conversationId) {
                    return {
                        ...c,
                        messages: [...(c.messages || []), newMsg],
                        lastMessage: newMsg,
                        updatedAt: new Date()
                    };
                }
                return c;
            })
        };
    })
}));
