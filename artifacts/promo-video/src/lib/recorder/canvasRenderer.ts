// Pure canvas-based scene renderer for video export
// Draws all 5 scenes with smooth animations using only the Canvas 2D API

const C = {
  orange: '#F97316',
  orangeDark: '#EA580C',
  blue: '#0EA5E9',
  blueLight: '#38BDF8',
  text: '#0F172A',
  muted: '#64748B',
  light: '#94A3B8',
  white: '#FFFFFF',
  bg: '#F8FAFF',
  bgBlue: '#EFF6FF',
  bgOrange: '#FFF7ED',
  dark: '#0F172A',
  darkMid: '#1E293B',
  green: '#25D366',
  purple: '#8B5CF6',
};

function ease(t: number): number {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
}

function spring(t: number): number {
  if (t >= 1) return 1;
  const p = 0.9;
  return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) * -1 + 1;
}

function p(t: number, start: number, end: number): number {
  return ease(Math.min(1, Math.max(0, (t - start) / (end - start))));
}

function sp(t: number, start: number, end: number): number {
  return spring(Math.min(1, Math.max(0, (t - start) / (end - start))));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) {
  const [tl, tr, br, bl] = Array.isArray(r)
    ? [r[0] ?? 0, r[1] ?? 0, r[2] ?? 0, r[3] ?? 0]
    : [r, r, r, r];
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h);
  ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl);
  ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
}

function gradientBg(ctx: CanvasRenderingContext2D, W: number, H: number, c1: string, c2: string, c3: string) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, c1);
  g.addColorStop(0.5, c2);
  g.addColorStop(1, c3);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function topBar(ctx: CanvasRenderingContext2D, W: number, c1: string, c2: string) {
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 6);
}

function pill(ctx: CanvasRenderingContext2D, cx: number, cy: number, text: string, c1: string, c2: string, fontSize = 22) {
  ctx.font = `700 ${fontSize}px 'Tajawal', sans-serif`;
  ctx.direction = 'rtl';
  const tw = ctx.measureText(text).width;
  const pw = tw + 48;
  const ph = fontSize + 24;
  const g = ctx.createLinearGradient(cx - pw / 2, 0, cx + pw / 2, 0);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  roundRect(ctx, cx - pw / 2, cy - ph / 2, pw, ph, ph / 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.fillStyle = C.white;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy + 1);
}

