/* Shared behavior for every page. Progressive enhancement — the site works
   without JS; this adds the progress bar, reveals, and the home typewriter. */

// Scrolling is native — macOS momentum already feels great, so we don't fight
// it with a smooth-scroll library. Anchor jumps use CSS scroll-behavior.

// ── Scroll-driven UI: progress bar, header state, back-to-top ──
// Height is cached (reading it forces layout); scroll only schedules one rAF.
(function () {
  const progress = document.getElementById('progressBar');
  const header = document.getElementById('header');
  const backTop = document.getElementById('backTop');
  let max = 0, ticking = false;
  function measure() { max = document.documentElement.scrollHeight - window.innerHeight; }
  function render() {
    ticking = false;
    const st = window.scrollY || document.documentElement.scrollTop;
    if (progress) progress.style.width = (max > 0 ? Math.min(100, (st / max) * 100) : 0) + '%';
    if (header) header.classList.toggle('scrolled', st > 20);
    if (backTop) backTop.classList.toggle('show', st > 480);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(render); } }
  measure(); render();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); render(); }, { passive: true });
  window.addEventListener('load', () => { measure(); render(); });
})();

// ── Reveal on scroll ──
(function () {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('visible')); return; }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        e.target.style.transitionDelay = (Math.min(i, 4) * 70) + 'ms';
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
  els.forEach(el => obs.observe(el));
})();

// Experience rows are always expanded now; no accordion behavior needed.

// ── Experience rows: cursor-following sheen ──
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.work-item > .work-head').forEach(s => {
    s.addEventListener('pointermove', (e) => {
      const r = s.getBoundingClientRect();
      s.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      s.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  });
})();

// ── Typewriter (home only) ──
(function () {
  const tw = document.getElementById('typewriter');
  if (!tw) return;
  const phrases = ['founder.', 'builder.', 'investor.', 'engineer.'];
  let pi = 0, ci = 0, deleting = false;
  (function tick() {
    const phrase = phrases[pi];
    tw.textContent = deleting ? phrase.slice(0, ci--) : phrase.slice(0, ci++);
    let delay = deleting ? 45 : 95;
    if (!deleting && ci > phrase.length) { deleting = true; delay = 1700; }
    else if (deleting && ci < 0) { deleting = false; ci = 0; pi = (pi + 1) % phrases.length; delay = 440; }
    setTimeout(tick, delay);
  })();
})();
