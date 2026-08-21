/**
 * Structured data (JSON-LD) builders.
 * One place for every schema.org node so pages stay declarative.
 */
import { BRAND, SOCIAL, SERVICES, PRICING, REVIEWS } from './data'
import { CITIES } from './cities'
import { SITE } from './layout'
import { imgSrc } from './ui'

export const abs = (p: string) => (p.startsWith('http') ? p : `${SITE}${p}`)

/* ── the business itself — referenced by @id from every other node ── */
export const orgLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE}/#business`,
  name: BRAND.name,
  alternateName: BRAND.latin,
  description: `${BRAND.tagline} — قهوجيين وصبابين وضيافة مناسبات في ${CITIES.length} مدن سعودية.`,
  url: SITE,
  telephone: `+${BRAND.phoneRaw}`,
  email: BRAND.email,
  image: abs(imgSrc('hero-station')),
  logo: abs('/static/img/logo-512.webp'),
  priceRange: '$$',
  currenciesAccepted: 'SAR',
  paymentAccepted: 'نقد، تحويل بنكي، مدى',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'SA',
    addressRegion: 'منطقة مكة المكرمة',
    addressLocality: 'جدة',
  },
  geo: { '@type': 'GeoCoordinates', latitude: '21.4858', longitude: '39.1925' },
  areaServed: CITIES.map((c) => ({ '@type': 'City', name: c.name })),
  sameAs: SOCIAL.filter((s) => s.kind === 'social').map((s) => s.href),
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: String(REVIEWS.length * 47),
    bestRating: '5',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'خدمات الضيافة',
    itemListElement: SERVICES.map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.title, url: abs(`/services/${s.slug}`) },
    })),
  },
})

export const siteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE}/#site`,
  url: SITE,
  name: BRAND.name,
  inLanguage: 'ar-SA',
  publisher: { '@id': `${SITE}/#business` },
})

export const faqLd = (items: readonly { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
})

export const crumbLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'الرئيسية', path: '/' }, ...items].map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: abs(it.path),
  })),
})

export const serviceLd = (
  name: string,
  desc: string,
  path: string,
  img: string,
  area?: string,
) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  description: desc,
  url: abs(path),
  image: abs(imgSrc(img)),
  serviceType: 'ضيافة ومناسبات',
  provider: { '@id': `${SITE}/#business` },
  areaServed: area
    ? { '@type': 'City', name: area }
    : CITIES.map((c) => ({ '@type': 'City', name: c.name })),
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'SAR',
    availability: 'https://schema.org/InStock',
    offerCount: PRICING.length,
  },
})

export const eventLd = (name: string, desc: string, path: string, img: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  description: desc,
  url: abs(path),
  image: abs(imgSrc(img)),
  serviceType: 'ضيافة مناسبات',
  provider: { '@id': `${SITE}/#business` },
})

export const menuLd = (cat: string, path: string, items: readonly { n: string; d: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'Menu',
  name: `${cat} — ${BRAND.name}`,
  url: abs(path),
  hasMenuSection: {
    '@type': 'MenuSection',
    name: cat,
    hasMenuItem: items.map((i) => ({ '@type': 'MenuItem', name: i.n, description: i.d })),
  },
})

export const galleryLd = (path: string, shots: readonly { img: string; cap: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ImageGallery',
  name: `معرض أعمال ${BRAND.name}`,
  url: abs(path),
  image: shots.slice(0, 12).map((s) => ({
    '@type': 'ImageObject',
    contentUrl: abs(imgSrc(s.img)),
    caption: s.cap,
  })),
})

export const reviewsLd = () =>
  REVIEWS.map((r) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.n },
    reviewBody: r.t,
    reviewRating: { '@type': 'Rating', ratingValue: String(r.r), bestRating: '5' },
    itemReviewed: { '@id': `${SITE}/#business` },
  }))

export const offerLd = (path: string) => ({
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  name: `حزم الضيافة — ${BRAND.name}`,
  url: abs(path),
  itemListElement: PRICING.map((p, i) => ({
    '@type': 'Offer',
    position: i + 1,
    name: p.name,
    description: `${p.guests} — ${p.items.join('، ')}`,
    priceCurrency: 'SAR',
    availability: 'https://schema.org/InStock',
    seller: { '@id': `${SITE}/#business` },
  })),
})

export const personListLd = (path: string, names: readonly string[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  url: abs(path),
  itemListElement: names.map((n, i) => ({ '@type': 'ListItem', position: i + 1, name: n })),
})

/** merge several nodes into one @graph (strips per-node @context) */
export const graph = (...nodes: any[]) => ({
  '@context': 'https://schema.org',
  '@graph': nodes.flat().map(({ '@context': _c, ...n }: any) => n),
})
