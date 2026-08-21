<div dir="rtl">

# 03 — نموذج المحتوى

> كل نص في الموقع مصدره ملفان فقط: `src/data.ts` (47 كيلوبايت) و
> `src/cities.ts` (39 كيلوبايت). لا يوجد نص عربي واحد مكتوب داخل
> `views.tsx` عدا العناوين البنيوية للأقسام.

---

## 1. `BRAND` — الهوية ونقاط التواصل

```ts
export const BRAND = {
  name: 'القهوة الملكية',
  latin: 'ROYAL COFFEE',
  tagline: 'ضيافة عربية بمعايير ملكية',
  since: '٢٠١٤',
  phoneRaw:     '966500000000',      // ⚠️ مؤقت
  phoneDisplay: '+966 50 000 0000',  // ⚠️ مؤقت
  phoneLocal:   '0500000000',        // ⚠️ مؤقت
  whatsapp:     'https://wa.me/966500000000', // ⚠️ مؤقت
  email:        'hello@example.com', // ⚠️ مؤقت
  mapsUrl:      'https://maps.google.com/?q=Jeddah',
} as const
```

## 🔴 تنبيه محجوز على العميل

**كل بيانات التواصل أعلاه قيم مؤقّتة (placeholders).** عند وصول الأرقام
الحقيقية:

1. عدِّل `BRAND` في `src/data.ts` — **مكان واحد فقط**، ينتشر تلقائيًا إلى:
   - كل أزرار الواتساب والاتصال في الموقع (عشرات المواضع)
   - الرصيف العائم والقائمة السفلية
   - JSON-LD (`orgLd`) → بيانات جوجل المنظّمة
   - صفحة `/social` وصفحة `/contact`
2. عدِّل مقابض التواصل الاجتماعي في مصفوفة `SOCIAL` (حاليًا كلها
   `@royalcoffee` وروابط جذور المنصّات).
3. **أعد توليد رمز QR** في صفحة `/social` — الرمز الحالي يشير إلى بيانات
   مؤقّتة.

---

## 2. `SOCIAL` — 14 منصّة

```ts
type Social = {
  n: string       // اسم الأيقونة في icons.tsx
  label: string   // الاسم العربي المعروض
  handle: string  // المقبض أو الرقم
  href: string
  hue: string     // لون المنصّة (يُستخدم في الهالة فقط)
  kind: 'contact' | 'social' | 'place'
  note: string    // سطر توضيحي قصير
}
```
`kind` يحدّد ترتيب البطاقات في صفحة QR: `contact` أولًا (التحويل)، ثم
`social`، ثم `place`.

---

## 3. `NAV` — 9 عناصر

```ts
{ href, label, icon, hint }
```
الترتيب: الرئيسية · الخدمات · التقديمات · أعمالنا · المناسبات · المدن ·
الأسعار · أسئلة متكررة · من نحن.

> **ملاحظة:** الحقل `hint` **لم يعد مستخدَمًا في القائمة السفلية** بعد
> تنحيفها (كان يُظهر سطرًا وصفيًا تحت كل عنصر وهو ما جعل القائمة تبدو
> صفحة). يُستخدم `NAV_MAIN` في الهيدر المكتبي. أبقيناه لأنه قد يفيد في
> تلميحات `title` مستقبلًا.

---

## 4. أنواع المحتوى الرئيسية في `data.ts`

| الثابت | النوع | الغرض |
|---|---|---|
| `SERVICES` | `Service[]` | 8 خدمات → تولّد `/services/:slug` |
| `OCCASIONS` | `Occasion[]` | المناسبات → تولّد `/occasions/:slug` |
| `MENU` | `MenuCat[]` | فئات التقديمات → تولّد `/menu/:slug` |
| `PILLARS` | — | أعمدة القيمة (شريط ثقة) |
| `STEPS` | — | خطوات العملية |
| `STATS` | — | الأرقام |
| `PRICING` | — | الحزم |
| `FAQ` | — | الأسئلة (تُغذّي `faqLd`) |
| `GALLERY` | `Shot[]` | صور المعرض |
| `GAL_CATS` | `readonly` | الكل · ملكية · عدّة · تقديمات · فريق · إضافات |
| `REVIEWS` | — | التقييمات (تُغذّي `reviewsLd`) |

```ts
type MenuItem = { n: string; d: string; img?: string }
type MenuCat  = { slug: string; cat: string; icon: string; hero: string
                ; blurb: string; items: MenuItem[] }
type Shot     = { img: string; cap: string; tall?: boolean; cat: string }
```

`tall` في `Shot` يخبر شبكة الـ masonry أن الصورة تحتلّ عمودين رأسيًا —
وهذا ما يمنع المعرض من أن يبدو شبكة متماثلة مملّة.

---

## 5. 🔑 `cities.ts` — محرّك السيو المحلي

### `City` — 10 مدن، كل واحدة بنص فريد

