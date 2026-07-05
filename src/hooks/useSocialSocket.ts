import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useMessagingStore } from './useMessagingStore';
import { useNotificationStore } from './useNotificationStore';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const useSocialSocket = () => {
    const { user, token } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { addMessageToConversation, updateConversationStatus, updateTypingStatus } = useMessagingStore();
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        if (!user || !token) return;

        // Connect to the shared socket server using the /social namespace
        const socket = io(`${API_URL}/social`, {
            path: "/battle/socket.io",
            auth: {
                token: token,
                user_id: user.id
            }
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            console.log("[SOCIAL] Connected to WebSocket");
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log("[SOCIAL] Disconnected from WebSocket");
        });

        socket.on('MESSAGE_RECEIVED', (payload) => {
            console.log("[SOCIAL] Message received:", payload);
            addMessageToConversation(payload.room_id, {
                id: payload.id.toString(),
                senderId: payload.sender_id.toString(),
                content: payload.text,
                type: payload.type,
                createdAt: new Date(payload.created_at),
                status: 'delivered'
            });
        });

        socket.on('USER_STATUS', (payload) => {
            updateConversationStatus(payload.user_id, payload.status);
        });

        socket.on('USER_TYPING', (payload) => {
            updateTypingStatus(payload.room_id, payload.user_id, payload.is_typing);
        });

        socket.on('NEW_NOTIFICATION', (payload) => {
            if (payload.id) {
                addNotification(payload);
            }
            toast(payload.message, {
                description: payload.type === 'message' || payload.type === 'NEW_MESSAGE' ? 'Click to view' : '',
                action: payload.type === 'message' || payload.type === 'NEW_MESSAGE' ? {
                    label: 'View',
                    onClick: () => console.log("Navigate to room", payload.reference_id)
                } : undefined
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [user, token]);

    const sendMessage = (roomId: number, recipientId: number, text: string, type: string = "text") => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('send_message', {
                room_id: roomId,
                recipient_id: recipientId,
                text,
                type
            });
        }
    };

    const joinChat = (roomId: number) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('join_chat', { room_id: roomId });
        }
    };

    const emitTyping = (roomId: number, isTyping: boolean) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('typing', { room_id: roomId, is_typing: isTyping });
        }
    };

    return {
        isConnected,
        sendMessage,
        joinChat,
        emitTyping
    };
};
