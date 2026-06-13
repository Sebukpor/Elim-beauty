/* ============================================================
   ELIM Hair & Beauty — script.js
   Complete interactive functionality
   ============================================================ */

'use strict';

/* ==================== THEME TOGGLE ==================== */
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

function applyTheme(theme) {
  body.classList.toggle('dark-mode', theme === 'dark');
  body.classList.toggle('light-mode', theme === 'light');
}

// Load saved preference or detect system preference
const savedTheme = localStorage.getItem('elim-theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const isDark = body.classList.contains('dark-mode');
  const next = isDark ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('elim-theme', next);
});

// Listen for OS theme change
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem('elim-theme')) applyTheme(e.matches ? 'dark' : 'light');
});


/* ==================== SCROLL PROGRESS BAR ==================== */
const progressBar = document.getElementById('scroll-progress');

function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
  progressBar.setAttribute('aria-valuenow', Math.round(pct));
}

window.addEventListener('scroll', updateProgress, { passive: true });


/* ==================== NAVBAR ==================== */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function handleNavScroll() {
  // Scrolled style
  if (window.scrollY > 30) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Active link highlighting
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) current = section.id;
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll(); // run on load


/* ==================== MOBILE HAMBURGER MENU ==================== */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = navLinksEl.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

// Close menu when a nav link is clicked
navLinksEl.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinksEl.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Close on outside click
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) {
    navLinksEl.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});


/* ==================== SMOOTH SCROLLING ==================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-height')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* ==================== INTERSECTION OBSERVER — REVEAL ANIMATIONS ==================== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // animate once
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ==================== PORTFOLIO FILTERING ==================== */
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    portfolioItems.forEach(item => {
      const category = item.dataset.category;
      const show = filter === 'all' || category === filter;

      item.style.transition = 'opacity 0.35s ease, transform 0.35s ease';

      if (show) {
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
        item.style.pointerEvents = 'auto';
        item.style.display = '';
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.94)';
        item.style.pointerEvents = 'none';
        setTimeout(() => {
          if (item.style.opacity === '0') item.style.display = 'none';
        }, 350);
      }
    });
  });
});


/* ==================== LIGHTBOX ==================== */
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev  = document.getElementById('lightbox-prev');
const lightboxNext  = document.getElementById('lightbox-next');

// Collect all portfolio images for navigation
let allImages = [];
let currentLightboxIndex = 0;

function buildImageList() {
  allImages = Array.from(document.querySelectorAll('.portfolio-item img'));
}

function openLightbox(index) {
  buildImageList();
  currentLightboxIndex = index;
  const img = allImages[index];
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
  lightboxImg.src = '';
}

function navigateLightbox(direction) {
  currentLightboxIndex = (currentLightboxIndex + direction + allImages.length) % allImages.length;
  const img = allImages[currentLightboxIndex];

  // Crossfade
  lightboxImg.style.opacity = '0';
  setTimeout(() => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxImg.style.opacity = '1';
  }, 180);
}

lightboxImg.style.transition = 'opacity 0.18s ease';

// Attach zoom buttons
document.querySelectorAll('.portfolio-zoom').forEach((btn, i) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    openLightbox(i);
  });
});

// Click image area to open
portfolioItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
lightboxNext.addEventListener('click', () => navigateLightbox(1));

// Click backdrop to close
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape')   closeLightbox();
  if (e.key === 'ArrowLeft')  navigateLightbox(-1);
  if (e.key === 'ArrowRight') navigateLightbox(1);
});


/* ==================== TESTIMONIALS CAROUSEL ==================== */
const track       = document.getElementById('testimonial-track');
const dotsContainer = document.getElementById('carousel-dots');
const prevBtn     = document.getElementById('carousel-prev');
const nextBtn     = document.getElementById('carousel-next');
const cards       = track.querySelectorAll('.testimonial-card');

let currentSlide = 0;
let autoSlideTimer = null;
let isDragging = false;
let dragStartX = 0;
let dragDelta = 0;

// Build dots
cards.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('role', 'tab');
  dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
  dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
  dot.dataset.index = i;
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

function getVisibleCount() {
  if (window.innerWidth < 600) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
}

function getCardWidth() {
  const card = cards[0];
  const gap = 24; // matches --space-xl = 1.5rem * 16 = 24px
  return card.offsetWidth + gap;
}

