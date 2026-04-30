import { TopCompetitorCard, UserProps } from "./TopCompetitorCard";
import { LeaderboardRow } from "./LeaderboardRow";
import { motion } from "framer-motion";

const DEMO_TOP_USERS: UserProps[] = [
  { rank: 1, username: "CyberNinja", display_name: "CyberNinja", role: "Full Stack", xp: 125840, wins: 342, rank_level: "Diamond I", avatar: null },
  { rank: 2, username: "QuantumDev", display_name: "QuantumDev", role: "AI/ML", xp: 118520, wins: 298, rank_level: "Platinum III", avatar: null },
  { rank: 3, username: "NeonByte", display_name: "NeonByte", role: "Backend", xp: 112340, wins: 275, rank_level: "Platinum II", avatar: null },
  { rank: 4, username: "DevCommander", display_name: "DevCommander", role: "DevOps", xp: 98760, wins: 210, rank_level: "Gold III", avatar: null },
  { rank: 5, username: "CodeTitan", display_name: "CodeTitan", role: "Full Stack", xp: 91230, wins: 198, rank_level: "Gold II", avatar: null },
  { rank: 6, username: "PixelStriker", display_name: "PixelStriker", role: "UI/UX Designer", xp: 87450, wins: 184, rank_level: "Gold I", avatar: null },
  { rank: 7, username: "WebDragon", display_name: "WebDragon", role: "Frontend", xp: 81670, wins: 173, rank_level: "Silver III", avatar: null },
  { rank: 8, username: "DataSorcerer", display_name: "DataSorcerer", role: "Data Scientist", xp: 76320, wins: 162, rank_level: "Silver II", avatar: null },
];

export const LeaderboardSection = () => {
  const top3 = DEMO_TOP_USERS.slice(0, 3);
  const rest = DEMO_TOP_USERS.slice(3, 8); // Showing up to 8 as per the image

  return (
    <section className="relative py-24 overflow-hidden bg-[#020617] font-sans min-h-screen">
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-black text-4xl md:text-5xl lg:text-6xl mb-4 tracking-wide uppercase flex flex-col md:flex-row justify-center items-center gap-x-4"
          >
            <span className="text-white">TOP</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
              COMPETITORS
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg mx-auto"
          >
            The most skilled players on Nexora. Can you make it to the top?
          </motion.p>
        </div>

        {/* Podium Layout - Desktop */}
        <div className="hidden lg:flex justify-center items-start gap-8 mb-32 pt-8">
          <TopCompetitorCard user={top3[1]} position={2} />
          <TopCompetitorCard user={top3[0]} position={1} />
          <TopCompetitorCard user={top3[2]} position={3} />
        </div>

        {/* Mobile Podium Stack */}
        <div className="flex lg:hidden flex-col items-center gap-12 mb-20 mt-12">
          <TopCompetitorCard user={top3[0]} position={1} />
          <div className="flex flex-col md:flex-row gap-8 w-full justify-center">
            <TopCompetitorCard user={top3[1]} position={2} />
            <TopCompetitorCard user={top3[2]} position={3} />
          </div>
        </div>

        {/* Rows Container */}
        <div className="max-w-4xl mx-auto space-y-2">
          {rest.map((user, index) => (
            <LeaderboardRow key={user.rank} user={user} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;