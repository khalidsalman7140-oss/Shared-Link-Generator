import { useState, useRef, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { 
  useGetGeminiConversation, 
  getGetGeminiConversationQueryKey,
  useCreateGeminiConversation
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Image as ImageIcon, Bot, User, Sparkles, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function Chat() {
  const searchString = useSearch();
  const queryParams = new URLSearchParams(searchString);
  const conversationIdParam = queryParams.get("id");
  const conversationId = conversationIdParam ? parseInt(conversationIdParam, 10) : null;

  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: conversation, isLoading: isConvLoading } = useGetGeminiConversation(conversationId || 0, {
    query: { 
      enabled: !!conversationId,
      queryKey: getGetGeminiConversationQueryKey(conversationId || 0)
    }
  });

  const createMutation = useCreateGeminiConversation();

  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<{ file: File; base64: string } | null>(null);
  const [localMessages, setLocalMessages] = useState<Array<{ id: number; role: string; content: string }>>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync server messages to local state
  useEffect(() => {
    if (conversation?.messages) {
      setLocalMessages(conversation.messages);
    } else if (!conversationId) {
      setLocalMessages([]);
    }
  }, [conversation?.messages, conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [localMessages, streamingContent]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        // Extract just the data part if it has the data:image prefix
        const base64Data = base64.split(',')[1] || base64;
        setSelectedImage({ file, base64: base64Data });
      } catch (error) {
        console.error("Error reading image:", error);
      }
    }
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const sendMessage = async (targetConvId: number, content: string) => {
    setIsStreaming(true);
    setStreamingContent("");
    
    // Add user message optimistically
    const tempUserMsgId = Date.now();
    setLocalMessages(prev => [...prev, { id: tempUserMsgId, role: "user", content }]);
    setInput("");
    setSelectedImage(null);

    try {
      const response = await fetch(`/api/gemini/conversations/${targetConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

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
              if (data.done) {
                // Stream complete
              } else if (data.content) {
                fullAssistantContent += data.content;
                setStreamingContent(fullAssistantContent);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }

      // After stream completes, invalidate queries to get the real messages from DB
      queryClient.invalidateQueries({ queryKey: getGetGeminiConversationQueryKey(targetConvId) });
    } catch (error) {
      console.error("Error streaming message:", error);
      // Add error message
      setLocalMessages(prev => [...prev, { 
        id: Date.now(), 
        role: "assistant", 
        content: "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى." 
      }]);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !selectedImage) return;
    if (isStreaming) return;

    let messageContent = input.trim();
    if (selectedImage) {
      messageContent += `\n[IMAGE:${selectedImage.base64}]`;
    }

    if (!conversationId) {
      // Create new conversation first
      createMutation.mutate(
        { data: { title: "محادثة جديدة" } },
        {
          onSuccess: (newConv) => {
            setLocation(`/?id=${newConv.id}`);
            sendMessage(newConv.id, messageContent);
          },
        }
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

  // Helper to strip image tags for display
  const displayContent = (content: string) => {
    return content.replace(/\[IMAGE:.*?\]/g, "[صورة مرفقة]").trim();
  };

  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto p-8 text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary),0.3)]">
        <Sparkles className="w-12 h-12 text-primary" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-glow">الوكيل الذكي لخالد سلمان</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          مساعدك الشخصي للخدمات الإبداعية والرقمية. كيف يمكنني مساعدتك اليوم؟
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-8 text-right">
        {[
          { title: "التصميم والإبداع", desc: "هوية بصرية، صور بالذكاء الاصطناعي، ديكور" },
          { title: "المحتوى الرقمي", desc: "فيديوهات، كتب إلكترونية، عروض تقديمية" },
          { title: "الخدمات الأكاديمية", desc: "مشاريع تخرج، عروض جامعية" },
          { title: "البرمجة والبيانات", desc: "تطبيقات وأنظمة، تحليل بيانات" },
        ].map((service, i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-accent/50 transition-colors cursor-pointer"
               onClick={() => {
                 setInput(`أريد معرفة المزيد عن قسم ${service.title}`);
                 if (fileInputRef.current) fileInputRef.current.focus();
               }}>
            <h3 className="font-semibold text-primary mb-1">{service.title}</h3>
            <p className="text-sm text-muted-foreground">{service.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-transparent">
      <ScrollArea ref={scrollRef} className="flex-1 px-4 md:px-8 py-6">
        {(!conversationId && localMessages.length === 0) ? (
          <WelcomeScreen />
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {localMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex gap-4",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                  msg.role === "user" 
                    ? "bg-secondary border-secondary-border" 
                    : "bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                )}>
                  {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                
                <div className={cn(
                  "px-5 py-4 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed",
                  msg.role === "user" 
                    ? "bg-secondary text-secondary-foreground rounded-tr-sm" 
                    : "bg-card border border-border rounded-tl-sm text-card-foreground shadow-sm"
                )}>
                  {displayContent(msg.content)}
                </div>
              </div>
            ))}
            
            {/* Streaming Message */}
            {isStreaming && streamingContent && (
              <div className="flex gap-4 flex-row">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="px-5 py-4 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed bg-card border border-primary/30 rounded-tl-sm text-card-foreground shadow-[0_0_10px_rgba(var(--primary),0.1)]">
                  {streamingContent}
                  <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />
                </div>
              </div>
            )}
            
            {/* Loading Indicator before stream starts */}
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
              <div className="relative rounded-lg overflow-hidden border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                {/* We render an actual img element using the raw file data via URL.createObjectURL for display, base64 for API */}
                <img 
                  src={URL.createObjectURL(selectedImage.file)} 
                  alt="Selected" 
                  className="h-24 object-cover"
                />
                <button 
                  onClick={removeImage}
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
              accept="image/*" 
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
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك هنا..."
              className="min-h-[44px] max-h-48 resize-none border-0 focus-visible:ring-0 shadow-none bg-transparent p-3 text-base"
              rows={1}
              disabled={isStreaming}
            />
            
            <Button 
              type="submit" 
              size="icon"
              className="shrink-0 rounded-full h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.6)]"
              disabled={(!input.trim() && !selectedImage) || isStreaming}
            >
              <Send className="w-4 h-4 rtl:-scale-x-100" />
            </Button>
          </form>
          <div className="text-center mt-2 text-xs text-muted-foreground">
            الذكاء الاصطناعي قد يخطئ أحياناً. يرجى التحقق من المعلومات المهمة.
          </div>
        </div>
      </div>
    </div>
  );
}
