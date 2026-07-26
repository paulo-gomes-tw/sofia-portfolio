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

  /* ----------  Year  ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ----------  Reveal on scroll  ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const heroLines = document.querySelectorAll('.hero__title .line');

  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach((el) => io.observe(el));

    // Stagger children within grouped containers
    document.querySelectorAll('[data-reveal-group]').forEach((group) => {
      const kids = group.querySelectorAll('[data-reveal]');
      kids.forEach((kid, i) => {
        kid.style.transitionDelay = (i * 90) + 'ms';
      });
    });

    // Hero headline lines reveal with slight cascade
    heroLines.forEach((line, i) => {
      const span = line.querySelector('span');
      if (span) span.style.transitionDelay = (120 + i * 110) + 'ms';
      // observe each line
      const lio = new IntersectionObserver((es, o) => {
        es.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('is-in'); o.unobserve(e.target); }
        });
      }, { threshold: 0.3 });
      lio.observe(line);
    });
  } else {
    // No IO or reduced motion → show everything immediately
    revealEls.forEach((el) => el.classList.add('is-in'));
    heroLines.forEach((el) => el.classList.add('is-in'));
  }

  /* ----------  Header: scroll state + hide on scroll down  ---------- */
  const header = document.querySelector('[data-header]');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle('is-scrolled', y > 24);
      // hide when scrolling down past hero, show when scrolling up
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
    .map((l) => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === id));
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
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  }
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      setMenu(!open);
    });
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });
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
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  if (parallaxEls.length && !prefersReduced && finePointer) {
    let raf = null;
    function updateParallax() {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const center = rect.top + rect.height / 2;
        const offset = (center - vh / 2) / vh; // -0.5..0.5
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
  if (finePointer && !prefersReduced) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
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

  /* ----------  Custom cursor  ---------- */
  const cursor = document.querySelector('[data-cursor]');
  if (cursor && finePointer && !prefersReduced) {
    document.body.classList.add('cursor-on');
    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (dot) dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });

    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ring) ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }
    loop();

    const hoverTargets = 'a, button, [data-magnetic], .work-card__media, .service, input, textarea';
    document.querySelectorAll(hoverTargets).forEach((t) => {
      t.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
      t.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
    });
    window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
  }

  /* ----------  Contact form (demo handling)  ---------- */
  const form = document.querySelector('[data-form]');
  const note = document.querySelector('[data-form-note]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#f-name');
      const email = form.querySelector('#f-email');
      const message = form.querySelector('#f-message');
      note.classList.remove('is-error');

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email.value || '').trim());
      if (!name.value.trim() || !emailOk || !message.value.trim()) {
        note.textContent = 'Please add your name, a valid email, and a short note.';
        note.classList.add('is-error');
        (!name.value.trim() ? name : !emailOk ? email : message).focus();
        return;
      }
      note.textContent = 'Thank you — your note is on its way. I’ll reply within two business days.';
      form.reset();
    });
  }

  /* ----------  Smooth anchor focus for a11y  ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      // let native smooth scroll happen; then move focus for keyboard users
      window.setTimeout(() => {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }, 600);
    });
  });
})();
