import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { lang, isRTL } = useI18n();

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const standalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
    setIsIOS(ios);

    if (ios && !standalone && !localStorage.getItem("pwa-ios-dismissed")) {
      setTimeout(() => setShowBanner(true), 800);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!localStorage.getItem("pwa-dismissed")) {
        setTimeout(() => setShowBanner(true), 800);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) { setShowIOSGuide(true); return; }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") { setShowBanner(false); setDeferredPrompt(null); }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(isIOS ? "pwa-ios-dismissed" : "pwa-dismissed", "1");
  };

  if (!showBanner) return null;

  if (showIOSGuide) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto" dir={isRTL ? "rtl" : "ltr"}>
        <div className="bg-card border border-primary/40 rounded-2xl p-4 shadow-2xl shadow-primary/20">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-sm">{lang === "ar" ? "تنصيب على iPhone / iPad" : "Install on iPhone / iPad"}</h3>
            <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <ol className="space-y-2 text-xs text-muted-foreground">
            {[
              lang === "ar" ? 'اضغط على زر "مشاركة" ⬆️ في Safari' : 'Tap "Share" ⬆️ in Safari',
              lang === "ar" ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Select "Add to Home Screen"',
              lang === "ar" ? 'اضغط "إضافة" — التطبيق جاهز ✅' : 'Tap "Add" — Done ✅',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      <div className="relative bg-card border border-primary/40 rounded-2xl p-4 shadow-2xl shadow-primary/20">
        <button onClick={handleDismiss} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-bold text-sm">{lang === "ar" ? "نصِّب التطبيق مجاناً" : "Install App for Free"}</p>
            <p className="text-xs text-muted-foreground">{lang === "ar" ? "يفتح كتطبيق حقيقي بدون متصفح" : "Opens like a native app"}</p>
          </div>
        </div>
        <Button onClick={handleInstall} className="w-full gap-2 shadow-lg shadow-primary/30 text-sm">
          <Download className="w-4 h-4" />
          {lang === "ar" ? "تنصيب الآن" : "Install Now"}
        </Button>
      </div>
    </div>
  );
}
