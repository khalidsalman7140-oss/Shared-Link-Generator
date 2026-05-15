import { useState, useRef, useEffect, useCallback } from "react";
import { useUser } from "@clerk/react";
import { Link, useLocation } from "wouter";
import {
  ImageIcon, Code2, Download, Copy, RefreshCw, Loader2,
  CheckCircle, Globe, Wand2, Sparkles, Crown, ArrowRight,
  Zap, Eye, FileCode2, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

type Tab = "image" | "web";

interface UsageData {
  plan: string;
  unlimited: boolean;
  validUntil: string | null;
}

export default function ToolsPage() {
  const { user, isLoaded } = useUser();
  const [, setLocation] = useLocation();
  const { lang, isRTL } = useI18n();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("image");
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  const [imgPrompt, setImgPrompt] = useState("");
  const [imgLoading, setImgLoading] = useState(false);
  const [imgResult, setImgResult] = useState<{ b64_json: string; mimeType: string } | null>(null);

  const [webDesc, setWebDesc] = useState("");
  const [webLoading, setWebLoading] = useState(false);
  const [webCode, setWebCode] = useState("");
  const [webChars, setWebChars] = useState(0);
  const [webView, setWebView] = useState<"code" | "preview">("code");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fetchUsage = useCallback(async () => {
    try {
      const r = await fetch(`${basePath}/api/gemini/usage`);
      if (r.ok) setUsage(await r.json() as UsageData);
    } catch {}
    finally { setLoadingPlan(false); }
  }, []);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  useEffect(() => {
    if (webView === "preview" && iframeRef.current && webCode) {
      const doc = iframeRef.current.contentWindow?.document;
      if (doc) { doc.open(); doc.write(webCode); doc.close(); }
    }
  }, [webView, webCode]);

  const generateImage = async () => {
    if (!imgPrompt.trim()) return;
    setImgLoading(true);
    setImgResult(null);
    try {
      const r = await fetch(`${basePath}/api/gemini/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imgPrompt }),
      });
      if (!r.ok) {
        const err = await r.json() as { message?: string; error?: string };
        if (err.error === "premium_required") {
          toast({ title: lang === "ar" ? "اشتراك مطلوب" : "Subscription required", description: err.message, variant: "destructive" });
        } else {
          toast({ title: lang === "ar" ? "فشل التوليد" : "Generation failed", description: err.message, variant: "destructive" });
        }
        return;
      }
      const data = await r.json() as { b64_json: string; mimeType: string };
      setImgResult(data);
    } catch {
      toast({ title: lang === "ar" ? "خطأ في الاتصال" : "Connection error", variant: "destructive" });
    } finally {
      setImgLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imgResult) return;
    const link = document.createElement("a");
    link.href = `data:${imgResult.mimeType};base64,${imgResult.b64_json}`;
    link.download = `ks-image-${Date.now()}.png`;
    link.click();
  };

  const generateWebsite = async () => {
    if (!webDesc.trim()) return;
    setWebLoading(true);
    setWebCode("");
    setWebChars(0);
    setWebView("code");
    try {
      const r = await fetch(`${basePath}/api/gemini/web-builder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: webDesc }),
      });
      if (!r.ok) {
        const err = await r.json() as { message?: string; error?: string };
        toast({ title: lang === "ar" ? "خطأ" : "Error", description: err.message ?? (lang === "ar" ? "فشل البناء" : "Build failed"), variant: "destructive" });
        setWebLoading(false);
        return;
      }
      const reader = r.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6)) as { content?: string; done?: boolean; error?: string };
            if (parsed.content) {
              acc += parsed.content;
              setWebCode(acc);
              setWebChars(acc.length);
            }
            if (parsed.error) toast({ title: lang === "ar" ? "خطأ في التوليد" : "Generation error", description: parsed.error, variant: "destructive" });
          } catch {}
        }
      }
    } catch {
      toast({ title: lang === "ar" ? "خطأ في الاتصال" : "Connection error", variant: "destructive" });
    } finally {
      setWebLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(webCode).then(() => {
      toast({ title: lang === "ar" ? "تم النسخ ✓" : "Copied ✓" });
    });
  };

  const downloadHtml = () => {
    const blob = new Blob([webCode], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `website-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isLoaded || loadingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    setLocation("/sign-in");
    return null;
  }

  const isPremium = usage ? usage.plan !== "free" : false;

  if (!isPremium) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-background"
        dir={isRTL ? "rtl" : "ltr"}
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.10) 0%, transparent 60%), hsl(240 10% 4%)" }}
      >
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(124,58,237,0.3)]">
            <Crown className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black mb-2">{lang === "ar" ? "أدوات الإنتاج المتقدمة" : "Production Tools"}</h1>
            <p className="text-muted-foreground text-sm">{lang === "ar" ? "توليد الصور وبناء المواقع متاحان للمشتركين فقط" : "Image generation and web building are for subscribers only"}</p>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-border/50 space-y-3 text-start">
            {[
              { icon: "🎨", text: lang === "ar" ? "توليد صور احترافية بالذكاء الاصطناعي" : "AI professional image generation" },
              { icon: "🌐", text: lang === "ar" ? "بناء مواقع HTML كاملة بوصف واحد" : "Build complete HTML websites from a description" },
              { icon: "♾️", text: lang === "ar" ? "طلبات تصميم غير محدودة في الدردشة" : "Unlimited design requests in chat" },
              { icon: "⚡", text: lang === "ar" ? "أولوية في المعالجة والدعم" : "Priority processing and support" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-xl shrink-0">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/subscribe?plan=weekly">
              <Button className="w-full gap-2 shadow-lg shadow-primary/30">
                <Sparkles className="w-4 h-4" />
                {lang === "ar" ? "اشترك الآن من $2.99/أسبوع" : "Subscribe from $2.99/week"}
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="ghost" className="w-full text-muted-foreground text-sm">
                {lang === "ar" ? "العودة للدردشة" : "Back to Chat"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const planLabel: Record<string, string> = {
    weekly: "أسبوعي", monthly: "شهري", annual: "سنوي", enterprise: "مؤسسي",
  };

  const daysLeft = usage?.validUntil
    ? Math.ceil((new Date(usage.validUntil).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div
      className="min-h-screen bg-background"
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.06) 0%, transparent 50%), hsl(240 10% 4%)" }}
    >
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/chat">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground text-xs">
                <ArrowRight className={cn("w-3.5 h-3.5", isRTL && "rotate-180")} />
                {lang === "ar" ? "الدردشة" : "Chat"}
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="font-bold text-sm flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-primary" />
              {lang === "ar" ? "أدوات الإنتاج" : "Production Tools"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {daysLeft !== null && daysLeft <= 7 && (
              <span className={cn("text-xs rounded-full px-2.5 py-1 border font-medium",
                daysLeft <= 3 ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
              )}>
                {lang === "ar" ? `ينتهي خلال ${daysLeft} يوم` : `${daysLeft}d left`}
              </span>
            )}
            <span className="text-xs bg-primary/10 text-primary border border-primary/30 rounded-full px-3 py-1 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {planLabel[usage?.plan ?? ""] ?? usage?.plan} ✓
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex gap-2 bg-card border border-border/60 rounded-xl p-1 w-fit">
          {([
            { id: "image" as Tab, icon: ImageIcon, ar: "مولّد الصور", en: "Image Generator" },
            { id: "web" as Tab, icon: Code2, ar: "مطوّر المواقع", en: "Web Builder" },
          ] as { id: Tab; icon: typeof ImageIcon; ar: string; en: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="w-4 h-4" />
              {lang === "ar" ? t.ar : t.en}
            </button>
          ))}
        </div>

        {tab === "image" && (
          <div className="space-y-4">
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="font-bold text-lg mb-1">{lang === "ar" ? "مولّد الصور بالذكاء الاصطناعي" : "AI Image Generator"}</h2>
                <p className="text-sm text-muted-foreground">{lang === "ar" ? "صف الصورة التي تريدها بأي لغة — الذكاء الاصطناعي ينشئها لك في ثوانٍ" : "Describe the image you want in any language — AI creates it in seconds"}</p>
              </div>
              <Textarea
                value={imgPrompt}
                onChange={e => setImgPrompt(e.target.value)}
                placeholder={lang === "ar"
                  ? "مثال: شعار احترافي لشركة تقنية يمنية، خلفية زرقاء داكنة، خط عربي حديث، أيقونة بصمة رقمية..."
                  : "e.g., Professional logo for a Yemeni tech company, dark blue background, modern Arabic font..."
                }
                className="min-h-[100px] resize-none"
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) void generateImage(); }}
              />
              <Button onClick={generateImage} disabled={imgLoading || !imgPrompt.trim()} className="w-full gap-2 shadow-lg shadow-primary/30">
                {imgLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {imgLoading
                  ? (lang === "ar" ? "جاري التوليد..." : "Generating...")
                  : (lang === "ar" ? "توليد الصورة" : "Generate Image")
                }
              </Button>
              <p className="text-xs text-muted-foreground text-center">{lang === "ar" ? "Ctrl+Enter للتوليد السريع" : "Ctrl+Enter to generate"}</p>
            </div>

            {imgLoading && !imgResult && (
              <div className="bg-card border border-border/50 rounded-2xl p-8 flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse">{lang === "ar" ? "الذكاء الاصطناعي يرسم صورتك..." : "AI is painting your image..."}</p>
              </div>
            )}

            {imgResult && (
              <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    {lang === "ar" ? "الصورة جاهزة ✓" : "Image Ready ✓"}
                  </h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setImgResult(null); setImgPrompt(""); }} className="gap-1 text-xs">
                      <RefreshCw className="w-3.5 h-3.5" />
                      {lang === "ar" ? "صورة جديدة" : "New Image"}
                    </Button>
                    <Button size="sm" onClick={downloadImage} className="gap-1 text-xs shadow-lg shadow-primary/20">
                      <Download className="w-3.5 h-3.5" />
                      {lang === "ar" ? "تحميل" : "Download"}
                    </Button>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border border-border bg-black/30 flex items-center justify-center min-h-[300px]">
                  <img
                    src={`data:${imgResult.mimeType};base64,${imgResult.b64_json}`}
                    alt="Generated"
                    className="max-w-full max-h-[520px] object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "web" && (
          <div className="space-y-4">
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="font-bold text-lg mb-1">{lang === "ar" ? "مطوّر المواقع بالذكاء الاصطناعي" : "AI Web Builder"}</h2>
                <p className="text-sm text-muted-foreground">
                  {lang === "ar"
                    ? "صف موقعك بالتفصيل، وسيكتب الذكاء الاصطناعي كود HTML/CSS/JS كامل جاهز للنشر"
                    : "Describe your website in detail, and AI will write a complete HTML/CSS/JS ready to deploy"
                  }
                </p>
              </div>
              <Textarea
                value={webDesc}
                onChange={e => setWebDesc(e.target.value)}
                placeholder={lang === "ar"
                  ? "مثال: موقع لمطعم يمني تقليدي، الألوان أخضر وذهبي، يعرض: صور الأطباق، القائمة، ساعات العمل، رقم التواصل عبر واتساب، العنوان في صنعاء..."
                  : "e.g., Website for a traditional Yemeni restaurant, green and gold colors, showing: dish photos, menu, hours, WhatsApp contact, address in Sana'a..."
                }
                className="min-h-[130px] resize-none"
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) void generateWebsite(); }}
              />
              <Button onClick={generateWebsite} disabled={webLoading || !webDesc.trim()} className="w-full gap-2 shadow-lg shadow-primary/30">
                {webLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                {webLoading
                  ? (lang === "ar" ? `جاري البناء... (${webChars.toLocaleString()} حرف)` : `Building... (${webChars.toLocaleString()} chars)`)
                  : (lang === "ar" ? "ابنِ الموقع الآن" : "Build Website Now")
                }
              </Button>
            </div>

            {webCode && (
              <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-sm">
                      {lang === "ar" ? "الموقع جاهز" : "Website Ready"}
                    </span>
                    {webLoading && (
                      <span className="text-xs text-primary animate-pulse">{lang === "ar" ? "يكتب..." : "writing..."}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setWebView(webView === "code" ? "preview" : "code")}
                      disabled={webLoading}
                      className="gap-1 text-xs"
                    >
                      {webView === "code" ? <Eye className="w-3.5 h-3.5" /> : <FileCode2 className="w-3.5 h-3.5" />}
                      {webView === "code"
                        ? (lang === "ar" ? "معاينة" : "Preview")
                        : (lang === "ar" ? "الكود" : "Code")
                      }
                    </Button>
                    <Button size="sm" variant="outline" onClick={copyCode} className="gap-1 text-xs">
                      <Copy className="w-3.5 h-3.5" />
                      {lang === "ar" ? "نسخ" : "Copy"}
                    </Button>
                    <Button size="sm" onClick={downloadHtml} disabled={webLoading} className="gap-1 text-xs shadow-lg shadow-primary/20">
                      <Download className="w-3.5 h-3.5" />
                      {lang === "ar" ? "تحميل HTML" : "Download HTML"}
                    </Button>
                  </div>
                </div>

                {webView === "preview" && !webLoading ? (
                  <iframe
                    ref={iframeRef}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    className="w-full border-0"
                    style={{ height: "620px" }}
                    title="Website Preview"
                  />
                ) : (
                  <pre
                    dir="ltr"
                    className="p-4 text-xs overflow-auto bg-black/30 text-emerald-300 font-mono leading-relaxed"
                    style={{ maxHeight: "520px" }}
                  >
                    {webCode}
                  </pre>
                )}
              </div>
            )}

            <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium text-blue-400">{lang === "ar" ? "نصيحة النشر المجاني" : "Free Deployment Tip"}</p>
                <p className="text-muted-foreground text-xs">
                  {lang === "ar"
                    ? "حمّل ملف HTML وانشره مجاناً على: GitHub Pages، Netlify، أو Vercel — كلها مجانية وفورية."
                    : "Download the HTML file and deploy for free on: GitHub Pages, Netlify, or Vercel — all free and instant."
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
