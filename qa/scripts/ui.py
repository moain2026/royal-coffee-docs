from playwright.sync_api import sync_playwright
import time
B = 'http://localhost:3000'


def shot_el(pg, sel, path, pad=14):
    """Screenshot exactly around an element, padded, so nothing is guessed."""
    el = pg.query_selector(sel)
    if not el:
        print('MISSING', sel); return
    b = el.bounding_box()
    pg.screenshot(path=path, clip={
        'x': max(0, b['x'] - pad), 'y': max(0, b['y'] - pad),
        'width': b['width'] + pad * 2, 'height': b['height'] + pad * 2})
    print(f"{sel:16} {b['width']:.0f}x{b['height']:.0f} @ ({b['x']:.0f},{b['y']:.0f})")


with sync_playwright() as pw:
    br = pw.chromium.launch(args=['--force-color-profile=srgb'])
    ctx = br.new_context(viewport={'width': 390, 'height': 844},
                         device_scale_factor=3, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.goto(B + '/', wait_until='networkidle'); time.sleep(0.8)
    pg.mouse.wheel(0, 900); time.sleep(2.2)   # past the 620ms idle timer -> untucked

    shot_el(pg, '#dock', 'v3/m_pills.png', 18)
    shot_el(pg, '.bnav', 'v3/m_wave.png', 30)
    pg.screenshot(path='v3/m_bottom.png', clip={'x': 0, 'y': 540, 'width': 390, 'height': 304})

    pg.click('#burger'); time.sleep(1.3)
    pg.screenshot(path='v3/m_menu.png')
    shot_el(pg, '.sheet-act', 'v3/m_menu_act.png', 16)
    ctx.close()

    ctx2 = br.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=2)
    p2 = ctx2.new_page()
    p2.goto(B + '/', wait_until='networkidle'); time.sleep(0.8)
    p2.mouse.wheel(0, 1200); time.sleep(2.2)
    shot_el(p2, '#dock', 'v3/d_pills.png', 20)
    ctx2.close(); br.close()
print('done')
