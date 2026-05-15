import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/react";
import {
  Image, Mic, BookOpen, Languages, Sparkles, Video,
  Key, Eye, EyeOff, CheckCircle, AlertCircle, Loader2,
  Search, Volume2, FileText, ChevronDown, X, Play, Download
} from "lucide-react";

type ServiceName = "stability" | "elevenlabs" | "deepl" | "claude" | "runway" | "luma";

const SERVICE_META: Record<ServiceName, { label: string; labelEn: string; color: string; url: string; docs: string }> = {
  stability: { label: "Stability AI", labelEn: "Stable Diffusion", color: "text-purple-400", url: "https://platform.stability.ai/account/keys", docs: "stability.ai" },
  elevenlabs: { label: "ElevenLabs", labelEn: "Text-to-Speech", color: "text-blue-400", url: "https://elevenlabs.io/app/settings/api-keys", docs: "elevenlabs.io" },
  deepl: { label: "DeepL", labelEn: "Professional Translation", color: "text-green-400", url: "https://www.deepl.com/account/summary", docs: "deepl.com" },
  claude: { label: "Claude (Anthropic)", labelEn: "AI Summarization", color: "text-orange-400", url: "https://console.anthropic.com/settings/keys", docs: "anthropic.com" },
  runway: { label: "Runway Gen-3", labelEn: "Image to Video", color: "text-pink-400", url: "https://app.runwayml.com/settings", docs: "runwayml.com" },
  luma: { label: "Luma Dream Machine", labelEn: "AI Video", color: "text-cyan-400", url: "https://lumalabs.ai/dream-machine/api/keys", docs: "lumalabs.ai" },
};

type TabId = "visual" | "knowledge" | "audio";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "visual", label: "الإنتاج المرئي", icon: <Image className="w-4 h-4" /> },
  { id: "knowledge", label: "المعرفة والكتب", icon: <BookOpen className="w-4 h-4" /> },
  { id: "audio", label: "الصوت والترجمة", icon: <Mic className="w-4 h-4" /> },
];

function useApiKeys() {
  const { getToken } = useAuth();
  const [keys, setKeys] = useState<Record<string, { configured: boolean; updatedAt: string }>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const resp = await fetch("/api/services/keys", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) setKeys(await resp.json());
    } catch {}
    setLoading(false);
  }, [getToken]);

  useEffect(() => { load(); }, [load]);

  const saveKey = async (service: ServiceName, key: string) => {
    const token = await getToken();
    const resp = await fetch(`/api/services/keys/${service}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (resp.ok) await load();
    return resp.ok;
  };

  const deleteKey = async (service: ServiceName) => {
    const token = await getToken();
    await fetch(`/api/services/keys/${service}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await load();
  };

  return { keys, loading, saveKey, deleteKey };
}

