import { useMessagingStore } from "@/hooks/useMessagingStore";
import { User, Check, X, Bell, MoreHorizontal, Flag, Ban, Share2, FileText, Image, Link as LinkIcon, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export const InfoPanel = () => {
    const { activeConversationId, conversations, toggleRightPanel, setMobileView } = useMessagingStore();
    const activeConversation = conversations.find(c => c.id === activeConversationId);

    if (!activeConversation) return null;

    const otherUser = activeConversation.participants.find(p => p.id !== "current-user");
    const displayName = activeConversation.name || otherUser?.name || "Unknown";

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                <h3 className="font-display font-bold text-lg text-white">Details</h3>
                <Button variant="ghost" size="icon" onClick={() => {
                    // If on mobile, this should close the view essentially
                    if (window.innerWidth < 1024) {
                        setMobileView('chat');
                    }
                    toggleRightPanel();
                }} className="text-muted-foreground hover:text-white">
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scroll-container">
                {/* Profile Section */}
                <div className="p-6 flex flex-col items-center border-b border-white/5">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-3xl mb-4 border-2 border-white/10 p-1">
                        <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                            {otherUser?.avatar ? <img src={otherUser.avatar} alt={displayName} className="w-full h-full object-cover" /> : displayName[0]}
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">{displayName}</h2>
                    <p className="text-sm text-muted-foreground mb-4">@{otherUser?.username || "user"}</p>

                    <div className="flex gap-2 w-full justify-center mb-6">
                        <Button className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20" size="sm">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </Button>
                        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white" size="sm">
                            <Bell className="w-4 h-4 mr-2" />
                            Mute
                        </Button>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-2 justify-center w-full">
                        {otherUser?.skills.map(skill => (
                            <span key={skill.id} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 flex items-center gap-1.5">
                                <span>{skill.icon}</span>
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tabs for Shared Content */}
                <div className="p-6">
                    <Tabs defaultValue="media" className="w-full">
                        <TabsList className="w-full grid grid-cols-3 bg-white/5 mb-4">
                            <TabsTrigger value="media">Media</TabsTrigger>
                            <TabsTrigger value="files">Files</TabsTrigger>
                            <TabsTrigger value="links">Links</TabsTrigger>
                        </TabsList>

                        <TabsContent value="media" className="mt-0">
                            <div className="grid grid-cols-3 gap-2">
                                {/* Placeholders */}
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-square rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer group">
                                        <Image className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="files" className="space-y-2 mt-0">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">Project_Specs_v2.pdf</p>
                                    <p className="text-xs text-muted-foreground">2.4 MB • Today</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
                                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                                    <Github className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">main_algorithm.ts</p>
                                    <p className="text-xs text-muted-foreground">12 KB • Yesterday</p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="links" className="space-y-2 mt-0">
                            <div className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                                    <LinkIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-primary mb-0.5">figma.com</p>
                                    <p className="text-sm font-medium text-white leading-tight mb-1 group-hover:text-primary transition-colors">Nexora Dashboard Design System</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Settings Actions */}
                <div className="p-6 pt-2 space-y-4">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Privacy & Support</h4>

                    <div className="space-y-1">
                        <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors text-sm text-white">
                            <span className="flex items-center gap-3">
                                <Share2 className="w-4 h-4 text-muted-foreground" />
                                Create Group with User
                            </span>
                        </button>
                        <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            <span className="flex items-center gap-3">
                                <Ban className="w-4 h-4" />
                                Block User
                            </span>
                        </button>
                        <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors text-sm text-zinc-400 hover:text-white">
                            <span className="flex items-center gap-3">
                                <Flag className="w-4 h-4" />
                                Report Conversation
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
