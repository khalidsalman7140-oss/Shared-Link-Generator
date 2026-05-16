import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { useUser } from "@clerk/react";
import {
  BookOpen, Users, Star, MessageCircle, Send, ExternalLink,
  Zap, Crown, Sparkles, Building2, Globe, Brain, Palette, Video,
  GraduationCap, Code2, FileText, Volume2, Search, Shield, Bell,
  BarChart3, Heart, Stethoscope, Car, UtensilsCrossed, AlertTriangle,
  Home, Copy, CheckCheck, RefreshCw, X, ChevronRight, MessageSquare,
  CalendarCheck, Receipt, TrendingUp, Activity, UserCheck, Clock,
  CheckCircle2, XCircle, Filter,
} from "lucide-react";

/* ─────────────────────── types ─────────────────────── */
interface Stats { totalUsers: number; pendingPayments: number; totalConversations: number; totalMessages: number; planDistribution: Record<string,number>; }
interface AdminUser { userId: string; email: string; name: string; imageUrl: string; plan: string; validUntil: string|null; usageToday: number; createdAt: string; }
interface Payment { id: number; userId: string; planRequested: string; status: string; transferNumber: string; notes: string; createdAt: string; receiptImage?: string; }
interface Review { id: number; stars: number; comment: string; createdAt: string; }
interface UserDetail { conversations: {id:number;title:string|null;createdAt:string}[]; payments: Payment[]; bookings: {id:number;serviceTitle:string;status:string;createdAt:string}[]; plan: {plan:string;validUntil:string|null}|null; totalMessages: number; }
interface LiveEvent { pendingCount: number; recentPayments: Payment[]; recentConvs: {id:number;title:string|null;createdAt:string}[]; ts: number; }

/* ─────────────────────── consts ─────────────────────── */
const TABS = [
  { id: "guide",   label: "دليل الشرح",           icon: BookOpen },
  { id: "admin",   label: "لوحة التحكم",           icon: Shield },
  { id: "reviews", label: "التقييمات",             icon: Star },
  { id: "contact", label: "التواصل",               icon: MessageCircle },
] as const;
type TabId = typeof TABS[number]["id"];

const PLAN_COLOR: Record<string,string> = {
  free:"#6b7280", weekly:"#3b82f6", monthly:"#8b5cf6", annual:"#f59e0b", enterprise:"#10b981",
};
const PLAN_AR: Record<string,string> = {
  free:"مجاني", weekly:"أسبوعي", monthly:"شهري", annual:"سنوي", enterprise:"مؤسسي",
};

