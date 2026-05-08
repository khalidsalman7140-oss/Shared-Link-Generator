import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "ar" | "en" | "fr" | "tr" | "es";

const translations: Record<Lang, Record<string, string>> = {
  ar: {
    appName: "الوكيل الذكي لخالد سلمان",
    tagline: "مساعدك الشخصي للخدمات الإبداعية والرقمية",
    newChat: "محادثة جديدة",
    services: "الخدمات",
    pricing: "الاشتراكات",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    signOut: "تسجيل الخروج",
    contact: "تواصل معي",
    sendMessage: "اكتب رسالتك هنا...",
    copyright: "© 2025 خالد سلمان. جميع الحقوق محفوظة.",
    upgradeNow: "ترقية الاشتراك",
    freePlan: "الخطة المجانية",
    weeklyPlan: "الخطة الأسبوعية",
    monthlyPlan: "الخطة الشهرية",
    annualPlan: "الخطة السنوية",
    perWeek: "/ أسبوع",
    perMonth: "/ شهر",
    perYear: "/ سنة",
    free: "مجاني",
    contactToSubscribe: "تواصل للاشتراك",
    startFree: "ابدأ مجاناً",
    noConversations: "لا توجد محادثات سابقة",
    loading: "جاري التحميل...",
    aiDisclaimer: "الذكاء الاصطناعي قد يخطئ أحياناً. يرجى التحقق من المعلومات المهمة.",
    heroTitle: "الوكيل الذكي لخالد سلمان",
    heroSubtitle: "مساعدك الشخصي للخدمات الإبداعية والرقمية والأكاديمية",
    featuresTitle: "ما يمكنني مساعدتك به",
    planFreeDesc: "5 رسائل يومياً",
    planWeeklyDesc: "رسائل غير محدودة + تحليل الصور",
    planMonthlyDesc: "كل مميزات الأسبوعي + توليد الصور + أولوية الاستجابة",
    planAnnualDesc: "كل المميزات + دعم مباشر من خالد + استشارات مخصصة",
    pricingTitle: "خطط الاشتراك",
    pricingSubtitle: "اختر الخطة المناسبة لاحتياجاتك",
    popular: "الأكثر شعبية",
    save: "وفّر 33٪",
    language: "اللغة",
  },
  en: {
    appName: "Khaled Salman AI Agent",
    tagline: "Your personal assistant for creative and digital services",
    newChat: "New Chat",
    services: "Services",
    pricing: "Pricing",
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    contact: "Contact",
    sendMessage: "Write your message here...",
    copyright: "© 2025 Khaled Salman. All rights reserved.",
    upgradeNow: "Upgrade Plan",
    freePlan: "Free Plan",
    weeklyPlan: "Weekly Plan",
    monthlyPlan: "Monthly Plan",
    annualPlan: "Annual Plan",
    perWeek: "/ week",
    perMonth: "/ month",
    perYear: "/ year",
    free: "Free",
    contactToSubscribe: "Contact to Subscribe",
    startFree: "Start Free",
    noConversations: "No previous conversations",
    loading: "Loading...",
    aiDisclaimer: "AI may occasionally make mistakes. Please verify important information.",
    heroTitle: "Khaled Salman AI Agent",
    heroSubtitle: "Your personal assistant for creative, digital, and academic services",
    featuresTitle: "What I can help you with",
    planFreeDesc: "5 messages per day",
    planWeeklyDesc: "Unlimited messages + image analysis",
    planMonthlyDesc: "All weekly features + image generation + priority response",
    planAnnualDesc: "All features + direct support from Khaled + custom consultations",
    pricingTitle: "Subscription Plans",
    pricingSubtitle: "Choose the right plan for your needs",
    popular: "Most Popular",
    save: "Save 33%",
    language: "Language",
  },
  fr: {
    appName: "Agent IA de Khaled Salman",
    tagline: "Votre assistant personnel pour les services créatifs et numériques",
    newChat: "Nouveau Chat",
    services: "Services",
    pricing: "Abonnements",
    signIn: "Se connecter",
    signUp: "S'inscrire",
    signOut: "Se déconnecter",
    contact: "Contact",
    sendMessage: "Écrivez votre message ici...",
    copyright: "© 2025 Khaled Salman. Tous droits réservés.",
    upgradeNow: "Améliorer",
    freePlan: "Plan gratuit",
    weeklyPlan: "Plan hebdomadaire",
    monthlyPlan: "Plan mensuel",
    annualPlan: "Plan annuel",
    perWeek: "/ semaine",
    perMonth: "/ mois",
    perYear: "/ an",
    free: "Gratuit",
    contactToSubscribe: "Contacter pour s'abonner",
    startFree: "Commencer gratuitement",
    noConversations: "Pas de conversations précédentes",
    loading: "Chargement...",
    aiDisclaimer: "L'IA peut parfois se tromper. Veuillez vérifier les informations importantes.",
    heroTitle: "Agent IA de Khaled Salman",
    heroSubtitle: "Votre assistant personnel pour les services créatifs, numériques et académiques",
    featuresTitle: "Ce que je peux faire pour vous",
    planFreeDesc: "5 messages par jour",
    planWeeklyDesc: "Messages illimités + analyse d'images",
    planMonthlyDesc: "Tout hebdomadaire + génération d'images + priorité",
    planAnnualDesc: "Toutes les fonctionnalités + support direct + consultations",
    pricingTitle: "Plans d'abonnement",
    pricingSubtitle: "Choisissez le plan adapté à vos besoins",
    popular: "Le plus populaire",
    save: "Économisez 33%",
    language: "Langue",
  },
  tr: {
    appName: "Khaled Salman AI Asistanı",
    tagline: "Yaratıcı ve dijital hizmetler için kişisel asistanınız",
    newChat: "Yeni Sohbet",
    services: "Hizmetler",
    pricing: "Abonelikler",
    signIn: "Giriş Yap",
    signUp: "Kaydol",
    signOut: "Çıkış Yap",
    contact: "İletişim",
    sendMessage: "Mesajınızı buraya yazın...",
    copyright: "© 2025 Khaled Salman. Tüm hakları saklıdır.",
    upgradeNow: "Planı Yükselt",
    freePlan: "Ücretsiz Plan",
    weeklyPlan: "Haftalık Plan",
    monthlyPlan: "Aylık Plan",
    annualPlan: "Yıllık Plan",
    perWeek: "/ hafta",
    perMonth: "/ ay",
    perYear: "/ yıl",
    free: "Ücretsiz",
    contactToSubscribe: "Abone Olmak İçin İletişim",
    startFree: "Ücretsiz Başla",
    noConversations: "Önceki konuşma yok",
    loading: "Yükleniyor...",
    aiDisclaimer: "Yapay zeka zaman zaman hata yapabilir. Önemli bilgileri doğrulayın.",
    heroTitle: "Khaled Salman AI Asistanı",
    heroSubtitle: "Yaratıcı, dijital ve akademik hizmetler için kişisel asistanınız",
    featuresTitle: "Size yardımcı olabileceğim konular",
    planFreeDesc: "Günde 5 mesaj",
    planWeeklyDesc: "Sınırsız mesaj + görüntü analizi",
    planMonthlyDesc: "Haftalık + görüntü oluşturma + öncelik",
    planAnnualDesc: "Tüm özellikler + doğrudan destek + özel danışmanlık",
    pricingTitle: "Abonelik Planları",
    pricingSubtitle: "İhtiyaçlarınıza uygun planı seçin",
    popular: "En Popüler",
    save: "%33 Tasarruf",
    language: "Dil",
  },
  es: {
    appName: "Agente IA de Khaled Salman",
    tagline: "Tu asistente personal para servicios creativos y digitales",
    newChat: "Nuevo Chat",
    services: "Servicios",
    pricing: "Suscripciones",
    signIn: "Iniciar sesión",
    signUp: "Registrarse",
    signOut: "Cerrar sesión",
    contact: "Contacto",
    sendMessage: "Escribe tu mensaje aquí...",
    copyright: "© 2025 Khaled Salman. Todos los derechos reservados.",
    upgradeNow: "Mejorar plan",
    freePlan: "Plan gratuito",
    weeklyPlan: "Plan semanal",
    monthlyPlan: "Plan mensual",
    annualPlan: "Plan anual",
    perWeek: "/ semana",
    perMonth: "/ mes",
    perYear: "/ año",
    free: "Gratis",
    contactToSubscribe: "Contactar para suscribirse",
    startFree: "Empezar gratis",
    noConversations: "Sin conversaciones previas",
    loading: "Cargando...",
    aiDisclaimer: "La IA puede cometer errores. Verifique información importante.",
    heroTitle: "Agente IA de Khaled Salman",
    heroSubtitle: "Tu asistente personal para servicios creativos, digitales y académicos",
    featuresTitle: "En qué puedo ayudarte",
    planFreeDesc: "5 mensajes por día",
    planWeeklyDesc: "Mensajes ilimitados + análisis de imágenes",
    planMonthlyDesc: "Todo semanal + generación de imágenes + prioridad",
    planAnnualDesc: "Todo + soporte directo + consultas personalizadas",
    pricingTitle: "Planes de suscripción",
    pricingSubtitle: "Elige el plan adecuado para tus necesidades",
    popular: "Más popular",
    save: "Ahorra 33%",
    language: "Idioma",
  },
};

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType>({
  lang: "ar",
  setLang: () => {},
  t: (key) => key,
  isRTL: true,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem("ks_lang") as Lang;
      return stored && translations[stored] ? stored : "ar";
    } catch {
      return "ar";
    }
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    try {
      localStorage.setItem("ks_lang", newLang);
    } catch {}
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const t = (key: string) =>
    translations[lang]?.[key] ?? translations.ar?.[key] ?? key;

  const isRTL = lang === "ar";

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];