```ts
type City = {
  slug: string        // jeddah
  name: string        // جدة
  inName: string      // صيغة "في <المدينة>" النحوية
  region: string      // منطقة مكة المكرمة
  lat, lng: string    // للبيانات المنظّمة المحلية
  districts: string[] // الأحياء
  venues: string[]    // القاعات والمواقع
  intro: string       // ✳️ فقرة افتتاحية فريدة لمركز المدينة
  qahwajiin: string   // ✳️ زاوية فريدة لصفحة القهوجيين
  sababin: string     // ✳️ زاوية فريدة لصفحة الصبابين
  munasabat: string   // ✳️ زاوية فريدة لصفحة ضيافة المناسبات
  local: string[]     // التزامات خاصة بالمدينة
  hero: string
  priority: number    // أولوية خريطة الموقع
}
```

المدن العشر: **جدة · الرياض · مكة المكرمة · المدينة المنورة · الدمام ·
الخبر · الطائف · أبها · ينبع · تبوك**.

### 🔴 لماذا 4 نصوص فريدة لكل مدينة؟

لأن الحقول المعلَّمة بـ ✳️ هي **الفرق بين الفهرسة والرفض**. لو كان النص
مقالبًا (template) يستبدل اسم المدينة فقط، لصنّفت جوجل الصفحات العشرين
كـ *doorway pages* ومحتوى مكرّر، ولحُذفت من الفهرس. لذلك:

- `intro` يذكر أحياء ومواقع المدينة الحقيقية.
- `qahwajiin` / `sababin` / `munasabat` تكتب **زاوية مختلفة** لكل مدينة
  (مثلًا: موسم الحج في مكة ≠ المؤتمرات في الرياض ≠ الأعراس في جدة).
- `local` التزامات لوجستية خاصة (زمن الوصول، الأحياء المخدومة).

> **إذا أضفت مدينة جديدة: لا تنسخ نص مدينة أخرى.** اكتب الحقول الأربعة من
> الصفر، وإلا أضررت بترتيب المدن العشر القائمة.

---

## 6. `Family` — عوائل الكلمات المفتاحية

```ts
type Family = {
  key: 'qahwajiin' | 'sababin-qahwa' | 'diyafa-munasabat'
  prefix: string    // بادئة الرابط: qahwajiin-jeddah
  noun: string      // الاسم في H1: "قهوجيين"
  kicker: string
  icon: string
  services: string[] // أي خدمات ترتبط بهذه العائلة
  pitch: string      // عرض القيمة الخاص بالعائلة
  bullets: { t: string; d: string }[]
}
```

ثلاث عوائل: **قهوجيين · صبابين قهوة · ضيافة مناسبات**.

---

## 7. كيف تُولَّد 76 صفحة من 18 معالجًا

```ts
export const localPaths = () => {
  const out: string[] = ['/locations']
  for (const c of CITIES)  out.push(`/locations/${c.slug}`)          // 10
  for (const f of FAMILIES)
    for (const c of CITIES) out.push(`/${f.prefix}-${c.slug}`)       // 3×10 = 30
  return out
}
```

| المسار | العدد |
|---|---|
| صفحات ثابتة (`/`, `/services`, `/menu`, `/gallery`, `/prices`, `/about`, `/faq`, `/contact`, `/social`, `/occasions`, `/locations`) | 11 |
| `/services/:slug` | 8 |
| `/occasions/:slug` | حسب `OCCASIONS` |
| `/menu/:slug` | حسب `MENU` |
| `/locations/:slug` | 10 |
| `/<family>-<city>` | **30** |
| **الإجمالي** | **76 صفحة · 73 رابطًا في خريطة الموقع** |

### النصّ المطابق للعوائل — أهم سطر في `index.tsx`
```ts
app.get('/:combo{(qahwajiin|sababin-qahwa|diyafa-munasabat)-[a-z]+}', …)
```
تعبير نمطي محصور بثلاث بوادئ معروفة فقط، فلا يلتقط أي مسار عابر ولا
يتعارض مع `/services` أو `/menu`.

---

## 8. الدوال المساعدة

```ts
cityBySlug(slug)        // City | undefined
familyByPrefix(prefix)  // Family | undefined
familyCopy(family, city)// يختار النص الفريد الصحيح من الحقول الأربعة
localPaths()            // كل مسارات السيو المحلي (لخريطة الموقع)
CITY_NAMES              // أسماء المدن للشرائح والقوائم المنسدلة
```

`familyCopy` هي نقطة الالتقاء: تأخذ العائلة والمدينة وتُعيد النص الفريد
المناسب — وهي ما يجعل 30 صفحة مختلفة فعلًا لا شكلًا.

---

## 9. كيف أضيف محتوى؟ (وصفات جاهزة)

| أريد أن… | افعل |
|---|---|
| أغيّر نصًّا | ابحث عنه في `data.ts` أو `cities.ts` وعدِّله. لا تلمس `views.tsx`. |
| أضيف خدمة | أضف عنصرًا إلى `SERVICES` + صورة في `imgmap.ts` + ملفات WebP |
| أضيف مدينة | أضف `City` كاملة **بنصوص جديدة** → 4 صفحات تولد تلقائيًا |
| أضيف فئة تقديمات | أضف `MenuCat` إلى `MENU` |
| أضيف سؤالًا | أضف إلى `FAQ` → ينعكس تلقائيًا في `faqLd` وبيانات جوجل |
| أغيّر رقم الجوال | `BRAND` فقط — ثم أعد توليد QR |

</div>
