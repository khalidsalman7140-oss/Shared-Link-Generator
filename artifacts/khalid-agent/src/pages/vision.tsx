import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft, CheckCircle2, Clock, Sparkles, Zap, Building2, Heart,
  Cpu, Globe, Shield, Scale, BookOpen, Stethoscope, Truck,
  Home, UtensilsCrossed, AlertTriangle, Crown, MessageSquare,
  Users, CreditCard, FileText, GraduationCap, Car, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type AxisStatus = "live" | "partial" | "coming";

interface Axis {
  num: number;
  icon: typeof Cpu;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  status: AxisStatus;
  color: string;
}

const AXES: Axis[] = [
  { num: 1, icon: MessageSquare, titleAr: "الدردشة الذكية", titleEn: "AI Smart Chat", descAr: "دردشة واستشارة مجانية غير محدودة بالذكاء الاصطناعي Gemini 2.5 Flash", descEn: "Unlimited free chat & consulting via Gemini 2.5 Flash", status: "live", color: "emerald" },
  { num: 2, icon: Globe, titleAr: "دعم 5 لغات + لهجات", titleEn: "5 Languages + Dialects", descAr: "عربي، إنجليزي، فرنسي، تركي، إسباني + كل اللهجات العربية", descEn: "Arabic, English, French, Turkish, Spanish + all Arabic dialects", status: "live", color: "blue" },
  { num: 3, icon: Cpu, titleAr: "تحليل الصور", titleEn: "Image Analysis", descAr: "تحليل وقراءة الصور عبر الذكاء الاصطناعي", descEn: "AI-powered image analysis and reading", status: "live", color: "purple" },
  { num: 4, icon: Users, titleAr: "إدارة المحادثات", titleEn: "Conversation Management", descAr: "حفظ وإدارة تاريخ كامل المحادثات مع المستخدمين", descEn: "Save and manage full conversation history per user", status: "live", color: "indigo" },
  { num: 5, icon: Shield, titleAr: "نظام المصادقة", titleEn: "Authentication System", descAr: "تسجيل دخول آمن بالبريد وGoogle عبر Clerk", descEn: "Secure login via email & Google through Clerk", status: "live", color: "emerald" },
  { num: 6, icon: CreditCard, titleAr: "نظام الاشتراكات", titleEn: "Subscription System", descAr: "4 خطط: مجاني، أسبوعي، شهري، سنوي مع إدارة كاملة", descEn: "4 plans: Free, Weekly, Monthly, Annual with full management", status: "live", color: "amber" },
  { num: 7, icon: Star, titleAr: "نظام التقييمات", titleEn: "Ratings System", descAr: "تقييم الخدمات ومشاركة التعليقات من المستخدمين", descEn: "Service ratings and user comments", status: "live", color: "yellow" },
  { num: 8, icon: Building2, titleAr: "لوحة إدارة كاملة", titleEn: "Full Admin Dashboard", descAr: "تحكم كامل: المستخدمون، الإحصائيات، المدفوعات، التقييمات", descEn: "Full control: users, stats, payments, ratings", status: "live", color: "purple" },
  { num: 9, icon: AlertTriangle, titleAr: "نظام الحجب", titleEn: "User Blocking System", descAr: "حجب المستخدمين المسيئين مع السبب والتوقيت", descEn: "Block abusive users with reason and timestamp", status: "live", color: "red" },
  { num: 10, icon: Sparkles, titleAr: "الإعلانات والتنبيهات", titleEn: "Announcements & Alerts", descAr: "نظام إعلانات وتنبيهات للمستخدمين من الإدارة", descEn: "Admin-to-user announcements and alerts system", status: "live", color: "blue" },
  { num: 11, icon: Cpu, titleAr: "معرفة السوق اليمني", titleEn: "Yemen Market Knowledge", descAr: "أسعار الخدمات، وسائل الدفع، اللهجات المحلية، مراكز الإعلان", descEn: "Service prices, payment methods, local dialects, ad centers", status: "live", color: "emerald" },
  { num: 12, icon: CheckCircle2, titleAr: "تحديد المسار المهني", titleEn: "Career Path Mapping", descAr: "اختبار 6 أسئلة يرسم خارطة طريق مهنية مخصصة", descEn: "6-question quiz draws personalized career roadmap", status: "live", color: "green" },
  { num: 13, icon: Building2, titleAr: "مدقق المشاريع", titleEn: "Project Validator", descAr: "تقييم فكرة مشروع وفق السوق اليمني، التمويل، المنافسة", descEn: "Evaluate project idea based on Yemen market, funding, competition", status: "live", color: "orange" },
  { num: 14, icon: FileText, titleAr: "استقبال طلبات الدفع", titleEn: "Payment Request Intake", descAr: "استقبال إيصالات التحويل ومعالجتها وتفعيل الاشتراك", descEn: "Receive transfer receipts, process and activate subscription", status: "live", color: "cyan" },
  { num: 15, icon: Cpu, titleAr: "توليد الصور بالذكاء", titleEn: "AI Image Generation", descAr: "توليد صور احترافية للمشتركين المدفوعين", descEn: "Professional AI image generation for paid subscribers", status: "live", color: "pink" },
  { num: 16, icon: Sparkles, titleAr: "نظام الإعلانات الداخلية", titleEn: "Internal Ads System", descAr: "إعلانات دوارة لمركز الأسطورة والإعلانات الداخلية", descEn: "Rotating ads for Al-Ostora Center & internal promotions", status: "live", color: "yellow" },
  { num: 17, icon: Users, titleAr: "وضع الضيف", titleEn: "Guest Mode", descAr: "تجربة التطبيق بدون تسجيل مع حفظ مؤقت ينتهي عند الإغلاق", descEn: "Try app without registration, temporary data cleared on close", status: "live", color: "gray" },
  { num: 18, icon: Shield, titleAr: "حماية وأمان API", titleEn: "API Security", descAr: "Rate limiting، رؤوس الأمان، سجل المراجعة، حماية XSS", descEn: "Rate limiting, security headers, audit log, XSS protection", status: "live", color: "green" },
  { num: 19, icon: Globe, titleAr: "حماية النظام الأساسي", titleEn: "System Prompt Protection", descAr: "نظام مبهم ومحمي لا يمكن الكشف عنه", descEn: "Obfuscated system prompt that cannot be revealed", status: "live", color: "purple" },
  { num: 20, icon: Sparkles, titleAr: "تطبيق PWA قابل للتثبيت", titleEn: "Installable PWA", descAr: "تثبيت التطبيق على الهاتف والكمبيوتر بدون متجر", descEn: "Install app on phone/computer without app store", status: "live", color: "blue" },
  { num: 21, icon: MessageSquare, titleAr: "نظام الصوت (ذكر/أنثى)", titleEn: "Voice System (M/F)", descAr: "قراءة ردود الذكاء الاصطناعي بصوت ذكر أو أنثى", descEn: "AI responses read aloud with male or female voice", status: "live", color: "violet" },
  { num: 22, icon: Shield, titleAr: "مكافحة الاحتيال", titleEn: "Anti-Fraud System", descAr: "منع استغلال الاشتراك المجاني بحذف وإعادة إنشاء الحسابات", descEn: "Prevent free trial abuse via account deletion and recreation", status: "live", color: "red" },
  { num: 23, icon: Sparkles, titleAr: "صفحة عن خالد", titleEn: "About Khaled Page", descAr: "سيرة ذاتية كاملة وصورة ووسائل تواصل لخالد سلمان", descEn: "Full bio, photo, and contact info for Khaled Salman", status: "live", color: "amber" },
  { num: 51, icon: Cpu, titleAr: "نظام حدود الرسائل المتدرج", titleEn: "Tiered Message Limits", descAr: "دردشة: مجاني ∞ | تصميم: 5/يوم مجاني | مهام ضخمة: مدفوع", descEn: "Chat: free ∞ | Design: 5/day free | Heavy tasks: paid", status: "live", color: "emerald" },
  { num: 52, icon: MessageSquare, titleAr: "سجل مرة واحدة — بيانات دائمة", titleEn: "Register Once — Data Forever", descAr: "البريد يُسجَّل مرة واحدة ويُحفظ تلقائياً مع كل بياناته", descEn: "Email registered once, auto-saved with all user data", status: "live", color: "blue" },
  { num: 53, icon: CreditCard, titleAr: "الموافقة التلقائية على الدفع", titleEn: "Auto Payment Approval", descAr: "الإدارة توافق بضغطة واحدة وتُفعَّل الخطة فوراً", descEn: "Admin approves with one click, plan activated instantly", status: "live", color: "green" },
  { num: 54, icon: Building2, titleAr: "إدارة الإعلانات التجارية", titleEn: "Commercial Ads Management", descAr: "إضافة وإدارة وتتبع الإعلانات التجارية داخل التطبيق", descEn: "Add, manage, and track commercial ads inside the app", status: "live", color: "yellow" },
  { num: 55, icon: MessageSquare, titleAr: "ربط واتساب Business", titleEn: "WhatsApp Business Integration", descAr: "استقبال الطلبات ورسائل العملاء عبر WhatsApp Business API", descEn: "Receive orders & customer messages via WhatsApp Business API", status: "coming", color: "green" },
  { num: 56, icon: Globe, titleAr: "ربط فيسبوك وانستجرام", titleEn: "Facebook & Instagram Integration", descAr: "تلقّي الرسائل والطلبات عبر Messenger وInstagram DM", descEn: "Receive messages & orders via Messenger & Instagram DM", status: "coming", color: "blue" },
  { num: 57, icon: MessageSquare, titleAr: "ربط SMS وتيليغرام", titleEn: "SMS & Telegram Integration", descAr: "إرسال استقبال الرسائل النصية والتيليغرام تلقائياً", descEn: "Auto send/receive SMS and Telegram messages", status: "coming", color: "purple" },
  { num: 58, icon: Star, titleAr: "منظومة التسويق الرقمي", titleEn: "Digital Marketing Suite", descAr: "إنشاء حملات تسويقية ذكية ومتابعة أدائها", descEn: "Create smart marketing campaigns and track performance", status: "coming", color: "orange" },
  { num: 59, icon: Users, titleAr: "منصة العمل الحر المحلية", titleEn: "Local Freelance Platform", descAr: "ربط المواهب اليمنية بالعملاء المحليين والعرب", descEn: "Connect Yemeni talents with local & Arab clients", status: "coming", color: "cyan" },
  { num: 60, icon: Building2, titleAr: "نظام إدارة الأعمال الصغيرة", titleEn: "SMB Management System", descAr: "فواتير، مخزون، موظفون، حسابات — للشركات الصغيرة", descEn: "Invoices, inventory, employees, accounts — for small businesses", status: "coming", color: "indigo" },
  { num: 61, icon: Cpu, titleAr: "أتمتة المكاتب والشركات", titleEn: "Office & Company Automation", descAr: "أتمتة العمليات اليومية، التقارير، الموارد البشرية", descEn: "Automate daily operations, reports, HR", status: "coming", color: "purple" },
  { num: 62, icon: Shield, titleAr: "منصة التعليم الإلكتروني", titleEn: "E-Learning Platform", descAr: "كورسات تعليمية، اختبارات، شهادات، مسارات مخصصة", descEn: "Educational courses, tests, certificates, personalized paths", status: "coming", color: "emerald" },
  { num: 63, icon: CreditCard, titleAr: "بوابة الدفع الموحدة لليمن", titleEn: "Unified Yemen Payment Gateway", descAr: "كريمي، نجم، جوالي، فلوسك، محافظ الجوال، البنوك اليمنية — نظام دفع شامل", descEn: "Kuraimi, Najm, Jawali, Flosk, mobile wallets, Yemeni banks — complete payment system", status: "coming", color: "gold" },
  { num: 64, icon: FileText, titleAr: "نظام السجل التجاري والتراخيص", titleEn: "Commercial Registry & Licenses", descAr: "ربط وزارة الصناعة والتجارة — استخراج وتجديد السجلات والتراخيص إلكترونياً", descEn: "Ministry of Industry integration — extract & renew registrations & licenses electronically", status: "coming", color: "blue" },
  { num: 65, icon: Building2, titleAr: "نظام الضرائب والجمارك", titleEn: "Tax & Customs System", descAr: "ربط مصلحة الضرائب والجمارك — حساب وإصدار الإقرارات الضريبية تلقائياً", descEn: "Tax & Customs Authority integration — auto-calculate and submit tax declarations", status: "coming", color: "amber" },
  { num: 66, icon: Scale, titleAr: "نظام القضاء والتوثيق", titleEn: "Justice & Documentation", descAr: "وزارة العدل، المحاكم، كتاب العدل، المحامون — وكالات وعقود إلكترونية", descEn: "Ministry of Justice, courts, notaries, lawyers — electronic proxies & contracts", status: "coming", color: "purple" },
  { num: 67, icon: Stethoscope, titleAr: "نظام الصحة الإلكتروني", titleEn: "E-Health System", descAr: "ملف طبي موحد، حجز مواعيد، وصفات إلكترونية، تشخيص أولي بالذكاء الاصطناعي", descEn: "Unified medical file, appointment booking, e-prescriptions, AI preliminary diagnosis", status: "coming", color: "red" },
  { num: 68, icon: GraduationCap, titleAr: "نظام التعليم الإلكتروني الحكومي", titleEn: "Government E-Education System", descAr: "ربط وزارتي التربية والتعليم — سجل أكاديمي، شهادات، قبول، اختبارات إلكترونية", descEn: "Education ministries integration — academic records, certificates, enrollment, e-exams", status: "coming", color: "emerald" },
  { num: 69, icon: Car, titleAr: "نظام النقل والمواصلات", titleEn: "Transport & Communications", descAr: "وزارة النقل — تراخيص قيادة، تذاكر سفر، تتبع GPS، طلب سيارة أجرة", descEn: "Transport ministry — driver licenses, travel tickets, GPS tracking, taxi requests", status: "coming", color: "blue" },
  { num: 70, icon: Home, titleAr: "نظام التخطيط العمراني والعقارات", titleEn: "Urban Planning & Real Estate", descAr: "تراخيص بناء، عقود عقارية موثقة، تقييم العقارات، مقارنة أسعار البناء", descEn: "Building permits, notarized real estate contracts, property valuation, construction prices", status: "coming", color: "orange" },
  { num: 71, icon: UtensilsCrossed, titleAr: "نظام المطاعم والتوصيل", titleEn: "Restaurants & Delivery System", descAr: "قوائم طعام، استقبال طلبات، تتبع التوصيل، إدارة المخزون، برامج الولاء", descEn: "Menus, order intake, delivery tracking, inventory management, loyalty programs", status: "coming", color: "yellow" },
  { num: 72, icon: AlertTriangle, titleAr: "نظام الإنذار المبكر والطوارئ", titleEn: "Early Warning & Emergency System", descAr: "رصد الكوارث، إنذارات مبكرة، تنسيق الإغاثة، إدارة مخزون الطوارئ", descEn: "Disaster monitoring, early warnings, relief coordination, emergency inventory management", status: "coming", color: "red" },
  { num: 73, icon: Crown, titleAr: "المنظومة الشاملة النهائية", titleEn: "Final Comprehensive System", descAr: "كل المحاور الـ73 في نظام موحد يعمل 24/7 — اليمن الرقمي الكامل تحت قيادة خالد سلمان", descEn: "All 73 axes in one unified system running 24/7 — complete digital Yemen under Khaled Salman", status: "coming", color: "gold" },
];

