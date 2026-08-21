/**
 * Shared presentational atoms & molecules.
 * Pure, stateless, no side effects — composed by views.
 *
 * IMAGE CONVENTION: every asset exists ONLY as
 *   {name}-sm.webp (480w) · {name}-md.webp (900w) · {name}-lg.webp (1600w)
 * There is no bare {name}.webp. Always go through <Img> / <Pic>.
 */
import type { Child } from 'hono/jsx'
import { Icon, raw } from './icons'
import { BRAND, PILLARS, STATS, STEPS, type Service } from './data'
import { CITIES } from './cities'
import { IMG, IMG_W } from './imgmap'

const B = '/static/img'

/* ── Responsive image (the ONE place srcsets are built) ──────
 * Reads the generated IMG map so we only ever emit variants that
 * actually exist on disk — zero 404s, correct intrinsic ratio.  */
export const Img = ({
  n,
  alt,
  sizes = '(min-width:1024px) 380px, (min-width:768px) 46vw, 92vw',
  eager = false,
  cls,
  ratio,
}: {
  n: string
  alt: string
  sizes?: string
  eager?: boolean
  cls?: string
  ratio?: number
}) => {
  const rec = IMG[n]
  const av = rec ? rec[0] : ['sm', 'md']
  const iw = rec ? rec[1] : 900
  const ih = rec ? rec[2] : 675
  const best = av[av.length - 1]
  const w = ratio ? 1200 : iw
  const h = ratio ? Math.round(1200 / ratio) : ih
  return (
    <img
      class={cls}
      src={`${B}/${n}-${best}.webp`}
      srcset={av.map((s) => `${B}/${n}-${s}.webp ${IMG_W[s]}w`).join(', ')}
      sizes={sizes}
      alt={alt}
      width={w}
      height={h}
      loading={eager ? 'eager' : 'lazy'}
      fetchpriority={eager ? 'high' : undefined}
      decoding="async"
    />
  )
}

/* ── Art-directed hero image ─────────────────────────────────
 * A 16:9 still cropped into a tall phone frame keeps only a narrow
 * vertical sliver — on a 390px screen that meant the dallah fell
 * outside the crop and users saw nothing but blurred bokeh. So the
 * phone gets its own PORTRAIT composition and the desktop keeps the
 * landscape one, selected by <source media> so only one is ever
 * fetched. `tall` must be a registered name in the IMG map.        */
export const HeroPic = ({
  wide,
  tall,
  alt,
  eager = false,
}: {
  wide: string
  tall: string
  alt: string
  eager?: boolean
}) => {
  const w = IMG[wide]
  const t = IMG[tall]
  const set = (n: string, av: string[]) =>
    av.map((s) => `${B}/${n}-${s}.webp ${IMG_W[s]}w`).join(', ')
  return (
    <picture>
      {/* phones & small tablets: portrait crop */}
      <source
        media="(max-width:767px)"
        srcset={set(tall, t ? t[0] : ['sm', 'md'])}
        sizes="100vw"
        width={t ? t[1] : 900}
        height={t ? t[2] : 1600}
      />
      <img
        src={`${B}/${wide}-${w ? w[0][w[0].length - 1] : 'md'}.webp`}
        srcset={set(wide, w ? w[0] : ['sm', 'md'])}
        sizes="100vw"
        alt={alt}
        width={w ? w[1] : 1600}
        height={w ? w[2] : 893}
        loading={eager ? 'eager' : 'lazy'}
        fetchpriority={eager ? 'high' : undefined}
        decoding="async"
      />
    </picture>
  )
}

/** Largest existing variant path — for LCP preload / OG images. */
export const imgSrc = (n: string) => {
  const rec = IMG[n]
  const av = rec ? rec[0] : ['md']
  return `${B}/${n}-${av[av.length - 1]}.webp`
}
export const imgSet = (n: string) => {
  const rec = IMG[n]
  const av = rec ? rec[0] : ['sm', 'md']
  return av.map((s) => `${B}/${n}-${s}.webp ${IMG_W[s]}w`).join(', ')
}

