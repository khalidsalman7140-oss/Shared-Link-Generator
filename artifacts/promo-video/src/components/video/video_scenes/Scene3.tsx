import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500), // Card 1
      setTimeout(() => setPhase(3), 2000), // Card 2
      setTimeout(() => setPhase(4), 2500), // Card 3
      setTimeout(() => setPhase(5), 6000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const services = [
    { title: "تصميم مواقع", color: "var(--color-primary)", width: "30vw" },
    { title: "تطبيقات ذكية", color: "var(--color-accent)", width: "25vw" },
    { title: "حلول يمنية", color: "var(--color-secondary)", width: "35vw" }
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[5vw]"
      {...sceneTransitions.clipPolygon}
    >
      <motion.h2 
        className="text-[5vw] font-black text-white font-display mb-[8vh]"
        initial={{ opacity: 0, y: -50 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        خدمات <span className="text-[var(--color-accent)]">إبداعية</span> متكاملة
      </motion.h2>

      <div className="flex flex-col gap-[3vh] w-[80vw] max-w-[1200px]">
        {services.map((service, idx) => (
          <motion.div
            key={idx}
            className="h-[12vh] rounded-2xl flex items-center px-[3vw] relative overflow-hidden shadow-2xl"
            style={{ backgroundColor: service.color, width: service.width }}
            initial={{ opacity: 0, x: 100, width: "10vw" }}
            animate={phase >= idx + 2 ? { opacity: 1, x: 0, width: service.width } : { opacity: 0, x: 100, width: "10vw" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
            <span className="text-[3vw] font-bold text-white relative z-10 drop-shadow-md">
              {service.title}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}