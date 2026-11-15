# BTEC HUB AI – دليل التشغيل والإعداد السريع

تم بناء المشروع بالكامل ككود مصدري احترافي باستخدام **Next.js 14 (App Router)**، **TypeScript**، **Tailwind CSS**، **Supabase (PostgreSQL & Auth & Storage)**، و **OpenAI API**.

---

## 1. المتطلبات الأساسية

1. **تثبيت Node.js**:
   - قم بتحميل وتثبيت [Node.js (LTS)](https://nodejs.org/).

2. **حساب Supabase**:
   - أنشئ مشروعاً جديداً على [Supabase](https://supabase.com).

3. **مفتاح OpenAI API**:
   - احصل على مفتاح API من [OpenAI Platform](https://platform.openai.com).

---

## 2. إعداد قاعدة البيانات (Supabase)

قم بتنفيذ ملفات الـ SQL التالية داخل **SQL Editor** في لوحة تحكم Supabase بالترتيب:

1. `supabase/migrations/001_initial_schema.sql` (إنشاء الجداول وسياسات الحماية RLS والـ Functions).
2. `supabase/migrations/002_storage.sql` (إنشاء الـ Storage Bucket `student-files` وسياسات الوصول).

---

## 3. إعداد متغيرات البيئة

قم بإنشاء ملف باسم `.env.local` في مسار المشروع وضع فيه القيم الخاصة بك:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=sk-...your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 4. تشغيل المشروع

افتح موجه الأوامر (Terminal / PowerShell) في مجلد المشروع ونفّذ:

```bash
# تثبيت الحزم والمكتبات
npm install

# تشغيل بيئة التطوير
npm run dev
```

افتح المتصفح على: `http://localhost:3000`

---

## 5. نظرة على الملفات والميزات المكتملة

- **الواجهات والتنقل (RTL / عربي وإنجليزي)**:
  - صفحة الهبوط الكاملة (`/`).
  - تسجيل الدخول وإنشاء الحساب (`/auth/login`, `/auth/register`).
  - لوحة التحكم الرئيسية مع الإحصائيات والإجراءات السريعة (`/dashboard`).
  - الشات الذكي مع BTEC AI مع دعم التدفق الحي Streaming (`/dashboard/ai-chat`).
  - محلل التكليفات واستخراج المعايير من PDF / Word (`/dashboard/analyzer`).
  - قائمة ومساحة عمل التكليفات مع تتبع المعايير (`/dashboard/assignments`).
  - دليل المعايير وشرح كلمات الأوامر Pass / Merit / Distinction (`/dashboard/criteria`).
  - بناء التقرير وتحسين الكتابة الأكاديمية (`/dashboard/report-builder`).
  - مركز البحث عن المصادر الأكاديمية الموثوقة (`/dashboard/research`).
  - المراجعة الذكية للتقارير ومقارنتها بمعايير التكليف (`/dashboard/review`).
  - إدارة الملفات المرفوعة مع روابط تحميل آمنة (`/dashboard/files`).
  - إعدادات الحساب ومراقبة استهلاك الذكاء الاصطناعي (`/dashboard/settings`).

- **الخلفية والـ APIs (Backend & Database)**:
  - معالجة وفحص ملفات PDF و DOCX.
  - تكامل آمن بالكامل مع OpenAI من جانب السيرفر لحماية المفاتيح.
  - سياسات حماية صارمة لكل مستخدم (Row Level Security - RLS).