function KeyRow({ service, keys, saveKey, deleteKey }: {
  service: ServiceName;
  keys: Record<string, { configured: boolean }>;
  saveKey: (s: ServiceName, k: string) => Promise<boolean>;
  deleteKey: (s: ServiceName) => void;
}) {
  const meta = SERVICE_META[service];
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const configured = keys[service]?.configured ?? false;

  const handleSave = async () => {
    if (!val.trim()) return;
    setSaving(true);
    const success = await saveKey(service, val.trim());
    setSaving(false);
    if (success) { setOk(true); setEditing(false); setVal(""); setTimeout(() => setOk(false), 3000); }
  };

  return (
    <div className="bg-slate-800/50 border border-white/5 rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {configured
            ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
            : <Key className={`w-4 h-4 ${meta.color} shrink-0`} />}
          <div>
            <p className={`text-sm font-semibold ${meta.color}`}>{meta.label}</p>
            <p className="text-xs text-slate-500">{meta.labelEn}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {configured && !editing && (
            <button onClick={() => deleteKey(service)} className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded bg-red-500/10">
              حذف
            </button>
          )}
          <button
            onClick={() => setEditing(v => !v)}
            className="text-xs text-slate-300 hover:text-white transition-colors px-2 py-1 rounded bg-white/5 hover:bg-white/10"
          >
            {configured ? "تحديث" : "إضافة"}
          </button>
          <a href={meta.url} target="_blank" rel="noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded bg-blue-500/10">
            احصل على مفتاح ↗
          </a>
        </div>
      </div>

      {editing && (
        <div className="flex gap-2 mt-1">
          <div className="relative flex-1">
            <input
              type={show ? "text" : "password"}
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()}
              placeholder={`مفتاح ${meta.label}...`}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 pr-9 focus:outline-none focus:border-white/30"
              dir="ltr"
            />
            <button onClick={() => setShow(v => !v)} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !val.trim()}
            className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : ok ? <CheckCircle className="w-4 h-4" /> : "حفظ"}
          </button>
          <button onClick={() => { setEditing(false); setVal(""); }} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function VisualHub({ keys, authToken }: { keys: Record<string, { configured: boolean }>; authToken: () => Promise<string | null> }) {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [stylePreset, setStylePreset] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [videoProvider, setVideoProvider] = useState<"runway" | "luma">("runway");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoTask, setVideoTask] = useState<{ taskId: string; provider: string } | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError(null); setImageUrl(null);
    try {
      const token = await authToken();
      const resp = await fetch("/api/services/image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), aspectRatio, style: stylePreset || undefined }),
      });
      if (!resp.ok) {
        const data = await resp.json() as { error?: string; message?: string };
        setError(data.message ?? data.error ?? "فشل التوليد");
        return;
      }
      const blob = await resp.blob();
      setImageUrl(URL.createObjectURL(blob));
    } catch (e) { setError(String(e)); }
    setLoading(false);
  };

  const generateVideo = async () => {
    if (!videoPrompt.trim()) return;
    setVideoLoading(true); setVideoError(null); setVideoUrl(null); setVideoTask(null);
    try {
      const token = await authToken();
      const resp = await fetch("/api/services/video-gen", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ provider: videoProvider, prompt: videoPrompt.trim() }),
      });
      const data = await resp.json() as { taskId?: string; provider?: string; error?: string; message?: string };
      if (!resp.ok) { setVideoError(data.message ?? data.error ?? "فشل"); setVideoLoading(false); return; }
      if (data.taskId) {
        setVideoTask({ taskId: data.taskId, provider: data.provider ?? videoProvider });
        pollVideo(data.taskId, data.provider ?? videoProvider, token!);
      }
    } catch (e) { setVideoError(String(e)); setVideoLoading(false); }
  };

  const pollVideo = async (taskId: string, provider: string, token: string | null) => {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000));
      try {
        const t = token ?? await authToken();
        const resp = await fetch(`/api/services/video-gen/${taskId}?provider=${provider}`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        const data = await resp.json() as { status?: string; videoUrl?: string };
        if (data.videoUrl) { setVideoUrl(data.videoUrl); setVideoLoading(false); return; }
        if (data.status === "FAILED" || data.status === "failed") { setVideoError("فشل إنتاج الفيديو"); setVideoLoading(false); return; }
      } catch {}
    }
    setVideoError("انتهت مهلة الانتظار — حاول مجدداً"); setVideoLoading(false);
  };

  const stabilityConfigured = keys["stability"]?.configured;
  const runwayConfigured = keys["runway"]?.configured;
  const lumaConfigured = keys["luma"]?.configured;
  const videoConfigured = videoProvider === "runway" ? runwayConfigured : lumaConfigured;

  return (
    <div className="space-y-6">
      {/* Image Generation */}
      <div className="bg-slate-800/40 border border-purple-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white">توليد الصور — Stable Diffusion</h3>
          {!stabilityConfigured && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">يحتاج مفتاح Stability AI</span>
          )}
        </div>
        <div className="space-y-3">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="صف الصورة التي تريدها... مثال: صورة أنمي يابانية لمدينة يمنية قديمة عند الغروب بأسلوب فني رائع"
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 resize-none h-20 focus:outline-none focus:border-purple-500/50"
            dir="rtl"
          />
          <div className="flex gap-3 flex-wrap">
            <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              <option value="1:1">مربع 1:1</option>
              <option value="16:9">أفقي 16:9</option>
              <option value="9:16">عمودي 9:16</option>
              <option value="4:3">4:3</option>
              <option value="3:2">3:2</option>
            </select>
            <select value={stylePreset} onChange={e => setStylePreset(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              <option value="">بدون نمط</option>
              <option value="anime">أنمي</option>
              <option value="photographic">واقعي</option>
              <option value="digital-art">فن رقمي</option>
              <option value="oil-painting">لوحة زيتية</option>
              <option value="fantasy-art">خيالي</option>
              <option value="neon-punk">نيون بانك</option>
            </select>
            <button
              onClick={generateImage}
              disabled={loading || !stabilityConfigured || !prompt.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />جارٍ التوليد...</> : <><Sparkles className="w-4 h-4" />توليد الصورة</>}
            </button>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
        {imageUrl && (
          <div className="mt-4 relative">
            <img src={imageUrl} alt="Generated" className="w-full rounded-xl border border-white/10 max-h-96 object-contain" />
            <a href={imageUrl} download="ai-image.webp"
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-lg p-2 transition-colors">
              <Download className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* Video Generation */}
      <div className="bg-slate-800/40 border border-pink-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Video className="w-5 h-5 text-pink-400" />
          <h3 className="font-bold text-white">تحويل النص/الصورة إلى فيديو</h3>
          {!videoConfigured && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">يحتاج مفتاح</span>
          )}
        </div>
        <div className="flex gap-2 mb-3">
          {(["runway", "luma"] as const).map(p => (
            <button key={p} onClick={() => setVideoProvider(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${videoProvider === p ? 'bg-pink-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              {p === "runway" ? "Runway Gen-3" : "Luma Dream Machine"}
            </button>
          ))}
        </div>
        <textarea
          value={videoPrompt}
          onChange={e => setVideoPrompt(e.target.value)}
          placeholder="صف مشهد الفيديو... مثال: مدينة يمنية قديمة تتحول إلى مدينة مستقبلية بأضواء متلألئة"
          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 resize-none h-16 focus:outline-none focus:border-pink-500/50 mb-3"
          dir="rtl"
        />
        <button
          onClick={generateVideo}
          disabled={videoLoading || !videoConfigured || !videoPrompt.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
        >
          {videoLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" />{videoTask ? "جارٍ الإنتاج... قد يستغرق دقائق" : "إرسال الطلب..."}</>
            : <><Video className="w-4 h-4" />إنتاج الفيديو</>}
        </button>
        {videoError && <p className="mt-3 text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{videoError}</p>}
        {videoUrl && (
          <div className="mt-4">
            <video src={videoUrl} controls className="w-full rounded-xl border border-white/10 max-h-64" />
            <a href={videoUrl} download="ai-video.mp4"
              className="mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors">
              <Download className="w-4 h-4" />تحميل الفيديو
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function KnowledgeHub({ authToken }: { authToken: () => Promise<string | null> }) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<"both" | "google" | "openlibrary">("both");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{
    id: string; title: string; authors: string[]; description: string;
    thumbnail: string | null; year: string | null; source: string; link: string;
  }>>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [sumText, setSumText] = useState("");
  const [sumMode, setSumMode] = useState<"summary" | "bullets" | "insights">("summary");
  const [sumLang, setSumLang] = useState("ar");
  const [sumLoading, setSumLoading] = useState(false);
  const [sumResult, setSumResult] = useState("");
  const [sumModel, setSumModel] = useState("");

  const searchBooks = async () => {
    if (!query.trim()) return;
    setLoading(true); setSearchError(null); setResults([]);
    try {
      const token = await authToken();
      const resp = await fetch(`/api/services/books?q=${encodeURIComponent(query.trim())}&source=${source}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json() as { results?: typeof results; error?: string };
      if (resp.ok) setResults(data.results ?? []);
      else setSearchError(data.error ?? "فشل البحث");
    } catch (e) { setSearchError(String(e)); }
    setLoading(false);
  };

  const summarize = async () => {
    if (!sumText.trim()) return;
    setSumLoading(true); setSumResult(""); setSumModel("");
    const token = await authToken();
    const resp = await fetch("/api/services/summarize", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: sumText.trim(), lang: sumLang, mode: sumMode }),
    });
    if (!resp.body) { setSumLoading(false); return; }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const d = JSON.parse(line.slice(6)) as { content?: string; done?: boolean; model?: string };
          if (d.content) setSumResult(p => p + d.content);
          if (d.model) setSumModel(d.model);
        } catch {}
      }
    }
    setSumLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Book Search */}
      <div className="bg-slate-800/40 border border-blue-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-white">البحث في الكتب العالمية</h3>
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">مجاني</span>
        </div>
        <div className="flex gap-2 mb-3 flex-wrap">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && searchBooks()}
            placeholder="ابحث عن كتاب أو موضوع..."
            className="flex-1 min-w-48 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            dir="rtl"
          />
          <select value={source} onChange={e => setSource(e.target.value as typeof source)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
            <option value="both">الكل</option>
            <option value="google">Google Books</option>
            <option value="openlibrary">Open Library</option>
          </select>
          <button onClick={searchBooks} disabled={loading || !query.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-sm transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            بحث
          </button>
        </div>
        {searchError && <p className="text-sm text-red-400 mb-3">{searchError}</p>}
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {results.map(book => (
            <a key={book.id} href={book.link} target="_blank" rel="noreferrer"
              className="flex gap-3 bg-slate-900/60 border border-white/5 rounded-xl p-3 hover:border-blue-500/30 transition-colors">
              {book.thumbnail
                ? <img src={book.thumbnail} alt={book.title} className="w-12 h-16 object-cover rounded-lg shrink-0" />
                : <div className="w-12 h-16 bg-slate-700 rounded-lg flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5 text-slate-500" /></div>}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{book.title}</p>
                {book.authors.length > 0 && <p className="text-xs text-slate-400 truncate">{book.authors.join("، ")}</p>}
                {book.year && <p className="text-xs text-slate-500">{book.year}</p>}
                {book.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{book.description}</p>}
                <span className="text-xs text-blue-400 mt-1 inline-block">{book.source}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Smart Summarization */}
      <div className="bg-slate-800/40 border border-orange-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-orange-400" />
          <h3 className="font-bold text-white">التلخيص الذكي</h3>
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Gemini مجاني + Claude اختياري</span>
        </div>
        <textarea
          value={sumText}
          onChange={e => setSumText(e.target.value)}
          placeholder="الصق النص المراد تلخيصه هنا... (يدعم حتى 100,000 حرف)"
          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 resize-none h-32 focus:outline-none focus:border-orange-500/50 mb-3"
          dir="rtl"
        />
        <div className="flex gap-2 flex-wrap mb-3">
          {([["summary", "ملخص شامل"], ["bullets", "نقاط رئيسية"], ["insights", "رؤى وتحليلات"]] as const).map(([m, l]) => (
            <button key={m} onClick={() => setSumMode(m)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${sumMode === m ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              {l}
            </button>
          ))}
          <select value={sumLang} onChange={e => setSumLang(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none">
            <option value="ar">عربي</option>
            <option value="en">إنجليزي</option>
            <option value="fr">فرنسي</option>
          </select>
          <button onClick={summarize} disabled={sumLoading || !sumText.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-semibold text-sm transition-colors">
            {sumLoading ? <><Loader2 className="w-4 h-4 animate-spin" />جارٍ التلخيص...</> : <><Sparkles className="w-4 h-4" />تلخيص</>}
          </button>
        </div>
        {sumResult && (
          <div className="bg-slate-900/80 border border-white/5 rounded-xl p-4">
            {sumModel && <p className="text-xs text-slate-500 mb-2">المحرك: {sumModel}</p>}
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap" dir="rtl">{sumResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AudioHub({ keys, authToken }: { keys: Record<string, { configured: boolean }>; authToken: () => Promise<string | null> }) {
  const [ttsText, setTtsText] = useState("");
  const [voices, setVoices] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedVoice, setSelectedVoice] = useState("pNInz6obpgDQGcFmaJgB");
  const [ttsLoading, setTtsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [transText, setTransText] = useState("");
  const [targetLang, setTargetLang] = useState("EN");
  const [transLoading, setTransLoading] = useState(false);
  const [transResult, setTransResult] = useState("");
  const [transError, setTransError] = useState<string | null>(null);

  const elevenConfigured = keys["elevenlabs"]?.configured;
  const deeplConfigured = keys["deepl"]?.configured;

  useEffect(() => {
    if (!elevenConfigured) return;
    (async () => {
      try {
        const token = await authToken();
        const resp = await fetch("/api/services/tts/voices", { headers: { Authorization: `Bearer ${token}` } });
        if (resp.ok) {
          const data = await resp.json() as { voices: Array<{ id: string; name: string }> };
          setVoices(data.voices);
        }
      } catch {}
    })();
  }, [elevenConfigured]);

  const generateTTS = async () => {
    if (!ttsText.trim()) return;
    setTtsLoading(true); setTtsError(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    try {
      const token = await authToken();
      const resp = await fetch("/api/services/tts", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text: ttsText.trim(), voiceId: selectedVoice }),
      });
      if (!resp.ok) {
        const d = await resp.json() as { message?: string; error?: string };
        setTtsError(d.message ?? d.error ?? "فشل"); setTtsLoading(false); return;
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      if (audioRef.current) { audioRef.current.src = url; audioRef.current.play(); }
    } catch (e) { setTtsError(String(e)); }
    setTtsLoading(false);
  };

  const translate = async () => {
    if (!transText.trim()) return;
    setTransLoading(true); setTransError(null); setTransResult("");
    try {
      const token = await authToken();
      const resp = await fetch("/api/services/translate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text: transText.trim(), targetLang }),
      });
      const data = await resp.json() as { translatedText?: string; error?: string; message?: string };
      if (resp.ok) setTransResult(data.translatedText ?? "");
      else setTransError(data.message ?? data.error ?? "فشل");
    } catch (e) { setTransError(String(e)); }
    setTransLoading(false);
  };

  const LANGS = [
    { code: "EN", label: "الإنجليزية" }, { code: "AR", label: "العربية" },
    { code: "FR", label: "الفرنسية" }, { code: "DE", label: "الألمانية" },
    { code: "ES", label: "الإسبانية" }, { code: "JA", label: "اليابانية" },
    { code: "ZH", label: "الصينية" }, { code: "RU", label: "الروسية" },
    { code: "TR", label: "التركية" },
  ];

  return (
    <div className="space-y-6">
      {/* TTS */}
      <div className="bg-slate-800/40 border border-blue-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Volume2 className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-white">توليد الصوت — ElevenLabs</h3>
          {!elevenConfigured && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">يحتاج مفتاح ElevenLabs</span>
          )}
        </div>
        <textarea
          value={ttsText}
          onChange={e => setTtsText(e.target.value)}
          placeholder="اكتب النص المراد تحويله إلى صوت... يدعم العربية والإنجليزية وكل اللغات"
          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 resize-none h-24 focus:outline-none focus:border-blue-500/50 mb-3"
          dir="rtl"
        />
        <div className="flex gap-2 flex-wrap">
          {voices.length > 0 && (
            <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
              {voices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          )}
          <button onClick={generateTTS} disabled={ttsLoading || !elevenConfigured || !ttsText.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-sm transition-colors">
            {ttsLoading ? <><Loader2 className="w-4 h-4 animate-spin" />جارٍ التوليد...</> : <><Mic className="w-4 h-4" />توليد الصوت</>}
          </button>
        </div>
        {ttsError && <p className="mt-3 text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{ttsError}</p>}
        {audioUrl && (
          <div className="mt-4 flex items-center gap-3 bg-slate-900/60 rounded-xl p-3">
            <audio ref={audioRef} controls className="flex-1" src={audioUrl} />
            <a href={audioUrl} download="speech.mp3"
              className="shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
              <Download className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* Translation */}
      <div className="bg-slate-800/40 border border-green-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Languages className="w-5 h-5 text-green-400" />
          <h3 className="font-bold text-white">الترجمة الاحترافية — DeepL</h3>
          {!deeplConfigured && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">يحتاج مفتاح DeepL</span>
          )}
        </div>
        <textarea
          value={transText}
          onChange={e => setTransText(e.target.value)}
          placeholder="أدخل النص المراد ترجمته... يدعم النصوص الطبية والتقنية والعلمية"
          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 resize-none h-24 focus:outline-none focus:border-green-500/50 mb-3"
          dir="rtl"
        />
        <div className="flex gap-2 flex-wrap mb-3">
          <select value={targetLang} onChange={e => setTargetLang(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
            {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <button onClick={translate} disabled={transLoading || !deeplConfigured || !transText.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-semibold text-sm transition-colors">
            {transLoading ? <><Loader2 className="w-4 h-4 animate-spin" />جارٍ الترجمة...</> : <><Languages className="w-4 h-4" />ترجمة</>}
          </button>
        </div>
        {transError && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{transError}</p>}
        {transResult && (
          <div className="bg-slate-900/80 border border-white/5 rounded-xl p-4">
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{transResult}</p>
            <button onClick={() => navigator.clipboard.writeText(transResult)}
              className="mt-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
              نسخ الترجمة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HubPage() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("visual");
  const [showKeys, setShowKeys] = useState(false);
  const { keys, loading: keysLoading, saveKey, deleteKey } = useApiKeys();

  const authToken = useCallback(() => getToken(), [getToken]);

  if (keysLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
      </div>
    );
  }

  const configuredCount = Object.values(keys).filter(k => k.configured).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-7 h-7 text-orange-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-l from-orange-400 to-yellow-300 bg-clip-text text-transparent">
              مركز الخدمات المتقدمة
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            ربط حقيقي بمنصات عالمية — استخدم مفاتيحك الخاصة، لا تكاليف إضافية
          </p>
        </div>

        {/* API Keys Panel */}
        <div className="mb-6 border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowKeys(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-orange-400" />
              <span className="font-semibold text-sm">مفاتيح API الخاصة</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                configuredCount === 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {configuredCount}/6 مُضافة
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showKeys ? 'rotate-180' : ''}`} />
          </button>

          {showKeys && (
            <div className="p-4 space-y-2 bg-slate-900/40">
              <p className="text-xs text-slate-500 mb-3">
                مفاتيحك مشفرة بالكامل ولا تُشارك مع أي طرف. أنت تتحكم بتكاليف الاستخدام.
              </p>
              {(Object.keys(SERVICE_META) as ServiceName[]).map(service => (
                <KeyRow key={service} service={service} keys={keys} saveKey={saveKey} deleteKey={deleteKey} />
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-800/40 p-1 rounded-xl">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "visual" && <VisualHub keys={keys} authToken={authToken} />}
        {activeTab === "knowledge" && <KnowledgeHub authToken={authToken} />}
        {activeTab === "audio" && <AudioHub keys={keys} authToken={authToken} />}

        {/* أدوات AI مجانية خارجية */}
        <div className="mt-8 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 bg-slate-800/60">
            <h3 className="font-semibold text-sm text-orange-400">🌐 أدوات AI مجانية — فتح مباشر</h3>
            <p className="text-xs text-slate-400 mt-1">اضغط على أي أداة لفتحها مباشرة في تبويب جديد</p>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-900/40">
            {[
              { name: "Kimi AI", desc: "ذكاء اصطناعي مجاني سياق ضخم", url: "https://kimi.moonshot.cn", emoji: "🌙", color: "from-blue-600/20 to-cyan-600/20 border-blue-500/30" },
              { name: "Qwen (قوين)", desc: "AI مجاني من علي بابا", url: "https://chat.qwenlm.ai", emoji: "🔮", color: "from-purple-600/20 to-pink-600/20 border-purple-500/30" },
              { name: "Gamma مواقع", desc: "إنشاء مواقع وعروض بالذكاء", url: "https://gamma.app", emoji: "⚡", color: "from-emerald-600/20 to-teal-600/20 border-emerald-500/30" },
              { name: "Pollinations", desc: "توليد صور مجانياً بدون قيود", url: "https://pollinations.ai", emoji: "🎨", color: "from-rose-600/20 to-orange-600/20 border-rose-500/30" },
              { name: "Claude AI", desc: "ذكاء اصطناعي من Anthropic مجاني", url: "https://claude.ai", emoji: "🧠", color: "from-amber-600/20 to-yellow-600/20 border-amber-500/30" },
              { name: "Pika مجاني", desc: "توليد فيديو بالذكاء الاصطناعي", url: "https://pika.art", emoji: "🎬", color: "from-violet-600/20 to-indigo-600/20 border-violet-500/30" },
            ].map(tool => (
              <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer"
                className={`flex flex-col gap-1.5 p-3.5 rounded-xl bg-gradient-to-br border cursor-pointer hover:opacity-90 transition-opacity ${tool.color}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{tool.emoji}</span>
                  <span className="font-semibold text-sm text-white">{tool.name}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">{tool.desc}</p>
                <span className="text-[10px] text-orange-400 mt-1">فتح ←</span>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-4 p-4 bg-slate-800/30 border border-white/5 rounded-xl text-center">
          <p className="text-xs text-slate-500">
            💡 كل الأدوات المذكورة أعلاه مجانية 100% — لا تحتاج بطاقة ائتمان.
          </p>
        </div>
      </div>
    </div>
  );
}
