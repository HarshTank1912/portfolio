/**
 * Harsh Tank PORTFOLIO — script.js
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
    particleColor: 'rgba(25, 217, 255, ',   // mint, alpha varies
    lineColor: 'rgba(25, 217, 255, ',
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
      `Hi Harsh,\n\n${messageEl.value.trim()}\n\n— ${nameEl.value.trim()} (${emailEl.value.trim()})`
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
  const micBtn = document.getElementById('chatMic');
  const speakBtn = document.getElementById('chatSpeak');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let voiceReplies = false;
  let lastSpokenText = '';
  let voiceRequestPending = false;

  function showVoiceNotice(message) {
    const notice = appendBotMessage('');
    typewrite(notice, message);
    scrollToBottom();
  }

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      micBtn?.classList.add('is-listening');
      micBtn?.setAttribute('aria-label', 'Listening — click to stop');
      micBtn?.setAttribute('title', 'Listening… speak now');
    };
    recognition.onend = () => {
      voiceRequestPending = false;
      micBtn?.classList.remove('is-listening');
      micBtn?.setAttribute('aria-label', 'Start voice input');
      micBtn?.setAttribute('title', 'Ask Jarvis by voice');
    };
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) inputEl.value = transcript.trim();
      const result = event.results[event.results.length - 1];
      if (result?.isFinal && transcript.trim()) handleSend(transcript.trim());
    };
    recognition.onerror = (event) => {
      voiceRequestPending = false;
      micBtn?.classList.remove('is-listening');
      const messages = {
        'not-allowed': '🎙️ Microphone access is blocked. Allow microphone permission in your browser settings, then try again.',
        'service-not-allowed': 'The browser speech service is unavailable. Try Chrome or Edge.',
        'no-speech': 'I did not hear anything. Please try again and speak clearly.',
        'network': 'Speech recognition could not connect. Check your internet connection and try again.',
        'audio-capture': 'No microphone was detected. Check your microphone connection.',
        'aborted': 'Voice input was stopped.'
      };
      showVoiceNotice(messages[event.error] || `Voice input error: ${event.error}. You can still type your question.`);
    };
  } else if (micBtn) {
    micBtn.disabled = true;
    micBtn.title = 'Speech recognition is not supported here. Try Chrome or Edge.';
  }

  if (!bubble || !panel) return;

  let isOpen = false;
  let isBusy = false;

  /* ══════════════════════════════════════════════
     KNOWLEDGE BASE — Everything about Harsh Tank
  ══════════════════════════════════════════════ */
  const KB = {
    greet: {
      keywords: ['hi','hello','hey','hiya','greetings','howdy','good morning','good afternoon','good evening','what is up','whats up'],
      response: () => `Hey there! 👋 I'm <strong>Harsh's Jarvis</strong>, your guide to <strong>Harsh Tank</strong>'s portfolio.<br><br>Ask me about his profile, projects, skills, education, experience, certifications, or contact details.`
    },
    help: {
      keywords: ['help','what can you do','what can i ask','what do you know','show topics','show categories','menu','commands','list topics','suggest questions'],
      response: () => `I can answer questions about:<br><br>👋 <strong>About & Profile</strong> — who Harsh is, what he does, professional summary<br>🚀 <strong>Projects</strong> — Campus Ride, SmartLogix / ShipSense, eRaksha<br>⚡ <strong>Skills</strong> — languages, frontend, backend, databases, ML and blockchain<br>🎓 <strong>Education</strong> — B.Tech, diploma, college and CGPA<br>💼 <strong>Experience</strong> — internship and practical work<br>🏆 <strong>Certifications</strong> — SAP, Code Unnati and Innovation Marathon<br>📬 <strong>Contact</strong> — email, GitHub, LinkedIn and portfolio<br>🌍 <strong>Career & Availability</strong> — opportunities and collaboration<br><br>Ask naturally, for example: <em>“What does Harsh do?”</em> or <em>“Which projects has he built?”</em>`
    },
    about: {
      keywords: ['who is harsh','who is harsh tank','about harsh','tell me about harsh','what does harsh do','what do harsh do','what does harsh tank do','what is harsh','introduce harsh','introduction','describe harsh','his profession','his occupation','what does he do','what does he work as','kind of developer','what type of developer','professional background','career background','his journey','what is he passionate','what are his interests','what does he specialize','area of interest','professional overview','brief about','tell me about yourself','who are you'],
      response: () => `<strong>Harsh Tank</strong> is a Full Stack Developer and B.Tech Computer Engineering student at MBIT, CVM University. 🚀<br><br>He builds web and mobile applications using technologies such as <strong>React, React Native, Node.js, Express.js, MongoDB, MySQL and Firebase</strong>.<br><br>His project experience also includes <strong>Python-based data analysis and machine learning</strong>, along with blockchain concepts using <strong>Solidity and Ethereum</strong>. He is interested in building practical, user-focused software and exploring data-driven solutions.`
    },
    profile: {
      keywords: ['profile','professional profile','show profile','his portfolio','portfolio website','personal website','resume','résumé','cv','curriculum vitae','professional summary','career objective','profile summary','his designation','current status','what is he currently doing','current role','professional identity','download resume','view resume','see resume','github profile','linkedin profile'],
      response: () => `Harsh's professional focus is <strong>Full Stack Development</strong>, with additional project exposure to <strong>Data Analysis, Machine Learning and Blockchain</strong>.<br><br>🌐 <a href="https://harsh-tank-portfolio-five.vercel.app/" target="_blank" rel="noopener noreferrer">Portfolio Website ↗</a><br>🐙 <a href="https://github.com/HarshTank1912" target="_blank" rel="noopener noreferrer">GitHub Profile ↗</a><br>💼 <a href="https://www.linkedin.com/in/harsh-tank-663219354/" target="_blank" rel="noopener noreferrer">LinkedIn Profile ↗</a><br><br>For a resume or professional discussion, contact <a href="mailto:harshtank19@gmail.com">harshtank19@gmail.com</a>.`
    },
    projects: {
      keywords: ['projects','project list','his work','what has he built','what has he developed','what projects','show projects','all projects','best project','major project','featured project','portfolio projects','web projects','mobile projects','machine learning projects','ml projects','blockchain project','real world projects','source code','project demo','project repository'],
      response: () => `Harsh's featured projects include:<br><br>🚀 <strong>Campus Ride</strong> — A college ride-sharing mobile app built with React Native, Expo and Firebase. It includes Rider/Driver role switching, OTP ride verification, real-time Firestore sync and coin-based cost sharing.<br><br>📦 <strong>SmartLogix (ShipSense)</strong> — An e-commerce delivery prediction project using Python, Random Forest, Streamlit and Plotly. The reported model results are approximately <strong>68% accuracy</strong> and <strong>0.74 ROC-AUC</strong>. <a href="https://shipsense-e-commerce-delivery-prediction-harshtank1912.streamlit.app/" target="_blank" rel="noopener noreferrer">Live Demo ↗</a><br><br>🛡️ <strong>eRaksha</strong> — A blockchain-based e-FIR management system concept using PHP, MySQL, Solidity, Ethereum and Ganache, with hashing, timestamping, ledger anchoring and integrity verification.<br><br>More source code: <a href="https://github.com/HarshTank1912" target="_blank" rel="noopener noreferrer">Harsh's GitHub ↗</a>`
    },
    campusride: {
      keywords: ['campus ride','campusride','rideup','ride up','ride sharing','ridesharing','college ride','campus transport','rider driver','driver rider','ride otp','ride verification','coin rewards','firestore','firebase ride','expo router'],
      response: () => `🚀 <strong>Campus Ride</strong> is a peer-to-peer ride-sharing mobile application concept for college campuses, built using <strong>React Native, Expo and Firebase</strong>.<br><br>Key features include:<br>• Dynamic <strong>Rider / Driver</strong> role switching<br>• OTP-based ride verification<br>• Real-time data synchronization using Firestore<br>• Coin-based cost-sharing and rewards<br>• Mobile navigation using Expo Router`
    },
    smartlogix: {
      keywords: ['smartlogix','smart logix','shipsense','ship sense','delivery prediction','delivery predictor','delivery delay','ecommerce delivery','e commerce delivery','logistics prediction','random forest','roc auc','model accuracy','streamlit dashboard','plotly dashboard','feature importance'],
      response: () => `📦 <strong>SmartLogix (ShipSense)</strong> is a machine-learning project that predicts e-commerce delivery outcomes / delays.<br><br>• Model: <strong>Random Forest</strong><br>• Reported accuracy: <strong>~68%</strong><br>• Reported ROC-AUC: <strong>0.74</strong><br>• Tools: Python, Scikit-learn, Streamlit and Plotly<br>• Work includes data preprocessing, exploratory analysis, feature engineering, model evaluation and an interactive dashboard.<br><br><a href="https://shipsense-e-commerce-delivery-prediction-harshtank1912.streamlit.app/" target="_blank" rel="noopener noreferrer">Open Live Demo ↗</a><br><a href="https://github.com/HarshTank1912/ShipSense-E-Commerce-Delivery-Prediction" target="_blank" rel="noopener noreferrer">View GitHub Repository ↗</a>`
    },
    eraksha: {
      keywords: ['eraksha','e raksha','surakshachain','suraksha chain','securecity','secure city','efir','e fir','electronic fir','fir system','blockchain fir','crime management','police records','fir integrity','tamper detection','ledger anchoring','hash verification','solidity contract','fir blockchain'],
      response: () => `🛡️ <strong>eRaksha</strong> is Harsh's blockchain-based e-FIR management system concept, designed around a Surat City Police use case.<br><br>• Backend and database: <strong>PHP + MySQL</strong><br>• Blockchain: <strong>Solidity, Ethereum and Ganache</strong><br>• Smart-contract based record anchoring<br>• Cryptographic hashing and timestamping<br>• Hash verification to help detect record tampering<br>• Role-based workflows for Admin, Police and Users<br><br><strong>Note:</strong> This is an academic/project concept, not an officially deployed Surat City Police system.`
    },
    skills: {
      keywords: ['skills','technical skills','skill set','tech stack','technology stack','technologies','programming languages','coding languages','languages does he know','what can he code','what does he know','what can he do','technical expertise','core competencies','frameworks','libraries','developer tools','software tools','frontend skills','backend skills','database skills','machine learning skills','data science skills','blockchain skills','proficient'],
      response: () => `Harsh's skills span several areas:<br><br><strong>Programming:</strong> JavaScript, Python, PHP, SQL, C and C++<br><strong>Frontend & Mobile:</strong> React.js, React Native, Expo, Next.js, HTML5, CSS3, Tailwind CSS and Bootstrap<br><strong>Backend:</strong> Node.js, Express.js, REST APIs, authentication and CRUD development<br><strong>Databases:</strong> MongoDB, MySQL, Firebase and Firestore<br><strong>Data & ML:</strong> Pandas, NumPy, Scikit-learn, Statsmodels, Streamlit, Plotly and Random Forest<br><strong>Blockchain:</strong> Solidity, Ethereum, smart contracts, Ganache, Remix IDE, cryptographic hashing and ledger concepts<br><strong>Tools:</strong> Git, GitHub, VS Code and Postman`
    },
    programming: {
      keywords: ['python','javascript','java language','php','sql','c programming','c++','cpp','programming language','coding language','which language','languages he uses'],
      response: () => `Harsh has worked with <strong>JavaScript, Python, PHP, SQL, C and C++</strong>. His project work particularly uses JavaScript for web/mobile development and Python for data analysis and machine learning.`
    },
    frontend: {
      keywords: ['frontend','front end','user interface','ui development','website design','web design','html','html5','css','css3','tailwind','bootstrap','react js','react.js','nextjs','next.js','responsive website','web page'],
      response: () => `His frontend and mobile UI technologies include <strong>React.js, React Native, Expo, Next.js, HTML5, CSS3, Tailwind CSS and Bootstrap</strong>. He works on responsive interfaces and application screens.`
    },
    backend: {
      keywords: ['backend','back end','server side','node','nodejs','node.js','express','expressjs','express.js','rest api','rest apis','api development','api integration','php backend','authentication','authorization','crud','server development'],
      response: () => `His backend development stack includes <strong>Node.js, Express.js and PHP</strong>, along with REST API development/integration, authentication, authorization and CRUD operations.`
    },
    databases: {
      keywords: ['database','databases','mongodb','mongo db','mysql','firebase','firestore','database management','database design','nosql','sql database','data storage'],
      response: () => `Harsh has worked with <strong>MongoDB, MySQL, Firebase and Cloud Firestore</strong> for application data storage and database operations.`
    },
    dataml: {
      keywords: ['machine learning','artificial intelligence','ai ml','ai/ml','data analysis','data analytics','data science','data visualization','predictive model','prediction model','pandas','numpy','scikit learn','sklearn','statsmodels','streamlit','plotly','random forest','sarimax','xgboost'],
      response: () => `Harsh has project experience in <strong>Python-based data analysis and machine learning</strong>. Tools and libraries include Pandas, NumPy, Scikit-learn, Statsmodels, Streamlit and Plotly. He has worked with models such as Random Forest and time-series forecasting approaches.`
    },
    blockchain: {
      keywords: ['blockchain','solidity','ethereum','smart contract','smart contracts','ganache','remix ide','distributed ledger','cryptographic hash','hashing','data integrity','web3','blockchain development'],
      response: () => `Harsh has academic/project exposure to <strong>Blockchain</strong>, including Ethereum, Solidity smart contracts, Ganache, Remix IDE, cryptographic hashing, ledger anchoring and data-integrity verification. His eRaksha project demonstrates these concepts.`
    },
    education: {
      keywords: ['education','educational background','academic background','study','studies','college','university','degree','btech','b.tech','computer engineering','engineering branch','mbit','cvm','cvmu','diploma','bmu','cgpa','gpa','semester','graduation','graduate','school','10th','tenth','qualification','academic qualification'],
      response: () => `🎓 <strong>B.Tech — Computer Engineering</strong><br>Madhuben & Bhanubhai Patel Institute of Technology (MBIT), CVM University<br><em>2024–2027 · CGPA: 8.92</em><br><br>📘 <strong>Diploma — Computer Engineering</strong><br>Bhagwan Mahavir University (BMU), Gujarat<br><em>2021–2024 · CGPA: 8.67</em><br><br>He is pursuing his B.Tech degree.`
    },
    experience: {
      keywords: ['experience','work experience','professional experience','internship','intern','employment','worked at','company worked','job role','responsibilities','backend developer intern','unity technology','edunet foundation','practical experience','industry experience'],
      response: () => `💼 Harsh has internship experience in backend web development. He worked as a <strong>Backend Web Developer Intern at Unity Technology, Surat</strong> during May–June 2026, working with Node.js, Express.js, MongoDB, REST API integration and application/database modules.<br><br>His academic projects also provide practical experience across mobile development, machine learning and blockchain concepts.`
    },
    certifications: {
      keywords: ['certification','certifications','certificate','certificates','credential','course','courses','training','sap','code unnati','innovation marathon','analytics cloud','designing stories','verify certificate','achievements','award','participation'],
      response: () => `🏆 Harsh's training and participation highlights include:<br><br>• <strong>Designing Stories in SAP Analytics Cloud</strong> — Jan 2026. <a href="https://badger.learning.sap.com/verify/ximuf-byfyb-nebyb-hetok-pigaf" target="_blank" rel="noopener noreferrer">Verify ↗</a><br>• <strong>Code Unnati AI/ML Training Program</strong> — Apr 2026. <a href="https://drive.google.com/file/d/1luwwTlk4OHkAqPDyDczmGXvPCdC9UF5g/view?usp=drive_link" target="_blank" rel="noopener noreferrer">Certificate ↗</a><br>• <strong>Innovation Marathon 4.0</strong> — 2025–2026. <a href="https://drive.google.com/file/d/1_Pz1su35SJBv8Qa9agM10M7_hB2PN5qQ/view?usp=drive_link" target="_blank" rel="noopener noreferrer">Certificate ↗</a>`
    },

    resume: {
      keywords: [
        'resume', 'résumé', 'cv', 'curriculum vitae', 'download resume',
        'download his resume', 'download harsh resume', 'download harshs resume',
        'get resume', 'get his resume', 'view resume', 'see resume',
        'show resume', 'show me resume', 'share resume', 'resume pdf',
        'pdf resume', 'resume download', 'where can i download resume',
        'where can i get his cv', 'can i download his cv', 'can i download resume',
        'can i get his resume', 'can you share his resume', 'send me his resume',
        'harsh resume', 'harsh tank resume', 'his cv', 'his resume'
      ],
      response: () => `📄 You can download <strong>Harsh Tank's latest resume</strong> here:<br><br><a class="resume-download-btn" href="./resume.pdf" download="Harsh_Tank_Resume.pdf">⬇️ Download Resume (PDF)</a><br><br>If the download does not start, <a href="./resume.pdf" target="_blank" rel="noopener noreferrer">open the resume PDF</a> in your browser.`
    },
    contact: {
      keywords: ['contact','contact details','contact information','reach','reach him','reach harsh','get in touch','connect with','talk to','message him','email','e-mail','mail address','phone number','linkedin','linked in','github','git hub','portfolio link','website link','social media','social profile','send message','contact him'],
      response: () => `You can contact or connect with Harsh here:<br><br>📧 <strong>Email:</strong> <a href="mailto:harshtank19@gmail.com">harshtank19@gmail.com</a><br>💼 <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/harsh-tank-663219354/" target="_blank" rel="noopener noreferrer">LinkedIn Profile ↗</a><br>🐙 <strong>GitHub:</strong> <a href="https://github.com/HarshTank1912" target="_blank" rel="noopener noreferrer">GitHub Profile ↗</a><br>🌐 <strong>Portfolio:</strong> <a href="https://harsh-tank-portfolio-five.vercel.app/" target="_blank" rel="noopener noreferrer">Personal Website ↗</a>`
    },
    github: {
      keywords: ['github','git hub','github username','github account','github repository','github repositories','repo','repos','source code','sourcecode','open source'],
      response: () => `🐙 Visit Harsh's GitHub profile: <a href="https://github.com/HarshTank1912" target="_blank" rel="noopener noreferrer"><strong>github.com/HarshTank1912 ↗</strong></a><br><br>His repositories contain project code and development work.`
    },
    linkedin: {
      keywords: ['linkedin','linked in','linkedin url','linkedin account','professional networking','connect on linkedin'],
      response: () => `💼 Connect with Harsh on LinkedIn: <a href="https://www.linkedin.com/in/harsh-tank-663219354/" target="_blank" rel="noopener noreferrer"><strong>View LinkedIn Profile ↗</strong></a>`
    },
    location: {
      keywords: ['location','where is he','where is harsh','where does he live','where is he based','which city','city based','surat','gujarat','india','remote work','work remotely','hybrid work','onsite','on site'],
      response: () => `📍 Harsh is based in <strong>Surat, Gujarat, India</strong>. For work and collaboration preferences, please contact him directly at <a href="mailto:harshtank19@gmail.com">harshtank19@gmail.com</a>.`
    },
    availability: {
      keywords: ['available','availability','hire','hiring','looking for job','looking for work','job opportunity','internship opportunity','open to opportunity','freelance','freelancer','collaboration','collaborate','work with him','recruit','recruiter','employment','job role'],
      response: () => `For internship, entry-level roles, freelance projects or collaboration, you can contact Harsh directly at <a href="mailto:harshtank19@gmail.com">harshtank19@gmail.com</a>.<br><br>His main professional focus is Full Stack Development, with additional interests in mobile development, data/ML and blockchain. Please confirm his current availability directly.`
    },
    thanks: {
      keywords: ['thank you','thanks','thank','thx','ty','appreciate','that helps','very helpful'],
      response: () => `You're welcome! 😊 Feel free to ask another question about Harsh's work, skills or projects.`
    },
    bye: {
      keywords: ['bye','goodbye','see you','cya','take care','good night','good bye'],
      response: () => `Goodbye! 👋 Thanks for visiting Harsh's portfolio. Have a great day!`
    },
    fallback: {
      response: () => `I couldn't confidently match that question to the information available in this portfolio. 🤔<br><br>I can answer questions about Harsh's profile and career, but I may not know unrelated or private information. Try asking about:<br>• <strong>About / Profile:</strong> “What does Harsh do?”<br>• <strong>Projects:</strong> “Tell me about eRaksha”<br>• <strong>Skills:</strong> “Does he know React or Python?”<br>• <strong>Education:</strong> “Where does he study?”<br>• <strong>Experience:</strong> “Where did he intern?”<br>• <strong>Certifications:</strong> “What certificates does he have?”<br>• <strong>Contact:</strong> “How can I reach him?”<br><br>For anything not listed, contact Harsh at <a href="mailto:harshtank19@gmail.com">harshtank19@gmail.com</a>.`
    }
  };

  /* ══════════════════════════════════════════════
     INTENT MATCHING — normalize text and score specific phrases
  ══════════════════════════════════════════════ */
  function matchIntent(text) {
    const normalized = text.toLowerCase()
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9+#.\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Specific project and technology questions should win over broad categories.
    const priority = [
      'campusride','smartlogix','eraksha','databases','frontend','backend',
      'programming','dataml','blockchain','experience','certifications',
      'education','resume','github','linkedin','contact','availability','location',
      'profile','about','skills','projects','help','greet','thanks','bye'
    ];
    let bestIntent = 'fallback';
    let bestScore = 0;

    for (const intent of priority) {
      const data = KB[intent];
      if (!data || !data.keywords) continue;
      let score = 0;
      for (const keyword of data.keywords) {
        const kw = keyword.toLowerCase();
        // Whole-phrase matching prevents short fragments matching inside unrelated words.
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`(^|\\s)${escaped.replace(/\s+/g, '\\s+')}(?=$|\\s)`, 'i');
        if (pattern.test(normalized)) {
          score += 10 + kw.length;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }

    // Natural-language patterns that commonly express the same intent.
    if (/\b(resume|résumé|cv|curriculum vitae)\b/.test(normalized)) return 'resume';
    if (bestScore === 0) {
      if (/\b(what|who|tell|describe|introduce|explain).{0,55}\b(harsh|he|him|his)\b/.test(normalized)) return 'about';
      if (/\b(what|which|show|list|explain|describe).{0,45}\b(project|projects|built|developed|work|portfolio)\b/.test(normalized)) return 'projects';
      if (/\b(what|which|show|list|explain).{0,45}\b(skill|skills|technology|technologies|language|stack|framework)\b/.test(normalized)) return 'skills';
      if (/\b(where|which|what).{0,45}\b(college|university|study|studies|degree|qualification|course)\b/.test(normalized)) return 'education';
      if (/\b(how|where|what).{0,45}\b(contact|email|reach|connect|message)\b/.test(normalized)) return 'contact';
      if (/\b(currently|right now|at present|these days).{0,45}\b(study|doing|work|working|status|role|career)\b/.test(normalized)) return 'availability';
      if (/\b(when|where|which|what).{0,45}\b(internship|intern|company|experience|job)\b/.test(normalized)) return 'experience';
      if (/\b(why|how).{0,45}\b(project|built|developed|technology|tech stack)\b/.test(normalized)) return 'projects';
    }

    return bestIntent;
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

    setTimeout(async () => {
      removeTyping();
      const intent = matchIntent(userText);
      let response = KB[intent].response();

      const bubbleEl = appendBotMessage('');
      typewrite(bubbleEl, response);
      lastSpokenText = response.replace(/<br\s*\/?\s*>/gi, '. ').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      if (voiceReplies) speakText(lastSpokenText);
      scrollToBottom();
      isBusy = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }, delay);
  }


function speakText(text) {
    if (!('speechSynthesis' in window) || !text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // Prefer a British English voice for a JARVIS-like tone
    const preferredVoice = voices.find(voice =>
        /en-GB/i.test(voice.lang) &&
        /Daniel|Arthur|George|Ryan/i.test(voice.name)
    );

    const britishVoice = voices.find(voice =>
        /en-GB/i.test(voice.lang)
    );

    utterance.voice = preferredVoice || britishVoice || null;

    utterance.lang = 'en-GB';
    utterance.rate = 0.90;
    utterance.pitch = 0.82;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
}

if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
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
        typewrite(el, `Hey! 👋 I'm <strong>Harsh's Jarvis</strong>.<br><br>
          Your portfolio assistant. Type or speak your question — voice input is transcribed into chat, and replies appear here. Turn on the speaker only when you want audio. Want to know about his <strong>projects</strong>, <strong>skills</strong>, or <strong>how to contact him</strong>? Just ask or click a chip below!`);
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

  micBtn?.addEventListener('click', () => {
    if (!recognition) {
      showVoiceNotice('Voice input is not supported in this browser. Please use Chrome or Edge, or type your question.');
      return;
    }
    // Voice input and spoken output are independent controls.
    // The microphone submits the recognized text to the same chat pipeline.
    if (voiceRequestPending) {
      try { recognition.stop(); } catch (_) {}
      voiceRequestPending = false;
      return;
    }
    try {
      window.speechSynthesis?.cancel();
      voiceRequestPending = true;
      recognition.start();
    } catch (_) {
      voiceRequestPending = false;
      showVoiceNotice('I could not start the microphone. Check browser permission and try again.');
    }
  });
  speakBtn?.addEventListener('click', () => {
    voiceReplies = !voiceReplies;
    speakBtn.classList.toggle('is-active', voiceReplies);
    speakBtn.setAttribute('aria-pressed', String(voiceReplies));
    if (voiceReplies && lastSpokenText) speakText(lastSpokenText);
    else window.speechSynthesis?.cancel();
  });

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


/* PORTFOLIO 3.0 — GLOBAL SEARCH, THEME + LOCAL CHAT HISTORY */
(function portfolioV3Enhancements(){
 const body=document.body,themeBtn=document.getElementById('themeToggle');
 const savedTheme=localStorage.getItem('ht-portfolio-theme');if(savedTheme==='light')body.classList.add('light-theme');
 function syncTheme(){if(themeBtn)themeBtn.innerHTML=body.classList.contains('light-theme')?'<i class="fa-solid fa-moon"></i>':'<i class="fa-solid fa-sun"></i>';}
 syncTheme();themeBtn?.addEventListener('click',()=>{body.classList.toggle('light-theme');localStorage.setItem('ht-portfolio-theme',body.classList.contains('light-theme')?'light':'dark');syncTheme();});
 const modal=document.getElementById('portfolioSearch'),field=document.getElementById('portfolioSearchInput'),openBtn=document.getElementById('globalSearchOpen'),links=[...document.querySelectorAll('#portfolioSearchResults a')];
 function openSearch(){if(!modal)return;modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');setTimeout(()=>field?.focus(),40);}
 function closeSearch(){modal?.classList.remove('is-open');modal?.setAttribute('aria-hidden','true');if(field)field.value='';links.forEach(a=>a.hidden=false);}
 openBtn?.addEventListener('click',openSearch);modal?.addEventListener('click',e=>{if(e.target===modal)closeSearch();});
 field?.addEventListener('input',()=>{const q=field.value.toLowerCase().trim();links.forEach(a=>a.hidden=!(`${a.textContent} ${a.dataset.search||''}`.toLowerCase().includes(q)));});
 links.forEach(a=>a.addEventListener('click',closeSearch));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSearch();if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();openSearch();}});
 const root=document.getElementById('chatMessages');
 if(root){const key='ht-jarvis-history-v1';try{const old=JSON.parse(localStorage.getItem(key)||'[]');old.slice(-12).forEach(m=>{const row=document.createElement('div');row.className=m.role==='user'?'chat-message user-message':'chat-message bot-message';row.innerHTML=`<div class="message-bubble">${m.html||''}</div>`;root.appendChild(row);});}catch(_){}const observer=new MutationObserver(()=>{const data=[...root.querySelectorAll('.chat-message')].slice(-30).map(row=>({role:row.classList.contains('user-message')?'user':'assistant',html:row.querySelector('.message-bubble')?.innerHTML||''}));try{localStorage.setItem(key,JSON.stringify(data));}catch(_){}});observer.observe(root,{childList:true,subtree:true,characterData:true});}
})();
