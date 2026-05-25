import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404: Route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,240,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,240,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full blur-[120px] opacity-20"
          style={{
            width: 600, height: 600,
            left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(0,163,255,0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center max-w-lg w-full"
      >
        {/* 404 number */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6"
        >
          <span
            className="text-[120px] md:text-[160px] font-black leading-none tracking-tighter select-none"
            style={{
              background: "linear-gradient(135deg, rgba(0,240,255,0.8) 0%, rgba(124,58,237,0.6) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 40px rgba(0,240,255,0.3))",
            }}
          >
            404
          </span>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8 space-y-3"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Lost in the Nexus
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            The page at{" "}
            <code className="text-primary bg-primary/10 px-2 py-0.5 rounded text-sm font-mono">
              {location.pathname}
            </code>{" "}
            doesn't exist or has been moved.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2 border-white/10 hover:border-white/30 hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="gap-2"
            style={{
              background: "linear-gradient(135deg, rgba(0,163,255,0.9), rgba(124,58,237,0.9))",
              boxShadow: "0 0 20px rgba(0,163,255,0.3)",
            }}
          >
            <Home className="w-4 h-4" />
            Return Home
          </Button>
          <Button
            onClick={() => navigate("/discover")}
            variant="outline"
            className="gap-2 border-white/10 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Search className="w-4 h-4" />
            Discover
          </Button>
        </motion.div>

        {/* Decorative scan line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="mt-12 h-px w-full rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(0,240,255,0.4), transparent)",
          }}
        />
      </motion.div>
    </div>
  );
};

export default NotFound;
