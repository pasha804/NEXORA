import { motion } from "framer-motion";
import { Trophy, Users, Zap, Calendar } from "lucide-react";

export const TournamentBracket = () => {
    const rounds: any[] = [];

    return (
        <div className="w-full overflow-x-auto pb-8 custom-scrollbar">
            {rounds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Trophy className="w-12 h-12 mb-4 opacity-20" />
                    <p>No active tournaments.</p>
                </div>
            ) : (
                <div className="min-w-[800px] flex justify-between gap-8 px-4">
                    {rounds.map((round, rIndex) => (
                        <div key={rIndex} className="flex-1 flex flex-col justify-around gap-8 min-w-[200px]">
                            <div className="text-center mb-4">
                                <h3 className="text-neon-blue font-bold uppercase tracking-widest text-sm">{round.name}</h3>
                            </div>

                            <div className="flex flex-col justify-around h-full gap-8">
                                {round.matches.map((match, mIndex) => (
                                    <motion.div
                                        key={match.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: rIndex * 0.2 + mIndex * 0.1 }}
                                        className="bg-black/40 border border-white/10 rounded-lg p-3 relative group hover:border-neon-blue/50 transition-colors"
                                    >
                                        {/* Connector Lines (Left) - if not first round */}
                                        {rIndex > 0 && (
                                            <div className="absolute top-1/2 -left-4 w-4 h-[1px] bg-white/10" />
                                        )}

                                        {/* Connector Lines (Right) - if not last round */}
                                        {rIndex < rounds.length - 1 && (
                                            <div className="absolute top-1/2 -right-4 w-4 h-[1px] bg-white/10" />
                                        )}

                                        <div className={`flex justify-between items-center mb-2 p-1 rounded ${match.winner === match.p1 ? 'bg-neon-blue/10 text-white font-bold' : 'text-gray-400'}`}>
                                            <span className="text-xs">{match.p1}</span>
                                            {match.winner === match.p1 && <Trophy className="w-3 h-3 text-neon-blue" />}
                                        </div>
                                        <div className={`flex justify-between items-center p-1 rounded ${match.winner === match.p2 ? 'bg-neon-blue/10 text-white font-bold' : 'text-gray-400'}`}>
                                            <span className="text-xs">{match.p2}</span>
                                            {match.winner === match.p2 && <Trophy className="w-3 h-3 text-neon-blue" />}
                                        </div>

                                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full opacity-0 group-hover:opacity-100 transition-opacity pl-4 z-10 pointer-events-none">
                                            <div className="bg-[#111] border border-white/20 rounded px-2 py-1 text-[10px] text-white whitespace-nowrap">
                                                Score: {match.score}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
