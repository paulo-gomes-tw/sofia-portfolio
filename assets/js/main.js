/* ============================================================
   Sofia Ferraz — interactions
   Vanilla JS · dependency-free · progressive enhancement
   Everything degrades gracefully; content works without JS.
   ============================================================ */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Signal to the inline safety-net that enhancement is running.
  window.__sfReady = true;

  const isProjectPage = !!document.querySelector('[data-project-mount]');

  /* ============================================================
     i18n bootstrap
     ============================================================ */
  if (window.I18N) window.I18N.init();

  /* Arrays: <ul data-i18n-list="key"> → one <li> per entry */
  function applyLists(root) {
    if (!window.I18N) return;
    (root || document).querySelectorAll('[data-i18n-list]').forEach((el) => {
      const items = window.I18N.t(el.getAttribute('data-i18n-list'));
      if (!Array.isArray(items)) return;
      el.innerHTML = items.map((i) => '<li>' + escapeHtml(i) + '</li>').join('');
    });
  }

  /* Hero headline: one masked .line per translated line */
  function applyLines(root) {
    if (!window.I18N) return;
    (root || document).querySelectorAll('[data-i18n-lines]').forEach((el) => {
      const lines = window.I18N.t(el.getAttribute('data-i18n-lines'));
      if (!Array.isArray(lines)) return;
      el.innerHTML = lines.map((line) =>
        // translated strings are authored in i18n.js and may contain <em>
        '<span class="line" data-reveal><span>' + line + '</span></span>'
      ).join('');
    });
  }

  /* Marquee: rebuild the doubled track from translated terms */
  function applyMarquee(root) {
    if (!window.I18N) return;
    (root || document).querySelectorAll('[data-marquee]').forEach((el) => {
      const items = window.I18N.t('marquee.items');
      if (!Array.isArray(items)) return;
      const one = items.map((i) => '<span>' + escapeHtml(i) + '</span><span class="dot">•</span>').join('');
      el.innerHTML = one + one; // duplicated so the loop is seamless
    });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ============================================================
     Reveal on scroll  (re-runnable for dynamic content)
     ============================================================ */
  let revealObserver = null;

  function initRevealObserver() {
    if (!('IntersectionObserver' in window) || prefersReduced) return null;
    return new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  }

  function observeReveals(root) {
    const scope = root || document;
    const els = scope.querySelectorAll('[data-reveal]:not(.is-in)');
    const lines = scope.querySelectorAll('.hero__title .line');

    if (!revealObserver) {
      // no IO or reduced motion → show immediately
      els.forEach((el) => el.classList.add('is-in'));
      lines.forEach((el) => el.classList.add('is-in'));
      return;
    }

    // stagger children inside grouped containers
    scope.querySelectorAll('[data-reveal-group]').forEach((group) => {
      group.querySelectorAll('[data-reveal]').forEach((kid, i) => {
        kid.style.transitionDelay = (i * 90) + 'ms';
      });
    });

    els.forEach((el) => revealObserver.observe(el));

    lines.forEach((line, i) => {
      const span = line.querySelector('span');
      if (span) span.style.transitionDelay = (120 + i * 110) + 'ms';
      revealObserver.observe(line);
    });
  }

  revealObserver = initRevealObserver();

  /* ============================================================
     Language switcher
     ============================================================ */
  function initLangSwitcher() {
    const wrap = document.querySelector('[data-lang-switcher]');
    if (!wrap || !window.I18N) return;

    const toggle = wrap.querySelector('[data-lang-toggle]');
    const list = wrap.querySelector('[data-lang-list]');
    const codeEl = wrap.querySelector('[data-lang-current]');
    const options = Array.from(list.querySelectorAll('[data-locale]'));

    function shortFor(code) {
      const hit = window.I18N.locales.find((l) => l.code === code);
      return hit ? hit.short : code.slice(0, 2).toUpperCase();
    }

    function syncUI() {
      const cur = window.I18N.current;
      if (codeEl) codeEl.textContent = shortFor(cur);
      options.forEach((o) => {
        const on = o.getAttribute('data-locale') === cur;
        o.setAttribute('aria-selected', String(on));
        o.classList.toggle('is-selected', on);
      });
    }

    function open() {
      list.hidden = false;
      wrap.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      const sel = options.find((o) => o.getAttribute('aria-selected') === 'true') || options[0];
      if (sel) sel.focus();
    }

    function close(refocus) {
      list.hidden = true;
      wrap.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      if (refocus) toggle.focus();
    }

    const isOpen = () => !list.hidden;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      isOpen() ? close(false) : open();
    });

    options.forEach((opt, i) => {
      const choose = () => {
        window.I18N.set(opt.getAttribute('data-locale'));
        close(true);
      };
      opt.addEventListener('click', choose);
      opt.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'Enter': case ' ':
            e.preventDefault(); choose(); break;
          case 'ArrowDown':
            e.preventDefault(); options[(i + 1) % options.length].focus(); break;
          case 'ArrowUp':
            e.preventDefault(); options[(i - 1 + options.length) % options.length].focus(); break;
          case 'Home':
            e.preventDefault(); options[0].focus(); break;
          case 'End':
            e.preventDefault(); options[options.length - 1].focus(); break;
          case 'Escape':
            e.preventDefault(); close(true); break;
          case 'Tab':
            close(false); break;
        }
      });
    });

    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); open();
      }
    });

    document.addEventListener('click', (e) => {
      if (isOpen() && !wrap.contains(e.target)) close(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) close(true);
    });

    window.I18N.onChange(syncUI);
    syncUI();
  }

  initLangSwitcher();

  /* ============================================================
     Behance profile links
     ============================================================ */
  function applyProfileLinks(data) {
    const url = data && data.profile && data.profile.url;
    if (!url) return;
    document.querySelectorAll('[data-behance-link]').forEach((a) => {
      a.setAttribute('href', url);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });
    const archive = document.querySelector('[data-work-archive]');
    const foot = document.querySelector('[data-work-foot]');
    if (archive && foot) {
      archive.setAttribute('href', url);
      foot.hidden = false;
    }
  }

  /* ============================================================
     Work gallery / project detail
     ============================================================ */
  const gallery = document.querySelector('[data-work-gallery]');
  const projectMount = document.querySelector('[data-project-mount]');
  let projectData = null;

  function currentProjectId() {
    try {
      const q = new URLSearchParams(window.location.search).get('p');
      if (q) return q;
    } catch (e) { /* fall through */ }
    // Fallback for hosts that rewrite clean URLs and drop the query string:
    // project.html#maison-lera also works.
    const hash = (window.location.hash || '').replace(/^#p?=?/, '');
    return hash ? decodeURIComponent(hash) : '';
  }

  function renderWork() {
    if (!projectData || !window.SFProjects) return;

    if (gallery) {
      window.SFProjects.renderGallery(gallery, projectData);
      gallery.setAttribute('aria-busy', 'false');
      observeReveals(gallery);
      bindMagnetic(gallery);
    }

    if (projectMount) {
      window.SFProjects.renderDetail(projectMount, projectData, currentProjectId());
      if (window.I18N) window.I18N.apply(projectMount);
      observeReveals(projectMount);
      bindMagnetic(projectMount);
    }
  }

  if (window.SFProjects && (gallery || projectMount)) {
    window.SFProjects.load().then((data) => {
      projectData = data;
      applyProfileLinks(data);
      renderWork();
    });
  }

  /* ============================================================
     Re-apply everything on language change
     ============================================================ */
  function applyAllI18n() {
    applyLists(document);
    applyLines(document);
    applyMarquee(document);
    observeReveals(document);
    renderWork();
  }

  if (window.I18N) {
    window.I18N.onChange(applyAllI18n);
  }

  /* initial pass */
  applyLists(document);
  applyLines(document);
  applyMarquee(document);
  observeReveals(document);

  /* ----------  Year  ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ----------  Header: scroll state + hide on scroll down  ---------- */
  const header = document.querySelector('[data-header]');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle('is-scrolled', y > 24 || isProjectPage);
      if (y > 480 && y > lastY + 4) {
        header.classList.add('is-hidden');
      } else if (y < lastY - 4) {
        header.classList.remove('is-hidden');
      }
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ----------  Active nav link via section observer  ---------- */
  const navLinks = Array.from(document.querySelectorAll('.nav__link'));
  const sections = navLinks
    .map((l) => {
      const href = l.getAttribute('href') || '';
      const hash = href.slice(href.indexOf('#'));
      return href.includes('#') ? document.querySelector(hash) : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          navLinks.forEach((l) => {
            l.classList.toggle('is-active', (l.getAttribute('href') || '').endsWith(id));
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach((s) => spy.observe(s));
  }

  /* ----------  Mobile menu  ---------- */
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  function setMenu(open) {
    if (!toggle || !mobileMenu) return;
    toggle.setAttribute('aria-expanded', String(open));
    if (window.I18N) {
      toggle.setAttribute('aria-label', window.I18N.t(open ? 'nav.menuClose' : 'nav.menuOpen'));
    }
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  }
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }

  /* ----------  Animated stat counters  ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const cio = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const dur = 1400;
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => cio.observe(c));
  }

  /* ----------  Parallax (subtle)  ---------- */
  if (!prefersReduced && finePointer) {
    let raf = null;
    function updateParallax() {
      const vh = window.innerHeight;
      document.querySelectorAll('[data-parallax]').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const center = rect.top + rect.height / 2;
        const offset = (center - vh / 2) / vh;
        const shift = offset * -26;
        const inner = el.querySelector('.media__glow') || el.firstElementChild;
        if (inner) inner.style.transform = 'translate3d(0,' + shift.toFixed(2) + 'px,0) scale(1.06)';
      });
      raf = null;
    }
    window.addEventListener('scroll', () => {
      if (!raf) raf = requestAnimationFrame(updateParallax);
    }, { passive: true });
    updateParallax();
  }

  /* ----------  Magnetic buttons  ---------- */
  function bindMagnetic(root) {
    if (!finePointer || prefersReduced) return;
    (root || document).querySelectorAll('[data-magnetic]:not([data-magnetic-bound])').forEach((el) => {
      el.setAttribute('data-magnetic-bound', '');
      const strength = 0.32;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (x * strength).toFixed(2) + 'px,' + (y * strength).toFixed(2) + 'px)';
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }
  bindMagnetic(document);

  /* ----------  Contact form (demo handling)  ---------- */
  const form = document.querySelector('[data-form]');
  const note = document.querySelector('[data-form-note]');
  if (form && note) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#f-name');
      const email = form.querySelector('#f-email');
      const message = form.querySelector('#f-message');
      const t = window.I18N ? window.I18N.t : (k) => k;
      note.classList.remove('is-error');

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email.value || '').trim());
      if (!name.value.trim() || !emailOk || !message.value.trim()) {
        note.textContent = t('form.error');
        note.classList.add('is-error');
        (!name.value.trim() ? name : !emailOk ? email : message).focus();
        return;
      }
      note.textContent = t('form.success');
      form.reset();
    });
  }

  /* ----------  Smooth anchor focus for a11y  ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      window.setTimeout(() => {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }, 600);
    });
  });

  /* expose for debugging / dynamic content */
  window.SF = { observeReveals: observeReveals, bindMagnetic: bindMagnetic };
})();
