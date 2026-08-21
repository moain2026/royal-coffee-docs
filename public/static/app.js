/*!
 * القهوة الملكية — front-end behaviour
 * Vanilla, zero dependencies. Progressive enhancement only:
 * every page works fully with JS disabled.
 */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TOUCH = window.matchMedia('(hover: none)').matches;

  /* ─── 0. Toast (shared) ─────────────────────────────────── */
  var toast = (function () {
    var el = $('#toast'), msg = $('#toastMsg'), t;
    return function (text) {
      if (!el || !msg) return;
      msg.textContent = text;
      el.classList.add('show');
      clearTimeout(t);
      t = setTimeout(function () { el.classList.remove('show'); }, 3200);
    };
  })();

  /* ─── 1. Sticky header ──────────────────────────────────── */
  (function stickyHeader() {
    var hdr = $('#hdr');
    if (!hdr) return;
    var ticking = false;
    var apply = function () {
      hdr.classList.toggle('stuck', window.scrollY > 14);
      ticking = false;
    };
    apply();
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
  })();

  /* ─── 2. Mobile bottom sheet ────────────────────────────── */
  (function sheet() {
    var btn = $('#burger'), sh = $('#sheet'), bd = $('#sheetBd');
    if (!btn || !sh || !bd) return;
    var open = false;

    var set = function (state) {
      open = state;
      sh.classList.toggle('open', state);
      bd.classList.toggle('open', state);
      sh.setAttribute('aria-hidden', state ? 'false' : 'true');
      btn.setAttribute('aria-expanded', state ? 'true' : 'false');
      btn.setAttribute('aria-label', state ? 'إغلاق القائمة' : 'فتح القائمة');
      document.documentElement.style.overflow = state ? 'hidden' : '';
      if (state) { bd.hidden = false; }
      else { setTimeout(function () { if (!open) bd.hidden = true; }, 420); }
      if (state) { var f = sh.querySelector('a'); if (f) f.focus({ preventScroll: true }); }
      else if (sh.contains(document.activeElement)) { document.activeElement.blur(); }
    };

    btn.addEventListener('click', function () { set(!open); });
    bd.addEventListener('click', function () { set(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) { set(false); btn.focus(); }
    });
    $$('a', sh).forEach(function (a) {
      a.addEventListener('click', function () { set(false); });
    });
    var y0 = null;
    sh.addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; }, { passive: true });
    sh.addEventListener('touchmove', function (e) {
      if (y0 === null) return;
      if (e.touches[0].clientY - y0 > 70) { set(false); y0 = null; }
    }, { passive: true });
    sh.addEventListener('touchend', function () { y0 = null; }, { passive: true });
  })();

  /* ─── 3. Reveal on scroll (.rv → .in) ───────────────────── */
  (function reveal() {
    var sel = '.rv, .gal figure.flip';
    var els = $$(sel);
    if (!els.length) return;
    if (REDUCE || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ─── 4. Page-transition line ───────────────────────────── */
  (function pgline() {
    var line = $('#pgline');
    if (!line) return;
    var going = false;

    var samePage = function (a) {
      try {
        var u = new URL(a.href, location.href);
        return u.origin === location.origin &&
               u.pathname === location.pathname &&
               (u.hash || !u.search);
      } catch (e) { return false; }
    };

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (href.charAt(0) === '#' || /^(tel:|mailto:|https?:\/\/wa\.me)/i.test(href)) return;
      var u;
      try { u = new URL(a.href, location.href); } catch (err) { return; }
      if (u.origin !== location.origin) return;
      if (samePage(a)) return;
      if (going) return;
      going = true;
      line.classList.add('on');
    }, true);

    // Reset when returning via back/forward cache
    window.addEventListener('pageshow', function () {
      going = false;
      line.classList.remove('on');
    });
  })();

  /* ─── 5. 3D tilt (.tilt) ────────────────────────────────── */
  (function tilt() {
    var els = $$('.tilt');
    if (!els.length || REDUCE) return;

    var MAX = 9; // degrees

    var bind = function (el) {
      var raf = null, rect = null;

      var measure = function () { rect = el.getBoundingClientRect(); };

      var move = function (x, y) {
        if (!rect) measure();
        var px = (x - rect.left) / rect.width;
        var py = (y - rect.top) / rect.height;
        px = Math.min(1, Math.max(0, px));
        py = Math.min(1, Math.max(0, py));
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          el.style.setProperty('--ry', ((px - 0.5) * MAX * 2).toFixed(2) + 'deg');
          el.style.setProperty('--rx', ((0.5 - py) * MAX * 2).toFixed(2) + 'deg');
          el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        });
      };

      var reset = function () {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--mx', '50%');
        el.style.setProperty('--my', '50%');
        rect = null;
      };

      if (TOUCH) {
        // Touch: a short 3D "press" so the tap still feels physical
        el.addEventListener('touchstart', function (e) {
          measure();
          move(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        el.addEventListener('touchend', reset, { passive: true });
        el.addEventListener('touchcancel', reset, { passive: true });
      } else {
        el.addEventListener('pointerenter', measure);
        el.addEventListener('pointermove', function (e) { move(e.clientX, e.clientY); });
        el.addEventListener('pointerleave', reset);
        el.addEventListener('focus', measure);
        el.addEventListener('blur', reset);
      }
    };

    els.forEach(bind);
    window.addEventListener('resize', function () {
      els.forEach(function (el) {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    }, { passive: true });
  })();

  /* ─── 6. Gallery filter ─────────────────────────────────── */
  (function galleryFilter() {
    var bar = $('#galFilters'), grid = $('#galGrid');
    if (!bar || !grid) return;
    var btns = $$('button[data-cat]', bar);
    var figs = $$('figure[data-cat]', grid);
    if (!btns.length || !figs.length) return;

    var apply = function (cat) {
      btns.forEach(function (b) {
        var on = b.getAttribute('data-cat') === cat;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var shown = 0;
      figs.forEach(function (f) {
        var ok = cat === 'all' || f.getAttribute('data-cat') === cat;
        if (ok) {
          f.hidden = false;
          f.style.setProperty('--d', (shown * 45) + 'ms');
          shown++;
          // re-trigger the flip
          f.classList.remove('in');
          void f.offsetWidth;
          f.classList.add('in');
        } else {
          f.hidden = true;
          f.classList.remove('in');
        }
      });
      var empty = $('#galEmpty');
      if (empty) empty.hidden = shown > 0;
    };

    btns.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-cat')); });
    });
  })();

  /* ─── 7. Booking form → WhatsApp deep link ──────────────── */
  (function bookForm() {
    var form = $('#bookForm');
    if (!form) return;

    var val = function (n) {
      var f = form.elements[n];
      return f && f.value ? String(f.value).trim() : '';
    };

    var flag = function (n, msg) {
      var f = form.elements[n];
      if (f) {
        f.focus({ preventScroll: false });
        f.style.borderColor = 'var(--gold)';
      }
      toast(msg);
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = val('name'), tel = val('tel'), city = val('city');
      if (!name) return flag('name', 'الرجاء كتابة الاسم');
      if (!tel) return flag('tel', 'الرجاء كتابة رقم الجوال');
      if (tel.replace(/\D/g, '').length < 9) return flag('tel', 'رقم الجوال غير مكتمل');
      if (!city) return flag('city', 'الرجاء اختيار المدينة');

      var lines = [
        'السلام عليكم، أرغب في حجز ضيافة:',
        '',
        '• الاسم: ' + name,
        '• الجوال: ' + tel,
        '• المدينة: ' + city
      ];
      if (val('kind')) lines.push('• المناسبة: ' + val('kind'));
      if (val('date')) lines.push('• التاريخ: ' + val('date'));
      if (val('guests')) lines.push('• عدد الضيوف: ' + val('guests'));
      if (val('service')) lines.push('• الخدمة: ' + val('service'));
      if (val('note')) lines.push('• ملاحظات: ' + val('note'));
      lines.push('', 'أرجو تزويدي بعرض سعر مفصّل. شكراً لكم.');

      var base = form.getAttribute('data-wa') || 'https://wa.me/966500000000';
      var sep = base.indexOf('?') === -1 ? '?' : '&';
      var href = base + sep + 'text=' + encodeURIComponent(lines.join('\n'));

      toast('جاري تحويلك إلى واتساب…');
      setTimeout(function () { window.open(href, '_blank', 'noopener'); }, 450);
    });

    $$('input,select,textarea', form).forEach(function (f) {
      var clear = function () { f.style.borderColor = ''; };
      f.addEventListener('input', clear);
      f.addEventListener('change', clear);
    });
  })();

  /* ─── 8. FAQ — single-open accordion ────────────────────── */
  (function faq() {
    var items = $$('.faq details');
    if (items.length < 2) return;
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        items.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  })();

  /* ─── 9. Share + copy buttons ───────────────────────────── */
  (function shareCopy() {
    var copyText = function (text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise(function (res, rej) {
        try {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          res();
        } catch (e) { rej(e); }
      });
    };

    $$('[data-share]').forEach(function (b) {
      b.addEventListener('click', function () {
        var path = b.getAttribute('data-share') || location.pathname;
        var url = new URL(path, location.origin).href;
        var data = {
          title: document.title,
          text: 'كل حساباتنا وأرقامنا في صفحة واحدة',
          url: url
        };
        if (navigator.share) {
          navigator.share(data).catch(function () { /* user cancelled */ });
        } else {
          copyText(url).then(
            function () { toast('تم نسخ رابط الصفحة'); },
            function () { toast('تعذّر النسخ — انسخ الرابط من شريط العنوان'); }
          );
        }
      });
    });

    $$('[data-copy]').forEach(function (b) {
      b.addEventListener('click', function () {
        copyText(b.getAttribute('data-copy') || '').then(
          function () { toast('تم النسخ بنجاح'); },
          function () { toast('تعذّر النسخ'); }
        );
      });
    });

    // Desktop: tap-to-copy phone links instead of firing tel:
    if (!TOUCH) {
      $$('.cta-phone').forEach(function (a) {
        a.addEventListener('click', function (e) {
          if (!navigator.clipboard) return;
          e.preventDefault();
          copyText(a.textContent.trim()).then(
            function () { toast('تم نسخ رقم التواصل'); },
            function () { window.location.href = a.href; }
          );
        });
      });
    }
  })();

  /* ─── 10. Floating dock ──────────────────────────────────
   * Appears after the first fold. Retracts while the visitor
   * scrolls DOWN (reading) so it never sits on top of content,
   * and returns the instant they scroll UP (deciding) or stop.
   * ──────────────────────────────────────────────────────── */
  (function dock() {
    var dk = $('#dock');
    if (!dk) return;

    var last = window.scrollY;
    var ticking = false;
    var idle = null;

    var apply = function () {
      var y = window.scrollY;
      var past = y > 420;
      var down = y > last + 6;
      var up = y < last - 6;

      if (!past) dk.classList.remove('on', 'tuck');
      else {
        dk.classList.add('on');
        if (down) dk.classList.add('tuck');
        else if (up) dk.classList.remove('tuck');
      }

      last = y;
      ticking = false;

      // once scrolling settles, always show it again
      clearTimeout(idle);
      idle = setTimeout(function () {
        if (window.scrollY > 420) dk.classList.remove('tuck');
      }, 620);
    };

    apply();
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
  })();

  /* ─── 11. Coin — pause the spin when off-screen ─────────── */
  (function coin() {
    var c = $('#coin');
    if (!c || REDUCE || !('IntersectionObserver' in window)) return;
    var inner = c.querySelector('.coin-in');
    var shade = c.querySelector('.coin-shadow');
    var io = new IntersectionObserver(function (entries) {
      var vis = entries[0].isIntersecting;
      [inner, shade].forEach(function (el) {
        if (el) el.style.animationPlayState = vis ? 'running' : 'paused';
      });
    }, { threshold: 0.05 });
    io.observe(c);
  })();
})();
