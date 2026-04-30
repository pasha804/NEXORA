import { useEffect } from "react";
import { MessagingLayout } from "@/components/messaging/layout/MessagingLayout";
import { ConversationList } from "@/components/messaging/panels/ConversationList";
import { ChatWindow } from "@/components/messaging/panels/ChatWindow";
import { InfoPanel } from "@/components/messaging/panels/InfoPanel";
import { useMessagingStore } from "@/hooks/useMessagingStore";

const Messages = () => {
    const { setActiveConversation } = useMessagingStore();

    // Cleanup or init logic can go here
    useEffect(() => {
        // Optional: Reset active convo or fetch real data
    }, []);

    return (
        <div className="h-[calc(100vh-0px)] overflow-hidden bg-black">
            {/* 
                We might need to adjust the height depending on if there is a global navbar.
                Assuming AppLayout provides the navbar, Messages page takes the content area.
                The MessagingLayout has h-[calc(100vh-4rem)] assuming navbar is 4rem. 
                Let's double check AppLayout if needed, but this is a safe default.
             */}
            <MessagingLayout
                sidebarContent={<ConversationList />}
                chatContent={<ChatWindow />}
                infoPanelContent={<InfoPanel />}
            />
        </div>
    );
};

export default Messages;
