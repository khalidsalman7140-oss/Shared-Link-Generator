import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Send, Plus, Globe, Copy, CheckCheck, Download, Eye,
  Trash2, RefreshCw, Zap, Code2, FileText, BarChart3, MessageSquare,
  Briefcase, AlertCircle, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  ExternalLink, GraduationCap,
} from "lucide-react";

/* ── Types ── */
interface Artifact {
  id: number; type: string; title: string; content: string;
  siteUrl: string | null; siteSlug: string | null; platform: string | null;
  request: string; createdAt: string;
}
interface ServiceReq {
  id: number; category: string; title: string; description: string;
  budget: string | null; deadline: string | null;
  status: string; adminNotes: string | null; priority: string | null;
  createdAt: string;
}

/* ── Consts ── */
const TYPE_META: Record<string, { icon: string; label: string; color: string }> = {
  website:  { icon: "🌐", label: "موقع ويب",     color: "#2563eb" },
  cv:       { icon: "📄", label: "سيرة ذاتية",   color: "#7c3aed" },
  code:     { icon: "💻", label: "كود برمجي",     color: "#059669" },
  social:   { icon: "📱", label: "منشور سوشيال",  color: "#e1306c" },
  content:  { icon: "✍️",  label: "محتوى",         color: "#d97706" },
  analysis: { icon: "📊", label: "تحليل",          color: "#0891b2" },
  video:    { icon: "🎬", label: "سكريبت فيديو",  color: "#7c3aed" },
  other:    { icon: "⚙️",  label: "أخرى",          color: "#374151" },
};

const QUICK_SUGGESTIONS = [
  { text: "أنشئ صفحة هبوط احترافية لمتجر يمني", icon: "🌐" },
  { text: "اكتب حالة واتساب تحفيزية جميلة", icon: "💬" },
  { text: "اكتب كود Python لقراءة ملف CSV وتحليله", icon: "🐍" },
  { text: "صمم سكريبت فيديو إعلاني 60 ثانية", icon: "🎬" },
  { text: "أنشئ سيرة ذاتية احترافية بتصميم جميل", icon: "📄" },
  { text: "اكتب منشور إنستغرام مع هاشتاقات", icon: "📱" },
];

const CATEGORIES = [
  { id: "website",    emoji: "🌐", label: "موقع ويب", desc: "تصميم وبرمجة موقع احترافي" },
  { id: "app",        emoji: "📱", label: "تطبيق موبايل", desc: "Android/iOS أو PWA" },
  { id: "design",     emoji: "🎨", label: "تصميم بصري", desc: "لوغو، بنرات، هوية" },
  { id: "marketing",  emoji: "📣", label: "تسويق رقمي", desc: "محتوى، إعلانات، استراتيجية" },
  { id: "analysis",   emoji: "📊", label: "تحليل بيانات", desc: "Excel، Power BI، إحصاء" },
  { id: "academic",   emoji: "🎓", label: "خدمات أكاديمية", desc: "مشاريع، أبحاث، عروض" },
  { id: "content",    emoji: "✍️",  label: "محتوى وكتابة", desc: "مقالات، كتب، سكريبت" },
  { id: "automation", emoji: "⚡", label: "أتمتة وأنظمة", desc: "Bots، APIs، أدوات" },
  { id: "consulting", emoji: "💼", label: "استشارة", desc: "تخطيط، دراسة جدوى" },
  { id: "other",      emoji: "🔧", label: "خدمة أخرى", desc: "أي طلب معقد" },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:      { label: "⏳ بانتظار الإدارة", color: "#b45309", bg: "#fffbeb" },
  reviewing:    { label: "👀 قيد المراجعة",    color: "#1d4ed8", bg: "#eff6ff" },
  "in-progress":{ label: "⚙️ قيد التنفيذ",    color: "#7c3aed", bg: "#f5f3ff" },
  done:         { label: "✅ مكتمل",            color: "#166534", bg: "#f0fdf4" },
  rejected:     { label: "❌ مرفوض",            color: "#991b1b", bg: "#fef2f2" },
};

