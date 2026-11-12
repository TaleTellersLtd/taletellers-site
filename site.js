/* TaleTellers: small progressive enhancements. Every page reads and works fully without this file.
   1. Motion: a hero entrance and scroll reveals. The "js" class switches the hidden start states on
      (see the motion block in styles.css), and only when the visitor has not asked for reduced motion.
   2. Pricing: what each plan adds up to after a number of months (Local business: with or without the app). */
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

  // Each plan's "What it adds up to": the set-up once, then the monthly fee for the chosen number of months,
  // plus the app's monthly fee when the plan has an app tick box and it is ticked. Prices come from the
  // block's data-setup, data-monthly and data-app attributes, in pence.
  function setUpSum(live) {
    var range = live.querySelector('input[type="range"]');
    var app = live.querySelector('input[type="checkbox"]');
    var total = live.querySelector('.sum-total');
    var label = live.querySelector('.sum-months');
    var fallback = live.parentNode.querySelector('.sum-static');
    if (!range || !total || !label) return;
    var setupPence = Number(live.getAttribute('data-setup'));
    var monthlyPence = Number(live.getAttribute('data-monthly'));
    var appPence = Number(live.getAttribute('data-app') || 0);
    function update() {
      var months = Number(range.value);
      var pence = setupPence + months * (monthlyPence + (app && app.checked ? appPence : 0));
      total.textContent = '£' + (pence / 100).toFixed(2);
      label.textContent = months === 1 ? '1 month' : months + ' months';
      range.setAttribute('aria-valuetext', label.textContent + ', ' + total.textContent + ' in total');
    }
    range.addEventListener('input', update);
    if (app) app.addEventListener('change', update);
    live.hidden = false;
    if (fallback) fallback.hidden = true;
    update();
  }

  function setUpSums() {
    var blocks = document.querySelectorAll('.sum-live');
    for (var i = 0; i < blocks.length; i += 1) setUpSum(blocks[i]);
  }

  function start() {
    setUpSums();
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
