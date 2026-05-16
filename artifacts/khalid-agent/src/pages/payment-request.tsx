import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useUser } from "@clerk/react";
import { ArrowLeft, Upload, Send, Check, AlertCircle, Copy, CheckCheck, Zap, Sparkles, Crown, Building2, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const PLANS = [
  { key: "weekly",     labelAr: "أسبوعي",  labelEn: "Weekly",     price: "$2.99",      priceAr: "٢٫٩٩ دولار",  icon: Zap,       days: "7 أيام" },
  { key: "monthly",    labelAr: "شهري",    labelEn: "Monthly",    price: "$9.99",      priceAr: "٩٫٩٩ دولار",  icon: Sparkles,  days: "30 يوماً" },
  { key: "annual",     labelAr: "سنوي",    labelEn: "Annual",     price: "$79.99",     priceAr: "٧٩٫٩٩ دولار", icon: Crown,     days: "365 يوماً" },
  { key: "enterprise", labelAr: "مؤسسي",   labelEn: "Enterprise", price: "حسب الطلب", priceAr: "حسب الطلب",   icon: Building2, days: "مدى الحياة" },
] as const;

export default function PaymentRequestPage() {
  const { user } = useUser();
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
  const [kuraimiAccount, setKuraimiAccount] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/payments/config")
      .then(r => r.ok ? r.json() : null)
      .then((d: { kuraimiAccount: string } | null) => {
        if (d?.kuraimiAccount) setKuraimiAccount(d.kuraimiAccount);
      })
      .catch(() => {});
  }, []);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(kuraimiAccount).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError(lang === "ar" ? "حجم الصورة يجب أن يكون أقل من 8 ميغابايت" : "Image must be under 8MB");
      return;
    }
    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setReceiptImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError("");
    if (!selectedPlan) {
      setError(lang === "ar" ? "⚠ اختر الخطة المطلوبة أولاً" : "⚠ Select a plan first");
      return;
    }
    if (!transferNumber.trim()) {
      setError(lang === "ar" ? "⚠ رقم السند / رقم العملية إجباري" : "⚠ Transaction reference number is required");
      return;
    }
    if (!/^\d+$/.test(transferNumber.trim())) {
      setError(lang === "ar" ? "⚠ رقم السند يجب أن يحتوي على أرقام فقط" : "⚠ Reference must contain digits only");
      return;
    }
    if (!receiptImage) {
      setError(lang === "ar" ? "⚠ صورة إشعار التحويل إجبارية" : "⚠ Transfer receipt screenshot is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/payments/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planRequested: selectedPlan,
          receiptImage,
          transferNumber: transferNumber.trim(),
          transferService: "kuraimi",
          notes,
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? (lang === "ar" ? "حدث خطأ. حاول مرة أخرى." : "An error occurred. Please try again."));
        return;
      }
      setSubmitted(true);
    } catch {
      setError(lang === "ar" ? "تعذّر الاتصال بالسيرفر. حاول مرة أخرى." : "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ background: "#ffffff", minHeight: "100vh" }} className="flex items-center justify-center p-4" dir="rtl">
        <div className="text-center space-y-4 max-w-xs">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl" style={{ background: "#f1f5f9" }}>🔒</div>
          <p style={{ color: "#000000" }} className="font-bold text-lg">يجب تسجيل الدخول أولاً</p>
          <p style={{ color: "#555555" }} className="text-sm">قم بتسجيل الدخول لإتمام عملية الاشتراك</p>
          <Link href="/sign-in">
            <button style={{ background: "#000000", color: "#ffffff" }} className="w-full py-3 rounded-xl font-bold text-base">
              تسجيل الدخول
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ background: "#ffffff", minHeight: "100vh" }} className="flex items-center justify-center p-4" dir="rtl">
        <div className="text-center space-y-5 max-w-sm w-full">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto text-5xl" style={{ background: "#f0fdf4", border: "3px solid #22c55e" }}>
            ✅
          </div>
          <div>
            <h2 style={{ color: "#000000" }} className="text-2xl font-black">تم إرسال طلبك بنجاح!</h2>
            <p style={{ color: "#555555" }} className="text-sm mt-2 leading-relaxed">
              سيقوم المدير <strong>خالد سلمان</strong> بمراجعة بياناتك وتفعيل اشتراكك فوراً بعد التحقق من الحوالة.
            </p>
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }} className="rounded-xl p-4 text-right space-y-2">
            <p style={{ color: "#374151" }} className="text-xs font-bold mb-2">للمتابعة السريعة:</p>
            <a href="https://wa.me/967783701365" target="_blank" rel="noopener noreferrer"
              style={{ background: "#22c55e", color: "#ffffff" }}
              className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-bold justify-center">
              📱 واتساب — +967 783 701 365
            </a>
            <a href="https://t.me/kshskshg" target="_blank" rel="noopener noreferrer"
              style={{ background: "#0088cc", color: "#ffffff" }}
              className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-bold justify-center">
              ✈️ تيليغرام — @kshskshg
            </a>
          </div>
          <Link href="/chat">
            <button style={{ background: "#000000", color: "#ffffff" }} className="w-full py-3 rounded-xl font-bold text-base">
              الذهاب إلى المحادثة
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const isValidTN = transferNumber.length > 0 && /^\d+$/.test(transferNumber);

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", color: "#000000" }} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/pricing">
            <button style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#000000", padding: "8px", borderRadius: "10px", cursor: "pointer" }}>
              <ArrowLeft className="w-4 h-4" style={{ transform: isRTL ? "scaleX(-1)" : undefined }} />
            </button>
          </Link>
          <div>
            <h1 style={{ color: "#000000", fontWeight: 900, fontSize: "1.25rem" }}>الاشتراك عبر بنك الكريمي</h1>
            <p style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "2px" }}>أرسل حوالة مصرفية واحصل على تفعيل فوري</p>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* ── KURAIMI ACCOUNT — VERY PROMINENT ── */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{ background: "#fffbeb", border: "3px solid #f59e0b", borderRadius: "20px", padding: "20px", marginBottom: "24px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "1.6rem" }}>🏦</span>
            <span style={{ color: "#92400e", fontWeight: 800, fontSize: "1rem" }}>بنك الكريمي للصرافة</span>
          </div>
          <p style={{ color: "#78350f", fontSize: "0.75rem", marginBottom: "12px", fontWeight: 600 }}>
            حوّل المبلغ إلى رقم الحساب أدناه قبل إرسال الطلب
          </p>
          <div style={{ background: "#ffffff", border: "2px dashed #f59e0b", borderRadius: "14px", padding: "16px 12px", marginBottom: "12px" }}>
            <p style={{ color: "#374151", fontSize: "0.7rem", fontWeight: 700, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              رقم الحساب:
            </p>
            {kuraimiAccount ? (
              <p style={{
                color: "#000000",
                fontFamily: "'Courier New', monospace",
                letterSpacing: "0.12em",
                fontSize: "clamp(1.3rem, 6vw, 2rem)",
                fontWeight: 900,
                lineHeight: 1.2,
                wordBreak: "break-all",
              }}>
                {kuraimiAccount}
              </p>
            ) : (
              <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>جاري التحميل...</p>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            {kuraimiAccount && (
              <button
                onClick={handleCopyAccount}
                style={{
                  background: copied ? "#22c55e" : "#f59e0b",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                {copied ? <><CheckCheck style={{ width: 14, height: 14 }} /> تم النسخ!</> : <><Copy style={{ width: 14, height: 14 }} /> نسخ رقم الحساب</>}
              </button>
            )}
          </div>
          <p style={{ color: "#92400e", fontSize: "0.75rem", marginTop: "10px", fontWeight: 600 }}>
            اسم صاحب الحساب: <strong style={{ color: "#000000" }}>خالد سلمان</strong>
          </p>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* ── STEP 1: Plan ── */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ background: "#000000", color: "#ffffff", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 900, flexShrink: 0 }}>١</span>
            <h2 style={{ color: "#000000", fontWeight: 900, fontSize: "1rem" }}>اختر خطة الاشتراك</h2>
            <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>* إجباري</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {PLANS.map(p => {
              const Icon = p.icon;
              const sel = selectedPlan === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setSelectedPlan(p.key)}
                  style={{
                    background: sel ? "#000000" : "#f8fafc",
                    border: sel ? "2px solid #000000" : "2px solid #e2e8f0",
                    color: sel ? "#ffffff" : "#000000",
                    borderRadius: "14px",
                    padding: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    textAlign: "right",
                    transition: "all 0.15s",
                  }}>
                  <Icon style={{ width: 20, height: 20, flexShrink: 0, color: sel ? "#ffffff" : "#6366f1" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.85rem", margin: 0 }}>{lang === "ar" ? p.labelAr : p.labelEn}</p>
                    <p style={{ fontSize: "0.7rem", opacity: 0.7, margin: 0 }}>{lang === "ar" ? p.priceAr : p.price}</p>
                  </div>
                  {sel && <Check style={{ width: 16, height: 16, flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* ── STEP 2: Transfer Number ── */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <span style={{ background: "#000000", color: "#ffffff", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 900, flexShrink: 0 }}>٢</span>
            <h2 style={{ color: "#000000", fontWeight: 900, fontSize: "1rem" }}>رقم السند / رقم العملية</h2>
            <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>* إجباري</span>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              style={{
                width: "100%",
                background: "#f8fafc",
                border: `2px solid ${isValidTN ? "#22c55e" : transferNumber.length > 0 ? "#ef4444" : "#e2e8f0"}`,
                color: "#000000",
                fontFamily: "'Courier New', monospace",
                fontSize: "1.4rem",
                fontWeight: 800,
                padding: "14px 44px 14px 16px",
                borderRadius: "14px",
                outline: "none",
                letterSpacing: "0.12em",
                textAlign: "center",
                direction: "ltr",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              placeholder="أدخل أرقام السند"
              value={transferNumber}
              onChange={e => { setError(""); setTransferNumber(e.target.value.replace(/\D/g, "")); }}
              maxLength={20}
            />
            {isValidTN && (
              <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: "14px", color: "#22c55e" }}>
                <Check style={{ width: 20, height: 20 }} />
              </span>
            )}
          </div>
          <p style={{ color: "#6b7280", fontSize: "0.72rem", marginTop: "6px", textAlign: "center" }}>
            رقم مرجع الحوالة من تطبيق / نظام الكريمي — أرقام فقط، لا حروف
          </p>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* ── STEP 3: Screenshot ── */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <span style={{ background: "#000000", color: "#ffffff", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 900, flexShrink: 0 }}>٣</span>
            <h2 style={{ color: "#000000", fontWeight: 900, fontSize: "1rem" }}>صورة إشعار التحويل</h2>
            <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>* إجبارية</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
          {receiptImage ? (
            <div style={{ border: "2px solid #22c55e", background: "#f0fdf4", borderRadius: "16px", overflow: "hidden", position: "relative" }}>
              <img src={receiptImage} alt="الإيصال" style={{ width: "100%", maxHeight: "280px", objectFit: "contain", display: "block" }} />
              <button
                onClick={() => { setReceiptImage(null); setReceiptFileName(""); }}
                style={{ position: "absolute", top: "8px", right: "8px", background: "#ef4444", color: "#ffffff", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
              <div style={{ background: "#f0fdf4", borderTop: "1px solid #bbf7d0", padding: "8px 12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Check style={{ width: 14, height: 14, color: "#166534", flexShrink: 0 }} />
                <span style={{ color: "#166534", fontSize: "0.75rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {receiptFileName || "تم رفع الصورة بنجاح ✓"}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: "100%",
                background: "#f8fafc",
                border: "2.5px dashed #cbd5e1",
                color: "#374151",
                borderRadius: "16px",
                padding: "36px 16px",
                cursor: "pointer",
                textAlign: "center",
                boxSizing: "border-box",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { const t = e.currentTarget; t.style.borderColor = "#000000"; t.style.background = "#f1f5f9"; }}
              onMouseLeave={e => { const t = e.currentTarget; t.style.borderColor = "#cbd5e1"; t.style.background = "#f8fafc"; }}>
              <Upload style={{ width: 40, height: 40, margin: "0 auto 12px", color: "#9ca3af" }} />
              <p style={{ color: "#000000", fontWeight: 800, fontSize: "1rem", margin: "0 0 4px" }}>اضغط لرفع لقطة الشاشة</p>
              <p style={{ color: "#6b7280", fontSize: "0.8rem", margin: "0 0 4px" }}>صورة إشعار التحويل من تطبيق الكريمي</p>
              <p style={{ color: "#9ca3af", fontSize: "0.7rem", margin: 0 }}>PNG, JPG, JPEG — بحد أقصى 8MB</p>
            </button>
          )}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* ── STEP 4: Notes (optional) ── */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ background: "#6b7280", color: "#ffffff", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 900, flexShrink: 0 }}>٤</span>
            <h2 style={{ color: "#000000", fontWeight: 700, fontSize: "1rem" }}>
              ملاحظات <span style={{ color: "#9ca3af", fontSize: "0.8rem", fontWeight: 400 }}>(اختياري)</span>
            </h2>
          </div>
          <textarea
            style={{
              width: "100%",
              background: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              color: "#000000",
              padding: "12px 14px",
              borderRadius: "12px",
              outline: "none",
              resize: "none",
              fontSize: "0.9rem",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
            rows={2}
            placeholder="أي معلومات إضافية تريد إرسالها للمدير..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", color: "#991b1b", borderRadius: "12px", padding: "12px", marginBottom: "16px", display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.875rem" }}>
            <AlertCircle style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Submit ── */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "#6b7280" : "#000000",
            color: "#ffffff",
            border: "none",
            borderRadius: "14px",
            padding: "17px",
            fontSize: "1.05rem",
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "background 0.2s",
            boxSizing: "border-box",
            letterSpacing: "0.02em",
          }}>
          {loading ? (
            <>
              <span style={{ width: 20, height: 20, border: "2px solid #ffffff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
              {lang === "ar" ? "جاري الإرسال..." : "Sending..."}
            </>
          ) : (
            <><Send style={{ width: 20, height: 20 }} /> {lang === "ar" ? "إرسال طلب الاشتراك" : "Submit Subscription Request"}</>
          )}
        </button>

        {/* ── Checklist ── */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "14px", marginTop: "14px" }}>
          <p style={{ color: "#374151", fontSize: "0.75rem", fontWeight: 700, marginBottom: "8px" }}>قائمة التحقق قبل الإرسال:</p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "5px" }}>
            {[
              { label: "تم تحويل المبلغ إلى رقم حساب الكريمي", ok: !!kuraimiAccount },
              { label: "تم اختيار الخطة المطلوبة", ok: !!selectedPlan },
              { label: "تم إدخال رقم السند بشكل صحيح", ok: isValidTN },
              { label: "تم رفع صورة إشعار التحويل", ok: !!receiptImage },
            ].map((item, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: item.ok ? "#166534" : "#374151" }}>
                <span style={{ fontSize: "0.85rem" }}>{item.ok ? "✅" : "⬜"}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <p style={{ color: "#9ca3af", textAlign: "center", fontSize: "0.72rem", marginTop: "12px", paddingBottom: "32px" }}>
          سيتم تفعيل اشتراكك فوراً بعد مراجعة وموافقة المدير خالد سلمان
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
