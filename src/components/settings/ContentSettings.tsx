import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ContentSettings = () => {
    return (
        <div className="space-y-6">
            <section className="glass-card p-6 space-y-6">
                <h3 className="font-bold text-lg border-b border-border/50 pb-2">Creator Controls</h3>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Who can comment on your Reels?</Label>
                        <Select defaultValue="everyone">
                            <SelectTrigger className="w-full md:w-[300px]">
                                <SelectValue placeholder="Select permission" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="everyone">Everyone</SelectItem>
                                <SelectItem value="followers">Followers Only</SelectItem>
                                <SelectItem value="none">No One</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Allow Remixing</Label>
                            <p className="text-sm text-muted-foreground">Let others create reels using your audio.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </div>
            </section>

            <section className="glass-card p-6 space-y-6 border-gold/20 bg-gradient-to-br from-yellow-500/5 to-transparent">
                <h3 className="font-bold text-lg border-b border-border/50 pb-2 text-yellow-500">Monetization</h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span>Eligibility Status</span>
                        <span className="font-bold text-green-400">Eligible</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        You meet the requirements to earn from your content.
                    </p>
                </div>
            </section>
        </div>
    );
};
