/* =============================================
   TATAW MODEST — RESUME SITE · JS
   ============================================= */

// ---- HERO TITLE — CHAR SPLIT ----
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

// ---- STAT COUNT-UP ----
function initCountUp() {
  const counter = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const statNum = entry.target.querySelector('.stat-num');
      if (!statNum || statNum.dataset.counted) return;
      statNum.dataset.counted = 'true';
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
        textNode.textContent = isDecimal ? (target * eased).toFixed(1) : Math.floor(target * eased);
        if (p < 1) requestAnimationFrame(tick);
        else textNode.textContent = rawText;
      }
      requestAnimationFrame(tick);
      counter.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.reveal-stat').forEach(el => counter.observe(el));
}

// ---- LOADER ----
window.addEventListener('load', () => {
  splitHeroTitle();
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('done');
    // Hero text animations
    document.querySelector('.hero-title')?.classList.add('chars-ready');
    document.querySelector('.hero-label')?.classList.add('anim-in');
    document.querySelector('.hero-bio')?.classList.add('anim-in');
    document.querySelector('.hero-actions')?.classList.add('anim-in');
    // Trigger hero stats
    document.querySelectorAll('.reveal-stat').forEach(el => {
      setTimeout(() => el.classList.add('visible'), 200 + parseFloat(getComputedStyle(el).getPropertyValue('--delay')) * 1000);
    });

    // Delay reveal observer init until loader is done so sections animate on real scroll
    initScrollReveal();
  }, 1600);
});

initCountUp();

// ---- CANVAS STAR PARTICLES ----
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

  // Build star pool — mix of tiny dots and rare slightly bigger ones
  const COUNT = 140;
  const stars = Array.from({ length: COUNT }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() > 0.82 ? 1.4 + Math.random() * 0.6 : 0.6 + Math.random() * 0.5,
    speed: 0.12 + Math.random() * 0.28,       // base fall speed (very slow)
    drift: (Math.random() - 0.5) * 0.07,       // subtle horizontal wobble
    opacity: 0.08 + Math.random() * 0.45,
    // give each star a slow fade-pulse offset so they feel alive
    phase: Math.random() * Math.PI * 2,
    pulseSpeed: 0.003 + Math.random() * 0.008,
  }));

  function draw() {
    ctx.clearRect(0, 0, w, h);

    const time = performance.now();

    for (const s of stars) {
      s.y += s.speed;
      s.x += s.drift;

      // Wrap vertically
      if (s.y > h + 4) { s.y = -4;  s.x = Math.random() * w; }
      if (s.y < -4)   { s.y = h + 4; }
      // Wrap horizontally
      if (s.x >  w + 4) s.x = -4;
      if (s.x < -4)     s.x = w + 4;

      // Gentle opacity pulse so stars twinkle without hard blinking
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

// ---- RIGHT-SIDE DOT NAVIGATION ----
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
    a.innerHTML = `<span class="dot-nav-dot"></span><span class="dot-nav-label">${label}</span>`;
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
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      if (probe >= top && probe < bottom) return id;
      if (probe >= top) fallback = id;
    }

    return fallback;
  }

  function paintActiveSection(id) {
    wrap.querySelectorAll('.dot-nav-item').forEach(a => {
      a.classList.toggle('active', a.dataset.id === id);
    });

    document.querySelectorAll('.nav-menu a[href^="#"]').forEach(a => a.style.color = '');
    const navActive = document.querySelector(`.nav-menu a[href="#${id}"]`);
    if (navActive) navActive.style.color = 'var(--text)';
  }

  function updateActiveSection() {
    const activeId = getActiveSectionId();
    if (activeId) paintActiveSection(activeId);
  }

  updateActiveSection();
  window.addEventListener('scroll', updateActiveSection, { passive: true });
  window.addEventListener('resize', updateActiveSection);
})();

// ---- SCROLL DIM (fade sections that leave the viewport) ----
(function initScrollDim() {
  const visited = new Set();

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        visited.add(el);
        el.classList.remove('dim-exit');
      } else if (visited.has(el)) {
        // Only dim sections the user has already scrolled through
        el.classList.add('dim-exit');
      }
    });
  }, { threshold: 0.06 });

  document.querySelectorAll('section[id]').forEach(s => obs.observe(s));
})();

// ---- SCROLL PROGRESS BAR ----
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = (scrollTop / docHeight) * 100;
  document.getElementById('scrollBar').style.height = pct + '%';

  // Nav scrolled state
  const nav = document.querySelector('.nav');
  nav.classList.toggle('scrolled', scrollTop > 60);
}, { passive: true });

// ---- NAV HAMBURGER ----
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
navToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
navMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});
const navClose = document.getElementById('navClose');
if (navClose) {
  navClose.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
}

// ---- INTERSECTION OBSERVER — SCROLL REVEAL ----
let revealReady = false;
function initScrollReveal() {
  if (revealReady) return;
  revealReady = true;

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.18,
    rootMargin: '0px 0px -18% 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Stagger by local group, not full-page index, for cleaner section entrances
  ['.exp-list .exp-item', '.projects-list .project-item', '.about-grid .about-card', '.skills-grid .skill-category'].forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.07}s`;
    });
  });
}

// ---- HERO STAT VISIBILITY (fallback for slow load) ----
setTimeout(() => {
  document.querySelectorAll('.reveal-stat').forEach(el => el.classList.add('visible'));
}, 2500);
