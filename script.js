/* ═══════════════════════════════════════
   TATAW MODEST v3 — INTERACTIVE JS
   Orbit wheel · Accordion · Magnetic · Canvas
═══════════════════════════════════════ */

// ── LOADER ──────────────────────────────
(function () {
  const loaderBar = document.getElementById('loaderBar');
  const loaderPct = document.getElementById('loaderPct');
  const loader    = document.getElementById('loader');

  // Smooth RAF-based fill: eases to ~92% over FILL_MS, then snaps to 100%
  const FILL_MS = 1500;
  const startTs = performance.now();
  let currentPct = 0;

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function tickLoader(now) {
    const t      = Math.min((now - startTs) / FILL_MS, 1);
    const target = easeOutQuart(t) * 92; // ease to 92%, never stalls
    currentPct   = Math.max(currentPct, target);

    loaderBar.style.width   = currentPct + '%';
    loaderPct.textContent   = Math.round(currentPct) + '%';

    if (t < 1) {
      requestAnimationFrame(tickLoader);
    } else {
      // Snap to 100, pause, then dismiss
      loaderBar.style.width = '100%';
      loaderPct.textContent = '100%';
      setTimeout(dismissLoader, 380);
    }
  }

  function dismissLoader() {
    loader.classList.add('done');
    // Hero names slide up just as loader starts fading
    document.querySelectorAll('.slide-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 140 + 80);
    });
    // Photo reveal overlay wipes after names are done
    const overlay = document.querySelector('.photo-reveal-overlay');
    if (overlay) setTimeout(() => overlay.classList.add('revealed'), 600);
  }

  requestAnimationFrame(tickLoader);
})();

// ── HERO PHOTO — tap toggle for mobile ──
(function() {
  const frame = document.getElementById('heroPhotoFrame');
  if (!frame) return;
  let toggled = false;
  frame.addEventListener('click', () => {
    // Only meaningful on touch devices where :hover doesn't stick
    if (window.matchMedia('(hover: none)').matches) {
      toggled = !toggled;
      frame.classList.toggle('revealed', toggled);
    }
  });
})();

