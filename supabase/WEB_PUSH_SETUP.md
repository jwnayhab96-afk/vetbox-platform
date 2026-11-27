# تشغيل إشعارات الهاتف

## 1. قاعدة البيانات والوظيفة

طبّق ملف SQL التالي مرة واحدة على مشروع Supabase من SQL Editor:

`supabase/migrations/20261127000002_web_push_subscriptions.sql`

ولّد مفاتيح VAPID وسر الـ webhook محلياً من مجلد المشروع:

```powershell
node scripts/generate-vapid-keys.mjs
```

انسخ القيم التي تظهر في الطرفية. لا تضع `VAPID_KEYS_JSON` أو `PUSH_WEBHOOK_SECRET` في ملفات المشروع أو Cloudflare؛ هذه أسرار خادم.

من الطرفية، انشر وظيفة الإرسال على مشروع Supabase المرتبط:

```powershell
npx supabase functions deploy push-notifications --project-ref damxpynsbgypkqlaemwf
```

ثم أضف أسرار الوظيفة من **Supabase Dashboard → Edge Functions → Secrets**:

- `VAPID_KEYS_JSON`: القيمة التي طبعها السكربت.
- `PUSH_WEBHOOK_SECRET`: القيمة التي طبعها السكربت.
- `VAPID_CONTACT`: بريد تواصل فعلي، مثل `mailto:your-email@example.com`.

## 2. ربط إضافة الإشعار بالإرسال

من **Supabase Dashboard → Database → Webhooks** أنشئ webhook جديداً:

- الجدول: `public.notifications`
- الحدث: `INSERT`
- النوع: `HTTP Request`
- الطريقة: `POST`
- الرابط: `https://damxpynsbgypkqlaemwf.supabase.co/functions/v1/push-notifications`
- الرؤوس:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer ` ثم قيمة `PUSH_WEBHOOK_SECRET` نفسها

بهذا تصل الإشعارات التي تُضاف من الموقع أو من مشغلات قاعدة البيانات إلى الأجهزة المشتركة.

## 3. إعداد Cloudflare Pages

أضف `NEXT_PUBLIC_VAPID_PUBLIC_KEY` في **Cloudflare Pages → Settings → Environment variables** لكل من Production وPreview عند الحاجة، ثم أعد النشر. أضفه إلى `.env.local` محلياً إذا أردت اختبار التطوير.

بعد النشر، يضغط المستخدم على الجرس ثم **تفعيل** ويوافق على إذن المتصفح. على iPhone/iPad يلزم إضافة الموقع إلى الشاشة الرئيسية وفتحه منها قبل التفعيل. هذا شرط من iOS لإشعارات الويب؛ الإشعارات لن تظهر إذا رفض المستخدم الإذن أو عطّله من إعدادات الجهاز.
