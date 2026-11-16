/**
 * VÉRTICE SCALE PARTNERS — MOTION DESIGN & ENGINE SCRIPT
 * Personality: Premium (350-600ms, cubic-bezier(0.16, 1, 0.3, 1))
 * Implements Three-Layer Motion: Ambient Canvas, Secondary Glare, Primary Physics
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initAmbientCanvas();
  initScrollReveal();
  initNumberCounters();
  initSpotlightGlare();
  initTiltPhysics();
  initGrowthCalculator();
  initFaqAccordion();
});

/* ==========================================================================
   1. NAVBAR SCROLL EFFECT
   ========================================================================== */
function initNavbarScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   2. AMBIENT CANVAS (Motion Layer 3: Ambient Life)
   ========================================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };

  window.addEventListener('resize', resize, { passive: true });
  resize();

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  }, { passive: true });

  const PARTICLE_COUNT = Math.min(width > 768 ? 55 : 25, 60);

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2 + 0.8;
      this.speedY = -(Math.random() * 0.45 + 0.15);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.5 + 0.15;
      this.fade = Math.random() * 0.005 + 0.002;
      this.color = Math.random() > 0.4 ? '16, 185, 129' : '6, 182, 212';
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;

      // Subtle mouse push
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.x -= (dx / dist) * force * 1.5;
        this.y -= (dy / dist) * force * 1.5;
      }

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(${this.color}, 0.8)`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse position
    mouse.x += (mouse.targetX - mouse.x) * 0.1;
    mouse.y += (mouse.targetY - mouse.y) * 0.1;

    // Connect close particles with subtle luxury web lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const lineAlpha = (1 - dist / 130) * 0.12;
          ctx.strokeStyle = `rgba(16, 185, 129, ${lineAlpha})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

/* ==========================================================================
   3. SCROLL REVEAL (IntersectionObserver with Stagger Budget < 500ms)
   ========================================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ==========================================================================
   4. NUMBER COUNTERS WITH FLUID EASING
   ========================================================================== */
function initNumberCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const formatNumber = (num, format) => {
    if (format === 'currency') {
      return num.toLocaleString('pt-BR');
    }
    return num.toLocaleString('pt-BR');
  };

  const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);

  const startCounting = (counter) => {
    const target = parseFloat(counter.getAttribute('data-counter'));
    const format = counter.getAttribute('data-format') || 'standard';
    const duration = 2000;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentVal = Math.floor(easedProgress * target);

      counter.textContent = formatNumber(currentVal, format);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = formatNumber(target, format);
      }
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCounting(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => observer.observe(c));
}

/* ==========================================================================
   5. MOUSE SPOTLIGHT GLARE (Motion Layer 2: Secondary Light Follow)
   ========================================================================== */
function initSpotlightGlare() {
  const cards = document.querySelectorAll('.spotlight-card, .calc-wrapper, .case-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ==========================================================================
   6. 3D TILT PHYSICS (Motion Layer 1: Primary Tactile Reaction)
   ========================================================================== */
function initTiltPhysics() {
  // Only apply tilt on non-touch devices
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const tiltElements = document.querySelectorAll('.hero-card-stage, .spotlight-card');

    tiltElements.forEach(el => {
      let isHovered = false;

      el.addEventListener('mouseenter', () => { isHovered = true; });

      el.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) / (rect.width / 2);
        const deltaY = (e.clientY - centerY) / (rect.height / 2);

        // Max tilt: 6 degrees for luxury restraint (not wobbly)
        const tiltX = -deltaY * 5;
        const tiltY = deltaX * 5;

        el.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-4px)`;
      });

      el.addEventListener('mouseleave', () => {
        isHovered = false;
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }
}

/* ==========================================================================
   7. INTERACTIVE ROI & SCALE CALCULATOR
   ========================================================================== */
function initGrowthCalculator() {
  const revSlider = document.getElementById('rev-slider');
  const userSlider = document.getElementById('users-slider');
  const revDisplay = document.getElementById('rev-val-display');
  const usersDisplay = document.getElementById('users-val-display');
  const growthButtons = document.querySelectorAll('.growth-btn');

  const projectedRevEl = document.getElementById('projected-rev');
  const projectedEbitdaEl = document.getElementById('projected-ebitda');
  const projectedLtvEl = document.getElementById('projected-ltv');
  const calcWaBtn = document.getElementById('calc-wa-btn');

  if (!revSlider || !projectedRevEl) return;

  let currentMultiplier = 3.5; // Default 3.5x scale

  const calculate = () => {
    const currentRev = parseInt(revSlider.value, 10);
    const currentUsers = parseInt(userSlider.value, 10);

    // Update Input Displays
    if (currentRev >= 1000000) {
      revDisplay.textContent = `R$ ${(currentRev / 1000000).toFixed(1)}M/mês`;
    } else {
      revDisplay.textContent = `R$ ${(currentRev / 1000).toFixed(0)}k/mês`;
    }

    if (currentUsers >= 1000000) {
      usersDisplay.textContent = `${(currentUsers / 1000000).toFixed(1)}M usuários`;
    } else {
      usersDisplay.textContent = `${(currentUsers / 1000).toFixed(0)}k usuários`;
    }

    // Calculations based on growth engineering heuristics
    const newAnnualRev = (currentRev * currentMultiplier * 12);
    const addedEbitda = newAnnualRev * 0.28; // 28% margin optimization
    const ltvIncrease = Math.round(35 + (currentMultiplier * 18)); // % increase in LTV

    // Format results in Brazilian Portuguese
    projectedRevEl.textContent = `R$ ${(newAnnualRev / 1000000).toFixed(1)}M`;
    projectedEbitdaEl.textContent = `+R$ ${(addedEbitda / 1000000).toFixed(1)}M`;
    projectedLtvEl.textContent = `+${ltvIncrease}%`;

    // Dynamic WhatsApp Link with customized simulation summary
    const formattedRev = revDisplay.textContent;
    const formattedUsers = usersDisplay.textContent;
    const formattedProj = projectedRevEl.textContent;

    const message = encodeURIComponent(
      `Olá Pedro Elias! Realizei uma simulação de alavancagem no site da Vértice com os dados:\n` +
      `• Faturamento Atual: ${formattedRev}\n` +
      `• Base de Usuários/Downloads: ${formattedUsers}\n` +
      `• Meta de Aceleração: ${currentMultiplier}x\n` +
      `• Projeção Estimada: ${formattedProj}/ano\n\n` +
      `Gostaria de agendar uma sessão estratégica diretamente com você para validar uma das 2 vagas até o final do ano.`
    );

    if (calcWaBtn) {
      calcWaBtn.href = `https://wa.me/5521976916342?text=${message}`;
    }
  };

  revSlider.addEventListener('input', calculate);
  userSlider.addEventListener('input', calculate);

  growthButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      growthButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMultiplier = parseFloat(btn.getAttribute('data-mult'));
      calculate();
    });
  });

  calculate();
}

/* ==========================================================================
   8. INTERACTIVE FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other items for seamless focus
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });

      if (!isActive) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  });
}