const STATUS_CONFIG: Record<AxisStatus, { label: string; labelEn: string; dot: string; bg: string; border: string }> = {
  live: { label: "مُنجز", labelEn: "Live", dot: "bg-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  partial: { label: "جزئي", labelEn: "Partial", dot: "bg-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  coming: { label: "قادم", labelEn: "Coming", dot: "bg-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/30" },
};

export default function VisionPage() {
  const { isRTL } = useI18n();
  const [filter, setFilter] = useState<AxisStatus | "all">("all");

  const liveCnt = AXES.filter(a => a.status === "live").length;
  const partialCnt = AXES.filter(a => a.status === "partial").length;
  const comingCnt = AXES.filter(a => a.status === "coming").length;
  const filtered = filter === "all" ? AXES : AXES.filter(a => a.status === filter);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground"
      style={{ background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(124,58,237,0.08) 0%, transparent 60%)" }}>
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">

        <Link href="/"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />{isRTL ? "الرئيسية" : "Home"}</Button></Link>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-full px-4 py-1.5 text-sm text-amber-400 mb-2">
            <Crown className="w-3.5 h-3.5" />{isRTL ? "رؤية طموحة" : "Ambitious Vision"}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold"
            style={{ background: "linear-gradient(135deg, #fff 20%, #a78bfa 60%, #f59e0b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {isRTL ? "الرؤية 73 — نبني اليمن" : "Vision 73 — Building Yemen"}
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto">
            {isRTL
              ? "من الدردشة الذكية إلى منظومة حكومية كاملة — 73 محوراً لرقمنة اليمن تحت قيادة خالد سلمان"
              : "From AI chat to a complete government system — 73 axes to digitize Yemen under Khaled Salman's leadership"}
          </p>
        </div>

        {/* Progress */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { cnt: liveCnt, label: isRTL ? "مُنجز" : "Live", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
            { cnt: partialCnt, label: isRTL ? "جزئي" : "Partial", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
            { cnt: comingCnt, label: isRTL ? "قادم" : "Coming", color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/30" },
          ].map((s, i) => (
            <div key={i} className={cn("text-center p-4 rounded-2xl border", s.bg)}>
              <div className={cn("text-3xl font-black", s.color)}>{s.cnt}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full transition-all"
            style={{ width: `${Math.round((liveCnt / AXES.length) * 100)}%` }} />
        </div>
        <p className="text-center text-sm text-muted-foreground">{Math.round((liveCnt / AXES.length) * 100)}% {isRTL ? "مكتمل" : "complete"}</p>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-2">
          {([["all", isRTL ? "الكل" : "All"], ["live", isRTL ? "مُنجز" : "Live"], ["coming", isRTL ? "قادم" : "Coming"]] as [string, string][]).map(([f, l]) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f as AxisStatus | "all")}
              className={cn("rounded-full text-xs", filter === f ? "shadow-md shadow-primary/30" : "border-border")}>{l}</Button>
          ))}
        </div>

        {/* Axes grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(axis => {
            const s = STATUS_CONFIG[axis.status];
            return (
              <div key={axis.num}
                className={cn("relative p-5 rounded-2xl border transition-all hover:scale-[1.02]", s.bg, s.border)}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <axis.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-mono">#{axis.num}</span>
                      <div className="flex items-center gap-1">
                        <div className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
                        <span className="text-[10px] text-muted-foreground">{isRTL ? s.label : s.labelEn}</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-sm leading-tight mb-1">{isRTL ? axis.titleAr : axis.titleEn}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{isRTL ? axis.descAr : axis.descEn}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 py-8">
          <p className="text-muted-foreground">{isRTL ? "هذه رؤية خالد سلمان لبناء اليمن الرقمي — تُنفَّذ تدريجياً" : "This is Khaled Salman's vision for building digital Yemen — implemented gradually"}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/sign-up"><Button size="lg" className="gap-2 shadow-lg shadow-primary/30"><Sparkles className="w-5 h-5" />{isRTL ? "انضم الآن" : "Join Now"}</Button></Link>
            <Link href="/guest-chat"><Button size="lg" variant="outline" className="gap-2 border-primary/30">{isRTL ? "جرّب بدون تسجيل" : "Try Without Login"}</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
