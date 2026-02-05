// Wait for the DOM to load before running scripts
document.addEventListener('DOMContentLoaded', function () {

  // ===================================================
  // Mobile Menu Toggle
  // ===================================================
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('nav');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !expanded);
      navMenu.classList.toggle('open');
    });

    // Close menu when clicking a nav link (mobile)
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 900) {
          navMenu.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // ===================================================
  // Sticky Header Shadow on Scroll
  // ===================================================
  var header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // ===================================================
  // Scroll Animations (Intersection Observer)
  // ===================================================
  var fadeElements = document.querySelectorAll('.fade-in');

  if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all elements immediately
    fadeElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ===================================================
  // Form Submission Handler
  // ===================================================
  var forms = document.querySelectorAll('form');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      // Find success message within or after the form
      var successMsg = form.querySelector('.success-message');
      if (successMsg) {
        successMsg.classList.add('show');
        // Hide after 5 seconds
        setTimeout(function () {
          successMsg.classList.remove('show');
        }, 5000);
      }

      form.reset();

      // Scroll to success message
      if (successMsg) {
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  // ===================================================
  // Smooth scroll for anchor links
  // ===================================================
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});
