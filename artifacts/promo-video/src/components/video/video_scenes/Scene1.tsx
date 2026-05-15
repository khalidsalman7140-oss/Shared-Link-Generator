import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene1() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2800),
      setTimeout(() => setPhase(5), 4200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F8FAFF 0%, #EFF6FF 50%, #FFF7ED 100%)' }}
      {...sceneTransitions.clipCircle}
    >
      {/* Background geometric decorations */}
      <motion.div
        className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #F97316, transparent)' }}
        animate={phase >= 1 ? { scale: [0, 1.2, 1], opacity: [0, 0.2, 0.15] } : { scale: 0, opacity: 0 }}
        transition={{ duration: 1.2, ease: 'circOut' }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-[-5%] w-[40vw] h-[40vw] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #0EA5E9, transparent)' }}
        animate={phase >= 1 ? { scale: [0, 1.1, 1], opacity: [0, 0.15, 0.1] } : { scale: 0, opacity: 0 }}
        transition={{ duration: 1.5, ease: 'circOut', delay: 0.2 }}
      />

      {/* Floating dots decoration */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${8 + i * 4}px`,
            height: `${8 + i * 4}px`,
            background: i % 2 === 0 ? '#F97316' : '#0EA5E9',
            top: `${15 + i * 12}%`,
            left: `${5 + i * 8}%`,
            opacity: 0.3,
          }}
          animate={phase >= 2 ? {
            y: [0, -15, 0],
            opacity: [0.3, 0.6, 0.3],
          } : { opacity: 0 }}
          transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
        />
      ))}

      {/* Logo circle */}
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={phase >= 2 ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 0, rotate: -180, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
        >
          <span className="text-white font-black text-4xl" style={{ fontFamily: 'Tajawal, sans-serif' }}>ي</span>
          <span className="text-white font-black text-4xl" style={{ fontFamily: 'Tajawal, sans-serif', marginRight: '-6px' }}>ش</span>
        </div>
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: '3px solid #F97316' }}
          animate={phase >= 2 ? { scale: [1, 1.4, 1], opacity: [1, 0, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* App name */}
      <motion.h1
        className="text-6xl font-black text-center leading-tight mb-3"
        style={{ fontFamily: 'Tajawal, sans-serif', color: '#0F172A' }}
        initial={{ opacity: 0, y: 40 }}
        animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        يمن{' '}
        <span style={{ color: '#F97316' }}>شات</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.div
        className="px-6 py-2.5 rounded-full text-white font-bold text-lg shadow-lg mb-4"
        style={{ background: 'linear-gradient(90deg, #F97316, #0EA5E9)', fontFamily: 'Cairo, sans-serif' }}
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={phase >= 4 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.7, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
      >
        الوكيل الذكي — خالد سلمان
      </motion.div>

      {/* Tagline */}
      <motion.p
        className="text-base font-medium"
        style={{ color: '#64748B', fontFamily: 'Cairo, sans-serif' }}
        initial={{ opacity: 0 }}
        animate={phase >= 5 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        🤖 ذكاء اصطناعي • 5 لغات • 72 محوراً
      </motion.p>
    </motion.div>
  );
}
