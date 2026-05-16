import { useState, useEffect } from "react";
import { useUser } from "@clerk/react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Send, Clock, CheckCircle2, XCircle, AlertCircle,
  Globe, Palette, Code2, FileText, Megaphone, BarChart3,
  Briefcase, GraduationCap, Zap, ChevronDown, ChevronUp,
  RefreshCw, Plus,
} from "lucide-react";

/* ─── types ─── */
interface ServiceReq {
  id: number; category: string; title: string; description: string;
  budget: string | null; deadline: string | null;
  status: string; adminNotes: string | null; priority: string | null;
  createdAt: string;
}

/* ─── categories ─── */
const CATEGORIES = [
  { id: "website",       emoji: "🌐", label: "موقع ويب متكامل",           desc: "تصميم وبرمجة موقع احترافي مخصص" },
  { id: "app",           emoji: "📱", label: "تطبيق موبايل",              desc: "تطبيق Android/iOS أو PWA" },
  { id: "design",        emoji: "🎨", label: "هوية بصرية / تصميم",       desc: "لوغو، بنرات، هوية بصرية كاملة" },
  { id: "marketing",     emoji: "📣", label: "تسويق رقمي وسوشيال ميديا", desc: "استراتيجية، محتوى، إعلانات مدفوعة" },
  { id: "analysis",      emoji: "📊", label: "تحليل بيانات وتقارير",     desc: "Excel، Power BI، إحصاء، رسوم بيانية" },
  { id: "academic",      emoji: "🎓", label: "خدمات أكاديمية",           desc: "مشاريع تخرج، أبحاث، عروض جامعية" },
  { id: "content",       emoji: "✍️",  label: "محتوى وكتابة احترافية",   desc: "مقالات، كتب إلكترونية، سكريبت فيديو" },
  { id: "automation",    emoji: "⚡", label: "أتمتة وأنظمة ذكية",       desc: "Bots، APIs، تكامل منصات، أدوات مخصصة" },
  { id: "consulting",    emoji: "💼", label: "استشارة أعمال وتقنية",     desc: "تخطيط، دراسة جدوى، نصائح تقنية" },
  { id: "other",         emoji: "🔧", label: "خدمة مخصصة أخرى",         desc: "أي طلب معقد لا يندرج ضمن الفئات" },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending:     { label: "⏳ بانتظار الإدارة", color: "#b45309", bg: "#fffbeb", icon: Clock },
  reviewing:   { label: "👀 قيد المراجعة",   color: "#1d4ed8", bg: "#eff6ff", icon: AlertCircle },
  "in-progress":{ label: "⚙️ قيد التنفيذ",   color: "#7c3aed", bg: "#f5f3ff", icon: Zap },
  done:        { label: "✅ مكتمل",           color: "#166534", bg: "#f0fdf4", icon: CheckCircle2 },
  rejected:    { label: "❌ مرفوض",           color: "#991b1b", bg: "#fef2f2", icon: XCircle },
};

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  low:    { label: "🟢 عادي",   color: "#059669" },
  normal: { label: "🟡 متوسط",  color: "#d97706" },
  high:   { label: "🔴 عاجل",   color: "#dc2626" },
};

