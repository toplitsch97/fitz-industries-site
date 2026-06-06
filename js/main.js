// FITZ INDUSTRIES — scroll storytelling (Lenis + GSAP ScrollTrigger)
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- set background images (resolves relative to document) ---------- */
  document.querySelectorAll('[data-img]').forEach((el) => {
    const target = el.classList.contains('pcard') ? el.querySelector('.pcard__bg') : el;
    if (target) target.style.backgroundImage = `url('assets/img/${el.dataset.img}.jpg')`;
  });
  document.querySelectorAll('[data-real]').forEach((el) => {
    el.style.backgroundImage = `url('assets/real/${el.dataset.real}.jpg')`;
  });

  /* ---------- heritage marquee: duplicate row for seamless loop ---------- */
  const hRow = document.getElementById('heritageRow');
  if (hRow) {
    hRow.innerHTML += hRow.innerHTML; // double the content
  }

  /* ---------- Lenis smooth scroll synced with GSAP ---------- */
  let lenis;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis; // exposed for programmatic scroll / testing
  }
  const stop = () => lenis && lenis.stop();
  const start = () => lenis && lenis.start();

  /* ---------- Preloader ---------- */
  const pre = document.getElementById('preloader');
  const preVideo = document.getElementById('preVideo');
  document.body.classList.add('lock');
  stop();

  function initReveals() {
    /* hero title lines */
    gsap.set('.hero__title .line>span', { yPercent: 110 });
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.hero__title .line>span', { yPercent: 0, duration: 1.2, stagger: 0.12 })
      .to('.hero__sub', { opacity: 1, y: 0, duration: 1 }, 0.6)
      .from('.hero__cue', { opacity: 0, y: 20, duration: 0.8 }, 0.9);
    gsap.set('.hero__sub', { opacity: 0, y: 24 });
  }

  /* Keep the loader short — a long intro makes visitors bounce */
  var LOADER_MS = 1500;
  function runPreloader() {
    if (reduce) { finish(); return; }
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      gsap.to('.preloader__video', { opacity: 0, duration: 0.45 });
      gsap.to('.preloader__curtain', {
        scaleY: 1, duration: 0.6, ease: 'expo.inOut',
        onComplete: finish,
      });
    };

    if (!preVideo) { setTimeout(reveal, 400); return; }

    /* Play the branded clip fast so it still completes within the short window */
    preVideo.playbackRate = 5;
    preVideo.addEventListener('ended', reveal);
    const p = preVideo.play();
    if (p && typeof p.catch === 'function') {
      /* Autoplay blocked → don't trap the visitor on the loader */
      p.catch(() => { setTimeout(reveal, 600); });
    }
    /* Hard cap: never hold the visitor longer than this */
    setTimeout(reveal, LOADER_MS);
  }
  function finish() {
    pre.style.display = 'none';
    document.body.classList.remove('lock');
    start();
    initReveals();
    buildScenes();
    buildMap();
    ScrollTrigger.refresh();
  }
  /* Start the (short) loader as soon as the DOM is ready — don't wait for every
     video/image to finish downloading, which is what made the intro feel endless */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPreloader);
  } else {
    runPreloader();
  }

  /* ---------- Scenes ---------- */
  function buildScenes() {
    /* progress bar */
    gsap.to('.scroll-progress', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
    });

    /* header scrolled state */
    ScrollTrigger.create({
      start: 80, end: 'max',
      onUpdate: (self) => document.getElementById('header')
        .classList.toggle('scrolled', self.scroll() > 80),
    });

    /* hero video parallax */
    gsap.to('.hero__video', {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* generic reveal-fade */
    gsap.utils.toArray('.reveal-fade').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });

    /* manifest words light up */
    const words = gsap.utils.toArray('.manifest__text .w');
    gsap.to(words, {
      opacity: 1, ease: 'none', stagger: 0.5,
      scrollTrigger: { trigger: '.manifest__text', start: 'top 75%', end: 'bottom 55%', scrub: true },
    });

    /* stat counters */
    gsap.utils.toArray('.stat__num').forEach((el) => {
      const target = +el.dataset.count;
      const o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(o, {
          v: target, duration: 1.6, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(o.v); },
        }),
      });
    });

    /* ---------- logo grids: staggered reveal (portfolio + Beteiligungen) ---------- */
    gsap.from('.showcase .brand-cell', {
      y: 30, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.06,
      scrollTrigger: { trigger: '.showcase .brand-grid', start: 'top 82%' },
    });
    gsap.from('.partner-grid .brand-cell', {
      y: 30, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.06,
      scrollTrigger: { trigger: '.partner-grid', start: 'top 82%' },
    });

    /* ---------- reviews: card stagger reveal ---------- */
    gsap.from('.review-card', {
      y: 30, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08,
      scrollTrigger: { trigger: '.review-grid', start: 'top 85%' },
    });

    /* foundation parallax */
    gsap.to('.foundation__bg', {
      yPercent: 16, ease: 'none',
      scrollTrigger: { trigger: '.foundation', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.from('.foundation__title', {
      yPercent: 40, opacity: 0, ease: 'expo.out', duration: 1.2,
      scrollTrigger: { trigger: '.foundation', start: 'top 65%' },
    });

    /* presence: headline reveal */
    gsap.from('.presence__head > *', {
      y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: '.presence', start: 'top 75%' },
    });
    gsap.from('.presence__legend li', {
      y: 24, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.05,
      scrollTrigger: { trigger: '.presence__legend', start: 'top 90%' },
    });
  }

  /* ---------- World map: pins + arcs (viewBox 2094 × 1025) ---------- */
  function buildMap() {
    const W = 2094, H = 1025;
    // positions via equirectangular projection: x=(lon+180)/360*W, y=(90-lat)/180*H
    const hubs = [
      { name: 'Schweiz',      city: 'St. Gallen · Hauptsitz', x: 1102, y: 245, hq: true,   arc: false },
      { name: 'Liechtenstein',city: 'Vaduz',                  x: 1108, y: 246, small: true, arc: false },
      { name: 'Österreich',   city: 'Salzburg',               x: 1131, y: 242, small: true, arc: false },
      { name: 'Deutschland',  city: 'FIH',                    x: 1107, y: 221, small: true, arc: false },
      { name: 'Luxemburg',    city: 'FIH',                    x: 1082, y: 229, small: true, arc: false },
      { name: 'Tschechien',   city: 'FIH',                    x: 1136, y: 229, small: true, arc: false },
      { name: 'Bulgarien',    city: 'FIH',                    x: 1194, y: 269, arc: true },
      { name: 'Spanien',      city: 'Madrid',                 x: 1025, y: 283, arc: true },
      { name: 'England',      city: 'London',                 x: 1038, y: 214, arc: true },
      { name: 'USA',          city: 'Miami · New York',       x: 615,  y: 287, arc: true },
      { name: 'VAE',          city: 'Dubai',                  x: 1363, y: 373, arc: true },
    ];
    const SVGNS = 'http://www.w3.org/2000/svg';
    const arcsG = document.getElementById('arcs');
    const pinsG = document.getElementById('pins');
    const tip = document.getElementById('mapTip');
    const stage = document.getElementById('mapStage');
    if (!arcsG || !pinsG) return;
    const hq = hubs[0];

    function circle(cx, cy, r, cls) {
      const c = document.createElementNS(SVGNS, 'circle');
      c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', r);
      c.setAttribute('class', cls);
      return c;
    }

    /* arcs from HQ to long-distance hubs */
    const arcEls = [];
    hubs.filter((h) => h.arc).forEach((h) => {
      const mx = (hq.x + h.x) / 2;
      const my = (hq.y + h.y) / 2;
      const dist = Math.hypot(h.x - hq.x, h.y - hq.y);
      const cy = my - dist * 0.34;
      const p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('d', `M ${hq.x} ${hq.y} Q ${mx} ${cy} ${h.x} ${h.y}`);
      p.setAttribute('class', 'arc');
      arcsG.appendChild(p);
      const len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
      arcEls.push(p);
    });

    /* pins */
    hubs.forEach((h) => {
      const rGlow = h.hq ? 30 : h.small ? 14 : 22;
      const rRing = h.hq ? 9 : h.small ? 4.5 : 7;
      const rCore = h.hq ? 4.5 : h.small ? 2.4 : 3.4;
      const g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('transform', `translate(${h.x} ${h.y})`);
      g.style.opacity = '0';
      const glow = circle(0, 0, rGlow, 'pin-glow');
      const ring = circle(0, 0, rRing, 'pin-ring');
      const core = circle(0, 0, rCore, 'pin-core');
      const hit = circle(0, 0, Math.max(16, rGlow), 'pin-hit');
      g.append(glow, ring, core, hit);
      pinsG.appendChild(g);
      h.el = g;

      // pulsing ring
      gsap.to(ring, { attr: { r: rRing * 2.2 }, opacity: 0, duration: 2.2, repeat: -1, ease: 'power1.out' });

      // tooltip
      hit.addEventListener('pointerenter', () => {
        const r = stage.getBoundingClientRect();
        tip.style.left = (h.x / W * r.width) + 'px';
        tip.style.top = (h.y / H * r.height) + 'px';
        tip.innerHTML = `<b>${h.name}</b> · ${h.city}`;
        tip.classList.add('show');
      });
      hit.addEventListener('pointerleave', () => tip.classList.remove('show'));
    });

    /* reveal pins + draw arcs when section enters */
    const mapTl = gsap.timeline({
      scrollTrigger: { trigger: '.presence', start: 'top 65%' },
    });
    mapTl.to(hubs.map((h) => h.el), { opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power2.out' });
    arcEls.forEach((a, i) => {
      mapTl.to(a, { strokeDashoffset: 0, duration: 1.6, ease: 'power1.inOut' }, 0.4 + i * 0.25);
    });
  }

  /* ---------- burger (mobile) ---------- */
  const burger = document.getElementById('burger');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      if (open) stop(); else start();
    });
    document.querySelectorAll('.nav a').forEach((a) => {
      a.addEventListener('click', () => {
        document.body.classList.remove('menu-open');
        start();
      });
    });
  }

  /* ---------- nav anchor smooth scroll via Lenis ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -40 });
      else t.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();
