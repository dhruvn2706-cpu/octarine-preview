/* The only JavaScript on this site, and it is here for one reason: the four
   numbers should count up as they arrive on screen, and CSS cannot do that.
   A timed animation runs on page load, long before anyone scrolls down to them.
   The scroll-driven alternative, `animation-timeline: view()`, is the thing the
   note in style.css already warned about - it reports as supported and then has
   no effect.

   A rect check on scroll rather than an IntersectionObserver: it is synchronous
   and has no dependency on the page's visibility state, so it behaves the same
   whether the tab is foregrounded, restored from bfcache, or printed to.

   Each number re-arms once it has left the viewport, so scrolling away and back
   - in either direction - runs the count again rather than showing a number
   that is already finished.

   Without this file the numbers still read correctly: the CSS in head.php rests
   at the final value, so no-JS and reduced-motion visitors see 5,037+ rather
   than watching it arrive. */
(function () {
  var els = [].slice.call(document.querySelectorAll('.count[data-final]'));
  if (!els.length || !window.requestAnimationFrame) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function slot(el) {                          // .count--2  ->  2
    var m = /count--(\d+)/.exec(el.className);
    return m ? +m[1] : null;
  }

  var items = [];
  for (var i = 0; i < els.length; i++) {
    var n = slot(els[i]);
    if (n !== null) items.push({ el: els[i], n: n, counted: false, token: 0 });
  }
  if (!items.length) return;

  function run(item) {
    var el     = item.el,
        target = parseInt(el.getAttribute('data-final'), 10) || 0,
        prop   = '--n' + item.n,
        delay  = item.n * 150,                 // the four resolve in sequence
        dur    = 1500,
        t0     = null,
        mine   = ++item.token;                 // a newer run supersedes this one

    function land() {
      if (item.token !== mine) return;
      el.style.setProperty(prop, target);
    }
    // A timer guarantees the final value even if rAF never runs, so a throttled
    // or backgrounded tab can never strand a 0 on screen.
    setTimeout(land, delay + dur + 500);
    el.style.setProperty(prop, 0);

    (function step(now) {
      if (item.token !== mine) return;         // superseded, stop quietly
      if (t0 === null) t0 = now;
      var p = (now - t0 - delay) / dur;
      if (p < 0) { requestAnimationFrame(step); return; }
      if (p >= 1) { land(); return; }
      el.style.setProperty(prop, Math.round(target * (1 - Math.pow(1 - p, 3))));
      requestAnimationFrame(step);
    })(performance.now());
  }

  function sweep() {
    var vh = window.innerHeight || 0;
    for (var i = 0; i < items.length; i++) {
      var it = items[i], r = it.el.getBoundingClientRect();
      var visible = r.bottom > 0 && r.top < vh * 0.9;
      // Clear of the viewport by a margin before re-arming, so hovering on the
      // boundary cannot make it restart over and over.
      var gone    = r.bottom < -60 || r.top > vh + 60;
      if (visible && !it.counted) { it.counted = true; run(it); }
      else if (gone && it.counted) { it.counted = false; }
    }
  }

  addEventListener('scroll', sweep, { passive: true });
  addEventListener('resize', sweep);
  sweep();                                     // in case they are already in view
})();

/* Before/after slider.
   The divider position lives in a custom property so the CSS does the drawing;
   this only copies the range's value into it. Without this the frame still
   reads correctly - CSS defaults --pos to 50%, so it shows an even split. */
(function () {
  var frames = document.querySelectorAll('.compare');
  for (var i = 0; i < frames.length; i++) {
    (function (frame) {
      var range = frame.querySelector('.compare-range');
      if (!range) return;
      function apply() { frame.style.setProperty('--pos', range.value + '%'); }
      range.addEventListener('input', apply);
      range.addEventListener('change', apply);
      apply();
    })(frames[i]);
  }
})();
