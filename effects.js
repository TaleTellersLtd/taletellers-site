/* TaleTellers home page: the motion preview (12 Nov 2026). Decoration only: the page reads and works without this file.
   CSS does most of it (styles.css, "Effects"); this file adds what CSS cannot:
   1. "Pause motion": one button for every loop, remembered for the visit (WCAG 2.2.2).
   2. .is-live on a section while it is on screen, so its loops only run when they can be seen.
   3. The cover's stars lean away from the pointer (or follow an Android phone's tilt; iPhones are never asked).
   4. Prices and download figures count up once. The HTML keeps the real numbers and gets them back at the end.
   5. Chapter II's cards tilt towards the pointer, and now and then a shooting star crosses its sky.
   Nothing here runs under prefers-reduced-motion: reduce. One requestAnimationFrame loop, alive only while
   something is easing. */
(function () {
  'use strict';
  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var button = doc.querySelector('.motion-toggle');
  if (!button || !('IntersectionObserver' in window)) return;

  var paused = false;
  try { paused = sessionStorage.getItem('tt-motion') === 'paused'; } catch (e) { /* private mode */ }
  var on = false;      // motion is allowed and not paused
  var tasks = [];      // functions called on every frame until they return false
  var frame = 0;
  var last = 0;
  var settle = [];     // functions that bring pointer-driven pieces back to rest

  function tick(now) {
    var dt = Math.min(now - last, 50);
    last = now;
    tasks = tasks.filter(function (task) { return task(dt) !== false; });
    frame = tasks.length ? requestAnimationFrame(tick) : 0;
  }
  function run(task) {
    if (tasks.indexOf(task) < 0) tasks.push(task);
    if (!frame) { last = performance.now(); frame = requestAnimationFrame(tick); }
  }
  function each(selector, fn) { Array.prototype.forEach.call(doc.querySelectorAll(selector), fn); }
  function clamp(n) { return Math.max(-1, Math.min(1, n)); }

  // A point that eases towards a target (frame-rate independent); "paint" is told where it is.
  function follower(ms, paint) {
    var x = 0, y = 0, tx = 0, ty = 0;
    function ease(dt) {
      var k = 1 - Math.exp(-dt / ms);
      x += (tx - x) * k;
      y += (ty - y) * k;
      var rest = Math.abs(tx - x) + Math.abs(ty - y) < 0.004;
      if (rest) { x = tx; y = ty; }
      paint(x, y, rest && !x && !y);
      return !rest;
    }
    return function (nx, ny) {
      if (nx === x && ny === y && tx === x && ty === y) return;   // already there: no work
      tx = nx; ty = ny; run(ease);
    };
  }

  // 3. The cover's star layers: data-drift is how many pixels a layer may move.
  function setUpDrift(cover) {
    var layers = [];
    each('.cover [data-drift]', function (el) { layers.push([el, Number(el.getAttribute('data-drift'))]); });
    var aim = follower(160, function (x, y) {
      layers.forEach(function (layer) {
        layer[0].style.translate = (-x * layer[1]).toFixed(2) + 'px ' + (-y * layer[1] * 0.6).toFixed(2) + 'px';
      });
    });
    settle.push(function () { aim(0, 0); });
    cover.addEventListener('pointermove', function (event) {
      if (!on || event.pointerType !== 'mouse') return;
      var box = cover.getBoundingClientRect();
      aim(clamp((event.clientX - box.left) / box.width * 2 - 1), clamp((event.clientY - box.top) / box.height * 2 - 1));
    });
    cover.addEventListener('pointerleave', function () { aim(0, 0); });

    // Phones: Android reports tilt without asking. iOS needs a permission prompt, so it is left alone there
    // and gets the small scroll-linked drift from the CSS instead.
    var Tilt = window.DeviceOrientationEvent;
    if (Tilt && typeof Tilt.requestPermission !== 'function' && !fine.matches) {
      var zero = null, sent = [0, 0];
      window.addEventListener('deviceorientation', function (event) {
        if (!on || event.gamma === null || !cover.classList.contains('is-live')) return;
        if (!zero) zero = [event.gamma, event.beta];
        var nx = clamp((event.gamma - zero[0]) / 18), ny = clamp((event.beta - zero[1]) / 18);
        if (Math.abs(nx - sent[0]) + Math.abs(ny - sent[1]) < 0.04) return;   // ignore sensor noise
        sent = [nx, ny];
        aim(nx, ny);
      });
    }
  }

  // 4. Count a figure up to the number in the HTML. It starts from 10, 100... (the same number of digits),
  //    and the figures are tabular, so nothing around it moves.
  function countUp(el) {
    var node = el.firstChild;
    var match = node && node.nodeType === 3 && /^(\D*)(\d+)(\.\d+)?([\s\S]*)$/.exec(node.nodeValue);
    if (!match || !on) return;
    var real = node.nodeValue;
    var end = parseFloat(match[2] + (match[3] || ''));
    var start = Math.pow(10, match[2].length - 1);
    var places = match[3] ? match[3].length - 1 : 0;
    var t = 0;
    run(function (dt) {
      t = Math.min(1, t + dt / 1100);
      var eased = 1 - Math.pow(1 - t, 4);
      node.nodeValue = t < 1 ? match[1] + (start + (end - start) * eased).toFixed(places) + match[4] : real;
      return t < 1;
    });
  }

  // 5a. A card leans towards the pointer: at most about 3 degrees, less on wide cards.
  function setUpTilt(card) {
    var width = 400;
    var aim = follower(120, function (x, y, atRest) {
      var max = Math.min(3.2, 1300 / width);
      card.style.transform = atRest ? '' : 'perspective(1000px) rotateX(' + (-y * 2.4).toFixed(2) + 'deg) rotateY(' + (x * max).toFixed(2) + 'deg)';
      if (atRest) card.classList.remove('is-tilting');
    });
    settle.push(function () { aim(0, 0); });
    card.addEventListener('pointermove', function (event) {
      if (!on || !fine.matches || event.pointerType !== 'mouse') return;
      if (card.hasAttribute('data-reveal') && !card.classList.contains('is-in') && root.classList.contains('js')) return;
      var box = card.getBoundingClientRect();
      width = box.width;
      card.classList.add('is-tilting');
      aim(clamp((event.clientX - box.left) / box.width * 2 - 1), clamp((event.clientY - box.top) / box.height * 2 - 1));
    });
    card.addEventListener('pointerleave', function () { aim(0, 0); });
  }

  // 5b. A shooting star: the first a few seconds after a sky comes into view, then one every 20 to 40 seconds.
  //     There are two skies in the HTML (under the turning page, and the plain band at the head of Chapter II);
  //     the CSS shows one of them, and only a sky that is on screen ever becomes .is-live.
  var lastShot = 0;
  function setUpShootingStar(star) {
    var sky = star.parentNode;
    var timer = 0;
    function shoot() {
      timer = 0;
      if (on && !doc.hidden && sky.classList.contains('is-live') && star.animate) {
        var far = Math.min(340, sky.clientWidth * 0.5);
        star.style.left = (8 + Math.random() * 55) + '%';
        star.style.top = (6 + Math.random() * 30) + '%';
        star.animate([
          { opacity: 0, transform: 'translate3d(0,0,0)' },
          { opacity: 1, offset: 0.2 },
          { opacity: 1, offset: 0.65 },
          { opacity: 0, transform: 'translate3d(' + far + 'px,' + far * 0.4 + 'px,0)' }
        ], { duration: 800 });   // linear: a meteor does not slow down, it burns out
        lastShot = Date.now();
      }
      plan();
    }
    function plan() {
      if (timer || !on || !sky.classList.contains('is-live')) return;
      var wait = lastShot ? 20000 + Math.random() * 20000 - (Date.now() - lastShot) : 3500 + Math.random() * 3500;
      timer = setTimeout(shoot, Math.max(wait, 3500));
    }
    plans.push(plan);
  }
  var plans = [];
  function planStar() { plans.forEach(function (plan) { plan(); }); }

  // 1. The pause control, and what "on" means.
  function apply() {
    on = !reduce.matches && !paused;
    root.classList.toggle('fx-paused', paused);
    button.hidden = reduce.matches;
    button.textContent = paused ? 'Play motion' : 'Pause motion';
    // A loop that was already running stops where it is; one that comes on screen while paused stays a still.
    if (!paused) each('[data-live]', function (el) { el.classList.toggle('is-live', !!el.fxSeen); });
    if (!on) settle.forEach(function (rest) { rest(); });
    else planStar();
    // Reduced motion asked for mid-visit: nothing eases home, everything is simply at rest.
    if (reduce.matches) tasks.forEach(function (task) { task(1e6); });
  }

  function start() {
    var cover = doc.querySelector('.cover');
    if (cover) setUpDrift(cover);
    each('.shooting', setUpShootingStar);
    each('.tale-lead, .tale', setUpTilt);

    // 2. Loops run only on screen.
    var live = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.fxSeen = entry.isIntersecting;
        if (!paused) entry.target.classList.toggle('is-live', entry.isIntersecting);
      });
      planStar();
    }, { threshold: 0.05 });
    each('[data-live]', function (el) { live.observe(el); });

    var counts = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        counts.unobserve(entry.target);
        countUp(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 1 });
    each('.tier-price, .tale-stats dd, .tale-figure', function (el) { counts.observe(el); });

    button.addEventListener('click', function () {
      paused = !paused;
      try { sessionStorage.setItem('tt-motion', paused ? 'paused' : 'on'); } catch (e) { /* private mode */ }
      apply();
    });
    if (reduce.addEventListener) reduce.addEventListener('change', apply);
    doc.addEventListener('visibilitychange', planStar);
    // Printing must never catch a number half-way up.
    window.addEventListener('beforeprint', function () { tasks.forEach(function (task) { task(1e6); }); });
    apply();
  }

  // Decoration waits for the page itself: it starts once the page has loaded and the browser has a quiet moment.
  function begin() { try { start(); } catch (error) { button.hidden = true; } }
  function whenQuiet() {
    if (window.requestIdleCallback) requestIdleCallback(begin, { timeout: 1200 });
    else setTimeout(begin, 200);
  }
  if (doc.readyState === 'complete') whenQuiet();
  else window.addEventListener('load', whenQuiet);
})();
