import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, VolumeX, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

type VoiceGender = "male" | "female";

interface VoiceButtonProps {
  text: string;
  className?: string;
  size?: "sm" | "xs";
}

function pickVoice(voices: SpeechSynthesisVoice[], gender: VoiceGender, lang: string): SpeechSynthesisVoice | undefined {
  const ar = voices.filter(v => v.lang.startsWith("ar"));
  if (ar.length > 0) {
    if (gender === "female") return ar.find(v => /female|woman|فاطمة|زينب/i.test(v.name)) ?? ar[1] ?? ar[0];
    return ar.find(v => /male|man|محمد|علي/i.test(v.name)) ?? ar[0];
  }
  return voices[0];
}

export function VoiceButton({ text, className, size = "sm" }: VoiceButtonProps) {
  const { isRTL } = useI18n();
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [gender, setGender] = useState<VoiceGender>(() => (localStorage.getItem("ks_voice_gender") as VoiceGender) ?? "male");
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const speak = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const clean = text.replace(/[#*_`~\[\]()]/g, " ").replace(/\s+/g, " ").trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "ar-YE";
    utterance.rate = 0.95;
    utterance.pitch = gender === "female" ? 1.3 : 0.85;
    const voice = pickVoice(voices, gender, "ar");
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utterRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [speaking, text, voices, gender]);

  const toggleGender = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const next: VoiceGender = gender === "male" ? "female" : "male";
    setGender(next);
    localStorage.setItem("ks_voice_gender", next);
  }, [gender]);

  if (!("speechSynthesis" in window)) return null;

  const btnSize = size === "xs" ? "w-6 h-6" : "w-7 h-7";
  const iconSize = size === "xs" ? "w-3 h-3" : "w-3.5 h-3.5";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button onClick={speak} title={isRTL ? (speaking ? "إيقاف" : "استمع") : (speaking ? "Stop" : "Listen")}
        className={cn("rounded-full flex items-center justify-center transition-all border", btnSize,
          speaking ? "bg-primary/30 border-primary/60 text-primary animate-pulse" : "bg-white/5 border-white/15 text-muted-foreground hover:text-foreground hover:bg-white/10")}>
        {speaking ? <VolumeX className={iconSize} /> : <Volume2 className={iconSize} />}
      </button>
      <button onClick={toggleGender} title={isRTL ? (gender === "male" ? "تحويل لصوت أنثى" : "تحويل لصوت ذكر") : (gender === "male" ? "Switch to female" : "Switch to male")}
        className={cn("rounded-full flex items-center justify-center transition-all border text-[9px] font-bold", btnSize, "bg-white/5 border-white/15 text-muted-foreground hover:text-foreground hover:bg-white/10")}>
        {gender === "male" ? "♂" : "♀"}
      </button>
    </div>
  );
}

export function GlobalVoiceToggle() {
  const { isRTL } = useI18n();
  const [enabled, setEnabled] = useState(() => localStorage.getItem("ks_voice_enabled") === "true");

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem("ks_voice_enabled", String(next));
    if (!next) window.speechSynthesis.cancel();
  };

  return (
    <button onClick={toggle} title={isRTL ? (enabled ? "تعطيل الصوت" : "تفعيل الصوت") : (enabled ? "Disable voice" : "Enable voice")}
      className={cn("w-8 h-8 rounded-full flex items-center justify-center border transition-all",
        enabled ? "bg-primary/20 border-primary/50 text-primary" : "bg-white/5 border-white/15 text-muted-foreground hover:text-foreground")}>
      {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
    </button>
  );
}

export function useAutoSpeak(text: string | null) {
  const voiceEnabled = localStorage.getItem("ks_voice_enabled") === "true";
  useEffect(() => {
    if (!voiceEnabled || !text || !("speechSynthesis" in window)) return;
    const clean = text.replace(/[#*_`~\[\]()]/g, " ").replace(/\s+/g, " ").trim().slice(0, 600);
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = "ar-YE";
    const gender = (localStorage.getItem("ks_voice_gender") as VoiceGender) ?? "male";
    utter.pitch = gender === "female" ? 1.3 : 0.85;
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
    return () => window.speechSynthesis.cancel();
  }, [text, voiceEnabled]);
}
