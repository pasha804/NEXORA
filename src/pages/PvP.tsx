
import { useState } from "react";
import { PvPHero } from "@/components/pvp/PvPHero";
import { QuickMatchPanel } from "@/components/pvp/QuickMatchPanel";
import { LiveMatchesSlider } from "@/components/pvp/LiveMatchesSlider";
import { LeaderboardWidget } from "@/components/pvp/LeaderboardWidget";
import { PvPMatchHistory } from "@/components/pvp/PvPMatchHistory";
import { BattleRoom } from "@/components/pvp/battle/BattleRoom";
import { TournamentDiscovery } from "@/components/pvp/TournamentDiscovery";
import { TournamentDashboard } from "@/components/pvp/TournamentDashboard";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Swords, Layout } from "lucide-react";

const PvP = () => {
    const { user, token } = useAuth();
    const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
    const [view, setView] = useState<"arena" | "tournaments">("arena");
    const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-transparent">
            {/* Active Battle Overlay */}
            <AnimatePresence>
                {activeMatchId && (
                    <BattleRoom
                        matchId={activeMatchId}
                        onClose={() => setActiveMatchId(null)}
                    />
                )}
            </AnimatePresence>

            <main className="pt-8 pb-16 px-4">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Hero Section */}
                    <PvPHero />

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-xl w-fit">
                        <button
                            onClick={() => { setView("arena"); setSelectedTournamentId(null); }}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${view === "arena" ? "bg-neon-blue text-black shadow-glow-blue" : "text-gray-400 hover:text-white"
                                }`}
                        >
                            <Swords className="w-4 h-4" /> BATTLE ARENA
                        </button>
                        <button
                            onClick={() => setView("tournaments")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${view === "tournaments" ? "bg-neon-gold text-black shadow-glow-gold" : "text-gray-400 hover:text-white"
                                }`}
                        >
                            <Trophy className="w-4 h-4" /> TOURNAMENTS
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {view === "arena" ? (
                            <motion.div
                                key="arena"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid lg:grid-cols-3 gap-8"
                            >
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Quick Match & Actions */}
                                    <QuickMatchPanel onMatchFound={(id) => setActiveMatchId(id)} />

                                    {/* Live Matches */}
                                    <LiveMatchesSlider />

                                    {/* Battle History */}
                                    {user && token && (
                                        <PvPMatchHistory userId={user.id} token={token} />
                                    )}
                                </div>

                                {/* Right Sidebar */}
                                <div className="space-y-6">
                                    <LeaderboardWidget />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="tournaments"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                {selectedTournamentId ? (
                                    <TournamentDashboard
                                        tournamentId={selectedTournamentId}
                                        onBack={() => setSelectedTournamentId(null)}
                                    />
                                ) : (
                                    <TournamentDiscovery
                                        onSelectTournament={(id) => setSelectedTournamentId(id)}
                                    />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </main>
        </div>
    );
};


export default PvP;