const AXES = [
  { n:1,  cat:"ذكاء اصطناعي", icon:MessageCircle, color:"#7c3aed", title:"الدردشة الذكية",          desc:"Gemini 2.5 Flash — إجابات لحظية بكل اللغات" },
  { n:2,  cat:"ذكاء اصطناعي", icon:Globe,         color:"#0ea5e9", title:"5 لغات مدعومة",          desc:"عربي، إنجليزي، فرنسي، تركي، إسباني" },
  { n:3,  cat:"إبداع",        icon:Palette,       color:"#f59e0b", title:"توليد صور بالذكاء",      desc:"اكتب وصفاً — احصل على صورة احترافية" },
  { n:4,  cat:"برمجة",        icon:Globe,         color:"#10b981", title:"بناء مواقع مجاناً",      desc:"HTML/CSS/JS — بناء فوري بأمر نصي" },
  { n:5,  cat:"إبداع",        icon:Palette,       color:"#ec4899", title:"تصميم شعارات",           desc:"شعارات SVG احترافية بهوية العلامة التجارية" },
  { n:6,  cat:"كتابة",        icon:FileText,      color:"#8b5cf6", title:"توليد وثائق Word",       desc:"تقارير، خطط، عقود — تحميل DOCX فوري" },
  { n:7,  cat:"تعليم",        icon:BookOpen,      color:"#0d9488", title:"البحث في الكتب",         desc:"آلاف الكتب المجانية بضغطة زر" },
  { n:8,  cat:"تطوير ذاتي",   icon:Brain,         color:"#f97316", title:"تحديد المسار المهني",    desc:"اختبار ذكاء يحدد مسارك المثالي" },
  { n:9,  cat:"صوت",          icon:Volume2,       color:"#3b82f6", title:"تحويل النص لصوت",        desc:"استمع لردود الذكاء الاصطناعي" },
  { n:10, cat:"صوت",          icon:Volume2,       color:"#6366f1", title:"إدخال صوتي",             desc:"تحدث بصوتك — تحويل فوري لنص" },
  { n:11, cat:"إبداع",        icon:Palette,       color:"#d946ef", title:"التصميم المرئي بالذكاء", desc:"عروض احترافية بأمر نصي" },
  { n:12, cat:"أعمال",        icon:BarChart3,     color:"#0891b2", title:"تحليل البيانات",         desc:"Excel وCSV — تحليل فوري" },
  { n:13, cat:"برمجة",        icon:Code2,         color:"#1d4ed8", title:"مساعد البرمجة",          desc:"Python، JS، TS — توليد وتصحيح" },
  { n:14, cat:"تعليم",        icon:GraduationCap, color:"#7c3aed", title:"مشاريع التخرج",          desc:"خطة البحث، التحليل، المراجع" },
  { n:15, cat:"كتابة",        icon:FileText,      color:"#059669", title:"المحتوى التسويقي",       desc:"إعلانات، سوشيال، حملات" },
  { n:16, cat:"إدارة",        icon:Shield,        color:"#dc2626", title:"نظام الاشتراكات",        desc:"مجاني، أسبوعي، شهري، سنوي، مؤسسي" },
  { n:17, cat:"إدارة",        icon:Bell,          color:"#d97706", title:"إشعارات Push",           desc:"تنبيهات فورية للمدير" },
  { n:18, cat:"إدارة",        icon:Users,         color:"#7c3aed", title:"لوحة التحكم",            desc:"إدارة المستخدمين والاشتراكات" },
  { n:19, cat:"أعمال",        icon:Building2,     color:"#0369a1", title:"الاستشارات المؤسسية",    desc:"حلول AI مخصصة للشركات" },
  { n:20, cat:"خدمات",        icon:Heart,         color:"#e11d48", title:"خدمات VIP",              desc:"معالجة أولوية وميزات خاصة" },
  { n:21, cat:"صحة",          icon:Stethoscope,   color:"#0d9488", title:"الصحة والطب",            desc:"استشارات صحية، وصفات، توعية" },
  { n:22, cat:"خدمات",        icon:UtensilsCrossed,color:"#f59e0b",title:"المطاعم والغذاء",        desc:"وصفات، قوائم، طلبات ذكية" },
  { n:23, cat:"خدمات",        icon:Car,           color:"#1e40af", title:"النقل والمواصلات",       desc:"حجوزات وخرائط ذكية" },
  { n:24, cat:"خدمات",        icon:Home,          color:"#0891b2", title:"العقارات الذكية",        desc:"بيع، شراء، إيجار — تحليل السوق" },
  { n:25, cat:"طوارئ",        icon:AlertTriangle, color:"#dc2626", title:"الطوارئ والإسعاف",       desc:"إنذار مبكر وخدمات طوارئ رقمية" },
  { n:26, cat:"تعليم",        icon:GraduationCap, color:"#6d28d9", title:"التعليم الإلكتروني",     desc:"منصة تعلم، اختبارات، شهادات" },
  { n:27, cat:"بحث",          icon:Search,        color:"#0369a1", title:"محرك البحث الذكي",       desc:"بحث في قواعد بيانات متعددة" },
  { n:28, cat:"إبداع",        icon:Video,         color:"#7c3aed", title:"المحتوى المرئي",         desc:"سيناريوهات فيديو وإنتاج رقمي" },
  { n:29, cat:"برمجة",        icon:Code2,         color:"#10b981", title:"تطبيقات الجوال",         desc:"iOS وAndroid — تصميم وبرمجة" },
  { n:30, cat:"أمان",         icon:Shield,        color:"#1d4ed8", title:"الأمن السيبراني",        desc:"حماية البيانات وكشف التهديدات" },
  { n:31, cat:"أعمال",        icon:Building2,     color:"#0891b2", title:"إدارة المشاريع",         desc:"تخطيط، متابعة، تقارير تلقائية" },
  { n:32, cat:"مالية",        icon:BarChart3,     color:"#7c3aed", title:"المحاسبة الذكية",        desc:"فواتير، ميزانيات، تقارير مالية" },
  { n:33, cat:"سوشيال",       icon:Globe,         color:"#0ea5e9", title:"إدارة السوشيال",         desc:"نشر تلقائي وتحليل الأداء" },
  { n:34, cat:"أعمال",        icon:Users,         color:"#059669", title:"CRM ذكي",                desc:"تتبع العملاء والصفقات" },
  { n:35, cat:"قانون",        icon:FileText,      color:"#f97316", title:"العقود والوثائق",        desc:"صياغة عقود واتفاقيات رسمية" },
  { n:36, cat:"تطوير ذاتي",   icon:Brain,         color:"#8b5cf6", title:"التدريب والتطوير",       desc:"خطط تعلم مخصصة ومسارات مهارية" },
  { n:37, cat:"رعاية",        icon:Heart,         color:"#e11d48", title:"الصحة النفسية",          desc:"دعم نفسي، تأمل، استرخاء" },
  { n:38, cat:"صحة",          icon:Stethoscope,   color:"#10b981", title:"الوصفات الطبية",         desc:"مراجعة الأدوية والتفاعلات" },
  { n:39, cat:"تعليم",        icon:GraduationCap, color:"#6366f1", title:"الامتحانات الرقمية",     desc:"أسئلة، تصحيح آلي، شهادات" },
  { n:40, cat:"خدمات",        icon:Car,           color:"#0369a1", title:"تراخيص القيادة",         desc:"اختبارات نظرية وإرشادات المرور" },
  { n:41, cat:"خدمات",        icon:Home,          color:"#d97706", title:"التسجيل العقاري",        desc:"توثيق البيع والشراء رقمياً" },
  { n:42, cat:"حكومية",       icon:Building2,     color:"#dc2626", title:"الضرائب الرقمية",        desc:"حساب ضريبي، إقرارات، استشارات" },
  { n:43, cat:"حكومية",       icon:Shield,        color:"#7c3aed", title:"الخدمات القضائية",       desc:"استشارات قانونية ومتابعة قضايا" },
  { n:44, cat:"أعمال",        icon:Users,         color:"#0891b2", title:"منصة الفريلانسرز",       desc:"سوق عمل محلي يمني" },
  { n:45, cat:"تجارة",        icon:Globe,         color:"#059669", title:"التجارة الإلكترونية",    desc:"متاجر مع بوابات دفع محلية" },
  { n:46, cat:"أمان",         icon:Bell,          color:"#f59e0b", title:"الإنذار المبكر",         desc:"رصد الكوارث والأزمات لحظياً" },
  { n:47, cat:"إعلام",        icon:Volume2,       color:"#3b82f6", title:"الإذاعة الرقمية",        desc:"بودكاست، صوت، بث مباشر" },
  { n:48, cat:"إعلام",        icon:Video,         color:"#8b5cf6", title:"التلفزيون الرقمي",       desc:"بث مرئي وإنتاج احترافي" },
  { n:49, cat:"مجتمع",        icon:Heart,         color:"#e11d48", title:"التبرعات والخيرية",      desc:"جمع تبرعات ومشاريع مجتمعية" },
  { n:50, cat:"ذكاء اصطناعي", icon:Brain,         color:"#7c3aed", title:"الذكاء الاجتماعي",       desc:"تحليل المشاعر والتفاعل الإنساني" },
  { n:51, cat:"برمجة",        icon:Code2,         color:"#1d4ed8", title:"أتمتة العمليات",         desc:"RPA — تشغيل تلقائي للمهام" },
  { n:52, cat:"بيانات",       icon:BarChart3,     color:"#059669", title:"ذكاء الأعمال",           desc:"لوحات تحليلية وقرارات ذكية" },
  { n:53, cat:"اتصالات",      icon:Globe,         color:"#0ea5e9", title:"الترجمة الفورية",        desc:"ترجمة عالية الدقة بين كل اللغات" },
  { n:54, cat:"إبداع",        icon:Palette,       color:"#d946ef", title:"الهوية البصرية الكاملة", desc:"شعار + ألوان + خطوط + دليل العلامة" },
  { n:55, cat:"كتابة",        icon:FileText,      color:"#f97316", title:"السير الذاتية",          desc:"CV احترافي وخطاب تعريف" },
  { n:56, cat:"أعمال",        icon:Building2,     color:"#0369a1", title:"خطط الأعمال",            desc:"دراسة جدوى وتحليل SWOT" },
  { n:57, cat:"تعليم",        icon:GraduationCap, color:"#6d28d9", title:"الدروس الخصوصية",        desc:"مدرس AI في كل المواد" },
  { n:58, cat:"بحث",          icon:Search,        color:"#dc2626", title:"البحث العلمي",           desc:"مراجعة الأدبيات، توثيق APA" },
  { n:59, cat:"صحة",          icon:Heart,         color:"#10b981", title:"اللياقة البدنية",        desc:"خطط تمرين وتغذية مخصصة" },
  { n:60, cat:"مجتمع",        icon:Users,         color:"#f59e0b", title:"الشبكة الاجتماعية",      desc:"التواصل بين المهنيين اليمنيين" },
  { n:61, cat:"برمجة",        icon:Code2,         color:"#8b5cf6", title:"الزراعة الذكية",         desc:"توقعات المناخ وإدارة المحاصيل" },
  { n:62, cat:"أمان",         icon:Shield,        color:"#0891b2", title:"التوثيق الرقمي",         desc:"توثيق العقود بالبلوك تشين" },
  { n:63, cat:"سياحة",        icon:Globe,         color:"#1d4ed8", title:"السياحة الذكية",         desc:"خطط سفر ومرشد سياحي ذكي" },
  { n:64, cat:"حكومية",       icon:Brain,         color:"#7c3aed", title:"البوابة الحكومية الذكية", desc:"خدمات حكومية رقمية لليمن" },
  { n:65, cat:"صحة",          icon:Stethoscope,   color:"#0d9488", title:"الطب عن بُعد",           desc:"استشارة طبية مع أطباء معتمدين" },
  { n:66, cat:"صناعة",        icon:Building2,     color:"#d97706", title:"سلسلة التوريد",          desc:"مخزون ذكي وتتبع الشحنات" },
  { n:67, cat:"طوارئ",        icon:AlertTriangle, color:"#dc2626", title:"إدارة الأزمات",          desc:"غرفة عمليات رقمية للكوارث" },
  { n:68, cat:"مجتمع",        icon:Heart,         color:"#e11d48", title:"ذوو الاحتياجات الخاصة",  desc:"خدمات مخصصة ومتخصصة" },
  { n:69, cat:"مالية",        icon:BarChart3,     color:"#059669", title:"المدفوعات المحلية",      desc:"تكامل مع بنك الكريمي واليمنية" },
  { n:70, cat:"دولي",         icon:Globe,         color:"#0ea5e9", title:"البوابة الدولية",        desc:"خدمة اليمنيين في الخارج رقمياً" },
  { n:71, cat:"ذكاء اصطناعي", icon:Brain,         color:"#6366f1", title:"الذكاء التنبؤي",         desc:"تحليلات مستقبلية وتوقعات ذكية" },
  { n:72, cat:"وطني",         icon:Shield,        color:"#7c3aed", title:"اليمن الرقمي 2030",      desc:"رؤية شاملة: يمن متصل ومزدهر" },
];
const CATS = ["الكل", ...Array.from(new Set(AXES.map(a => a.cat)))];