function card(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[] = 16) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = C.white;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// ─────────────── SCENE 1: OPENING (0–7s) ───────────────
function scene1(ctx: CanvasRenderingContext2D, t: number, W: number, H: number) {
  gradientBg(ctx, W, H, '#F8FAFF', '#EFF6FF', '#FFF7ED');

  // Glow orbs
  const glowAlpha = p(t, 0, 1);
  ctx.save();
  ctx.globalAlpha = 0.18 * glowAlpha;
  const g1 = ctx.createRadialGradient(W * 0.8, H * 0.1, 0, W * 0.8, H * 0.1, W * 0.4);
  g1.addColorStop(0, C.orange);
  g1.addColorStop(1, 'transparent');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);
  const g2 = ctx.createRadialGradient(W * 0.1, H * 0.85, 0, W * 0.1, H * 0.85, W * 0.35);
  g2.addColorStop(0, C.blue);
  g2.addColorStop(1, 'transparent');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // Floating dots
  const dots = [
    { x: 0.08, y: 0.15, r: 6, c: C.orange },
    { x: 0.14, y: 0.28, r: 9, c: C.blue },
    { x: 0.22, y: 0.42, r: 12, c: C.orange },
    { x: 0.32, y: 0.55, r: 15, c: C.blue },
    { x: 0.44, y: 0.68, r: 18, c: C.orange },
    { x: 0.58, y: 0.78, r: 10, c: C.blue },
  ];
  dots.forEach((d, i) => {
    const a = p(t, 0.1 + i * 0.05, 0.5 + i * 0.05);
    const bob = Math.sin(t * 2 + i) * 8;
    ctx.save();
    ctx.globalAlpha = 0.3 * a;
    ctx.beginPath();
    ctx.arc(d.x * W, d.y * H + bob, d.r, 0, Math.PI * 2);
    ctx.fillStyle = d.c;
    ctx.fill();
    ctx.restore();
  });

  // Logo circle
  const logoProg = sp(t, 0.2, 1.2);
  const logoR = 72 * logoProg;
  const cx = W / 2, cy = H / 2 - 80;
  if (logoProg > 0) {
    const lg = ctx.createLinearGradient(cx - logoR, cy - logoR, cx + logoR, cy + logoR);
    lg.addColorStop(0, C.orange);
    lg.addColorStop(1, C.orangeDark);
    ctx.beginPath();
    ctx.arc(cx, cy, logoR, 0, Math.PI * 2);
    ctx.fillStyle = lg;
    ctx.fill();
    // Shadow
    ctx.save();
    ctx.globalAlpha = 0.2 * logoProg;
    ctx.beginPath();
    ctx.arc(cx, cy + 8, logoR, 0, Math.PI * 2);
    ctx.fillStyle = C.orange;
    ctx.filter = 'blur(16px)';
    ctx.fill();
    ctx.restore();
    // Logo text
    ctx.save();
    ctx.globalAlpha = logoProg;
    ctx.font = `900 ${46 * logoProg}px 'Tajawal', sans-serif`;
    ctx.fillStyle = C.white;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'ltr';
    ctx.fillText('يش', cx, cy + 3);
    ctx.restore();
    // Pulse ring
    const pulseProg = (t * 0.8) % 1;
    ctx.save();
    ctx.globalAlpha = (1 - pulseProg) * 0.6 * logoProg;
    ctx.beginPath();
    ctx.arc(cx, cy, logoR + pulseProg * 40, 0, Math.PI * 2);
    ctx.strokeStyle = C.orange;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // App name "يمن شات"
  const titleProg = p(t, 0.9, 1.8);
  if (titleProg > 0) {
    ctx.save();
    ctx.globalAlpha = titleProg;
    ctx.font = `900 ${72}px 'Tajawal', sans-serif`;
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const titleY = cy + logoR + 24 + (1 - titleProg) * 30;
    // "يمن" in dark
    ctx.fillStyle = C.text;
    ctx.fillText('يمن', W / 2 + 80, titleY);
    // "شات" in orange
    ctx.fillStyle = C.orange;
    ctx.fillText('شات', W / 2 - 60, titleY);
    ctx.restore();
  }

  // Subtitle pill
  const subProg = sp(t, 1.8, 2.8);
  if (subProg > 0) {
    ctx.save();
    ctx.globalAlpha = p(t, 1.8, 2.4);
    pill(ctx, W / 2, H / 2 + 80 + (1 - p(t, 1.8, 2.4)) * 20, 'الوكيل الذكي — خالد سلمان', C.orange, C.blue, 22);
    ctx.restore();
  }

  // Footer tag
  const footProg = p(t, 2.8, 3.8);
  if (footProg > 0) {
    ctx.save();
    ctx.globalAlpha = footProg;
    ctx.font = `600 20px 'Cairo', sans-serif`;
    ctx.fillStyle = C.muted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';
    ctx.fillText('🤖 ذكاء اصطناعي  •  5 لغات  •  72 محوراً', W / 2, H / 2 + 140);
    ctx.restore();
  }
}

