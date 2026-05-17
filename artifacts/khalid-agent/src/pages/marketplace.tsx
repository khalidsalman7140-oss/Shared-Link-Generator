import { useState, useEffect } from "react";
import { useUser } from "@clerk/react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Plus, RefreshCw, Store, User, ShieldCheck, BookOpen,
  Zap, Phone, MessageCircle, Globe, MapPin, Star, Eye, Trash2,
  CheckCircle, XCircle, Clock, AlertTriangle, Copy, CheckCheck,
  ChevronDown, ChevronUp, Edit3, Send,
} from "lucide-react";

/* ── Types ─────────────────────────────────────── */
interface Profile {
  id: number; userId: string; userEmail: string | null; userName: string | null;
  businessName: string; category: string; tagline: string | null;
  description: string; skills: string | null; whatsapp: string | null;
  telegram: string | null; location: string | null; portfolio: string | null;
  isPublic: boolean; viewCount: number; createdAt: string;
}
interface Escrow {
  id: number; initiatorId: string; initiatorEmail: string | null;
  counterpartyName: string; counterpartyContact: string;
  amount: string; currency: string; description: string;
  status: string; adminNotes: string | null; createdAt: string;
}

/* ── Constants ───────────────────────────────────── */
const CATEGORIES = [
  { id: "tech",      label: "💻 برمجة وتقنية" },
  { id: "design",    label: "🎨 تصميم وإبداع" },
  { id: "content",   label: "✍️ كتابة ومحتوى" },
  { id: "marketing", label: "📣 تسويق ورقمي" },
  { id: "education", label: "🎓 تعليم وتدريب" },
  { id: "trade",     label: "🛒 تجارة وبيع" },
  { id: "services",  label: "🔧 خدمات عامة" },
  { id: "other",     label: "⚙️ أخرى" },
];

const ESCROW_STATUS: Record<string, { label: string; color: string; bg: string; iconName: string }> = {
  pending:   { label: "بانتظار الطرفين", color: "#b45309", bg: "#fffbeb", iconName: "clock" },
  active:    { label: "نشط ومحمي",       color: "#1d4ed8", bg: "#eff6ff", iconName: "shield" },
  released:  { label: "تم الإفراج",       color: "#166534", bg: "#f0fdf4", iconName: "check" },
  disputed:  { label: "متنازع عليه",      color: "#991b1b", bg: "#fef2f2", iconName: "alert" },
  cancelled: { label: "ملغي",             color: "#6b7280", bg: "#f9fafb", iconName: "x" },
};
function EscrowIcon({ name }: { name: string }) {
  const s = { width:12, height:12 } as const;
  if (name === "clock")  return <Clock {...s} />;
  if (name === "shield") return <ShieldCheck {...s} />;
  if (name === "check")  return <CheckCircle {...s} />;
  if (name === "alert")  return <AlertTriangle {...s} />;
  return <XCircle {...s} />;
}

const TEMPLATES = [
  {
    cat: "📝 عقود", items: [
      { title: "عقد عمل حر بسيط", content: `عقد تنفيذ خدمة
بين: [اسم العميل] — ويُسمى (الطرف الأول)
وبين: [اسم المستقل] — ويُسمى (الطرف الثاني)

الخدمة المتفق عليها: [وصف الخدمة]
المبلغ: [المبلغ] ريال يمني
موعد التسليم: [التاريخ]

التزامات الطرف الثاني:
- تنفيذ الخدمة بالمواصفات المتفق عليها
- التسليم في الموعد المحدد
- إجراء التعديلات المعقولة (حتى [عدد] مرة)

التزامات الطرف الأول:
- دفع 50% مقدماً والباقي عند التسليم
- تقديم المستلزمات اللازمة خلال [مدة]
- الموافقة أو طلب التعديل خلال [مدة]

توقيع الطرف الأول: ____________
توقيع الطرف الثاني: ____________
التاريخ: ${new Date().toLocaleDateString("ar-EG")}` },
      { title: "عقد توصيل بضاعة", content: `عقد توصيل وشحن
من: [اسم المرسل] — [رقم الجوال]
إلى: [اسم المستلم] — [رقم الجوال]

البضاعة: [وصف البضاعة]
الكمية: [الكمية]
قيمة البضاعة: [المبلغ] ريال
أجرة الشحن: [المبلغ] ريال
موعد التسليم: [التاريخ والوقت]
العنوان: [العنوان التفصيلي]

ملاحظات: [أي تعليمات خاصة]

توقيع المرسل: ____________
توقيع الشاحن: ____________
التاريخ: ${new Date().toLocaleDateString("ar-EG")}` },
    ]
  },
  {
    cat: "📣 تسويق", items: [
      { title: "منشور إطلاق خدمة", content: `🚀 إطلاق رسمي لخدمة [اسم الخدمة]!

السلام عليكم ورحمة الله وبركاته 🌙

يسعدني أن أعلن عن إطلاق خدمة [اسم الخدمة] المتخصصة في [مجال الخدمة].

✅ ما الذي نقدمه:
• [ميزة 1]
• [ميزة 2]
• [ميزة 3]

💰 الأسعار: تبدأ من [السعر] ريال فقط
⏱ وقت التنفيذ: خلال [المدة]
🎯 الضمان: [نوع الضمان]

📱 للتواصل والاستفسار:
واتساب: [رقمك]
تيليغرام: [معرفك]

شارك المنشور لتعم الفائدة 🙏` },
      { title: "رسالة ترحيب بعميل جديد", content: `أهلاً وسهلاً بك [اسم العميل] 🌟

شكراً لثقتك بخدماتنا، يسعدنا تلقي طلبك.

تفاصيل طلبك:
✅ الخدمة: [اسم الخدمة]
📅 موعد التسليم: [التاريخ]
💰 المبلغ المتفق عليه: [المبلغ]

سنبدأ العمل فوراً وسنبقيك على اطلاع دائم.

في حال أي استفسار لا تتردد في التواصل.

مع تحياتنا 💙` },
    ]
  },
  {
    cat: "💼 أعمال", items: [
      { title: "سيرة خدمات مستقل", content: `[اسمك الكريم]
مستقل متخصص في [مجالك]

━━━━━━━━━━━━━━━━━━━━
📌 من أنا:
[وصف مختصر عن نفسك وخبرتك — جملتان أو ثلاث]

🛠 خدماتي:
• [خدمة 1] — [السعر]
• [خدمة 2] — [السعر]
• [خدمة 3] — [السعر]

⭐ خبرتي:
[عدد] سنوات في [المجال]
نفّذت [عدد]+ مشروع ناجح

📱 تواصل معي:
واتساب: [رقمك]
تيليغرام: [معرفك]

━━━━━━━━━━━━━━━━━━━━
"جودة لا تُقايَض بسعر" 🏆` },
      { title: "رد احترافي على طلب عرض سعر", content: `السلام عليكم [اسم العميل] 👋

شكراً لتواصلك معنا. اطلعت على طلبك المتعلق بـ [موضوع الطلب].

عرض السعر:
━━━━━━━━━━━━━━━
الخدمة: [وصف الخدمة]
السعر: [المبلغ] ريال
المدة: [عدد الأيام] أيام عمل
التعديلات: حتى [عدد] مرات مجاناً

المتضمّن في السعر:
✅ [البند 1]
✅ [البند 2]
✅ [البند 3]

غير المتضمّن:
❌ [استثناء 1]
━━━━━━━━━━━━━━━

للمضي قدماً يرجى تأكيد الطلب وسنبدأ فوراً.

مع تحياتي 🙏` },
    ]
  },
];

