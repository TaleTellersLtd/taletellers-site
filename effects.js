/* TaleTellers home page: the motion preview (12 Nov 2026). Decoration only: the page reads and works without this file.
   CSS does most of it (styles.css, "Effects"); this file adds what CSS cannot:
   1. "Pause motion": one button for every loop, remembered for the visit (WCAG 2.2.2).
   2. .is-live on a section while it is on screen, so its loops only run when they can be seen.
   3. The cover's stars and moon lean away from the pointer, or follow an Android phone's tilt; a phone that
      reports no tilt (iPhones are never asked) gets a slow drift from the CSS instead.
   4. Prices and download figures count up once. The HTML keeps the real numbers and gets them back at the end.
   5. Chapter II's cards tilt towards the pointer, and now and then a shooting star crosses its sky.
   6. .is-night on the chapter page once it has been read. Only the gentle version uses it (styles.css, "The
      gentle version"): there the page turn is a fade from paper into night.
   Under prefers-reduced-motion: reduce nothing here moves anything: 1 to 5 stay off and only 6 has any effect.
   One requestAnimationFrame loop, alive only while something is easing. */
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

  // 3. The cover's sky: three layers, and data-drift is how many pixels each moves at full lean (the far stars
  //    least, the moon most). They lean away from the pointer anywhere over the night header and the cover,
  //    and ease home when it leaves.
  function setUpDrift(cover) {
    var layers = [];
    each('.cover [data-drift]', function (el) { layers.push([el, Number(el.getAttribute('data-drift'))]); });
    var header = doc.querySelector('.site-header');
    var reach = 1;
    var aim = follower(240, function (x, y) {
      layers.forEach(function (layer) {
        var far = layer[1] * reach;
        layer[0].style.translate = (-x * far).toFixed(2) + 'px ' + (-y * far * 0.6).toFixed(2) + 'px';
      });
    });
    function home() { aim(0, 0); }
    settle.push(home);

    var over = false;
    window.addEventListener('pointermove', function (event) {
      if (event.pointerType !== 'mouse') return;
      var inside = false;
      if (on && cover.classList.contains('is-live')) {
        var box = cover.getBoundingClientRect();
        var top = box.top - (header ? header.offsetHeight : 0);
        inside = event.clientY <= box.bottom && event.clientY >= top;
        if (inside) {
          reach = 1;
          aim(clamp(event.clientX / root.clientWidth * 2 - 1), clamp((event.clientY - top) / (box.bottom - top) * 2 - 1));
        }
      }
      if (over && !inside) home();
      over = inside;
    }, { passive: true });
    root.addEventListener('pointerleave', function () { over = false; home(); });

    // Phones. Android Chrome reports tilt without asking (on https pages only): about 9 degrees either way is the
    // full lean, and the rest position follows the hand over a few seconds, so however the phone is held the sky
    // answers a movement and then settles. Where no tilt arrives (iPhones, which only report it after a permission
    // prompt, and are never asked; http pages; phones without the sensor) the CSS drifts the layers slowly instead:
    // .fx-ambient. Do NOT test for DeviceOrientationEvent.requestPermission to tell an iPhone: Chrome has it too.
    if (fine.matches) return;
    var tilting = false, zero = null, sent = [0, 0];
    window.addEventListener('deviceorientation', function (event) {
      if (event.gamma === null || event.beta === null) return;
      if (!tilting) { tilting = true; root.classList.remove('fx-ambient'); }
      if (!on || !cover.classList.contains('is-live')) { zero = null; return; }
      if (!zero) zero = [event.gamma, event.beta];
      zero[0] += (event.gamma - zero[0]) * 0.004;
      zero[1] += (event.beta - zero[1]) * 0.004;
      var nx = clamp((event.gamma - zero[0]) / 9), ny = clamp((event.beta - zero[1]) / 9);
      if (Math.abs(nx - sent[0]) + Math.abs(ny - sent[1]) < 0.015) return;   // sensor noise
      sent = [nx, ny];
      reach = 0.7;   // a phone's sky is narrow: the moon stays on the screen
      aim(nx, ny);
    });
    setTimeout(function () { if (!tilting) root.classList.add('fx-ambient'); }, 900);
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

    // 6. The chapter page is "night" once its title, the word "Worlds", has climbed above the middle of the screen
    //    (the top 45%), and paper again on the way back up. A class and nothing else: the stylesheet fades the
    //    page with it under reduced motion, and ignores it where the page really turns.
    var turn = doc.querySelector('.chapter-turn');
    var title = turn && turn.querySelector('.chapter-name');
    if (title) {
      new IntersectionObserver(function (entries) {
        var entry = entries[entries.length - 1];
        turn.classList.toggle('is-night', entry.isIntersecting || entry.boundingClientRect.top < 0);
      }, { rootMargin: '0px 0px -55% 0px' }).observe(title);
    }

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
