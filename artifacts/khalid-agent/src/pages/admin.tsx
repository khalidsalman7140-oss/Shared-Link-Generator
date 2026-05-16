import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/react";
import { Link, useLocation } from "wouter";
import {
  Users, MessageSquare, Star, CreditCard, Shield, TrendingUp,
  ChevronRight, Check, X, Trash2, Crown, Zap, Building2, Sparkles,
  Bell, ArrowLeft, Eye, Ban, RefreshCw, BarChart3, AlertCircle,
  Lock, Activity, ChevronDown, Mail, Phone, Send, Settings, Globe,
  Megaphone, Database, Image, ImagePlus, ExternalLink, MousePointerClick,
  KeyRound, LogIn, Loader2, CalendarCheck, Clock, CheckCircle2, Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "khalidsalman7140@gmail.com";

interface Stats {
  totalUsers: number;
  newUsersToday: number;
  totalConversations: number;
  totalMessages: number;
  messagesToday: number;
  planDistribution: Record<string, number>;
  totalRatings: number;
  avgRating: number;
  pendingPayments: number;
  totalBlocked: number;
}

interface AdminUser {
  userId: string;
  email: string;
  name: string;
  imageUrl: string;
  plan: string;
  validUntil: string | null;
  usageToday: number;
  createdAt: string;
}

interface Rating {
  id: number;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  rating: number;
  comment: string | null;
  service: string | null;
  createdAt: string;
}

interface PaymentRequest {
  id: number;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  planRequested: string;
  transferNumber: string | null;
  amount: string | null;
  transferService: string | null;
  notes: string | null;
  receiptImage: string | null;
  status: string;
  createdAt: string;
  reviewNotes: string | null;
}

interface FraudEntry {
  id: number;
  emailHash: string;
  userId: string | null;
  deleteCount: number;
  isBlocked: boolean;
  usedTrialAt: string;
  lastSeenAt: string;
}

const PLAN_COLORS: Record<string, string> = {
  free: "text-slate-400 bg-slate-500/10",
  weekly: "text-blue-400 bg-blue-500/10",
  monthly: "text-primary bg-primary/10",
  annual: "text-yellow-400 bg-yellow-500/10",
  enterprise: "text-emerald-400 bg-emerald-500/10",
};

const PLAN_ICONS: Record<string, typeof Star> = {
  free: Star, weekly: Zap, monthly: Sparkles, annual: Crown, enterprise: Building2,
};

const PLAN_LABELS: Record<string, string> = {
  free: "مجاني", weekly: "أسبوعي", monthly: "شهري", annual: "سنوي", enterprise: "مؤسسي",
};

function PlanBadge({ plan }: { plan: string }) {
  const Icon = PLAN_ICONS[plan] ?? Star;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", PLAN_COLORS[plan] ?? "text-slate-400 bg-slate-500/10")}>
      <Icon className="w-3 h-3" />
      {PLAN_LABELS[plan] ?? plan}
    </span>
  );
}

interface AdItem {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  sponsor: string;
  position: string;
  isActive: boolean;
  clickCount: number;
  createdAt: string;
}

interface ServiceBooking {
  id: number;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  phone: string;
  serviceType: string;
  serviceTitle: string;
  description: string;
  budget: string | null;
  urgency: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuditLog {
  id: number;
  userId: string | null;
  userEmail: string | null;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

type Tab = "overview" | "users" | "ratings" | "payments" | "announcements" | "security" | "ads" | "bookings" | "logs" | "media";

export default function AdminPage() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [fraudList, setFraudList] = useState<FraudEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(() => sessionStorage.getItem("ks_admin_unlocked") === "1");
  const [adminKey, setAdminKey] = useState("");
  const [adminKeyError, setAdminKeyError] = useState("");
  const [adminKeyLoading, setAdminKeyLoading] = useState(false);
  const adminKeyRef = useRef<HTMLInputElement>(null);
  const [editPlan, setEditPlan] = useState<{ userId: string; plan: string } | null>(null);
  const [paymentReview, setPaymentReview] = useState<{ id: number; status: string; notes: string } | null>(null);
  const [viewReceipt, setViewReceipt] = useState<string | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [announcements, setAnnouncements] = useState<{ id: number; title: string; content: string; isActive: boolean }[]>([]);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [userFilter, setUserFilter] = useState("");
  const [adsList, setAdsList] = useState<AdItem[]>([]);
  const [newAd, setNewAd] = useState({ title: "", description: "", imageUrl: "", linkUrl: "", sponsor: "خالد سلمان", position: "banner" });
  const [adPreviewUrl, setAdPreviewUrl] = useState("");
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [bookingNotes, setBookingNotes] = useState<Record<number, string>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditFilter, setAuditFilter] = useState("");
  const [pushNotif, setPushNotif] = useState({ title: "", body: "" });
  const [pushSending, setPushSending] = useState(false);
  const [pushResult, setPushResult] = useState<string | null>(null);

  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const isAdmin = userEmail === ADMIN_EMAIL;

  // Auto-unlock admin panel for the owner — no password needed
  useEffect(() => {
    if (isAdmin && !adminUnlocked) {
      sessionStorage.setItem("ks_admin_unlocked", "1");
      setAdminUnlocked(true);
      fetch("/api/admin/notify-access", { method: "POST" }).catch(() => {});
      fetch("/api/admin/ensure-plan", { method: "POST" }).catch(() => {});
    }
  }, [isAdmin, adminUnlocked]);

  const fetchStats = useCallback(async () => {
    const r = await fetch("/api/admin/stats");
    if (r.ok) setStats(await r.json());
  }, []);

  const fetchUsers = useCallback(async () => {
    const r = await fetch("/api/admin/users");
    if (r.ok) setUsers(await r.json());
  }, []);

