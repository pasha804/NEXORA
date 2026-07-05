import { Bot, TrendingUp, Trophy, Send, Sparkles, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";

interface TrendingSkill {
    skill_name: string;
    engagement_volume: number;
}

interface Contributor {
    id: number;
    username: string;
    display_name?: string;
    avatar_url?: string;
    ranking_score: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const SidebarRight = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hi! I'm your Community AI. I can help you find mentors, summarize discussions, or suggest projects. What do you need?" }
    ]);
    const [input, setInput] = useState("");

    const { data: trendingSkills } = useQuery<TrendingSkill[]>({
        queryKey: ['trending-skills'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/skills/trending`);
            if (!res.ok) throw new Error("Failed to fetch trending skills");
            return res.json();
        }
    });

    const { data: contributors } = useQuery<any>({
        queryKey: ['top-contributors'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/search/users?limit=5`);
            if (!res.ok) throw new Error("Failed to fetch contributors");
            const data = await res.json();
            return data.users || [];
        }
    });

    const chatMutation = useMutation({
        mutationFn: async (msg: string) => {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ message: msg })
            });
            if (!res.ok) throw new Error("AI Chat failed");
            return res.json();
        },
        onSuccess: (data) => {
            setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
        }
    });

    const handleSend = () => {
        if (!input.trim() || chatMutation.isPending) return;
        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput("");
        chatMutation.mutate(userMsg);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 border-l border-white/10 p-4 gap-6 overflow-y-auto scrollbar-thin scroll-container">

            {/* AI Assistant Card */}
            <Card className="bg-gradient-to-br from-neon-purple/5 to-transparent border-neon-purple/20 overflow-hidden relative group">
                <div className="absolute inset-0 bg-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {!isChatOpen ? (
                    <>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                                <Bot className="w-4 h-4 text-neon-purple" />
                                AI Community Assistant
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                                I'm analyzing active discussions to help you grow. <br />
                                {trendingSkills && trendingSkills.length > 0 && (
                                    <span className="text-neon-purple/80 flex items-center gap-1 mt-1">
                                        <Sparkles className="w-3 h-3" /> Trending: {trendingSkills[0].skill_name}
                                    </span>
                                )}
                            </p>
                            <Button
                                size="sm"
                                onClick={() => setIsChatOpen(true)}
                                className="w-full bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple border border-neon-purple/50 text-xs"
                            >
                                Ask AI Assistant
                            </Button>
                        </CardContent>
                    </>
                ) : (
                    <div className="flex flex-col h-[350px]">
                        <div className="p-3 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                            <span className="text-xs font-bold text-neon-purple flex items-center gap-2"><Bot className="w-3 h-3" /> Assistant</span>
                            <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white"><X className="w-3 h-3" /></button>
                        </div>
                        <ScrollArea className="flex-1 p-3">
                            <div className="space-y-3">
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        {m.role === 'ai' && (
                                            <Avatar className="w-6 h-6 border border-neon-purple/20">
                                                <AvatarFallback className="bg-neon-purple/20 text-neon-purple text-[10px] font-bold">AI</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={`text-xs p-2 rounded-lg max-w-[85%] ${m.role === 'user' ? 'bg-primary/20 text-white border border-primary/30 ml-auto' : 'bg-zinc-900 text-gray-300 border border-white/5'} `}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                                {chatMutation.isPending && (
                                    <div className="flex gap-2">
                                        <Avatar className="w-6 h-6"><AvatarFallback className="bg-neon-purple/20 text-neon-purple text-[10px] animate-pulse">...</AvatarFallback></Avatar>
                                        <div className="bg-zinc-900 border border-white/5 p-2 rounded-lg">
                                            <Loader2 className="w-3 h-3 animate-spin text-neon-purple" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <div className="p-2 border-t border-white/10 flex gap-2">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                className="flex-1 bg-zinc-900 text-xs text-white px-2 py-1 rounded outline-none border border-white/5 focus:border-neon-purple/50"
                                placeholder="Ask anything..."
                                disabled={chatMutation.isPending}
                            />
                            <Button size="icon" className="h-6 w-6" onClick={handleSend} disabled={chatMutation.isPending || !input.trim()}>
                                <Send className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Trending */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Trending Skills
                </h3>
                <div className="space-y-2">
                    {trendingSkills?.slice(0, 4).map((s) => (
                        <div key={s.skill_name} className="text-sm text-white/80 hover:text-primary cursor-pointer transition-colors bg-white/5 p-2 rounded-md border border-white/5 hover:border-white/10 flex justify-between group">
                            #{s.skill_name.replace(/\s+/g, '')}
                            <span className="text-[10px] text-muted-foreground mt-0.5 group-hover:text-white transition-colors">{s.engagement_volume} learners</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Contributors */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                    <Trophy className="w-3 h-3 text-yellow-500" /> Top Community Members
                </h3>
                {contributors?.map((user: any, pos: number) => (
                    <div key={user.id} className="flex items-center justify-between text-sm text-white bg-white/5 p-2 rounded-md hover:bg-white/10 cursor-pointer transition-colors border border-white/5">
                        <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${pos === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-zinc-800 text-gray-400'}`}>
                                {pos + 1}
                            </div>
                            <Avatar className="w-5 h-5">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="text-[8px]">{user.username[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs truncate max-w-[100px]">{user.display_name || user.username}</span>
                        </div>
                        <span className="text-neon-blue font-mono text-[10px]">{user.ranking_score} XP</span>
                    </div>
                ))}
            </div>

        </div>
    );
};
