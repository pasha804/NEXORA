import { useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/realtime/ws";

export const useSocket = () => {
    const { token } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!token) return;

        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log("WebSocket Connected");
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("WS Message:", message);
            // Handle global events (e.g. invalidate react-query)
        };

        ws.onclose = () => {
            console.log("WebSocket Disconnected");
            setIsConnected(false);
        };

        socketRef.current = ws;

        return () => {
            ws.close();
        };
    }, [token]);

    const sendMessage = (data: any) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(data));
        }
    };

    return { isConnected, sendMessage };
};
