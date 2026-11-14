/* TaleTellers: small progressive enhancements. Every page reads and works fully without this file.
   1. Motion: a hero entrance and scroll reveals. The "js" class switches the hidden start states on
      (see the motion block in styles.css). Which states those are is the stylesheet's business: with motion
      allowed things rise into place; with reduced motion the reveals are short fades and nothing moves
      (styles.css, "The gentle version"). So this file never asks which of the two the visitor wants.
   2. Pricing: what each plan adds up to after a number of months. */
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

  // Each plan's "What it adds up to": the set-up once, then the monthly fee for the chosen number of months.
  // Prices come from the block's data-setup and data-monthly attributes, in pence. Whole pounds are shown
  // without pence (£490, not £490.00).
  function setUpSum(live) {
    var range = live.querySelector('input[type="range"]');
    var total = live.querySelector('.sum-total');
    var label = live.querySelector('.sum-months');
    var fallback = live.parentNode.querySelector('.sum-static');
    if (!range || !total || !label) return;
    var setupPence = Number(live.getAttribute('data-setup'));
    var monthlyPence = Number(live.getAttribute('data-monthly'));
    function update() {
      var months = Number(range.value);
      var pence = setupPence + months * monthlyPence;
      total.textContent = '£' + (pence % 100 ? (pence / 100).toFixed(2) : String(pence / 100));
      label.textContent = months === 1 ? '1 month' : months + ' months';
      range.setAttribute('aria-valuetext', label.textContent + ', from ' + total.textContent + ' in total');
    }
    range.addEventListener('input', update);
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
