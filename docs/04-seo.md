<div dir="rtl">

# 04 — استراتيجية السيو

> الطلب الأصلي من العميل: **«موقع يكنّس السوق»** وأن تكون **كل صفحات المدن
> صفحات مستقلّة قابلة للفهرسة**. هذا الملف يشرح كيف نُفِّذ ذلك بالتفصيل،
> وأين تكمن المخاطر.

**نتيجة التدقيق الآلي الأخيرة** (`qa/scripts/seo.py`):
**73 رابطًا · 0 عنوان مكرّر · 0 وصف مكرّر · 0 مشكلة · أطول عنوان 70 حرفًا.**

---

## 1. العمود الفقري: 30 صفحة هبوط محلّية مستقلّة

```
3 عوائل كلمات مفتاحية  ×  10 مدن  =  30 صفحة هبوط
+ 10 مراكز مدن  +  /locations
```

| العائلة | البادئة | مثال الرابط | H1 |
|---|---|---|---|
| قهوجيين | `qahwajiin` | `/qahwajiin-jeddah` | قهوجيين جدة |
| صبابين قهوة | `sababin-qahwa` | `/sababin-qahwa-riyadh` | صبابين قهوة الرياض |
| ضيافة مناسبات | `diyafa-munasabat` | `/diyafa-munasabat-makkah` | ضيافة مناسبات مكة |

### 🔴 لماذا مسار في الجذر ولا `?city=` ولا مجلّد فرعي؟

- **معاملات الاستعلام** (`?city=jeddah`) تُعالج كصفحة واحدة بمتغيّرات، وقد
  تُدمَج أو تُتجاهَل في الفهرس.
- **مسار الجذر** (`/qahwajiin-jeddah`) يمنح الكلمة المفتاحية أعلى موضع
  ممكن في الرابط، وهذا هو النمط الذي تستخدمه كل المواقع المنافسة الناجحة
  في هذا السوق (موثَّق في `research/competitor-analysis/ANALYSIS.md`).

### 🔴 كيف نجونا من فخّ *doorway pages*؟

جوجل تحذف الصفحات المولّدة قالبيًا. الحصانة الوحيدة هي **نص فريد فعلي**:

لكل مدينة **أربعة** حقول نصية طويلة مكتوبة يدويًا:
`intro` · `qahwajiin` · `sababin` · `munasabat`
تذكر أحياء المدينة الحقيقية، قاعاتها، ومواسمها الخاصة.

> **قاعدة صارمة:** إضافة مدينة بنسخ نص مدينة أخرى = تعريض **الثلاثين
> صفحة** كلها للخطر، لا الصفحة الجديدة فقط.

---

## 2. العناوين: `fitTitle()` وميزانية الـ 70 حرفًا

الغلاف يُلحق ` | القهوة الملكية` بكل عنوان. لذلك الميزانية الفعلية أقل:

```ts
const fitTitle = (base: string, ...suffixes: string[]) => {
  /* Layout appends " | <brand>" — reserve that from the 70-char budget. */
  const budget = 70 - ` | ${BRAND.name}`.length
  for (const s of suffixes) {
    const t = s ? `${base} — ${s}` : base
    if (t.length <= budget) return t
  }
  return base
}
```

**كيف تُستخدم:** تُمرَّر اللواحق **من الأطول إلى الأقصر**، فتختار الدالة
أطول لاحقة تناسب المساحة:

```ts
title={fitTitle(title,
  `${f.kicker} بأسعار واضحة`,   // المحاولة الأولى: الأغنى
  f.kicker,                      // ثم أقصر
  'أسعار واضحة')}                // ثم الحد الأدنى
```

هذا هو ما حلّ مشكلة قطع عناوين صفحات `FamilyCity` — وهي أكثر العناوين
طولًا لأنها تجمع العائلة + المدينة + اللاحقة + العلامة.

---

## 3. الوسوم في `<head>` (من `src/layout.tsx`)

```html
<html lang="ar" dir="rtl">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#080706">
<title>{العنوان} | القهوة الملكية</title>
<meta name="description" content="…">
<link rel="canonical" href="{SITE}{path}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="author" content="القهوة الملكية">

<!-- إشارات جغرافية -->
<meta name="geo.region" content="SA">
<meta name="geo.placename" content="Jeddah">

<!-- Open Graph + Twitter -->
og:type · og:locale=ar_SA · og:site_name · og:title · og:description
og:url · og:image · og:image:alt · twitter:card=summary_large_image …
```

نقاط مهمّة:
- `lang="ar" dir="rtl"` على `<html>` — ليس على `<body>`.
- `max-image-preview:large` يسمح لجوجل بعرض صورة كبيرة في نتائج البحث،
  وهذا مهم لموقع بصري.
- `canonical` مطلق دائمًا ومبنيّ من `SITE + path`، فلا تنشأ نسخ مكرّرة
  بسبب `www` أو الشرطة المائلة الأخيرة.
- `og:image` يشير إلى بطل الصفحة نفسها لا صورة عامة.

---

## 4. البيانات المنظّمة — 11 بانيًا في `src/ld.ts`

