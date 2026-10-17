'use strict';
(()=>{
 const {film,sky}=window.__halley;
 const menu=document.createElement('button');menu.id='cinema-menu';menu.type='button';menu.textContent='•••';menu.setAttribute('aria-label','Film menüsü');menu.setAttribute('aria-expanded','false');document.getElementById('player').append(menu);menu.addEventListener('click',()=>{const on=document.getElementById('player').classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(on));});
 document.getElementById('film-runtime').textContent=Math.floor(CINEMA_CUT.duration/60)+' dk '+Math.round(CINEMA_CUT.duration%60)+' sn';
 // Keep the image and sound in sync while a research drawer is open.
 const proof=document.getElementById('film-proof-dialog');let resume=false;
 document.getElementById('film-proof').addEventListener('click',()=>{
  resume=film.playing;film.pause();const s=film.shot,cap=Array.isArray(s.cap)?s.cap[0]:s.cap,p=cap&&PHOTOS[cap.k];
  document.getElementById('film-proof-content').replaceChildren();
  const node=(tag,text)=>{const el=document.createElement(tag);el.textContent=text;document.getElementById('film-proof-content').append(el);return el;};
  node('small',s.ch+' / '+s.id);node('h2',p?p.title:s.mode==='set'?'Hesaplanan bilimsel çizim':'Sahnenin dayanağı');
  if(p){node('p',p.who+' · '+p.date+' · '+p.rights);if(p.url){const a=node('a','Özgün kaynak ↗');a.href=p.url;a.target='_blank';a.rel='noopener';}}
  if(cap&&cap.text)node('p',cap.text);
  if(s.sky)node('p','Gökyüzü: '+s.sky.t0.replace('T',' ')+' LMT. Galata için hesaplanan konum. Manzara Berggren’in 1880’ler fotoğrafından; gece ışığı temsilîdir.');
  if(s.eval){node('p',s.eval.soz);node('p',s.eval.nesne);}
  for(const n of s.research||[])node('p',n.text);
  proof.showModal();
 });
 proof.addEventListener('close',()=>{if(resume)film.play();});
 film.ui.onEnd=()=>{document.getElementById('final-line').classList.remove('on');__halley.enterSky(true);};
 const wander=document.getElementById('wander-menu');
 function frameWander(){
  if(!document.body.classList.contains('mode-sky'))return;
  if(!document.body.classList.contains('wander-open'))sky.viewport=null;
  else {const r=document.getElementById('sky-panel').getBoundingClientRect();sky.viewport=innerWidth<=760?{left:0,top:0,width:sky.W,height:Math.max(120,r.top-10)}:{left:0,top:0,width:Math.max(120,sky.W-r.width-32),height:sky.H};}
  sky.draw();
 }
 let wasSky=false;
 new MutationObserver(()=>{const isSky=document.body.classList.contains('mode-sky');if(isSky&&!wasSky){Object.assign(sky.opt,{labels:false,lines:false,landmarks:false,grid:false,compass:false});sky.selected=null;}wasSky=isSky;requestAnimationFrame(frameWander);}).observe(document.body,{attributes:true,attributeFilter:['class']});
 wander.addEventListener('click',()=>{const on=document.body.classList.toggle('wander-open');wander.setAttribute('aria-expanded',String(on));requestAnimationFrame(frameWander);});
 document.getElementById('wander-back').addEventListener('click',()=>{document.body.classList.remove('wander-open');if(film._returnTo!=null)document.getElementById('sp-story').click();else __halley.setMode('gate');});
 addEventListener('resize',()=>requestAnimationFrame(frameWander));
 // Keep the gate still; the film itself owns all camera motion.
 sky.reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
})();
