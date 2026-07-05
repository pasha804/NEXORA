export const HolographicOverlay = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] mix-blend-overlay ${className}`}>
      {/* Glitch lines */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: "linear-gradient(rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.2) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
          backgroundSize: "100% 4px, 3px 100%",
          animation: "holographic-glitch 4s infinite linear"
        }}
      />
      {/* Soft reflective gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50" />
    </div>
  );
};
