import { Link } from "wouter";
import { GraduationCap, ArrowLeft, BookOpen, Users, FileText, Brain, Bell, Shield, CheckCircle, Video, Award, Globe, Lock, Database, ClipboardList, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const features = [
  { icon: Globe, ar: "الربط بوزارتي التربية والتعليم العالي وكل المدارس والجامعات والمعاهد ومراكز التدريب ورياض الأطفال ومدارس تحفيظ القرآن", en: "Connected to both Education Ministries + all schools, universities, institutes, training centers, kindergartens & Quran schools" },
  { icon: Database, ar: "السجل الأكاديمي الإلكتروني الموحد لكل طالب — درجات، شهادات، غياب، سلوك", en: "Unified academic record for every student — grades, certificates, absences, behavior" },
  { icon: FileText, ar: "إصدار الشهادات المدرسية والجامعية إلكترونياً والتحقق منها آلياً", en: "Issue and verify school/university certificates electronically" },
  { icon: CheckCircle, ar: "إدارة القبول والتسجيل في كل المؤسسات التعليمية", en: "Manage admissions and enrollment across all educational institutions" },
  { icon: ClipboardList, ar: "إدارة الاختبارات الإلكترونية المؤمنة والتصحيح الآلي بالذكاء الاصطناعي", en: "Manage secured electronic exams with AI-powered automated grading" },
  { icon: Video, ar: "مراقبة الاختبارات عن بُعد لمنع الغش", en: "Remote exam proctoring to prevent cheating" },
  { icon: Brain, ar: "دروس تعليمية بالذكاء الاصطناعي حسب مستوى كل طالب وقدراته", en: "AI-powered lessons personalized to each student's level and abilities" },
  { icon: BookOpen, ar: "شرح المناهج اليمنية بكل الوسائط: نص، صوت، فيديو، تفاعلي", en: "Explain Yemen's curricula via all media: text, audio, video, interactive" },
  { icon: Globe, ar: "الإجابة على أسئلة الطلاب فوراً في أي وقت", en: "Instantly answer student questions anytime" },
  { icon: Star, ar: "تصميم خطط تعليمية فردية لكل طالب حسب مستواه", en: "Design individual learning plans for each student based on their level" },
  { icon: Bell, ar: "تنبيهات الغياب والتأخر والفروض والاختبارات واجتماعات أولياء الأمور", en: "Alerts for absences, tardiness, assignments, exams & parent meetings" },
  { icon: Users, ar: "ربط المعلمين بالطلاب وأولياء الأمور بشكل متكامل", en: "Connect teachers, students, and parents in an integrated system" },
  { icon: Calendar, ar: "إدارة الجداول المدرسية والجامعية آلياً", en: "Automated management of school and university schedules" },
  { icon: Database, ar: "إدارة المكتبات الإلكترونية والمراجع والمصادر التعليمية", en: "Manage digital libraries, references, and educational resources" },
  { icon: Award, ar: "منح دراسية للطلاب المتفوقين حسب المعايير الموضوعية", en: "Scholarships for outstanding students based on objective criteria" },
  { icon: Globe, ar: "ربط الخريجين بسوق العمل عبر المنصة", en: "Connect graduates to the job market through the platform" },
  { icon: Video, ar: "نظام التعليم عن بُعد الكامل عند الحاجة — حوادث، أوبئة، كوارث", en: "Full remote learning system when needed — emergencies, epidemics, disasters" },
  { icon: Lock, ar: "حماية بيانات الطلاب والكوادر التعليمية بتشفير عالٍ", en: "Protect student and staff data with advanced encryption" },
];

const stats = [
  { value: "+5000", label: "مؤسسة تعليمية", labelEn: "Educational Institutions" },
  { icon: "🧑‍🎓", value: "+3M", label: "طالب", labelEn: "Students" },
  { value: "AI", label: "تصحيح آلي", labelEn: "Auto Grading" },
  { value: "5", label: "لغات", labelEn: "Languages" },
];

export default function EducationPage() {
  const { isRTL } = useI18n();
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#07070f] text-foreground overflow-x-hidden"
      style={{ background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(59,130,246,0.2) 0%, transparent 60%), #07070f" }}>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />{isRTL ? "الرئيسية" : "Home"}</Button></Link>
          <Link href="/vision"><Button variant="ghost" size="sm" className="text-xs opacity-60">محور #68 من 73</Button></Link>
        </div>

        <div className="relative rounded-3xl border border-blue-500/30 overflow-hidden p-8 md:p-12 text-center"
          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.08))" }}>
          <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 50% 0%, rgba(59,130,246,1), transparent 60%)" }} />
          <div className="relative z-10 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-10 h-10 text-blue-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold"
              style={{ background: "linear-gradient(90deg, #fff, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {isRTL ? "نظام التعليم الإلكتروني" : "Smart Education System"}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isRTL ? "منظومة تعليمية رقمية متكاملة تغطي كل مراحل التعليم في اليمن وتُشخّص وتُطوّر كل طالب" : "A comprehensive digital education ecosystem covering all educational levels in Yemen, diagnosing and developing every student"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-blue-400">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{isRTL ? s.label : s.labelEn}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            {isRTL ? "خدمات النظام التعليمي" : "Education System Services"}
            <span className="text-xs text-muted-foreground font-normal">({features.length} خدمة)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/40 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                  <f.icon className="w-4 h-4 text-blue-400" />
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
            <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-700/30 w-full sm:w-auto">
              <Brain className="w-5 h-5" />
              {isRTL ? "ابدأ استشارة تعليمية ذكية" : "Start AI Education Consultation"}
            </Button>
          </Link>
          <Link href="/guest-chat">
            <Button size="lg" variant="outline" className="gap-2 border-blue-500/40 text-blue-400 hover:bg-blue-500/10 w-full sm:w-auto">
              {isRTL ? "جرّب بدون تسجيل" : "Try Without Account"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
