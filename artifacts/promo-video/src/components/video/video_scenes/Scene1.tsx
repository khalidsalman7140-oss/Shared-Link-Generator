import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 4000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      {...sceneTransitions.zoomThrough}
    >
      {/* Decorative center ring */}
      <motion.div 
        className="absolute w-[40vw] h-[40vw] rounded-full border border-[var(--color-primary)]/40"
        initial={{ scale: 0, opacity: 0 }}
        animate={phase >= 1 ? { scale: 1, opacity: 1, rotate: 180 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      <motion.div 
        className="absolute w-[60vw] h-[60vw] rounded-full border border-[var(--color-accent)]/20"
        initial={{ scale: 0, opacity: 0 }}
        animate={phase >= 1 ? { scale: 1, opacity: 1, rotate: -180 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 3, ease: "easeOut" }}
      />

      <div className="relative z-20 text-center">
        <motion.h1 
          className="text-[10vw] font-black text-white font-display tracking-tight leading-none mb-4 drop-shadow-2xl"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={phase >= 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          يمن شات
        </motion.h1>
        
        <motion.div
          className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full text-[2.5vw] font-bold inline-block shadow-[0_0_30px_rgba(124,58,237,0.5)]"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={phase >= 3 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          الوكيل الذكي — خالد سلمان
        </motion.div>
      </div>
    </motion.div>
  );
}