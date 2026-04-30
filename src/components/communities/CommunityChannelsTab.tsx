import { ScrollArea } from "@/components/ui/scroll-area";
import { Hash, Volume2, Plus, Settings, Search, Send, Paperclip, Smile } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CHANNELS = [
    { id: "general", name: "general", type: "text" },
    { id: "help-qa", name: "help-qa", type: "text" },
    { id: "showcase", name: "showcase", type: "text" },
    { id: "resources", name: "resources", type: "text" },
    { id: "voice-lounge", name: "Lounge", type: "voice" },
];

const MESSAGES: any[] = [];

export const CommunityChannelsTab = () => {
    return (
        <div className="flex h-[600px] border border-white/10 rounded-xl overflow-hidden bg-zinc-950">
            {/* Channels Sidebar */}
            <div className="w-64 bg-zinc-900/50 border-r border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Find channel..." className="pl-8 h-9 bg-zinc-950/50 border-white/10 text-xs" />
                    </div>
                </div>
                <ScrollArea className="flex-1 p-3">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between px-2 py-1 text-xs font-bold text-muted-foreground uppercase group cursor-pointer hover:text-white">
                            <span>Text Channels</span>
                            <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </div>
                        {CHANNELS.filter(c => c.type === 'text').map(channel => (
                            <button key={channel.id} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors group">
                                <Hash className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                                {channel.name}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-1 mt-6">
                        <div className="flex items-center justify-between px-2 py-1 text-xs font-bold text-muted-foreground uppercase group cursor-pointer hover:text-white">
                            <span>Voice Channels</span>
                            <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </div>
                        {CHANNELS.filter(c => c.type === 'voice').map(channel => (
                            <button key={channel.id} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors group">
                                <Volume2 className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                                {channel.name}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-3 bg-zinc-950/80 border-t border-white/10 flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>ME</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">Current User</p>
                        <p className="text-[10px] text-muted-foreground truncate">Online</p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7"><Settings className="w-3 h-3" /></Button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-zinc-950 relative">
                <div className="h-12 border-b border-white/10 flex items-center px-4 justify-between bg-zinc-900/30">
                    <div className="flex items-center gap-2">
                        <Hash className="w-5 h-5 text-gray-400" />
                        <h3 className="font-bold text-white">general</h3>
                        <span className="text-xs text-muted-foreground ml-2 hidden sm:inline-block">General discussion about React</span>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                    {MESSAGES.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-20">
                            <Hash className="w-12 h-12 mb-4 opacity-20" />
                            <p>Welcome to #general</p>
                            <p className="text-sm">This is the start of the channel.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {MESSAGES.map(msg => (
                                <div key={msg.id} className="flex gap-3 group hover:bg-white/[0.02] p-2 rounded-lg -mx-2 transition-colors">
                                    <Avatar className="h-9 w-9 mt-0.5 border border-white/10">
                                        <AvatarImage src={msg.avatar} />
                                        <AvatarFallback>{msg.user[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-bold text-white hover:underline cursor-pointer">{msg.user}</span>
                                            <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 border-t border-white/10 bg-zinc-900/30">
                    <div className="bg-zinc-800/50 rounded-lg flex items-center px-4 py-2 gap-3 border border-white/5 focus-within:border-primary/50 transition-colors">
                        <button className="text-gray-400 hover:text-white"><Paperclip className="w-5 h-5" /></button>
                        <input className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-500" placeholder="Message #general" />
                        <button className="text-gray-400 hover:text-white"><Smile className="w-5 h-5" /></button>
                        <button className="text-primary hover:text-primary/80"><Send className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};
