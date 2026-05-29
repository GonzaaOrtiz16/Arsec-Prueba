/* ============================================================
   ARSEC SEGURIDAD PRIVADA — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAVBAR SCROLL ──────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;
  let scrollTicking = false;

  function handleNavScroll() {
    const y = window.scrollY;
    if (y > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = y;
    scrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(handleNavScroll);
      scrollTicking = true;
    }
  }, { passive: true });


  /* ── HAMBURGER MENU ─────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
  });

  document.querySelectorAll('.mobile-menu .nav-link, .mobile-menu .btn-nav-cta').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      mobileMenu.classList.remove('open');
    });
  });


  /* ── SMOOTH SCROLL ──────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ── SCROLL REVEAL (IntersectionObserver) ───────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


  /* ── FLIP CARDS (mobile tap support) ───────────────────── */
  const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
      if (isTouchDevice()) card.classList.toggle('flipped');
    });
  });


  /* ── ANIMATED COUNTERS ──────────────────────────────────── */
  function animateCounter(el, target, duration = 1800) {
    const start = performance.now();
    const isFloat = !Number.isInteger(target);

    function step(timestamp) {
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const current = Math.floor(ease * target);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      animateCounter(el, target);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

  /* Years badge counter (about section) */
  const yearsNumberEls = document.querySelectorAll('.years-number[data-target]');
  yearsNumberEls.forEach(el => {
    const yearObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(el, parseInt(el.dataset.target, 10), 1600);
        yearObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    yearObserver.observe(el);
  });


  /* ── FAQ ACCORDION ──────────────────────────────────────── */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
      });

      if (!isOpen) item.classList.add('open');
    });
  });


  /* ── CONTACT FORM ───────────────────────────────────────── */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll('[required]').forEach(field => {
      field.classList.remove('error');
      if (!field.value.trim()) {
        field.classList.add('error');
        valid = false;
      }
    });

    const emailField = form.querySelector('#email');
    if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      emailField.classList.add('error');
      valid = false;
    }

    if (!valid) return;

    const submitBtn = form.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'ENVIANDO...';

    /* Simulate send — replace with real endpoint */
    setTimeout(() => {
      form.querySelectorAll('input, select, textarea').forEach(f => f.value = '');
      submitBtn.style.display = 'none';
      successMsg.style.display = 'flex';
    }, 1200);
  });

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('error'));
  });


  /* ── PARTICLE CANVAS ────────────────────────────────────── */
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const isMobile = window.innerWidth <= 767;
  const PARTICLE_COUNT = isMobile ? 30 : 60;
  const SYMBOLS = ['+', '+', '+', '×'];

  let W, H, particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      this.size = Math.random() * 8 + 7;
      this.speed = Math.random() * 0.25 + 0.08;
      this.opacity = Math.random() * 0.06 + 0.02;
      this.drift = (Math.random() - 0.5) * 0.15;
    }

    update() {
      this.y -= this.speed;
      this.x += this.drift;
      if (this.y < -20) this.reset();
    }

    draw() {
      ctx.save();
      ctx.font = `${this.size}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = `rgba(204, 21, 21, ${this.opacity})`;
      ctx.fillText(this.symbol, this.x, this.y);
      ctx.restore();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  }

  let animId;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(loop);
  }

  const heroSection = document.getElementById('hero');
  const heroObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!animId) loop();
    } else {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }, { threshold: 0.01 });
  heroObserver.observe(heroSection);

  resize();
  initParticles();
  loop();

  let resizeTick = false;
  window.addEventListener('resize', () => {
    if (!resizeTick) {
      setTimeout(() => {
        resize();
        initParticles();
        resizeTick = false;
      }, 200);
      resizeTick = true;
    }
  });


  /* ── CROSSHAIR CURSOR on interactive elements ────────────── */
  const interactiveSelectors = 'a, button, .flip-card, select, input, textarea';
  document.querySelectorAll(interactiveSelectors).forEach(el => {
    el.style.cursor = 'crosshair';
  });

});
