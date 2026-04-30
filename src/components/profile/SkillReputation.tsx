import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, ThumbsUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { endorseSkill, useSkillEndorsements } from "@/hooks/useSkillIntelligence";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SkillReputationProps {
    userId?: number;
    isOwnProfile?: boolean;
    onEdit?: () => void;
    skills?: {
        name: string;
        level: number;
        xp: number;
        endorsed?: number;
        verified?: boolean;
    }[];
}

export const SkillReputation = ({ userId, isOwnProfile, onEdit, skills = [] }: SkillReputationProps) => {
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();

    const { data: endorsements } = useSkillEndorsements(userId);

    const mutation = useMutation({
        mutationFn: async (params: { skillName: string; action: "add" | "remove" }) => {
            if (!userId) throw new Error("Missing user id");
            return endorseSkill(userId, params.skillName, params.action);
        },
        onSuccess: () => {
            if (userId) {
                queryClient.invalidateQueries({ queryKey: ["skill-progression", userId] });
                queryClient.invalidateQueries({ queryKey: ["skill-endorsements", userId] });
            }
        },
    });

    const canEndorse = !!currentUser && !!userId && !isOwnProfile;

    // Sort by level/xp
    const sortedSkills = [...skills].sort((a, b) => b.level - a.level);

    return (
        <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Skill Reputation
                </h3>
                {isOwnProfile && onEdit && (
                    <button
                        onClick={onEdit}
                        className="text-xs text-primary border border-primary/30 hover:bg-primary/10 rounded-lg px-2.5 py-1 transition-all"
                    >
                        + Edit Skills
                    </button>
                )}
            </div>

            {sortedSkills.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                    No skills added yet.
                </div>
            ) : (
                <div className="space-y-5">
                    {sortedSkills.map((skill) => {
                        const hasEndorsed = !!endorsements?.some(
                            (e) =>
                                e.skill_name.toLowerCase() === skill.name.toLowerCase() &&
                                e.endorser_user_id === currentUser?.id
                        );

                        const handleToggleEndorse = async () => {
                            if (!canEndorse) return;
                            try {
                                const action: "add" | "remove" = hasEndorsed ? "remove" : "add";
                                await mutation.mutateAsync({ skillName: skill.name, action });
                                toast.success(
                                    action === "add"
                                        ? `Endorsed ${skill.name}`
                                        : `Removed endorsement for ${skill.name}`
                                );
                            } catch (err: any) {
                                toast.error(err?.message || "Unable to update endorsement");
                            }
                        };

                        return (
                            <div key={skill.name} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{skill.name}</span>
                                    {skill.verified && <CheckCircle2 className="w-3 h-3 text-primary" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                        {skill.endorsed || 0} Endorsements
                                    </span>
                                    {canEndorse && (
                                        <Button
                                            variant={hasEndorsed ? "secondary" : "outline"}
                                            size="xs"
                                            className="h-6 px-2 text-[10px]"
                                            onClick={handleToggleEndorse}
                                            disabled={mutation.isPending}
                                        >
                                            <ThumbsUp className="w-3 h-3 mr-1" />
                                            {hasEndorsed ? "Endorsed" : "Endorse"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-neon-purple"
                                    style={{ width: `${(skill.level / 5) * 100}%` }}
                                />
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}

            {/* Secondary Skills — real skills beyond top 5 */}
            {sortedSkills.length > 5 && (
                <div className="pt-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3">More Skills</h4>
                    <div className="flex flex-wrap gap-2">
                        {sortedSkills.slice(5).map(skill => (
                            <Badge key={skill.name} variant="outline" className="border-white/10 hover:bg-white/5">
                                {skill.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
