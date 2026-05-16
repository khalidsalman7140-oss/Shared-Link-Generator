import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/react";
import { Link, useLocation } from "wouter";
import {
  CreditCard, CalendarCheck, MessageSquare, Crown, Zap, Sparkles,
  Building2, Star, Clock, CheckCircle2, XCircle, ArrowLeft,
  RefreshCw, ChevronRight, Receipt, LayoutDashboard, Send,
  Globe, Palette, FileText, Code2, Image as ImageIcon, Archive,
  BellDot, Inbox, UserCircle, Filter, Briefcase,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ─────── types ─────── */
interface UsageInfo { plan: string; unlimited: boolean; designTasksToday: number; designTaskLimit: number; totalMessages: number; vipLevel: string; validUntil: string | null; }
interface Booking { id: number; serviceTitle: string; serviceType: string; status: string; urgency: string; budget: string | null; adminNotes: string | null; createdAt: string; updatedAt: string; }
interface PaymentReq { id: number; planRequested: string; transferService: string | null; amount: string | null; status: string; createdAt: string; reviewNotes: string | null; }
interface Conversation { id: number; title: string | null; createdAt: string; }
interface Work { id: string; type: string; label: string; emoji: string; title: string; date: string; convId: number; }
interface ArchiveData { works: Work[]; total: number; stats: Record<string,number>; totalConvs: number; }
interface AdminMsg { id: number; userId: string; content: string; direction: string; isRead: boolean; createdAt: string; }

/* ─────── consts ─────── */
const PLAN_COLOR: Record<string, string> = { free:"#6b7280", weekly:"#3b82f6", monthly:"#8b5cf6", annual:"#f59e0b", enterprise:"#10b981" };
const PLAN_AR: Record<string, string> = { free:"مجاني", weekly:"أسبوعي", monthly:"شهري", annual:"سنوي", enterprise:"مؤسسي" };
const PLAN_ICON: Record<string, typeof Star> = { free:Star, weekly:Zap, monthly:Sparkles, annual:Crown, enterprise:Building2 };
const BOOKING_STATUS: Record<string,{label:string;color:string}> = {
  pending:     { label:"بانتظار المراجعة", color:"#b45309" },
  reviewing:   { label:"قيد المراجعة",    color:"#1d4ed8" },
  "in-progress":{ label:"قيد التنفيذ",   color:"#7c3aed" },
  completed:   { label:"مكتمل ✅",         color:"#059669" },
  cancelled:   { label:"ملغي",            color:"#dc2626" },
};
const PAYMENT_STATUS: Record<string,{label:string;color:string;bg:string}> = {
  pending:  { label:"⏳ بانتظار التأكيد", color:"#b45309", bg:"#fffbeb" },
  approved: { label:"✅ تم التفعيل",      color:"#166534", bg:"#f0fdf4" },
  rejected: { label:"❌ مرفوض",           color:"#991b1b", bg:"#fef2f2" },
};
const WORK_TYPE_FILTER = ["الكل","website","logo","document","image","code"] as const;
const WORK_FILTER_AR: Record<string,string> = { الكل:"الكل", website:"مواقع", logo:"شعارات", document:"وثائق", image:"صور", code:"أكواد" };

/* ════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [, setLocation] = useLocation();
  const { isRTL } = useI18n();

  const [activeTab, setActiveTab] = useState<"overview"|"works"|"messages"|"subscription">("overview");
  const [coverPhoto, setCoverPhoto] = useState<string>(() => localStorage.getItem("ks_cover_photo") ?? "");
  const coverInputRef = useRef<HTMLInputElement>(null);

  /* data */
  const [usage, setUsage]           = useState<UsageInfo | null>(null);
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [payments, setPayments]     = useState<PaymentReq[]>([]);
  const [convs, setConvs]           = useState<Conversation[]>([]);
  const [loading, setLoading]       = useState(true);

  /* archive */
  const [archive, setArchive]       = useState<ArchiveData | null>(null);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [workFilter, setWorkFilter] = useState<string>("الكل");

  /* messages */
  const [msgs, setMsgs]             = useState<AdminMsg[]>([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [newMsg, setNewMsg]         = useState("");
  const [sending, setSending]       = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const msgEndRef = useRef<HTMLDivElement>(null);

  /* ── fetch overview ── */
  const fetchOverview = useCallback(async () => {
    try {
      const [uR, bR, pR, cR] = await Promise.all([
        fetch("/api/gemini/usage"),
        fetch("/api/bookings"),
        fetch("/api/payments/my-requests"),
        fetch("/api/gemini/conversations"),
      ]);
      if (uR.ok) setUsage(await uR.json() as UsageInfo);
      if (bR.ok) setBookings(await bR.json() as Booking[]);
      if (pR.ok) setPayments(await pR.json() as PaymentReq[]);
      if (cR.ok) setConvs(await cR.json() as Conversation[]);
    } catch {}
    finally { setLoading(false); }
  }, []);

  /* ── fetch archive ── */
  const fetchArchive = useCallback(async () => {
    if (archive) return;
    setArchiveLoading(true);
    try {
      const r = await fetch("/api/messages/archive");
      if (r.ok) setArchive(await r.json() as ArchiveData);
    } catch {}
    finally { setArchiveLoading(false); }
  }, [archive]);

  /* ── fetch messages ── */
  const fetchMessages = useCallback(async () => {
    setMsgsLoading(true);
    try {
      const r = await fetch("/api/messages");
      if (r.ok) {
        const data = await r.json() as AdminMsg[];
        setMsgs(data);
        setUnreadCount(data.filter(m => m.direction === "admin_to_user" && !m.isRead).length);
      }
    } catch {}
    finally { setMsgsLoading(false); }
  }, []);

  /* ── mark messages read ── */
  const markRead = useCallback(async () => {
    if (unreadCount === 0) return;
    try { await fetch("/api/messages/mark-read", { method: "POST" }); setUnreadCount(0); } catch {}
  }, [unreadCount]);

  /* ── send message ── */
  const sendMessage = async () => {
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      const r = await fetch("/api/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMsg.trim() }),
      });
      if (r.ok) {
        const m = await r.json() as AdminMsg;
        setMsgs(prev => [...prev, m]);
        setNewMsg("");
        setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch {}
    finally { setSending(false); }
  };

  /* ── initial load ── */
  useEffect(() => { fetchOverview(); }, [fetchOverview]);
  useEffect(() => { const id = setInterval(fetchOverview, 30000); return () => clearInterval(id); }, [fetchOverview]);

  /* ── tab-specific loads ── */
  useEffect(() => {
    if (activeTab === "works") fetchArchive();
    if (activeTab === "messages") { fetchMessages(); markRead(); }
  }, [activeTab, fetchArchive, fetchMessages, markRead]);

  /* ── scroll to last msg ── */
  useEffect(() => {
    if (activeTab === "messages") setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
  }, [msgs, activeTab]);

  /* ── auth guard ── */
  useEffect(() => {
    if (isLoaded && !loading && !user) setLocation("/sign-in");
  }, [isLoaded, loading, user, setLocation]);

  if (!isLoaded || loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid #000", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  if (!user) return null;

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : user.emailAddresses?.[0]?.emailAddress ?? "مستخدم";

  const isPaid = usage?.plan && usage.plan !== "free";
  const pendingBookings = bookings.filter(b => ["pending","reviewing","in-progress"].includes(b.status));
  const filteredWorks = archive?.works.filter(w => workFilter === "الكل" || w.type === workFilter) ?? [];

  /* ════════════════════════════ RENDER ════════════════════════════ */
  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#fff", color: "#000", fontFamily: "'Cairo','Tajawal',sans-serif" }}>

      {/* ── Sticky header ── */}
      <div style={{ background: "#000", position: "sticky", top: 0, zIndex: 40 }}>
        {/* Cover Photo */}
        <div style={{ position: "relative", height: 100, overflow: "hidden", background: coverPhoto ? "transparent" : "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)" }}>
          {coverPhoto && <img src={coverPhoto} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
          <button onClick={() => coverInputRef.current?.click()}
            style={{ position: "absolute", bottom: 8, insetInlineEnd: 10, background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.35)", color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: "0.65rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, backdropFilter: "blur(4px)" }}>
            📷 {coverPhoto ? "تغيير الغلاف" : "إضافة صورة غلاف"}
          </button>
          {coverPhoto && (
            <button onClick={() => { setCoverPhoto(""); localStorage.removeItem("ks_cover_photo"); }}
              style={{ position: "absolute", bottom: 8, insetInlineStart: 10, background: "rgba(220,38,38,0.7)", border: "none", color: "#fff", borderRadius: 20, padding: "4px 10px", fontSize: "0.62rem", fontWeight: 700, cursor: "pointer" }}>
              ✕ حذف
            </button>
          )}
          <input ref={coverInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
              const url = ev.target?.result as string;
              setCoverPhoto(url);
              localStorage.setItem("ks_cover_photo", url);
            };
            reader.readAsDataURL(file);
          }} />
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px" }}>
          {/* top bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0 0" }}>
            <button onClick={() => setLocation("/chat")}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: 34, height: 34, borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ArrowLeft style={{ width: 15, height: 15 }} />
            </button>
            {/* Avatar — auto-fetched from Gmail/Google, click to change */}
            <label style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", background: "#1a1a2e", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#f59e0b", fontSize: "1rem", cursor: "pointer", border: "2px solid rgba(255,255,255,0.3)", boxSizing: "border-box" }}
              title="انقر لتغيير الصورة الشخصية">
              {user.imageUrl
                ? <img src={user.imageUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span>{displayName[0]?.toUpperCase() ?? "؟"}</span>}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                try { await user.setProfileImage({ file }); await user.reload(); }
                catch {}
              }} />
            </label>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#fff", fontWeight: 900, fontSize: "0.95rem", margin: 0 }}>{displayName}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                {usage && (
                  <span style={{ background: `${PLAN_COLOR[usage.plan]}20`, color: PLAN_COLOR[usage.plan], border: `1px solid ${PLAN_COLOR[usage.plan]}40`, borderRadius: 20, padding: "1px 9px", fontSize: "0.65rem", fontWeight: 800 }}>
                    {PLAN_AR[usage.plan] ?? usage.plan}
                  </span>
                )}
                {unreadCount > 0 && (
                  <span style={{ background: "#ef4444", color: "#fff", borderRadius: 20, padding: "1px 7px", fontSize: "0.62rem", fontWeight: 900, animation: "ks-blink 1.5s ease-in-out infinite" }}>
                    {unreadCount} رسالة
                  </span>
                )}
              </div>
            </div>
            <button onClick={fetchOverview}
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <RefreshCw style={{ width: 12, height: 12 }} />تحديث
            </button>
          </div>
          {/* tabs */}
          <div style={{ display: "flex", gap: 2, marginTop: 10 }}>
            {([
              { id: "overview",      label: "لوحتي",       icon: LayoutDashboard },
              { id: "works",         label: "أعمالي",      icon: Briefcase },
              { id: "messages",      label: "الرسائل",     icon: Inbox, badge: unreadCount },
              { id: "subscription",  label: "اشتراكي",     icon: CreditCard },
            ] as const).map(t => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{ flex: 1, background: active ? "#fff" : "transparent", color: active ? "#000" : "rgba(255,255,255,0.65)", border: "none", borderRadius: "9px 9px 0 0", padding: "9px 4px", fontSize: "0.72rem", fontWeight: active ? 900 : 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, whiteSpace: "nowrap", position: "relative" }}>
                  <Icon style={{ width: 13, height: 13 }} />{t.label}
                  {"badge" in t && t.badge > 0 && (
                    <span style={{ position: "absolute", top: 4, right: 6, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 14, height: 14, fontSize: "0.55rem", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{t.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 16px 80px" }}>

        {/* ══════════ TAB: OVERVIEW ══════════ */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "رسائلك", val: usage?.totalMessages ?? 0, color: "#7c3aed" },
                { label: "حجوزات نشطة", val: pendingBookings.length, color: "#f59e0b" },
                { label: "طلبات دفع", val: payments.filter(p=>p.status==="pending").length, color: "#059669" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#f8fafc", border: `2px solid ${s.color}20`, borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
                  <p style={{ fontWeight: 900, fontSize: "1.6rem", color: s.color, margin: "0 0 3px", lineHeight: 1 }}>{s.val}</p>
                  <p style={{ fontSize: "0.66rem", color: "#6b7280", margin: 0, fontWeight: 600 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* bookings */}
            <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
                  <CalendarCheck style={{ width: 15, height: 15, color: "#f59e0b" }} />حجوزاتي
                </p>
                <Link href="/booking">
                  <button style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "5px 12px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    <CalendarCheck style={{ width: 11, height: 11 }} />حجز جديد
                  </button>
                </Link>
              </div>
              {bookings.length === 0 ? (
                <EmptyState icon="📅" text="لا توجد حجوزات بعد" cta="احجز خدمة" href="/booking" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {bookings.slice(0, 5).map(b => {
                    const st = BOOKING_STATUS[b.status] ?? { label: b.status, color: "#6b7280" };
                    return (
                      <div key={b.id} style={{ background: "#f8fafc", borderRadius: 11, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: "0.82rem", color: "#000", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.serviceTitle}</p>
                          <p style={{ fontSize: "0.65rem", color: "#9ca3af", margin: 0 }}>{new Date(b.createdAt).toLocaleDateString("ar-EG")}</p>
                          {b.adminNotes && <p style={{ fontSize: "0.7rem", color: "#7c3aed", margin: "3px 0 0", background: "#f5f3ff", padding: "3px 8px", borderRadius: 6 }}>💬 {b.adminNotes}</p>}
                        </div>
                        <span style={{ color: st.color, fontSize: "0.68rem", fontWeight: 800, background: `${st.color}12`, padding: "2px 9px", borderRadius: 20, flexShrink: 0, whiteSpace: "nowrap" }}>{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* payments */}
            {payments.length > 0 && (
              <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
                    <Receipt style={{ width: 15, height: 15, color: "#059669" }} />طلبات الدفع
                  </p>
                  <Link href="/subscribe">
                    <button style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "5px 12px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>
                      طلب جديد
                    </button>
                  </Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {payments.slice(0, 4).map(p => {
                    const st = PAYMENT_STATUS[p.status] ?? { label: p.status, color: "#6b7280", bg: "#f8fafc" };
                    return (
                      <div key={p.id} style={{ background: st.bg, border: `1.5px solid ${st.color}30`, borderRadius: 10, padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "#000", margin: "0 0 1px" }}>{PLAN_AR[p.planRequested] ?? p.planRequested}</p>
                          <p style={{ fontSize: "0.62rem", color: "#9ca3af", margin: 0 }}>{new Date(p.createdAt).toLocaleDateString("ar-EG")}</p>
                        </div>
                        <span style={{ color: st.color, fontSize: "0.7rem", fontWeight: 800 }}>{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* recent convs */}
            <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
                  <MessageSquare style={{ width: 15, height: 15, color: "#7c3aed" }} />المحادثات الأخيرة
                </p>
                <Link href="/chat">
                  <button style={{ background: "#000", color: "#fff", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>
                    محادثة جديدة
                  </button>
                </Link>
              </div>
              {convs.length === 0 ? (
                <EmptyState icon="💬" text="لا توجد محادثات بعد" cta="ابدأ محادثة" href="/chat" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {convs.slice(0, 6).map(c => (
                    <Link key={c.id} href={`/chat?id=${c.id}`}>
                      <div style={{ background: "#f8fafc", borderRadius: 9, padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                          <MessageSquare style={{ width: 13, height: 13, color: "#9ca3af", flexShrink: 0 }} />
                          <span style={{ fontSize: "0.78rem", color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title || "محادثة جديدة"}</span>
                        </div>
                        <span style={{ fontSize: "0.6rem", color: "#9ca3af", flexShrink: 0, marginRight: 8 }}>{new Date(c.createdAt).toLocaleDateString("ar-EG")}</span>
                      </div>
                    </Link>
                  ))}
                  {convs.length > 6 && (
                    <Link href="/chat"><p style={{ textAlign: "center", fontSize: "0.75rem", color: "#7c3aed", margin: "4px 0 0", cursor: "pointer", fontWeight: 700 }}>عرض كل المحادثات ({convs.length})</p></Link>
                  )}
                </div>
              )}
            </div>

            {/* quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { href:"/chat",      icon: MessageSquare, label:"دردشة مع يمن شات",  color:"#7c3aed" },
                { href:"/booking",   icon: CalendarCheck, label:"احجز خدمة",         color:"#f59e0b" },
                { href:"/subscribe", icon: Crown,         label:"ترقية الباقة",       color:"#f59e0b" },
                { href:"/services",  icon: Briefcase,     label:"استعراض الخدمات",   color:"#059669" },
              ].map(a => {
                const Icon = a.icon;
                return (
                  <Link key={a.href} href={a.href}>
                    <div style={{ background: "#f8fafc", border: `1.5px solid ${a.color}25`, borderRadius: 12, padding: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${a.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon style={{ width: 14, height: 14, color: a.color }} />
                      </div>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#000" }}>{a.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════ TAB: WORKS ARCHIVE ══════════ */}
        {activeTab === "works" && (
          <div>
            {archiveLoading ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid #000", borderTopColor: "transparent", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
                <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>جاري تحليل أعمالك...</p>
              </div>
            ) : !archive ? (
              <EmptyState icon="📂" text="لا توجد أعمال بعد" cta="ابدأ محادثة" href="/chat" />
            ) : (
              <>
                {/* stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 18 }}>
                  {[
                    { label:"مواقع",   val: archive.stats.websites ?? 0,  color:"#0891b2", emoji:"🌐" },
                    { label:"شعارات",  val: archive.stats.logos ?? 0,     color:"#ec4899", emoji:"🎨" },
                    { label:"وثائق",   val: archive.stats.documents ?? 0, color:"#f59e0b", emoji:"📄" },
                    { label:"صور",     val: archive.stats.images ?? 0,    color:"#7c3aed", emoji:"🖼️" },
                    { label:"أكواد",   val: archive.stats.code ?? 0,      color:"#059669", emoji:"💻" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "#f8fafc", border: `1.5px solid ${s.color}20`, borderRadius: 12, padding: "10px 6px", textAlign: "center" }}>
                      <p style={{ fontSize: "1rem", margin: "0 0 2px" }}>{s.emoji}</p>
                      <p style={{ fontWeight: 900, fontSize: "1.1rem", color: s.color, margin: "0 0 1px", lineHeight: 1 }}>{s.val}</p>
                      <p style={{ fontSize: "0.58rem", color: "#9ca3af", margin: 0, fontWeight: 600 }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* filter */}
                <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 14 }}>
                  {WORK_TYPE_FILTER.map(f => (
                    <button key={f} onClick={() => setWorkFilter(f)}
                      style={{ background: workFilter===f?"#000":"#f1f5f9", color: workFilter===f?"#fff":"#374151", border: workFilter===f?"none":"1.5px solid #e2e8f0", borderRadius: 20, padding: "5px 13px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {WORK_FILTER_AR[f] ?? f}
                    </button>
                  ))}
                </div>

                {filteredWorks.length === 0 ? (
                  <EmptyState icon="🔍" text="لا توجد أعمال بهذا التصنيف" cta="ابدأ محادثة" href="/chat" />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {filteredWorks.map(w => (
                      <Link key={w.id} href={`/chat?id=${w.convId}`}>
                        <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 13, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor="#000")}
                          onMouseLeave={e => (e.currentTarget.style.borderColor="#e2e8f0")}>
                          <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>{w.emoji}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 800, fontSize: "0.82rem", color: "#000", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ background: "#f1f5f9", color: "#6b7280", fontSize: "0.62rem", fontWeight: 700, padding: "1px 7px", borderRadius: 20 }}>{w.label}</span>
                              <span style={{ color: "#9ca3af", fontSize: "0.62rem" }}>{new Date(w.date).toLocaleDateString("ar-EG")}</span>
                            </div>
                          </div>
                          <ChevronRight style={{ width: 14, height: 14, color: "#d1d5db", flexShrink: 0 }} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.68rem", marginTop: 18 }}>
                  إجمالي {archive.total} عمل من {archive.totalConvs} محادثة
                </p>
              </>
            )}
          </div>
        )}

        {/* ══════════ TAB: MESSAGES ══════════ */}
        {activeTab === "messages" && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)", minHeight: 400 }}>
            {/* header */}
            <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "14px 14px 0 0", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>👑</div>
              <div>
                <p style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", margin: 0 }}>خالد سلمان — الإدارة</p>
                <p style={{ fontSize: "0.65rem", color: "#9ca3af", margin: 0 }}>تواصل مباشر مع الإدارة</p>
              </div>
            </div>

            {/* messages thread */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, background: "#fff", border: "1.5px solid #e2e8f0", borderTop: "none" }}>
              {msgsLoading ? (
                <div style={{ textAlign: "center", padding: 30, color: "#9ca3af" }}>جاري التحميل...</div>
              ) : msgs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <p style={{ fontSize: "2.5rem", margin: "0 0 10px" }}>💬</p>
                  <p style={{ fontWeight: 800, color: "#000", fontSize: "0.9rem", margin: "0 0 6px" }}>لا توجد رسائل بعد</p>
                  <p style={{ color: "#9ca3af", fontSize: "0.78rem", margin: 0 }}>اكتب رسالتك أدناه وسيرد عليك خالد سلمان</p>
                </div>
              ) : (
                <>
                  {msgs.map(m => {
                    const isUser = m.direction === "user_to_admin";
                    return (
                      <div key={m.id} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                        <div style={{
                          maxWidth: "78%",
                          background: isUser ? "#000" : "#f1f5f9",
                          color: isUser ? "#fff" : "#000",
                          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          padding: "10px 14px",
                        }}>
                          {!isUser && (
                            <p style={{ fontSize: "0.6rem", color: "#7c3aed", fontWeight: 800, margin: "0 0 4px" }}>👑 خالد سلمان</p>
                          )}
                          <p style={{ fontSize: "0.82rem", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>{m.content}</p>
                          <p style={{ fontSize: "0.58rem", opacity: 0.6, margin: "4px 0 0", textAlign: isUser ? "left" : "right" }}>
                            {new Date(m.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={msgEndRef} />
                </>
              )}
            </div>

            {/* input */}
            <div style={{ border: "1.5px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 14px 14px", padding: "10px 12px", background: "#fff", display: "flex", gap: 8 }}>
              <textarea
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="اكتب رسالتك للإدارة... (Enter للإرسال)"
                rows={2}
                style={{ flex: 1, background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "9px 12px", borderRadius: 10, fontSize: "0.82rem", fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.55 }}
              />
              <button onClick={sendMessage} disabled={!newMsg.trim() || sending}
                style={{ background: newMsg.trim()&&!sending?"#000":"#d1d5db", color: "#fff", border: "none", borderRadius: 10, width: 42, cursor: newMsg.trim()&&!sending?"pointer":"not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {sending
                  ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #fff", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
                  : <Send style={{ width: 15, height: 15 }} />}
              </button>
            </div>
            <p style={{ fontSize: "0.62rem", color: "#9ca3af", textAlign: "center", marginTop: 8 }}>
              يمكنك أيضاً التواصل عبر واتساب: +967 783 701 365
            </p>
          </div>
        )}

        {/* ══════════ TAB: SUBSCRIPTION ══════════ */}
        {activeTab === "subscription" && usage && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* current plan card */}
            <div style={{ background: isPaid?"#fffbeb":"#f8fafc", border: `2px solid ${isPaid?"#f59e0b":"#e2e8f0"}`, borderRadius: 18, padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                {(() => { const Icon = PLAN_ICON[usage.plan] ?? Star; return <div style={{ width: 46, height: 46, borderRadius: "50%", background: `${PLAN_COLOR[usage.plan]}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon style={{ width: 22, height: 22, color: PLAN_COLOR[usage.plan] }} /></div>; })()}
                <div>
                  <p style={{ fontWeight: 900, fontSize: "1.05rem", color: "#000", margin: "0 0 2px" }}>خطة {PLAN_AR[usage.plan] ?? usage.plan}</p>
                  <span style={{ background: `${PLAN_COLOR[usage.plan]}15`, color: PLAN_COLOR[usage.plan], fontSize: "0.68rem", fontWeight: 800, padding: "2px 10px", borderRadius: 20 }}>
                    {usage.unlimited ? "✅ وصول لامحدود" : `${usage.designTasksToday}/${usage.designTaskLimit} طلب اليوم`}
                  </span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "rgba(0,0,0,0.04)", borderRadius: 10, padding: "10px 12px" }}>
                  <p style={{ color: "#9ca3af", fontSize: "0.62rem", margin: "0 0 2px", fontWeight: 600 }}>إجمالي رسائلك</p>
                  <p style={{ fontWeight: 900, fontSize: "1.2rem", color: "#000", margin: 0 }}>{usage.totalMessages}</p>
                </div>
                <div style={{ background: "rgba(0,0,0,0.04)", borderRadius: 10, padding: "10px 12px" }}>
                  <p style={{ color: "#9ca3af", fontSize: "0.62rem", margin: "0 0 2px", fontWeight: 600 }}>حجز اليوم</p>
                  <p style={{ fontWeight: 900, fontSize: "1.2rem", color: "#000", margin: 0 }}>{usage.designTasksToday}</p>
                </div>
              </div>
              {usage.validUntil && (() => {
                const daysLeft = Math.ceil((new Date(usage.validUntil).getTime() - Date.now()) / 86400000);
                const isWarn = daysLeft <= 7;
                return (
                  <div style={{ marginTop: 12, background: isWarn?"#fef2f2":"#f0fdf4", border: `1.5px solid ${isWarn?"#fca5a5":"#bbf7d0"}`, borderRadius: 10, padding: "9px 13px", display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock style={{ width: 14, height: 14, color: isWarn?"#ef4444":"#22c55e", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "#000", margin: 0 }}>
                        ينتهي: {new Date(usage.validUntil).toLocaleDateString("ar-YE", { year:"numeric", month:"long", day:"numeric" })}
                      </p>
                      <p style={{ color: isWarn?"#ef4444":"#22c55e", fontSize: "0.65rem", margin: "1px 0 0" }}>
                        {daysLeft <= 0 ? "منتهي ⚠️" : daysLeft === 1 ? "يوم واحد متبقٍ" : `${daysLeft} يوم متبقٍ`}
                      </p>
                    </div>
                    {isWarn && (
                      <Link href="/subscribe">
                        <button style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 7, padding: "5px 11px", fontWeight: 700, fontSize: "0.7rem", cursor: "pointer", whiteSpace: "nowrap" }}>جدد الآن</button>
                      </Link>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* available plans */}
            <div>
              <p style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", marginBottom: 12 }}>🆙 الخطط المتاحة للترقية</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { plan:"weekly",     price:"$2.99",    icon:Zap,       features:["رسائل غير محدودة","دعم أولوي","كل الأدوات"] },
                  { plan:"monthly",    price:"$9.99",    icon:Sparkles,  features:["كل مزايا الأسبوعي","تخزين أعمال","تقارير شهرية"] },
                  { plan:"annual",     price:"$79.99",   icon:Crown,     features:["كل المزايا","أرخص 30%","أولوية قصوى"] },
                  { plan:"enterprise", price:"بالتفاوض", icon:Building2, features:["حلول مؤسسية","API مخصص","دعم 24/7"] },
                ].map(p => {
                  const Icon = p.icon;
                  const isCurrent = usage.plan === p.plan;
                  return (
                    <div key={p.plan} style={{ background: isCurrent?"#f0fdf4":"#f8fafc", border: `2px solid ${isCurrent?"#22c55e":PLAN_COLOR[p.plan]+"30"}`, borderRadius: 14, padding: "14px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <Icon style={{ width: 18, height: 18, color: PLAN_COLOR[p.plan] }} />
                        <p style={{ fontWeight: 900, fontSize: "0.88rem", color: "#000", margin: 0 }}>{PLAN_AR[p.plan]}</p>
                        {isCurrent && <span style={{ background: "#22c55e", color: "#fff", fontSize: "0.55rem", fontWeight: 900, padding: "1px 6px", borderRadius: 20, marginRight: "auto" }}>حالي</span>}
                      </div>
                      <p style={{ fontWeight: 900, fontSize: "1.1rem", color: PLAN_COLOR[p.plan], margin: "0 0 8px" }}>{p.price}</p>
                      <ul style={{ margin: 0, padding: "0 16px 0 0", listStyle: "none", display: "flex", flexDirection: "column", gap: 3 }}>
                        {p.features.map((f, i) => (
                          <li key={i} style={{ fontSize: "0.65rem", color: "#374151", display: "flex", alignItems: "center", gap: 5 }}>
                            <CheckCircle2 style={{ width: 10, height: 10, color: "#22c55e", flexShrink: 0 }} />{f}
                          </li>
                        ))}
                      </ul>
                      {!isCurrent && (
                        <Link href="/subscribe">
                          <button style={{ width: "100%", marginTop: 10, background: "#000", color: "#fff", border: "none", borderRadius: 9, padding: "8px", fontWeight: 800, fontSize: "0.75rem", cursor: "pointer" }}>
                            اشترك الآن
                          </button>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* payment history */}
            {payments.length > 0 && (
              <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: "16px" }}>
                <p style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 7 }}>
                  <Receipt style={{ width: 15, height: 15, color: "#6b7280" }} />سجل المدفوعات
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {payments.map(p => {
                    const st = PAYMENT_STATUS[p.status] ?? { label: p.status, color: "#6b7280", bg: "#f8fafc" };
                    return (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "#000", margin: 0 }}>{PLAN_AR[p.planRequested] ?? p.planRequested}</p>
                          <p style={{ fontSize: "0.6rem", color: "#9ca3af", margin: "1px 0 0" }}>{new Date(p.createdAt).toLocaleDateString("ar-EG")}</p>
                        </div>
                        <span style={{ color: st.color, fontSize: "0.7rem", fontWeight: 800 }}>{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ks-blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}

/* ─── reusable empty state ─── */
function EmptyState({ icon, text, cta, href }: { icon: string; text: string; cta: string; href: string }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 20px" }}>
      <p style={{ fontSize: "2.2rem", margin: "0 0 8px" }}>{icon}</p>
      <p style={{ fontWeight: 700, color: "#9ca3af", fontSize: "0.85rem", margin: "0 0 12px" }}>{text}</p>
      <Link href={href}>
        <button style={{ background: "#000", color: "#fff", border: "none", borderRadius: 10, padding: "9px 20px", fontWeight: 800, fontSize: "0.8rem", cursor: "pointer" }}>{cta}</button>
      </Link>
    </div>
  );
}
