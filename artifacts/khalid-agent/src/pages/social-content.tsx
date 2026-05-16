import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Send, Copy, CheckCheck, RefreshCw, Sparkles,
  Share2, Download, Plus, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";

/* ── Types ── */
interface Post { id: number; platform: string; content: string; }

/* ── Consts ── */
const PLATFORMS = [
  { id: "facebook",  emoji: "📘", label: "فيسبوك",  color: "#1877f2" },
  { id: "whatsapp",  emoji: "💬", label: "واتساب",  color: "#25d366" },
  { id: "telegram",  emoji: "✈️", label: "تيليغرام", color: "#0088cc" },
  { id: "tiktok",    emoji: "🎵", label: "تيك توك",  color: "#000000" },
  { id: "instagram", emoji: "📸", label: "إنستغرام", color: "#e1306c" },
  { id: "twitter",   emoji: "🐦", label: "تويتر/X",  color: "#1da1f2" },
];

const TONES = [
  { id: "friendly",     label: "🤝 ودي" },
  { id: "formal",       label: "💼 رسمي" },
  { id: "urgent",       label: "🔥 عاجل" },
  { id: "funny",        label: "😄 فكاهي" },
  { id: "motivational", label: "⚡ تحفيزي" },
];

const TOPICS_SUGGESTIONS = [
  "عرض خصم على خدماتي البرمجية",
  "تهنئة بمناسبة رمضان الكريم",
  "إطلاق منتج جديد",
  "نصيحة تقنية للمبتدئين",
  "قصة نجاح عميل",
  "عرض وظيفة متاحة",
  "دعوة لمتابعة القناة",
  "خصم عيد الأضحى",
];

