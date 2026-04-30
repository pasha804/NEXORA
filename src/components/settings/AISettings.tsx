import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export const AISettings = () => {
    return (
        <div className="space-y-6">
            <section className="glass-card p-6 space-y-6">
                <h3 className="font-bold text-lg border-b border-border/50 pb-2">AI Coach Preferences</h3>

                <div className="space-y-6">
                    {[
                        { id: "ai_mentor", label: "Enable AI Mentor", desc: "Allow AI to analyze your code and suggest improvements.", checked: true },
                        { id: "ai_match", label: "Collaboration Matching", desc: "Use AI to find compatible coding partners for you.", checked: true },
                        { id: "ai_job", label: "Career Opportunities", desc: "Suggest jobs based on your skills and growth.", checked: false },
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

                <div className="pt-4 space-y-4">
                    <div className="flex justify-between">
                        <Label>Recommendation Aggressiveness</Label>
                        <span className="text-xs text-muted-foreground">Balanced</span>
                    </div>
                    <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
                    <p className="text-xs text-muted-foreground">Adjust how often the AI intervenes with suggestions.</p>
                </div>
            </section>
        </div>
    );
};
