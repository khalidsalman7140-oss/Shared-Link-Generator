import { useState } from "react";
import { Link } from "wouter";
import { useUser } from "@clerk/react";
import { CreditCard, Upload, Send, Check, ArrowLeft, Building2, Zap, Sparkles, Crown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const PLANS = [
  { key: "weekly", labelAr: "أسبوعي", labelEn: "Weekly", price: "$2.99", icon: Zap, color: "text-blue-400", border: "border-blue-500/40" },
  { key: "monthly", labelAr: "شهري", labelEn: "Monthly", price: "$9.99", icon: Sparkles, color: "text-primary", border: "border-primary/50" },
  { key: "annual", labelAr: "سنوي", labelEn: "Annual", price: "$79.99", icon: Crown, color: "text-yellow-400", border: "border-yellow-500/40" },
  { key: "enterprise", labelAr: "مؤسسي", labelEn: "Enterprise", price: "حسب الطلب", icon: Building2, color: "text-emerald-400", border: "border-emerald-500/40" },
];

const SERVICES = [
  { key: "kuraimi", label: "الكريمي", flag: "🏦" },
  { key: "najm", label: "النجم", flag: "⭐" },
  { key: "rajhi", label: "الراجحي", flag: "🏛️" },
  { key: "jawali", label: "محفظة جوالي", flag: "📱" },
  { key: "other", label: "أخرى", flag: "💳" },
];

export default function PaymentRequestPage() {
  const { user } = useUser();
  const { lang, isRTL } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [transferNumber, setTransferNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError(lang === "ar" ? "حجم الصورة يجب أن يكون أقل من 5 ميغابايت" : "Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setReceiptImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedPlan) { setError(lang === "ar" ? "اختر الخطة المطلوبة" : "Select a plan"); return; }
    if (!receiptImage && !transferNumber) { setError(lang === "ar" ? "أرسل صورة الحوالة أو رقمها" : "Provide receipt image or transfer number"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/payments/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planRequested: selectedPlan,
          receiptImage,
          transferNumber,
          amount,
          transferService: selectedService,
          notes,
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError(lang === "ar" ? "حدث خطأ. حاول مرة أخرى" : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4 p-4">
          <CreditCard className="w-14 h-14 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">{lang === "ar" ? "يجب تسجيل الدخول للاشتراك" : "Sign in to subscribe"}</p>
          <Link href="/sign-in"><Button>{lang === "ar" ? "تسجيل الدخول" : "Sign In"}</Button></Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4 p-6 max-w-sm">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold">{lang === "ar" ? "تم إرسال طلبك بنجاح!" : "Request submitted!"}</h2>
          <p className="text-muted-foreground text-sm">
            {lang === "ar"
              ? "سيقوم المدير خالد سلمان بمراجعة طلبك وتفعيل الاشتراك خلال ساعات. ستُبلَّغ عند التفعيل."
              : "Admin Khaled Salman will review your request and activate your subscription within hours."}
          </p>
          <div className="flex gap-2">
            <a href={`https://wa.me/967783701365?text=${encodeURIComponent("أريد متابعة طلب الاشتراك الخاص بي")}`} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" className="w-full gap-2 text-sm">
                <span>📱</span>{lang === "ar" ? "تتبع عبر واتساب" : "Track via WhatsApp"}
              </Button>
            </a>
            <Link href="/chat" className="flex-1">
              <Button className="w-full gap-2 text-sm">
                {lang === "ar" ? "للدردشة" : "Go to Chat"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 50%), hsl(240 10% 4%)" }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/pricing">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4 rtl:-scale-x-100" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{lang === "ar" ? "طلب الاشتراك" : "Subscription Request"}</h1>
            <p className="text-sm text-muted-foreground">{lang === "ar" ? "أرسل صورة الحوالة لتفعيل اشتراكك" : "Submit your transfer receipt to activate"}</p>
          </div>
        </div>

        {/* Step 1: Plan */}
        <div className="mb-6 space-y-3">
          <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">
            {lang === "ar" ? "1. اختر الخطة" : "1. Choose Plan"}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {PLANS.map(p => {
              const Icon = p.icon;
              return (
                <button
                  key={p.key}
                  onClick={() => setSelectedPlan(p.key)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border text-right transition-all",
                    selectedPlan === p.key ? `${p.border} bg-card ring-1 ${p.border.replace("border-", "ring-")}` : "border-border bg-card/50 hover:bg-card",
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0", p.color)} />
                  <div>
                    <p className="font-medium text-sm">{lang === "ar" ? p.labelAr : p.labelEn}</p>
                    <p className="text-xs text-muted-foreground">{p.price}</p>
                  </div>
                  {selectedPlan === p.key && <Check className="w-4 h-4 text-primary mr-auto shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Service */}
        <div className="mb-6 space-y-3">
          <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">
            {lang === "ar" ? "2. طريقة الدفع" : "2. Payment Method"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map(s => (
              <button
                key={s.key}
                onClick={() => setSelectedService(s.key)}
                className={cn(
                  "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors",
                  selectedService === s.key ? "bg-primary/20 border-primary/50 text-primary" : "border-border text-muted-foreground hover:border-primary/30",
                )}
              >
                {s.flag} {s.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">{lang === "ar" ? "رقم الحوالة" : "Transfer Number"}</label>
              <input
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary"
                placeholder="مثال: 123456789"
                value={transferNumber}
                onChange={e => setTransferNumber(e.target.value)}
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">{lang === "ar" ? "المبلغ المدفوع" : "Amount Paid"}</label>
              <input
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary"
                placeholder="مثال: 2.99 USD"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Receipt Image */}
        <div className="mb-6 space-y-3">
          <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">
            {lang === "ar" ? "3. صورة الحوالة (اختياري)" : "3. Receipt Image (Optional)"}
          </h2>
          <label className={cn(
            "flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
            receiptImage ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30 hover:bg-primary/5",
          )}>
            {receiptImage ? (
              <img src={receiptImage} alt="Receipt" className="max-h-48 rounded-lg object-contain" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{lang === "ar" ? "اضغط لرفع صورة الحوالة" : "Click to upload receipt"}</p>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="text-xs text-muted-foreground mb-1.5 block">{lang === "ar" ? "ملاحظات إضافية (اختياري)" : "Additional Notes (Optional)"}</label>
          <textarea
            className="w-full bg-background border border-input rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary"
            rows={2}
            placeholder={lang === "ar" ? "أي معلومات إضافية..." : "Any additional info..."}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <Button
          className="w-full gap-2 shadow-lg shadow-primary/20 text-base py-6"
          onClick={handleSubmit}
          disabled={loading || !selectedPlan}
        >
          <Send className="w-5 h-5" />
          {loading ? (lang === "ar" ? "جاري الإرسال..." : "Sending...") : (lang === "ar" ? "إرسال طلب الاشتراك" : "Submit Subscription Request")}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          {lang === "ar"
            ? "سيتم تفعيل اشتراكك خلال ساعات بعد مراجعة الطلب من المدير"
            : "Your subscription will be activated within hours after admin review"}
        </p>
      </div>
    </div>
  );
}
