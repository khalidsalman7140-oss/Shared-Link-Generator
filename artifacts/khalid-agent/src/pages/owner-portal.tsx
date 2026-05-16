import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useUser } from "@clerk/react";
import {
  BookOpen, Users, Star, MessageCircle, ChevronLeft, ChevronRight,
  Send, Check, ArrowLeft, ExternalLink, Zap, Crown, Sparkles,
  Building2, Globe, Brain, Palette, Video, GraduationCap, Code2,
  FileText, Volume2, Search, Shield, Bell, BarChart3, Heart,
  Stethoscope, Car, UtensilsCrossed, AlertTriangle, Home,
  Phone, Mail, Copy, CheckCheck, RefreshCw,
} from "lucide-react";

const TABS = [
  { id: "guide",    label: "دليل الشرح",           icon: BookOpen },
  { id: "admin",    label: "الاشتراكات والمستخدمين", icon: Users },
  { id: "reviews",  label: "التقييمات والآراء",      icon: Star },
  { id: "contact",  label: "التواصل المباشر",        icon: MessageCircle },
] as const;
type TabId = typeof TABS[number]["id"];

const AXES = [
  { n: 1,  icon: MessageCircle, color: "#7c3aed", cat: "ذكاء اصطناعي", title: "الدردشة الذكية",           desc: "وكيل Gemini 2.5 Flash — إجابات لحظية بكل اللغات" },
  { n: 2,  icon: Globe,         color: "#0ea5e9", cat: "ذكاء اصطناعي", title: "5 لغات مدعومة",           desc: "عربي، إنجليزي، فرنسي، تركي، إسباني بدون حدود" },
  { n: 3,  icon: Palette,       color: "#f59e0b", cat: "إبداع",         title: "توليد صور بالذكاء",       desc: "اكتب وصفاً — احصل على صورة احترافية فوراً" },
  { n: 4,  icon: Globe,         color: "#10b981", cat: "برمجة",         title: "بناء مواقع مجاناً",       desc: "صف موقعك — يُبنى بـ HTML/CSS/JS على الفور" },
  { n: 5,  icon: Palette,       color: "#ec4899", cat: "إبداع",         title: "تصميم شعارات",            desc: "شعارات SVG احترافية تحمل هوية علامتك التجارية" },
  { n: 6,  icon: FileText,      color: "#8b5cf6", cat: "كتابة",         title: "توليد وثائق Word",        desc: "تقارير، خطط، عقود — تحميل فوري بصيغة DOCX" },
  { n: 7,  icon: BookOpen,      color: "#0d9488", cat: "تعليم",         title: "البحث في الكتب المجانية", desc: "آلاف الكتب العربية والأجنبية بضغطة زر" },
  { n: 8,  icon: Brain,         color: "#f97316", cat: "تطوير ذاتي",    title: "تحديد المسار المهني",     desc: "اختبار يحدد مسارك المهني المثالي بالذكاء الاصطناعي" },
  { n: 9,  icon: Volume2,       color: "#3b82f6", cat: "صوت",           title: "تحويل النص لصوت",         desc: "استمع لردود الذكاء الاصطناعي بصوت عربي واضح" },
  { n: 10, icon: Volume2,       color: "#6366f1", cat: "صوت",           title: "إدخال صوتي",              desc: "تحدث بصوتك — تحويل صوت لنص فوري" },
  { n: 11, icon: Palette,       color: "#d946ef", cat: "إبداع",         title: "التصميم المرئي بالذكاء",  desc: "إنشاء عروض مرئية احترافية بأمر نصي" },
  { n: 12, icon: BarChart3,     color: "#0891b2", cat: "أعمال",         title: "تحليل البيانات",          desc: "رفع ملفات Excel وCSV — تحليل فوري بالذكاء" },
  { n: 13, icon: Code2,         color: "#1d4ed8", cat: "برمجة",         title: "مساعد البرمجة",           desc: "أكواد Python، JS، TS — توليد وتصحيح فوري" },
  { n: 14, icon: GraduationCap, color: "#7c3aed", cat: "تعليم",         title: "مشاريع التخرج",           desc: "خطة البحث، التحليل، المراجع الأكاديمية" },
  { n: 15, icon: FileText,      color: "#059669", cat: "كتابة",         title: "المحتوى التسويقي",        desc: "إعلانات، منشورات سوشيال، حملات تسويقية" },
  { n: 16, icon: Shield,        color: "#dc2626", cat: "إدارة",         title: "نظام الاشتراكات",         desc: "خطط: مجاني، أسبوعي، شهري، سنوي، مؤسسي" },
  { n: 17, icon: Bell,          color: "#d97706", cat: "إدارة",         title: "إشعارات Push",            desc: "تنبيهات فورية للمدير عند كل طلب أو تحديث" },
  { n: 18, icon: Users,         color: "#7c3aed", cat: "إدارة",         title: "لوحة التحكم",             desc: "إدارة المستخدمين، الاشتراكات، الإعلانات" },
  { n: 19, icon: Building2,     color: "#0369a1", cat: "أعمال",         title: "الاستشارات المؤسسية",     desc: "حلول ذكاء اصطناعي مخصصة للشركات والمنظمات" },
  { n: 20, icon: Heart,         color: "#e11d48", cat: "خدمات",         title: "خدمات شخصية VIP",        desc: "مستوى ذهبي وفضي — معالجة أولوية وميزات خاصة" },
  { n: 21, icon: Stethoscope,   color: "#0d9488", cat: "صحة",           title: "الصحة والطب",             desc: "استشارات صحية، وصفات، توعية طبية" },
  { n: 22, icon: UtensilsCrossed,color:"#f59e0b", cat: "خدمات",         title: "المطاعم والغذاء",         desc: "وصفات، قوائم، خدمة طلبات غذائية ذكية" },
  { n: 23, icon: Car,           color: "#1e40af", cat: "خدمات",         title: "النقل والمواصلات",        desc: "حجوزات، خرائط، خدمات النقل الذكية" },
  { n: 24, icon: Home,          color: "#0891b2", cat: "خدمات",         title: "العقارات الذكية",         desc: "بيع وشراء وإيجار — تحليل السوق العقاري" },
  { n: 25, icon: AlertTriangle, color: "#dc2626", cat: "طوارئ",         title: "الطوارئ والإسعاف",        desc: "نظام إنذار مبكر، خدمات الطوارئ الرقمية" },
  { n: 26, icon: GraduationCap, color: "#6d28d9", cat: "تعليم",         title: "التعليم الإلكتروني",      desc: "منصة تعلم متكاملة، اختبارات، شهادات رقمية" },
  { n: 27, icon: Search,        color: "#0369a1", cat: "بحث",           title: "محرك البحث الذكي",        desc: "بحث مدعوم بالذكاء في قواعد بيانات متعددة" },
  { n: 28, icon: Video,         color: "#7c3aed", cat: "إبداع",         title: "المحتوى المرئي",          desc: "سيناريوهات فيديو، سكريبتات، إنتاج رقمي" },
  { n: 29, icon: Code2,         color: "#10b981", cat: "برمجة",         title: "تطبيقات الجوال",          desc: "تصميم وبرمجة تطبيقات iOS وAndroid" },
  { n: 30, icon: Shield,        color: "#1d4ed8", cat: "أمان",          title: "الأمن السيبراني",         desc: "حماية البيانات، كشف التهديدات، استشارات أمنية" },
  // axes 31-72
  { n: 31, icon: Building2, color: "#0891b2", cat: "أعمال", title: "إدارة المشاريع",    desc: "تخطيط، متابعة، تقارير تلقائية للمشاريع" },
  { n: 32, icon: BarChart3,  color: "#7c3aed", cat: "مالية", title: "المحاسبة الذكية",   desc: "فواتير، ميزانيات، تقارير مالية تلقائية" },
  { n: 33, icon: Globe,      color: "#0ea5e9", cat: "سوشيال", title: "إدارة السوشيال",   desc: "نشر تلقائي، تحليل أداء، جدولة المحتوى" },
  { n: 34, icon: Users,      color: "#059669", cat: "أعمال", title: "إدارة علاقات العملاء", desc: "CRM ذكي — تتبع العملاء والصفقات" },
  { n: 35, icon: FileText,   color: "#f97316", cat: "قانون", title: "العقود والوثائق",   desc: "صياغة عقود، اتفاقيات، وثائق رسمية" },
  { n: 36, icon: Brain,      color: "#8b5cf6", cat: "تطوير ذاتي", title: "التدريب والتطوير", desc: "خطط تعلم مخصصة، مسارات مهارية" },
  { n: 37, icon: Heart,      color: "#e11d48", cat: "رعاية", title: "رعاية الصحة النفسية", desc: "دعم نفسي، تأمل، تمارين الاسترخاء الذكي" },
  { n: 38, icon: Stethoscope, color: "#10b981", cat: "صحة", title: "الوصفات الطبية",     desc: "مراجعة الأدوية، تفاعلات دوائية" },
  { n: 39, icon: GraduationCap, color: "#6366f1", cat: "تعليم", title: "الامتحانات الرقمية", desc: "أسئلة، تصحيح آلي، شهادات فورية" },
  { n: 40, icon: Car,        color: "#0369a1", cat: "خدمات", title: "تراخيص القيادة",    desc: "اختبارات نظرية، إرشادات المرور" },
  { n: 41, icon: Home,       color: "#d97706", cat: "خدمات", title: "التسجيل العقاري",   desc: "توثيق عقود البيع والشراء رقمياً" },
  { n: 42, icon: Building2,  color: "#dc2626", cat: "حكومية", title: "الضرائب الرقمية",   desc: "حساب ضريبي، إقرارات، استشارات مالية" },
  { n: 43, icon: Shield,     color: "#7c3aed", cat: "حكومية", title: "الخدمات القضائية",  desc: "استشارات قانونية، متابعة قضايا" },
  { n: 44, icon: Users,      color: "#0891b2", cat: "أعمال", title: "منصة الفريلانسرز",  desc: "سوق عمل محلي — توظيف ونشر مهارات" },
  { n: 45, icon: Globe,      color: "#059669", cat: "تجارة", title: "التجارة الإلكترونية", desc: "متاجر إلكترونية مع بوابات دفع محلية" },
  { n: 46, icon: Bell,       color: "#f59e0b", cat: "أمان", title: "الإنذار المبكر",     desc: "رصد الكوارث والأزمات لحظة بلحظة" },
  { n: 47, icon: Volume2,    color: "#3b82f6", cat: "إعلام", title: "الإذاعة الرقمية",   desc: "بودكاست، محتوى صوتي، بث مباشر" },
  { n: 48, icon: Video,      color: "#8b5cf6", cat: "إعلام", title: "التلفزيون الرقمي",   desc: "بث مرئي، مقاطع تعليمية، إنتاج احترافي" },
  { n: 49, icon: Heart,      color: "#e11d48", cat: "مجتمع", title: "التبرعات والأعمال الخيرية", desc: "جمع تبرعات، مشاريع مجتمعية" },
  { n: 50, icon: Brain,      color: "#7c3aed", cat: "ذكاء اصطناعي", title: "الذكاء الاجتماعي", desc: "تحليل المشاعر، التفاعل الإنساني الذكي" },
  { n: 51, icon: Code2,      color: "#1d4ed8", cat: "برمجة", title: "أتمتة العمليات",    desc: "RPA — تشغيل تلقائي للمهام المتكررة" },
  { n: 52, icon: BarChart3,  color: "#059669", cat: "بيانات", title: "ذكاء الأعمال",      desc: "لوحات تحليلية، قرارات مبنية على البيانات" },
  { n: 53, icon: Globe,      color: "#0ea5e9", cat: "اتصالات", title: "الترجمة الفورية",  desc: "ترجمة فورية عالية الدقة بين كل اللغات" },
  { n: 54, icon: Palette,    color: "#d946ef", cat: "إبداع", title: "الهوية البصرية",     desc: "شعار + ألوان + خطوط + دليل العلامة التجارية" },
  { n: 55, icon: FileText,   color: "#f97316", cat: "كتابة", title: "كتابة السير الذاتية", desc: "CV احترافي، خطاب تعريف، ملف LinkedIn" },
  { n: 56, icon: Building2,  color: "#0369a1", cat: "أعمال", title: "خطط الأعمال",       desc: "دراسة جدوى، خطة تشغيلية، تحليل SWOT" },
  { n: 57, icon: GraduationCap, color: "#6d28d9", cat: "تعليم", title: "الدروس الخصوصية", desc: "مدرس ذكاء اصطناعي في كل المواد" },
  { n: 58, icon: Search,     color: "#dc2626", cat: "بحث", title: "البحث العلمي",        desc: "مراجعة الأدبيات، توثيق APA/MLA" },
  { n: 59, icon: Heart,      color: "#10b981", cat: "صحة", title: "اللياقة البدنية",      desc: "خطط تمرين وتغذية مخصصة بالذكاء" },
  { n: 60, icon: Users,      color: "#f59e0b", cat: "مجتمع", title: "الشبكة الاجتماعية", desc: "التواصل بين المهنيين والأعمال اليمنية" },
  { n: 61, icon: Code2,      color: "#8b5cf6", cat: "برمجة", title: "الذكاء في قطاع الزراعة", desc: "توقعات المناخ، إدارة المحاصيل الذكية" },
  { n: 62, icon: Shield,     color: "#0891b2", cat: "أمان", title: "نظام التوثيق الرقمي", desc: "توثيق العقود والعمليات بالبلوك تشين" },
  { n: 63, icon: Globe,      color: "#1d4ed8", cat: "سياحة", title: "السياحة الذكية",     desc: "خطط سفر، مرشد سياحي، حجوزات ذكية" },
  { n: 64, icon: Brain,      color: "#7c3aed", cat: "حكومية", title: "البوابة الحكومية الذكية", desc: "خدمات حكومية رقمية متكاملة لليمن" },
  { n: 65, icon: Stethoscope,color: "#0d9488", cat: "صحة", title: "الطب عن بُعد",        desc: "استشارة طبية فورية مع أطباء معتمدين" },
  { n: 66, icon: Building2,  color: "#d97706", cat: "صناعة", title: "إدارة سلسلة التوريد", desc: "مخزون ذكي، تتبع الشحنات، تحليل الموردين" },
  { n: 67, icon: AlertTriangle,color:"#dc2626",  cat: "طوارئ", title: "إدارة الأزمات",     desc: "غرفة عمليات رقمية للكوارث والطوارئ" },
  { n: 68, icon: Heart,      color: "#e11d48", cat: "مجتمع", title: "دعم ذوي الاحتياجات", desc: "خدمات مخصصة للأشخاص ذوي الاحتياجات الخاصة" },
  { n: 69, icon: BarChart3,  color: "#059669", cat: "مالية", title: "المدفوعات المحلية",  desc: "تكامل كامل مع بنك الكريمي والبنوك اليمنية" },
  { n: 70, icon: Globe,      color: "#0ea5e9", cat: "دولي", title: "البوابة الدولية",    desc: "خدمة اليمنيين في الخارج رقمياً" },
  { n: 71, icon: Brain,      color: "#6366f1", cat: "ذكاء اصطناعي", title: "الذكاء التنبؤي", desc: "تحليلات مستقبلية وتوقعات ذكية" },
  { n: 72, icon: Shield,     color: "#7c3aed", cat: "وطني", title: "اليمن الرقمي 2030",  desc: "رؤية شاملة: يمن متصل، ذكي، ومزدهر رقمياً" },
];

