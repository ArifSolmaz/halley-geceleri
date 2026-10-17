/* Halley Geceleri — sahne katmanı: ARŞİV FOTOĞRAFLARI ve BELGELER.
   Bu sürümde hiçbir insan, yüz ya da mekân çizilmez. Görüntüler gerçek fotoğraflar ve özgün taramalardır
   (künyeler: data/photos.js, data/archive.js). Yapılan işlemler yalnızca kadraj (yavaş kaydırma/yakınlaşma),
   ışık ve renk düzenlemesidir; "gece" görünümleri bir renk düzenlemesidir ve ekranda belirtilir.
   Kişiler yalnız ses, altyazı ve bakış açısı olarak vardır. */
'use strict';
(function () {
  const VW = 1920, VH = 1080;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), mix = (a, b, t) => a + (b - a) * t;
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const R = (n) => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };

  function grainPNG() {
    const c = document.createElement('canvas'); c.width = c.height = 220; const g = c.getContext('2d'), im = g.createImageData(220, 220), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    g.putImageData(im, 0, 0); return c.toDataURL('image/png');
  }

  /* ---------- görüntü önbelleği (aşamalı yükleme) ---------- */
  const IMG = {};
  function img(src) { if (IMG[src]) return IMG[src]; const i = new Image(); i.decoding = 'async'; i.src = src; IMG[src] = i; return i; }
  const ready = i => i && i.complete && i.naturalWidth > 0;
  function preload(list) { list.forEach(s => img(s)); }

  /* ---------- sahne tuvali ---------- */
  class Stage {
    constructor(canvas, sky) {
      this.c = canvas; this.g = canvas.getContext('2d'); this.sky = sky;
      this.L = document.createElement('canvas'); this.lg = this.L.getContext('2d');      // katman tamponu
      this.M = document.createElement('canvas'); this.mg = this.M.getContext('2d');      // ışık maskesi
      this.resize(); new ResizeObserver(() => this.resize()).observe(canvas);
    }
    resize() {
      const r = this.c.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      this.W = r.width; this.H = r.height; this.c.width = Math.max(1, Math.round(r.width * dpr)); this.c.height = Math.max(1, Math.round(r.height * dpr)); this.dpr = dpr;
      for (const k of ['L', 'M']) { this[k].width = this.c.width; this[k].height = this.c.height; }
    }
    clear() { this.g.setTransform(1, 0, 0, 1, 0, 0); this.g.globalAlpha = 1; this.g.globalCompositeOperation = 'source-over'; this.g.clearRect(0, 0, this.c.width, this.c.height); }
    /* sanal 1920×1080 tuvalden ekrana */
    camTransform(cam) {
      const W = this.c.width, H = this.c.height, cover = Math.max(W / VW, H / VH) * (cam.z || 1);
      this.g.setTransform(cover, 0, 0, cover, W / 2 - cam.x * cover, H / 2 - cam.y * cover); this.cover = cover; this.cam = cam; this.anchor = null;
    }
    toScreen(x, y) {
      if (this.anchor) { const a = this.anchor(x, y); if (a) return a; }
      const c = this.cam || { x: VW / 2, y: VH / 2, z: 1 }; const cover = this.cover || Math.max(this.c.width / VW, this.c.height / VH);
      return { x: (this.c.width / 2 + (x - c.x) * cover) / this.dpr, y: (this.c.height / 2 + (y - c.y) * cover) / this.dpr };
    }
  }

  /* ---------- fotoğraf / belge katmanı ----------
     layer: { src, fit:'cover'|'paper', kb:[{t,x,y,z}], a:[{t,v}], grade:{dark, tint:[r,g,b,a], mono}, lamp:{x,y,r,v,warm},
              paper:{h, r, x, y}, shadow:{t0,t1} } */
  function keys(arr, p, def) {
    if (!arr || !arr.length) return def;
    if (arr.length === 1 || p <= arr[0].t) return Object.assign({}, arr[0]);
    if (p >= arr[arr.length - 1].t) return Object.assign({}, arr[arr.length - 1]);
    let a = arr[0], b = arr[arr.length - 1];
    for (let k = 0; k < arr.length - 1; k++) if (p >= arr[k].t && p <= arr[k + 1].t) { a = arr[k]; b = arr[k + 1]; break; }
    const f = ease(clamp((p - a.t) / ((b.t - a.t) || 1), 0, 1)), o = {};
    for (const k in a) if (k !== 't') o[k] = typeof a[k] === 'number' ? mix(a[k], b[k], f) : a[k];
    return o;
  }
  function placeImage(st, im, L, p, reduced) {
    const W = st.c.width, H = st.c.height;
    const kb = keys(L.kb, reduced ? 1 : p, { x: 0.5, y: 0.5, z: 1 });
    if (L.fit === 'paper') {
      const P = L.paper || {}, h = H * (P.h || 0.9) * kb.z, w = h * im.naturalWidth / im.naturalHeight;
      return { cx: W * (P.x ?? 0.5) - (kb.x - 0.5) * w, cy: H * (P.y ?? 0.5) - (kb.y - 0.5) * h, w, h, rot: P.r || 0 };
    }
    const s = Math.max(W / im.naturalWidth, H / im.naturalHeight) * kb.z, w = im.naturalWidth * s, h = im.naturalHeight * s;
    const cx = clamp(W / 2 - (kb.x - 0.5) * w, W - w / 2, w / 2), cy = clamp(H / 2 - (kb.y - 0.5) * h, H - h / 2, h / 2);
    return { cx, cy, w, h, rot: 0 };
  }
  const val = (x, p, d) => x == null ? d : (typeof x === 'object' ? keys(x, p, { v: d }).v : x);
  function drawLayer(st, L, p, t, reduced) {
    const im = img(L.src); if (!ready(im)) return false;
    const alpha = val(L.a, p, 1); if (alpha <= 0.002) return true;
    const lg = st.lg, W = st.c.width, H = st.c.height, pl = placeImage(st, im, L, p, reduced);
    lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalAlpha = 1; lg.globalCompositeOperation = 'source-over'; lg.clearRect(0, 0, W, H);
    const put = (g) => { g.save(); g.translate(pl.cx, pl.cy); if (pl.rot) g.rotate(pl.rot); g.drawImage(im, -pl.w / 2, -pl.h / 2, pl.w, pl.h); g.restore(); };
    if (L.fit === 'paper') { lg.save(); lg.shadowColor = 'rgba(0,0,0,.7)'; lg.shadowBlur = 40 * st.dpr; lg.shadowOffsetY = 14 * st.dpr; put(lg); lg.restore(); }
    else put(lg);
    const G = L.grade || {};
    if (G.mono) { lg.globalCompositeOperation = 'saturation'; lg.fillStyle = `rgba(128,128,128,${G.mono})`; lg.fillRect(0, 0, W, H); }
    lg.globalCompositeOperation = 'source-atop';
    const dark = val(G.dark, p, 0);
    if (dark > 0) { lg.fillStyle = `rgba(0,0,0,${dark})`; lg.fillRect(0, 0, W, H); }
    if (G.tint) { const [r, g, b, a] = G.tint; lg.fillStyle = `rgba(${r},${g},${b},${a * val(G.tintK, p, 1)})`; lg.fillRect(0, 0, W, H); }
    // lamba ışığı: aynı görüntünün ışık havuzu içindeki kısmı, sıcak tonla, karartılmış katmanın üstüne
    if (L.lamp) {
      const lp = Array.isArray(L.lamp) ? keys(L.lamp, p, {}) : L.lamp, mg = st.mg;
      const flick = reduced ? 1 : 1 + 0.035 * Math.sin(t * 9.1) + 0.02 * Math.sin(t * 23.7);
      const lx = W * lp.x, ly = H * lp.y, lr = Math.max(W, H) * lp.r * flick;
      mg.setTransform(1, 0, 0, 1, 0, 0); mg.globalAlpha = 1; mg.globalCompositeOperation = 'source-over'; mg.clearRect(0, 0, W, H);
      put(mg);
      mg.globalCompositeOperation = 'destination-in';
      const gr = mg.createRadialGradient(lx, ly, 0, lx, ly, lr); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.45, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      mg.fillStyle = gr; mg.fillRect(0, 0, W, H);
      mg.globalCompositeOperation = 'source-atop'; mg.fillStyle = `rgba(255,150,60,${lp.warm ?? 0.28})`; mg.fillRect(0, 0, W, H);
      lg.globalCompositeOperation = 'source-over'; lg.globalAlpha = clamp(lp.v ?? 1, 0, 1); lg.drawImage(st.M, 0, 0); lg.globalAlpha = 1;
    }
    // geçen bir elin gölgesi (yalnız gölge; el çizilmez)
    if (L.shadow && p > L.shadow.t0 && p < L.shadow.t1) {
      const f = (p - L.shadow.t0) / (L.shadow.t1 - L.shadow.t0), k = Math.sin(f * Math.PI);
      const sx = W * mix(-0.15, 0.6, ease(f)), sy = H * mix(1.1, 0.6, ease(f));
      lg.globalCompositeOperation = 'source-atop';
      const gr = lg.createRadialGradient(sx, sy, 0, sx, sy, Math.max(W, H) * 0.34); gr.addColorStop(0, `rgba(0,0,0,${0.6 * k})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      lg.fillStyle = gr; lg.fillRect(0, 0, W, H);
    }
    lg.globalCompositeOperation = 'source-over';
    const g = st.g; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = alpha; g.drawImage(st.L, 0, 0); g.globalAlpha = 1;
    return true;
  }
  function drawPhoto(st, spec, p, t, reduced) {
    const g = st.g; st.clear(); st.anchor = null;
    g.fillStyle = spec.bg || '#050505'; g.fillRect(0, 0, st.c.width, st.c.height);
    let ok = true; for (const L of spec.layers) ok = drawLayer(st, L, p, t, reduced) && ok;
    const L0 = spec.layers[spec.anchorLayer || 0], im0 = img(L0.src);
    if (ready(im0)) { const pl = placeImage(st, im0, L0, p, reduced); st.anchor = (x, y) => ({ x: (pl.cx + (x / VW - 0.5) * pl.w) / st.dpr, y: (pl.cy + (y / VH - 0.5) * pl.h) / st.dpr }); }
    if (!ok) { g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${12 * st.dpr}px "IBM Plex Mono", monospace`; g.fillStyle = 'rgba(232,206,150,.6)'; g.textAlign = 'center'; g.fillText('görüntü yükleniyor…', st.c.width / 2, st.c.height / 2); }
  }

  /* ---------- buzlu cam (kameranın odak camı): görüntü ters ve tepetaklak ---------- */
  function drawGroundGlass(st, source, o = {}) {
    const g = st.g, W = st.c.width, H = st.c.height; st.clear(); st.anchor = null;
    g.fillStyle = '#020302'; g.fillRect(0, 0, W, H);
    const gw = Math.min(W * 0.84, H * 0.72 * 1.39), gh = gw / 1.39, x0 = (W - gw) / 2, y0 = (H - gh) / 2 - H * 0.05;
    g.save(); g.beginPath(); g.rect(x0, y0, gw, gh); g.clip();
    g.fillStyle = '#060806'; g.fillRect(x0, y0, gw, gh);
    if (source && o.sky !== false) { g.save(); g.translate(x0 + gw / 2, y0 + gh / 2); g.scale(-1, -1); const sw = source.width, sh = source.height, s = Math.max(gw / sw, gh / sh); g.globalAlpha = o.skyA ?? 1; g.drawImage(source, -sw * s / 2, -sh * s / 2, sw * s, sh * s); g.restore(); g.globalAlpha = 1; }
    if (o.lamp) {   // odak dışı lamba: yalnız ışık lekesi
      const lx = x0 + gw * o.lamp.x, ly = y0 + gh * o.lamp.y, r = gh * o.lamp.r;
      const gr = g.createRadialGradient(lx, ly, 0, lx, ly, r); gr.addColorStop(0, `rgba(255,214,150,${0.8 * (o.lamp.v ?? 1)})`); gr.addColorStop(0.35, `rgba(240,160,80,${0.32 * (o.lamp.v ?? 1)})`); gr.addColorStop(1, 'rgba(240,160,80,0)');
      g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(x0, y0, gw, gh); g.globalCompositeOperation = 'source-over';
    }
    g.fillStyle = 'rgba(70,90,70,.10)'; g.fillRect(x0, y0, gw, gh);
    const vg = g.createRadialGradient(x0 + gw / 2, y0 + gh / 2, gh * 0.25, x0 + gw / 2, y0 + gh / 2, gw * 0.62); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.75)'); g.fillStyle = vg; g.fillRect(x0, y0, gw, gh);
    g.strokeStyle = 'rgba(200,210,190,.16)'; g.lineWidth = Math.max(1, st.dpr);
    g.beginPath(); for (let k = 1; k < 3; k++) { g.moveTo(x0 + gw * k / 3, y0); g.lineTo(x0 + gw * k / 3, y0 + gh); g.moveTo(x0, y0 + gh * k / 3); g.lineTo(x0 + gw, y0 + gh * k / 3); } g.stroke();
    g.restore();
    g.strokeStyle = 'rgba(160,140,110,.35)'; g.lineWidth = 2 * st.dpr; g.strokeRect(x0, y0, gw, gh);
    g.font = `${11 * st.dpr}px "IBM Plex Mono", monospace`; g.fillStyle = 'rgba(232,206,150,.7)'; g.textAlign = 'center';
    g.fillText(o.label || 'ODAK CAMI · GÖRÜNTÜ TERS VE TEPETAKLAK DÜŞER', W / 2, y0 - 12 * st.dpr);
  }

  /* ---------- Güneş geçişi — bilimsel çizim ---------- */
  const SETS = {};
  SETS.transit = {
    draw(st, t, p) {
      const g = st.g; g.fillStyle = '#05080b'; g.fillRect(0, 0, VW, VH);
      drawTransit(g, 960, 540, 420, p.at ?? 0.5, { film: true });
    }
  };
  function drawTransit(g, cx, cy, R, at, o = {}) {
    const T = window.TRANSIT; if (!T) return; const pts = T.points, rad = pts[0].solar_radius_deg * 60;
    const sc = R / rad;
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, R); gr.addColorStop(0, '#f4e2b4'); gr.addColorStop(0.7, '#e8c88a'); gr.addColorStop(0.92, '#c99a5a'); gr.addColorStop(1, '#a8743e');
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
    g.strokeStyle = 'rgba(232,210,170,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - R * 1.25, cy); g.lineTo(cx + R * 1.25, cy); g.moveTo(cx, cy - R * 1.25); g.lineTo(cx, cy + R * 1.25); g.stroke();
    g.strokeStyle = 'rgba(30,40,60,.85)'; g.setLineDash([6, 6]); g.lineWidth = 2; g.beginPath();
    pts.forEach((q, i) => { const x = cx - q.east_arcmin * sc, y = cy - q.north_arcmin * sc; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); g.setLineDash([]);
    const idx = Math.min(pts.length - 1, Math.max(0, at * (pts.length - 1))), i0 = Math.floor(idx), f = idx - i0, q0 = pts[i0], q1 = pts[Math.min(pts.length - 1, i0 + 1)];
    const ex = q0.east_arcmin + (q1.east_arcmin - q0.east_arcmin) * f, ny = q0.north_arcmin + (q1.north_arcmin - q0.north_arcmin) * f;
    const x = cx - ex * sc, y = cy - ny * sc;
    g.fillStyle = '#0a1420'; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); g.strokeStyle = '#0a1420'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 18, 0, 7); g.stroke();
    g.font = '500 18px "IBM Plex Mono", monospace'; g.fillStyle = 'rgba(232,210,170,.85)'; g.textAlign = 'center';
    g.fillText('K', cx, cy - R * 1.3); g.fillText('D', cx - R * 1.3, cy + 6); g.fillText('B', cx + R * 1.3, cy + 6);
    const sec = q0.seconds + (q1.seconds - q0.seconds) * f; const ut = Date.parse(T.epoch_ut + 'Z') + sec * 1000;
    if (o.film) { g.textAlign = 'left'; g.font = '400 22px "IBM Plex Mono", monospace'; g.fillStyle = '#e8c88a'; g.fillText(window.Astro.fmtLMT(ut) + ' LMT · ' + window.Astro.fmtUT(ut) + ' UT', cx + R + 70, cy - 60);
      g.font = 'italic 24px "EB Garamond", serif'; g.fillStyle = 'rgba(235,227,209,.8)'; g.fillText('Hesaplanan merkez yolu · işaret büyütülmüştür', cx + R + 70, cy - 20); g.fillText('Güneş diski: 0,263° yarıçap', cx + R + 70, cy + 14); }
    return ut;
  }

  window.Stage = Stage; window.SETS = SETS;
  window.Figures = { drawPhoto, drawGroundGlass, drawTransit, img, ready, preload, grainPNG, keys, VW, VH, ease, clamp, mix, R };
})();