// ─────────────── SCENE 2: SERVICES (7–15s → local t: 0–8s) ───────────────
function scene2(ctx: CanvasRenderingContext2D, t: number, W: number, H: number) {
  gradientBg(ctx, W, H, '#F8FAFF', '#EFF6FF', '#FFF7ED');
  topBar(ctx, W, C.orange, C.blue);

  const LANGS = ['🇾🇪 العربية', '🇬🇧 English', '🇫🇷 Français', '🇹🇷 Türkçe', '🇪🇸 Español'];
  const SVCS = [
    { icon: '💻', name: 'تصميم المواقع', count: '18 محور' },
    { icon: '🎬', name: 'صناعة الفيديوهات', count: '15 محور' },
    { icon: '📱', name: 'برمجة التطبيقات', count: '14 محور' },
    { icon: '📣', name: 'التسويق الرقمي', count: '25 محور' },
  ];

  // Title
  const titleProg = p(t, 0.2, 0.9);
  ctx.save();
  ctx.globalAlpha = titleProg;
  ctx.font = `900 52px 'Tajawal', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.direction = 'rtl';
  ctx.fillStyle = C.text;
  ctx.fillText('استعرض', W / 2 + 80, 50);
  ctx.fillStyle = C.orange;
  ctx.fillText('الخدمات', W / 2 - 70, 50);
  ctx.restore();

  // Language sidebar (left)
  const langProg = p(t, 0.3, 1.0);
  const lx = 60, ly = 130, lw = 210, lh = 42;
  ctx.save();
  ctx.globalAlpha = langProg;
  ctx.translate(lerp(-lw, 0, langProg), 0);
  // Header
  const lhg = ctx.createLinearGradient(lx, 0, lx + lw, 0);
  lhg.addColorStop(0, C.orange);
  lhg.addColorStop(1, '#FB923C');
  roundRect(ctx, lx, ly, lw, 36, [12, 12, 0, 0]);
  ctx.fillStyle = lhg;
  ctx.fill();
  ctx.font = `700 16px 'Cairo', sans-serif`;
  ctx.fillStyle = C.white;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  ctx.fillText('🌐 اللغات المدعومة', lx + lw / 2, ly + 18);
  LANGS.forEach((lang, i) => {
    const y = ly + 36 + i * lh;
    roundRect(ctx, lx, y, lw, lh, i === 4 ? [0, 0, 12, 12] : 0);
    ctx.fillStyle = i === 0 ? '#FFF7ED' : C.white;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = `${i === 0 ? '700' : '500'} 17px 'Cairo', sans-serif`;
    ctx.fillStyle = i === 0 ? C.orange : C.text;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';
    ctx.fillText(lang, lx + lw - 16, y + lh / 2);
    if (i === 0) {
      ctx.beginPath();
      ctx.arc(lx + 20, y + lh / 2, 5, 0, Math.PI * 2);
      ctx.fillStyle = C.orange;
      ctx.fill();
    }
  });
  ctx.restore();

  // Service cards (center)
  const svcX = 300, svcW = W - 300 - 300;
  SVCS.forEach((svc, i) => {
    const svcProg = p(t, 0.5 + i * 0.15, 1.2 + i * 0.15);
    const cy2 = 130 + i * 110;
    ctx.save();
    ctx.globalAlpha = svcProg;
    ctx.translate(0, lerp(30, 0, svcProg));
    card(ctx, svcX, cy2, svcW, 90, 14);
    ctx.font = `800 26px 'Cairo', sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';
    ctx.fillStyle = C.text;
    ctx.fillText(svc.icon + '  ' + svc.name, svcX + svcW - 20, cy2 + 45);
    // Count badge
    roundRect(ctx, svcX + 18, cy2 + 27, 110, 36, 18);
    ctx.fillStyle = '#EFF6FF';
    ctx.fill();
    ctx.font = `700 15px 'Cairo', sans-serif`;
    ctx.fillStyle = C.blue;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'ltr';
    ctx.fillText(svc.count, svcX + 73, cy2 + 45);
    ctx.restore();
  });

  // 72 topics badge
  const badgeProg = sp(t, 3.0, 4.2);
  ctx.save();
  ctx.globalAlpha = badgeProg;
  pill(ctx, W / 2, H - 90, '✨ 72 محوراً متخصصاً 🚀', C.orange, C.orangeDark, 26);
  ctx.restore();

  // Right stats
  const statProg = p(t, 4.0, 5.0);
  const sx = W - 260, sy = 130;
  ctx.save();
  ctx.globalAlpha = statProg;
  ctx.translate(lerp(60, 0, statProg), 0);
  [
    { label: 'الإنتاج', icon: '✍️', desc: 'محتوى وتصميم' },
    { label: 'الاستهلاك', icon: '📊', desc: 'تحليل وأبحاث' },
  ].forEach((stat, i) => {
    const cy2 = sy + i * 200;
    card(ctx, sx, cy2, 220, 170, 16);
    ctx.font = '40px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'ltr';
    ctx.fillStyle = C.text;
    ctx.fillText(stat.icon, sx + 110, cy2 + 55);
    ctx.font = `800 22px 'Cairo', sans-serif`;
    ctx.fillStyle = C.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stat.label, sx + 110, cy2 + 105);
    ctx.font = `500 16px 'Cairo', sans-serif`;
    ctx.fillStyle = C.muted;
    ctx.fillText(stat.desc, sx + 110, cy2 + 135);
  });
  ctx.restore();
}

