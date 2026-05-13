import { useState } from "react";
import { Star, X, Send, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface RatingModalProps {
  onClose: () => void;
}

const SERVICES = [
  { ar: "تصميم المواقع", en: "Website Design" },
  { ar: "الذكاء الاصطناعي", en: "AI Services" },
  { ar: "الأمن السيبراني", en: "Cybersecurity" },
  { ar: "الخدمات المالية", en: "Financial Services" },
  { ar: "الدعم الأكاديمي", en: "Academic Support" },
  { ar: "عام", en: "General" },
];

export function RatingModal({ onClose }: RatingModalProps) {
  const { lang, isRTL } = useI18n();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [service, setService] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setLoading(true);
    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, service }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl" dir={isRTL ? "rtl" : "ltr"}>
        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
              <ThumbsUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold">
              {lang === "ar" ? "شكراً لتقييمك!" : "Thank you for your review!"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "رأيك يساعدنا في تحسين خدماتنا" : "Your feedback helps us improve our services"}
            </p>
            <Button onClick={onClose} className="w-full">{lang === "ar" ? "إغلاق" : "Close"}</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base">
                {lang === "ar" ? "قيِّم تجربتك معنا" : "Rate your experience"}
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center gap-2 mb-5">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(i)}
                  className="transition-transform hover:scale-125"
                >
                  <Star className={cn("w-9 h-9 transition-colors", (hover || rating) >= i ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground mb-4">
                {rating === 1 ? (lang === "ar" ? "😟 سيء" : "😟 Poor") :
                 rating === 2 ? (lang === "ar" ? "😐 مقبول" : "😐 Fair") :
                 rating === 3 ? (lang === "ar" ? "🙂 جيد" : "🙂 Good") :
                 rating === 4 ? (lang === "ar" ? "😊 جيد جداً" : "😊 Very Good") :
                 (lang === "ar" ? "🤩 ممتاز!" : "🤩 Excellent!")}
              </p>
            )}

            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-1.5 block">
                {lang === "ar" ? "الخدمة (اختياري)" : "Service (optional)"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SERVICES.map(s => (
                  <button
                    key={s.en}
                    onClick={() => setService(s.en)}
                    className={cn("text-xs px-2.5 py-1 rounded-full border transition-colors",
                      service === s.en ? "bg-primary/20 border-primary/50 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    {lang === "ar" ? s.ar : s.en}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="w-full bg-background border border-input rounded-xl px-3 py-2.5 text-sm resize-none mb-4 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all"
              rows={3}
              placeholder={lang === "ar" ? "شاركنا رأيك أو اقتراحاتك..." : "Share your feedback or suggestions..."}
              value={comment}
              onChange={e => setComment(e.target.value)}
            />

            <Button
              className="w-full gap-2 shadow-lg shadow-primary/20"
              onClick={handleSubmit}
              disabled={!rating || loading}
            >
              <Send className="w-4 h-4" />
              {loading ? (lang === "ar" ? "جاري الإرسال..." : "Sending...") : (lang === "ar" ? "إرسال التقييم" : "Submit Rating")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function RatingButton() {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-card border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 transition-all px-3 py-2 rounded-full shadow-lg shadow-yellow-500/10 text-xs font-medium"
      >
        <Star className="w-4 h-4 fill-yellow-400" />
        {lang === "ar" ? "قيِّمنا" : "Rate Us"}
      </button>
      {open && <RatingModal onClose={() => setOpen(false)} />}
    </>
  );
}
