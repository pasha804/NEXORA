import { useState } from "react";
import {
    User,
    Shield,
    Bell,
    Bot,
    MonitorPlay,
    Lock,
    Users,
    Database,
    Swords,
    MessageSquare,
    ChevronRight,
    Settings as SettingsIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { AISettings } from "@/components/settings/AISettings";
import { MessagingSettings } from "@/components/settings/MessagingSettings";
import { PvPSettings } from "@/components/settings/PvPSettings";
import { ContentSettings } from "@/components/settings/ContentSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { CommunitySettings } from "@/components/settings/CommunitySettings";
import { DataSettings } from "@/components/settings/DataSettings";
import { AccountSettings } from "@/components/settings/AccountSettings";

// Tab Definitions
const SETTINGS_TABS = [
    { id: "profile", label: "Profile & Skills", icon: User, description: "Manage your diverse professional identity" },
    { id: "account", label: "General Account", icon: SettingsIcon, description: "Language, Theme, and Preferences" },
    { id: "privacy", label: "Privacy & Visibility", icon: Lock, description: "Control who sees your data" },
    { id: "social", label: "Messaging & Social", icon: MessageSquare, description: "Manage permissions and interactions" },
    { id: "pvp", label: "PvP & Competition", icon: Swords, description: "Arena preferences and auto-match" },
    { id: "ai", label: "AI Personalization", icon: Bot, description: "Customize your AI Coach behavior" },
    { id: "content", label: "Creator & Content", icon: MonitorPlay, description: "Reels and posts visibility" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Manage alerts and pushes" },
    { id: "security", label: "Security", icon: Shield, description: "Password, 2FA, and Sessions" },
    { id: "community", label: "Community", icon: Users, description: "Server permissions and invites" },
    { id: "data", label: "Data & Account", icon: Database, description: "Export data or delete account" },
];

const Settings = () => {
    const [activeTab, setActiveTab] = useState("profile");

    const renderContent = () => {
        switch (activeTab) {
            case "profile": return <ProfileSettings />;
            case "account": return <AccountSettings />;
            case "privacy": return <PrivacySettings />;
            case "notifications": return <NotificationSettings />;
            case "ai": return <AISettings />;
            case "social": return <MessagingSettings />;
            case "pvp": return <PvPSettings />;
            case "content": return <ContentSettings />;
            case "security": return <SecuritySettings />;
            case "community": return <CommunitySettings />;
            case "data": return <DataSettings />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-64px)]">

                {/* Sidebar */}
                <aside className="w-full md:w-80 border-r border-border/50 bg-card/30 md:min-h-screen">
                    <div className="p-6 border-b border-border/50">
                        <h1 className="font-display text-2xl font-bold">Settings</h1>
                        <p className="text-sm text-muted-foreground">Manage your Nexora experience</p>
                    </div>

                    <nav className="p-4 space-y-1 overflow-x-auto md:overflow-visible flex md:block no-scrollbar">
                        {SETTINGS_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center w-full min-w-max p-3 rounded-lg transition-all text-left group ${activeTab === tab.id
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                                <div className="flex-1 mr-4">
                                    <div className={`font-medium text-sm ${activeTab === tab.id ? "font-bold" : ""}`}>{tab.label}</div>
                                </div>
                                {activeTab === tab.id && (
                                    <motion.div layoutId="active-pill" className="w-1 h-full absolute left-0 bg-primary rounded-r-full" />
                                )}
                                <ChevronRight className={`w-4 h-4 opacity-0 transition-opacity ${activeTab === tab.id ? "opacity-100" : "group-hover:opacity-50"}`} />
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content Area */}
                <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-3xl font-display font-bold mb-2">
                                {SETTINGS_TABS.find(t => t.id === activeTab)?.label}
                            </h2>
                            <p className="text-muted-foreground">
                                {SETTINGS_TABS.find(t => t.id === activeTab)?.description}
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Settings;
