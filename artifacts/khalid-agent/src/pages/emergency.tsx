import { Link } from "wouter";
import { AlertTriangle, ArrowLeft, Siren, MapPin, Package, Users, Bell, Radio, Globe, Lock, Shield, Waves, Wind, Flame, Heart, Database, PhoneCall, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const features = [
  { icon: Globe, ar: "الربط بوزارة الداخلية، الدفاع المدني، الأمن العام، الأرصاد، هيئة المسح الجيولوجي، وزارة الصحة والزراعة", en: "Connected to Interior Ministry, Civil Defense, General Security, Meteorology, Geological Survey, Health & Agriculture Ministries" },
  { icon: Waves, ar: "رصد الكوارث الطبيعية: سيول، زلازل، انهيارات أرضية، أعاصير، جفاف، أوبئة، حرائق، هجمات حشرية", en: "Monitor natural disasters: floods, earthquakes, landslides, hurricanes, droughts, epidemics, fires, insect swarms" },
  { icon: Bell, ar: "إصدار إنذارات مبكرة عبر كل الوسائل: SMS، إيميل، واتساب، فيسبوك، إشعارات المنصة، مكبرات الصوت، الإذاعة، التلفزيون", en: "Issue early warnings via all channels: SMS, email, WhatsApp, Facebook, platform notifications, loudspeakers, radio, TV" },
  { icon: MapPin, ar: "تحديد المناطق الآمنة وطرق الإخلاء في الوقت الحقيقي", en: "Identify safe zones and evacuation routes in real time" },
  { icon: Heart, ar: "تنسيق عمليات الإغاثة والإيواء وإدارة مراكز الإيواء الطارئة", en: "Coordinate relief and shelter operations and manage emergency shelters" },
  { icon: Package, ar: "إدارة مخزون الطوارئ: غذاء، دواء، ماء، وقود، خيام، بطاطين، مولدات", en: "Manage emergency stockpiles: food, medicine, water, fuel, tents, blankets, generators" },
  { icon: Users, ar: "حصر المتضررين والمفقودين والمصابين وتسجيلهم فورياً", en: "Rapidly register and track affected persons, missing people, and casualties" },
  { icon: Globe, ar: "التنسيق مع المنظمات الإنسانية الدولية والمحلية: أممية، خليجية، محلية", en: "Coordinate with international and local humanitarian organizations: UN, GCC, local NGOs" },
  { icon: Heart, ar: "إدارة التبرعات والمساعدات وضمان وصولها للمستحقين بشفافية كاملة", en: "Manage donations and aid with full transparency to ensure delivery to those in need" },
  { icon: Shield, ar: "متابعة حالة البنية التحتية: سدود، جسور، طرق، كهرباء، مياه، اتصالات مع إنذارات خطر", en: "Monitor critical infrastructure: dams, bridges, roads, electricity, water, communications with danger alerts" },
  { icon: Database, ar: "حفظ خطط الطوارئ لكل محافظة ومديرية في اليمن", en: "Store emergency plans for every governorate and district in Yemen" },
  { icon: Radio, ar: "إجراء تدريبات وهمية للمواطنين والجهات المختصة لرفع الجاهزية", en: "Conduct simulation drills for citizens and authorities to enhance readiness" },
  { icon: Flame, ar: "نظام إدارة حوادث الحريق مع خرائط المخاطر وفرق الاستجابة", en: "Fire incident management system with risk maps and response teams" },
  { icon: Navigation, ar: "توجيه وإرشاد المواطنين عبر الوكيل الذكي في أوقات الأزمات", en: "Guide citizens through the AI agent during crisis times" },
  { icon: PhoneCall, ar: "خط ساخن ذكي متصل بالوكيل للطوارئ على مدار الساعة", en: "AI-powered emergency hotline connected to the agent 24/7" },
  { icon: Wind, ar: "تحليل بيانات الأرصاد الجوية وإصدار توقعات دقيقة للطقس والكوارث", en: "Analyze meteorological data and issue accurate weather and disaster forecasts" },
  { icon: Lock, ar: "حماية بيانات الطوارئ والكوارث بتشفير عالٍ ومنع التلاعب", en: "Protect emergency and disaster data with high encryption and anti-tampering measures" },
];

const stats = [
  { value: "22", label: "محافظة مغطاة", labelEn: "Governorates Covered" },
  { value: "24/7", label: "مراقبة مستمرة", labelEn: "Continuous Monitoring" },
  { value: "< 1m", label: "وقت الإنذار", labelEn: "Alert Time" },
  { value: "100%", label: "تغطية وطنية", labelEn: "National Coverage" },
];

export default function EmergencyPage() {
  const { isRTL } = useI18n();
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#07070f] text-foreground overflow-x-hidden"
      style={{ background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(249,115,22,0.2) 0%, transparent 60%), #07070f" }}>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />{isRTL ? "الرئيسية" : "Home"}</Button></Link>
          <Link href="/vision"><Button variant="ghost" size="sm" className="text-xs opacity-60">محور #72 من 73</Button></Link>
        </div>

        <div className="relative rounded-3xl border border-orange-500/30 overflow-hidden p-8 md:p-12 text-center"
          style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,88,12,0.08))" }}>
          <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 50% 0%, rgba(249,115,22,1), transparent 60%)" }} />
          <div className="relative z-10 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
              <Siren className="w-10 h-10 text-orange-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold"
              style={{ background: "linear-gradient(90deg, #fff, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {isRTL ? "نظام الإنذار المبكر والطوارئ" : "Early Warning & Emergency System"}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isRTL ? "نظام وطني متكامل لرصد الكوارث وإصدار الإنذارات المبكرة وتنسيق الاستجابة في اليمن" : "Comprehensive national system for disaster monitoring, early warning issuance, and response coordination in Yemen"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-orange-400">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{isRTL ? s.label : s.labelEn}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            {isRTL ? "خدمات نظام الطوارئ" : "Emergency System Services"}
            <span className="text-xs text-muted-foreground font-normal">({features.length} خدمة)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/40 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                  <f.icon className="w-4 h-4 text-orange-400" />
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
            <Button size="lg" className="gap-2 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-700/30 w-full sm:w-auto">
              <Siren className="w-5 h-5" />
              {isRTL ? "ابدأ استشارة طوارئ الآن" : "Start Emergency Consultation Now"}
            </Button>
          </Link>
          <Link href="/guest-chat">
            <Button size="lg" variant="outline" className="gap-2 border-orange-500/40 text-orange-400 hover:bg-orange-500/10 w-full sm:w-auto">
              {isRTL ? "جرّب بدون تسجيل" : "Try Without Account"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
