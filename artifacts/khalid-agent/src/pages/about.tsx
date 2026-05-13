import { Link } from "wouter";
import {
  MapPin, Calendar, GraduationCap, BookOpen, Phone, Mail, Send,
  ArrowLeft, Brain, Star, Globe, Sparkles, Heart, Target, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function AboutPage() {
  const { isRTL } = useI18n();

  const facts = [
    { icon: Calendar, label: isRTL ? "تاريخ الميلاد" : "Date of Birth", value: "27 / 02 / 2003" },
    { icon: MapPin, label: isRTL ? "المحافظة" : "Governorate", value: isRTL ? "الضالع" : "Dhale'" },
    { icon: MapPin, label: isRTL ? "المديرية" : "District", value: isRTL ? "مديرية قعطبة — العود — بلاد الأعشور — قرية عزاب" : "Qa'atabah Dir. — Al-Awad — Bani Al-Ashour — Azab Village" },
    { icon: GraduationCap, label: isRTL ? "المؤهل الثانوي" : "Secondary", value: isRTL ? "ثالث ثانوي — نتيجة 94.38%" : "Third Secondary — Grade 94.38%" },
    { icon: Brain, label: isRTL ? "التعليم الجامعي" : "University", value: isRTL ? "ذكاء اصطناعي — جامعة إب" : "Artificial Intelligence — Ibb University" },
    { icon: BookOpen, label: isRTL ? "المؤلفات" : "Authored Books", value: isRTL ? "5 كتب مؤلَّفة" : "5 Authored Books" },
  ];

  const passions = [
    { icon: Brain, label: isRTL ? "الذكاء الاصطناعي" : "Artificial Intelligence", col: "text-purple-400" },
    { icon: Globe, label: isRTL ? "رقمنة اليمن" : "Digitizing Yemen", col: "text-blue-400" },
    { icon: BookOpen, label: isRTL ? "التأليف والكتابة" : "Writing & Authoring", col: "text-amber-400" },
    { icon: Target, label: isRTL ? "ريادة الأعمال" : "Entrepreneurship", col: "text-emerald-400" },
    { icon: Heart, label: isRTL ? "خدمة المجتمع اليمني" : "Serving Yemeni Community", col: "text-rose-400" },
    { icon: Star, label: isRTL ? "المقدسات الإسلامية" : "Islamic Values", col: "text-yellow-400" },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#07070f] text-foreground"
      style={{ background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(124,58,237,0.25) 0%, transparent 60%), #07070f" }}>
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">

        {/* Back */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-2">
            <ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />{isRTL ? "الرئيسية" : "Home"}
          </Button>
        </Link>

        {/* PROFILE CARD */}
        <div className="relative rounded-3xl border border-primary/30 overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(234,179,8,0.08))" }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle at 30% 50%, rgba(124,58,237,1), transparent 70%)" }} />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 p-8 md:p-12 items-center md:items-start">
            {/* Photo */}
            <div className="shrink-0">
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-primary/20 blur-lg" />
                <div className="relative w-36 h-36 rounded-full border-4 border-primary/50 overflow-hidden bg-primary/10 shadow-[0_0_50px_rgba(124,58,237,0.5)]">
                  <img src={`${basePath}/khalid.jpg`} alt="خالد سلمان" className="w-full h-full object-cover object-top"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div className="absolute inset-0 flex items-center justify-center font-black text-5xl text-primary">KS</div>
                </div>
              </div>
            </div>
            {/* Info */}
            <div className="text-center md:text-start space-y-3">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold"
                  style={{ background: "linear-gradient(90deg, #fff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {isRTL ? "خالد سلمان" : "Khaled Salman"}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">{isRTL ? "خالد أحمد مسعد مصلح سلمان" : "Khaled Ahmed Mas'ad Musleh Salman"}</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {[
                  { label: isRTL ? "مبدع يمني" : "Yemeni Creative", col: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
                  { label: isRTL ? "متخصص ذكاء اصطناعي" : "AI Specialist", col: "bg-primary/20 text-primary border-primary/30" },
                  { label: isRTL ? "مؤلف • مبرمج" : "Author • Developer", col: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
                ].map((b, i) => (
                  <span key={i} className={cn("text-xs px-3 py-1 rounded-full border font-medium", b.col)}>{b.label}</span>
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                {isRTL
                  ? "شاب يمني طموح من محافظة الضالع، طالب في تخصص الذكاء الاصطناعي بجامعة إب، مؤلف خمسة كتب، ولديه شغف عميق في شتى المجالات. يسعى بكل قوة لخدمة بلاده اليمن وأمته الإسلامية وتحقيق حلمه في بناء مستقبل رقمي متكامل."
                  : "An ambitious young Yemeni from Dhale' Governorate, AI student at Ibb University, author of 5 books, with deep passion in various fields. Striving with all his strength to serve Yemen and the Islamic world, working toward a comprehensive digital future."}
              </p>
            </div>
          </div>
        </div>

        {/* FACTS GRID */}
        <div>
          <h2 className="text-xl font-bold mb-4">{isRTL ? "المعلومات الشخصية" : "Personal Information"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {facts.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{f.label}</p>
                  <p className="font-semibold text-sm">{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PASSIONS */}
        <div>
          <h2 className="text-xl font-bold mb-4">{isRTL ? "المجالات والشغف" : "Fields & Passions"}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {passions.map((p, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card/50">
                <p.icon className={cn("w-4 h-4 shrink-0", p.col)} />
                <span className="text-sm">{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT */}
        <div>
          <h2 className="text-xl font-bold mb-4">{isRTL ? "وسائل التواصل" : "Contact"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: "https://wa.me/967783701365", icon: Phone, label: "+967 783 701 365", sub: "WhatsApp", col: "border-emerald-500/30 hover:bg-emerald-500/5" },
              { href: "https://wa.me/967779435445", icon: Phone, label: "+967 779 435 445", sub: "WhatsApp", col: "border-emerald-500/30 hover:bg-emerald-500/5" },
              { href: "https://t.me/kshskshg", icon: Send, label: "@kshskshg", sub: "Telegram", col: "border-blue-500/30 hover:bg-blue-500/5" },
              { href: "mailto:khalidsalman7140@gmail.com", icon: Mail, label: "khalidsalman7140@gmail.com", sub: "Email", col: "border-red-500/30 hover:bg-red-500/5" },
            ].map((c, i) => (
              <a key={i} href={c.href} target="_blank" rel="noopener noreferrer"
                className={cn("flex items-center gap-3 p-4 rounded-xl border bg-card/50 transition-all", c.col)}>
                <c.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Vision link */}
        <div className="text-center">
          <Link href="/vision">
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/30">
              <Sparkles className="w-5 h-5" />
              {isRTL ? "استكشف رؤية خالد — 73 محوراً" : "Explore Khaled's Vision — 73 Axes"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
