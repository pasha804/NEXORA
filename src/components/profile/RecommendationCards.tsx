import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserPlus, UserCheck, Loader2, TrendingUp, Zap, Award, Flame, Sparkles, Code2, Bot } from "lucide-react";
import { toast } from "sonner";
import { getRankInfoFromString } from "@/lib/rankSystem";
import { RankBadge } from "@/components/ui/RankBadge";
import { RankAura } from "./RankAura";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface RecommendationSection {
  title: string;
  icon: React.ReactNode;
  description: string;
  endpoint?: string;
  filterFn?: (users: any[]) => any[];
}

const SECTIONS: RecommendationSection[] = [
  {
    title: "Trending Developers",
    icon: <TrendingUp className="w-4 h-4 text-green-400" />,
    description: "Most active developers right now",
  },
  {
    title: "Top Ranked Players",
    icon: <Award className="w-4 h-4 text-yellow-400" />,
    description: "Highest ranked players on the platform",
  },
  {
    title: "Rising Stars",
    icon: <Flame className="w-4 h-4 text-orange-400" />,
    description: "Fastest growing developers",
  },
  {
    title: "AI Experts",
    icon: <Bot className="w-4 h-4 text-purple-400" />,
    description: "Top AI/ML specialists",
    filterFn: (users) => users.filter(u =>
      u.skills?.some((s: any) => {
        const name = typeof s === "string" ? s : s.name;
        return name?.toLowerCase().includes("ai") || name?.toLowerCase().includes("ml") || name?.toLowerCase().includes("machine learning");
      })
    ),
  },
  {
    title: "Competitive Developers",
    icon: <Code2 className="w-4 h-4 text-cyan-400" />,
    description: "Top PvP competitors",
  },
  {
    title: "Legendary Creators",
    icon: <Sparkles className="w-4 h-4 text-pink-400" />,
    description: "Most influential content creators",
  },
];

