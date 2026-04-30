import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const MessagingSettings = () => {
    return (
        <div className="space-y-6">
            <section className="glass-card p-6 space-y-6">
                <h3 className="font-bold text-lg border-b border-border/50 pb-2">Direct Messaging</h3>

                <div className="grid gap-6">
                    <div className="space-y-2">
                        <Label>Who can send you messages?</Label>
                        <Select defaultValue="everyone">
                            <SelectTrigger className="w-full md:w-[300px]">
                                <SelectValue placeholder="Select permission" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="everyone">Everyone</SelectItem>
                                <SelectItem value="skills">Users with same skills</SelectItem>
                                <SelectItem value="followers">Followers only</SelectItem>
                                <SelectItem value="none">No one</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Filter Unknown Users</Label>
                            <p className="text-sm text-muted-foreground">Move messages from non-followers to requests.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </div>
            </section>

            <section className="glass-card p-6 space-y-6">
                <h3 className="font-bold text-lg border-b border-border/50 pb-2">Social Interactions</h3>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Friend Requests</Label>
                            <p className="text-sm text-muted-foreground">Allow people to send you friend requests.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Auto-Accept Collaborators</Label>
                            <p className="text-sm text-muted-foreground">Automatically befriend people you collaborate with.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </div>
            </section>
        </div>
    );
};
