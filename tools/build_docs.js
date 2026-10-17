/* docs/02-senaryo.md ve docs/06-son-degerlendirme.md belgelerini js/film.js içindeki plan listesinden üretir.
   Kullanım: node tools/build_docs.js  (proje kökünde) */
const fs = require('fs'), path = require('path'), R = p => path.join(__dirname, '..', p);
global.window = { matchMedia: () => ({ matches: false }) };
for (const f of ['data/sky.js', 'data/pano.js', 'js/astro.js', 'js/landscape.js']) eval(fs.readFileSync(R(f), 'utf8'));
window.Figures = { ease: t => t, clamp: (v, a, b) => Math.min(b, Math.max(a, v)), mix: (a, b, t) => a + (b - a) * t, R: n => 0 };
eval(fs.readFileSync(R('data/photos.js'), 'utf8'));
eval(fs.readFileSync(R('js/film.js'), 'utf8'));
const { Film, FilmWho: WHO, Astro: A, Landscape: L } = window;
const S = Film.SHOTS, SEQ = Film.SEQ;
const KIND = { alinti: 'doğrudan alıntı', ses: 'ses', not: 'not', senaryo: 'özgün senaryo' };
const all = [];
for (const s of S) { all.push(s); if (s.id === 'ii0') for (const k of ['matbaa', 'kahve', 'ev']) SEQ[k].forEach(x => all.push(Object.assign({ branch: k }, x))); }
function skyLine(s) {
  if (!s.sky) return '';
  const vp = L.VIEWPOINTS[s.sky.vp]; const t0 = A.lmtToUT(s.sky.t0); const M = A.horizonMatrix(t0, vp.lat, vp.lon);
  const h = A.halley(t0), hh = A.horAzAlt(A.mul(M, A.eqVec(h.ra, h.dec))); const su = A.bodyEq('Sun', t0), sh = A.horAzAlt(A.mul(M, A.eqVec(su.ra, su.dec)));
  return `Hesap (${s.sky.t0.replace('T', ' ')} LMT, ${vp.short}): Halley az. ${hh.az.toFixed(1)}°, yük. ${hh.alt.toFixed(1)}° · Güneş yük. ${sh.alt.toFixed(1)}°.`;
}
let md = `# Sahne senaryosu\n\n_Bu belge \`js/film.js\` içindeki plan listesinden \`tools/build_docs.js\` ile üretilmiştir. Deneyimde görülen her söz burada türüyle birlikte yer alır._\n\nTürler: **özgün senaryo** (bu deneyim için yazıldı; tarihî alıntı değildir) · **doğrudan alıntı** (belgeden; çevriyazı bu çalışmanındır) · **ses** (ses betimi, altyazıda köşeli parantezle) · **not** (bilgi notu).\n\nKarakterler kurmacadır ve görüntüde yer almazlar; yalnız sesleri ve altyazıları vardır: Rıza (fotoğrafhane çırağı, 17), Münevver (Darülmuallimat mezunu, 20), Yusuf (gazete satan çocuk, 11), Nazife Hanım (Münevver’in annesi), Hasan Efendi (Münevver’in babası, posta memuru). Gerçek tarihsel kişilere söz ya da eylem verilmez.\n\n`;
let ch = '';
for (const s of all) {
  if (s.ch !== ch) { ch = s.ch; md += `\n## ${ch}\n\n`; }
  md += `### ${s.id}${s.branch ? ` (seçmeli: ${s.branch})` : ''} — ${s.slate ? s.slate.join(' · ') : (s.mode === 'photo' ? 'Görüntü: ' + s.photo.layers.map(L => L.src.split('/').pop()).join(' → ') : s.mode === 'set' ? 'Bilimsel çizim' : s.mode === 'sky' ? (s.glass ? 'Odak camı: hesaplanan gök' : 'Dış: hesaplanan gök + Berggren panoraması') : s.mode)} · ${s.dur} sn\n\n`;
  if (s.eval) md += `${s.eval.gorunur}\n\n`;
  const sl = skyLine(s); if (sl) md += `> ${sl}\n\n`;
  if (s.wait) md += `**Etkileşim:** ${s.wait.type === 'search' ? 'arama — ' + s.wait.steps.map(x => x.prompt).join(' → ') : s.wait.type === 'choice' ? 'seçim — ' + s.wait.prompt + ' (' + s.wait.options.map(o => o.title).join(', ') + ')' : 'serbest bakış — ' + s.wait.prompt}\n\n`;
  for (const sb of (s.subs || [])) md += `- ${sb.who ? `**${WHO[sb.who]}:** ` : ''}${sb.kind === 'ses' ? `[${sb.text}]` : sb.text} _(${KIND[sb.kind || 'senaryo']}${sb.src ? '; ' + sb.src.label : ''})_\n`;
  if (s.final) md += `- **Son cümle:** ${s.final.text} _(özgün senaryo)_\n`;
  md += '\n';
}
fs.writeFileSync(R('docs/02-senaryo.md'), md);
let ev = `# Son değerlendirme: her plan için altı soru\n\n_Bu tablo \`js/film.js\` içindeki “eval” alanlarından üretilmiştir; deneyimdeki her plan için aynı altı soru cevaplanır._\n\n`;
for (const s of all) {
  if (!s.eval) continue; const e = s.eval;
  ev += `## ${s.id} · ${s.ch}${s.slate ? ' · ' + s.slate[0] : ''}\n\n| Soru | Cevap |\n|---|---|\n| Bu bakış noktasından ne görünür? | ${e.gorunur} |\n| Bu saatte gökyüzü nasıl olur? | ${e.gok}${skyLine(s) ? ' ' + skyLine(s) : ''} |\n| Bu nesne 1910’a ait olabilir mi? | ${e.nesne} |\n| Bu söz belge mi, uyarlama mı? | ${e.soz} |\n| Bu insan burada neden bulunuyor? | ${e.neden} |\n| Bu kesme hangi duyguyu taşıyor? | ${e.kesme} |\n\n`;
}
fs.writeFileSync(R('docs/06-son-degerlendirme.md'), ev);
// Yer işaretleri tablosu (Galata Kulesi gözlem noktası) ve panorama levha kalibrasyonu
let lm = '| Yapı | Yön (az.) | Yükseklik açısı (tepe) | Uzaklık |\n|---|---|---|---|\n';
for (const m of L.get('teras').marks) lm += `| ${m.name} | ${m.az.toFixed(1)}° | ${m.alt.toFixed(2)}° | ${(m.dist / 1000).toFixed(2)} km |\n`;
lm += '\n| Levha | Yön aralığı | Ölçek (px/°) | Ufuk satırı |\n|---|---|---|---|\n';
for (const p of window.PANO.panels) lm += `| ${p.k} | ${p.az0.toFixed(1)}° – ${(p.az0 + p.w / p.s).toFixed(1)}° | ${p.s} | ${p.yh} |\n`;
fs.writeFileSync(R('tools/yonler.md'), lm);
const total = S.reduce((a, s) => a + s.dur, 0) + Object.values(SEQ).flat().reduce((a, s) => a + s.dur, 0) + 28;
console.log('plan sayısı', all.length, 'toplam süre ~', Math.round(total / 60 * 10) / 10, 'dk');
