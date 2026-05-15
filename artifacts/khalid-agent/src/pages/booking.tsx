import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  Palette, MonitorPlay, GraduationCap, Code2, Phone, CheckCircle2,
  Clock, ArrowLeft, Sparkles, AlertCircle, Send, Loader2, Zap,
} from "lucide-react";

const SERVICE_TYPES = [
  { id: "design", icon: Palette, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60", label: "التصميم والإبداع", subs: ["هوية بصرية", "صور AI", "ديكور داخلي", "شهادات تقدير", "تصاميم سوشيال"] },
  { id: "digital", icon: MonitorPlay, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30 hover:border-blue-500/60", label: "المحتوى الرقمي", subs: ["فيديوهات AI", "كتب إلكترونية", "عروض PowerPoint", "موشن جرافيك"] },
  { id: "academic", icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60", label: "الخدمات الأكاديمية", subs: ["مشروع تخرج", "بحث علمي", "عرض جامعي", "ترجمة ودقيق لغوي"] },
  { id: "programming", icon: Code2, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60", label: "البرمجة والبيانات", subs: ["موقع ويب", "تطبيق جوال", "وكيل AI مخصص", "تحليل بيانات"] },
];

const URGENCIES = [
  { id: "normal", label: "عادي", desc: "خلال 3-5 أيام", color: "border-slate-500/40 hover:border-slate-400", icon: "📋" },
  { id: "urgent", label: "عاجل", desc: "خلال 24-48 ساعة", color: "border-yellow-500/40 hover:border-yellow-400", icon: "⚡" },
  { id: "critical", label: "عاجل جداً", desc: "خلال ساعات", color: "border-red-500/40 hover:border-red-400", icon: "🚨" },
];

export default function BookingPage() {
  const { isRTL } = useI18n();
  const { user } = useUser();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [serviceType, setServiceType] = useState("");
  const [serviceTitle, setServiceTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [userName, setUserName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
      if (name) setUserName(name);
    }
  }, [user]);

  const selectedType = SERVICE_TYPES.find(s => s.id === serviceType);

  const handleSubmit = async () => {
    if (!phone.trim() || !serviceType || !serviceTitle.trim() || !description.trim()) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), serviceType, serviceTitle: serviceTitle.trim(), description: description.trim(), budget: budget.trim() || undefined, urgency, userName: userName.trim() || undefined }),
      });
      if (!r.ok) { setError("حدث خطأ، حاول مجدداً"); return; }
      const data = await r.json() as { id: number };
      setBookingId(data.id);
      setSubmitted(true);
    } catch { setError("فشل الاتصال بالسيرفر"); }
    finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center px-4 bg-background text-foreground"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.2) 0%, transparent 60%)" }}>
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-2">تم استلام طلبك! 🎉</h1>
            <p className="text-muted-foreground">رقم الطلب: <span className="text-primary font-bold">#{bookingId}</span></p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 text-right space-y-3">
            <p className="text-sm text-muted-foreground">سيتواصل معك خالد سلمان عبر واتساب خلال ساعات قليلة لتأكيد الطلب وبدء العمل.</p>
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>{URGENCIES.find(u => u.id === urgency)?.desc}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <a href={`https://wa.me/967783701365?text=${encodeURIComponent(`السلام عليكم، أرسلت طلب خدمة #${bookingId} وأريد متابعته`)}`}
              target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Phone className="w-4 h-4" />واتساب مباشر
              </Button>
            </a>
            <Link href="/chat" className="flex-1">
              <Button variant="outline" className="w-full">الدردشة</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground"
      style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(124,58,237,0.2) 0%, transparent 60%)" }}>
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/services">
            <Button variant="ghost" size="sm" className="gap-2 mb-4 text-muted-foreground">
              <ArrowLeft className="w-4 h-4 rotate-180" />الخدمات
            </Button>
          </Link>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary">
              <Sparkles className="w-3.5 h-3.5" />حجز خدمة
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">احجز خدمتك الآن</h1>
            <p className="text-muted-foreground">أرسل تفاصيل مشروعك وسيتواصل معك خالد خلال ساعات</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                step > n ? "bg-primary text-white" : step === n ? "bg-primary/20 border-2 border-primary text-primary" : "bg-card border border-border text-muted-foreground")}>
                {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
              </div>
              {n < 3 && <div className={cn("w-12 h-0.5 rounded transition-all", step > n ? "bg-primary" : "bg-border")} />}
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          {/* Step 1: Service Type */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">اختر نوع الخدمة</h2>
              <div className="grid grid-cols-2 gap-3">
                {SERVICE_TYPES.map(s => {
                  const Icon = s.icon;
                  return (
                    <button key={s.id} onClick={() => setServiceType(s.id)}
                      className={cn("p-4 rounded-xl border text-right transition-all duration-200", s.bg,
                        serviceType === s.id ? "ring-2 ring-primary scale-[1.02]" : "")}>
                      <Icon className={cn("w-6 h-6 mb-2", s.color)} />
                      <p className="font-semibold text-sm">{s.label}</p>
                    </button>
                  );
                })}
              </div>
              {selectedType && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">الخدمة المطلوبة تحديداً:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedType.subs.map(sub => (
                      <button key={sub} onClick={() => setServiceTitle(sub)}
                        className={cn("py-2 px-3 rounded-lg border text-sm text-right transition-all",
                          serviceTitle === sub ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-card hover:border-primary/50")}>
                        {sub}
                      </button>
                    ))}
                  </div>
                  <input value={serviceTitle} onChange={e => setServiceTitle(e.target.value)}
                    placeholder="أو اكتب خدمة أخرى..."
                    className="w-full bg-card border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50" />
                </div>
              )}
              <Button className="w-full h-11 gap-2" disabled={!serviceType || !serviceTitle.trim()} onClick={() => setStep(2)}>
                التالي — تفاصيل الطلب <Zap className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">تفاصيل الطلب</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">اسمك <span className="text-muted-foreground">(اختياري)</span></label>
                  <input value={userName} onChange={e => setUserName(e.target.value)}
                    placeholder="خالد محمد..."
                    className="w-full bg-card border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">رقم الهاتف / واتساب <span className="text-red-400">*</span></label>
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+967 xxx xxx xxx"
                    type="tel"
                    className="w-full bg-card border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">تفاصيل المشروع <span className="text-red-400">*</span></label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="اشرح ما تحتاجه بالتفصيل — كلما كانت التفاصيل أوضح كان التنفيذ أفضل..."
                    className="min-h-32 border-input bg-card resize-none"
                    rows={4} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">الميزانية المقترحة <span className="text-muted-foreground">(اختياري)</span></label>
                  <input value={budget} onChange={e => setBudget(e.target.value)}
                    placeholder="مثال: $10 - $50 / مرن"
                    className="w-full bg-card border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>السابق</Button>
                <Button className="flex-1 h-11 gap-2" disabled={!phone.trim() || !description.trim()} onClick={() => setStep(3)}>
                  التالي — الأولوية <Zap className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Urgency + Confirm */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">أولوية الطلب</h2>
              <div className="space-y-3">
                {URGENCIES.map(u => (
                  <button key={u.id} onClick={() => setUrgency(u.id)}
                    className={cn("w-full flex items-center gap-4 p-4 rounded-xl border text-right transition-all",
                      urgency === u.id ? "border-primary bg-primary/10 ring-2 ring-primary/30" : `border-border bg-card/50 ${u.color}`)}>
                    <span className="text-2xl">{u.icon}</span>
                    <div>
                      <p className="font-semibold">{u.label}</p>
                      <p className="text-xs text-muted-foreground">{u.desc}</p>
                    </div>
                    {urgency === u.id && <CheckCircle2 className="w-5 h-5 text-primary mr-auto" />}
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-background border border-border rounded-xl p-4 space-y-2 text-sm">
                <p className="font-semibold text-primary mb-3">ملخص الطلب:</p>
                {[
                  { label: "الخدمة", value: `${selectedType?.label} — ${serviceTitle}` },
                  { label: "الهاتف", value: phone },
                  { label: "الميزانية", value: budget || "غير محددة" },
                  { label: "الأولوية", value: URGENCIES.find(u => u.id === urgency)?.label },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-medium">{r.value}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />{error}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>السابق</Button>
                <Button className="flex-1 h-12 gap-2 text-base shadow-lg shadow-primary/30" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />جاري الإرسال...</> : <><Send className="w-5 h-5" />إرسال الطلب</>}
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          يمكنك أيضاً التواصل مباشرة عبر{" "}
          <a href="https://wa.me/967783701365" className="text-primary hover:underline">واتساب +967783701365</a>
        </p>
      </div>
    </div>
  );
}
