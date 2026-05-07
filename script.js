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
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const navLinks = document.querySelectorAll('.nav-link');
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
    count: 80,
    maxDist: 140,
    speed: 0.4,
    particleColor: 'rgba(67, 232, 176, ',   // mint, alpha varies
    lineColor: 'rgba(67, 232, 176, ',
    mouseRadius: 150,
  };

  /* --- Resize canvas to fill hero section --- */
  function resize() {
    W = canvas.width = canvas.offsetWidth;
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
      x: Math.random() * W,
      y: Math.random() * H,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: Math.random() * 1.5 + 0.5,
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
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

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
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800; // ms
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
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
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
})();

/* ════════════════════════════════════════════════
   7. CONTACT FORM (mailto fallback — no backend)
════════════════════════════════════════════════ */
(function initContactForm() {
  const form = document.getElementById('contactForm');
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

    const nameEl = form.querySelector('#name');
    const emailEl = form.querySelector('#email');
    const messageEl = form.querySelector('#message');

    const isValid = validate([
      { el: nameEl, check: (v) => v.length >= 2, msg: 'Name too short' },
      { el: emailEl, check: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Invalid email' },
      { el: messageEl, check: (v) => v.length >= 10, msg: 'Message too short' },
    ]);

    if (!isValid) return;

    // Build mailto URL
    const subject = encodeURIComponent(`Portfolio Contact from ${nameEl.value.trim()}`);
    const body = encodeURIComponent(
      `Hi Jordan,\n\n${messageEl.value.trim()}\n\n— ${nameEl.value.trim()} (${emailEl.value.trim()})`
    );
    const mailto = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

    // Provide feedback before opening mail client
    const btnText = submitBtn.querySelector('.btn-text');
    const icon = submitBtn.querySelector('i');
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
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
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
      const rect = card.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute; border-radius:50%; pointer-events:none;
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size / 2}px;
        top:${e.clientY - rect.top - size / 2}px;
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

/* ════════════════════════════════════════════════
   13. AI CHATBOT — Rule-Based Portfolio Assistant
════════════════════════════════════════════════ */
(function initChatbot() {

  /* ── Elements ── */
  const bubble = document.getElementById('chatBubble');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatClose');
  const overlay = document.getElementById('chatOverlay');
  const messagesEl = document.getElementById('chatMessages');
  const inputEl = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const chips = document.querySelectorAll('.chat-chip');
  const bubbleIcon = document.getElementById('chatBubbleIcon');

  if (!bubble || !panel) return;

  let isOpen = false;
  let isBusy = false;

  /* ══════════════════════════════════════════════
     KNOWLEDGE BASE — Everything about Harsh Tank
  ══════════════════════════════════════════════ */
  const KB = {

    greet: {
      keywords: ['hi', 'hello', 'hey', 'sup', 'hiya', 'greetings', 'howdy', 'what\'s up', 'whats up', 'good morning', 'good afternoon', 'good evening'],
      response: () => `Hey there! 👋 I'm <strong>HT Assistant</strong>, your guide to everything about <em>Harsh Tank</em>.<br><br>
        I can tell you about his <strong>projects</strong>, <strong>skills</strong>, <strong>education</strong>, how to <strong>hire him</strong>, and more.<br><br>
        Type <em>help</em> to see everything I can answer!`
    },

    help: {
      keywords: ['help', 'commands', 'topics', 'what can you', 'what do you know', 'what can i ask', 'menu', 'options', 'list', 'show me'],
      response: () => `Here's everything I can help you with:<br><br>
        👋 <strong>About Harsh</strong> — <em>"who is harsh"</em>, <em>"tell me about yourself"</em><br>
        🚀 <strong>Projects</strong> — <em>"what projects"</em>, <em>"campus ride"</em>, <em>"smartlogix"</em>, <em>"securecity"</em><br>
        ⚡ <strong>Skills & Tech Stack</strong> — <em>"what skills"</em>, <em>"tech stack"</em>, <em>"what do you know"</em><br>
        🎓 <strong>Education</strong> — <em>"education"</em>, <em>"college"</em>, <em>"cgpa"</em>, <em>"btech"</em><br>
        🏆 <strong>Certifications</strong> — <em>"certifications"</em>, <em>"sap"</em>, <em>"ai ml training"</em><br>
        📬 <strong>Contact</strong> — <em>"how to contact"</em>, <em>"email"</em>, <em>"reach out"</em><br>
        🐙 <strong>GitHub</strong> — <em>"github"</em>, <em>"repo"</em>, <em>"code"</em><br>
        💼 <strong>LinkedIn</strong> — <em>"linkedin"</em>, <em>"professional profile"</em><br>
        📍 <strong>Location</strong> — <em>"where is he"</em>, <em>"surat"</em>, <em>"remote"</em><br>
        ✅ <strong>Hiring / Availability</strong> — <em>"is he available"</em>, <em>"internship"</em>, <em>"freelance"</em><br><br>
        Just type naturally — I'll figure it out! 😊`
    },

    about: {
      keywords: ['who is', 'about harsh', 'tell me about', 'introduce', 'yourself', 'overview', 'background', 'who are you', 'who r u'],
      response: () => `<strong>Harsh Tank</strong> is a passionate <em>Full Stack Developer</em> and pre-final year B.Tech student. 🚀<br><br>
        He builds <strong>scalable web & mobile applications</strong> using React Native, Node.js, MongoDB, Firebase, and more.<br><br>
        With a <em>CGPA of 8.81</em>, he combines strong academics with real-world project experience spanning mobile apps, machine learning systems, and secure web platforms.`
    },

    projects: {
      keywords: ['project', 'projects', 'built', 'build', 'made', 'work', 'portfolio', 'campus ride', 'smartlogix', 'securecity', 'shipsense', 'ride sharing', 'delivery', 'crime'],
      response: () => `Here are Harsh's featured projects:<br><br>
        🚀 <strong>Campus Ride</strong> — A React Native + Expo + Firebase ride-sharing app for college campuses with OTP-secured ride starts, real-time sync, and a coin-based cost-sharing system.<br><br>
        📦 <strong>SmartLogix</strong> — An ML-powered delivery delay predictor (Random Forest, 68% accuracy, 0.74 ROC-AUC) with an interactive Streamlit + Plotly dashboard. <a href="https://shipsense-e-commerce-delivery-prediction-harshtank1912.streamlit.app/" target="_blank">Live Demo ↗</a><br><br>
        🛡️ <strong>SecureCity</strong> — Role-based crime management system (Admin / Police / Citizen) built with PHP, MySQL, and full CRUD operations with secure authentication.`
    },

    skills: {
      keywords: ['skill', 'skills', 'tech', 'stack', 'technologies', 'know', 'can do', 'expertise', 'proficient', 'language', 'languages', 'what do you', 'framework', 'tools'],
      response: () => `Harsh's tech stack spans multiple domains:<br><br>
        <strong>Full Stack:</strong> React Native, Node.js, Express.js, PHP, JavaScript, HTML5, CSS3<br>
        <strong>Databases:</strong> MongoDB, MySQL, Firebase / Firestore<br>
        <strong>AI & ML:</strong> Python, Scikit-learn, Pandas, NumPy, Streamlit, Plotly<br>
        <strong>Tools:</strong> Git, GitHub, VS Code, Expo Go, Auth Systems, DBMS, OOP, SDLC`
    },

    education: {
      keywords: ['education', 'study', 'college', 'university', 'degree', 'btech', 'b.tech', 'diploma', 'cgpa', 'gpa', 'grade', 'academic', 'mbit', 'cvmu', 'bmu', 'gujarat'],
      response: () => `📚 <strong>B.Tech — Computer Engineering</strong><br>
        Madhuben & Bhanubhai Patel Institute of Technology (MBIT), CVMU<br>
        <em>2024 – 2027 · CGPA: 8.81</em><br><br>
        🎓 <strong>Diploma — Computer Engineering</strong><br>
        BMU, Gujarat<br>
        <em>2021 – 2024 · CGPA: 8.67</em><br><br>
        Currently a <strong>pre-final year</strong> student with strong academics and hands-on project experience.`
    },

    certifications: {
      keywords: ['cert', 'certificate', 'certification', 'course', 'training', 'sap', 'analytics', 'ai ml', 'unnati', 'credential'],
      response: () => `🏆 Harsh's certifications:<br><br>
        📜 <strong>Designing Stories in SAP Analytics Cloud</strong> — Jan 2026<br>
        <a href="https://badger.learning.sap.com/verify/ximuf-byfyb-nebyb-hetok-pigaf" target="_blank">Verify Certificate ↗</a><br><br>
        🤖 <strong>Code Unnati AI/ML Training</strong> — Supervised learning, data preprocessing & model evaluation`
    },

    contact: {
      keywords: ['contact', 'reach', 'email', 'mail', 'message', 'talk', 'connect', 'touch', 'hire', 'available', 'get in touch', 'how to contact', 'how can i', 'reach out'],
      response: () => `You can reach Harsh through multiple channels:<br><br>
        📧 <strong>Email:</strong> <a href="mailto:harshtank19@gmail.com">harshtank19@gmail.com</a><br>
        💼 <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/harsh-tank-663219354/" target="_blank">linkedin.com/in/harsh-tank ↗</a><br>
        🐙 <strong>GitHub:</strong> <a href="https://github.com/HarshTank1912" target="_blank">github.com/HarshTank1912 ↗</a><br><br>
        He's always happy to discuss <em>projects, collaborations, or opportunities</em>!`
    },

    github: {
      keywords: ['github', 'git', 'repository', 'repo', 'code', 'source', 'open source'],
      response: () => `🐙 Harsh's GitHub profile:<br><br>
        <a href="https://github.com/HarshTank1912" target="_blank"><strong>github.com/HarshTank1912 ↗</strong></a><br><br>
        You'll find his projects including <em>Campus Ride</em>, <em>SmartLogix (ShipSense)</em>, <em>SecureCity</em>, and more.`
    },

    linkedin: {
      keywords: ['linkedin', 'linked in', 'professional', 'profile'],
      response: () => `💼 Connect with Harsh on LinkedIn:<br><br>
        <a href="https://www.linkedin.com/in/harsh-tank-663219354/" target="_blank"><strong>linkedin.com/in/harsh-tank ↗</strong></a><br><br>
        He's open to professional connections and networking!`
    },

    location: {
      keywords: ['location', 'where', 'city', 'based', 'live', 'surat', 'gujarat', 'india', 'remote', 'hybrid'],
      response: () => `📍 Harsh is based in <strong>Surat, Gujarat, India</strong>.<br><br>
        He's open to <em>remote</em>, <em>hybrid</em>, and <em>on-site</em> opportunities. Distance is no barrier for the right project! 🌏`
    },

    availability: {
      keywords: ['available', 'availability', 'hire', 'hiring', 'job', 'internship', 'opportunity', 'work', 'freelance', 'open to'],
      response: () => `✅ Harsh is currently <em>open to opportunities</em>!<br><br>
        He's looking for:<br>
        • <strong>Internships</strong> (Full Stack / Mobile Dev / ML)<br>
        • <strong>Freelance projects</strong><br>
        • <strong>Collaborations</strong> on interesting ideas<br><br>
        Drop him a message at <a href="mailto:harshtank19@gmail.com">harshtank19@gmail.com</a> — he responds quickly! 🚀`
    },

    campusride: {
      keywords: ['campus ride', 'campusride', 'ride sharing', 'firebase', 'expo', 'react native app', 'mobile app', 'otp', 'coin'],
      response: () => `🚀 <strong>Campus Ride</strong> — Harsh's flagship mobile app:<br><br>
        A peer-to-peer <em>ride-sharing platform</em> for college campuses built with <strong>React Native + Expo + Firebase</strong>.<br><br>
        Key features:<br>
        • Dynamic <strong>Driver / Rider roles</strong><br>
        • <strong>OTP-secured</strong> ride starts<br>
        • <strong>Real-time sync</strong> via Firestore<br>
        • <strong>Coin-based</strong> cost-sharing (no real money needed)<br>
        • Expo Router navigation`
    },

    smartlogix: {
      keywords: ['smartlogix', 'smart logix', 'shipsense', 'ship sense', 'delivery prediction', 'ml project', 'machine learning', 'random forest', 'streamlit', 'ecommerce', 'e-commerce'],
      response: () => `📦 <strong>SmartLogix (ShipSense)</strong>:<br><br>
        An <em>ML-powered delivery delay predictor</em> for e-commerce logistics.<br><br>
        • Algorithm: <strong>Random Forest</strong><br>
        • Accuracy: <strong>68%</strong> · ROC-AUC: <strong>0.74</strong><br>
        • Interactive <strong>Streamlit + Plotly</strong> dashboard<br>
        • Features: EDA, feature importance, predictions<br><br>
        <a href="https://shipsense-e-commerce-delivery-prediction-harshtank1912.streamlit.app/" target="_blank">Try the Live Demo ↗</a>`
    },

    securecity: {
      keywords: ['securecity', 'secure city', 'crime', 'police', 'rbac', 'role based', 'php', 'mysql', 'web project'],
      response: () => `🛡️ <strong>SecureCity</strong>:<br><br>
        A web-based <em>crime management system</em> with Role-Based Access Control.<br><br>
        • <strong>3 roles:</strong> Admin, Police Officer, Citizen<br>
        • Secure login & session management<br>
        • Full <strong>CRUD</strong> on crime & complaint records<br>
        • Built with <strong>PHP + MySQL</strong> and structured relational DB schema`
    },

    thanks: {
      keywords: ['thank', 'thanks', 'thank you', 'thx', 'ty', 'appreciate', 'great', 'awesome', 'nice', 'cool', 'perfect', 'helpful'],
      response: () => `You're welcome! 😊 Feel free to ask me anything else about Harsh.<br><br>
        Or reach out to him directly at <a href="mailto:harshtank19@gmail.com">harshtank19@gmail.com</a> — he'd love to connect! 🚀`
    },

    bye: {
      keywords: ['bye', 'goodbye', 'see you', 'cya', 'later', 'take care', 'good night', 'good bye'],
      response: () => `Goodbye! 👋 It was great chatting with you.<br><br>
        If you'd like to collaborate with Harsh, don't hesitate to reach out. Have a great day! 🌟`
    },

    fallback: {
      response: () => `Hmm, I'm not sure about that one! 🤔<br><br>
        I can help you with:<br>
        • Harsh's <strong>projects</strong> & work<br>
        • His <strong>skills</strong> & tech stack<br>
        • <strong>Education</strong> & certifications<br>
        • How to <strong>contact</strong> or hire him<br><br>
        Try asking one of the above, or click a suggestion chip below! 👇`
    }
  };

  /* ══════════════════════════════════════════════
     INTENT MATCHING — Keyword scoring
  ══════════════════════════════════════════════ */
  function matchIntent(text) {
    const lower = text.toLowerCase().trim();

    let bestIntent = null;
    let bestScore = 0;

    for (const [intent, data] of Object.entries(KB)) {
      if (intent === 'fallback') continue;
      if (!data.keywords) continue;

      let score = 0;
      for (const kw of data.keywords) {
        if (lower.includes(kw)) {
          // Longer matches score higher
          score += kw.length;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }

    return bestScore > 0 ? bestIntent : 'fallback';
  }

  /* ══════════════════════════════════════════════
     UI HELPERS
  ══════════════════════════════════════════════ */
  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'chat-msg user-msg';
    row.innerHTML = `<div class="chat-bubble-msg">${escapeHtml(text)}</div>`;
    messagesEl.appendChild(row);
    scrollToBottom();
  }

  function appendBotMessage(html) {
    const row = document.createElement('div');
    row.className = 'chat-msg bot-msg';
    const avatar = `<div class="bot-msg-avatar">HT</div>`;
    const bubble = `<div class="chat-bubble-msg"></div>`;
    row.innerHTML = avatar + bubble;
    messagesEl.appendChild(row);
    scrollToBottom();
    return row.querySelector('.chat-bubble-msg');
  }

  function showTyping() {
    const row = document.createElement('div');
    row.className = 'chat-msg bot-msg chat-typing';
    row.id = 'typingIndicator';
    row.innerHTML = `
      <div class="bot-msg-avatar">HT</div>
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>`;
    messagesEl.appendChild(row);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  function typewrite(el, html, speed = 12) {
    // Strip HTML tags for typewriter, then restore HTML at end
    // For simplicity: render as HTML directly (instant) with a fade-in
    el.style.opacity = '0';
    el.innerHTML = html;
    el.style.transition = 'opacity 0.35s ease';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { el.style.opacity = '1'; });
    });
  }

  function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  /* ══════════════════════════════════════════════
     SEND MESSAGE FLOW
  ══════════════════════════════════════════════ */
  function handleSend(userText) {
    userText = userText.trim();
    if (!userText || isBusy) return;

    isBusy = true;
    sendBtn.disabled = true;
    inputEl.value = '';

    appendUserMessage(userText);

    // Simulate typing delay (300–700ms)
    const delay = 300 + Math.random() * 400;
    showTyping();

    setTimeout(() => {
      removeTyping();

      const intent = matchIntent(userText);
      const response = KB[intent].response();
      const bubbleEl = appendBotMessage('');
      typewrite(bubbleEl, response);
      scrollToBottom();

      isBusy = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }, delay);
  }

  /* ══════════════════════════════════════════════
     OPEN / CLOSE
  ══════════════════════════════════════════════ */
  let welcomed = false;

  function openChat() {
    isOpen = true;
    panel.classList.add('chat-open');
    panel.setAttribute('aria-hidden', 'false');
    overlay.classList.add('chat-open');
    bubbleIcon.className = 'fa-solid fa-xmark chat-bubble-icon';
    bubble.setAttribute('aria-label', 'Close AI Assistant');

    if (!welcomed) {
      welcomed = true;
      setTimeout(() => {
        const el = appendBotMessage('');
        typewrite(el, `Hey! 👋 Welcome to Harsh's portfolio.<br><br>
          I'm his AI assistant. Want to know about his <strong>projects</strong>, <strong>skills</strong>, or <strong>how to contact him</strong>? Just ask or click a chip below!`);
        scrollToBottom();
      }, 200);
    }

    setTimeout(() => inputEl.focus(), 350);
  }

  function closeChat() {
    isOpen = false;
    panel.classList.remove('chat-open');
    panel.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('chat-open');
    bubbleIcon.className = 'fa-solid fa-comment-dots chat-bubble-icon';
    bubble.setAttribute('aria-label', 'Open AI Assistant');
  }

  /* ══════════════════════════════════════════════
     EVENT LISTENERS
  ══════════════════════════════════════════════ */
  bubble.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);
  overlay.addEventListener('click', closeChat);

  sendBtn.addEventListener('click', () => handleSend(inputEl.value));

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputEl.value);
    }
  });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      if (query) {
        if (!isOpen) openChat();
        setTimeout(() => handleSend(query), isOpen ? 0 : 400);
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeChat();
  });

})();

