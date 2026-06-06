// FITZ INDUSTRIES — custom cursor + magnetic buttons
(() => {
  if (window.matchMedia('(hover:none)').matches) return;
  const cursor = document.querySelector('.cursor');
  const dot = document.querySelector('.cursor__dot');
  const ring = document.querySelector('.cursor__ring');
  if (!cursor) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function render() {
    requestAnimationFrame(render);
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
  }
  render();

  const hoverables = 'a, button, [data-magnetic], input, textarea, .pcard';
  document.querySelectorAll(hoverables).forEach((el) => {
    el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
  });

  // magnetic effect
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = 0.35;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
})();
