(() => {
  'use strict';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.querySelector('.motion-toggle');
  if (document.querySelector('.home-hero')) {
    const gnosysLink = document.createElement('a');
    gnosysLink.href = 'https://rorrimaesu.github.io/Gnosys-AI/anatomy1/';
    gnosysLink.target = '_blank';
    gnosysLink.rel = 'noopener noreferrer';
    gnosysLink.textContent = 'Gnosys A&P I ↗';
    gnosysLink.setAttribute('aria-label', 'Open Gnosys AI Anatomy and Physiology I in a new tab');
    gnosysLink.className = 'top-link';
    document.querySelector('.top-actions')?.prepend(gnosysLink);
    const mobileLink = gnosysLink.cloneNode(true);
    mobileLink.className = '';
    document.querySelector('.mobile-links')?.append(mobileLink);
  }
  let preference = null;
  try { preference = localStorage.getItem('ap-study-motion'); } catch (_) { /* Offline privacy mode. */ }
  let animations = new Set();
  function motionEnabled() { return !system.matches && preference !== 'off'; }
  function applyMotion() {
    const enabled = motionEnabled();
    root.dataset.motion = enabled ? 'on' : 'off';
    if (button) {
      button.hidden = false;
      button.textContent = enabled ? 'Motion: on' : 'Motion: off';
      button.setAttribute('aria-pressed', String(enabled));
      button.title = system.matches ? 'Reduced motion is enabled in your device settings' : 'Toggle decorative animations';
    }
    if (!enabled) { animations.forEach(animation => animation.cancel()); animations.clear(); }
  }
  applyMotion();
  button?.addEventListener('click', () => {
    preference = motionEnabled() ? 'off' : 'on';
    try { localStorage.setItem('ap-study-motion', preference); } catch (_) { /* Preference stays active for this page. */ }
    applyMotion();
  });
  system.addEventListener?.('change', applyMotion);
  document.querySelectorAll('[data-print]').forEach(control => control.addEventListener('click', () => window.print()));
  let frame = 0;
  const updateProgress = () => {
    const length = document.documentElement.scrollHeight - window.innerHeight;
    const progress = length > 0 ? Math.min(1, Math.max(0, window.scrollY / length)) : 1;
    root.style.setProperty('--read', progress.toFixed(4));
    frame = 0;
  };
  const scheduleProgress = () => { if (!frame) frame = requestAnimationFrame(updateProgress); };
  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', scheduleProgress, { passive: true });
  window.addEventListener('load', updateProgress, { once: true });
  updateProgress();
  if ('ResizeObserver' in window) new ResizeObserver(scheduleProgress).observe(document.body);
  const localLinks = [...document.querySelectorAll('.toc-link')];
  function highlight(id) {
    localLinks.forEach(link => {
      if (link.hash === '#' + id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in window) {
    const headings = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => highlight(entry.target.id));
    }, { rootMargin: '-85px 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('.reader h2[id], .home-section[id]').forEach(heading => headings.observe(heading));
    const reveal = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal.unobserve(entry.target);
        if (!motionEnabled() || typeof entry.target.animate !== 'function') continue;
        const animation = entry.target.animate(
          [{ opacity: 0.65, transform: 'translateY(15px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 560, easing: 'cubic-bezier(.22,1,.36,1)' }
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
        animation.oncancel = () => animations.delete(animation);
      }
    }, { rootMargin: '0px 0px 25px 0px', threshold: 0.02 });
    document.querySelectorAll('.study-section, .resource-card, .home-section').forEach(element => reveal.observe(element));
  }
  document.querySelectorAll('.mobile-nav a').forEach(link => link.addEventListener('click', () => {
    link.closest('details').open = false;
  }));
  localLinks.forEach(link => link.addEventListener('click', () => highlight(link.hash.slice(1))));
  window.addEventListener('pageshow', () => {
    document.querySelectorAll('.mobile-nav').forEach(menu => menu.open = false);
    updateProgress();
  });
})();
