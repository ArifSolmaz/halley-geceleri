/* Halley verisini Horizons ham yanıtından yeniden üretir ve data/sky.js içindeki SKY.halley alanını yerinde değiştirir.
   Kullanım (proje kökünde):  npm i --no-save astronomy-engine@2.1.19 && node tools/build_halley.js
   Yıldız/Samanyolu verisine (vendor/) gerek yoktur; tools/build_sky.js aynı Halley mantığını bu dosyadan alır.

   Düzeltmeler (17 Ekim 2026 denetimi):
   1) Kayıt aralığı: yayımlanan zaman aralığını (RANGE: 19 Nisan 22:04:05,184 UT – 10 Haziran 22:04:05,184 UT) her iki uçta
      en az bir örnekle KUŞATIR; aralık uçlarında konum artık sabitlenmez.
   2) Kuyruk yönü: Horizons PsAng (nicelik 27) referans sistemin (ICRF/J2000) kuzey kutbuna göre ölçülür; görünür RA/Dec ise
      tarihin gerçek ekvatoru ve ekinoksuna göredir. Her örnekte J2000 kutbunun, kuyrukluyıldızın konumunda tarih
      çerçevesindeki konum açısı hesaplanıp PsAng'a eklenir (presesyon + nütasyon, astronomy-engine Rotation_EQJ_EQD).
   3) PA 1 saat yerine 10 dakikada bir saklanır: 19 Mayıs Güneş kavuşumu yakınında yön hızla döner. */
const fs = require('fs'), path = require('path');
const AE = require(process.env.ASTRONOMY_ENGINE || 'astronomy-engine');
const ROOT = path.join(__dirname, '..');
const RAD = Math.PI / 180, DEG = 180 / Math.PI;

function parseRaw() {
  const raw = fs.readFileSync(path.join(ROOT, 'research/raw/halley.txt'), 'utf8');
  const body = raw.split('$$SOE')[1].split('$$EOE')[0].trim().split('\n');
  const mon = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6 };
  return body.map(line => {
    const c = line.split(',').map(s => s.trim()); const m = c[0].match(/(\d+)-(\w+)-(\d+) (\d+):(\d+)/);
    // 0 tarih,1 jd,2-3 bayrak,4-5 RA/DEC icrf,6-7 RA/DEC görünür (tarih),8 az,9 yük,10 Tmag,11 Nmag,12 r,13 rdot,14 delta,15 deldot,16 SOT,17 /r,18 STO,19 PsAng,20 PsAMV,21 Cnst
    return { t: Date.UTC(+m[1], mon[m[2]], +m[3], +m[4], +m[5]), ra: +c[6], dec: +c[7], az: +c[8], el: +c[9], tmag: +c[10], r: +c[12], delta: +c[14], sot: +c[16], sto: +c[18], psang: +c[19] };
  });
}
/* J2000 kutbunun, tarih çerçevesinde (ra, dec) noktasından görülen konum açısı (derece, kuzeyden doğuya) */
function poleOffset(t, raDeg, decDeg) {
  const time = AE.MakeTime(new Date(t)), rot = AE.Rotation_EQJ_EQD(time);
  const n = AE.RotateVector(rot, new AE.Vector(0, 0, 1, time));
  const a = raDeg * RAD, d = decDeg * RAD;
  const E = [-Math.sin(a), Math.cos(a), 0], N = [-Math.sin(d) * Math.cos(a), -Math.sin(d) * Math.sin(a), Math.cos(d)];
  return Math.atan2(n.x * E[0] + n.y * E[1] + n.z * E[2], n.x * N[0] + n.y * N[1] + n.z * N[2]) * DEG;
}
const wrap360 = v => ((v % 360) + 360) % 360;

function build(T0, T1) {
  const rows = parseRaw();
  // her iki uçta kuşatan örnek: T0'dan önceki ilk ve T1'den sonraki ilk saatlik örnek (yavaş diziler saatlik)
  let i0 = rows.findIndex(r => r.t > T0) - 1; while (i0 > 0 && (rows[i0].t % 3600e3) !== 0) i0--;      // saat başına hizala
  let i1 = rows.findIndex(r => r.t >= T1); if (i1 < 0) throw new Error('ham veri T1’i kapsamıyor');
  while (i1 < rows.length - 1 && ((rows[i1].t - rows[i0].t) % 3600e3) !== 0) i1++;
  if (i0 < 0 || rows[i0].t > T0 || rows[i1].t < T1) throw new Error('ham veri aralığı kuşatmıyor');
  const sel = rows.slice(i0, i1 + 1);
  const r4 = x => Math.round(x * 1e4) / 1e4, r2 = x => Math.round(x * 100) / 100, r3 = x => Math.round(x * 1000) / 1000;
  const H = { t0: sel[0].t, step: 600, slowStep: 3600, paStep: 600, ra: [], dec: [], delta: [], r: [], sot: [], sto: [], pa: [], tmag: [],
    paFrame: 'tarihin gerçek ekvatoru (PsAng ICRF kuzeyinden döndürüldü)' };
  const VAL = [], DIAG = [];
  sel.forEach((s, k) => {
    H.ra.push(r4(s.ra)); H.dec.push(r4(s.dec)); VAL.push([s.t, s.az, s.el]);
    const off = poleOffset(s.t, s.ra, s.dec); H.pa.push(r3(wrap360(s.psang + off))); DIAG.push([s.t, off]);
    if (k % 6 === 0) { H.delta.push(+s.delta.toFixed(5)); H.r.push(+s.r.toFixed(4)); H.sot.push(r2(s.sot)); H.sto.push(r2(s.sto)); H.tmag.push(r2(s.tmag)); }
  });
  return { H, VAL, DIAG };
}
module.exports = { build, parseRaw, poleOffset };

if (require.main === module) {
  global.window = {};
  const skyPath = path.join(ROOT, 'data/sky.js'); const src = fs.readFileSync(skyPath, 'utf8');
  new Function('window', src)(global.window); const SKY = global.window.SKY;
  const T0 = SKY.bodies.t0, T1 = SKY.bodies.t0 + (SKY.bodies.ra.Sun.length - 2) * 3600e3;   // js/astro.js RANGE ile aynı
  const { H, VAL, DIAG } = build(T0, T1);
  SKY.halley = H;
  SKY.note = SKY.note.replace(/Halley:[^.]*\./, 'Halley: NASA/JPL Horizons SAO/1910 topocentric apparent RA/Dec (true equator & equinox of date), 10 min; PsAng rotated from ICRF north to the true north of date, 10 min.');
  const head = src.split('\n')[0];
  fs.writeFileSync(skyPath, head + '\nwindow.SKY=' + JSON.stringify(SKY) + ';\n');
  fs.writeFileSync(path.join(ROOT, 'tests/horizons_azel.json'), JSON.stringify(VAL));
  const offs = DIAG.map(d => d[1]);
  console.log('Halley örnekleri', H.ra.length, new Date(H.t0).toISOString(), '→', new Date(H.t0 + (H.ra.length - 1) * 600e3).toISOString());
  console.log('Yayın aralığı', new Date(T0).toISOString(), '→', new Date(T1).toISOString());
  console.log('Kutup dönmesi (PA düzeltmesi) en az/en çok', Math.min(...offs).toFixed(3), Math.max(...offs).toFixed(3), '°');
}