/* ════════════════════════════════════════ */
export default function DeepServicesPage() {
  const { user, isLoaded } = useUser();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"agent" | "workspace" | "requests">("agent");

  useEffect(() => { if (isLoaded && !user) setLocation("/sign-in"); }, [isLoaded, user, setLocation]);
  if (!isLoaded) return <FullLoader />;
  if (!user) return null;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#fff", color: "#000", fontFamily: "'Cairo','Tajawal',sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#000", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}>
            <button onClick={() => setLocation("/chat")}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: 34, height: 34, borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ArrowLeft style={{ width: 15, height: 15 }} />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#fff", fontWeight: 900, fontSize: "1rem", margin: 0 }}>⚡ وحدة الذكاء التنفيذي</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.62rem", margin: "1px 0 0" }}>وكيل ذكي يُنجز طلبك فوراً — مواقع، كود، محتوى، تحليل</p>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, paddingBottom: 1 }}>
            {[
              { id: "agent" as const,    label: "🤖 الوكيل الذكي" },
              { id: "workspace" as const,label: "📂 مساحة عملي" },
              { id: "requests" as const, label: "📋 طلباتي" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ background: tab === t.id ? "#fff" : "transparent", color: tab === t.id ? "#000" : "rgba(255,255,255,0.6)", border: "none", borderRadius: "9px 9px 0 0", padding: "7px 16px", fontWeight: 800, fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 80px" }}>
        {tab === "agent"     && <AgentTab />}
        {tab === "workspace" && <WorkspaceTab />}
        {tab === "requests"  && <RequestsTab />}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}

/* ════════════ AGENT TAB ════════════ */
function AgentTab() {
  const [request, setRequest]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [result, setResult]     = useState<{
    type: string; title: string; content: string;
    siteUrl: string | null; siteSlug: string | null; platform: string | null;
  } | null>(null);
  const [copied, setCopied]     = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const run = async () => {
    if (!request.trim()) { setError("اكتب طلبك أولاً"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: request.trim() }),
      });
      const d = await r.json() as typeof result & { error?: string };
      if (!r.ok) { setError(d.error ?? "فشل الوكيل"); return; }
      setResult(d);
    } catch { setError("تعذّر الاتصال بالخادم."); }
    finally { setLoading(false); }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.content).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const download = () => {
    if (!result) return;
    const ext = result.type === "website" || result.type === "cv" ? "html" :
                result.type === "code" ? "txt" : "txt";
    const blob = new Blob([result.content], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${result.title.replace(/\s+/g, "-")}.${ext}`;
    a.click();
  };

  const meta = result ? (TYPE_META[result.type] ?? TYPE_META["other"]!) : null;
  const isWebsite = result && (result.type === "website" || result.type === "cv");

  return (
    <div>
      {/* Input Card */}
      <div style={{ background: "#000", borderRadius: 18, padding: "20px", marginBottom: 20 }}>
        <p style={{ color: "#fff", fontWeight: 900, fontSize: "0.9rem", margin: "0 0 4px" }}>🤖 ماذا تريد أن أُنجز لك الآن؟</p>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.68rem", margin: "0 0 14px" }}>اكتب أي طلب — موقع، كود، منشور، تحليل، مقال، سيرة ذاتية…</p>

        <textarea
          ref={textareaRef}
          value={request}
          onChange={e => setRequest(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) run(); }}
          rows={4}
          placeholder="مثال: أنشئ صفحة هبوط احترافية لمتجر ملابس يمني باللون الأسود والذهبي..."
          style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", color: "#fff", padding: "12px 14px", borderRadius: 12, fontSize: "0.85rem", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.7, boxSizing: "border-box", minHeight: 100 }}
        />

        {/* Quick suggestions */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 12, marginBottom: 16 }}>
          {QUICK_SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => setRequest(s.text)}
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)", borderRadius: 20, padding: "4px 12px", fontSize: "0.65rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {s.icon} {s.text}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "8px 12px", marginBottom: 12 }}>
            <p style={{ color: "#991b1b", fontSize: "0.78rem", fontWeight: 700, margin: 0 }}>⚠️ {error}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={run} disabled={loading}
            style={{ flex: 1, background: loading ? "#374151" : "#fff", color: loading ? "#9ca3af" : "#000", border: "none", borderRadius: 12, padding: "13px 20px", fontWeight: 900, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
            {loading
              ? <><Spinner white={false} />جاري التنفيذ... قد يستغرق دقيقة</>
              : <><Zap style={{ width: 16, height: 16 }} />تنفيذ فوري</>}
          </button>
          {result && (
            <button onClick={() => { setResult(null); setRequest(""); }}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: 12, padding: "13px 14px", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <RefreshCw style={{ width: 15, height: 15 }} />
            </button>
          )}
        </div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.6rem", textAlign: "center", marginTop: 8, marginBottom: 0 }}>Ctrl+Enter للتنفيذ السريع</p>
      </div>

      {/* Loading Animation */}
      {loading && (
        <div style={{ background: "#fff", border: "2px solid #000", borderRadius: 18, padding: "40px 20px", textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", border: "4px solid #000", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontWeight: 900, fontSize: "1rem", color: "#000", margin: "0 0 6px" }}>⚙️ الوكيل يعمل على طلبك...</p>
          <p style={{ color: "#6b7280", fontSize: "0.78rem", margin: 0, animation: "pulse 2s ease-in-out infinite" }}>يحلل ← يُصمم ← يُنتج ← يحفظ</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{ border: "2px solid #000", borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
          {/* Result Header */}
          <div style={{ background: "#000", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.3rem" }}>{meta?.icon}</span>
              <div>
                <p style={{ color: "#fff", fontWeight: 900, fontSize: "0.9rem", margin: 0 }}>{result.title}</p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", margin: 0 }}>{meta?.label} — جاهز ومحفوظ في مساحة عملك</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {isWebsite && result.siteUrl && (
                <a href={result.siteUrl} target="_blank" rel="noopener noreferrer"
                  style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 9, padding: "7px 12px", fontSize: "0.7rem", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
                  <ExternalLink style={{ width: 13, height: 13 }} />رابط حي
                </a>
              )}
              {isWebsite && (
                <button onClick={() => setShowPreview(!showPreview)}
                  style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 9, padding: "7px 12px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  <Eye style={{ width: 13, height: 13 }} />{showPreview ? "إخفاء" : "معاينة"}
                </button>
              )}
              <button onClick={copy}
                style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 9, padding: "7px 12px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                {copied ? <CheckCheck style={{ width: 13, height: 13, color: "#4ade80" }} /> : <Copy style={{ width: 13, height: 13 }} />}
                {copied ? "تم!" : "نسخ"}
              </button>
              <button onClick={download}
                style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 9, padding: "7px 12px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <Download style={{ width: 13, height: 13 }} />تنزيل
              </button>
            </div>
          </div>

          {/* Website Preview iframe */}
          {isWebsite && showPreview && result.siteUrl && (
            <div style={{ borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ background: "#f8fafc", padding: "6px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {["#ef4444","#f59e0b","#22c55e"].map((c,i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
                </div>
                <div style={{ flex: 1, background: "#fff", borderRadius: 6, padding: "3px 10px", fontSize: "0.65rem", color: "#6b7280", border: "1px solid #e2e8f0", textAlign: "left", direction: "ltr" }}>
                  yemenchat.replit.app{result.siteUrl}
                </div>
                <a href={result.siteUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#6b7280", display: "flex" }}>
                  <ExternalLink style={{ width: 12, height: 12 }} />
                </a>
              </div>
              <iframe
                src={result.siteUrl}
                style={{ width: "100%", height: 420, border: "none", display: "block" }}
                title="معاينة الموقع"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          )}

          {/* Content Display */}
          <div style={{ padding: "18px 18px", background: "#fff", maxHeight: isWebsite ? 300 : 500, overflowY: "auto" }}>
            {result.type === "code" ? (
              <pre style={{ background: "#1e1e2e", color: "#cdd6f4", padding: "16px", borderRadius: 12, fontSize: "0.8rem", overflowX: "auto", lineHeight: 1.6, margin: 0, fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {result.content}
              </pre>
            ) : (
              <p style={{ fontSize: "0.85rem", color: "#000", lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap" }}>{result.content}</p>
            )}
          </div>

          {/* Action Bar */}
          <div style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: "0.68rem", color: "#6b7280", margin: 0 }}>✅ محفوظ تلقائياً في مساحة عملك</p>
            <button onClick={() => setTab("workspace")}
              style={{ background: "#000", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              عرض مساحة العمل ←
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ fontSize: "3.5rem", margin: "0 0 12px" }}>⚡</p>
          <p style={{ fontWeight: 900, color: "#000", fontSize: "1rem", margin: "0 0 6px" }}>وكيل ذكي ينتظر أمرك</p>
          <p style={{ color: "#9ca3af", fontSize: "0.8rem", margin: "0 0 24px" }}>صِف ما تحتاجه بالتفصيل وسيُنجزه فوراً</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 500, margin: "0 auto" }}>
            {[
              { icon: "🌐", label: "مواقع ويب", sub: "HTML + رابط حي + نشر مجاني" },
              { icon: "💻", label: "كود وإصلاح", sub: "Python, JS, SQL وأكثر" },
              { icon: "🎬", label: "سكريبت فيديو", sub: "مع مصادر ميديا مجانية" },
              { icon: "💬", label: "واتساب وسوشيال", sub: "حالات، منشورات، هاشتاقات" },
            ].map((c, i) => (
              <div key={i} style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "16px 12px", textAlign: "center" }}>
                <p style={{ fontSize: "1.8rem", margin: "0 0 6px" }}>{c.icon}</p>
                <p style={{ fontWeight: 900, fontSize: "0.8rem", color: "#000", margin: "0 0 3px" }}>{c.label}</p>
                <p style={{ fontSize: "0.62rem", color: "#9ca3af", margin: 0 }}>{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  function setTab(t: "agent" | "workspace" | "requests") {
    window.dispatchEvent(new CustomEvent("ds-tab", { detail: t }));
  }
}

/* ════════════ WORKSPACE TAB ════════════ */
function WorkspaceTab() {
  const [items, setItems] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [previewItem, setPreviewItem] = useState<Artifact | null>(null);

  const fetch_ = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/ai/workspace");
      if (r.ok) setItems(await r.json() as Artifact[]);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { void fetch_(); }, []);

  const del = async (id: number) => {
    await fetch(`/api/ai/workspace/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(a => a.id !== id));
  };

  const copy = (content: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
  };

  const download = (item: Artifact) => {
    const ext = item.type === "website" || item.type === "cv" ? "html" : "txt";
    const blob = new Blob([item.content], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${item.title.replace(/\s+/g, "-")}.${ext}`;
    a.click();
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
      <Spinner white={false} />
    </div>
  );

  if (items.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>📂</p>
      <p style={{ fontWeight: 900, color: "#000", fontSize: "1rem", margin: "0 0 6px" }}>مساحة عملك فارغة</p>
      <p style={{ color: "#9ca3af", fontSize: "0.82rem", margin: 0 }}>استخدم الوكيل الذكي لإنتاج أول عمل وسيُحفظ هنا تلقائياً</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p style={{ fontWeight: 900, fontSize: "0.95rem", color: "#000", margin: 0 }}>📂 مساحة عملي ({items.length} عنصر)</p>
          <p style={{ color: "#9ca3af", fontSize: "0.7rem", margin: "2px 0 0" }}>كل ما أنتجه الوكيل الذكي لك — محفوظ وجاهز</p>
        </div>
        <button onClick={() => void fetch_()}
          style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", borderRadius: 9, padding: "7px 12px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
          <RefreshCw style={{ width: 12, height: 12 }} />تحديث
        </button>
      </div>

      {previewItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 900, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ background: "#000", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ color: "#fff", fontWeight: 900, fontSize: "0.88rem", margin: 0 }}>🌐 {previewItem.title}</p>
              <button onClick={() => setPreviewItem(null)}
                style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: "0.75rem" }}>✕ إغلاق</button>
            </div>
            {previewItem.siteUrl ? (
              <iframe src={previewItem.siteUrl} style={{ flex: 1, border: "none" }} title="معاينة" sandbox="allow-scripts allow-same-origin" />
            ) : (
              <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "0.82rem", color: "#000", lineHeight: 1.8 }}>{previewItem.content}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map(item => {
          const meta = TYPE_META[item.type] ?? TYPE_META["other"]!;
          const isExp = expandedId === item.id;
          const isWeb = item.type === "website" || item.type === "cv";
          return (
            <div key={item.id} style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: meta.color + "15", border: `1.5px solid ${meta.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.1rem" }}>
                  {meta.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 900, fontSize: "0.85rem", color: "#000", margin: "0 0 2px" }}>{item.title}</p>
                  <p style={{ fontSize: "0.68rem", color: "#9ca3af", margin: "0 0 4px" }}>
                    {meta.label} · {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "#6b7280", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    الطلب: {item.request.slice(0, 60)}{item.request.length > 60 ? "..." : ""}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                  {isWeb && item.siteUrl && (
                    <button onClick={() => setPreviewItem(item)}
                      style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "5px 9px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.65rem", fontWeight: 700 }}>
                      <Eye style={{ width: 11, height: 11 }} />معاينة
                    </button>
                  )}
                  {isWeb && item.siteUrl && (
                    <a href={item.siteUrl} target="_blank" rel="noopener noreferrer"
                      style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, padding: "5px 9px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.65rem", fontWeight: 700, textDecoration: "none" }}>
                      <ExternalLink style={{ width: 11, height: 11 }} />رابط
                    </a>
                  )}
                  <button onClick={() => copy(item.content)}
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#000", borderRadius: 8, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <Copy style={{ width: 12, height: 12 }} />
                  </button>
                  <button onClick={() => download(item)}
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#000", borderRadius: 8, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <Download style={{ width: 12, height: 12 }} />
                  </button>
                  <button onClick={() => setExpandedId(isExp ? null : item.id)}
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#000", borderRadius: 8, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    {isExp ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
                  </button>
                  <button onClick={() => del(item.id)}
                    style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#ef4444", borderRadius: 8, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <Trash2 style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              </div>
              {isExp && (
                <div style={{ padding: "0 14px 14px", borderTop: "1px solid #f1f5f9" }}>
                  <pre style={{
                    background: item.type === "code" ? "#1e1e2e" : "#f8fafc",
                    color: item.type === "code" ? "#cdd6f4" : "#000",
                    padding: "12px", borderRadius: 10, fontSize: "0.75rem", overflowX: "auto",
                    lineHeight: 1.7, margin: "12px 0 0", whiteSpace: "pre-wrap", wordBreak: "break-word",
                    maxHeight: 300, overflowY: "auto",
                  }}>
                    {item.content.slice(0, 3000)}{item.content.length > 3000 ? "\n\n... [اضغط تنزيل للمحتوى الكامل]" : ""}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════ REQUESTS TAB ════════════ */
function RequestsTab() {
  const [view, setView] = useState<"list" | "form">("list");
  const [myReqs, setMyReqs] = useState<ServiceReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
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
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { void fetchMyReqs(); }, []);

  const resetForm = () => { setSelCategory(""); setTitle(""); setDescription(""); setBudget(""); setDeadline(""); setError(""); };

  const submitRequest = async () => {
    if (!selCategory || !title.trim() || !description.trim()) { setError("يرجى تعبئة الحقول المطلوبة"); return; }
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
        setError(d.error ?? "فشل الإرسال");
      }
    } catch { setError("تعذّر الاتصال بالخادم."); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p style={{ fontWeight: 900, fontSize: "0.95rem", color: "#000", margin: 0 }}>📋 طلبات الخدمات العميقة</p>
          <p style={{ color: "#9ca3af", fontSize: "0.7rem", margin: "2px 0 0" }}>طلبات معقدة تُعالَج مباشرة من فريق خالد سلمان</p>
        </div>
        {view === "list" && (
          <button onClick={() => setView("form")}
            style={{ background: "#000", color: "#fff", border: "none", borderRadius: 9, padding: "8px 14px", fontWeight: 900, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
            <Plus style={{ width: 13, height: 13 }} />طلب جديد
          </button>
        )}
        {view === "form" && (
          <button onClick={() => { setView("list"); resetForm(); }}
            style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", borderRadius: 9, padding: "8px 14px", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit" }}>
            ← رجوع
          </button>
        )}
      </div>

      {view === "form" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {submitted && (
            <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 16, padding: 20, textAlign: "center" }}>
              <p style={{ fontSize: "2rem", margin: "0 0 8px" }}>✅</p>
              <p style={{ fontWeight: 900, fontSize: "1rem", color: "#166534", margin: "0 0 4px" }}>تم إرسال طلبك بنجاح!</p>
              <p style={{ color: "#15803d", fontSize: "0.8rem", margin: 0 }}>سيتواصل معك فريق خالد سلمان خلال 24-48 ساعة.</p>
            </div>
          )}
          {!submitted && (
            <>
              <div>
                <p style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", margin: "0 0 10px" }}>📂 اختر فئة الخدمة <span style={{ color: "#ef4444" }}>*</span></p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => setSelCategory(c.id)}
                      style={{ background: selCategory === c.id ? "#000" : "#f8fafc", color: selCategory === c.id ? "#fff" : "#000", border: selCategory === c.id ? "2px solid #000" : "1.5px solid #e2e8f0", borderRadius: 12, padding: "10px 12px", cursor: "pointer", textAlign: "right", fontFamily: "inherit" }}>
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
              <div>
                <label style={{ fontWeight: 800, fontSize: "0.85rem", color: "#000", display: "block", marginBottom: 6 }}>📝 عنوان الطلب <span style={{ color: "#ef4444" }}>*</span></label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="وصف مختصر لما تحتاجه"
                  style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "11px 13px", borderRadius: 11, fontSize: "0.85rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontWeight: 800, fontSize: "0.85rem", color: "#000", display: "block", marginBottom: 6 }}>📋 وصف تفصيلي <span style={{ color: "#ef4444" }}>*</span></label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
                  placeholder="اشرح بالتفصيل ما تحتاجه..."
                  style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "11px 13px", borderRadius: 11, fontSize: "0.82rem", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.7, boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontWeight: 700, fontSize: "0.82rem", color: "#000", display: "block", marginBottom: 6 }}>💰 الميزانية (اختياري)</label>
                  <input value={budget} onChange={e => setBudget(e.target.value)} placeholder="مثال: 20-50 دولار"
                    style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "10px 12px", borderRadius: 10, fontSize: "0.8rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontWeight: 700, fontSize: "0.82rem", color: "#000", display: "block", marginBottom: 6 }}>📅 الموعد (اختياري)</label>
                  <input value={deadline} onChange={e => setDeadline(e.target.value)} placeholder="مثال: خلال أسبوع"
                    style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "10px 12px", borderRadius: 10, fontSize: "0.8rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              {error && (
                <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertCircle style={{ width: 15, height: 15, color: "#ef4444", flexShrink: 0 }} />
                  <p style={{ color: "#991b1b", fontSize: "0.8rem", fontWeight: 700, margin: 0 }}>{error}</p>
                </div>
              )}
              <button onClick={() => void submitRequest()} disabled={submitting}
                style={{ background: submitting ? "#9ca3af" : "#000", color: "#fff", border: "none", borderRadius: 13, padding: "13px", fontWeight: 900, fontSize: "0.88rem", cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
                {submitting ? <><Spinner white />جاري الإرسال...</> : <><Send style={{ width: 16, height: 16 }} />إرسال الطلب</>}
              </button>
            </>
          )}
        </div>
      )}

      {view === "list" && (
        <div>
          {loading && <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner white={false} /></div>}
          {!loading && myReqs.length === 0 && (
            <div style={{ textAlign: "center", padding: "50px 20px" }}>
              <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>📭</p>
              <p style={{ fontWeight: 900, color: "#000", fontSize: "1rem", margin: "0 0 6px" }}>لا توجد طلبات بعد</p>
              <p style={{ color: "#9ca3af", fontSize: "0.82rem", margin: 0 }}>أرسل طلبك الأول وسيتواصل معك فريق خالد سلمان</p>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myReqs.map(req => {
              const st = STATUS_MAP[req.status] ?? STATUS_MAP["pending"]!;
              const isExp = expandedId === req.id;
              return (
                <div key={req.id} style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <p style={{ fontWeight: 900, fontSize: "0.88rem", color: "#000", margin: 0 }}>{req.title}</p>
                        <span style={{ background: st.bg, color: st.color, padding: "2px 9px", borderRadius: 20, fontSize: "0.65rem", fontWeight: 700 }}>{st.label}</span>
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "#9ca3af", margin: "0 0 6px" }}>{new Date(req.createdAt).toLocaleDateString("ar-EG")} · {req.category}</p>
                    </div>
                    <button onClick={() => setExpandedId(isExp ? null : req.id)}
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#000", borderRadius: 8, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                      {isExp ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
                    </button>
                  </div>
                  {isExp && (
                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12, marginTop: 4 }}>
                      <p style={{ fontSize: "0.8rem", color: "#374151", lineHeight: 1.7, margin: "0 0 8px" }}>{req.description}</p>
                      {req.adminNotes && (
                        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 9, padding: "9px 12px" }}>
                          <p style={{ fontWeight: 700, fontSize: "0.72rem", color: "#166534", margin: "0 0 3px" }}>ملاحظات الفريق:</p>
                          <p style={{ fontSize: "0.78rem", color: "#15803d", margin: 0 }}>{req.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Helpers ── */
function FullLoader() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid #000", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Spinner({ white = true }: { white?: boolean }) {
  const c = white ? "#fff" : "#000";
  return <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${c}40`, borderTopColor: c, animation: "spin 0.7s linear infinite", flexShrink: 0 }} />;
}

/* re-export unused imports to silence warnings */
const _unused = [Globe, Briefcase, GraduationCap, BarChart3, FileText, Code2, MessageSquare, CheckCircle2, XCircle, Clock];
void _unused;