function goToSlide(index) {
  const max = cards.length - getVisibleCount();
  currentSlide = Math.max(0, Math.min(index, max));
  track.style.transform = `translateX(-${currentSlide * getCardWidth()}px)`;

  // Update dots
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
    dot.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
  });
}

function nextSlide() {
  const max = cards.length - getVisibleCount();
  goToSlide(currentSlide < max ? currentSlide + 1 : 0);
}

function prevSlide() {
  const max = cards.length - getVisibleCount();
  goToSlide(currentSlide > 0 ? currentSlide - 1 : max);
}

prevBtn.addEventListener('click', () => { prevSlide(); resetAutoSlide(); });
nextBtn.addEventListener('click', () => { nextSlide(); resetAutoSlide(); });

function startAutoSlide() {
  autoSlideTimer = setInterval(nextSlide, 5000);
}

function resetAutoSlide() {
  clearInterval(autoSlideTimer);
  startAutoSlide();
}

startAutoSlide();

// Pause on hover
track.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
track.addEventListener('mouseleave', startAutoSlide);

// Touch/drag support
track.addEventListener('touchstart', e => {
  isDragging = true;
  dragStartX = e.touches[0].clientX;
}, { passive: true });

track.addEventListener('touchmove', e => {
  if (!isDragging) return;
  dragDelta = e.touches[0].clientX - dragStartX;
}, { passive: true });

track.addEventListener('touchend', () => {
  if (!isDragging) return;
  isDragging = false;
  if (dragDelta < -50) nextSlide();
  else if (dragDelta > 50) prevSlide();
  dragDelta = 0;
  resetAutoSlide();
});

// Reposition on resize
window.addEventListener('resize', () => goToSlide(currentSlide));


/* ==================== BOOKING FORM VALIDATION ==================== */
const bookingForm = document.getElementById('booking-form');
const bookingSuccess = document.getElementById('booking-success');

// Set minimum date to today
const dateInput = document.getElementById('appt-date');
if (dateInput) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
}

function showError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  if (field) field.classList.add('error');
  if (error) error.textContent = message;
}

function clearError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  if (field) field.classList.remove('error');
  if (error) error.textContent = '';
}

function validateBookingForm() {
  let valid = true;

  // Name
  const name = document.getElementById('client-name').value.trim();
  if (!name || name.length < 2) {
    showError('client-name', 'name-error', 'Please enter your full name.');
    valid = false;
  } else {
    clearError('client-name', 'name-error');
  }

  // Phone
  const phone = document.getElementById('client-phone').value.trim();
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,15}$/;
  if (!phone || !phoneRegex.test(phone)) {
    showError('client-phone', 'phone-error', 'Please enter a valid phone number.');
    valid = false;
  } else {
    clearError('client-phone', 'phone-error');
  }

  // Email
  const email = document.getElementById('client-email').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showError('client-email', 'email-error', 'Please enter a valid email address.');
    valid = false;
  } else {
    clearError('client-email', 'email-error');
  }

  // Service
  const service = document.getElementById('service-select').value;
  if (!service) {
    showError('service-select', 'service-error', 'Please select a service.');
    valid = false;
  } else {
    clearError('service-select', 'service-error');
  }

  // Date
  const date = document.getElementById('appt-date').value;
  if (!date) {
    showError('appt-date', 'date-error', 'Please choose a preferred date.');
    valid = false;
  } else {
    clearError('appt-date', 'date-error');
  }

  // Time
  const time = document.getElementById('appt-time').value;
  if (!time) {
    showError('appt-time', 'time-error', 'Please choose a preferred time.');
    valid = false;
  } else {
    clearError('appt-time', 'time-error');
  }

  return valid;
}

// Live validation on blur
['client-name', 'client-phone', 'client-email', 'service-select', 'appt-date', 'appt-time'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('blur', validateBookingForm);
});