/* ── Helpers ──────────────────────────────────── */
function Spinner() {
  return <div style={{ width:20, height:20, borderRadius:"50%", border:"3px solid #000", borderTopColor:"transparent", animation:"mspin 0.7s linear infinite", display:"inline-block" }} />;
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      style={{ background: active ? "#000" : "transparent", color: active ? "#fff" : "#6b7280", border: "none", borderRadius: active ? "8px 8px 0 0" : "8px 8px 0 0", padding: "9px 14px", fontWeight: 800, fontSize: "0.72rem", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all .15s" }}>
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════ */
export default function MarketplacePage() {
  const { user, isLoaded } = useUser();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"agent" | "discover" | "profile" | "escrow" | "templates">("agent");

  useEffect(() => { if (isLoaded && !user) setLocation("/sign-in"); }, [isLoaded, user, setLocation]);
  if (!isLoaded) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}><Spinner /></div>;
  if (!user) return null;

  return (
    <div dir="rtl" style={{ minHeight:"100vh", background:"#fff", color:"#000", fontFamily:"'Cairo','Tajawal',sans-serif" }}>
      {/* Header */}
      <div style={{ background:"#000", position:"sticky", top:0, zIndex:40 }}>
        <div style={{ maxWidth:960, margin:"0 auto", padding:"0 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0 8px" }}>
            <button onClick={() => setLocation("/chat")}
              style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"#fff", width:34, height:34, borderRadius:9, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <ArrowLeft style={{ width:15, height:15 }} />
            </button>
            <div style={{ flex:1 }}>
              <p style={{ color:"#fff", fontWeight:900, fontSize:"1rem", margin:0 }}>🏪 مجمع الخدمات الذكية والعمل الحر</p>
              <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.6rem", margin:"1px 0 0" }}>أنشئ ملفك المهني · تواصل · نفّذ · احتمِ بالوساطة الرقمية</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:1, overflowX:"auto", paddingBottom:0 }}>
            <TabBtn active={tab==="agent"}     onClick={()=>setTab("agent")}>🤖 الوكيل الخارق</TabBtn>
            <TabBtn active={tab==="discover"}  onClick={()=>setTab("discover")}>🔍 اكتشف</TabBtn>
            <TabBtn active={tab==="profile"}   onClick={()=>setTab("profile")}>👤 ملفي</TabBtn>
            <TabBtn active={tab==="escrow"}    onClick={()=>setTab("escrow")}>🛡 الوساطة</TabBtn>
            <TabBtn active={tab==="templates"} onClick={()=>setTab("templates")}>📚 النماذج</TabBtn>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:960, margin:"0 auto", padding:"20px 16px 80px" }}>
        {tab === "agent"     && <AgentTab setLocation={setLocation} />}
        {tab === "discover"  && <DiscoverTab />}
        {tab === "profile"   && <ProfileTab user={user} />}
        {tab === "escrow"    && <EscrowTab userId={user.id} />}
        {tab === "templates" && <TemplatesTab />}
      </div>

      <style>{`
        @keyframes mspin { to { transform: rotate(360deg); } }
        @keyframes mpulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:#f1f5f9; }
        ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:2px; }
      `}</style>
    </div>
  );
}