  const fetchRatings = useCallback(async () => {
    const r = await fetch("/api/admin/ratings");
    if (r.ok) setRatings(await r.json());
  }, []);

  const fetchPayments = useCallback(async () => {
    const r = await fetch("/api/admin/payments");
    if (r.ok) setPayments(await r.json());
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    const r = await fetch("/api/admin/announcements");
    if (r.ok) setAnnouncements(await r.json());
  }, []);

  const fetchFraud = useCallback(async () => {
    const r = await fetch("/api/admin/fraud");
    if (r.ok) setFraudList(await r.json());
  }, []);

  const fetchAds = useCallback(async () => {
    const r = await fetch("/api/admin/ads-list");
    if (r.ok) setAdsList(await r.json());
  }, []);

  const fetchBookings = useCallback(async () => {
    const r = await fetch("/api/admin/bookings");
    if (r.ok) setBookings(await r.json());
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    const r = await fetch("/api/admin/audit-logs");
    if (r.ok) setAuditLogs(await r.json());
  }, []);

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    Promise.all([fetchStats(), fetchUsers(), fetchRatings(), fetchPayments(), fetchAnnouncements(), fetchFraud(), fetchAds(), fetchBookings(), fetchAuditLogs()])
      .catch(() => setError("فشل تحميل البيانات"))
      .finally(() => setLoading(false));
  }, [isAdmin, fetchStats, fetchUsers, fetchRatings, fetchPayments, fetchAnnouncements, fetchFraud, fetchAds, fetchBookings, fetchAuditLogs]);

  const handleChangePlan = async () => {
    if (!editPlan) return;
    await fetch(`/api/admin/users/${editPlan.userId}/plan`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: editPlan.plan }),
    });
    setEditPlan(null);
    await fetchUsers();
  };

  const handleQuickPlan = async (userId: string, plan: string) => {
    const planDays: Record<string, number> = { weekly: 7, monthly: 30, annual: 365, enterprise: 3650 };
    const days = planDays[plan] ?? 0;
    const validUntil = days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : undefined;
    await fetch(`/api/admin/users/${userId}/plan`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, validUntil }),
    });
    await Promise.all([fetchUsers(), fetchStats()]);
  };

  const handleBlock = async (userId: string) => {
    await fetch(`/api/admin/users/${userId}/block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Blocked by admin" }),
    });
    await fetchUsers();
  };

  const handleQuickApprove = async (payment: PaymentRequest) => {
    setApprovingId(payment.id);
    await fetch(`/api/admin/payments/${payment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved", reviewNotes: "تمت الموافقة تلقائياً" }),
    });
    setApprovingId(null);
    await Promise.all([fetchPayments(), fetchStats(), fetchUsers()]);
  };

  const handleQuickReject = async (id: number) => {
    await fetch(`/api/admin/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected", reviewNotes: "تم الرفض" }),
    });
    await Promise.all([fetchPayments(), fetchStats()]);
  };

  const handlePaymentAction = async () => {
    if (!paymentReview) return;
    await fetch(`/api/admin/payments/${paymentReview.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: paymentReview.status, reviewNotes: paymentReview.notes }),
    });
    setPaymentReview(null);
    await Promise.all([fetchPayments(), fetchStats(), fetchUsers()]);
  };

  const handleDeleteRating = async (id: number) => {
    await fetch(`/api/admin/ratings/${id}`, { method: "DELETE" });
    await fetchRatings();
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAnnouncement),
    });
    setNewAnnouncement({ title: "", content: "" });
    await fetchAnnouncements();
  };

  const handleToggleAnnouncement = async (id: number, isActive: boolean) => {
    await fetch(`/api/admin/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await fetchAnnouncements();
  };

  const handleDeleteAnnouncement = async (id: number) => {
    await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    await fetchAnnouncements();
  };

  const handleSendPushAll = async () => {
    if (!pushNotif.title.trim() || !pushNotif.body.trim()) return;
    setPushSending(true);
    setPushResult(null);
    try {
      const r = await fetch("/api/push/send-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: pushNotif.title, body: pushNotif.body, url: "/chat" }),
      });
      if (r.ok) {
        setPushResult("✅ تم إرسال الإشعار لجميع المشتركين بنجاح!");
        setPushNotif({ title: "", body: "" });
      } else {
        setPushResult("❌ فشل الإرسال. تأكد من وجود مشتركين.");
      }
    } catch {
      setPushResult("❌ حدث خطأ في الإرسال");
    } finally {
      setPushSending(false);
      setTimeout(() => setPushResult(null), 5000);
    }
  };

  const handleUnblockFraud = async (id: number) => {
    await fetch(`/api/admin/fraud/${id}/unblock`, { method: "POST" });
    await fetchFraud();
  };

  const handleCreateAd = async () => {
    if (!newAd.title) return;
    await fetch("/api/admin/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newAd.title,
        description: newAd.description || undefined,
        imageUrl: newAd.imageUrl || undefined,
        linkUrl: newAd.linkUrl || undefined,
        sponsor: newAd.sponsor || "خالد سلمان",
        position: newAd.position || "banner",
      }),
    });
    setNewAd({ title: "", description: "", imageUrl: "", linkUrl: "", sponsor: "خالد سلمان", position: "banner" });
    setAdPreviewUrl("");
    await fetchAds();
  };

  const handleToggleAd = async (id: number, isActive: boolean) => {
    await fetch(`/api/admin/ads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await fetchAds();
  };

  const handleDeleteAd = async (id: number) => {
    await fetch(`/api/admin/ads/${id}`, { method: "DELETE" });
    await fetchAds();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">يجب تسجيل الدخول للوصول</p>
          <Link href="/sign-in"><Button>تسجيل الدخول</Button></Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-destructive/60 mx-auto" />
          <h2 className="text-xl font-bold text-destructive">وصول مرفوض</h2>
          <p className="text-muted-foreground">لوحة التحكم مخصصة للمدير خالد سلمان فقط</p>
          <Button variant="outline" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  if (!adminUnlocked) {
    const handleVerify = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!adminKey.trim()) return;
      setAdminKeyLoading(true);
      setAdminKeyError("");
      try {
        const r = await fetch("/api/admin/verify-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: adminKey.trim() }),
        });
        if (r.ok) {
          sessionStorage.setItem("ks_admin_unlocked", "1");
          setAdminUnlocked(true);
        } else {
          setAdminKeyError("كلمة السر غير صحيحة — حاول مجدداً");
          setAdminKey("");
          setTimeout(() => adminKeyRef.current?.focus(), 50);
        }
      } catch {
        setAdminKeyError("فشل الاتصال — تحقق من الإنترنت");
      } finally {
        setAdminKeyLoading(false);
      }
    };
    return (
      <div dir="rtl" className="min-h-screen bg-background text-foreground flex items-center justify-center px-4"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.3) 0%, transparent 60%)" }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 space-y-3">
            <div className="text-5xl mb-4">☪️</div>
            <div className="text-amber-400 text-2xl font-medium" style={{ fontFamily: "'Cairo', serif" }}>﷽</div>
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(124,58,237,0.4)]">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">لوحة تحكم خالد سلمان</h1>
            <p className="text-muted-foreground text-sm">أدخل كلمة السر للوصول إلى الإدارة الكاملة</p>
          </div>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                ref={adminKeyRef}
                autoFocus
                type="password"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                placeholder="أدخل كلمة السر..."
                className="w-full bg-card border border-input rounded-xl pr-11 pl-4 py-3.5 text-right text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground/50"
                style={{ direction: "rtl" }}
                autoComplete="current-password"
              />
            </div>
            {adminKeyError && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {adminKeyError}
              </div>
            )}
            <Button type="submit" className="w-full h-12 text-base gap-2 shadow-lg shadow-primary/30" disabled={!adminKey.trim() || adminKeyLoading}>
              {adminKeyLoading ? <><Loader2 className="w-5 h-5 animate-spin" />جاري التحقق...</> : <><LogIn className="w-5 h-5" />دخول لوحة التحكم</>}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground/50 mt-6">يمن شات — الوكيل الذكي © 2026</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status === "pending");
  const filteredUsers = users.filter(u =>
    !userFilter || u.email.toLowerCase().includes(userFilter.toLowerCase()) || u.name.toLowerCase().includes(userFilter.toLowerCase())
  );
  const suspiciousFraud = fraudList.filter(f => f.deleteCount >= 2 || f.isBlocked);

  const pendingBookings = bookings.filter(b => b.status === "pending");

  const TABS: { id: Tab; label: string; icon: typeof BarChart3; badge?: number }[] = [
    { id: "overview", label: "نظرة عامة", icon: BarChart3 },
    { id: "users", label: "المستخدمون", icon: Users, badge: users.length },
    { id: "payments", label: "المدفوعات", icon: CreditCard, badge: pendingPayments.length || undefined },
    { id: "bookings", label: "الحجوزات", icon: CalendarCheck, badge: pendingBookings.length || undefined },
    { id: "ratings", label: "التقييمات", icon: Star, badge: ratings.length || undefined },
    { id: "ads", label: "الإعلانات المصورة", icon: ImagePlus, badge: adsList.filter(a => a.isActive).length || undefined },
    { id: "announcements", label: "الإشعارات", icon: Megaphone },
    { id: "logs", label: "السجلات", icon: Activity, badge: auditLogs.length || undefined },
    { id: "security", label: "الأمان", icon: Shield, badge: suspiciousFraud.length || undefined },
  { id: "media", label: "الوسائط", icon: Image },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.1) 0%, transparent 50%), hsl(240 10% 4%)" }}>
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/50 shrink-0">
              <img src="/khalid.jpg" alt="Admin" className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <div>
              <h1 className="text-base font-bold text-primary">لوحة تحكم المدير</h1>
              <p className="text-[10px] text-muted-foreground">خالد سلمان — صلاحيات كاملة</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {pendingPayments.length > 0 && (
              <button onClick={() => setTab("payments")}
                className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full animate-pulse hover:bg-yellow-500/30 transition-colors">
                <Bell className="w-3 h-3" />
                {pendingPayments.length} طلب معلق
              </button>
            )}
            {suspiciousFraud.length > 0 && (
              <button onClick={() => setTab("security")}
                className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full hover:bg-red-500/30 transition-colors">
                <Shield className="w-3 h-3" />
                {suspiciousFraud.length} تنبيه أمني
              </button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setLocation("/chat")}>
              <ArrowLeft className="w-4 h-4 ml-1" />الدردشة
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto pb-1">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap transition-colors relative",
                  tab === t.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {t.badge ? (
                  <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">{t.badge}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {/* OVERVIEW */}
        {tab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "مستخدمون جدد اليوم 🆕", value: stats.newUsersToday, icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10", highlight: stats.newUsersToday > 0 },
                { label: "إجمالي المستخدمين", value: stats.totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "رسائل اليوم", value: stats.messagesToday, icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
                { label: "إجمالي المحادثات", value: stats.totalConversations, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
                { label: "معدل التقييم", value: `${stats.avgRating}⭐`, icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                { label: "طلبات دفع معلقة", value: stats.pendingPayments, icon: CreditCard, color: "text-orange-400", bg: "bg-orange-500/10" },
                { label: "إجمالي الرسائل", value: stats.totalMessages, icon: Database, color: "text-sky-400", bg: "bg-sky-500/10" },
                { label: "مستخدمون محظورون", value: stats.totalBlocked, icon: Ban, color: "text-destructive", bg: "bg-destructive/10" },
                { label: "تنبيهات أمنية", value: suspiciousFraud.length, icon: Shield, color: "text-red-400", bg: "bg-red-500/10" },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className="bg-card border border-border rounded-xl p-4 hover:border-border/80 transition-colors">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", card.bg)}>
                      <Icon className={cn("w-5 h-5", card.color)} />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-400" /> توزيع الخطط</h3>
                <div className="space-y-2">
                  {Object.entries(stats.planDistribution).map(([plan, count]) => (
                    <div key={plan} className="flex items-center gap-3">
                      <PlanBadge plan={plan} />
                      <div className="flex-1 bg-border/30 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${stats.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0}%` }} />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {pendingPayments.length > 0 && (
                <div className="bg-card border border-yellow-500/30 rounded-xl p-5">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-yellow-400">
                    <Bell className="w-4 h-4" />
                    طلبات تحتاج موافقة ({pendingPayments.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingPayments.slice(0, 3).map(p => (
                      <div key={p.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{p.userName || p.userEmail || "مستخدم"}</p>
                          <p className="text-[10px] text-muted-foreground"><PlanBadge plan={p.planRequested} /></p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" className="h-6 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700"
                            disabled={approvingId === p.id}
                            onClick={() => handleQuickApprove(p)}>
                            {approvingId === p.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          </Button>
                          <Button size="sm" variant="destructive" className="h-6 px-2 text-[10px]"
                            onClick={() => handleQuickReject(p.id)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingPayments.length > 3 && (
                      <button onClick={() => setTab("payments")} className="text-xs text-primary hover:underline w-full text-center mt-1">
                        + {pendingPayments.length - 3} طلبات أخرى
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-400" /> معلومات التواصل — خالد سلمان</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <a href="https://wa.me/967783701365" className="flex items-center gap-2 text-muted-foreground hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-emerald-500/5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" /><span dir="ltr">+967 783 701 365</span>
                </a>
                <a href="https://wa.me/967779435445" className="flex items-center gap-2 text-muted-foreground hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-emerald-500/5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" /><span dir="ltr">+967 779 435 445</span>
                </a>
                <a href="https://t.me/kshskshg" className="flex items-center gap-2 text-muted-foreground hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-blue-500/5">
                  <Send className="w-4 h-4 text-blue-400 shrink-0" /><span dir="ltr">@kshskshg</span>
                </a>
                <a href="mailto:khalidsalman7140@gmail.com" className="flex items-center gap-2 text-muted-foreground hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/5">
                  <Mail className="w-4 h-4 text-red-400 shrink-0" /><span>khalidsalman7140@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="font-bold text-lg">المستخدمون ({users.length})</h2>
              <div className="flex items-center gap-2">
                <input
                  className="bg-background border border-input rounded-lg px-3 py-1.5 text-sm w-48"
                  placeholder="بحث باسم أو إيميل..."
                  value={userFilter}
                  onChange={e => setUserFilter(e.target.value)}
                />
                <Button size="sm" variant="outline" onClick={fetchUsers}><RefreshCw className="w-3.5 h-3.5 ml-1" />تحديث</Button>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/30">
                    <tr>
                      <th className="text-right p-3 font-medium text-muted-foreground">المستخدم</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">الخطة</th>
                      <th className="text-right p-3 font-medium text-muted-foreground hidden md:table-cell">اليوم</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">ترقية سريعة</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredUsers.map(u => (
                      <tr key={u.userId} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-primary">
                              {u.imageUrl ? <img src={u.imageUrl} alt="" className="w-full h-full object-cover" /> : (u.name?.[0] ?? "?")}
                            </div>
                            <div>
                              <p className="font-medium text-xs">{u.name || "—"}</p>
                              <p className="text-[10px] text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3"><PlanBadge plan={u.plan} /></td>
                        <td className="p-3 text-muted-foreground text-xs hidden md:table-cell">{u.usageToday} رسالة</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {["weekly","monthly","annual"].map(p => (
                              <button key={p}
                                onClick={() => handleQuickPlan(u.userId, p)}
                                className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded border transition-colors",
                                  u.plan === p
                                    ? "border-primary/50 text-primary bg-primary/10"
                                    : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                                )}>
                                {PLAN_LABELS[p]}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline" className="text-xs h-7 px-2"
                              onClick={() => setEditPlan({ userId: u.userId, plan: u.plan })}>
                              <Crown className="w-3 h-3 ml-1" />تخصيص
                            </Button>
                            <Button size="sm" variant="ghost" className="text-xs h-7 px-2 text-destructive hover:text-destructive"
                              onClick={() => handleBlock(u.userId)}>
                              <Ban className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredUsers.length && <p className="text-center text-muted-foreground py-8">لا توجد نتائج</p>}
              </div>
            </div>
          </div>
        )}

        {/* PAYMENTS */}
        {tab === "payments" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">طلبات الدفع ({payments.length})</h2>
                {pendingPayments.length > 0 && (
                  <p className="text-xs text-yellow-400">{pendingPayments.length} طلب ينتظر المراجعة</p>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={fetchPayments}><RefreshCw className="w-3.5 h-3.5 ml-1" />تحديث</Button>
            </div>
            <div className="grid gap-3">
              {payments.map(p => (
                <div key={p.id} className={cn("bg-card border rounded-xl p-4", p.status === "pending" ? "border-yellow-500/40 bg-yellow-500/3" : p.status === "approved" ? "border-emerald-500/30" : "border-destructive/20 opacity-70")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <PlanBadge plan={p.planRequested} />
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                          p.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                          p.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                          "bg-destructive/20 text-destructive"
                        )}>
                          {p.status === "pending" ? "⏳ معلق" : p.status === "approved" ? "✅ موافق عليه" : "❌ مرفوض"}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">{p.userName || p.userEmail}</p>
                      <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                        {p.transferService && <p>الخدمة: <span className="text-foreground">{p.transferService}</span></p>}
                        {p.transferNumber && <p>رقم الحوالة: <span className="text-foreground font-mono">{p.transferNumber}</span></p>}
                        {p.amount && <p>المبلغ: <span className="text-emerald-400 font-medium">{p.amount}</span></p>}
                        {p.notes && <p className="text-muted-foreground/70">{p.notes}</p>}
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(p.createdAt).toLocaleString("ar")}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {p.receiptImage && (
                        <Button size="sm" variant="outline" className="text-xs h-7 w-full" onClick={() => setViewReceipt(p.receiptImage)}>
                          <Eye className="w-3 h-3 ml-1" />الوصل
                        </Button>
                      )}
                      {p.status === "pending" && (
                        <>
                          <Button size="sm" className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 w-full"
                            disabled={approvingId === p.id}
                            onClick={() => handleQuickApprove(p)}>
                            {approvingId === p.id ? <RefreshCw className="w-3 h-3 animate-spin ml-1" /> : <Check className="w-3 h-3 ml-1" />}
                            قبول فوري
                          </Button>
                          <Button size="sm" variant="destructive" className="text-xs h-7 w-full"
                            onClick={() => handleQuickReject(p.id)}>
                            <X className="w-3 h-3 ml-1" />رفض
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {!payments.length && <p className="text-center text-muted-foreground py-8">لا توجد طلبات دفع</p>}
            </div>
          </div>
        )}

        {/* RATINGS */}
        {tab === "ratings" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">التقييمات ({ratings.length})</h2>
              <Button size="sm" variant="outline" onClick={fetchRatings}><RefreshCw className="w-3.5 h-3.5 ml-1" />تحديث</Button>
            </div>
            <div className="grid gap-3">
              {ratings.map(r => (
                <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-yellow-400">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                      <span className="text-xs text-muted-foreground">{r.userName || r.userEmail || "مجهول"}</span>
                      {r.service && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{r.service}</span>}
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(r.createdAt).toLocaleString("ar")}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive shrink-0" onClick={() => handleDeleteRating(r.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {!ratings.length && <p className="text-center text-muted-foreground py-8">لا توجد تقييمات بعد</p>}
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS */}
        {tab === "announcements" && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2"><Megaphone className="w-5 h-5 text-primary" />الإعلانات والإشعارات</h2>
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h3 className="font-medium text-sm text-primary">➕ إضافة إعلان جديد</h3>
              <input
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm"
                placeholder="عنوان الإعلان"
                value={newAnnouncement.title}
                onChange={e => setNewAnnouncement(p => ({ ...p, title: e.target.value }))}
              />
              <textarea
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm resize-none"
                rows={3}
                placeholder="محتوى الإعلان..."
                value={newAnnouncement.content}
                onChange={e => setNewAnnouncement(p => ({ ...p, content: e.target.value }))}
              />
              <Button size="sm" onClick={handleAddAnnouncement} disabled={!newAnnouncement.title || !newAnnouncement.content}>
                <Bell className="w-4 h-4 ml-1" />نشر الإعلان
              </Button>
            </div>

            {/* Push Notification Sender */}
            <div className="bg-card border border-violet-500/30 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-sm text-violet-400 flex items-center gap-2">
                <Send className="w-4 h-4" />
                📣 إرسال إشعار فوري للجوالات (Web Push)
              </h3>
              <p className="text-xs text-muted-foreground">يصل مباشرة على شاشة جوال كل مستخدم فعّل الإشعارات — صفر تكلفة</p>
              <input
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm"
                placeholder="عنوان الإشعار..."
                value={pushNotif.title}
                onChange={e => setPushNotif(p => ({ ...p, title: e.target.value }))}
              />
              <textarea
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm resize-none"
                rows={2}
                placeholder="نص الإشعار..."
                value={pushNotif.body}
                onChange={e => setPushNotif(p => ({ ...p, body: e.target.value }))}
              />
              {pushResult && (
                <p className="text-sm font-medium">{pushResult}</p>
              )}
              <Button
                size="sm"
                onClick={() => void handleSendPushAll()}
                disabled={pushSending || !pushNotif.title.trim() || !pushNotif.body.trim()}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {pushSending ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <Send className="w-4 h-4 ml-1" />}
                {pushSending ? "جارٍ الإرسال..." : "إرسال لكل المشتركين"}
              </Button>
            </div>

            <div className="grid gap-3">
              {announcements.map(a => (
                <div key={a.id} className={cn("bg-card border rounded-xl p-4", a.isActive ? "border-primary/30" : "border-border opacity-60")}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{a.title}</p>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full", a.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground")}>
                          {a.isActive ? "نشط" : "موقوف"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{a.content}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleToggleAnnouncement(a.id, a.isActive)}>
                        {a.isActive ? "إيقاف" : "تفعيل"}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive h-7 w-7 p-0" onClick={() => handleDeleteAnnouncement(a.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {!announcements.length && <p className="text-center text-muted-foreground py-8">لا توجد إعلانات</p>}
            </div>
          </div>
        )}

        {/* ADS */}
        {tab === "ads" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-primary" />
                الإعلانات المصورة — تظهر فوراً في التطبيق
              </h2>
              <Button size="sm" variant="outline" onClick={fetchAds}><RefreshCw className="w-3.5 h-3.5 ml-1" />تحديث</Button>
            </div>

            {/* Create New Ad */}
            <div className="bg-card border border-primary/30 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                <ImagePlus className="w-4 h-4" />إضافة إعلان جديد — يظهر في التطبيق فوراً
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm"
                  placeholder="عنوان الإعلان *"
                  value={newAd.title}
                  onChange={e => setNewAd(p => ({ ...p, title: e.target.value }))}
                />
                <input
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm"
                  placeholder="وصف مختصر (اختياري)"
                  value={newAd.description}
                  onChange={e => setNewAd(p => ({ ...p, description: e.target.value }))}
                />
                <div className="space-y-1">
                  <input
                    className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm"
                    placeholder="رابط الصورة (URL) — مثلاً: https://i.imgur.com/xxx.jpg"
                    value={newAd.imageUrl}
                    onChange={e => { setNewAd(p => ({ ...p, imageUrl: e.target.value })); setAdPreviewUrl(e.target.value); }}
                  />
                  {adPreviewUrl && (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border">
                      <img src={adPreviewUrl} alt="معاينة" className="w-full h-full object-cover"
                        onError={() => setAdPreviewUrl("")} />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">معاينة الصورة</span>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm"
                  placeholder="رابط الضغط (اختياري) — مثلاً: https://wa.me/..."
                  value={newAd.linkUrl}
                  onChange={e => setNewAd(p => ({ ...p, linkUrl: e.target.value }))}
                />
                <input
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm"
                  placeholder="اسم الجهة (مثلاً: خالد سلمان)"
                  value={newAd.sponsor}
                  onChange={e => setNewAd(p => ({ ...p, sponsor: e.target.value }))}
                />
                <select
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm"
                  value={newAd.position}
                  onChange={e => setNewAd(p => ({ ...p, position: e.target.value }))}>
                  <option value="banner">بانر (في الصفحة الرئيسية)</option>
                  <option value="sidebar">جانبي</option>
                  <option value="popup">إشعار منبثق</option>
                </select>
              </div>
              <Button onClick={handleCreateAd} disabled={!newAd.title} className="w-full md:w-auto">
                <ImagePlus className="w-4 h-4 ml-1" />نشر الإعلان — يظهر فوراً ✅
              </Button>
            </div>

            {/* Ads List */}
            <div className="grid gap-3">
              {adsList.map(a => (
                <div key={a.id} className={cn("bg-card border rounded-xl overflow-hidden", a.isActive ? "border-primary/30" : "border-border opacity-60")}>
                  <div className="flex gap-3 p-3">
                    {a.imageUrl && (
                      <div className="w-20 h-16 rounded-lg overflow-hidden border border-border shrink-0">
                        <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    )}
                    {!a.imageUrl && (
                      <div className="w-16 h-16 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Image className="w-6 h-6 text-primary/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{a.title}</p>
                          {a.description && <p className="text-xs text-muted-foreground truncate">{a.description}</p>}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">{a.sponsor}</span>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", a.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground")}>
                              {a.isActive ? "نشط" : "موقوف"}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <MousePointerClick className="w-2.5 h-2.5" />{a.clickCount}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {a.linkUrl && (
                            <a href={a.linkUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </a>
                          )}
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2"
                            onClick={() => handleToggleAd(a.id, a.isActive)}>
                            {a.isActive ? "إيقاف" : "تفعيل"}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive h-7 w-7 p-0"
                            onClick={() => handleDeleteAd(a.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!adsList.length && (
                <div className="text-center py-10 text-muted-foreground">
                  <ImagePlus className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">لا توجد إعلانات مصورة بعد</p>
                  <p className="text-xs mt-1">أضف إعلانك الأول وسيظهر في التطبيق فوراً</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {tab === "bookings" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-primary" />
                طلبات الخدمات ({bookings.length})
              </h2>
              <Button size="sm" variant="outline" onClick={fetchBookings}><RefreshCw className="w-3.5 h-3.5 ml-1" />تحديث</Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "جديد", value: bookings.filter(b => b.status === "pending").length, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                { label: "قيد المراجعة", value: bookings.filter(b => b.status === "reviewing").length, color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "قيد التنفيذ", value: bookings.filter(b => b.status === "in-progress").length, color: "text-primary", bg: "bg-primary/10" },
                { label: "مكتمل", value: bookings.filter(b => b.status === "completed").length, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              ].map((c, i) => (
                <div key={i} className={cn("rounded-xl p-3 border border-border", c.bg)}>
                  <p className={cn("text-2xl font-extrabold", c.color)}>{c.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {bookings.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  لا توجد طلبات حتى الآن
                </div>
              )}
              {bookings.map(b => {
                const urgencyMap: Record<string, { label: string; color: string }> = {
                  normal: { label: "عادي", color: "text-muted-foreground bg-muted" },
                  urgent: { label: "⚡ عاجل", color: "text-yellow-400 bg-yellow-500/10" },
                  critical: { label: "🚨 عاجل جداً", color: "text-red-400 bg-red-500/10" },
                };
                const statusMap: Record<string, { label: string; color: string; icon: typeof Circle }> = {
                  pending: { label: "جديد", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", icon: Clock },
                  reviewing: { label: "قيد المراجعة", color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: Eye },
                  "in-progress": { label: "قيد التنفيذ", color: "text-primary bg-primary/10 border-primary/30", icon: Activity },
                  completed: { label: "مكتمل", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2 },
                  cancelled: { label: "ملغي", color: "text-muted-foreground bg-muted border-border", icon: X },
                };
                const statusInfo = statusMap[b.status] ?? statusMap["pending"]!;
                const StatusIcon = statusInfo.icon;
                const urgencyInfo = urgencyMap[b.urgency] ?? urgencyMap["normal"]!;
                return (
                  <div key={b.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 font-medium", statusInfo.color)}>
                            <StatusIcon className="w-3 h-3" />{statusInfo.label}
                          </span>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", urgencyInfo.color)}>
                            {urgencyInfo.label}
                          </span>
                          <span className="text-xs text-muted-foreground">#{b.id}</span>
                        </div>
                        <p className="font-bold">{b.serviceTitle}</p>
                        <p className="text-xs text-muted-foreground">{b.serviceType}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString("ar")}</p>
                        {b.budget && <p className="text-xs text-primary font-medium mt-0.5">{b.budget}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <a href={`https://wa.me/${b.phone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline font-medium">{b.phone}</a>
                      </div>
                      {(b.userName || b.userEmail) && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3 shrink-0" />
                          <span className="truncate">{b.userName || b.userEmail}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-foreground/80 bg-background/50 rounded-lg p-2 border border-border/50 leading-relaxed">{b.description}</p>

                    {b.adminNotes && (
                      <div className="text-xs bg-primary/5 border border-primary/20 rounded-lg p-2 text-muted-foreground">
                        <span className="text-primary font-medium">ملاحظتك: </span>{b.adminNotes}
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={b.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          await fetch(`/api/admin/bookings/${b.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: newStatus }),
                          });
                          await fetchBookings();
                        }}
                        className="bg-card border border-input rounded-lg px-2 py-1 text-xs flex-1"
                      >
                        {Object.entries(statusMap).map(([v, s]) => (
                          <option key={v} value={v}>{s.label}</option>
                        ))}
                      </select>
                      <input
                        value={bookingNotes[b.id] ?? b.adminNotes ?? ""}
                        onChange={e => setBookingNotes(prev => ({ ...prev, [b.id]: e.target.value }))}
                        placeholder="ملاحظة للمستخدم..."
                        className="bg-card border border-input rounded-lg px-2 py-1 text-xs flex-1 min-w-[120px]"
                      />
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
                        onClick={async () => {
                          await fetch(`/api/admin/bookings/${b.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ adminNotes: bookingNotes[b.id] ?? b.adminNotes ?? "" }),
                          });
                          await fetchBookings();
                        }}>
                        <Check className="w-3 h-3 ml-1" />حفظ
                      </Button>
                      <a href={`https://wa.me/${b.phone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700">
                          <Phone className="w-3 h-3 ml-1" />واتساب
                        </Button>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AUDIT LOGS */}
        {tab === "logs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                سجل نشاط المستخدمين ({auditLogs.length})
              </h2>
              <div className="flex items-center gap-2">
                <input
                  className="bg-background border border-input rounded-lg px-3 py-1.5 text-sm w-48"
                  placeholder="بحث بالإيميل أو الإجراء..."
                  value={auditFilter}
                  onChange={e => setAuditFilter(e.target.value)}
                />
                <Button size="sm" variant="outline" onClick={fetchAuditLogs}><RefreshCw className="w-3.5 h-3.5 ml-1" />تحديث</Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "إجمالي الدخولات", value: auditLogs.filter(l => l.action === "login").length, color: "text-primary" },
                { label: "مستخدمون فريدون", value: new Set(auditLogs.map(l => l.userId).filter(Boolean)).size, color: "text-emerald-400" },
                { label: "نشاط اليوم", value: auditLogs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length, color: "text-amber-400" },
              ].map((s, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-3 text-center">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/30">
                    <tr>
                      <th className="text-right p-3 font-medium text-muted-foreground text-xs">المستخدم</th>
                      <th className="text-right p-3 font-medium text-muted-foreground text-xs">الإجراء</th>
                      <th className="text-right p-3 font-medium text-muted-foreground text-xs hidden md:table-cell">IP</th>
                      <th className="text-right p-3 font-medium text-muted-foreground text-xs">الوقت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {auditLogs
                      .filter(l => !auditFilter ||
                        (l.userEmail ?? "").toLowerCase().includes(auditFilter.toLowerCase()) ||
                        l.action.toLowerCase().includes(auditFilter.toLowerCase()))
                      .slice(0, 200)
                      .map(l => (
                      <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <p className="text-xs font-medium">{l.userEmail ?? "—"}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{l.userId?.slice(0, 12) ?? "—"}</p>
                        </td>
                        <td className="p-3">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                            l.action === "login" ? "bg-emerald-500/10 text-emerald-400" : "bg-primary/10 text-primary"
                          )}>
                            {l.action === "login" ? "🔐 دخول" : l.action}
                          </span>
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          <span className="font-mono text-xs text-muted-foreground">{l.ipAddress ?? "—"}</span>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(l.createdAt).toLocaleString("ar")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!auditLogs.length && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    لا توجد سجلات نشاط بعد — ستظهر هنا عند دخول المستخدمين
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECURITY */}
        {tab === "media" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                مكتبة الوسائط
              </h2>
              <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-1 rounded-full">خاص بالمدير</span>
            </div>

            {/* Promo Video Section */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  الفيديو الترويجي — يمن شات (30 ثانية)
                </h3>
                <div className="flex items-center gap-2">
                  <a
                    href="/promo-video/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs bg-primary/20 text-primary px-3 py-1.5 rounded-full hover:bg-primary/30 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    فتح في تبويب جديد
                  </a>
                </div>
              </div>
              {/* Embedded video preview */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src="/promo-video/"
                  className="absolute inset-0 w-full h-full border-0"
                  title="الفيديو الترويجي ليمن شات"
                  allow="autoplay"
                />
              </div>
              <div className="p-4 border-t border-border bg-muted/10">
                <p className="text-xs text-muted-foreground mb-3">
                  لتنزيل الفيديو: افتح في تبويب جديد → اضغط زر التصدير في أسفل الشاشة (يتم تسجيل الفيديو تلقائياً وتحميله)
                </p>
                <div className="flex gap-2 flex-wrap">
                  <a
                    href="/promo-video/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors font-medium"
                  >
                    <MousePointerClick className="w-3.5 h-3.5" />
                    فتح لتنزيل الفيديو
                  </a>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted/30 px-3 py-2 rounded-xl">
                    <Globe className="w-3 h-3" />
                    الفيديو مُنتج بالكامل بكود React بدون استهلاك رصيد AI
                  </span>
                </div>
              </div>
            </div>

            {/* Upload space for more media */}
            <div className="bg-card border border-dashed border-border/60 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <ImagePlus className="w-7 h-7 text-primary/60" />
              </div>
              <h3 className="font-semibold text-sm mb-1">مساحة الوسائط</h3>
              <p className="text-xs text-muted-foreground mb-4">
                يمكنك إضافة صور، شعارات، أو تصاميم إضافية هنا مستقبلاً
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {["الفيديو الترويجي ✓", "شعار يمن شات ✓", "صورة خالد ✓", "تصاميم قادمة..."].map((item, i) => (
                  <div key={i} className={`rounded-xl p-3 text-xs text-center border ${i < 3 ? "border-primary/30 bg-primary/5 text-primary" : "border-border bg-muted/20 text-muted-foreground"}`}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-400" />
                مكافحة الاحتيال والأمان
              </h2>
              <Button size="sm" variant="outline" onClick={fetchFraud}><RefreshCw className="w-3.5 h-3.5 ml-1" />تحديث</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "إيميلات مرصودة", value: fraudList.length, color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "حالات مشبوهة", value: fraudList.filter(f => f.deleteCount >= 2).length, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                { label: "محظورون", value: fraudList.filter(f => f.isBlocked).length, color: "text-red-400", bg: "bg-red-500/10" },
              ].map((c, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className={cn("text-2xl font-black", c.color)}>{c.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/20">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  سجل بصمات الإيميلات
                  <span className="text-xs text-muted-foreground font-normal">— يمنع إعادة الاشتراك المجاني بعد حذف الحساب</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/10">
                    <tr>
                      <th className="text-right p-3 font-medium text-muted-foreground text-xs">بصمة الإيميل</th>
                      <th className="text-right p-3 font-medium text-muted-foreground text-xs">عدد الحذف</th>
                      <th className="text-right p-3 font-medium text-muted-foreground text-xs">الحالة</th>
                      <th className="text-right p-3 font-medium text-muted-foreground text-xs">آخر ظهور</th>
                      <th className="text-right p-3 font-medium text-muted-foreground text-xs">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {fraudList.map(f => (
                      <tr key={f.id} className={cn("hover:bg-muted/20 transition-colors", f.isBlocked && "bg-red-500/5")}>
                        <td className="p-3">
                          <span className="font-mono text-xs text-muted-foreground">{f.emailHash.slice(0, 16)}…</span>
                        </td>
                        <td className="p-3">
                          <span className={cn("text-xs font-bold", f.deleteCount >= 2 ? "text-yellow-400" : "text-muted-foreground")}>
                            {f.deleteCount} مرة
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                            f.isBlocked ? "bg-red-500/20 text-red-400" :
                            f.deleteCount >= 2 ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-emerald-500/20 text-emerald-400"
                          )}>
                            {f.isBlocked ? "محظور" : f.deleteCount >= 2 ? "مشبوه" : "طبيعي"}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {new Date(f.lastSeenAt).toLocaleDateString("ar")}
                        </td>
                        <td className="p-3">
                          {f.isBlocked && (
                            <Button size="sm" variant="outline" className="text-xs h-6 px-2"
                              onClick={() => handleUnblockFraud(f.id)}>
                              رفع الحظر
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!fraudList.length && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <Lock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    لا توجد بيانات أمان بعد
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Plan Modal */}
      {editPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl" dir="rtl">
            <h3 className="font-bold mb-4">تغيير خطة المستخدم</h3>
            <select
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm mb-4"
              value={editPlan.plan}
              onChange={e => setEditPlan(p => p ? { ...p, plan: e.target.value } : null)}
            >
              {["free", "weekly", "monthly", "annual", "enterprise"].map(p => (
                <option key={p} value={p}>{PLAN_LABELS[p] ?? p}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleChangePlan}><Check className="w-4 h-4 ml-1" />حفظ</Button>
              <Button variant="outline" className="flex-1" onClick={() => setEditPlan(null)}><X className="w-4 h-4 ml-1" />إلغاء</Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Review Modal */}
      {paymentReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl" dir="rtl">
            <h3 className="font-bold mb-4">{paymentReview.status === "approved" ? "✅ قبول الطلب" : "❌ رفض الطلب"}</h3>
            <textarea
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm mb-4 resize-none"
              rows={3}
              placeholder="ملاحظات اختيارية..."
              value={paymentReview.notes}
              onChange={e => setPaymentReview(p => p ? { ...p, notes: e.target.value } : null)}
            />
            <div className="flex gap-2">
              <Button
                className={cn("flex-1", paymentReview.status === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-destructive hover:bg-destructive/90")}
                onClick={handlePaymentAction}
              >
                <Check className="w-4 h-4 ml-1" />تأكيد
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setPaymentReview(null)}><X className="w-4 h-4 ml-1" />إلغاء</Button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Image Modal */}
      {viewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={() => setViewReceipt(null)}>
          <div className="max-w-lg w-full">
            <img src={viewReceipt} alt="صورة الحوالة" className="w-full rounded-2xl shadow-2xl" />
            <p className="text-center text-muted-foreground text-sm mt-2">اضغط للإغلاق</p>
          </div>
        </div>
      )}
    </div>
  );
}
