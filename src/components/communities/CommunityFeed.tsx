import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CommunityHeader } from "./CommunityHeader";
import { CommunityFeedTab } from "./CommunityFeedTab";
import { CommunityChannelsTab } from "./CommunityChannelsTab";
import { CommunityEventsTab } from "./CommunityEventsTab";
import { CommunityProjectsTab } from "./CommunityProjectsTab";
import { CommunityLearningTab } from "./CommunityLearningTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

export const CommunityFeed = () => {
    const [activeTab, setActiveTab] = useState("feed");

    const TABS = [
        { id: "feed", label: "Feed" },
        { id: "channels", label: "Channels" },
        { id: "events", label: "Events & PvP" },
        { id: "learning", label: "Learning Hub" },
        { id: "projects", label: "Projects" },
    ];

    return (
        <div className="flex-1 flex flex-col bg-zinc-950/50">
            {/* Header Component */}
            <CommunityHeader
                name="React Developers"
                description="The largest community for React & Next.js developers. Share projects, find teammates, and level up together."
                memberCount="45k"
                onlineCount="1,240"
                tags={["React", "Next.js", "Frontend", "JavaScript"]}
            />

            {/* Main Content Area with integrated Tabs */}
            <Tabs defaultValue="feed" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                {/* Sticky Tab Bar */}
                <div className="px-6 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
                    <TabsList className="h-12 bg-transparent p-0 w-full justify-start gap-6">
                        {TABS.map(tab => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-white data-[state=active]:bg-transparent text-muted-foreground hover:text-white/80 transition-all text-sm font-medium px-0 pb-2 pt-2 relative"
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* Tab Content Panels */}
                <ScrollArea className="flex-1">
                    <div className="p-6 max-w-5xl mx-auto min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === "feed" && (
                                    <TabsContent value="feed" className="mt-0 outline-none">
                                        <CommunityFeedTab />
                                    </TabsContent>
                                )}

                                {activeTab === "channels" && (
                                    <TabsContent value="channels" className="mt-0 outline-none">
                                        <CommunityChannelsTab />
                                    </TabsContent>
                                )}

                                {activeTab === "events" && (
                                    <TabsContent value="events" className="mt-0 outline-none">
                                        <CommunityEventsTab />
                                    </TabsContent>
                                )}

                                {activeTab === "learning" && (
                                    <TabsContent value="learning" className="mt-0 outline-none">
                                        <CommunityLearningTab />
                                    </TabsContent>
                                )}

                                {activeTab === "projects" && (
                                    <TabsContent value="projects" className="mt-0 outline-none">
                                        <CommunityProjectsTab />
                                    </TabsContent>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </Tabs>
        </div>
    );
};
