import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

interface SkillData {
    skill: string;
    level: number;
    maxLevel: number;
}

interface SkillBreakdownCard {
    skill: string;
    level: number;
    aiScore: number;
    suggestion: string;
    color: string;
}

export const SkillRadarChart = () => {
    const [skills, setSkills] = useState<SkillData[]>([]);
    const [skillBreakdown, setSkillBreakdown] = useState<SkillBreakdownCard[]>([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const fetchAnalysis = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/ai/skill-analysis`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setSkills(data.radar_skills || []);
                setSkillBreakdown(data.skill_breakdown || []);
            }
        } catch (err) {
            console.error("AI analysis fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, []);

    if (loading) return <div className="glass-card p-12 text-center animate-pulse text-muted-foreground">Mapping your skills...</div>;
    if (skills.length === 0) return null;

    // Calculate polygon points for radar chart
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 120;
    const angleStep = (Math.PI * 2) / (skills.length || 1);

    const getPoint = (index: number, value: number) => {
        const angle = angleStep * index - Math.PI / 2;
        const radius = (value / 100) * maxRadius;
        return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    };

    const dataPoints = skills.map((skill, index) => getPoint(index, skill.level));
    const maxPoints = skills.map((_, index) => getPoint(index, 100));

    const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');
    const maxPolygon = maxPoints.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div className="glass-card p-6 space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
                <Target className="w-6 h-6 text-neon-blue" />
                Personal Skill Analysis
            </h3>

            {/* Radar Chart */}
            <div className="flex justify-center">
                <svg width="300" height="300" className="skill-radar overflow-visible">
                    {/* Background concentric circles */}
                    {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                        <polygon
                            key={i}
                            points={maxPoints.map(p => {
                                const scaledX = centerX + (p.x - centerX) * scale;
                                const scaledY = centerY + (p.y - centerY) * scale;
                                return `${scaledX},${scaledY}`;
                            }).join(' ')}
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Axis lines */}
                    {skills.map((_, index) => {
                        const point = getPoint(index, 100);
                        return (
                            <line
                                key={index}
                                x1={centerX}
                                y1={centerY}
                                x2={point.x}
                                y2={point.y}
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="1"
                            />
                        );
                    })}

                    {/* Max polygon (outline) */}
                    <polygon
                        points={maxPolygon}
                        fill="none"
                        stroke="rgba(0, 240, 255, 0.2)"
                        strokeWidth="2"
                    />

                    {/* Data polygon (filled) */}
                    <motion.polygon
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        points={dataPolygon}
                        fill="rgba(0, 240, 255, 0.2)"
                        stroke="#00F0FF"
                        strokeWidth="2"
                        style={{ transformOrigin: `${centerX}px ${centerY}px` }}
                    />

                    {/* Data points */}
                    {dataPoints.map((point, index) => (
                        <motion.circle
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 * index, duration: 0.3 }}
                            cx={point.x}
                            cy={point.y}
                            r="6"
                            fill="#00F0FF"
                            stroke="#000"
                            strokeWidth="2"
                        />
                    ))}

                    {/* Skill labels with improved positioning */}
                    {skills.map((skill, index) => {
                        const labelPoint = getPoint(index, 135);
                        return (
                            <text
                                key={index}
                                x={labelPoint.x}
                                y={labelPoint.y}
                                textAnchor="middle"
                                className="text-[10px] sm:text-xs fill-white/80 font-medium"
                                style={{ transform: 'translateY(4px)' }}
                            >
                                {skill.skill}
                            </text>
                        );
                    })}
                </svg>
            </div>

            {/* Skill Breakdown Cards */}
            <div className="space-y-4">
                <h4 className="text-lg font-bold">Detailed Breakdown</h4>
                {skillBreakdown.map((skill, index) => (
                    <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 * index }}
                        className="bg-black/30 rounded-lg p-4 border border-white/10 hover:border-neon-blue/30 transition-colors group"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h5 className="font-bold group-hover:text-neon-blue transition-colors">{skill.skill}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground">Level {skill.level}</span>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className={`text-xs text-${skill.color || 'neon-blue'} font-bold`}>
                                        AI Score: {skill.aiScore}%
                                    </span>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-bold`}>
                                Tier {skill.level > 7 ? 'Elite' : skill.level > 4 ? 'Pro' : 'Novice'}
                            </div>
                        </div>

                        {/* XP Progress Bar */}
                        <div className="mb-3">
                            <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${skill.aiScore}%` }}
                                    transition={{ delay: 0.3 * index, duration: 0.8 }}
                                    className="h-full bg-gradient-to-r from-neon-blue to-purple-500"
                                />
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground italic">
                            💡 Suggestion: {skill.suggestion}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