/* ════════════════════════════════════════ */
export default function DeepServicesPage() {
  const { user, isLoaded } = useUser();
  const [, setLocation] = useLocation();

  const [view, setView] = useState<"list" | "form">("list");
  const [myReqs, setMyReqs] = useState<ServiceReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  /* form state */
  const [selCategory, setSelCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const fetchMyReqs = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/deep-services/my");
      if (r.ok) setMyReqs(await r.json() as ServiceReq[]);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMyReqs(); }, []);
  useEffect(() => { if (isLoaded && !user) setLocation("/sign-in"); }, [isLoaded, user, setLocation]);

  const submitRequest = async () => {
    if (!selCategory || !title.trim() || !description.trim()) {
      setError("الرجاء تعبئة الحقول المطلوبة: الفئة، العنوان، والوصف.");
      return;
    }
    setSubmitting(true); setError("");
    try {
      const r = await fetch("/api/deep-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selCategory, title: title.trim(), description: description.trim(), budget: budget.trim() || undefined, deadline: deadline.trim() || undefined }),
      });
      if (r.ok) {
        const newReq = await r.json() as ServiceReq;
        setMyReqs(prev => [newReq, ...prev]);
        setSubmitted(true);
        setTimeout(() => { setSubmitted(false); setView("list"); resetForm(); }, 2200);
      } else {
        const d = await r.json() as { error?: string };
        setError(d.error ?? "فشل الإرسال، حاول مرة أخرى.");
      }
    } catch { setError("تعذّر الاتصال بالخادم."); }
    finally { setSubmitting(false); }
  };

  const resetForm = () => {
    setSelCategory(""); setTitle(""); setDescription("");
    setBudget(""); setDeadline(""); setError("");
  };

  if (!isLoaded) return <FullLoader />;
  if (!user) return null;

  const cat = CATEGORIES.find(c => c.id === selCategory);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#fff", color: "#000", fontFamily: "'Cairo','Tajawal',sans-serif" }}>

      {/* ── sticky header ── */}
      <div style={{ background: "#000", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}>
            <button onClick={() => view === "form" ? (setView("list"), resetForm()) : setLocation("/chat")}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: 34, height: 34, borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ArrowLeft style={{ width: 15, height: 15 }} />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#fff", fontWeight: 900, fontSize: "1rem", margin: 0 }}>⚙️ الخدمات العميقة الغير محدودة</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", margin: "2px 0 0" }}>طلبات معقدة تُعالَج مباشرة من فريق خالد سلمان</p>
            </div>
            {view === "list" && (
              <button onClick={() => setView("form")}
                style={{ background: "#fff", color: "#000", border: "none", borderRadius: 9, padding: "7px 14px", fontWeight: 900, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Plus style={{ width: 13, height: 13 }} />طلب جديد
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 16px 80px" }}>

        {/* ════ FORM VIEW ════ */}
        {view === "form" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {submitted && (
              <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 16, padding: 20, textAlign: "center" }}>
                <p style={{ fontSize: "2rem", margin: "0 0 8px" }}>✅</p>
                <p style={{ fontWeight: 900, fontSize: "1rem", color: "#166534", margin: "0 0 4px" }}>تم إرسال طلبك بنجاح!</p>
                <p style={{ color: "#15803d", fontSize: "0.8rem", margin: 0 }}>سيتواصل معك فريق خالد سلمان خلال 24-48 ساعة.</p>
              </div>
            )}

            {!submitted && (
              <>
                {/* category picker */}
                <div>
                  <p style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", margin: "0 0 10px" }}>
                    📂 اختر فئة الخدمة <span style={{ color: "#ef4444" }}>*</span>
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {CATEGORIES.map(c => (
                      <button key={c.id} onClick={() => setSelCategory(c.id)}
                        style={{
                          background: selCategory === c.id ? "#000" : "#f8fafc",
                          color: selCategory === c.id ? "#fff" : "#000",
                          border: selCategory === c.id ? "2px solid #000" : "1.5px solid #e2e8f0",
                          borderRadius: 12, padding: "10px 12px", cursor: "pointer",
                          textAlign: "right", transition: "all 0.15s",
                        }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: "1.2rem" }}>{c.emoji}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 800, fontSize: "0.78rem", margin: 0, color: "inherit" }}>{c.label}</p>
                            <p style={{ fontSize: "0.6rem", margin: "1px 0 0", opacity: 0.65, color: "inherit", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.desc}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* title */}
                <div>
                  <label style={{ fontWeight: 800, fontSize: "0.85rem", color: "#000", display: "block", marginBottom: 6 }}>
                    📝 عنوان الطلب <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder={cat ? `مثال: ${cat.label} لـ...` : "وصف مختصر لما تحتاجه"}
                    style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "11px 13px", borderRadius: 11, fontSize: "0.85rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                {/* description */}
                <div>
                  <label style={{ fontWeight: 800, fontSize: "0.85rem", color: "#000", display: "block", marginBottom: 6 }}>
                    📋 وصف تفصيلي للطلب <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
                    placeholder="اشرح بالتفصيل ما تحتاجه بالضبط: الهدف، المتطلبات، التصميم المطلوب، الجمهور المستهدف، أي مراجع أو أمثلة..."
                    style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "11px 13px", borderRadius: 11, fontSize: "0.82rem", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.7, boxSizing: "border-box" }}
                  />
                </div>

                {/* budget + deadline */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontWeight: 800, fontSize: "0.82rem", color: "#000", display: "block", marginBottom: 6 }}>💰 الميزانية (اختياري)</label>
                    <input value={budget} onChange={e => setBudget(e.target.value)}
                      placeholder="مثال: 20-50 دولار"
                      style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "10px 12px", borderRadius: 10, fontSize: "0.8rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: 800, fontSize: "0.82rem", color: "#000", display: "block", marginBottom: 6 }}>📅 الموعد المطلوب (اختياري)</label>
                    <input value={deadline} onChange={e => setDeadline(e.target.value)}
                      placeholder="مثال: خلال أسبوع"
                      style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "10px 12px", borderRadius: 10, fontSize: "0.8rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {/* info box */}
                <div style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 12, padding: "12px 14px" }}>
                  <p style={{ fontWeight: 800, fontSize: "0.82rem", color: "#0369a1", margin: "0 0 4px" }}>ℹ️ كيف تعمل الخدمات العميقة؟</p>
                  <p style={{ color: "#0c4a6e", fontSize: "0.75rem", lineHeight: 1.7, margin: 0 }}>
                    بعد إرسال طلبك، يصل مباشرة إلى فريق خالد سلمان للمراجعة.
                    ستتلقى رداً خلال 24-48 ساعة عبر المراسلة في التطبيق أو واتساب.
                    يمكن أن تكون الخدمة مجانية (ضمن الدردشة) أو مدفوعة حسب التعقيد.
                  </p>
                </div>

                {error && (
                  <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertCircle style={{ width: 15, height: 15, color: "#ef4444", flexShrink: 0 }} />
                    <p style={{ color: "#991b1b", fontSize: "0.8rem", fontWeight: 700, margin: 0 }}>{error}</p>
                  </div>
                )}

                <button onClick={submitRequest} disabled={submitting}
                  style={{ width: "100%", background: submitting ? "#9ca3af" : "#000", color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontWeight: 900, fontSize: "0.9rem", cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {submitting
                    ? <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #fff", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />جاري الإرسال...</>
                    : <><Send style={{ width: 16, height: 16 }} />إرسال الطلب إلى الإدارة</>}
                </button>
              </>
            )}
          </div>
        )}

        {/* ════ LIST VIEW ════ */}
        {view === "list" && (
          <>
            {/* intro banner */}
            <div style={{ background: "linear-gradient(135deg, #000 0%, #1a1a2e 100%)", borderRadius: 18, padding: "22px 20px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, left: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
              <p style={{ color: "#f59e0b", fontWeight: 900, fontSize: "0.7rem", margin: "0 0 8px", letterSpacing: 1 }}>⚙️ DEEP SERVICES</p>
              <h1 style={{ color: "#fff", fontWeight: 900, fontSize: "1.3rem", margin: "0 0 8px", lineHeight: 1.3 }}>الخدمات العميقة<br /><span style={{ color: "#f59e0b" }}>الغير محدودة</span></h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", margin: "0 0 16px", lineHeight: 1.7 }}>
                لمشاريعك المعقدة التي تتجاوز حدود الدردشة — فريق خالد سلمان يتولى معالجتها مباشرة بدقة عالية.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { emoji: "🎯", label: "تنفيذ مباشر" },
                  { emoji: "⏱️", label: "24-48 ساعة" },
                  { emoji: "💬", label: "تواصل مستمر" },
                ].map((f, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "9px 6px", textAlign: "center" }}>
                    <p style={{ fontSize: "1.1rem", margin: "0 0 3px" }}>{f.emoji}</p>
                    <p style={{ color: "#fff", fontSize: "0.62rem", fontWeight: 700, margin: 0 }}>{f.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* categories grid */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", margin: "0 0 12px" }}>🗂️ فئات الخدمات</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => { setSelCategory(c.id); setView("form"); }}
                    style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 13, padding: "13px 12px", cursor: "pointer", textAlign: "right", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#000"; e.currentTarget.style.borderColor = "#000"; e.currentTarget.querySelector("p")!.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.querySelector("p")!.style.color = "#000"; }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{c.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 800, fontSize: "0.78rem", color: "#000", margin: "0 0 2px" }}>{c.label}</p>
                        <p style={{ fontSize: "0.62rem", color: "#9ca3af", margin: 0, lineHeight: 1.4 }}>{c.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* my requests */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", margin: 0 }}>📋 طلباتي ({myReqs.length})</p>
                <button onClick={fetchMyReqs}
                  style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "5px 11px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  <RefreshCw style={{ width: 11, height: 11 }} />تحديث
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #000", borderTopColor: "transparent", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
                </div>
              ) : myReqs.length === 0 ? (
                <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: "40px 20px", textAlign: "center" }}>
                  <p style={{ fontSize: "2.5rem", margin: "0 0 10px" }}>📭</p>
                  <p style={{ fontWeight: 800, color: "#000", fontSize: "0.9rem", margin: "0 0 6px" }}>لا توجد طلبات بعد</p>
                  <p style={{ color: "#9ca3af", fontSize: "0.78rem", margin: "0 0 16px" }}>أرسل طلبك الأول وسيتولى الفريق معالجته</p>
                  <button onClick={() => setView("form")}
                    style={{ background: "#000", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 900, fontSize: "0.82rem", cursor: "pointer" }}>
                    + إرسال طلب
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {myReqs.map(req => {
                    const st = STATUS_MAP[req.status] ?? { label: req.status, color: "#6b7280", bg: "#f8fafc", icon: Clock };
                    const catInfo = CATEGORIES.find(c => c.id === req.category);
                    const expanded = expandedId === req.id;
                    return (
                      <div key={req.id} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
                        <div style={{ padding: "13px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
                          onClick={() => setExpandedId(expanded ? null : req.id)}>
                          <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{catInfo?.emoji ?? "🔧"}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 800, fontSize: "0.82rem", color: "#000", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{req.title}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ background: st.bg, color: st.color, fontSize: "0.62rem", fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>{st.label}</span>
                              {req.priority && PRIORITY_MAP[req.priority] && (
                                <span style={{ color: PRIORITY_MAP[req.priority]!.color, fontSize: "0.62rem", fontWeight: 800 }}>{PRIORITY_MAP[req.priority]!.label}</span>
                              )}
                              <span style={{ color: "#9ca3af", fontSize: "0.6rem" }}>{new Date(req.createdAt).toLocaleDateString("ar-EG")}</span>
                            </div>
                          </div>
                          {expanded ? <ChevronUp style={{ width: 15, height: 15, color: "#9ca3af", flexShrink: 0 }} /> : <ChevronDown style={{ width: 15, height: 15, color: "#9ca3af", flexShrink: 0 }} />}
                        </div>
                        {expanded && (
                          <div style={{ borderTop: "1px solid #f1f5f9", padding: "12px 14px", background: "#f8fafc" }}>
                            <p style={{ fontSize: "0.78rem", color: "#374151", lineHeight: 1.7, margin: "0 0 8px", whiteSpace: "pre-wrap" }}>{req.description}</p>
                            {(req.budget || req.deadline) && (
                              <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                                {req.budget && <p style={{ fontSize: "0.72rem", color: "#059669", fontWeight: 700, margin: 0 }}>💰 {req.budget}</p>}
                                {req.deadline && <p style={{ fontSize: "0.72rem", color: "#7c3aed", fontWeight: 700, margin: 0 }}>📅 {req.deadline}</p>}
                              </div>
                            )}
                            {req.adminNotes && (
                              <div style={{ background: "#fffbeb", border: "1.5px solid #fcd34d", borderRadius: 10, padding: "10px 12px" }}>
                                <p style={{ fontWeight: 800, fontSize: "0.72rem", color: "#92400e", margin: "0 0 4px" }}>💬 رد الإدارة:</p>
                                <p style={{ fontSize: "0.78rem", color: "#000", margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{req.adminNotes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function FullLoader() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid #000", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
