import { useState, useEffect } from "react";
import { Lock, Eye, MessageSquare, Activity } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const PrivacySettings = () => {
    const { token } = useAuth();
    const [settings, setSettings] = useState({
        profile_visibility: "public",
        allow_messages: "everyone",
        show_activity_status: true,
        show_battle_history: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) return;
        fetch(`${API_URL}/settings/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.privacy) setSettings(data.privacy);
            });
    }, [token]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await fetch(`${API_URL}/settings/privacy`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });
            toast.success("Privacy settings updated");
        } catch (err) {
            toast.error("Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="glass-card p-6 space-y-6">
                <h3 className="font-bold text-lg border-b border-border/50 pb-2">Account Privacy</h3>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <label className="text-base font-medium text-white">Profile Visibility</label>
                            <p className="text-sm text-muted-foreground pr-4">Control who can see your full profile</p>
                        </div>
                        <select
                            value={settings.profile_visibility}
                            onChange={(e) => setSettings({ ...settings, profile_visibility: e.target.value })}
                            className="bg-black/50 border border-white/10 rounded px-3 py-1 text-sm text-white"
                        >
                            <option value="public">Public</option>
                            <option value="followers">Followers Only</option>
                            <option value="private">Private</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <label className="text-base font-medium text-white">Online Status</label>
                            <p className="text-sm text-muted-foreground pr-4">Show when you are active on Nexora.</p>
                        </div>
                        <Switch
                            checked={settings.show_activity_status}
                            onCheckedChange={(c) => setSettings({ ...settings, show_activity_status: c })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <label className="text-base font-medium text-white">Show Battle History</label>
                            <p className="text-sm text-muted-foreground pr-4">Display your PvP wins/losses.</p>
                        </div>
                        <Switch
                            checked={settings.show_battle_history}
                            onCheckedChange={(c) => setSettings({ ...settings, show_battle_history: c })}
                        />
                    </div>
                </div>
            </section>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading} className="bg-neon-blue text-black font-bold">
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
};
