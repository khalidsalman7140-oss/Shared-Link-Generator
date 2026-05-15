import { Link } from "wouter";
import {
  ArrowLeft, Brain, Code2, Palette, BookOpen, Globe, Star, Phone,
  Mail, Send, Award, Users, Zap, Shield, ChevronLeft, Play,
  Sparkles, CheckCircle2, ExternalLink, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const SERVICES = [
  {
    icon: Brain, color: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/30",
    iconColor: "text-violet-400",
    title: "الذكاء الاصطناعي والأتمتة",
    desc: "وكلاء ذكاء اصطناعي، chatbots، أنظمة تحليل بيانات، والأتمتة الكاملة",
    items: ["وكلاء AI مخصصة", "تحليل البيانات", "أتمتة العمليات", "حلول GPT/Gemini"],
  },
  {
    icon: Code2, color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30",
    iconColor: "text-blue-400",
    title: "البرمجة والتطوير",
    desc: "مواقع إلكترونية، تطبيقات موبايل، أنظمة متكاملة بأحدث التقنيات",
    items: ["مواقع React/Next.js", "تطبيقات Flutter", "APIs وقواعد بيانات", "أنظمة إدارة"],
  },
  {
    icon: Palette, color: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30",
    iconColor: "text-pink-400",
    title: "التصميم والهوية البصرية",
    desc: "هوية بصرية كاملة، تصاميم إعلانية، وإنتاج المحتوى الإبداعي",
    items: ["هوية بصرية كاملة", "تصاميم سوشيال ميديا", "إنفوجرافيك وعروض", "فيديو موشن"],
  },
  {
    icon: BookOpen, color: "from-amber-500/20 to-yellow-500/20", border: "border-amber-500/30",
    iconColor: "text-amber-400",
    title: "التعليم والاستشارات",
    desc: "كورسات تعليمية، كتب إلكترونية، واستشارات تقنية متخصصة",
    items: ["كورسات AI مخصصة", "كتب إلكترونية", "تحليل المشاريع", "خارطة طريق مهنية"],
  },
  {
    icon: Shield, color: "from-emerald-500/20 to-green-500/20", border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    title: "الأمن السيبراني",
    desc: "تأمين الأنظمة، اختبار الاختراق، وحماية البيانات والخصوصية",
    items: ["اختبار الاختراق", "تأمين المواقع", "تشفير البيانات", "استشارات أمن"],
  },
  {
    icon: Globe, color: "from-teal-500/20 to-cyan-500/20", border: "border-teal-500/30",
    iconColor: "text-teal-400",
    title: "حلول القطاعات الحكومية",
    desc: "73 محوراً يغطي الصحة والتعليم والنقل والطوارئ وكل القطاعات",
    items: ["الصحة الذكية", "التعليم الرقمي", "النقل الذكي", "نظام الطوارئ"],
  },
];

const STATS = [
  { value: "73", label: "محوراً تقنياً متكاملاً", icon: Zap },
  { value: "5", label: "كتب مؤلَّفة", icon: BookOpen },
  { value: "24/7", label: "وكيل ذكي دائم", icon: Brain },
  { value: "5", label: "لغات مدعومة", icon: Globe },
];

const TECHS = [
  "Gemini 2.5 Flash", "React", "Node.js", "PostgreSQL", "TypeScript",
  "Tailwind CSS", "Drizzle ORM", "Clerk Auth", "PWA", "REST API",
  "Python", "TensorFlow", "Figma", "Flutter", "Firebase",
];

export default function WebsitePage() {
  const { isRTL } = useI18n();
  const [activeService, setActiveService] = useState<number | null>(null);

  return (
    <div dir="rtl" className="min-h-screen bg-[#050510] text-foreground overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/40 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-primary/50">
              <img src={`${basePath}/khalid.jpg`} alt="KS" className="w-full h-full object-contain"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  (el.parentElement as HTMLElement).innerHTML = '<span class="w-full h-full flex items-center justify-center text-primary font-black text-sm">KS</span>';
                }} />
            </div>
            <div>
              <p className="font-black text-sm leading-none">خالد سلمان</p>
              <p className="text-[10px] text-primary leading-none">الوكيل الذكي</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">عن خالد</a>
            <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">الخدمات</a>
            <a href="#tech" className="text-muted-foreground hover:text-foreground transition-colors">التقنيات</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">تواصل</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button size="sm" variant="outline" className="text-xs">
                <ArrowLeft className="w-3.5 h-3.5 ml-1" />التطبيق
              </Button>
            </Link>
            <Link href="/chat">
              <Button size="sm" className="text-xs">
                <MessageSquare className="w-3.5 h-3.5 ml-1" />ابدأ مجاناً
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-24 pb-20 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-amber-500/15 blur-[100px]" />
          <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-blue-500/10 blur-[80px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            مدعوم بـ Gemini 2.5 Flash — أقوى نموذج ذكاء اصطناعي
          </div>

          <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-primary/50 shadow-[0_0_80px_rgba(124,58,237,0.6)] mx-auto mb-6 bg-primary/10">
            <img src={`${basePath}/khalid.jpg`} alt="خالد سلمان" className="w-full h-full object-contain" />
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-4"
            style={{ background: "linear-gradient(135deg, #fff 30%, #a78bfa 60%, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            خالد سلمان
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-primary mb-3">الوكيل الذكي المتكامل</p>
          <p className="text-lg text-muted-foreground mb-3 max-w-2xl mx-auto leading-relaxed">
            مبدع يمني متخصص في الذكاء الاصطناعي والبرمجة والتصميم
            <br />
            <span className="text-amber-400 font-semibold">نبني مهاراتك.. لنبني اليمن 🇾🇪</span>
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
            {STATS.map((s, i) => (
              <div key={i} className="bg-card/50 border border-border/60 rounded-2xl p-3 backdrop-blur-sm">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-black text-primary">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/chat">
              <Button size="lg" className="gap-2 shadow-2xl shadow-primary/40 text-base px-8">
                <Brain className="w-5 h-5" />جرّب الوكيل الذكي مجاناً
              </Button>
            </Link>
            <a href="#services">
              <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                <Play className="w-5 h-5" />اكتشف الخدمات
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-20 max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">عن خالد</span>
            <h2 className="text-3xl md:text-4xl font-black mt-3 mb-4">خالد أحمد مسعد مصلح سلمان</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>🇾🇪 شاب يمني طموح من <strong className="text-foreground">محافظة الضالع — مديرية قعطبة — قرية عزاب</strong></p>
              <p>🎓 طالب <strong className="text-foreground">ذكاء اصطناعي في جامعة إب</strong> — حاصل على 94.38% في الثانوية</p>
              <p>📚 مؤلف <strong className="text-primary">5 كتب</strong> في مجالات متنوعة</p>
              <p>🌟 لديه طموح عميق لخدمة اليمن وأمته الإسلامية وتحقيق التحول الرقمي</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              {["ذكاء اصطناعي", "برمجة", "تصميم", "تأليف", "ريادة أعمال"].map(tag => (
                <span key={tag} className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {[
              { icon: Award, title: "نتيجة الثانوية", val: "94.38%", col: "text-yellow-400" },
              { icon: Brain, title: "التخصص الجامعي", val: "ذكاء اصطناعي — جامعة إب", col: "text-primary" },
              { icon: BookOpen, title: "المؤلفات", val: "5 كتب مؤلَّفة", col: "text-emerald-400" },
              { icon: Globe, title: "اللغات", val: "العربية + 4 لغات أخرى مدعومة", col: "text-blue-400" },
              { icon: Zap, title: "محاور التطبيق", val: "73 محوراً متكاملاً", col: "text-purple-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card/40 border border-border/60">
                <div className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                  <item.icon className={cn("w-4.5 h-4.5", item.col)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.title}</p>
                  <p className="font-semibold text-sm">{item.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-20 bg-card/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">الخدمات</span>
            <h2 className="text-3xl md:text-4xl font-black mt-3 mb-2">ماذا يقدم الوكيل الذكي؟</h2>
            <p className="text-muted-foreground">73 محوراً تغطي كل ما تحتاجه من تقنية وإبداع</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s, i) => (
              <div key={i}
                className={cn("rounded-2xl border p-5 cursor-pointer transition-all duration-300 bg-gradient-to-br",
                  s.color, s.border,
                  activeService === i ? "scale-105 shadow-xl shadow-primary/20" : "hover:scale-102 hover:shadow-lg"
                )}
                onClick={() => setActiveService(activeService === i ? null : i)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-card/60 border border-border/60 flex items-center justify-center shrink-0">
                    <s.icon className={cn("w-5 h-5", s.iconColor)} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{s.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                </div>
                {activeService === i && (
                  <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-2 gap-1.5">
                    {s.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className={cn("w-3 h-3 shrink-0", s.iconColor)} />
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/vision">
              <Button variant="outline" size="lg" className="gap-2">
                <Sparkles className="w-4 h-4" />استعرض جميع المحاور الـ 73
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section id="tech" className="py-20 max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-xs text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">التقنيات</span>
          <h2 className="text-3xl font-black mt-3 mb-2">مبني بأحدث التقنيات</h2>
          <p className="text-muted-foreground text-sm">تقنيات عالمية لبناء حلول يمنية</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {TECHS.map(tech => (
            <span key={tech}
              className="bg-card border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all rounded-xl px-4 py-2 text-sm font-medium cursor-default">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* PLANS TEASER */}
      <section className="py-20 bg-card/20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-3">ابدأ مجاناً — اشترك للحصول على المزيد</h2>
          <p className="text-muted-foreground mb-8">خطط مرنة تناسب كل احتياج</p>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { name: "مجاني", price: "0$", feat: "5 رسائل/يوم", col: "border-slate-500/40" },
              { name: "أسبوعي", price: "2.99$", feat: "رسائل لا محدودة", col: "border-blue-500/40" },
              { name: "شهري", price: "9.99$", feat: "كل الميزات", col: "border-primary/50", highlight: true },
              { name: "سنوي", price: "79.99$", feat: "أفضل قيمة", col: "border-yellow-500/40" },
            ].map((p, i) => (
              <div key={i} className={cn("rounded-2xl border p-5", p.col, p.highlight && "bg-primary/5 scale-105 shadow-xl shadow-primary/20")}>
                {p.highlight && <p className="text-[10px] text-primary font-bold mb-2">⭐ الأكثر شعبية</p>}
                <p className="font-black text-lg">{p.name}</p>
                <p className="text-3xl font-black text-primary mt-1">{p.price}</p>
                <p className="text-xs text-muted-foreground mt-1 mb-3">{p.feat}</p>
                <Link href="/pricing">
                  <Button size="sm" className="w-full text-xs" variant={p.highlight ? "default" : "outline"}>
                    اشترك الآن
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-xs text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">تواصل معنا</span>
          <h2 className="text-3xl font-black mt-3 mb-2">تواصل مع خالد سلمان</h2>
          <p className="text-muted-foreground">متاح للتعاون والاستشارات وخدمات الذكاء الاصطناعي</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {[
            { href: "https://wa.me/967783701365", icon: Phone, label: "+967 783 701 365", sub: "WhatsApp", col: "hover:border-emerald-500/50 hover:bg-emerald-500/5" },
            { href: "https://wa.me/967779435445", icon: Phone, label: "+967 779 435 445", sub: "WhatsApp", col: "hover:border-emerald-500/50 hover:bg-emerald-500/5" },
            { href: "https://t.me/kshskshg", icon: Send, label: "@kshskshg", sub: "Telegram", col: "hover:border-blue-500/50 hover:bg-blue-500/5" },
            { href: "mailto:khalidsalman7140@gmail.com", icon: Mail, label: "khalidsalman7140@gmail.com", sub: "Email", col: "hover:border-red-500/50 hover:bg-red-500/5" },
          ].map((c, i) => (
            <a key={i} href={c.href} target="_blank" rel="noopener noreferrer"
              className={cn("flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50 transition-all", c.col)}>
              <c.icon className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium text-sm">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.sub}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 mr-auto" />
            </a>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/chat">
            <Button size="lg" className="gap-2 shadow-2xl shadow-primary/30 text-base px-10">
              <Brain className="w-5 h-5" />ابدأ مع الوكيل الذكي الآن
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/30 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-primary/30">
            <img src={`${basePath}/khalid.jpg`} alt="" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-sm">خالد سلمان — الوكيل الذكي</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2026 خالد سلمان — جميع الحقوق محفوظة • مدعوم بـ Gemini 2.5 Flash
        </p>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <Link href="/">الرئيسية</Link>
          <Link href="/chat">الدردشة</Link>
          <Link href="/services">الخدمات</Link>
          <Link href="/about">عن خالد</Link>
          <Link href="/pricing">الأسعار</Link>
        </div>
      </footer>
    </div>
  );
}
