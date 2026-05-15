import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useSearch, Link } from "wouter";
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
  Send, Image as ImageIcon, Bot, User, Sparkles, X, Loader2,
  Zap, Ban, Crown, Brain, Mic, MicOff, Bell, Trophy,
} from "lucide-react";
import { VoiceButton } from "@/components/VoiceButton";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Announcement { id: number; title: string; content: string; isActive: boolean; }

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const displayContent = (content: string) =>
    content.replace(/\[IMAGE:[^\]]+\]/g, isRTL ? "[📷 صورة مرفقة]" : "[📷 Image attached]").trim();

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
            className="p-4 rounded-xl border border-border bg-card/50 hover:bg-accent/50 transition-colors cursor-pointer"
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
    <div dir={isRTL ? "rtl" : "ltr"} className="flex flex-col h-full bg-transparent">

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
            <p className="text-foreground/80 text-xs leading-relaxed">{ann.content}</p>
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

      {/* Premium required notice */}
      {isPremiumNeeded && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl border bg-yellow-500/5 border-yellow-500/30 flex flex-col gap-2 text-sm">
          <p className="text-yellow-400 font-medium flex items-center gap-1.5">
            <Crown className="w-4 h-4" />
            {lang === "ar" ? "هذه المهمة تتطلب خطة مدفوعة" : "This task requires a paid plan"}
          </p>
          <p className="text-muted-foreground text-xs">{limitError?.message}</p>
          <div className="flex gap-2">
            <Link href="/subscribe?plan=weekly">
              <Button size="sm" className="text-xs h-7 gap-1"><Zap className="w-3 h-3" />{lang === "ar" ? "اشترك $2.99/أسبوع" : "Subscribe $2.99/week"}</Button>
            </Link>
            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setLimitError(null)}>
              {lang === "ar" ? "متابعة الدردشة" : "Continue chatting"}
            </Button>
          </div>
        </div>
      )}

      <ScrollArea ref={scrollRef} className="flex-1 px-4 md:px-8 py-6">
        {!conversationId && localMessages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {isConvLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            {localMessages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                  msg.role === "user" ? "bg-secondary border-secondary-border" : "bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(124,58,237,0.3)]",
                )}>
                  {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className="flex flex-col gap-1 max-w-[85%]">
                  <div className={cn(
                    "px-5 py-4 rounded-2xl whitespace-pre-wrap leading-relaxed",
                    msg.role === "user" ? "bg-secondary text-secondary-foreground rounded-tr-sm" : "bg-card border border-border rounded-tl-sm text-card-foreground shadow-sm",
                  )}>
                    {displayContent(msg.content)}
                  </div>
                  {msg.role === "assistant" && (
                    <VoiceButton text={msg.content} size="xs" className="self-start ms-1" />
                  )}
                </div>
              </div>
            ))}
            {isStreaming && streamingContent && (
              <div className="flex gap-4 flex-row">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="px-5 py-4 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed bg-card border border-primary/30 rounded-tl-sm text-card-foreground shadow-[0_0_10px_rgba(124,58,237,0.1)]">
                  {streamingContent}
                  <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />
                </div>
              </div>
            )}
            {isStreaming && !streamingContent && (
              <div className="flex gap-4 flex-row">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-primary/20 border-primary/40 text-primary">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 md:p-6 bg-gradient-to-t from-background via-background to-transparent mt-auto relative z-10">
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
            className={cn(
              "relative flex items-end gap-2 bg-card border rounded-3xl p-2 shadow-lg transition-all",
              isBlocked ? "border-destructive/40 opacity-60 pointer-events-none" : "border-input focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary",
            )}
          >
            <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
            <Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-full h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => fileInputRef.current?.click()} disabled={isStreaming || isBlocked}>
              <ImageIcon className="w-5 h-5" />
            </Button>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isBlocked ? (lang === "ar" ? "تم تعليق حسابك" : "Account suspended") : isListening ? (lang === "ar" ? "🎤 يستمع..." : "🎤 Listening...") : t("sendMessage")}
              className="min-h-[44px] max-h-48 resize-none border-0 focus-visible:ring-0 shadow-none bg-transparent p-3 text-base"
              rows={1}
              disabled={isStreaming || isBlocked}
            />
            {/* Mic button */}
            <Button type="button" variant="ghost" size="icon"
              className={cn(
                "shrink-0 rounded-full h-10 w-10 transition-all",
                isListening
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse ring-2 ring-red-500/30"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10",
              )}
              onClick={toggleMic}
              disabled={isStreaming || isBlocked}
              title={lang === "ar" ? "تحدث بصوتك" : "Speak"}>
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Button type="submit" size="icon"
              className="shrink-0 rounded-full h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.6)]"
              disabled={(!input.trim() && !selectedImage) || isStreaming || isBlocked}>
              <Send className="w-4 h-4 rtl:-scale-x-100" />
            </Button>
          </form>
          <div className="text-center mt-2 text-xs text-muted-foreground">{t("aiDisclaimer")}</div>
        </div>
      </div>
    </div>
  );
}
