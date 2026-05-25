import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface CinematicIntroProps {
  onComplete: () => void;
}

export const CinematicIntro = ({ onComplete }: CinematicIntroProps) => {
  const [phase, setPhase] = useState<"particles" | "logo" | "tagline" | "exit">("particles");

  // Generate neural network nodes
  const { nodes, connections } = useMemo(() => {
    const count = 60;
    const ns = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      delay: Math.random() * 1.2,
      speed: 0.3 + Math.random() * 0.4,
      opacity: 0.4 + Math.random() * 0.6,
    }));

    const conns: { id: string; x1: number; y1: number; x2: number; y2: number; delay: number }[] = [];
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const dx = ns[i].x - ns[j].x;
        const dy = ns[i].y - ns[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 18) {
          conns.push({
            id: `${i}-${j}`,
            x1: ns[i].x, y1: ns[i].y,
            x2: ns[j].x, y2: ns[j].y,
            delay: Math.random() * 0.8,
          });
        }
      }
    }
    return { nodes: ns, connections: conns };
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const t1 = setTimeout(() => setPhase("logo"), 600);
    const t2 = setTimeout(() => setPhase("tagline"), 1800);
    const t3 = setTimeout(() => setPhase("exit"), 3400);
    const t4 = setTimeout(() => {
      onComplete();
      document.body.style.overflow = "";
    }, 4200);

    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
      document.body.style.overflow = "";
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 60%, #0d1117 0%, #060810 100%)" }}
      initial={{ opacity: 1 }}
      animate={phase === "exit" ? { opacity: 0, scale: 1.04 } : { opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* ── Neural network background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full absolute inset-0" style={{ opacity: 0.35 }}>
          {connections.map(c => (
            <motion.line
              key={c.id}
              x1={`${c.x1}%`} y1={`${c.y1}%`}
              x2={`${c.x2}%`} y2={`${c.y2}%`}
              stroke="url(#lineGrad)"
              strokeWidth="0.8"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 0.6, pathLength: 1 }}
              transition={{ duration: 1.4, delay: c.delay, ease: "easeOut" }}
            />
          ))}
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>

        {nodes.map(n => (
          <motion.div
            key={n.id}
            className="absolute rounded-full"
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              width: n.size,
              height: n.size,
              background: n.id % 3 === 0 ? "#00f0ff" : n.id % 3 === 1 ? "#7c3aed" : "#06b6d4",
              boxShadow: `0 0 ${n.size * 4}px ${n.size * 2}px ${n.id % 3 === 0 ? "rgba(0,240,255,0.6)" : "rgba(124,58,237,0.5)"}`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: [0, n.opacity, n.opacity * 0.7] }}
            transition={{ duration: 1, delay: n.delay, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* ── Ambient glow orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 700, height: 700,
            left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(0,163,255,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 400, height: 400,
            left: "30%", top: "40%",
            background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0.5] }}
          transition={{ duration: 2.5, delay: 0.5 }}
        />
      </div>

      {/* ── Scan line effect ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.015) 2px, rgba(0,240,255,0.015) 4px)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center gap-6 select-none">
        {/* Logo mark */}
        <AnimatePresence>
          {(phase === "logo" || phase === "tagline" || phase === "exit") && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, scale: 0.6, y: 30, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-3"
            >
              {/* Hexagon icon */}
              <div className="relative">
                <motion.div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,163,255,0.2) 0%, rgba(124,58,237,0.2) 100%)",
                    border: "1px solid rgba(0,240,255,0.3)",
                    boxShadow: "0 0 40px rgba(0,163,255,0.3), inset 0 0 20px rgba(0,163,255,0.05)",
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 40px rgba(0,163,255,0.3), inset 0 0 20px rgba(0,163,255,0.05)",
                      "0 0 60px rgba(0,163,255,0.5), inset 0 0 30px rgba(0,163,255,0.1)",
                      "0 0 40px rgba(0,163,255,0.3), inset 0 0 20px rgba(0,163,255,0.05)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span
                    className="text-4xl font-black tracking-tighter"
                    style={{
                      background: "linear-gradient(135deg, #00f0ff 0%, #7c3aed 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontFamily: "system-ui, -apple-system, sans-serif",
                    }}
                  >
                    N
                  </span>
                </motion.div>

                {/* Rotating ring */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    border: "1px solid rgba(0,240,255,0.2)",
                    boxShadow: "0 0 20px rgba(0,240,255,0.1)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />

                {/* Corner dots */}
                {[
                  { top: -4, left: -4 }, { top: -4, right: -4 },
                  { bottom: -4, left: -4 }, { bottom: -4, right: -4 },
                ].map((pos, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-cyan-400"
                    style={{ ...pos, boxShadow: "0 0 8px rgba(0,240,255,0.8)" }}
                    animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>

              {/* Wordmark */}
              <motion.div className="flex items-baseline gap-1">
                {"NEXORA".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    className="text-5xl font-black tracking-[0.15em]"
                    style={{
                      background: i < 3
                        ? "linear-gradient(135deg, #ffffff 0%, #a5f3fc 100%)"
                        : "linear-gradient(135deg, #a5f3fc 0%, #7c3aed 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      textShadow: "none",
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tagline */}
        <AnimatePresence>
          {(phase === "tagline" || phase === "exit") && (
            <motion.div
              key="tagline"
              initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-2"
            >
              <p
                className="text-sm tracking-[0.3em] uppercase font-medium"
                style={{ color: "rgba(165,243,252,0.7)" }}
              >
                Skill · Compete · Evolve
              </p>

              {/* Progress bar */}
              <motion.div
                className="w-48 h-px mt-2 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #00f0ff, #7c3aed)",
                    boxShadow: "0 0 8px rgba(0,240,255,0.6)",
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Edge vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />
    </motion.div>
  );
};
