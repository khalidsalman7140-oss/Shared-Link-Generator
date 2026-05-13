import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft, ArrowRight, Sparkles, Brain, Clock, Monitor,
  Target, CheckCircle2, Loader2, ChevronRight, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  questionAr: string;
  questionEn: string;
  type: "choice" | "multi" | "text";
  options?: { labelAr: string; labelEn: string; value: string; icon?: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "passion",
    questionAr: "ما الذي تحبه وتشعر بالحماس تجاهه؟",
    questionEn: "What are you passionate about?",
    type: "multi",
    options: [
      { labelAr: "التصميم والفن", labelEn: "Design & Art", value: "design", icon: "🎨" },
      { labelAr: "البرمجة والتقنية", labelEn: "Programming & Tech", value: "coding", icon: "💻" },
      { labelAr: "التسويق والمبيعات", labelEn: "Marketing & Sales", value: "marketing", icon: "📢" },
      { labelAr: "الكتابة والمحتوى", labelEn: "Writing & Content", value: "content", icon: "✍️" },
      { labelAr: "الإدارة والأعمال", labelEn: "Business & Management", value: "business", icon: "📊" },
      { labelAr: "التعليم والتدريب", labelEn: "Education & Training", value: "education", icon: "📚" },
      { labelAr: "الترجمة واللغات", labelEn: "Translation & Languages", value: "languages", icon: "🌐" },
      { labelAr: "الصوت والموسيقى", labelEn: "Audio & Music", value: "audio", icon: "🎵" },
    ],
  },
  {
    id: "skills",
    questionAr: "ما مهاراتك الحالية؟",
    questionEn: "What are your current skills?",
    type: "multi",
    options: [
      { labelAr: "لا توجد مهارات تقنية بعد", labelEn: "No technical skills yet", value: "beginner", icon: "🌱" },
      { labelAr: "أستخدم المحمول جيداً", labelEn: "Good smartphone user", value: "mobile", icon: "📱" },
      { labelAr: "أعرف برامج أوفيس", labelEn: "Know Office programs", value: "office", icon: "📄" },
      { labelAr: "أجيد التصميم (Canva/PS)", labelEn: "Know design (Canva/PS)", value: "design_skill", icon: "🎭" },
      { labelAr: "أعرف برمجة بسيطة", labelEn: "Basic programming", value: "basic_code", icon: "⌨️" },
      { labelAr: "خبرة في إدارة السوشيال ميديا", labelEn: "Social media management", value: "social", icon: "📲" },
    ],
  },
  {
    id: "hours",
    questionAr: "كم ساعة يومياً تستطيع التفرغ للتعلم والعمل؟",
    questionEn: "How many hours per day can you dedicate to learning and working?",
    type: "choice",
    options: [
      { labelAr: "أقل من ساعة", labelEn: "Less than 1 hour", value: "0.5", icon: "⏰" },
      { labelAr: "1-2 ساعة", labelEn: "1-2 hours", value: "1.5", icon: "⏱️" },
      { labelAr: "3-4 ساعات", labelEn: "3-4 hours", value: "3.5", icon: "🕐" },
      { labelAr: "أكثر من 4 ساعات", labelEn: "More than 4 hours", value: "5", icon: "🚀" },
    ],
  },
  {
    id: "device",
    questionAr: "ما هو جهازك الحالي؟",
    questionEn: "What device do you currently have?",
    type: "choice",
    options: [
      { labelAr: "موبايل فقط", labelEn: "Mobile only", value: "mobile_only", icon: "📱" },
      { labelAr: "كمبيوتر قديم أو ضعيف", labelEn: "Old/weak computer", value: "old_pc", icon: "💾" },
      { labelAr: "كمبيوتر عادي", labelEn: "Regular computer", value: "normal_pc", icon: "🖥️" },
      { labelAr: "كمبيوتر جيد / لابتوب حديث", labelEn: "Good PC / Modern laptop", value: "good_pc", icon: "⚡" },
    ],
  },
  {
    id: "goal",
    questionAr: "ما هدفك الأساسي؟",
    questionEn: "What is your main goal?",
    type: "choice",
    options: [
      { labelAr: "دخل إضافي من اليمن", labelEn: "Extra income from Yemen", value: "extra_income", icon: "💰" },
      { labelAr: "العمل الحر محلياً", labelEn: "Local freelancing", value: "local_freelance", icon: "🏠" },
      { labelAr: "العمل الحر دولياً (Upwork/خمسات)", labelEn: "International freelancing", value: "intl_freelance", icon: "🌍" },
      { labelAr: "بناء مشروع / شركة", labelEn: "Build a project/company", value: "startup", icon: "🏗️" },
      { labelAr: "الحصول على وظيفة تقنية", labelEn: "Get a tech job", value: "job", icon: "💼" },
    ],
  },
  {
    id: "challenge",
    questionAr: "ما أكبر تحدٍ تواجهه الآن؟",
    questionEn: "What is your biggest current challenge?",
    type: "choice",
    options: [
      { labelAr: "لا أعرف من أين أبدأ", labelEn: "Don't know where to start", value: "start", icon: "❓" },
      { labelAr: "الانترنت بطيء أو مكلف", labelEn: "Slow/expensive internet", value: "internet", icon: "🌐" },
      { labelAr: "محتاج لدخل سريع", labelEn: "Need quick income", value: "quick_money", icon: "⚡" },
      { labelAr: "التسويق والعثور على زبائن", labelEn: "Marketing & finding clients", value: "clients", icon: "🎯" },
      { labelAr: "الثقة بالنفس والمهارات", labelEn: "Self-confidence & skills", value: "confidence", icon: "💪" },
    ],
  },
];

