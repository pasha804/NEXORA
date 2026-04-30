import { Users, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const CommunityPresence = () => {
    return (
        <div className="glass-card p-6 space-y-6">
            <h3 className="font-display font-bold text-xl flex items-center gap-2 text-indigo-400">
                <Users className="w-5 h-5" />
                Communities
            </h3>

            <div className="space-y-4">
                {[
                    { name: "React Developers", members: "125k", role: "Contributor", icon: "⚛️" },
                    { name: "AI Revolution", members: "84k", role: "Member", icon: "🤖" },
                    { name: "Python Pros", members: "62k", role: "Moderator", icon: "🐍" },
                ].map((community) => (
                    <div key={community.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-xl">
                            {community.icon}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{community.name}</h4>
                            <p className="text-xs text-muted-foreground">{community.members} Members</p>
                        </div>
                        <Badge variant="outline" className="border-white/10 text-[10px] h-5">
                            {community.role}
                        </Badge>
                    </div>
                ))}
            </div>

            <div className="pt-2 border-t border-white/5">
                <h4 className="text-xs font-bold text-muted-foreground mb-2">Active Channels</h4>
                <div className="flex flex-wrap gap-2">
                    {["#help-react", "#showcase", "#general", "#pvp-lfg"].map(channel => (
                        <span key={channel} className="text-xs text-indigo-300/80 hover:text-indigo-300 hover:underline cursor-pointer flex items-center gap-0.5">
                            <Hash className="w-3 h-3" />
                            {channel.replace("#", "")}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
