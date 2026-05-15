import { Link } from "wouter";
import { Activity, ArrowLeft, Heart, Pill, Calendar, FileText, Shield, Bell, Stethoscope, FlaskConical, Truck, Users, AlertTriangle, Globe, Lock, Database, Ambulance, Baby, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const features = [
  { icon: Globe, ar: "الربط بوزارة الصحة وكل المستشفيات والعيادات والصيدليات والمختبرات ومراكز الأشعة وبنوك الدم", en: "Connected to Ministry of Health, all hospitals, clinics, pharmacies, labs, radiology centers & blood banks" },
  { icon: FileText, ar: "الملف الطبي الإلكتروني الموحد لكل مريض", en: "Unified electronic medical file for every patient" },
  { icon: Database, ar: "حفظ التاريخ الطبي الكامل: تشخيصات، أدوية، عمليات، حساسية، تحاليل، أشعة، تطعيمات", en: "Full medical history: diagnoses, medications, surgeries, allergies, labs, radiology, vaccinations" },
  { icon: Calendar, ar: "حجز المواعيد الطبية في كل المنشآت الصحية", en: "Medical appointment booking at all health facilities" },
  { icon: Bell, ar: "تنبيهات المواعيد والتذكير بالأدوية", en: "Appointment alerts and medication reminders" },
  { icon: Pill, ar: "إصدار الوصفات الطبية الإلكترونية وربطها بالصيدليات مباشرة", en: "Issue electronic prescriptions directly linked to pharmacies" },
  { icon: Truck, ar: "متابعة توفر الأدوية وإدارة سلسلة التوريد الطبية", en: "Track drug availability and manage the medical supply chain" },
  { icon: AlertTriangle, ar: "تنبيهات نقص الأدوية والمستلزمات الطبية", en: "Alerts for drug shortages and medical supply deficits" },
  { icon: FileText, ar: "تقارير الصحة العامة ورصد الأوبئة والأمراض المعدية", en: "Public health reports, epidemic and infectious disease monitoring" },
  { icon: Users, ar: "تنسيق حملات التطعيم والتوعية الصحية", en: "Coordinate vaccination campaigns and health awareness" },
  { icon: Stethoscope, ar: "ربط المرضى بالأطباء للاستشارات عن بُعد", en: "Connect patients with doctors for remote consultations" },
  { icon: Activity, ar: "تشخيص أولي بالذكاء الاصطناعي بناءً على الأعراض", en: "AI-powered preliminary diagnosis based on symptoms" },
  { icon: Ambulance, ar: "توجيه الحالات الطارئة لأقرب مستشفى", en: "Route emergency cases to the nearest hospital" },
  { icon: Heart, ar: "متابعة التأمين الصحي والمعاملات المالية الصحية", en: "Track health insurance and financial transactions" },
  { icon: Baby, ar: "إصدار شهادات الميلاد والوفاة وتقارير اللياقة الطبية وشهادات التطعيم إلكترونياً", en: "Issue birth/death certificates, fitness reports, vaccination certificates electronically" },
  { icon: FlaskConical, ar: "مراقبة المخزون الدوائي في اليمن بالكامل", en: "Monitor the entire pharmaceutical inventory in Yemen" },
  { icon: Globe, ar: "ربط النظام الصحي اليمني بالمنظمات الصحية الدولية", en: "Link the Yemeni health system to international health organizations" },
  { icon: Lock, ar: "حماية الخصوصية الطبية بتشفير عالٍ وتطبيق معايير HIPAA العالمية", en: "Protect medical privacy with advanced encryption and HIPAA compliance" },
  { icon: Shield, ar: "منع الوصول غير المصرح به للملفات الطبية", en: "Prevent unauthorized access to medical records" },
  { icon: Thermometer, ar: "إدارة سلسلة البرود للأدوية والمستلزمات الحساسة للحرارة", en: "Cold chain management for temperature-sensitive drugs and supplies" },
];

const stats = [
  { value: "+2000", label: "منشأة صحية", labelEn: "Health Facilities" },
  { value: "24/7", label: "متاح دائماً", labelEn: "Always Available" },
  { value: "HIPAA", label: "معايير الخصوصية", labelEn: "Privacy Standards" },
  { value: "100%", label: "تشفير البيانات", labelEn: "Data Encryption" },
];

export default function HealthPage() {
  const { isRTL } = useI18n();
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground overflow-x-hidden"
      style={{ background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(16,185,129,0.08) 0%, transparent 60%)" }}>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />{isRTL ? "الرئيسية" : "Home"}</Button></Link>
          <Link href="/vision"><Button variant="ghost" size="sm" className="text-xs opacity-60">محور #67 من 73</Button></Link>
        </div>

        <div className="relative rounded-3xl border border-emerald-500/30 overflow-hidden p-8 md:p-12 text-center"
          style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))" }}>
          <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 50% 0%, rgba(16,185,129,1), transparent 60%)" }} />
          <div className="relative z-10 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Activity className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold"
              style={{ background: "linear-gradient(90deg, #fff, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {isRTL ? "نظام الصحة الذكي" : "Smart Health System"}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isRTL ? "منظومة صحية رقمية متكاملة تربط كل المنشآت الصحية في اليمن وتوحّد الملف الطبي لكل مواطن" : "An integrated digital health ecosystem connecting all Yemen's health facilities with a unified medical record for every citizen"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-emerald-400">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{isRTL ? s.label : s.labelEn}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            {isRTL ? "خدمات النظام الصحي" : "Health System Services"}
            <span className="text-xs text-muted-foreground font-normal">({features.length} خدمة)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/40 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                  <f.icon className="w-4 h-4 text-emerald-400" />
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
            <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-700/30 w-full sm:w-auto">
              <Stethoscope className="w-5 h-5" />
              {isRTL ? "ابدأ استشارة صحية ذكية" : "Start AI Health Consultation"}
            </Button>
          </Link>
          <Link href="/guest-chat">
            <Button size="lg" variant="outline" className="gap-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 w-full sm:w-auto">
              {isRTL ? "جرّب بدون تسجيل" : "Try Without Account"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
