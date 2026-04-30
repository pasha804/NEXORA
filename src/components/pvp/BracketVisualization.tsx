import { motion } from "framer-motion";
import { Trophy, Swords, ShieldQuestion } from "lucide-react";

interface Match {
    id: number;
    round_number: number;
    match_number: number;
    player1_id: number | null;
    player2_id: number | null;
    winner_id: number | null;
    match_status: string;
}

export const BracketVisualization = ({ matches, participantsCount }: { matches: Match[], participantsCount: number }) => {
    // Group matches by round
    const rounds = [...new Set(matches.map(m => m.round_number))].sort((a, b) => a - b);

    return (
        <div className="flex gap-16 min-w-max px-4">
            {rounds.map((round) => (
                <div key={round} className="space-y-12 flex flex-col justify-around">
                    <div className="text-center">
                        <span className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            ROUND {round}
                        </span>
                    </div>

                    <div className="space-y-8">
                        {matches.filter(m => m.round_number === round).sort((a, b) => a.match_number - b.match_number).map((match) => (
                            <div key={match.id} className="relative group">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`w-64 rounded-xl border p-3 space-y-2 relative z-10 transition-all ${match.match_status === "in_progress"
                                            ? "bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                            : "bg-black/40 border-white/10 hover:border-white/20"
                                        }`}
                                >
                                    {/* Player 1 */}
                                    <div className={`flex items-center justify-between p-2 rounded-lg ${match.winner_id && match.player1_id === match.winner_id ? "bg-neon-gold/10 text-neon-gold" : "text-gray-400"
                                        }`}>
                                        <div className="flex items-center gap-2 truncate">
                                            <div className={`w-2 h-2 rounded-full ${match.player1_id ? "bg-neon-blue" : "bg-zinc-800"}`} />
                                            <span className="text-xs font-bold truncate">
                                                {match.player1_id ? `Player ${match.player1_id}` : "TBD"}
                                            </span>
                                        </div>
                                        {match.winner_id && match.player1_id === match.winner_id && <Trophy className="w-3 h-3" />}
                                    </div>

                                    <div className="h-px bg-white/5 mx-2" />

                                    {/* Player 2 */}
                                    <div className={`flex items-center justify-between p-2 rounded-lg ${match.winner_id && match.player2_id === match.winner_id ? "bg-neon-gold/10 text-neon-gold" : "text-gray-400"
                                        }`}>
                                        <div className="flex items-center gap-2 truncate">
                                            <div className={`w-2 h-2 rounded-full ${match.player2_id ? "bg-neon-pink" : "bg-zinc-800"}`} />
                                            <span className="text-xs font-bold truncate">
                                                {match.player2_id ? `Player ${match.player2_id}` : "TBD"}
                                            </span>
                                        </div>
                                        {match.winner_id && match.player2_id === match.winner_id && <Trophy className="w-3 h-3" />}
                                    </div>

                                    {/* Connection Lines (Visual logic handles alignment) */}
                                    <div className="absolute -right-16 top-1/2 w-16 h-px bg-white/5 pointer-events-none" />
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* The Champion Slot */}
            <div className="flex flex-col justify-center items-center">
                <div className="text-center mb-12">
                    <span className="px-4 py-1 rounded-full bg-neon-gold/10 border border-neon-gold/30 text-[10px] font-black uppercase tracking-widest text-neon-gold">
                        CHAMPION
                    </span>
                </div>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-48 aspect-square rounded-3xl bg-gradient-to-br from-neon-gold/20 to-black border-2 border-neon-gold/30 flex flex-col items-center justify-center relative shadow-[0_0_50px_rgba(255,184,0,0.1)] group"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614850523296-62c0af47517a?q=80')] opacity-10 bg-cover mix-blend-overlay" />
                    <Trophy className="w-16 h-16 text-neon-gold mb-4 group-hover:rotate-12 transition-transform duration-500" />
                    <span className="text-[10px] font-black text-neon-gold tracking-widest">HALL OF FAME</span>
                </motion.div>
            </div>
        </div>
    );
};
