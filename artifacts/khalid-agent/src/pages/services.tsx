import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import {
  Palette, MonitorPlay, GraduationCap, Code2, MessageSquare,
  Sparkles, ArrowRight, CheckCircle2, Phone, Zap, Crown, Star,
  Clock, Users, Shield, Building2,
} from "lucide-react";

const WA = "967783701365";

export default function Services() {
  const { isRTL, lang } = useI18n();

  const services = [
    {
      id: "design",
      icon: Palette,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30 hover:border-purple-500/60",
      glow: "from-purple-500/10 to-transparent",
      title: isRTL ? "التصميم والإبداع" : "Design & Creativity",
      desc: isRTL
        ? "هوية بصرية احترافية، صور بالذكاء الاصطناعي، ديكور داخلي، مطبوعات"
        : "Professional visual identity, AI images, interior decor, print materials",
      features: isRTL
        ? ["هوية بصرية كاملة (شعار + ألوان + خطوط)", "صور AI لكل الأغراض", "ديكور داخلي وخارجي", "شهادات تقدير ومطبوعات", "تصاميم سوشيال ميديا"]
        : ["Full visual identity (logo + colors + fonts)", "AI images for all purposes", "Interior & exterior decor", "Certificates & print materials", "Social media designs"],
      price: isRTL ? "يبدأ من $5" : "Starting at $5",
      deliveryTime: isRTL ? "خلال 24 ساعة" : "Within 24 hours",
      waMsg: isRTL ? "أريد خدمة تصميم وإبداع" : "I want design & creativity service",
    },
    {
      id: "digital",
      icon: MonitorPlay,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30 hover:border-blue-500/60",
      glow: "from-blue-500/10 to-transparent",
      title: isRTL ? "المحتوى الرقمي" : "Digital Content",
      desc: isRTL
        ? "فيديوهات احترافية، كتب إلكترونية، عروض تقديمية مبهرة، موشن جرافيك"
        : "Professional videos, eBooks, stunning presentations, motion graphics",
      features: isRTL
        ? ["فيديوهات بالذكاء الاصطناعي", "كتب إلكترونية وتنسيقها", "عروض PowerPoint احترافية", "موشن جرافيك وانيمشن", "محتوى مكتوب ومدقق"]
        : ["AI-generated videos", "eBooks & formatting", "Professional PowerPoint", "Motion graphics & animation", "Written & proofread content"],
      price: isRTL ? "يبدأ من $8" : "Starting at $8",
      deliveryTime: isRTL ? "خلال 48 ساعة" : "Within 48 hours",
      waMsg: isRTL ? "أريد خدمة محتوى رقمي" : "I want digital content service",
    },
    {
      id: "academic",
      icon: GraduationCap,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30 hover:border-emerald-500/60",
      glow: "from-emerald-500/10 to-transparent",
      title: isRTL ? "الخدمات الأكاديمية" : "Academic Services",
      desc: isRTL
        ? "مشاريع تخرج متكاملة، أبحاث علمية، عروض جامعية، ترجمة ودعم أكاديمي"
        : "Complete graduation projects, scientific research, university presentations, translation",
      features: isRTL
        ? ["مشاريع تخرج كاملة بالتوثيق", "أبحاث علمية ودراسات", "عروض جامعية وتقديمات", "ترجمة وتدقيق لغوي", "تحليل بيانات SPSS/Python"]
        : ["Complete graduation projects", "Scientific research & studies", "University presentations", "Translation & proofreading", "Data analysis SPSS/Python"],
      price: isRTL ? "يبدأ من $15" : "Starting at $15",
      deliveryTime: isRTL ? "حسب المشروع" : "Based on project",
      waMsg: isRTL ? "أريد خدمة أكاديمية" : "I want academic service",
    },
    {
      id: "programming",
      icon: Code2,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30 hover:border-amber-500/60",
      glow: "from-amber-500/10 to-transparent",
      title: isRTL ? "البرمجة والبيانات" : "Programming & Data",
      desc: isRTL
        ? "تطبيقات وأنظمة مخصصة، مواقع احترافية، وكلاء ذكاء اصطناعي، تحليل بيانات"
        : "Custom apps & systems, professional websites, AI agents, data analysis",
      features: isRTL
        ? ["مواقع ويب كاملة (Frontend + Backend)", "تطبيقات جوال iOS وAndroid", "وكلاء ذكاء اصطناعي مخصصة", "تحليل بيانات ولوحات تحكم", "ربط APIs وأنظمة دفع"]
        : ["Full websites (Frontend + Backend)", "Mobile apps iOS & Android", "Custom AI agents", "Data analysis & dashboards", "API & payment integration"],
      price: isRTL ? "يبدأ من $30" : "Starting at $30",
      deliveryTime: isRTL ? "حسب المشروع" : "Based on project",
      waMsg: isRTL ? "أريد خدمة برمجة وتطوير" : "I want programming & development service",
    },
  ];

  const trust = [
    { icon: Shield, label: isRTL ? "ضمان الجودة" : "Quality Guarantee" },
    { icon: Clock, label: isRTL ? "التسليم في الوقت" : "On-time Delivery" },
    { icon: Users, label: isRTL ? "دعم مستمر" : "Ongoing Support" },
    { icon: Star, label: isRTL ? "تقييم 5 نجوم" : "5-star Rating" },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-full overflow-y-auto bg-background text-foreground"
      style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 60%), hsl(240 10% 4%)" }}>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            {isRTL ? "خدمات يمن شات" : "Yemen Chat Services"}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold"
            style={{ background: "linear-gradient(135deg, #fff 30%, #a78bfa 70%, #f59e0b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {isRTL ? "خدماتنا الاحترافية" : "Our Professional Services"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isRTL
              ? "جميع الخدمات تُنجَز بأيدي خالد سلمان شخصياً — جودة مضمونة، تسليم سريع، دعم مستمر"
              : "All services delivered by Khaled Salman personally — quality guaranteed, fast delivery, ongoing support"}
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-3">
          {trust.map((t, i) => (
            <div key={i} className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-sm">
              <t.icon className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{t.label}</span>
            </div>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.id}
                className={cn("rounded-2xl border bg-card relative overflow-hidden transition-all duration-300", service.border)}>
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none", service.glow)} />
                <div className="relative z-10 p-6 space-y-5">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", service.bg)}>
                        <Icon className={cn("w-6 h-6", service.color)} />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg">{service.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn("text-xs font-bold", service.color)}>{service.price}</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{service.deliveryTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{service.desc}</p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {service.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0", service.color)} />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <a href={`https://wa.me/${WA}?text=${encodeURIComponent(service.waMsg)}`}
                      target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button className="w-full gap-2 text-sm" size="sm">
                        <Phone className="w-3.5 h-3.5" />
                        {isRTL ? "اطلب الآن — واتساب" : "Order Now — WhatsApp"}
                      </Button>
                    </a>
                    <Link href="/chat">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {isRTL ? "استفسر" : "Inquire"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Subscription box */}
        <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6 md:p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Crown className="w-7 h-7 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">
            {isRTL ? "اشترك للحصول على خدمات غير محدودة" : "Subscribe for Unlimited Services"}
          </h3>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            {isRTL
              ? "بخطة مدفوعة تحصل على خدمات ثقيلة غير محدودة، أولوية في الرد، ودعم مباشر من خالد"
              : "With a paid plan you get unlimited heavy services, priority response, and direct support from Khaled"}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/pricing">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/30">
                <Zap className="w-5 h-5" />
                {isRTL ? "عرض خطط الاشتراك" : "View Subscription Plans"}
              </Button>
            </Link>
            <a href={`https://wa.me/${WA}?text=${encodeURIComponent(isRTL ? "أريد الاستفسار عن خدمة مخصصة" : "I want to inquire about a custom service")}`}
              target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 border-primary/30">
                <Building2 className="w-5 h-5" />
                {isRTL ? "خدمة مخصصة — واتساب" : "Custom Service — WhatsApp"}
              </Button>
            </a>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center">
          <Link href="/chat">
            <Button variant="link" className="text-primary text-base gap-2">
              <MessageSquare className="w-4 h-4" />
              {isRTL ? "تحدث مع الوكيل مباشرة واطلب خدمتك" : "Talk to the agent directly and request your service"}
              <ArrowRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
