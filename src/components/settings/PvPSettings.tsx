import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const PvPSettings = () => {
    return (
        <div className="space-y-6">
            <section className="glass-card p-6 space-y-6">
                <h3 className="font-bold text-lg border-b border-border/50 pb-2">Arena Preferences</h3>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>PvP Status</Label>
                            <p className="text-sm text-muted-foreground">Appear available for quick matches.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Auto-Match</Label>
                            <p className="text-sm text-muted-foreground">Automatically accept matches within range.</p>
                        </div>
                        <Switch />
                    </div>

                    <div className="space-y-2">
                        <Label>Preferred Difficulty</Label>
                        <Select defaultValue="balanced">
                            <SelectTrigger className="w-full md:w-[300px]">
                                <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="easy">Casual (-200 ELO)</SelectItem>
                                <SelectItem value="balanced">Balanced (+/- 50 ELO)</SelectItem>
                                <SelectItem value="hard">Hard (+200 ELO)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </section>

            <section className="glass-card p-6 space-y-6">
                <h3 className="font-bold text-lg border-b border-border/50 pb-2">Privacy</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Show Rank Publicly</Label>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label>Show Match History</Label>
                        <Switch defaultChecked />
                    </div>
                </div>
            </section>
        </div>
    );
};
