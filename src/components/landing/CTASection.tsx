import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card p-12 text-center border-primary/30 animate-glow"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.4)]"
          >
            <Zap className="w-10 h-10 text-primary-foreground" />
          </motion.div>

          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Ready to{" "}
            <span className="gradient-text text-glow">Level Up</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Join thousands of developers, designers, and creators competing, 
            collaborating, and growing together on Nexora.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" className="group" onClick={() => navigate("/auth?mode=signup")}>
              <Sparkles className="w-5 h-5 mr-2" />
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="xl" onClick={() => navigate("/#features")}>
              View Demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • Free forever plan available
          </p>
        </motion.div>
      </div>
    </section>
  );
};
