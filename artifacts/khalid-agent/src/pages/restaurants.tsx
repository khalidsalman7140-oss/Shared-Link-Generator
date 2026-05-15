import { Link } from "wouter";
import { UtensilsCrossed, ArrowLeft, ShoppingCart, Bell, CreditCard, Star, TrendingUp, Package, Globe, Lock, Users, BarChart, MessageSquare, Clock, Gift, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const features = [
  { icon: Globe, ar: "الربط بكل المطاعم والمقاهي والمخابز ومحلات الحلويات والعصائر والوجبات السريعة والمطابخ الشعبية والفنادق والكافتيريات والبوفيهات وعربات الطعام والسوبرماركت", en: "Connected to all restaurants, cafés, bakeries, sweets shops, fast food, popular kitchens, hotels, cafeterias, buffets, food trucks & supermarkets" },
  { icon: UtensilsCrossed, ar: "عرض قوائم الطعام بكل التفاصيل والصور والأسعار والعروض والتخفيضات", en: "Display menus with full details, photos, prices, offers, and discounts" },
  { icon: ShoppingCart, ar: "استقبال الطلبات عبر المنصة، واتساب، فيسبوك، انستجرام، مكالمات، رسائل نصية", en: "Receive orders via platform, WhatsApp, Facebook, Instagram, phone calls, and SMS" },
  { icon: Bell, ar: "تأكيد الطلب تلقائياً وإرسال إشعار للمطعم والزبون فوراً", en: "Auto-confirm orders and instantly notify both restaurant and customer" },
  { icon: Clock, ar: "حساب وقت التجهيز والتوصيل التقديري بدقة", en: "Accurately calculate estimated preparation and delivery time" },
  { icon: Truck, ar: "تنسيق مع سائقي التوصيل القريبين من المطعم", en: "Coordinate with nearby delivery drivers" },
  { icon: Bell, ar: "تتبع الطلب من المطبخ حتى التسليم مع إشعارات كل مرحلة", en: "Track orders from kitchen to delivery with stage-by-stage notifications" },
  { icon: CreditCard, ar: "إدارة المدفوعات: نقداً، محافظ إلكترونية، كروت شحن، حوالات", en: "Manage payments: cash, e-wallets, recharge cards, bank transfers" },
  { icon: Globe, ar: "إصدار الفواتير إلكترونياً وحفظها في الحساب", en: "Issue electronic invoices and save them in the account" },
  { icon: Gift, ar: "إدارة العروض اليومية والأسبوعية والموسمية والتخفيضات", en: "Manage daily, weekly, seasonal offers and discounts" },
  { icon: Star, ar: "إدارة برامج الولاء والخصومات للعملاء الدائمين", en: "Manage loyalty programs and discounts for regular customers" },
  { icon: Package, ar: "إدارة المخزون الغذائي وإرسال تنبيهات بنقص المواد والطلب التلقائي من الموردين", en: "Manage food inventory with shortage alerts and automatic supplier ordering" },
  { icon: TrendingUp, ar: "تحليل تفضيلات الزبائن واقتراح أطباق تناسبهم", en: "Analyze customer preferences and suggest personalized dishes" },
  { icon: Users, ar: "نظام حجز الطاولات في المطاعم", en: "Restaurant table reservation system" },
  { icon: Globe, ar: "إدارة الحفلات والمناسبات وقاعات الأفراح", en: "Manage events, occasions, and wedding halls" },
  { icon: MessageSquare, ar: "جمع التقييمات والمراجعات من الزبائن وتحليلها", en: "Collect and analyze customer ratings and reviews" },
  { icon: BarChart, ar: "تقارير أداء يومية وأسبوعية وشهرية للمطعم", en: "Daily, weekly, and monthly restaurant performance reports" },
  { icon: TrendingUp, ar: "مقارنة أداء المطعم بالمنافسين في نفس المنطقة", en: "Compare restaurant performance with competitors in the same area" },
  { icon: Star, ar: "اقتراح تحسينات في القائمة أو الأسعار أو الخدمة بناءً على البيانات", en: "AI-powered suggestions for menu, price, and service improvements" },
  { icon: Lock, ar: "حماية بيانات المطاعم والزبائن بتشفير عالٍ", en: "Protect restaurant and customer data with advanced encryption" },
];

const stats = [
  { value: "+10K", label: "منشأة غذائية", labelEn: "Food Establishments" },
  { value: "6", label: "قنوات طلب", labelEn: "Order Channels" },
  { value: "AI", label: "تحليل ذكي", labelEn: "AI Analytics" },
  { value: "24/7", label: "استقبال طلبات", labelEn: "Order Reception" },
];

export default function RestaurantsPage() {
  const { isRTL } = useI18n();
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground overflow-x-hidden"
      style={{ background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(239,68,68,0.2) 0%, transparent 60%)" }}>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />{isRTL ? "الرئيسية" : "Home"}</Button></Link>
          <Link href="/vision"><Button variant="ghost" size="sm" className="text-xs opacity-60">محور #71 من 73</Button></Link>
        </div>

        <div className="relative rounded-3xl border border-red-500/30 overflow-hidden p-8 md:p-12 text-center"
          style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.08))" }}>
          <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 50% 0%, rgba(239,68,68,1), transparent 60%)" }} />
          <div className="relative z-10 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
              <UtensilsCrossed className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold"
              style={{ background: "linear-gradient(90deg, #fff, #f87171)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {isRTL ? "نظام المطاعم والتوصيل" : "Smart Restaurants & Delivery"}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isRTL ? "منظومة طعام ذكية تربط كل المطاعم والمطابخ ومحلات الطعام في اليمن بالزبائن عبر قنوات متعددة" : "Smart food ecosystem connecting all restaurants, kitchens, and food shops in Yemen to customers through multiple channels"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-red-400">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{isRTL ? s.label : s.labelEn}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-red-400" />
            {isRTL ? "خدمات منظومة المطاعم" : "Restaurant System Services"}
            <span className="text-xs text-muted-foreground font-normal">({features.length} خدمة)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/40 hover:border-red-500/30 hover:bg-red-500/5 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
                  <f.icon className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                  {isRTL ? f.ar : f.en}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/chat">
            <Button size="lg" className="gap-2 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-700/30 w-full sm:w-auto">
              <UtensilsCrossed className="w-5 h-5" />
              {isRTL ? "ابدأ استشارة مطعمك الذكية" : "Start AI Restaurant Consultation"}
            </Button>
          </Link>
          <Link href="/guest-chat">
            <Button size="lg" variant="outline" className="gap-2 border-red-500/40 text-red-400 hover:bg-red-500/10 w-full sm:w-auto">
              {isRTL ? "جرّب بدون تسجيل" : "Try Without Account"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
