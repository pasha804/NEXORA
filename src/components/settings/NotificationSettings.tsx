import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

export const NotificationSettings = () => {
    const { token } = useAuth();
    const [settings, setSettings] = useState({
        email_notifications: true,
        battle_notifications: true,
        message_notifications: true,
        community_notifications: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) return;
        fetch(`${API_URL}/settings/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.notifications) setSettings(data.notifications);
            });
    }, [token]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await fetch(`${API_URL}/settings/notifications`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });
            toast.success("Notification settings updated");
        } catch (err) {
            toast.error("Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="glass-card p-6 space-y-6">
                <h3 className="font-bold text-lg border-b border-border/50 pb-2">Push Notifications</h3>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground pr-4">Receive emails about your account.</p>
                        </div>
                        <Switch
                            checked={settings.email_notifications}
                            onCheckedChange={(c) => setSettings({ ...settings, email_notifications: c })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Battle Notifications</Label>
                            <p className="text-sm text-muted-foreground pr-4">Get notified when challenged.</p>
                        </div>
                        <Switch
                            checked={settings.battle_notifications}
                            onCheckedChange={(c) => setSettings({ ...settings, battle_notifications: c })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Message Notifications</Label>
                            <p className="text-sm text-muted-foreground pr-4">Receive alerts for new messages.</p>
                        </div>
                        <Switch
                            checked={settings.message_notifications}
                            onCheckedChange={(c) => setSettings({ ...settings, message_notifications: c })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Community Notifications</Label>
                            <p className="text-sm text-muted-foreground pr-4">Updates from communities you joined.</p>
                        </div>
                        <Switch
                            checked={settings.community_notifications}
                            onCheckedChange={(c) => setSettings({ ...settings, community_notifications: c })}
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