bookingForm && bookingForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  if (!validateBookingForm()) return;

  const submitBtn = document.getElementById('submit-btn');
  const btnText   = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');

  // Loading state
  submitBtn.disabled = true;
  btnText.hidden = true;
  btnLoading.hidden = false;

  /*
   * ============================================================
   * GOOGLE CALENDAR API INTEGRATION POINT
   * ------------------------------------------------------------
   * Replace this setTimeout block with your real API call:
   *
   * const formData = new FormData(bookingForm);
   * const payload = Object.fromEntries(formData.entries());
   *
   * const response = await fetch('/api/book-appointment', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify(payload),
   * });
   *
   * The backend endpoint should:
   * 1. Authenticate with Google OAuth2 using a service account
   * 2. Call Google Calendar API to create an event:
   *    - summary: `${payload.service} — ${payload.name}`
   *    - start: { dateTime: `${payload.date}T${payload.time}:00` }
   *    - attendees: [{ email: payload.email }]
   *    - description: payload.message
   * 3. Send confirmation email via Gmail API or nodemailer
   * 4. Return { success: true, eventLink: '...' }
   * ============================================================
   */

  await new Promise(resolve => setTimeout(resolve, 1800)); // simulate network

  // Show success
  bookingForm.hidden = true;
  bookingSuccess.hidden = false;

  // Reset state
  submitBtn.disabled = false;
  btnText.hidden = false;
  btnLoading.hidden = true;
});


/* ==================== CONTACT FORM ==================== */
const contactForm = document.getElementById('contact-form');

contactForm && contactForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const btn = contactForm.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'Sent! ✓';
  btn.disabled = true;
  btn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';

  setTimeout(() => {
    contactForm.reset();
    btn.textContent = original;
    btn.disabled = false;
    btn.style.background = '';
  }, 3000);
});


/* ==================== FOOTER YEAR ==================== */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ==================== LAZY LOADING IMAGES ==================== */
// Native lazy loading is set in HTML; this enhances older browsers
if ('loading' in HTMLImageElement.prototype === false) {
  const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        imgObserver.unobserve(img);
      }
    });
  });
  lazyImgs.forEach(img => imgObserver.observe(img));
}


/* ==================== PARALLAX HERO BLOBS ==================== */
const blobs = document.querySelectorAll('.blob');

window.addEventListener('mousemove', e => {
  if (window.innerWidth < 768) return; // skip on mobile
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;

  blobs.forEach((blob, i) => {
    const factor = (i + 1) * 0.4;
    blob.style.transform = `translate(${x * factor}px, ${y * factor}px) scale(1)`;
  });
}, { passive: true });


/* ==================== KEYBOARD ACCESSIBILITY — PORTFOLIO ITEMS ==================== */
portfolioItems.forEach((item, i) => {
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `View portfolio image ${i + 1}`);
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(i);
    }
  });
});


/* ==================== SERVICES CARD TILT ==================== */
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    if (window.innerWidth < 768) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


/* ==================== ANIMATED COUNTER (about stats via hero glass card) ==================== */
function animateCounter(el, target, duration = 1800) {
  let start = 0;
  const step = target / (duration / 16);
  const suffix = el.dataset.suffix || '';

  const tick = () => {
    start += step;
    if (start >= target) {
      el.textContent = target + suffix;
      return;
    }
    el.textContent = Math.floor(start) + suffix;
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

// Observe the hero glass card stats
const heroStats = document.querySelectorAll('.stat-num');
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const raw = el.textContent.trim();
      const match = raw.match(/^([\d.]+)(\D*)$/);
      if (match) {
        const num = parseFloat(match[1]);
        el.dataset.suffix = match[2];
        animateCounter(el, num);
      }
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

heroStats.forEach(stat => counterObserver.observe(stat));


/* ==================== UPI ID COPY FUNCTIONALITY ==================== */
const copyUpiBtn = document.getElementById('copy-upi-btn');
const upiIdEl = document.getElementById('upi-id');
const copySuccessMsg = document.getElementById('copy-success');

if (copyUpiBtn && upiIdEl) {
  copyUpiBtn.addEventListener('click', async () => {
    const upiId = upiIdEl.textContent.trim();
    
    try {
      await navigator.clipboard.writeText(upiId);
      
      // Show success message
      if (copySuccessMsg) {
        copySuccessMsg.classList.add('show');
        
        // Hide after animation completes
        setTimeout(() => {
          copySuccessMsg.classList.remove('show');
        }, 2000);
      }
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = upiId;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        if (copySuccessMsg) {
          copySuccessMsg.classList.add('show');
          setTimeout(() => {
            copySuccessMsg.classList.remove('show');
          }, 2000);
        }
      } catch (fallbackErr) {
        console.error('Failed to copy UPI ID:', fallbackErr);
      }
      
      document.body.removeChild(textArea);
    }
  });
}


/* ==================== INIT ==================== */
console.log('%c✦ ELIM Hair & Beauty ✦', 'color: #FF4FA3; font-size: 16px; font-weight: bold;');
console.log('%cBuilt with elegance and care.', 'color: #888; font-size: 12px;');
