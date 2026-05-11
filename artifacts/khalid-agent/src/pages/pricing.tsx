import { Link } from "wouter";
import { Check, ArrowRight, Sparkles, Zap, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const WA_NUMBER = "967783701365";

function waLink(plan: string, lang: string) {
  const msgs: Record<string, string> = {
    ar: `أريد الاشتراك في ${plan}`,
    en: `I want to subscribe to ${plan}`,
    fr: `Je veux m'abonner au ${plan}`,
    tr: `${plan} planına abone olmak istiyorum`,
    es: `Quiero suscribirme al ${plan}`,
  };
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msgs[lang] ?? msgs.ar)}`;
}

export default function Pricing() {
  const { t, lang, isRTL } = useI18n();

  const plans = [
    {
      key: "free",
      icon: Star,
      name: t("freePlan"),
      price: t("free"),
      priceNote: "",
      desc: t("planFreeDesc"),
      features: [
        lang === "ar" ? "5 رسائل يومياً" : "5 messages per day",
        lang === "ar" ? "الوصول للخدمات" : "Access to services",
        lang === "ar" ? "تحليل الصور الأساسي" : "Basic image analysis",
        lang === "ar" ? "دعم اللغات المتعددة" : "Multilingual support",
      ],
      cta: t("startFree"),
      href: `${basePath}/sign-up`,
      isLink: true,
      color: "border-border",
      iconColor: "text-muted-foreground",
      popular: false,
    },
    {
      key: "weekly",
      icon: Zap,
      name: t("weeklyPlan"),
      price: "$2.99",
      priceNote: t("perWeek"),
      desc: t("planWeeklyDesc"),
      features: [
        lang === "ar" ? "رسائل غير محدودة" : "Unlimited messages",
        lang === "ar" ? "تحليل الصور والفيديوهات" : "Image & video analysis",
        lang === "ar" ? "ردود ذات أولوية" : "Priority responses",
        lang === "ar" ? "حفظ جميع المحادثات" : "Full conversation history",
        lang === "ar" ? "دعم اللغات المتعددة" : "Multilingual support",
      ],
      cta: t("contactToSubscribe"),
      href: waLink(t("weeklyPlan"), lang),
      isLink: false,
      color: "border-border",
      iconColor: "text-blue-400",
      popular: false,
    },
    {
      key: "monthly",
      icon: Sparkles,
      name: t("monthlyPlan"),
      price: "$9.99",
      priceNote: t("perMonth"),
      desc: t("planMonthlyDesc"),
      features: [
        lang === "ar" ? "كل مميزات الأسبوعي" : "All weekly features",
        lang === "ar" ? "توليد الصور بالذكاء الاصطناعي" : "AI image generation",
        lang === "ar" ? "تصميم المحتوى الرقمي" : "Digital content design",
        lang === "ar" ? "أولوية الاستجابة" : "Priority response",
        lang === "ar" ? "استشارات مجانية" : "Free consultations",
      ],
      cta: t("contactToSubscribe"),
      href: waLink(t("monthlyPlan"), lang),
      isLink: false,
      color: "border-primary/60",
      iconColor: "text-primary",
      popular: true,
    },
    {
      key: "annual",
      icon: Crown,
      name: t("annualPlan"),
      price: "$79.99",
      priceNote: t("perYear"),
      desc: t("planAnnualDesc"),
      features: [
        lang === "ar" ? "كل المميزات السابقة" : "All previous features",
        lang === "ar" ? "دعم مباشر من خالد" : "Direct support from Khaled",
        lang === "ar" ? "استشارات مخصصة" : "Custom consultations",
        lang === "ar" ? "مشاريع تخرج وأكاديمية" : "Academic projects",
        lang === "ar" ? "أولوية قصوى" : "Maximum priority",
        lang === "ar" ? t("save") : t("save"),
      ],
      cta: t("contactToSubscribe"),
      href: waLink(t("annualPlan"), lang),
      isLink: false,
      color: "border-yellow-500/40",
      iconColor: "text-yellow-400",
      popular: false,
    },
  ];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-background text-foreground"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 60%), hsl(240 10% 4%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16 space-y-4">
          <Link href="/">
            <img
              src={`${basePath}/logo.svg`}
              alt="KS"
              className="w-16 h-16 mx-auto mb-6 cursor-pointer"
            />
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-glow">
            {t("pricingTitle")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("pricingSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.key}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/10",
                  plan.color,
                  plan.popular && "ring-1 ring-primary/40 shadow-lg shadow-primary/15",
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      {t("popular")}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center bg-card border border-border",
                      plan.popular && "bg-primary/10 border-primary/30",
                    )}
                  >
                    <Icon className={cn("w-5 h-5", plan.iconColor)} />
                  </div>
                  <h3 className="font-bold text-foreground">{plan.name}</h3>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-foreground">
                      {plan.price}
                    </span>
                    {plan.priceNote && (
                      <span className="text-sm text-muted-foreground">
                        {plan.priceNote}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.isLink ? (
                  <Link href={plan.href}>
                    <Button
                      className={cn(
                        "w-full gap-2",
                        plan.popular && "shadow-lg shadow-primary/30",
                      )}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                    </Button>
                  </Link>
                ) : (
                  <a href={plan.href} target="_blank" rel="noopener noreferrer">
                    <Button
                      className={cn(
                        "w-full gap-2",
                        plan.popular && "shadow-lg shadow-primary/30",
                      )}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                    </Button>
                  </a>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            {lang === "ar"
              ? "للاستفسار عن الاشتراكات تواصل عبر واتساب أو تيليغرام"
              : "For subscription inquiries, contact via WhatsApp or Telegram"}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors text-sm font-medium"
            >
              WhatsApp: +967 783 701 365
            </a>
            <a
              href="https://t.me/kshskshg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors text-sm font-medium"
            >
              Telegram: @kshskshg
            </a>
          </div>
          <p className="text-xs text-muted-foreground">{t("copyright")}</p>
        </div>
      </div>
    </div>
  );
}