interface CareerPath {
  title: string;
  titleEn: string;
  desc: string;
  descEn: string;
  timeToIncome: string;
  timeToIncomeEn: string;
  firstStep: string;
  firstStepEn: string;
  tools: string[];
  platforms: string[];
  color: string;
  icon: string;
}

function generateCareerPath(answers: Record<string, string | string[]>): CareerPath {
  const passion = answers.passion as string[] ?? [];
  const device = answers.device as string;
  const goal = answers.goal as string;
  const challenge = answers.challenge as string;

  if (passion.includes("design") || passion.includes("design_skill")) {
    return {
      title: "مصمم جرافيك وهوية بصرية",
      titleEn: "Graphic Designer & Visual Identity",
      desc: "مسار مثالي لك! اليمن يحتاج مصممين جيدين. ابدأ بـCanva ثم تطور لـPhotoshop وIllustrator.",
      descEn: "Perfect path! Yemen needs good designers. Start with Canva then advance to Photoshop.",
      timeToIncome: "2-4 أسابيع للعمل الأول",
      timeToIncomeEn: "2-4 weeks to first job",
      firstStep: "افتح حساب Canva Pro وصمم 5 نماذج احترافية وأرسلها لمراكز الإعلان",
      firstStepEn: "Open Canva Pro, design 5 professional samples, send to advertising centers",
      tools: ["Canva", "Photoshop", "Illustrator", "Adobe Express"],
      platforms: ["خمسات", "مستقل", "Instagram", "مراكز الإعلان المحلية"],
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
      icon: "🎨",
    };
  }

  if (passion.includes("coding") || passion.includes("basic_code")) {
    return {
      title: "مطور مواقع ويب",
      titleEn: "Web Developer",
      desc: "الطلب على المطورين ضخم محلياً ودولياً. ابدأ بـHTML وCSS وJavaScript.",
      descEn: "Huge demand locally and internationally. Start with HTML, CSS, JavaScript.",
      timeToIncome: "2-3 أشهر للمشروع الأول",
      timeToIncomeEn: "2-3 months to first project",
      firstStep: "تعلم HTML وCSS على YouTube (30 يوم) ثم ابنِ موقعاً بسيطاً لمحل قريب منك",
      firstStepEn: "Learn HTML/CSS on YouTube (30 days), then build a simple site for a nearby shop",
      tools: ["VS Code", "HTML/CSS", "JavaScript", "React"],
      platforms: ["Upwork", "خمسات", "مستقل", "GitHub"],
      color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
      icon: "💻",
    };
  }

  if (passion.includes("content") || passion.includes("marketing")) {
    return {
      title: "مدير محتوى رقمي وسوشيال ميديا",
      titleEn: "Digital Content & Social Media Manager",
      desc: "المحتوى العربي مطلوب جداً. يمكنك العمل من الموبايل فقط في البداية.",
      descEn: "Arabic content is in high demand. You can start from mobile only.",
      timeToIncome: "1-2 أسبوع للعمل الأول",
      timeToIncomeEn: "1-2 weeks to first job",
      firstStep: "أنشئ حساب TikTok وابدأ بنشر 3 فيديوهات تعليمية في مجالك كل أسبوع",
      firstStepEn: "Create TikTok account and post 3 educational videos weekly in your field",
      tools: ["CapCut", "Canva", "ChatGPT", "Buffer"],
      platforms: ["خمسات", "مستقل", "TikTok", "Instagram"],
      color: "from-orange-500/20 to-yellow-500/20 border-orange-500/30",
      icon: "📢",
    };
  }

  if (passion.includes("languages") || goal === "intl_freelance") {
    return {
      title: "مترجم ومنشئ محتوى متعدد اللغات",
      titleEn: "Translator & Multilingual Content Creator",
      desc: "اللغة العربية ميزة نادرة دولياً. الترجمة من أسرع المسارات لدخل دولار حقيقي.",
      descEn: "Arabic is a rare skill internationally. Translation is one of the fastest paths to real dollar income.",
      timeToIncome: "أسبوع واحد للمشروع الأول",
      timeToIncomeEn: "1 week to first project",
      firstStep: "سجّل في Upwork وأنشئ ملفاً شخصياً لترجمة عربي-إنجليزي مع نموذجين ترجمة",
      firstStepEn: "Register on Upwork, create an Arabic-English translation profile with 2 samples",
      tools: ["DeepL", "Grammarly", "Notion", "Google Docs"],
      platforms: ["Upwork", "Fiverr", "ProZ", "خمسات"],
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
      icon: "🌐",
    };
  }

  return {
    title: "مستشار أعمال رقمية محلي",
    titleEn: "Local Digital Business Consultant",
    desc: "اليمن يحتاج أشخاصاً يربطون الأعمال التقليدية بالعالم الرقمي. هذا الدور ذهبي الآن.",
    descEn: "Yemen needs people connecting traditional businesses to the digital world.",
    timeToIncome: "2-3 أسابيع",
    timeToIncomeEn: "2-3 weeks",
    firstStep: "اختر 5 محلات قريبة منك وعرض عليهم إنشاء صفحة واتساب بيزنس مجاناً ثم تحصيل أجر شهري",
    firstStepEn: "Choose 5 nearby shops, offer to set up WhatsApp Business free, then charge monthly",
    tools: ["WhatsApp Business", "Canva", "Google Business", "Facebook"],
    platforms: ["مجموعات واتساب المحلية", "Facebook محلي", "تيليغرام"],
    color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
    icon: "🏗️",
  };
}

