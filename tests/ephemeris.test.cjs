/* node --test tests/ephemeris.test.cjs — tarayıcı hesabını Horizons’la karşılaştırır */
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path');
const R = p => path.join(__dirname, '..', p);
global.window = {};
eval(fs.readFileSync(R('data/sky.js'), 'utf8')); eval(fs.readFileSync(R('js/astro.js'), 'utf8'));
const A = window.Astro;
test('Halley azimut/yükseklik Horizons ile 0,001° içinde (gerçek yıldız zamanıyla)', () => {
  const V = JSON.parse(fs.readFileSync(R('tests/horizons_azel.json'))); let maxAz = 0, maxAlt = 0, n = 0;
  for (const [t, az, alt] of V) { if (alt < -5) continue; const h = A.halley(t), M = A.horizonMatrix(t, 41.0082, 28.9784), p = A.horAzAlt(A.mul(M, A.eqVec(h.ra, h.dec)));
    maxAz = Math.max(maxAz, Math.abs(A.wrap180(p.az - az)) * Math.cos(alt * Math.PI / 180)); maxAlt = Math.max(maxAlt, Math.abs(p.alt - alt)); n++; }
  assert.ok(n > 4000); assert.ok(maxAz < 0.001, 'az ' + maxAz); assert.ok(maxAlt < 0.001, 'alt ' + maxAlt);
});
test('Güneş ve Ay yüksekliği eski Horizons tablosuyla 0,02° içinde', () => {
  const E = JSON.parse(fs.readFileSync(R('data/ephemeris.json'))); let ms = 0, mm = 0;
  E.dates.forEach((d, i) => E.rows[i].forEach((r, j) => { const t = A.lmtToUT(d + 'T' + String(Math.floor(j / 6)).padStart(2, '0') + ':' + String(j % 6 * 10).padStart(2, '0')), M = A.horizonMatrix(t, 41.0082, 28.9784);
    const s = A.bodyEq('Sun', t), m = A.bodyEq('Moon', t); ms = Math.max(ms, Math.abs(A.horAzAlt(A.mul(M, A.eqVec(s.ra, s.dec))).alt - r[3])); mm = Math.max(mm, Math.abs(A.horAzAlt(A.mul(M, A.eqVec(m.ra, m.dec))).alt - r[5])); }));
  assert.ok(ms < 0.02, 'güneş ' + ms); assert.ok(mm < 0.02, 'ay ' + mm);
});
test('Yeni Gazete 9 Mayıs: 10 Mayıs 03:30 LMT’de Halley Zühre’nin solunda ve daha yüksekte', () => {
  const t = A.lmtToUT('1910-05-10T03:30'), M = A.horizonMatrix(t, 41.025, 28.9752);
  const h = A.halley(t), v = A.bodyEq('Venus', t), ph = A.horAzAlt(A.mul(M, A.eqVec(h.ra, h.dec))), pv = A.horAzAlt(A.mul(M, A.eqVec(v.ra, v.dec)));
  assert.ok(ph.az < pv.az && ph.alt > pv.alt);
});
test('19 Mayıs 03:00 LMT’de Halley ufkun altında; 27 Mayıs 21:30’da batıda ~20°', () => {
  const f = s => { const t = A.lmtToUT(s), M = A.horizonMatrix(t, 41.025, 28.9752), h = A.halley(t); return A.horAzAlt(A.mul(M, A.eqVec(h.ra, h.dec))); };
  assert.ok(f('1910-05-19T03:00').alt < -10); const e = f('1910-05-27T21:30'); assert.ok(e.alt > 18 && e.alt < 22 && e.az > 255 && e.az < 263);
});
test('LMT farkı 1 sa 55 dk 54,816 sn', () => assert.strictEqual(A.S.lmtOffset, 6954.816));

/* 17 Ekim 2026 denetimi sonrası eklenen denetimler */
const DEG = 180 / Math.PI, RAD = Math.PI / 180;
function paTo(ra1, de1, ra2, de2) { const a = (ra2 - ra1) * RAD, d1 = de1 * RAD, d2 = de2 * RAD; return A.wrap360(Math.atan2(Math.sin(a) * Math.cos(d2), Math.cos(d1) * Math.sin(d2) - Math.sin(d1) * Math.cos(d2) * Math.cos(a)) * DEG); }
test('Kuyruk yönü (PA) tarih çerçevesinde: Güneş’ten uzağa bakan büyük daireyle 0,02° içinde', () => {
  let worst = 0, n = 0;
  for (let t = A.RANGE.min; t <= A.RANGE.max; t += 600e3) {
    const h = A.halley(t), s = A.bodyEq('Sun', t); if (A.sep(h.ra, h.dec, s.ra, s.dec) < 3) continue;   // kavuşumda yön tanımsızlaşır
    worst = Math.max(worst, Math.abs(A.wrap180(h.pa - (paTo(h.ra, h.dec, s.ra, s.dec) + 180)))); n++;
  }
  assert.ok(n > 6000); assert.ok(worst < 0.02, 'en büyük ' + worst);
});
test('Halley örnekleri yayımlanan zaman aralığını iki uçta da kuşatır', () => {
  const H = A.S.halley, last = H.t0 + (H.ra.length - 1) * H.step * 1000, lastSlow = H.t0 + (H.delta.length - 1) * 3600e3;
  assert.ok(H.t0 <= A.RANGE.min && last >= A.RANGE.max && lastSlow >= A.RANGE.max);
  assert.notStrictEqual(A.halley(A.RANGE.min).ra, A.halley(A.RANGE.min + 120e3).ra);
  assert.notStrictEqual(A.halley(A.RANGE.max - 120e3).ra, A.halley(A.RANGE.max).ra);
});
test('Güneş geçişi verisi: giriş 05:34:49, en yakın 06:04:24, çıkış 06:33:53 LMT (saniyesi atılmış)', () => {
  global.window.TRANSIT = null; eval(fs.readFileSync(R('data/transit.js'), 'utf8'));
  const e = window.TRANSIT.events.map(x => x.lmt.slice(11, 19));
  assert.deepStrictEqual(e, ['05:34:49', '06:04:24', '06:33:53']);
});
