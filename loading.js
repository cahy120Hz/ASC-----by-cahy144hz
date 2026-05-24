/**
 * ASC Hub — Loading Screen v2.1 (bug-fixed)
 * - Progress smooth & pasti selesai
 * - Tidak stuck di loading
 * - Modal muncul dengan benar setelah loading
 */

(function () {
  'use strict';

  var progress = 0;
  var fillEl   = null;
  var pctEl    = null;
  var loadEl   = null;
  var modalEl  = null;
  var textEl   = null;
  var msgIdx   = 0;
  var done     = false;

  var messages = [
    'Initializing Astronomy Space Community...',
    'Loading star charts...',
    'Connecting to NASA servers...',
    'Calibrating telemetry systems...',
    'Syncing ISS position data...',
    'ASC System Ready!'
  ];

  /* ── PROGRESS TICK ── */
  function tick() {
    if (done) return;
    var inc = Math.random() * 2.8 + 0.5;
    progress = Math.min(100, progress + inc);

    if (fillEl) fillEl.style.width = progress + '%';
    if (pctEl)  pctEl.textContent  = Math.floor(progress) + '%';

    if (progress >= 100) {
      done = true;
      if (fillEl) fillEl.style.width = '100%';
      if (pctEl)  pctEl.textContent  = '100%';
      setTimeout(finishLoading, 500);
      return;
    }
    setTimeout(tick, 30 + Math.random() * 50);
  }

  /* ── FINISH: sembunyikan loading, tampilkan modal ── */
  function finishLoading() {
    if (loadEl) {
      loadEl.style.opacity    = '0';
      loadEl.style.visibility = 'hidden';
      loadEl.style.pointerEvents = 'none';
    }
    setTimeout(function() {
      if (modalEl) modalEl.classList.add('show');
    }, 700);
  }

  /* ── SCAN LINES ── */
  function addScanLines() {
    if (!loadEl) return;
    for (var i = 0; i < 2; i++) {
      var line = document.createElement('div');
      line.className = 'scan-line';
      line.style.animationDelay = (i * 1.5) + 's';
      loadEl.appendChild(line);
    }
  }

  /* ── CYCLING TEXT ── */
  function cycleText() {
    if (!textEl || done) return;
    textEl.style.opacity = '0';
    setTimeout(function() {
      if (textEl) {
        textEl.textContent = messages[msgIdx % messages.length];
        textEl.style.opacity = '1';
      }
      msgIdx++;
      if (!done) setTimeout(cycleText, 1500);
    }, 280);
  }

  /* ── ENTER WEBSITE (tombol modal) ── */
  window.enterWebsite = function () {
    if (modalEl) modalEl.classList.remove('show');
    if (window.ASCApp && window.ASCApp.init) {
      window.ASCApp.init();
    }
  };

  /* ── INIT ── */
  function init() {
    fillEl  = document.getElementById('progress-fill');
    pctEl   = document.getElementById('progress-pct');
    loadEl  = document.getElementById('loading-screen');
    modalEl = document.getElementById('welcome-modal');
    textEl  = document.getElementById('loading-text');

    addScanLines();
    setTimeout(function() {
      tick();
      cycleText();
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
