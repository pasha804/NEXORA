import { Button } from "@/components/ui/button";
import { Users, Shield, Share2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommunityHeaderProps {
    name: string;
    memberCount: string;
    onlineCount: string;
    bannerUrl?: string;
    logoUrl?: string;
    description: string;
    tags: string[];
}

export const CommunityHeader = ({
    name,
    memberCount,
    onlineCount,
    bannerUrl = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    logoUrl,
    description,
    tags
}: CommunityHeaderProps) => {
    return (
        <div className="relative border-b border-white/10 bg-zinc-950">
            {/* Banner Image */}
            <div className="h-48 w-full overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10" />
                <img
                    src={bannerUrl}
                    alt="Community Banner"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity bg-zinc-900"
                />
            </div>

            {/* Community Info Overlay */}
            <div className="px-8 pb-6 -mt-12 relative z-20 flex flex-col md:flex-row items-end md:items-center gap-6">

                {/* Logo */}
                <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-zinc-950 shadow-2xl rounded-2xl">
                        <AvatarImage src={logoUrl} className="rounded-2xl object-cover" />
                        <AvatarFallback className="rounded-2xl text-2xl font-bold bg-zinc-900">{name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-zinc-950" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 mb-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold text-white tracking-tight">{name}</h1>
                        <Shield className="w-5 h-5 text-blue-400 fill-blue-400/20" />
                    </div>

                    <p className="text-white/60 text-sm line-clamp-1 mb-3 max-w-2xl">
                        {description}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-medium text-white/50">
                        <span className="flex items-center gap-1.5 text-white/80">
                            <Users className="w-3.5 h-3.5" />
                            {memberCount} Members
                        </span>
                        <span className="flex items-center gap-1.5 text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            {onlineCount} Online
                        </span>
                        <div className="h-3 w-[1px] bg-white/10" />
                        <div className="flex gap-2">
                            {tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-white/70 hover:text-white hover:border-white/20 transition-colors cursor-pointer">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <Button variant="outline" size="icon" className="border-white/10 hover:bg-white/5 text-white">
                        <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="border-white/10 hover:bg-white/5 text-white">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20 px-6">
                        Join Community
                    </Button>
                </div>
            </div>
        </div>
    );
};
