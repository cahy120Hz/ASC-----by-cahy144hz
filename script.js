/**
 * ASC Hub — SCRIPT.JS v2.1 (bug-fixed)
 * - Tab education berfungsi
 * - Data load + build grid berfungsi
 * - switchPage tidak skip saat page sama
 * - enterWebsite tidak double-call
 */

(function () {
  'use strict';

  /* ════════════════════════════════
     STATE
  ════════════════════════════════ */
  var State = {
    currentPage: 'home',
    data: null,
    dataLoaded: false,
    educationInited: false,
  };

  /* ════════════════════════════════
     DATA LOADER
  ════════════════════════════════ */
  function loadData(cb) {
    if (State.dataLoaded) { if (cb) cb(); return; }
    fetch('./data/facts.json')
      .then(function(r){ return r.json(); })
      .then(function(d){
        State.data      = d;
        State.dataLoaded = true;
        window._facts   = d.facts   || [];
        window._planets = d.planets || [];
        buildAll();
        if (cb) cb();
      })
      .catch(function(e){
        console.warn('facts.json fallback:', e.message);
        window._facts   = [
          'Alam semesta berumur sekitar 13.8 miliar tahun.',
          'Ada lebih banyak bintang dari butiran pasir di seluruh pantai di Bumi.',
          'Cahaya dari Matahari butuh 8 menit 20 detik untuk sampai ke Bumi.',
          'Lubang hitam terbesar: TON 618, massanya 66 miliar kali Matahari.',
          'Saturnus bisa mengapung di air karena densitasnya lebih rendah dari air!'
        ];
        window._planets = [
          {name:'Merkurius',emoji:'☿',desc:'Planet terkecil & tercepat.',distance:'57.9 juta km',diameter:'4,879 km',moons:0,day:'59 hari Bumi',year:'88 hari Bumi',temp:'-180°C ~ 430°C'},
          {name:'Venus',emoji:'♀',desc:'Planet terpanas di Tata Surya.',distance:'108.2 juta km',diameter:'12,104 km',moons:0,day:'243 hari Bumi',year:'225 hari Bumi',temp:'465°C rata-rata'},
          {name:'Bumi',emoji:'🌍',desc:'Satu-satunya planet dengan kehidupan.',distance:'149.6 juta km',diameter:'12,742 km',moons:1,day:'24 jam',year:'365.25 hari',temp:'-88°C ~ 58°C'},
          {name:'Mars',emoji:'♂',desc:'Planet Merah, target kolonisasi.',distance:'227.9 juta km',diameter:'6,779 km',moons:2,day:'24j 37m',year:'687 hari Bumi',temp:'-125°C ~ 20°C'},
          {name:'Jupiter',emoji:'♃',desc:'Planet terbesar di Tata Surya.',distance:'778.5 juta km',diameter:'139,820 km',moons:95,day:'10 jam',year:'12 tahun Bumi',temp:'-110°C'},
          {name:'Saturnus',emoji:'♄',desc:'Planet bercincin yang memukau.',distance:'1.43 miliar km',diameter:'116,460 km',moons:146,day:'10.7 jam',year:'29 tahun Bumi',temp:'-140°C'},
          {name:'Uranus',emoji:'⛢',desc:'Planet miring 98°, terdingin.',distance:'2.87 miliar km',diameter:'50,724 km',moons:27,day:'17 jam',year:'84 tahun Bumi',temp:'-224°C'},
          {name:'Neptunus',emoji:'♆',desc:'Planet paling berangin (2100 km/jam).',distance:'4.49 miliar km',diameter:'49,244 km',moons:16,day:'16 jam',year:'165 tahun Bumi',temp:'-200°C'}
        ];
        State.dataLoaded = true;
        buildAll();
        if (cb) cb();
      });
  }

  /* ════════════════════════════════
     BUILD ALL DYNAMIC CONTENT
  ════════════════════════════════ */
  function buildAll() {
    buildPlanetsGrid();
    buildNews();
    buildArticles();
    buildTimeline();
  }

  function buildPlanetsGrid() {
    var grid = document.getElementById('planet-grid-dynamic');
    if (!grid || !window._planets || !window._planets.length) return;
    grid.innerHTML = window._planets.map(function(p, i){
      return '<div class="planet-card" onclick="showPlanetInfo(' + i + ')">'
        + '<div class="planet-emoji">' + p.emoji + '</div>'
        + '<div class="planet-name">' + p.name + '</div>'
        + '<div class="planet-detail">' + p.desc + '</div>'
        + '</div>';
    }).join('');
  }

  function buildNews() {
    var grid = document.getElementById('news-grid-dynamic');
    if (!grid || !State.data || !State.data.news) return;
    grid.innerHTML = State.data.news.map(function(n){
      return '<div class="news-card">'
        + '<div class="news-cat">' + n.category + '</div>'
        + '<div class="news-icon">' + n.icon + '</div>'
        + '<div class="news-title">' + n.title + '</div>'
        + '<div class="news-desc">' + n.desc + '</div>'
        + '<div class="news-date">📅 ' + n.date + '</div>'
        + '</div>';
    }).join('');
  }

  function buildArticles() {
    var grid = document.getElementById('articles-grid-dynamic');
    if (!grid || !State.data || !State.data.articles) return;
    grid.innerHTML = State.data.articles.map(function(a){
      return '<div class="article-card">'
        + '<div class="article-thumb">' + a.icon + '</div>'
        + '<div class="article-body">'
        + '<div class="article-cat">' + a.category + '</div>'
        + '<div class="article-title">' + a.title + '</div>'
        + '<div class="article-desc">' + a.desc + '</div>'
        + '<div class="article-read">⏱ ' + a.readTime + ' baca</div>'
        + '</div></div>';
    }).join('');
  }

  function buildTimeline() {
    var tl = document.getElementById('timeline-dynamic');
    if (!tl || !State.data || !State.data.timeline) return;
    tl.innerHTML = State.data.timeline.map(function(t){
      return '<div class="timeline-item">'
        + '<div class="timeline-dot"></div>'
        + '<div class="timeline-year">' + t.year + '</div>'
        + '<div class="timeline-event">' + t.event + '</div>'
        + '<div class="timeline-desc">' + t.desc + '</div>'
        + '</div>';
    }).join('');
  }

  /* ════════════════════════════════
     PAGE NAVIGATION
  ════════════════════════════════ */
  window.switchPage = function (page) {
    // Hapus active dari semua page & nav btn
    document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
    document.querySelectorAll('.nav-btn').forEach(function(b){ b.classList.remove('active'); });

    var target = document.getElementById('page-' + page);
    if (!target) return;

    target.classList.add('active');
    State.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Init education saat pertama dibuka
    if (page === 'education') {
      loadData(function(){
        if (!State.educationInited && window.initEducation) {
          window.initEducation();
          State.educationInited = true;
        }
      });
    }

    // Tutup mobile nav
    var navLinks = document.getElementById('nav-links');
    if (navLinks) navLinks.classList.remove('open');
  };

  /* ════════════════════════════════
     EDU TAB SWITCHING
  ════════════════════════════════ */
  window.switchTab = function (tab) {
    document.querySelectorAll('.edu-tab').forEach(function(t){ t.classList.remove('active'); });
    document.querySelectorAll('.edu-panel').forEach(function(p){ p.classList.remove('active'); });

    var btn = document.querySelector('[data-tab="' + tab + '"]');
    if (btn) btn.classList.add('active');

    var panel = document.getElementById('panel-' + tab);
    if (panel) panel.classList.add('active');
  };

  // Delegasi klik tab (supaya tidak ada konflik)
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-tab]');
    if (btn) {
      e.preventDefault();
      window.switchTab(btn.getAttribute('data-tab'));
    }
  });

  /* ════════════════════════════════
     NAVBAR SCROLL EFFECT
  ════════════════════════════════ */
  window.addEventListener('scroll', function() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });

  /* ════════════════════════════════
     MOBILE NAV TOGGLE
  ════════════════════════════════ */
  window.toggleNav = function () {
    var nl = document.getElementById('nav-links');
    if (nl) nl.classList.toggle('open');
  };

  /* ════════════════════════════════
     COUNTER ANIMATION
  ════════════════════════════════ */
  function animateCounter(id, target, suffix) {
    suffix = suffix || '';
    var el = document.getElementById(id);
    if (!el) return;
    var val = 0;
    var step = target / (1800 / 16);
    var timer = setInterval(function() {
      val = Math.min(target, val + step);
      el.textContent = Math.floor(val).toLocaleString() + suffix;
      if (val >= target) clearInterval(timer);
    }, 16);
  }

  function runCounters() {
    animateCounter('cnt-members',  300, '++');
    animateCounter('cnt-stars',    150, '+');
    animateCounter('cnt-articles', 16, '+');
    animateCounter('cnt-tools',    8, '+');
  }

  /* ════════════════════════════════
     ENTER WEBSITE
  ════════════════════════════════ */
  window.enterWebsite = function () {
    var modal = document.getElementById('welcome-modal');
    if (modal) modal.classList.remove('show');
    runCounters();
    loadData();
  };

  /* Referensi untuk loading.js */
  window.ASCApp = { init: window.enterWebsite };

  /* ════════════════════════════════
     KEYBOARD SHORTCUTS
  ════════════════════════════════ */
  document.addEventListener('keydown', function(e) {
    if (e.altKey) {
      if (e.key === '1') window.switchPage('home');
      if (e.key === '2') window.switchPage('selection');
      if (e.key === '3') window.switchPage('education');
    }
  });

  /* ════════════════════════════════
     SCROLL REVEAL (manual, karena konten dinamis)
  ════════════════════════════════ */
  function initScrollReveal() {
    if (!window.IntersectionObserver) return;
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.glass-card, .planet-card, .news-card, .article-card').forEach(function(el) {
      if (!el.classList.contains('revealed')) {
        el.classList.add('pre-reveal');
        io.observe(el);
      }
    });
  }

  /* ════════════════════════════════
     DOM READY
  ════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function() {
    // Pre-load data di background
    loadData();
    // Scroll reveal awal
    setTimeout(initScrollReveal, 500);
  });

})();
