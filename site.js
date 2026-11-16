/* TaleTellers: small progressive enhancements. Every page reads and works fully without this file.
   Motion: a hero entrance and scroll reveals. The "js" class switches the hidden start states on
      (see the motion block in styles.css). Which states those are is the stylesheet's business: with motion
      allowed things rise into place; with reduced motion the reveals are short fades and nothing moves
      (styles.css, "The gentle version"). So this file never asks which of the two the visitor wants. */
(function () {
  'use strict';
  var root = document.documentElement;

  function showAll() {
    var all = document.querySelectorAll('[data-reveal], .hero');
    for (var i = 0; i < all.length; i += 1) all[i].classList.add('is-in');
  }

  function setUpMotion() {
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

  function start() {
    try {
      setUpMotion();
    } catch (error) {
      showAll();
    }
  }

  root.classList.add('js');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Printing or a very late paint should never leave content hidden.
  window.addEventListener('beforeprint', showAll);
})();