export const RecommendationCards = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const params = new URLSearchParams({ page: "1", limit: "30", sort: "xp_high" });
        const resp = await fetch(`${API_URL}/search/users?${params}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (resp.ok) {
          const data = await resp.json();
          const usersData = data?.data?.users || data?.users || [];
          setUsers(usersData);
        }
      } catch (err) {
        console.error("Failed to fetch recommended users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const section = SECTIONS[activeSection];
  let sectionUsers = users;
  if (section.filterFn) {
    sectionUsers = section.filterFn(users);
  }
  sectionUsers = sectionUsers.slice(0, 5);

  const handleConnect = async (userId: number) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_URL}/connections/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiver_id: userId }),
      });
      toast.success("Connection request sent!");
    } catch {
      toast.error("Failed to send request");
    }
  };

  if (loading) {
    return (
      <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-5 rounded-2xl">
        <h3 className="font-display font-black text-lg mb-4 flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-primary" />
          DISCOVERY
        </h3>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-full bg-white/5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-white/5 rounded w-2/3" />
                <div className="h-2 bg-white/5 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[100px] pointer-events-none group-hover:bg-primary/30 transition-colors" />

      <h3 className="font-display font-black text-lg mb-1 flex items-center gap-2 text-white tracking-tighter">
        <Sparkles className="w-5 h-5 text-primary" />
        {section.title.toUpperCase()}
      </h3>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6">{section.description}</p>

      {/* Section tabs */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {SECTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSection(i)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
              activeSection === i
                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* User list */}
      <div className="space-y-3">
        {sectionUsers.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-8 font-medium">No elite users found</p>
        ) : (
          sectionUsers.map((u: any, i: number) => {
            const rankInfo = getRankInfoFromString(u.rank || "Novice");
            const isHighRank = ["Diamond", "Heroic", "Master", "Grandmaster"].includes(rankInfo.tier);
            const theme = rankInfo.theme;

            return (
              <motion.div
                key={u.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 group/item relative overflow-hidden`}
                onClick={() => window.location.href = `/profile/${u.username}`}
              >
                {/* Individual Item Rank Glow */}
                {isHighRank && (
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover/item:opacity-10 transition-opacity"
                    style={{ background: `radial-gradient(circle at 0% 50%, ${theme.primary}, transparent 70%)` }}
                  />
                )}

                <div className="relative shrink-0">
                  <Avatar className="w-11 h-11 ring-2 transition-transform duration-300 group-hover/item:scale-110" style={{ ringColor: isHighRank ? theme.primary : 'rgba(255,255,255,0.05)' }}>
                    <AvatarImage src={u.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-gray-800 text-white text-xs font-black">
                      {(u.display_name || u.username || "U")[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isHighRank && (
                    <div className="absolute -inset-0.5 rounded-full blur-sm opacity-50"
                      style={{ background: theme.primary }}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-white truncate tracking-tight">{u.display_name || u.username}</span>
                    {rankInfo.isGrandmaster && <span className="text-xs">👑</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-[9px] font-black uppercase tracking-widest ${rankInfo.isGrandmaster ? 'text-gradient-animated' : ''}`} style={{ color: !rankInfo.isGrandmaster ? theme.primary : undefined }}>
                      {u.rank || "Novice"}
                    </div>
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-0.5">
                      <Zap className="w-2 h-2" /> Lv {u.level || 1}
                    </span>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-xl shrink-0 text-white/20 hover:text-white hover:bg-white/10 transition-all"
                  onClick={(e) => { e.stopPropagation(); handleConnect(u.id); }}
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </motion.div>
            );
          })
        )}
      </div>

      <Button className="w-full mt-6 rounded-xl bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-[10px] h-10 shadow-xl">
        View All Leaders
      </Button>
    </div>
  );
};

export const TrendingCreators = () => {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const resp = await fetch(`${API_URL}/search/users?page=1&limit=8&sort=most_followed`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (resp.ok) {
          const data = await resp.json();
          const usersData = data?.data?.users || data?.users || [];
          setCreators(usersData);
        }
      } catch (err) {
        console.error("Failed to fetch creators:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white/5 border border-white/5 rounded-3xl p-6 min-w-[180px] space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 mx-auto" />
            <div className="h-3 bg-white/5 rounded w-3/4 mx-auto" />
            <div className="h-2 bg-white/5 rounded w-1/2 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {creators.map((creator, i) => {
        const rankInfo = getRankInfoFromString(creator.rank || "Novice");
        const theme = rankInfo.theme;
        const isHighRank = ["Diamond", "Heroic", "Master", "Grandmaster"].includes(rankInfo.tier);

        return (
          <motion.div
            key={creator.id || i}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -8 }}
            className="bg-black/40 backdrop-blur-xl border border-white/5 p-6 min-w-[180px] cursor-pointer text-center hover:border-white/20 hover:bg-black/60 transition-all shrink-0 rounded-[2rem] shadow-2xl group relative overflow-hidden"
            onClick={() => navigate(`/profile/${creator.username}`)}
          >
             {/* Rank Ambient Background */}
             {isHighRank && (
               <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity"
                 style={{ background: `radial-gradient(circle at 50% 100%, ${theme.primary}, transparent 70%)` }}
               />
             )}

            <div className="relative inline-block mb-4">
              <div className="relative">
                <RankAura rank={creator.rank || "Novice"} size="sm" intensity="low" />
                <Avatar className="w-16 h-16 mx-auto ring-2 shadow-2xl transition-transform duration-500 group-hover:scale-110" style={{ ringColor: isHighRank ? theme.primary : 'rgba(255,255,255,0.05)' }}>
                  <AvatarImage src={creator.avatar_url} className="object-cover" />
                  <AvatarFallback className="bg-gray-800 text-white font-black text-xl">
                    {(creator.display_name || creator.username || "U")[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              {rankInfo.isGrandmaster && (
                <span className="absolute -top-2 -right-2 text-xl select-none">👑</span>
              )}
            </div>

            <h4 className="font-black text-sm text-white truncate tracking-tight mb-1 group-hover:text-primary transition-colors">
              {creator.display_name || creator.username}
            </h4>
            
            <div className={`text-[9px] font-black uppercase tracking-widest ${rankInfo.isGrandmaster ? 'text-gradient-animated' : ''}`} style={{ color: !rankInfo.isGrandmaster ? theme.primary : undefined }}>
              {creator.rank || "Novice"}
            </div>
            
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <Button size="sm" className="h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 text-[8px] font-black uppercase tracking-widest px-4">
                 PROFILE
               </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
