import { useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  ArrowLeft, Palette, Video, GraduationCap, Code2, MessageCircle,
  Mail, Sparkles, Star, Zap, Crown, Globe, Brain, CheckCircle2,
  MessageSquare, Rocket, Building2, Shield, MapPin, Phone, Send,
  Users, Award, BookOpen, Volume2, Ghost, ChevronDown, ExternalLink,
  Activity, Car, UtensilsCrossed, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Landing() {
  const { t, lang, isRTL } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId = 0;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, r: Math.random() * 2 + 0.5, o: Math.random() * 0.5 + 0.1 });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 139, 250, ${p.o})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#07070f] text-white overflow-x-hidden">
      {/* Animated canvas bg */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      {/* Gradient overlays */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.35) 0%, transparent 65%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(234,179,8,0.12) 0%, transparent 50%)" }} />
      {/* Islamic geometric pattern overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill='none' stroke='%23a78bfa' stroke-width='0.5'/%3E%3Cpath d='M30 10 L50 30 L30 50 L10 30 Z' fill='none' stroke='%23f59e0b' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='8' fill='none' stroke='%23a78bfa' stroke-width='0.4'/%3E%3C/svg%3E")`, backgroundSize: "60px 60px" }} />

      {/* ─── NAV ─── */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <img src="/logo.svg" alt="يمن شات" className="w-9 h-9 rounded-xl shadow-lg shadow-primary/40" />
            <span className="font-bold text-base hidden sm:block">{isRTL ? "يمن شات" : "Yemen Chat"}</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/vision"><Button variant="ghost" size="sm" className="text-xs hidden md:flex gap-1"><Sparkles className="w-3.5 h-3.5" />{isRTL ? "الرؤية 73" : "Vision 73"}</Button></Link>
          <Link href="/about"><Button variant="ghost" size="sm" className="text-xs hidden md:flex">{isRTL ? "عن خالد" : "About"}</Button></Link>
          <Link href="/sign-in"><Button variant="ghost" size="sm" className="text-xs">{t("signIn")}</Button></Link>
          <Link href="/sign-up"><Button size="sm" className="text-xs shadow-md shadow-primary/30">{t("startFree")}</Button></Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[95vh] px-4 text-center pt-16">
        <div className="flex flex-col items-center space-y-7 max-w-4xl mx-auto">
          {/* Avatar */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <div className="relative w-28 h-28 rounded-full border-2 border-primary/60 overflow-hidden bg-primary/10 shadow-[0_0_60px_rgba(124,58,237,0.6)]">
              <div className="absolute inset-0 flex items-center justify-center font-black text-3xl text-primary/50">خ.س</div>
              <img src={`${basePath}/khalid.jpg`} alt="خالد سلمان" className="relative z-10 w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <div className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          {/* Islamic Bismillah badge */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-amber-400/80 text-lg font-medium tracking-widest" style={{ fontFamily: "'Cairo', 'Noto Naskh Arabic', serif" }}>
              ﷽
            </div>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium shadow-lg shadow-primary/10 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              {isRTL ? "مدعوم بـ Gemini 2.5 Flash" : "Powered by Gemini 2.5 Flash"}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
              style={{ background: "linear-gradient(135deg, #fff 20%, #a78bfa 55%, #f59e0b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {isRTL ? "يمن شات" : "Yemen Chat"}
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold"
              style={{ background: "linear-gradient(90deg, #a78bfa, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {isRTL ? "الوكيل الذكي — خالد سلمان" : "AI Agent by Khaled Salman"}
            </h2>
            <p className="text-xl md:text-2xl font-semibold text-amber-400/90">{t("tagline")}</p>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">{t("heroDesc")}</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg justify-center">
            <Link href="/sign-up" className="flex-1">
              <Button size="lg" className="w-full gap-2 shadow-xl shadow-primary/40 hover:shadow-primary/60 transition-all text-base font-bold bg-primary hover:bg-primary/90">
                <Sparkles className="w-5 h-5" />{t("startFree")}
              </Button>
            </Link>
            <Link href="/guest-chat" className="flex-1">
              <Button size="lg" variant="outline" className="w-full gap-2 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/70 text-base font-semibold">
                <Ghost className="w-5 h-5" />{isRTL ? "جرّب بدون تسجيل" : "Try Without Login"}
              </Button>
            </Link>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Globe, label: isRTL ? "5 لغات + لهجات عربية" : "5 Languages + Dialects" },
              { icon: Zap, label: isRTL ? "دردشة مجانية غير محدودة" : "Unlimited Free Chat" },
              { icon: Volume2, label: isRTL ? "صوت ذكر / أنثى" : "Male/Female Voice" },
              { icon: Shield, label: isRTL ? "خصوصية محمية" : "Privacy Protected" },
            ].map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
                <h.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{h.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { n: "73", label: isRTL ? "محوراً في الرؤية" : "Vision Axes", color: "text-purple-400" },
            { n: "5", label: isRTL ? "كتب مؤلَّفة" : "Authored Books", color: "text-amber-400" },
            { n: "5", label: isRTL ? "لغات مدعومة" : "Languages", color: "text-emerald-400" },
            { n: "24/7", label: isRTL ? "دعم بالذكاء الاصطناعي" : "AI Support", color: "text-blue-400" },
          ].map((s, i) => (
            <div key={i} className="relative text-center p-5 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ background: "radial-gradient(circle at 50% 0%, rgba(124,58,237,1), transparent)" }} />
              <div className={cn("text-3xl font-black mb-1", s.color)}>{s.n}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHAT FREE / WHAT PAID ─── */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{isRTL ? "مجاني مدى الحياة ✦ أو اشترك للمزيد" : "Free Forever ✦ Or Subscribe for More"}</h2>
            <p className="text-muted-foreground">{isRTL ? "الدردشة والاستشارات مجانية دائماً — الخدمات الكبيرة تحتاج خطة" : "Chat & consulting always free — big tasks need a plan"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-400" /></div>
                <span className="font-bold text-emerald-400">{isRTL ? "مجاني دائماً" : "Always Free"}</span>
              </div>
              {[
                isRTL ? "دردشة واستشارة غير محدودة" : "Unlimited chat & consulting",
                isRTL ? "تحديد المسار المهني" : "Career path mapping",
                isRTL ? "مدقق المشاريع وتقييم الأفكار" : "Project validator & idea review",
                isRTL ? "خبرة في السوق اليمني (أسعار، دفع، لهجات)" : "Yemen market expertise",
                isRTL ? "5 طلبات تصميم / يوم" : "5 design requests/day",
                isRTL ? "الدردشة الصوتية (ذكر/أنثى)" : "Voice chat (male/female)",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />{item}
                </div>
              ))}
            </div>
            {/* Paid */}
            <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6 space-y-3 relative overflow-hidden">
              <div className="absolute top-3 end-3 text-xs bg-primary/20 text-primary border border-primary/30 rounded-full px-2 py-0.5">{isRTL ? "من $2.99/أسبوع" : "From $2.99/week"}</div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center"><Crown className="w-4 h-4 text-primary" /></div>
                <span className="font-bold text-primary">{isRTL ? "خطة مدفوعة" : "Paid Plan"}</span>
              </div>
              {[
                isRTL ? "بناء مواقع وتطبيقات كاملة" : "Full website & app development",
                isRTL ? "إنتاج فيديوهات ومحتوى ضخم" : "Video & large content production",
                isRTL ? "توليد صور بالذكاء الاصطناعي" : "AI image generation",
                isRTL ? "طلبات تصميم غير محدودة" : "Unlimited design requests",
                isRTL ? "دعم مباشر من خالد سلمان" : "Direct support from Khaled",
                isRTL ? "أولوية قصوى في الردود" : "Highest priority responses",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />{item}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-6 gap-3">
            <Link href="/pricing"><Button variant="outline" size="sm" className="gap-1.5 border-primary/30">{isRTL ? "عرض كل الخطط" : "View All Plans"}<ArrowLeft className={cn("w-4 h-4", !isRTL && "rotate-180")} /></Button></Link>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{isRTL ? "الخدمات المتاحة" : "Available Services"}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Palette, title: isRTL ? "التصميم والإبداع" : "Design & Creativity", desc: isRTL ? "هوية بصرية، صور AI، ديكور، مطبوعات" : "Visual identity, AI images, decor, prints", color: "from-purple-500/20 to-purple-500/5", border: "border-purple-500/30", icon_col: "text-purple-400", bg_icon: "bg-purple-500/20" },
              { icon: Video, title: isRTL ? "المحتوى الرقمي" : "Digital Content", desc: isRTL ? "فيديوهات، كتب إلكترونية، عروض تقديمية" : "Videos, eBooks, presentations", color: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/30", icon_col: "text-blue-400", bg_icon: "bg-blue-500/20" },
              { icon: GraduationCap, title: isRTL ? "الخدمات الأكاديمية" : "Academic Services", desc: isRTL ? "مشاريع تخرج، عروض جامعية، تحليل بيانات" : "Graduation projects, university presentations", color: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/30", icon_col: "text-emerald-400", bg_icon: "bg-emerald-500/20" },
              { icon: Code2, title: isRTL ? "البرمجة والبيانات" : "Programming & Data", desc: isRTL ? "مواقع، تطبيقات، أنظمة، تحليل بيانات" : "Websites, apps, systems, data analysis", color: "from-orange-500/20 to-orange-500/5", border: "border-orange-500/30", icon_col: "text-orange-400", bg_icon: "bg-orange-500/20" },
            ].map((s, i) => (
              <div key={i} className={cn("group p-5 rounded-2xl border bg-gradient-to-b hover:scale-105 transition-all cursor-pointer", s.color, s.border)}>
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-4", s.bg_icon)}>
                  <s.icon className={cn("w-5 h-5", s.icon_col)} />
                </div>
                <h3 className="font-bold mb-1.5 text-sm">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-6 gap-3 flex-wrap">
            <Link href="/services"><Button variant="outline" size="sm" className="border-border gap-1.5">{isRTL ? "كل الخدمات" : "All Services"}<ArrowLeft className={cn("w-4 h-4", !isRTL && "rotate-180")} /></Button></Link>
            <Link href="/marketplace"><Button size="sm" className="gap-1.5 bg-black text-white hover:bg-gray-800">🏪 {isRTL ? "مجمع الخدمات والعمل الحر" : "Freelance Marketplace"}<ArrowLeft className={cn("w-4 h-4", !isRTL && "rotate-180")} /></Button></Link>
          </div>
        </div>
      </section>

      {/* ─── VISION TEASER ─── */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto rounded-3xl border border-primary/30 p-8 md:p-12 text-center overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(234,179,8,0.08) 100%)" }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, rgba(124,58,237,1), transparent 70%)" }} />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-full px-4 py-1.5 text-sm text-amber-400 mb-5">
              <Star className="w-3.5 h-3.5" />
              {isRTL ? "رؤية طموحة" : "Ambitious Vision"}
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4"
              style={{ background: "linear-gradient(90deg, #fff, #a78bfa 50%, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {isRTL ? "73 محوراً لنبني اليمن" : "73 Axes to Build Yemen"}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
              {isRTL ? "من الدردشة الذكية إلى ربط الوزارات والبنوك والمستشفيات والمدارس — رؤية متكاملة لرقمنة اليمن كله تحت قيادة خالد سلمان" : "From AI chat to connecting ministries, banks, hospitals & schools — a complete vision to digitize Yemen under Khaled Salman's leadership"}
            </p>
            <Link href="/vision">
              <Button size="lg" variant="outline" className="gap-2 border-amber-500/50 text-amber-300 hover:bg-amber-500/10">
                <Sparkles className="w-5 h-5" />{isRTL ? "استكشف الرؤية الكاملة" : "Explore the Full Vision"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── GOVERNMENT SECTORS ─── */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 text-sm text-amber-400 mb-4">
              <Globe className="w-3.5 h-3.5" />
              {isRTL ? "رؤية 73 — القطاعات الحكومية" : "Vision 73 — Government Sectors"}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3"
              style={{ background: "linear-gradient(90deg, #fff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {isRTL ? "منظومة رقمية متكاملة لليمن" : "Integrated Digital Ecosystem for Yemen"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isRTL ? "6 محاور حكومية كبرى تغطي كل جوانب الحياة في اليمن — كل منظومة تعمل بالذكاء الاصطناعي وتندمج مع الأخرى" : "6 major government axes covering all aspects of life in Yemen — each ecosystem powered by AI and integrated with the others"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: "/health", icon: Activity, num: "67", title: isRTL ? "الصحة الذكية" : "Smart Health", desc: isRTL ? "ملف طبي موحد، حجز مواعيد، وصفات إلكترونية، رصد أوبئة، مستشفيات وصيدليات" : "Unified medical file, appointments, e-prescriptions, epidemic monitoring, hospitals & pharmacies", grad: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/30", ic: "text-emerald-400", bg: "bg-emerald-500/20", ring: "hover:border-emerald-500/60" },
              { href: "/education", icon: GraduationCap, num: "68", title: isRTL ? "التعليم الإلكتروني" : "E-Education", desc: isRTL ? "سجل أكاديمي، شهادات رقمية، درس بالذكاء الاصطناعي، تصحيح آلي، ربط مع سوق العمل" : "Academic record, digital certificates, AI lessons, auto-grading, job market integration", grad: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/30", ic: "text-blue-400", bg: "bg-blue-500/20", ring: "hover:border-blue-500/60" },
              { href: "/transport", icon: Car, num: "69", title: isRTL ? "النقل والمواصلات" : "Transport", desc: isRTL ? "تراخيص رقمية، GPS شحن، طلب سيارة، مشاركة الركوب، تتبع مركبات، مخالفات إلكترونية" : "Digital licenses, freight GPS, taxi requests, carpooling, vehicle tracking, e-violations", grad: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/30", ic: "text-amber-400", bg: "bg-amber-500/20", ring: "hover:border-amber-500/60" },
              { href: "/real-estate", icon: Building2, num: "70", title: isRTL ? "العقارات والتعمير" : "Real Estate", desc: isRTL ? "تراخيص بناء، تقييم ذكي، عقود إلكترونية، سوق عقاري موحد، تصميم معماري بالذكاء الاصطناعي" : "Building permits, AI valuation, e-contracts, unified property market, AI architectural design", grad: "from-purple-500/20 to-purple-500/5", border: "border-purple-500/30", ic: "text-purple-400", bg: "bg-purple-500/20", ring: "hover:border-purple-500/60" },
              { href: "/restaurants", icon: UtensilsCrossed, num: "71", title: isRTL ? "المطاعم والتوصيل" : "Restaurants", desc: isRTL ? "استقبال طلبات متعدد القنوات، تتبع توصيل، إدارة مخزون، تحليل تفضيلات، برامج ولاء" : "Multi-channel orders, delivery tracking, inventory management, preference analysis, loyalty programs", grad: "from-red-500/20 to-red-500/5", border: "border-red-500/30", ic: "text-red-400", bg: "bg-red-500/20", ring: "hover:border-red-500/60" },
              { href: "/emergency", icon: AlertTriangle, num: "72", title: isRTL ? "الطوارئ والكوارث" : "Emergency", desc: isRTL ? "إنذارات مبكرة، رصد زلازل وسيول وأعاصير، تنسيق إغاثة، إدارة مخزون طوارئ، حماية البنية التحتية" : "Early warnings, earthquake/flood/hurricane monitoring, relief coordination, emergency stockpile management", grad: "from-orange-500/20 to-orange-500/5", border: "border-orange-500/30", ic: "text-orange-400", bg: "bg-orange-500/20", ring: "hover:border-orange-500/60" },
            ].map((s, i) => (
              <Link key={i} href={s.href}>
                <div className={cn("group p-5 rounded-2xl border bg-gradient-to-b hover:scale-[1.02] transition-all cursor-pointer h-full", s.grad, s.border, s.ring)}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
                      <s.icon className={cn("w-5 h-5", s.ic)} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">محور #{s.num}</div>
                      <h3 className="font-bold text-sm">{s.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  <div className={cn("mt-3 text-xs font-medium flex items-center gap-1", s.ic)}>
                    {isRTL ? "استكشف الخدمات" : "Explore Services"}
                    <ArrowLeft className={cn("w-3 h-3", isRTL ? "" : "rotate-180")} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">{isRTL ? "تواصل مع خالد سلمان" : "Contact Khaled Salman"}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "https://wa.me/967783701365", label: "واتساب 1", icon: Phone, color: "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10" },
              { href: "https://wa.me/967779435445", label: "واتساب 2", icon: Phone, color: "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10" },
              { href: "https://t.me/kshskshg", label: "تيليغرام", icon: Send, color: "border-blue-500/40 text-blue-400 hover:bg-blue-500/10" },
              { href: "mailto:khalidsalman7140@gmail.com", label: "البريد الإلكتروني", icon: Mail, color: "border-red-500/40 text-red-400 hover:bg-red-500/10" },
            ].map((c, i) => (
              <a key={i} href={c.href} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className={cn("gap-2", c.color)}>
                  <c.icon className="w-4 h-4" />{c.label}
                </Button>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-border py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="يمن شات" className="w-7 h-7 rounded-lg" />
            <span>{isRTL ? "يمن شات" : "Yemen Chat"}</span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs justify-center">
            <Link href="/about"><span className="hover:text-foreground cursor-pointer">{isRTL ? "عن خالد" : "About"}</span></Link>
            <Link href="/services"><span className="hover:text-foreground cursor-pointer">{isRTL ? "الخدمات" : "Services"}</span></Link>
            <Link href="/pricing"><span className="hover:text-foreground cursor-pointer">{isRTL ? "الاشتراكات" : "Pricing"}</span></Link>
            <Link href="/vision"><span className="hover:text-foreground cursor-pointer">{isRTL ? "الرؤية 73" : "Vision 73"}</span></Link>
            <Link href="/health"><span className="hover:text-emerald-400 cursor-pointer">{isRTL ? "الصحة" : "Health"}</span></Link>
            <Link href="/education"><span className="hover:text-blue-400 cursor-pointer">{isRTL ? "التعليم" : "Education"}</span></Link>
            <Link href="/transport"><span className="hover:text-amber-400 cursor-pointer">{isRTL ? "النقل" : "Transport"}</span></Link>
            <Link href="/real-estate"><span className="hover:text-purple-400 cursor-pointer">{isRTL ? "العقارات" : "Real Estate"}</span></Link>
            <Link href="/restaurants"><span className="hover:text-red-400 cursor-pointer">{isRTL ? "المطاعم" : "Restaurants"}</span></Link>
            <Link href="/emergency"><span className="hover:text-orange-400 cursor-pointer">{isRTL ? "الطوارئ" : "Emergency"}</span></Link>
          </div>
          <span className="text-xs">© 2026 {isRTL ? "يمن شات — خالد سلمان. جميع الحقوق محفوظة." : "Yemen Chat — Khaled Salman. All rights reserved."}</span>
        </div>
      </footer>
    </div>
  );
}
