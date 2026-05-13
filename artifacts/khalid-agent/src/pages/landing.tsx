import { Link } from "wouter";
import {
  ArrowLeft, Palette, Video, GraduationCap, Code2, MessageCircle,
  Mail, Sparkles, Star, Zap, Crown, Globe, Brain, CheckCircle2,
  MessageSquare, Rocket, Building2, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Landing() {
  const { t, lang, isRTL } = useI18n();

  const services = [
    {
      icon: Palette,
      title: isRTL ? "التصميم والإبداع" : "Design & Creativity",
      desc: isRTL ? "هوية بصرية، صور بالذكاء الاصطناعي، ديكور، مطبوعات" : "Visual identity, AI images, decor, prints",
      color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20",
    },
    {
      icon: Video,
      title: isRTL ? "المحتوى الرقمي" : "Digital Content",
      desc: isRTL ? "فيديوهات، كتب إلكترونية، عروض تقديمية" : "Videos, eBooks, presentations",
      color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20",
    },
    {
      icon: GraduationCap,
      title: isRTL ? "الخدمات الأكاديمية" : "Academic Services",
      desc: isRTL ? "مشاريع تخرج، عروض جامعية، تحليل بيانات" : "Graduation projects, university presentations",
      color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20",
    },
    {
      icon: Code2,
      title: isRTL ? "البرمجة والبيانات" : "Programming & Data",
      desc: isRTL ? "مواقع، تطبيقات، أنظمة، تحليل بيانات" : "Websites, apps, systems, data analysis",
      color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20",
    },
  ];

  const features = [
    {
      icon: MessageSquare,
      title: isRTL ? t("freeChat") : t("freeChat"),
      desc: isRTL ? t("freeChatDesc") : t("freeChatDesc"),
      badge: isRTL ? "مجاني دائماً" : "Always Free",
      badgeColor: "bg-emerald-500/20 text-emerald-400",
    },
    {
      icon: Brain,
      title: isRTL ? t("careerMap") : t("careerMap"),
      desc: isRTL ? t("careerMapDesc") : t("careerMapDesc"),
      badge: isRTL ? "مجاني" : "Free",
      badgeColor: "bg-primary/20 text-primary",
      link: "/career-map",
    },
    {
      icon: Rocket,
      title: isRTL ? t("premiumServices") : t("premiumServices"),
      desc: isRTL ? t("premiumServicesDesc") : t("premiumServicesDesc"),
      badge: isRTL ? "مدفوع" : "Paid",
      badgeColor: "bg-yellow-500/20 text-yellow-400",
    },
    {
      icon: Building2,
      title: isRTL ? t("realityCheck") : t("realityCheck"),
      desc: isRTL ? t("realityCheckDesc") : t("realityCheckDesc"),
      badge: isRTL ? "مجاني" : "Free",
      badgeColor: "bg-blue-500/20 text-blue-400",
    },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.20) 0%, transparent 55%)" }}
      />

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="relative z-10 flex flex-col items-center space-y-8 max-w-4xl mx-auto">
          <div className="w-28 h-28 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shadow-[0_0_60px_rgba(124,58,237,0.4)] animate-pulse-slow overflow-hidden">
            <img src={`${basePath}/khalid.jpg`} alt="خالد سلمان" className="w-full h-full object-cover object-top"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <img src={`${basePath}/logo.svg`} alt="KS" className="w-20 h-20 absolute" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              {isRTL ? "مدعوم بـ Gemini 2.5 Flash" : "Powered by Gemini 2.5 Flash"}
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-glow leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-primary">
              {t("heroSubtitle")}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {t("heroDesc")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
            <Link href="/sign-up" className="flex-1">
              <Button size="lg" className="w-full gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all text-base">
                <Sparkles className="w-5 h-5" />
                {t("startFree")}
              </Button>
            </Link>
            <Link href="/sign-in" className="flex-1">
              <Button size="lg" variant="outline" className="w-full gap-2 border-primary/30 hover:border-primary/60 text-base">
                {t("signIn")}
                <ArrowLeft className={cn("w-5 h-5", !isRTL && "rotate-180")} />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {[
              { icon: Globe, label: isRTL ? "5 لغات + لهجات عربية" : "5 Languages + Arabic dialects" },
              { icon: Zap, label: isRTL ? "دردشة مجانية غير محدودة" : "Unlimited free chat" },
              { icon: Shield, label: isRTL ? "الخصوصية محمية" : "Privacy protected" },
            ].map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground bg-card/60 border border-border rounded-xl px-4 py-2 backdrop-blur-sm">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span>{h.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-8 animate-bounce opacity-50">
          <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
          </div>
        </div>
      </section>

      {/* FREE VS PAID */}
      <section className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">{isRTL ? "ماذا يقدم الوكيل؟" : "What does the Agent offer?"}</h2>
            <p className="text-muted-foreground">{isRTL ? "دردشة واستشارة مجانية — المهام الكبيرة بخطة مدفوعة" : "Free chat & consulting — big tasks on paid plan"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="group flex items-start gap-4 p-5 rounded-2xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm">{f.title}</h3>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", f.badgeColor)}>{f.badge}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                    {f.link && (
                      <Link href={f.link}>
                        <span className="text-xs text-primary hover:underline cursor-pointer mt-1 block">
                          {isRTL ? "ابدأ الآن ←" : "Start Now →"}
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">{t("featuresTitle")}</h2>
            <p className="text-muted-foreground">
              {isRTL ? "خبرة احترافية في أربعة مجالات متكاملة" : "Professional expertise across four integrated domains"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <div key={i} className={cn(
                  "group flex items-start gap-4 p-6 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card transition-all hover:shadow-lg hover:shadow-primary/5",
                  svc.border,
                )}>
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-border", svc.bg)}>
                    <Icon className={cn("w-6 h-6", svc.color)} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground mb-1">{svc.title}</h3>
                    <p className="text-muted-foreground text-sm">{svc.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CAREER MAP CTA */}
      <section className="relative py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-purple-500/5 p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">{t("careerMap")}</h2>
            <p className="text-muted-foreground">{t("careerMapDesc")}</p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              {[
                isRTL ? "ما هو شغفك؟" : "What's your passion?",
                isRTL ? "كم ساعة لديك؟" : "How many hours?",
                isRTL ? "ما جهازك؟" : "What device?",
                isRTL ? "ما هدفك؟" : "What's your goal?",
              ].map((q, i) => (
                <span key={i} className="bg-card border border-border rounded-full px-3 py-1 text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> {q}
                </span>
              ))}
            </div>
            <Link href="/career-map">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/30">
                <Brain className="w-5 h-5" />
                {isRTL ? "ابدأ اختبار المسار المهني" : "Start Career Assessment"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 70%)" }} />
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold">{t("pricingTitle")}</h2>
          <p className="text-muted-foreground text-lg">{t("pricingSubtitle")}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            {[
              { icon: Star, name: t("freePlan"), price: t("free"), note: isRTL ? "دردشة غير محدودة" : "Unlimited chat" },
              { icon: Zap, name: t("weeklyPlan"), price: "$2.99", note: isRTL ? "خدمات ثقيلة" : "Heavy services" },
              { icon: Sparkles, name: t("monthlyPlan"), price: "$9.99", popular: true, note: isRTL ? "الأكثر شعبية" : "Most popular" },
              { icon: Crown, name: t("annualPlan"), price: "$79.99", note: isRTL ? "وفّر 33%" : "Save 33%" },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className={cn(
                  "flex-1 min-w-[130px] p-4 rounded-xl border bg-card/60 text-center",
                  (p as { popular?: boolean }).popular ? "border-primary/50 ring-1 ring-primary/30" : "border-border",
                )}>
                  {(p as { popular?: boolean }).popular && (
                    <div className="text-xs text-primary font-bold mb-1">{t("popular")}</div>
                  )}
                  <Icon className={cn("w-5 h-5 mx-auto mb-2", (p as { popular?: boolean }).popular ? "text-primary" : "text-muted-foreground")} />
                  <div className="font-bold text-lg">{p.price}</div>
                  <div className="text-xs text-muted-foreground">{p.name}</div>
                  <div className="text-[10px] text-primary/70 mt-1">{p.note}</div>
                </div>
              );
            })}
          </div>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="gap-2 border-primary/30 hover:border-primary/60">
              {isRTL ? "عرض كل الخطط" : "View All Plans"}
              <ArrowLeft className={cn("w-5 h-5", !isRTL && "rotate-180")} />
            </Button>
          </Link>
        </div>
      </section>

      {/* SERVICES MARKETPLACE */}
      <section className="relative py-16 px-4 border-t border-border/50">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold">{isRTL ? "سوق الخدمات البشرية" : "Human Services Marketplace"}</h2>
          <p className="text-muted-foreground">
            {isRTL
              ? "الذكاء الاصطناعي رائع — لكن أحياناً تحتاج لمس الإنسان. خالد سلمان يتدخل شخصياً."
              : "AI is great — but sometimes you need the human touch. Khaled Salman steps in personally."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="https://wa.me/967783701365?text=أريد طلب تعديل بشري على تصميمي" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10">
                <MessageCircle className="w-4 h-4" />
                {isRTL ? "طلب تعديل بشري من خالد" : "Request Human Edit from Khaled"}
              </Button>
            </a>
            <Link href="/career-map">
              <Button variant="outline" className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
                <Brain className="w-4 h-4" />
                {isRTL ? "استشارة مهنية مجانية" : "Free Career Consultation"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT & FOOTER */}
      <footer className="relative py-16 px-4 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-2xl font-bold">{isRTL ? "تواصل مع خالد سلمان" : "Contact Khaled Salman"}</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://wa.me/967783701365" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium">
              <MessageCircle className="w-4 h-4" /><span dir="ltr">+967 783 701 365</span>
            </a>
            <a href="https://wa.me/967779435445" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium">
              <MessageCircle className="w-4 h-4" /><span dir="ltr">+967 779 435 445</span>
            </a>
            <a href="https://t.me/kshskshg" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors text-sm font-medium">
              <Globe className="w-4 h-4" />@kshskshg
            </a>
            <a href="mailto:khalidsalman7140@gmail.com"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors text-sm font-medium">
              <Mail className="w-4 h-4" />khalidsalman7140@gmail.com
            </a>
          </div>
          <p className="text-sm text-primary font-medium">{isRTL ? "الوكيل الذكي: نبني مهاراتك.. لنبني اليمن" : "AI Agent: We build your skills.. to build Yemen"}</p>
          <p className="text-xs text-muted-foreground">{t("copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
