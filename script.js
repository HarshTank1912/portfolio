/**
 * JORDAN VOSS PORTFOLIO — script.js
 * ─────────────────────────────────
 * Features:
 *  1. Custom cursor
 *  2. Navbar — scroll behaviour + active section highlight + hamburger
 *  3. Canvas particle network (hero background)
 *  4. Scroll-reveal via IntersectionObserver
 *  5. Counter animation (hero stats)
 *  6. Project card mouse-tracking glow
 *  7. Contact form (mailto)
 *  8. Footer year
 * ─────────────────────────────────
 */

'use strict';

/* ════════════════════════════════════════════════
   1. CUSTOM CURSOR — DISABLED (native cursor restored)
════════════════════════════════════════════════ */
// Custom cursor removed — using the default system cursor.

/* ════════════════════════════════════════════════
   2. NAVBAR
════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const navLinks  = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (!navbar) return;

  /* --- Scroll behaviour (add .scrolled class) --- */
  const onScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* --- Hamburger toggle --- */
  function toggleMenu() {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    // Prevent body scroll when menu open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close mobile menu when a link is clicked
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* --- Active section highlight (IntersectionObserver) --- */
  const sections = document.querySelectorAll('section[id]');
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const active = link.getAttribute('data-section') === id;
            link.classList.toggle('active', active);
          });
        }
      });
    },
    {
      threshold: 0.45,
      rootMargin: '-72px 0px 0px 0px',
    }
  );

  sections.forEach((s) => sectionObserver.observe(s));
})();

/* ════════════════════════════════════════════════
   3. CANVAS PARTICLE NETWORK (Hero Background)
════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, animFrame;
  let mouseX = -9999, mouseY = -9999;

  const CONFIG = {
    count:        80,
    maxDist:      140,
    speed:        0.4,
    particleColor: 'rgba(67, 232, 176, ',   // mint, alpha varies
    lineColor:     'rgba(67, 232, 176, ',
    mouseRadius:  150,
  };

  /* --- Resize canvas to fill hero section --- */
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  /* --- Particle factory --- */
  function createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 0.5 + 0.1) * CONFIG.speed;
    return {
      x:   Math.random() * W,
      y:   Math.random() * H,
      vx:  Math.cos(angle) * speed,
      vy:  Math.sin(angle) * speed,
      r:   Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    };
  }

  function initParticles() {
    particles = Array.from({ length: CONFIG.count }, createParticle);
  }

  /* --- Draw loop --- */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update & draw particles
    particles.forEach((p) => {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Mouse repulsion
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONFIG.mouseRadius) {
        const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
        p.x += dx / dist * force * 2;
        p.y += dy / dist * force * 2;
      }

      // Wrap edges
      if (p.x < 0)  p.x = W;
      if (p.x > W)  p.x = 0;
      if (p.y < 0)  p.y = H;
      if (p.y > H)  p.y = 0;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.particleColor + p.alpha + ')';
      ctx.fill();
    });

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.maxDist) {
          const alpha = (1 - dist / CONFIG.maxDist) * 0.25;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = CONFIG.lineColor + alpha + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    animFrame = requestAnimationFrame(draw);
  }

  /* --- Mouse tracking (hero section only) --- */
  const heroSection = document.getElementById('home');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    heroSection.addEventListener('mouseleave', () => {
      mouseX = -9999;
      mouseY = -9999;
    });
  }

  /* --- Init & reduce on low-power --- */
  resize();
  initParticles();
  draw();

  // Pause animation when tab hidden (saves battery)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animFrame);
    } else {
      animFrame = requestAnimationFrame(draw);
    }
  });
})();

/* ════════════════════════════════════════════════
   4. SCROLL-REVEAL (Intersection Observer)
════════════════════════════════════════════════ */
(function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Animate only once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  reveals.forEach((el) => observer.observe(el));
})();

/* ════════════════════════════════════════════════
   5. HERO STAT COUNTERS
════════════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target  = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800; // ms
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  // Start counters when hero stats enter the viewport
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          counters.forEach(animateCounter);
          statsObserver.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );

  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) statsObserver.observe(statsEl);
})();

/* ════════════════════════════════════════════════
   6. PROJECT CARD — MOUSE-TRACKING GLOW
════════════════════════════════════════════════ */
(function initCardGlow() {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
})();