// ─────────────── SCENE 3: CHAT (15–24s → local t: 0–9s) ───────────────
function scene3(ctx: CanvasRenderingContext2D, t: number, W: number, H: number) {
  gradientBg(ctx, W, H, '#EFF6FF', '#F8FAFF', '#FFF7ED');
  topBar(ctx, W, C.blue, C.orange);

  const chatW = 760, chatX = (W - chatW) / 2;

  // Chat window header
  const headerProg = p(t, 0.2, 0.7);
  ctx.save();
  ctx.globalAlpha = headerProg;
  card(ctx, chatX, 50, chatW, 64, [16, 16, 0, 0]);
  // Avatar
  const ag = ctx.createLinearGradient(chatX + 20, 70, chatX + 60, 110);
  ag.addColorStop(0, C.orange);
  ag.addColorStop(1, C.orangeDark);
  ctx.beginPath();
  ctx.arc(chatX + 42, 82, 22, 0, Math.PI * 2);
  ctx.fillStyle = ag;
  ctx.fill();
  ctx.font = `800 16px 'Tajawal', sans-serif`;
  ctx.fillStyle = C.white;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'ltr';
  ctx.fillText('ي', chatX + 42, 83);
  ctx.font = `700 18px 'Cairo', sans-serif`;
  ctx.fillStyle = C.text;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('يمن شات', chatX + 76, 58);
  ctx.font = `600 14px 'Cairo', sans-serif`;
  ctx.fillStyle = '#22C55E';
  ctx.fillText('● متصل الآن', chatX + 76, 82);
  // Badge
  pill(ctx, chatX + chatW - 90, 82, 'تصميم مواقع', C.orange, C.blue, 14);
  ctx.restore();

  // Messages
  const MSGS = [
    { role: 'user', text: 'أريد تصميم موقع إلكتروني احترافي لشركتي', showAt: 0.6 },
    { role: 'ai', text: 'بكل سرور! يمكنني مساعدتك في تصميم موقع احترافي متكامل. ما نوع نشاطك التجاري؟', showAt: 2.2 },
    { role: 'user', text: 'شركة استيراد وتصدير — أحتاج متجراً إلكترونياً', showAt: 4.0 },
    { role: 'ai', text: '✅ ممتاز! سأصمم متجراً احترافياً مع لوحة تحكم كاملة ودفع إلكتروني وتحسين SEO', showAt: 5.8 },
  ];

  let currentY = 135;
  MSGS.forEach((msg, i) => {
    const msgProg = p(t, msg.showAt, msg.showAt + 0.5);
    if (msgProg <= 0) return;
    const isAI = msg.role === 'ai';
    const msgW = chatW - 80;
    const lineHeight = 24;
    const words = msg.text.split(' ');
    const maxW = 420;
    const lines: string[] = [];
    let cur = '';
    ctx.font = `500 18px 'Cairo', sans-serif`;
    words.forEach(w => {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > maxW) { lines.push(cur); cur = w; }
      else cur = test;
    });
    if (cur) lines.push(cur);
    const bh = lines.length * lineHeight + 28;
    const bw = Math.min(maxW + 40, msgW);

    ctx.save();
    ctx.globalAlpha = msgProg;
    ctx.translate(0, (1 - msgProg) * 15);
    if (isAI) {
      // AI bubble (right side for RTL)
      roundRect(ctx, chatX + 20, currentY, bw, bh, [4, 16, 16, 16]);
      const bg = ctx.createLinearGradient(chatX + 20, currentY, chatX + 20 + bw, currentY + bh);
      bg.addColorStop(0, '#FFF7ED');
      bg.addColorStop(1, '#FFEDD5');
      ctx.fillStyle = bg;
      ctx.fill();
    } else {
      // User bubble
      roundRect(ctx, chatX + chatW - bw - 20, currentY, bw, bh, [16, 16, 4, 16]);
      const ubg = ctx.createLinearGradient(chatX + chatW - bw - 20, currentY, chatX + chatW, currentY);
      ubg.addColorStop(0, '#EFF6FF');
      ubg.addColorStop(1, '#DBEAFE');
      ctx.fillStyle = ubg;
      ctx.fill();
    }
    ctx.font = `500 18px 'Cairo', sans-serif`;
    ctx.fillStyle = C.text;
    ctx.textAlign = isAI ? 'right' : 'right';
    ctx.textBaseline = 'top';
    ctx.direction = 'rtl';
    lines.forEach((line, li) => {
      const tx = isAI ? chatX + 20 + bw - 16 : chatX + chatW - 20;
      ctx.fillText(line, tx, currentY + 14 + li * lineHeight);
    });
    ctx.restore();
    currentY += bh + 12;

    // Typing indicator (after AI messages)
    const nextMsg = MSGS[i + 1];
    if (nextMsg && nextMsg.role === 'ai') {
      const typingStart = msg.showAt + 0.6;
      const typingEnd = nextMsg.showAt;
      if (t > typingStart && t < typingEnd) {
        const typingProg = p(t, typingStart, typingStart + 0.4);
        ctx.save();
        ctx.globalAlpha = typingProg;
        roundRect(ctx, chatX + 20, currentY, 80, 38, 16);
        ctx.fillStyle = '#FFF7ED';
        ctx.fill();
        for (let d = 0; d < 3; d++) {
          const bob = Math.sin(t * 8 + d * 1.2) * 5;
          ctx.beginPath();
          ctx.arc(chatX + 36 + d * 18, currentY + 19 + bob, 5, 0, Math.PI * 2);
          ctx.fillStyle = C.orange;
          ctx.fill();
        }
        ctx.restore();
      }
    }
  });

  // Input bar
  const inputProg = p(t, 0.3, 0.8);
  ctx.save();
  ctx.globalAlpha = inputProg;
  card(ctx, chatX, H - 80, chatW, 60, [0, 0, 16, 16]);
  roundRect(ctx, chatX + 15, H - 65, chatW - 75, 40, 20);
  ctx.fillStyle = '#F1F5F9';
  ctx.fill();
  ctx.font = `400 16px 'Cairo', sans-serif`;
  ctx.fillStyle = '#94A3B8';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  ctx.fillText('اكتب رسالتك...', chatX + chatW - 30, H - 45);
  // Send button
  const sg = ctx.createLinearGradient(chatX + chatW - 58, 0, chatX + chatW - 14, 0);
  sg.addColorStop(0, C.orange);
  sg.addColorStop(1, C.orangeDark);
  ctx.beginPath();
  ctx.arc(chatX + chatW - 36, H - 45, 20, 0, Math.PI * 2);
  ctx.fillStyle = sg;
  ctx.fill();
  ctx.font = '700 16px sans-serif';
  ctx.fillStyle = C.white;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'ltr';
  ctx.fillText('➤', chatX + chatW - 36, H - 44);
  ctx.restore();
}

