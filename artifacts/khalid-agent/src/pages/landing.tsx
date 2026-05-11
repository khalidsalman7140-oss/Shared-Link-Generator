import { Link } from "wouter";
import {
  ArrowLeft,
  Palette,
  Video,
  GraduationCap,
  Code2,
  MessageCircle,
  Mail,
  Sparkles,
  Star,
  Zap,
  Crown,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Landing() {
  const { t, isRTL } = useI18n();

  const services = [
    {
      icon: Palette,
      title: isRTL ? "التصميم والإبداع" : "Design & Creativity",
      desc: isRTL
        ? "هوية بصرية، صور بالذكاء الاصطناعي، ديكور"
        : "Visual identity, AI images, decor",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      icon: Video,
      title: isRTL ? "المحتوى الرقمي" : "Digital Content",
      desc: isRTL
        ? "فيديوهات، كتب إلكترونية، عروض تقديمية"
        : "Videos, eBooks, presentations",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: GraduationCap,
      title: isRTL ? "الخدمات الأكاديمية" : "Academic Services",
      desc: isRTL ? "مشاريع تخرج، عروض جامعية" : "Graduation projects, academic presentations",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Code2,
      title: isRTL ? "البرمجة والبيانات" : "Programming & Data",
      desc: isRTL ? "تطبيقات وأنظمة، تحليل بيانات" : "Apps & systems, data analysis",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
  ];

  const highlights = [
    {
      icon: Globe,
      label: isRTL ? "متعدد اللغات" : "Multilingual",
      sub: isRTL ? "عربي، إنجليزي، وأكثر" : "Arabic, English & more",
    },
    {
      icon: Zap,
      label: isRTL ? "ردود فورية" : "Instant Responses",
      sub: isRTL ? "بث مباشر بالذكاء الاصطناعي" : "Streaming AI responses",
    },
    {
      icon: Sparkles,
      label: isRTL ? "تحليل الصور" : "Image Analysis",
      sub: isRTL ? "أرسل صورة واحصل على اقتراحات" : "Send images for suggestions",
    },
  ];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-background text-foreground overflow-x-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.20) 0%, transparent 55%)",
        }}
      />

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Background photo placeholder — will be replaced with actual photo */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.4) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center space-y-8 max-w-4xl mx-auto">
          <div className="w-28 h-28 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shadow-[0_0_60px_rgba(124,58,237,0.4)] animate-pulse-slow">
            <img
              src={`${basePath}/logo.svg`}
              alt="KS"
              className="w-20 h-20"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-glow leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed">
              {t("heroSubtitle")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
            <Link href="/sign-up" className="flex-1">
              <Button
                size="lg"
                className="w-full gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all text-base"
              >
                <Sparkles className="w-5 h-5" />
                {t("startFree")}
              </Button>
            </Link>
            <Link href="/sign-in" className="flex-1">
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2 border-primary/30 hover:border-primary/60 text-base"
              >
                {t("signIn")}
                <ArrowLeft className={cn("w-5 h-5", !isRTL && "rotate-180")} />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-4">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-muted-foreground bg-card/60 border border-border rounded-xl px-4 py-2 backdrop-blur-sm"
                >
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium text-foreground">{h.label}</span>
                  <span>·</span>
                  <span>{h.sub}</span>
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

      {/* SERVICES */}
      <section className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">{t("featuresTitle")}</h2>
            <p className="text-muted-foreground">
              {isRTL
                ? "خبرة احترافية في أربعة مجالات متكاملة"
                : "Professional expertise across four integrated domains"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <div
                  key={i}
                  className="group flex items-start gap-4 p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5"
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-border",
                      svc.bg,
                    )}
                  >
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

      {/* PRICING TEASER */}
      <section className="relative py-20 px-4">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold">{t("pricingTitle")}</h2>
          <p className="text-muted-foreground text-lg">{t("pricingSubtitle")}</p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            {[
              { icon: Star, name: t("freePlan"), price: t("free") },
              { icon: Zap, name: t("weeklyPlan"), price: "$2.99" },
              { icon: Sparkles, name: t("monthlyPlan"), price: "$9.99", popular: true },
              { icon: Crown, name: t("annualPlan"), price: "$79.99" },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex-1 min-w-[120px] p-4 rounded-xl border bg-card/60 text-center",
                    (p as any).popular
                      ? "border-primary/50 ring-1 ring-primary/30"
                      : "border-border",
                  )}
                >
                  {(p as any).popular && (
                    <div className="text-xs text-primary font-bold mb-1">{t("popular")}</div>
                  )}
                  <Icon
                    className={cn(
                      "w-5 h-5 mx-auto mb-2",
                      (p as any).popular ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <div className="font-bold text-lg">{p.price}</div>
                  <div className="text-xs text-muted-foreground">{p.name}</div>
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

      {/* CONTACT & FOOTER */}
      <footer className="relative py-16 px-4 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-2xl font-bold">
            {isRTL ? "تواصل مع خالد سلمان" : "Contact Khaled Salman"}
          </h3>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/967783701365"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              <span dir="ltr">+967 783 701 365</span>
            </a>
            <a
              href="https://wa.me/967779435445"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              <span dir="ltr">+967 779 435 445</span>
            </a>
            <a
              href="https://t.me/kshskshg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              @kshskshg
            </a>
            <a
              href="mailto:khalidsalman7140@gmail.com"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
            >
              <Mail className="w-4 h-4" />
              khalidsalman7140@gmail.com
            </a>
          </div>

          <p className="text-xs text-muted-foreground">{t("copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