/* ── Ornamental rule (diamond divider) ─────────────────────── */
export const Rule = () => (
  <div class="rule" aria-hidden="true">
    <i />
  </div>
)

/* ── Eyebrow label with gold hairlines ─────────────────────── */
export const Eyebrow = ({ children }: { children: Child }) => <p class="eyebrow">{children}</p>

/* ── Section heading block ─────────────────────────────────── */
export const SecHead = ({
  kicker,
  title,
  desc,
  rule = true,
}: {
  kicker: string
  title: Child
  desc?: string
  rule?: boolean
}) => (
  <header class="sec-head rv">
    <Eyebrow>{kicker}</Eyebrow>
    <h2>{title}</h2>
    {rule && <Rule />}
    {desc && <p>{desc}</p>}
  </header>
)

/* ── Breadcrumbs ───────────────────────────────────────────── */
export const Crumbs = ({ items }: { items: { href?: string; label: string }[] }) => (
  <nav class="crumbs" aria-label="مسار التنقل">
    <ol>
      <li>
        <a href="/">الرئيسية</a>
      </li>
      {items.map((it) => (
        <li>{it.href ? <a href={it.href}>{it.label}</a> : <span aria-current="page">{it.label}</span>}</li>
      ))}
    </ol>
  </nav>
)

/* ── Page hero (inner pages) ───────────────────────────────── */
export const PageHead = ({
  kicker,
  title,
  desc,
  img = 'souqiya',
  crumbs,
  children,
}: {
  kicker: string
  title: Child
  desc: string
  img?: string
  crumbs?: { href?: string; label: string }[]
  children?: Child
}) => (
  <section class="hero hero-pg">
    <div class="hero-bg">
      <Img n={img} alt="" sizes="100vw" eager />
    </div>
    <div class="hero-in">
      {crumbs && <Crumbs items={crumbs} />}
      <Eyebrow>{kicker}</Eyebrow>
      <h1>{title}</h1>
      <Rule />
      <p class="lead">{desc}</p>
      {children}
    </div>
  </section>
)

/* ── Sticky conversion bar shown under page heroes ─────────── */
export const QuickBar = ({ label = 'احجز ضيافتك' }: { label?: string }) => (
  <div class="qbar rv">
    <a class="qbar-tel" href={`tel:${BRAND.phoneLocal}`}>
      <span dangerouslySetInnerHTML={{ __html: raw('phone') }} />
      <em>{BRAND.phoneDisplay}</em>
    </a>
    <a class="btn btn-gold" href={BRAND.whatsapp} rel="noopener" target="_blank">
      <span dangerouslySetInnerHTML={{ __html: raw('chat') }} />
      {label}
    </a>
  </div>
)

/* ── Service card ──────────────────────────────────────────── */
export const ServiceCard = ({ s, eager = false }: { s: Service; eager?: boolean }) => (
  <a class="card svc rv" href={`/services/${s.slug}`}>
    <div class="svc-media">
      <Img n={s.img} alt={s.title} eager={eager} />
      <span class="badge badge-line badge-float">{s.badge}</span>
    </div>
    <div class="svc-body">
      <h3>{s.title}</h3>
      <p>{s.short}</p>
      <div class="svc-foot">
        <span class="badge badge-line">
          <Icon n={s.icon} />
          ضيافة كاملة
        </span>
        <span class="btn btn-ghost" aria-hidden="true">
          التفاصيل
          <span dangerouslySetInnerHTML={{ __html: raw('arrow') }} />
        </span>
      </div>
    </div>
  </a>
)

/* ── Stats band ────────────────────────────────────────────── */
export const StatsBand = () => (
  <div class="grid g2 g-lg4 rv">
    {STATS.map((s) => (
      <div class="stat">
        <b class="num">{s.v}</b>
        <span>{s.l}</span>
      </div>
    ))}
  </div>
)

