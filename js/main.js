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

  /* ---------- flag marquee (Präsenz): build + duplicate for seamless loop ---------- */
  const flagTrack = document.getElementById('flagTrack');
  if (flagTrack) {
    const flags = [
      { c: 'ch', n: 'Schweiz' }, { c: 'li', n: 'Liechtenstein' }, { c: 'at', n: 'Österreich' },
      { c: 'de', n: 'Deutschland' }, { c: 'lu', n: 'Luxemburg' }, { c: 'cz', n: 'Tschechien' },
      { c: 'bg', n: 'Bulgarien' }, { c: 'es', n: 'Spanien' }, { c: 'gb-eng', n: 'England' },
      { c: 'us', n: 'USA' }, { c: 'ae', n: 'VAE' }, { c: 'th', n: 'Thailand' }, { c: 'tr', n: 'Türkei' },
    ];
    const row = flags.map((f) =>
      `<span class="flag"><img src="assets/flags/${f.c}.svg" alt="${f.n}" loading="lazy" /><i>${f.n}</i></span>`
    ).join('');
    flagTrack.innerHTML = row + row; // duplicate → seamless loop at -50%
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
    /* hero title lines — opacity + sanftes Y (kein overflow-Mask, sonst werden
       Unterlängen abgeschnitten und der Verlaufstext + Glow verschwinden) */
    gsap.set('.hero__title .line>span', { yPercent: 38, opacity: 0 });
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.hero__title .line>span', { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.14 })
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
    buildContactMap();
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
      const suffix = el.dataset.suffix || '';
      const o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(o, {
          v: target, duration: 1.6, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(o.v) + suffix; },
        }),
      });
    });

    /* ---------- holding blocks: staggered reveal (portfolio + Beteiligungen) ---------- */
    gsap.from('.showcase .hold', {
      y: 30, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08,
      scrollTrigger: { trigger: '.showcase .holds', start: 'top 82%' },
    });
    /* opacity only — orbits use transform:translate(-50%,-50%) for centering,
       so animating transform here would break their positioning */
    gsap.from('.orbit', {
      opacity: 0, duration: 0.8, ease: 'power2.out', stagger: 0.12,
      scrollTrigger: { trigger: '.constellation', start: 'top 80%' },
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

    /* presence: headline reveal */
    gsap.from('.presence__head > *', {
      y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: '.presence', start: 'top 75%' },
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
      { name: 'England',      city: 'London',                 x: 1060, y: 210, arc: true },
      { name: 'USA',          city: 'Miami · New York',       x: 615,  y: 287, arc: true },
      { name: 'VAE',          city: 'Dubai',                  x: 1363, y: 373, arc: true },
      { name: 'Türkei',       city: 'Ankara',                 x: 1238, y: 285, arc: true },
      { name: 'Thailand',     city: 'Bangkok',                x: 1632, y: 434, arc: true },
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

  /* ---------- Kontakt: gepunktete Europa-Karte + Netzwerk-Animation ---------- */
  function buildContactMap() {
    const svg = document.getElementById('emap');
    if (!svg) return;
    const NS = 'http://www.w3.org/2000/svg';
    const dotsG = svg.querySelector('.emap__dots');
    const linesG = svg.querySelector('.emap__lines');
    const nodesG = svg.querySelector('.emap__nodes');
    // Europa als Landraster (Spalten 0–37, Zeilen 0–23), Bereiche [start,end] je Zeile
    const LAND = {
      0: [[18, 22], [25, 31]], 1: [[17, 31]], 2: [[16, 32]], 3: [[15, 33]], 4: [[14, 33]],
      5: [[13, 33]], 6: [[13, 32]], 7: [[13, 31]], 8: [[5, 8], [13, 31]], 9: [[3, 9], [12, 33]],
      10: [[3, 9], [11, 35]], 11: [[4, 9], [10, 36]], 12: [[5, 9], [8, 37]], 13: [[5, 8], [6, 37]],
      14: [[5, 37]], 15: [[4, 37]], 16: [[2, 37]], 17: [[1, 11], [13, 36]],
      18: [[1, 10], [16, 19], [21, 37]], 19: [[1, 10], [16, 20], [22, 30], [33, 37]],
      20: [[2, 10], [17, 20], [23, 29], [33, 37]], 21: [[3, 9], [18, 21], [24, 28]],
      22: [[4, 8], [19, 22], [25, 28]], 23: [[20, 22], [26, 29]],
    };
    const landSet = new Set();
    for (let r = 0; r < 24; r++) {
      (LAND[r] || []).forEach(([s, e]) => { for (let c = s; c <= e; c++) landSet.add(c + ',' + r); });
    }
    // feines Sub-Raster (0.5er Schritte) → kleinere, dichtere Punkte
    for (let y = 0.25; y < 24; y += 0.5) {
      for (let x = 0.25; x < 38; x += 0.5) {
        if (!landSet.has(Math.floor(x) + ',' + Math.floor(y))) continue;
        const d = document.createElementNS(NS, 'circle');
        d.setAttribute('cx', x); d.setAttribute('cy', y);
        d.setAttribute('r', 0.16); d.setAttribute('class', 'emap__dot');
        dotsG.appendChild(d);
      }
    }
    // Schweiz-Hub + Verbindungen zu europäischen Knoten
    const hub = { x: 13.5, y: 16.5 };
    const targets = [[8, 13], [5, 20], [18, 12], [17, 19], [21, 8], [23, 12], [25, 21], [29, 20], [20, 15]];
    targets.forEach((t, i) => {
      const x2 = t[0] + 0.5, y2 = t[1] + 0.5;
      const base = document.createElementNS(NS, 'line');
      base.setAttribute('x1', hub.x); base.setAttribute('y1', hub.y);
      base.setAttribute('x2', x2); base.setAttribute('y2', y2);
      base.setAttribute('class', 'emap__line');
      linesG.appendChild(base);
      const pulse = document.createElementNS(NS, 'line');
      pulse.setAttribute('x1', hub.x); pulse.setAttribute('y1', hub.y);
      pulse.setAttribute('x2', x2); pulse.setAttribute('y2', y2);
      pulse.setAttribute('class', 'emap__pulse');
      pulse.style.setProperty('--i', i);
      linesG.appendChild(pulse);
      const node = document.createElementNS(NS, 'circle');
      node.setAttribute('cx', x2); node.setAttribute('cy', y2);
      node.setAttribute('r', 0.42); node.setAttribute('class', 'emap__node');
      node.style.setProperty('--i', i);
      nodesG.appendChild(node);
    });
    const ring = document.createElementNS(NS, 'circle');
    ring.setAttribute('cx', hub.x); ring.setAttribute('cy', hub.y); ring.setAttribute('r', 0.55);
    ring.setAttribute('class', 'emap__hubring');
    nodesG.appendChild(ring);
    const core = document.createElementNS(NS, 'circle');
    core.setAttribute('cx', hub.x); core.setAttribute('cy', hub.y); core.setAttribute('r', 0.5);
    core.setAttribute('class', 'emap__hub');
    nodesG.appendChild(core);
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
        if (!document.body.classList.contains('menu-open')) return;
        document.body.classList.remove('menu-open');
        start();
      });
    });
  }

  /* ---------- nav anchor smooth scroll via Lenis ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (a.hasAttribute('data-contact-open')) return; // Kontakt-Trigger → Popup, nicht scrollen
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -40 });
      else t.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- Kontakt-Popup: Abteilungen ---------- */
  const cmodal = document.getElementById('contactModal');
  if (cmodal) {
    // SVG-Pfade (24×24, stroke). Pro Abteilung ein Icon-Key.
    const ic = {
      calc: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M9 6h6M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v3M8 19h4"/>',
      pen: '<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="m14 6 4 4"/>',
      box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
      folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/>',
      brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
      building: '<path d="M5 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17M15 9h3a1 1 0 0 1 1 1v11M8 7h1M11 7h1M8 11h1M11 11h1M8 15h1M11 15h1"/>',
      mega: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M16 8a4 4 0 0 1 0 8"/>',
    };
    const mailIco = '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>';
    const telIco = '<path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2z"/>';

    // ▼▼▼ Hier die echten Daten pro Abteilung eintragen (Name / E-Mail / Tel) ▼▼▼
    const DEPARTMENTS = [
      { dept: 'Buchhaltung',      name: '—', email: 'buchhaltung@fitz.li', tel: '+41 00 000 00 00', icon: 'calc' },
      { dept: 'Grafik & Design',  name: '—', email: 'design@fitz.li',      tel: '+41 00 000 00 00', icon: 'pen' },
      { dept: 'Fulfillment',      name: '—', email: 'fulfillment@fitz.li', tel: '+41 00 000 00 00', icon: 'box' },
      { dept: 'Backoffice',       name: '—', email: 'backoffice@fitz.li',  tel: '+41 00 000 00 00', icon: 'folder' },
      { dept: 'Information',      name: '—', email: 'info@fitz.li',        tel: '+41 00 000 00 00', icon: 'info' },
      { dept: 'Geschäftsleitung', name: '—', email: 'management@fitz.li',  tel: '+41 00 000 00 00', icon: 'brief' },
      { dept: 'Büro',             name: '—', email: 'office@fitz.li',      tel: '+41 00 000 00 00', icon: 'building' },
      { dept: 'Marketing',        name: '—', email: 'marketing@fitz.li',   tel: '+41 00 000 00 00', icon: 'mega' },
    ];
    // ▲▲▲ Ein Ort zum Pflegen. tel: beliebig formatieren, Link wird automatisch bereinigt. ▲▲▲

    const grid = document.getElementById('contactDeptGrid');
    const svg = (paths) => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
    const telHref = (t) => 'tel:' + t.replace(/[^+\d]/g, '');
    grid.innerHTML = DEPARTMENTS.map((d) => `
      <div class="dept">
        <span class="dept__icon">${svg(ic[d.icon] || ic.info)}</span>
        <span class="dept__name">${d.dept}</span>
        <span class="dept__person">${d.name}</span>
        <span class="dept__links">
          <a href="mailto:${d.email}">${svg(mailIco)}<span>${d.email}</span></a>
          <a href="${telHref(d.tel)}">${svg(telIco)}<span>${d.tel}</span></a>
        </span>
      </div>`).join('');

    let lastFocus = null;
    const openModal = () => {
      lastFocus = document.activeElement;
      cmodal.classList.add('open');
      cmodal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lock');
      stop(); // Lenis pausieren
      const c = cmodal.querySelector('.cmodal__close');
      if (c) c.focus();
    };
    const closeModal = () => {
      if (!cmodal.classList.contains('open')) return;
      cmodal.classList.remove('open');
      cmodal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lock');
      start();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    document.querySelectorAll('[data-contact-open]').forEach((el) => {
      el.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    });
    cmodal.querySelectorAll('[data-contact-close]').forEach((el) => {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
    // einfache Fokus-Falle innerhalb des Dialogs
    cmodal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = cmodal.querySelectorAll('a[href], button');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- Social-Media: weitere Accounts ein-/ausblenden ---------- */
  document.querySelectorAll('[data-ig-toggle]').forEach((btn) => {
    const group = btn.closest('.follow__group');
    if (!group) return;
    const extraCount = group.querySelectorAll('.ig-chip--extra').length;
    const label = btn.querySelector('.ig-toggle__label');
    btn.addEventListener('click', () => {
      const open = group.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = open ? 'weniger anzeigen' : `${extraCount} weitere anzeigen`;
    });
  });
})();
