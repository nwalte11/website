/* =============================================================
   main.js — Portfolio interactions
   ============================================================= */
'use strict';

// ── Helpers ────────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── DOM refs ───────────────────────────────────────────────────
const header      = $('#header');
const navToggle   = $('#navToggle');
const navList     = $('#navList');
const navLinks    = $$('.nav__link');
const scrollTopBtn= $('#scrollTop');
const contactForm = $('#contactForm');
const formStatus  = $('#formStatus');

// ── Current year ───────────────────────────────────────────────
const yearEl = $('#currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Header — scroll shadow ─────────────────────────────────────
function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 40);
  scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
  highlightNav();
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Scroll-to-top ──────────────────────────────────────────────
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
}

// ── Mobile nav toggle ──────────────────────────────────────────
if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on nav link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!header.contains(e.target) && navList.classList.contains('open')) {
      navList.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ── Active nav highlight ───────────────────────────────────────
const sections = $$('section[id]');

function highlightNav() {
  const scrollY = window.scrollY;
  sections.forEach(section => {
    const top    = section.offsetTop - 90;
    const bottom = top + section.offsetHeight;
    const id     = section.getAttribute('id');
    const link   = $(`.nav__link[href="#${id}"]`);
    if (link) {
      link.classList.toggle('active', scrollY >= top && scrollY < bottom);
    }
  });
}

// ── Reveal on scroll (Intersection Observer) ───────────────────
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
        // Trigger skill bars if inside about section
        const bars = $$('.skill-bar__fill', entry.target.closest('.about__skills') || entry.target);
        bars.forEach(bar => {
          bar.style.width = bar.dataset.width + '%';
        });
        // Trigger counters
        const nums = $$('[data-target]', entry.target);
        nums.forEach(animateCounter);
      }
    });
  },
  { threshold: 0.15 }
);

$$('.reveal').forEach(el => revealObserver.observe(el));

// Skill bars: also trigger when about__skills becomes visible
const skillsSection = $('.about__skills');
if (skillsSection) {
  const skillsObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        $$('.skill-bar__fill').forEach(bar => {
          bar.style.width = bar.dataset.width + '%';
        });
        skillsObserver.disconnect();
      }
    },
    { threshold: 0.2 }
  );
  skillsObserver.observe(skillsSection);
}

// ── Counter animation ──────────────────────────────────────────
const counterObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

$$('[data-target]').forEach(el => counterObserver.observe(el));

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start    = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── Typed text (hero) ──────────────────────────────────────────
const typedEl = $('#typedText');
const phrases  = [
  'Full-Stack Developer',
  'React Enthusiast',
  'Node.js Developer',
  'Open Source Contributor',
  'Problem Solver',
];
let phraseIdx  = 0;
let charIdx    = 0;
let deleting   = false;
let typingTimer;

function typeLoop() {
  const current = phrases[phraseIdx];
  if (deleting) {
    charIdx--;
  } else {
    charIdx++;
  }
  if (typedEl) typedEl.textContent = current.slice(0, charIdx);

  let delay = deleting ? 60 : 100;

  if (!deleting && charIdx === current.length) {
    delay = 2000; // pause at end
    deleting = true;
  } else if (deleting && charIdx === 0) {
    deleting   = false;
    phraseIdx  = (phraseIdx + 1) % phrases.length;
    delay = 400;
  }
  typingTimer = setTimeout(typeLoop, delay);
}
if (typedEl) typeLoop();

// ── Portfolio filters ──────────────────────────────────────────
const filterBtns   = $$('.filter-btn');
const projectCards = $$('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
    btn.classList.add('filter-btn--active');

    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden-card', !match);
    });
  });
});

// ── Tab panels (examples) ──────────────────────────────────────
const tabBtns  = $$('.tab-btn');
const panels   = $$('.code-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('tab-btn--active'));
    btn.classList.add('tab-btn--active');

    const targetId = btn.dataset.tab;
    panels.forEach(panel => {
      panel.classList.toggle('hidden', panel.id !== targetId);
    });
  });
});

// ── Copy code button ───────────────────────────────────────────
$$('.code-panel__copy').forEach(btn => {
  btn.addEventListener('click', () => {
    const codeEl = btn.closest('.code-panel').querySelector('code');
    if (!codeEl) return;

    // Strip HTML tags to get plain text
    const text = codeEl.innerText || codeEl.textContent;
    navigator.clipboard.writeText(text).then(() => {
      btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        btn.classList.remove('copied');
      }, 2000);
    }).catch(() => {
      // Fallback for older browsers
      const range = document.createRange();
      range.selectNodeContents(codeEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand('copy');
      sel.removeAllRanges();
    });
  });
});

// ── Contact form ───────────────────────────────────────────────
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    clearFormErrors();

    const name    = contactForm.elements['name'];
    const email   = contactForm.elements['email'];
    const message = contactForm.elements['message'];
    let valid = true;

    if (!name.value.trim()) {
      markError(name);
      valid = false;
    }
    if (!email.value.trim() || !isValidEmail(email.value)) {
      markError(email);
      valid = false;
    }
    if (!message.value.trim()) {
      markError(message);
      valid = false;
    }

    if (!valid) {
      setFormStatus('Please fill in all required fields correctly.', 'error');
      return;
    }

    // Simulate sending (replace with real endpoint)
    const submitBtn = contactForm.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      setFormStatus('Message sent! I\'ll get back to you soon.', 'success');
      contactForm.reset();
    }, 1500);
  });
}

function markError(el) {
  el.classList.add('error');
  el.addEventListener('input', () => el.classList.remove('error'), { once: true });
}

function clearFormErrors() {
  $$('.error', contactForm).forEach(el => el.classList.remove('error'));
  setFormStatus('', '');
}

function setFormStatus(msg, type) {
  if (!formStatus) return;
  formStatus.textContent = msg;
  formStatus.className   = 'form-status';
  if (type) formStatus.classList.add(type);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Smooth anchor scroll (offset for fixed header) ─────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
