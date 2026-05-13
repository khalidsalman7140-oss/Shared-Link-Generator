import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/react";
import { Link, useLocation } from "wouter";
import {
  Users, MessageSquare, Star, CreditCard, Shield, TrendingUp,
  ChevronRight, Check, X, Trash2, Crown, Zap, Building2, Sparkles,
  Bell, ArrowLeft, Eye, Ban, RefreshCw, BarChart3, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "khalidsalman7140@gmail.com";

interface Stats {
  totalUsers: number;
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

function PlanBadge({ plan }: { plan: string }) {
  const Icon = PLAN_ICONS[plan] ?? Star;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", PLAN_COLORS[plan] ?? "text-slate-400 bg-slate-500/10")}>
      <Icon className="w-3 h-3" />
      {plan}
    </span>
  );
}

type Tab = "overview" | "users" | "ratings" | "payments" | "announcements";

export default function AdminPage() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editPlan, setEditPlan] = useState<{ userId: string; plan: string } | null>(null);
  const [paymentReview, setPaymentReview] = useState<{ id: number; status: string; notes: string } | null>(null);
  const [viewReceipt, setViewReceipt] = useState<string | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [announcements, setAnnouncements] = useState<{ id: number; title: string; content: string; isActive: boolean }[]>([]);

  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const isAdmin = userEmail === ADMIN_EMAIL;

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

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    Promise.all([fetchStats(), fetchUsers(), fetchRatings(), fetchPayments(), fetchAnnouncements()])
      .catch(() => setError("فشل تحميل البيانات"))
      .finally(() => setLoading(false));
  }, [isAdmin, fetchStats, fetchUsers, fetchRatings, fetchPayments, fetchAnnouncements]);

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

  const handleBlock = async (userId: string) => {
    await fetch(`/api/admin/users/${userId}/block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Blocked by admin" }),
    });
    await fetchUsers();
  };

  const handlePaymentAction = async () => {
    if (!paymentReview) return;
    await fetch(`/api/admin/payments/${paymentReview.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: paymentReview.status, reviewNotes: paymentReview.notes }),
    });
    setPaymentReview(null);
    await Promise.all([fetchPayments(), fetchStats()]);
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

  const TABS: { id: Tab; label: string; icon: typeof BarChart3; badge?: number }[] = [
    { id: "overview", label: "نظرة عامة", icon: BarChart3 },
    { id: "users", label: "المستخدمون", icon: Users, badge: users.length },
    { id: "ratings", label: "التقييمات", icon: Star, badge: ratings.length },
    { id: "payments", label: "طلبات الدفع", icon: CreditCard, badge: payments.filter(p => p.status === "pending").length },
    { id: "announcements", label: "الإعلانات", icon: Bell },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.1) 0%, transparent 50%), hsl(240 10% 4%)" }}>
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/50">
              <img src="/khalid.jpg" alt="Admin" className="w-full h-full object-cover object-top" />
            </div>
            <div>
              <h1 className="text-base font-bold text-primary">لوحة تحكم المدير</h1>
              <p className="text-[10px] text-muted-foreground">خالد سلمان — صلاحيات كاملة</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {stats?.pendingPayments ? (
              <span className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                <Bell className="w-3 h-3" />
                {stats.pendingPayments} طلب معلق
              </span>
            ) : null}
            <Button variant="ghost" size="sm" onClick={() => setLocation("/chat")}>
              <ArrowLeft className="w-4 h-4 ml-1" />
              الدردشة
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
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* OVERVIEW */}
        {tab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "إجمالي المستخدمين", value: stats.totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "رسائل اليوم", value: stats.messagesToday, icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
                { label: "إجمالي المحادثات", value: stats.totalConversations, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { label: "معدل التقييم", value: `${stats.avgRating}⭐ (${stats.totalRatings})`, icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                { label: "طلبات دفع معلقة", value: stats.pendingPayments, icon: CreditCard, color: "text-orange-400", bg: "bg-orange-500/10" },
                { label: "إجمالي الرسائل", value: stats.totalMessages, icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10" },
                { label: "مستخدمون محظورون", value: stats.totalBlocked, icon: Ban, color: "text-destructive", bg: "bg-destructive/10" },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className="bg-card border border-border rounded-xl p-4">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", card.bg)}>
                      <Icon className={cn("w-5 h-5", card.color)} />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-400" /> توزيع الخطط</h3>
              <div className="space-y-2">
                {Object.entries(stats.planDistribution).map(([plan, count]) => (
                  <div key={plan} className="flex items-center gap-3">
                    <PlanBadge plan={plan} />
                    <div className="flex-1 bg-border/30 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.round((count / stats.totalUsers) * 100)}%` }} />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">المستخدمون ({users.length})</h2>
              <Button size="sm" variant="outline" onClick={fetchUsers}><RefreshCw className="w-3.5 h-3.5 ml-1" />تحديث</Button>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/30">
                    <tr>
                      <th className="text-right p-3 font-medium text-muted-foreground">المستخدم</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">الخطة</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">اليوم</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {users.map(u => (
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
                        <td className="p-3 text-muted-foreground text-xs">{u.usageToday} رسالة</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline" className="text-xs h-7 px-2"
                              onClick={() => setEditPlan({ userId: u.userId, plan: u.plan })}>
                              <Crown className="w-3 h-3 ml-1" />ترقية
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
              </div>
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
                    <div className="flex items-center gap-2 mb-1">
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

        {/* PAYMENTS */}
        {tab === "payments" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">طلبات الدفع ({payments.length})</h2>
              <Button size="sm" variant="outline" onClick={fetchPayments}><RefreshCw className="w-3.5 h-3.5 ml-1" />تحديث</Button>
            </div>
            <div className="grid gap-3">
              {payments.map(p => (
                <div key={p.id} className={cn("bg-card border rounded-xl p-4", p.status === "pending" ? "border-yellow-500/40" : p.status === "approved" ? "border-emerald-500/30" : "border-destructive/30")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <PlanBadge plan={p.planRequested} />
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                          p.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                          p.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                          "bg-destructive/20 text-destructive"
                        )}>
                          {p.status === "pending" ? "معلق" : p.status === "approved" ? "موافق عليه" : "مرفوض"}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{p.userName || p.userEmail}</p>
                      <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                        {p.transferService && <p>خدمة التحويل: <span className="text-foreground">{p.transferService}</span></p>}
                        {p.transferNumber && <p>رقم الحوالة: <span className="text-foreground font-mono">{p.transferNumber}</span></p>}
                        {p.amount && <p>المبلغ: <span className="text-foreground">{p.amount}</span></p>}
                        {p.notes && <p>ملاحظات: {p.notes}</p>}
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(p.createdAt).toLocaleString("ar")}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {p.receiptImage && (
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setViewReceipt(p.receiptImage)}>
                          <Eye className="w-3 h-3 ml-1" />صورة
                        </Button>
                      )}
                      {p.status === "pending" && (
                        <>
                          <Button size="sm" className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700" onClick={() => setPaymentReview({ id: p.id, status: "approved", notes: "" })}>
                            <Check className="w-3 h-3 ml-1" />قبول
                          </Button>
                          <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => setPaymentReview({ id: p.id, status: "rejected", notes: "" })}>
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

        {/* ANNOUNCEMENTS */}
        {tab === "announcements" && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg">الإعلانات والإشعارات</h2>
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h3 className="font-medium text-sm">إضافة إعلان جديد</h3>
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
                نشر الإعلان
              </Button>
            </div>
            <div className="grid gap-3">
              {announcements.map(a => (
                <div key={a.id} className={cn("bg-card border rounded-xl p-4", a.isActive ? "border-primary/30" : "border-border opacity-60")}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{a.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
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
                <option key={p} value={p}>{p}</option>
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
