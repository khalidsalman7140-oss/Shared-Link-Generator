import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

const LANGUAGES = [
  { flag: '🇾🇪', name: 'العربية', active: true },
  { flag: '🇬🇧', name: 'English', active: false },
  { flag: '🇫🇷', name: 'Français', active: false },
  { flag: '🇹🇷', name: 'Türkçe', active: false },
  { flag: '🇪🇸', name: 'Español', active: false },
];

const SERVICES = [
  { icon: '💻', name: 'تصميم المواقع', count: '18 محور' },
  { icon: '🎬', name: 'صناعة الفيديوهات', count: '15 محور' },
  { icon: '📱', name: 'برمجة التطبيقات', count: '14 محور' },
  { icon: '📣', name: 'التسويق الرقمي', count: '25 محور' },
];

export function Scene2() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1600),
      setTimeout(() => setPhase(4), 3000),
      setTimeout(() => setPhase(5), 4500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #F8FAFF 0%, #EFF6FF 60%, #FFF7ED 100%)' }}
      dir="rtl"
      {...sceneTransitions.pushLeft}
    >
      <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: 'linear-gradient(90deg, #F97316, #0EA5E9)' }} />

      <div className="w-full max-w-4xl mx-auto px-6 flex gap-4 items-start pt-6">
        {/* Languages panel */}
        <motion.div
          className="w-44 flex-shrink-0"
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
            <div className="px-4 py-2.5 text-xs font-bold text-white" style={{ background: 'linear-gradient(90deg, #F97316, #FB923C)', fontFamily: 'Cairo, sans-serif' }}>
              🌐 اللغات المدعومة
            </div>
            {LANGUAGES.map((lang, i) => (
              <motion.div
                key={lang.name}
                className={`flex items-center gap-2 px-3 py-2 text-sm border-b border-gray-50 last:border-0 ${lang.active ? 'bg-orange-50' : ''}`}
                style={{ fontFamily: 'Cairo, sans-serif' }}
                initial={{ opacity: 0, x: -20 }}
                animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 22 }}
              >
                <span className="text-base">{lang.flag}</span>
                <span className={`font-medium text-xs ${lang.active ? 'text-orange-600' : 'text-slate-700'}`}>{lang.name}</span>
                {lang.active && <span className="mr-auto w-2 h-2 rounded-full bg-orange-400" />}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Services */}
        <div className="flex-1 space-y-2.5">
          <motion.h2
            className="text-2xl font-black text-center mb-3"
            style={{ color: '#0F172A', fontFamily: 'Tajawal, sans-serif' }}
            initial={{ opacity: 0, y: -20 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            استعرض <span style={{ color: '#F97316' }}>الخدمات</span>
          </motion.h2>

          {SERVICES.map((svc, i) => (
            <motion.div
              key={svc.name}
              className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 flex items-center justify-between"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={phase >= 3 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
              transition={{ delay: i * 0.12, type: 'spring', stiffness: 350, damping: 22 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{svc.icon}</span>
                <span className="font-bold text-sm text-slate-800" style={{ fontFamily: 'Cairo, sans-serif' }}>{svc.name}</span>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: '#EFF6FF', color: '#0EA5E9' }}>
                {svc.count}
              </span>
            </motion.div>
          ))}

          <motion.div
            className="flex items-center justify-center mt-3"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={phase >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          >
            <div className="px-6 py-2.5 rounded-full text-white font-black text-base shadow-lg"
              style={{ background: 'linear-gradient(90deg, #F97316, #EA580C)', fontFamily: 'Tajawal, sans-serif' }}>
              ✨ 72 محوراً متخصصاً
            </div>
          </motion.div>
        </div>

        {/* Right stats */}
        <motion.div
          className="w-40 flex-shrink-0 space-y-3"
          initial={{ opacity: 0, x: 50 }}
          animate={phase >= 5 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        >
          {[
            { label: 'الإنتاج', value: '✍️', desc: 'محتوى وتصميم' },
            { label: 'الاستهلاك', value: '📊', desc: 'تحليل وأبحاث' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
              <div className="text-2xl mb-1">{stat.value}</div>
              <div className="font-bold text-sm text-slate-800" style={{ fontFamily: 'Cairo, sans-serif' }}>{stat.label}</div>
              <div className="text-xs text-slate-500 mt-1" style={{ fontFamily: 'Cairo, sans-serif' }}>{stat.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
