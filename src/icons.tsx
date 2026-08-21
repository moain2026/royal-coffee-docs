/**
 * Hand-built SVG icon set — 24x24, 1.5px stroke, currentColor.
 * ZERO emoji, ZERO clip-art, ZERO icon fonts.
 */

type P = { c?: string }

const S = (d: string, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}${extra}</svg>`

export const icons: Record<string, string> = {
  /* ── Hospitality-specific (custom drawn) ── */
  // دلة — Arabian coffee pot
  dallah: S(`<path d="M9 8h5a4 4 0 0 1 4 4v4a3 3 0 0 1-3 3h-3a3 3 0 0 1-3-3v-8Z"/><path d="M9 11H6.5a2.5 2.5 0 0 0 0 5H9"/><path d="M14 8V6.2a1.2 1.2 0 0 1 2.4 0V7"/><path d="M11 5.4 12.5 4 14 5.4"/><path d="M10 19v1.5h6V19"/>`),
  // فنجان — finjan cup
  finjan: S(`<path d="M6 9h10v5a5 5 0 0 1-10 0V9Z"/><path d="M16 10.5h1.6a2.4 2.4 0 0 1 0 4.8H16"/><path d="M4.5 21h13"/><path d="M9 6c0-1 .8-1.2.8-2.2M12.5 6c0-1 .8-1.2.8-2.2"/>`),
  // صينية — serving tray
  tray: S(`<ellipse cx="12" cy="13" rx="9" ry="4"/><path d="M3 13v1.5c0 2.2 4 4 9 4s9-1.8 9-4V13"/><path d="M8.5 10.5 12 7l3.5 3.5"/>`),
  // تمر — dates
  dates: S(`<ellipse cx="9" cy="14" rx="3.2" ry="5" transform="rotate(-16 9 14)"/><ellipse cx="15.4" cy="13" rx="2.8" ry="4.4" transform="rotate(14 15.4 13)"/><path d="M9.8 8.6 10.6 5M15 8.4 15.6 5.4"/>`),
  // مبخرة — incense burner
  mabkhara: S(`<path d="M7 13h10l-1 6H8l-1-6Z"/><path d="M6 13h12"/><path d="M9.5 19v2h5v-2"/><path d="M12 10c1.4-.9.4-2.2 0-3 1.6.5 2.4 2 1.4 3.4M10 10.4c-1-1 .2-2 .5-2.6"/>`),
  // خيمة — tent / majlis
  tent: S(`<path d="M12 4 3.5 19h17L12 4Z"/><path d="M12 4v15"/><path d="M9 19c0-2 1.4-3.6 3-3.6s3 1.6 3 3.6"/>`),
  // شماغ / rows of servers
  servers: S(`<circle cx="8" cy="8" r="3"/><path d="M3 20c0-2.8 2.2-5 5-5s5 2.2 5 5"/><circle cx="17" cy="9.5" r="2.4"/><path d="M14 20c0-2.2 1.4-4 3-4s4 1.4 4 4"/>`),
  // سقاء / water
  water: S(`<path d="M12 3.5s5.5 5.6 5.5 9.6A5.5 5.5 0 0 1 12 18.6 5.5 5.5 0 0 1 6.5 13.1c0-4 5.5-9.6 5.5-9.6Z"/><path d="M9.4 13.4c0 1.5 1.2 2.6 2.6 2.6"/><path d="M8 21h8"/>`),
  // هلال — crescent
  crescent: S(`<path d="M16.5 3.6a8.5 8.5 0 1 0 4 12.2 6.8 6.8 0 0 1-4-12.2Z"/>`),
  // قهوة تُصب
  pour: S(`<path d="M8 5h6a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H8V5Z"/><path d="M17 8h1.6a2 2 0 0 1 0 4H17"/><path d="M11 14v3.5"/><path d="M8.5 21h5.5a2.5 2.5 0 0 0 0-3.5H9"/>`),

  /* ── UI ── */
  phone: S(`<path d="M5.6 3.5h3l1.6 4-2 1.4a11.4 11.4 0 0 0 5.4 5.4l1.4-2 4 1.6v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.6 5.7a2 2 0 0 1 2-2.2Z"/>`),
  chat: S(`<path d="M20.5 11.6a8 8 0 0 1-11.6 7.1L4 20.2l1.5-4.7A8 8 0 1 1 20.5 11.6Z"/><path d="M9 11.5h.01M12.5 11.5h.01M16 11.5h.01"/>`),
  pin: S(`<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>`),
  clock: S(`<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>`),
  shield: S(`<path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6l-7-3Z"/><path d="M9 12l2.2 2.2L15.2 10"/>`),
  star: S(`<path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.6Z"/>`),
  check: S(`<path d="M4.5 12.5 9.5 17.5 19.5 6.5"/>`),
  chevron: S(`<path d="M6 9.5 12 15.5 18 9.5"/>`),
  arrow: S(`<path d="M14 6l-6 6 6 6"/>`),
  menu: S(`<path d="M4 7h16M4 12h16M4 17h11"/>`),
  close: S(`<path d="M6 6l12 12M18 6 6 18"/>`),
  home: S(`<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9.5Z"/>`),
  grid: S(`<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>`),
  images: S(`<rect x="3" y="5" width="18" height="14" rx="2.4"/><circle cx="8.5" cy="10" r="1.6"/><path d="M3 16.5 8 12l3.5 3.2 3-2.6L21 18"/>`),
  sparkle: S(`<path d="M12 3.5 13.6 9 19 10.6 13.6 12.2 12 17.6 10.4 12.2 5 10.6 10.4 9 12 3.5Z"/><path d="M18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z"/>`),
  instagram: S(`<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17" cy="7" r=".9" fill="currentColor" stroke="none"/>`),
  snapchat: S(`<path d="M12 3.5c2.6 0 4 1.9 4 4.3 0 1 .1 1.9-.1 2.6.6.3 1.3-.4 1.8.1.4.4 0 1-.7 1.5-.7.5-1.4.7-1.3 1.2.2.9 2.2 2.4 3.4 2.7.5.1.4.7-.1.9-.8.3-1.7.3-2 .7-.2.3-.1.9-.7.9-.9 0-1.9-.6-3.3-.6s-2.4.6-3.3.6c-.6 0-.5-.6-.7-.9-.3-.4-1.2-.4-2-.7-.5-.2-.6-.8-.1-.9 1.2-.3 3.2-1.8 3.4-2.7.1-.5-.6-.7-1.3-1.2-.7-.5-1.1-1.1-.7-1.5.5-.5 1.2.2 1.8-.1-.2-.7-.1-1.6-.1-2.6C8 5.4 9.4 3.5 12 3.5Z"/>`),
  tiktok: S(`<path d="M14 4v9.6a3.4 3.4 0 1 1-3.4-3.4c.4 0 .7 0 1 .1"/><path d="M14 4c.3 2.4 2 4 4.4 4.2"/>`),
  x: S(`<path d="M4.5 4.5 19.5 19.5M19.5 4.5 4.5 19.5"/>`),
  send: S(`<path d="M20.5 3.5 10 14"/><path d="M20.5 3.5 14.4 20.5l-2.6-6.4L5.4 11.5 20.5 3.5Z"/>`),
  crown: S(`<path d="M3.5 8.5l3.2 3L12 5l5.3 6.5 3.2-3-1.8 9.5H5.3L3.5 8.5Z"/><path d="M5.3 18h13.4"/>`),
  award: S(`<circle cx="12" cy="9.5" r="5.5"/><path d="M9 14.4 7.5 21l4.5-2.4 4.5 2.4-1.5-6.6"/>`),
  users: S(`<circle cx="9" cy="8" r="3.4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.4a3.4 3.4 0 0 1 0 6.6M17.5 20c0-2.4-.8-4.4-2-5.5"/>`),
  calendar: S(`<rect x="3.5" y="5.5" width="17" height="15" rx="2.4"/><path d="M3.5 10h17M8 3.5v4M16 3.5v4"/>`),
  leaf: S(`<path d="M20 4C10 4 4 9 4 16c0 2 .6 3.4.6 3.4S9 12 20 4Z"/><path d="M4.6 19.4C8 16 13 13 18 11.6"/>`),

  /* ── Extra social platforms ── */
  facebook: S(`<path d="M14.5 8.5V6.8c0-.9.6-1.3 1.4-1.3H17.5V2.6h-2.4a4 4 0 0 0-4 4v1.9H9v3h2.1V21h3.4v-9.5h2.6l.4-3h-3Z"/>`),
  youtube: S(`<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.5 9.5l5 2.5-5 2.5v-5Z"/>`),
  linkedin: S(`<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M7.5 10.5V16.5M7.5 7.6v.1"/><path d="M11.5 16.5v-3.4a2.1 2.1 0 0 1 4.2 0v3.4"/><path d="M11.5 10.5v6"/>`),
  telegram: S(`<path d="M21 4.5 2.8 11.4l5 1.7L20.9 4.6Z"/><path d="M7.8 13.1l.6 5.6 3-3.1"/><path d="M8.4 18.7 21 4.5l-3 15-6.6-2.9"/>`),
  threads: S(`<path d="M12 20.5c-4.8 0-8-3-8-8.5S7.2 3.5 12 3.5c3.4 0 5.8 1.5 6.9 4"/><path d="M12.6 15.9c-2 .2-3.3-.6-3.4-2 0-1.3 1.2-2.2 3-2.2 2.4 0 3.8 1.3 3.8 3.5 0 2-1.3 3.3-3 3.3"/><path d="M16 15.2c0-2.9-1.4-4.6-4-4.6-1.2 0-2.2.3-3 .9"/>`),
  pinterest: S(`<circle cx="12" cy="12" r="8.5"/><path d="M11.4 15.6 9.8 21"/><path d="M8.9 14.6a3.6 3.6 0 0 1-.5-2c0-2.5 2-4.4 4.4-4.4 2.2 0 3.7 1.4 3.7 3.4 0 2.4-1.4 4.2-3.2 4.2-.9 0-1.6-.6-1.6-1.4"/>`),
  maps: S(`<path d="M20.5 4.5 15 6.6 9 4.5 3.5 6.6v12.9L9 17.4l6 2.1 5.5-2.1V4.5Z"/><path d="M9 4.5v12.9M15 6.6v12.9"/>`),
  share: S(`<circle cx="17.5" cy="5.5" r="2.5"/><circle cx="6.5" cy="12" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/><path d="M15.3 6.8 8.7 10.7M8.7 13.3l6.6 3.9"/>`),
  qr: S(`<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><path d="M14 14h2v2h-2zM18.5 14h2M14 18.5h2M18.5 18.5h2v2h-2z"/>`),
  copy: S(`<rect x="8.5" y="8.5" width="12" height="12" rx="2.4"/><path d="M15.5 5.5h-9a2 2 0 0 0-2 2v9"/>`),
  route: S(`<circle cx="6" cy="6.5" r="2.5"/><circle cx="18" cy="17.5" r="2.5"/><path d="M8.5 6.5h5.5a3 3 0 0 1 0 6H10a3 3 0 0 0 0 6h5.5"/>`),
  layers: S(`<path d="M12 3.5 3.5 8 12 12.5 20.5 8 12 3.5Z"/><path d="M3.5 12.5 12 17l8.5-4.5M3.5 16.5 12 21l8.5-4.5"/>`),
  spark: S(`<path d="M12 2.5v5M12 16.5v5M2.5 12h5M16.5 12h5"/><path d="M5.6 5.6l3 3M15.4 15.4l3 3M18.4 5.6l-3 3M8.6 15.4l-3 3"/>`),
  help: S(`<circle cx="12" cy="12" r="9.2"/><path d="M9.3 9.1a2.8 2.8 0 1 1 3.6 2.7c-.6.2-.9.7-.9 1.3v.5"/><path d="M12 17.1h.01"/>`),
}

/** Render an icon by name. Returns raw SVG string for use with dangerouslySetInnerHTML-free JSX. */
export const Icon = ({ n, c }: { n: string; c?: string }) => {
  const svg = icons[n] ?? icons.sparkle
  return <span class={c} dangerouslySetInnerHTML={{ __html: svg }} />
}

export const raw = (n: string) => icons[n] ?? icons.sparkle
