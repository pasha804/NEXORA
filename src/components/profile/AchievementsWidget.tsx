import { Award, Medal, Trophy } from "lucide-react";

export const AchievementsWidget = () => {
    return (
        <div className="glass-card p-6 space-y-6">
            <h3 className="font-display font-bold text-xl flex items-center gap-2 text-yellow-500">
                <Trophy className="w-5 h-5" />
                Achievements
            </h3>

            <div className="grid grid-cols-4 gap-2">
                {[
                    { name: "Early Adopter", color: "from-purple-500 to-indigo-600", icon: "🚀" },
                    { name: "PvP Champion", color: "from-red-500 to-orange-500", icon: "⚔️" },
                    { name: "Code Ninja", color: "from-emerald-500 to-green-600", icon: "💻" },
                    { name: "Mentor", color: "from-blue-400 to-cyan-400", icon: "🎓" },
                    { name: "Socialite", color: "from-pink-500 to-rose-500", icon: "🎉" },
                    { name: "Streak Master", color: "from-orange-400 to-yellow-500", icon: "🔥" },
                ].map((badge, i) => (
                    <div key={i} className="group relative aspect-square">
                        <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 transition-transform cursor-pointer`}>
                            {badge.icon}
                        </div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] whitespace-nowrap px-2 py-1 rounded pointer-events-none z-10">
                            {badge.name}
                        </div>
                    </div>
                ))}
                <div className="aspect-square rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center text-muted-foreground/50">
                    <span className="text-xs">+12</span>
                </div>
            </div>
        </div>
    );
};
