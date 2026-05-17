import { Link } from "wouter";
import {
  ArrowLeft, Palette, Video, GraduationCap, Code2,
  Mail, Sparkles, Star, Zap, Crown, Globe, Shield, MapPin, Phone, Send,
  CheckCircle2, Ghost, ChevronDown, Activity, Car, UtensilsCrossed, AlertTriangle,
  BookOpen, Heart, Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ── Fingerprint watermark SVG (pure CSS, zero network cost) ── */
const FINGERPRINT_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cellipse cx='70' cy='70' rx='64' ry='58' fill='none' stroke='%23000' stroke-width='0.6' opacity='0.12'/%3E%3Cellipse cx='70' cy='70' rx='55' ry='50' fill='none' stroke='%23000' stroke-width='0.6' opacity='0.12'/%3E%3Cellipse cx='70' cy='70' rx='46' ry='42' fill='none' stroke='%23000' stroke-width='0.6' opacity='0.12'/%3E%3Cellipse cx='70' cy='70' rx='37' ry='34' fill='none' stroke='%23000' stroke-width='0.6' opacity='0.12'/%3E%3Cellipse cx='70' cy='70' rx='28' ry='26' fill='none' stroke='%23000' stroke-width='0.6' opacity='0.12'/%3E%3Cellipse cx='70' cy='70' rx='19' ry='18' fill='none' stroke='%23000' stroke-width='0.6' opacity='0.12'/%3E%3Cellipse cx='70' cy='70' rx='10' ry='10' fill='none' stroke='%23000' stroke-width='0.6' opacity='0.12'/%3E%3C/svg%3E")`;

/* ── Islamic 8-pointed star tile (CSS-only geometric, no network) ── */
const ISLAMIC_TILE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='none'/%3E%3Cpolygon points='40,4 46,28 70,22 52,40 70,58 46,52 40,76 34,52 10,58 28,40 10,22 34,28' fill='none' stroke='%23b45309' stroke-width='0.7' opacity='0.18'/%3E%3Ccircle cx='40' cy='40' r='10' fill='none' stroke='%23b45309' stroke-width='0.5' opacity='0.14'/%3E%3C/svg%3E")`;

export default function Landing() {
  const { t, lang, isRTL } = useI18n();

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Fingerprint watermark (fixed, ultra-light) ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: FINGERPRINT_BG, backgroundSize: "140px 140px", opacity: 0.35 }}
      />

      {/* ── Islamic geometric header band ── */}
      <div
        className="relative z-10 w-full border-b border-amber-200/80 py-1.5 overflow-hidden"
        style={{ background: "linear-gradient(90deg,#fffbeb,#fefce8,#fffbeb)" }}
      >
        {/* Islamic tile pattern strip */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: ISLAMIC_TILE, backgroundSize: "80px 80px", opacity: 0.6 }}
        />
        <div className="relative z-10 flex items-center justify-center gap-3 text-amber-700 select-none">
          <span className="text-[11px] tracking-[4px] opacity-60">✦ ✦ ✦</span>
          <span className="text-base md:text-lg font-medium" style={{ fontFamily: "'Cairo','Amiri',serif", letterSpacing: "2px" }}>
            ﷽
          </span>
          <span className="text-[11px] tracking-[4px] opacity-60">✦ ✦ ✦</span>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-gray-100">
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <img src="/logo.svg" alt="يمن شات" className="w-9 h-9 rounded-xl shadow shadow-amber-200" />
            <div>
              <div className="font-black text-base leading-tight text-gray-900 hidden sm:block">{isRTL ? "يمن شات" : "Yemen Chat"}</div>
              <div className="text-[10px] text-amber-600 hidden sm:block" style={{ fontFamily: "serif" }}>خالد سلمان</div>
            </div>
          </div>
        </Link>
        {/* Islamic geometric divider ornament */}
        <div className="hidden md:flex items-center gap-1 text-amber-400 text-xs opacity-60 select-none">
          ◆ ◇ ◆ ◇ ◆
        </div>
        <div className="flex items-center gap-2">
          <Link href="/vision"><Button variant="ghost" size="sm" className="text-xs hidden md:flex gap-1 text-gray-600 hover:text-gray-900"><Sparkles className="w-3.5 h-3.5 text-amber-500" />{isRTL ? "الرؤية 73" : "Vision 73"}</Button></Link>
          <Link href="/about"><Button variant="ghost" size="sm" className="text-xs hidden md:flex text-gray-600 hover:text-gray-900">{isRTL ? "عن خالد" : "About"}</Button></Link>
          <Link href="/sign-in"><Button variant="ghost" size="sm" className="text-xs text-gray-700 border border-gray-200">{t("signIn")}</Button></Link>
          <Link href="/sign-up"><Button size="sm" className="text-xs bg-gray-900 hover:bg-gray-800 text-white shadow">{t("startFree")}</Button></Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-4 text-center pt-12">
        <div className="flex flex-col items-center space-y-7 max-w-4xl mx-auto">

          {/* Islamic decorative arch above avatar */}
          <div className="flex items-center gap-3 text-amber-500 select-none">
            <span className="text-xs opacity-50">─────</span>
            <span className="text-xl" style={{ fontFamily: "serif" }}>☽ ✦ ☾</span>
            <span className="text-xs opacity-50">─────</span>
          </div>

          {/* Avatar */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-amber-100 blur-md" />
            <div className="relative w-28 h-28 rounded-full border-2 border-amber-400/60 overflow-hidden bg-amber-50 shadow-lg shadow-amber-200/60">
              <div className="absolute inset-0 flex items-center justify-center font-black text-3xl text-amber-300">خ.س</div>
              <img
                src={`${basePath}/khalid.jpg`}
                alt="خالد سلمان"
                className="relative z-10 w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <div className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          {/* Bismillah + badge */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="text-amber-600 text-xl font-medium"
              style={{ fontFamily: "'Cairo','Amiri',serif" }}
            >
              ﷽
            </div>
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5 text-sm text-violet-700 font-medium shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              {isRTL ? "مدعوم بـ Gemini 2.5 Flash" : "Powered by Gemini 2.5 Flash"}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1
              className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
              style={{ background: "linear-gradient(135deg,#1a1a2e 20%,#6d28d9 55%,#b45309 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              {isRTL ? "يمن شات" : "Yemen Chat"}
            </h1>
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{ background: "linear-gradient(90deg,#6d28d9,#b45309)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              {isRTL ? "الوكيل الذكي — خالد سلمان" : "AI Agent by Khaled Salman"}
            </h2>
            <p className="text-xl md:text-2xl font-semibold text-amber-600">{t("tagline")}</p>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl leading-relaxed">{t("heroDesc")}</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg justify-center">
            <Link href="/sign-up" className="flex-1">
              <Button size="lg" className="w-full gap-2 shadow-lg bg-gray-900 hover:bg-gray-800 text-white text-base font-bold">
                <Sparkles className="w-5 h-5" />{t("startFree")}
              </Button>
            </Link>
            <Link href="/guest-chat" className="flex-1">
              <Button size="lg" variant="outline" className="w-full gap-2 border-amber-400 text-amber-700 hover:bg-amber-50 text-base font-semibold">
                <Ghost className="w-5 h-5" />{isRTL ? "جرّب بدون تسجيل" : "Try Without Login"}
              </Button>
            </Link>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Globe, label: isRTL ? "5 لغات + لهجات عربية" : "5 Languages + Dialects" },
              { icon: Zap, label: isRTL ? "دردشة مجانية غير محدودة" : "Unlimited Free Chat" },
              { icon: Shield, label: isRTL ? "خصوصية محمية" : "Privacy Protected" },
              { icon: Star, label: isRTL ? "هوية إسلامية يمنية" : "Yemeni Islamic Identity" },
            ].map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
                <h.icon className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                <span>{h.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>
      </section>

      {/* ── ISLAMIC DIVIDER ── */}
      <div className="relative z-10 py-3 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: ISLAMIC_TILE, backgroundSize: "80px 80px" }}
        />
        <div className="relative z-10 flex items-center justify-center gap-4 text-amber-500 select-none">
          <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-transparent to-amber-300" />
          <span className="text-lg" style={{ fontFamily: "serif" }}>✦ ❧ ✦</span>
          <div className="h-px flex-1 max-w-xs bg-gradient-to-l from-transparent to-amber-300" />
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { n: "73", label: isRTL ? "محوراً في الرؤية" : "Vision Axes", color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
            { n: "5", label: isRTL ? "كتب مؤلَّفة" : "Authored Books", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
            { n: "5", label: isRTL ? "لغات مدعومة" : "Languages", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
            { n: "24/7", label: isRTL ? "دعم بالذكاء الاصطناعي" : "AI Support", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          ].map((s, i) => (
            <div key={i} className={cn("text-center p-5 rounded-2xl border", s.bg)}>
              <div className={cn("text-3xl font-black mb-1", s.color)}>{s.n}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ── صفات قوية: جمال الروح ──
          ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-16 px-4">
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{ backgroundImage: ISLAMIC_TILE, backgroundSize: "80px 80px" }}
        />
        <div className="relative max-w-5xl mx-auto">

          {/* Section header with Islamic frame */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4 select-none">
              <span className="text-2xl text-amber-500" style={{ fontFamily: "serif" }}>❧</span>
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-full px-5 py-2 text-sm text-amber-700 font-bold shadow-sm">
                <span style={{ fontFamily: "serif" }}>✦</span>
                {isRTL ? "صفات قوية: جمال الروح" : "Noble Traits: Beauty of the Soul"}
                <span style={{ fontFamily: "serif" }}>✦</span>
              </div>
              <span className="text-2xl text-amber-500" style={{ fontFamily: "serif" }}>❧</span>
            </div>
            <h2
              className="text-3xl md:text-4xl font-extrabold mb-3"
              style={{ background: "linear-gradient(90deg,#6d28d9,#b45309)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              {isRTL ? "القيم التي نبني عليها" : "The Values We Build Upon"}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              {isRTL
                ? "منصة يمن شات تقوم على مبادئ إسلامية وإنسانية أصيلة — الأمانة في التعامل، والعلم في الخدمة، والكرم في الأخوّة"
                : "Yemen Chat is built on authentic Islamic and human principles — honesty in dealings, knowledge in service, and generosity in brotherhood"}
            </p>
          </div>

          {/* 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1 — الإيمان والصدق */}
            <div className="relative group rounded-3xl border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-white p-7 text-center overflow-hidden hover:shadow-xl hover:shadow-amber-100 transition-all hover:-translate-y-1">
              {/* Geometric corner ornaments */}
              <div className="absolute top-3 start-3 w-5 h-5 border-t-2 border-s-2 border-amber-300 rounded-tl" />
              <div className="absolute top-3 end-3 w-5 h-5 border-t-2 border-e-2 border-amber-300 rounded-tr" />
              <div className="absolute bottom-3 start-3 w-5 h-5 border-b-2 border-s-2 border-amber-300 rounded-bl" />
              <div className="absolute bottom-3 end-3 w-5 h-5 border-b-2 border-e-2 border-amber-300 rounded-br" />

              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto mb-5 shadow-sm group-hover:scale-110 transition-transform">
                <span className="text-3xl select-none">🌙</span>
              </div>

              {/* Arabic Ayah / Hadith style badge */}
              <div className="inline-flex items-center gap-1 bg-amber-100 border border-amber-200 rounded-full px-3 py-0.5 text-[10px] text-amber-700 mb-3 font-medium">
                <span>﴾</span>{isRTL ? "الأمانة أساس" : "Trustworthiness"}<span>﴿</span>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-3">
                {isRTL ? "الإيمان والصدق" : "Faith & Honesty"}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {isRTL
                  ? "نعزز قيم الأمانة والمصداقية في كل تعامل رقمي — وكيلنا الذكي لا يكذب ولا يضلل، بل يهدي إلى الحق ويبني الثقة بين المستخدمين والخدمات."
                  : "We uphold honesty and integrity in every digital interaction — our AI agent guides to truth and builds trust between users and services."}
              </p>
              <div className="mt-5 text-xs text-amber-600 font-semibold" style={{ fontFamily: "serif" }}>
                ✦ {isRTL ? "صدقت فيما وعدت" : "True to every promise"} ✦
              </div>
            </div>

            {/* Card 2 — العلم والحكمة */}
            <div className="relative group rounded-3xl border-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white p-7 text-center overflow-hidden hover:shadow-xl hover:shadow-blue-100 transition-all hover:-translate-y-1">
              <div className="absolute top-3 start-3 w-5 h-5 border-t-2 border-s-2 border-blue-300 rounded-tl" />
              <div className="absolute top-3 end-3 w-5 h-5 border-t-2 border-e-2 border-blue-300 rounded-tr" />
              <div className="absolute bottom-3 start-3 w-5 h-5 border-b-2 border-s-2 border-blue-300 rounded-bl" />
              <div className="absolute bottom-3 end-3 w-5 h-5 border-b-2 border-e-2 border-blue-300 rounded-br" />

              <div className="w-16 h-16 rounded-2xl bg-blue-100 border border-blue-300 flex items-center justify-center mx-auto mb-5 shadow-sm group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-blue-600" />
              </div>

              <div className="inline-flex items-center gap-1 bg-blue-100 border border-blue-200 rounded-full px-3 py-0.5 text-[10px] text-blue-700 mb-3 font-medium">
                <span>﴾</span>{isRTL ? "اقرأ باسم ربك" : "Seek knowledge"}<span>﴿</span>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-3">
                {isRTL ? "العلم والحكمة" : "Knowledge & Wisdom"}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {isRTL
                  ? "مخصص لنشر المعرفة وتوجيهات الوكيل الذكي والحلول البرمجية الفعالة — نبني اليمن بالعقل والعلم والتقنية الحديثة المدمجة بالحكمة القديمة."
                  : "Dedicated to spreading knowledge, AI guidance and effective programming solutions — building Yemen with intellect, science, and modern technology fused with ancient wisdom."}
              </p>
              <div className="mt-5 text-xs text-blue-600 font-semibold" style={{ fontFamily: "serif" }}>
                ✦ {isRTL ? "طلب العلم فريضة" : "Seeking knowledge is a duty"} ✦
              </div>
            </div>

            {/* Card 3 — الكرم والضيافة */}
            <div className="relative group rounded-3xl border-2 border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-7 text-center overflow-hidden hover:shadow-xl hover:shadow-emerald-100 transition-all hover:-translate-y-1">
              <div className="absolute top-3 start-3 w-5 h-5 border-t-2 border-s-2 border-emerald-300 rounded-tl" />
              <div className="absolute top-3 end-3 w-5 h-5 border-t-2 border-e-2 border-emerald-300 rounded-tr" />
              <div className="absolute bottom-3 start-3 w-5 h-5 border-b-2 border-s-2 border-emerald-300 rounded-bl" />
              <div className="absolute bottom-3 end-3 w-5 h-5 border-b-2 border-e-2 border-emerald-300 rounded-br" />

              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto mb-5 shadow-sm group-hover:scale-110 transition-transform">
                <span className="text-3xl select-none">🤝</span>
              </div>

              <div className="inline-flex items-center gap-1 bg-emerald-100 border border-emerald-200 rounded-full px-3 py-0.5 text-[10px] text-emerald-700 mb-3 font-medium">
                <span>﴾</span>{isRTL ? "الأخوة اليمنية" : "Yemeni Brotherhood"}<span>﴿</span>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-3">
                {isRTL ? "الكرم والضيافة" : "Generosity & Hospitality"}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {isRTL
                  ? "تعكس روح الأخوة اليمنية — نرحب بالمستخدمين الجدد، وندعم المشتغلين في العمل الحر، ونبني مجتمعاً رقمياً يمنياً متماسكاً ومتعاوناً."
                  : "Reflects the Yemeni spirit of brotherhood — welcoming new users, supporting freelancers, and building a cohesive, cooperative Yemeni digital community."}
              </p>
              <div className="mt-5 text-xs text-emerald-600 font-semibold" style={{ fontFamily: "serif" }}>
                ✦ {isRTL ? "الكريم يُكرِم أخاه" : "The generous honors his brother"} ✦
              </div>
            </div>
          </div>

          {/* Bottom Quranic-style banner */}
          <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 py-4 px-6 text-center">
            <p className="text-sm text-amber-800 font-medium" style={{ fontFamily: "'Cairo','Amiri',serif" }}>
              {isRTL
                ? "« وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى » — هذه هي روح يمن شات ومجمع الخدمات الذكية"
                : '"Help one another in righteousness and piety" — This is the spirit of Yemen Chat & Smart Services Hub'}
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT FREE / WHAT PAID ── */}
      <section className="relative z-10 py-16 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">{isRTL ? "مجاني مدى الحياة ✦ أو اشترك للمزيد" : "Free Forever ✦ Or Subscribe for More"}</h2>
            <p className="text-gray-500">{isRTL ? "الدردشة والاستشارات مجانية دائماً — الخدمات الكبيرة تحتاج خطة" : "Chat & consulting always free — big tasks need a plan"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free */}
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
                <span className="font-bold text-emerald-700">{isRTL ? "مجاني دائماً" : "Always Free"}</span>
              </div>
              {[
                isRTL ? "دردشة واستشارة غير محدودة" : "Unlimited chat & consulting",
                isRTL ? "تحديد المسار المهني" : "Career path mapping",
                isRTL ? "مدقق المشاريع وتقييم الأفكار" : "Project validator & idea review",
                isRTL ? "خبرة في السوق اليمني (أسعار، دفع، لهجات)" : "Yemen market expertise",
                isRTL ? "5 طلبات تصميم / يوم" : "5 design requests/day",
                isRTL ? "الدردشة الصوتية (ذكر/أنثى)" : "Voice chat (male/female)",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{item}
                </div>
              ))}
            </div>
            {/* Paid */}
            <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-6 space-y-3 relative">
              <div className="absolute top-3 end-3 text-xs bg-violet-100 text-violet-700 border border-violet-200 rounded-full px-2 py-0.5">{isRTL ? "من $2.99/أسبوع" : "From $2.99/week"}</div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center"><Crown className="w-4 h-4 text-violet-600" /></div>
                <span className="font-bold text-violet-700">{isRTL ? "خطة مدفوعة" : "Paid Plan"}</span>
              </div>
              {[
                isRTL ? "بناء مواقع وتطبيقات كاملة" : "Full website & app development",
                isRTL ? "إنتاج فيديوهات ومحتوى ضخم" : "Video & large content production",
                isRTL ? "توليد صور بالذكاء الاصطناعي" : "AI image generation",
                isRTL ? "طلبات تصميم غير محدودة" : "Unlimited design requests",
                isRTL ? "دعم مباشر من خالد سلمان" : "Direct support from Khaled",
                isRTL ? "أولوية قصوى في الردود" : "Highest priority responses",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />{item}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-6 gap-3">
            <Link href="/pricing"><Button variant="outline" size="sm" className="gap-1.5 border-gray-300 text-gray-700">{isRTL ? "عرض كل الخطط" : "View All Plans"}<ArrowLeft className={cn("w-4 h-4", !isRTL && "rotate-180")} /></Button></Link>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">{isRTL ? "الخدمات المتاحة" : "Available Services"}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Palette, title: isRTL ? "التصميم والإبداع" : "Design & Creativity", desc: isRTL ? "هوية بصرية، صور AI، ديكور، مطبوعات" : "Visual identity, AI images, decor, prints", bg: "bg-purple-50 border-purple-200", icon_col: "text-purple-600", ic_bg: "bg-purple-100" },
              { icon: Video, title: isRTL ? "المحتوى الرقمي" : "Digital Content", desc: isRTL ? "فيديوهات، كتب إلكترونية، عروض تقديمية" : "Videos, eBooks, presentations", bg: "bg-blue-50 border-blue-200", icon_col: "text-blue-600", ic_bg: "bg-blue-100" },
              { icon: GraduationCap, title: isRTL ? "الخدمات الأكاديمية" : "Academic Services", desc: isRTL ? "مشاريع تخرج، عروض جامعية، تحليل بيانات" : "Graduation projects, university presentations", bg: "bg-emerald-50 border-emerald-200", icon_col: "text-emerald-600", ic_bg: "bg-emerald-100" },
              { icon: Code2, title: isRTL ? "البرمجة والبيانات" : "Programming & Data", desc: isRTL ? "مواقع، تطبيقات، أنظمة، تحليل بيانات" : "Websites, apps, systems, data analysis", bg: "bg-orange-50 border-orange-200", icon_col: "text-orange-600", ic_bg: "bg-orange-100" },
            ].map((s, i) => (
              <div key={i} className={cn("group p-5 rounded-2xl border-2 hover:scale-105 transition-all cursor-pointer", s.bg)}>
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-4", s.ic_bg)}>
                  <s.icon className={cn("w-5 h-5", s.icon_col)} />
                </div>
                <h3 className="font-bold mb-1.5 text-sm text-gray-900">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-6 gap-3 flex-wrap">
            <Link href="/services"><Button variant="outline" size="sm" className="border-gray-300 text-gray-700 gap-1.5">{isRTL ? "كل الخدمات" : "All Services"}<ArrowLeft className={cn("w-4 h-4", !isRTL && "rotate-180")} /></Button></Link>
            <Link href="/marketplace"><Button size="sm" className="gap-1.5 bg-gray-900 text-white hover:bg-gray-800">🏪 {isRTL ? "مجمع الخدمات والعمل الحر" : "Freelance Marketplace"}<ArrowLeft className={cn("w-4 h-4", !isRTL && "rotate-180")} /></Button></Link>
          </div>
        </div>
      </section>

      {/* ── VISION TEASER ── */}
      <section className="relative z-10 py-16 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto rounded-3xl border-2 border-amber-200 p-8 md:p-12 text-center relative overflow-hidden bg-gradient-to-br from-amber-50 to-white">
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{ backgroundImage: ISLAMIC_TILE, backgroundSize: "80px 80px" }}
          />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 rounded-full px-4 py-1.5 text-sm text-amber-700 mb-5 font-medium">
              <Star className="w-3.5 h-3.5" />
              {isRTL ? "رؤية طموحة" : "Ambitious Vision"}
            </div>
            <h2
              className="text-3xl md:text-5xl font-extrabold mb-4"
              style={{ background: "linear-gradient(90deg,#1a1a2e,#6d28d9 50%,#b45309)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              {isRTL ? "73 محوراً لنبني اليمن" : "73 Axes to Build Yemen"}
            </h2>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
              {isRTL ? "من الدردشة الذكية إلى ربط الوزارات والبنوك والمستشفيات والمدارس — رؤية متكاملة لرقمنة اليمن كله تحت قيادة خالد سلمان" : "From AI chat to connecting ministries, banks, hospitals & schools — a complete vision to digitize Yemen under Khaled Salman's leadership"}
            </p>
            <Link href="/vision">
              <Button size="lg" variant="outline" className="gap-2 border-amber-400 text-amber-700 hover:bg-amber-50">
                <Sparkles className="w-5 h-5" />{isRTL ? "استكشف الرؤية الكاملة" : "Explore the Full Vision"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── GOVERNMENT SECTORS ── */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 text-sm text-amber-700 mb-4">
              <Globe className="w-3.5 h-3.5" />
              {isRTL ? "رؤية 73 — القطاعات الحكومية" : "Vision 73 — Government Sectors"}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
              {isRTL ? "منظومة رقمية متكاملة لليمن" : "Integrated Digital Ecosystem for Yemen"}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {isRTL ? "6 محاور حكومية كبرى تغطي كل جوانب الحياة في اليمن — كل منظومة تعمل بالذكاء الاصطناعي وتندمج مع الأخرى" : "6 major government axes covering all aspects of life in Yemen"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: "/health", icon: Activity, num: "67", title: isRTL ? "الصحة الذكية" : "Smart Health", desc: isRTL ? "ملف طبي موحد، حجز مواعيد، وصفات إلكترونية" : "Unified medical file, appointments, e-prescriptions", bg: "bg-emerald-50 border-emerald-200", ic: "text-emerald-600", icbg: "bg-emerald-100", hover: "hover:border-emerald-400" },
              { href: "/education", icon: GraduationCap, num: "68", title: isRTL ? "التعليم الإلكتروني" : "E-Education", desc: isRTL ? "سجل أكاديمي، شهادات رقمية، درس بالذكاء الاصطناعي" : "Academic record, digital certificates, AI lessons", bg: "bg-blue-50 border-blue-200", ic: "text-blue-600", icbg: "bg-blue-100", hover: "hover:border-blue-400" },
              { href: "/transport", icon: Car, num: "69", title: isRTL ? "النقل والمواصلات" : "Transport", desc: isRTL ? "تراخيص رقمية، GPS شحن، طلب سيارة، تتبع مركبات" : "Digital licenses, freight GPS, taxi, vehicle tracking", bg: "bg-amber-50 border-amber-200", ic: "text-amber-600", icbg: "bg-amber-100", hover: "hover:border-amber-400" },
              { href: "/real-estate", icon: MapPin, num: "70", title: isRTL ? "العقارات والتعمير" : "Real Estate", desc: isRTL ? "تراخيص بناء، تقييم ذكي، عقود إلكترونية" : "Building permits, AI valuation, e-contracts", bg: "bg-purple-50 border-purple-200", ic: "text-purple-600", icbg: "bg-purple-100", hover: "hover:border-purple-400" },
              { href: "/restaurants", icon: UtensilsCrossed, num: "71", title: isRTL ? "المطاعم والتوصيل" : "Restaurants", desc: isRTL ? "استقبال طلبات متعدد القنوات، تتبع توصيل" : "Multi-channel orders, delivery tracking", bg: "bg-red-50 border-red-200", ic: "text-red-600", icbg: "bg-red-100", hover: "hover:border-red-400" },
              { href: "/emergency", icon: AlertTriangle, num: "72", title: isRTL ? "الطوارئ والكوارث" : "Emergency", desc: isRTL ? "إنذارات مبكرة، رصد زلازل وسيول وأعاصير" : "Early warnings, earthquake/flood monitoring", bg: "bg-orange-50 border-orange-200", ic: "text-orange-600", icbg: "bg-orange-100", hover: "hover:border-orange-400" },
            ].map((s, i) => (
              <Link key={i} href={s.href}>
                <div className={cn("group p-5 rounded-2xl border-2 hover:scale-[1.02] transition-all cursor-pointer h-full", s.bg, s.hover)}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", s.icbg)}>
                      <s.icon className={cn("w-5 h-5", s.ic)} />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400">محور #{s.num}</div>
                      <h3 className="font-bold text-sm text-gray-900">{s.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
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

      {/* ── CONTACT ── */}
      <section className="relative z-10 py-16 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{isRTL ? "تواصل مع خالد سلمان" : "Contact Khaled Salman"}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "https://wa.me/967783701365", label: "واتساب 1", icon: Phone, color: "border-emerald-300 text-emerald-700 hover:bg-emerald-50" },
              { href: "https://wa.me/967779435445", label: "واتساب 2", icon: Phone, color: "border-emerald-300 text-emerald-700 hover:bg-emerald-50" },
              { href: "https://t.me/kshskshg", label: "تيليغرام", icon: Send, color: "border-blue-300 text-blue-700 hover:bg-blue-50" },
              { href: "mailto:khalidsalman7140@gmail.com", label: "البريد الإلكتروني", icon: Mail, color: "border-red-300 text-red-700 hover:bg-red-50" },
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

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-gray-200 py-8 px-4 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="يمن شات" className="w-7 h-7 rounded-lg" />
            <div>
              <div className="font-bold text-gray-900">{isRTL ? "يمن شات" : "Yemen Chat"}</div>
              <div className="text-[10px] text-amber-600" style={{ fontFamily: "serif" }}>﷽</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs justify-center">
            <Link href="/about"><span className="hover:text-gray-900 cursor-pointer">{isRTL ? "عن خالد" : "About"}</span></Link>
            <Link href="/services"><span className="hover:text-gray-900 cursor-pointer">{isRTL ? "الخدمات" : "Services"}</span></Link>
            <Link href="/marketplace"><span className="hover:text-gray-900 cursor-pointer">🏪 {isRTL ? "المجمع" : "Marketplace"}</span></Link>
            <Link href="/pricing"><span className="hover:text-gray-900 cursor-pointer">{isRTL ? "الاشتراكات" : "Pricing"}</span></Link>
            <Link href="/vision"><span className="hover:text-gray-900 cursor-pointer">{isRTL ? "الرؤية 73" : "Vision 73"}</span></Link>
            <Link href="/health"><span className="hover:text-emerald-600 cursor-pointer">{isRTL ? "الصحة" : "Health"}</span></Link>
            <Link href="/education"><span className="hover:text-blue-600 cursor-pointer">{isRTL ? "التعليم" : "Education"}</span></Link>
            <Link href="/transport"><span className="hover:text-amber-600 cursor-pointer">{isRTL ? "النقل" : "Transport"}</span></Link>
            <Link href="/real-estate"><span className="hover:text-purple-600 cursor-pointer">{isRTL ? "العقارات" : "Real Estate"}</span></Link>
            <Link href="/restaurants"><span className="hover:text-red-600 cursor-pointer">{isRTL ? "المطاعم" : "Restaurants"}</span></Link>
            <Link href="/emergency"><span className="hover:text-orange-600 cursor-pointer">{isRTL ? "الطوارئ" : "Emergency"}</span></Link>
          </div>
          <div className="text-center">
            <div className="text-xs">© 2026 {isRTL ? "يمن شات — خالد سلمان. جميع الحقوق محفوظة." : "Yemen Chat — Khaled Salman. All rights reserved."}</div>
            <div className="text-[10px] text-amber-500 mt-1 select-none" style={{ fontFamily: "serif" }}>✦ بسم الله الرحمن الرحيم ✦</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