// ── CUSTOM CURSOR ───────────────────────
// Skip entirely on touch-only devices (no hover = no mouse)
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
if (window.matchMedia('(hover: hover)').matches) {
  let mx = window.innerWidth/2, my = window.innerHeight/2;
  let fx = mx, fy = my;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function animateCursor() {
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    fx += (mx - fx) * 0.1;
    fy += (my - fy) * 0.1;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}

// ── HERO CANVAS — RAIN ──────────────────
(function() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, drops = [];

  // Slight diagonal angle for natural rain look
  const ANGLE = 0.18; // radians ~10°

  function mkDrop(spreadY) {
    const speed  = Math.random() * 3.2 + 0.9;
    const length = Math.random() * 32 + 10;
    return {
      x:       Math.random() * (W || 1400),
      y:       spreadY ? Math.random() * (H || 900) : -(Math.random() * 300 + length),
      speed,
      length,
      opacity: Math.random() * 0.20 + 0.04,
      width:   Math.random() * 0.65 + 0.2,
      // Each drop drifts at the shared angle + tiny individual variance
      dx:      Math.sin(ANGLE) * speed + (Math.random() - 0.5) * 0.15,
      dy:      Math.cos(ANGLE) * speed
    };
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    drops = [];
    for (let i = 0; i < 160; i++) drops.push(mkDrop(true));
  }
  resize();
  let _rainResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(_rainResizeTimer);
    _rainResizeTimer = setTimeout(resize, 200);
  }, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    drops.forEach(d => {
      // Compute tail (fading end) from direction vector
      const tailX = d.x - (d.dx / d.speed) * d.length;
      const tailY = d.y - (d.dy / d.speed) * d.length;

      const grad = ctx.createLinearGradient(tailX, tailY, d.x, d.y);
      grad.addColorStop(0, `rgba(0,208,132,0)`);
      grad.addColorStop(0.6, `rgba(0,208,132,${d.opacity * 0.55})`);
      grad.addColorStop(1, `rgba(0,208,132,${d.opacity})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(d.x, d.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = d.width;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // Advance position
      d.x += d.dx;
      d.y += d.dy;

      // Reset once off the bottom or sides
      if (d.y - d.length > H + 20 || d.x > W + 80 || d.x < -80) {
        const newDrop = mkDrop(false);
        newDrop.x = Math.random() * (W + 100) - 50;
        Object.assign(d, newDrop);
      }
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

// ── NAV ─────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

const burger  = document.getElementById('navBurger');
const mobMenu = document.getElementById('mobMenu');
burger.addEventListener('click', () => {
  const open = mobMenu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  const [s1, s2] = burger.querySelectorAll('span');
  s1.style.transform = open ? 'translateY(6px) rotate(45deg)' : '';
  s2.style.transform = open ? 'translateY(-6px) rotate(-45deg)' : '';
});
mobMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobMenu.classList.remove('open');
  const [s1, s2] = burger.querySelectorAll('span');
  s1.style.transform = ''; s2.style.transform = '';
}));

// ── MAGNETIC ELEMENTS ───────────────────
document.querySelectorAll('.magnetic').forEach(el => {
  const strength = parseInt(el.dataset.strength || 30);
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `translate(${dx * strength * 0.4}px, ${dy * strength * 0.4}px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

// ── TILT CARDS ──────────────────────────
document.querySelectorAll('[data-tilt]').forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 12;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 12;
    el.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${-y}deg) translateZ(6px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

// ── ORBIT SKILL WHEEL ───────────────────
(function() {
  const scene  = document.querySelector('.orbit-scene');
  if (!scene) return;
  const nodes  = Array.from(scene.querySelectorAll('.skill-node'));
  const tooltip = document.getElementById('skillTooltip');
  const stName  = document.getElementById('stName');
  const stDesc  = document.getElementById('stDesc');
  const pts = [];
  const n = nodes.length;
  const golden = Math.PI * (3 - Math.sqrt(5));
  let rotY = 0;
  let rotX = -0.18;
  let speedY = 0.0065;
  let speedX = 0.0018;
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let hoveredNode = null;
  let radius = 170;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2;
    const rr = Math.sqrt(Math.max(0, 1 - y * y));
    const t = golden * i;
    pts.push({ x: Math.cos(t) * rr, y, z: Math.sin(t) * rr });
  }

  function recalc() {
    const w = scene.clientWidth;
    const h = scene.clientHeight;
    radius = Math.min(w, h) * 0.36;
    cx = w * 0.5;
    cy = h * 0.5;
  }

  function rotatePoint(p, ax, ay) {
    const cosY = Math.cos(ay);
    const sinY = Math.sin(ay);
    let x = p.x * cosY - p.z * sinY;
    let z = p.x * sinY + p.z * cosY;

    const cosX = Math.cos(ax);
    const sinX = Math.sin(ax);
    const y = p.y * cosX - z * sinX;
    z = p.y * sinX + z * cosX;

    return { x, y, z };
  }

  function placeTooltip(node) {
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const ttRect = tooltip.getBoundingClientRect();
    let left = rect.right + 14;
    let top = rect.top + rect.height * 0.5 - ttRect.height * 0.5;

    if (left + ttRect.width > window.innerWidth - 10) {
      left = rect.left - ttRect.width - 14;
    }
    if (left < 10) left = 10;
    if (top < 10) top = 10;
    if (top + ttRect.height > window.innerHeight - 10) {
      top = window.innerHeight - ttRect.height - 10;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function render() {
    if (!isDragging) {
      rotY += speedY;
      rotX += speedX;
      speedY *= 0.996;
      speedX *= 0.996;
      if (Math.abs(speedY) < 0.002) speedY = 0.002;
      if (Math.abs(speedX) < 0.0007) speedX = 0.0007;
    }

    nodes.forEach((node, i) => {
      const p = rotatePoint(pts[i], rotX, rotY);
      const depth = (p.z + 1) * 0.5;
      const scale = 0.58 + depth * 0.72;
      const x = cx + p.x * radius * 1.18;
      const y = cy + p.y * radius * 1.18;

      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      node.style.transform = `translate(-50%, -50%) scale(${scale})`;
      node.style.opacity = `${0.4 + depth * 0.7}`;
      node.style.zIndex = `${Math.round(30 + depth * 70)}`;
    });

    if (hoveredNode && tooltip.classList.contains('visible')) {
      placeTooltip(hoveredNode);
    }

    requestAnimationFrame(render);
  }

  recalc();
  render();
  let _orbitResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(_orbitResizeTimer);
    _orbitResizeTimer = setTimeout(recalc, 200);
  }, { passive: true });

  scene.addEventListener('mousedown', e => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    scene.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    rotY += dx * 0.008;
    rotX += dy * 0.006;
    speedY = dx * 0.00075;
    speedX = dy * 0.00055;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    scene.style.cursor = 'grab';
  });

  scene.addEventListener('touchstart', e => {
    const t = e.touches[0];
    isDragging = true;
    lastX = t.clientX;
    lastY = t.clientY;
  }, { passive: true });

  scene.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const t = e.touches[0];
    const dx = t.clientX - lastX;
    const dy = t.clientY - lastY;
    rotY += dx * 0.008;
    rotX += dy * 0.006;
    speedY = dx * 0.00075;
    speedX = dy * 0.00055;
    lastX = t.clientX;
    lastY = t.clientY;
  }, { passive: true });

  scene.addEventListener('touchend', () => {
    isDragging = false;
  }, { passive: true });

  nodes.forEach(node => {
    node.addEventListener('mouseenter', () => {
      nodes.forEach(nod => nod.classList.remove('active'));
      node.classList.add('active');
      hoveredNode = node;
      stName.textContent = node.dataset.skill || 'Skill';
      stDesc.textContent = node.dataset.desc || '';
      tooltip.classList.add('visible');
      placeTooltip(node);
    });

    node.addEventListener('mouseleave', () => {
      node.classList.remove('active');
      hoveredNode = null;
      tooltip.classList.remove('visible');
    });

    node.addEventListener('click', () => {
      hoveredNode = node;
      stName.textContent = node.dataset.skill || 'Skill';
      stDesc.textContent = node.dataset.desc || '';
      tooltip.classList.add('visible');
      placeTooltip(node);
      setTimeout(() => {
        if (!node.matches(':hover')) {
          tooltip.classList.remove('visible');
        }
      }, 2600);
    });
  });
})();

// ── ACCORDION ───────────────────────────
document.querySelectorAll('.acc-item').forEach(item => {
  const trigger = item.querySelector('.acc-trigger');
  trigger.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.acc-item.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
  // Open first by default
  if (item.dataset.index === '0') item.classList.add('open');
});

// ── SCROLL REVEAL ───────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    revealObs.unobserve(e.target);
    // Counter
    const counter = e.target.querySelector('.counter');
    if (counter) animateCounter(counter);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// Stagger children
document.querySelectorAll('.acard').forEach((el, i) => el.style.setProperty('--rd', `${i*0.08}s`));
document.querySelectorAll('.proj-card').forEach((el, i) => el.style.setProperty('--rd', `${i*0.07}s`));
document.querySelectorAll('.impact-label-item').forEach((el, i) => el.style.setProperty('--rd', `${i*0.1}s`));

// ── COUNTER ANIMATION ───────────────────
function animateCounter(el) {
  const target  = parseFloat(el.dataset.target);
  const suffix  = el.dataset.suffix || '';
  const dur     = 1600;
  const start   = performance.now();
  const isFloat = el.dataset.target.includes('.');

  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(2, -10 * t);
    const val  = ease * target;
    el.textContent = (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = (isFloat ? target.toFixed(1) : target) + suffix;
  }
  requestAnimationFrame(tick);
}

// ── ACTIVE NAV HIGHLIGHT ────────────────
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => a.style.color = '');
      const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (active) active.style.color = 'var(--text)';
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => sectionObs.observe(s));
