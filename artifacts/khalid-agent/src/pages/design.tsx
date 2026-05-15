import { useState, useRef, useCallback } from "react";
import { useUser } from "@clerk/react";
import { Link } from "wouter";
import {
  Wand2, Download, Copy, RotateCcw, Sparkles, Loader2,
  Presentation, ArrowLeft, ChevronRight, ChevronLeft, Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const DESIGN_PROMPT = `أنت مصمم عروض تقديمية محترف ومتخصص بالمحتوى العربي.
عندما يطلب المستخدم عرضاً، أنشئ JSON يمثل شرائح احترافية بهذا الشكل الدقيق:
{
  "title": "عنوان العرض",
  "theme": "purple|blue|green|orange|red",
  "slides": [
    {
      "id": 1,
      "type": "cover",
      "title": "العنوان الرئيسي",
      "subtitle": "العنوان الفرعي",
      "emoji": "🚀"
    },
    {
      "id": 2,
      "type": "points",
      "title": "عنوان الشريحة",
      "points": ["النقطة الأولى", "النقطة الثانية", "النقطة الثالثة"],
      "icon": "✅"
    },
    {
      "id": 3,
      "type": "quote",
      "title": "اقتباس مؤثر",
      "quote": "نص الاقتباس هنا",
      "author": "اسم القائل"
    },
    {
      "id": 4,
      "type": "stats",
      "title": "أرقام ومؤشرات",
      "stats": [{"value": "95%", "label": "رضا العملاء"}, {"value": "500+", "label": "مشروع منجز"}]
    },
    {
      "id": 5,
      "type": "closing",
      "title": "الخاتمة",
      "message": "رسالة ختامية قوية",
      "cta": "نص زر الدعوة للعمل"
    }
  ]
}
أنشئ 4 إلى 6 شرائح. أعط JSON فقط بدون أي شرح أو نص خارج الكود.`;

const THEMES: Record<string, { bg: string; text: string; accent: string; card: string; border: string }> = {
  purple: { bg: "from-violet-600 to-purple-700", text: "text-white", accent: "bg-white/20", card: "bg-white/10", border: "border-white/20" },
  blue:   { bg: "from-blue-600 to-indigo-700",  text: "text-white", accent: "bg-white/20", card: "bg-white/10", border: "border-white/20" },
  green:  { bg: "from-emerald-600 to-teal-700", text: "text-white", accent: "bg-white/20", card: "bg-white/10", border: "border-white/20" },
  orange: { bg: "from-orange-500 to-amber-600", text: "text-white", accent: "bg-white/20", card: "bg-white/10", border: "border-white/20" },
  red:    { bg: "from-rose-600 to-red-700",     text: "text-white", accent: "bg-white/20", card: "bg-white/10", border: "border-white/20" },
};

interface Slide {
  id: number;
  type: "cover" | "points" | "quote" | "stats" | "closing";
  title?: string;
  subtitle?: string;
  emoji?: string;
  points?: string[];
  icon?: string;
  quote?: string;
  author?: string;
  stats?: { value: string; label: string }[];
  message?: string;
  cta?: string;
}

interface Presentation {
  title: string;
  theme: string;
  slides: Slide[];
}

function SlideView({ slide, theme }: { slide: Slide; theme: typeof THEMES[string] }) {
  const cls = theme;
  if (slide.type === "cover") return (
    <div className={cn("w-full h-full bg-gradient-to-br", cls.bg, "flex flex-col items-center justify-center text-center p-8")}>
      <div className="text-6xl mb-4">{slide.emoji ?? "✨"}</div>
      <h1 className={cn("text-3xl md:text-4xl font-extrabold mb-3", cls.text)} dir="rtl">{slide.title}</h1>
      <p className={cn("text-lg opacity-80", cls.text)} dir="rtl">{slide.subtitle}</p>
    </div>
  );
  if (slide.type === "points") return (
    <div className={cn("w-full h-full bg-gradient-to-br", cls.bg, "p-8 flex flex-col")}>
      <h2 className={cn("text-2xl font-bold mb-6", cls.text)} dir="rtl">{slide.icon} {slide.title}</h2>
      <div className="flex-1 space-y-3">
        {slide.points?.map((p, i) => (
          <div key={i} className={cn("flex items-center gap-3 rounded-xl p-3", cls.card, cls.border, "border")} dir="rtl">
            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0", cls.accent, cls.text)}>{i + 1}</div>
            <span className={cn("text-base", cls.text)}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
  if (slide.type === "quote") return (
    <div className={cn("w-full h-full bg-gradient-to-br", cls.bg, "flex flex-col items-center justify-center p-8 text-center")}>
      <div className={cn("text-7xl font-serif opacity-30 mb-2", cls.text)}>"</div>
      <blockquote className={cn("text-xl md:text-2xl font-semibold leading-relaxed mb-4", cls.text)} dir="rtl">{slide.quote}</blockquote>
      {slide.author && <p className={cn("text-sm opacity-70", cls.text)}>— {slide.author}</p>}
    </div>
  );
  if (slide.type === "stats") return (
    <div className={cn("w-full h-full bg-gradient-to-br", cls.bg, "p-8 flex flex-col")}>
      <h2 className={cn("text-2xl font-bold mb-6 text-center", cls.text)} dir="rtl">{slide.title}</h2>
      <div className="flex-1 grid grid-cols-2 gap-4 content-center">
        {slide.stats?.map((s, i) => (
          <div key={i} className={cn("rounded-2xl p-5 text-center border", cls.card, cls.border)}>
            <div className={cn("text-4xl font-extrabold mb-1", cls.text)}>{s.value}</div>
            <div className={cn("text-sm opacity-70", cls.text)} dir="rtl">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
  if (slide.type === "closing") return (
    <div className={cn("w-full h-full bg-gradient-to-br", cls.bg, "flex flex-col items-center justify-center text-center p-8")}>
      <Sparkles className={cn("w-12 h-12 mb-4 opacity-80", cls.text)} />
      <h2 className={cn("text-2xl font-bold mb-3", cls.text)} dir="rtl">{slide.title}</h2>
      <p className={cn("text-lg opacity-80 mb-6", cls.text)} dir="rtl">{slide.message}</p>
      {slide.cta && (
        <div className={cn("px-6 py-2 rounded-full font-bold text-sm border-2", cls.accent, cls.text, cls.border)}>{slide.cta}</div>
      )}
    </div>
  );
  return null;
}

export default function DesignPage() {
  const { user, isSignedIn } = useUser();
  const { isRTL } = useI18n();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const generate = useCallback(async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");
    setPresentation(null);
    setCurrent(0);
    try {
      const convRes = await fetch(`${basePath}/api/gemini/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "تصميم: " + prompt.slice(0, 30) }),
      });
      if (!convRes.ok) throw new Error("فشل إنشاء المحادثة");
      const conv = await convRes.json();

      const fullPrompt = `${DESIGN_PROMPT}\n\nطلب المستخدم: ${prompt}`;
      const msgRes = await fetch(`${basePath}/api/gemini/conversations/${conv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: fullPrompt }),
      });
      if (!msgRes.ok) throw new Error("فشل التوليد");

      let raw = "";
      const reader = msgRes.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            try { const d = JSON.parse(line.slice(6)); if (d.content) raw += d.content; } catch {}
          }
        }
      }
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("لم يتم توليد تصميم صالح. حاول مجدداً.");
      const pres: Presentation = JSON.parse(jsonMatch[0]);
      if (!pres.slides?.length) throw new Error("لا توجد شرائح في التصميم.");
      setPresentation(pres);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [prompt, loading]);

  const slide = presentation?.slides[current];
  const theme = THEMES[presentation?.theme ?? "purple"] ?? THEMES.purple;
  const total = presentation?.slides.length ?? 0;

  const downloadHTML = () => {
    if (!presentation) return;
    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/><title>${presentation.title}</title><style>body{margin:0;font-family:'Cairo',sans-serif;direction:rtl}</style><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet"/></head><body>${presentation.slides.map(s => `<div style="width:100%;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#7C3AED,#4F46E5);color:white;padding:40px;box-sizing:border-box;text-align:center;page-break-after:always"><div><h2 style="font-size:2rem;margin:0 0 16px">${s.title ?? ""}</h2><p style="opacity:0.8">${s.subtitle ?? s.message ?? (s.points?.join(" • ") ?? "")}</p></div></div>`).join("")}</body></html>`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = `${presentation.title}.html`;
    a.click();
  };

  if (!isSignedIn) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background" dir="rtl">
      <Presentation className="w-12 h-12 text-primary" />
      <p className="text-lg font-semibold">يجب تسجيل الدخول للاستخدام</p>
      <Link href="/sign-in"><Button>تسجيل الدخول</Button></Link>
    </div>
  );

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm">مصمم العروض بالذكاء الاصطناعي</span>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">Gemini مجانًا</span>
          </div>
          <Link href="/chat"><Button variant="ghost" size="sm" className="gap-1 text-xs"><ArrowLeft className="w-3.5 h-3.5" />رجوع</Button></Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Input */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-bold mb-2" dir="rtl">📝 اكتب ما تريد تصميمه بالعربي</label>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) generate(); }}
            placeholder="مثال: اصمم عرض تقديمي عن مشروع توصيل الطعام في اليمن يشمل الفكرة والأهداف والأرباح"
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px]"
            dir="rtl"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground" dir="rtl">Ctrl+Enter للتوليد • مدعوم بـ Gemini 2.5 Flash مجاناً</span>
            <Button onClick={generate} disabled={!prompt.trim() || loading} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "جاري التصميم..." : "صمّم الآن"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive" dir="rtl">⚠️ {error}</div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Wand2 className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground" dir="rtl">Gemini يصمم عرضك التقديمي بالعربي...</p>
          </div>
        )}

        {presentation && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div dir="rtl">
                <h2 className="font-bold text-base">{presentation.title}</h2>
                <p className="text-xs text-muted-foreground">{total} شريحة</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => { setPresentation(null); setPrompt(""); }} className="gap-1 text-xs">
                  <RotateCcw className="w-3.5 h-3.5" />جديد
                </Button>
                <Button variant="outline" size="sm" onClick={downloadHTML} className="gap-1 text-xs">
                  <Download className="w-3.5 h-3.5" />تحميل HTML
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(window.location.href)} className="gap-1 text-xs">
                  <Copy className="w-3.5 h-3.5" />نسخ رابط
                </Button>
              </div>
            </div>

            {/* Slide Viewer */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: "16/9" }}>
              {slide && <SlideView slide={slide} theme={theme} />}
              {/* Nav arrows */}
              {total > 1 && (
                <>
                  <button
                    onClick={() => setCurrent(c => Math.max(0, c - 1))}
                    disabled={current === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center disabled:opacity-30 transition-all backdrop-blur-sm"
                  ><ChevronLeft className="w-5 h-5" /></button>
                  <button
                    onClick={() => setCurrent(c => Math.min(total - 1, c + 1))}
                    disabled={current === total - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center disabled:opacity-30 transition-all backdrop-blur-sm"
                  ><ChevronRight className="w-5 h-5" /></button>
                </>
              )}
              {/* Slide counter */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {presentation.slides.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={cn("w-2 h-2 rounded-full transition-all", i === current ? "bg-white w-6" : "bg-white/50 hover:bg-white/70")} />
                ))}
              </div>
            </div>

            {/* Slide thumbnails */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {presentation.slides.map((s, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={cn("relative rounded-lg overflow-hidden border-2 transition-all", i === current ? "border-primary shadow-md" : "border-border hover:border-primary/40")}
                  style={{ aspectRatio: "16/9" }}>
                  <div className={cn("w-full h-full bg-gradient-to-br text-white flex items-center justify-center p-1", theme.bg)}>
                    <span className="text-[8px] font-bold text-center leading-tight truncate" dir="rtl">{s.title ?? s.type}</span>
                  </div>
                  <div className={cn("absolute bottom-0.5 right-0.5 text-[8px] font-bold rounded px-1", i === current ? "bg-primary text-white" : "bg-black/30 text-white")}>{i + 1}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick examples */}
        {!presentation && !loading && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground" dir="rtl">💡 أمثلة جاهزة — اضغط لاستخدامها:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "اصمم عرض تقديمي عن مشروع تطبيق توصيل الطعام في اليمن",
                "عرض لمشروع تخرج عن الذكاء الاصطناعي في التعليم اليمني",
                "عرض تسويقي لخدمة تصميم المواقع بأسعار مناسبة",
                "خطة عمل لمشروع تقني ناشئ في اليمن",
              ].map((ex, i) => (
                <button key={i} onClick={() => { setPrompt(ex); textareaRef.current?.focus(); }}
                  className="text-right text-xs px-3 py-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all" dir="rtl">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
