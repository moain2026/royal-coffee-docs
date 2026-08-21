<div dir="rtl">

# 06 — النشر

> الحالة الحالية: **الموقع لم يُنشر بعد** لا على Cloudflare ولا على
> Vercel. تم التحقّق من نجاح البناء للهدفين معًا، والتشغيل محليًا يعمل.

---

## 1. البيئة المطلوبة

```
Node.js  ≥ 20
npm      ≥ 10
```
التبعيات (4 فقط في التطوير، واحدة في الإنتاج):
```json
"dependencies":    { "hono": "^4.13.3" }
"devDependencies": { "@hono/vite-build": "^1.11.1",
                     "@hono/vite-dev-server": "^0.26.1",
                     "vite": "^8.1.4",
                     "wrangler": "^4.110.0" }
```

---

## 2. التشغيل محليًا

```bash
npm install                # 300 ثانية مهلة — vite ضخم
npm run build              # ≈220 مللي ثانية
fuser -k 3000/tcp || true  # نظّف المنفذ أولًا
npx wrangler pages dev dist --ip 0.0.0.0 --port 3000
```

أو عبر PM2 (الطريقة المفضّلة في بيئة الصندوق):
```bash
pm2 start ecosystem.config.cjs
pm2 logs --nostream        # لا تستخدم pm2 logs بلا --nostream — يحجب الطرفية
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3000
```

### 🔴 لا تستخدم `npm run dev` في بيئة الصندوق
`vite` بمفرده يخدم عبر Node، بينما `wrangler pages dev dist` يشغّل
**نفس بيئة Workers الحقيقية**. الفروق (غياب وحدات Node، حدود وقت
المعالج) تظهر في الثاني فقط. اختبر على ما ستنشره.

---

## 3. النشر على Cloudflare Pages

### أ. الإعداد لمرّة واحدة
```bash
# لا تستخدم wrangler login أبدًا في الصندوق — تدفّق OAuth لا يعمل.
export CLOUDFLARE_API_TOKEN="…"   # من لوحة Deploy في المنصّة
npx wrangler whoami                # تحقّق
npx wrangler pages project create royal-coffee \
    --production-branch main
```

### ب. كل نشر
```bash
npm run build
npx wrangler pages deploy dist --project-name royal-coffee
```
أو الاختصار الجاهز:
```bash
npm run deploy:prod
```

### ج. `wrangler.jsonc`
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "royal-coffee",
  "compatibility_date": "2026-08-15",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"]
}
```

### 🔴 قيود مهمّة على الارتباطات (bindings)

| الخدمة | مدعومة في النشر المُدار؟ |
|---|---|
| D1 (`d1_databases`) | ✅ |
| R2 (`r2_buckets`) | ✅ |
| **KV (`kv_namespaces`)** | ❌ **يُرفَض** ويفشل التحقّق |

لو احتاج المشروع تخزين مفتاح/قيمة مستقبلًا، استخدم جدول D1:
```sql
CREATE TABLE kv (key TEXT PRIMARY KEY, value TEXT);
```
> **ملاحظة:** المشروع الحالي **لا يستخدم أي قاعدة بيانات** — كل المحتوى
> ثوابت في الكود. المجلّد `migrations/` محفوظ للتوسّع المستقبلي فقط
> (نموذج حجز، سجل طلبات…).

---

## 4. النشر على Vercel Edge

```bash
npm run build:vercel                    # BUILD_TARGET=vercel vite build
npx vercel deploy --prebuilt --prod
```
أو:
```bash
npm run deploy:vercel
```

المخرَج: `.vercel/output/functions/__hono.func/index.js` (188 كيلوبايت).

### `vercel.json` — الترويسات
```json
{
  "headers": [
    { "source": "/static/(.*)",
      "headers": [{ "key": "Cache-Control",
                    "value": "public, max-age=31536000, immutable" }] },
    { "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()" }
      ] }
  ]
}
```

على Cloudflare Pages، المكافئ هو ملف `dist/_headers`. إن أردت نفس
الترويسات هناك، أنشئه في `public/_headers` بصيغة:
```
/static/*
  Cache-Control: public, max-age=31536000, immutable
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

---

## 5. 🔴 قاعدة التوافق المزدوج

كل ما يلي **محرَّم** في `src/`، وأي واحد منها يكسر أحد الهدفين فورًا:

| ❌ محرَّم | ✅ البديل |
|---|---|
| `import fs from 'fs'` | ضع الملف في `public/` |
| `import path from 'path'` | تعامل مع النصوص مباشرة |
| `import crypto from 'crypto'` | Web Crypto API (`crypto.subtle`) |
| `@hono/node-server/serve-static` | المنصّة تخدم `public/` تلقائيًا |
| `process.env` داخل معالج طلب | `c.env` (ارتباطات Cloudflare) |
| `Buffer` | `Uint8Array` / `TextEncoder` |

> `process.env.BUILD_TARGET` **مسموح** لأنه يُقرأ في `vite.config.ts`
> وقت البناء، لا وقت التشغيل.

---

## 6. قائمة تحقّق قبل كل نشر

```bash
[ ] npm run build                    # ينجح؟
[ ] npm run build:vercel             # ينجح؟
[ ] python3 qa/scripts/seo.py        # issues == 0 ؟
[ ] python3 qa/scripts/btn.py        # clipped == 0 ؟
[ ] python3 qa/scripts/cine.py       # overflowX == 0 ؟
[ ] bash اختبار المسارات             # 68 مسارًا، 0 فشل
[ ] BRAND في data.ts فيه أرقام حقيقية؟   ← ⚠️ لا يزال مؤقّتًا
[ ] SITE في ld.ts يشير للنطاق الحقيقي؟
```

### 🔴 قبل النشر العام
1. **بدّل بيانات `BRAND`** — نشر رقم `966500000000` يضرّ بالثقة والسيو.
2. **حدّث `SITE`** في `src/ld.ts` إلى النطاق الفعلي — كل الروابط
   القانونية (`canonical`) و`og:url` والبيانات المنظّمة تُبنى منه.
3. **أعد توليد رمز QR** في `/social`.
4. أضف الموقع إلى **Google Search Console** وارفع `sitemap.xml` يدويًا.

---

## 7. حلّ المشكلات

| العَرَض | السبب | الحل |
|---|---|---|
| ملفات ثابتة 404 | مسار خاطئ | الملفات في `public/static/` وتُطلب بـ `/static/…` |
| `wrangler login` يفشل | OAuth لا يعمل في الصندوق | استخدم `CLOUDFLARE_API_TOKEN` |
| تغيير `wrangler.jsonc` لم يُطبَّق | ذاكرة مؤقّتة | `rm -rf .wrangler && npm run build` |
| `npx tsc --noEmit` يجلب `tsc@2.0.4` | لا `typescript` في التبعيات | اعتمد على بناء vite للتحقّق، أو ثبّت typescript |
| المنفذ 3000 مشغول | عملية سابقة | `fuser -k 3000/tcp` أو `pm2 delete all` |
| الصورة تُنزَّل مرتين على الجوال | تمهيد LCP غير مقسَّم | [`05-performance.md` §2](./05-performance.md) |

</div>
