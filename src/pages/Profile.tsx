import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Components
import { HeroProfileHeader } from "@/components/profile/HeroProfileHeader";
import { SkillReputation } from "@/components/profile/SkillReputation";
import { ContentShowcase } from "@/components/profile/ContentShowcase";
import { PvPStats } from "@/components/profile/PvPStats";
import { AIGrowth } from "@/components/profile/AIGrowth";
import { ProfessionalPortfolio } from "@/components/profile/ProfessionalPortfolio";
import { ProfileEditModal } from "@/components/profile/ProfileEditModal";
import { useSkillProgression } from "@/hooks/useSkillIntelligence";
import { SkillActivityTimeline } from "@/components/profile/SkillActivityTimeline";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editTab, setEditTab] = useState<"bio" | "skills" | "experience" | "education" | "projects">("bio");

    const isOwnProfile =
        !username ||
        username === "me" ||
        username === user?.username ||
        (user?.id && profile?.id === user.id);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            if (!token) { navigate("/auth"); return; }

            // Own profile — use /users/me for full profile fields
            if (!username || username === "me" || (user && username === user.username)) {
                const resp = await fetch(`${API_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (resp.ok) {
                    const data = await resp.json();
                    setProfile({
                        ...data,
                        display_name: data.display_name || data.username,
                        rank: data.rank || "Novice",
                        xp: data.xp || 0,
                        followers: data.followers_count || 0,
                        following: data.following_count || 0,
                    });
                } else {
                    // Fallback to useAuth user
                    if (user) setProfile({
                        ...user,
                        display_name: user.display_name || user.username,
                        rank: user.rank || "Novice",
                        xp: user.xp || 0,
                        followers: user.followers_count || 0,
                        following: user.following_count || 0,
                    });
                }
                return;
            }

            // Other user profile
            const resp = await fetch(`${API_URL}/users/${username}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!resp.ok) {
                if (resp.status === 404) { toast.error("User not found"); navigate("/discover"); return; }
                throw new Error("Failed to fetch profile");
            }

            const userData = await resp.json();
            setProfile({
                ...userData,
                display_name: userData.display_name || userData.username,
                rank: userData.rank_level || userData.rank || "Novice",
                xp: userData.xp_total || userData.xp || 0,
                followers: userData.followers_count || 0,
                following: userData.following_count || 0,
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    }, [username, user, navigate]);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    const skillOwnerId = profile?.id;
    const { data: skillProgress } = useSkillProgression(skillOwnerId);

    const openEdit = (tab: typeof editTab = "bio") => {
        setEditTab(tab);
        setEditing(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="space-y-4 w-full max-w-4xl px-4">
                    {/* Hero skeleton */}
                    <div className="glass-card animate-pulse">
                        <div className="h-48 bg-muted/30 rounded-t-2xl" />
                        <div className="p-8 flex gap-6 -mt-12">
                            <div className="w-32 h-32 rounded-full bg-muted/50 shrink-0" />
                            <div className="flex-1 space-y-3 pt-12">
                                <div className="h-6 bg-muted/50 rounded w-1/3" />
                                <div className="h-4 bg-muted/50 rounded w-1/4" />
                                <div className="h-4 bg-muted/50 rounded w-2/3" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
                <div className="max-w-md w-full rounded-2xl border border-border/50 bg-background/80 backdrop-blur p-6 text-center">
                    <h2 className="font-display text-xl font-bold mb-2">Profile unavailable</h2>
                    <p className="text-muted-foreground mb-4">We couldn't load this profile. Please try again.</p>
                    <button
                        className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-4 py-2"
                        onClick={fetchProfile}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pb-20">
            {/* Profile Edit Modal */}
            <ProfileEditModal
                open={editing}
                onClose={() => setEditing(false)}
                initialTab={editTab}
                refreshProfile={fetchProfile}
            />

            <div className="max-w-7xl mx-auto">
                <HeroProfileHeader
                    profile={profile}
                    isOwnProfile={!!isOwnProfile}
                    onEdit={() => openEdit("bio")}
                />

                <div className="grid lg:grid-cols-3 gap-6 px-4 md:px-8">
                    {/* Left Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        <SkillReputation
                            userId={skillOwnerId}
                            isOwnProfile={!!isOwnProfile}
                            onEdit={isOwnProfile ? () => openEdit("skills") : undefined}
                            skills={
                                skillProgress
                                    ? skillProgress.map(s => ({
                                        name: s.skill_name,
                                        level: s.skill_level,
                                        xp: s.skill_xp,
                                        endorsed: s.endorsement_count,
                                        verified: s.verified,
                                    }))
                                    : profile.skills
                            }
                        />
                        <PvPStats stats={profile.social_stats} />
                        <AIGrowth stats={profile.social_stats} />
                    </motion.div>

                    {/* Main Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        <ContentShowcase profile={profile} />

                        {/* Professional Portfolio with edit entry points */}
                        <div className="relative">
                            {isOwnProfile && (
                                <div className="flex gap-2 mb-4 flex-wrap">
                                    {[
                                        { label: "+ Add Experience", tab: "experience" as const },
                                        { label: "+ Add Education", tab: "education" as const },
                                        { label: "+ Add Project", tab: "projects" as const },
                                    ].map(({ label, tab }) => (
                                        <button
                                            key={tab}
                                            onClick={() => openEdit(tab)}
                                            className="text-xs text-primary border border-primary/30 hover:bg-primary/10 rounded-lg px-3 py-1.5 transition-all"
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <ProfessionalPortfolio 
                                profile={profile} 
                                isOwnProfile={!!isOwnProfile}
                                onEdit={openEdit}
                            />
                        </div>

                        <SkillActivityTimeline userId={profile.id} />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
