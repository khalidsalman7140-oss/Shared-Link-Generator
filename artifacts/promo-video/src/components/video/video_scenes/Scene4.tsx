import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 5000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      {...sceneTransitions.morphExpand}
    >
      <motion.h2 
        className="text-[4.5vw] font-black text-white font-display mb-[10vh]"
        initial={{ opacity: 0, scale: 1.2 }}
        animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        باقات تناسب <span className="text-[var(--color-primary)] drop-shadow-[0_0_15px_rgba(124,58,237,0.8)]">الجميع</span>
      </motion.h2>

      <div className="flex gap-[4vw] items-center justify-center">
        {/* Basic Plan */}
        <motion.div 
          className="w-[22vw] h-[40vh] bg-[var(--color-bg-muted)] border border-white/10 rounded-3xl flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 100, rotate: -10 }}
          animate={phase >= 2 ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: 100, rotate: -10 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="w-[10vw] h-[10vw] rounded-full bg-white/5 mb-[3vh] border-[0.5vw] border-white/10"></div>
          <div className="w-[12vw] h-[1.5vw] bg-white/20 rounded-full mb-[1.5vh]"></div>
          <div className="w-[8vw] h-[1vw] bg-white/10 rounded-full"></div>
        </motion.div>

        {/* Pro Plan */}
        <motion.div 
          className="w-[28vw] h-[48vh] bg-[var(--color-primary)] shadow-[0_0_50px_rgba(124,58,237,0.4)] border border-white/20 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden"
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={phase >= 3 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 100, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 250, damping: 20 }}
        >
          <div className="absolute top-0 right-0 w-[15vw] h-[15vw] bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="w-[12vw] h-[12vw] rounded-full bg-[var(--color-accent)]/80 mb-[3vh] border-[0.5vw] border-white/30 shadow-[0_0_30px_rgba(245,158,11,0.6)]"></div>
          <div className="w-[15vw] h-[2vw] bg-white rounded-full mb-[1.5vh]"></div>
          <div className="w-[10vw] h-[1vw] bg-white/50 rounded-full"></div>
        </motion.div>

        {/* Enterprise Plan */}
        <motion.div 
          className="w-[22vw] h-[40vh] bg-[var(--color-bg-muted)] border border-white/10 rounded-3xl flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 100, rotate: 10 }}
          animate={phase >= 2 ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: 100, rotate: 10 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
        >
          <div className="w-[10vw] h-[10vw] rounded-full bg-white/5 mb-[3vh] border-[0.5vw] border-white/10"></div>
          <div className="w-[12vw] h-[1.5vw] bg-white/20 rounded-full mb-[1.5vh]"></div>
          <div className="w-[8vw] h-[1vw] bg-white/10 rounded-full"></div>
        </motion.div>
      </div>
    </motion.div>
  );
}