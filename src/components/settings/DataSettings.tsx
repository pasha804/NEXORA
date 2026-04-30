import { Button } from "@/components/ui/button";
import { Download, Trash2, AlertTriangle } from "lucide-react";

export const DataSettings = () => {
    return (
        <div className="space-y-6">
            <section className="glass-card p-6 space-y-6">
                <h3 className="font-bold text-lg border-b border-border/50 pb-2">Your Data</h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                        <div>
                            <h4 className="font-bold">Download My Data</h4>
                            <p className="text-sm text-muted-foreground">Get a copy of your profile, posts, and settings.</p>
                        </div>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Request Export
                        </Button>
                    </div>
                </div>
            </section>

            <section className="glass-card p-6 space-y-6 border-destructive/30 bg-destructive/5">
                <h3 className="font-bold text-lg border-b border-destructive/20 pb-2 text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                </h3>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold">Deactivate Account</h4>
                            <p className="text-sm text-muted-foreground">Temporarily hide your profile and content.</p>
                        </div>
                        <Button variant="outline" className="border-destructive/50 hover:bg-destructive/10 text-destructive">Deactivate</Button>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-destructive/20">
                        <div>
                            <h4 className="font-bold text-destructive">Delete Account</h4>
                            <p className="text-sm text-muted-foreground">Permanently delete all your data. This cannot be undone.</p>
                        </div>
                        <Button variant="destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};
