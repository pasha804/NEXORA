import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, Share2, MoreHorizontal, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CommunityPost {
    id: number;
    title?: string;
    content: string;
    type: string;
    created_at: string;
    author_id: number;
}

interface CommunityFeedTabProps {
    slug?: string;
}

const fetchCommunityFeed = async (slug: string): Promise<CommunityPost[]> => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const res = await fetch(`${API_URL}/communities/${slug}/feed`);
    if (!res.ok) throw new Error('Failed to fetch feed');
    return res.json();
};

export const CommunityFeedTab = ({ slug = "react-devs" }: CommunityFeedTabProps) => {

    const { data: posts, isLoading } = useQuery({
        queryKey: ['community-feed', slug],
        queryFn: () => fetchCommunityFeed(slug)
    });

    return (
        <div className="space-y-6 pb-20">
            {/* Create Post Input */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex gap-4 items-start focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                <Avatar className="w-10 h-10 border border-white/10">
                    <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                    <input
                        type="text"
                        placeholder="What's on your mind? Share code, ideas, or questions..."
                        className="w-full bg-transparent outline-none text-white placeholder:text-muted-foreground text-sm font-medium"
                    />
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-muted-foreground hover:text-white">Image</Button>
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-muted-foreground hover:text-white">Code</Button>
                        </div>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">Post</Button>
                    </div>
                </div>
            </div>

            {/* Posts Feed */}
            {isLoading ? (
                <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : posts?.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">No posts yet. Be the first to share!</div>
            ) : (
                posts?.map(post => (
                    <div key={post.id} className="bg-zinc-900 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-3">
                                <Avatar className="w-10 h-10 border border-white/10">
                                    <AvatarFallback>U{post.author_id}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-white text-sm">User {post.author_id}</h3>
                                        <span className="text-xs text-muted-foreground">• {new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mt-1 font-medium border border-primary/20">
                                        {post.type}
                                    </p>
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white"><MoreHorizontal className="w-4 h-4" /></Button>
                        </div>

                        <div className="mb-4 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </div>

                        {/* Interactive Footer */}
                        <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                            <button className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors text-sm group/btn">
                                <span className="p-1.5 rounded-full group-hover/btn:bg-red-500/10 transition-colors"><Heart className="w-4 h-4" /></span>
                                0
                            </button>
                            <button className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors text-sm group/btn">
                                <span className="p-1.5 rounded-full group-hover/btn:bg-blue-500/10 transition-colors"><MessageSquare className="w-4 h-4" /></span>
                                0
                            </button>
                            <button className="flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors text-sm group/btn ml-auto">
                                <span className="p-1.5 rounded-full group-hover/btn:bg-green-500/10 transition-colors"><Share2 className="w-4 h-4" /></span>
                                Share
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
