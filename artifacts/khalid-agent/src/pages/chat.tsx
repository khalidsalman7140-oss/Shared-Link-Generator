import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { useUser } from "@clerk/react";
import {
  useGetGeminiConversation,
  getGetGeminiConversationQueryKey,
  useCreateGeminiConversation,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send, Camera, Bot, User, Sparkles, X, Loader2,
  Zap, Ban, Crown, Brain, Mic, MicOff, Bell, Trophy, Plus,
  FileText, BookOpen, Palette, Download,
} from "lucide-react";
import { VoiceButton } from "@/components/VoiceButton";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Announcement { id: number; title: string; content: string; isActive: boolean; }
interface BookItem { id: number; title: string; authors: { name: string }[]; formats: Record<string, string>; download_count: number; }

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });

type LimitError = { type: "blocked" | "premium_required"; message: string } | null;

export default function Chat() {
  const searchString = useSearch();
  const queryParams = new URLSearchParams(searchString);
  const conversationIdParam = queryParams.get("id");
  const conversationId = conversationIdParam ? parseInt(conversationIdParam, 10) : null;

  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { t, isRTL, lang } = useI18n();
  const { user } = useUser();

  const { data: conversation, isLoading: isConvLoading } = useGetGeminiConversation(
    conversationId || 0,
    { query: { enabled: !!conversationId, queryKey: getGetGeminiConversationQueryKey(conversationId || 0) } },
  );
  const createMutation = useCreateGeminiConversation();

  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<{ file: File; base64: string; mimeType: string } | null>(null);
  const [localMessages, setLocalMessages] = useState<Array<{ id: number; role: string; content: string }>>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [limitError, setLimitError] = useState<LimitError>(null);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [vipLevel, setVipLevel] = useState<"silver" | "gold" | null>(null);
  const [planUpgradeToast, setPlanUpgradeToast] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedAnnIds, setDismissedAnnIds] = useState<Set<number>>(new Set());
  const [websiteCache, setWebsiteCache] = useState<Record<string, string>>({});
  const [expandedCode, setExpandedCode] = useState<Record<string, boolean>>({});
  const [logoCache, setLogoCache] = useState<Record<string, string>>({});
  const [booksCache, setBooksCache] = useState<Record<string, BookItem[]>>({});
  const [docCache, setDocCache] = useState<Record<string, { base64: string; filename: string }>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchUsage = useCallback(async (prevPlan?: string) => {
    try {
      const r = await fetch("/api/gemini/usage");
      if (r.ok) {
        const data = await r.json() as { plan: string; unlimited: boolean; vipLevel?: "silver" | "gold" | null };
        if (prevPlan && prevPlan === "free" && data.plan !== "free") {
          const planLabel: Record<string, string> = { weekly: "أسبوعي", monthly: "شهري", annual: "سنوي", enterprise: "مؤسسي" };
          setPlanUpgradeToast(`🎉 تم تفعيل خطتك ${planLabel[data.plan] ?? data.plan}! استمتع بكل المميزات الآن.`);
          setTimeout(() => setPlanUpgradeToast(null), 6000);
        }
        setUserPlan(data.plan);
        setVipLevel(data.vipLevel ?? null);
      }
    } catch {}
  }, []);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  // Poll for plan upgrades every 30 seconds
  useEffect(() => {
    let currentPlan = userPlan;
    const interval = setInterval(() => { fetchUsage(currentPlan); currentPlan = userPlan; }, 30000);
    return () => clearInterval(interval);
  }, [fetchUsage, userPlan]);

  // Fetch active announcements
  useEffect(() => {
    fetch("/api/announcements")
      .then(r => r.ok ? r.json() : [])
      .then((data: Announcement[]) => setAnnouncements(data.filter(a => a.isActive)))
      .catch(() => {});
  }, []);

  // تسجيل الاشتراك في إشعارات Push
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    const VAPID_PUBLIC = "BHg4ZoUWZTqlrCXTXOsGkQ8yPKfb4h8J4U78VuIXStTnlpQ_02kFvMWI6886ONFnMwCxBsZWnrsY0jsLZr7NLfw";
    const subscribe = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (existing) return;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: VAPID_PUBLIC,
        });
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
        });
      } catch { /* ignore */ }
    };
    if (Notification.permission === "granted") {
      void subscribe();
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then(p => { if (p === "granted") void subscribe(); });
    }
  }, []);

  // Speech Recognition (mic input)
  const toggleMic = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRec = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert(lang === "ar" ? "متصفحك لا يدعم التعرف على الصوت. استخدم Chrome." : "Your browser doesn't support speech recognition. Use Chrome.");
      return;
    }
    const rec = new SpeechRec();
    rec.lang = lang === "ar" ? "ar-YE" : lang === "fr" ? "fr-FR" : lang === "tr" ? "tr-TR" : lang === "es" ? "es-ES" : "en-US";
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let finalTranscript = input;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i]?.[0]?.transcript ?? "";
        if (e.results[i]?.isFinal) finalTranscript += t;
        else interim = t;
      }
      setInput(finalTranscript + interim);
    };
    rec.onend = () => { setIsListening(false); setInput(finalTranscript); };
    rec.onerror = () => { setIsListening(false); };
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [isListening, input, lang]);

  useEffect(() => {
    const tracked = sessionStorage.getItem("ks_email_tracked");
    if (tracked) return;
    fetch("/api/user/track-email", { method: "POST" })
      .then(r => { if (r.ok) sessionStorage.setItem("ks_email_tracked", "1"); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (conversation?.messages) setLocalMessages(conversation.messages);
    else if (!conversationId) setLocalMessages([]);
  }, [conversation?.messages, conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [localMessages, streamingContent]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64Full = await fileToBase64(file);
      setSelectedImage({ file, base64: base64Full.split(",")[1] || base64Full, mimeType: file.type });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async (targetConvId: number, content: string) => {
    setIsStreaming(true);
    setStreamingContent("");
    setLimitError(null);
    const tempId = Date.now();
    setLocalMessages((prev) => [...prev, { id: tempId, role: "user", content }]);
    setInput("");
    setSelectedImage(null);

    try {
      const response = await fetch(`/api/gemini/conversations/${targetConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (response.status === 403 || response.status === 402 || response.status === 429) {
        const errData = await response.json() as { error: string; message?: string };
        setLocalMessages((prev) => prev.filter(m => m.id !== tempId));
        setLimitError({
          type: errData.error === "blocked" ? "blocked" : "premium_required",
          message: errData.message ?? (lang === "ar" ? "حدث خطأ" : "An error occurred"),
        });
        return;
      }

      if (!response.ok) throw new Error("Failed");
      if (!response.body) throw new Error("No body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullAssistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6)) as { content?: string; done?: boolean };
              if (data.content) {
                fullAssistantContent += data.content;
                setStreamingContent(fullAssistantContent);
              }
            } catch {}
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: getGetGeminiConversationQueryKey(targetConvId) });
    } catch {
      setLocalMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "assistant", content: lang === "ar" ? "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى." : "Sorry, an error occurred. Please try again." },
      ]);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !selectedImage) return;
    if (isStreaming) return;
    if (limitError?.type === "blocked") return;

    let messageContent = input.trim();
    if (selectedImage) {
      messageContent += `\n[IMAGE:${selectedImage.mimeType}:${selectedImage.base64}]`;
    }

    // توليد موقع HTML مباشرة إذا كان الطلب لموقع
    if (!selectedImage && isWebsiteRequest(messageContent)) {
      void handleWebsiteGeneration(messageContent);
      return;
    }

    // توليد صورة مباشرة إذا كان الطلب لصورة
    if (!selectedImage && isImageRequest(messageContent)) {
      void handleImageGeneration(messageContent);
      return;
    }

    // توليد شعار SVG مجاني
    if (!selectedImage && isLogoRequest(messageContent)) {
      void handleLogoGeneration(messageContent);
      return;
    }

    // البحث في الكتب المجانية
    if (!selectedImage && isBooksRequest(messageContent)) {
      void handleBooksSearch(messageContent);
      return;
    }

    // توليد وثيقة Word
    if (!selectedImage && isDocRequest(messageContent)) {
      void handleDocGeneration(messageContent);
      return;
    }

    if (!conversationId) {
      createMutation.mutate(
        { data: { title: messageContent.slice(0, 60) || t("newChat") } },
        { onSuccess: (newConv) => { setLocation(`/chat?id=${newConv.id}`); sendMessage(newConv.id, messageContent); } },
      );
    } else {
      sendMessage(conversationId, messageContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  // كلمات كشف طلبات توليد المواقع
  const WEBSITE_KEYWORDS = ["صمم موقع","اعمل موقع","ابني موقع","اصنع موقع","أنشئ موقع","انشئ موقع","صمم لي موقع","اعملي موقع","بني لي موقع","صمم صفحة ويب","اعمل صفحة ويب","صمم لاندينج","create website","build website","make website","design website","build a website","create a page","build a page","make a webpage"];
  const isWebsiteRequest = (text: string) => WEBSITE_KEYWORDS.some(kw => text.toLowerCase().includes(kw.toLowerCase()));

  const handleWebsiteGeneration = async (prompt: string) => {
    const userMsgId = Date.now();
    setLocalMessages(prev => [...prev, { id: userMsgId, role: "user", content: prompt }]);
    setInput("");
    setIsStreaming(true);
    const loadingId = userMsgId + 1;
    const siteId = `ws_${loadingId}`;
    setLocalMessages(prev => [...prev, { id: loadingId, role: "assistant", content: "[GEN_WEBSITE_LOADING]" }]);
    try {
      const r = await fetch("/api/gemini/generate-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await r.json() as { html?: string; error?: string };
      if (data.html) {
        setWebsiteCache(prev => ({ ...prev, [siteId]: data.html! }));
        setLocalMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: `[GEN_WEBSITE:${siteId}]` } : m));
      } else {
        setLocalMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: data.error ?? "فشل توليد الموقع" } : m));
      }
    } catch {
      setLocalMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: lang === "ar" ? "حدث خطأ في توليد الموقع" : "Website generation failed" } : m));
    } finally {
      setIsStreaming(false);
    }
  };

  // كلمات كشف طلبات توليد الصور
  const IMAGE_KEYWORDS = ["صمم صورة","صمم لي صورة","ارسم","أنشئ صورة","اعمل صورة","اصنع صورة","رسم لي","صمم لي","ارسم لي","انشئ صورة","اصنع لي صورة","generate image","create image","draw me","design image","make image"];
  const isImageRequest = (text: string) => IMAGE_KEYWORDS.some(kw => text.toLowerCase().includes(kw.toLowerCase()));

  // كلمات كشف طلبات الشعارات
  const LOGO_KEYWORDS = ["صمم شعار","اعمل شعار","اصنع شعار","أنشئ شعار","انشئ شعار","شعار احترافي","شعار لـ","شعار لشركة","شعار لمحل","شعار لمتجر","logo احترافي","صمم لوغو","اعمل لوغو","اصنع لوغو","create logo","make logo","design logo","generate logo","business logo","company logo"];
  const isLogoRequest = (text: string) => LOGO_KEYWORDS.some(kw => text.toLowerCase().includes(kw.toLowerCase()));

  // كلمات كشف طلبات الكتب
  const BOOKS_KEYWORDS = ["ابحث عن كتاب","أريد كتاب","اريد كتاب","كتب مجانية","اعطني كتاب","بحث كتب","تحميل كتاب","مكتبة مجانية","search books","free books","find book","download book"];
  const isBooksRequest = (text: string) => BOOKS_KEYWORDS.some(kw => text.toLowerCase().includes(kw.toLowerCase()));

  // كلمات كشف طلبات الوثائق
  const DOC_KEYWORDS = ["اكتب تقرير","أنشئ وثيقة","انشئ وثيقة","اكتب وثيقة","أنشئ تقرير","انشئ تقرير","ملف وورد","وثيقة word","تقرير رسمي","generate document","create word","make report","write report"];
  const isDocRequest = (text: string) => DOC_KEYWORDS.some(kw => text.toLowerCase().includes(kw.toLowerCase()));

  const handleLogoGeneration = async (prompt: string) => {
    const businessName = prompt.replace(/صمم شعار|اعمل شعار|اصنع شعار|أنشئ شعار|شعار لـ|شعار لشركة|شعار لمحل|لوغو احترافي|صمم لوغو|اعمل لوغو|create logo|make logo|design logo|generate logo|business logo|company logo/gi, "").trim() || prompt.trim();
    const userMsgId = Date.now();
    setLocalMessages(prev => [...prev, { id: userMsgId, role: "user", content: prompt }]);
    setInput("");
    setIsStreaming(true);
    const loadingId = userMsgId + 1;
    const logoId = `logo_${loadingId}`;
    setLocalMessages(prev => [...prev, { id: loadingId, role: "assistant", content: "[LOGO_LOADING]" }]);
    try {
      const r = await fetch("/api/logos/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, businessType: "شركة", style: "modern" }),
      });
      const data = await r.json() as { svg?: string; error?: string };
      if (data.svg) {
        setLogoCache(prev => ({ ...prev, [logoId]: data.svg! }));
        setLocalMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: `[GEN_LOGO:${logoId}]` } : m));
      } else {
        setLocalMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: lang === "ar" ? "لم أتمكن من توليد الشعار، حاول مرة أخرى" : "Logo generation failed" } : m));
      }
    } catch {
      setLocalMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: lang === "ar" ? "حدث خطأ في توليد الشعار" : "Logo generation failed" } : m));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleBooksSearch = async (prompt: string) => {
    const query = prompt.replace(/ابحث عن كتاب|أريد كتاب|اريد كتاب|كتب مجانية|اعطني كتاب|بحث كتب|search books|free books|find book/gi, "").trim() || "programming";
    const userMsgId = Date.now();
    setLocalMessages(prev => [...prev, { id: userMsgId, role: "user", content: prompt }]);
    setInput("");
    setIsStreaming(true);
    const loadingId = userMsgId + 1;
    const booksId = `books_${loadingId}`;
    setLocalMessages(prev => [...prev, { id: loadingId, role: "assistant", content: "[BOOKS_LOADING]" }]);
    try {
      const r = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
      const data = await r.json() as { results?: BookItem[]; error?: string };
      const books = data.results ?? [];
      setBooksCache(prev => ({ ...prev, [booksId]: books }));
      setLocalMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: `[GEN_BOOKS:${booksId}]` } : m));
    } catch {
      setLocalMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: lang === "ar" ? "حدث خطأ في البحث" : "Search failed" } : m));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleDocGeneration = async (prompt: string) => {
    const title = prompt.replace(/اكتب تقرير عن|أنشئ وثيقة عن|انشئ وثيقة عن|اكتب وثيقة عن|أنشئ تقرير عن|انشئ تقرير عن|ملف وورد عن|generate document about|create word about|make report about|write report about/gi, "").trim() || prompt.trim();
    const userMsgId = Date.now();
    setLocalMessages(prev => [...prev, { id: userMsgId, role: "user", content: prompt }]);
    setInput("");
    setIsStreaming(true);
    const loadingId = userMsgId + 1;
    const docId = `doc_${loadingId}`;
    setLocalMessages(prev => [...prev, { id: loadingId, role: "assistant", content: "[DOC_LOADING]" }]);
    try {
      const r = await fetch("/api/docs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: `تقرير شامل عن: ${title}\n\nتم إنشاء هذا التقرير بواسطة يمن شات - الوكيل الذكي لخالد سلمان.`, lang }),
      });
      const data = await r.json() as { base64?: string; filename?: string; error?: string };
      if (data.base64 && data.filename) {
        setDocCache(prev => ({ ...prev, [docId]: { base64: data.base64!, filename: data.filename! } }));
        setLocalMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: `[GEN_DOC:${docId}]` } : m));
      } else {
        setLocalMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: lang === "ar" ? "فشل إنشاء المستند" : "Document creation failed" } : m));
      }
    } catch {
      setLocalMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: lang === "ar" ? "حدث خطأ في إنشاء المستند" : "Document creation failed" } : m));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleImageGeneration = async (prompt: string) => {
    const userMsgId = Date.now();
    setLocalMessages(prev => [...prev, { id: userMsgId, role: "user", content: prompt }]);
    setInput("");
    setIsStreaming(true);
    const loadingId = userMsgId + 1;
    setLocalMessages(prev => [...prev, { id: loadingId, role: "assistant", content: "[IMG_LOADING]" }]);
    try {
      const r = await fetch("/api/gemini/generate-image-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, conversationId: conversationId ?? undefined }),
      });
      const data = await r.json() as { imageUrl?: string; error?: string };
      const imageUrl = data.imageUrl ?? `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random()*99999)}`;
      setLocalMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: `[GEN_IMAGE:${imageUrl}]` } : m));
    } catch {
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random()*99999)}`;
      setLocalMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: `[GEN_IMAGE:${fallbackUrl}]` } : m));
    } finally {
      setIsStreaming(false);
    }
  };

  const displayContent = (content: string): ReactNode => {
    // حالة تحميل الصورة
    if (content === "[IMG_LOADING]") {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          {lang === "ar" ? "جارٍ تصميم الصورة بالذكاء الاصطناعي..." : "Generating image with AI..."}
        </div>
      );
    }

    // حالة تحميل الموقع
    if (content === "[GEN_WEBSITE_LOADING]") {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          {lang === "ar" ? "جارٍ بناء الموقع بالذكاء الاصطناعي..." : "Building website with AI..."}
        </div>
      );
    }

    // عرض الموقع المولّد (iframe)
    const wsMatch = content.match(/^\[GEN_WEBSITE:(ws_\d+)\]$/);
    if (wsMatch) {
      const siteId = wsMatch[1];
      const html = websiteCache[siteId];
      if (!html) return <span className="text-muted-foreground text-sm">{lang === "ar" ? "جارٍ التحميل..." : "Loading..."}</span>;
      return (
        <div className="space-y-2 w-full max-w-2xl">
          <div className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
            🌐 {lang === "ar" ? "موقع مُولَّد بالذكاء الاصطناعي" : "AI-Generated Website"}
          </div>
          <div className="rounded-xl overflow-hidden border border-border shadow-lg bg-white" style={{ height: 420 }}>
            <iframe
              srcDoc={html}
              title="AI Generated Website"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            <button
              onClick={() => setExpandedCode(prev => ({ ...prev, [siteId]: !prev[siteId] }))}
              className="inline-flex items-center gap-1 text-[12px] px-3 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
            >
              {expandedCode[siteId] ? "▲ " : "▼ "}
              {lang === "ar" ? (expandedCode[siteId] ? "إخفاء الكود" : "عرض الكود") : (expandedCode[siteId] ? "Hide code" : "View code")}
            </button>
            <a
              href={`data:text/html;charset=utf-8,${encodeURIComponent(html)}`}
              download="website.html"
              className="inline-flex items-center gap-1 text-[12px] px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/5 transition-colors"
            >
              ⬇ {lang === "ar" ? "تحميل الموقع" : "Download"}
            </a>
          </div>
          {expandedCode[siteId] && (
            <pre className="text-xs bg-muted/60 rounded-xl p-4 overflow-x-auto max-h-72 border border-border" dir="ltr">
              <code>{html}</code>
            </pre>
          )}
        </div>
      );
    }

    // عرض الصورة المولّدة
    const genMatch = content.match(/^\[GEN_IMAGE:(https?:\/\/[^\]]+)\]$/);
    if (genMatch) {
      return (
        <div className="space-y-2">
          <img
            src={genMatch[1]}
            alt="صورة مُولَّدة بالذكاء الاصطناعي"
            className="max-w-full rounded-xl border border-border shadow-md"
            style={{ maxHeight: 400 }}
            onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f3f4f6' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3Eجارٍ التحميل...%3C/text%3E%3C/svg%3E"; }}
          />
          <a href={genMatch[1]} download target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
            ⬇ تحميل الصورة
          </a>
        </div>
      );
    }
    // تحميل الشعار
    if (content === "[LOGO_LOADING]") {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <Palette className="w-4 h-4 text-primary" />
          {lang === "ar" ? "جارٍ تصميم الشعار بالذكاء الاصطناعي..." : "Designing your logo with AI..."}
        </div>
      );
    }

    // عرض الشعار المولّد
    const logoMatch = content.match(/^\[GEN_LOGO:(logo_\d+)\]$/);
    if (logoMatch) {
      const logoId = logoMatch[1];
      const svg = logoCache[logoId];
      if (!svg) return <span className="text-muted-foreground text-sm">{lang === "ar" ? "جارٍ التحميل..." : "Loading..."}</span>;
      const svgBlob = new Blob([svg], { type: "image/svg+xml" });
      const svgUrl = URL.createObjectURL(svgBlob);
      return (
        <div className="space-y-3 w-full max-w-md">
          <div className="text-xs font-semibold text-primary flex items-center gap-1">
            <Palette className="w-3.5 h-3.5" />
            {lang === "ar" ? "شعار مُولَّد بالذكاء الاصطناعي" : "AI-Generated Logo"}
          </div>
          <div className="rounded-xl border border-border bg-white p-6 flex items-center justify-center shadow-md" style={{ minHeight: 160 }}
            dangerouslySetInnerHTML={{ __html: svg }} />
          <div className="flex gap-2 flex-wrap">
            <a href={svgUrl} download={`logo.svg`}
              className="inline-flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors">
              <Download className="w-3 h-3" />
              {lang === "ar" ? "تحميل SVG" : "Download SVG"}
            </a>
            <button
              onClick={() => {
                const png = document.createElement("canvas");
                const ctx = png.getContext("2d");
                const img = new Image();
                img.onload = () => {
                  png.width = 400; png.height = 200;
                  ctx?.drawImage(img, 0, 0);
                  const a = document.createElement("a");
                  a.download = "logo.png"; a.href = png.toDataURL(); a.click();
                };
                img.src = svgUrl;
              }}
              className="inline-flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-full border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/5 transition-colors">
              <Download className="w-3 h-3" />
              {lang === "ar" ? "تحميل PNG" : "Download PNG"}
            </button>
          </div>
        </div>
      );
    }

    // تحميل الكتب
    if (content === "[BOOKS_LOADING]") {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <BookOpen className="w-4 h-4 text-primary" />
          {lang === "ar" ? "جارٍ البحث في المكتبة المجانية..." : "Searching free library..."}
        </div>
      );
    }

    // عرض نتائج الكتب
    const booksMatch = content.match(/^\[GEN_BOOKS:(books_\d+)\]$/);
    if (booksMatch) {
      const booksId = booksMatch[1];
      const books = booksCache[booksId] ?? [];
      return (
        <div className="space-y-3 w-full max-w-2xl">
          <div className="text-xs font-semibold text-primary flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {lang === "ar" ? `📚 المكتبة المجانية — ${books.length} كتاب` : `📚 Free Library — ${books.length} books`}
          </div>
          {books.length === 0 && <p className="text-sm text-muted-foreground">{lang === "ar" ? "لم يتم العثور على كتب" : "No books found"}</p>}
          <div className="grid gap-2">
            {books.slice(0, 8).map(book => {
              const epubUrl = book.formats["application/epub+zip"] ?? book.formats["text/html"] ?? "#";
              return (
                <div key={book.id} className="rounded-lg border border-border bg-card p-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{book.title}</p>
                    <p className="text-xs text-muted-foreground">{book.authors.map(a => a.name).join(", ")}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">⬇ {book.download_count.toLocaleString()} {lang === "ar" ? "تحميل" : "downloads"}</p>
                  </div>
                  {epubUrl !== "#" && (
                    <a href={epubUrl} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors">
                      <Download className="w-3 h-3" />{lang === "ar" ? "تحميل" : "Download"}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // تحميل المستند
    if (content === "[DOC_LOADING]") {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <FileText className="w-4 h-4 text-primary" />
          {lang === "ar" ? "جارٍ إنشاء المستند..." : "Creating document..."}
        </div>
      );
    }

    // عرض المستند المولّد
    const docMatch = content.match(/^\[GEN_DOC:(doc_\d+)\]$/);
    if (docMatch) {
      const docId = docMatch[1];
      const doc = docCache[docId];
      if (!doc) return <span className="text-muted-foreground text-sm">{lang === "ar" ? "جارٍ التحميل..." : "Loading..."}</span>;
      const handleDocDownload = () => {
        const bytes = atob(doc.base64);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        const blob = new Blob([arr], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = doc.filename; a.click();
        URL.revokeObjectURL(url);
      };
      return (
        <div className="space-y-2 w-full max-w-sm">
          <div className="text-xs font-semibold text-primary flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            {lang === "ar" ? "وثيقة Word جاهزة للتحميل" : "Word document ready"}
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{doc.filename}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "مستند Word (.docx)" : "Word Document (.docx)"}</p>
            </div>
            <button onClick={handleDocDownload}
              className="shrink-0 inline-flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Download className="w-3 h-3" />
              {lang === "ar" ? "تحميل" : "Download"}
            </button>
          </div>
        </div>
      );
    }

    return content.replace(/\[IMAGE:[^\]]+\]/g, isRTL ? "[📷 صورة مرفقة]" : "[📷 Image attached]").trim();
  };

  const isBlocked = limitError?.type === "blocked";
  const isPremiumNeeded = limitError?.type === "premium_required";

  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto p-8 text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_50px_rgba(124,58,237,0.3)]">
        <Sparkles className="w-12 h-12 text-primary" />
      </div>
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-glow">{t("appName")}</h1>
        <p className="text-lg text-primary font-semibold">{lang === "ar" ? "نبني مهاراتك.. لنبني اليمن" : "We build your skills.. to build Yemen"}</p>
        <p className="text-muted-foreground max-w-xl">{t("taglineSub")}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {[
          { icon: Zap, label: lang === "ar" ? "دردشة مجانية غير محدودة" : "Unlimited free chat", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5" },
          { icon: Brain, label: lang === "ar" ? "تحديد المسار المهني" : "Career mapping", color: "text-primary border-primary/30 bg-primary/5", link: "/career-map" },
          { icon: Crown, label: lang === "ar" ? "خدمات ثقيلة بخطة مدفوعة" : "Heavy tasks on paid plan", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5" },
        ].map((b, i) => {
          const Icon = b.icon;
          const content = (
            <span key={i} className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border", b.color)}>
              <Icon className="w-3 h-3" />{b.label}
            </span>
          );
          return b.link ? <Link key={i} href={b.link}>{content}</Link> : content;
        })}
      </div>

      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4", isRTL ? "text-right" : "text-left")}>
        {[
          { title: isRTL ? "التصميم والإبداع" : "Design & Creativity", desc: isRTL ? "هوية بصرية، صور، ديكور" : "Visual identity, AI images, decor" },
          { title: isRTL ? "المحتوى الرقمي" : "Digital Content", desc: isRTL ? "فيديوهات، كتب، عروض" : "Videos, eBooks, presentations" },
          { title: isRTL ? "الخدمات الأكاديمية" : "Academic Services", desc: isRTL ? "مشاريع تخرج، عروض جامعية" : "Graduation projects, presentations" },
          { title: isRTL ? "البرمجة والبيانات" : "Programming & Data", desc: isRTL ? "مواقع، تطبيقات، تحليل بيانات" : "Websites, apps, data analysis" },
        ].map((service, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
            onClick={() => { setInput(isRTL ? `أريد معرفة المزيد عن قسم ${service.title}` : `Tell me more about ${service.title}`); textareaRef.current?.focus(); }}
          >
            <h3 className="font-semibold text-primary mb-1">{service.title}</h3>
            <p className="text-sm text-muted-foreground">{service.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const visibleAnnouncements = announcements.filter(a => !dismissedAnnIds.has(a.id));

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="relative flex flex-col h-full">
      <div className="relative z-10 flex flex-col h-full bg-white">

      {/* Services Marquee */}
      <div className="overflow-hidden border-b border-primary/20 bg-gradient-to-r from-primary/5 via-primary/8 to-primary/5 py-1.5 select-none shrink-0">
        <style>{`@keyframes ks-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
        <div style={{ display: "flex", animation: "ks-marquee 38s linear infinite" }} dir="ltr">
          {[0, 1].map(i => (
            <div key={i} className="flex items-center gap-6 px-4 whitespace-nowrap" aria-hidden={i === 1}>
              {["✨ تصميم هوية بصرية", "🌐 بناء مواقع بالـ AI", "🎨 توليد صور احترافية", "📱 تطوير تطبيقات", "🎓 مشاريع تخرج", "💼 استشارات مجانية", "⚡ اشترك من $2.99/أسبوع", "📊 تحليل البيانات"].map((item, j) => (
                <span key={j} className="text-[11px] text-primary/70 font-medium">{item}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Plan upgrade toast */}
      {planUpgradeToast && (
        <div className="mx-3 mt-2 px-4 py-2.5 rounded-xl border border-emerald-500/50 bg-emerald-500/10 flex items-start gap-3 text-sm animate-in slide-in-from-top duration-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <span className="text-xl shrink-0">🎉</span>
          <p className="flex-1 text-emerald-300 font-medium">{planUpgradeToast}</p>
          <button onClick={() => setPlanUpgradeToast(null)} className="text-muted-foreground hover:text-foreground shrink-0 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Announcements banner */}
      {visibleAnnouncements.map(ann => (
        <div key={ann.id} className="mx-3 mt-2 px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/8 flex items-start gap-3 text-sm animate-in slide-in-from-top duration-300">
          <Bell className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {ann.title && <p className="font-semibold text-amber-400 text-xs mb-0.5">{ann.title}</p>}
            <p className="text-gray-700 text-xs leading-relaxed">{ann.content}</p>
          </div>
          <button onClick={() => setDismissedAnnIds(prev => new Set([...prev, ann.id]))}
            className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {/* Blocked notice */}
      {isBlocked && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl border bg-destructive/10 border-destructive/40 flex items-start gap-3 text-sm text-destructive">
          <Ban className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-0.5">{lang === "ar" ? "تم تعليق حسابك" : "Account suspended"}</p>
            <p className="text-xs opacity-80">{lang === "ar" ? "للاستفسار: +967783701365" : "Contact: +967783701365"}</p>
          </div>
        </div>
      )}

      {/* Premium notice — soft, dismissible */}
      {isPremiumNeeded && (
        <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl border bg-primary/5 border-primary/20 flex items-center gap-3 text-sm">
          <Crown className="w-4 h-4 text-primary shrink-0" />
          <p className="flex-1 text-muted-foreground text-xs">{lang === "ar" ? "يمكنك الاشتراك للحصول على سرعة أعلى وأولوية في المعالجة." : "Subscribe for faster responses and priority processing."}</p>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/subscribe"><Button size="sm" className="text-xs h-6 px-2 gap-1"><Zap className="w-2.5 h-2.5" />{lang === "ar" ? "اشترك" : "Subscribe"}</Button></Link>
            <button onClick={() => setLimitError(null)} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}

      <ScrollArea ref={scrollRef} className="flex-1 px-4 md:px-8 py-6 bg-white">
        {!conversationId && localMessages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <div className="max-w-3xl mx-auto space-y-1 pb-24">
            {isConvLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#000" }} />
              </div>
            )}
            {localMessages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")} style={{ marginBottom: 4 }}>
                {msg.role === "assistant" && (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#f1f3f4", border: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginInlineEnd: 10, alignSelf: "flex-start", marginTop: 6, overflow: "hidden" }}>
                    <img src="/logo.svg" alt="يمن شات" style={{ width: "100%", height: "100%", objectFit: "cover", padding: 4 }} />
                  </div>
                )}
                <div style={{ maxWidth: "78%" }}>
                  {msg.role === "assistant" && (
                    <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#5f6368", marginBottom: 4, marginInlineStart: 2 }}>يمن شات</p>
                  )}
                  <div style={{
                    padding: msg.role === "user" ? "10px 16px" : "12px 16px",
                    borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "4px 20px 20px 20px",
                    background: msg.role === "user" ? "#000" : "#f8f9fa",
                    color: msg.role === "user" ? "#fff" : "#202124",
                    fontSize: "0.93rem",
                    lineHeight: 1.75,
                    fontWeight: msg.role === "user" ? 500 : 400,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    border: msg.role === "assistant" ? "1px solid #e8eaed" : "none",
                  }}>
                    {displayContent(msg.content)}
                  </div>
                  {msg.role === "assistant" && (
                    <div style={{ marginTop: 4, marginInlineStart: 2 }}>
                      <VoiceButton text={msg.content} size="xs" className="self-start" />
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginInlineStart: 10, alignSelf: "flex-start", marginTop: 6, overflow: "hidden" }}>
                    {user?.imageUrl
                      ? <img src={user.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <User style={{ width: 14, height: 14, color: "#fff" }} />}
                  </div>
                )}
              </div>
            ))}
            {isStreaming && streamingContent && (
              <div className="flex justify-start" style={{ marginBottom: 4 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#f1f3f4", border: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginInlineEnd: 10, alignSelf: "flex-start", marginTop: 6, overflow: "hidden" }}>
                  <img src="/logo.svg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", padding: 4 }} />
                </div>
                <div style={{ maxWidth: "78%" }}>
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#5f6368", marginBottom: 4 }}>يمن شات</p>
                  <div style={{ padding: "12px 16px", borderRadius: "4px 20px 20px 20px", background: "#f8f9fa", color: "#202124", fontSize: "0.93rem", lineHeight: 1.75, border: "1px solid #e8eaed", whiteSpace: "pre-wrap" }}>
                    {streamingContent}
                    <span style={{ display: "inline-block", width: 6, height: 15, background: "#000", marginInlineStart: 3, borderRadius: 2, animation: "ks-blink 0.9s ease-in-out infinite", verticalAlign: "middle" }} />
                  </div>
                </div>
              </div>
            )}
            {isStreaming && !streamingContent && (
              <div className="flex justify-start" style={{ marginBottom: 4 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#f1f3f4", border: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginInlineEnd: 10, overflow: "hidden" }}>
                  <img src="/logo.svg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", padding: 4 }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "12px 16px", background: "#f8f9fa", border: "1px solid #e8eaed", borderRadius: "4px 20px 20px 20px" }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width: 7, height: 7, background: "#000", borderRadius: "50%", display: "inline-block", animation: `ks-dot 1.2s ease-in-out ${i*0.25}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 md:p-6 bg-gradient-to-t from-white via-white/95 to-transparent mt-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          {selectedImage && (
            <div className="mb-3 relative inline-block">
              <div className="relative rounded-lg overflow-hidden border border-primary/30 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                <img src={URL.createObjectURL(selectedImage.file)} alt="Selected" className="h-24 object-cover" />
                <button onClick={() => setSelectedImage(null)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-destructive transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Plan / VIP badge + Tools shortcut */}
          <div className="mb-2 flex justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              {userPlan !== "free" && (
                <Link href="/tools">
                  <button className="text-[10px] bg-primary/10 text-primary border border-primary/30 rounded-full px-2.5 py-1 flex items-center gap-1 hover:bg-primary/20 transition-colors">
                    <Zap className="w-2.5 h-2.5" />
                    {lang === "ar" ? "أدوات الإنتاج" : "Production Tools"}
                  </button>
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2">
              {vipLevel === "gold" && (
                <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full px-2 py-0.5 flex items-center gap-1 shadow-[0_0_8px_rgba(234,179,8,0.2)]">
                  <Trophy className="w-2.5 h-2.5" />VIP ذهبي
                </span>
              )}
              {vipLevel === "silver" && (
                <span className="text-[10px] bg-slate-400/10 text-slate-300 border border-slate-400/30 rounded-full px-2 py-0.5 flex items-center gap-1">
                  <Trophy className="w-2.5 h-2.5" />VIP فضي
                </span>
              )}
              {userPlan !== "free" && (
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5" />{userPlan}
                </span>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            dir="ltr"
            className={cn(
              "relative flex items-end gap-1.5 bg-white border rounded-3xl px-2 py-2 transition-all",
              isBlocked ? "border-red-300 opacity-60 pointer-events-none" : "border-gray-300 focus-within:border-gray-500 shadow-sm",
            )}
            style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.1)" }}
          >
            {/* Hidden file inputs */}
            <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleImageSelect} />

            {/* LEFT icons: mic (blue), camera (green), + add (purple) */}
            <div className="flex items-center gap-1 shrink-0">
              {/* + add (purple) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming || isBlocked}
                title={lang === "ar" ? "إضافة ملف" : "Add file"}
                className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
              {/* camera (green) */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isStreaming || isBlocked}
                title={lang === "ar" ? "إرفاق صورة" : "Attach image"}
                className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md disabled:opacity-40"
              >
                <Camera className="w-4 h-4" />
              </button>
              {/* mic (blue) */}
              <button
                type="button"
                onClick={toggleMic}
                disabled={isStreaming || isBlocked}
                title={lang === "ar" ? "تحدث بصوتك" : "Voice input"}
                className={cn(
                  "w-9 h-9 rounded-full text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md disabled:opacity-40",
                  isListening
                    ? "bg-red-500 hover:bg-red-600 animate-pulse ring-2 ring-red-400/40"
                    : "bg-blue-500 hover:bg-blue-600",
                )}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <Textarea
              ref={textareaRef}
              dir={isRTL ? "rtl" : "ltr"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isBlocked ? (lang === "ar" ? "تم تعليق حسابك" : "Account suspended") : isListening ? (lang === "ar" ? "🎤 يستمع..." : "🎤 Listening...") : t("sendMessage")}
              className="min-h-[44px] max-h-48 resize-none border-0 focus-visible:ring-0 shadow-none bg-transparent p-3 text-[15px] text-gray-900 placeholder:text-gray-400 flex-1"
              rows={1}
              disabled={isStreaming || isBlocked}
            />
            <Button type="submit" size="icon"
              className="shrink-0 rounded-full h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.6)]"
              disabled={(!input.trim() && !selectedImage) || isStreaming || isBlocked}>
              <Send className="w-4 h-4 rtl:-scale-x-100" />
            </Button>
          </form>
          <div className="text-center mt-2 text-xs" style={{ color: "#9aa0a6", fontSize: "0.68rem" }}>{t("aiDisclaimer")}</div>
          <style>{`
            @keyframes ks-dot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
            @keyframes ks-blink { 0%,100%{opacity:1} 50%{opacity:0} }
          `}</style>
        </div>
      </div>
      </div>
    </div>
  );
}
