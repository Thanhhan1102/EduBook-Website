const revealObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 })
  : null;

window.observeReveal = (elements) => {
  elements.forEach((element) => {
    if (element.dataset.revealReady) return;
    element.dataset.revealReady = 'true';
    element.classList.add('reveal');
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add('is-visible');
  });
};

document.documentElement.classList.add('motion-ready');
window.observeReveal(document.querySelectorAll('.choice-card, .stats-grid > div, .section-heading, .steps-grid article, .support-content, .footer-grid > div, .catalog-top > div > *'));
