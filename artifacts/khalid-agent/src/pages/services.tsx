import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Palette, 
  MonitorPlay, 
  GraduationCap, 
  Code2, 
  MessageSquare, 
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function Services() {
  const services = [
    {
      id: "design",
      title: "قسم التصميم والإبداع",
      icon: <Palette className="w-8 h-8" />,
      description: "حلول بصرية مبتكرة تعكس هويتك وتلفت الانتباه.",
      features: ["هوية بصرية كاملة", "صور بالذكاء الاصطناعي", "ديكور داخلي وخارجي", "شهادات تقدير وتصاميم مطبوعة"],
      gradient: "from-blue-500/20 to-purple-500/20",
      border: "border-blue-500/30"
    },
    {
      id: "digital",
      title: "قسم المحتوى الرقمي",
      icon: <MonitorPlay className="w-8 h-8" />,
      description: "محتوى رقمي جذاب يعزز تواجدك على منصات التواصل.",
      features: ["فيديوهات بالذكاء الاصطناعي", "كتب إلكترونية وتنسيقها", "عروض تقديمية احترافية", "موشن جرافيك"],
      gradient: "from-purple-500/20 to-pink-500/20",
      border: "border-purple-500/30"
    },
    {
      id: "academic",
      title: "قسم الخدمات الأكاديمية",
      icon: <GraduationCap className="w-8 h-8" />,
      description: "دعم أكاديمي شامل للطلاب والباحثين.",
      features: ["مشاريع تخرج متكاملة", "عروض جامعية", "تنسيق أبحاث", "ترجمة وتدقيق لغوي"],
      gradient: "from-pink-500/20 to-orange-500/20",
      border: "border-pink-500/30"
    },
    {
      id: "programming",
      title: "قسم البرمجة والبيانات",
      icon: <Code2 className="w-8 h-8" />,
      description: "حلول تقنية ذكية لتحسين أعمالك وأتمتة مهامك.",
      features: ["تطبيقات وأنظمة مخصصة", "تحليل بيانات واستخراج رؤى", "برمجة وكلاء ذكاء اصطناعي", "تطوير مواقع الويب"],
      gradient: "from-orange-500/20 to-yellow-500/20",
      border: "border-orange-500/30"
    }
  ];

  return (
    <div className="min-h-full overflow-y-auto px-4 py-12 md:px-8 bg-background relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-glow">خدماتنا</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              مجموعة متكاملة من الخدمات الإبداعية والتقنية المصممة للارتقاء بأعمالك.
            </p>
          </div>
          
          <Link href="/">
            <Button size="lg" className="gap-2 shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all">
              <MessageSquare className="w-5 h-5" />
              تحدث مع الوكيل
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <div 
              key={service.id} 
              className={`p-8 rounded-2xl border ${service.border} bg-card/40 backdrop-blur-sm relative overflow-hidden group hover:border-primary/50 transition-all duration-500`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Card Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-xl bg-background border border-border flex items-center justify-center mb-6 text-primary shadow-lg group-hover:scale-110 transition-transform duration-500">
                  {service.icon}
                </div>
                
                <h2 className="text-2xl font-bold mb-3">{service.title}</h2>
                <p className="text-muted-foreground mb-6 line-clamp-2">
                  {service.description}
                </p>
                
                <ul className="space-y-3">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                      <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8 pt-6 border-t border-border/50">
                  <Link href={`/?q=أريد طلب خدمة من ${service.title}`}>
                    <Button variant="outline" className="w-full group/btn hover:bg-primary hover:text-primary-foreground transition-colors border-primary/30">
                      طلب هذه الخدمة
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">هل لديك مشروع خاص ولا يندرج تحت هذه الأقسام؟</p>
          <Link href="/">
            <Button variant="link" className="text-primary hover:text-primary/80 text-lg">
              دعنا نتناقش حوله
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
