import { create } from 'zustand';

interface NotificationData {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    related_id?: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationState {
    notifications: NotificationData[];
    unreadCount: number;
    initialized: boolean;
    setNotifications: (notifications: NotificationData[]) => void;
    addNotification: (notification: NotificationData) => void;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    initialized: false,

    setNotifications: (notifications) => set({
        notifications,
        unreadCount: notifications.filter((n) => !n.is_read).length,
        initialized: true,
    }),

    addNotification: (notification) => set((state) => {
        const exists = state.notifications.some((n) => n.id === notification.id);
        if (exists) return state;
        return {
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
        };
    }),

    markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
    })),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
    })),
}));
