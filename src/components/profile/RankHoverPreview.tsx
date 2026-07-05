import React from "react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRankInfoFromString } from "@/lib/rankSystem";
import { RankAura, RankParticles } from "./RankAura";
import { RankAvatarRing } from "./DynamicProfileTheme";
import { GrandmasterCrown } from "./GrandmasterEffects";
import { RankBadgeAnimated } from "./RankBadgeAnimated";

interface ProfileData {
    id?: number;
    display_name: string;
    username: string;
    avatar_url?: string;
    rank?: string;
    level?: number;
    prestige?: number;
}

interface RankHoverPreviewProps {
    profile: ProfileData;
    children: React.ReactNode;
}

export const RankHoverPreview = ({ profile, children }: RankHoverPreviewProps) => {
    const rankStr = profile.rank || "Novice";
    const rankInfo = getRankInfoFromString(rankStr);
    const isGrandmaster = rankInfo.tier === "Grandmaster";
    const isMaster = rankInfo.tier === "Master";
    const isHighRank = isGrandmaster || isMaster || rankInfo.tier === "Heroic";

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent 
                className={`w-80 p-0 overflow-hidden border-2 shadow-2xl ${
                    isGrandmaster ? 'border-amber-400/50 shadow-amber-500/20' :
                    isMaster ? 'border-red-500/50 shadow-red-600/20' :
                    'border-border shadow-black/50'
                }`}
                style={{
                    backgroundColor: 'hsl(var(--background))',
                }}
            >
                <div className="relative p-5">
                    {isGrandmaster && (
                        <>
                            <div className="absolute inset-0 pointer-events-none rgb-glow z-0 opacity-50" />
                            <div className="absolute inset-0 pointer-events-none cosmic-drift z-0 opacity-30" />
                        </>
                    )}
                    {isMaster && (
                        <div 
                            className="absolute inset-0 pointer-events-none z-0"
                            style={{ background: `radial-gradient(circle at 50% 0%, ${rankInfo.glowColor.replace(')', ', 0.15)')} 0%, transparent 70%)` }}
                        />
                    )}
                    
                    <div className="relative z-10 flex gap-4">
                        <div className="relative shrink-0 mt-2">
                            {isGrandmaster && <GrandmasterCrown className="absolute -top-6 left-1/2 -translate-x-1/2 scale-75" />}
                            <RankAura rank={rankStr} size="sm" intensity={isGrandmaster ? "high" : isHighRank ? "medium" : "low"} />
                            {isHighRank && <RankParticles rank={rankStr} count={isGrandmaster ? 6 : 3} />}
                            <RankAvatarRing rank={rankStr} size="w-16 h-16">
                                <Avatar className="w-16 h-16 border-2 border-background shadow-lg">
                                    <AvatarImage src={profile.avatar_url} />
                                    <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-purple-600 text-white">
                                        {profile.display_name?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </RankAvatarRing>
                        </div>
                        
                        <div className="flex-1 min-w-0 py-1">
                            <h4 className={`text-lg font-bold font-display truncate leading-tight ${
                                isGrandmaster ? "text-gradient-animated" :
                                isMaster ? "text-red-400 text-glow" :
                                "text-foreground"
                            }`}>
                                {profile.display_name}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate mb-2">@{profile.username}</p>
                            
                            <div className="flex items-center gap-2 mt-1">
                                <RankBadgeAnimated rank={rankStr} size="sm" />
                                <span className={`text-xs font-semibold ${isGrandmaster ? 'text-amber-300' : 'text-muted-foreground'}`}>
                                    Lvl {profile.level || 1}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};
