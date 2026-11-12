/* Motion for the TaleTellers site: a hero entrance and scroll reveals.
   The page is fully visible without this file. The "js" class switches the
   hidden start states on (see the motion block in styles.css), and only when
   the visitor has not asked for reduced motion. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  root.classList.add('js');

  function showAll() {
    var all = document.querySelectorAll('[data-reveal], .hero');
    for (var i = 0; i < all.length; i += 1) all[i].classList.add('is-in');
  }

  function start() {
    var hero = document.querySelector('.hero');
    if (hero) {
      // Wait for a painted frame first: a class added before the first paint
      // jumps straight to the end state instead of playing the transition.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          setTimeout(function () { hero.classList.add('is-in'); }, 80);
        });
      });
    }

    var items = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) { showAll(); return; }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    for (var i = 0; i < items.length; i += 1) observer.observe(items[i]);
  }

  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  } catch (error) {
    showAll();
  }

  // Printing or a very late paint should never leave content hidden.
  window.addEventListener('beforeprint', showAll);
})();
