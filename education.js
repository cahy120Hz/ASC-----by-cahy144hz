/**
 * ASC Hub — Education Hub v2.1 (bug-fixed)
 * - APOD load dengan fallback gambar nyata
 * - ISS tracker auto-start
 * - AI chat berfungsi penuh
 * - Semua tools berfungsi
 * - Planet info popup fix
 */

(function () {
  'use strict';

  /* ══════════════════════════════
     NASA APOD
  ══════════════════════════════ */
  var apodLoaded = false;

  function loadAPOD() {
    if (apodLoaded) return;
    var wrap = document.getElementById('apod-content');
    if (!wrap) return;

    wrap.innerHTML = '<div class="apod-loading"><div class="spin-ring"></div><p>Fetching NASA APOD...</p></div>';

    fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        renderAPOD(data);
        apodLoaded = true;
      })
      .catch(function() {
        renderAPOD({
          title: 'The Pillars of Creation — James Webb Space Telescope',
          date: new Date().toISOString().slice(0, 10),
          explanation: 'The Eagle Nebula\'s Pillars of Creation adalah salah satu gambar paling ikonik dalam sejarah astronomi. Diabadikan ulang oleh James Webb Space Telescope dalam inframerah, pilar-pilar gas dan debu ini terbentang beberapa tahun cahaya dan berfungsi sebagai tempat lahirnya bintang baru. Radiasi dari bintang-bintang muda mengikis dan membentuk kontur dramatis yang memesona ini.',
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg/600px-Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg',
          media_type: 'image',
          copyright: 'NASA / ESA / STScI'
        });
        apodLoaded = true;
      });
  }

  function renderAPOD(data) {
    var wrap = document.getElementById('apod-content');
    if (!wrap) return;
    var isImg = data.media_type !== 'video';
    var imgHtml = isImg
      ? '<img src="' + (data.url || '') + '" alt="' + (data.title || '') + '" loading="lazy" onerror="this.src=\'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg/600px-Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg\'">'
      : '<div class="apod-video-notice">🎬 Video APOD — <a href="' + data.url + '" target="_blank" rel="noopener">Buka di sini</a></div>';

    wrap.innerHTML =
      '<div class="apod-img">' + imgHtml + '</div>' +
      '<div class="apod-info">' +
        '<div class="apod-tag">📷 NASA — ASTRONOMY PICTURE OF THE DAY</div>' +
        '<div class="apod-title">' + (data.title || '—') + '</div>' +
        '<div class="apod-date">📅 ' + (data.date || '') + '</div>' +
        '<div class="apod-text">' + (data.explanation || '') + '</div>' +
        (data.copyright ? '<div class="apod-copy">© ' + data.copyright + '</div>' : '') +
        (data.hdurl ? '<a href="' + data.hdurl + '" target="_blank" rel="noopener" class="apod-hd-btn">🔍 VIEW HD IMAGE</a>' : '') +
      '</div>';
  }

  /* ══════════════════════════════
     ISS TRACKER
  ══════════════════════════════ */
  var issStarted = false;
  var issLng = -122.4;

  function startISS() {
    if (issStarted) return;
    issStarted = true;
    setInterval(updateISS, 2000);
    updateISS();
  }

  function updateISS() {
    var t   = Date.now() / 1000;
    var per = 92.68 * 60;
    var ang = (t % per) / per * 2 * Math.PI;
    var lat = 51.6 * Math.sin(ang);
    issLng  = ((issLng + 0.44) % 360);
    var lngFinal = issLng > 180 ? issLng - 360 : issLng;
    var alt = (408 + Math.sin(t * 0.007) * 1.5).toFixed(1);
    var vel = (7.66 + Math.sin(t * 0.003) * 0.01).toFixed(3);

    setVal('iss-lat',  (lat >= 0 ? '+' : '') + lat.toFixed(4) + '°');
    setVal('iss-lng',  (lngFinal >= 0 ? '+' : '') + lngFinal.toFixed(4) + '°');
    setVal('iss-alt',  alt + ' km');
    setVal('iss-vel',  vel + ' km/s');
    setVal('iss-time', new Date().toUTCString().replace('GMT','UTC').split(' ').slice(4).join(' '));
  }

  function setVal(id, v) {
    var el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  /* ══════════════════════════════
     PLANET INFO POPUP
  ══════════════════════════════ */
  window.showPlanetInfo = function(idx) {
    var popup = document.getElementById('planet-info-popup');
    if (!popup || !window._planets) return;
    var p = window._planets[idx];
    if (!p) return;

    popup.style.display = 'block';
    popup.innerHTML =
      '<button onclick="closePlanetInfo()" class="planet-close-btn">✕ TUTUP</button>' +
      '<div class="planet-detail-grid">' +
        '<div class="planet-big-emoji">' + p.emoji + '</div>' +
        '<div>' +
          '<div class="planet-detail-name">' + p.name + '</div>' +
          '<div class="planet-detail-desc">' + p.desc + '</div>' +
          '<div class="planet-stats-grid">' +
            '<div class="planet-stat"><span class="ps-label">JARAK</span><span class="ps-val">' + (p.distance||'—') + '</span></div>' +
            '<div class="planet-stat"><span class="ps-label">DIAMETER</span><span class="ps-val">' + (p.diameter||'—') + '</span></div>' +
            '<div class="planet-stat"><span class="ps-label">BULAN</span><span class="ps-val">' + (p.moons||0) + '</span></div>' +
            '<div class="planet-stat"><span class="ps-label">HARI</span><span class="ps-val">' + (p.day||'—') + '</span></div>' +
            '<div class="planet-stat"><span class="ps-label">TAHUN</span><span class="ps-val">' + (p.year||'—') + '</span></div>' +
            '<div class="planet-stat"><span class="ps-label">SUHU</span><span class="ps-val">' + (p.temp||'—') + '</span></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    popup.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  window.closePlanetInfo = function() {
    var popup = document.getElementById('planet-info-popup');
    if (popup) popup.style.display = 'none';
  };

  /* ══════════════════════════════
     AI CHATBOT
  ══════════════════════════════ */
  var KB = {
    planet:   'Tata Surya kita punya 8 planet: Merkurius, Venus, Bumi, Mars, Jupiter, Saturnus, Uranus, dan Neptunus. Pluto kini diklasifikasikan sebagai planet katai. 🪐',
    bintang:  'Bintang adalah bola plasma raksasa yang menghasilkan energi lewat fusi nuklir. Matahari kita adalah bintang tipe G bersuhu permukaan ~5.778 K. ⭐',
    bulan:    'Bulan berjarak ~384.400 km dari Bumi. Neil Armstrong menginjakkan kaki di Bulan pada 20 Juli 1969! Bulan mempengaruhi pasang surut laut kita. 🌕',
    galaksi:  'Bima Sakti berdiameter ~100.000 tahun cahaya dan berisi 100–400 miliar bintang. Galaksi Andromeda, ~2.5 juta tahun cahaya jauhnya, akan bertabrakan dengan Bima Sakti dalam ~4.5 miliar tahun! 🌌',
    hitam:    'Black hole adalah daerah di mana gravitasi begitu kuat hingga cahaya pun tidak bisa kabur. Lubang hitam terbesar yang diketahui: TON 618 = 66 miliar kali massa Matahari! ⚫',
    mars:     'Mars = Planet Merah, punya Olympus Mons, gunung tertinggi Tata Surya setinggi 22 km. Rover Perseverance NASA masih aktif mengeksplorasi permukaannya hari ini. 🔴',
    asc:      'ASC (Astronomy Space Community) adalah komunitas pecinta astronomi yang berbagi ilmu, konten, dan inspirasi tentang luar angkasa. Kamu bisa daftar via menu SELECTION! 🚀',
    big:      'Big Bang terjadi ~13.8 miliar tahun lalu. Seluruh materi, energi, ruang, dan waktu lahir dari satu singularitas. Alam semesta masih terus mengembang hingga sekarang. 💥',
    webb:     'James Webb Space Telescope diluncurkan 25 Desember 2021. Dengan cermin 6.5 meter dan sensor inframerah, ia bisa melihat galaksi-galaksi pertama yang terbentuk setelah Big Bang. 🔭',
    iss:      'ISS (International Space Station) mengorbit Bumi di ketinggian ~408 km dengan kecepatan 7.66 km/s, menyelesaikan satu orbit setiap ~92 menit. Ada 7 astronaut di dalamnya saat ini! 🛸',
    saturnus: 'Saturnus punya cincin spektakuler dari es dan batu. Densitasnya lebih rendah dari air — bisa mengapung jika ada lautan yang cukup besar! Punya 146 bulan yang diketahui. 🪐',
    default:  [
      'Pertanyaan yang menarik! Ada hal spesifik tentang astronomi yang ingin kamu ketahui lebih dalam? ✨',
      'Alam semesta luasnya 93 miliar tahun cahaya (yang bisa diamati). Kita baru menjelajahi sebagian sangat kecilnya! 🌌',
      'Di ASC, kita berbagi kecintaan terhadap luar angkasa bersama. Punya pertanyaan soal bintang atau planet? Tanyakan saja! ⭐',
      'Tahukah kamu? Cahaya dari bintang yang kamu lihat malam ini mungkin sudah berangkat ribuan tahun lalu — bintang itu mungkin sudah tidak ada! 💫',
      'Setiap atom dalam tubuhmu pernah ada di dalam inti bintang yang meledak. Kita semua literally terbuat dari stardust! 🌟'
    ]
  };

  function pickReply(msg) {
    var lo = msg.toLowerCase();
    if (lo.includes('planet'))                        return KB.planet;
    if (lo.includes('bintang') || lo.includes('star')) return KB.bintang;
    if (lo.includes('bulan')   || lo.includes('moon')) return KB.bulan;
    if (lo.includes('galaksi') || lo.includes('galaxy')) return KB.galaksi;
    if (lo.includes('lubang')  || lo.includes('black hole')) return KB.hitam;
    if (lo.includes('mars'))                          return KB.mars;
    if (lo.includes('asc')     || lo.includes('komunitas')) return KB.asc;
    if (lo.includes('big bang') || lo.includes('big bang')) return KB.big;
    if (lo.includes('webb')    || lo.includes('jwst')) return KB.webb;
    if (lo.includes('iss')     || lo.includes('stasiun')) return KB.iss;
    if (lo.includes('saturn')  || lo.includes('saturnus')) return KB.saturnus;
    return KB.default[Math.floor(Math.random() * KB.default.length)];
  }

  window.sendAIMsg = function() {
    var inp = document.getElementById('ai-input');
    if (!inp) return;
    var msg = inp.value.trim();
    if (!msg) return;
    inp.value = '';

    appendMsg('user', msg);

    // Typing indicator
    var typId = 'typing-' + Date.now();
    var msgs  = document.getElementById('ai-messages');
    if (msgs) {
      msgs.insertAdjacentHTML('beforeend',
        '<div class="ai-msg" id="' + typId + '">' +
          '<div class="ai-avatar bot">🤖</div>' +
          '<div class="ai-bubble bot"><div class="typing-dots"><span></span><span></span><span></span></div></div>' +
        '</div>'
      );
      msgs.scrollTop = msgs.scrollHeight;
    }

    setTimeout(function() {
      var el = document.getElementById(typId);
      if (el) el.remove();
      appendMsg('bot', pickReply(msg));
    }, 800 + Math.random() * 800);
  };

  function appendMsg(role, text) {
    var msgs = document.getElementById('ai-messages');
    if (!msgs) return;
    var isBot = role === 'bot';
    msgs.insertAdjacentHTML('beforeend',
      '<div class="ai-msg' + (isBot ? '' : ' user') + '">' +
        '<div class="ai-avatar ' + (isBot ? 'bot' : 'user-av') + '">' + (isBot ? '🤖' : 'U') + '</div>' +
        '<div class="ai-bubble ' + role + '">' + text + '</div>' +
      '</div>'
    );
    msgs.scrollTop = msgs.scrollHeight;
  }

  // Enter key AI input
  var aiInp = document.getElementById('ai-input');
  if (aiInp) {
    aiInp.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') window.sendAIMsg();
    });
  }

  /* ══════════════════════════════
     CALCULATOR
  ══════════════════════════════ */
  var cv = '0', op = null, prev = null, resetNext = false;

  function cd() {
    var el = document.getElementById('calc-display');
    if (el) el.textContent = cv;
  }

  window.calcNum = function(n) {
    if (resetNext) { cv = ''; resetNext = false; }
    if (cv === '0' && n !== '.') cv = '';
    if (n === '.' && cv.includes('.')) return;
    cv = (cv + n).slice(0, 14);
    cd();
  };
  window.calcOp = function(o) {
    prev = parseFloat(cv); op = o; resetNext = true;
  };
  window.calcEquals = function() {
    if (op === null) return;
    var cur = parseFloat(cv), r;
    if (op === '+') r = prev + cur;
    else if (op === '-') r = prev - cur;
    else if (op === '*') r = prev * cur;
    else if (op === '/') r = cur === 0 ? 'ERR:DIV0' : prev / cur;
    cv = String(r); op = null; cd();
  };
  window.calcClear   = function() { cv = '0'; op = null; prev = null; cd(); };
  window.calcSign    = function() { cv = String(-parseFloat(cv)); cd(); };
  window.calcPercent = function() { cv = String(parseFloat(cv) / 100); cd(); };
  window.calcDot     = function() { if (!cv.includes('.')) { cv += '.'; cd(); } };

  /* ══════════════════════════════
     UNIT CONVERTER
  ══════════════════════════════ */
  var toKm = { km: 1, mi: 1.60934, au: 149597870.7, ly: 9.46073e12, pc: 3.08568e13 };

  window.doConvert = function() {
    var v    = parseFloat(document.getElementById('conv-input').value);
    var from = document.getElementById('conv-from').value;
    var to   = document.getElementById('conv-to').value;
    var res  = document.getElementById('conv-result');
    if (!res || isNaN(v)) return;
    var result = (v * toKm[from]) / toKm[to];
    res.textContent = v.toLocaleString() + ' ' + from.toUpperCase() + ' = ' + result.toExponential(5) + ' ' + to.toUpperCase();
  };

  window.swapUnits = function() {
    var f = document.getElementById('conv-from');
    var t = document.getElementById('conv-to');
    if (!f || !t) return;
    var tmp = f.value; f.value = t.value; t.value = tmp;
    window.doConvert();
  };

  /* ══════════════════════════════
     TIME CONVERTER
  ══════════════════════════════ */
  var toSec = { seconds: 1, minutes: 60, hours: 3600, days: 86400, years: 31557600 };

  window.doTimeConvert = function() {
    var v    = parseFloat(document.getElementById('time-input').value);
    var from = document.getElementById('time-from').value;
    var res  = document.getElementById('time-result');
    if (!res || isNaN(v)) return;
    var s = v * toSec[from];
    res.innerHTML =
      '<div class="time-row"><span>Detik</span><span>' + s.toExponential(4) + '</span></div>' +
      '<div class="time-row"><span>Menit</span><span>' + (s/60).toExponential(4) + '</span></div>' +
      '<div class="time-row"><span>Jam</span><span>' + (s/3600).toExponential(4) + '</span></div>' +
      '<div class="time-row"><span>Hari</span><span>' + (s/86400).toExponential(4) + '</span></div>' +
      '<div class="time-row"><span>Tahun</span><span>' + (s/31557600).toExponential(4) + '</span></div>' +
      '<div class="time-row"><span>Abad</span><span>' + (s/3155760000).toExponential(4) + '</span></div>';
  };

  /* ══════════════════════════════
     RANDOM FACTS
  ══════════════════════════════ */
  window.randomFact = function() {
    var el = document.getElementById('fact-display');
    if (!el || !window._facts || !window._facts.length) return;
    el.style.opacity = '0';
    setTimeout(function() {
      el.textContent = window._facts[Math.floor(Math.random() * window._facts.length)];
      el.style.opacity = '1';
      el.style.transition = 'opacity 0.4s';
    }, 300);
  };

  /* ══════════════════════════════
     MINI TERMINAL
  ══════════════════════════════ */
  var CMDS = {
    help:    'Commands: help · about · date · time · clear · echo [text] · facts · members · version · calc [expr]',
    about:   'ASC Selection & Education Hub v2.1\nAstronomy Space Community — The Future of Stars',
    date:    function() { return '📅 ' + new Date().toDateString(); },
    time:    function() { return '🕐 ' + new Date().toLocaleTimeString() + ' (local)'; },
    facts:   function() { return window._facts ? window._facts[Math.floor(Math.random()*window._facts.length)] : 'No facts loaded.'; },
    members: '👥 ASC Active Members: 2,847 — growing every day!',
    version: '⚡ ASC Terminal v2.1.0 — Built for stargazers ✨'
  };

  window.runTermCmd = function() {
    var inp = document.getElementById('term-input');
    if (!inp) return;
    var raw = inp.value.trim();
    inp.value = '';
    if (!raw) return;

    var out  = document.getElementById('term-output');
    var term = document.getElementById('terminal');
    var parts = raw.split(' ');
    var base  = parts[0];
    var args  = parts.slice(1);
    var reply;

    if (base === 'clear')  { if (out) out.innerHTML = ''; return; }
    if (base === 'echo')   { reply = args.join(' ') || '(empty)'; }
    else if (base === 'calc') {
      try { reply = '= ' + Function('"use strict";return(' + args.join(' ') + ')')(); }
      catch(_) { reply = 'Error: invalid expression'; }
    } else if (CMDS[base]) {
      reply = typeof CMDS[base] === 'function' ? CMDS[base]() : CMDS[base];
    } else {
      reply = 'Command not found: "' + base + '". Type "help" for commands.';
    }

    if (out) {
      out.insertAdjacentHTML('beforeend',
        '<div style="color:rgba(200,200,255,0.4);margin-top:4px;">▶ ' + raw + '</div>' +
        '<div style="color:#00ff88;margin-bottom:4px;">' + (reply || '') + '</div>'
      );
    }
    if (term) term.scrollTop = term.scrollHeight;
  };

  var termInp = document.getElementById('term-input');
  if (termInp) {
    termInp.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') window.runTermCmd();
    });
  }

  /* ══════════════════════════════
     NOTES APP
  ══════════════════════════════ */
  var notesEl = document.getElementById('notes-area');
  if (notesEl) {
    var saved = '';
    try { saved = localStorage.getItem('asc-notes-v2') || ''; } catch(_) {}
    if (saved) {
      notesEl.value = saved;
      var cntEl = document.getElementById('notes-count');
      if (cntEl) cntEl.textContent = saved.length + ' karakter';
    }
    notesEl.addEventListener('input', function() {
      try { localStorage.setItem('asc-notes-v2', notesEl.value); } catch(_) {}
      var cnt = document.getElementById('notes-count');
      if (cnt) cnt.textContent = notesEl.value.length + ' karakter';
    });
  }

  window.clearNotes = function() {
    if (!confirm('Hapus semua catatan?')) return;
    if (notesEl) notesEl.value = '';
    try { localStorage.removeItem('asc-notes-v2'); } catch(_) {}
    var cnt = document.getElementById('notes-count');
    if (cnt) cnt.textContent = '0 karakter';
  };

  /* ══════════════════════════════
     SEARCH
  ══════════════════════════════ */
  window.doSearch = function() {
    var q = (document.getElementById('edu-search') || {}).value || '';
    q = q.trim().toLowerCase();
    if (!q) {
      // Reset semua
      document.querySelectorAll('.news-card, .article-card, .planet-card').forEach(function(el) {
        el.style.opacity = '1'; el.style.borderColor = '';
      });
      return;
    }
    document.querySelectorAll('.news-card, .article-card, .planet-card').forEach(function(el) {
      var match = el.textContent.toLowerCase().includes(q);
      el.style.opacity     = match ? '1' : '0.25';
      el.style.borderColor = match ? 'var(--cyan)' : '';
    });
  };

  var srchInp = document.getElementById('edu-search');
  if (srchInp) {
    srchInp.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') window.doSearch();
    });
    srchInp.addEventListener('input', function() {
      if (!srchInp.value) window.doSearch();
    });
  }

  /* ══════════════════════════════
     INIT (dipanggil dari script.js)
  ══════════════════════════════ */
  window.initEducation = function() {
    loadAPOD();
    startISS();
  };

})();
