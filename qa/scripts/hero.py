from playwright.sync_api import sync_playwright
import time
B = 'http://localhost:3000'


def probe(pg, label):
    """Report the geometry of every hero text layer to find real overlaps."""
    rows = pg.evaluate("""() => {
      const sels = ['.hero .eyebrow','.hero h1','.hero .rule','.hero p','.hero .btn-row'];
      return sels.map(s => {
        const el = document.querySelector(s);
        if (!el) return {s, miss:1};
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {s, top:+r.top.toFixed(1), bot:+r.bottom.toFixed(1),
                h:+r.height.toFixed(1), w:+r.width.toFixed(1),
                lh:cs.lineHeight, fs:cs.fontSize, pos:cs.position};
      });
    }""")
    print(f"\n--- {label} ---")
    prev = None
    for r in rows:
        if r.get('miss'):
            print(f"  {r['s']:20} MISSING"); continue
        flag = ''
        if prev and r['top'] < prev['bot'] - 0.5:
            flag = f"  <<< OVERLAPS {prev['s']} by {prev['bot']-r['top']:.1f}px"
        print(f"  {r['s']:20} top={r['top']:7.1f} bot={r['bot']:7.1f} "
              f"h={r['h']:6.1f} w={r['w']:6.1f} fs={r['fs']:>6} lh={r['lh']:>8}{flag}")
        prev = r


with sync_playwright() as pw:
    br = pw.chromium.launch()
    for w, h, dsf, mob, tag in [(390, 844, 3, True, 'mobile'),
                                (768, 1024, 2, True, 'tablet'),
                                (1440, 900, 2, False, 'desktop')]:
        ctx = br.new_context(viewport={'width': w, 'height': h},
                             device_scale_factor=dsf, is_mobile=mob, has_touch=mob)
        pg = ctx.new_page()
        pg.goto(B + '/', wait_until='networkidle')
        time.sleep(1.6)
        probe(pg, f'{tag} {w}x{h}')
        pg.screenshot(path=f'v4/hero_{tag}.png',
                      clip={'x': 0, 'y': 0, 'width': w, 'height': min(h, 900)})
        ctx.close()
    br.close()
print('\ndone')
