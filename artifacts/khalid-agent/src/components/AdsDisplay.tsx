import { useState, useEffect, useCallback } from "react";
import { X, ExternalLink, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface Ad {
  id: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  sponsor: string;
}

const DEFAULT_ADS: Ad[] = [
  {
    id: -1,
    title: "مركز الأسطورة للدعاية والإعلان",
    description: "تصاميم احترافية، طباعة عالية الجودة، بمقاسات تناسب كل احتياجاتك",
    linkUrl: "https://wa.me/967783701365?text=أريد معرفة المزيد عن مركز الأسطورة",
    sponsor: "مركز الأسطورة",
  },
  {
    id: -2,
    title: "الوكيل الذكي يبني مهاراتك",
    description: "سجّل الآن واحصل على استشارة مجانية غير محدودة. نبني مهاراتك.. لنبني اليمن",
    linkUrl: "/sign-up",
    sponsor: "خالد سلمان",
  },
];

export function AdsDisplay({ className }: { className?: string }) {
  const { isRTL } = useI18n();
  const [ads, setAds] = useState<Ad[]>(DEFAULT_ADS);
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/ads").then(r => r.ok ? r.json() : null).then((data: Ad[] | null) => {
      if (data && data.length > 0) setAds([...data, ...DEFAULT_ADS]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (dismissed || ads.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % ads.length), 8000);
    return () => clearInterval(t);
  }, [ads.length, dismissed]);

  const handleClick = useCallback(async (ad: Ad) => {
    if (ad.id > 0) {
      try { await fetch(`/api/ads/${ad.id}/click`, { method: "POST" }); } catch {}
    }
    if (ad.linkUrl?.startsWith("/")) {
      window.location.href = ad.linkUrl;
    } else if (ad.linkUrl) {
      window.open(ad.linkUrl, "_blank", "noopener noreferrer");
    }
  }, []);

  if (dismissed) return null;

  const ad = ads[current];
  if (!ad) return null;

  return (
    <div dir={isRTL ? "rtl" : "ltr"}
      className={cn("relative group flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-gradient-to-r from-primary/5 to-yellow-500/5 border-primary/20 text-sm cursor-pointer hover:border-primary/40 transition-all", className)}
      onClick={() => handleClick(ad)}
    >
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Megaphone className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-foreground text-xs">{ad.title}</span>
        {ad.description && (
          <span className="text-muted-foreground text-[11px] block truncate">{ad.description}</span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-muted-foreground border border-border rounded-full px-1.5 py-0.5">{isRTL ? "إعلان" : "Ad"}</span>
        {ad.linkUrl && <ExternalLink className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />}
        <button onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {ads.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {ads.map((_, i) => (
            <div key={i} className={cn("w-1 h-1 rounded-full transition-all", i === current ? "bg-primary" : "bg-border")} />
          ))}
        </div>
      )}
    </div>
  );
}