| الباني | المخرَج | يُستخدم في |
|---|---|---|
| `orgLd()` | `Organization` / `LocalBusiness` | كل الصفحات |
| `siteLd()` | `WebSite` + `SearchAction` | كل الصفحات |
| `faqLd(items)` | `FAQPage` | `/faq` وأقسام الأسئلة |
| `crumbLd(items)` | `BreadcrumbList` | كل صفحة داخلية |
| `serviceLd(...)` | `Service` | `/services/:slug`، صفحات العوائل |
| `eventLd(...)` | `Event` | `/occasions/:slug` |
| `menuLd(...)` | `Menu` / `MenuSection` | `/menu/:slug` |
| `galleryLd(...)` | `ImageGallery` | `/gallery` |
| `reviewsLd()` | `Review` + `AggregateRating` | الرئيسية |
| `offerLd(path)` | `Offer` / `AggregateOffer` | `/prices` |
| `personListLd(...)` | `Person[]` | `/about` |
| `graph(...nodes)` | يجمعها في `@graph` واحد | `layout.tsx` |

**لماذا `@graph` واحد؟** بدلًا من عدّة وسوم `<script type="application/ld+json">`
متفرّقة، تُدمَج كل العُقَد في رسم واحد مع `@id` مترابطة — فتفهم جوجل أن
الخدمة تنتمي لهذه المنظّمة، وأن التقييم يخصّها هي، لا كيانات منفصلة.

```ts
export const abs = (p) => p.startsWith('http') ? p : `${SITE}${p}`
```
كل الروابط والصور في البيانات المنظّمة **مطلقة** — نسبية تعني تجاهلًا.

---

## 5. `robots.txt` و `sitemap.xml` مولّدان برمجيًا

### `/robots.txt`
```
User-agent: *
Allow: /

Sitemap: {SITE}/sitemap.xml
```
مع `Cache-Control: public, max-age=86400`.

### `/sitemap.xml` — 73 رابطًا بأولويات مدروسة

```ts
add('/',          '1.0', 'weekly')
add('/services',  '0.9', 'monthly')
add('/prices',    '0.9', 'monthly')
add('/locations', '0.9', 'monthly')
add('/gallery',   '0.7', 'weekly')
add('/about',     '0.6', 'yearly')
// مراكز المدن: 0.9 للمدن ذات priority=1، و0.8 لغيرها
// صفحات العوائل: 0.8
// صفحات الخدمات: 0.8 · المناسبات والتقديمات: 0.7
```

**فلسفة الأولويات:** مراكز المدن تُمنح أولوية **أعلى** من صفحات العوائل،
لأن المركز هو صفحة المِحوَر (hub) التي تصبّ فيها الروابط الداخلية، وصفحات
العوائل أوراق (leaves) تتفرّع منها.

> **مهم:** خريطة الموقع مولّدة من نفس `localPaths()` التي تولّد المسارات
> الفعلية. فلا يمكن أن يوجد في الخريطة رابط لا صفحة له، ولا صفحة غائبة عن
> الخريطة. هذا التصميم يقتل صنفًا كاملًا من أخطاء السيو.

---

## 6. معايير فهرسة جوجل العشرة — حالة كل واحد

| # | المعيار | الحالة | كيف |
|---|---|---|---|
| 1 | HTML من السيرفر بلا اعتماد على JS | ✅ | Hono SSR، صفر ترطيب |
| 2 | عنوان فريد لكل صفحة | ✅ | 0 تكرار في 73 رابطًا |
| 3 | وصف فريد لكل صفحة | ✅ | 0 تكرار |
| 4 | `canonical` مطلق | ✅ | `layout.tsx` |
| 5 | بيانات منظّمة صحيحة | ✅ | `@graph` من 11 بانيًا |
| 6 | خريطة موقع + robots | ✅ | مولّدان، 73 رابطًا |
| 7 | ترابط داخلي (hub ↔ leaf) | ✅ | شرائح المدن، مسار التنقّل، شرائط CTA |
| 8 | جوّال أولًا | ✅ | تصميم جوّال أولًا + إخراج فني للصور |
| 9 | نص فريد لكل صفحة محلّية | ✅ | 4 حقول يدوية لكل مدينة |
| 10 | صور بنص بديل ومقاسات معلنة | ✅ | `imgmap.ts` يفرض `width`/`height` |

---

## 7. المخاطر المعروفة

| الخطر | الأثر | الحل |
|---|---|---|
| **بيانات تواصل مؤقّتة** في `orgLd` | جوجل تفهرس رقمًا وبريدًا غير حقيقيين | محجوز على العميل — انظر [`08-roadmap.md`](./08-roadmap.md) |
| مقابض تواصل اجتماعي وهمية (`sameAs`) | إشارات كيان ضعيفة | نفس البند |
| النطاق غير منشور بعد | لا فهرسة أصلًا | النشر ثم إضافة الموقع إلى Search Console |
| إضافة مدن بنسخ نصوص | خطر doorway على الـ30 صفحة | القاعدة الصارمة في القسم 1 |

---

## 8. كيف أتحقّق بعد أي تعديل؟

```bash
python3 qa/scripts/seo.py
```
يزحف كل الروابط ويتحقّق من: تكرار العناوين، تكرار الأوصاف، طول العنوان،
وجود `canonical`، صحّة JSON-LD، تطابق خريطة الموقع مع المسارات الفعلية.
**المطلوب: `issues: 0`.**

</div>
