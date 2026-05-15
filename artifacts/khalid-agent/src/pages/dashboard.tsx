import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/react";
import { Link, useLocation } from "wouter";
import {
  CreditCard, CalendarCheck, MessageSquare, Crown, Zap, Sparkles,
  Building2, Star, Clock, CheckCircle2, Circle, XCircle, ArrowLeft,
  RefreshCw, ChevronRight, Receipt, LayoutDashboard, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface UsageInfo {
  plan: string;
  unlimited: boolean;
  designTasksToday: number;
  designTaskLimit: number;
  totalMessages: number;
  vipLevel: string;
}

interface Booking {
  id: number;
  serviceTitle: string;
  serviceType: string;
  status: string;
  urgency: string;
  budget: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaymentRequest {
  id: number;
  planRequested: string;
  transferService: string | null;
  amount: string | null;
  status: string;
  createdAt: string;
  reviewNotes: string | null;
}

interface Conversation {
  id: number;
  title: string | null;
  createdAt: string;
}

const PLAN_ICONS: Record<string, typeof Star> = {
  free: Star, weekly: Zap, monthly: Sparkles, annual: Crown, enterprise: Building2,
};

const PLAN_LABELS: Record<string, string> = {
  free: "مجاني", weekly: "أسبوعي", monthly: "شهري", annual: "سنوي", enterprise: "مؤسسي",
};

const PLAN_COLORS: Record<string, string> = {
  free: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  weekly: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  monthly: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  annual: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  enterprise: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

const BOOKING_STATUS: Record<string, { label: string; color: string; icon: typeof Circle }> = {
  pending:     { label: "بانتظار المراجعة", color: "text-yellow-400 bg-yellow-500/10", icon: Clock },
  reviewing:   { label: "قيد المراجعة",    color: "text-blue-400 bg-blue-500/10",     icon: RefreshCw },
  "in-progress":{ label: "قيد التنفيذ",   color: "text-primary bg-primary/10",        icon: Zap },
  completed:   { label: "مكتمل ✅",         color: "text-emerald-400 bg-emerald-500/10",icon: CheckCircle2 },
  cancelled:   { label: "ملغي",             color: "text-destructive bg-destructive/10",icon: XCircle },
};

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  pending:  { label: "⏳ بانتظار التأكيد", color: "text-yellow-400 bg-yellow-500/10" },
  approved: { label: "✅ تم التفعيل",      color: "text-emerald-400 bg-emerald-500/10" },
  rejected: { label: "❌ مرفوض",           color: "text-destructive bg-destructive/10" },
};

function PlanBadge({ plan }: { plan: string }) {
  const Icon = PLAN_ICONS[plan] ?? Star;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border", PLAN_COLORS[plan] ?? "text-slate-400 bg-slate-500/10 border-slate-500/20")}>
      <Icon className="w-3 h-3" />{PLAN_LABELS[plan] ?? plan}
    </span>
  );
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [, setLocation] = useLocation();
  const { isRTL } = useI18n();

  const [usage, setUsage]         = useState<UsageInfo | null>(null);
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [payments, setPayments]   = useState<PaymentRequest[]>([]);
  const [convs, setConvs]         = useState<Conversation[]>([]);
  const [loading, setLoading]     = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [uR, bR, pR, cR] = await Promise.all([
        fetch("/api/gemini/usage"),
        fetch("/api/bookings"),
        fetch("/api/payments/my-requests"),
        fetch("/api/gemini/conversations"),
      ]);
      if (uR.ok) setUsage(await uR.json());
      if (bR.ok) setBookings(await bR.json());
      if (pR.ok) setPayments(await pR.json());
      if (cR.ok) setConvs(await cR.json());
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const id = setInterval(fetchAll, 30000);
    return () => clearInterval(id);
  }, [fetchAll]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    setLocation("/sign-in");
    return null;
  }

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : user.emailAddresses?.[0]?.emailAddress ?? "مستخدم";

  const pendingBookings  = bookings.filter(b => b.status === "pending" || b.status === "reviewing" || b.status === "in-progress");
  const pendingPayments  = payments.filter(p => p.status === "pending");
  const isPaid           = usage?.plan && usage.plan !== "free";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 50%), hsl(240 10% 4%)" }}>

      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <div>
              <h1 className="text-sm font-bold text-primary">لوحتي</h1>
              <p className="text-[10px] text-muted-foreground">مركز إدارة حسابك</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchAll} className="h-8 text-xs">
              <RefreshCw className="w-3.5 h-3.5 ml-1" />تحديث
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/chat")} className="h-8 text-xs">
              <ArrowLeft className="w-3.5 h-3.5 ml-1" />الدردشة
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Profile Card */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-primary/50 overflow-hidden bg-primary/10 shrink-0 flex items-center justify-center font-bold text-xl text-primary">
            {user.imageUrl
              ? <img src={user.imageUrl} alt={displayName} className="w-full h-full object-cover" />
              : displayName[0]?.toUpperCase() ?? "؟"}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold">{displayName}</h2>
            <p className="text-xs text-muted-foreground truncate">{user.emailAddresses?.[0]?.emailAddress}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {usage && <PlanBadge plan={usage.plan} />}
              {usage?.vipLevel && usage.vipLevel !== "none" && (
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", usage.vipLevel === "gold" ? "bg-yellow-500/20 text-yellow-400" : "bg-slate-500/20 text-slate-300")}>
                  {usage.vipLevel === "gold" ? "🏆 VIP ذهبي" : "🥈 VIP فضي"}
                </span>
              )}
            </div>
          </div>
          {!isPaid && (
            <Link href="/subscribe">
              <Button size="sm" className="text-xs shrink-0 gap-1 shadow-lg shadow-primary/20">
                <Crown className="w-3.5 h-3.5" />ترقية الخطة
              </Button>
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "إجمالي رسائلك", value: usage?.totalMessages ?? 0, icon: MessageSquare, color: "text-primary" },
            { label: "حجوزاتك النشطة", value: pendingBookings.length, icon: CalendarCheck, color: "text-amber-400" },
            { label: "طلبات الدفع",  value: pendingPayments.length, icon: Receipt, color: "text-emerald-400" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border/50 rounded-xl p-3 text-center">
              <s.icon className={cn("w-5 h-5 mx-auto mb-1", s.color)} />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Subscription Card */}
        {usage && (
          <div className={cn("border rounded-2xl p-5", isPaid ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card")}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm">اشتراكك الحالي</h3>
              </div>
              <PlanBadge plan={usage.plan} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">الرسائل الإجمالية</p>
                <p className="font-bold text-lg">{usage.totalMessages}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">الوصول اللامحدود</p>
                <p className={cn("font-bold text-sm", usage.unlimited ? "text-emerald-400" : "text-muted-foreground")}>
                  {usage.unlimited ? "✅ نعم" : "❌ لا"}
                </p>
              </div>
            </div>
            {!isPaid && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <Link href="/pricing">
                  <Button size="sm" variant="outline" className="w-full text-xs gap-1 border-primary/30 hover:border-primary/60">
                    <Crown className="w-3.5 h-3.5 text-primary" />عرض الباقات المتاحة
                    <ChevronRight className="w-3.5 h-3.5 mr-auto" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Payment Requests */}
        {payments.length > 0 && (
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm">طلبات الدفع</h3>
              <span className="text-xs text-muted-foreground">({payments.length})</span>
            </div>
            <div className="space-y-3">
              {payments.map(p => {
                const st = PAYMENT_STATUS[p.status] ?? { label: p.status, color: "text-muted-foreground bg-muted/30" };
                return (
                  <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-background border border-border/40">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <PlanBadge plan={p.planRequested} />
                        {p.transferService && <span className="text-xs text-muted-foreground">{p.transferService}</span>}
                        {p.amount && <span className="text-xs text-emerald-400 font-medium">{p.amount}</span>}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(p.createdAt).toLocaleDateString("ar")}</p>
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", st.color)}>{st.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-border/30">
              <Link href="/subscribe">
                <Button size="sm" variant="ghost" className="w-full text-xs text-primary hover:text-primary">
                  إضافة طلب دفع جديد <ChevronRight className="w-3.5 h-3.5 mr-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Bookings */}
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm">حجوزاتي وطلباتي</h3>
            </div>
            <Link href="/booking">
              <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                <CalendarCheck className="w-3 h-3" />حجز جديد
              </Button>
            </Link>
          </div>
          {bookings.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <CalendarCheck className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">لا توجد حجوزات بعد</p>
              <Link href="/booking">
                <Button size="sm" className="text-xs gap-1">احجز خدمة الآن</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => {
                const st = BOOKING_STATUS[b.status] ?? { label: b.status, color: "text-muted-foreground bg-muted/30", icon: Circle };
                const StatusIcon = st.icon;
                return (
                  <div key={b.id} className="p-3 rounded-xl bg-background border border-border/40">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{b.serviceTitle}</p>
                        <p className="text-xs text-muted-foreground">{b.serviceType}</p>
                        {b.adminNotes && (
                          <p className="text-xs text-primary/80 mt-1 bg-primary/5 rounded px-2 py-1">
                            💬 {b.adminNotes}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(b.createdAt).toLocaleDateString("ar")}</p>
                      </div>
                      <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0", st.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Conversations */}
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm">المحادثات الأخيرة</h3>
            </div>
            <Link href="/chat">
              <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                <ExternalLink className="w-3 h-3" />فتح الدردشة
              </Button>
            </Link>
          </div>
          {convs.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">لا توجد محادثات بعد</p>
              <Link href="/chat">
                <Button size="sm" className="text-xs">ابدأ دردشة جديدة</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {convs.slice(0, 8).map(c => (
                <Link key={c.id} href={`/chat?id=${c.id}`}>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{c.title || "محادثة جديدة"}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("ar")}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
              {convs.length > 8 && (
                <Link href="/chat">
                  <p className="text-xs text-primary text-center pt-1 hover:underline">عرض كل المحادثات ({convs.length})</p>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/chat",      label: "دردشة مع يمن شات", icon: MessageSquare, color: "border-primary/30 hover:border-primary/60 hover:bg-primary/5" },
            { href: "/booking",   label: "احجز خدمة",         icon: CalendarCheck, color: "border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/5" },
            { href: "/subscribe", label: "ترقية الباقة",       icon: Crown,         color: "border-yellow-500/30 hover:border-yellow-500/60 hover:bg-yellow-500/5" },
            { href: "/services",  label: "استعراض الخدمات",    icon: ExternalLink,  color: "border-border/50 hover:border-border/80 hover:bg-muted/20" },
          ].map(a => (
            <Link key={a.href} href={a.href}>
              <div className={cn("flex items-center gap-2 p-3 rounded-xl border transition-colors cursor-pointer", a.color)}>
                <a.icon className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">{a.label}</span>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-[10px] text-muted-foreground pb-4">
          © {new Date().getFullYear()} يمن شات — خالد سلمان
        </p>
      </div>
    </div>
  );
}
