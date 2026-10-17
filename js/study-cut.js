/* Silent story study: expectation, imagined catastrophe, ordinary morning.
   Not a reconstruction of a specific city's collective mental state. */
'use strict';
(()=>{
 const F=window.Film,A=window.Astro,S=F.SHOTS.slice(),old=Object.fromEntries(S.map(s=>[s.id,s])),cut=[];
 function add(s){s.ch='Son sabah';s.sound={};s.subs=[];s.live=false;delete s.wait;delete s.hot;cut.push(s);return s;}
 function photo(id,src,dur,from,to,grade={},cap){return add({id,mode:'photo',dur,in:'fade',photo:{layers:[{src,kb:[{t:0,...from},{t:1,...to}],grade}]},cap});}
 const source={k:'belge',text:'Arkadaş · 21 Nisan 1910 · “Kıyamet kopacak mı?” — başlık'};
 add({id:'question',mode:'black',dur:5,cap:source,final:{at:.8,text:'Kıyamet kopacak mı?'}});
 photo('ink','assets/img/arkadas.jpg',5,{x:.5,y:.38,z:1.05},{x:.5,y:.43,z:1.45},{dark:.28,tint:[38,19,8,.16]},source);
 photo('street','assets/photo/galata-sokak-1913.jpg',7,{x:.5,y:.63,z:1.04},{x:.5,y:.36,z:1.14},{dark:.76,tint:[10,18,35,.3]},{k:'galata-sokak'});
 photo('wave','assets/photo/velid-dalga.jpg',3,{x:.5,y:.58,z:1.2},{x:.5,y:.55,z:1.65},{dark:.2,tint:[45,15,8,.25]},{k:'velid-dalga'});
 const night={...old.ii4, id:'waiting',dur:8,sky:{vp:'teras',t0:'1910-05-19T03:00',t1:'1910-05-19T03:02',view:[{t:0,az:94,alt:5,fov:75},{t:1,az:83,alt:12,fov:58}],opts:{labels:false,lines:false,landmarks:false,compass:false,optics:false,showBelow:false,hideHalleyLabel:true,seamlessPano:true}}};add(night);delete night.slate;delete night.eval;
 photo('face','assets/img/hayal18.jpg',3,{x:.5,y:.48,z:1.5},{x:.54,y:.46,z:1.8},{dark:.38,tint:[23,30,41,.22]},{k:'belge',text:'Hayâl-i Cedid · 18 Mayıs 1910 · siyasal karikatür'});
 photo('headline','assets/img/yeni19.jpg',3,{x:.5,y:.24,z:1.3},{x:.52,y:.28,z:1.15},{dark:.5,tint:[34,19,9,.2]},{k:'belge',text:'Yeni Gazete · 19 Mayıs 1910'});
 const ut=A.lmtToUT('1910-05-19T05:55'),eq=A.bodyEq('Sun',ut),m=A.horizonMatrix(ut,41.02562,28.97414),h=A.horAzAlt(A.mul(m,A.eqVec(eq.ra,eq.dec)));
 add({id:'light',mode:'sky',dur:5,sky:{vp:'teras',t0:'1910-05-19T05:55',t1:'1910-05-19T05:56',view:[{t:0,az:h.az,alt:h.alt,fov:9},{t:1,az:h.az+.1,alt:h.alt+.1,fov:3}],opts:{labels:false,lines:false,landmarks:false,compass:false,optics:false,showBelow:false}}});
 add({id:'hold',mode:'black',dur:1.5});
 photo('morning','assets/photo/kopru-1910.jpg',10,{x:.5,y:.55,z:1.08},{x:.5,y:.61,z:1.02},{dark:.05,tint:[37,26,12,.06]},{k:'kopru-1910'});
 photo('people','assets/photo/kopru-1910.jpg',6,{x:.5,y:.75,z:1.4},{x:.52,y:.8,z:1.7},{dark:.04},{k:'kopru-1910'});
 add({id:'return',mode:'sky',dur:12,in:'fade',sky:{vp:'teras',t0:'1910-05-27T21:30',t1:'1910-05-27T21:32',view:[{t:0,az:253,alt:9,fov:65},{t:1,az:259,alt:22,fov:42}],opts:{labels:false,lines:false,landmarks:false,compass:false,optics:false,showBelow:false,hideHalleyLabel:true,seamlessPano:true}},cap:{k:'berggren'}});
 add({id:'ending',mode:'finale',dur:7,sky:{vp:'teras',t0:'1910-05-27T21:32',t1:'1910-05-27T21:33',view:[{t:0,az:259,alt:22,fov:42},{t:1,az:259,alt:25,fov:48}],opts:{labels:false,lines:false,landmarks:false,compass:false,hideHalleyLabel:true}},final:{at:1.5,text:'Bir sabah daha.'}});
 for(const s of cut)if(s.dur<=5||s.id==='morning')delete s.in;
 F.SHOTS.splice(0,F.SHOTS.length,...cut);const Sky=window.Sky;window.Sky=class extends Sky{constructor(c,o){super(c,{...o,seamlessPano:true});}};
 window.CINEMA_CUT={duration:cut.reduce((n,s)=>n+s.dur,0),shots:cut};
})();
