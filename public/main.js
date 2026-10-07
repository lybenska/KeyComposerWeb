// KeyComposer landing — page behavior. No dependencies.
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  // ── Ad landing helpers ──────────────────────────────────
  var query = new URLSearchParams(location.search);

  // Message match: ?v=files | pitch | keynote swaps the hero copy (variants are inlined by the page).
  var variant = window.heroVariants && window.heroVariants[query.get('v')];
  if (variant) {
    document.getElementById('hero-l1').textContent = variant.l1;
    document.getElementById('hero-l2').textContent = variant.l2;
    document.getElementById('hero-sub').textContent = variant.sub;
  }

  // Attribution: carry the page's utm_* parameters into every Setapp link, so the store sees the campaign.
  var utm = [];
  query.forEach(function (v, k) { if (/^utm_/i.test(k)) utm.push([k, v]); });
  if (utm.length) {
    document.querySelectorAll('a[href*=".setapp.com"], a[href*="//setapp.com"]').forEach(function (a) {
      var u = new URL(a.href);
      utm.forEach(function (kv) { u.searchParams.set(kv[0], kv[1]); });
      a.href = u.toString();
    });
  }

  // ── Nav ─────────────────────────────────────────────────
  var nav = document.getElementById('nav');
  var navCta = nav.querySelector('.nav-cta');
  var heroCta = document.getElementById('hero-cta');

  // The nav CTA appears only after the hero CTA scrolls away.
  new IntersectionObserver(function (entries) {
    var hidden = !entries[0].isIntersecting;
    nav.classList.toggle('show-cta', hidden);
    navCta.tabIndex = hidden ? 0 : -1;
    navCta.setAttribute('aria-hidden', hidden ? 'false' : 'true');
  }, { rootMargin: '-64px 0px 0px 0px' }).observe(heroCta);

  // Burger menu (tablet and phone). Closes on a link, the backdrop, Escape, or a resize past the breakpoint.
  var burger = document.getElementById('nav-burger');
  var backdrop = document.getElementById('nav-backdrop');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  backdrop.addEventListener('click', function () { setMenu(false); });
  nav.querySelectorAll('.nav-links a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 1080 && nav.classList.contains('is-open')) setMenu(false); });

  var links = Array.prototype.slice.call(nav.querySelectorAll('.nav-links a:not(.nav-menu-cta)'));
  var sectionObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) sectionObs.observe(s); });
  // Back at the hero, no section is current.
  window.addEventListener('scroll', function () {
    if (window.scrollY < 200) links.forEach(function (a) { a.classList.remove('is-active'); });
  }, { passive: true });

  // ── Scroll reveal ───────────────────────────────────────
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); revealObs.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el); });

  // ── Hero stage: prompt → streamed slides → editor ───────
  var stage = document.getElementById('stage');
  var scenes = {};
  stage.querySelectorAll('.scene').forEach(function (s) { scenes[s.dataset.scene] = s; });
  var typed = document.getElementById('typed');
  var send = document.getElementById('send');
  var label = document.getElementById('stage-label');
  var status = stage.querySelector('.status');
  var slides = stage.querySelectorAll('.sl');
  var prompt = 'Seed round pitch for an AI notes app';

  var stageVisible = true, wake = null;
  new IntersectionObserver(function (entries) {
    stageVisible = entries[0].isIntersecting;
    if (stageVisible && wake) { wake(); wake = null; }
  }).observe(stage);
  function whenVisible() { return stageVisible ? Promise.resolve() : new Promise(function (r) { wake = r; }); }

  function show(name, text) {
    Object.keys(scenes).forEach(function (k) { scenes[k].classList.toggle('is-active', k === name); });
    label.textContent = text;
  }
  function setStatus(text) { status.lastChild.textContent = text; }

  async function loop() {
    for (;;) {
      await whenVisible();
      typed.textContent = '';
      slides.forEach(function (s) { s.classList.remove('is-in'); });
      setStatus('Designing your theme…');
      show('compose', 'Describe');
      await sleep(700);
      for (var i = 1; i <= prompt.length; i++) {
        typed.textContent = prompt.slice(0, i);
        await sleep(42 + Math.random() * 40);
      }
      await sleep(500);
      send.classList.add('is-pressed');
      await sleep(260);
      send.classList.remove('is-pressed');

      show('stream', 'Generating');
      await sleep(700);
      setStatus('Writing slides…');
      for (var k = 0; k < slides.length; k++) {
        slides[k].classList.add('is-in');
        await sleep(380);
      }
      setStatus('Finalizing…');
      await sleep(1000);

      show('editor', 'Ready to edit');
      await sleep(4200);
    }
  }
  if (reduced) {
    slides.forEach(function (s) { s.classList.add('is-in'); });
    show('editor', 'Ready to edit');
  } else {
    loop();
  }

  // ── How it works: sticky screenshot follows the active step ──
  var shots = document.querySelectorAll('.how-shot');
  var stepEls = document.querySelectorAll('.how-step');
  var stepObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var i = Number(e.target.dataset.step);
      stepEls.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      shots.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
    });
  // A 10%-tall band around the exact centre of the viewport: a step becomes active when it crosses it.
  }, { rootMargin: '-45% 0px -45% 0px' });
  stepEls.forEach(function (s) { stepObs.observe(s); });

  // ── Stats count-up ──────────────────────────────────────
  var countObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      countObs.unobserve(e.target);
      var el = e.target, target = Number(el.dataset.count), suffix = el.dataset.suffix || '', t0 = performance.now(), dur = 1100;
      if (reduced) return;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: .6 });
  document.querySelectorAll('.stat-n').forEach(function (el) { countObs.observe(el); });

  // ── Slide reel lightbox ─────────────────────────────────
  var lb = document.getElementById('lightbox');
  if (lb && typeof lb.showModal === 'function') {
    var lbImg = document.getElementById('lb-img');
    var lbCap = document.getElementById('lb-cap');
    var reelItems = Array.prototype.slice.call(document.querySelectorAll('.reel-set:first-child .reel-item'));
    var cur = 0;
    function showSlide(i) {
      cur = (i + reelItems.length) % reelItems.length;
      var img = reelItems[cur].querySelector('img');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = 'Slide ' + (cur + 1) + ' of ' + reelItems.length + ' · ' + img.alt;
    }
    document.querySelectorAll('.reel-item').forEach(function (b) {
      b.addEventListener('click', function () { showSlide(Number(b.dataset.index)); lb.showModal(); });
    });
    lb.querySelector('.lb-prev').addEventListener('click', function () { showSlide(cur - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { showSlide(cur + 1); });
    lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
    // Drop focus from the card that opened the lightbox, so the reel resumes right away.
    lb.addEventListener('close', function () { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') showSlide(cur + 1);
      if (e.key === 'ArrowLeft') showSlide(cur - 1);
    });
  }

  // ── Closing banner: prompts typed one after another, only while on screen ──
  var ct = document.getElementById('closing-typed');
  if (ct && !reduced) {
    var prompts = JSON.parse(ct.dataset.prompts || '[]');
    var ctVisible = false, ctWake = null;
    new IntersectionObserver(function (entries) {
      ctVisible = entries[0].isIntersecting;
      if (ctVisible && ctWake) { ctWake(); ctWake = null; }
    }).observe(ct);
    // Each turn deletes whatever is shown (the pre-rendered prompt first), then types the next one.
    (async function () {
      var k = 0;
      for (;;) {
        if (!ctVisible) await new Promise(function (r) { ctWake = r; });
        await sleep(1900);
        var shown = ct.textContent;
        for (var d = shown.length - 1; d >= 0; d--) { ct.textContent = shown.slice(0, d); await sleep(12); }
        await sleep(320);
        k = (k + 1) % prompts.length;
        var p = prompts[k];
        for (var i = 1; i <= p.length; i++) { ct.textContent = p.slice(0, i); await sleep(38 + Math.random() * 34); }
      }
    })();
  }
})();
