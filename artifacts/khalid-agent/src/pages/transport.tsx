import { Link } from "wouter";
import { Car, ArrowLeft, Truck, MapPin, FileText, CreditCard, Bell, Navigation, Package, Bike, Bus, Anchor, Plane, Globe, Lock, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const features = [
  { icon: Globe, ar: "الربط بوزارة النقل وكل شركات النقل البري والبحري والجوي في اليمن", en: "Connected to the Ministry of Transport and all land, sea & air transport companies in Yemen" },
  { icon: Car, ar: "ربط كل السائقين وسيارات الأجرة والباصات والشاحنات وسيارات التوصيل والدراجات", en: "Connect all drivers, taxis, buses, trucks, delivery vehicles, and motorcycles" },
  { icon: FileText, ar: "إصدار تراخيص القيادة والمركبات إلكترونياً وتجديدها تلقائياً مع تنبيهات", en: "Issue and auto-renew driver and vehicle licenses electronically with alerts" },
  { icon: Bell, ar: "متابعة المخالفات المرورية وسدادها إلكترونياً", en: "Track and pay traffic violations electronically" },
  { icon: FileText, ar: "متابعة التأمين على المركبات والفحص الفني الدوري", en: "Track vehicle insurance and periodic technical inspections" },
  { icon: Plane, ar: "حجز تذاكر السفر: طيران، باص، باخرة", en: "Book travel tickets: flights, buses, ferries" },
  { icon: Navigation, ar: "تتبع الشاحنات والبضائع عبر GPS في الوقت الحقيقي", en: "Real-time GPS tracking of trucks and cargo" },
  { icon: Truck, ar: "تنسيق الشحن والتوصيل بين المدن والمحافظات", en: "Coordinate freight and delivery between cities and governorates" },
  { icon: Car, ar: "خدمة طلب سيارة أجرة أو توصيل مشاوير فوري", en: "Instant taxi and ride delivery request service" },
  { icon: Package, ar: "خدمة طلب شاحنة لنقل البضائع أو الأثاث", en: "Request a truck for goods or furniture transport" },
  { icon: MapPin, ar: "خدمة حجز مواقف السيارات في المدن الرئيسية", en: "Car parking reservation in major cities" },
  { icon: Users, ar: "خدمة مشاركة الركوب (Carpooling) لتخفيف الازدحام والتكلفة", en: "Carpooling service to reduce congestion and costs" },
  { icon: Bell, ar: "تنبيهات الطرق المزدحمة أو المغلقة أو الخطرة", en: "Alerts for congested, closed, or dangerous roads" },
  { icon: Navigation, ar: "حالة الطقس والرؤية على الطرق في الوقت الحقيقي", en: "Real-time weather and visibility conditions on roads" },
  { icon: CreditCard, ar: "حساب تكلفة الرحلات والمسافات آلياً", en: "Automatic calculation of trip costs and distances" },
  { icon: Star, ar: "ربط السائقين بالزبائن مع إدارة المدفوعات والتقييمات", en: "Connect drivers to customers with payment and rating management" },
  { icon: CreditCard, ar: "نظام محفظة للسائقين لاستقبال المدفوعات", en: "Digital wallet system for drivers to receive payments" },
  { icon: FileText, ar: "إصدار فواتير النقل والشحن إلكترونياً", en: "Issue electronic transport and freight invoices" },
  { icon: Lock, ar: "حماية بيانات السائقين والمركبات والركاب بتشفير عالٍ", en: "Protect driver, vehicle, and passenger data with advanced encryption" },
];

const stats = [
  { value: "+50K", label: "مركبة مسجلة", labelEn: "Registered Vehicles" },
  { value: "GPS", label: "تتبع حي", labelEn: "Live Tracking" },
  { value: "3", label: "أنواع نقل", labelEn: "Transport Types" },
  { value: "24/7", label: "خدمة مستمرة", labelEn: "Continuous Service" },
];

export default function TransportPage() {
  const { isRTL } = useI18n();
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#07070f] text-foreground overflow-x-hidden"
      style={{ background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(245,158,11,0.2) 0%, transparent 60%), #07070f" }}>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />{isRTL ? "الرئيسية" : "Home"}</Button></Link>
          <Link href="/vision"><Button variant="ghost" size="sm" className="text-xs opacity-60">محور #69 من 73</Button></Link>
        </div>

        <div className="relative rounded-3xl border border-amber-500/30 overflow-hidden p-8 md:p-12 text-center"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))" }}>
          <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 50% 0%, rgba(245,158,11,1), transparent 60%)" }} />
          <div className="relative z-10 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Car className="w-10 h-10 text-amber-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold"
              style={{ background: "linear-gradient(90deg, #fff, #fcd34d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {isRTL ? "نظام النقل والمواصلات" : "Smart Transport System"}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isRTL ? "منظومة نقل ذكية متكاملة تربط كل وسائل النقل في اليمن وتوحّد خدمات الترخيص والشحن والتوصيل" : "Integrated smart transport ecosystem connecting all Yemen's transportation modes with unified licensing, freight, and delivery services"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-amber-400">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{isRTL ? s.label : s.labelEn}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Car className="w-5 h-5 text-amber-400" />
            {isRTL ? "خدمات منظومة النقل" : "Transport System Services"}
            <span className="text-xs text-muted-foreground font-normal">({features.length} خدمة)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/40 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                  <f.icon className="w-4 h-4 text-amber-400" />
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
            <Button size="lg" className="gap-2 bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-700/30 w-full sm:w-auto">
              <Navigation className="w-5 h-5" />
              {isRTL ? "ابدأ استشارة نقل ذكية" : "Start AI Transport Consultation"}
            </Button>
          </Link>
          <Link href="/guest-chat">
            <Button size="lg" variant="outline" className="gap-2 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 w-full sm:w-auto">
              {isRTL ? "جرّب بدون تسجيل" : "Try Without Account"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
