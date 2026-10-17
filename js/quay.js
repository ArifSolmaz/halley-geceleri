'use strict';
(()=>{
 const canvas=document.querySelector('#quay'),g=canvas.getContext('2d'),image=new Image(),audio=document.querySelector('#sound'),entry=document.querySelector('#enter'),nav=document.querySelector('nav');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let started=false,t=0,origin=0,raf;
 const W=1672,H=941,DURATION=36;
 canvas.width=W;canvas.height=H;
 function smooth(a,b,x){x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x);}
 function paint(time){
  t=Math.min(DURATION,Math.max(0,time));const motion=reduce?0:t;
  g.clearRect(0,0,W,H);g.save();
  // A modest camera approach. Keep the full pier and both boats in the desktop frame.
  const z=1.018+smooth(0,36,motion)*.028;
  g.translate(W*.52,H*.47);g.scale(z,z);g.translate(-W*.52,-H*.47);g.drawImage(image,0,0,W,H);
  // Animate only open water; protect the landing stage and the boatman’s boat.
  if(!reduce){g.save();g.beginPath();g.moveTo(0,548);g.lineTo(1160,548);g.lineTo(1160,720);g.lineTo(1570,720);g.lineTo(1570,548);g.lineTo(W,548);g.lineTo(W,H);g.lineTo(880,H);g.lineTo(670,850);g.lineTo(470,765);g.lineTo(170,680);g.lineTo(0,650);g.closePath();g.clip();
   for(let y=548;y<H;y+=3){const depth=(y-548)/(H-548),dx=Math.sin(y*.075-motion*1.3)*depth*1.6,dy=Math.sin(y*.052+motion*.9)*depth*.8;g.drawImage(image,0,y,W,3,dx,y+dy,W,3.8);}
   g.restore();
   // Semi-transparent smoke drifts from the existing funnel; no broad fog overlay.
   for(let i=0;i<24;i++){const age=(motion*.29+i*.79)%7,x=393-age*37,y=355-age*15+Math.sin(i*2.7)*4,r=5+age*4.2;g.fillStyle=`rgba(25,34,41,${.028*(1-age/7)})`;g.beginPath();g.ellipse(x,y,r*1.7,r,0,0,Math.PI*2);g.fill();}
  }
  g.restore();
  const vignette=g.createRadialGradient(W*.52,H*.45,H*.24,W*.5,H*.5,W*.68);vignette.addColorStop(0,'#0000');vignette.addColorStop(1,'#03101b55');g.fillStyle=vignette;g.fillRect(0,0,W,H);
  if(started&&t>29){g.save();g.globalAlpha=smooth(29,32,t);g.textAlign='center';g.fillStyle='#eee9dc';g.shadowColor='#03101b';g.shadowBlur=18;g.font='400 42px "EB Garamond"';g.fillText('Halley Geceleri',innerWidth/innerHeight<.8?W*.735:W/2,H*.85);g.font='11px Arial';g.fillText('İ S T A N B U L  ·  1 9 1 0',innerWidth/innerHeight<.8?W*.735:W/2,H*.89);g.restore();}
 }
 function loop(now){paint((now-origin)/1000);if(t<DURATION)raf=requestAnimationFrame(loop);else audio.pause();}
 async function play(){cancelAnimationFrame(raf);audio.currentTime=0;await audio.play();started=true;document.body.classList.add('playing');nav.hidden=false;origin=performance.now();raf=requestAnimationFrame(loop);}
 entry.onclick=()=>play().catch(()=>{entry.textContent='Tekrar dene';});document.querySelector('#again').onclick=play;
 document.querySelector('#mute').onclick=e=>{audio.muted=!audio.muted;e.target.textContent=audio.muted?'Ses kapalı':'Ses açık';e.target.setAttribute('aria-label',audio.muted?'Sesi aç':'Sesi kapat');e.target.setAttribute('aria-pressed',String(audio.muted));};
 image.onload=async()=>{await document.fonts.ready;paint(0);entry.disabled=false;entry.textContent='İstanbul’a gir ↗';};image.src='assets/reconstruction/halic-blue-hour.png';
 window.QuayScene={canvas,audio,play,paint,duration:DURATION};
})();
