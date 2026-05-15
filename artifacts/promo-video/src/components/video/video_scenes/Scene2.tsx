import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3200),
      setTimeout(() => setPhase(5), 5500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-between px-[10vw] z-10"
      {...sceneTransitions.slideRight}
    >
      {/* Right side: Text */}
      <div className="w-1/2">
        <motion.h2 
          className="text-[5vw] font-black text-white font-display leading-[1.2] mb-6"
          initial={{ opacity: 0, x: 50 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          محادثات ذكية <br />
          <span className="text-[var(--color-accent)]">متطورة</span>
        </motion.h2>
        <motion.p 
          className="text-[2vw] text-[var(--color-text-secondary)] leading-relaxed"
          initial={{ opacity: 0, x: 50 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          اسأل، تفاعل، واحصل على إجابات فورية بدقة عالية تدعم اللهجات المحلية وتفهم احتياجاتك.
        </motion.p>
      </div>

      {/* Left side: Abstract Chat Bubbles */}
      <div className="w-1/2 relative h-[60vh]">
        <motion.div 
          className="absolute right-0 top-[20%] bg-[var(--color-primary)] w-[25vw] p-[2vw] rounded-2xl rounded-tr-none shadow-2xl"
          initial={{ opacity: 0, scale: 0.8, x: -50 }}
          animate={phase >= 3 ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.8, x: -50 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="w-full h-[1vw] bg-white/30 rounded-full mb-[1vw]"></div>
          <div className="w-[70%] h-[1vw] bg-white/30 rounded-full"></div>
        </motion.div>

        <motion.div 
          className="absolute left-[10%] top-[50%] bg-[var(--color-bg-muted)] w-[20vw] p-[2vw] rounded-2xl rounded-tl-none border border-white/10 shadow-2xl"
          initial={{ opacity: 0, scale: 0.8, x: 50 }}
          animate={phase >= 4 ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.8, x: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="w-[80%] h-[1vw] bg-[var(--color-accent)] rounded-full mb-[1vw]"></div>
          <div className="w-[60%] h-[1vw] bg-white/20 rounded-full"></div>
        </motion.div>
      </div>
    </motion.div>
  );
}