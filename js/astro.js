/* Halley Geceleri — astronomik yardımcılar.
   Veri: data/sky.js (NASA/JPL Horizons + astronomy-engine + Hipparcos). Ayrıntı: docs/05-bilim.md */
'use strict';
(function () {
  const S = window.SKY;
  const RAD = Math.PI / 180, DEG = 180 / Math.PI;
  const LMT = S.lmtOffset * 1000;               // ms; UT + 1 sa 55 dk 54,816 sn
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const wrap360 = v => ((v % 360) + 360) % 360;
  const wrap180 = v => ((v + 180) % 360 + 360) % 360 - 180;

  /* LMT dizgesinden UT milisaniyesine: '1910-05-10T03:30' */
  function lmtToUT(str) { return Date.parse(str + ':00Z') - LMT; }
  function utToLMTParts(ut) {
    const d = new Date(ut + LMT);
    return { y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes(), s: d.getUTCSeconds() };
  }
  const AYLAR = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz'];
  const pad = n => String(n).padStart(2, '0');
  function fmtLMT(ut, sec) { const p = utToLMTParts(ut); return pad(p.h) + ':' + pad(p.mi) + (sec ? ':' + pad(p.s) : ''); }
  function fmtDate(ut) { const p = utToLMTParts(ut); return p.d + ' ' + AYLAR[p.mo] + ' ' + p.y; }
  function fmtUT(ut) { const d = new Date(ut); return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()); }
  const RANGE = { min: S.bodies.t0, max: S.bodies.t0 + (S.bodies.ra.Sun.length - 2) * 3600e3 };

  /* Görünür (gerçek) yıldız zamanı, derece: ortalama yıldız zamanı + ekinoks denklemi (Δψ·cos ε).
     Görünür RA/Dec tarihin GERÇEK ekinoksuna göre olduğundan saat açısı da gerçek yıldız zamanıyla alınır.
     Nütasyon kısaltılmış seriyle (~0,5″); ut sayısal olarak Horizons’un 1910 için verdiği UT’dir (UT1, UTC değil). */
  function gmst(ut) {
    const jd = ut / 86400000 + 2440587.5, T = (jd - 2451545) / 36525;
    const mean = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - T * T * T / 38710000;
    const Om = (125.04452 - 1934.136261 * T) * RAD, Ls = (280.4665 + 36000.7698 * T) * RAD, Lm = (218.3165 + 481267.8813 * T) * RAD;
    const dpsi = -17.20 * Math.sin(Om) - 1.32 * Math.sin(2 * Ls) - 0.23 * Math.sin(2 * Lm) + 0.21 * Math.sin(2 * Om);   // yay saniyesi
    const eps = (23.4392911 - 0.0130042 * T) * RAD;
    return wrap360(mean + dpsi * Math.cos(eps) / 3600);
  }

  function interpAngle(a, b, f) { return wrap360(a + wrap180(b - a) * f); }
  function series(arr, t0, step, t, angle) {
    const x = clamp((t - t0) / step, 0, arr.length - 1.0001), i = Math.floor(x), f = x - i;
    return angle ? interpAngle(arr[i], arr[i + 1], f) : arr[i] + (arr[i + 1] - arr[i]) * f;
  }

  function bodyEq(name, ut) {
    const B = S.bodies;
    return { ra: series(B.ra[name], B.t0, 3600e3, ut, true), dec: series(B.dec[name], B.t0, 3600e3, ut) };
  }
  function bodyMag(name, ut) { const B = S.bodies; return series(B.mag[name], B.t0, 3600e3, ut); }
  function bodyFrac(name, ut) { const B = S.bodies; return series(B.frac[name], B.t0, 3600e3, ut); }
  /* Güneş ve Ay için topo-merkezli uzaklıktan görünür yarıçap (derece) */
  const RADIUS_KM = { Sun: 695700, Moon: 1737.4 }, AU_KM = 149597870.7;
  function bodyRadius(name, ut) { const B = S.bodies; if (!B.dist || !B.dist[name]) return name === 'Moon' ? 0.259 : 0.263; return Math.asin(RADIUS_KM[name] / (series(B.dist[name], B.t0, 3600e3, ut) * AU_KM)) * DEG; }

  function halley(ut) {
    const H = S.halley;
    return {
      ra: series(H.ra, H.t0, 600e3, ut, true), dec: series(H.dec, H.t0, 600e3, ut),
      delta: series(H.delta, H.t0, 3600e3, ut), r: series(H.r, H.t0, 3600e3, ut),
      sot: series(H.sot, H.t0, 3600e3, ut), sto: series(H.sto, H.t0, 3600e3, ut),
      pa: series(H.pa, H.t0, (H.paStep || 3600) * 1000, ut, true), tmag: series(H.tmag, H.t0, 3600e3, ut)
    };
  }

  /* Ekvator (derece) -> birim vektör */
  function eqVec(ra, dec) { const a = ra * RAD, d = dec * RAD, c = Math.cos(d); return [c * Math.cos(a), c * Math.sin(a), Math.sin(d)]; }
  /* Ekvatoral birim vektörü yatay (Doğu, Kuzey, Yukarı) vektöre çeviren matris */
  function horizonMatrix(ut, lat, lon) {
    const L = (gmst(ut) + lon) * RAD, f = lat * RAD, cL = Math.cos(L), sL = Math.sin(L), cf = Math.cos(f), sf = Math.sin(f);
    return [-sL, cL, 0, -sf * cL, -sf * sL, cf, cf * cL, cf * sL, sf];
  }
  function mul(M, v) { return [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[3] * v[0] + M[4] * v[1] + M[5] * v[2], M[6] * v[0] + M[7] * v[1] + M[8] * v[2]]; }
  function mulT(M, v) { return [M[0] * v[0] + M[3] * v[1] + M[6] * v[2], M[1] * v[0] + M[4] * v[1] + M[7] * v[2], M[2] * v[0] + M[5] * v[1] + M[8] * v[2]]; }
  function horAzAlt(h) { return { az: wrap360(Math.atan2(h[0], h[1]) * DEG), alt: Math.asin(clamp(h[2], -1, 1)) * DEG }; }
  function azAltVec(az, alt) { const a = az * RAD, e = alt * RAD, c = Math.cos(e); return [c * Math.sin(a), c * Math.cos(a), Math.sin(e)]; }

  /* Sæmundsson kırılması (10 °C, 1010 hPa); görünen yükseklik = geometrik + R */
  function refraction(alt) {
    if (alt < -1.5) return 0;
    const h = Math.max(alt, -1.5);
    return 1.02 / Math.tan((h + 10.3 / (h + 5.11)) * RAD) / 60;
  }
  function airmass(alt) { const h = Math.max(alt, 0); return 1 / (Math.sin(h * RAD) + 0.50572 * Math.pow(h + 6.07995, -1.6364)); }

  /* Gök üzerinde konum açısı (PA) yönünde theta derece ilerlenen nokta */
  function offsetPA(ra, dec, pa, theta) {
    const d = dec * RAD, t = theta * RAD, p = pa * RAD;
    const d2 = Math.asin(Math.sin(d) * Math.cos(t) + Math.cos(d) * Math.sin(t) * Math.cos(p));
    const a2 = ra * RAD + Math.atan2(Math.sin(p) * Math.sin(t) * Math.cos(d), Math.cos(t) - Math.sin(d) * Math.sin(d2));
    return { ra: wrap360(a2 * DEG), dec: d2 * DEG };
  }
  function sep(ra1, dec1, ra2, dec2) {
    const a = eqVec(ra1, dec1), b = eqVec(ra2, dec2);
    return Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1)) * DEG;
  }

  /* Coğrafi: gözlem noktasından hedefe yön ve görünür yükseklik (Dünya eğriliği + standart kırılma k=0,13) */
  function geoView(from, lat, lon, elev) {
    const R = 6371000, la1 = from.lat * RAD, la2 = lat * RAD, dl = (lon - from.lon) * RAD;
    const y = Math.sin(dl) * Math.cos(la2), x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dl);
    const az = wrap360(Math.atan2(y, x) * DEG);
    const a = Math.sin((la2 - la1) / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dl / 2) ** 2;
    const dist = 2 * R * Math.asin(Math.sqrt(a));
    const drop = dist * dist * (1 - 0.13) / (2 * R);
    return { az, dist, alt: Math.atan2(elev - from.eye - drop, dist) * DEG };
  }

  window.Astro = { S, RAD, DEG, LMT, RANGE, clamp, wrap360, wrap180, lmtToUT, utToLMTParts, fmtLMT, fmtDate, fmtUT, AYLAR, gmst,
    bodyEq, bodyMag, bodyFrac, bodyRadius, halley, eqVec, horizonMatrix, mul, mulT, horAzAlt, azAltVec, refraction, airmass, offsetPA, sep, geoView };
})();
