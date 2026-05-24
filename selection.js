/**
 * ASC Hub — Selection Page v2.1 (bug-fixed)
 * - Validasi benar
 * - Step navigation smooth
 * - Download card via Canvas
 * - Reset form lengkap
 */

(function () {
  'use strict';

  var currentStep    = 1;
  var TOTAL_STEPS    = 8;
  var selectedSkills = [];
  var formData       = {};

  /* ── NEXT ── */
  window.nextStep = function(from) {
    if (!validateStep(from)) return;
    collectData(from);
    if (from === TOTAL_STEPS - 1) buildReview();
    gotoStep(from + 1);
  };

  /* ── PREV ── */
  window.prevStep = function(from) {
    gotoStep(from - 1);
  };

  /* ── GOTO ── */
  function gotoStep(to) {
    var cur = document.getElementById('step-' + currentStep);
    var nxt = document.getElementById('step-' + to);
    if (!nxt) return;
    if (cur) cur.classList.remove('active');
    nxt.classList.add('active');
    currentStep = to;
    updateDots();
    var fc = document.getElementById('form-container');
    if (fc) fc.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── DOTS ── */
  function updateDots() {
    for (var i = 1; i <= TOTAL_STEPS; i++) {
      var dot = document.getElementById('sdot-' + i);
      var con = document.getElementById('scon-' + i);
      if (!dot) continue;
      dot.classList.remove('active', 'done');
      if (i < currentStep)       { dot.classList.add('done');   if (con) con.classList.add('done'); }
      else if (i === currentStep) { dot.classList.add('active'); }
      else                        { if (con) con.classList.remove('done'); }
    }
  }

  /* ── VALIDATE ── */
  function validateStep(step) {
    var rules = {
      1: function() { var v = val('field-nama');     if (!v) { shake('field-nama'); toast('Masukkan nama lengkap!'); return false; } return true; },
      2: function() { var v = val('field-username'); if (!v) { shake('field-username'); toast('Masukkan username TikTok!'); return false; } return true; },
      3: function() {
        var v = parseInt(val('field-umur'), 10);
        if (isNaN(v) || v < 10 || v > 99) { shake('field-umur'); toast('Masukkan umur yang valid (10–99)!'); return false; }
        return true;
      },
      4: function() { var v = val('field-kota'); if (!v) { shake('field-kota'); toast('Masukkan asal / kota!'); return false; } return true; },
      5: function() { var v = val('field-alasan'); if (v.length < 20) { shake('field-alasan'); toast('Tulis alasan minimal 20 karakter!'); return false; } return true; },
      6: function() { if (!selectedSkills.length) { toast('Pilih minimal 1 skill!'); return false; } return true; },
      7: function() { return true; }
    };
    return rules[step] ? rules[step]() : true;
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function shake(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth; // reflow
    el.classList.add('shake');
    setTimeout(function() { el.classList.remove('shake'); }, 600);
  }

  function toast(msg) {
    var t = document.getElementById('asc-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'asc-toast';
      t.className = 'asc-toast';
      document.body.appendChild(t);
    }
    t.textContent = '⚠ ' + msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function() { t.classList.remove('show'); }, 2800);
  }

  /* ── COLLECT DATA ── */
  function collectData(step) {
    var map = { 1: 'nama', 2: 'username', 3: 'umur', 4: 'kota', 5: 'alasan' };
    if (map[step]) formData[map[step]] = val('field-' + map[step]);
    if (step === 6) formData.skills = selectedSkills.slice();
  }

  /* ── SKILL TOGGLE ── */
  window.toggleSkill = function(skill) {
    var idx = selectedSkills.indexOf(skill);
    var el  = document.querySelector('[data-skill="' + skill + '"]');
    if (!el) return;
    if (idx === -1) { selectedSkills.push(skill); el.classList.add('selected'); }
    else            { selectedSkills.splice(idx, 1); el.classList.remove('selected'); }
  };

  /* ── PHOTO PREVIEW ── */
  window.previewPhoto = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      var img = document.getElementById('preview-img');
      var box = document.getElementById('photo-preview');
      if (img) img.src = ev.target.result;
      if (box) box.style.display = 'flex';
      formData.photo = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  /* ── REVIEW ── */
  function buildReview() {
    var el = document.getElementById('review-summary');
    if (!el) return;
    var rows = [
      ['NAMA',    formData.nama    || '—'],
      ['TIKTOK',  formData.username || '—'],
      ['UMUR',    (formData.umur   || '—') + (formData.umur ? ' tahun' : '')],
      ['KOTA',    formData.kota    || '—'],
      ['SKILL',   (formData.skills || []).join(', ') || '—'],
      ['ALASAN',  (formData.alasan || '').substring(0,120) + ((formData.alasan||'').length > 120 ? '…' : '')]
    ];
    el.innerHTML = rows.map(function(r) {
      return '<div style="display:flex;gap:12px;padding:8px 0;border-bottom:1px solid rgba(0,245,255,0.06);">' +
        '<span style="font-family:\'Share Tech Mono\',monospace;font-size:0.65rem;letter-spacing:2px;color:var(--cyan);min-width:70px;">' + r[0] + '</span>' +
        '<span style="color:rgba(220,220,255,0.85);font-size:0.85rem;">' + r[1] + '</span>' +
        '</div>';
    }).join('');
  }

  /* ── SUBMIT ── */
  window.submitForm = function() {
    collectData(currentStep);
    var id = 'ASC-' + String(Math.floor(Math.random() * 9000000 + 1000000));

    // Sembunyikan form, tampilkan card
    var fc = document.getElementById('form-container');
    var rc = document.getElementById('member-card-result');
    if (fc) fc.style.display = 'none';
    if (rc) {
      rc.style.display = 'block';
      rc.scrollIntoView({ behavior: 'smooth' });
    }

    // Isi card
    setHtml('result-name',     formData.nama || '—');
    setHtml('result-username', (formData.username || '').startsWith('@') ? formData.username : '@' + (formData.username || ''));
    setHtml('result-id',       'ID: ' + id);
    setHtml('result-city',     formData.kota ? '📍 ' + formData.kota : '');
    setHtml('result-age',      formData.umur ? '🎂 ' + formData.umur + ' tahun' : '');

    // Avatar
    var av = document.getElementById('result-avatar');
    if (av) {
      if (formData.photo) {
        av.innerHTML = '<img src="' + formData.photo + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
      } else {
        av.textContent = (formData.nama || '?').charAt(0).toUpperCase();
      }
    }

    // Skills / Roles
    var rolesEl  = document.getElementById('result-roles');
    var skillsEl = document.getElementById('result-skills-display');
    if (rolesEl)  rolesEl.innerHTML  = '';
    if (skillsEl) skillsEl.innerHTML = '';
    (formData.skills || []).forEach(function(s) {
      var chip = '<span class="member-role-badge">' + s + '</span>';
      if (rolesEl)  rolesEl.insertAdjacentHTML('beforeend', chip);
      if (skillsEl) skillsEl.insertAdjacentHTML('beforeend', chip);
    });
  };

  function setHtml(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  /* ── DOWNLOAD CARD (Canvas PNG) ── */
  window.downloadCard = function() {
    var cvs  = document.createElement('canvas');
    cvs.width = 640; cvs.height = 380;
    var c = cvs.getContext('2d');

    // Background
    var bg = c.createLinearGradient(0, 0, 640, 380);
    bg.addColorStop(0, '#060820'); bg.addColorStop(1, '#10002a');
    c.fillStyle = bg; c.fillRect(0, 0, 640, 380);

    // Scanlines overlay
    for (var y = 0; y < 380; y += 4) {
      c.fillStyle = 'rgba(0,245,255,0.012)';
      c.fillRect(0, y, 640, 2);
    }

    // Border glow
    c.strokeStyle = '#00f5ff'; c.lineWidth = 2;
    c.shadowBlur  = 20; c.shadowColor = '#00f5ff';
    c.strokeRect(4, 4, 632, 372);
    c.shadowBlur  = 0;

    // Corner decorations
    var corners = [[8,8],[624,8],[8,364],[624,364]];
    corners.forEach(function(pt) {
      c.beginPath(); c.arc(pt[0], pt[1], 4, 0, Math.PI*2);
      c.fillStyle = '#00f5ff'; c.fill();
    });

    // Header bar
    c.fillStyle = 'rgba(0,245,255,0.06)';
    c.fillRect(8, 8, 624, 38);
    c.fillStyle = '#00f5ff'; c.font = 'bold 10px monospace'; c.textAlign = 'center';
    c.fillText('⭐ ASTRONOMY SPACE COMMUNITY ⭐', 320, 32);
    c.textAlign = 'left';

    // Divider
    c.fillStyle = 'rgba(0,245,255,0.15)';
    c.fillRect(20, 50, 600, 1);

    // Avatar circle
    c.beginPath(); c.arc(96, 182, 58, 0, Math.PI*2);
    c.strokeStyle = '#00f5ff'; c.lineWidth = 2;
    c.shadowBlur  = 16; c.shadowColor = '#00f5ff'; c.stroke(); c.shadowBlur = 0;
    c.fillStyle = 'rgba(0,245,255,0.1)'; c.fill();
    c.fillStyle = '#ffffff'; c.font = 'bold 42px Orbitron,sans-serif'; c.textAlign = 'center';
    c.fillText((formData.nama || '?').charAt(0).toUpperCase(), 96, 198);
    c.textAlign = 'left';

    // Name
    c.shadowBlur  = 12; c.shadowColor = '#00f5ff';
    c.fillStyle = '#ffffff'; c.font = 'bold 22px Orbitron,sans-serif';
    c.fillText(formData.nama || '—', 180, 132);
    c.shadowBlur = 0;

    // Username
    c.fillStyle = '#00f5ff'; c.font = '14px monospace';
    c.fillText((formData.username||'').startsWith('@') ? formData.username : '@'+(formData.username||''), 180, 158);

    // Details
    c.fillStyle = 'rgba(180,185,230,0.6)'; c.font = '12px monospace';
    if (formData.kota) c.fillText('📍 ' + formData.kota, 180, 182);
    if (formData.umur) c.fillText('🎂 ' + formData.umur + ' tahun', 180, 202);

    // Skills
    if ((formData.skills||[]).length) {
      c.fillStyle = '#bf00ff'; c.font = '11px monospace';
      c.fillText('🔧 ' + formData.skills.join(' · '), 180, 226);
    }

    // Bottom divider
    c.fillStyle = 'rgba(0,245,255,0.1)'; c.fillRect(20, 310, 600, 1);

    // ID
    var idText = document.getElementById('result-id');
    c.fillStyle = 'rgba(0,245,255,0.4)'; c.font = '10px monospace';
    c.fillText(idText ? idText.textContent : 'ASC-XXXXXXX', 24, 336);

    // Timestamp
    c.fillStyle = 'rgba(180,185,230,0.3)'; c.font = '9px monospace';
    c.fillText('Joined: ' + new Date().toDateString(), 24, 352);

    // Status badge
    c.fillStyle = 'rgba(0,245,255,0.08)';
    var bw = 200, bh = 28, bx = 420, by = 322;
    c.fillRect(bx, by, bw, bh);
    c.strokeStyle = 'rgba(0,245,255,0.35)'; c.lineWidth = 1; c.strokeRect(bx, by, bw, bh);
    c.fillStyle = '#00f5ff'; c.font = 'bold 9px monospace'; c.textAlign = 'center';
    c.fillText('✓  ACCEPTED BY ASC SYSTEM', bx + bw/2, by + 18);
    c.textAlign = 'left';

    // Watermark
    c.fillStyle = 'rgba(0,245,255,0.2)'; c.font = '8px monospace'; c.textAlign = 'right';
    c.fillText('Made by cahy144hz • ASC Hub v2.1', 620, 368);

    // Download
    var a = document.createElement('a');
    a.href     = cvs.toDataURL('image/png');
    a.download = 'ASC-MemberCard-' + (formData.nama || 'Member').replace(/\s/g,'_') + '.png';
    a.click();
  };

  /* ── RESET ── */
  window.resetForm = function() {
    currentStep    = 1;
    selectedSkills = [];
    formData       = {};

    for (var i = 1; i <= TOTAL_STEPS; i++) {
      var el = document.getElementById('step-' + i);
      if (el) el.classList.remove('active');
    }
    var s1 = document.getElementById('step-1');
    if (s1) s1.classList.add('active');

    document.querySelectorAll('.form-input').forEach(function(el) { el.value = ''; });
    document.querySelectorAll('.skill-item').forEach(function(el) { el.classList.remove('selected'); });

    var pp = document.getElementById('photo-preview');
    if (pp) pp.style.display = 'none';

    var fc = document.getElementById('form-container');
    var rc = document.getElementById('member-card-result');
    if (fc) fc.style.display = 'block';
    if (rc) rc.style.display = 'none';

    updateDots();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── DRAG & DROP UPLOAD ── */
  var zone = document.getElementById('upload-zone');
  if (zone) {
    zone.addEventListener('dragover', function(e) {
      e.preventDefault(); zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', function() {
      zone.classList.remove('drag-over');
    });
    zone.addEventListener('drop', function(e) {
      e.preventDefault(); zone.classList.remove('drag-over');
      var file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        window.previewPhoto({ target: { files: [file] } });
      }
    });
  }

})();
