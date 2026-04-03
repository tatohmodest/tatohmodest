/* ═══════════════════════════════════════════════════════════════
   TATOH MODEST — CINEMATIC PORTFOLIO JS
   Char-split · Count-up · Star Canvas · Dot Nav · Scroll Dim
   Accordion · Orbit Hover · Custom Cursor · Scroll Reveal
═══════════════════════════════════════════════════════════════ */

// ──────────────────── HERO TITLE — CHAR SPLIT ──────────────────
function splitHeroTitle() {
  const h1 = document.querySelector('.hero-title');
  if (!h1) return;

  function esc(ch) {
    return ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch;
  }

  let idx = 0;
  const lines = [];

  h1.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (!text) return;
      const chars = [...text].map(c =>
        `<span class="char" style="--i:${idx++}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`
      ).join('');
      lines.push(`<span class="char-line">${chars}</span>`);
    } else if (node.nodeName === 'EM') {
      const chars = [...node.textContent].map(c =>
        `<span class="char" style="--i:${idx++}">${esc(c)}</span>`
      ).join('');
      lines.push(`<span class="char-line"><em>${chars}</em></span>`);
    } else if (node.nodeName === 'SPAN') {
      const chars = [...node.textContent].map(c =>
        `<span class="char" style="--i:${idx++}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`
      ).join('');
      lines.push(`<span class="char-line"><span class="${node.className}">${chars}</span></span>`);
    }
  });

  h1.innerHTML = lines.join('');
}

// ──────────────────── STAT COUNT-UP ──────────────────
function initCountUp() {
  const counter = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const statNum = entry.target.querySelector('.stat-num');
      if (!statNum || statNum.dataset.counted) return;
      statNum.dataset.counted = 'true';
      // Find the raw text node (ignore .stat-plus child)
      const textNode = Array.from(statNum.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
      if (!textNode) return;
      const rawText = textNode.textContent.trim();
      const target = parseFloat(rawText);
      if (isNaN(target)) return;
      const isDecimal = rawText.includes('.');
      const duration = 1400;
      const startTime = performance.now();
      function tick(now) {
        const p = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        textNode.textContent = isDecimal
          ? (target * eased).toFixed(1)
          : Math.floor(target * eased);
        if (p < 1) requestAnimationFrame(tick);
        else textNode.textContent = rawText;
      }
      requestAnimationFrame(tick);
      counter.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.reveal-stat').forEach(el => counter.observe(el));
}

// ──────────────────── CUSTOM CURSOR ──────────────────
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    dot.style.transform  = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
    ringX += (e.clientX - ringX) * 0.18;
    ringY += (e.clientY - ringY) * 0.18;
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
  });

  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, .project-card, .story-card, .acc-header, .skill-item')) {
      ring.classList.add('hovering');
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, .project-card, .story-card, .acc-header, .skill-item')) {
      ring.classList.remove('hovering');
    }
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });

  // RAF loop for smooth ring lag
  (function rafLoop() {
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    requestAnimationFrame(rafLoop);
  })();
})();

