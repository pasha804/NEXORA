import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { Logo } from "@/components/ui/Logo";

export const CinematicIntro = ({ onComplete }: { onComplete: () => void }) => {
  // Generate a network of points that generally follow a horizontal band/wave
  const { nodes, lines } = useMemo(() => {
    const nodeCount = 50;
    const newNodes = [];
    for (let i = 0; i < nodeCount; i++) {
      // distribute x evenly across the width
      const x = (i / nodeCount) * 120 - 10; // -10% to 110%
      // distribute y around the center with some sine wave and noise
      const baseY = 50 + Math.sin(x * 0.05) * 15;
      const y = baseY + (Math.random() * 40 - 20);
      
      newNodes.push({
        id: i,
        x,
        y,
        size: Math.random() * 6 + 3,
        delay: Math.random() * 1.5
      });
    }

    const newLines = [];
    for (let i = 0; i < newNodes.length; i++) {
      for (let j = i + 1; j < newNodes.length; j++) {
        const dx = newNodes[i].x - newNodes[j].x;
        const dy = newNodes[i].y - newNodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Connect nodes that are relatively close
        if (dist < 22) {
          newLines.push({ id: `${i}-${j}`, start: newNodes[i], end: newNodes[j] });
        }
      }
    }
    return { nodes: newNodes, lines: newLines };
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      onComplete();
      document.body.style.overflow = "auto";
    }, 4500); 
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "auto";
    };
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#2a3143] via-[#1a1f2e] to-[#0f121b] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(15px)" }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {/* 3D Camera Zoom Container */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0.85, rotateZ: -1 }}
        animate={{ scale: 1.05, rotateZ: 0 }}
        transition={{ duration: 4.5, ease: "easeOut" }}
      >
        {/* Network Nodes Layer */}
        <div className="absolute inset-0 w-full h-full opacity-80">
          <svg className="w-full h-full absolute inset-0">
            {lines.map((line) => (
              <motion.line
                key={line.id}
                x1={`${line.start.x}%`}
                y1={`${line.start.y}%`}
                x2={`${line.end.x}%`}
                y2={`${line.end.y}%`}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeOpacity="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: Math.random() }}
              />
            ))}
          </svg>
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              className="absolute rounded-full bg-cyan-300 shadow-[0_0_12px_4px_rgba(34,211,238,0.9)]"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: node.size,
                height: node.size,
                x: "-50%",
                y: "-50%"
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.9] }}
              transition={{ duration: 1.5, delay: node.delay }}
            />
          ))}
        </div>

        {/* Subtle Ambient Glow behind logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div 
            className="w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2.5, delay: 0.5 }}
          />
        </div>

        {/* Main Logo container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
          className="relative z-10 flex flex-col items-center justify-center drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <Logo iconSize="w-24 h-24 md:w-32 md:h-32" textClassName="text-6xl md:text-[5.5rem] tracking-tight" animated={false} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
