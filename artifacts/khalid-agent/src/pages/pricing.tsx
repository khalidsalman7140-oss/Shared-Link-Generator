import { Link } from "wouter";
import { Check, ArrowRight, Sparkles, Zap, Crown, Star, Building2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const WA_NUMBER = "967783701365";

function waLink(plan: string, lang: string) {
  const msgs: Record<string, string> = {
    ar: `أريد الاشتراك في ${plan} — وكيل خالد سلمان الذكي`,
    en: `I want to subscribe to ${plan} — Khaled Salman AI Agent`,
  };
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msgs[lang] ?? msgs.ar)}`;
}

export default function Pricing() {
  const { t, lang, isRTL } = useI18n();

  const plans = [
    {
      key: "free",
      icon: Star,
      badge: null,
      name: lang === "ar" ? "مجاني" : "Free",
      price: lang === "ar" ? "مجاناً" : "Free",
      priceNote: "",
      desc: lang === "ar" ? "5 رسائل يومياً — ابدأ بالتجربة" : "5 messages/day — try it out",
      features: [
        lang === "ar" ? "5 رسائل يومياً مجاناً" : "5 free messages per day",
        lang === "ar" ? "تحليل الصور الأساسي" : "Basic image analysis",
        lang === "ar" ? "دعم 5 لغات" : "5 language support",
        lang === "ar" ? "الوصول لجميع الخدمات" : "Access to all services",
        lang === "ar" ? "معاينة المواقع الحية" : "Live website preview",
      ],
      cta: lang === "ar" ? "ابدأ مجاناً" : "Start Free",
      href: `${basePath}/sign-up`,
      isLink: true,
      gradient: "from-slate-500/10 to-slate-600/5",
      border: "border-border",
      iconBg: "bg-slate-500/10",
      iconColor: "text-slate-400",
      popular: false,
    },
    {
      key: "weekly",
      icon: Zap,
      badge: null,
      name: lang === "ar" ? "أسبوعي" : "Weekly",
      price: "$2.99",
      priceNote: lang === "ar" ? "/ أسبوع" : "/ week",
      desc: lang === "ar" ? "رسائل غير محدودة + قدرات متقدمة" : "Unlimited messages + advanced features",
      features: [
        lang === "ar" ? "رسائل غير محدودة" : "Unlimited messages",
        lang === "ar" ? "توليد الصور بالذكاء الاصطناعي" : "AI image generation",
        lang === "ar" ? "بناء مواقع ويب كاملة" : "Full website builder",
        lang === "ar" ? "تحليل الصور والمستندات" : "Image & document analysis",
        lang === "ar" ? "ردود ذات أولوية" : "Priority responses",
        lang === "ar" ? "حفظ جميع المحادثات" : "Full conversation history",
      ],
      cta: lang === "ar" ? "اشترك الآن" : "Subscribe Now",
      href: waLink(lang === "ar" ? "الخطة الأسبوعية" : "Weekly Plan", lang),
      isLink: false,
      gradient: "from-blue-500/10 to-blue-600/5",
      border: "border-blue-500/30",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      popular: false,
    },
    {
      key: "monthly",
      icon: Sparkles,
      badge: lang === "ar" ? "الأكثر شعبية" : "Most Popular",
      name: lang === "ar" ? "شهري" : "Monthly",
      price: "$9.99",
      priceNote: lang === "ar" ? "/ شهر" : "/ month",
      desc: lang === "ar" ? "كل شيء غير محدود + ذكاء اصطناعي خارق" : "Everything unlimited + supercharged AI",
      features: [
        lang === "ar" ? "كل مميزات الأسبوعي" : "All weekly features",
        lang === "ar" ? "توليد صور عالي الجودة" : "High-quality image generation",
        lang === "ar" ? "بناء مواقع متقدمة" : "Advanced website building",
        lang === "ar" ? "استشارات ذكاء اصطناعي وأمن سيبراني" : "AI & cybersecurity consultations",
        lang === "ar" ? "دعم الخدمات المالية اليمنية" : "Yemeni financial services support",
        lang === "ar" ? "أولوية الاستجابة القصوى" : "Maximum response priority",
        lang === "ar" ? "استشارات مجانية شهرية" : "Monthly free consultations",
      ],
      cta: lang === "ar" ? "اشترك الآن" : "Subscribe Now",
      href: waLink(lang === "ar" ? "الخطة الشهرية" : "Monthly Plan", lang),
      isLink: false,
      gradient: "from-purple-500/10 to-purple-600/5",
      border: "border-primary/50",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      popular: true,
    },
    {
      key: "annual",
      icon: Crown,
      badge: lang === "ar" ? "وفّر 33٪" : "Save 33%",
      name: lang === "ar" ? "سنوي" : "Annual",
      price: "$79.99",
      priceNote: lang === "ar" ? "/ سنة" : "/ year",
      desc: lang === "ar" ? "أقوى خطة مع دعم شخصي مباشر" : "Most powerful with direct personal support",
      features: [
        lang === "ar" ? "كل المميزات السابقة" : "All previous features",
        lang === "ar" ? "دعم مباشر من خالد" : "Direct support from Khaled",
        lang === "ar" ? "مشاريع تخرج وأكاديمية" : "Graduation & academic projects",
        lang === "ar" ? "استشارات مخصصة غير محدودة" : "Unlimited custom consultations",
        lang === "ar" ? "تصميم هوية بصرية كاملة" : "Full visual identity design",
        lang === "ar" ? "بناء موقع ويب مخصص" : "Custom website development",
        lang === "ar" ? "أولوية قصوى دائمة" : "Always maximum priority",
      ],
      cta: lang === "ar" ? "اشترك الآن" : "Subscribe Now",
      href: waLink(lang === "ar" ? "الخطة السنوية" : "Annual Plan", lang),
      isLink: false,
      gradient: "from-yellow-500/10 to-amber-600/5",
      border: "border-yellow-500/40",
      iconBg: "bg-yellow-500/10",
      iconColor: "text-yellow-400",
      popular: false,
    },
    {
      key: "enterprise",
      icon: Building2,
      badge: lang === "ar" ? "للشركات" : "Business",
      name: lang === "ar" ? "مؤسسي" : "Enterprise",
      price: lang === "ar" ? "حسب الطلب" : "Custom",
      priceNote: "",
      desc: lang === "ar" ? "حلول متكاملة للشركات والمؤسسات" : "Complete solutions for companies & institutions",
      features: [
        lang === "ar" ? "كل المميزات بلا حدود" : "All features, no limits",
        lang === "ar" ? "تنفيذ أي مشروع تقني كامل" : "Execute any full technical project",
        lang === "ar" ? "أنظمة ERP وCRM مخصصة" : "Custom ERP & CRM systems",
        lang === "ar" ? "تكامل مع الخدمات المالية اليمنية" : "Integration with Yemeni financial services",
        lang === "ar" ? "تحليل البيانات وتقارير الأعمال" : "Data analytics & business reports",
        lang === "ar" ? "دعم تقني على مدار الساعة" : "24/7 technical support",
        lang === "ar" ? "مدير حساب مخصص" : "Dedicated account manager",
        lang === "ar" ? "SLA مضمون" : "Guaranteed SLA",
      ],
      cta: lang === "ar" ? "تواصل معنا" : "Contact Us",
      href: waLink(lang === "ar" ? "الخطة المؤسسية" : "Enterprise Plan", lang),
      isLink: false,
      gradient: "from-emerald-500/10 to-teal-600/5",
      border: "border-emerald-500/40",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      popular: false,
    },
  ];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-background text-foreground"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 60%), hsl(240 10% 4%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-14 space-y-4">
          <Link href="/">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden border-2 border-primary/40 cursor-pointer shadow-[0_0_30px_rgba(124,58,237,0.3)]">
              <img src={`${basePath}/khalid.jpg`} alt="KS" className="w-full h-full object-cover object-top" />
            </div>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-glow">{t("pricingTitle")}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("pricingSubtitle")}</p>
          <div className="flex justify-center gap-3 flex-wrap mt-4">
            {[
              { icon: Shield, text: lang === "ar" ? "آمن ومشفر" : "Secure & encrypted" },
              { icon: Zap, text: lang === "ar" ? "تفعيل فوري" : "Instant activation" },
              { icon: Star, text: lang === "ar" ? "دعم متواصل" : "Continuous support" },
            ].map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="flex items-center gap-1.5 text-sm text-muted-foreground bg-card/40 border border-border rounded-full px-4 py-1.5">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  {b.text}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.key}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-gradient-to-b p-5 transition-all hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5",
                  plan.gradient,
                  plan.border,
                  plan.popular && "ring-1 ring-primary/50 shadow-lg shadow-primary/20 scale-105",
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className={cn(
                      "text-xs font-bold px-3 py-1 rounded-full",
                      plan.popular
                        ? "bg-primary text-primary-foreground"
                        : plan.key === "enterprise"
                        ? "bg-emerald-500 text-white"
                        : "bg-yellow-500 text-black",
                    )}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2.5 mb-4 mt-1">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border border-white/10", plan.iconBg)}>
                    <Icon className={cn("w-4.5 h-4.5", plan.iconColor)} />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">{plan.name}</h3>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-foreground">{plan.price}</span>
                    {plan.priceNote && <span className="text-xs text-muted-foreground">{plan.priceNote}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
                </div>

                <ul className="space-y-1.5 mb-5 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.isLink ? (
                  <Link href={plan.href}>
                    <Button className="w-full gap-1.5 text-sm" variant="outline" size="sm">
                      {plan.cta}
                      <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100" />
                    </Button>
                  </Link>
                ) : (
                  <a href={plan.href} target="_blank" rel="noopener noreferrer">
                    <Button
                      className={cn("w-full gap-1.5 text-sm", plan.popular && "shadow-lg shadow-primary/30")}
                      variant={plan.popular ? "default" : "outline"}
                      size="sm"
                    >
                      {plan.cta}
                      <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100" />
                    </Button>
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Enterprise Features Block */}
        <div className="mb-12 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8">
          <div className="text-center mb-6 space-y-2">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">
              {lang === "ar" ? "الخطة المؤسسية — حلول متكاملة لليمن" : "Enterprise Plan — Complete Solutions for Yemen"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {lang === "ar"
                ? "مصمم خصيصاً للشركات والمؤسسات اليمنية — يتكامل مع الكريمي، الراجحي، النجم، وكل الصرافات والتجار"
                : "Designed for Yemeni companies & institutions — integrates with Kuraimi, Al-Rajhi, Al-Najm, and all exchangers"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: lang === "ar" ? "الخدمات المالية اليمنية" : "Yemeni Financial Services",
                items: lang === "ar"
                  ? ["الكريمي للصرافة والتحويل", "بنك الراجحي اليمن", "شركة النجم للصرافة", "تجار الصرافة والتجارة", "حلول Fintech مخصصة"]
                  : ["Kuraimi Exchange & Transfer", "Al-Rajhi Bank Yemen", "Al-Najm Exchange", "Money changers & traders", "Custom fintech solutions"],
              },
              {
                title: lang === "ar" ? "الذكاء الاصطناعي والأمن السيبراني" : "AI & Cybersecurity",
                items: lang === "ar"
                  ? ["دورات تدريبية مخصصة", "مشاريع تطبيقية كاملة", "CTF challenges", "تحليل الثغرات والاختراق", "تكامل مع HuggingFace وKaggle"]
                  : ["Custom training programs", "Full practical projects", "CTF challenges", "Vulnerability analysis & pentest", "HuggingFace & Kaggle integration"],
              },
              {
                title: lang === "ar" ? "أنظمة الأعمال المتكاملة" : "Integrated Business Systems",
                items: lang === "ar"
                  ? ["أنظمة ERP وCRM", "إدارة المخزون والمبيعات", "تقارير وتحليل البيانات", "API وتكامل الأنظمة", "تطوير تطبيقات خاصة"]
                  : ["ERP & CRM systems", "Inventory & sales management", "Reports & data analytics", "API & system integration", "Custom app development"],
              },
            ].map((section, i) => (
              <div key={i} className="space-y-3">
                <h3 className="font-semibold text-emerald-400">{section.title}</h3>
                <ul className="space-y-1.5">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lang === "ar" ? "أريد الاستفسار عن الخطة المؤسسية" : "Enterprise plan inquiry")}`} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30">
                <Building2 className="w-5 h-5" />
                {lang === "ar" ? "تواصل لبناء حلك المؤسسي" : "Contact for Enterprise Solution"}
              </Button>
            </a>
          </div>
        </div>

        <div className="text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            {lang === "ar" ? "جميع الاشتراكات تُفعَّل عبر واتساب أو تيليغرام — دفع آمن ومرن" : "All subscriptions activated via WhatsApp or Telegram — safe & flexible payment"}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors text-sm font-medium">
              WhatsApp: +967 783 701 365
            </a>
            <a href="https://t.me/kshskshg" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors text-sm font-medium">
              Telegram: @kshskshg
            </a>
          </div>
          <p className="text-xs text-muted-foreground">{t("copyright")}</p>
        </div>
      </div>
    </div>
  );
}
