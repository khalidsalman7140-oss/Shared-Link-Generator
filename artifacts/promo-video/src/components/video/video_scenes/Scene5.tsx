import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

const CONTACT_INFO = [
  { icon: '📱', label: 'واتساب', value: '+967 783 701 365', color: '#25D366', bg: '#F0FDF4' },
  { icon: '📱', label: 'واتساب', value: '+967 779 435 445', color: '#25D366', bg: '#F0FDF4' },
  { icon: '✈️', label: 'تيليجرام', value: '@kshskshg', color: '#0EA5E9', bg: '#EFF6FF' },
  { icon: '📧', label: 'البريد الإلكتروني', value: 'khalidsalman7140@gmail.com', color: '#F97316', bg: '#FFF7ED' },
];

export function Scene5() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 3000),
      setTimeout(() => setPhase(5), 4500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #0C1220 100%)' }}
      dir="rtl"
      {...sceneTransitions.morphExpand}
    >
      {/* Animated background gradient orbs */}
      <motion.div
        className="absolute w-[60vw] h-[60vw] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #F97316, transparent)', top: '-20%', right: '-10%' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[50vw] h-[50vw] rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #0EA5E9, transparent)', bottom: '-15%', left: '-5%' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Logo + App name */}
      <motion.div
        className="flex flex-col items-center mb-6"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>
          <span className="text-white font-black text-2xl" style={{ fontFamily: 'Tajawal, sans-serif' }}>يش</span>
        </div>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Tajawal, sans-serif' }}>
          يمن <span style={{ color: '#F97316' }}>شات</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1" style={{ fontFamily: 'Cairo, sans-serif' }}>الوكيل الذكي — خالد سلمان</p>
      </motion.div>

      {/* CTA Banner */}
      <motion.div
        className="px-8 py-3 rounded-full text-white font-black text-base shadow-2xl mb-7"
        style={{ background: 'linear-gradient(90deg, #F97316, #EA580C, #F97316)', backgroundSize: '200%', fontFamily: 'Tajawal, sans-serif' }}
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 2 ? { opacity: 1, y: 0, backgroundPosition: ['0%', '100%', '0%'] } : { opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        🚀 اشترك الآن وابدأ رحلتك مع الذكاء الاصطناعي
      </motion.div>

      {/* Contact section title */}
      <motion.div
        className="text-center mb-4"
        initial={{ opacity: 0 }}
        animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>
          أرقام التواصل الرسمية مع المطور
        </div>
        <div className="w-20 h-0.5 mx-auto rounded" style={{ background: 'linear-gradient(90deg, #F97316, #0EA5E9)' }} />
      </motion.div>

      {/* Contact cards */}
      <div className="grid grid-cols-2 gap-3 max-w-xl w-full px-6">
        {CONTACT_INFO.map((contact, i) => (
          <motion.div
            key={i}
            className="rounded-2xl border px-4 py-3 flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: contact.color + '44', backdropFilter: 'blur(10px)' }}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30, y: 20 }}
            animate={phase >= 4 ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: i % 2 === 0 ? -30 : 30, y: 20 }}
            transition={{ delay: i * 0.12, type: 'spring', stiffness: 300, damping: 22 }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: contact.color + '22' }}>
              <span className="text-lg">{contact.icon}</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold mb-0.5" style={{ color: contact.color, fontFamily: 'Cairo, sans-serif' }}>{contact.label}</div>
              <div className="text-sm font-bold text-white truncate" style={{ fontFamily: 'Cairo, sans-serif', direction: 'ltr' }}>{contact.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom pulse */}
      <motion.div
        className="mt-5 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={phase >= 5 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="w-2 h-2 rounded-full"
            style={{ background: '#F97316' }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
        <span className="text-xs text-slate-400 mr-1" style={{ fontFamily: 'Cairo, sans-serif' }}>يمن شات © 2025</span>
      </motion.div>
    </motion.div>
  );
}