const ADMIN_EMAIL = "khalidsalman7140@gmail.com";

/* ─── مفكرة عامة مستقلة تحفظ في localStorage ─── */
function GeneralNotepad() {
  const KEY = "ks_admin_general_notepad";
  const [text, setText] = useState(() => localStorage.getItem(KEY) ?? "");
  const [saved, setSaved] = useState(false);
  const save = () => {
    localStorage.setItem(KEY, text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={5}
        placeholder={"أفكاري وخططي القادمة...\n- ميزة جديدة: ...\n- تواصل مع مستخدم X بشأن ...\n- مراجعة الاشتراكات بتاريخ ..."}
        style={{ width: "100%", background: "#fff", border: "1.5px solid #e2e8f0", color: "#000", padding: "10px 13px", borderRadius: 10, fontSize: "0.8rem", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.75, minHeight: 110 }}
      />
      <button
        onClick={save}
        style={{ marginTop: 8, background: saved ? "#22c55e" : "#000", color: "#fff", border: "none", borderRadius: 9, padding: "8px 20px", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer", transition: "background 0.2s" }}>
        {saved ? "✓ تم الحفظ" : "حفظ المفكرة"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function OwnerPortal() {
  const { user } = useUser();
  const isAdmin = user?.emailAddresses?.[0]?.emailAddress === ADMIN_EMAIL;

  const [tab, setTab] = useState<TabId>("guide");
  const [catFilter, setCatFilter] = useState("الكل");

  /* stats */
  const [stats, setStats] = useState<Stats | null>(null);

  /* live alerts */
  const [liveAlert, setLiveAlert] = useState<{ count: number; payments: Payment[] } | null>(null);
  const prevPendingRef = useRef<number | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);

  /* users */
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  /* payments */
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("pending");

  /* selected user */
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /* admin notes per user — persisted in localStorage */
  const [noteText, setNoteText] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const getNoteKey = (uid: string) => `ks_admin_note_${uid}`;
  const loadNote = (uid: string) => localStorage.getItem(getNoteKey(uid)) ?? "";
  const saveNote = (uid: string, text: string) => {
    localStorage.setItem(getNoteKey(uid), text);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  /* reviews */
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stars, setStars] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSent, setReviewSent] = useState(false);

  /* contact */
  const [msgName, setMsgName] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  /* ── fetch stats ── */
  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const r = await fetch("/api/admin/stats");
      if (r.ok) setStats(await r.json() as Stats);
    } catch {}
  }, [isAdmin]);

  /* ── live polling ── */
  const pollLive = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const r = await fetch("/api/admin/live-events");
      if (!r.ok) return;
      const ev = await r.json() as LiveEvent;
      if (prevPendingRef.current !== null && ev.pendingCount > prevPendingRef.current) {
        setLiveAlert({ count: ev.pendingCount, payments: ev.recentPayments });
        setAlertDismissed(false);
      }
      prevPendingRef.current = ev.pendingCount;
    } catch {}
  }, [isAdmin]);

  /* ── fetch users ── */
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    setUsersLoading(true);
    try {
      const r = await fetch("/api/admin/users");
      if (r.ok) setUsers(await r.json() as AdminUser[]);
    } catch {}
    finally { setUsersLoading(false); }
  }, [isAdmin]);

  /* ── fetch payments ── */
  const fetchPayments = useCallback(async () => {
    if (!isAdmin) return;
    setPaymentsLoading(true);
    try {
      const r = await fetch("/api/admin/payments");
      if (r.ok) setPayments(await r.json() as Payment[]);
    } catch {}
    finally { setPaymentsLoading(false); }
  }, [isAdmin]);

  /* ── initial load & intervals ── */
  useEffect(() => {
    if (!isAdmin) return;
    fetchStats();
    fetchUsers();
    fetchPayments();
    // init prevPending
    fetch("/api/admin/live-events")
      .then(r => r.ok ? r.json() : null)
      .then((ev: LiveEvent | null) => { if (ev) prevPendingRef.current = ev.pendingCount; })
      .catch(() => {});
  }, [isAdmin, fetchStats, fetchUsers, fetchPayments]);

  /* ── live poll every 8s ── */
  useEffect(() => {
    if (!isAdmin) return;
    const id = setInterval(pollLive, 8000);
    return () => clearInterval(id);
  }, [isAdmin, pollLive]);

  /* ── stats refresh every 30s ── */
  useEffect(() => {
    if (!isAdmin) return;
    const id = setInterval(() => { fetchStats(); fetchPayments(); }, 30000);
    return () => clearInterval(id);
  }, [isAdmin, fetchStats, fetchPayments]);

  /* ── reviews ── */
  useEffect(() => {
    if (tab !== "reviews") return;
    fetch("/api/ratings")
      .then(r => r.ok ? r.json() : [])
      .then((d: Review[]) => setReviews(Array.isArray(d) ? d.slice(0, 20) : []))
      .catch(() => {});
  }, [tab]);

  /* ── user detail ── */
  const openUserDetail = async (u: AdminUser) => {
    setSelectedUser(u);
    setUserDetail(null);
    setDetailLoading(true);
    setNoteText(loadNote(u.userId));
    setNoteSaved(false);
    try {
      const r = await fetch(`/api/admin/users/${u.userId}/detail`);
      if (r.ok) setUserDetail(await r.json() as UserDetail);
    } catch {}
    finally { setDetailLoading(false); }
  };

  /* ── actions ── */
  const upgradePlan = async (userId: string, plan: string) => {
    await fetch(`/api/admin/users/${userId}/plan`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    fetchUsers();
  };
  const blockUser = async (userId: string) => {
    await fetch(`/api/admin/users/${userId}/block`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Blocked by admin" }),
    });
    fetchUsers();
  };
  const approvePayment = async (id: number) => {
    await fetch(`/api/admin/payments/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });
    fetchPayments(); fetchStats();
  };
  const rejectPayment = async (id: number) => {
    await fetch(`/api/admin/payments/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    });
    fetchPayments(); fetchStats();
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(null), 2000); }).catch(() => {});
  };
  const handleReview = async () => {
    if (!reviewComment.trim()) return;
    await fetch("/api/ratings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stars, comment: reviewComment }) }).catch(() => {});
    setReviewSent(true); setReviewComment("");
  };
  const handleMsg = async () => {
    if (!msgContent.trim()) return;
    setMsgLoading(true);
    try {
      await fetch("/api/payments/request", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planRequested: "message", transferNumber: "0", receiptImage: "", notes: `[رسالة مباشرة من: ${msgName || "زائر"}] ${msgContent}`, transferService: "direct_message" }),
      }).catch(() => {});
      setMsgSent(true); setMsgContent(""); setMsgName("");
    } finally { setMsgLoading(false); }
  };

  /* ── filtered data ── */
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchPlan = planFilter === "all" || (planFilter === "paid" ? u.plan !== "free" : u.plan === planFilter);
    return matchQ && matchPlan;
  });
  const filteredPayments = payments.filter(p => {
    const q = paymentSearch.toLowerCase();
    const matchQ = !q || p.transferNumber.includes(q) || p.planRequested.includes(q) || p.userId.toLowerCase().includes(q);
    const matchStatus = paymentTypeFilter === "all" || p.status === paymentTypeFilter;
    return matchQ && matchStatus;
  });
  const filteredAxes = catFilter === "الكل" ? AXES : AXES.filter(a => a.cat === catFilter);

  /* ── color helpers ── */
  const planBadge = (plan: string) => (
    <span style={{ background: `${PLAN_COLOR[plan] ?? "#6b7280"}18`, color: PLAN_COLOR[plan] ?? "#6b7280", border: `1px solid ${PLAN_COLOR[plan] ?? "#6b7280"}40`, borderRadius: 20, padding: "2px 10px", fontSize: "0.68rem", fontWeight: 800 }}>
      {PLAN_AR[plan] ?? plan}
    </span>
  );

  /* ══════════════════════════ RENDER ══════════════════════════ */
  return (
    <div style={{ background: "#fff", minHeight: "100vh", color: "#000", fontFamily: "'Cairo','Tajawal',sans-serif" }} dir="rtl">

      {/* ── sticky header ── */}
      <div style={{ background: "linear-gradient(135deg,#000 0%,#1a1a2e 100%)", padding: "20px 16px 0", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Link href="/chat">
              <button style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: 34, height: 34, borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </Link>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#ea580c)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.4rem" }}>👑</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ color: "#fff", fontWeight: 900, fontSize: "1.1rem", margin: 0 }}>بوابة خالد سلمان</h1>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.7rem", margin: "2px 0 0" }}>دليل الشرح — التحكم — التقييمات — التواصل</p>
            </div>
            {isAdmin && (
              <button onClick={() => { fetchStats(); fetchUsers(); fetchPayments(); }}
                style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)", color: "#f59e0b", borderRadius: 8, padding: "6px 12px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <RefreshCw style={{ width: 12, height: 12 }} />تحديث
              </button>
            )}
          </div>
          {/* tabs */}
          <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 1 }}>
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ background: active ? "#f59e0b" : "rgba(255,255,255,0.07)", color: active ? "#000" : "rgba(255,255,255,0.7)", border: active ? "none" : "1px solid rgba(255,255,255,0.12)", borderRadius: "10px 10px 0 0", padding: "9px 16px", fontSize: "0.77rem", fontWeight: active ? 800 : 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0 }}>
                  <Icon style={{ width: 13, height: 13 }} />{t.label}
                  {t.id === "admin" && isAdmin && (stats?.pendingPayments ?? 0) > 0 && (
                    <span style={{ background: "#ef4444", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: "0.6rem", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{stats!.pendingPayments}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 0 60px" }}>

        {/* ══ LIVE ALERT BANNER ══ */}
        {isAdmin && liveAlert && !alertDismissed && (
          <div style={{ background: "#fef2f2", border: "2px solid #ef4444", borderRadius: "0 0 16px 16px", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, animation: "ks-pulse 1s ease-in-out 3" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", flexShrink: 0, animation: "ks-blink 1s infinite" }} />
            <div style={{ flex: 1 }}>
              <p style={{ color: "#991b1b", fontWeight: 900, fontSize: "0.88rem", margin: 0 }}>
                🔴 تنبيه لحظي — {liveAlert.count} طلب دفع جديد بانتظار المراجعة
              </p>
              {liveAlert.payments[0] && (
                <p style={{ color: "#dc2626", fontSize: "0.72rem", margin: "2px 0 0" }}>
                  آخر طلب: خطة {PLAN_AR[liveAlert.payments[0].planRequested] ?? liveAlert.payments[0].planRequested} — سند #{liveAlert.payments[0].transferNumber}
                </p>
              )}
            </div>
            <button onClick={() => { setTab("admin"); setPaymentTypeFilter("pending"); setAlertDismissed(true); }}
              style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer" }}>
              مراجعة الآن
            </button>
            <button onClick={() => setAlertDismissed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4 }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        )}

        {/* ══════════ TAB: GUIDE ══════════ */}
        {tab === "guide" && (
          <div style={{ padding: "20px 16px" }}>
            <div style={{ background: "linear-gradient(135deg,#fffbeb,#fef3c7)", border: "2px solid #f59e0b", borderRadius: 16, padding: "16px 18px", marginBottom: 20 }}>
              <h2 style={{ color: "#92400e", fontWeight: 900, fontSize: "1rem", margin: "0 0 8px" }}>🎯 كيف تستخدم يمن شات؟</h2>
              <p style={{ color: "#78350f", fontSize: "0.82rem", lineHeight: 1.75, margin: 0 }}>
                يمن شات هو وكيل ذكاء اصطناعي متكامل يضم <strong>72 خدمة ومحوراً</strong>. اكتب طلبك بالعربي أو أي لغة، وسيفهم الوكيل ويستجيب فوراً. يمكنك رفع صور، بناء مواقع، توليد شعارات، وتحميل وثائق Word — كل ذلك من خانة الدردشة.
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 900, fontSize: "0.92rem", color: "#000", marginBottom: 10 }}>⚡ جرب هذه الأوامر في الدردشة:</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { cmd: "صمم موقع لمطعمي", icon: "🌐" },
                  { cmd: "صمم شعار لمشروعي", icon: "🎨" },
                  { cmd: "ابحث عن كتب الذكاء الاصطناعي", icon: "📚" },
                  { cmd: "اكتب تقريراً عن اليمن", icon: "📝" },
                  { cmd: "حدد مساري المهني", icon: "🧭" },
                  { cmd: "ترجم هذا النص للإنجليزي", icon: "🌍" },
                  { cmd: "اشرح البلوك تشين ببساطة", icon: "💡" },
                  { cmd: "اكتب كود Python لحساب المرتبات", icon: "💻" },
                ].map((ex, i) => (
                  <Link href="/chat" key={i}>
                    <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 11, padding: "9px 12px", cursor: "pointer", fontSize: "0.77rem", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ flexShrink: 0 }}>{ex.icon}</span>{ex.cmd}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* category filter */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 14 }}>
              {CATS.map(cat => (
                <button key={cat} onClick={() => setCatFilter(cat)}
                  style={{ background: catFilter === cat ? "#000" : "#f1f5f9", color: catFilter === cat ? "#fff" : "#374151", border: catFilter === cat ? "none" : "1.5px solid #e2e8f0", borderRadius: 20, padding: "5px 13px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
              {filteredAxes.map(ax => {
                const Icon = ax.icon;
                return (
                  <div key={ax.n} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 13, padding: "11px 11px 9px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, right: 0, width: 36, height: 36, background: ax.color, opacity: 0.07, borderRadius: "0 0 0 36px" }} />
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 7, background: `${ax.color}15`, border: `1.5px solid ${ax.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon style={{ width: 15, height: 15, color: ax.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 5, marginBottom: 3, flexWrap: "wrap" }}>
                          <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: "0.58rem", fontWeight: 700, padding: "1px 5px", borderRadius: 5 }}>#{ax.n}</span>
                          <span style={{ background: `${ax.color}15`, color: ax.color, fontSize: "0.57rem", fontWeight: 700, padding: "1px 5px", borderRadius: 5 }}>{ax.cat}</span>
                        </div>
                        <p style={{ fontWeight: 800, fontSize: "0.78rem", color: "#000", margin: "0 0 2px", lineHeight: 1.3 }}>{ax.title}</p>
                        <p style={{ fontSize: "0.66rem", color: "#6b7280", margin: 0, lineHeight: 1.4 }}>{ax.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: "center", marginTop: 18 }}>
              <Link href="/vision">
                <button style={{ background: "#000", color: "#fff", border: "none", borderRadius: 12, padding: "11px 26px", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <ExternalLink style={{ width: 15, height: 15 }} />عرض خارطة الرؤية الكاملة
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ══════════ TAB: ADMIN ══════════ */}
        {tab === "admin" && (
          <div style={{ padding: "16px 16px" }}>
            {!isAdmin ? (
              /* ─── non-admin: subscription plans ─── */
              <>
                <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: 16, padding: "16px 18px", marginBottom: 20 }}>
                  <h2 style={{ color: "#92400e", fontWeight: 900, fontSize: "0.95rem", margin: "0 0 8px" }}>💳 كيف تشترك؟</h2>
                  <ol style={{ color: "#78350f", fontSize: "0.8rem", lineHeight: 1.9, margin: 0, paddingRight: 20 }}>
                    <li>اختر خطتك من الخيارات أدناه</li>
                    <li>حوّل المبلغ لحساب الكريمي الخاص بخالد سلمان</li>
                    <li>احتفظ برقم السند وصورة الإيصال</li>
                    <li>اضغط "اشترك الآن" وأرسل التفاصيل</li>
                    <li>سيفعّل خالد اشتراكك فوراً</li>
                  </ol>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  {[
                    { icon: Zap,      label: "أسبوعي",  price: "$2.99",  color: "#3b82f6" },
                    { icon: Sparkles, label: "شهري",    price: "$9.99",  color: "#8b5cf6" },
                    { icon: Crown,    label: "سنوي",    price: "$79.99", color: "#f59e0b" },
                    { icon: Building2,label: "مؤسسي",   price: "حسب الطلب",color:"#000" },
                  ].map((p, i) => {
                    const Icon = p.icon;
                    return (
                      <div key={i} style={{ background: "#f8fafc", border: `2px solid ${p.color}30`, borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${p.color}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 7px" }}>
                          <Icon style={{ width: 18, height: 18, color: p.color }} />
                        </div>
                        <p style={{ fontWeight: 900, fontSize: "0.88rem", color: "#000", margin: "0 0 2px" }}>{p.label}</p>
                        <p style={{ fontSize: "1rem", fontWeight: 900, color: p.color, margin: 0 }}>{p.price}</p>
                      </div>
                    );
                  })}
                </div>
                <Link href="/subscribe">
                  <button style={{ width: "100%", background: "#000", color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontWeight: 900, fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxSizing: "border-box" }}>
                    <Crown style={{ width: 18, height: 18 }} />اشترك الآن عبر الكريمي
                  </button>
                </Link>
              </>
            ) : (
              /* ─── admin view ─── */
              <>
                {/* ┌─ Analytics Cards ─┐ */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "المستخدمون النشطون", val: stats?.totalUsers ?? "—", icon: Users,      color: "#7c3aed", bg: "#f5f3ff" },
                    { label: "طلبات معلقة",         val: stats?.pendingPayments ?? "—", icon: Clock, color: "#ef4444", bg: "#fef2f2" },
                    { label: "المحادثات الكاملة",    val: stats?.totalConversations ?? "—", icon: TrendingUp, color: "#059669", bg: "#f0fdf4" },
                  ].map((c, i) => {
                    const Icon = c.icon;
                    return (
                      <div key={i} style={{ background: c.bg, border: `1.5px solid ${c.color}25`, borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${c.color}18`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                          <Icon style={{ width: 18, height: 18, color: c.color }} />
                        </div>
                        <p style={{ fontWeight: 900, fontSize: "1.5rem", color: c.color, margin: "0 0 2px", lineHeight: 1 }}>{c.val}</p>
                        <p style={{ fontSize: "0.65rem", color: "#6b7280", margin: 0, fontWeight: 600 }}>{c.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* ┌─ sub-tabs: users / payments ─┐ */}
                <div style={{ display: "flex", gap: 0, marginBottom: 16, border: "1.5px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                  {([["users","المستخدمون", Users], ["payments","المدفوعات", Receipt]] as const).map(([id, label, Icon]) => (
                    <button key={id} onClick={() => {}}
                      id={`subtab-${id}`}
                      style={{ flex: 1, background: "none", border: "none", padding: "10px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#374151" }}>
                      <Icon style={{ width: 14, height: 14 }} />{label}
                    </button>
                  ))}
                </div>

                {/* ── USERS LIST ── */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
                      <Search style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9ca3af" }} />
                      <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                        placeholder="بحث بالاسم أو البريد..."
                        style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "9px 34px 9px 12px", borderRadius: 10, fontSize: "0.82rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                    </div>
                    <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
                      style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "9px 12px", borderRadius: 10, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", outline: "none", fontFamily: "inherit" }}>
                      <option value="all">كل الخطط</option>
                      <option value="free">مجاني فقط</option>
                      <option value="paid">مدفوع فقط</option>
                      <option value="weekly">أسبوعي</option>
                      <option value="monthly">شهري</option>
                      <option value="annual">سنوي</option>
                      <option value="enterprise">مؤسسي</option>
                    </select>
                  </div>
                  {usersLoading ? (
                    <div style={{ textAlign: "center", padding: 30, color: "#9ca3af", fontSize: "0.85rem" }}>جاري تحميل المستخدمين...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 30, background: "#f8fafc", borderRadius: 14, color: "#9ca3af" }}>
                      <Users style={{ width: 32, height: 32, margin: "0 auto 8px", display: "block" }} />
                      <p style={{ fontWeight: 700, margin: 0, fontSize: "0.85rem" }}>لا توجد نتائج</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {filteredUsers.map(u => (
                        <div key={u.userId}
                          onClick={() => openUserDetail(u)}
                          style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 13, padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "border-color 0.15s" }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = "#7c3aed")}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = "#e2e8f0")}>
                          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#f1f5f9", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#7c3aed", fontSize: "1rem" }}>
                            {u.imageUrl ? <img src={u.imageUrl} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (u.name[0] ?? "؟")}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 800, fontSize: "0.85rem", color: "#000", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name || "—"}</p>
                            <p style={{ fontSize: "0.68rem", color: "#9ca3af", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</p>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                            {planBadge(u.plan)}
                            <span style={{ fontSize: "0.62rem", color: "#9ca3af" }}>{u.usageToday} رسالة اليوم</span>
                          </div>
                          <Activity style={{ width: 14, height: 14, color: "#d1d5db", flexShrink: 0 }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── PAYMENTS LIST ── */}
                <div>
                  <h3 style={{ fontWeight: 900, fontSize: "0.92rem", color: "#000", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <Receipt style={{ width: 16, height: 16, color: "#f59e0b" }} />طلبات الدفع
                    {stats?.pendingPayments ? <span style={{ background: "#ef4444", color: "#fff", borderRadius: 20, padding: "1px 8px", fontSize: "0.68rem", fontWeight: 900 }}>{stats.pendingPayments} معلق</span> : null}
                  </h3>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
                      <Search style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#9ca3af" }} />
                      <input value={paymentSearch} onChange={e => setPaymentSearch(e.target.value)}
                        placeholder="بحث برقم السند أو الخطة..."
                        style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "9px 32px 9px 12px", borderRadius: 10, fontSize: "0.8rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                    </div>
                    <select value={paymentTypeFilter} onChange={e => setPaymentTypeFilter(e.target.value)}
                      style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "9px 12px", borderRadius: 10, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", outline: "none", fontFamily: "inherit" }}>
                      <option value="pending">معلقة فقط</option>
                      <option value="all">الكل</option>
                      <option value="approved">مُفعَّلة</option>
                      <option value="rejected">مرفوضة</option>
                    </select>
                  </div>
                  {paymentsLoading ? (
                    <div style={{ textAlign: "center", padding: 24, color: "#9ca3af", fontSize: "0.82rem" }}>جاري التحميل...</div>
                  ) : filteredPayments.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 24, background: "#f8fafc", borderRadius: 14, color: "#9ca3af" }}>
                      <p style={{ fontSize: "1.6rem", margin: "0 0 6px" }}>📭</p>
                      <p style={{ fontWeight: 700, margin: 0, fontSize: "0.82rem" }}>لا توجد طلبات دفع</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {filteredPayments.map(p => (
                        <div key={p.id} style={{ background: "#fff", border: `2px solid ${p.status==="approved"?"#22c55e":p.status==="rejected"?"#ef4444":"#f59e0b"}`, borderRadius: 14, padding: "13px 14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ background: p.status==="approved"?"#f0fdf4":p.status==="rejected"?"#fef2f2":"#fffbeb", color: p.status==="approved"?"#166534":p.status==="rejected"?"#991b1b":"#92400e", border: `1px solid ${p.status==="approved"?"#bbf7d0":p.status==="rejected"?"#fca5a5":"#fcd34d"}`, borderRadius: 8, padding: "2px 10px", fontSize: "0.7rem", fontWeight: 800 }}>
                              {p.status==="approved"?"✅ مُفعَّل":p.status==="rejected"?"❌ مرفوض":"⏳ بانتظار المراجعة"}
                            </span>
                            <span style={{ color: "#9ca3af", fontSize: "0.65rem" }}>{new Date(p.createdAt).toLocaleDateString("ar-EG")}</span>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: p.status==="pending"?10:0 }}>
                            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "7px 10px" }}>
                              <p style={{ color: "#9ca3af", fontSize: "0.6rem", margin: "0 0 1px", fontWeight: 600 }}>الخطة</p>
                              <p style={{ fontWeight: 800, fontSize: "0.8rem", color: "#000", margin: 0 }}>{PLAN_AR[p.planRequested] ?? p.planRequested}</p>
                            </div>
                            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "7px 10px" }}>
                              <p style={{ color: "#9ca3af", fontSize: "0.6rem", margin: "0 0 1px", fontWeight: 600 }}>رقم السند</p>
                              <p style={{ fontWeight: 800, fontSize: "0.8rem", fontFamily: "monospace", color: "#000", margin: 0 }}>{p.transferNumber}</p>
                            </div>
                          </div>
                          {p.notes && p.notes !== "0" && p.planRequested !== "message" && (
                            <p style={{ color: "#374151", fontSize: "0.7rem", background: "#f8fafc", padding: "5px 9px", borderRadius: 7, margin: "0 0 8px" }}>{p.notes}</p>
                          )}
                          {p.receiptImage && p.receiptImage.length > 10 && (
                            <img src={p.receiptImage} alt="إيصال" style={{ width: "100%", maxHeight: 160, objectFit: "contain", borderRadius: 9, marginBottom: 8, border: "1px solid #e2e8f0" }} />
                          )}
                          {p.status === "pending" && (
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => approvePayment(p.id)}
                                style={{ flex: 1, background: "#22c55e", color: "#fff", border: "none", borderRadius: 9, padding: "8px", fontWeight: 800, fontSize: "0.8rem", cursor: "pointer" }}>
                                ✅ تفعيل
                              </button>
                              <button onClick={() => rejectPayment(p.id)}
                                style={{ flex: 1, background: "#f1f5f9", color: "#ef4444", border: "1.5px solid #fca5a5", borderRadius: 9, padding: "8px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>
                                ❌ رفض
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ══ FUTURE DEVELOPMENT SLOTS ══ */}
                <div style={{ marginTop: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                    <span style={{ color: "#9ca3af", fontSize: "0.72rem", fontWeight: 800, whiteSpace: "nowrap", letterSpacing: "0.05em" }}>🚀 خانات التطوير المستقبلي</span>
                    <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    {[
                      { icon: "📊", title: "تحليلات متقدمة",      desc: "رسوم بيانية تفاعلية للإيرادات والنشاط اليومي", color: "#7c3aed" },
                      { icon: "🤖", title: "مساعد القرار الذكي",   desc: "توصيات آلية بترقية المستخدمين أو تجديد عروضهم", color: "#0891b2" },
                      { icon: "📧", title: "إشعارات البريد",       desc: "إرسال تلقائي لإيميل التفعيل عند قبول الطلب",   color: "#059669" },
                      { icon: "🏷️", title: "أكواد الخصم",         desc: "توليد كوبونات خصم لحملات التسويق",             color: "#d97706" },
                      { icon: "📅", title: "جدول المواعيد",        desc: "تقويم مدمج لمتابعة طلبات التصميم والتسليم",    color: "#dc2626" },
                      { icon: "💬", title: "رسائل مباشرة",        desc: "دردشة فورية بين خالد وكل مستخدم داخل اللوحة",  color: "#f59e0b" },
                    ].map((slot, i) => (
                      <div key={i} style={{ background: "#fafafa", border: "2px dashed #d1d5db", borderRadius: 13, padding: "13px 12px", position: "relative" }}>
                        <div style={{ position: "absolute", top: 8, left: 8, background: "#f1f5f9", color: "#9ca3af", fontSize: "0.55rem", fontWeight: 800, padding: "2px 7px", borderRadius: 20, letterSpacing: "0.06em" }}>
                          قريباً
                        </div>
                        <div style={{ display: "flex", gap: 9, marginTop: 8 }}>
                          <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{slot.icon}</span>
                          <div>
                            <p style={{ fontWeight: 800, fontSize: "0.78rem", color: slot.color, margin: "0 0 3px" }}>{slot.title}</p>
                            <p style={{ fontSize: "0.65rem", color: "#9ca3af", margin: 0, lineHeight: 1.4 }}>{slot.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* admin notepad — general */}
                  <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "14px" }}>
                    <p style={{ fontWeight: 900, fontSize: "0.85rem", color: "#000", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 7 }}>
                      🗒️ دفتر ملاحظاتي العام
                      <span style={{ fontSize: "0.6rem", color: "#9ca3af", fontWeight: 600, marginRight: "auto" }}>تُحفظ في جهازك</span>
                    </p>
                    <GeneralNotepad />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════ TAB: REVIEWS ══════════ */}
        {tab === "reviews" && (
          <div style={{ padding: "20px 16px" }}>
            {!reviewSent ? (
              <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: "18px", marginBottom: 20 }}>
                <h2 style={{ fontWeight: 900, fontSize: "0.95rem", color: "#000", margin: "0 0 14px" }}>✍️ شاركنا رأيك</h2>
                <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 12 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setStars(n)}
                      style={{ fontSize: "1.9rem", cursor: "pointer", background: "none", border: "none", filter: n<=stars?"none":"grayscale(1)", opacity: n<=stars?1:0.3 }}>⭐</button>
                  ))}
                </div>
                <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.75rem", marginBottom: 12 }}>
                  {["","ضعيف جداً","ضعيف","مقبول","جيد جداً","ممتاز! 🎉"][stars]}
                </p>
                <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={3}
                  placeholder="اكتب رأيك أو اقتراحك..."
                  style={{ width: "100%", background: "#fff", border: "1.5px solid #e2e8f0", color: "#000", padding: "11px 13px", borderRadius: 11, fontSize: "0.88rem", boxSizing: "border-box", fontFamily: "inherit", resize: "none", outline: "none" }} />
                <button onClick={handleReview} disabled={!reviewComment.trim()}
                  style={{ width: "100%", background: reviewComment.trim()?"#000":"#94a3b8", color: "#fff", border: "none", borderRadius: 11, padding: "12px", fontWeight: 800, fontSize: "0.88rem", cursor: reviewComment.trim()?"pointer":"not-allowed", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Send style={{ width: 15, height: 15 }} />إرسال التقييم
                </button>
              </div>
            ) : (
              <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 16, padding: "20px", marginBottom: 20, textAlign: "center" }}>
                <span style={{ fontSize: "2.2rem" }}>🎉</span>
                <p style={{ fontWeight: 900, color: "#166534", fontSize: "0.95rem", margin: "8px 0 4px" }}>شكراً على تقييمك!</p>
                <button onClick={() => setReviewSent(false)}
                  style={{ background: "#000", color: "#fff", border: "none", borderRadius: 9, padding: "7px 18px", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", marginTop: 8 }}>
                  إضافة تقييم آخر
                </button>
              </div>
            )}
            {reviews.length > 0 && (
              <div>
                <h3 style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", marginBottom: 10 }}>💬 آراء المستخدمين</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {reviews.map((r, i) => (
                    <div key={i} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "11px 13px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: "0.82rem" }}>{"⭐".repeat(r.stars)}{"☆".repeat(5-r.stars)}</span>
                        <span style={{ color: "#9ca3af", fontSize: "0.62rem" }}>{new Date(r.createdAt).toLocaleDateString("ar-EG")}</span>
                      </div>
                      <p style={{ color: "#374151", fontSize: "0.8rem", margin: 0, lineHeight: 1.5 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════ TAB: CONTACT ══════════ */}
        {tab === "contact" && (
          <div style={{ padding: "20px 16px" }}>
            <h2 style={{ fontWeight: 900, fontSize: "0.95rem", color: "#000", marginBottom: 14 }}>📞 قنوات التواصل المباشر</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
              {[
                { icon:"📱", label:"واتساب الرئيسي",  val:"+967 783 701 365", link:"https://wa.me/967783701365",       color:"#22c55e", key:"w1" },
                { icon:"📱", label:"واتساب الاحتياطي", val:"+967 779 435 445", link:"https://wa.me/967779435445",       color:"#22c55e", key:"w2" },
                { icon:"✈️", label:"تيليغرام",         val:"@kshskshg",        link:"https://t.me/kshskshg",           color:"#0088cc", key:"tg" },
                { icon:"📧", label:"البريد",           val:"khalidsalman7140@gmail.com", link:"mailto:khalidsalman7140@gmail.com", color:"#ea4335", key:"em" },
              ].map(ch => (
                <div key={ch.key} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 13, padding: "11px 13px", display: "flex", alignItems: "center", gap: 11 }}>
                  <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{ch.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#9ca3af", fontSize: "0.65rem", margin: "0 0 1px", fontWeight: 600 }}>{ch.label}</p>
                    <p style={{ fontWeight: 800, fontSize: "0.84rem", color: "#000", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.val}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => copyText(ch.val, ch.key+"c")}
                      style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#000", borderRadius: 7, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                      {copied===ch.key+"c" ? <CheckCheck style={{ width: 12, height: 12, color: "#22c55e" }} /> : <Copy style={{ width: 12, height: 12 }} />}
                    </button>
                    <a href={ch.link} target="_blank" rel="noopener noreferrer"
                      style={{ background: ch.color, color: "#fff", borderRadius: 7, padding: "5px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", fontWeight: 700, textDecoration: "none" }}>
                      <ExternalLink style={{ width: 11, height: 11 }} />فتح
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 15, padding: "17px" }}>
              <h3 style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", margin: "0 0 13px" }}>💬 أرسل رسالة مباشرة</h3>
              {msgSent ? (
                <div style={{ textAlign: "center", padding: "18px" }}>
                  <span style={{ fontSize: "2.2rem" }}>✅</span>
                  <p style={{ fontWeight: 900, color: "#166534", margin: "8px 0 4px", fontSize: "0.9rem" }}>تم إرسال رسالتك!</p>
                  <button onClick={() => setMsgSent(false)}
                    style={{ background: "#000", color: "#fff", border: "none", borderRadius: 9, padding: "7px 18px", fontWeight: 700, cursor: "pointer", fontSize: "0.78rem", marginTop: 8 }}>
                    إرسال رسالة أخرى
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input type="text" placeholder="اسمك (اختياري)" value={msgName} onChange={e => setMsgName(e.target.value)}
                    style={{ background: "#fff", border: "1.5px solid #e2e8f0", color: "#000", padding: "10px 13px", borderRadius: 10, fontSize: "0.86rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box", width: "100%" }} />
                  <textarea rows={4} placeholder="رسالتك... سؤال، اقتراح، طلب تعاون" value={msgContent} onChange={e => setMsgContent(e.target.value)}
                    style={{ background: "#fff", border: "1.5px solid #e2e8f0", color: "#000", padding: "10px 13px", borderRadius: 10, fontSize: "0.86rem", outline: "none", fontFamily: "inherit", resize: "none", boxSizing: "border-box", width: "100%" }} />
                  <button onClick={handleMsg} disabled={!msgContent.trim()||msgLoading}
                    style={{ background: msgContent.trim()&&!msgLoading?"#000":"#94a3b8", color: "#fff", border: "none", borderRadius: 11, padding: "12px", fontWeight: 800, fontSize: "0.88rem", cursor: msgContent.trim()&&!msgLoading?"pointer":"not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {msgLoading
                      ? <><span style={{ width:15,height:15,border:"2px solid #fff",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"ospin 0.8s linear infinite" }}/>جاري الإرسال...</>
                      : <><Send style={{ width:15,height:15 }}/>إرسال الرسالة</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ══ USER DETAIL PANEL (slide-over) ══ */}
      {selectedUser && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.4)" }} onClick={() => { setSelectedUser(null); setUserDetail(null); }} />
          <div style={{ width: "min(480px, 100vw)", background: "#fff", height: "100%", overflowY: "auto", boxShadow: "-4px 0 30px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }} dir="rtl">

            {/* panel header */}
            <div style={{ background: "#000", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#1a1a2e", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#f59e0b", fontSize: "1.1rem", flexShrink: 0 }}>
                {selectedUser.imageUrl ? <img src={selectedUser.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (selectedUser.name[0] ?? "؟")}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#fff", fontWeight: 900, fontSize: "0.95rem", margin: 0 }}>{selectedUser.name || "—"}</p>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.68rem", margin: "2px 0 0" }}>{selectedUser.email}</p>
              </div>
              <button onClick={() => { setSelectedUser(null); setUserDetail(null); }}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            <div style={{ padding: "16px" }}>
              {/* plan + controls */}
              <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "14px", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <p style={{ fontWeight: 900, fontSize: "0.88rem", color: "#000", margin: 0 }}>الخطة الحالية</p>
                  {planBadge(selectedUser.plan)}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["free","weekly","monthly","annual","enterprise"].map(pl => (
                    <button key={pl} onClick={() => { upgradePlan(selectedUser.userId, pl); setSelectedUser({...selectedUser, plan: pl}); }}
                      style={{ background: selectedUser.plan===pl?"#000":"#f1f5f9", color: selectedUser.plan===pl?"#fff":"#374151", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "5px 10px", fontSize: "0.68rem", fontWeight: 700, cursor: "pointer" }}>
                      {PLAN_AR[pl]}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #e2e8f0" }}>
                  <button onClick={() => blockUser(selectedUser.userId)}
                    style={{ background: "#fef2f2", color: "#ef4444", border: "1.5px solid #fca5a5", borderRadius: 9, padding: "7px 14px", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>
                    🚫 تجميد الحساب / رفع التجميد
                  </button>
                </div>
              </div>

              {detailLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>جاري تحميل بيانات المستخدم...</div>
              ) : userDetail ? (
                <>
                  {/* stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                    {[
                      { label: "المحادثات",  val: userDetail.conversations.length, color: "#7c3aed" },
                      { label: "الرسائل",    val: userDetail.totalMessages,         color: "#3b82f6" },
                      { label: "الحجوزات",   val: userDetail.bookings.length,       color: "#10b981" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: `${s.color}08`, border: `1.5px solid ${s.color}20`, borderRadius: 11, padding: "10px", textAlign: "center" }}>
                        <p style={{ fontWeight: 900, fontSize: "1.3rem", color: s.color, margin: "0 0 2px" }}>{s.val}</p>
                        <p style={{ fontSize: "0.62rem", color: "#6b7280", margin: 0, fontWeight: 600 }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* conversations */}
                  {userDetail.conversations.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ fontWeight: 900, fontSize: "0.85rem", color: "#000", marginBottom: 8 }}>
                        <MessageSquare style={{ width: 14, height: 14, display: "inline", marginLeft: 5 }} />المحادثات ({userDetail.conversations.length})
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 180, overflowY: "auto" }}>
                        {userDetail.conversations.map(c => (
                          <div key={c.id} style={{ background: "#f8fafc", borderRadius: 9, padding: "7px 11px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                            <p style={{ fontSize: "0.75rem", color: "#374151", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{c.title || "محادثة جديدة"}</p>
                            <span style={{ color: "#9ca3af", fontSize: "0.6rem", flexShrink: 0 }}>{new Date(c.createdAt).toLocaleDateString("ar-EG")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* payments */}
                  {userDetail.payments.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ fontWeight: 900, fontSize: "0.85rem", color: "#000", marginBottom: 8 }}>
                        <Receipt style={{ width: 14, height: 14, display: "inline", marginLeft: 5 }} />طلبات الدفع ({userDetail.payments.length})
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {userDetail.payments.map(p => (
                          <div key={p.id} style={{ background: "#f8fafc", borderRadius: 9, padding: "8px 11px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#000", margin: "0 0 1px" }}>{PLAN_AR[p.planRequested] ?? p.planRequested} — سند #{p.transferNumber}</p>
                              <p style={{ fontSize: "0.62rem", color: "#9ca3af", margin: 0 }}>{new Date(p.createdAt).toLocaleDateString("ar-EG")}</p>
                            </div>
                            <span style={{ color: p.status==="approved"?"#22c55e":p.status==="rejected"?"#ef4444":"#f59e0b", fontSize: "0.7rem", fontWeight: 800 }}>
                              {p.status==="approved"?"✅":p.status==="rejected"?"❌":"⏳"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* bookings */}
                  {userDetail.bookings.length > 0 && (
                    <div>
                      <p style={{ fontWeight: 900, fontSize: "0.85rem", color: "#000", marginBottom: 8 }}>
                        <CalendarCheck style={{ width: 14, height: 14, display: "inline", marginLeft: 5 }} />الحجوزات ({userDetail.bookings.length})
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {userDetail.bookings.map(b => (
                          <div key={b.id} style={{ background: "#f8fafc", borderRadius: 9, padding: "7px 11px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <p style={{ fontSize: "0.75rem", color: "#374151", margin: 0 }}>{b.serviceTitle}</p>
                            <span style={{ fontSize: "0.65rem", color: "#9ca3af" }}>{b.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {userDetail.conversations.length === 0 && userDetail.payments.length === 0 && userDetail.bookings.length === 0 && (
                    <div style={{ textAlign: "center", padding: 30, color: "#9ca3af" }}>
                      <p style={{ fontSize: "1.8rem", margin: "0 0 6px" }}>📂</p>
                      <p style={{ fontWeight: 700, margin: 0, fontSize: "0.82rem" }}>لا توجد أنشطة بعد</p>
                    </div>
                  )}
                </>
              ) : null}

              {/* ── Admin Notes ── always visible when user selected ── */}
              {selectedUser && (
                <div style={{ marginTop: 20, padding: "14px", background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: 14 }}>
                  <p style={{ fontWeight: 900, fontSize: "0.85rem", color: "#92400e", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
                    📝 ملاحظاتي على هذا المستخدم
                    <span style={{ fontSize: "0.62rem", color: "#b45309", fontWeight: 600, marginRight: "auto" }}>تُحفظ تلقائياً في جهازك</span>
                  </p>
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    rows={4}
                    placeholder={`مثال: عميل مهم — طلب اشتراك شهري بتاريخ ...\nتمت الموافقة، يحتاج متابعة في ...\nملاحظات للتواصل: ...`}
                    style={{ width: "100%", background: "#fff", border: "1.5px solid #fcd34d", color: "#000", padding: "10px 12px", borderRadius: 10, fontSize: "0.8rem", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.7, minHeight: 90 }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      onClick={() => saveNote(selectedUser.userId, noteText)}
                      style={{ flex: 1, background: noteSaved ? "#22c55e" : "#f59e0b", color: "#fff", border: "none", borderRadius: 9, padding: "8px", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      {noteSaved ? <><CheckCircle2 style={{ width: 13, height: 13 }} />تم الحفظ ✓</> : <><CheckCheck style={{ width: 13, height: 13 }} />حفظ الملاحظة</>}
                    </button>
                    <button
                      onClick={() => { setNoteText(""); saveNote(selectedUser.userId, ""); }}
                      style={{ background: "#f1f5f9", color: "#6b7280", border: "1.5px solid #e2e8f0", borderRadius: 9, padding: "8px 12px", fontWeight: 600, fontSize: "0.72rem", cursor: "pointer" }}>
                      مسح
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ospin { to { transform: rotate(360deg); } }
        @keyframes ks-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes ks-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)} 50%{box-shadow:0 0 0 8px rgba(239,68,68,0)} }
      `}</style>
    </div>
  );
}
