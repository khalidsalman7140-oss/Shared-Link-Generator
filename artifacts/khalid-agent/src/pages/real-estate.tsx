import { Link } from "wouter";
import { Building2, ArrowLeft, MapPin, FileText, CreditCard, Bell, Shield, Home, Hammer, Globe, Lock, Users, Star, Camera, TrendingUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const features = [
  { icon: Globe, ar: "الربط بوزارتي الأشغال والإسكان وكل المكاتب العقارية والمطورين والمقاولين والمهندسين وشركات البناء", en: "Connected to Ministry of Works & Housing, all real estate offices, developers, contractors, engineers & construction companies" },
  { icon: FileText, ar: "إصدار تراخيص البناء والمخططات العمرانية وتقسيم الأراضي وشهادات إتمام البناء إلكترونياً", en: "Issue building permits, urban plans, land subdivision certificates, and completion certificates electronically" },
  { icon: Users, ar: "ربط البائع بالمشتري والمؤجر بالمستأجر مباشرة", en: "Connect sellers to buyers and landlords to tenants directly" },
  { icon: Camera, ar: "عرض العقارات بكل التفاصيل والصور والفيديوهات والمواقع على الخريطة", en: "Display properties with full details, photos, videos, and map locations" },
  { icon: Shield, ar: "التحقق من صحة ملكية العقارات وسلامة الوثائق", en: "Verify property ownership and document integrity" },
  { icon: TrendingUp, ar: "حساب قيمة العقارات تقديرياً بناءً على الموقع والمساحة والمواصفات وأسعار السوق", en: "Estimate property value based on location, area, specifications, and market prices" },
  { icon: FileText, ar: "إصدار عقود البيع والإيجار الإلكترونية الموثقة", en: "Issue electronically documented sale and lease contracts" },
  { icon: CreditCard, ar: "إدارة التحصيلات الإيجارية والمدفوعات تلقائياً", en: "Automatic management of rental collections and payments" },
  { icon: Bell, ar: "متابعة صيانة العقارات وإرسال تنبيهات بموعد الصيانة", en: "Track property maintenance and send maintenance schedule alerts" },
  { icon: Home, ar: "إدارة أملاك الغائبين والأوقاف والممتلكات الحكومية", en: "Manage absent owners' properties, endowments, and government properties" },
  { icon: Hammer, ar: "خدمة تصميم المخططات المعمارية عبر الذكاء الاصطناعي", en: "AI-powered architectural design service" },
  { icon: TrendingUp, ar: "حساب تكاليف البناء ومقارنة أسعار مواد البناء", en: "Calculate construction costs and compare building material prices" },
  { icon: Search, ar: "إدارة مناقصات وعطاءات المشاريع الإنشائية", en: "Manage construction project tenders and bids" },
  { icon: Bell, ar: "متابعة تنفيذ المشاريع الإنشائية وإرسال تقارير دورية", en: "Track construction project execution and send periodic reports" },
  { icon: Lock, ar: "حماية بيانات العقارات والملاك والمستأجرين بتشفير عالٍ", en: "Protect property, owner, and tenant data with advanced encryption" },
  { icon: Shield, ar: "منع التلاعب في بيانات الملكية العقارية", en: "Prevent manipulation of property ownership data" },
];

const stats = [
  { value: "+100K", label: "عقار مسجل", labelEn: "Registered Properties" },
  { value: "AI", label: "تقييم ذكي", labelEn: "AI Valuation" },
  { value: "100%", label: "عقود رقمية", labelEn: "Digital Contracts" },
  { value: "0", label: "وساطة إضافية", labelEn: "Extra Commission" },
];

export default function RealEstatePage() {
  const { isRTL } = useI18n();
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#07070f] text-foreground overflow-x-hidden"
      style={{ background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(168,85,247,0.2) 0%, transparent 60%), #07070f" }}>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />{isRTL ? "الرئيسية" : "Home"}</Button></Link>
          <Link href="/vision"><Button variant="ghost" size="sm" className="text-xs opacity-60">محور #70 من 73</Button></Link>
        </div>

        <div className="relative rounded-3xl border border-purple-500/30 overflow-hidden p-8 md:p-12 text-center"
          style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(124,58,237,0.08))" }}>
          <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 50% 0%, rgba(168,85,247,1), transparent 60%)" }} />
          <div className="relative z-10 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
              <Building2 className="w-10 h-10 text-purple-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold"
              style={{ background: "linear-gradient(90deg, #fff, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {isRTL ? "نظام العقارات والتخطيط العمراني" : "Smart Real Estate & Urban Planning"}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isRTL ? "منظومة عقارية ذكية تربط كل القطاع العقاري في اليمن من الترخيص إلى التقييم إلى إتمام الصفقات" : "Intelligent real estate ecosystem connecting Yemen's entire property sector from licensing to valuation to deal completion"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-purple-400">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{isRTL ? s.label : s.labelEn}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            {isRTL ? "خدمات المنظومة العقارية" : "Real Estate System Services"}
            <span className="text-xs text-muted-foreground font-normal">({features.length} خدمة)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/40 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-colors">
                  <f.icon className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                  {isRTL ? f.ar : f.en}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/chat">
            <Button size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-700/30 w-full sm:w-auto">
              <Building2 className="w-5 h-5" />
              {isRTL ? "ابدأ استشارة عقارية ذكية" : "Start AI Real Estate Consultation"}
            </Button>
          </Link>
          <Link href="/guest-chat">
            <Button size="lg" variant="outline" className="gap-2 border-purple-500/40 text-purple-400 hover:bg-purple-500/10 w-full sm:w-auto">
              {isRTL ? "جرّب بدون تسجيل" : "Try Without Account"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
