import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const CommunitySettings = () => {
    return (
        <div className="space-y-6">
            <section className="glass-card p-6 space-y-6">
                <h3 className="font-bold text-lg border-b border-border/50 pb-2">Server Permissions</h3>

                <div className="space-y-6">
                    {[
                        { id: "c_dm", label: "Allow Direct Messages from Server Members", desc: "Members of shared communities can message you.", checked: true },
                        { id: "c_inv", label: "Allow Server Invites", desc: "Allow people to invite you to new communities.", checked: true },
                        { id: "c_auto", label: "Auto-Join Skill Communities", desc: "Automatically join official servers when you add a skill.", checked: false },
                    ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">{item.label}</Label>
                                <p className="text-sm text-muted-foreground pr-4">
                                    {item.desc}
                                </p>
                            </div>
                            <Switch id={item.id} defaultChecked={item.checked} />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
