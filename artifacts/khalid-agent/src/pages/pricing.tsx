import { Link } from "wouter";
import { Check, ArrowRight, Sparkles, Zap, Crown, Star, Building2, Banknote, Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useState } from "react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const WA_NUMBER = "967783701365";

const KRIMIA_ACCOUNTS = [
  { id: "1399395113", currency: "SAR", flag: "🇸🇦", label: "ريال سعودي" },
  { id: "3199288608", currency: "USD", flag: "🇺🇸", label: "دولار أمريكي" },
  { id: "3091144017", currency: "SAR", flag: "🇸🇦", label: "ريال سعودي (2)" },
];

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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const plans = [
    {
      key: "free",
      icon: Star,
      name: t("freePlan"),
      price: t("free"),
      priceNote: "",
      desc: t("planFreeDesc"),
      features: [
        lang === "ar" ? "5 رسائل يومياً فقط" : "5 messages per day",
        lang === "ar" ? "الوصول للخدمات" : "Access to services",
        lang === "ar" ? "تحليل الصور الأساسي" : "Basic image analysis",
        lang === "ar" ? "دعم اللغات المتعددة" : "Multilingual support",
      ],
      cta: t("startFree"),
      href: `${basePath}/sign-up`,
      isInternal: true,
      isWA: false,
      color: "border-border",
      iconColor: "text-muted-foreground",
      btnVariant: "outline" as const,
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
      cta: lang === "ar" ? "اشترك الآن" : "Subscribe Now",
      href: `${basePath}/subscribe?plan=weekly`,
      waHref: waLink(lang === "ar" ? "الأسبوعي" : "Weekly", lang),
      isInternal: true,
      isWA: false,
      color: "border-blue-500/30",
      iconColor: "text-blue-400",
      btnVariant: "outline" as const,
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
      cta: lang === "ar" ? "اشترك الآن" : "Subscribe Now",
      href: `${basePath}/subscribe?plan=monthly`,
      waHref: waLink(lang === "ar" ? "الشهري" : "Monthly", lang),
      isInternal: true,
      isWA: false,
      color: "border-primary/60",
      iconColor: "text-primary",
      btnVariant: "default" as const,
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
        lang === "ar" ? "أولوية قصوى + توفير 33%" : "Max priority + 33% savings",
      ],
      cta: lang === "ar" ? "اشترك الآن" : "Subscribe Now",
      href: `${basePath}/subscribe?plan=annual`,
      waHref: waLink(lang === "ar" ? "السنوي" : "Annual", lang),
      isInternal: true,
      isWA: false,
      color: "border-yellow-500/40",
      iconColor: "text-yellow-400",
      btnVariant: "outline" as const,
      popular: false,
    },
    {
      key: "enterprise",
      icon: Building2,
      name: lang === "ar" ? "مؤسسي" : "Enterprise",
      price: lang === "ar" ? "حسب الطلب" : "Custom",
      priceNote: "",
      desc: lang === "ar" ? "للشركات والمؤسسات الكبيرة" : "For large businesses & institutions",
      features: [
        lang === "ar" ? "كل مميزات السنوي" : "All annual features",
        lang === "ar" ? "رسائل غير محدودة تماماً" : "Truly unlimited messages",
        lang === "ar" ? "تكامل مع أنظمة المؤسسة" : "Enterprise integration",
        lang === "ar" ? "دعم فني مخصص 24/7" : "Dedicated 24/7 support",
        lang === "ar" ? "اتفاقية مستوى خدمة (SLA)" : "Service Level Agreement",
        lang === "ar" ? "تقارير وتحليلات تفصيلية" : "Detailed analytics & reports",
      ],
      cta: lang === "ar" ? "تواصل معنا" : "Contact Us",
      href: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lang === "ar" ? "أريد الاشتراك في الخطة المؤسسية" : "I'm interested in the Enterprise plan")}`,
      isInternal: false,
      isWA: true,
      color: "border-emerald-500/40",
      iconColor: "text-emerald-400",
      btnVariant: "outline" as const,
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
      <div className="max-w-7xl mx-auto px-4 py-16">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.key}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/10",
                  plan.color,
                  plan.popular && "ring-1 ring-primary/40 shadow-lg shadow-primary/15 scale-[1.02]",
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

                {plan.isInternal ? (
                  <Link href={plan.href}>
                    <Button
                      className={cn(
                        "w-full gap-2",
                        plan.popular && "shadow-lg shadow-primary/30",
                      )}
                      variant={plan.btnVariant}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                    </Button>
                  </Link>
                ) : (
                  <a href={plan.href} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full gap-2" variant={plan.btnVariant}>
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                    </Button>
                  </a>
                )}

                {"waHref" in plan && plan.waHref && (
                  <a
                    href={plan.waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs text-muted-foreground hover:text-primary transition-colors mt-2"
                  >
                    {lang === "ar" ? "أو عبر واتساب" : "or via WhatsApp"}
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* ── KRIMIA PAYMENT SECTION ── */}
        <div className="mb-12 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
            <div className="px-6 py-5 border-b border-amber-500/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <Banknote className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-amber-400">
                  {lang === "ar" ? "الدفع عبر تحويل كريمي" : "Pay via Krimia Transfer"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lang === "ar"
                    ? "حوّل المبلغ على أحد الحسابات التالية ثم أرسل لقطة الشاشة عبر واتساب لتفعيل الاشتراك فوراً"
                    : "Transfer the amount to one of the accounts below then send a screenshot via WhatsApp to activate your subscription instantly"}
                </p>
              </div>
            </div>
            <div className="p-6 grid gap-3 sm:grid-cols-3">
              {KRIMIA_ACCOUNTS.map((acc) => (
                <div key={acc.id} className="bg-card rounded-xl border border-amber-500/20 p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{acc.flag}</span>
                    <div>
                      <div className="text-xs text-muted-foreground">{lang === "ar" ? "العملة" : "Currency"}</div>
                      <div className="font-bold text-amber-400 text-sm">{acc.currency} — {acc.label}</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-foreground text-sm tracking-widest">{acc.id}</span>
                    <button
                      onClick={() => handleCopy(acc.id)}
                      className="text-muted-foreground hover:text-amber-400 transition-colors shrink-0"
                      title={lang === "ar" ? "نسخ رقم الحساب" : "Copy account number"}
                    >
                      {copiedId === acc.id
                        ? <CheckCheck className="w-4 h-4 text-emerald-400" />
                        : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70">
                    {lang === "ar" ? "رقم حساب الكريمي" : "Krimia account number"}
                  </p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <p className="text-sm text-emerald-400 font-medium mb-2">
                  {lang === "ar" ? "⚡ بعد التحويل — كيف تفعّل اشتراكك؟" : "⚡ After transfer — how to activate?"}
                </p>
                <ol className={cn("text-xs text-muted-foreground space-y-1", isRTL ? "list-arabic" : "list-decimal list-inside")}>
                  <li className="flex gap-1.5"><span className="text-emerald-400 font-bold">١.</span>{lang === "ar" ? "صوّر وصل التحويل من تطبيق الكريمي" : "Screenshot the transfer receipt from Krimia app"}</li>
                  <li className="flex gap-1.5"><span className="text-emerald-400 font-bold">٢.</span>{lang === "ar" ? "أرسلها على واتساب مع اسم الخطة المطلوبة" : "Send it on WhatsApp with the requested plan name"}</li>
                  <li className="flex gap-1.5"><span className="text-emerald-400 font-bold">٣.</span>{lang === "ar" ? "يتم تفعيل اشتراكك فوراً خلال دقائق" : "Your subscription is activated instantly within minutes"}</li>
                </ol>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lang === "ar" ? "السلام عليكم، أريد تفعيل اشتراك — معي وصل التحويل" : "Hello, I want to activate a subscription — I have the transfer receipt")}`}
                    target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 gap-1.5">
                      <span>📱</span>
                      {lang === "ar" ? "واتساب: +967 783 701 365" : "WhatsApp: +967 783 701 365"}
                    </Button>
                  </a>
                  <a href={`https://wa.me/967779435445?text=${encodeURIComponent(lang === "ar" ? "السلام عليكم، أريد تفعيل اشتراك — معي وصل التحويل" : "Hello, I want to activate a subscription — I have the transfer receipt")}`}
                    target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="text-xs border-emerald-500/40 text-emerald-400 gap-1.5">
                      <span>📱</span>
                      {lang === "ar" ? "واتساب: +967 779 435 445" : "WhatsApp: +967 779 435 445"}
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            {lang === "ar"
              ? "للاستفسار عن الاشتراكات تواصل عبر واتساب أو تيليغرام"
              : "For subscription inquiries, contact via WhatsApp or Telegram"}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors text-sm font-medium">
              WhatsApp: +967 783 701 365
            </a>
            <a href="https://t.me/kshskshg" target="_blank" rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors text-sm font-medium">
              Telegram: @kshskshg
            </a>
          </div>
          <p className="text-xs text-muted-foreground">{t("copyright")}</p>
        </div>
      </div>
    </div>
  );
}
