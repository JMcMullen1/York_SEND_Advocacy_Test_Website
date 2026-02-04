// Wait for the DOM to load before running scripts
document.addEventListener('DOMContentLoaded', function() {
  // Mobile Menu Toggle functionality
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('nav');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      // Toggle the navigation menu open/closed
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !expanded);
      navMenu.classList.toggle('open');
    });
  }

  // Form submission handler for Contact and Appointment forms
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(event) {
      event.preventDefault();  // prevent actual form submission
      alert('Thank you, your submission has been received!');
      form.reset();  // reset the form fields
    });
  });
});
