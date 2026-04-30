import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

export const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-pattern pointer-events-none" />
      <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" />

      {/* Floating Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none"
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Skill Platform</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
        >
          <span className="text-foreground">Level Up Your</span>
          <br />
          <span className="gradient-text text-glow">Skills & Compete</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          The all-in-one ecosystem: Showcase skills, compete in PvP battles,
          grow with AI mentorship, and monetize your expertise.
          Where Discord meets LinkedIn and Competitive Gaming.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button variant="hero" size="xl" className="group" onClick={() => navigate("/auth?mode=signup")}>
            Start Your Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="xl" onClick={() => navigate("/#features")}>
            Watch Demo
          </Button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { value: "50K+", label: "Active Users", icon: Zap },
            { value: "1M+", label: "Battles Won", icon: Shield },
            { value: "500+", label: "Skill Tracks", icon: Sparkles },
            { value: "99.9%", label: "Uptime", icon: Shield },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              className="glass-card p-4 text-center group hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-center mb-2">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
