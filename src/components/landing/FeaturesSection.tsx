import { motion } from "framer-motion";
import { 
  Users, 
  Swords, 
  Brain, 
  MessageSquare, 
  Trophy, 
  Rocket,
  Code2,
  Palette,
  Cpu
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Skill-Based Social",
    description: "Connect with professionals who share your expertise. Build meaningful relationships through skills.",
    color: "from-primary to-electric-400",
  },
  {
    icon: Swords,
    title: "PvP Competitions",
    description: "Challenge others in real-time coding, design, and creative battles. Prove your skills.",
    color: "from-neon-magenta to-neon-purple",
  },
  {
    icon: Brain,
    title: "AI-Powered Growth",
    description: "Get personalized learning paths, collaboration suggestions, and performance insights.",
    color: "from-neon-purple to-primary",
  },
  {
    icon: MessageSquare,
    title: "Community Servers",
    description: "Join skill-based communities with channels, voice rooms, and collaboration tools.",
    color: "from-electric-400 to-neon-green",
  },
  {
    icon: Trophy,
    title: "Rankings & XP",
    description: "Earn XP, climb leaderboards, and unlock achievements as you develop your skills.",
    color: "from-neon-green to-primary",
  },
  {
    icon: Rocket,
    title: "Career Boost",
    description: "Get matched with jobs, freelance gigs, and hackathons based on your verified skills.",
    color: "from-primary to-neon-magenta",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-4 relative">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
            Platform Features
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Excel</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A complete ecosystem for skill development, social networking, and competitive growth.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group glass-card p-6 hover:border-primary/50 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Skill Categories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <h3 className="font-display text-2xl font-semibold mb-8 text-foreground">
            Compete Across Multiple Domains
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: "Coding", icon: Code2 },
              { name: "Design", icon: Palette },
              { name: "AI/ML", icon: Cpu },
              { name: "DevOps", icon: Rocket },
              { name: "Data Science", icon: Brain },
            ].map((skill) => (
              <motion.div
                key={skill.name}
                whileHover={{ scale: 1.05, y: -5 }}
                className="skill-badge text-base px-5 py-2"
              >
                <skill.icon className="w-4 h-4" />
                {skill.name}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
