/* Halley Geceleri — ses. Bütün sesler Web Audio ile bu deneyim için üretilir (kayıt kullanılmaz).
   Mesafe: alçak geçiren süzgeç + yankı oranı. Ortam: oda, açık hava, su kıyısı, matbaa, kahvehane, ev.
   Dönem ve konum için doğrulanmamış araç sesleri kullanılmaz. Ayrıntı: docs/04-kamera-ses-plani.md */
'use strict';
(function () {
  let ctx = null, master, comp, reverbs = {}, amb = {}, enabled = false, musicBus, sfxBus;
  const noiseBuf = {};
  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    master = ctx.createGain(); master.gain.value = 0; master.connect(comp); comp.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = 0.55; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(master);
    reverbs.room = makeReverb(0.7, 3.2); reverbs.hall = makeReverb(1.6, 2.4); reverbs.open = makeReverb(3.2, 1.6);
    for (const k in reverbs) reverbs[k].connect(master);
    return ctx;
  }
  function noise(kind = 'pink', secs = 4) {
    if (noiseBuf[kind]) return noiseBuf[kind];
    const n = ctx.sampleRate * secs, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, last = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'white') d[i] = w;
      else if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else { b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.12; }
    }
    return (noiseBuf[kind] = b);
  }
  function makeReverb(secs, decay) {
    const n = Math.floor(ctx.sampleRate * secs), b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
    const conv = ctx.createConvolver(); conv.buffer = b; const g = ctx.createGain(); g.gain.value = 0.5; conv.connect(g);
    return { input: conv, connect: d => g.connect(d) };
  }
  function src(kind, loop = true) { const s = ctx.createBufferSource(); s.buffer = noise(kind); s.loop = loop; s.loopStart = Math.random(); return s; }
  function out(node, dry, wet, space) {
    const d = ctx.createGain(); d.gain.value = dry; node.connect(d); d.connect(sfxBus);
    if (wet && reverbs[space]) { const w = ctx.createGain(); w.gain.value = wet; node.connect(w); w.connect(reverbs[space].input); }
  }

  /* ---------- ortam sesleri ---------- */
  const BUILD = {
    room() { // oda tonu
      const s = src('brown'), f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 220; const g = ctx.createGain(); g.gain.value = 0.10;
      s.connect(f); f.connect(g); out(g, 1, 0.1, 'room'); s.start(); return { g, stop: t => s.stop(t) };
    },
    water(params = {}) { // uzak su: dalga şapırtısı
      const g = ctx.createGain(); g.gain.value = params.gain || 0.16; const parts = [];
      for (const fq of [380, 620, 900]) {
        const s = src('pink'), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fq; bp.Q.value = 1.1;
        const am = ctx.createGain(); am.gain.value = 0.3; const l = ctx.createOscillator(); l.frequency.value = 0.11 + Math.random() * 0.2; const lg = ctx.createGain(); lg.gain.value = 0.28;
        l.connect(lg); lg.connect(am.gain); s.connect(bp); bp.connect(am); am.connect(g); s.start(); l.start(); parts.push(s, l);
      }
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = params.far ? 700 : 2400; g.connect(lp); out(lp, 1, 0.25, 'open');
      return { g, lp, stop: t => parts.forEach(p => p.stop(t)) };
    },
    wind() {
      const s = src('pink'), f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 0.4; const g = ctx.createGain(); g.gain.value = 0.06;
      const l = ctx.createOscillator(); l.frequency.value = 0.07; const lg = ctx.createGain(); lg.gain.value = 260; l.connect(lg); lg.connect(f.frequency);
      s.connect(f); f.connect(g); out(g, 1, 0.3, 'open'); s.start(); l.start(); return { g, stop: t => { s.stop(t); l.stop(t); } };
    },
    press() { // matbaa: makine ritmi (genel mekanik ses; makine modeli belirtilmez)
      const g = ctx.createGain(); g.gain.value = 0.0; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1600; g.connect(lp); out(lp, 0.8, 0.5, 'hall');
      const s = src('pink'), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 300; bp.Q.value = 0.8; const wg = ctx.createGain(); wg.gain.value = 0.25;
      s.connect(bp); bp.connect(wg); wg.connect(g); s.start();
      let alive = true; const tick = () => { if (!alive) return; const t = ctx.currentTime; thump(g, t, 70, 0.5); click(g, t + 0.42, 0.18); setTimeout(tick, 860); }; tick();
      return { g, stop: t => { alive = false; s.stop(t); } };
    },
    cafe() { // kahvehane: uzak konuşma uğultusu
      const g = ctx.createGain(); g.gain.value = 0.0; const parts = [];
      for (let k = 0; k < 5; k++) {
        const s = src('pink'), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 280 + k * 170; bp.Q.value = 3;
        const am = ctx.createGain(); am.gain.value = 0; const l = ctx.createOscillator(); l.type = 'triangle'; l.frequency.value = 3.2 + k * 0.7; const lg = ctx.createGain(); lg.gain.value = 0.09;
        const l2 = ctx.createOscillator(); l2.frequency.value = 0.13 + k * 0.05; const l2g = ctx.createGain(); l2g.gain.value = 0.08;
        l.connect(lg); lg.connect(am.gain); l2.connect(l2g); l2g.connect(am.gain); s.connect(bp); bp.connect(am); am.connect(g); s.start(); l.start(); l2.start(); parts.push(s, l, l2);
      }
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500; g.connect(lp); out(lp, 0.8, 0.4, 'room');
      let alive = true; const cl = () => { if (!alive) return; if (Math.random() < 0.6) clink(g, ctx.currentTime); setTimeout(cl, 2500 + Math.random() * 5000); }; cl();
      return { g, stop: t => { alive = false; parts.forEach(p => p.stop(t)); } };
    },
    clock() { // ev: duvar saati
      const g = ctx.createGain(); g.gain.value = 0.0; out(g, 1, 0.2, 'room');
      let alive = true, k = 0; const tk = () => { if (!alive) return; click(g, ctx.currentTime, k++ % 2 ? 0.06 : 0.09, 2600 + (k % 2) * 400); setTimeout(tk, 1000); }; tk();
      return { g, stop: () => { alive = false; } };
    },
    street() { // akşam: uzak sokak (insan sesleri; atlı tramvay nalı — 1910’da tramvaylar atlıdır)
      const g = ctx.createGain(); g.gain.value = 0.0; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; g.connect(lp); out(lp, 0.6, 0.6, 'open');
      let alive = true;
      const hooves = () => { if (!alive) return; const t = ctx.currentTime; for (let i = 0; i < 16; i++) click(g, t + i * 0.19 + (i % 2) * 0.04, 0.05 * (1 - Math.abs(i - 8) / 9), 1700); setTimeout(hooves, 14000 + Math.random() * 16000); };
      setTimeout(hooves, 4000);
      const voices = BUILD.cafe(); voices.g.gain.value = 0.25; voices.g.disconnect(); voices.g.connect(g);
      return { g, stop: t => { alive = false; voices.stop(t); } };
    },
    birds() { // şafak: serçe cıvıltısı (genel, seyrek)
      const g = ctx.createGain(); g.gain.value = 0.0; out(g, 0.6, 0.6, 'open'); let alive = true;
      const chirp = () => { if (!alive) return; const t = ctx.currentTime; const n = 2 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) { const o = ctx.createOscillator(), e = ctx.createGain(); o.frequency.setValueAtTime(3600 + Math.random() * 800, t + i * 0.12); o.frequency.exponentialRampToValueAtTime(2400, t + i * 0.12 + 0.07); e.gain.setValueAtTime(0, t + i * 0.12); e.gain.linearRampToValueAtTime(0.05, t + i * 0.12 + 0.01); e.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 0.08); o.connect(e); e.connect(g); o.start(t + i * 0.12); o.stop(t + i * 0.12 + 0.1); } setTimeout(chirp, 1500 + Math.random() * 6000); };
      chirp(); return { g, stop: () => { alive = false; } };
    }
  };
  function thump(dest, t, f, a) { const o = ctx.createOscillator(), e = ctx.createGain(); o.frequency.setValueAtTime(f * 1.8, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.08); e.gain.setValueAtTime(a, t); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); o.connect(e); e.connect(dest); o.start(t); o.stop(t + 0.32); }
  function click(dest, t, a, f = 2200) { const s = src('white', false), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 2; const e = ctx.createGain(); e.gain.setValueAtTime(a, t); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); s.connect(bp); bp.connect(e); e.connect(dest); s.start(t, Math.random()); s.stop(t + 0.06); }
  function clink(dest, t) { for (const f of [2950, 4410]) { const o = ctx.createOscillator(), e = ctx.createGain(); o.frequency.value = f + Math.random() * 60; e.gain.setValueAtTime(0.025, t); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); o.connect(e); e.connect(dest); o.start(t); o.stop(t + 0.55); } }

  /* ---------- tekil sesler ---------- */
  const SFX = {
    paperDrop() { const t = ctx.currentTime; const s = src('white', false), hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900; const e = ctx.createGain();
      e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(0.5, t + 0.01); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.35); s.connect(hp); hp.connect(e); out(e, 1, 0.25, 'room'); s.start(t); s.stop(t + 0.4);
      const g = ctx.createGain(); out(g, 1, 0.2, 'room'); thump(g, t + 0.005, 110, 0.35); },
    rustle(len = 1.2) { const t = ctx.currentTime; for (let i = 0; i < 7; i++) { const s = src('white', false), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2500 + Math.random() * 3000; bp.Q.value = 0.7; const e = ctx.createGain(); const st = t + Math.random() * len;
      e.gain.setValueAtTime(0, st); e.gain.linearRampToValueAtTime(0.10 + Math.random() * 0.1, st + 0.02); e.gain.exponentialRampToValueAtTime(0.0001, st + 0.12 + Math.random() * 0.15); s.connect(bp); bp.connect(e); out(e, 1, 0.2, 'room'); s.start(st, Math.random()); s.stop(st + 0.35); } },
    steps(n = 4, surface = 'wood', gap = 0.55) { const t = ctx.currentTime; const g = ctx.createGain(); out(g, 0.9, surface === 'stone' ? 0.45 : 0.25, surface === 'stone' ? 'hall' : 'room');
      for (let i = 0; i < n; i++) { thump(g, t + i * gap, surface === 'wood' ? 95 : 140, 0.28); click(g, t + i * gap + 0.01, surface === 'wood' ? 0.06 : 0.12, surface === 'wood' ? 900 : 2600); } },
    shutter() { const t = ctx.currentTime, g = ctx.createGain(); out(g, 1, 0.15, 'open'); click(g, t, 0.25, 1500); click(g, t + 0.05, 0.12, 900); },
    slide() { const t = ctx.currentTime; const s = src('pink', false), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200; const e = ctx.createGain(); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(0.18, t + 0.05); e.gain.linearRampToValueAtTime(0, t + 0.4); s.connect(bp); bp.connect(e); out(e, 1, 0.2, 'room'); s.start(t); s.stop(t + 0.45); },
    window() { const t = ctx.currentTime; const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(140, t); o.frequency.linearRampToValueAtTime(95, t + 0.8);
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 8; const e = ctx.createGain(); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(0.03, t + 0.1); e.gain.linearRampToValueAtTime(0, t + 0.85);
      o.connect(bp); bp.connect(e); out(e, 1, 0.3, 'room'); o.start(t); o.stop(t + 0.9); },
    whistle(far = true) { // vapur düdüğü — uzak
      const t = ctx.currentTime + 0.1, g = ctx.createGain(); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = far ? 600 : 1800; g.connect(lp); out(lp, far ? 0.25 : 0.6, 0.9, 'open');
      for (const f of [196, 247]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const e = ctx.createGain(); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(0.06, t + 0.3); e.gain.setValueAtTime(0.06, t + 2.2); e.gain.linearRampToValueAtTime(0, t + 3.0); o.connect(e); e.connect(g); o.start(t); o.stop(t + 3.1); } },
    match() { const t = ctx.currentTime; const s = src('white', false), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3200; const e = ctx.createGain(); e.gain.setValueAtTime(0.0, t); e.gain.linearRampToValueAtTime(0.25, t + 0.02); e.gain.exponentialRampToValueAtTime(0.03, t + 0.25); e.gain.exponentialRampToValueAtTime(0.0001, t + 1.2); s.connect(bp); bp.connect(e); out(e, 1, 0.2, 'room'); s.start(t); s.stop(t + 1.3); },
    tick() { const g = ctx.createGain(); out(g, 1, 0.3, 'open'); click(g, ctx.currentTime, 0.08, 3000); },
    applause(level = 0.5) { // uzak damlardan alkış: dağınık el çırpmaları, mesafeyle süzülmüş (temsilî)
      const t0 = ctx.currentTime, g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1700; g.gain.value = level; g.connect(lp); out(lp, 0.5, 1.0, 'open');
      for (let i = 0; i < 160; i++) { const t = t0 + Math.pow(Math.random(), 0.8) * 6.5, env = Math.sin(Math.PI * Math.min(1, (t - t0) / 6.5)); click(g, t, 0.05 + 0.09 * env * Math.random(), 1000 + Math.random() * 1400); } }
  };

  /* ---------- müzik: tek motif, üç ruh hâli ---------- */
  function pluck(f, t, a = 0.18, dur = 2.6) {
    const n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0), p = Math.max(2, Math.round(ctx.sampleRate / f));
    const ring = new Float32Array(p); for (let i = 0; i < p; i++) ring[i] = Math.random() * 2 - 1;
    for (let i = 0; i < n; i++) { const k = i % p, nx = (k + 1) % p; const v = ring[k]; ring[k] = 0.4985 * (ring[k] + ring[nx]); d[i] = v; }
    const s = ctx.createBufferSource(); s.buffer = b; const e = ctx.createGain(); e.gain.setValueAtTime(a, t); e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; s.connect(lp); lp.connect(e); e.connect(musicBus);
    const w = ctx.createGain(); w.gain.value = 0.6; e.connect(w); w.connect(reverbs.hall.input); s.start(t);
  }
  function breath(f, t, dur, a = 0.05) { // ney benzeri nefes: sinüs + bant geçiren gürültü
    const o = ctx.createOscillator(); o.frequency.value = f; const vib = ctx.createOscillator(); vib.frequency.value = 4.6; const vg = ctx.createGain(); vg.gain.value = f * 0.006; vib.connect(vg); vg.connect(o.frequency);
    const e = ctx.createGain(); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(a, t + dur * 0.3); e.gain.linearRampToValueAtTime(a * 0.8, t + dur * 0.7); e.gain.linearRampToValueAtTime(0, t + dur);
    const s = src('white', false), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * 2; bp.Q.value = 6; const ng = ctx.createGain(); ng.gain.value = 0.35;
    o.connect(e); s.connect(bp); bp.connect(ng); ng.connect(e); e.connect(musicBus); const w = ctx.createGain(); w.gain.value = 0.8; e.connect(w); w.connect(reverbs.hall.input);
    o.start(t); vib.start(t); s.start(t); o.stop(t + dur + 0.1); vib.stop(t + dur + 0.1); s.stop(t + dur + 0.1);
  }
  const D4 = 293.66, F4 = 349.23, E4 = 329.63, A3 = 220, C4 = 261.63, Eb4 = 311.13, G4 = 392, Bb3 = 233.08;
  const MOTIF = {
    merak() { const t = ctx.currentTime + 0.05; [[D4, 0], [F4, 0.7], [E4, 1.4], [A3 * 2, 2.4]].forEach(([f, d]) => pluck(f, t + d, 0.16)); },
    tedirgin() { const t = ctx.currentTime + 0.05; [[D4, 0], [Eb4, 0.9], [D4, 1.8], [A3, 2.9]].forEach(([f, d]) => pluck(f, t + d, 0.13, 3.2)); breath(A3 / 2 * 2, t + 0.5, 4.5, 0.025); },
    sakin() { const t = ctx.currentTime + 0.05; [[D4, 0], [F4, 0.9], [E4, 1.8], [D4, 3.0]].forEach(([f, d]) => pluck(f, t + d, 0.14, 3.6)); breath(D4, t + 1.2, 6, 0.03); breath(A3, t + 1.8, 6, 0.02); },
    son() { const t = ctx.currentTime + 0.05; [[A3, 0], [D4, 1.1], [F4, 2.2], [E4, 3.3], [D4, 4.8]].forEach(([f, d]) => pluck(f, t + d, 0.13, 4)); breath(D4 / 2 * 2, t + 2.5, 8, 0.028); }
  };

  /* ---------- dışa açık arayüz ---------- */
  const API = {
    get enabled() { return enabled; },
    async enable() { if (!ensure()) return false; await ctx.resume(); enabled = true; master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 1.5); return true; },
    disable() { if (!ctx) return; enabled = false; master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6); },
    /* sahne ortamı: { room:0.5, water:0.2, ... } — hedef seviyelere yumuşak geçiş */
    scene(levels, fade = 2) {
      if (!ctx || !enabled) { API._pending = levels; return; }
      const t = ctx.currentTime;
      for (const k in levels) if (!amb[k] && BUILD[k] && levels[k] > 0) { amb[k] = BUILD[k](levels[k + 'Opt']); amb[k].g.gain.value = 0; }
      for (const k in amb) {
        const v = levels[k] || 0, g = amb[k].g.gain; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(v * (k === 'water' ? 0.35 : k === 'press' ? 0.6 : k === 'cafe' ? 0.5 : k === 'clock' ? 1 : k === 'street' ? 0.6 : k === 'birds' ? 1 : 0.4), t + fade);
        if (k === 'water' && amb[k].lp) amb[k].lp.frequency.linearRampToValueAtTime(levels.waterNear ? 2400 : 700, t + fade);
      }
    },
    sfx(name, ...a) { if (ctx && enabled && SFX[name]) SFX[name](...a); },
    motif(name) { if (ctx && enabled && MOTIF[name]) MOTIF[name](); },
    resumePending() { if (API._pending) { const p = API._pending; API._pending = null; API.scene(p, 1); } }
  };
  window.Sound = API;
})();
