import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Swords, ChevronRight } from "lucide-react";

export const PvPSection = () => {
  return (
    <section id="pvp" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-magenta/5 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-sm font-medium mb-4">
              <Swords className="w-4 h-4" />
              PvP Arena
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Battle Your Way to{" "}
              <span className="text-glow-magenta text-secondary">Glory</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Challenge skilled opponents in real-time competitions. Our AI judges 
              evaluate your performance based on code quality, creativity, and efficiency.
            </p>

            <Button variant="pvp" size="lg" className="group">
              Enter the Arena
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-8 text-center"
          >
            <Swords className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold mb-4">Ready to Battle?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of developers competing in skill-based PvP matches.
            </p>
            <Button variant="pvp" size="lg">
              Start Quick Match
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
