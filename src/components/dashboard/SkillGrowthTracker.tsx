import { motion } from "framer-motion";
import { TrendingUp, Award, Zap } from "lucide-react";

export const SkillGrowthTracker = () => {
    const skills = [
        { name: "React", level: 5, progress: 65, color: "bg-primary" },
        { name: "Node.js", level: 3, progress: 40, color: "bg-neon-green" },
        { name: "Python", level: 2, progress: 85, color: "bg-neon-purple" },
        { name: "UI/UX", level: 4, progress: 30, color: "bg-secondary" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 h-full"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Growth Tracker
                </h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    Weekly Report
                </span>
            </div>

            <div className="flex items-center gap-4 mb-8">
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            className="stroke-muted"
                            strokeWidth="4"
                            fill="transparent"
                        />
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            className="stroke-primary"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={175}
                            strokeDashoffset={175 - (175 * 0.75)}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-bold text-lg">Lvl 5</span>
                    </div>
                </div>
                <div>
                    <div className="text-sm font-medium text-muted-foreground">Total XP</div>
                    <div className="font-display font-bold text-2xl">3,500</div>
                    <div className="text-xs text-neon-green flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        +420 this week
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {skills.map((skill) => (
                    <div key={skill.name}>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium">{skill.name}</span>
                            <span className="text-muted-foreground text-xs">Lvl {skill.level}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full ${skill.color}`}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};
