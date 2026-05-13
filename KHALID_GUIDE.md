# دليل خالد سلمان الشامل — كل شيء عن المشروع

## 🔑 كيف تدخل للإدارة
- اذهب إلى: `https://[رابط-تطبيقك]/admin`
- سجّل دخول بإيميلك: **khalidsalman7140@gmail.com**
- أنت الوحيد الذي يملك صلاحيات كاملة

---

## 📁 أين توجد الملفات؟

### 🖥️ الواجهة الأمامية (الموقع والتطبيق)
```
artifacts/khalid-agent/
├── src/
│   ├── App.tsx              ← جميع مسارات الصفحات
│   ├── pages/
│   │   ├── landing.tsx      ← الصفحة الرئيسية
│   │   ├── website.tsx      ← الموقع الاحترافي (/website)
│   │   ├── chat.tsx         ← صفحة الدردشة الذكية
│   │   ├── admin.tsx        ← لوحة التحكم الكاملة
│   │   ├── about.tsx        ← صفحة عن خالد
│   │   ├── pricing.tsx      ← صفحة الأسعار
│   │   ├── services.tsx     ← صفحة الخدمات
│   │   ├── vision.tsx       ← الرؤية 73 محور
│   │   ├── health.tsx       ← القطاع الصحي
│   │   ├── education.tsx    ← القطاع التعليمي
│   │   ├── transport.tsx    ← قطاع النقل
│   │   ├── real-estate.tsx  ← قطاع العقارات
│   │   ├── restaurants.tsx  ← قطاع المطاعم
│   │   └── emergency.tsx    ← نظام الطوارئ
│   ├── components/
│   │   ├── AdsDisplay.tsx   ← عرض الإعلانات
│   │   ├── VoiceButton.tsx  ← نظام الصوت (ذكر/أنثى)
│   │   ├── InstallPWA.tsx   ← زر تثبيت التطبيق
│   │   ├── RatingModal.tsx  ← نظام التقييمات
│   │   └── layout/          ← هيكل صفحة الدردشة
│   └── lib/
│       └── i18n.tsx         ← دعم 5 لغات (AR/EN/FR/TR/ES)
├── public/
│   ├── khalid.jpg           ← صورتك الشخصية
│   ├── manifest.json        ← إعدادات PWA
│   ├── sw.js                ← Service Worker (التحديث التلقائي)
│   └── favicon.svg          ← أيقونة التطبيق
└── index.html               ← ملف HTML الرئيسي
```

### ⚙️ الخادم (API Backend)
```
artifacts/api-server/
└── src/
    └── routes/
        ├── gemini/index.ts  ← محادثات الذكاء الاصطناعي (Gemini)
        ├── admin/index.ts   ← كل API الإدارة (مستخدمون، مدفوعات، إعلانات)
        ├── ads/index.ts     ← API الإعلانات المصورة
        ├── payments/        ← طلبات الدفع
        ├── ratings/         ← التقييمات
        └── user/index.ts    ← تتبع الإيميل (مكافحة الاحتيال)
```

### 🗄️ قاعدة البيانات
```
lib/db/
└── src/
    └── schema/
        ├── conversations.ts ← المحادثات
        ├── messages.ts      ← الرسائل
        ├── userPlans.ts     ← خطط الاشتراك + الاستخدام اليومي
        ├── adminSchema.ts   ← التقييمات، المدفوعات، الإعلانات، الإعدادات
        └── fraudSchema.ts   ← بصمات الإيميل (مكافحة الاحتيال)
```

### 📜 عقد API
```
lib/api-spec/openapi.yaml    ← المواصفة الكاملة لكل APIs
lib/api-zod/                 ← Zod schemas مولّدة تلقائياً
lib/api-client-react/        ← React hooks مولّدة تلقائياً
```

---

## 🗄️ كيف تصل إلى قاعدة البيانات؟

### الطريقة 1: من Replit مباشرة
1. في الـ Workspace، انتقل إلى **Database** في الشريط الجانبي
2. ستجد PostgreSQL جاهزاً مع كل الجداول

### الطريقة 2: من Terminal
```bash
# للاتصال بقاعدة البيانات
psql $DATABASE_URL

# عرض جميع الجداول
\dt

# عرض المستخدمين
SELECT * FROM user_plans ORDER BY created_at DESC;

# عرض المحادثات
SELECT * FROM conversations ORDER BY created_at DESC LIMIT 20;

# عرض طلبات الدفع
SELECT * FROM payment_requests WHERE status='pending';

# عرض الإعلانات
SELECT * FROM ads WHERE is_active=true;
```