/* ════════════ AGENT TAB ════════════ */
function AgentTab({ setLocation }: { setLocation: (p: string) => void }) {
  const [request, setRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type:string; title:string; content:string; siteUrl:string|null } | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const SUGGESTIONS = [
    { icon:"🌐", text:"أنشئ موقع احترافي لمتجري اليمني" },
    { icon:"💬", text:"اكتب حالة واتساب تسويقية مميزة" },
    { icon:"📄", text:"أنشئ سيرة ذاتية احترافية" },
    { icon:"📣", text:"اكتب منشور إطلاق خدمة جديدة" },
    { icon:"🎬", text:"صمم سكريبت فيديو إعلاني 60 ثانية" },
    { icon:"💻", text:"اكتب كود Python لإرسال إيميل تلقائي" },
    { icon:"📊", text:"حلل سوق العمل الحر في اليمن" },
    { icon:"🤝", text:"اكتب عقد عمل حر محكم واضح" },
  ];

  const run = async () => {
    if (!request.trim()) { setError("اكتب طلبك أولاً"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch("/api/ai/agent", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ request: request.trim() }),
      });
      const d = await r.json() as typeof result & { error?: string };
      if (!r.ok) { setError(d.error ?? "فشل الوكيل"); return; }
      setResult(d);
    } catch { setError("تعذّر الاتصال. تحقق من الإنترنت."); }
    finally { setLoading(false); }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.content).then(() => { setCopied(true); setTimeout(()=>setCopied(false),2000); }).catch(()=>{});
  };

  return (
    <div>
      {/* Hero */}
      <div style={{ background:"#000", borderRadius:20, padding:"24px 20px", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <div style={{ width:48, height:48, background:"#fff", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", flexShrink:0 }}>🤖</div>
          <div>
            <p style={{ color:"#fff", fontWeight:900, fontSize:"1rem", margin:0 }}>الوكيل الذكي الخارق</p>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.65rem", margin:"2px 0 0" }}>ينفّذ طلبك فوراً — مواقع · عقود · سكريبتات · كود · تحليل</p>
          </div>
        </div>

        <textarea value={request} onChange={e=>setRequest(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"&&e.ctrlKey) run(); }}
          rows={3} placeholder="مثال: أنشئ موقع ويب احترافي لمتجر ملابس يمني باللون الأسود والذهبي..."
          style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"1.5px solid rgba(255,255,255,0.15)", color:"#fff", padding:"12px 14px", borderRadius:12, fontSize:"0.85rem", fontFamily:"inherit", resize:"none", outline:"none", boxSizing:"border-box" }} />

        <div style={{ display:"flex", gap:7, flexWrap:"wrap", margin:"10px 0 14px" }}>
          {SUGGESTIONS.map((s,i) => (
            <button key={i} onClick={()=>setRequest(s.text)}
              style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.75)", borderRadius:20, padding:"3px 10px", fontSize:"0.62rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              {s.icon} {s.text}
            </button>
          ))}
        </div>

        {error && <div style={{ background:"#fef2f2", borderRadius:10, padding:"8px 12px", marginBottom:10 }}><p style={{ color:"#991b1b", fontSize:"0.78rem", margin:0 }}>⚠️ {error}</p></div>}

        <button onClick={run} disabled={loading}
          style={{ width:"100%", background:loading?"#374151":"#fff", color:loading?"#9ca3af":"#000", border:"none", borderRadius:12, padding:"13px", fontWeight:900, fontSize:"0.9rem", cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontFamily:"inherit" }}>
          {loading ? <><Spinner />جاري التنفيذ...</> : <><Zap style={{ width:16, height:16 }} />تنفيذ فوري (Ctrl+Enter)</>}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ border:"2px solid #000", borderRadius:18, padding:"32px 20px", textAlign:"center", marginBottom:20 }}>
          <div style={{ width:44, height:44, borderRadius:"50%", border:"4px solid #000", borderTopColor:"transparent", animation:"mspin 0.8s linear infinite", margin:"0 auto 14px" }} />
          <p style={{ fontWeight:900, fontSize:"0.95rem", color:"#000", margin:"0 0 4px" }}>⚙️ الوكيل يعمل على طلبك...</p>
          <p style={{ color:"#9ca3af", fontSize:"0.75rem", margin:0, animation:"mpulse 2s infinite" }}>يحلل ← يُصمم ← يُنتج ← يحفظ</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{ border:"2px solid #000", borderRadius:18, overflow:"hidden", marginBottom:20 }}>
          <div style={{ background:"#000", padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
            <div>
              <p style={{ color:"#fff", fontWeight:900, fontSize:"0.9rem", margin:0 }}>{result.title}</p>
              <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.62rem", margin:"2px 0 0" }}>✅ محفوظ في مساحة عملك تلقائياً</p>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {result.siteUrl && (
                <a href={result.siteUrl} target="_blank" rel="noopener noreferrer"
                  style={{ background:"#22c55e", color:"#fff", border:"none", borderRadius:9, padding:"6px 12px", fontSize:"0.68rem", fontWeight:900, cursor:"pointer", display:"flex", alignItems:"center", gap:5, textDecoration:"none" }}>
                  <Globe style={{ width:12, height:12 }} />رابط حي
                </a>
              )}
              <button onClick={copy}
                style={{ background:"rgba(255,255,255,0.12)", border:"none", color:"#fff", borderRadius:9, padding:"6px 12px", fontSize:"0.68rem", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                {copied ? <CheckCheck style={{ width:12, height:12, color:"#4ade80" }} /> : <Copy style={{ width:12, height:12 }} />}
                {copied ? "تم!" : "نسخ"}
              </button>
              <button onClick={()=>{ setResult(null); setRequest(""); }}
                style={{ background:"rgba(255,255,255,0.12)", border:"none", color:"#fff", borderRadius:9, padding:"6px 12px", fontSize:"0.68rem", fontWeight:700, cursor:"pointer" }}>
                🔄 جديد
              </button>
            </div>
          </div>
          <div style={{ padding:"16px 18px", background:"#fff", maxHeight:400, overflowY:"auto" }}>
            {result.type === "code" || result.type === "website" || result.type === "cv" ? (
              <pre style={{ background:"#1e1e2e", color:"#cdd6f4", padding:16, borderRadius:12, fontSize:"0.78rem", overflowX:"auto", lineHeight:1.6, margin:0, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                {result.content}
              </pre>
            ) : (
              <p style={{ fontSize:"0.88rem", color:"#000", lineHeight:1.9, margin:0, whiteSpace:"pre-wrap" }}>{result.content}</p>
            )}
          </div>
        </div>
      )}

      {/* Empty */}
      {!result && !loading && (
        <div style={{ textAlign:"center", padding:"30px 0" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10, marginTop:8 }}>
            {[
              { icon:"🌐", label:"مواقع ويب", sub:"HTML + رابط حي + نشر مجاني" },
              { icon:"🤝", label:"عقود وبرمجة", sub:"جاهزة للتوقيع والنشر" },
              { icon:"🎬", label:"سكريبت فيديو", sub:"مصادر ميديا مجانية" },
              { icon:"📊", label:"تحليل وأبحاث", sub:"تقارير احترافية فورية" },
            ].map((c,i) => (
              <div key={i} style={{ background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:14, padding:"14px 10px", textAlign:"center" }}>
                <p style={{ fontSize:"1.6rem", margin:"0 0 5px" }}>{c.icon}</p>
                <p style={{ fontWeight:900, fontSize:"0.75rem", color:"#000", margin:"0 0 2px" }}>{c.label}</p>
                <p style={{ fontSize:"0.58rem", color:"#9ca3af", margin:0 }}>{c.sub}</p>
              </div>
            ))}
          </div>
          <p style={{ color:"#9ca3af", fontSize:"0.75rem", marginTop:16 }}>
            نتائجك تُحفظ تلقائياً في{" "}
            <button onClick={()=>setLocation("/deep-services")} style={{ background:"none", border:"none", color:"#2563eb", fontWeight:700, cursor:"pointer", fontFamily:"inherit", fontSize:"0.75rem" }}>
              مساحة عملك ←
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

/* ════════════ DISCOVER TAB ════════════ */
function DiscoverTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [cat, setCat] = useState("");
  const [expanded, setExpanded] = useState<number|null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/marketplace/profiles").then(r=>r.ok?r.json():Promise.reject()).then((d:Profile[])=>setProfiles(d)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const shown = profiles.filter(p =>
    (!filter || p.businessName.includes(filter) || p.description.includes(filter) || (p.skills??'').includes(filter)) &&
    (!cat || p.category === cat)
  );

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <p style={{ fontWeight:900, fontSize:"0.95rem", color:"#000", margin:"0 0 12px" }}>🔍 اكتشف المستقلين ({profiles.length})</p>
        <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="🔎 ابحث بالاسم أو المهارة..."
          style={{ width:"100%", padding:"10px 14px", border:"2px solid #000", borderRadius:11, fontSize:"0.82rem", fontFamily:"inherit", color:"#000", outline:"none", boxSizing:"border-box", marginBottom:10 }} />
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          <button onClick={()=>setCat("")}
            style={{ background:cat===""?"#000":"#f1f5f9", color:cat===""?"#fff":"#374151", border:"none", borderRadius:20, padding:"4px 12px", fontSize:"0.65rem", fontWeight:700, cursor:"pointer" }}>
            🌐 الكل
          </button>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={()=>setCat(c.id)}
              style={{ background:cat===c.id?"#000":"#f1f5f9", color:cat===c.id?"#fff":"#374151", border:"none", borderRadius:20, padding:"4px 12px", fontSize:"0.65rem", fontWeight:700, cursor:"pointer" }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:40 }}><Spinner /></div>
      ) : shown.length === 0 ? (
        <div style={{ textAlign:"center", padding:"40px 20px", background:"#f8fafc", borderRadius:16, border:"1.5px dashed #e2e8f0" }}>
          <p style={{ fontSize:"2rem", margin:"0 0 10px" }}>🏪</p>
          <p style={{ fontWeight:900, color:"#000", fontSize:"0.9rem", margin:"0 0 4px" }}>
            {profiles.length === 0 ? "كن أول من يُنشئ ملفه المهني!" : "لا توجد نتائج للبحث"}
          </p>
          <p style={{ color:"#9ca3af", fontSize:"0.75rem" }}>أضف ملفك المهني من تبويب (ملفي) لتظهر هنا</p>
        </div>
      ) : (
        <div style={{ display:"grid", gap:12 }}>
          {shown.map(p => (
            <div key={p.id} style={{ border:"1.5px solid #e2e8f0", borderRadius:16, overflow:"hidden", background:"#fff" }}>
              <div style={{ padding:"16px 18px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <p style={{ fontWeight:900, fontSize:"0.95rem", color:"#000", margin:0 }}>{p.businessName}</p>
                      <span style={{ background:"#f1f5f9", color:"#374151", fontSize:"0.6rem", fontWeight:700, padding:"2px 8px", borderRadius:20 }}>
                        {CATEGORIES.find(c=>c.id===p.category)?.label ?? p.category}
                      </span>
                    </div>
                    {p.tagline && <p style={{ color:"#6b7280", fontSize:"0.75rem", margin:"4px 0 0" }}>{p.tagline}</p>}
                    {p.location && <p style={{ color:"#9ca3af", fontSize:"0.65rem", margin:"4px 0 0", display:"flex", alignItems:"center", gap:3 }}><MapPin style={{ width:10, height:10 }} />{p.location}</p>}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                    {p.whatsapp && (
                      <a href={`https://wa.me/${p.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                        style={{ background:"#25d366", color:"#fff", borderRadius:8, padding:"5px 10px", fontSize:"0.65rem", fontWeight:900, display:"flex", alignItems:"center", gap:4, textDecoration:"none" }}>
                        <Phone style={{ width:11, height:11 }} />واتساب
                      </a>
                    )}
                    {p.telegram && (
                      <a href={`https://t.me/${p.telegram.replace("@","")}`} target="_blank" rel="noopener noreferrer"
                        style={{ background:"#2ca5e0", color:"#fff", borderRadius:8, padding:"5px 10px", fontSize:"0.65rem", fontWeight:900, display:"flex", alignItems:"center", gap:4, textDecoration:"none" }}>
                        <MessageCircle style={{ width:11, height:11 }} />تيليغرام
                      </a>
                    )}
                  </div>
                </div>

                <p style={{ fontSize:"0.8rem", color:"#374151", lineHeight:1.7, margin:"10px 0 8px",
                  ...(expanded!==p.id ? { display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as const, overflow:"hidden" } : {}) }}>
                  {p.description}
                </p>

                {p.skills && (
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:8 }}>
                    {p.skills.split(",").map((s,i) => (
                      <span key={i} style={{ background:"#f1f5f9", color:"#374151", fontSize:"0.6rem", fontWeight:600, padding:"2px 8px", borderRadius:20 }}>{s.trim()}</span>
                    ))}
                  </div>
                )}

                <button onClick={()=>setExpanded(expanded===p.id?null:p.id)}
                  style={{ background:"none", border:"none", color:"#6b7280", fontSize:"0.65rem", cursor:"pointer", display:"flex", alignItems:"center", gap:3, fontFamily:"inherit" }}>
                  {expanded===p.id ? <><ChevronUp style={{ width:12, height:12 }} />طي</> : <><ChevronDown style={{ width:12, height:12 }} />عرض التفاصيل</>}
                </button>

                {expanded===p.id && p.portfolio && (
                  <div style={{ marginTop:10, padding:"10px 12px", background:"#f8fafc", borderRadius:10 }}>
                    <p style={{ fontWeight:700, fontSize:"0.72rem", color:"#000", margin:"0 0 4px" }}>🔗 أعمال سابقة:</p>
                    <p style={{ fontSize:"0.72rem", color:"#374151", margin:0, whiteSpace:"pre-line" }}>{p.portfolio}</p>
                  </div>
                )}
              </div>
              <div style={{ background:"#f8fafc", borderTop:"1px solid #f1f5f9", padding:"8px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <p style={{ fontSize:"0.6rem", color:"#9ca3af", margin:0 }}>
                  <Eye style={{ width:10, height:10 }} /> انضم {new Date(p.createdAt).toLocaleDateString("ar-EG")}
                </p>
                {p.userName && <p style={{ fontSize:"0.65rem", color:"#6b7280", margin:0 }}>👤 {p.userName}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════ PROFILE TAB ════════════ */
function ProfileTab({ user }: { user: { id: string; primaryEmailAddress?: { emailAddress: string } | null; fullName?: string | null } }) {
  const [profile, setProfile] = useState<Profile|null|undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    businessName:"", category:"tech", tagline:"", description:"",
    skills:"", whatsapp:"", telegram:"", location:"", portfolio:"", isPublic:true,
  });

  const load = () => {
    fetch("/api/marketplace/profile/me").then(r=>r.ok?r.json():null).then((d:Profile|null)=>{
      setProfile(d);
      if (d) setForm({
        businessName:d.businessName, category:d.category, tagline:d.tagline??"",
        description:d.description, skills:d.skills??"", whatsapp:d.whatsapp??"",
        telegram:d.telegram??"", location:d.location??"", portfolio:d.portfolio??"", isPublic:d.isPublic,
      });
      else setEditing(true);
    }).catch(()=>setProfile(null));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.businessName.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const r = await fetch("/api/marketplace/profile", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify(form),
      });
      if (r.ok) { setProfile(await r.json() as Profile); setEditing(false); setSaved(true); setTimeout(()=>setSaved(false),2500); }
    } catch {} finally { setSaving(false); }
  };

  const del = async () => {
    if (!confirm("هل أنت متأكد من حذف ملفك؟")) return;
    await fetch("/api/marketplace/profile/me", { method:"DELETE" });
    setProfile(null); setEditing(true);
    setForm({ businessName:"", category:"tech", tagline:"", description:"", skills:"", whatsapp:"", telegram:"", location:"", portfolio:"", isPublic:true });
  };

  const inp = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const iS: React.CSSProperties = { width:"100%", padding:"10px 13px", border:"2px solid #e2e8f0", borderRadius:10, fontSize:"0.82rem", fontFamily:"inherit", color:"#000", background:"#fff", outline:"none", boxSizing:"border-box" };
  const lS: React.CSSProperties = { fontWeight:800, fontSize:"0.78rem", color:"#000", display:"block", marginBottom:5 };

  if (profile === undefined) return <div style={{ textAlign:"center", padding:40 }}><Spinner /></div>;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <p style={{ fontWeight:900, fontSize:"0.95rem", color:"#000", margin:0 }}>👤 ملفي المهني</p>
          <p style={{ color:"#9ca3af", fontSize:"0.68rem", margin:"2px 0 0" }}>يظهر للجميع في قسم الاكتشاف</p>
        </div>
        {profile && !editing && (
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={()=>setEditing(true)}
              style={{ background:"#f1f5f9", border:"1.5px solid #e2e8f0", color:"#000", borderRadius:9, padding:"7px 14px", fontSize:"0.72rem", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
              <Edit3 style={{ width:12, height:12 }} />تعديل
            </button>
            <button onClick={del}
              style={{ background:"#fef2f2", border:"1.5px solid #fca5a5", color:"#991b1b", borderRadius:9, padding:"7px 12px", fontSize:"0.72rem", fontWeight:700, cursor:"pointer" }}>
              <Trash2 style={{ width:12, height:12 }} />
            </button>
          </div>
        )}
      </div>

      {saved && (
        <div style={{ background:"#f0fdf4", border:"1.5px solid #86efac", borderRadius:12, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
          <CheckCircle style={{ width:16, height:16, color:"#16a34a" }} />
          <p style={{ color:"#15803d", fontWeight:700, fontSize:"0.8rem", margin:0 }}>✅ تم حفظ ملفك المهني بنجاح وأصبح مرئياً للجميع!</p>
        </div>
      )}

      {profile && !editing ? (
        /* VIEW MODE */
        <div style={{ border:"2px solid #000", borderRadius:18, overflow:"hidden" }}>
          <div style={{ background:"#000", padding:"20px 22px" }}>
            <p style={{ color:"#fff", fontWeight:900, fontSize:"1.1rem", margin:"0 0 4px" }}>{profile.businessName}</p>
            {profile.tagline && <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"0.78rem", margin:"0 0 8px" }}>{profile.tagline}</p>}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <span style={{ background:"rgba(255,255,255,0.15)", color:"#fff", fontSize:"0.65rem", fontWeight:700, padding:"3px 10px", borderRadius:20 }}>
                {CATEGORIES.find(c=>c.id===profile.category)?.label}
              </span>
              {profile.location && (
                <span style={{ background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.75)", fontSize:"0.65rem", padding:"3px 10px", borderRadius:20 }}>
                  📍 {profile.location}
                </span>
              )}
              <span style={{ background:profile.isPublic?"rgba(34,197,94,0.2)":"rgba(107,114,128,0.2)", color:profile.isPublic?"#4ade80":"#9ca3af", fontSize:"0.65rem", fontWeight:700, padding:"3px 10px", borderRadius:20 }}>
                {profile.isPublic?"👁 ظاهر للعموم":"🔒 مخفي"}
              </span>
            </div>
          </div>
          <div style={{ padding:"20px 22px" }}>
            <p style={{ fontWeight:800, fontSize:"0.78rem", color:"#000", margin:"0 0 6px" }}>عن العمل</p>
            <p style={{ fontSize:"0.85rem", color:"#374151", lineHeight:1.8, margin:"0 0 16px", whiteSpace:"pre-line" }}>{profile.description}</p>
            {profile.skills && (
              <div style={{ marginBottom:16 }}>
                <p style={{ fontWeight:800, fontSize:"0.78rem", color:"#000", margin:"0 0 8px" }}>المهارات</p>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {profile.skills.split(",").map((s,i) => (
                    <span key={i} style={{ background:"#f1f5f9", color:"#374151", fontSize:"0.68rem", fontWeight:600, padding:"4px 10px", borderRadius:20 }}>{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}
            {(profile.whatsapp || profile.telegram) && (
              <div style={{ display:"flex", gap:8 }}>
                {profile.whatsapp && (
                  <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                    style={{ background:"#25d366", color:"#fff", borderRadius:10, padding:"9px 16px", fontSize:"0.78rem", fontWeight:900, display:"flex", alignItems:"center", gap:6, textDecoration:"none" }}>
                    <Phone style={{ width:13, height:13 }} />واتساب
                  </a>
                )}
                {profile.telegram && (
                  <a href={`https://t.me/${profile.telegram.replace("@","")}`} target="_blank" rel="noopener noreferrer"
                    style={{ background:"#2ca5e0", color:"#fff", borderRadius:10, padding:"9px 16px", fontSize:"0.78rem", fontWeight:900, display:"flex", alignItems:"center", gap:6, textDecoration:"none" }}>
                    <MessageCircle style={{ width:13, height:13 }} />تيليغرام
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* EDIT MODE */
        <div style={{ border:"2px solid #e2e8f0", borderRadius:18, padding:"24px 20px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={lS}>🏪 اسم العمل / الخدمة *</label>
              <input value={form.businessName} onChange={inp("businessName")} placeholder="مثال: مصمم هوية بصرية..." style={iS} />
            </div>
            <div>
              <label style={lS}>📂 التصنيف *</label>
              <select value={form.category} onChange={inp("category")} style={iS}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lS}>📍 المدينة / المنطقة</label>
              <input value={form.location} onChange={inp("location")} placeholder="مثال: صنعاء، عدن..." style={iS} />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={lS}>💬 شعار مختصر</label>
              <input value={form.tagline} onChange={inp("tagline")} placeholder="مثال: أصمم هويتك الرقمية بأعلى جودة" style={iS} />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={lS}>📝 وصف خدماتك ومهاراتك *</label>
              <textarea value={form.description} onChange={inp("description")} rows={4}
                placeholder="اشرح بالتفصيل ما تقدمه، خبرتك، وما يميزك..."
                style={{ ...iS, resize:"vertical" }} />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={lS}>🛠 مهاراتك (افصل بينها بفاصلة)</label>
              <input value={form.skills} onChange={inp("skills")} placeholder="مثال: Photoshop, Figma, تصميم شعارات, واجهات مواقع" style={iS} />
            </div>
            <div>
              <label style={lS}>📱 واتساب</label>
              <input value={form.whatsapp} onChange={inp("whatsapp")} placeholder="+967xxxxxxxxx" style={iS} />
            </div>
            <div>
              <label style={lS}>✈️ تيليغرام</label>
              <input value={form.telegram} onChange={inp("telegram")} placeholder="@معرفك" style={iS} />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={lS}>🔗 أعمال سابقة / روابط</label>
              <textarea value={form.portfolio} onChange={inp("portfolio")} rows={3}
                placeholder="أضف روابط أعمالك السابقة أو وصفها..."
                style={{ ...iS, resize:"vertical" }} />
            </div>
            <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:10 }}>
              <input type="checkbox" id="pub" checked={form.isPublic} onChange={e=>setForm(p=>({...p,isPublic:e.target.checked}))} style={{ width:16, height:16, cursor:"pointer" }} />
              <label htmlFor="pub" style={{ fontWeight:700, fontSize:"0.82rem", color:"#000", cursor:"pointer" }}>👁 إظهار ملفي للعموم في قسم الاكتشاف</label>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={save} disabled={saving || !form.businessName.trim() || !form.description.trim()}
              style={{ flex:1, background:"#000", color:"#fff", border:"none", borderRadius:12, padding:"13px", fontWeight:900, fontSize:"0.88rem", cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {saving ? <><Spinner />جاري الحفظ...</> : <><CheckCircle style={{ width:15, height:15 }} />حفظ ونشر الملف</>}
            </button>
            {profile && (
              <button onClick={()=>setEditing(false)}
                style={{ background:"#f1f5f9", border:"1.5px solid #e2e8f0", color:"#000", borderRadius:12, padding:"13px 18px", fontWeight:700, fontSize:"0.82rem", cursor:"pointer" }}>
                إلغاء
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════ ESCROW TAB ════════════ */
function EscrowTab({ userId }: { userId: string }) {
  const [txs, setTxs] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<number|null>(null);
  const [form, setForm] = useState({ counterpartyName:"", counterpartyContact:"", amount:"", currency:"YER", description:"" });

  const load = () => {
    setLoading(true);
    fetch("/api/marketplace/escrow").then(r=>r.ok?r.json():[]).then((d:Escrow[])=>setTxs(d)).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); }, []);

  const create = async () => {
    if (!form.counterpartyName.trim()||!form.counterpartyContact.trim()||!form.amount.trim()||!form.description.trim()) return;
    setSaving(true);
    try {
      const r = await fetch("/api/marketplace/escrow", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
      });
      if (r.ok) { const tx = await r.json() as Escrow; setTxs(p=>[tx,...p]); setCreating(false); setForm({ counterpartyName:"", counterpartyContact:"", amount:"", currency:"YER", description:"" }); }
    } catch {} finally { setSaving(false); }
  };

  const update = async (id:number, status:string) => {
    const r = await fetch(`/api/marketplace/escrow/${id}`, {
      method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ status }),
    });
    if (r.ok) { const tx = await r.json() as Escrow; setTxs(p=>p.map(t=>t.id===id?tx:t)); }
  };

  const iS: React.CSSProperties = { width:"100%", padding:"10px 13px", border:"2px solid #e2e8f0", borderRadius:10, fontSize:"0.82rem", fontFamily:"inherit", color:"#000", background:"#fff", outline:"none", boxSizing:"border-box" };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <p style={{ fontWeight:900, fontSize:"0.95rem", color:"#000", margin:0 }}>🛡 الوساطة الرقمية المستقلة</p>
          <p style={{ color:"#9ca3af", fontSize:"0.68rem", margin:"2px 0 0" }}>احمِ أموالك وحقوقك في التعاملات التجارية</p>
        </div>
        <button onClick={()=>setCreating(!creating)}
          style={{ background:"#000", color:"#fff", border:"none", borderRadius:10, padding:"9px 16px", fontSize:"0.75rem", fontWeight:900, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
          <Plus style={{ width:14, height:14 }} />طلب وساطة جديد
        </button>
      </div>

      {/* Info box */}
      <div style={{ background:"#eff6ff", border:"1.5px solid #bfdbfe", borderRadius:14, padding:"14px 18px", marginBottom:20 }}>
        <p style={{ fontWeight:900, fontSize:"0.8rem", color:"#1e40af", margin:"0 0 6px" }}>🛡 كيف تعمل الوساطة الرقمية؟</p>
        <div style={{ fontSize:"0.72rem", color:"#1d4ed8", lineHeight:1.8 }}>
          <p style={{ margin:0 }}>١. أنشئ طلب وساطة وأرسل رقمه للطرف الآخر</p>
          <p style={{ margin:0 }}>٢. يتحقق الطرفان من التفاصيل ويوافقان</p>
          <p style={{ margin:0 }}>٣. تحتفظ بسجل الاتفاق داخل المنصة كحماية قانونية</p>
          <p style={{ margin:0 }}>٤. بعد التنفيذ والرضا: يُغلق العقد ويُوثَّق</p>
        </div>
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ border:"2px solid #000", borderRadius:16, padding:"20px", marginBottom:20 }}>
          <p style={{ fontWeight:900, fontSize:"0.9rem", color:"#000", margin:"0 0 16px" }}>📋 طلب وساطة جديد</p>
          <div style={{ display:"grid", gap:12 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div>
                <label style={{ fontWeight:800, fontSize:"0.75rem", color:"#000", display:"block", marginBottom:5 }}>اسم الطرف الآخر *</label>
                <input value={form.counterpartyName} onChange={e=>setForm(p=>({...p,counterpartyName:e.target.value}))} placeholder="اسم البائع أو المشتري" style={iS} />
              </div>
              <div>
                <label style={{ fontWeight:800, fontSize:"0.75rem", color:"#000", display:"block", marginBottom:5 }}>تواصل الطرف الآخر *</label>
                <input value={form.counterpartyContact} onChange={e=>setForm(p=>({...p,counterpartyContact:e.target.value}))} placeholder="واتساب أو تيليغرام" style={iS} />
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10 }}>
              <div>
                <label style={{ fontWeight:800, fontSize:"0.75rem", color:"#000", display:"block", marginBottom:5 }}>المبلغ *</label>
                <input value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} placeholder="5000" type="number" style={iS} />
              </div>
              <div>
                <label style={{ fontWeight:800, fontSize:"0.75rem", color:"#000", display:"block", marginBottom:5 }}>العملة</label>
                <select value={form.currency} onChange={e=>setForm(p=>({...p,currency:e.target.value}))} style={iS}>
                  <option value="YER">🇾🇪 ريال يمني</option>
                  <option value="USD">🇺🇸 دولار</option>
                  <option value="SAR">🇸🇦 ريال سعودي</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontWeight:800, fontSize:"0.75rem", color:"#000", display:"block", marginBottom:5 }}>وصف الاتفاق *</label>
              <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3}
                placeholder="اشرح بالتفصيل: ما الخدمة أو البضاعة؟ ما الشروط؟ متى التسليم؟"
                style={{ ...iS, resize:"vertical" }} />
            </div>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:16 }}>
            <button onClick={create} disabled={saving}
              style={{ flex:1, background:"#000", color:"#fff", border:"none", borderRadius:11, padding:"12px", fontWeight:900, fontSize:"0.85rem", cursor:saving?"not-allowed":"pointer" }}>
              {saving ? "جاري الحفظ..." : "🛡 إنشاء وثيقة الوساطة"}
            </button>
            <button onClick={()=>setCreating(false)}
              style={{ background:"#f1f5f9", border:"1.5px solid #e2e8f0", color:"#000", borderRadius:11, padding:"12px 16px", fontWeight:700, cursor:"pointer" }}>
              إلغاء
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign:"center", padding:40 }}><Spinner /></div>
      ) : txs.length === 0 ? (
        <div style={{ textAlign:"center", padding:"40px 20px", background:"#f8fafc", borderRadius:16, border:"1.5px dashed #e2e8f0" }}>
          <p style={{ fontSize:"2rem", margin:"0 0 10px" }}>🛡</p>
          <p style={{ fontWeight:900, color:"#000", margin:"0 0 4px" }}>لا توجد وثائق وساطة بعد</p>
          <p style={{ color:"#9ca3af", fontSize:"0.75rem" }}>أنشئ أول وثيقة لحماية تعاملاتك المالية</p>
        </div>
      ) : (
        <div style={{ display:"grid", gap:10 }}>
          {txs.map(tx => {
            const s = ESCROW_STATUS[tx.status] ?? ESCROW_STATUS["pending"]!;
            return (
              <div key={tx.id} style={{ border:"1.5px solid #e2e8f0", borderRadius:14, overflow:"hidden" }}>
                <div style={{ padding:"14px 18px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span style={{ background:s.bg, color:s.color, fontSize:"0.62rem", fontWeight:700, padding:"3px 8px", borderRadius:20, display:"flex", alignItems:"center", gap:3 }}>
                          <EscrowIcon name={s.iconName} />{s.label}
                        </span>
                        <span style={{ color:"#9ca3af", fontSize:"0.6rem" }}>#{tx.id}</span>
                      </div>
                      <p style={{ fontWeight:800, fontSize:"0.85rem", color:"#000", margin:"0 0 2px" }}>مع: {tx.counterpartyName}</p>
                      <p style={{ color:"#6b7280", fontSize:"0.72rem", margin:0 }}>{tx.counterpartyContact}</p>
                    </div>
                    <div style={{ textAlign:"left", flexShrink:0 }}>
                      <p style={{ fontWeight:900, fontSize:"0.95rem", color:"#000", margin:0 }}>{tx.amount} {tx.currency}</p>
                      <p style={{ color:"#9ca3af", fontSize:"0.6rem", margin:"2px 0 0" }}>{new Date(tx.createdAt).toLocaleDateString("ar-EG")}</p>
                    </div>
                  </div>
                  <p style={{ fontSize:"0.78rem", color:"#374151", margin:"10px 0 0", lineHeight:1.7,
                    ...(expanded!==tx.id ? { display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as const, overflow:"hidden" } : {}) }}>
                    {tx.description}
                  </p>
                  <button onClick={()=>setExpanded(expanded===tx.id?null:tx.id)}
                    style={{ background:"none", border:"none", color:"#9ca3af", fontSize:"0.62rem", cursor:"pointer", marginTop:4, display:"flex", alignItems:"center", gap:2 }}>
                    {expanded===tx.id?<><ChevronUp style={{ width:10, height:10 }} />طي</>:<><ChevronDown style={{ width:10, height:10 }} />تفاصيل</>}
                  </button>
                </div>
                {tx.initiatorId === userId && tx.status === "pending" && (
                  <div style={{ background:"#f8fafc", borderTop:"1px solid #f1f5f9", padding:"10px 18px", display:"flex", gap:8 }}>
                    <button onClick={()=>update(tx.id,"active")}
                      style={{ background:"#1d4ed8", color:"#fff", border:"none", borderRadius:8, padding:"6px 14px", fontSize:"0.7rem", fontWeight:700, cursor:"pointer" }}>
                      ✅ تفعيل الحماية
                    </button>
                    <button onClick={()=>update(tx.id,"cancelled")}
                      style={{ background:"#fef2f2", border:"1.5px solid #fca5a5", color:"#991b1b", borderRadius:8, padding:"6px 14px", fontSize:"0.7rem", fontWeight:700, cursor:"pointer" }}>
                      ❌ إلغاء
                    </button>
                  </div>
                )}
                {tx.initiatorId === userId && tx.status === "active" && (
                  <div style={{ background:"#f0fdf4", borderTop:"1px solid #bbf7d0", padding:"10px 18px", display:"flex", gap:8 }}>
                    <button onClick={()=>update(tx.id,"released")}
                      style={{ background:"#16a34a", color:"#fff", border:"none", borderRadius:8, padding:"6px 14px", fontSize:"0.7rem", fontWeight:700, cursor:"pointer" }}>
                      🎉 الإفراج (تم التسليم)
                    </button>
                    <button onClick={()=>update(tx.id,"disputed")}
                      style={{ background:"#fef2f2", border:"1.5px solid #fca5a5", color:"#991b1b", borderRadius:8, padding:"6px 14px", fontSize:"0.7rem", fontWeight:700, cursor:"pointer" }}>
                      ⚠️ نزاع
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════ TEMPLATES TAB ════════════ */
function TemplatesTab() {
  const [copied, setCopied] = useState<string|null>(null);
  const [expanded, setExpanded] = useState<string|null>(TEMPLATES[0]?.cat ?? null);

  const copy = (content: string, key: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(key); setTimeout(()=>setCopied(null),2000);
    }).catch(()=>{});
  };

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <p style={{ fontWeight:900, fontSize:"0.95rem", color:"#000", margin:"0 0 4px" }}>📚 مكتبة النماذج والحلول السريعة</p>
        <p style={{ color:"#9ca3af", fontSize:"0.72rem", margin:0 }}>نصوص وعقود وقوالب جاهزة — انسخ واستخدم فوراً</p>
      </div>

      {TEMPLATES.map(group => (
        <div key={group.cat} style={{ border:"1.5px solid #e2e8f0", borderRadius:14, overflow:"hidden", marginBottom:12 }}>
          <button onClick={()=>setExpanded(expanded===group.cat?null:group.cat)}
            style={{ width:"100%", background:"#f8fafc", border:"none", padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", fontFamily:"inherit" }}>
            <p style={{ fontWeight:900, fontSize:"0.88rem", color:"#000", margin:0 }}>{group.cat}</p>
            {expanded===group.cat ? <ChevronUp style={{ width:16, height:16, color:"#6b7280" }} /> : <ChevronDown style={{ width:16, height:16, color:"#6b7280" }} />}
          </button>
          {expanded===group.cat && (
            <div style={{ padding:"4px 16px 16px" }}>
              {group.items.map((item, i) => {
                const key = `${group.cat}-${i}`;
                return (
                  <div key={i} style={{ border:"1.5px solid #e2e8f0", borderRadius:12, overflow:"hidden", marginTop:12 }}>
                    <div style={{ background:"#fff", padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <p style={{ fontWeight:800, fontSize:"0.82rem", color:"#000", margin:0 }}>{item.title}</p>
                      <button onClick={()=>copy(item.content, key)}
                        style={{ background:copied===key?"#f0fdf4":"#f1f5f9", border:`1.5px solid ${copied===key?"#86efac":"#e2e8f0"}`, color:copied===key?"#16a34a":"#374151", borderRadius:8, padding:"5px 12px", fontSize:"0.68rem", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                        {copied===key ? <><CheckCheck style={{ width:12, height:12 }} />تم النسخ!</> : <><Copy style={{ width:12, height:12 }} />نسخ</>}
                      </button>
                    </div>
                    <pre style={{ background:"#f8fafc", padding:"14px", margin:0, fontSize:"0.75rem", color:"#374151", lineHeight:1.7, whiteSpace:"pre-wrap", wordBreak:"break-word", fontFamily:"'Cairo','Tajawal',sans-serif", maxHeight:200, overflowY:"auto" }}>
                      {item.content}
                    </pre>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Custom request */}
      <div style={{ background:"#000", borderRadius:16, padding:"20px", marginTop:20, textAlign:"center" }}>
        <p style={{ color:"#fff", fontWeight:900, fontSize:"0.9rem", margin:"0 0 6px" }}>🤖 لا تجد ما تبحث عنه؟</p>
        <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.72rem", margin:"0 0 14px" }}>اطلب من الوكيل الذكي إنشاء نموذج مخصص لك</p>
        <button onClick={()=>window.location.href="/marketplace"}
          style={{ background:"#fff", color:"#000", border:"none", borderRadius:10, padding:"10px 20px", fontWeight:900, fontSize:"0.8rem", cursor:"pointer" }}>
          ⚡ اطلب نموذجاً مخصصاً
        </button>
      </div>
    </div>
  );
}