const CATEGORIES = Array.from(new Set(AXES.map(a => a.cat)));

interface Review { id: number; stars: number; comment: string; userName: string; createdAt: string; }
interface DirectMsg { name: string; content: string; }

export default function OwnerPortal() {
  const { user } = useUser();
  const [tab, setTab] = useState<TabId>("guide");
  const [catFilter, setCatFilter] = useState("الكل");
  const [stars, setStars] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSent, setReviewSent] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [msgName, setMsgName] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [payments, setPayments] = useState<Array<{
    id: number; userId: string; planRequested: string; status: string;
    transferNumber: string; notes: string; createdAt: string;
    receiptImage?: string;
  }>>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const ADMIN_EMAIL = "khalidsalman7140@gmail.com";
  const isAdmin = user?.emailAddresses?.[0]?.emailAddress === ADMIN_EMAIL;

  // Load reviews
  useEffect(() => {
    if (tab !== "reviews") return;
    fetch("/api/ratings")
      .then(r => r.ok ? r.json() : [])
      .then((data: Review[]) => setReviews(Array.isArray(data) ? data.slice(0, 20) : []))
      .catch(() => {});
  }, [tab]);

  // Load payments for admin
  useEffect(() => {
    if (tab !== "admin" || !isAdmin) return;
    setPaymentsLoading(true);
    fetch("/api/admin/payments", { headers: { "Content-Type": "application/json" } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setPayments(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setPaymentsLoading(false));
  }, [tab, isAdmin]);

  const handleReviewSubmit = async () => {
    if (!reviewComment.trim()) return;
    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars, comment: reviewComment }),
      });
      setReviewSent(true);
      setReviewComment("");
    } catch {}
  };

  const handleMsgSubmit = async () => {
    if (!msgContent.trim()) return;
    setMsgLoading(true);
    try {
      await fetch("/api/payments/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planRequested: "message",
          transferNumber: "0",
          receiptImage: "",
          notes: `[رسالة مباشرة من: ${msgName || "زائر"}] ${msgContent}`,
          transferService: "direct_message",
        }),
      }).catch(() => {});
      setMsgSent(true);
      setMsgContent("");
      setMsgName("");
    } finally { setMsgLoading(false); }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => {});
  };

  const approvePayment = async (id: number) => {
    await fetch(`/api/admin/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: "approved" } : p));
  };
  const rejectPayment = async (id: number) => {
    await fetch(`/api/admin/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    });
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: "rejected" } : p));
  };

  const filteredAxes = catFilter === "الكل" ? AXES : AXES.filter(a => a.cat === catFilter);

  const s: React.CSSProperties = {
    fontFamily: "'Cairo', 'Tajawal', sans-serif",
  };

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", color: "#000", ...s }} dir="rtl">
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 0 60px" }}>

        {/* ── رأس الصفحة ── */}
        <div style={{ background: "linear-gradient(135deg, #000 0%, #1a1a2e 100%)", padding: "28px 20px 24px", position: "sticky", top: 0, zIndex: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <Link href="/chat">
              <button style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: 36, height: 36, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronLeft style={{ width: 18, height: 18 }} />
              </button>
            </Link>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#ea580c)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "1.5rem" }}>👑</span>
            </div>
            <div>
              <h1 style={{ color: "#fff", fontWeight: 900, fontSize: "1.2rem", margin: 0 }}>بوابة خالد سلمان</h1>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", margin: "2px 0 0" }}>دليل الشرح — الاشتراكات — التقييمات — التواصل</p>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ background: active ? "#f59e0b" : "rgba(255,255,255,0.08)", color: active ? "#000" : "rgba(255,255,255,0.75)", border: active ? "none" : "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 14px", fontSize: "0.78rem", fontWeight: active ? 800 : 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0 }}>
                  <Icon style={{ width: 14, height: 14 }} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════════ TAB: GUIDE ═══════════════ */}
        {tab === "guide" && (
          <div style={{ padding: "20px 16px" }}>
            {/* مقدمة */}
            <div style={{ background: "linear-gradient(135deg,#fffbeb,#fef3c7)", border: "2px solid #f59e0b", borderRadius: 16, padding: "16px 18px", marginBottom: 20 }}>
              <h2 style={{ color: "#92400e", fontWeight: 900, fontSize: "1.05rem", margin: "0 0 8px" }}>🎯 كيف تستخدم يمن شات؟</h2>
              <p style={{ color: "#78350f", fontSize: "0.82rem", lineHeight: 1.7, margin: 0 }}>
                يمن شات هو وكيل ذكاء اصطناعي متكامل يضم <strong>72 خدمة ومحوراً</strong> لمساعدتك في كل ما تحتاج.
                فقط اكتب طلبك بالعربي أو أي لغة أخرى، وسيفهم الوكيل ويستجيب فوراً.
                يمكنك أيضاً رفع صور، بناء مواقع، توليد شعارات، وتحميل وثائق Word — كل ذلك من خانة الدردشة الواحدة.
              </p>
            </div>

            {/* أمثلة سريعة */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 900, fontSize: "0.95rem", color: "#000", marginBottom: 12 }}>⚡ أمثلة سريعة — اكتب هذه الأوامر في الدردشة:</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { cmd: "صمم موقع لمطعمي", icon: "🌐" },
                  { cmd: "صمم لي شعار لمشروعي", icon: "🎨" },
                  { cmd: "ابحث عن كتب الذكاء الاصطناعي", icon: "📚" },
                  { cmd: "اكتب لي تقريراً عن اليمن", icon: "📝" },
                  { cmd: "حدد مساري المهني المناسب", icon: "🧭" },
                  { cmd: "ترجم هذا النص للإنجليزي", icon: "🌍" },
                  { cmd: "اشرح لي مفهوم البلوك تشين", icon: "💡" },
                  { cmd: "اكتب كود Python لحساب المرتبات", icon: "💻" },
                ].map((ex, i) => (
                  <Link href="/chat" key={i}>
                    <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "10px 12px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: 8 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#eff6ff"; (e.currentTarget as HTMLElement).style.borderColor = "#7c3aed"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; }}>
                      <span>{ex.icon}</span>{ex.cmd}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* فلتر الفئات */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
              {["الكل", ...CATEGORIES].map(cat => (
                <button key={cat} onClick={() => setCatFilter(cat)}
                  style={{ background: catFilter === cat ? "#000" : "#f1f5f9", color: catFilter === cat ? "#fff" : "#374151", border: catFilter === cat ? "none" : "1.5px solid #e2e8f0", borderRadius: 20, padding: "5px 14px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* شبكة المحاور */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {filteredAxes.map(ax => {
                const Icon = ax.icon;
                return (
                  <div key={ax.n} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "12px 12px 10px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, right: 0, width: 40, height: 40, background: ax.color, opacity: 0.08, borderRadius: "0 0 0 40px" }} />
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${ax.color}15`, border: `1.5px solid ${ax.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon style={{ width: 16, height: 16, color: ax.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: "0.6rem", fontWeight: 700, padding: "1px 5px", borderRadius: 6 }}>#{ax.n}</span>
                          <span style={{ background: `${ax.color}15`, color: ax.color, fontSize: "0.58rem", fontWeight: 700, padding: "1px 5px", borderRadius: 6 }}>{ax.cat}</span>
                        </div>
                        <p style={{ fontWeight: 800, fontSize: "0.8rem", color: "#000", margin: "0 0 3px", lineHeight: 1.3 }}>{ax.title}</p>
                        <p style={{ fontSize: "0.68rem", color: "#6b7280", margin: 0, lineHeight: 1.4 }}>{ax.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <Link href="/vision">
                <button style={{ background: "#000", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <ExternalLink style={{ width: 16, height: 16 }} />عرض خارطة الرؤية الكاملة
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ═══════════════ TAB: ADMIN ═══════════════ */}
        {tab === "admin" && (
          <div style={{ padding: "20px 16px" }}>
            {isAdmin ? (
              <>
                <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 16, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.4rem" }}>🛡️</span>
                  <div>
                    <p style={{ fontWeight: 900, color: "#166534", margin: 0, fontSize: "0.95rem" }}>مرحباً خالد — أنت في وضع المدير</p>
                    <p style={{ color: "#15803d", fontSize: "0.75rem", margin: "2px 0 0" }}>تحكم كامل بالاشتراكات والمدفوعات</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                  <Link href="/admin">
                    <button style={{ background: "#000", color: "#fff", border: "none", borderRadius: 12, padding: "12px 20px", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                      <Shield style={{ width: 16, height: 16 }} />لوحة التحكم الكاملة
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      setPaymentsLoading(true);
                      fetch("/api/admin/payments")
                        .then(r => r.ok ? r.json() : [])
                        .then(data => setPayments(Array.isArray(data) ? data : []))
                        .catch(() => {})
                        .finally(() => setPaymentsLoading(false));
                    }}
                    style={{ background: "#f1f5f9", color: "#000", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <RefreshCw style={{ width: 14, height: 14 }} />تحديث
                  </button>
                </div>

                {paymentsLoading ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>جاري التحميل...</div>
                ) : payments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, background: "#f8fafc", borderRadius: 16, color: "#9ca3af" }}>
                    <p style={{ fontSize: "2rem", margin: "0 0 8px" }}>📭</p>
                    <p style={{ fontWeight: 700 }}>لا توجد طلبات اشتراك بعد</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {payments.map(p => (
                      <div key={p.id} style={{ background: "#fff", border: `2px solid ${p.status === "approved" ? "#22c55e" : p.status === "rejected" ? "#ef4444" : "#f59e0b"}`, borderRadius: 16, padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                          <div>
                            <span style={{ background: p.status === "approved" ? "#f0fdf4" : p.status === "rejected" ? "#fef2f2" : "#fffbeb", color: p.status === "approved" ? "#166534" : p.status === "rejected" ? "#991b1b" : "#92400e", border: `1px solid ${p.status === "approved" ? "#bbf7d0" : p.status === "rejected" ? "#fca5a5" : "#fcd34d"}`, borderRadius: 8, padding: "2px 10px", fontSize: "0.72rem", fontWeight: 800 }}>
                              {p.status === "approved" ? "✅ مُفعَّل" : p.status === "rejected" ? "❌ مرفوض" : "⏳ قيد المراجعة"}
                            </span>
                          </div>
                          <span style={{ color: "#9ca3af", fontSize: "0.68rem" }}>{new Date(p.createdAt).toLocaleDateString("ar-EG")}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 10px" }}>
                            <p style={{ color: "#6b7280", fontSize: "0.62rem", margin: "0 0 2px" }}>الخطة</p>
                            <p style={{ fontWeight: 800, fontSize: "0.82rem", color: "#000", margin: 0 }}>{p.planRequested}</p>
                          </div>
                          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 10px" }}>
                            <p style={{ color: "#6b7280", fontSize: "0.62rem", margin: "0 0 2px" }}>رقم السند</p>
                            <p style={{ fontWeight: 800, fontSize: "0.82rem", fontFamily: "monospace", color: "#000", margin: 0 }}>{p.transferNumber}</p>
                          </div>
                        </div>
                        {p.notes && <p style={{ color: "#374151", fontSize: "0.72rem", background: "#f8fafc", padding: "6px 10px", borderRadius: 8, margin: "0 0 10px" }}>{p.notes}</p>}
                        {p.receiptImage && <img src={p.receiptImage} alt="إيصال" style={{ width: "100%", maxHeight: 180, objectFit: "contain", borderRadius: 10, marginBottom: 10, border: "1px solid #e2e8f0" }} />}
                        {p.status === "pending" && (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => approvePayment(p.id)}
                              style={{ flex: 1, background: "#22c55e", color: "#fff", border: "none", borderRadius: 10, padding: "9px", fontWeight: 800, fontSize: "0.82rem", cursor: "pointer" }}>
                              ✅ تفعيل الاشتراك
                            </button>
                            <button onClick={() => rejectPayment(p.id)}
                              style={{ flex: 1, background: "#f1f5f9", color: "#ef4444", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "9px", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                              ❌ رفض
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* للمستخدمين العاديين */}
                <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: 16, padding: "16px 18px", marginBottom: 20 }}>
                  <h2 style={{ color: "#92400e", fontWeight: 900, fontSize: "1rem", margin: "0 0 8px" }}>💳 كيف تشترك؟</h2>
                  <ol style={{ color: "#78350f", fontSize: "0.82rem", lineHeight: 1.9, margin: 0, paddingRight: 20 }}>
                    <li>اختر خطتك من الخيارات أدناه</li>
                    <li>حوّل المبلغ لحساب الكريمي الخاص بخالد سلمان</li>
                    <li>احتفظ برقم السند وصورة الإيصال</li>
                    <li>اضغط "اشترك الآن" وأرسل التفاصيل</li>
                    <li>سيفعّل خالد اشتراكك فوراً</li>
                  </ol>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {[
                    { icon: Zap,      label: "أسبوعي",  price: "$2.99",  desc: "7 أيام كاملة",   color: "#3b82f6" },
                    { icon: Sparkles, label: "شهري",    price: "$9.99",  desc: "30 يوماً",        color: "#8b5cf6" },
                    { icon: Crown,    label: "سنوي",    price: "$79.99", desc: "365 يوماً",       color: "#f59e0b" },
                    { icon: Building2,label: "مؤسسي",   price: "حسب الطلب", desc: "مدى الحياة",  color: "#000" },
                  ].map((plan, i) => {
                    const Icon = plan.icon;
                    return (
                      <div key={i} style={{ background: "#f8fafc", border: `2px solid ${plan.color}30`, borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${plan.color}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                          <Icon style={{ width: 20, height: 20, color: plan.color }} />
                        </div>
                        <p style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", margin: "0 0 2px" }}>{plan.label}</p>
                        <p style={{ fontSize: "1.1rem", fontWeight: 900, color: plan.color, margin: "0 0 2px" }}>{plan.price}</p>
                        <p style={{ fontSize: "0.68rem", color: "#9ca3af", margin: 0 }}>{plan.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <Link href="/subscribe">
                  <button style={{ width: "100%", background: "#000", color: "#fff", border: "none", borderRadius: 14, padding: "15px", fontWeight: 900, fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxSizing: "border-box" }}>
                    <Crown style={{ width: 20, height: 20 }} />اشترك الآن عبر الكريمي
                  </button>
                </Link>
              </>
            )}
          </div>
        )}

        {/* ═══════════════ TAB: REVIEWS ═══════════════ */}
        {tab === "reviews" && (
          <div style={{ padding: "20px 16px" }}>
            {!reviewSent ? (
              <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: "18px", marginBottom: 20 }}>
                <h2 style={{ fontWeight: 900, fontSize: "1rem", color: "#000", margin: "0 0 14px" }}>✍️ شاركنا رأيك</h2>

                <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setStars(n)}
                      style={{ fontSize: "2rem", cursor: "pointer", background: "none", border: "none", filter: n <= stars ? "none" : "grayscale(1)", opacity: n <= stars ? 1 : 0.3, transition: "all 0.15s" }}>
                      ⭐
                    </button>
                  ))}
                </div>
                <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.78rem", marginBottom: 14 }}>
                  {["", "ضعيف جداً", "ضعيف", "مقبول", "جيد جداً", "ممتاز! 🎉"][stars]}
                </p>

                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="اكتب تقييمك أو اقتراحك هنا..."
                  style={{ width: "100%", background: "#fff", border: "1.5px solid #e2e8f0", color: "#000", padding: "12px 14px", borderRadius: 12, fontSize: "0.9rem", boxSizing: "border-box", fontFamily: "inherit", resize: "none", outline: "none" }}
                />
                <button onClick={handleReviewSubmit} disabled={!reviewComment.trim()}
                  style={{ width: "100%", background: reviewComment.trim() ? "#000" : "#94a3b8", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontWeight: 800, fontSize: "0.9rem", cursor: reviewComment.trim() ? "pointer" : "not-allowed", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxSizing: "border-box" }}>
                  <Send style={{ width: 16, height: 16 }} />إرسال التقييم
                </button>
              </div>
            ) : (
              <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 16, padding: "20px", marginBottom: 20, textAlign: "center" }}>
                <span style={{ fontSize: "2.5rem" }}>🎉</span>
                <p style={{ fontWeight: 900, color: "#166534", fontSize: "1rem", margin: "10px 0 4px" }}>شكراً على تقييمك!</p>
                <p style={{ color: "#15803d", fontSize: "0.8rem", margin: "0 0 12px" }}>رأيك يساعدنا في تحسين المنصة</p>
                <button onClick={() => setReviewSent(false)}
                  style={{ background: "#000", color: "#fff", border: "none", borderRadius: 10, padding: "8px 20px", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}>
                  إضافة تقييم آخر
                </button>
              </div>
            )}

            {reviews.length > 0 && (
              <div>
                <h3 style={{ fontWeight: 900, fontSize: "0.95rem", color: "#000", marginBottom: 12 }}>💬 آراء المستخدمين</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {reviews.map((r, i) => (
                    <div key={i} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: "0.85rem" }}>{"⭐".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</span>
                        <span style={{ color: "#9ca3af", fontSize: "0.65rem" }}>{new Date(r.createdAt).toLocaleDateString("ar-EG")}</span>
                      </div>
                      <p style={{ color: "#374151", fontSize: "0.82rem", margin: 0, lineHeight: 1.5 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reviews.length === 0 && !reviewSent && (
              <div style={{ textAlign: "center", padding: "24px", background: "#f8fafc", borderRadius: 16, color: "#9ca3af" }}>
                <p style={{ fontSize: "1.8rem", margin: "0 0 8px" }}>💬</p>
                <p style={{ fontWeight: 700, margin: 0 }}>كن أول من يقيّم المنصة!</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ TAB: CONTACT ═══════════════ */}
        {tab === "contact" && (
          <div style={{ padding: "20px 16px" }}>
            {/* معلومات التواصل */}
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontWeight: 900, fontSize: "1rem", color: "#000", marginBottom: 14 }}>📞 قنوات التواصل المباشر</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { icon: "📱", label: "واتساب الرئيسي", val: "+967 783 701 365", link: "https://wa.me/967783701365", color: "#22c55e", key: "wa1" },
                  { icon: "📱", label: "واتساب الاحتياطي", val: "+967 779 435 445", link: "https://wa.me/967779435445", color: "#22c55e", key: "wa2" },
                  { icon: "✈️", label: "تيليغرام",        val: "@kshskshg",           link: "https://t.me/kshskshg",    color: "#0088cc", key: "tg" },
                  { icon: "📧", label: "البريد الإلكتروني", val: "khalidsalman7140@gmail.com", link: "mailto:khalidsalman7140@gmail.com", color: "#ea4335", key: "em" },
                ].map(ch => (
                  <div key={ch.key} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{ch.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#6b7280", fontSize: "0.68rem", margin: "0 0 2px", fontWeight: 600 }}>{ch.label}</p>
                      <p style={{ fontWeight: 800, fontSize: "0.88rem", color: "#000", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.val}</p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => copyText(ch.val, ch.key + "c")}
                        style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#000", borderRadius: 8, padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", fontWeight: 700 }}>
                        {copied === ch.key + "c" ? <CheckCheck style={{ width: 12, height: 12, color: "#22c55e" }} /> : <Copy style={{ width: 12, height: 12 }} />}
                      </button>
                      <a href={ch.link} target="_blank" rel="noopener noreferrer"
                        style={{ background: ch.color, color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 700, textDecoration: "none" }}>
                        <ExternalLink style={{ width: 12, height: 12 }} />فتح
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* نموذج الرسالة المباشرة */}
            <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: "18px" }}>
              <h3 style={{ fontWeight: 900, fontSize: "0.95rem", color: "#000", margin: "0 0 14px" }}>
                💬 أرسل رسالة مباشرة لخالد
              </h3>

              {msgSent ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <span style={{ fontSize: "2.5rem" }}>✅</span>
                  <p style={{ fontWeight: 900, color: "#166534", fontSize: "0.95rem", margin: "10px 0 4px" }}>تم إرسال رسالتك!</p>
                  <p style={{ color: "#15803d", fontSize: "0.78rem", margin: "0 0 12px" }}>سيرد عليك خالد على واتساب أو تيليغرام قريباً</p>
                  <button onClick={() => setMsgSent(false)}
                    style={{ background: "#000", color: "#fff", border: "none", borderRadius: 10, padding: "8px 20px", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}>
                    إرسال رسالة أخرى
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input
                    type="text" placeholder="اسمك (اختياري)"
                    value={msgName}
                    onChange={e => setMsgName(e.target.value)}
                    style={{ background: "#fff", border: "1.5px solid #e2e8f0", color: "#000", padding: "11px 14px", borderRadius: 10, fontSize: "0.88rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box", width: "100%" }}
                  />
                  <textarea
                    rows={4} placeholder="اكتب رسالتك هنا... سؤال، اقتراح، طلب تعاون..."
                    value={msgContent}
                    onChange={e => setMsgContent(e.target.value)}
                    style={{ background: "#fff", border: "1.5px solid #e2e8f0", color: "#000", padding: "11px 14px", borderRadius: 10, fontSize: "0.88rem", outline: "none", fontFamily: "inherit", resize: "none", boxSizing: "border-box", width: "100%" }}
                  />
                  <button onClick={handleMsgSubmit} disabled={!msgContent.trim() || msgLoading}
                    style={{ background: msgContent.trim() && !msgLoading ? "#000" : "#94a3b8", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontWeight: 800, fontSize: "0.9rem", cursor: msgContent.trim() && !msgLoading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {msgLoading
                      ? <><span style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "ospin 0.8s linear infinite" }} />جاري الإرسال...</>
                      : <><Send style={{ width: 16, height: 16 }} />إرسال الرسالة</>}
                  </button>
                  <p style={{ color: "#9ca3af", fontSize: "0.7rem", textAlign: "center", margin: 0 }}>
                    ستصل رسالتك مباشرة إلى خالد سلمان — يرد خلال 24 ساعة
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
      <style>{`@keyframes ospin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
