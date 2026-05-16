import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { ArrowLeft, Upload, Send, Check, AlertCircle, Copy, CheckCheck, Zap, Sparkles, Crown, Building2, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const PLANS = [
  { key: "weekly",     labelAr: "أسبوعي",  price: "$2.99",      icon: Zap },
  { key: "monthly",    labelAr: "شهري",    price: "$9.99",      icon: Sparkles },
  { key: "annual",     labelAr: "سنوي",    price: "$79.99",     icon: Crown },
  { key: "enterprise", labelAr: "مؤسسي",   price: "حسب الطلب", icon: Building2 },
] as const;

export default function PaymentRequestPage() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const { lang, isRTL } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState("");
  const [transferNumber, setTransferNumber] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [kuraimiAccount, setKuraimiAccount] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/payments/config")
      .then(r => r.ok ? r.json() : null)
      .then((d: { kuraimiAccount: string } | null) => {
        if (d?.kuraimiAccount) setKuraimiAccount(d.kuraimiAccount);
      })
      .catch(() => {});
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(kuraimiAccount).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setError("حجم الصورة يجب أن يكون أقل من 8MB"); return; }
    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setReceiptImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError("");
    if (!user) { setLocation("/sign-in"); return; }
    if (!selectedPlan) { setError("⚠ اختر الخطة المطلوبة أولاً"); return; }
    if (!transferNumber.trim() || !/^\d+$/.test(transferNumber)) { setError("⚠ رقم السند إجباري ويجب أن يحتوي أرقاماً فقط"); return; }
    if (!receiptImage) { setError("⚠ صورة إشعار التحويل إجبارية"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/payments/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planRequested: selectedPlan, receiptImage, transferNumber: transferNumber.trim(), transferService: "kuraimi", notes }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "حدث خطأ. حاول مرة أخرى."); return; }
      setSubmitted(true);
    } catch { setError("تعذّر الاتصال. حاول مرة أخرى."); }
    finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div style={{ background: "#fff", minHeight: "100vh", color: "#000" }} className="flex items-center justify-center p-4" dir="rtl">
        <div className="text-center max-w-sm w-full space-y-5">
          <div style={{ width: 96, height: 96, borderRadius: "50%", background: "#f0fdf4", border: "3px solid #22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, margin: "0 auto" }}>✅</div>
          <h2 style={{ fontWeight: 900, fontSize: "1.5rem", color: "#000" }}>تم إرسال طلبك!</h2>
          <p style={{ color: "#555", fontSize: "0.9rem" }}>سيراجع المدير <strong>خالد سلمان</strong> طلبك ويفعّل اشتراكك فوراً.</p>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16 }} className="space-y-2">
            <a href="https://wa.me/967783701365" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#22c55e", color: "#fff", padding: "10px 16px", borderRadius: 10, fontWeight: 700, fontSize: "0.85rem", textDecoration: "none" }}>📱 واتساب — +967 783 701 365</a>
            <a href="https://t.me/kshskshg" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#0088cc", color: "#fff", padding: "10px 16px", borderRadius: 10, fontWeight: 700, fontSize: "0.85rem", textDecoration: "none" }}>✈️ تيليغرام @kshskshg</a>
          </div>
          <Link href="/chat"><button style={{ background: "#000", color: "#fff", width: "100%", padding: 14, borderRadius: 12, fontWeight: 800, border: "none", cursor: "pointer", fontSize: "1rem" }}>الذهاب إلى المحادثة</button></Link>
        </div>
      </div>
    );
  }

  const validTN = transferNumber.length > 0 && /^\d+$/.test(transferNumber);

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", color: "#000000" }} dir={isRTL ? "rtl" : "ltr"}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px 48px" }}>

        {/* ── رأس الصفحة ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href="/pricing">
            <button style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", padding: 8, borderRadius: 10, cursor: "pointer", display: "flex" }}>
              <ArrowLeft style={{ width: 16, height: 16, color: "#000", transform: isRTL ? "scaleX(-1)" : undefined }} />
            </button>
          </Link>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: "1.2rem", color: "#000", margin: 0 }}>الاشتراك عبر بنك الكريمي</h1>
            <p style={{ color: "#6b7280", fontSize: "0.75rem", margin: "2px 0 0" }}>أرسل حوالة واحصل على تفعيل فوري</p>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* ── رقم حساب الكريمي — بارز جداً ── */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{ background: "#fffbeb", border: "3px solid #f59e0b", borderRadius: 20, padding: "20px 16px", marginBottom: 24, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: "1.5rem" }}>🏦</span>
            <span style={{ fontWeight: 800, fontSize: "1rem", color: "#92400e" }}>بنك الكريمي للصرافة</span>
          </div>
          <p style={{ color: "#78350f", fontSize: "0.75rem", marginBottom: 12, fontWeight: 600 }}>
            حوّل المبلغ إلى الرقم التالي قبل إرسال الطلب
          </p>
          <div style={{ background: "#fff", border: "2px dashed #f59e0b", borderRadius: 14, padding: "16px 12px", marginBottom: 14 }}>
            <p style={{ color: "#374151", fontSize: "0.65rem", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>رقم الحساب:</p>
            {kuraimiAccount ? (
              <p style={{ fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: "clamp(1.4rem, 6vw, 2.2rem)", color: "#000", letterSpacing: "0.12em", lineHeight: 1.2, wordBreak: "break-all", margin: 0 }}>
                {kuraimiAccount}
              </p>
            ) : (
              <p style={{ color: "#9ca3af", fontSize: "0.9rem", margin: 0 }}>جاري التحميل...</p>
            )}
          </div>
          {kuraimiAccount && (
            <button onClick={handleCopy} style={{ background: copied ? "#22c55e" : "#f59e0b", color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
              {copied ? <><CheckCheck style={{ width: 14, height: 14 }} />تم النسخ!</> : <><Copy style={{ width: 14, height: 14 }} />نسخ رقم الحساب</>}
            </button>
          )}
          <p style={{ color: "#92400e", fontSize: "0.75rem", marginTop: 10, fontWeight: 600, marginBottom: 0 }}>
            اسم صاحب الحساب: <strong style={{ color: "#000" }}>خالد سلمان</strong>
          </p>
        </div>

        {/* ── الخطوة ١: اختيار الخطة ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ background: "#000", color: "#fff", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 900, flexShrink: 0 }}>١</span>
            <h2 style={{ fontWeight: 900, fontSize: "1rem", color: "#000", margin: 0 }}>اختر خطة الاشتراك</h2>
            <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>* إجباري</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {PLANS.map(p => {
              const Icon = p.icon;
              const sel = selectedPlan === p.key;
              return (
                <button key={p.key} onClick={() => setSelectedPlan(p.key)} style={{ background: sel ? "#000" : "#f8fafc", border: `2px solid ${sel ? "#000" : "#e2e8f0"}`, color: sel ? "#fff" : "#000", borderRadius: 14, padding: "12px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "right", transition: "all 0.15s" }}>
                  <Icon style={{ width: 20, height: 20, flexShrink: 0, color: sel ? "#fff" : "#6366f1" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.85rem", margin: 0 }}>{lang === "ar" ? p.labelAr : p.key}</p>
                    <p style={{ fontSize: "0.7rem", opacity: 0.7, margin: 0 }}>{p.price}</p>
                  </div>
                  {sel && <Check style={{ width: 16, height: 16, flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── الخطوة ٢: رقم السند ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ background: "#000", color: "#fff", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 900, flexShrink: 0 }}>٢</span>
            <h2 style={{ fontWeight: 900, fontSize: "1rem", color: "#000", margin: 0 }}>رقم السند / رقم العملية</h2>
            <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>* إجباري</span>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={20}
              placeholder="أدخل أرقام السند"
              value={transferNumber}
              onChange={e => { setError(""); setTransferNumber(e.target.value.replace(/\D/g, "")); }}
              style={{ width: "100%", background: "#f8fafc", border: `2px solid ${validTN ? "#22c55e" : transferNumber.length > 0 ? "#ef4444" : "#e2e8f0"}`, color: "#000", fontFamily: "'Courier New', monospace", fontSize: "1.4rem", fontWeight: 800, padding: "14px 44px 14px 16px", borderRadius: 14, outline: "none", letterSpacing: "0.12em", textAlign: "center", direction: "ltr", boxSizing: "border-box" }}
            />
            {validTN && <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: 14, color: "#22c55e", display: "flex" }}><Check style={{ width: 20, height: 20 }} /></span>}
          </div>
          <p style={{ color: "#6b7280", fontSize: "0.72rem", marginTop: 6, textAlign: "center" }}>رقم مرجع الحوالة من تطبيق الكريمي — أرقام فقط</p>
        </div>

        {/* ── الخطوة ٣: صورة الإيصال ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ background: "#000", color: "#fff", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 900, flexShrink: 0 }}>٣</span>
            <h2 style={{ fontWeight: 900, fontSize: "1rem", color: "#000", margin: 0 }}>صورة إشعار التحويل</h2>
            <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>* إجبارية</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
          {receiptImage ? (
            <div style={{ border: "2px solid #22c55e", background: "#f0fdf4", borderRadius: 16, overflow: "hidden", position: "relative" }}>
              <img src={receiptImage} alt="الإيصال" style={{ width: "100%", maxHeight: 280, objectFit: "contain", display: "block" }} />
              <button onClick={() => { setReceiptImage(null); setReceiptFileName(""); }} style={{ position: "absolute", top: 8, right: 8, background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}><X style={{ width: 16, height: 16 }} /></button>
              <div style={{ background: "#f0fdf4", borderTop: "1px solid #bbf7d0", padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                <Check style={{ width: 14, height: 14, color: "#166534", flexShrink: 0 }} />
                <span style={{ color: "#166534", fontSize: "0.75rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{receiptFileName || "تم رفع الصورة ✓"}</span>
              </div>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} style={{ width: "100%", background: "#f8fafc", border: "2.5px dashed #cbd5e1", color: "#374151", borderRadius: 16, padding: "36px 16px", cursor: "pointer", textAlign: "center", boxSizing: "border-box" }}>
              <Upload style={{ width: 40, height: 40, margin: "0 auto 12px", color: "#9ca3af", display: "block" }} />
              <p style={{ color: "#000", fontWeight: 800, fontSize: "1rem", margin: "0 0 4px" }}>اضغط لرفع لقطة الشاشة</p>
              <p style={{ color: "#6b7280", fontSize: "0.8rem", margin: "0 0 4px" }}>صورة إشعار التحويل من تطبيق الكريمي</p>
              <p style={{ color: "#9ca3af", fontSize: "0.7rem", margin: 0 }}>PNG / JPG — بحد أقصى 8MB</p>
            </button>
          )}
        </div>

        {/* ── الخطوة ٤: ملاحظات (اختياري) ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ background: "#6b7280", color: "#fff", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 900, flexShrink: 0 }}>٤</span>
            <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#000", margin: 0 }}>ملاحظات <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "0.8rem" }}>(اختياري)</span></h2>
          </div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="أي معلومات إضافية للمدير..."
            style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#000", padding: "12px 14px", borderRadius: 12, outline: "none", resize: "none", fontSize: "0.9rem", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>

        {/* ── خطأ ── */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", color: "#991b1b", borderRadius: 12, padding: "12px 14px", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.875rem" }}>
            <AlertCircle style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0 }} /><span>{error}</span>
          </div>
        )}

        {/* ── زر الإرسال ── */}
        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: loading ? "#6b7280" : "#000", color: "#fff", border: "none", borderRadius: 14, padding: 17, fontSize: "1.05rem", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxSizing: "border-box" }}>
          {loading
            ? <><span style={{ width: 20, height: 20, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "kspin 0.8s linear infinite" }} />جاري الإرسال...</>
            : <><Send style={{ width: 20, height: 20 }} />إرسال طلب الاشتراك</>}
        </button>

        {/* ── قائمة التحقق ── */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14, marginTop: 14 }}>
          <p style={{ color: "#374151", fontSize: "0.75rem", fontWeight: 700, marginBottom: 8, marginTop: 0 }}>قائمة التحقق:</p>
          {[
            { label: "تم تحويل المبلغ لحساب الكريمي", ok: !!kuraimiAccount },
            { label: "تم اختيار الخطة", ok: !!selectedPlan },
            { label: "تم إدخال رقم السند بشكل صحيح", ok: validTN },
            { label: "تم رفع صورة الإيصال", ok: !!receiptImage },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", color: item.ok ? "#166534" : "#374151", marginBottom: 4 }}>
              <span>{item.ok ? "✅" : "⬜"}</span>{item.label}
            </div>
          ))}
        </div>

        <p style={{ color: "#9ca3af", textAlign: "center", fontSize: "0.72rem", marginTop: 12 }}>
          سيتم تفعيل اشتراكك فوراً بعد موافقة المدير خالد سلمان
        </p>
      </div>
      <style>{`@keyframes kspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
