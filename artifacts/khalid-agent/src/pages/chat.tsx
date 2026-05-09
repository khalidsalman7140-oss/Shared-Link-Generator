import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useSearch } from "wouter";
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
  Send,
  Image as ImageIcon,
  Bot,
  User,
  Sparkles,
  X,
  Loader2,
  Monitor,
  ExternalLink,
  Download,
  Copy,
  Check,
  Wand2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });

function extractHtmlBlocks(content: string): { html: string; index: number }[] {
  const results: { html: string; index: number }[] = [];
  const regex = /```html\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    results.push({ html: match[1], index: match.index });
  }
  return results;
}

function extractImagePrompts(content: string): string[] {
  const results: string[] = [];
  const regex = /\[GENERATE_IMAGE:\s*([^\]]+)\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    results.push(match[1].trim());
  }
  return results;
}

function HtmlPreview({ html }: { html: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const htmlWithBase = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0">${html.includes("<!DOCTYPE") ? "" : html}</body></html>`;
  const srcDoc = html.includes("<!DOCTYPE") ? html : htmlWithBase;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("mt-3 rounded-xl border border-cyan-500/30 overflow-hidden", isFullscreen && "fixed inset-4 z-50 shadow-2xl")}>
      <div className="flex items-center justify-between px-3 py-2 bg-cyan-500/10 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-cyan-400">معاينة الموقع</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-cyan-400" onClick={handleCopy}>
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-cyan-400" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-cyan-400" onClick={() => setIsFullscreen(!isFullscreen)}>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      <iframe
        ref={iframeRef}
        srcDoc={srcDoc}
        className={cn("w-full bg-white", isFullscreen ? "h-[calc(100%-44px)]" : "h-80")}
        sandbox="allow-scripts allow-same-origin"
        title="Website Preview"
      />
      {isFullscreen && (
        <button
          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-destructive transition-colors z-10"
          onClick={() => setIsFullscreen(false)}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function GeneratedImage({ prompt, authToken }: { prompt: string; authToken?: string }) {
  const [imageData, setImageData] = useState<{ b64_json: string; mimeType: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch("/api/gemini/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.b64_json) setImageData(data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [prompt]);

  const handleDownload = () => {
    if (!imageData) return;
    const a = document.createElement("a");
    a.href = `data:${imageData.mimeType};base64,${imageData.b64_json}`;
    a.download = "generated-image.png";
    a.click();
  };

  if (loading) {
    return (
      <div className="mt-3 rounded-xl border border-pink-500/30 bg-pink-500/5 p-6 flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
        <p className="text-sm text-pink-400">جارٍ توليد الصورة بالذكاء الاصطناعي...</p>
        <p className="text-xs text-muted-foreground text-center max-w-xs">{prompt}</p>
      </div>
    );
  }

  if (error || !imageData) {
    return (
      <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 text-center">
        تعذّر توليد الصورة. يمكنك طلب التجربة مجدداً.
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-pink-500/30 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-pink-500/10 border-b border-pink-500/20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span className="text-sm font-medium text-pink-400">صورة مولّدة بالذكاء الاصطناعي</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-pink-400" onClick={handleDownload}>
          <Download className="w-3.5 h-3.5" />
        </Button>
      </div>
      <img
        src={`data:${imageData.mimeType};base64,${imageData.b64_json}`}
        alt={prompt}
        className="w-full max-h-96 object-contain bg-white/5"
      />
      <div className="px-3 py-2 bg-pink-500/5 border-t border-pink-500/10">
        <p className="text-xs text-muted-foreground">{prompt}</p>
      </div>
    </div>
  );
}

function MessageContent({ content, role }: { content: string; role: string }) {
  const displayContent = content
    .replace(/\[IMAGE:[^\]]+\]/g, "")
    .replace(/\[GENERATE_IMAGE:[^\]]+\]/g, "")
    .trim();

  const htmlBlocks = role === "assistant" ? extractHtmlBlocks(content) : [];
  const imagePrompts = role === "assistant" ? extractImagePrompts(content) : [];

  return (
    <div>
      {role === "assistant" ? (
        <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const isInline = !className;
                const lang = className?.replace("language-", "") ?? "";
                if (!isInline && lang === "html") {
                  return null;
                }
                if (isInline) {
                  return (
                    <code className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <pre className="bg-black/40 border border-border rounded-xl p-4 overflow-x-auto my-3">
                    <code className="text-sm font-mono text-foreground" {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              p({ children }) {
                return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
              },
              ul({ children }) {
                return <ul className="my-2 space-y-1 list-none ps-0">{children}</ul>;
              },
              li({ children }) {
                return (
                  <li className="flex gap-2 items-start">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    <span>{children}</span>
                  </li>
                );
              },
              strong({ children }) {
                return <strong className="font-bold text-foreground">{children}</strong>;
              },
              h1({ children }) {
                return <h1 className="text-xl font-bold text-foreground mt-3 mb-2">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-lg font-bold text-foreground mt-3 mb-2">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-base font-semibold text-foreground mt-2 mb-1">{children}</h3>;
              },
              a({ href, children }) {
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 transition-colors">
                    {children}
                  </a>
                );
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-s-4 border-primary/40 ps-4 my-2 text-muted-foreground italic">
                    {children}
                  </blockquote>
                );
              },
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="whitespace-pre-wrap leading-relaxed">
          {content.replace(/\[IMAGE:[^\]]+\]/g, "📷").trim()}
        </p>
      )}

      {htmlBlocks.map((block, i) => (
        <HtmlPreview key={i} html={block.html} />
      ))}

      {imagePrompts.map((prompt, i) => (
        <GeneratedImage key={i} prompt={prompt} />
      ))}
    </div>
  );
}

export default function Chat() {
  const searchString = useSearch();
  const queryParams = new URLSearchParams(searchString);
  const conversationIdParam = queryParams.get("id");
  const conversationId = conversationIdParam ? parseInt(conversationIdParam, 10) : null;

  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { t, isRTL } = useI18n();

  const { data: conversation, isLoading: isConvLoading } = useGetGeminiConversation(
    conversationId || 0,
    {
      query: {
        enabled: !!conversationId,
        queryKey: getGetGeminiConversationQueryKey(conversationId || 0),
      },
    },
  );

  const createMutation = useCreateGeminiConversation();

  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    base64: string;
    mimeType: string;
  } | null>(null);
  const [localMessages, setLocalMessages] = useState<
    Array<{ id: number; role: string; content: string }>
  >([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (conversation?.messages) {
      setLocalMessages(conversation.messages);
    } else if (!conversationId) {
      setLocalMessages([]);
    }
  }, [conversation?.messages, conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [localMessages, streamingContent]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64Full = await fileToBase64(file);
      const base64Data = base64Full.split(",")[1] || base64Full;
      setSelectedImage({ file, base64: base64Data, mimeType: file.type });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = useCallback(async (targetConvId: number, content: string) => {
    setIsStreaming(true);
    setStreamingContent("");
    const tempId = Date.now();
    setLocalMessages((prev) => [...prev, { id: tempId, role: "user", content }]);
    setInput("");
    setSelectedImage(null);

    try {
      const response = await fetch(
        `/api/gemini/conversations/${targetConvId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        },
      );

      if (!response.ok) throw new Error("Failed to send message");
      if (!response.body) throw new Error("No response body");

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
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullAssistantContent += data.content;
                setStreamingContent(fullAssistantContent);
              }
            } catch {}
          }
        }
      }

      queryClient.invalidateQueries({
        queryKey: getGetGeminiConversationQueryKey(targetConvId),
      });
    } catch (error) {
      setLocalMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          content: "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.",
        },
      ]);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  }, [queryClient]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !selectedImage) return;
    if (isStreaming) return;

    let messageContent = input.trim();
    if (selectedImage) {
      messageContent += `\n[IMAGE:${selectedImage.mimeType}:${selectedImage.base64}]`;
    }

    if (!conversationId) {
      createMutation.mutate(
        { data: { title: messageContent.slice(0, 60) || t("newChat") } },
        {
          onSuccess: (newConv) => {
            setLocation(`/chat?id=${newConv.id}`);
            sendMessage(newConv.id, messageContent);
          },
        },
      );
    } else {
      sendMessage(conversationId, messageContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickPrompts = [
    {
      icon: Monitor,
      color: "text-cyan-400",
      bg: "hover:bg-cyan-500/10",
      border: "border-cyan-500/20",
      text: isRTL ? "صمّم لي موقع شركة احترافي" : "Design a professional company website",
    },
    {
      icon: Sparkles,
      color: "text-pink-400",
      bg: "hover:bg-pink-500/10",
      border: "border-pink-500/20",
      text: isRTL ? "ولّد لي شعاراً بالذكاء الاصطناعي" : "Generate an AI logo for me",
    },
    {
      icon: Wand2,
      color: "text-purple-400",
      bg: "hover:bg-purple-500/10",
      border: "border-purple-500/20",
      text: isRTL ? "أريد هوية بصرية كاملة" : "I need a complete visual identity",
    },
    {
      icon: ImageIcon,
      color: "text-orange-400",
      bg: "hover:bg-orange-500/10",
      border: "border-orange-500/20",
      text: isRTL ? "أريد مشروع تخرج متكامل" : "I need a graduation project",
    },
  ];

  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto p-6 text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-primary/50 overflow-hidden shadow-[0_0_40px_rgba(124,58,237,0.4)]">
            <img
              src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/khalid.jpg`}
              alt="خالد سلمان"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-background">
            <Bot className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-glow">
            {t("appName")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">{t("tagline")}</p>
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-3 w-full",
          isRTL ? "text-right" : "text-left",
        )}
      >
        {quickPrompts.map((prompt, i) => {
          const Icon = prompt.icon;
          return (
            <button
              key={i}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border bg-card/40 transition-all text-start",
                prompt.border,
                prompt.bg,
                "hover:shadow-md hover:border-opacity-60",
              )}
              onClick={() => {
                setInput(prompt.text);
                textareaRef.current?.focus();
              }}
            >
              <Icon className={cn("w-5 h-5 shrink-0", prompt.color)} />
              <span className="text-sm text-foreground/90">{prompt.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="flex flex-col h-full bg-transparent">
      <ScrollArea ref={scrollRef} className="flex-1 px-4 md:px-8 py-6">
        {!conversationId && localMessages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {isConvLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            {localMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0 border overflow-hidden",
                    msg.role === "user"
                      ? "bg-secondary border-secondary-border"
                      : "bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(124,58,237,0.3)]",
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <img
                      src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/khalid.jpg`}
                      alt="KS"
                      className="w-full h-full object-cover object-top"
                    />
                  )}
                </div>
                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl max-w-[88%] leading-relaxed",
                    msg.role === "user"
                      ? "bg-secondary text-secondary-foreground rounded-tr-sm text-sm"
                      : "bg-card border border-border rounded-tl-sm text-card-foreground shadow-sm",
                  )}
                >
                  <MessageContent content={msg.content} role={msg.role} />
                </div>
              </div>
            ))}

            {isStreaming && streamingContent && (
              <div className="flex gap-3 flex-row">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border overflow-hidden border-primary/40 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                  <img
                    src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/khalid.jpg`}
                    alt="KS"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="px-4 py-3 rounded-2xl max-w-[88%] leading-relaxed bg-card border border-primary/30 rounded-tl-sm text-card-foreground shadow-[0_0_10px_rgba(124,58,237,0.1)]">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamingContent
                        .replace(/\[GENERATE_IMAGE:[^\]]+\]/g, "")
                        .replace(/```html[\s\S]*?```/g, "🌐 *جارٍ إنشاء الموقع...*")
                        .trim()}
                    </ReactMarkdown>
                  </div>
                  <span className="inline-block w-1.5 h-4 ms-1 bg-primary animate-pulse align-middle rounded-sm" />
                </div>
              </div>
            )}

            {isStreaming && !streamingContent && (
              <div className="flex gap-3 flex-row">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border overflow-hidden border-primary/40">
                  <img
                    src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/khalid.jpg`}
                    alt="KS"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-card border border-border rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {isRTL ? "يفكر خالد..." : "Khaled is thinking..."}
                  </span>
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
                <img
                  src={URL.createObjectURL(selectedImage.file)}
                  alt="Selected"
                  className="h-24 object-cover"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 bg-card border border-input rounded-3xl p-2 shadow-lg focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary transition-all"
          >
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageSelect}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
              title={isRTL ? "إرفاق صورة" : "Attach image"}
            >
              <ImageIcon className="w-5 h-5" />
            </Button>

            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("sendMessage")}
              className="min-h-[44px] max-h-48 resize-none border-0 focus-visible:ring-0 shadow-none bg-transparent p-3 text-base"
              rows={1}
              disabled={isStreaming}
            />

            <Button
              type="submit"
              size="icon"
              className="shrink-0 rounded-full h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.6)]"
              disabled={(!input.trim() && !selectedImage) || isStreaming}
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 rtl:-scale-x-100" />
              )}
            </Button>
          </form>

          <div className="text-center mt-2 text-xs text-muted-foreground">
            {t("aiDisclaimer")}
          </div>
        </div>
      </div>
    </div>
  );
}
