import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const SecuritySettings = () => {
    const { token } = useAuth();
    const [twoFactor, setTwoFactor] = useState(false);

    useEffect(() => {
        if (!token) return;
        fetch(`${API_URL}/settings/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.account?.two_factor_enabled) setTwoFactor(true);
            });
    }, [token]);

    const handleToggle2FA = async (checked: boolean) => {
        setTwoFactor(checked);
        try {
            await fetch(`${API_URL}/settings/account`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ two_factor_enabled: checked })
            });
            toast.success(`2FA ${checked ? "Enabled" : "Disabled"}`);
        } catch (err) {
            toast.error("Failed to update 2FA");
            setTwoFactor(!checked); // revert
        }
    };

    return (
        <div className="space-y-6">
            <section className="glass-card p-6 space-y-6">
                <h3 className="font-bold text-lg border-b border-border/50 pb-2">Login & Security</h3>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Current Password</Label>
                        <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>New Password</Label>
                            <Input type="password" placeholder="••••••••" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Confirm Password</Label>
                            <Input type="password" placeholder="••••••••" />
                        </div>
                    </div>
                    <Button variant="outline">Update Password</Button>
                </div>

                <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Label>Two-Factor Authentication</Label>
                                <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full">Recommended</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Secure your account with 2FA.</p>
                        </div>
                        <Switch checked={twoFactor} onCheckedChange={handleToggle2FA} />
                    </div>
                </div>
            </section>

            <section className="glass-card p-6 space-y-6">
                <h3 className="font-bold text-lg border-b border-border/50 pb-2">Active Sessions</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                            <MonitorIcon className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Windows PC - Chrome</p>
                                <p className="text-xs text-green-400">Active Now • Bangalore, IN</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 opacity-60">
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">iPhone 15 - App</p>
                                <p className="text-xs text-muted-foreground">2 hrs ago • Bangalore, IN</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive h-8">Revoke</Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Helper icon
const MonitorIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
);
