/**
 * ASC Hub — Particles & Effects v2.1
 * - Custom cursor DIHAPUS (pakai default browser)
 * - Star field + shooting stars
 * - Mouse parallax pada floating orbs
 * - Scroll reveal via IntersectionObserver
 * - Click sound ringan
 */

(function () {
  'use strict';

  /* ═══════════════════════════════
     STAR FIELD CANVAS
  ═══════════════════════════════ */
  var canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, stars = [], shooting = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    stars = [];
    var count = Math.floor((W * H) / 5500);
    var colors = ['#00f5ff', '#bf00ff', '#ffffff', '#00ff88', '#7b68ee'];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.2,
        dx: (Math.random() - 0.5) * 0.1,
        dy: (Math.random() - 0.5) * 0.1,
        alpha: Math.random() * 0.7 + 0.2,
        aDir: (Math.random() > 0.5 ? 1 : -1) * 0.003,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  /* Shooting star spawner */
  setInterval(function() {
    shooting.push({
      x: Math.random() * W,
      y: Math.random() * H * 0.5,
      len: Math.random() * 110 + 60,
      speed: Math.random() * 5 + 4,
      alpha: 1,
      angle: Math.PI / 5
    });
  }, 4000);

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    /* Stars */
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle   = s.color;
      if (s.r > 0.9) { ctx.shadowBlur = 5; ctx.shadowColor = s.color; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      s.x += s.dx; s.y += s.dy;
      s.alpha += s.aDir;
      if (s.alpha > 0.92 || s.alpha < 0.12) s.aDir *= -1;
      if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
    }

    /* Shooting stars */
    shooting = shooting.filter(function(s){ return s.alpha > 0; });
    for (var j = 0; j < shooting.length; j++) {
      var sh = shooting[j];
      ctx.save();
      ctx.globalAlpha = sh.alpha;
      var g = ctx.createLinearGradient(
        sh.x, sh.y,
        sh.x - Math.cos(sh.angle) * sh.len,
        sh.y - Math.sin(sh.angle) * sh.len
      );
      g.addColorStop(0, '#00f5ff');
      g.addColorStop(1, 'transparent');
      ctx.strokeStyle = g;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(sh.x - Math.cos(sh.angle) * sh.len, sh.y - Math.sin(sh.angle) * sh.len);
      ctx.stroke();
      ctx.restore();
      sh.x += sh.speed; sh.y += sh.speed * 0.38; sh.alpha -= 0.02;
    }

    requestAnimationFrame(drawFrame);
  }

  window.addEventListener('resize', resize);
  resize();
  drawFrame();

  /* Cursor: pakai default browser — tidak ada custom cursor */

  /* ═══════════════════════════════
     MOUSE PARALLAX (floating orbs)
  ═══════════════════════════════ */
  document.addEventListener('mousemove', function(e) {
    var floaters = document.querySelectorAll('.floating-obj');
    var rx = (e.clientX / window.innerWidth  - 0.5) * 8;
    var ry = (e.clientY / window.innerHeight - 0.5) * 8;
    for (var i = 0; i < floaters.length; i++) {
      var d = (i + 1) * 0.2;
      floaters[i].style.transform = 'translate(' + (rx * d) + 'px, ' + (ry * d) + 'px)';
    }
  });

  /* ═══════════════════════════════
     SCROLL REVEAL
  ═══════════════════════════════ */
  if (window.IntersectionObserver) {
    var ioReveal = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          ioReveal.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.glass-card, .planet-card, .news-card, .article-card').forEach(function(el) {
      el.classList.add('pre-reveal');
      ioReveal.observe(el);
    });
  }

  /* ═══════════════════════════════
     CLICK SOUND (ringan, optional)
  ═══════════════════════════════ */
  document.addEventListener('click', function(e) {
    if (!e.target.closest('button')) return;
    try {
      var ac   = new (window.AudioContext || window.webkitAudioContext)();
      var osc  = ac.createOscillator();
      var gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.frequency.value = 880; osc.type = 'sine';
      gain.gain.setValueAtTime(0.05, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.07);
      osc.start(); osc.stop(ac.currentTime + 0.07);
    } catch (_) {}
  });

})();