// ─────────────── SCENE 4: PRICING (24–32s → local t: 0–8s) ───────────────
function scene4(ctx: CanvasRenderingContext2D, t: number, W: number, H: number) {
  gradientBg(ctx, W, H, '#F8FAFF', '#EFF6FF', '#FFF7ED');
  topBar(ctx, W, '#8B5CF6', C.orange);

  const titleProg = p(t, 0.2, 0.8);
  ctx.save();
  ctx.globalAlpha = titleProg;
  ctx.font = `900 52px 'Tajawal', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.direction = 'rtl';
  ctx.fillStyle = C.text;
  ctx.fillText('اختر', W / 2 + 60, 40);
  ctx.fillStyle = C.orange;
  ctx.fillText('خطتك', W / 2 - 50, 40);
  ctx.font = `500 20px 'Cairo', sans-serif`;
  ctx.fillStyle = C.muted;
  ctx.fillText('خطط مرنة تناسب احتياجاتك', W / 2, 100);
  ctx.restore();

  const PLANS = [
    { name: 'مجاني', price: '$0', period: '/', color: '#64748B', bg: '#F8FAFF', badge: '' },
    { name: 'أسبوعي', price: '$2.99', period: '/أسبوع', color: C.blue, bg: '#EFF6FF', badge: '' },
    { name: 'شهري', price: '$9.99', period: '/شهر', color: C.orange, bg: '#FFF7ED', badge: '⭐ الأشهر' },
    { name: 'سنوي', price: '$79.99', period: '/سنة', color: '#8B5CF6', bg: '#F5F3FF', badge: '🔥 الأوفر' },
  ];

  const pw = (W - 120) / 4 - 12, ph = 260;
  const startX = 60, startY = 150;

  PLANS.forEach((plan, i) => {
    const planProg = sp(t, 0.5 + i * 0.15, 1.5 + i * 0.15);
    ctx.save();
    ctx.globalAlpha = planProg;
    ctx.translate(0, lerp(50, 0, planProg));
    const px = startX + i * (pw + 12);
    roundRect(ctx, px, startY, pw, ph, 16);
    ctx.fillStyle = plan.bg;
    ctx.fill();
    ctx.strokeStyle = plan.color + '44';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (plan.badge) {
      roundRect(ctx, px, startY, pw, 32, [16, 16, 0, 0]);
      ctx.fillStyle = plan.color;
      ctx.fill();
      ctx.font = `700 15px 'Cairo', sans-serif`;
      ctx.fillStyle = C.white;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';
      ctx.fillText(plan.badge, px + pw / 2, startY + 16);
    }
    const contentY = startY + (plan.badge ? 40 : 16);
    ctx.font = `800 22px 'Tajawal', sans-serif`;
    ctx.fillStyle = plan.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.direction = 'rtl';
    ctx.fillText(plan.name, px + pw / 2, contentY);
    ctx.font = `900 38px 'Tajawal', sans-serif`;
    ctx.fillStyle = C.text;
    ctx.fillText(plan.price, px + pw / 2, contentY + 30);
    ctx.font = `400 15px 'Cairo', sans-serif`;
    ctx.fillStyle = C.muted;
    ctx.fillText(plan.period, px + pw / 2, contentY + 74);
    ctx.restore();
  });

  // Al-Kuraimi section
  const payProg = p(t, 3.2, 4.2);
  ctx.save();
  ctx.globalAlpha = payProg;
  const payX = (W - 560) / 2, payY = startY + ph + 20, payW = 560, payH = 130;
  card(ctx, payX, payY, payW, payH, 18);
  ctx.strokeStyle = C.orange + '44';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.font = `700 20px 'Cairo', sans-serif`;
  ctx.fillStyle = C.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.direction = 'rtl';
  ctx.fillText('💳 طريقة الدفع', payX + payW / 2, payY + 16);
  const methods = [
    { label: 'الكريمي 🏦', c: '#16A34A' },
    { label: 'واتساب 💬', c: '#25D366' },
    { label: 'تحويل بنكي 🏛️', c: C.blue },
  ];
  methods.forEach((m, i) => {
    const mp = sp(t, 3.4 + i * 0.1, 4.2 + i * 0.1);
    ctx.save();
    ctx.globalAlpha = payProg * mp;
    const mx = payX + 30 + i * 175, my = payY + 52;
    roundRect(ctx, mx, my, 155, 36, 18);
    ctx.fillStyle = m.c;
    ctx.fill();
    ctx.font = `700 15px 'Cairo', sans-serif`;
    ctx.fillStyle = C.white;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';
    ctx.fillText(m.label, mx + 77, my + 18);
    ctx.restore();
  });

  const ctaProg = p(t, 5.0, 6.0);
  ctx.save();
  ctx.globalAlpha = ctaProg;
  pill(ctx, payX + payW / 2, payY + payH - 22, '✅ فعّل حسابك Premium فوراً!', C.orange, C.orangeDark, 20);
  ctx.restore();
  ctx.restore();
}

// ─────────────── SCENE 5: CLOSING (32–40s → local t: 0–8s) ───────────────
function scene5(ctx: CanvasRenderingContext2D, t: number, W: number, H: number) {
  // Dark background
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#0F172A');
  g.addColorStop(0.5, '#1E293B');
  g.addColorStop(1, '#0C1220');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Glow orbs
  const glow1 = ctx.createRadialGradient(W * 0.8, 0, 0, W * 0.8, 0, W * 0.5);
  glow1.addColorStop(0, 'rgba(249,115,22,0.25)');
  glow1.addColorStop(1, 'transparent');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);
  const glow2 = ctx.createRadialGradient(0, H, 0, 0, H, W * 0.4);
  glow2.addColorStop(0, 'rgba(14,165,233,0.2)');
  glow2.addColorStop(1, 'transparent');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // Logo + name
  const logoProg = sp(t, 0.2, 1.0);
  ctx.save();
  ctx.globalAlpha = p(t, 0.2, 0.8);
  const lR = 44 * logoProg, lcx = W / 2, lcy = 90;
  const lg2 = ctx.createLinearGradient(lcx - lR, lcy - lR, lcx + lR, lcy + lR);
  lg2.addColorStop(0, C.orange);
  lg2.addColorStop(1, C.orangeDark);
  ctx.beginPath();
  ctx.arc(lcx, lcy, lR, 0, Math.PI * 2);
  ctx.fillStyle = lg2;
  ctx.fill();
  ctx.font = `900 ${28 * logoProg}px 'Tajawal', sans-serif`;
  ctx.fillStyle = C.white;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'ltr';
  ctx.fillText('يش', lcx, lcy + 2);
  ctx.font = `900 42px 'Tajawal', sans-serif`;
  ctx.fillStyle = C.white;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.direction = 'rtl';
  ctx.fillText('يمن', W / 2 + 50, 145);
  ctx.fillStyle = C.orange;
  ctx.fillText('شات', W / 2 - 55, 145);
  ctx.font = `500 18px 'Cairo', sans-serif`;
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('الوكيل الذكي — خالد سلمان', W / 2, 200);
  ctx.restore();

  // CTA banner
  const ctaProg = sp(t, 1.0, 2.0);
  ctx.save();
  ctx.globalAlpha = p(t, 1.0, 1.8);
  ctx.translate(0, lerp(30, 0, p(t, 1.0, 1.8)));
  pill(ctx, W / 2, 270, '🚀 اشترك الآن وابدأ رحلتك مع الذكاء الاصطناعي', C.orange, C.orangeDark, 22);
  ctx.restore();

  // Contact title
  const divProg = p(t, 2.0, 2.8);
  ctx.save();
  ctx.globalAlpha = divProg;
  ctx.font = `600 18px 'Cairo', sans-serif`;
  ctx.fillStyle = '#94A3B8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  ctx.fillText('أرقام التواصل الرسمية مع المطور', W / 2, 330);
  const dg = ctx.createLinearGradient(W / 2 - 100, 0, W / 2 + 100, 0);
  dg.addColorStop(0, C.orange);
  dg.addColorStop(1, C.blue);
  ctx.fillStyle = dg;
  ctx.fillRect(W / 2 - 100, 345, 200, 3);
  ctx.restore();

  // Contact cards
  const CONTACTS = [
    { icon: '📱', label: 'واتساب', value: '+967 783 701 365', color: '#25D366' },
    { icon: '📱', label: 'واتساب', value: '+967 779 435 445', color: '#25D366' },
    { icon: '✈️', label: 'تيليجرام', value: '@kshskshg', color: C.blue },
    { icon: '📧', label: 'البريد الإلكتروني', value: 'khalidsalman7140@gmail.com', color: C.orange },
  ];

  const cw = (W - 80) / 2 - 10, ch = 90;
  const cStartX = 40, cStartY = 370;
  CONTACTS.forEach((c, i) => {
    const row = Math.floor(i / 2), col = i % 2;
    const cx2 = cStartX + col * (cw + 20);
    const cy2 = cStartY + row * (ch + 12);
    const cprog = p(t, 2.8 + i * 0.15, 3.6 + i * 0.15);
    ctx.save();
    ctx.globalAlpha = cprog;
    ctx.translate(col === 0 ? lerp(-30, 0, cprog) : lerp(30, 0, cprog), 0);
    roundRect(ctx, cx2, cy2, cw, ch, 16);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();
    ctx.strokeStyle = c.color + '55';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Icon circle
    ctx.beginPath();
    ctx.arc(cx2 + 42, cy2 + ch / 2, 24, 0, Math.PI * 2);
    ctx.fillStyle = c.color + '22';
    ctx.fill();
    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'ltr';
    ctx.fillText(c.icon, cx2 + 42, cy2 + ch / 2);
    // Text
    ctx.font = `700 15px 'Cairo', sans-serif`;
    ctx.fillStyle = c.color;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.direction = 'rtl';
    ctx.fillText(c.label, cx2 + cw - 16, cy2 + 18);
    ctx.font = `700 18px 'Cairo', sans-serif`;
    ctx.fillStyle = C.white;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.direction = 'ltr';
    ctx.fillText(c.value, cx2 + cw - 16, cy2 + 42);
    ctx.restore();
  });

  // Pulse dots footer
  const footProg = p(t, 5.0, 6.0);
  ctx.save();
  ctx.globalAlpha = footProg;
  for (let d = 0; d < 3; d++) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 4 + d * 1.5);
    ctx.beginPath();
    ctx.arc(W / 2 - 30 + d * 30, H - 45, 5, 0, Math.PI * 2);
    ctx.fillStyle = C.orange;
    ctx.globalAlpha = footProg * (0.5 + 0.5 * pulse);
    ctx.fill();
  }
  ctx.globalAlpha = footProg;
  ctx.font = `500 16px 'Cairo', sans-serif`;
  ctx.fillStyle = '#64748B';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  ctx.fillText('يمن شات © 2025', W / 2, H - 20);
  ctx.restore();
}

// ─────────────── MAIN RENDER ───────────────
export function renderFrame(ctx: CanvasRenderingContext2D, t: number, W: number, H: number): void {
  ctx.save();
  ctx.clearRect(0, 0, W, H);

  const SCENE_END = [7, 15, 24, 32, 40];
  if (t < SCENE_END[0]) {
    scene1(ctx, t, W, H);
  } else if (t < SCENE_END[1]) {
    scene2(ctx, t - SCENE_END[0], W, H);
  } else if (t < SCENE_END[2]) {
    scene3(ctx, t - SCENE_END[1], W, H);
  } else if (t < SCENE_END[3]) {
    scene4(ctx, t - SCENE_END[2], W, H);
  } else {
    scene5(ctx, t - SCENE_END[3], W, H);
  }

  // Scene transition overlay (brief black flash between scenes)
  for (const end of SCENE_END.slice(0, -1)) {
    const dist = Math.abs(t - end);
    if (dist < 0.3) {
      ctx.fillStyle = 'rgba(0,0,0,' + (0.3 - dist) * 0.8 + ')';
      ctx.fillRect(0, 0, W, H);
    }
  }

  ctx.restore();
}

export const TOTAL_DURATION = 40;
