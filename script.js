// Toggle the navigation menu visibility (mobile)
function toggleMenu() {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav-links');
  if (!btn || !nav) return;

  const isOpen = btn.getAttribute('aria-expanded') === 'true';
  if (isOpen) {
    btn.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    btn.focus();
  } else {
    btn.setAttribute('aria-expanded', 'true');
    nav.classList.add('open');
    // move focus to first link for keyboard users
    const firstLink = nav.querySelector('a');
    if (firstLink) firstLink.focus();
  }
}

// Attach event listeners for the hamburger (supports Enter/Space)
(function attachMenuHandlers(){
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav-links');
  if (!btn || !nav) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu();
  });

  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });

  // Close menu on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (btn.getAttribute('aria-expanded') === 'true') {
        toggleMenu();
      }
    }
  });
})();

/* Project filtering functionality */
function filterProjects(category){
  const container = document.querySelector('.projects');
  if (!container) return;
  const cards = container.querySelectorAll('.project-card');

  cards.forEach(card => {
    const cat = card.getAttribute('data-category') || 'all';
    const match = category === 'all' || cat === category;
    if (match) {
      card.style.display = '';
      card.setAttribute('aria-hidden', 'false');
    } else {
      card.style.display = 'none';
      card.setAttribute('aria-hidden', 'true');
    }
  });
}

/* Wire up filter buttons */
(function attachFilters(){
  const toolbar = document.querySelector('.filters');
  if (!toolbar) return;
  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    const allBtns = toolbar.querySelectorAll('.filter-btn');
    allBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
    const category = btn.getAttribute('data-filter') || 'all';
    filterProjects(category);
  });
})();

/* Lightbox implementation */
(function attachLightbox(){
  const overlay = document.getElementById('lightboxOverlay');
  if (!overlay) return;
  const dialog = overlay.querySelector('.lightbox');
  const img = overlay.querySelector('img');
  const caption = overlay.querySelector('.caption');
  const closeBtn = overlay.querySelector('.close-btn');

  function openLightbox(src, alt, captionText){
    img.src = src || '';
    img.alt = alt || '';
    caption.textContent = captionText || '';
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    // trap focus briefly
    closeBtn.focus();
  }

  function closeLightbox(){
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    img.src = '';
    caption.textContent = '';
  }

  // Click on any image with .lightbox-trigger
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.lightbox-trigger');
    if (!target) return;
    const full = target.getAttribute('data-full') || target.src;
    const alt = target.getAttribute('alt') || '';
    const captionText = target.closest('.project-card')?.querySelector('.meta')?.textContent || '';
    openLightbox(full, alt, captionText);
  });

  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeLightbox(); });
})();

/* Contact form validation and real-time feedback */
(function attachFormValidation(){
  const form = document.getElementById('contactForm');
  if (!form) return;

  const name = form.querySelector('#name');
  const email = form.querySelector('#email');
  const message = form.querySelector('#message');
  const successBox = document.getElementById('formSuccess');

  function isEmailValid(value){
    // simple, robust regex for basic validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function showError(field, msg){
    const id = field.getAttribute('id');
    const err = document.getElementById(id + 'Error');
    if (err){ err.textContent = msg; }
    field.classList.add('input-error');
    field.setAttribute('aria-invalid', 'true');
  }

  function clearError(field){
    const id = field.getAttribute('id');
    const err = document.getElementById(id + 'Error');
    if (err){ err.textContent = ''; }
    field.classList.remove('input-error');
    field.removeAttribute('aria-invalid');
  }

  function validateField(field){
    const val = field.value.trim();
    if (!val){ showError(field, 'This field is required.'); return false; }
    if (field === email && !isEmailValid(val)){ showError(field, 'Please enter a valid email address.'); return false; }
    clearError(field); return true;
  }

  // Real-time feedback
  [name, email, message].forEach(f => {
    f.addEventListener('input', () => validateField(f));
    f.addEventListener('blur', () => validateField(f));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    successBox.style.display = 'none';
    let valid = true;
    [name, email, message].forEach(f => { if (!validateField(f)) valid = false; });
    if (!valid) {
      // focus first invalid
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // For demo: simulate successful submission and clear form
    successBox.style.display = 'block';
    form.reset();
    [name, email, message].forEach(f => clearError(f));
    // hide success message after a while
    setTimeout(()=>{ successBox.style.display = 'none'; }, 5000);
  });
})();


// Smooth scrolling for same-page links with focus management for accessibility
(function attachSmoothScroll(){
  // Use event delegation
  document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const targetId = href.slice(1);
    const target = document.getElementById(targetId);
    if (!target) return; // allow default if target doesn't exist

    e.preventDefault();

    // Close mobile nav if open
    const btn = document.querySelector('.nav-toggle');
    const nav = document.getElementById('nav-links');
    if (btn && nav && btn.getAttribute('aria-expanded') === 'true') {
      btn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    }

    // Smooth scroll
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // After scrolling, move focus for keyboard/screen reader users
    // Use a small timeout to wait for the scroll to start — not all browsers fire events consistently
    setTimeout(() => {
      const prevTabindex = target.getAttribute('tabindex');
      if (prevTabindex === null) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      // If we added tabindex, remove it after blur to keep DOM clean
      if (prevTabindex === null) {
        const cleanup = () => { target.removeAttribute('tabindex'); target.removeEventListener('blur', cleanup); };
        target.addEventListener('blur', cleanup);
      }
    }, 300);

    // Update URL without jumping
    if (history.replaceState) {
      history.replaceState(null, '', href);
    }
  });
})();
