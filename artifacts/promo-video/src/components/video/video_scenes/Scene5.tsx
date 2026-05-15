import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => setPhase(4), 4500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[var(--color-primary)]"
      {...sceneTransitions.wipe}
    >
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,var(--color-bg-dark)_100%)] opacity-80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 2 }}
      />

      <div className="relative z-20 text-center flex flex-col items-center">
        <motion.div
          className="w-[15vw] h-[15vw] rounded-3xl bg-[var(--color-accent)] mb-[4vh] rotate-45 shadow-[0_0_50px_rgba(245,158,11,0.6)] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1, rotate: 45 } : { opacity: 0, scale: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <div className="w-[8vw] h-[8vw] bg-white rounded-xl -rotate-45"></div>
        </motion.div>

        <motion.h1 
          className="text-[8vw] font-black text-white font-display tracking-tight leading-none drop-shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          يمن شات
        </motion.h1>
        
        <motion.p
          className="text-[2.5vw] text-[var(--color-accent)] font-bold mt-[2vh] mb-[6vh]"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          مستقبلك يبدأ هنا
        </motion.p>

        <motion.div
          className="bg-white text-[var(--color-bg-dark)] px-[4vw] py-[1.5vh] rounded-full text-[2vw] font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
        >
          خالد سلمان
        </motion.div>
      </div>
    </motion.div>
  );
}