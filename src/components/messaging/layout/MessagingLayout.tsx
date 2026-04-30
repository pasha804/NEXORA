import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMessagingStore } from "@/hooks/useMessagingStore";

interface MessagingLayoutProps {
    sidebarContent: ReactNode;
    chatContent: ReactNode;
    infoPanelContent: ReactNode;
}

export const MessagingLayout = ({
    sidebarContent,
    chatContent,
    infoPanelContent,
}: MessagingLayoutProps) => {
    const { isRightPanelOpen, mobileView } = useMessagingStore();

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-black/95">
            {/* LEFT PANEL - Sidebar (Conversation List) */}
            <AnimatePresence mode="wait">
                <motion.div
                    className={`${mobileView === "list" ? "flex" : "hidden lg:flex"
                        } w-full lg:w-80 xl:w-96 flex-col border-r border-white/10 bg-zinc-950/50 backdrop-blur-xl z-20`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {sidebarContent}
                </motion.div>
            </AnimatePresence>

            {/* CENTER PANEL - Chat Window */}
            <motion.div
                className={`${mobileView === "chat" ? "flex" : "hidden lg:flex"
                    } flex-1 flex-col bg-transparent relative z-10`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                {chatContent}
            </motion.div>

            {/* RIGHT PANEL - Info Drawer */}
            <AnimatePresence>
                {isRightPanelOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "320px", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={`${mobileView === "info" ? "flex w-full absolute inset-0 z-30" : "hidden xl:flex"
                            } flex-col border-l border-white/10 bg-zinc-950/80 backdrop-blur-xl h-full`}
                    >
                        {infoPanelContent}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Info View Overlay */}
            {mobileView === 'info' && (
                <motion.div
                    className="lg:hidden absolute inset-0 z-50 bg-background"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                >
                    {infoPanelContent}
                </motion.div>
            )}
        </div>
    );
};
