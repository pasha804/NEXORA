import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DiscoverHeader } from "@/components/discover/DiscoverHeader";
import { DiscoverTabs, type DiscoverTab } from "@/components/discover/DiscoverTabs";
import { ForYouFeed } from "@/components/discover/ForYouFeed";
import { PeopleDiscovery } from "@/components/discover/PeopleDiscovery";
import { SkillsExplorer } from "@/components/discover/SkillsExplorer";
import { CommunitiesGrid } from "@/components/discover/CommunitiesGrid";
import { ProjectMarketplace } from "@/components/discover/ProjectMarketplace";
import { OpportunitiesBoard } from "@/components/discover/OpportunitiesBoard";
import { EventsCalendar } from "@/components/discover/EventsCalendar";
import { TrendingContent } from "@/components/discover/TrendingContent";
import { RealTimeIndicator, PullToRefresh } from "@/components/discover/EnhancedFeatures";
import { Sparkles } from "lucide-react";
import { RecommendationCards } from "@/components/profile/RecommendationCards";

const Discover = () => {
    const [activeTab, setActiveTab] = useState<DiscoverTab>("for-you");
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({});
    const [newUpdates, setNewUpdates] = useState(0);

    // Direct tab change — no fake loading, each child manages its own loading state
    const handleTabChange = (tab: DiscoverTab) => {
        setActiveTab(tab);
    };

    const handleRefresh = async () => {
        setNewUpdates(0);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "for-you":
                return <ForYouFeed searchQuery={searchQuery} filters={filters} />;
            case "people":
                return <PeopleDiscovery searchQuery={searchQuery} filters={filters} />;
            case "skills":
                return <SkillsExplorer searchQuery={searchQuery} filters={filters} />;
            case "communities":
                return <CommunitiesGrid searchQuery={searchQuery} filters={filters} />;
            case "projects":
                return <ProjectMarketplace searchQuery={searchQuery} filters={filters} />;
            case "opportunities":
                return <OpportunitiesBoard searchQuery={searchQuery} filters={filters} />;
            case "events":
                return <EventsCalendar searchQuery={searchQuery} filters={filters} />;
            case "trending":
                return <TrendingContent searchQuery={searchQuery} filters={filters} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-transparent relative">
            {/* Real-time Updates Indicator */}
            <RealTimeIndicator count={newUpdates} />

            {/* Pull to Refresh (Mobile) */}
            <PullToRefresh onRefresh={handleRefresh} />

            <main className="pt-8 pb-20 px-4">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Page Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                            <h1 className="font-display text-3xl md:text-4xl font-bold">
                                Discover <span className="gradient-text">Opportunities</span>
                            </h1>
                        </div>
                        <p className="text-muted-foreground text-lg mb-6">
                            Your AI-powered exploration hub for growth, connections, and new experiences
                        </p>
                    </motion.div>

                    {/* Search & Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <DiscoverHeader
                            onSearchChange={setSearchQuery}
                            onFilterChange={setFilters}
                        />
                    </motion.div>

                    {/* Tab Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <DiscoverTabs
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            newCounts={{
                                "for-you": newUpdates > 0 ? newUpdates : undefined
                            }}
                        />
                    </motion.div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            {renderTabContent()}
                        </motion.div>
                    </AnimatePresence>

                    {/* Recommendation Cards */}
                    {activeTab === "people" && (
                        <div className="mt-10">
                            <RecommendationCards />
                        </div>
                    )}
                </div>
            </main>

            {/* Premium animated mesh background — CSS only, no JS overhead */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
                {/* Orb 1 — primary blue */}
                <div
                    className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-[0.06]"
                    style={{
                        background: "hsl(var(--electric-blue))",
                        top: "10%",
                        left: "-10%",
                        animation: "mesh-orb-1 18s ease-in-out infinite alternate",
                    }}
                />
                {/* Orb 2 — purple */}
                <div
                    className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.06]"
                    style={{
                        background: "hsl(var(--neon-purple))",
                        bottom: "15%",
                        right: "-8%",
                        animation: "mesh-orb-2 14s ease-in-out infinite alternate",
                    }}
                />
                {/* Orb 3 — magenta */}
                <div
                    className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-[0.04]"
                    style={{
                        background: "hsl(var(--neon-magenta))",
                        top: "50%",
                        left: "40%",
                        animation: "mesh-orb-3 22s ease-in-out infinite alternate",
                    }}
                />
                {/* Grid overlay */}
                <div className="grid-pattern absolute inset-0" />
            </div>

            <style>{`
                @keyframes mesh-orb-1 {
                    from { transform: translate(0, 0) scale(1); }
                    to   { transform: translate(80px, 60px) scale(1.15); }
                }
                @keyframes mesh-orb-2 {
                    from { transform: translate(0, 0) scale(1); }
                    to   { transform: translate(-60px, -80px) scale(1.2); }
                }
                @keyframes mesh-orb-3 {
                    from { transform: translate(0, 0) scale(1); }
                    to   { transform: translate(-40px, 50px) scale(0.9); }
                }
            `}</style>
        </div>
    );
};

export default Discover;

