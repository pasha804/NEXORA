import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Target, Users, Award } from "lucide-react";
import { getRankInfoFromString } from "@/lib/rankSystem";
import { RankEmblemLarge } from "./RankEmblemLarge";

interface ProfileOverviewTabsProps {
  profile: {
    rank?: string;
    ranking_score?: number;
    followers?: number;
    followers_count?: number;
    following?: number;
    following_count?: number;
    skills?: { name: string }[];
    display_name?: string;
  };
  isGrandmaster?: boolean;
}

const TABS = ["Overview", "Stats", "Achievements", "Skills", "Activity"] as const;

export const ProfileOverviewTabs = ({ profile, isGrandmaster = false }: ProfileOverviewTabsProps) => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Overview");
  const rankStr = profile.rank || "Novice";
  const rankInfo = getRankInfoFromString(rankStr);
  const rp = profile.ranking_score ?? rankInfo.rp;
  const followers = profile.followers ?? profile.followers_count ?? 0;
  const following = profile.following ?? profile.following_count ?? 0;
  const skills = (profile.skills || []).slice(0, 4);

  if (!isGrandmaster) return null;

  return (
    <div className="px-4 md:px-8 mb-8">
      <div className="flex gap-1 mb-6 overflow-x-auto border-b border-white/10 pb-px">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-2 -mb-px ${
              activeTab === tab ? "text-amber-400 border-amber-400" : "text-white/40 border-transparent"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {activeTab === "Overview" ? (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 border border-amber-500/20 bg-black/40">
              <h4 className="text-xs font-bold uppercase text-white/40 mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-400" /> Rank Progress</h4>
              <RankEmblemLarge rank={rankStr} rp={rp} className="scale-75 mx-auto" />
              <p className="text-center text-xs text-amber-400 font-bold mt-2">Top 0.01% Players</p>
              <div className="h-2 bg-white/5 rounded-full mt-2 overflow-hidden"><div className="h-full xp-bar-grandmaster w-[99%]" /></div>
            </div>
            <div className="glass-card p-5 border border-white/10 bg-black/40">
              <h4 className="text-xs font-bold uppercase text-white/40 mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-purple-400" /> Achievements</h4>
              {["1000 Wins", "Unstoppable", "Nexora Founder"].map((a) => (
                <p key={a} className="text-sm text-white py-1">{a}</p>
              ))}
            </div>
            <div className="glass-card p-5 border border-white/10 bg-black/40">
              <h4 className="text-xs font-bold uppercase text-white/40 mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-cyan-400" /> Top Skills</h4>
              {(skills.length ? skills : [{ name: "React" }, { name: "Python" }]).map((s) => (
                <div key={s.name} className="mb-2"><p className="text-xs text-white">{s.name}</p><div className="h-1 bg-gradient-to-r from-purple-500 to-cyan-400 rounded mt-1" /></div>
              ))}
            </div>
            <div className="glass-card p-5 border border-white/10 bg-black/40">
              <h4 className="text-xs font-bold uppercase text-white/40 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> Community</h4>
              <p className="text-white font-bold">{followers >= 1000 ? Math.floor(followers/1000) + "K+" : followers} Followers</p>
              <p className="text-white/60 text-sm">{following} Following</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key={activeTab} className="glass-card p-8 text-center text-white/50">
            <Star className="w-8 h-8 mx-auto mb-2 text-amber-400/50" />
            <p>{activeTab} coming soon</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
