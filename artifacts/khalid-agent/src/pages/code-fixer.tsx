import { useState, useEffect } from "react";
import { useUser } from "@clerk/react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Send, Copy, CheckCheck, RefreshCw,
  Code2, Zap, AlertCircle,
} from "lucide-react";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "python",     label: "Python" },
  { id: "typescript", label: "TypeScript" },
  { id: "html",       label: "HTML/CSS" },
  { id: "php",        label: "PHP" },
  { id: "java",       label: "Java" },
  { id: "sql",        label: "SQL" },
  { id: "bash",       label: "Bash/Shell" },
  { id: "c",          label: "C/C++" },
  { id: "",           label: "أخرى" },
];

const QUICK_PROBLEMS = [
  "الكود لا يعمل — أصلحه",
  "خطأ في الاستدعاء — حدده وأصلحه",
  "الأداء بطيء — حسّن الكود",
  "كيف أضيف هذه الميزة؟",
  "اشرح هذا الكود وحسّنه",
  "تحويل إلى TypeScript",
];

/* ════════════════════════════════════════ */
export default function CodeFixerPage() {
  const { user, isLoaded } = useUser();
  const [, setLocation] = useLocation();

  const [problem, setProblem] = useState("");
  const [code, setCode]       = useState("");
  const [language, setLang]   = useState("javascript");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState("");
  const [copied, setCopied]   = useState(false);
  const [history, setHistory] = useState<Array<{ problem: string; result: string }>>([]);

  useEffect(() => { if (isLoaded && !user) setLocation("/sign-in"); }, [isLoaded, user, setLocation]);
  if (!isLoaded) return <FullLoader />;
  if (!user) return null;

  const analyze = async () => {
    if (!problem.trim()) { setError("صف المشكلة أولاً"); return; }
    setLoading(true); setError(""); setResult("");
    try {
      const r = await fetch("/api/ai/code-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() || undefined, language: language || undefined, problem: problem.trim() }),
      });
      const d = await r.json() as { result?: string; error?: string };
      if (!r.ok || !d.result) { setError(d.error ?? "فشل التحليل"); return; }
      setResult(d.result);
      setHistory(prev => [{ problem: problem.trim(), result: d.result! }, ...prev.slice(0, 4)]);
      setProblem(""); setCode("");
    } catch { setError("تعذّر الاتصال بالخادم."); }
    finally { setLoading(false); }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#fff", color: "#000", fontFamily: "'Cairo','Tajawal',sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background: "#000", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}>
            <button onClick={() => setLocation("/deep-services")}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: 34, height: 34, borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ArrowLeft style={{ width: 15, height: 15 }} />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#fff", fontWeight: 900, fontSize: "1rem", margin: 0 }}>🔧 محلل ومصلح الأكواد الذكي</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", margin: "2px 0 0" }}>ألصق كودك أو المشكلة — الذكاء الاصطناعي يحلّل ويُصلح فوراً</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 16px 100px" }}>

        {/* ── Language ── */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", margin: "0 0 10px" }}>💻 لغة البرمجة</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {LANGUAGES.map(l => (
              <button key={l.id} onClick={() => setLang(l.id)}
                style={{ background: language === l.id ? "#000" : "#f1f5f9", color: language === l.id ? "#fff" : "#374151", border: `1.5px solid ${language === l.id ? "#000" : "#e2e8f0"}`, borderRadius: 20, padding: "5px 14px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Problem Description ── */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", display: "block", marginBottom: 8 }}>
            📋 وصف المشكلة <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={3}
            placeholder="اشرح المشكلة: ما الذي يحدث؟ ما المتوقع؟ ما رسالة الخطأ؟"
            style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "12px 14px", borderRadius: 12, fontSize: "0.85rem", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.7, boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {QUICK_PROBLEMS.map((q, i) => (
              <button key={i} onClick={() => setProblem(q)}
                style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#374151", borderRadius: 20, padding: "3px 11px", fontSize: "0.65rem", fontWeight: 600, cursor: "pointer" }}>
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* ── Code Input ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 800, fontSize: "0.85rem", color: "#000", display: "block", marginBottom: 8 }}>
            📝 الكود (اختياري — الصق كودك هنا)
          </label>
          <textarea value={code} onChange={e => setCode(e.target.value)} rows={8}
            placeholder={`// الصق كود ${LANGUAGES.find(l => l.id === language)?.label ?? ""} هنا...`}
            spellCheck={false}
            style={{ width: "100%", background: "#0f172a", border: "1.5px solid #1e293b", color: "#e2e8f0", padding: "13px 15px", borderRadius: 12, fontSize: "0.82rem", fontFamily: "monospace", resize: "vertical", outline: "none", lineHeight: 1.8, boxSizing: "border-box", direction: "ltr" }}
          />
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle style={{ width: 15, height: 15, color: "#ef4444", flexShrink: 0 }} />
            <p style={{ color: "#991b1b", fontSize: "0.8rem", fontWeight: 700, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ── Analyze Button ── */}
        <button onClick={analyze} disabled={loading}
          style={{ width: "100%", background: loading ? "#9ca3af" : "#000", color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontWeight: 900, fontSize: "0.92rem", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
          {loading
            ? <><Spinner />جاري التحليل والإصلاح...</>
            : <><Zap style={{ width: 17, height: 17 }} />حلّل وأصلح الكود</>}
        </button>

        {/* ── Result ── */}
        {result && (
          <div style={{ background: "#fff", border: "2px solid #000", borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ background: "#000", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Code2 style={{ width: 16, height: 16, color: "#4ade80" }} />
                <span style={{ color: "#fff", fontWeight: 900, fontSize: "0.85rem" }}>نتيجة التحليل والإصلاح</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={copyResult}
                  style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                  {copied ? <CheckCheck style={{ width: 13, height: 13, color: "#4ade80" }} /> : <Copy style={{ width: 13, height: 13 }} />}
                  {copied ? "تم!" : "نسخ الكل"}
                </button>
                <button onClick={() => { setResult(""); }}
                  style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#9ca3af", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700 }}>
                  مسح
                </button>
              </div>
            </div>
            <div style={{ padding: "20px", overflowX: "auto" }}>
              <div style={{ whiteSpace: "pre-wrap", fontSize: "0.82rem", lineHeight: 1.8, color: "#000", fontFamily: "'Cairo','Tajawal',monospace" }} dangerouslySetInnerHTML={{ __html: formatResult(result) }} />
            </div>
          </div>
        )}

        {/* ── History ── */}
        {history.length > 0 && (
          <div>
            <p style={{ fontWeight: 900, fontSize: "0.88rem", color: "#000", margin: "0 0 10px" }}>🕐 التحليلات السابقة ({history.length})</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map((h, i) => (
                <button key={i} onClick={() => setResult(h.result)}
                  style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "10px 14px", cursor: "pointer", textAlign: "right" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "#000", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    🔧 {h.problem}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {!result && !loading && (
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <p style={{ fontSize: "3.5rem", margin: "0 0 12px" }}>🔧</p>
            <p style={{ fontWeight: 900, color: "#000", fontSize: "1rem", margin: "0 0 6px" }}>محلل الأكواد الذكي</p>
            <p style={{ color: "#9ca3af", fontSize: "0.82rem", margin: 0 }}>الصق كودك أو صف مشكلتك — سأحلل وأصلح في ثوانٍ</p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function formatResult(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<div style="background:#0f172a;border-radius:10px;padding:14px 16px;margin:10px 0;overflow-x:auto;direction:ltr;"><code style="color:#e2e8f0;font-family:monospace;font-size:0.8rem;line-height:1.7;white-space:pre;">${code.trim()}</code></div>`)
    .replace(/## (.*)/g, '<h3 style="font-weight:900;font-size:0.95rem;color:#000;margin:16px 0 8px;border-right:3px solid #000;padding-right:10px;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, "<br/>");
}
function Spinner() {
  return <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />;
}
function FullLoader() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid #000", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
