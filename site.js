/* TaleTellers: small progressive enhancements. Every page reads and works fully without this file.
   1. Motion: a hero entrance and scroll reveals. The "js" class switches the hidden start states on
      (see the motion block in styles.css), and only when the visitor has not asked for reduced motion.
   2. Pricing: what the Local business plan adds up to after a number of months, with or without the app. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // Local business plan: set-up once, then the monthly fee, plus £5 a month if the app is added.
  function setUpSum() {
    var range = document.getElementById('months');
    var app = document.getElementById('with-app');
    var total = document.getElementById('sum-total');
    var label = document.getElementById('sum-months');
    var live = document.querySelector('.sum-live');
    var fallback = document.querySelector('.sum-static');
    if (!range || !app || !total || !label || !live) return;
    var SETUP_PENCE = 9999;
    var MONTHLY_PENCE = 999;
    var APP_PENCE = 500;
    function update() {
      var months = Number(range.value);
      var pence = SETUP_PENCE + months * (MONTHLY_PENCE + (app.checked ? APP_PENCE : 0));
      total.textContent = '£' + (pence / 100).toFixed(2);
      label.textContent = months === 1 ? '1 month' : months + ' months';
      range.setAttribute('aria-valuetext', label.textContent + ', ' + total.textContent + ' in total');
    }
    range.addEventListener('input', update);
    app.addEventListener('change', update);
    live.hidden = false;
    if (fallback) fallback.hidden = true;
    update();
  }

  function start() {
    setUpSum();
    if (reduce) return;
    try {
      setUpMotion();
    } catch (error) {
      showAll();
    }
  }

  if (!reduce) root.classList.add('js');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Printing or a very late paint should never leave content hidden.
  window.addEventListener('beforeprint', showAll);
})();
