import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

export const AccountSettings = () => {
    const { user, token } = useAuth();
    const [settings, setSettings] = useState({
        language: "en",
        theme_mode: "system",
        content_filter_level: "standard"
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) return;
        fetch(`${API_URL}/settings/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.account) setSettings(data.account);
            });
    }, [token]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await fetch(`${API_URL}/settings/account`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });
            toast.success("Account settings updated");
        } catch (err) {
            toast.error("Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="glass-card p-6 space-y-6">
                <h3 className="font-bold text-lg border-b border-border/50 pb-2">General Preferences</h3>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Language</Label>
                        <select
                            value={settings.language}
                            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                            className="bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white"
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="jp">Japanese</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Theme Preference</Label>
                        <select
                            value={settings.theme_mode}
                            onChange={(e) => setSettings({ ...settings, theme_mode: e.target.value })}
                            className="bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white"
                        >
                            <option value="system">System Default</option>
                            <option value="dark">Dark Mode</option>
                            <option value="light">Light Mode</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Content Filter</Label>
                        <select
                            value={settings.content_filter_level}
                            onChange={(e) => setSettings({ ...settings, content_filter_level: e.target.value })}
                            className="bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white"
                        >
                            <option value="strict">Strict (No NSFW)</option>
                            <option value="standard">Standard (Blur NSFW)</option>
                            <option value="off">Off (Show All)</option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="glass-card p-6 space-y-6">
                <h3 className="font-bold text-lg border-b border-border/50 pb-2">Account Info</h3>
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Username</Label>
                        <Input value={user?.username || ""} disabled className="bg-muted/20" />
                        <p className="text-xs text-muted-foreground">Username changes are restricted.</p>
                    </div>
                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input value={user?.email || ""} disabled className="bg-muted/20" />
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
