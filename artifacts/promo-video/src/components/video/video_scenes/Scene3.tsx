import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

const MESSAGES = [
  { role: 'user', text: 'أريد تصميم موقع إلكتروني احترافي لشركتي', delay: 600 },
  { role: 'ai', text: 'بكل سرور! يمكنني مساعدتك في تصميم موقع احترافي متكامل. ما نوع نشاطك التجاري؟', delay: 2000 },
  { role: 'user', text: 'شركة استيراد وتصدير — أحتاج متجراً إلكترونياً', delay: 3800 },
  { role: 'ai', text: '✅ ممتاز! سأصمم لك متجراً احترافياً بلوحة تحكم كاملة، دفع إلكتروني، وتحسين SEO', delay: 5400 },
];

export function Scene3() {
  const [phase, setPhase] = useState(0);
  const [typing, setTyping] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    MESSAGES.forEach((msg, i) => {
      if (msg.role === 'ai') {
        timers.push(setTimeout(() => setTyping(true), msg.delay - 800));
      }
      timers.push(setTimeout(() => {
        setTyping(false);
        setVisibleMessages(prev => [...prev, i]);
      }, msg.delay));
    });
    timers.push(setTimeout(() => setPhase(1), 300));
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      style={{ background: 'linear-gradient(160deg, #EFF6FF 0%, #F8FAFF 50%, #FFF7ED 100%)' }}
      dir="rtl"
      {...sceneTransitions.scaleFade}
    >
      <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: 'linear-gradient(90deg, #0EA5E9, #F97316)' }} />

      <div className="w-full max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="bg-white rounded-t-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>
            ي
          </div>
          <div>
            <div className="font-bold text-sm text-slate-800" style={{ fontFamily: 'Tajawal, sans-serif' }}>يمن شات</div>
            <div className="text-xs text-green-500 font-medium">● متصل الآن</div>
          </div>
          <div className="mr-auto text-xs px-2 py-1 rounded-full font-bold text-white"
            style={{ background: 'linear-gradient(90deg, #F97316, #0EA5E9)', fontFamily: 'Cairo, sans-serif' }}>
            تصميم مواقع
          </div>
        </motion.div>

        {/* Messages */}
        <div className="bg-white border-x border-gray-100 px-4 py-4 space-y-3 min-h-[240px]">
          <AnimatePresence>
            {MESSAGES.map((msg, i) => (
              visibleMessages.includes(i) && (
                <motion.div
                  key={i}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${msg.role === 'ai' ? 'text-white' : 'bg-blue-100 text-blue-600'}`}
                    style={msg.role === 'ai' ? { background: 'linear-gradient(135deg, #F97316, #EA580C)' } : {}}>
                    {msg.role === 'ai' ? '🤖' : '👤'}
                  </div>
                  <div
                    className="max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: msg.role === 'ai' ? 'linear-gradient(135deg, #FFF7ED, #FFEDD5)' : 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                      color: '#1E293B',
                      fontFamily: 'Cairo, sans-serif',
                      borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                      borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {typing && (
              <motion.div
                className="flex gap-2 items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>🤖</div>
                <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm flex gap-1.5 items-center"
                  style={{ background: '#FFF7ED' }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 rounded-full bg-orange-400"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input bar */}
        <motion.div
          className="bg-white rounded-b-2xl border border-gray-100 border-t-0 px-4 py-3 flex gap-2 items-center"
          initial={{ opacity: 0 }}
          animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm text-gray-400" style={{ fontFamily: 'Cairo, sans-serif' }}>
            اكتب رسالتك...
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>
            ➤
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
