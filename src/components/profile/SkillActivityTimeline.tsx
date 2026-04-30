import { Badge } from "@/components/ui/badge";
import { useSkillActivity } from "@/hooks/useSkillIntelligence";
import { Clock, Zap, CheckCircle2, ThumbsUp } from "lucide-react";

interface SkillActivityTimelineProps {
  userId?: number;
}

export const SkillActivityTimeline = ({ userId }: SkillActivityTimelineProps) => {
  const { data: activity } = useSkillActivity(userId);

  if (!userId) return null;

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Skill Activity
        </h3>
      </div>

      {!activity || activity.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent skill activity yet.</p>
      ) : (
        <div className="space-y-3">
          {activity.slice(0, 15).map((entry) => {
            let label = "";
            let Icon = Zap;
            let badgeVariant: "default" | "secondary" = "secondary";

            if (entry.action_type === "xp_gain") {
              label = `Gained XP in ${entry.skill_name || "a skill"}`;
              Icon = Zap;
              badgeVariant = "secondary";
            } else if (entry.action_type === "verified") {
              label = `Verified in ${entry.skill_name || "a skill"}`;
              Icon = CheckCircle2;
              badgeVariant = "default";
            } else if (entry.action_type === "endorsement_received") {
              label = `Received an endorsement for ${entry.skill_name || "a skill"}`;
              Icon = ThumbsUp;
              badgeVariant = "secondary";
            } else if (entry.action_type === "proof_added") {
              label = `Added proof for ${entry.skill_name || "a skill"}`;
              Icon = CheckCircle2;
              badgeVariant = "secondary";
            } else if (entry.action_type === "xp_decay") {
              label = `XP decayed for ${entry.skill_name || "a skill"}`;
              Icon = Clock;
              badgeVariant = "secondary";
            } else {
              label = entry.action_type;
            }

            const createdAt = entry.created_at
              ? new Date(entry.created_at).toLocaleString()
              : "";

            return (
              <div key={entry.id} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-foreground">{label}</p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{createdAt}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {entry.metadata?.amount && (
                      <Badge variant={badgeVariant} className="text-[10px]">
                        +{entry.metadata.amount} XP
                      </Badge>
                    )}
                    {entry.metadata?.proof_type && (
                      <Badge variant="outline" className="text-[10px]">
                        {entry.metadata.proof_type}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