/* ── Numbered pillars (why-us) ─────────────────────────────── */
export const Pillars = () => (
  <div class="grid g-md2 rv">
    {PILLARS.map((p, i) => (
      <div class="pillar">
        <div class="medal num" aria-hidden="true">
          {String(i + 1).padStart(2, '0')}
        </div>
        <div>
          <h4>{p.t}</h4>
          <p>{p.d}</p>
        </div>
      </div>
    ))}
  </div>
)

/* ── Process steps ─────────────────────────────────────────── */
export const Steps = () => (
  <ol class="steps rv">
    {STEPS.map((s, i) => (
      <li>
        <div class="step-ico">
          <Icon n={s.icon} />
          <b class="num">{String(i + 1)}</b>
        </div>
        <h4>{s.t}</h4>
        <p>{s.d}</p>
      </li>
    ))}
  </ol>
)

/* ── City chips (links, not dead text) ─────────────────────── */
export const CityChips = ({ active }: { active?: string }) => (
  <div class="chips rv">
    {CITIES.map((c) => (
      <a class={`chip${c.slug === active ? ' on' : ''}`} href={`/locations/${c.slug}`}>
        <span dangerouslySetInnerHTML={{ __html: raw('pin') }} />
        {c.name}
      </a>
    ))}
  </div>
)

/* ── Gallery strip: "لمحة من أعمالنا" with flip reveal ─────── */
export const WorksStrip = ({
  shots,
  cols = 6,
}: {
  shots: { img: string; cap: string; tall?: boolean }[]
  cols?: number
}) => (
  <div class="gal" data-cols={cols}>
    {shots.map((g, i) => (
      <figure class={g.tall ? 'flip tall' : 'flip'} style={`--d:${(i % 6) * 70}ms`}>
        <Img n={g.img} alt={g.cap} sizes="(min-width:1024px) 33vw, (min-width:768px) 46vw, 92vw" />
        <figcaption>{g.cap}</figcaption>
      </figure>
    ))}
  </div>
)

/* ── Closing CTA band ──────────────────────────────────────── */
export const CtaBand = ({
  kicker = 'جاهزون لمناسبتك',
  title = 'خلِّ ضيافتك حديث ضيوفك',
  desc = 'أرسل لنا تفاصيل مناسبتك — التاريخ، المدينة، وعدد الضيوف — ويصلك عرض سعر مفصّل قبل أي تأكيد.',
}: {
  kicker?: string
  title?: string
  desc?: string
}) => (
  <section class="sec sec-cta">
    <div class="wrap">
      <div class="cta-band rv">
        <div class="cta-glow" aria-hidden="true" />
        <Eyebrow>{kicker}</Eyebrow>
        <h2>{title}</h2>
        <Rule />
        <p class="lead" style="max-width:56ch;margin-inline:auto">
          {desc}
        </p>
        <a class="cta-phone" href={`tel:${BRAND.phoneLocal}`}>
          {BRAND.phoneDisplay}
        </a>
        <div class="btn-row">
          <a href={BRAND.whatsapp} class="btn btn-gold btn-lg" rel="noopener" target="_blank">
            <span dangerouslySetInnerHTML={{ __html: raw('chat') }} />
            حجز عبر واتساب
          </a>
          <a href="/contact" class="btn btn-line btn-lg">
            <span dangerouslySetInnerHTML={{ __html: raw('send') }} />
            نموذج الحجز
          </a>
        </div>
        <p class="cta-fine">
          <span dangerouslySetInnerHTML={{ __html: raw('shield') }} />
          عرض سعر مكتوب قبل التأكيد · بلا بنود مخفية · استقبال ٢٤ ساعة
        </p>
      </div>
    </div>
  </section>
)

/* ── FAQ accordion ─────────────────────────────────────────── */
export const Faq = ({ items }: { items: readonly { q: string; a: string }[] }) => (
  <div class="faq rv">
    {items.map((f) => (
      <details>
        <summary>
          {f.q}
          <span class="chev" aria-hidden="true" dangerouslySetInnerHTML={{ __html: raw('chevron') }} />
        </summary>
        <div class="ans">{f.a}</div>
      </details>
    ))}
  </div>
)
