// ===================================================
// Cloudflare Turnstile bot protection
// ===================================================
// Paste the SITE KEY from your Cloudflare Turnstile dashboard between the quotes below.
// (Dashboard: Cloudflare account > Turnstile > Add site. The site key is public and
// safe to commit; keep the SECRET key private and out of this repo.)
//
// Until a real key is set, the widget does not render and the forms submit exactly as
// before (the honeypot still runs). Once set, both forms require a passing challenge.
var TURNSTILE_SITE_KEY = 'REPLACE_WITH_YOUR_TURNSTILE_SITE_KEY';

function turnstileConfigured() {
  return typeof TURNSTILE_SITE_KEY === 'string' &&
    TURNSTILE_SITE_KEY.length > 0 &&
    TURNSTILE_SITE_KEY.indexOf('REPLACE_WITH') === -1;
}

function renderTurnstileWidgets() {
  if (!turnstileConfigured()) {
    console.warn('[Turnstile] TURNSTILE_SITE_KEY is not set in script.js — bot verification is disabled until you add your site key.');
    return;
  }
  if (!window.turnstile) { return; } // Turnstile API not loaded yet; onload callback will call again.
  document.querySelectorAll('.cf-turnstile-slot').forEach(function (slot) {
    if (slot.getAttribute('data-rendered') === 'true') { return; }
    try {
      var widgetId = window.turnstile.render(slot, { sitekey: TURNSTILE_SITE_KEY });
      slot.setAttribute('data-rendered', 'true');
      slot.setAttribute('data-widget-id', widgetId);
    } catch (e) {
      console.error('[Turnstile] Failed to render widget:', e);
    }
  });
}

// Exposed so the Turnstile onload callback in each page's <head> can trigger rendering.
window.renderTurnstileWidgets = renderTurnstileWidgets;
window.turnstileConfigured = turnstileConfigured;

// Wait for the DOM to load before running scripts
document.addEventListener('DOMContentLoaded', function () {

  // Render Turnstile now in case its script finished loading before this ran.
  renderTurnstileWidgets();

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
  // Form Submission Handler (Formsubmit.co AJAX)
  // ===================================================
  var forms = document.querySelectorAll('form[data-formsubmit]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var submitBtn = form.querySelector('button[type="submit"]');
      var successMsg = form.querySelector('.success-message');
      var errorMsg = form.querySelector('.error-message');
      var originalBtnText = submitBtn ? submitBtn.textContent : '';
      var originalErrorText = errorMsg ? errorMsg.textContent : '';

      // Hide any previous messages
      if (successMsg) successMsg.classList.remove('show');
      if (errorMsg) errorMsg.classList.remove('show');

      // Require a passing Cloudflare Turnstile challenge before submitting (when configured).
      if (window.turnstileConfigured && window.turnstileConfigured()) {
        var tokenField = form.querySelector('[name="cf-turnstile-response"]');
        if (!tokenField || !tokenField.value) {
          if (errorMsg) {
            errorMsg.textContent = 'Please complete the verification below before submitting.';
            errorMsg.classList.add('show');
          }
          return;
        }
      }

      // Disable button and show sending state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      var formData = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(function (response) {
        if (response.ok) {
          // Show success message
          if (successMsg) {
            successMsg.classList.add('show');
            setTimeout(function () {
              successMsg.classList.remove('show');
            }, 8000);
          }
          form.reset();
          // Reset the Turnstile challenge so a fresh token is required next time.
          var slot = form.querySelector('.cf-turnstile-slot');
          if (window.turnstile && slot && slot.getAttribute('data-widget-id')) {
            try { window.turnstile.reset(slot.getAttribute('data-widget-id')); } catch (e) {}
          }
          if (successMsg) {
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        } else {
          throw new Error('Form submission failed');
        }
      })
      .catch(function () {
        // Show error message
        if (errorMsg) {
          errorMsg.textContent = originalErrorText;
          errorMsg.classList.add('show');
          setTimeout(function () {
            errorMsg.classList.remove('show');
          }, 8000);
        }
      })
      .finally(function () {
        // Re-enable button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
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