/* ════════════════════════════════════════ */
export default function SocialContentPage() {
  const { user, isLoaded } = useUser();
  const [, setLocation] = useLocation();

  /* form */
  const [platform, setPlatform] = useState("facebook");
  const [topic, setTopic]       = useState("");
  const [tone, setTone]         = useState("friendly");
  const [goal, setGoal]         = useState("");
  const [hashtags, setHashtags] = useState(true);

  /* output */
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [posts, setPosts]       = useState<Post[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const nextId = useRef(1);

  /* bulk */
  const [showBulk, setShowBulk] = useState(false);
  const [bizName, setBizName]   = useState("");
  const [niche, setNiche]       = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkPosts, setBulkPosts] = useState<Array<{day:string;platform:string;content:string;hashtags?:string[]}>>([]);

  useEffect(() => { if (isLoaded && !user) setLocation("/sign-in"); }, [isLoaded, user, setLocation]);
  if (!isLoaded) return <FullLoader />;
  if (!user) return null;

  const generate = async () => {
    if (!topic.trim()) { setError("اكتب الموضوع أولاً"); return; }
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/ai/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, topic: topic.trim(), tone, goal: goal.trim() || undefined, hashtags }),
      });
      const d = await r.json() as { content?: string; error?: string };
      if (!r.ok || !d.content) { setError(d.error ?? "فشل التوليد"); return; }
      const id = nextId.current++;
      setPosts(prev => [{ id, platform, content: d.content! }, ...prev]);
      setExpandedId(id);
      setTopic("");
    } catch { setError("تعذّر الاتصال بالخادم."); }
    finally { setLoading(false); }
  };

  const generateBulk = async () => {
    if (!bizName.trim() || !niche.trim()) { setError("اسم العمل والتخصص مطلوبان"); return; }
    setBulkLoading(true); setError("");
    try {
      const r = await fetch("/api/ai/bulk-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: bizName.trim(), niche: niche.trim(), days: 7 }),
      });
      const d = await r.json() as { posts?: typeof bulkPosts };
      if (d.posts) setBulkPosts(d.posts);
    } catch { setError("فشل التوليد الجماعي."); }
    finally { setBulkLoading(false); }
  };

  const copy = (content: string, id: number) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {});
  };

  const getIntentLink = (platformId: string, text: string): string | null => {
    const encoded = encodeURIComponent(text);
    const siteUrl = encodeURIComponent("https://yemenchat.replit.app");
    switch (platformId) {
      case "whatsapp":  return `https://api.whatsapp.com/send?text=${encoded}`;
      case "telegram":  return `https://t.me/share/url?url=${siteUrl}&text=${encoded}`;
      case "twitter":   return `https://twitter.com/intent/tweet?text=${encoded}`;
      case "facebook":  return `https://www.facebook.com/sharer/sharer.php?u=${siteUrl}&quote=${encoded}`;
      default: return null;
    }
  };

  const plat = PLATFORMS.find(p => p.id === platform) ?? PLATFORMS[0]!;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#fff", color: "#000", fontFamily: "'Cairo','Tajawal',sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background: "#000", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}>
            <button onClick={() => setLocation("/chat")}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: 34, height: 34, borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ArrowLeft style={{ width: 15, height: 15 }} />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#fff", fontWeight: 900, fontSize: "1rem", margin: 0 }}>📱 صانع محتوى السوشيال ميديا</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", margin: "2px 0 0" }}>فيسبوك، واتساب، تيليغرام وأكثر — بضغطة واحدة</p>
            </div>
            <button onClick={() => setShowBulk(!showBulk)}
              style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 9, padding: "7px 12px", fontWeight: 900, fontSize: "0.72rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <Sparkles style={{ width: 13, height: 13 }} />أسبوع كامل
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 16px 100px" }}>

        {/* ── Bulk Generator Panel ── */}
        {showBulk && (
          <div style={{ background: "#000", borderRadius: 18, padding: "20px", marginBottom: 20, color: "#fff" }}>
            <h2 style={{ fontWeight: 900, fontSize: "1rem", margin: "0 0 14px", color: "#f59e0b" }}>⚡ توليد خطة محتوى أسبوعية كاملة</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", display: "block", marginBottom: 5 }}>اسم العمل / النشاط</label>
                <input value={bizName} onChange={e => setBizName(e.target.value)} placeholder="مثال: مطعم الأصيل"
                  style={{ width: "100%", background: "#1a1a2e", border: "1.5px solid #333", color: "#fff", padding: "10px 12px", borderRadius: 10, fontSize: "0.84rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", display: "block", marginBottom: 5 }}>التخصص / المجال</label>
                <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="مثال: مطاعم يمنية"
                  style={{ width: "100%", background: "#1a1a2e", border: "1.5px solid #333", color: "#fff", padding: "10px 12px", borderRadius: 10, fontSize: "0.84rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <button onClick={generateBulk} disabled={bulkLoading}
              style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 11, padding: "11px 20px", fontWeight: 900, fontSize: "0.85rem", cursor: bulkLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: bulkLoading ? 0.7 : 1 }}>
              {bulkLoading
                ? <><Spinner />جاري التوليد...</>
                : <><Sparkles style={{ width: 15, height: 15 }} />توليد 7 منشورات</>}
            </button>

            {bulkPosts.length > 0 && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {bulkPosts.map((bp, i) => (
                  <div key={i} style={{ background: "#111", borderRadius: 12, padding: "12px 14px", border: "1px solid #333" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: "0.8rem", color: "#f59e0b" }}>{bp.day} — {bp.platform}</span>
                      <button onClick={() => copy(bp.content + (bp.hashtags ? "\n\n" + bp.hashtags.map(h => "#" + h).join(" ") : ""), i + 1000)}
                        style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 7, padding: "4px 9px", cursor: "pointer", fontSize: "0.65rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        {copiedId === i + 1000 ? <CheckCheck style={{ width: 11, height: 11, color: "#4ade80" }} /> : <Copy style={{ width: 11, height: 11 }} />}
                        نسخ
                      </button>
                    </div>
                    <p style={{ color: "#d1d5db", fontSize: "0.78rem", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{bp.content}</p>
                    {bp.hashtags && bp.hashtags.length > 0 && (
                      <p style={{ color: "#60a5fa", fontSize: "0.7rem", marginTop: 6 }}>{bp.hashtags.map(h => "#" + h).join(" ")}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Platform Selector ── */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", margin: "0 0 10px" }}>📡 اختر المنصة</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setPlatform(p.id)}
                style={{
                  background: platform === p.id ? p.color : "#f8fafc",
                  color: platform === p.id ? "#fff" : "#000",
                  border: `2px solid ${platform === p.id ? p.color : "#e2e8f0"}`,
                  borderRadius: 12, padding: "10px 6px", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  transition: "all 0.15s",
                }}>
                <span style={{ fontSize: "1.4rem" }}>{p.emoji}</span>
                <span style={{ fontWeight: 800, fontSize: "0.72rem" }}>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tone ── */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 800, fontSize: "0.85rem", color: "#000", margin: "0 0 8px" }}>🎭 أسلوب المنشور</p>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {TONES.map(t => (
              <button key={t.id} onClick={() => setTone(t.id)}
                style={{ background: tone === t.id ? "#000" : "#f1f5f9", color: tone === t.id ? "#fff" : "#374151", border: `1.5px solid ${tone === t.id ? "#000" : "#e2e8f0"}`, borderRadius: 20, padding: "5px 14px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Topic ── */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", display: "block", marginBottom: 8 }}>
            ✍️ موضوع المنشور <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) generate(); }}
            rows={3}
            placeholder={`ما الذي تريد نشره على ${plat.label}؟ كن تفصيلياً قدر الإمكان...`}
            style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "12px 14px", borderRadius: 12, fontSize: "0.85rem", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.7, boxSizing: "border-box" }}
          />
          {/* Quick suggestions */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {TOPICS_SUGGESTIONS.slice(0, 4).map((s, i) => (
              <button key={i} onClick={() => setTopic(s)}
                style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#374151", borderRadius: 20, padding: "3px 11px", fontSize: "0.65rem", fontWeight: 600, cursor: "pointer" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Goal (optional) ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 700, fontSize: "0.82rem", color: "#000", display: "block", marginBottom: 6 }}>🎯 هدف المنشور (اختياري)</label>
          <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="مثال: زيادة المبيعات، استقطاب عملاء، تعزيز الثقة..."
            style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "10px 13px", borderRadius: 10, fontSize: "0.82rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* ── Hashtags toggle ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <button onClick={() => setHashtags(!hashtags)}
            style={{ width: 44, height: 24, borderRadius: 12, background: hashtags ? "#000" : "#d1d5db", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
            <span style={{ position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", left: hashtags ? 22 : 2 }} />
          </button>
          <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#000" }}>إضافة هاشتاقات تلقائياً #</span>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
            <p style={{ color: "#991b1b", fontSize: "0.8rem", fontWeight: 700, margin: 0 }}>⚠️ {error}</p>
          </div>
        )}

        {/* ── Generate Button ── */}
        <button onClick={generate} disabled={loading}
          style={{ width: "100%", background: loading ? "#9ca3af" : plat.color, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontWeight: 900, fontSize: "0.92rem", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
          {loading
            ? <><Spinner />جاري التوليد...</>
            : <>{plat.emoji} <Send style={{ width: 16, height: 16 }} />توليد منشور {plat.label}</>}
        </button>

        {/* ── Generated Posts ── */}
        {posts.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontWeight: 900, fontSize: "0.9rem", color: "#000", margin: 0 }}>📋 منشوراتك ({posts.length})</p>
              <button onClick={() => setPosts([])}
                style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#ef4444", borderRadius: 8, padding: "4px 10px", fontSize: "0.68rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <Trash2 style={{ width: 11, height: 11 }} />مسح الكل
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {posts.map(post => {
                const pInfo = PLATFORMS.find(p => p.id === post.platform) ?? PLATFORMS[0]!;
                const isExpanded = expandedId === post.id;
                return (
                  <div key={post.id} style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
                    {/* card header */}
                    <div style={{ background: pInfo.color, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "1.1rem" }}>{pInfo.emoji}</span>
                        <span style={{ color: "#fff", fontWeight: 800, fontSize: "0.8rem" }}>منشور {pInfo.label}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {(() => {
                          const link = getIntentLink(post.platform, post.content);
                          return link ? (
                            <a href={link} target="_blank" rel="noopener noreferrer"
                              style={{ background: "rgba(255,255,255,0.9)", border: "none", color: pInfo.color, borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: "0.68rem", fontWeight: 900, display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                              <Share2 style={{ width: 11, height: 11 }} />نشر
                            </a>
                          ) : (
                            <button onClick={() => copy(post.content, post.id + 2000)}
                              style={{ background: "rgba(255,255,255,0.9)", border: "none", color: pInfo.color, borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: "0.68rem", fontWeight: 900, display: "flex", alignItems: "center", gap: 4 }}
                              title="انسخ ثم الصق في التطبيق يدوياً">
                              <Copy style={{ width: 11, height: 11 }} />نسخ للنشر
                            </button>
                          );
                        })()}
                        <button onClick={() => copy(post.content, post.id)}
                          style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                          {copiedId === post.id ? <CheckCheck style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                          {copiedId === post.id ? "✓" : "نسخ"}
                        </button>
                        <button onClick={() => setExpandedId(isExpanded ? null : post.id)}
                          style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 7, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                          {isExpanded ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
                        </button>
                        <button onClick={() => setPosts(prev => prev.filter(p => p.id !== post.id))}
                          style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 7, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                          <Trash2 style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: "16px 14px" }}>
                        <p style={{ fontSize: "0.85rem", color: "#000", lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap" }}>{post.content}</p>
                      </div>
                    )}
                    {!isExpanded && (
                      <div style={{ padding: "10px 14px", cursor: "pointer" }} onClick={() => setExpandedId(post.id)}>
                        <p style={{ fontSize: "0.78rem", color: "#6b7280", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {post.content.slice(0, 80)}...
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {posts.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <p style={{ fontSize: "3.5rem", margin: "0 0 12px" }}>📱</p>
            <p style={{ fontWeight: 900, color: "#000", fontSize: "1rem", margin: "0 0 6px" }}>جاهز لتوليد محتواك</p>
            <p style={{ color: "#9ca3af", fontSize: "0.82rem", margin: 0 }}>اختر المنصة، اكتب الموضوع، واضغط توليد</p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
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
