/* Halley Geceleri — gökyüzü motoru (Canvas 2D, stereografik izdüşüm).
   Hesaplanan: Halley başı, Güneş, Ay, gezegenler, yıldızlar (Hipparcos), takımyıldız çizgileri.
   Model/temsil: gök parlaklığı, Samanyolu parlaklığı, kuyruk biçimi, manzara dokusu. */
'use strict';
(function () {
  const A = window.Astro, S = A.S, L = window.Landscape;
  const RAD = A.RAD, DEG = A.DEG, clamp = A.clamp;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const mix = (a, b, t) => a + (b - a) * t;

  /* Osmanlıca gezegen adları dönemin basınında kullanılan biçimleriyle; parantezde bugünkü adları */
  const PLANETS = [
    { id: 'Venus', name: 'Zühre', modern: 'Venüs', color: [255, 248, 230] },
    { id: 'Jupiter', name: 'Müşteri', modern: 'Jüpiter', color: [255, 240, 215] },
    { id: 'Mars', name: 'Merih', modern: 'Mars', color: [255, 190, 150] },
    { id: 'Saturn', name: 'Zühal', modern: 'Satürn', color: [255, 232, 190] },
    { id: 'Mercury', name: 'Utarid', modern: 'Merkür', color: [255, 236, 210] }
  ];

  /* B–V renk indeksinden yaklaşık yıldız rengi */
  function bvColor(bv) {
    const t = clamp((bv + 0.3) / 2.1, 0, 1);
    const stops = [[0, [155, 176, 255]], [0.18, [202, 215, 255]], [0.33, [248, 247, 255]], [0.5, [255, 244, 225]], [0.68, [255, 222, 180]], [0.85, [255, 196, 140]], [1, [255, 170, 110]]];
    for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) {
      const f = (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]), a = stops[i - 1][1], b = stops[i][1];
      return [Math.round(mix(a[0], b[0], f)), Math.round(mix(a[1], b[1], f)), Math.round(mix(a[2], b[2], f))];
    }
    return stops[stops.length - 1][1];
  }

  function makeSprite(rgb, size, core) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'), r = size / 2, gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, `rgba(255,255,255,1)`);
    gr.addColorStop(core, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.85)`);
    gr.addColorStop(Math.min(0.95, core * 2.6), `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.16)`);
    gr.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, size, size); return c;
  }

  class Sky {
    constructor(canvas, opts = {}) {
      this.c = canvas; this.g = canvas.getContext('2d', { alpha: false });
      this.ut = A.lmtToUT('1910-05-10T03:30');
      this.vpId = 'teras'; this.az = 88; this.alt = 12; this.fov = 80;
      this.opt = Object.assign({ lines: true, cnames: false, grid: false, labels: true, landmarks: true, refraction: true, landscape: true,
        tailL: 0.3, tail: true, mw: true, twinkle: true, interactive: true, optics: true, quality: 1 }, opts);
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.selected = null; this.picks = []; this.listeners = {};
      this.stars = S.stars; this.nStars = S.stars.length / 4;
      this.starVec = new Float32Array(this.nStars * 3); this.starCol = [];
      for (let i = 0; i < this.nStars; i++) { const v = A.eqVec(S.stars[i * 4], S.stars[i * 4 + 1]); this.starVec.set(v, i * 3); this.starCol.push(Math.min(7, Math.max(0, Math.round((S.stars[i * 4 + 3] + 0.3) / 2.1 * 7)))); }
      this.sprites = []; for (let k = 0; k <= 7; k++) this.sprites.push(makeSprite(bvColor(-0.3 + k / 7 * 2.1), 64, 0.13));
      this.softSprite = makeSprite([210, 225, 220], 64, 0.02);
      this.warmSprite = makeSprite([255, 196, 120], 32, 0.12);
      this.buf = document.createElement('canvas'); this.bctx = this.buf.getContext('2d');
      this.mw = null; this.loadMW();
      this.nameIdx = {}; for (const n of S.starNames) this.nameIdx[n.i] = n;
      this.time0 = performance.now();
      this.resize(); new ResizeObserver(() => { this.resize(); this.draw(); }).observe(canvas);
      if (this.opt.interactive) this.bind();
    }
    on(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); }
    emit(ev, d) { (this.listeners[ev] || []).forEach(f => f(d)); }
    loadMW() {
      if (!window.MILKYWAY) return;
      const img = new Image(); img.onload = () => {
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const g = c.getContext('2d'); g.drawImage(img, 0, 0);
        try { const d = g.getImageData(0, 0, c.width, c.height).data; this.mw = { w: c.width, h: c.height, d: new Uint8Array(c.width * c.height) }; for (let i = 0; i < this.mw.d.length; i++) this.mw.d[i] = d[i * 4]; } catch (e) { this.mw = null; }
        this.draw();
      }; img.src = window.MILKYWAY;
    }
    resize() {
      const r = this.c.getBoundingClientRect(); this.W = Math.max(1, r.width); this.H = Math.max(1, r.height);
      this.dpr = Math.min(window.devicePixelRatio || 1, this.opt.quality < 1 ? 1 : 2);
      this.c.width = Math.round(this.W * this.dpr); this.c.height = Math.round(this.H * this.dpr);
      this.g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      const step = this.opt.quality < 1 ? 7 : 4.5;
      this.bw = Math.ceil(this.W / step); this.bh = Math.ceil(this.H / step);
      this.buf.width = this.bw; this.buf.height = this.bh; this.img = this.bctx.createImageData(this.bw, this.bh);
    }

    /* ---------- kamera ---------- */
    setView(v) { if (v.az !== undefined) this.az = A.wrap360(v.az); if (v.alt !== undefined) this.alt = clamp(v.alt, -35, 89.9); if (v.fov !== undefined) this.fov = clamp(v.fov, 0.5, 200); this.dirty = true; }
    setTime(ut) { this.ut = clamp(ut, A.RANGE.min, A.RANGE.max); this.dirty = true; this.emit('time', this.ut); }
    setViewpoint(id) { this.vpId = id; this.dirty = true; this.emit('viewpoint', id); }
    basis() {
      const F = A.azAltVec(this.az, this.alt), a = this.az * RAD;
      const R = [Math.cos(a), -Math.sin(a), 0];
      const U = [R[1] * F[2] - R[2] * F[1], R[2] * F[0] - R[0] * F[2], R[0] * F[1] - R[1] * F[0]];
      this.F = F; this.R = R; this.U = U;
      this.cx = this.W / 2; this.cy = this.H / 2;
      this.s = (Math.max(this.W, this.H) / 2) / (2 * Math.tan(this.fov * RAD / 4));
    }
    /* yatay birim vektör -> ekran */
    projH(h) {
      const Z = h[0] * this.F[0] + h[1] * this.F[1] + h[2] * this.F[2];
      if (Z < -0.92) return null;
      const X = h[0] * this.R[0] + h[1] * this.R[1] + h[2] * this.R[2], Y = h[0] * this.U[0] + h[1] * this.U[1] + h[2] * this.U[2];
      const k = 2 / (1 + Z);
      return { x: this.cx + X * k * this.s, y: this.cy - Y * k * this.s, z: Z };
    }
    projAA(az, alt) { return this.projH(A.azAltVec(az, alt)); }
    unproj(px, py) {
      const X = (px - this.cx) / this.s, Y = -(py - this.cy) / this.s, r2 = X * X + Y * Y;
      const Z = (4 - r2) / (4 + r2), x = X * (1 + Z) / 2, y = Y * (1 + Z) / 2;
      return [x * this.R[0] + y * this.U[0] + Z * this.F[0], x * this.R[1] + y * this.U[1] + Z * this.F[1], x * this.R[2] + y * this.U[2] + Z * this.F[2]];
    }
    /* görünen yükseklik (kırılmalı) için yatay vektörü düzelt */
    apparent(h) {
      if (!this.opt.refraction) return h;
      const alt = Math.asin(clamp(h[2], -1, 1)) * DEG; const R = A.refraction(alt); if (!R) return h;
      const az = Math.atan2(h[0], h[1]); const a2 = (alt + R) * RAD, c = Math.cos(a2);
      return [c * Math.sin(az), c * Math.cos(az), Math.sin(a2)];
    }
    eqToH(ra, dec) { return this.apparent(A.mul(this.M, A.eqVec(ra, dec))); }

    /* ---------- gökyüzü parlaklık modeli (sanatsal-fiziksel yaklaşım) ---------- */
    skyState() {
      const sun = this.eqToH(this.sunEq.ra, this.sunEq.dec), moon = this.eqToH(this.moonEq.ra, this.moonEq.dec);
      const hs = Math.asin(sun[2]) * DEG, hm = Math.asin(moon[2]) * DEG;
      const tw = smooth(-19, -3, hs), day = smooth(-5, 6, hs);
      const mf = A.bodyFrac('Moon', this.ut);
      const moonL = mf * smooth(-1, 25, hm) * (1 - day);
      this.ss = { sun, moon, hs, hm, tw, day, mf, moonL };
    }
    skyRGB(h, out) {
      const st = this.ss, alt = Math.max(h[2], 0);
      const cg = h[0] * st.sun[0] + h[1] * st.sun[1] + h[2] * st.sun[2];
      const cm = h[0] * st.moon[0] + h[1] * st.moon[1] + h[2] * st.moon[2];
      const altD = Math.asin(alt) * DEG;
      // gece temeli: derin lacivert; ufukta hafif ışık (hava parıltısı + 1910 kent ışığı, temsilî)
      const hz = Math.exp(-altD / 9);
      let r = 0.0014 + 0.0044 * hz, g = 0.0033 + 0.0067 * hz, b = 0.0120 + 0.0070 * hz;
      // alacakaranlık / gündüz
      const tw = st.tw, hs = st.hs;
      const t2 = tw * tw * tw;
      const zen = [mix(0.02, 0.10, st.day), mix(0.05, 0.30, st.day), mix(0.13, 1.05, st.day)];
      const zf = tw * tw * 0.6 * (0.55 + 0.45 * (1 - altD / 90));
      r += zen[0] * zf; g += zen[1] * zf; b += zen[2] * zf;
      const fsun = Math.pow((1 + cg) / 2, 2.4);
      const glow = Math.exp(-altD / (5 + 14 * tw)) * (0.25 + 1.6 * fsun);
      // Güneş yüksekliğine göre ufuk ışıltısı rengi: önce solgun yeşil-mavi, sonra sarı-turuncu, en son gül rengi
      const warm = smooth(-11, -2, hs), rose = smooth(-6, 0, hs) * (1 - smooth(1, 8, hs));
      const gc = [mix(0.10, 0.95, warm) + 0.25 * rose, mix(0.20, 0.62, warm), mix(0.20, 0.30, warm) + 0.12 * rose];
      const gi = Math.pow(tw, 1.8) * 0.8 * (1 - 0.8 * st.day);
      r += gc[0] * glow * gi; g += gc[1] * glow * gi; b += gc[2] * glow * gi;
      // Ay ışığı: tüm göğü maviye çeken saçılım + Ay çevresinde hale
      if (st.moonL > 0.001) {
        const ml = st.moonL; const halo = Math.exp(-Math.acos(clamp(cm, -1, 1)) * DEG / 7) * 0.9 + 0.12;
        r += 0.030 * ml * halo; g += 0.042 * ml * halo; b += 0.075 * ml * halo;
      }
      // gündüz: Güneş çevresi
      if (st.day > 0) { const sg = Math.exp(-Math.acos(clamp(cg, -1, 1)) * DEG / 12) * st.day; r += 0.9 * sg; g += 0.85 * sg; b += 0.7 * sg; const hz2 = Math.exp(-altD / 14) * st.day; r += 0.22 * hz2; g += 0.26 * hz2; b += 0.28 * hz2; }
      out[0] = r; out[1] = g; out[2] = b; return out;
    }
    lum(c) { return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
    /* gökyüzü parlaklığına göre çıplak göz sınır kadiri */
    limitMag(skyL) { return clamp(6.3 - 1.8 * Math.log10(Math.max(1, skyL / 0.0036)), -3, 6.5) + (this.fov < 30 && this.opt.optics ? clamp(Math.log10(30 / this.fov) * 3, 0, 3) : 0); }
    tone(x) { return 255 * Math.pow(1 - Math.exp(-x * 2.4), 1 / 1.75); }

    lumAt(x, y) { const i = Math.min(this.bh - 1, Math.max(0, (y / this.H * this.bh) | 0)) * this.bw + Math.min(this.bw - 1, Math.max(0, (x / this.W * this.bw) | 0)); return this.lumBuf[i]; }
    drawSkyBuffer() {
      const key = [this.az.toFixed(3), this.alt.toFixed(3), this.fov.toFixed(3), Math.round(this.ut / 15000), this.vpId, this.W, this.H, this.opt.mw, this.opt.refraction, !!this.mw].join('|');
      const g0 = this.g;
      if (key === this.bufKey) { g0.imageSmoothingEnabled = true; g0.imageSmoothingQuality = 'high'; g0.drawImage(this.buf, 0, 0, this.W, this.H); return; }
      this.bufKey = key;
      if (!this.lumBuf || this.lumBuf.length !== this.bw * this.bh) this.lumBuf = new Float32Array(this.bw * this.bh);
      const d = this.img.data, bw = this.bw, bh = this.bh, sx = this.W / bw, sy = this.H / bh, c = [0, 0, 0], mw = this.opt.mw ? this.mw : null, M = this.M, LB = this.lumBuf;
      const mwI = 0.010 * (1 - this.ss.tw) * (1 - 0.8 * this.ss.moonL);
      let p = 0;
      for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++, p += 4) {
        const h = this.unproj((i + 0.5) * sx, (j + 0.5) * sy);
        if (h[2] < (this.vpId === 'acik' ? -0.02 : -0.09)) { d[p] = 6; d[p + 1] = 9; d[p + 2] = 14; d[p + 3] = 255; LB[p >> 2] = 0.003; continue; }
        this.skyRGB(h, c); LB[p >> 2] = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
        if (mw && mwI > 0.0005 && h[2] > 0) {
          const e = A.mulT(M, h); let ra = Math.atan2(e[1], e[0]) * DEG; if (ra < 0) ra += 360; const dec = Math.asin(clamp(e[2], -1, 1)) * DEG;
          const v = mw.d[Math.min(mw.h - 1, Math.floor((90 - dec) / 180 * mw.h)) * mw.w + Math.floor(ra / 360 * mw.w) % mw.w] / 255;
          const ext = Math.exp(-0.35 * (A.airmass(Math.asin(h[2]) * DEG) - 1));
          const m = v * v * mwI * ext; c[0] += m * 0.95; c[1] += m * 0.97; c[2] += m * 1.05;
        }
        d[p] = this.tone(c[0]); d[p + 1] = this.tone(c[1]); d[p + 2] = this.tone(c[2]); d[p + 3] = 255;
      }
      this.bctx.putImageData(this.img, 0, 0);
      const g = this.g; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(this.buf, 0, 0, this.W, this.H);
    }

    /* ---------- ana çizim ---------- */
    draw() {
      if (!this.W) return;
      const g = this.g, now = performance.now();
      const vp = L.VIEWPOINTS[this.vpId];
      this.M = A.horizonMatrix(this.ut, vp.lat, vp.lon);
      this.sunEq = A.bodyEq('Sun', this.ut); this.moonEq = A.bodyEq('Moon', this.ut);
      this.basis(); this.skyState(); this.picks = [];
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      this.drawSkyBuffer();
      g.globalCompositeOperation = 'lighter';
      this.drawStars(now);
      g.globalCompositeOperation = 'source-over';
      if (this.opt.lines) this.drawLines();
      if (this.opt.grid) this.drawGrid();
      g.globalCompositeOperation = 'lighter';
      this.drawPlanets(); this.drawHalley();
      g.globalCompositeOperation = 'source-over';
      this.drawMoon(); this.drawSun();
      if (this.opt.landscape) this.drawLandscape(now); else this.drawFlatHorizon();
      if (this.opt.compass !== false) this.drawCompass();
      this.drawLabels();
      if (this.fov < 12 && this.opt.optics) this.drawOptics();
      this.dirty = false; this.emit('draw', this);
    }

    drawStars(now) {
      const g = this.g, M = this.M, v = this.starVec, st = this.stars, c = [0, 0, 0];
      const zoomBoost = clamp(Math.log10(70 / this.fov) * 0.35, 0, 0.7);
      const tw = this.opt.twinkle && !this.reduced, t = now / 1000;
      for (let i = 0; i < this.nStars; i++) {
        const e = [v[i * 3], v[i * 3 + 1], v[i * 3 + 2]];
        let h = [M[0] * e[0] + M[1] * e[1] + M[2] * e[2], M[3] * e[0] + M[4] * e[1] + M[5] * e[2], M[6] * e[0] + M[7] * e[1] + M[8] * e[2]];
        if (h[2] < -0.01) continue;
        const Z = h[0] * this.F[0] + h[1] * this.F[1] + h[2] * this.F[2]; if (Z < 0.05 && this.fov < 150) continue;
        h = this.apparent(h);
        const p = this.projH(h); if (!p || p.x < -10 || p.y < -10 || p.x > this.W + 10 || p.y > this.H + 10) continue;
        const alt = Math.asin(h[2]) * DEG, X = A.airmass(alt);
        const m = st[i * 4 + 2] + 0.28 * (X - 1);
        const lim = this.limitMag(this.lumAt(p.x, p.y));
        if (m > lim) continue;
        let a = clamp((lim - m) / 1.2 + 0.1, 0, 1);
        const f = Math.pow(10, -0.4 * (m - lim));
        let r = (0.75 + 0.55 * Math.pow(f, 0.26)) * (1 + zoomBoost);
        if (tw) { const sc = Math.min(0.5, 0.05 * X); a *= 1 - sc + sc * Math.sin(t * (7 + (i % 11)) + i * 1.7); }
        r = Math.min(r, 9); const sz = r * 5.2;
        g.globalAlpha = a; g.drawImage(this.sprites[this.starCol[i]], p.x - sz / 2, p.y - sz / 2, sz, sz);
        if (st[i * 4 + 2] < 2.6 && this.nameIdx[i]) this.picks.push({ type: 'star', x: p.x, y: p.y, i, name: this.nameIdx[i].name, latin: this.nameIdx[i].latin, mag: st[i * 4 + 2], alt, az: A.horAzAlt(h).az, ra: st[i * 4], dec: st[i * 4 + 1] });
      }
      g.globalAlpha = 1;
    }

    lineAlpha() { return 0.42 * (1 - this.ss.tw * 0.9); }
    drawLines() {
      const g = this.g, a = this.lineAlpha(); if (a < 0.03) return;
      g.strokeStyle = `rgba(120,150,175,${a})`; g.lineWidth = 0.8; g.beginPath();
      for (const id in S.lines) for (const line of S.lines[id]) {
        let prev = null;
        for (const [ra, dec] of line) {
          const h = A.mul(this.M, A.eqVec(ra, dec)); const p = h[2] > -0.05 ? this.projH(this.apparent(h)) : null;
          if (p && prev && Math.hypot(p.x - prev.x, p.y - prev.y) < this.W) { g.moveTo(prev.x, prev.y); g.lineTo(p.x, p.y); }
          prev = p;
        }
      }
      g.stroke();
      if (this.opt.cnames || this.fov < 100) {
        g.font = '500 10px "IBM Plex Mono", monospace'; g.fillStyle = `rgba(150,175,195,${a * 1.2})`; g.textAlign = 'center';
        for (const n of S.cnames) {
          if (n.rank > (this.fov > 90 ? 1 : 2)) continue;
          const h = A.mul(this.M, A.eqVec(n.ra, n.dec)); if (h[2] < 0.05) continue; const p = this.projH(h); if (!p) continue;
          g.fillText(n.tr.toLocaleUpperCase('tr'), p.x, p.y);
        }
      }
    }
    drawGrid() {
      const g = this.g; g.strokeStyle = 'rgba(200,170,110,0.18)'; g.lineWidth = 0.7; g.font = '10px "IBM Plex Mono", monospace'; g.fillStyle = 'rgba(210,180,120,0.55)';
      for (let alt = 10; alt < 90; alt += 10) { g.beginPath(); let first = true; for (let az = 0; az <= 360; az += 2) { const p = this.projAA(az, alt); if (!p) { first = true; continue; } if (first) g.moveTo(p.x, p.y); else g.lineTo(p.x, p.y); first = false; } g.stroke();
        const p = this.projAA(this.az, alt); if (p) g.fillText(alt + '°', p.x + 4, p.y - 3); }
      for (let az = 0; az < 360; az += 15) { g.beginPath(); let first = true; for (let alt = 0; alt <= 88; alt += 2) { const p = this.projAA(az, alt); if (!p) { first = true; continue; } if (first) g.moveTo(p.x, p.y); else g.lineTo(p.x, p.y); first = false; } g.stroke(); }
    }

    drawPlanets() {
      const g = this.g, c = [0, 0, 0];
      for (const P of PLANETS) {
        const eq = A.bodyEq(P.id, this.ut), h = this.eqToH(eq.ra, eq.dec);
        const alt = Math.asin(h[2]) * DEG; if (alt < -1) continue;
        const p = this.projH(h); if (!p) continue;
        const m = A.bodyMag(P.id, this.ut) + 0.28 * (A.airmass(alt) - 1);
        this.skyRGB(h, c); const lim = this.limitMag(this.lum(c));
        const vis = m < lim;
        if (vis) {
          const f = Math.pow(10, -0.4 * (m - lim)); const r = Math.min(14, (0.7 + 0.5 * Math.pow(f, 0.25)) * (1 + clamp(Math.log10(70 / this.fov) * 0.3, 0, 0.6)));
          g.globalAlpha = clamp((lim - m) / 2, 0.15, 1); const spr = this.sprites[P.id === 'Mars' ? 6 : 4]; g.drawImage(spr, p.x - r * 2.8, p.y - r * 2.8, r * 5.6, r * 5.6);
          if (m < -3) { g.globalAlpha = 0.35; g.drawImage(this.softSprite, p.x - r * 9, p.y - r * 9, r * 18, r * 18); }
          g.globalAlpha = 1;
        }
        this.picks.push({ type: 'planet', id: P.id, x: p.x, y: p.y, name: P.name, modern: P.modern, mag: A.bodyMag(P.id, this.ut), alt, az: A.horAzAlt(h).az, ra: eq.ra, dec: eq.dec, vis, label: vis && m < 1.8 });
      }
    }

    /* ---------- Halley: baş (hesaplanan) + kuyruk (tanımlı model, sanatsal) ---------- */
    tailModel(H) {
      const L = this.opt.tailL, beta = H.sto * RAD, N = 46, pts = [];
      for (let k = 0; k <= N; k++) {
        const s = L * k / N;
        const theta = Math.atan2(s * Math.sin(beta), H.delta + s * Math.cos(beta)) * DEG;
        const dist = Math.sqrt(H.delta * H.delta + s * s + 2 * H.delta * s * Math.cos(beta));
        const wid = Math.atan2(0.004 + 0.07 * s, dist) * DEG;          // fiziksel genişlik varsayımı: 0,004 + 0,07·s AU
        const bright = Math.exp(-s / (0.38 * L)) * (0.25 + 0.75 * (k / N < 0.05 ? 1 : 1));
        const q = A.offsetPA(H.ra, H.dec, H.pa, theta);
        pts.push({ s, theta, wid, bright, ra: q.ra, dec: q.dec });
      }
      return pts;
    }
    drawHalley() {
      const g = this.g, H = A.halley(this.ut), c = [0, 0, 0];
      this.halleyNow = H;
      const h = this.eqToH(H.ra, H.dec), alt = Math.asin(h[2]) * DEG; const head = this.projH(h);
      const lowDay = this.ss.day;
      // kuyruk
      if (this.opt.tail) {
        const pts = this.tailModel(H); this.tailPts = pts;
        const pxPerDeg = this.s * RAD * 2 / (1 + 1);
        // ekran noktaları: kuyruk, sürekli bir ışık şeridi olarak (uyarlamalı örnekleme; nokta zinciri görünmesin)
        const sp = [];
        for (let k = 0; k < pts.length; k++) {
          const q = pts[k], hq = this.eqToH(q.ra, q.dec); if (hq[2] < -0.01) { sp.push(null); continue; }
          const p = this.projH(hq); if (!p) { sp.push(null); continue; }
          this.skyRGB(hq, c); const sky = this.lum(c);
          const contrast = clamp(0.012 / (sky + 0.002), 0, 1.6) * Math.exp(-0.3 * (A.airmass(Math.max(0, Math.asin(hq[2]) * DEG)) - 1));
          sp.push({ x: p.x, y: p.y, r: Math.max(2.2, q.wid * pxPerDeg * 0.9), a: q.bright * contrast * 0.28 * (1 - lowDay) });
        }
        let budget = 6000;
        for (let k = sp.length - 2; k >= 0 && budget > 0; k--) {
          const p0 = sp[k], p1 = sp[k + 1]; if (!p0 || !p1) continue;
          const d = Math.hypot(p1.x - p0.x, p1.y - p0.y), rr = Math.min(p0.r, p1.r), n = Math.min(220, Math.max(1, Math.ceil(d / (Math.max(1.2, rr * 0.26) * 0.6))));
          for (let j = 0; j < n; j++) {
            const f = j / n, x = p0.x + (p1.x - p0.x) * f, y = p0.y + (p1.y - p0.y) * f, r = p0.r + (p1.r - p0.r) * f, a0 = p0.a + (p1.a - p0.a) * f;
            if (a0 < 0.003 || x < -r || y < -r || x > this.W + r || y > this.H + r) continue;
            const w = Math.min(1, (d / n) / (r * 0.7)) * 1.0;            // örnek sıklığından bağımsız toplam parlaklık
            g.globalAlpha = Math.min(0.45, a0 * w); g.drawImage(this.softSprite, x - r, y - r, r * 2, r * 2);
            const r2 = Math.max(1.2, r * 0.26); g.globalAlpha = Math.min(0.45, a0 * 1.1 * Math.min(1, (d / n) / (r2 * 0.9))); g.drawImage(this.softSprite, x - r2, y - r2, r2 * 2, r2 * 2);
            budget--;
          }
        }
        g.globalAlpha = 1;
      }
      // baş
      if (head && alt > -0.6) {
        this.skyRGB(h, c); const lim = this.limitMag(this.lum(c));
        const m = H.tmag + 0.28 * (A.airmass(Math.max(alt, 0)) - 1);
        const f = Math.pow(10, -0.4 * (m - lim)); const vis = m < lim;
        const comaPx = Math.max(4.2, Math.atan2(6e4 / 1.496e8, H.delta) * DEG * this.s * RAD * 1);
        if (vis) {
          const r = Math.min(46, comaPx * 1.6 * (0.9 + 0.35 * Math.pow(f, 0.2)));
          g.globalAlpha = clamp((lim - m) / 2.5, 0.12, 0.95); g.drawImage(this.softSprite, head.x - r * 2.2, head.y - r * 2.2, r * 4.4, r * 4.4);
          g.globalAlpha = clamp((lim - m) / 2.5, 0.1, 0.9); g.drawImage(this.sprites[3], head.x - r * 0.9, head.y - r * 0.9, r * 1.8, r * 1.8);
          g.globalAlpha = 1;
        }
        this.picks.push({ type: 'halley', x: head.x, y: head.y, name: 'Halley', alt, az: A.horAzAlt(h).az, ra: H.ra, dec: H.dec, vis, mag: H.tmag, H });
      } else this.picks.push({ type: 'halley', x: head ? head.x : -999, y: head ? head.y : -999, name: 'Halley', alt, az: A.horAzAlt(h).az, ra: H.ra, dec: H.dec, vis: false, below: true, H });
    }

    drawMoon() {
      const g = this.g, h = this.eqToH(this.moonEq.ra, this.moonEq.dec), alt = Math.asin(h[2]) * DEG;
      if (alt < -1) return; const p = this.projH(h); if (!p) return;
      const f = A.bodyFrac('Moon', this.ut), r = Math.max(4, A.bodyRadius('Moon', this.ut) * RAD * this.s);
      // Güneş’e doğru yön
      const towards = A.offsetPA(this.moonEq.ra, this.moonEq.dec, this.paTo(this.moonEq, this.sunEq), 2);
      const q = this.projH(this.eqToH(towards.ra, towards.dec)); const ang = q ? Math.atan2(q.y - p.y, q.x - p.x) : 0;
      g.save(); g.translate(p.x, p.y); g.rotate(ang);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5 * f * (1 - this.ss.day); g.drawImage(this.softSprite, -r * 7, -r * 7, r * 14, r * 14); g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = 'rgba(40,46,56,0.85)'; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgb(246,238,214)'; g.beginPath(); g.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
      const k = 1 - 2 * f; g.ellipse(0, 0, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, k > 0); g.fill();
      g.restore();
      this.picks.push({ type: 'moon', x: p.x, y: p.y, name: 'Ay', alt, az: A.horAzAlt(h).az, frac: f, ra: this.moonEq.ra, dec: this.moonEq.dec });
    }
    paTo(a, b) {
      const d1 = a.dec * RAD, d2 = b.dec * RAD, da = (b.ra - a.ra) * RAD;
      return Math.atan2(Math.sin(da) * Math.cos(d2), Math.cos(d1) * Math.sin(d2) - Math.sin(d1) * Math.cos(d2) * Math.cos(da)) * DEG;
    }
    drawSun() {
      const h = this.eqToH(this.sunEq.ra, this.sunEq.dec), alt = Math.asin(h[2]) * DEG; if (alt < -1) return;
      const p = this.projH(h); if (!p) return; const g = this.g, r = Math.max(5, A.bodyRadius('Sun', this.ut) * RAD * this.s);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.8; g.drawImage(this.warmSprite, p.x - r * 10, p.y - r * 10, r * 20, r * 20); g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over'; g.fillStyle = '#fff6df'; g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill();
      this.picks.push({ type: 'sun', x: p.x, y: p.y, name: 'Güneş', alt, az: A.horAzAlt(h).az });
    }

    /* ---------- manzara ---------- */
    pathAA(points, close) {
      const g = this.g; let started = false;
      for (const q of points) { const p = this.projAA(q.az, q.alt); if (!p) { started = false; continue; } if (!started) { g.moveTo(p.x, p.y); started = true; } else g.lineTo(p.x, p.y); }
      if (close) g.closePath();
    }
    /* Görünür yön penceresinde, üstü fn(az) ile tanımlı, altı 'low' yüksekliğine inen bant yolu */
    bandPath(fn, low = -85, a1 = -1e9, a2 = 1e9) {
      const span = Math.min(180, this.fov * 0.75 + 25);
      let lo = this.az - span, hi = this.az + span;
      // [a1,a2] aralığıyla kesiştir (360° sarmalı dikkate alınarak)
      if (a1 > -1e8) { let c = a1 + 360 * Math.round((this.az - (a1 + a2) / 2) / 360); lo = Math.max(lo, c); hi = Math.min(hi, c + (a2 - a1)); if (hi <= lo) return false; }
      const pts = [], step = Math.max(0.25, (hi - lo) / 180);
      for (let az = lo; az <= hi + 1e-6; az += step) pts.push({ az, alt: fn(A.wrap360(az)) });
      pts.push({ az: hi, alt: low }); pts.push({ az: lo, alt: low });
      this.g.beginPath(); this.pathAA(pts, true); return true;
    }
    drawFlatHorizon() {
      const g = this.g; g.fillStyle = 'rgb(8,12,17)'; if (this.bandPath(() => 0, -89)) g.fill();
      g.strokeStyle = 'rgba(210,180,120,0.35)'; g.lineWidth = 1; const row = []; for (let az = this.az - 180; az <= this.az + 180; az += 2) row.push({ az, alt: 0 }); g.beginPath(); this.pathAA(row); g.stroke();
    }
    /* ---------- fotoğraf panorama: Berggren, Galata Kulesi’nden (1880’ler) ---------- */
    loadPano() {
      const P = window.PANO; if (!P || this.pano) return;
      this.pano = { tiles: P.panels.map(() => null), full: P.panels.map(() => false) };
      const load = (k, full) => { const im = new Image(); im.decoding = 'async'; im.onload = () => { this.pano.tiles[k] = im; this.pano.full[k] = full; this.dirty = true; this.bufKey = null; if (!full && this.opt.quality >= 1) load(k, true); this.emit('pano', k); }; im.src = (full ? P.src : P.lite).replace('{k}', P.panels[k].k); };
      // önce bakılan yöndeki levhalar
      const order = P.panels.map((p, k) => [k, Math.abs(A.wrap180(p.az0 + p.w / p.s / 2 - this.az))]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
      order.forEach(k => load(k, false));
    }
    panoTint() {
      // Fotoğraf gündüz çekildi; gece görünümü için ton, gökyüzünün parlaklığına göre KOYULAŞTIRILIR (renk düzenlemesi, temsilî)
      const st = this.ss, tw = st.tw, day = st.day, ml = st.moonL;
      const dark = clamp(0.8 - 0.55 * Math.pow(tw, 1.3) - 0.3 * day - 0.12 * ml, 0, 0.95);
      const a = clamp(0.42 - 0.2 * tw - 0.25 * day, 0, 0.5);
      const c = [mix(8, 60, tw), mix(14, 76, tw), mix(34, 104, tw)];
      return { dark, a, c };
    }
    drawLandscape(now) {
      const P = window.PANO, vp = L.VIEWPOINTS[this.vpId];
      if (!P || !vp.pano) { this.drawFlatHorizon(); return; }
      this.loadPano();
      const g = this.g, W = this.W, H = this.H, dpr = this.dpr;
      if (!this.landC) { this.landC = document.createElement('canvas'); this.lg = this.landC.getContext('2d'); }
      const lc = this.landC, lg = this.lg;
      if (lc.width !== this.c.width || lc.height !== this.c.height) { lc.width = this.c.width; lc.height = this.c.height; }
      lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalCompositeOperation = 'source-over'; lg.globalAlpha = 1; lg.clearRect(0, 0, lc.width, lc.height);
      lg.setTransform(dpr, 0, 0, dpr, 0, 0); lg.imageSmoothingEnabled = true; lg.imageSmoothingQuality = 'high';
      // kuzeydeki boşluk (panoramada yok: Pera yamacı) — koyu, alçak bir sırt
      const cov = P.panels, first = cov[0].az0, last = cov[cov.length - 1].az0 + cov[cov.length - 1].w / cov[cov.length - 1].s;
      lg.fillStyle = '#4a443d';
      { const saved = this.g; this.g = lg; if (this.bandPath(az => 0.6 + 1.4 * Math.cos(A.wrap180(az - 15) * RAD), -60, last - 3, first + 360 + 3)) lg.fill(); this.g = saved; }
      const span = Math.min(200, this.fov * 0.75 + 20);
      { // levhaların altı: koyu zemin (fotoğrafın ortalama tonu, gece tonuyla)
        const T = this.panoTint(), base = [150, 124, 108], col = base.map((b, i) => Math.round(mix(b * (1 - T.dark), T.c[i], T.a) * 0.6));
        lg.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`; const saved = this.g; this.g = lg; if (this.bandPath(() => -14, -89)) lg.fill(); this.g = saved; }
      const stepDeg = clamp(this.fov / 36, 0.35, 3), rowsDeg = 8;
      let drawn = 0;
      for (let k = 0; k < cov.length; k++) {
        const p = cov[k], im = this.pano.tiles[k]; if (!im) continue;
        const sc = im.width / p.w;                 // lite = 0,5
        const aMid = p.az0 + p.w / p.s / 2, half = p.w / p.s / 2;
        if (Math.abs(A.wrap180(aMid - this.az)) > span + half) continue;
        const altTop = (p.yh - p.top) / p.s, altBot = (p.yh - p.top - p.h) / p.s;
        const nU = Math.max(1, Math.ceil((p.w / p.s) / stepDeg)), du = p.w / nU;
        const nV = Math.max(1, Math.ceil((altTop - altBot) / rowsDeg)), dv = p.h / nV;
        for (let i = 0; i < nU; i++) {
          const u0 = i * du, az0 = p.az0 + u0 / p.s, az1 = p.az0 + (u0 + du) / p.s;
          if (Math.abs(A.wrap180((az0 + az1) / 2 - this.az)) > span) continue;
          for (let j = 0; j < nV; j++) {
            const v0 = j * dv, a0 = altTop - v0 / p.s, a1 = altTop - (v0 + dv) / p.s;
            const q00 = this.projAA(az0, a0), q10 = this.projAA(az1, a0), q01 = this.projAA(az0, a1);
            if (!q00 || !q10 || !q01) continue;
            if (Math.max(q00.x, q10.x, q01.x) < -50 || Math.min(q00.x, q10.x, q01.x) > W + 50 || Math.max(q00.y, q01.y) < -50 || Math.min(q00.y, q01.y) > H + 50) continue;
            const ux = (q10.x - q00.x) / du, uy = (q10.y - q00.y) / du, vx = (q01.x - q00.x) / dv, vy = (q01.y - q00.y) / dv;
            lg.setTransform(ux * dpr, uy * dpr, vx * dpr, vy * dpr, q00.x * dpr, q00.y * dpr);
            // 1 piksel bindirme: dikiş çizgisi kalmasın
            lg.drawImage(im, u0 * sc, v0 * sc, du * sc, dv * sc, 0, 0, du + 1 / Math.max(0.2, Math.abs(ux)), dv + 1 / Math.max(0.2, Math.abs(vy)));
            drawn++;
          }
        }
      }
      lg.setTransform(1, 0, 0, 1, 0, 0);
      // gece tonu: yalnız fotoğrafın piksellerinde
      const T = this.panoTint();
      lg.globalCompositeOperation = 'source-atop';
      // önce orantılı karartma (kontrastı korur), sonra gece rengi
      lg.fillStyle = `rgba(0,0,0,${T.dark})`; lg.fillRect(0, 0, lc.width, lc.height);
      lg.fillStyle = `rgba(${T.c[0] | 0},${T.c[1] | 0},${T.c[2] | 0},${T.a})`; lg.fillRect(0, 0, lc.width, lc.height);
      // hava perspektifi: ufka yakın kısım gökyüzünün rengini alır
      const hz = [0, 0, 0]; this.skyRGB(A.azAltVec(this.az, 1), hz);
      const y0 = this.projAA(this.az, 2), y1 = this.projAA(this.az, -4);
      if (y0 && y1) { const gr = lg.createLinearGradient(0, y0.y * dpr, 0, y1.y * dpr); const col = `${Math.round(this.tone(hz[0]))},${Math.round(this.tone(hz[1]))},${Math.round(this.tone(hz[2]))}`; gr.addColorStop(0, `rgba(${col},0.55)`); gr.addColorStop(1, `rgba(${col},0)`); lg.fillStyle = gr; lg.fillRect(0, 0, lc.width, lc.height); }
      lg.globalCompositeOperation = 'source-over';
      g.drawImage(lc, 0, 0, W, H);
      // pencere ve fener ışıkları (temsilî; konumları fotoğraftaki yapı dokusundan seçilir)
      const night = 1 - this.ss.tw;
      if (night > 0.03 && P.lights) {
        const pp = A.utToLMTParts(this.ut), hour = pp.h + pp.mi / 60;
        const share = hour >= 1 && hour < 5 ? 0.12 : (hour >= 20 || hour < 1 ? 0.42 : 0.05);
        const rev = this.revealLights == null ? 1 : this.revealLights;
        g.globalCompositeOperation = 'lighter'; g.fillStyle = '#e8b46c';
        const zoom = clamp(60 / this.fov, 0.7, 4);
        for (const [az, alt, seed] of P.lights) {
          if (seed > share * rev) continue;
          if (Math.abs(A.wrap180(az - this.az)) > span) continue;
          const q = this.projAA(az, alt); if (!q || q.x < -5 || q.y < -5 || q.x > W + 5 || q.y > H + 5) continue;
          const flick = this.reduced ? 1 : 0.8 + 0.2 * Math.sin(now / 700 + seed * 300);
          const near = clamp((-alt) / 6, 0.3, 1.6);
          const w = Math.max(0.9, 1.1 * zoom * near);
          g.globalAlpha = clamp(0.55 * night * flick * (0.6 + seed / share), 0, 0.95);
          g.fillRect(q.x - w / 2, q.y - w * 0.7, w, w * 1.4);
          if (w > 2.2) { g.globalAlpha *= 0.25; const s = w * 3; g.drawImage(this.warmSprite, q.x - s, q.y - s, s * 2, s * 2); }
        }
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      }
      this.drawGlitter(now);
      // etiket ve dokunma için yapı yönleri (çizilmez)
      if (this.opt.landmarks) for (const m of L.get(this.vpId).marks) {
        if (Math.abs(A.wrap180(m.az - this.az)) > span) continue;
        const top = this.projAA(m.az, m.alt + 0.25); if (!top) continue;
        this.picks.push({ type: 'place', x: top.x, y: top.y, name: m.name, az: m.az, alt: m.alt, dist: m.dist, note: m.note, label: this.fov < 75 && !m.notInPhoto });
      }
      this.panoDrawn = drawn;
    }
    /* Ay’ın ve Zühre’nin suda parıltısı: yalnız panoramada suyun görüldüğü yönlerde, kıyı çizgisinin altında (temsilî) */
    drawGlitter(now) {
      const g = this.g, objs = [];
      const mh = this.eqToH(this.moonEq.ra, this.moonEq.dec); if (mh[2] > 0.01) objs.push({ h: mh, w: 1.4, a: 0.42 * A.bodyFrac('Moon', this.ut) });
      const v = A.bodyEq('Venus', this.ut), vh = this.eqToH(v.ra, v.dec); if (vh[2] > 0.005) objs.push({ h: vh, w: 0.4, a: 0.22 * (1 - this.ss.day) });
      const WATER = [[62, 140, -1.6, -9], [150, 205, -3.2, -12], [205, 300, -2.6, -9]];
      g.globalCompositeOperation = 'lighter';
      for (const o of objs) {
        const { az, alt } = A.horAzAlt(o.h); const w = WATER.find(([a, b]) => az >= a && az <= b); if (!w) continue;
        const n = 34, t = this.reduced ? 0 : now / 1000;
        for (let k = 0; k < n; k++) {
          const da = w[2] - (k / n) * (w[2] - w[3]), wob = (L.hash(k * 3.3 + Math.floor(t * 2 + k)) - 0.5) * o.w * (1 + k / 10);
          const p = this.projAA(az + wob, da); if (!p) continue;
          const len = 2 + 8 * L.hash(k + Math.floor(t * 3)), alpha = o.a * (1 - k / n) * L.hash(k * 7.1 + Math.floor(t * 4)) * (1 - this.ss.day);
          g.fillStyle = `rgba(255,236,196,${alpha})`; g.fillRect(p.x - len / 2, p.y, len, 1.1);
        }
      }
      g.globalCompositeOperation = 'source-over';
    }

    drawCompass() {
      const g = this.g, names = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
      g.font = '500 11px "IBM Plex Mono", monospace'; g.textAlign = 'center';
      for (let k = 0; k < 8; k++) {
        const p = this.projAA(k * 45, -1.2); if (!p || p.x < 0 || p.x > this.W) continue;
        g.fillStyle = k % 2 ? 'rgba(210,190,150,0.5)' : 'rgba(232,206,150,0.85)'; g.fillText(names[k], p.x, Math.min(p.y + 14, this.H - 8));
      }
    }
    drawLabels() {
      if (!this.opt.labels && !this.opt.showBelow) return;
      const g = this.g; g.textAlign = 'left';
      for (const p of this.picks) {
        if (!this.opt.labels && p.type !== 'halley') continue;
        if (p.x < 0 || p.y < 0 || p.x > this.W || p.y > this.H) continue;
        if (p.type === 'star' && (this.fov > 120 || p.mag > (this.fov > 60 ? 1.4 : 2.3))) continue;
        if (p.type === 'star' && p.alt < 1) continue;
        if (p.type === 'planet' && !p.label) continue;
        if (p.type === 'place' && !p.label) continue;
        if (p.type === 'halley' && p.below && this.opt.showBelow) { const q = this.projAA(p.az, -0.6); if (q) { g.font = '500 11px "IBM Plex Mono", monospace'; g.fillStyle = 'rgba(234,214,170,0.85)'; g.textAlign = 'center'; g.fillText('↓ HALLEY · UFKUN ' + Math.abs(p.alt).toFixed(0) + '° ALTINDA (HESAP)', q.x, q.y + 30); g.textAlign = 'left'; } continue; }
        if (p.type === 'halley' && (p.below || this.opt.hideHalleyLabel)) continue;
        const sel = this.selected && this.selected.name === p.name;
        if (p.type === 'halley') { g.font = '500 11px "IBM Plex Mono", monospace'; g.fillStyle = 'rgba(234,214,170,0.9)'; g.strokeStyle = 'rgba(234,214,170,0.5)'; g.lineWidth = 0.8;
          g.beginPath(); g.moveTo(p.x + 9, p.y + 9); g.lineTo(p.x + 30, p.y + 30); g.lineTo(p.x + 70, p.y + 30); g.stroke(); g.fillText('1P/HALLEY', p.x + 34, p.y + 26); continue; }
        if (p.type === 'place') { g.font = 'italic 12px "EB Garamond", serif'; g.fillStyle = 'rgba(214,200,170,0.62)'; g.textAlign = 'center'; g.fillText(p.name, p.x, p.y - 4); g.textAlign = 'left'; continue; }
        g.font = (p.type === 'planet' ? 'italic 14px "EB Garamond", serif' : 'italic 12px "EB Garamond", serif');
        g.fillStyle = sel ? 'rgba(255,230,180,0.95)' : (p.type === 'planet' ? 'rgba(236,220,186,0.78)' : 'rgba(190,200,215,0.55)');
        g.fillText(p.type === 'planet' ? `${p.name} · ${p.modern}` : p.name, p.x + 8, p.y - 6);
      }
      if (this.selected) { const s = this.picks.find(p => p.name === this.selected.name); if (s) { g.strokeStyle = 'rgba(234,204,140,0.85)'; g.lineWidth = 1; g.beginPath(); g.arc(s.x, s.y, 13, 0, Math.PI * 2); g.stroke(); } }
    }
    drawOptics() {
      const g = this.g, r = Math.min(this.W, this.H) * 0.46;
      g.save(); g.fillStyle = 'rgba(2,4,6,0.94)'; g.beginPath(); g.rect(0, 0, this.W, this.H); g.arc(this.cx, this.cy, r, 0, Math.PI * 2, true); g.fill('evenodd');
      const gr = g.createRadialGradient(this.cx, this.cy, r * 0.82, this.cx, this.cy, r); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.85)');
      g.fillStyle = gr; g.beginPath(); g.arc(this.cx, this.cy, r, 0, Math.PI * 2); g.fill();
      g.font = '500 11px "IBM Plex Mono", monospace'; g.fillStyle = 'rgba(232,206,150,0.8)'; g.textAlign = 'center';
      g.fillText(`OPTİK BAKIŞ · ~×${Math.max(1, Math.round(60 / this.fov))} · GÖRÜŞ ALANI ${this.fov.toFixed(1).replace('.', ',')}°`, this.cx, this.cy + r + 18 > this.H - 6 ? this.H - 10 : this.cy + r + 18);
      g.restore();
    }

    /* ---------- etkileşim ---------- */
    bind() {
      const c = this.c; let drag = null, pinch = null; const pts = new Map();
      c.addEventListener('pointerdown', e => { c.setPointerCapture(e.pointerId); pts.set(e.pointerId, e); if (pts.size === 1) drag = { x: e.clientX, y: e.clientY, az: this.az, alt: this.alt, moved: false }; else if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), fov: this.fov }; drag = null; } });
      c.addEventListener('pointermove', e => {
        if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, e);
        if (pinch && pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); this.setView({ fov: pinch.fov * pinch.d / Math.max(10, d) }); this.emit('view'); this.draw(); return; }
        if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
        const k = DEG / this.s; this.setView({ az: drag.az - dx * k / Math.max(0.25, Math.cos(this.alt * RAD)), alt: drag.alt + dy * k }); this.emit('view'); this.draw();
      });
      const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (drag && !drag.moved && e.type === 'pointerup') this.pick(e); if (!pts.size) drag = null; };
      c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
      c.addEventListener('wheel', e => { e.preventDefault(); this.setView({ fov: this.fov * Math.exp(e.deltaY * 0.0012) }); this.emit('view'); this.draw(); }, { passive: false });
      c.addEventListener('keydown', e => {
        const k = e.key, st = this.fov / 30; let used = true;
        if (k === 'ArrowLeft') this.setView({ az: this.az - 3 * st }); else if (k === 'ArrowRight') this.setView({ az: this.az + 3 * st });
        else if (k === 'ArrowUp') this.setView({ alt: this.alt + 2 * st }); else if (k === 'ArrowDown') this.setView({ alt: this.alt - 2 * st });
        else if (k === '+' || k === '=') this.setView({ fov: this.fov / 1.2 }); else if (k === '-' || k === '_') this.setView({ fov: this.fov * 1.2 });
        else used = false;
        if (used) { e.preventDefault(); this.emit('view'); this.draw(); }
      });
    }
    pick(e) {
      const r = this.c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      let best = null, bd = 22;
      for (const p of this.picks) { const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; } }
      this.selected = best; this.emit('select', best); this.draw();
    }
    find(name) { return this.picks.find(p => p.name === name || p.id === name); }
    /* bir cismin anlık yatay koordinatı */
    where(what) {
      const vp = L.VIEWPOINTS[this.vpId]; const M = A.horizonMatrix(this.ut, vp.lat, vp.lon); this.M = M;
      let eq;
      if (what === 'Halley') eq = A.halley(this.ut); else if (what === 'Moon' || what === 'Sun' || PLANETS.some(p => p.id === what)) eq = A.bodyEq(what, this.ut);
      if (!eq) return null; return A.horAzAlt(this.apparent(A.mul(M, A.eqVec(eq.ra, eq.dec))));
    }
  }
  Sky.PLANETS = PLANETS;
  window.Sky = Sky;
})();