### الطريقة 3: لوحة التحكم
- الرابط: `/admin` بالإيميل والرمز السري عبر Clerk

---

## 🌐 الجداول الموجودة في قاعدة البيانات

| الجدول | المحتوى |
|--------|---------|
| `conversations` | كل المحادثات مع الوكيل |
| `messages` | كل الرسائل |
| `user_plans` | خطط الاشتراك لكل مستخدم |
| `user_usage` | عدد الرسائل اليومية |
| `ratings` | تقييمات المستخدمين |
| `blocked_users` | المستخدمون المحظورون |
| `payment_requests` | طلبات الدفع |
| `announcements` | الإشعارات والإعلانات النصية |
| `ads` | الإعلانات المصورة |
| `app_settings` | إعدادات التطبيق |
| `audit_logs` | سجل العمليات |
| `email_fingerprints` | بصمات الإيميل (مكافحة الاحتيال) |

---

## ✅ ما يمكنك تغييره من الإدارة (بضغطة واحدة)

### 👥 المستخدمون
- ترقية خطة أي مستخدم (مجاني → أسبوعي → شهري → سنوي)
- حظر أي مستخدم
- عرض كل محادثاته

### 💳 المدفوعات
- **قبول فوري** = تفعيل الاشتراك تلقائياً بدون أي خطوة إضافية
- رفض الطلب مع ملاحظة
- عرض صورة الوصل

### 📢 الإعلانات المصورة (جديد)
- أضف صورة إعلانية برابط URL → تظهر في التطبيق فوراً
- تفعيل/إيقاف أي إعلان بضغطة واحدة
- حذف الإعلان

### 🔔 الإشعارات
- نشر إعلان نصي → يظهر لكل المستخدمين
- تفعيل/إيقاف أي إشعار

### 🛡️ الأمان
- عرض كل الإيميلات المسجّلة
- كشف حالات الاحتيال (من يحذف ويعيد التسجيل)
- رفع الحظر عن إيميل

---

## 🚀 أوامر مهمة للمطور

```bash
# تشغيل الخادم
pnpm --filter @workspace/api-server run dev

# تشغيل الواجهة
pnpm --filter @workspace/khalid-agent run dev

# فحص الأخطاء
pnpm run typecheck

# دفع تغييرات قاعدة البيانات
pnpm --filter @workspace/db run push

# إعادة توليد API hooks
pnpm --filter @workspace/api-spec run codegen
```

---

## 🔐 متغيرات البيئة المطلوبة

| المتغير | الاستخدام |
|--------|---------|
| `DATABASE_URL` | اتصال PostgreSQL |
| `AI_INTEGRATIONS_GEMINI_BASE_URL` | Gemini AI |
| `AI_INTEGRATIONS_GEMINI_API_KEY` | Gemini AI |
| `CLERK_SECRET_KEY` | المصادقة (Backend) |
| `CLERK_PUBLISHABLE_KEY` | المصادقة (Backend) |
| `VITE_CLERK_PUBLISHABLE_KEY` | المصادقة (Frontend) |
| `SESSION_SECRET` | جلسات Express |
| `ADMIN_EMAIL` | إيميل المدير (default: khalidsalman7140@gmail.com) |

---

## 📱 صفحات التطبيق

| المسار | الوصف |
|--------|------|
| `/` | الصفحة الرئيسية (يحوّل للدردشة إن مسجّل) |
| `/website` | الموقع الاحترافي لخالد |
| `/chat` | الدردشة مع الوكيل الذكي |
| `/about` | نبذة عن خالد |
| `/vision` | الرؤية 73 محور |
| `/services` | الخدمات |
| `/pricing` | الأسعار والخطط |
| `/subscribe` | طلب الاشتراك |
| `/health` | القطاع الصحي |
| `/education` | القطاع التعليمي |
| `/transport` | النقل الذكي |
| `/real-estate` | العقارات |
| `/restaurants` | المطاعم |
| `/emergency` | الطوارئ |
| `/admin` | لوحة التحكم (خالد فقط) |
| `/sign-in` | تسجيل الدخول |
| `/sign-up` | إنشاء حساب |

---

## 📞 للتواصل أو الدعم التقني
- WhatsApp: +967 783 701 365
- WhatsApp: +967 779 435 445
- Telegram: @kshskshg
- Email: khalidsalman7140@gmail.com