/* ════════════════════════════════════════════════
   7. CONTACT FORM (mailto fallback — no backend)
════════════════════════════════════════════════ */
(function initContactForm() {
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  const EMAIL = 'harshtank19@gmail.com';

  /* --- Simple validation helper --- */
  function validate(fields) {
    let valid = true;
    fields.forEach(({ el, check, msg }) => {
      el.classList.remove('error');
      if (!check(el.value.trim())) {
        el.classList.add('error');
        valid = false;
      }
    });
    return valid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameEl    = form.querySelector('#name');
    const emailEl   = form.querySelector('#email');
    const messageEl = form.querySelector('#message');

    const isValid = validate([
      { el: nameEl,    check: (v) => v.length >= 2,            msg: 'Name too short' },
      { el: emailEl,   check: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Invalid email' },
      { el: messageEl, check: (v) => v.length >= 10,           msg: 'Message too short' },
    ]);

    if (!isValid) return;

    // Build mailto URL
    const subject = encodeURIComponent(`Portfolio Contact from ${nameEl.value.trim()}`);
    const body    = encodeURIComponent(
      `Hi Jordan,\n\n${messageEl.value.trim()}\n\n— ${nameEl.value.trim()} (${emailEl.value.trim()})`
    );
    const mailto  = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

    // Provide feedback before opening mail client
    const btnText = submitBtn.querySelector('.btn-text');
    const icon    = submitBtn.querySelector('i');
    btnText.textContent = 'Opening Mail Client…';
    icon.className = 'fa-solid fa-check';
    submitBtn.style.background = '#43e8b0';
    submitBtn.style.color = '#0d0d10';
    submitBtn.disabled = true;

    // Open mailto
    window.location.href = mailto;

    // Reset button after 3s
    setTimeout(() => {
      btnText.textContent = 'Send Message';
      icon.className = 'fa-solid fa-paper-plane';
      submitBtn.style.background = '';
      submitBtn.style.color = '';
      submitBtn.disabled = false;
      form.reset();
    }, 3000);
  });

  // Clear error state on input
  form.querySelectorAll('input, textarea').forEach((el) => {
    el.addEventListener('input', () => el.classList.remove('error'));
  });
})();

/* ════════════════════════════════════════════════
   8. FOOTER YEAR
════════════════════════════════════════════════ */
(function setFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ════════════════════════════════════════════════
   9. SMOOTH SCROLL for all anchor links
════════════════════════════════════════════════ */
(function initSmoothScroll() {
  // CSS scroll-behavior: smooth handles most of it,
  // but this adds extra offset for the fixed navbar.
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      // Let CSS handle it (scroll-padding-top is set in CSS)
      // This function is here for future custom offset if needed.
    });
  });
})();

/* ════════════════════════════════════════════════
   10. HERO ENTRANCE ANIMATIONS (CSS-driven)
       JS marks <body> as loaded so CSS transitions fire
════════════════════════════════════════════════ */
(function markLoaded() {
  // Give browser one frame to parse then fire entrance classes
  requestAnimationFrame(() => {
    document.body.classList.add('loaded');
  });
})();

/* ════════════════════════════════════════════════
   11. STACK ITEM STAGGER (extra flair on hover)
════════════════════════════════════════════════ */
(function initStackHover() {
  const items = document.querySelectorAll('.stack-item');
  // Magnetic-lite effect: subtle nudge toward cursor
  items.forEach((item) => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      item.style.transform = `translateY(-6px) scale(1.03) translate(${dx * 4}px, ${dy * 4}px)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });
})();

/* ════════════════════════════════════════════════
   12. CONTACT CARD hover ripple (micro-interaction)
════════════════════════════════════════════════ */
(function initContactRipple() {
  const cards = document.querySelectorAll('.contact-card');
  cards.forEach((card) => {
    card.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect   = card.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute; border-radius:50%; pointer-events:none;
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size / 2}px;
        top:${e.clientY - rect.top  - size / 2}px;
        background:rgba(245,166,35,0.12);
        transform:scale(0); animation:rippleAnim 0.5s ease forwards;
      `;
      card.style.position = 'relative';
      card.style.overflow = 'hidden';
      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Inject ripple keyframe once
  if (!document.getElementById('rippleStyle')) {
    const style = document.createElement('style');
    style.id = 'rippleStyle';
    style.textContent = `
      @keyframes rippleAnim {
        to { transform: scale(2.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
})();
