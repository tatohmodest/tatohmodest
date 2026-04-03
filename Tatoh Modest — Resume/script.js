/* ═══════════════════════════════════════════════════════
   TATOH MODEST WILTON — RESUME PAGE SCRIPT
   Accordion · Skill bars · Sidebar nav · Theme toggle
═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────
     1. THEME TOGGLE
  ────────────────────────────────────────────────── */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon   = document.getElementById('themeIcon');

  // Default dark theme (no persistence needed for portfolio embed)
  const savedTheme = 'dark';

  function updateThemeIcon(theme) {
    if (theme === 'light') {
      // Moon icon
      themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else {
      // Sun icon
      themeIcon.innerHTML = `<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`;
    }
  }
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      if (next === 'dark') {
        document.body.removeAttribute('data-theme');
      } else {
        document.body.setAttribute('data-theme', 'light');
      }
      updateThemeIcon(next);
    });
  }

  /* ──────────────────────────────────────────────────
     2. ACCORDION TIMELINE
  ────────────────────────────────────────────────── */
  const tlTriggers = document.querySelectorAll('.tl-trigger');

  tlTriggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.tl-item');
      const isOpen = item.classList.contains('tl-item--open');

      // Close all
      document.querySelectorAll('.tl-item.tl-item--open').forEach((el) => {
        el.classList.remove('tl-item--open');
        el.querySelector('.tl-trigger').setAttribute('aria-expanded', 'false');
      });

      // Open clicked (unless it was already open)
      if (!isOpen) {
        item.classList.add('tl-item--open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ──────────────────────────────────────────────────
     3. SECTION ENTRANCE ANIMATIONS
  ────────────────────────────────────────────────── */
  const sections = document.querySelectorAll('.r-section');

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            sectionObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
    );

    sections.forEach((sec) => sectionObserver.observe(sec));
  } else {
    sections.forEach((sec) => sec.classList.add('visible'));
  }

  /* ──────────────────────────────────────────────────
     4. SKILL BAR ANIMATION
  ────────────────────────────────────────────────── */
  const skillBars = document.querySelectorAll('.skill-bar-item');

  if ('IntersectionObserver' in window) {
    const barObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fill = entry.target.querySelector('.sbi-fill');
            const pct  = entry.target.getAttribute('data-pct') || '0';
            // Brief delay for stagger effect
            const delay = Array.from(skillBars).indexOf(entry.target) * 60;
            setTimeout(() => {
              fill.style.width = pct + '%';
            }, delay);
            barObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    skillBars.forEach((bar) => barObserver.observe(bar));
  } else {
    skillBars.forEach((bar) => {
      const fill = bar.querySelector('.sbi-fill');
      fill.style.width = (bar.getAttribute('data-pct') || '0') + '%';
    });
  }

  /* ──────────────────────────────────────────────────
     5. SIDEBAR ACTIVE NAV (scroll spy)
  ────────────────────────────────────────────────── */
  const navItems = document.querySelectorAll('.sn-item[data-section]');
  const allSections = Array.from(navItems).map((item) =>
    document.getElementById(item.getAttribute('data-section'))
  ).filter(Boolean);

  function setActiveNav(id) {
    navItems.forEach((item) => {
      item.classList.toggle('active', item.getAttribute('data-section') === id);
    });
  }

  if ('IntersectionObserver' in window && allSections.length) {
    let activeId = allSections[0].id;
    setActiveNav(activeId);

    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeId = entry.target.id;
            setActiveNav(activeId);
          }
        });
      },
      { threshold: 0, rootMargin: '-30% 0px -60% 0px' }
    );

    allSections.forEach((sec) => navObserver.observe(sec));
  }

  /* ──────────────────────────────────────────────────
     6. SMOOTH SCROLL for sidebar links
  ────────────────────────────────────────────────── */
  navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(item.getAttribute('data-section'));
      if (target) {
        const topBar = document.querySelector('.top-bar');
        const offset = topBar ? topBar.offsetHeight + 20 : 68;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ──────────────────────────────────────────────────
     7. PRINT — expand all accordions before printing
  ────────────────────────────────────────────────── */
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('.tl-item').forEach((item) => {
      item.classList.add('tl-item--open');
    });
    // Immediately set all skill bar widths (no transition in print CSS)
    document.querySelectorAll('.skill-bar-item').forEach((bar) => {
      const fill = bar.querySelector('.sbi-fill');
      fill.style.width = (bar.getAttribute('data-pct') || '0') + '%';
    });
  });

  window.addEventListener('afterprint', () => {
    // Restore to only first item open
    document.querySelectorAll('.tl-item').forEach((item, idx) => {
      if (idx !== 0) item.classList.remove('tl-item--open');
    });
  });

  /* ──────────────────────────────────────────────────
     8. TAG CLOUD — subtle float animation on hover
  ────────────────────────────────────────────────── */
  const tags = document.querySelectorAll('.stb-tags span');
  tags.forEach((tag) => {
    tag.addEventListener('mouseenter', () => {
      tag.style.transform = 'translateY(-2px)';
    });
    tag.addEventListener('mouseleave', () => {
      tag.style.transform = '';
    });
  });

  /* ──────────────────────────────────────────────────
     9. STATS COUNTER ANIMATION
  ────────────────────────────────────────────────── */
  const statNums = document.querySelectorAll('.rhs-num');

  function animateCounter(el) {
    const text = el.textContent;
    const match = text.match(/^([\d.]+)/);
    if (!match) return;
    const target = parseFloat(match[1]);
    const hasDot = match[1].includes('.');
    const sup = el.querySelector('sup');
    const supText = sup ? sup.outerHTML : '';
    const duration = 1000;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      const current = hasDot
        ? (eased * target).toFixed(1)
        : Math.round(eased * target);
      el.innerHTML = current + supText;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const statsStrip = document.querySelector('.rh-stats');
    if (statsStrip) {
      const statsObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            statNums.forEach(animateCounter);
            statsObserver.unobserve(statsStrip);
          }
        },
        { threshold: 0.5 }
      );
      statsObserver.observe(statsStrip);
    }
  }

  /* ──────────────────────────────────────────────────
     10. PDF DOWNLOAD
  ────────────────────────────────────────────────── */
  const downloadBtn = document.getElementById('downloadPdfBtn');
  if (downloadBtn) {
    const ICON_DOWNLOAD = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3v13M7 12l5 5 5-5M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const ICON_SPIN    = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" style="animation:pdf-spin 0.8s linear infinite"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" stroke-dasharray="28 10" stroke-linecap="round"/></svg>`;

    downloadBtn.addEventListener('click', () => {
      if (typeof html2pdf === 'undefined') {
        // html2pdf not loaded — fall back to print dialog
        window.print();
        return;
      }

      // Show loading state
      const origHTML = downloadBtn.innerHTML;
      downloadBtn.disabled = true;
      downloadBtn.innerHTML = `${ICON_SPIN} Preparing…`;

      // Open all accordions for full content capture
      const closedItems = [];
      document.querySelectorAll('.tl-item').forEach((item) => {
        if (!item.classList.contains('tl-item--open')) {
          closedItems.push(item);
          item.classList.add('tl-item--open');
        }
      });
      // Set all skill bar widths
      document.querySelectorAll('.skill-bar-item').forEach((bar) => {
        const fill = bar.querySelector('.sbi-fill');
        if (fill) fill.style.width = (bar.getAttribute('data-pct') || '0') + '%';
      });

      // Switch to light theme for clean white PDF output
      const prevTheme = document.body.getAttribute('data-theme');
      document.body.setAttribute('data-theme', 'light');

      // Allow reflow before capture
      requestAnimationFrame(() => {
        setTimeout(() => {
          const element = document.querySelector('.resume-main');

          html2pdf()
            .set({
              margin: [12, 10, 12, 10],
              filename: 'Tatoh_Modest_Wilton_Resume.pdf',
              image: { type: 'jpeg', quality: 0.97 },
              html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                scrollY: 0
              },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
              pagebreak: { mode: 'avoid-all', before: '.r-section' }
            })
            .from(element)
            .save()
            .finally(() => {
              // Restore theme
              if (prevTheme) document.body.setAttribute('data-theme', prevTheme);
              else document.body.removeAttribute('data-theme');
              // Restore accordion state
              closedItems.forEach((item) => item.classList.remove('tl-item--open'));
              // Restore button
              downloadBtn.disabled = false;
              downloadBtn.innerHTML = origHTML;
            });
        }, 250);
      });
    });
  }

})();