export default function CareerMapPage() {
  const { lang, isRTL } = useI18n();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [result, setResult] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(false);

  const currentQ = QUESTIONS[step];

  const handleAnswer = (value: string) => {
    if (!currentQ) return;
    if (currentQ.type === "multi") {
      const current = (answers[currentQ.id] as string[]) ?? [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setAnswers(prev => ({ ...prev, [currentQ.id]: updated }));
    } else {
      setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
    }
  };

  const isAnswered = (value: string) => {
    if (!currentQ) return false;
    const ans = answers[currentQ.id];
    if (Array.isArray(ans)) return ans.includes(value);
    return ans === value;
  };

  const canProceed = () => {
    if (!currentQ) return false;
    const ans = answers[currentQ.id];
    if (currentQ.type === "multi") return Array.isArray(ans) && ans.length > 0;
    return !!ans;
  };

  const handleNext = async () => {
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      setLoading(true);
      await new Promise(r => setTimeout(r, 1500));
      setResult(generateCareerPath(answers));
      setLoading(false);
    }
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.1) 0%, transparent 60%), hsl(240 10% 4%)" }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4 rtl:-scale-x-100" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              {lang === "ar" ? "بوصلة الشغف والمهنة" : "Career Compass"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {lang === "ar" ? "اكتشف مسارك المهني المثالي" : "Discover your ideal career path"}
            </p>
          </div>
        </div>

        {!result ? (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  {lang === "ar" ? `سؤال ${step + 1} من ${QUESTIONS.length}` : `Question ${step + 1} of ${QUESTIONS.length}`}
                </span>
                <span className="text-xs text-primary font-medium">{Math.round(((step + 1) / QUESTIONS.length) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                <p className="text-muted-foreground">
                  {lang === "ar" ? "الوكيل الذكي يحلل إجاباتك ويرسم مسارك..." : "AI Agent is analyzing your answers..."}
                </p>
              </div>
            ) : currentQ ? (
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <p className="text-lg font-bold mb-5">
                    {lang === "ar" ? currentQ.questionAr : currentQ.questionEn}
                  </p>
                  {currentQ.type === "multi" && (
                    <p className="text-xs text-muted-foreground mb-4">
                      {lang === "ar" ? "يمكنك اختيار أكثر من خيار" : "You can select multiple options"}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {currentQ.options?.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(opt.value)}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl border text-right transition-all text-sm",
                          isAnswered(opt.value)
                            ? "bg-primary/20 border-primary/60 text-primary"
                            : "bg-background border-border hover:border-primary/30 hover:bg-primary/5",
                        )}
                      >
                        <span className="text-xl shrink-0">{opt.icon}</span>
                        <span className="font-medium">{lang === "ar" ? opt.labelAr : opt.labelEn}</span>
                        {isAnswered(opt.value) && <CheckCircle2 className="w-4 h-4 mr-auto shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  {step > 0 && (
                    <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-1">
                      <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" />
                      {lang === "ar" ? "السابق" : "Back"}
                    </Button>
                  )}
                  <Button className="flex-1 gap-2 shadow-lg shadow-primary/20" onClick={handleNext} disabled={!canProceed()}>
                    {step === QUESTIONS.length - 1
                      ? (lang === "ar" ? "🎯 اكتشف مساري المهني" : "🎯 Discover My Path")
                      : (lang === "ar" ? "التالي" : "Next")}
                    <ChevronRight className="w-4 h-4 rtl:-scale-x-100" />
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="space-y-5 animate-in fade-in zoom-in duration-500">
            <div className={cn("rounded-2xl border bg-gradient-to-br p-6", result.color)}>
              <div className="flex items-start gap-4 mb-4">
                <span className="text-5xl">{result.icon}</span>
                <div>
                  <h2 className="text-xl font-bold">{lang === "ar" ? result.title : result.titleEn}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{lang === "ar" ? result.desc : result.descEn}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-primary font-medium">{lang === "ar" ? result.timeToIncome : result.timeToIncomeEn}</span>
              </div>
            </div>

            <div className="bg-card border border-primary/30 rounded-2xl p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                {lang === "ar" ? "خطوتك الأولى الآن" : "Your First Step Now"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {lang === "ar" ? result.firstStep : result.firstStepEn}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wide">
                  {lang === "ar" ? "الأدوات المطلوبة" : "Required Tools"}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.tools.map(t => (
                    <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wide">
                  {lang === "ar" ? "منصات العمل" : "Work Platforms"}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.platforms.map(p => (
                    <span key={p} className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full">{p}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-sm text-yellow-400 font-medium mb-1">
                {lang === "ar" ? "💡 نصيحة من الوكيل الذكي" : "💡 AI Agent Tip"}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "ar"
                  ? "تحدث مع الوكيل الذكي في الدردشة لتفصيل خطة عمل أسبوعية مخصصة لك تماماً. الدردشة مجانية وغير محدودة!"
                  : "Chat with the AI Agent to get a fully customized weekly action plan. Chat is free and unlimited!"}
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/chat" className="flex-1">
                <Button className="w-full gap-2 shadow-lg shadow-primary/20">
                  <Sparkles className="w-4 h-4" />
                  {lang === "ar" ? "ابدأ محادثة مع الوكيل" : "Start Chat with Agent"}
                </Button>
              </Link>
              <Button variant="outline" onClick={() => { setResult(null); setStep(0); setAnswers({}); }}>
                <Zap className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
