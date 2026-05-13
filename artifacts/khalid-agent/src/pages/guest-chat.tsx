import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Send, Bot, User, Sparkles, X, UserPlus, AlertTriangle, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { AdsDisplay } from "@/components/AdsDisplay";

const STORAGE_KEY = "ks_guest_session";

interface GuestMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  ts: number;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

export default function GuestChat() {
  const { isRTL, lang, t } = useI18n();
  const [messages, setMessages] = useState<GuestMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as GuestMessage[]) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  useEffect(() => {
    const clear = () => {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    };
    window.addEventListener("beforeunload", clear);
    return () => window.removeEventListener("beforeunload", clear);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const vp = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (vp) vp.scrollTop = vp.scrollHeight;
    }
  }, [messages, streamContent]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text && !selectedImage) return;
    if (isStreaming || limitReached) return;

    let content = text;
    if (selectedImage) {
      const b64Full = await fileToBase64(selectedImage);
      const b64 = b64Full.split(",")[1] ?? b64Full;
      content += `\n[IMAGE:${selectedImage.type}:${b64}]`;
    }

    const userMsg: GuestMessage = { id: Date.now(), role: "user", content: text || (isRTL ? "[صورة مرفقة]" : "[Image attached]"), ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSelectedImage(null);
    setIsStreaming(true);
    setStreamContent("");

    const history = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch("/api/gemini/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, history }),
      });

      if (response.status === 429) {
        const data = await response.json() as { message?: string };
        setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: data.message ?? "وصلت للحد المسموح. سجّل حساباً مجانياً للمزيد!", ts: Date.now() }]);
        setLimitReached(true);
        setIsStreaming(false);
        return;
      }

      if (!response.ok || !response.body) throw new Error("Failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

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
              if (data.content) { full += data.content; setStreamContent(full); }
            } catch {}
          }
        }
      }
      setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: full, ts: Date.now() }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: isRTL ? "حدث خطأ. يرجى المحاولة مجدداً." : "An error occurred. Please try again.", ts: Date.now() }]);
    } finally {
      setIsStreaming(false);
      setStreamContent("");
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setLimitReached(false);
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="flex flex-col h-screen bg-background text-foreground"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 50%), hsl(240 10% 4%)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="font-bold text-sm">{t("appName")}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              {isRTL ? "وضع الضيف" : "Guest Mode"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat} className="text-xs text-muted-foreground h-7">
              <X className="w-3 h-3 ml-1 rtl:mr-1 rtl:ml-0" />
              {isRTL ? "مسح" : "Clear"}
            </Button>
          )}
          <Link href="/sign-up">
            <Button size="sm" className="gap-1.5 text-xs h-7 shadow-md shadow-primary/20">
              <UserPlus className="w-3.5 h-3.5" />
              {isRTL ? "سجّل مجاناً" : "Sign Up Free"}
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8"><X className="w-4 h-4" /></Button>
          </Link>
        </div>
      </div>

      {/* Guest warning banner */}
      <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2 text-xs text-yellow-400">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>
          {isRTL
            ? "أنت في وضع الضيف — ستُحذف محادثتك عند إغلاق المتصفح. "
            : "Guest mode — your chat will be deleted when you close the browser. "}
          <Link href="/sign-up">
            <span className="underline cursor-pointer font-medium">{isRTL ? "سجّل مجاناً للحفظ" : "Sign up free to save"}</span>
          </Link>
        </span>
      </div>

      <AdsDisplay className="mx-4 mt-2 text-xs" />

      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-5 py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.2)]">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-bold text-lg">{isRTL ? "مرحباً بك في الوكيل الذكي" : "Welcome to AI Agent"}</p>
              <p className="text-muted-foreground text-sm mt-1">
                {isRTL ? "اسأل أي شيء — الدردشة مجانية" : "Ask anything — chat is free"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {[
                isRTL ? "ما هو أفضل مسار مهني لي؟" : "What's the best career for me?",
                isRTL ? "كيف أبدأ العمل الحر؟" : "How do I start freelancing?",
                isRTL ? "أسعار التصميم في اليمن؟" : "Design prices in Yemen?",
                isRTL ? "أفضل منصات العمل الحر" : "Best freelance platforms",
              ].map((q, i) => (
                <button key={i} onClick={() => setInput(q)}
                  className="text-right text-xs p-2.5 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all text-muted-foreground hover:text-foreground">
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-5 pb-4">
            {messages.map(msg => (
              <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                  msg.role === "user" ? "bg-secondary border-secondary" : "bg-primary/20 border-primary/30 text-primary")}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={cn("px-4 py-3 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed text-sm",
                  msg.role === "user" ? "bg-secondary text-secondary-foreground rounded-tr-sm" : "bg-card border border-border rounded-tl-sm")}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isStreaming && streamContent && (
              <div className="flex gap-3 flex-row">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed text-sm bg-card border border-primary/30 rounded-tl-sm">
                  {streamContent}<span className="inline-block w-1 h-4 ml-1 bg-primary animate-pulse align-middle" />
                </div>
              </div>
            )}
            {isStreaming && !streamContent && (
              <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center"><Loader2 className="w-4 h-4 text-primary animate-spin" /></div></div>
            )}
          </div>
        )}
      </ScrollArea>

      {limitReached && (
        <div className="mx-4 mb-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/30 text-center space-y-2">
          <p className="text-sm text-primary font-medium">
            {isRTL ? "وصلت لحد الضيف!" : "Guest limit reached!"}
          </p>
          <Link href="/sign-up">
            <Button size="sm" className="gap-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              {isRTL ? "سجّل مجاناً — محادثات غير محدودة" : "Sign up free — unlimited chat"}
            </Button>
          </Link>
        </div>
      )}

      <div className="p-4 border-t border-border bg-card/30 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          {selectedImage && (
            <div className="mb-2 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 text-xs text-primary">
              <ImageIcon className="w-3 h-3" />{selectedImage.name}
              <button onClick={() => setSelectedImage(null)}><X className="w-3 h-3" /></button>
            </div>
          )}
          <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={e => setSelectedImage(e.target.files?.[0] ?? null)} />
          <form onSubmit={e => { e.preventDefault(); sendMessage(); }}
            className={cn("flex items-end gap-2 bg-card border rounded-2xl p-2 shadow", limitReached ? "opacity-50 pointer-events-none" : "border-input focus-within:ring-1 focus-within:ring-primary/50")}>
            <Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-full h-9 w-9 text-muted-foreground" onClick={() => fileRef.current?.click()}>
              <ImageIcon className="w-4 h-4" />
            </Button>
            <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder={isRTL ? "اكتب رسالتك هنا..." : "Write your message..."}
              className="min-h-[40px] max-h-40 resize-none border-0 focus-visible:ring-0 shadow-none bg-transparent text-sm" rows={1}
              disabled={isStreaming || limitReached} />
            <Button type="submit" size="icon" className="shrink-0 rounded-full h-9 w-9 bg-primary"
              disabled={(!input.trim() && !selectedImage) || isStreaming || limitReached}>
              <Send className="w-4 h-4 rtl:-scale-x-100" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
