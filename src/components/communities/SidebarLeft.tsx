import { Plus, Compass, Hash, Shield, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CreateCommunityModal } from "./CreateCommunityModal";
import { useQuery } from "@tanstack/react-query";

// Types
interface Community {
    id: number;
    name: string;
    slug: string;
    logo_url?: string;
    member_count: number;
}

const fetchMyCommunities = async (): Promise<Community[]> => {
    const token = localStorage.getItem("access_token");
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";
    const res = await fetch(`${API_URL}/communities/me`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch communities');
    return res.json();
};

const fetchDiscoverCommunities = async (): Promise<Community[]> => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";
    const res = await fetch(`${API_URL}/communities/discover`);
    if (!res.ok) throw new Error('Failed to fetch communities to discover');
    return res.json();
};

export const SidebarLeft = () => {
    const { data: joinedCommunities, isLoading: isJoinedLoading } = useQuery({
        queryKey: ['my-communities'],
        queryFn: fetchMyCommunities
    });

    const { data: discoverCommunities, isLoading: isDiscoverLoading } = useQuery({
        queryKey: ['discover-communities'],
        queryFn: fetchDiscoverCommunities
    });

    return (
        <div className="flex flex-col h-full bg-zinc-950/80 backdrop-blur-md">
            {/* Header / Title */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
                <h2 className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    COMMUNITIES
                </h2>
                <CreateCommunityModal />
            </div>

            {/* Navigation Lists */}
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-6">
                    {/* Joined Communities */}
                    <div className="space-y-1">

                        <h3 className="text-xs font-bold text-muted-foreground uppercase px-2 mb-2">Joined</h3>

                        {isJoinedLoading ? (
                            <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                        ) : joinedCommunities?.length === 0 ? (
                            <p className="text-xs text-muted-foreground px-2 py-2">You haven't joined any communities yet.</p>
                        ) : (
                            joinedCommunities?.map((c) => (
                                <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors">
                                    <Avatar className="w-8 h-8 rounded-lg border border-white/10">
                                        <AvatarImage src={c.logo_url} />
                                        <AvatarFallback className="rounded-lg bg-zinc-900 text-xs font-bold">{c.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">{c.name}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{c.member_count} members</p>
                                    </div>
                                    {/* Unread indicator */}
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100" />
                                </div>
                            ))
                        )}
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Discover */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase px-2 mb-2">Discover</h3>
                        {isDiscoverLoading ? (
                            <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                        ) : discoverCommunities?.map((c) => (
                            <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors opacity-80 hover:opacity-100">
                                <Avatar className="h-9 w-9 border border-white/10 group-hover:border-neon-purple/50 transition-colors rounded-lg overflow-hidden">
                                    <AvatarImage src={c.logo_url} />
                                    <AvatarFallback className="rounded-lg bg-zinc-900 border border-white/5">{c.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-medium text-white truncate">{c.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{c.member_count} members</p>
                                </div>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full hover:bg-white/10 text-primary">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};
