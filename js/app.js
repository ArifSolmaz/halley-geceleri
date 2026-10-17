/* Halley Geceleri — arayüz bağlantıları */
'use strict';
(function () {
  const $ = id => document.getElementById(id), A = window.Astro, F = window.Figures, html = document.documentElement, body = document.body;
  const WHO = window.FilmWho;
  const fmt = (n, d = 1) => n.toFixed(d).replace('.', ',').replace('-', '−');

  /* ---------- tercihler ---------- */
  const store = { get(k) { try { return localStorage.getItem('halley.' + k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem('halley.' + k, v); } catch (e) { } } };
  const prefs = { motion: store.get('motion') === '1' || matchMedia('(prefers-reduced-motion: reduce)').matches, large: store.get('large') === '1', lite: store.get('lite') === '1' };
  function applyPrefs() { html.classList.toggle('reduce', prefs.motion); html.classList.toggle('large', prefs.large); $('pref-motion').checked = prefs.motion; $('pref-large').checked = prefs.large; $('pref-lite').checked = prefs.lite; }
  applyPrefs();
  ['motion', 'large', 'lite'].forEach(k => $('pref-' + k).addEventListener('change', e => { prefs[k] = e.target.checked; store.set(k, prefs[k] ? '1' : '0'); applyPrefs(); if (k === 'lite') location.reload(); if (k === 'motion') { sky.reduced = prefs.motion; film.reduced = prefs.motion; } }));

  /* ---------- gök, sahne, film ---------- */
  const sky = new window.Sky($('sky'), { quality: prefs.lite ? 0.6 : 1 });
  sky.reduced = prefs.motion;
  const stage = new window.Stage($('set'), sky);
  try { $('grain').style.backgroundImage = `url(${F.grainPNG()})`; } catch (e) { }

  let mode = 'gate';
  function setMode(m) { mode = m; body.classList.remove('mode-gate', 'mode-film', 'mode-sky'); body.classList.add('mode-' + m); if (m === 'sky') { sky.opt.interactive = true; Object.assign(sky.opt, panelOpts()); sky.selected = null; stage.clear(); updatePanel(); requestSkyFrame(); } }

  /* ---------- altyazı ---------- */
  const subsBox = $('subs'); let subTimer = null, currentSub = null;
  function subHTML(sb) {
    const who = sb.who ? `<span class="who">${WHO[sb.who] || sb.who}</span>` : '';
    const cls = 'sub on ' + (sb.kind === 'alinti' ? 'quote' : sb.kind === 'ses' ? 'sound' : sb.kind === 'not' ? 'note' : '');
    let src = '';
    if (sb.src) src = `<span class="src">${sb.kind === 'alinti' ? 'Doğrudan alıntı (çevriyazı) · ' : ''}${sb.src.label} · <button type="button" data-doc="${sb.src.id}">belgeyi aç</button></span>`;
    else if (!sb.kind || sb.kind === 'senaryo') src = '';
    const text = sb.kind === 'ses' ? `[${sb.text}]` : sb.text;
    return `<span class="${cls}">${who}${text}${src}</span>`;
  }
  function showSub(sb) { if (currentSub === sb) return; currentSub = sb; subsBox.innerHTML = sb ? subHTML(sb) : ''; }
  subsBox.addEventListener('click', e => { const b = e.target.closest('[data-doc]'); if (b) openDoc(b.dataset.doc, true); });
  let adhoc = null;
  function say(sb, secs) { adhoc = { sb, until: performance.now() + secs * 1000 }; showSub(sb); }

  /* ---------- etkileşim katmanı ---------- */
  const hotBox = $('hotspots'); let hotEls = [];
  function clearHot() { hotBox.innerHTML = ''; hotEls = []; }
  function hideInteract() { clearHot(); }
  function hotButton(label, onClick, cls = '') { const b = document.createElement('button'); b.type = 'button'; b.className = 'hot ' + cls; b.innerHTML = `<span class="ring" aria-hidden="true"></span><span class="lbl">${label}</span>`; b.setAttribute('aria-label', label); b.addEventListener('click', onClick); hotBox.appendChild(b); return b; }

  /* ---------- fotoğraf künyesi ---------- */
  const PH = window.PHOTOS || {};
  function capHTML(c) {
    if (!c) return '';
    if (c.k === 'belge') { const i = c.text.indexOf(' · ', c.text.indexOf(' · ') + 3); return `<span class="kind">belge</span>${i > 0 ? c.text.slice(0, i) + '<span class="more">' + c.text.slice(i) + '</span>' : c.text}`; }
    const m = PH[c.k]; if (!m) return '';
    const kind = c.k === 'berggren' ? 'fotoğraf + hesap' : 'arşiv fotoğrafı';
    return `<span class="kind">${kind}</span><b>${m.title}</b> · ${m.date} <i>(${m.gap})</i><span class="more"> · ${m.who} · ${m.rights}${c.note ? ' · ' + c.note : ''}</span>${m.warn ? `<span class="warn">${m.warn}</span>` : ''}`;
  }
  let capKey = null;
  function setCap(s, p) {
    let c = s.cap; if (Array.isArray(c)) c = c.find(x => (x.from == null || p >= x.from) && (x.to == null || p < x.to));
    const key = c ? (c.k + (c.text || '') + (c.note || '')) : null; if (key === capKey) return; capKey = key;
    const el = $('photo-cap'); el.innerHTML = capHTML(c); el.classList.toggle('on', !!c);
  }

  const ui = {
    onPlay(on) { $('p-play').textContent = on ? '❚❚' : '▶'; $('p-play').setAttribute('aria-label', on ? 'Duraklat' : 'Sürdür'); },
    onShot(s, f) {
      clearHot(); adhoc = null; showSub(null);
      body.classList.toggle('letterbox', !!s.letterbox);
      const slate = $('slate');
      if (s.slate) { slate.innerHTML = `<b>${s.slate[0]}</b>${s.slate[1]}`; slate.classList.add('on'); clearTimeout(ui._sl); ui._sl = setTimeout(() => slate.classList.remove('on'), 6500); } else slate.classList.remove('on');
      $('title-card').classList.toggle('on', s.mode === 'title');
      $('final-line').classList.remove('on');
      if (ui._card) { ui._card.remove(); ui._card = null; }
      sky.opt.interactive = !!s.live; $('sky').style.pointerEvents = s.live ? 'auto' : 'none';
      if (s.hot) s.hot.forEach(h => { h.el = hotButton(h.label, () => hotAction(h.act)); h.el.style.display = 'none'; hotEls.push(h); });
      // bölüm seçici
      const sel = $('p-chapters'), chs = f.chapters(); sel.innerHTML = chs.map(c => `<option value="${c.i}">${c.ch}</option>`).join('');
      const cur = chs.filter(c => c.i <= f.i).pop(); if (cur) sel.value = cur.i;
      if (s.in === 'fade') fadeIn();
      capKey = undefined; setCap(s, 0);
    },
    onFrame(s, t, p, f) {
      setCap(s, p);
      // altyazılar
      if (adhoc && performance.now() < adhoc.until) showSub(adhoc.sb);
      else { adhoc = null; const sb = (s.subs || []).find(x => t >= x.at && t < x.at + x.dur); showSub(sb || null); }
      // etkileşim noktaları
      for (const h of hotEls) { const vis = t >= h.from && t <= h.to; h.el.style.display = vis ? '' : 'none'; if (vis) { const q = stage.toScreen(h.at[0], h.at[1]); h.el.style.left = q.x + 'px'; h.el.style.top = q.y + 'px'; } }
      $('p-progress').firstElementChild.style.width = (100 * f.elapsed() / f.totalDur()) + '%';
      $('p-progress').setAttribute('aria-valuenow', Math.round(100 * f.elapsed() / f.totalDur()));
      if (s.final && t >= s.final.at) { const el = $('final-line'); if (!el.classList.contains('on')) { el.textContent = s.final.text; el.classList.add('on'); } }
    },
    onEnd() { $('final-line').classList.remove('on'); enterSky(true); toast('Aynı gökyüzündesiniz. Zamanı ve bakış yönünü değiştirebilir, belgeleri açabilirsiniz.', 7000); },
    showChoice(w, done, pick) {
      clearHot();
      const box = document.createElement('div'); box.className = 'choice-row'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', w.prompt);
      const pr = document.createElement('p'); pr.className = 'prompt'; pr.style.cssText = 'position:static;transform:none;width:100%;margin:0 0 6px'; pr.textContent = w.prompt; box.appendChild(pr);
      w.options.forEach(o => { const b = document.createElement('button'); b.type = 'button'; b.className = 'choice'; b.innerHTML = `<b>${o.title}</b><span>${o.sub}</span>`; if (done[o.id]) { b.setAttribute('aria-disabled', 'true'); b.disabled = true; } b.addEventListener('click', () => pick(o.id)); box.appendChild(b); });
      hotBox.appendChild(box); const first = box.querySelector('.choice:not([disabled])'); if (first) first.focus({ preventScroll: true });
    },
    showSearch(w, stepIdx, skip) {
      clearHot();
      const step = w.steps ? w.steps[stepIdx] : w;
      const pr = document.createElement('p'); pr.className = 'prompt'; pr.innerHTML = `${step.prompt}<small>${step.hint || ''}</small>`; hotBox.appendChild(pr);
      const b = document.createElement('button'); b.type = 'button'; b.className = 'txt'; b.style.cssText = 'position:absolute;right:16px;top:50%;pointer-events:auto;background:rgba(5,8,12,.6)'; b.textContent = w.type === 'continue' ? 'Devam et ⟩' : 'Göster ⟩'; b.addEventListener('click', skip); hotBox.appendChild(b);
      $('sky').focus({ preventScroll: true });
    },
    hideInteract, say,
    card(name, p) {
      if (!ui._card) {
        const d = document.createElement('div'); d.className = 'interlude'; d.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center;z-index:5;padding:24px;pointer-events:auto';
        d.innerHTML = `<div style="max-width:640px;text-align:center"><p class="kicker">Edebî araoyun</p>
          <h2 style="font:400 clamp(1.6rem,1.2rem + 2vw,2.6rem)/1.15 var(--display);color:var(--stone);margin:.2rem 0 1rem">Kuyruklu Yıldız Altında Bir İzdivaç</h2>
          <p style="color:var(--text-2)">Hüseyin Rahmi Gürpınar’ın romanı, Halley korkusu sürerken <i>Sabah</i> gazetesinde tefrika edildi (12 Nisan – 26 Mayıs 1326 Rumî; 25 Nisan – 8 Haziran 1910). Korkuyu bir İstanbul mahallesinin evlilik telaşı ve dedikodusu içinde hicveder.</p>
          <blockquote style="margin:1rem auto;max-width:520px;font:italic 1.15rem/1.5 var(--body);color:var(--stone)">“Ne baş ağrısı ne nezle hemen hiçbir şey hissetmeyeceğiz.”<span style="display:block;font:400 .72rem var(--mono);letter-spacing:.08em;color:var(--text-2);margin-top:.4rem">ROMANIN GİRİŞİNDEN · TDK BASKISI, s. 34</span></blockquote>
          <p class="limit" style="text-align:left">Bu bir romandır. Konuşmaları İstanbul halkından alınmış röportajlar ya da tanıklıklar değildir.</p>
          <p><button type="button" class="link" data-doc="gurpinar">Künyeyi ve kaynağı aç</button></p></div>`;
        d.addEventListener('click', e => { const b = e.target.closest('[data-doc]'); if (b) openDoc(b.dataset.doc, true); });
        $('stage').appendChild(d); ui._card = d;
      }
      ui._card.style.opacity = Math.min(1, p * 6, (1 - p) * 6);
      $('photo-cap').classList.remove('on');
    }
  };
  function hotAction(act) {
    if (act.startsWith('doc:')) openDoc(act.slice(4), true);
    else if (act === 'say:letter') say({ kind: 'not', text: 'Mektup kurmacadır. 1910’da Darülmuallimat mezunlarının taşra kız rüşdiyelerine atanması ve burs karşılığı mecburi hizmet belgelidir (bkz. Yöntem).' }, 6);
  }
  function fadeIn() { const f = document.createElement('div'); f.style.cssText = 'position:absolute;inset:0;background:#000;z-index:4;pointer-events:none;transition:opacity 1.6s'; $('stage').appendChild(f); requestAnimationFrame(() => requestAnimationFrame(() => { f.style.opacity = 0; setTimeout(() => f.remove(), 1800); })); }

  const film = new window.Film({ sky, stage, ui });
  film.reduced = prefs.motion;
  sky.on('select', obj => { if (mode === 'film') film.onPick(obj); else showInfo(obj); });

  /* ---------- başlangıç ---------- */
  async function startFilm(withSound) {
    if (withSound) { const ok = await window.Sound.enable(); $('p-sound').setAttribute('aria-pressed', ok ? 'true' : 'false'); }
    setMode('film'); film.start(0); idleTimer();
  }
  $('start-sound').addEventListener('click', () => startFilm(true));
  $('start-silent').addEventListener('click', () => startFilm(false));
  $('go-sky').addEventListener('click', () => enterSky(false));
  $('go-archive').addEventListener('click', () => openArchive());

  /* ---------- oynatıcı ---------- */
  $('p-play').addEventListener('click', () => film.toggle());
  $('p-next').addEventListener('click', () => film.next());
  $('p-prev').addEventListener('click', () => film.prev());
  $('p-chapters').addEventListener('change', e => film.goto(+e.target.value));
  $('p-sound').addEventListener('click', async () => { if (window.Sound.enabled) { window.Sound.disable(); $('p-sound').setAttribute('aria-pressed', 'false'); } else { await window.Sound.enable(); $('p-sound').setAttribute('aria-pressed', 'true'); const s = film.shot; if (s && s.sound && s.sound.scene) window.Sound.scene(s.sound.scene, 1); } });
  $('p-docs').addEventListener('click', () => { film.pause(); openArchive(); });
  $('p-sky').addEventListener('click', () => enterSky(true));
  let idleT; function idleTimer() { body.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(() => { if (mode === 'film') body.classList.add('idle'); }, 3500); }
  ['pointermove', 'keydown', 'pointerdown'].forEach(ev => window.addEventListener(ev, idleTimer, { passive: true }));
  window.addEventListener('keydown', e => {
    if (document.querySelector('dialog[open]')) return;
    if (mode === 'film') { if (e.key === ' ' && e.target === document.body) { e.preventDefault(); film.toggle(); } else if (e.key === 'ArrowRight' && !film.shot.live) film.next(); else if (e.key === 'ArrowLeft' && !film.shot.live) film.prev(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'film' && film.playing) { film.pause(); film._autoPaused = true; } });

  /* ---------- serbest gözlem ---------- */
  let skyRAF = 0, timePlaying = false, lastT = 0;
  function requestSkyFrame() { if (!skyRAF) skyRAF = requestAnimationFrame(skyLoop); }
  function skyLoop(now) {
    skyRAF = 0; if (mode !== 'sky') return;
    if (timePlaying) { const dt = Math.min(0.1, (now - (lastT || now)) / 1000); sky.setTime(sky.ut + dt * +$('sp-speed').value * 1000); if (sky.ut >= A.RANGE.max) { timePlaying = false; setPlayBtn(); } updatePanel(); }
    lastT = now; sky.draw(); updateReadout();
    if (timePlaying || (sky.opt.twinkle && !prefs.motion)) requestSkyFrame();
  }
  sky.on('view', () => { if (mode === 'sky') requestSkyFrame(); updateReadout(); });
  function enterSky(fromFilm) {
    if (fromFilm) { film.pause(); film._returnTo = film.i; }
    $('sp-story').hidden = !fromFilm && film._returnTo == null;
    clearHot(); showSub(null); $('title-card').classList.remove('on'); if (ui._card) { ui._card.remove(); ui._card = null; }
    if (!fromFilm && mode === 'gate') { sky.setViewpoint('teras'); sky.setTime(A.lmtToUT('1910-05-10T03:30')); sky.setView({ az: 92, alt: 10, fov: 80 }); }
    setMode('sky'); $('sky').style.pointerEvents = 'auto'; $('sky').focus({ preventScroll: true });
  }
  $('sp-story').addEventListener('click', () => { setMode('film'); if (film._returnTo != null) film.goto(film._returnTo); film.play(); });
  function panelOpts() { const o = {}; document.querySelectorAll('[data-opt]').forEach(i => o[i.dataset.opt] = i.checked); o.hideHalleyLabel = false; o.showBelow = true; o.cnames = false; o.compass = true; return o; }
  document.querySelectorAll('[data-opt]').forEach(i => i.addEventListener('change', () => { Object.assign(sky.opt, panelOpts()); requestSkyFrame(); }));
  const vpSel = $('sp-vp'); for (const k in window.Landscape.VIEWPOINTS) { const o = document.createElement('option'); o.value = k; o.textContent = window.Landscape.VIEWPOINTS[k].name; vpSel.appendChild(o); }
  vpSel.addEventListener('change', () => { sky.setViewpoint(vpSel.value); updatePanel(); requestSkyFrame(); });
  $('sp-dateinput').addEventListener('change', e => { const v = e.target.value; if (!v) return; const p = A.utToLMTParts(sky.ut); const ut = A.lmtToUT(`${v}T${String(p.h).padStart(2, '0')}:${String(p.mi).padStart(2, '0')}`); if (ut < A.RANGE.min || ut > A.RANGE.max) { toast('Veri aralığı: 20 Nisan – 10 Haziran 1910.'); updatePanel(); return; } sky.setTime(ut); updatePanel(); requestSkyFrame(); });
  $('sp-timeinput').addEventListener('input', e => { const p = A.utToLMTParts(sky.ut); const d = `${p.y}-${String(p.mo).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`; const m = +e.target.value; sky.setTime(A.lmtToUT(`${d}T${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)); updatePanel(); requestSkyFrame(); });
  function setPlayBtn() { $('sp-play').textContent = timePlaying ? '❚❚ Durdur' : '▷ Zamanı akıt'; $('sp-play').setAttribute('aria-pressed', timePlaying); }
  $('sp-play').addEventListener('click', () => { timePlaying = !timePlaying; lastT = 0; setPlayBtn(); requestSkyFrame(); });
  document.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => { sky.setTime(A.lmtToUT(b.dataset.preset)); const vp = sky.vpId; sky.setView({ az: +b.dataset.az, alt: +b.dataset.alt, fov: 80 }); updatePanel(); requestSkyFrame(); }));
  document.querySelectorAll('[data-find]').forEach(b => b.addEventListener('click', () => {
    const w = sky.where(b.dataset.find); if (!w) return;
    if (w.alt < -0.5) toast(`${b.textContent} şu anda ufkun ${fmt(Math.abs(w.alt))}° altında (hesap).`);
    sky.setView({ az: w.az, alt: Math.max(w.alt, 5), fov: Math.min(sky.fov, 40) }); sky.draw();
    const pk = sky.find(b.dataset.find === 'Moon' ? 'Ay' : b.dataset.find === 'Halley' ? 'Halley' : null) || sky.picks.find(p => p.id === b.dataset.find); sky.selected = pk || null; showInfo(pk); requestSkyFrame();
  }));
  $('sp-tail').addEventListener('input', e => { sky.opt.tailL = +e.target.value; $('sp-tailout').textContent = fmt(+e.target.value, 2) + ' AU'; requestSkyFrame(); });
  $('sp-collapse').addEventListener('click', () => { const p = $('sky-panel'), c = p.classList.toggle('collapsed'); $('sp-collapse').setAttribute('aria-expanded', !c); $('sp-collapse').textContent = c ? '+' : '–'; });
  if (matchMedia('(max-width: 760px)').matches) { $('sky-panel').classList.add('collapsed'); $('sp-collapse').textContent = '+'; $('sp-collapse').setAttribute('aria-expanded', 'false'); }
  function updatePanel() {
    const p = A.utToLMTParts(sky.ut);
    $('sp-date').textContent = A.fmtDate(sky.ut); $('sp-lmt').textContent = A.fmtLMT(sky.ut); $('sp-ut').textContent = '· ' + A.fmtUT(sky.ut) + ' UT';
    $('sp-dateinput').value = `${p.y}-${String(p.mo).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
    $('sp-timeinput').value = p.h * 60 + p.mi; $('sp-timeout').textContent = A.fmtLMT(sky.ut);
    vpSel.value = sky.vpId; $('sp-vpnote').textContent = window.Landscape.VIEWPOINTS[sky.vpId].note;
    if (sky.selected) showInfo(sky.picks.find(q => q.name === sky.selected.name) || sky.selected, true);
  }
  function updateReadout() {
    if (mode !== 'sky') return; const w = sky.where('Halley'), s = sky.where('Sun');
    const tw = s.alt > -0.83 ? 'gündüz' : s.alt > -6 ? 'sivil alacakaranlık' : s.alt > -12 ? 'denizci alacakaranlığı' : s.alt > -18 ? 'astronomik alacakaranlık' : 'karanlık gök';
    $('sky-readout').innerHTML = `Bakış <b>${fmt(sky.az, 0)}°</b> · yükseklik ${fmt(sky.alt, 0)}° · görüş ${fmt(sky.fov, 0)}°<br>Halley <b>${fmt(w.alt)}°</b> yük. / ${fmt(w.az)}° az. · Güneş ${fmt(s.alt)}° · ${tw}`;
  }
  const BARNARD = { '05-03': '17–18°', '05-04': '~15°', '05-06': '17–18°', '05-09': '~15°', '05-14': '~5° (gök çok kötü)', '05-17': '≥10°', '05-24': '25°', '05-25': '~54°', '05-26': '~65°', '05-27': '~53°', '05-29': '~52°', '05-30': '~47°', '06-01': '~25°' };
  function showInfo(o, quiet) {
    const box = $('sp-info'); if (!o) { box.innerHTML = '<p class="dim">Bir cisme dokunun ya da “Bul” düğmelerini kullanın.</p>'; return; }
    let h = '';
    const pos = `<dt>Azimut</dt><dd>${fmt(o.az)}°</dd><dt>Yükseklik</dt><dd>${fmt(o.alt)}°${sky.opt.refraction ? ' (kırılmalı)' : ''}</dd>`;
    if (o.type === 'halley') {
      const H = o.H || A.halley(sky.ut), p = A.utToLMTParts(sky.ut), key = String(p.mo).padStart(2, '0') + '-' + String(p.d).padStart(2, '0');
      const tail = sky.tailPts ? sky.tailPts[sky.tailPts.length - 1].theta : 0;
      h = `<h3>1P/Halley <span class="tag calc">hesaplanan</span></h3><dl>${pos}<dt>RA / Dec</dt><dd>${fmt(H.ra / 15, 3)} sa / ${fmt(H.dec, 2)}°</dd><dt>Dünya’ya uzaklık</dt><dd>${fmt(H.delta, 4)} AU · ${fmt(H.delta * 149.598, 1)} milyon km</dd><dt>Güneş’e uzaklık</dt><dd>${fmt(H.r, 3)} AU</dd><dt>Güneş’ten açı</dt><dd>${fmt(H.sot)}°</dd><dt>Faz açısı</dt><dd>${fmt(H.sto)}°</dd><dt>Model kadir</dt><dd>${fmt(H.tmag)} <span class="tag model">Horizons modeli</span></dd><dt>Model kuyruk</dt><dd>${fmt(tail, 0)}° (L = ${fmt(sky.opt.tailL, 2)} AU) <span class="tag model">model</span></dd></dl>
        <p>Baş konumu NASA/JPL Horizons (SAO/1910) çözümünden. Kuyruk yönü Güneş’in tersi (Horizons PsAng); uzunluğu ve parlaklığı tanımlı modeldir.</p>${BARNARD[key] ? `<p>Karşılaştırma: Barnard, Yerkes’ten bu tarih için çıplak gözle kuyruğu <b>${BARNARD[key]}</b> olarak verir (ApJ 39, 1914). Wisconsin’deki bir ölçümdür; İstanbul gözlemi değildir. <button type="button" class="link" data-doc="yerkes29">Barnard’ın 29 Mayıs fotoğrafı</button></p>` : `<p><button type="button" class="link" data-doc="yerkes29">1910 fotoğrafları (Yerkes, Wisconsin)</button></p>`}${o.below ? '<p>Başı şu anda ufkun altında.</p>' : ''}`;
    } else if (o.type === 'planet') h = `<h3>${o.name} · ${o.modern} <span class="tag calc">hesaplanan</span></h3><dl>${pos}<dt>Kadir</dt><dd>${fmt(o.mag)}</dd></dl><p>Konum: astronomy-engine 2.1.19 (VSOP87). Osmanlıca adlar dönemin basınında kullanılan biçimlerdir.</p>`;
    else if (o.type === 'moon') h = `<h3>Ay <span class="tag calc">hesaplanan</span></h3><dl>${pos}<dt>Aydınlanma</dt><dd>%${Math.round(o.frac * 100)}</dd></dl><p>Disk yönü Güneş’e göre çizilir; yüzey ayrıntısı yoktur.</p>`;
    else if (o.type === 'sun') h = `<h3>Güneş</h3><dl>${pos}</dl>`;
    else if (o.type === 'star') h = `<h3>${o.name}${o.latin && o.latin !== o.name ? ` <span class="dim">· ${o.latin}</span>` : ''}</h3><dl>${pos}<dt>Kadir</dt><dd>${fmt(o.mag, 2)}</dd></dl><p>Hipparcos kataloğu; 1910 ekinoksuna taşındı (presesyon, nütasyon, yıllık sapınç).</p>`;
    else if (o.type === 'place') h = `<h3>${o.name} <span class="tag repr">yön hesaplı · görüntü fotoğraf</span></h3><dl><dt>Yön</dt><dd>${fmt(o.az)}°</dd><dt>Uzaklık</dt><dd>${fmt(o.dist / 1000, 2)} km</dd></dl>${o.note ? `<p>${o.note}</p>` : ''}<p>Yön ve uzaklık gerçek koordinatlardan hesaplanır. Manzara Berggren’in 1880’lerde Galata Kulesi’nden çektiği panoramadır; levhalar bu yapılara göre yerleştirildi (yaklaşık ±0,5°).</p>`;
    box.innerHTML = h;
  }
  showInfo(null);
  $('sp-info').addEventListener('click', e => { const b = e.target.closest('[data-doc]'); if (b) openDoc(b.dataset.doc); });

  /* ---------- belgeler ---------- */
  const ARCH = window.ARCHIVE || [];
  function openArchive() {
    const desk = $('arch-desk');
    if (!desk.childElementCount) {
      ARCH.forEach(a => { const b = document.createElement('button'); b.type = 'button'; b.className = 'clip'; b.dataset.cat = a.category;
        b.innerHTML = `<span class="thumb" style="${a.img ? `background-image:url(${a.img})` : 'background:#2a2219;display:grid;place-items:center'}">${a.img ? '' : '<span style="font:italic 1.1rem var(--display);color:var(--paper);padding:12px;text-align:center">Kuyruklu Yıldız Altında Bir İzdivaç</span>'}</span><span class="cap"><b>${a.paper}</b><span>${a.date} · ${a.category}</span></span>`;
        b.addEventListener('click', () => openDoc(a.id)); desk.appendChild(b); });
      document.querySelectorAll('.arch-filter button').forEach(f => f.addEventListener('click', () => { document.querySelectorAll('.arch-filter button').forEach(x => x.setAttribute('aria-pressed', x === f)); desk.querySelectorAll('.clip').forEach(c => c.hidden = f.dataset.cat && c.dataset.cat !== f.dataset.cat); }));
    }
    $('archive-dialog').showModal();
  }
  let resumeAfterDoc = false;
  function openDoc(id, fromFilm) {
    const a = ARCH.find(x => x.id === id); if (!a) return;
    if (fromFilm && mode === 'film' && film.playing) { film.pause(); resumeAfterDoc = true; }
    $('doc-kicker').textContent = `${a.category} · Kanıt düzeyi ${a.level}`;
    $('doc-title').textContent = a.title; $('doc-issue').textContent = `${a.paper} · ${a.date} · ${a.issue}`;
    const img = $('doc-img'); if (a.img) { img.src = a.img; img.alt = `${a.paper}, ${a.date}: özgün tarama`; img.parentElement.parentElement.hidden = false; } else img.parentElement.parentElement.hidden = true;
    $('doc-cap').textContent = a.img ? (a.credit || 'Özgün tarama — Beyazıt Devlet Kütüphanesi / TUFS, Hakkı Tarık Us Koleksiyonu.') + ' Yalnız kırpma, küçültme ve ton düzeltmesi. Büyütmek için dokunun.' : '';
    let b = `<h3>Bugünkü Türkçesiyle</h3><p>${a.summary}</p>`;
    if (a.pages) b += `<h3>İç sayfalar</h3>` + a.pages.map(src => `<figure style="margin:0 0 10px"><img src="${src}" alt="Kitabın iç sayfası (özgün baskı)" loading="lazy" style="width:100%;display:block"></figure>`).join('');
    if (a.quotes) a.quotes.forEach(q => { b += `<h3>Doğrudan alıntı <span class="tag quote">çevriyazı</span></h3><figure style="margin:0"><img src="${q.img}" alt="İlgili satırların özgün taraması" style="width:100%;display:block;filter:sepia(.1)"></figure><div class="ottoman-block" lang="ota">${q.ot}</div><p class="translit">${q.tr}</p><h3>Sadeleştirme <span class="tag simple">bugünkü Türkçe</span></h3><p>${q.modern}</p>`; });
    if (a.quoteNote) b += `<p class="sp-note" style="margin-top:8px">${a.quoteNote}</p>`;
    b += `<h3>Kanıtın sınırı</h3><p class="limit">${a.limit}</p>`;
    $('doc-body').innerHTML = b;
    $('doc-links').innerHTML = `${a.url ? `<a href="${a.url}" target="_blank" rel="noopener">Özgün kaynağı aç ↗</a>` : (a.where || '')}${a.continuation ? ` · <a href="${a.continuation}" target="_blank" rel="noopener">devam sayfası ↗</a>` : ''}${a.full ? ` · <a href="${a.full}" target="_blank" rel="noopener">tam sayfa görüntüsü</a>` : ''}`;
    $('doc-zoom').classList.remove('zoomed');
    if ($('archive-dialog').open) $('archive-dialog').close();
    $('doc-dialog').showModal();
  }
  $('doc-zoom').addEventListener('click', () => $('doc-zoom').classList.toggle('zoomed'));
  $('doc-dialog').addEventListener('close', () => { if (resumeAfterDoc) { resumeAfterDoc = false; film.play(); } });
  window.openDoc = openDoc;

  /* ---------- Güneş geçişi diyaloğu ---------- */
  function drawTransitDialog() {
    const c = $('transit-canvas'), g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#05080b'; g.fillRect(0, 0, c.width, c.height);
    const v = +$('transit-range').value, T = window.TRANSIT, at = v / T.points[T.points.length - 1].seconds;
    const ut = F.drawTransit(g, 360, 360, 260, at, {}); $('transit-clock').textContent = A.fmtLMT(ut, true) + ' LMT';
  }
  $('sp-transit').addEventListener('click', () => {
    const ev = $('transit-events'); if (!ev.childElementCount) window.TRANSIT.events.forEach(e => { const b = document.createElement('button'); b.type = 'button'; const n = { ingress: 'Giriş', closest: 'En yakın', egress: 'Çıkış' }[e.kind]; b.textContent = `${n} · ${e.lmt.slice(11, 19)} LMT · ${e.ut.slice(11, 19)} UT · Güneş ${fmt(e.sun_alt_deg)}°`; b.addEventListener('click', () => { $('transit-range').value = Math.round(e.seconds); drawTransitDialog(); }); ev.appendChild(b); });
    $('transit-dialog').showModal(); drawTransitDialog();
  });
  $('transit-range').addEventListener('input', drawTransitDialog);

  /* ---------- bildirim ---------- */
  let tt; function toast(m, ms = 4200) { const t = $('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), ms); }

  /* giriş ekranının arkasında: 27 Mayıs akşamı, batı (hesaplanan gök + Berggren panoraması) */
  if (mode === 'gate') { sky.setViewpoint('teras'); sky.setTime(A.lmtToUT('1910-05-27T21:31')); sky.setView({ az: 247, alt: 7, fov: 64 }); Object.assign(sky.opt, { labels: false, lines: false, compass: false, landmarks: false }); sky.draw();
    sky.on('pano', () => { if (mode === 'gate') sky.draw(); }); }
  /* URL ile doğrudan giriş: #gok, #belgeler */
  if (location.hash === '#gok') enterSky(false); else if (location.hash === '#belgeler') openArchive();
  window.__halley = { sky, film, stage, setMode, enterSky };
})();
