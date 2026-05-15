import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

const PLANS = [
  { name: 'مجاني', price: '$0', period: '', features: ['5 رسائل/يوم', 'لغة واحدة'], color: '#64748B', bg: '#F8FAFF', badge: '' },
  { name: 'أسبوعي', price: '$2.99', period: '/أسبوع', features: ['رسائل غير محدودة', 'كل اللغات'], color: '#0EA5E9', bg: '#EFF6FF', badge: '' },
  { name: 'شهري', price: '$9.99', period: '/شهر', features: ['رسائل غير محدودة', 'أولوية الردود', 'تحليل الصور'], color: '#F97316', bg: '#FFF7ED', badge: '⭐ الأشهر' },
  { name: 'سنوي', price: '$79.99', period: '/سنة', features: ['كل المميزات', 'دعم مباشر 24/7'], color: '#8B5CF6', bg: '#F5F3FF', badge: '🔥 الأوفر' },
];

export function Scene4() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 4200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #F8FAFF 0%, #EFF6FF 40%, #FFF7ED 100%)' }}
      dir="rtl"
      {...sceneTransitions.slideUp}
    >
      <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: 'linear-gradient(90deg, #8B5CF6, #F97316, #0EA5E9)' }} />

      <motion.h2
        className="text-2xl font-black mb-1"
        style={{ color: '#0F172A', fontFamily: 'Tajawal, sans-serif' }}
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        اختر <span style={{ color: '#F97316' }}>خطتك</span>
      </motion.h2>
      <motion.p
        className="text-sm text-slate-500 mb-5"
        style={{ fontFamily: 'Cairo, sans-serif' }}
        initial={{ opacity: 0 }}
        animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.2 }}
      >
        خطط مرنة تناسب احتياجاتك
      </motion.p>

      {/* Plans grid */}
      <div className="grid grid-cols-4 gap-3 w-full max-w-4xl px-6 mb-5">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            className="rounded-2xl border overflow-hidden relative"
            style={{ background: plan.bg, borderColor: plan.color + '33' }}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={phase >= 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.9 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 22 }}
          >
            {plan.badge && (
              <div className="text-center py-1 text-xs font-bold text-white" style={{ background: plan.color }}>
                {plan.badge}
              </div>
            )}
            <div className="p-4 text-center">
              <div className="font-black text-base mb-1" style={{ color: plan.color, fontFamily: 'Tajawal, sans-serif' }}>{plan.name}</div>
              <div className="font-black text-2xl" style={{ color: '#0F172A', fontFamily: 'Tajawal, sans-serif' }}>{plan.price}</div>
              <div className="text-xs text-slate-400 mb-3" style={{ fontFamily: 'Cairo, sans-serif' }}>{plan.period}</div>
              {plan.features.map(f => (
                <div key={f} className="text-xs text-slate-600 flex items-center gap-1 mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>
                  <span style={{ color: plan.color }}>✓</span> {f}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Al-Kuraimi payment section */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg border border-orange-100 px-6 py-4 max-w-md w-full mx-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={phase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="text-center mb-3">
          <div className="text-sm font-bold text-slate-700 mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>
            💳 طريقة الدفع
          </div>
          <div className="text-xs text-slate-500" style={{ fontFamily: 'Cairo, sans-serif' }}>أرسل الحوالة عبر أي وسيلة دفع</div>
        </div>
        <div className="flex gap-2 justify-center mb-3">
          {['الكريمي 🏦', 'واتساب 💬', 'تحويل بنكي 🏛️'].map((method, i) => (
            <motion.div
              key={method}
              className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
              style={{ background: ['#16A34A', '#25D366', '#0EA5E9'][i] }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={phase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.1 * i, type: 'spring', stiffness: 400 }}
            >
              {method}
            </motion.div>
          ))}
        </div>
        <motion.div
          className="text-center py-2 rounded-xl text-sm font-black text-white"
          style={{ background: 'linear-gradient(90deg, #F97316, #EA580C)', fontFamily: 'Tajawal, sans-serif' }}
          initial={{ opacity: 0 }}
          animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          ✅ فعّل حسابك Premium فوراً!
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
