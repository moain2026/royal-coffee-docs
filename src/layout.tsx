import type { Child } from 'hono/jsx'
import { imgSrc, imgSet } from './ui'
import { hasImg } from './imgmap'
import { BRAND, NAV, NAV_MAIN, SOCIAL } from './data'
import { CITIES, FAMILIES } from './cities'
import { raw } from './icons'

const V = '3' // asset cache-bust
export const SITE = 'https://royal-coffee.pages.dev'

type Props = {
  title: string
  desc: string
  path: string
  children: Child
  jsonld?: object
  /** name of the LCP image for this page (no size suffix) */
  hero?: string
  /** hide the floating action dock (e.g. on the QR page) */
  bare?: boolean
}

export const Layout = ({ title, desc, path, children, jsonld, hero = 'souqiya', bare }: Props) => {
  const full = `${title} | ${BRAND.name}`
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#080706" />
        <title>{full}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${SITE}${path}`} />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <meta name="author" content={BRAND.name} />

        {/* Geo signals */}
        <meta name="geo.region" content="SA" />
        <meta name="geo.placename" content="Jeddah" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ar_SA" />
        <meta property="og:site_name" content={BRAND.name} />
        <meta property="og:title" content={full} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={`${SITE}${path}`} />
        <meta property="og:image" content={`${SITE}${imgSrc(hero)}`} />
        <meta property="og:image:alt" content={BRAND.name} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={full} />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:image" content={`${SITE}${imgSrc(hero)}`} />

        {/* Icons */}
        <link rel="icon" href={`/static/img/favicon.png?v=${V}`} type="image/png" />
        <link rel="apple-touch-icon" href={`/static/img/apple-touch-icon.png?v=${V}`} />
        <meta name="apple-mobile-web-app-title" content={BRAND.name} />

        {/* Fonts — preconnect + single request */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;500;700&display=swap"
        />

        {/* LCP preload — per-page hero (the QR page has no hero image).
            When an art-directed portrait twin exists, the preload has to be
            split by the SAME media query the <picture> uses, otherwise the
            phone downloads the landscape file it will never paint. */}
        {bare ? (
          <link rel="preload" as="image" href="/static/img/logo-512.webp" fetchpriority="high" />
        ) : hasImg(`${hero}-tall`) ? (
          <>
            <link
              rel="preload"
              as="image"
              media="(max-width:767px)"
              href={imgSrc(`${hero}-tall`)}
              imagesrcset={imgSet(`${hero}-tall`)}
              imagesizes="100vw"
              fetchpriority="high"
            />
            <link
              rel="preload"
              as="image"
              media="(min-width:768px)"
              href={imgSrc(hero)}
              imagesrcset={imgSet(hero)}
              imagesizes="100vw"
              fetchpriority="high"
            />
          </>
        ) : (
          <link
            rel="preload"
            as="image"
            href={imgSrc(hero)}
            imagesrcset={imgSet(hero)}
            imagesizes="100vw"
            fetchpriority="high"
          />
        )}

        <link rel="stylesheet" href={`/static/style.css?v=${V}`} />
        {jsonld && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
        )}
      </head>
      <body>
        <a href="#main" class="sr">تجاوز إلى المحتوى</a>
        <div class="pgline" id="pgline" aria-hidden="true"></div>

        {/* ── Header ── */}
        <header class="hdr" id="hdr">
          <div class="hdr-in">
            <a href="/" class="brand" aria-label={BRAND.name}>
              <img
                src="/static/img/logo-192.webp"
                srcset="/static/img/logo-192.webp 192w, /static/img/logo-512.webp 512w"
                sizes="52px"
                alt=""
                width="52"
                height="52"
              />
              <span class="brand-txt">
                <b>{BRAND.name}</b>
                <span>{BRAND.latin}</span>
              </span>
            </a>

            <nav class="nav" aria-label="التنقل الرئيسي">
              {NAV_MAIN.map((n) => (
                <a href={n.href} aria-current={path.startsWith(n.href) ? 'page' : undefined}>
                  {n.label}
                </a>
              ))}
            </nav>

            <div class="hdr-act">
              <a href={`tel:${BRAND.phoneLocal}`} class="hdr-tel" aria-label="اتصل بنا">
                <span dangerouslySetInnerHTML={{ __html: raw('phone') }} />
              </a>
              <a href="/contact" class="btn btn-gold hdr-cta">
                <span dangerouslySetInnerHTML={{ __html: raw('send') }} />
                احجز ضيافتك
              </a>
              <button class="burger" id="burger" aria-label="فتح القائمة" aria-expanded="false" aria-controls="sheet">
                <span dangerouslySetInnerHTML={{ __html: raw('menu') }} />
              </button>
            </div>
          </div>
        </header>

        {/* ── Mobile sheet ── */}
        <div class="sheet-bd" id="sheetBd" hidden></div>
        <nav class="sheet" id="sheet" aria-label="قائمة الجوال" aria-hidden="true">
          <div class="sheet-grip"></div>

          {/* A menu, not a landing page: one identity line, two slim
              conversion pills, a compact tile grid, one quiet footer row.
              Every descriptive sub-line was removed on purpose — the labels
              are self-evident and the sheet has to stay thumb-sized. */}
          <div class="sheet-bar">
            <span class="sheet-id">
              <img src="/static/img/logo-192.webp" alt="" width="28" height="28" loading="lazy" />
              <b>{BRAND.name}</b>
            </span>
            <span class="sheet-act">
              <a href={BRAND.whatsapp} class="sact sact-wa" rel="noopener" target="_blank">
                <span dangerouslySetInnerHTML={{ __html: raw('chat') }} />
                واتساب
              </a>
              <a href={`tel:${BRAND.phoneLocal}`} class="sact sact-tel">
                <span dangerouslySetInnerHTML={{ __html: raw('phone') }} />
                اتصال
              </a>
            </span>
          </div>

          <div class="sheet-list">
            {NAV.map((n) => (
              <a href={n.href} aria-current={n.href === path ? 'page' : undefined}>
                <span dangerouslySetInnerHTML={{ __html: raw(n.icon) }} />
                <b>{n.label}</b>
              </a>
            ))}
          </div>

          <div class="sheet-foot">
            <a href="/locations">كل المدن</a>
            <a href={`tel:${BRAND.phoneLocal}`} class="ltr">{BRAND.phoneDisplay}</a>
          </div>
        </nav>

        <main id="main">{children}</main>

        {/* ── Footer ── */}
        <footer class="ftr">
          <div class="wrap">
            <div class="ftr-grid">
              <div class="ftr-brand">
                <a href="/" class="brand" style="margin-bottom:18px">
                  <img src="/static/img/logo-192.webp" alt="" width="56" height="56" loading="lazy" />
                  <span class="brand-txt">
                    <b>{BRAND.name}</b>
                    <span>{BRAND.latin}</span>
                  </span>
                </a>
                <p>
                  ضيافة عربية بمعايير ملكية — قهوجيين وصبابين ومباشرين محترفين لمناسباتك في عشر مدن
                  بالمملكة، بعدّة نحاسية مصقولة وحضورٍ منظّم وتسعيرٍ واضح مسبقاً.
                </p>
                <div class="social">
                  {SOCIAL.filter((s) => s.kind === 'social')
                    .slice(0, 7)
                    .map((s) => (
                      <a href={s.href} aria-label={s.label} rel="noopener" target="_blank">
                        <span dangerouslySetInnerHTML={{ __html: raw(s.n) }} />
                      </a>
                    ))}
                </div>
                <a href="/social" class="btn btn-ghost" style="margin-top:16px">
                  <span dangerouslySetInnerHTML={{ __html: raw('qr') }} />
                  كل حساباتنا في صفحة واحدة
                </a>
              </div>

              <div>
                <h4>الخدمات</h4>
                <div class="ftr-links">
                  <a href="/services/qahwajiin">ضيافة الرجال</a>
                  <a href="/services/qahwajiat">ضيافة النساء</a>
                  <a href="/services/zamzam">سقاية ماء زمزم</a>
                  <a href="/services/offerings">التمور والحلى</a>
                  <a href="/services/buffet">البوفيه والمداخل</a>
                  <a href="/services/equipment">العدة واللوازم</a>
                  <a href="/services/royal">الضيافة الملكية</a>
                  <a href="/services/extras">إضافات المناسبة</a>
                </div>
              </div>

              <div>
                <h4>قهوجيين حسب المدينة</h4>
                <div class="ftr-links">
                  {CITIES.slice(0, 7).map((c) => (
                    <a href={`/qahwajiin-${c.slug}`}>قهوجيين {c.name}</a>
                  ))}
                  <a href="/locations">كل المدن</a>
                </div>
              </div>

              <div>
                <h4>تواصل معنا</h4>
                <div class="ftr-links">
                  <a href={`tel:${BRAND.phoneLocal}`} class="ltr">
                    {BRAND.phoneDisplay}
                  </a>
                  <a href={BRAND.whatsapp} rel="noopener">واتساب</a>
                  <a href={`mailto:${BRAND.email}`} class="ltr">
                    {BRAND.email}
                  </a>
                  <a href="/prices">قائمة الأسعار</a>
                  <a href="/contact">نموذج الحجز</a>
                  <a href="/faq">الأسئلة الشائعة</a>
                </div>
                <p style="margin-top:14px;font-size:13.5px">
                  الاستقبال ٢٤ ساعة · جميع أيام الأسبوع
                </p>
              </div>
            </div>

            {/* Local-SEO link mesh — real crawlable links */}
            <div class="ftr-mesh">
              <h4>صفحات المدن</h4>
              <div class="mesh">
                {FAMILIES.map((f) =>
                  CITIES.map((c) => (
                    <a href={`/${f.prefix}-${c.slug}`}>
                      {f.noun} {c.name}
                    </a>
                  )),
                )}
              </div>
            </div>

            <div class="ftr-base">
              <span>© ٢٠٢٥ {BRAND.name} — جميع الحقوق محفوظة</span>
              <span>صُمِّم وبُني بعناية</span>
            </div>
          </div>
        </footer>

        {/* ── Floating action dock (mobile conversion) ── */}
        {!bare && (
          <div class="dock" id="dock">
            <a href={`tel:${BRAND.phoneLocal}`} class="dock-btn dock-tel">
              <span dangerouslySetInnerHTML={{ __html: raw('phone') }} />
              اتصل
            </a>
            <a href={BRAND.whatsapp} class="dock-btn dock-wa" rel="noopener" target="_blank">
              <span dangerouslySetInnerHTML={{ __html: raw('chat') }} />
              واتساب
            </a>
          </div>
        )}

        {/* ── Bottom app nav ── */}
        {!bare && (
        <nav class="bnav" aria-label="تنقل سريع">
          <a href="/" aria-current={path === '/' ? 'page' : undefined}>
            <span dangerouslySetInnerHTML={{ __html: raw('home') }} />
            الرئيسية
          </a>
          <a href="/services" aria-current={path.startsWith('/services') ? 'page' : undefined}>
            <span dangerouslySetInnerHTML={{ __html: raw('grid') }} />
            الخدمات
          </a>
          <a href={BRAND.whatsapp} class="center" rel="noopener" aria-label="حجز عبر واتساب">
            <span dangerouslySetInnerHTML={{ __html: raw('chat') }} />
            <em>احجز</em>
          </a>
          <a href="/gallery" aria-current={path === '/gallery' ? 'page' : undefined}>
            <span dangerouslySetInnerHTML={{ __html: raw('images') }} />
            أعمالنا
          </a>
          <a href="/social" aria-current={path === '/social' ? 'page' : undefined}>
            <span dangerouslySetInnerHTML={{ __html: raw('share') }} />
            حساباتنا
          </a>
        </nav>
        )}

        <div class="toast" id="toast" role="status" aria-live="polite">
          <span dangerouslySetInnerHTML={{ __html: raw('check') }} />
          <span id="toastMsg"></span>
        </div>

        <script src={`/static/app.js?v=${V}`} defer></script>
      </body>
    </html>
  )
}
