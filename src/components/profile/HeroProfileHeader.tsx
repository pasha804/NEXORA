import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Settings, Edit, MessageCircle, UserPlus, UserCheck,
    Swords, Share2, Loader2, Link2
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSkillBadges } from "@/hooks/useSkillIntelligence";
import { useAuth } from "@/hooks/useAuth";
import { FollowersModal } from "./FollowersModal";
import { getRankInfo, getRankInfoFromString } from "@/lib/rankSystem";
import { RankBadge } from "@/components/ui/RankBadge";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

interface ProfileData {
    id?: number;
    display_name: string;
    username: string;
    bio?: string;
    avatar_url?: string;
    banner_url?: string;
    is_verified?: boolean;
    followers?: number;
    followers_count?: number;
    following?: number;
    following_count?: number;
    friends?: number;
    rank?: string;
    level?: number;
    xp?: number;
    learning_goals?: string;
    collaboration_preference?: string;
    location?: string;
    website?: string;
    github_url?: string;
    linkedin_url?: string;
}

interface HeroProfileHeaderProps {
    profile: ProfileData;
    isOwnProfile: boolean;
    onEdit?: () => void;
}

export const HeroProfileHeader = ({ profile, isOwnProfile, onEdit }: HeroProfileHeaderProps) => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [messagingStatus, setMessagingStatus] = useState<{ can_message: boolean; reason: string } | null>(null);
    const [followersModal, setFollowersModal] = useState<{ open: boolean; tab: "followers" | "following" }>({
        open: false, tab: "followers"
    });

    const { data: badges } = useSkillBadges(
        profile && isOwnProfile ? currentUser?.id : undefined
    );

    useEffect(() => {
        if (!profile?.id || isOwnProfile) return;
        const token = localStorage.getItem("access_token");
        if (!token) return;

        fetch(`${API_URL}/messages/status/${profile.id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : null)
          .then(data => { if (data) setMessagingStatus(data); })
          .catch(() => {});

        fetch(`${API_URL}/social/is-following/${profile.id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : null)
          .then(data => { if (data) setIsFollowing(data.is_following || false); })
          .catch(() => {});
    }, [profile?.id, isOwnProfile]);

    const handleFollow = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return toast.error("Please login");
        if (!profile.id) return;
        setFollowLoading(true);
        try {
            const endpoint = isFollowing
                ? `${API_URL}/social/unfollow/${profile.id}`
                : `${API_URL}/social/follow/${profile.id}`;
            const resp = await fetch(endpoint, { method: "POST", headers: { "Authorization": `Bearer ${token}` } });
            if (resp.ok) {
                setIsFollowing(!isFollowing);
                toast.success(isFollowing ? "Unfollowed" : `Following ${profile.display_name}!`);
            } else {
                const data = await resp.json();
                toast.error(data.detail || "Failed");
            }
        } catch { toast.error("Network error"); }
        finally { setFollowLoading(false); }
    };

    const handleMessage = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return toast.error("Please login");
        if (!profile.id) return;
        if (messagingStatus && !messagingStatus.can_message) {
            toast.error(messagingStatus.reason === "no_connection"
                ? "Send a connection request first to message this person."
                : messagingStatus.reason);
            return;
        }
        try {
            const resp = await fetch(`${API_URL}/messages/room/get_or_create`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ recipient_id: profile.id })
            });
            if (resp.ok) { navigate("/messages"); }
            else { const data = await resp.json(); toast.error(data.detail || "Cannot open chat"); }
        } catch { toast.error("Network error"); }
    };

    const handleChallenge = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return toast.error("Please login");
        try {
            const resp = await fetch(`${API_URL}/pvp/queue/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ battle_type: "code_challenge" })
            });
            if (resp.ok) { toast.success("Challenge sent! Joining matchmaking..."); setTimeout(() => navigate("/pvp"), 1500); }
            else { const data = await resp.json(); toast.error(data.detail || "Failed to challenge"); }
        } catch { toast.error("Network error"); }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/profile/${profile.username}`;
        navigator.clipboard.writeText(url).then(
            () => toast.success("Profile link copied!"),
            () => toast.info(`Share: ${url}`)
        );
    };

    const followers = profile.followers ?? profile.followers_count ?? 0;
    const following = profile.following ?? profile.following_count ?? 0;
    const xp = profile.xp ?? 0;
    const level = profile.level ?? 1;
    const xpInLevel = xp % 1000;
    const xpToNext = 1000;

    // Rank info for dynamic styling
    const rankStr = profile.rank || "Novice";
    const rankInfo = getRankInfoFromString(rankStr);
    const isGrandmaster = rankInfo.tier === "Grandmaster";
    const isMaster = rankInfo.tier === "Master" || isGrandmaster;

    return (
        <div className="relative mb-8">
            {/* Grandmaster / Master ambient glow behind the whole card */}
            {isMaster && (
                <div
                    className="absolute inset-0 rounded-2xl pointer-events-none z-0"
                    style={{
                        boxShadow: `0 0 60px ${rankInfo.glowColor.replace(")", ", 0.25)")}`,
                        background: `radial-gradient(ellipse at 50% 0%, ${rankInfo.glowColor.replace(")", ", 0.08)")} 0%, transparent 70%)`,
                    }}
                />
            )}
            {/* Banner */}
            <div className="h-52 relative overflow-hidden rounded-t-none md:rounded-t-2xl bg-gradient-to-br from-primary/30 via-purple-600/20 to-pink-600/20">
                {profile.banner_url ? (
                    <img src={profile.banner_url} alt="Profile Banner" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-600/15 to-pink-600/20" />
                        {/* Grandmaster special banner effect */}
                        {isGrandmaster && (
                            <>
                                <motion.div
                                    className="absolute inset-0"
                                    style={{
                                        background: `radial-gradient(ellipse at 30% 50%, ${rankInfo.glowColor.replace(")", ", 0.25)")} 0%, transparent 60%),
                                                     radial-gradient(ellipse at 70% 30%, rgba(252,211,77,0.2) 0%, transparent 60%)`,
                                    }}
                                    animate={{ opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                                {/* Particle dots */}
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-1 h-1 rounded-full bg-amber-300"
                                        style={{
                                            left: `${10 + i * 12}%`,
                                            top: `${20 + (i % 3) * 25}%`,
                                            boxShadow: "0 0 6px rgba(252,211,77,0.8)",
                                        }}
                                        animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
                                    />
                                ))}
                            </>
                        )}
                        {!isGrandmaster && (
                            <div className="absolute inset-0 opacity-30" style={{
                                backgroundImage: `radial-gradient(ellipse at 20% 50%, hsl(var(--primary)/0.3) 0%, transparent 50%),
                                                  radial-gradient(ellipse at 80% 20%, hsl(270 80% 60%/0.3) 0%, transparent 50%)`,
                            }} />
                        )}
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: `linear-gradient(hsl(var(--primary)/0.3) 1px, transparent 1px),
                                              linear-gradient(90deg, hsl(var(--primary)/0.3) 1px, transparent 1px)`,
                            backgroundSize: "40px 40px"
                        }} />
                    </>
                )}
                {isOwnProfile && (
                    <button onClick={onEdit}
                        className="absolute top-4 right-4 bg-background/60 backdrop-blur border border-border/50 hover:bg-background/80 text-foreground p-2 rounded-lg transition-all opacity-0 hover:opacity-100"
                        title="Edit banner">
                        <Edit className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Card body */}
            <div className="bg-background/80 backdrop-blur border border-border/50 border-t-0 rounded-b-2xl px-6 md:px-8 pb-6 shadow-xl">
                <div className="flex flex-col md:flex-row gap-6 -mt-16 relative z-10">
                    {/* Avatar */}
                    <div className="relative self-start shrink-0">
                        {/* Grandmaster crown animation */}
                        {isGrandmaster && (
                            <motion.div
                                className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xl z-20 pointer-events-none"
                                animate={{ y: [0, -4, 0], rotate: [-3, 3, -3] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                👑
                            </motion.div>
                        )}
                        {/* Master/Grandmaster ring glow */}
                        {isMaster && (
                            <motion.div
                                className="absolute inset-0 rounded-full pointer-events-none"
                                style={{ boxShadow: `0 0 25px ${rankInfo.glowColor}` }}
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}
                        <Avatar className="w-32 h-32 border-4 border-background shadow-2xl ring-2 transition-all"
                            style={{ ringColor: rankInfo.glowColor }}
                        >
                            <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                            <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-purple-600 text-white">
                                {profile.display_name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {isOwnProfile && (
                            <button onClick={onEdit}
                                className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
                                title="Edit avatar">
                                <Edit className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 mt-2 md:mt-16">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                {/* Name + verified */}
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h1 className="text-2xl md:text-3xl font-bold font-display truncate">{profile.display_name}</h1>
                                    {profile.is_verified && (
                                        <Badge className="bg-blue-500 hover:bg-blue-600 shrink-0">✓ Verified</Badge>
                                    )}
                                </div>

                                {/* Skill badges */}
                                {badges && badges.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {badges.slice(0, 4).map(badge => (
                                            <Badge key={badge.badge_id} variant="outline" className="border-primary/40 bg-primary/5 text-xs">
                                                ★ {badge.skill_name} Verified
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <p className="text-muted-foreground text-sm mb-2">@{profile.username}</p>

                                <div className="mb-3 flex items-center gap-2">
                                    <RankBadge rank={profile.rank || "Novice"} size="sm" showStars animated />
                                    <span className="text-xs text-muted-foreground">Level {level}</span>
                                </div>

                                <p className="text-foreground/80 text-sm max-w-2xl mb-3 leading-relaxed">
                                    {profile.bio || (isOwnProfile ? "Add a bio to tell people about yourself →" : "No bio yet")}
                                </p>
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                                    {profile.location && <span className="flex items-center gap-1">📍 {profile.location}</span>}
                                    {profile.website && (
                                        <a href={profile.website} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1 hover:text-primary transition-colors">
                                            <Link2 className="w-3 h-3" />
                                            {profile.website.replace(/^https?:\/\//, "")}
                                        </a>
                                    )}
                                </div>

                                {(profile.learning_goals || profile.collaboration_preference) && (
                                    <div className="flex flex-wrap gap-3 mb-3">
                                        {profile.learning_goals && (
                                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 flex-1 min-w-[180px]">
                                                <span className="text-[10px] uppercase tracking-wider text-primary font-bold block mb-0.5">Learning Goals</span>
                                                <p className="text-xs text-foreground/80">{profile.learning_goals}</p>
                                            </div>
                                        )}
                                        {profile.collaboration_preference && (
                                            <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-2 flex-1 min-w-[180px]">
                                                <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold block mb-0.5">Collaboration</span>
                                                <p className="text-xs text-foreground/80">{profile.collaboration_preference}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Clickable follower/following counts */}
                                <div className="flex flex-wrap gap-6 text-sm">
                                    <button
                                        className="group text-left hover:opacity-80 transition-opacity"
                                        onClick={() => setFollowersModal({ open: true, tab: "followers" })}
                                    >
                                        <span className="font-bold text-lg group-hover:text-primary transition-colors">{followers.toLocaleString()}</span>
                                        <span className="text-muted-foreground ml-1">Followers</span>
                                    </button>
                                    <button
                                        className="group text-left hover:opacity-80 transition-opacity"
                                        onClick={() => setFollowersModal({ open: true, tab: "following" })}
                                    >
                                        <span className="font-bold text-lg group-hover:text-primary transition-colors">{following.toLocaleString()}</span>
                                        <span className="text-muted-foreground ml-1">Following</span>
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 lg:flex-col lg:w-auto shrink-0">
                                {isOwnProfile ? (
                                    <>
                                        <Button variant="default" onClick={onEdit} className="gap-2">
                                            <Edit className="w-4 h-4" />Edit Profile
                                        </Button>
                                        <Button variant="outline" onClick={() => navigate("/settings")} className="gap-2">
                                            <Settings className="w-4 h-4" />Settings
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={handleShare} title="Share profile">
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant={isFollowing ? "outline" : "default"}
                                            onClick={handleFollow}
                                            disabled={followLoading}
                                            className="gap-2 min-w-[120px]"
                                        >
                                            {followLoading ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : isFollowing ? <><UserCheck className="w-4 h-4" />Following</>
                                                : <><UserPlus className="w-4 h-4" />Follow</>}
                                        </Button>
                                        <Button variant="outline" onClick={handleMessage} className="gap-2">
                                            <MessageCircle className="w-4 h-4" />Message
                                        </Button>
                                        <Button variant="outline" onClick={handleChallenge}
                                            className="gap-2 border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400">
                                            <Swords className="w-4 h-4" />Challenge
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={handleShare} title="Share profile">
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* XP Progress Bar */}
                        <div className="mt-4 max-w-sm">
                            <div className="flex justify-between text-xs font-medium mb-1.5">
                                <span className="text-muted-foreground">Level {level}</span>
                                <span className="text-primary">{xpInLevel.toLocaleString()} / {xpToNext.toLocaleString()} XP</span>
                            </div>
                            <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, (xpInLevel / xpToNext) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Followers / Following Modal */}
            {profile.id && (
                <FollowersModal
                    open={followersModal.open}
                    onClose={() => setFollowersModal(prev => ({ ...prev, open: false }))}
                    userId={profile.id}
                    initialTab={followersModal.tab}
                    followersCount={followers}
                    followingCount={following}
                    isOwnProfile={isOwnProfile}
                />
            )}
        </div>
    );
};
