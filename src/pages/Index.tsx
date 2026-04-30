import { useState, useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PvPSection } from "@/components/landing/PvPSection";
import { CommunitySection } from "@/components/landing/CommunitySection";
import { LeaderboardSection } from "@/components/landing/LeaderboardSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { CinematicIntro } from "@/components/layout/CinematicIntro";
import { AnimatePresence, motion } from "framer-motion";

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <>
      <AnimatePresence>
        {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}
      </AnimatePresence>
      
      {!showIntro && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.8 }}
          className="min-h-screen bg-background overflow-x-hidden"
        >
          <Navbar />
          <HeroSection />
          <FeaturesSection />
          <PvPSection />
          <CommunitySection />
          <LeaderboardSection />
          <CTASection />
          <Footer />
        </motion.div>
      )}
    </>
  );
};

export default Index;