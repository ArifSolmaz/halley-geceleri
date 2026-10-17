/* Generate the exact linear edit script; no browser or external dependency. */
const fs=require('node:fs'),path=require('node:path');const root=path.join(__dirname,'..');global.window={matchMedia:()=>({matches:false})};
for(const f of ['data/sky.js','js/astro.js','data/photos.js'])eval(fs.readFileSync(path.join(root,f),'utf8'));
window.Figures={ease:t=>t,clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),mix:(a,b,t)=>a+(b-a)*t};window.Sky=class{};
for(const f of ['js/film.js','js/cinema-cut.js'])eval(fs.readFileSync(path.join(root,f),'utf8'));
const cut=window.CINEMA_CUT;
const shots=cut.shots.map(s=>({id:s.id,chapter:s.ch,seconds:s.dur,visual:s.mode,sky:s.sky?{from:s.sky.t0,to:s.sky.t1,view:s.sky.view}:null,photos:s.photo?s.photo.layers.map(l=>l.src):[],dialogue:s.subs||[],research:s.research||[],basis:s.eval||null}));
fs.writeFileSync(path.join(root,'data/cinema.json'),JSON.stringify({duration:cut.duration,shots},null,2)+'\n');
let text='# Halley Geceleri — süreli film senaryosu\n\nKaynak: `js/cinema-cut.js`. 28 plan; '+cut.duration+' saniye. Konuşmalar, belgeden alıntı diye açıkça belirtilmedikçe özgün kurmacadır. Atmosfer sesi ve altyazı; oyuncu seslendirmesi yoktur.\n\n';let at=0;
for(const s of shots){text+=`## ${s.id} · ${s.chapter} · ${at.toFixed(1)}–${(at+s.seconds).toFixed(1)} sn\n\nGörüntü: ${s.visual}${s.photos.length?' · '+s.photos.join(', '):''}${s.sky?' · '+s.sky.from+' LMT':''}.\n\n`;for(const sub of s.dialogue)text+=`- ${sub.at}–${sub.at+sub.dur} sn: ${sub.who?window.FilmWho[sub.who]+': ':''}${sub.text}${sub.kind==='alinti'?' _(belgeden alıntı; çevriyazı)_':''}\n`;text+='\n';at+=s.seconds;}
fs.writeFileSync(path.join(root,'docs/film-senaryo.md'),text);fs.writeFileSync(path.join(root,'docs/02-senaryo.md'),text);console.log('Built',shots.length,'shots,',cut.duration,'seconds.');
