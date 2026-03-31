/* ============================================================
   RCB FAN WEBSITE — MAIN.JS
   Shared utilities: Navbar, Scroll animations, Particles,
   Loading screen, Back to top
   ============================================================ */

'use strict';

// ============================================================
// LOADING SCREEN
// ============================================================
window.addEventListener('load', () => {
  const loader = document.getElementById('loading-screen');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }, 800);
  }
});

// ============================================================
// NAVBAR
// ============================================================
const initNavbar = () => {
  const navbar = document.getElementById('navbar');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');

  if (!navbar) return;

  // Scroll behavior
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // Mobile hamburger
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });
  }

  // Set active link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a, .nav-mobile a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
};

// ============================================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================================
const initScrollAnimations = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger').forEach(el => {
    observer.observe(el);
  });
};

// ============================================================
// HERO PARTICLE SYSTEM
// ============================================================
const initHeroParticles = () => {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  const colors = ['#CC0000', '#FF3333', '#FFD700', '#FF6600', '#CC0000'];
  const particleCount = 25;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'hero-particle';
    
    const size = Math.random() * 4 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const duration = Math.random() * 8 + 6;
    const delay = Math.random() * 8;
    
    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      left: ${left}%;
      bottom: 0;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      box-shadow: 0 0 ${size * 2}px ${color};
    `;
    
    container.appendChild(particle);
  }
};

// ============================================================
// BACK TO TOP
// ============================================================
const initBackToTop = () => {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};

// ============================================================
// COUNT UP ANIMATION
// ============================================================
const animateCountUp = (el, target, duration = 2000) => {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  const update = () => {
    current = Math.min(current + increment, target);
    el.textContent = Math.floor(current).toLocaleString();
    if (current < target) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString();
  };
  
  update();
};

const initCounters = () => {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count);
        animateCountUp(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
};

// ============================================================
// NEWS TICKER
// ============================================================
const initNewsTicker = () => {
  const ticker = document.querySelector('.ticker-content');
  if (!ticker) return;

  // Clone for seamless loop
  const clone = ticker.cloneNode(true);
  ticker.parentElement.appendChild(clone);
};

// ============================================================
// TABS SYSTEM
// ============================================================
const initTabs = (tabContainerId) => {
  const container = document.getElementById(tabContainerId);
  if (!container) return;

  const tabButtons = container.querySelectorAll('.tab-btn');
  const tabPanels = container.querySelectorAll('.tab-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => {
        p.style.display = 'none';
        p.style.opacity = '0';
      });

      btn.classList.add('active');
      const activePanel = container.querySelector(`.tab-panel[data-tab="${target}"]`);
      if (activePanel) {
        activePanel.style.display = 'block';
        requestAnimationFrame(() => {
          activePanel.style.transition = 'opacity 0.3s ease';
          activePanel.style.opacity = '1';
        });
      }
    });
  });

  // Activate first tab
  if (tabButtons.length) tabButtons[0].click();
};

// ============================================================
// FILTER SYSTEM (Player cards, etc.)
// ============================================================
const initFilters = (filterGroupSelector, itemSelector, dataAttr = 'role') => {
  const filterBtns = document.querySelectorAll(filterGroupSelector + ' .filter-btn');
  const items = document.querySelectorAll(itemSelector);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      items.forEach(item => {
        if (filter === 'all' || item.dataset[dataAttr] === filter) {
          item.style.display = '';
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
};

// ============================================================
// MODAL SYSTEM
// ============================================================
const openModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => modal.classList.add('open'));
};

const closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }, 300);
};

// Close modals on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('open');
    setTimeout(() => {
      e.target.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }
  if (e.target.classList.contains('modal-close')) {
    const modal = e.target.closest('.modal');
    if (modal) {
      modal.classList.remove('open');
      setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }, 300);
    }
  }
});

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-IN', options);
};

const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

const getPlayerInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

// Player photo URL helper (using ESPNcricinfo / official images where available)
const getPlayerPhotoUrl = (playerId) => {
  return `https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160,q_50/lsci/${playerId}.png`;
};

// ============================================================
// LAZY IMAGE LOADING
// ============================================================
const initLazyImages = () => {
  const images = document.querySelectorAll('img[data-src]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.addEventListener('load', () => img.classList.add('loaded'));
        img.addEventListener('error', () => {
          img.src = '';
          img.classList.add('error');
        });
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  images.forEach(img => observer.observe(img));
};

// ============================================================
// HERO SCROLL PARALLAX
// ============================================================
const initParallax = () => {
  const hero = document.getElementById('hero');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroContent = hero.querySelector('.hero-content');
    if (heroContent) {
      heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
      heroContent.style.opacity = `${1 - scrolled / 600}`;
    }
  }, { passive: true });
};

// ============================================================
// SQUAD HOME AUTO-SCROLL
// ============================================================
const initSquadScroll = () => {
  const track = document.querySelector('.squad-home-track');
  if (!track) return;
  // Track is cloned for infinite loop via CSS animation
};

// ============================================================
// INITIALIZE ALL
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initHeroParticles();
  initBackToTop();
  initCounters();
  initNewsTicker();
  initLazyImages();
  initParallax();
  initSquadScroll();
});

// Make globally available
window.RCB = {
  openModal,
  closeModal,
  formatDate,
  truncateText,
  initTabs,
  initFilters,
  animateCountUp,
};
