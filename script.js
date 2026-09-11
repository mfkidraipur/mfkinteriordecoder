document.addEventListener('DOMContentLoaded', () => {
 
  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
 
  // Preloader
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('hidden'), 500);
    });
    // Fallback in case 'load' is slow to fire
    setTimeout(() => preloader.classList.add('hidden'), 2500);
  }
 
  // Scroll reveal (fires once per element)
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }
 
  // Sticky header: shrink on scroll + scrollspy active link
  const siteHeader = document.querySelector('.site-header');
  const navLinks = Array.from(document.querySelectorAll('.main-nav a[href^="#"]'));
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
 
  function onScroll() {
    if (siteHeader) siteHeader.classList.toggle('scrolled', window.scrollY > 40);
 
    let current = null;
    const scrollPos = window.scrollY + 140;
    sections.forEach(section => {
      if (section.offsetTop <= scrollPos) current = section;
    });
    navLinks.forEach(link => {
      const match = current && link.getAttribute('href') === `#${current.id}`;
      link.classList.toggle('active', !!match);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
 
  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const headerInner = document.querySelector('.header-inner');
  if (navToggle && headerInner) {
    const closeNav = () => {
      headerInner.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    };
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = headerInner.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    document.querySelectorAll('.main-nav a').forEach(link => {
      link.addEventListener('click', closeNav);
    });
    // Close when tapping outside the header, pressing Escape, or rotating to a wide layout
    document.addEventListener('click', (e) => {
      if (headerInner.classList.contains('open') && !headerInner.contains(e.target)) closeNav();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
    window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) closeNav(); });
  }
 
  // Gallery carousel
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsWrap = document.getElementById('carouselDots');
 
  if (track) {
    const slides = Array.from(track.children);
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Go to image ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => scrollToSlide(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);
 
    function scrollToSlide(i) {
      const slide = slides[i];
      track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    }
 
    function updateActiveDot() {
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let closestDist = Infinity;
      slides.forEach((slide, i) => {
        const dist = Math.abs((slide.offsetLeft + slide.clientWidth / 2) - trackCenter);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === closest));
      return closest;
    }
 
    let currentIndex = 0;
    track.addEventListener('scroll', () => { currentIndex = updateActiveDot(); }, { passive: true });
 
    prevBtn.addEventListener('click', () => scrollToSlide(Math.max(0, currentIndex - 1)));
    nextBtn.addEventListener('click', () => scrollToSlide(Math.min(slides.length - 1, currentIndex + 1)));
 
    // Autoplay: loops infinitely, pauses on hover/touch/focus so it never fights the user
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let galleryAutoplay;
    function startGalleryAutoplay() {
      if (prefersReducedMotion) return;
      galleryAutoplay = setInterval(() => {
        const next = (currentIndex + 1) % slides.length;
        scrollToSlide(next);
      }, 4000);
    }
    function stopGalleryAutoplay() { clearInterval(galleryAutoplay); }
 
    const carouselEl = document.getElementById('galleryCarousel');
    carouselEl.addEventListener('mouseenter', stopGalleryAutoplay);
    carouselEl.addEventListener('mouseleave', startGalleryAutoplay);
    carouselEl.addEventListener('touchstart', stopGalleryAutoplay, { passive: true });
    carouselEl.addEventListener('touchend', () => { stopGalleryAutoplay(); startGalleryAutoplay(); }, { passive: true });
    carouselEl.addEventListener('focusin', stopGalleryAutoplay);
    carouselEl.addEventListener('focusout', startGalleryAutoplay);
    startGalleryAutoplay();
  }
 
  // Testimonial slider
  const testimonials = Array.from(document.querySelectorAll('.testimonial'));
  const tDotsWrap = document.getElementById('testimonialDots');
  if (testimonials.length && tDotsWrap) {
    testimonials.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => showTestimonial(i));
      tDotsWrap.appendChild(dot);
    });
    const tDots = Array.from(tDotsWrap.children);
    let activeIndex = 0;
 
    function showTestimonial(i) {
      testimonials[activeIndex].classList.remove('active');
      tDots[activeIndex].classList.remove('active');
      activeIndex = i;
      testimonials[activeIndex].classList.add('active');
      tDots[activeIndex].classList.add('active');
    }
 
    let autoplay = setInterval(() => {
      showTestimonial((activeIndex + 1) % testimonials.length);
    }, 5500);
 
    const slider = document.getElementById('testimonialSlider');
    slider.addEventListener('mouseenter', () => clearInterval(autoplay));
    slider.addEventListener('mouseleave', () => {
      autoplay = setInterval(() => showTestimonial((activeIndex + 1) % testimonials.length), 5500);
    });
  }
 
  // Subtle hero parallax tilt (desktop pointer only)
  const heroFrame = document.getElementById('heroFrame');
  if (heroFrame && window.matchMedia('(hover: hover) and (pointer: fine)').matches
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const rect = heroFrame.getBoundingClientRect();
      const relX = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const relY = (e.clientY - rect.top - rect.height / 2) / rect.height;
      heroFrame.style.transform = `rotateY(${relX * 4}deg) rotateX(${-relY * 4}deg)`;
    });
    document.querySelector('.hero').addEventListener('mouseleave', () => {
      heroFrame.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
  }
 
  // Contact form -> WhatsApp
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('nameInput').value.trim();
      const phone = document.getElementById('phoneInput').value.trim();
      const message = document.getElementById('messageInput').value.trim();
      const text = `Hello MFK Interior, my name is ${name} (${phone}). ${message}`;
      const url = `https://wa.me/919926289915?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    });
  }
 
});
