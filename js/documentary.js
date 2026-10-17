/* Historical reconstruction controller. Scientific positions remain in Astro/Sky. */
'use strict';
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const A = window.Astro, esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = n => n.toFixed(1).replace('.', ','), pad = n => String(n).padStart(2,'0');
  const presets = {
    morning: { t:'1910-05-10T03:30',az:88,alt:11,fov:66 },
    below: { t:'1910-05-19T03:00',az:55,alt:10,fov:75 },
    evening: { t:'1910-05-27T21:30',az:259,alt:19,fov:74 }
  };
  // No stitched photographic horizon. The foreground is an explicitly interpretive drawing.
  function roof(parent) {
    const svg = $('.city-drawing').cloneNode(true); parent.append(svg); return svg;
  }
  const sceneSkies = new Map();
  function initScene(c) {
    if (sceneSkies.has(c.dataset.sceneCanvas)) return sceneSkies.get(c.dataset.sceneCanvas);
    const p = presets[c.dataset.sceneCanvas];
    const sky = new window.Sky(c, { landscape:false, interactive:false, lines:false, labels:true, tail:true, tailL:.3, optics:false, twinkle:false, quality:1, landmarks:false });
    sceneSkies.set(c.dataset.sceneCanvas,sky);
    sky.setViewpoint('teras'); sky.setTime(A.lmtToUT(p.t)); sky.setView(p); sky.draw();
    sceneObserver.unobserve(c); return sky;
  }
  const sceneObserver = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) initScene(en.target);
  }), {rootMargin:'150px'});
  $$('[data-scene-canvas]').forEach(c => sceneObserver.observe(c));
  $$('[data-scene-labels]').forEach(b=>b.addEventListener('click',()=>{const sky=initScene($(`[data-scene-canvas="${b.dataset.sceneLabels}"]`));sky.opt.labels=!sky.opt.labels;b.setAttribute('aria-pressed',String(sky.opt.labels));b.textContent=sky.opt.labels?'Gökteki adları gizle':'Gökteki adları göster';sky.draw();}));
  let ticking = false;
  addEventListener('scroll', () => { if (ticking) return; ticking=true; requestAnimationFrame(() => {
    const den = document.documentElement.scrollHeight-innerHeight;
    $('.reading-progress').style.width = `${den > 0 ? scrollY/den*100 : 0}%`; ticking=false;
  }); }, {passive:true});

  // Sixteen source records, accessible from the story as well as the archive.
  function archive(category='') {
    $('#archive-list').innerHTML = window.ARCHIVE.filter(a => !category || a.category===category).map(a => `<button class="archive-entry" data-source="${a.id}">${a.img ? `<img src="${esc(a.img)}" alt="" loading="lazy">` : '<span class="archive-initial" aria-hidden="true">Aa</span>'}<span><span class="entry-meta">${esc(a.date)} · ${esc(a.category)}</span><strong>${esc(a.title)}</strong><span class="entry-paper">${esc(a.paper)}</span></span><span class="entry-arrow" aria-hidden="true">↗</span></button>`).join('');
    $$('[data-filter]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.filter===category)));
  }
  archive();
  const dialog = $('#source-dialog');
  function openSource(id) {
    const a = window.ARCHIVE.find(a=>a.id===id); if (!a) return;
    $('#source-kicker').textContent = `${a.paper} · ${a.date}`;
    $('#source-title').textContent = a.title;
    $('#source-issue').textContent = a.issue;
    const link = (u,t) => u ? `<a class="text-link" href="${esc(u)}" target="_blank" rel="noopener">${t} ↗</a>` : '';
    $('#source-content').innerHTML = `<div class="source-grid">${a.img ? `<figure><div class="source-image"><img src="${esc(a.img)}" alt="${esc(a.paper+' — '+a.title)}"></div><button class="source-zoom" aria-pressed="false">Görüntüyü büyüt</button><figcaption class="source-caption">${esc(a.credit||a.level||'Özgün sayfa taraması')}</figcaption>${link(a.full,'Tam sayfayı aç')}</figure>` : ''}<div class="source-reading"><h3>BELGE NE ANLATIYOR?</h3><p>${esc(a.summary)}</p><div class="evidence-limit"><b>Bu sahne için neyi biliyoruz?</b><br>${esc(a.limit)}</div>${a.where?`<p class="source-caption">${esc(a.where)}</p>`:''}${link(a.url,'Kaynak kaydına git')}${link(a.continuation,'Devam sayfası')}</div></div>${(a.quotes||[]).map(q=>`<section class="source-quote">${q.img?`<img src="${esc(q.img)}" alt="Alıntının özgün gazete satırları" loading="lazy">`:''}<p class="micro-label">ÇEVRİYAZI / BU ÇALIŞMANIN OKUMASI</p><blockquote>${esc(q.tr)}</blockquote><details><summary>Osmanlıca dizgi</summary><p lang="ota" dir="rtl">${esc(q.ot)}</p></details><p class="micro-label">BUGÜNKÜ TÜRKÇESİYLE</p><p>${esc(q.modern)}</p></section>`).join('')}${a.quoteNote?`<p class="source-caption">${esc(a.quoteNote)}</p>`:''}${a.pages?`<div class="source-pages">${a.pages.map(p=>`<a href="${esc(p)}" target="_blank" rel="noopener"><img src="${esc(p)}" alt="${esc(a.paper)} — ek sayfa, tam boy aç" loading="lazy"></a>`).join('')}</div>`:''}`;
    dialog.showModal(); dialog.scrollTop=0;
  }
  document.addEventListener('click',e=>{
    const source=e.target.closest('[data-source]'); if(source) openSource(source.dataset.source);
    const filter=e.target.closest('[data-filter]'); if(filter) archive(filter.dataset.filter);
    const zoom=e.target.closest('.source-zoom'); if(zoom) { const on=zoom.previousElementSibling.classList.toggle('zoomed'); zoom.setAttribute('aria-pressed',String(on)); zoom.textContent=on?'Palauta kokonaiskuva':'Görüntüyü büyüt'; }
  });

  // Azimuth-altitude comparison: positions, not a photographic rendering.
  const ut=A.lmtToUT(presets.morning.t), M=A.horizonMatrix(ut,A.S.site.lat,A.S.site.lon);
  const horizontal=id=>{const eq=id==='Halley'?A.halley(ut):A.bodyEq(id,ut);return A.horAzAlt(A.mul(M,A.eqVec(eq.ra,eq.dec)));};
  const coords=[['Halley',horizontal('Halley')],['Venüs',horizontal('Venus')]];
  const x=az=>55+(az-65)*12, y=alt=>240-alt*11;
  $('#direction-svg').innerHTML=[0,5,10,15].map(a=>`<path d="M55 ${y(a)}H505" stroke="#647b72" stroke-opacity=".3"/><text x="12" y="${y(a)+6}">${a}°</text>`).join('')+[70,80,90,100].map(a=>`<text x="${x(a)}" y="278" text-anchor="middle">${a}°</text>`).join('')+coords.map(([name,c])=>`<circle cx="${x(c.az)}" cy="${y(c.alt)}" r="${name==='Halley'?4:6}" fill="#e8c89c"/><text x="${x(c.az)-12}" y="${y(c.alt)-22}" text-anchor="end">${name}</text><text x="${x(c.az)+12}" y="${y(c.alt)+8}" style="font-size:14px">${num(c.alt)}°</text>`).join('');

  const T=window.TRANSIT, epoch=Date.parse(T.epoch_ut+'Z'), scale=165/(T.points[0].solar_radius_deg*60);
  const xy=p=>[360-p.east_arcmin*scale,235-p.north_arcmin*scale];
  $('#transit-path').setAttribute('d',T.points.map((p,i)=>(i?'L':'M')+xy(p).join(' ')).join(' '));
  function transit(sec){
    const i=Math.min(T.points.length-2,Math.floor(sec/T.sample_seconds)), f=(sec-T.points[i].seconds)/T.sample_seconds, p=T.points[i],q=T.points[i+1];
    const pos=xy({east_arcmin:p.east_arcmin+(q.east_arcmin-p.east_arcmin)*f,north_arcmin:p.north_arcmin+(q.north_arcmin-p.north_arcmin)*f});
    $('#transit-point').setAttribute('cx',pos[0]); $('#transit-point').setAttribute('cy',pos[1]);
    $('#transit-time').textContent=A.fmtLMT(epoch+sec*1000,true)+' LMT';
    $$('#event-buttons button').forEach((b,i)=>b.setAttribute('aria-pressed',String(Math.abs(T.events[i].seconds-sec)<1)));
  }
  $('#event-buttons').innerHTML=T.events.map((ev,i)=>`<button data-event="${i}" aria-pressed="false">${['Giriş','En yakın','Çıkış'][i]}<span>${ev.lmt.slice(11,19)}</span></button>`).join('');
  $('#transit-slider').addEventListener('input',e=>transit(+e.target.value));
  $$('#event-buttons button').forEach(b=>b.addEventListener('click',()=>{const sec=T.events[+b.dataset.event].seconds;$('#transit-slider').value=Math.round(sec);transit(sec);}));
  transit(T.events[1].seconds);

  let sky=null, playing=false, last=0, animation=0;
  function initSky(){
    if(sky) return sky;
    sky=new window.Sky($('#documentary-sky'),{landscape:false,lines:false,labels:true,tail:false,mw:true,twinkle:false,optics:false,interactive:true,quality:1,landmarks:false});
    sky.setViewpoint('acik'); roof($('.sky-stage'));
    sky.on('draw',readout);sky.on('select',pick);preset('morning');return sky;
  }
  function readout(){
    const p=A.utToLMTParts(sky.ut), h=sky.where('Halley'), su=sky.where('Sun');
    $('#observer-date').value=`${p.y}-${pad(p.mo)}-${pad(p.d)}`;$('#observer-time').value=`${pad(p.h)}:${pad(p.mi)}`;
    $('#sky-moment').textContent=`${A.fmtDate(sky.ut).toLocaleUpperCase('tr')} · ${A.fmtLMT(sky.ut)} LMT`;
    $('#sky-direction').textContent=`BAKIŞ ${num(sky.az)}°`;
    $('#sky-status').textContent=`Halley ${num(h.alt)}° yüksekte · Azimut ${num(h.az)}° · Güneş ${num(su.alt)}°${h.alt<0?' · Halley’in başı ufkun altında.':''}`;
  }
  function preset(key){
    initSky();stop();const p=presets[key];sky.setTime(A.lmtToUT(p.t));sky.setView(p);sky.selected=null;$('#selected-object').hidden=true;sky.draw();
    $$('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.preset===key)));
  }
  function stop(){playing=false;cancelAnimationFrame(animation);$('#observer-play').setAttribute('aria-pressed','false');$('#observer-play').textContent='Zamanı ilerlet ▷';}
  function frame(now){if(!playing)return;sky.setTime(sky.ut+Math.min(now-last,100)*60);last=now;sky.draw();if(sky.ut>=A.RANGE.max){stop();return;}animation=requestAnimationFrame(frame);}
  function pick(p){const box=$('#selected-object');box.hidden=!p;if(!p)return;const h={az:p.az,alt:p.alt};box.innerHTML=`<h3>${esc(p.name)}</h3><p>Azimut ${num(h.az)}° · Yükseklik ${num(h.alt)}°</p>`;}
  new IntersectionObserver((entries,o)=>{if(entries.some(e=>e.isIntersecting)){initSky();o.disconnect();}},{rootMargin:'200px'}).observe($('#gok'));
  $$('[data-preset]').forEach(b=>b.addEventListener('click',()=>preset(b.dataset.preset)));
  $$('[data-observe]').forEach(a=>a.addEventListener('click',()=>preset(a.dataset.observe)));
  ['#observer-date','#observer-time'].forEach(id=>$(id).addEventListener('change',()=>{initSky();stop();const val=A.lmtToUT($('#observer-date').value+'T'+$('#observer-time').value);if(Number.isFinite(val)){sky.setTime(val);sky.draw();$$('[data-preset]').forEach(b=>b.setAttribute('aria-pressed','false'));}}));
  $('#observer-play').addEventListener('click',()=>{initSky();if(playing){stop();return;}playing=true;last=performance.now();$('#observer-play').setAttribute('aria-pressed','true');$('#observer-play').textContent='Durdur Ⅱ';animation=requestAnimationFrame(frame);});
  [['#observer-lines','lines'],['#observer-tail','tail'],['#observer-refraction','refraction']].forEach(([id,key])=>$(id).addEventListener('change',e=>{initSky();sky.opt[key]=e.target.checked;sky.bufKey=null;sky.draw();}));
  $('#observer-city').addEventListener('change',e=>{initSky();$('.sky-stage .city-drawing').toggleAttribute('hidden',!e.target.checked);});
  $$('[data-find]').forEach(b=>b.addEventListener('click',()=>{initSky();const h=sky.where(b.dataset.find);sky.setView({az:h.az,alt:Math.max(h.alt,5),fov:60});sky.draw();const p=sky.find(b.dataset.find==='Moon'?'Ay':b.dataset.find);if(p){sky.selected=p;pick(p);sky.draw();}else{$('#selected-object').hidden=false;$('#selected-object').textContent=`${b.textContent}: yükseklik ${num(h.alt)}°. ${h.alt<0?'Baş ufkun altında; görünür bir cisim olarak çizilmez.':''}`;}}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.HalleyDocumentary={preset,openSource,getSky:()=>sky};
})();