// ──────────────────── STAR CANVAS ──────────────────
(function initStarCanvas() {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h;
  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COUNT = 140;
  const stars = Array.from({ length: COUNT }, () => ({
    x:          Math.random() * window.innerWidth,
    y:          Math.random() * window.innerHeight,
    r:          Math.random() > 0.82 ? 1.4 + Math.random() * 0.6 : 0.6 + Math.random() * 0.5,
    speed:      0.12 + Math.random() * 0.28,
    drift:      (Math.random() - 0.5) * 0.07,
    opacity:    0.08 + Math.random() * 0.45,
    phase:      Math.random() * Math.PI * 2,
    pulseSpeed: 0.003 + Math.random() * 0.008,
  }));

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const time = performance.now();
    for (const s of stars) {
      s.y += s.speed;
      s.x += s.drift;
      if (s.y >  h + 4) { s.y = -4;    s.x = Math.random() * w; }
      if (s.y < -4)      { s.y = h + 4; }
      if (s.x >  w + 4) s.x = -4;
      if (s.x < -4)     s.x = w + 4;
      const pulse   = 0.5 + 0.5 * Math.sin(time * s.pulseSpeed + s.phase);
      const opacity = s.opacity * (0.65 + 0.35 * pulse);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232, 230, 226, ${opacity})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ──────────────────── RIGHT-SIDE DOT NAVIGATION ──────────────────
(function initDotNav() {
  const SECTIONS = [
    { id: 'home',       label: 'Home' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects',   label: 'Projects' },
    { id: 'skills',     label: 'Stack' },
    { id: 'about',      label: 'Background' },
    { id: 'contact',    label: 'Contact' },
  ];

  const wrap = document.createElement('nav');
  wrap.className = 'dot-nav';
  wrap.setAttribute('aria-label', 'Section navigation');

  SECTIONS.forEach(({ id, label }) => {
    const a = document.createElement('a');
    a.href = '#' + id;
    a.className = 'dot-nav-item';
    a.setAttribute('aria-label', label);
    a.dataset.id = id;
    a.innerHTML = `<span class="dot-nav-label">${label}</span><span class="dot-nav-dot"></span>`;
    a.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    });
    wrap.appendChild(a);
  });

  document.body.appendChild(wrap);

  const sectionEls = SECTIONS
    .map(({ id }) => ({ id, el: document.getElementById(id) }))
    .filter(item => item.el);

  function getActiveSectionId() {
    const probe = window.scrollY + window.innerHeight * 0.38;
    let fallback = sectionEls[0]?.id;
    for (const { id, el } of sectionEls) {
      const top    = el.offsetTop;
      const bottom = top + el.offsetHeight;
      if (probe >= top && probe < bottom) return id;
      if (probe >= top) fallback = id;
    }
    return fallback;
  }

  function paintActive(id) {
    wrap.querySelectorAll('.dot-nav-item').forEach(a => {
      a.classList.toggle('active', a.dataset.id === id);
    });
    document.querySelectorAll('.nav-menu a[href^="#"]').forEach(a => a.classList.remove('nav-active'));
    const navLink = document.querySelector(`.nav-menu a[href="#${id}"]`);
    if (navLink) navLink.classList.add('nav-active');
  }

  function update() {
    const id = getActiveSectionId();
    if (id) paintActive(id);
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
})();

// ──────────────────── SCROLL DIM ──────────────────
(function initScrollDim() {
  const visited = new Set();
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        visited.add(el);
        el.classList.remove('dim-exit');
      } else if (visited.has(el)) {
        el.classList.add('dim-exit');
      }
    });
  }, { threshold: 0.06 });

  document.querySelectorAll('section[id]').forEach(s => obs.observe(s));
})();

// ──────────────────── ACCORDION ──────────────────
(function initAccordion() {
  const headers = document.querySelectorAll('.acc-header');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const expanded = header.getAttribute('aria-expanded') === 'true';
      // Close all first
      headers.forEach(h => h.setAttribute('aria-expanded', 'false'));
      // Toggle clicked one
      if (!expanded) header.setAttribute('aria-expanded', 'true');
    });
  });
})();

// ──────────────────── SCROLL PROGRESS BAR ──────────────────
const _scrollFill = document.querySelector('.scroll-bar-fill');
window.addEventListener('scroll', () => {
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const pct  = (window.scrollY / docH) * 100;
  if (_scrollFill) _scrollFill.style.width = pct + '%';

  // Nav scrolled state
  document.querySelector('.nav')?.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ──────────────────── NAV HAMBURGER ──────────────────
const _navToggle = document.getElementById('navToggle');
const _navMenu   = document.getElementById('navMenu');
const _navClose  = document.getElementById('navClose');

_navToggle?.addEventListener('click', () => {
  const open = _navMenu.classList.toggle('open');
  _navToggle.setAttribute('aria-expanded', open);
});

_navClose?.addEventListener('click', () => {
  _navMenu.classList.remove('open');
  _navToggle.setAttribute('aria-expanded', 'false');
});

_navMenu?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    _navMenu.classList.remove('open');
    _navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ──────────────────── SCROLL REVEAL ──────────────────
let _revealReady = false;
function initScrollReveal() {
  if (_revealReady) return;
  _revealReady = true;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -18% 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // Stagger exp items
  document.querySelectorAll('.acc-item').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.07}s`;
  });
}

// ──────────────────── LOADER + HERO ENTRY ──────────────────
window.addEventListener('load', () => {
  splitHeroTitle();

  const loader = document.getElementById('loader');

  setTimeout(() => {
    loader?.classList.add('done');

    // Fire hero char animation
    document.querySelector('.hero-title')?.classList.add('chars-ready');
    document.querySelector('.hero-eyebrow')?.classList.add('anim-in');
    document.querySelector('.hero-bottom')?.classList.add('anim-in');

    // Trigger stat reveal
    document.querySelectorAll('.reveal-stat').forEach(el => {
      const delay = parseFloat(getComputedStyle(el).getPropertyValue('--delay')) || 0;
      setTimeout(() => el.classList.add('visible'), 200 + delay * 1000);
    });

    initScrollReveal();
  }, 1600);
});

initCountUp();

// Fallback timers
setTimeout(() => { document.getElementById('loader')?.classList.add('done'); }, 2400);
setTimeout(() => { document.querySelectorAll('.reveal-stat').forEach(el => el.classList.add('visible')); }, 2500);

// ──────────────────── SMOOTH ANCHOR SCROLL ──────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

console.log('✓ Tatoh Modest Portfolio — all systems active');
