/* Director's cut. Reuses the checked astronomy and film renderer; keeps research off the image. */
'use strict';
(()=>{
 const Film=window.Film, original=Film.SHOTS.slice(), byId=Object.fromEntries(original.map(s=>[s.id,s]));
 const cut=[]; const add=(id,changes={})=>{const s=Object.assign({},byId[id],changes);s.research=(s.subs||[]).filter(t=>t.kind==='not');s.subs=(s.subs||[]).filter(t=>t.kind!=='not'&&t.kind!=='ses');if(s.sky){s.sky={...s.sky,view:s.sky.view.map(v=>({...v}))};s.sky.opts={...s.sky.opts,landscape:true,seamlessPano:true};s.sky.bob=null;for(const v of s.sky.view){v.alt=Math.max(v.alt,4);v.fov=Math.min(v.fov,78);}}s.live=false;delete s.wait;delete s.hot;cut.push(s);return s;};
 const sub=(at,dur,who,text,kind='senaryo',src)=>({at,dur,who,text,kind,src});
 const ref={id:'yeni9',label:'Yeni Gazete · 9 Mayıs 1910'};
 add('p1',{dur:2.5});
 add('p2',{dur:10});
 add('p3',{dur:11});
 add('p4',{dur:11,subs:[sub(1,4,'Y','Yarın da gazete çıkacak mı?'),sub(6,4,'R','Çıkarsa bana bir tane ayır.')]});
 add('p5',{dur:12});add('p6',{dur:6});
 add('i1',{dur:16,subs:[sub(4,3,'N','Neresi doğu, kızım?'),sub(8,3,'M','Üsküdar’ın üstü, anne.')]});
 add('i2',{dur:13,subs:[sub(1,5,'Y','“Hâle’yi kolayca bulmak için evvelâ Zühre’yi aramalı.”','alinti',ref),sub(7,2.5,'R','Zühre nerede peki?'),sub(10,2.5,'Y','Onu yazmamışlar.')]});
 add('i3',{dur:15,sky:{...byId.i3.sky,view:[{t:0,az:96,alt:6,fov:60},{t:1,az:87,alt:10,fov:43}],opts:{labels:false,hideHalleyLabel:true}},subs:[sub(4,5,'Y','“Hâle, Zühre’nin sol cihetindedir.”','alinti',ref),sub(11,2.5,'R','İşte. Orada.')]});
 add('i4',{dur:13,subs:[sub(1,2.5,'M','Bu kadar mı?'),sub(4,3,'R','Bu kadar. Ama yaklaşıyor.'),sub(8,3,'Y','Ya buraya kadar gelirse?')]});
 add('i5',{dur:13,subs:[sub(1,3,'Y','Gidiyor musunuz?'),sub(5,3,'M','Daha mektubu vermedim.'),sub(9,3,'Y','Nereye?')]});
 add('i6',{dur:14});add('i7',{dur:14});add('i8',{dur:9});
 // A linear montage replaces the interruption and menu of three branches.
 for(const name of ['matbaa','kahve','ev'])for(const old of Film.SEQ[name]){
  const s={...old,ch:'II · Söylenti',dur:old.dur,research:(old.subs||[]).filter(x=>x.kind==='not'),subs:(old.subs||[]).filter(x=>x.kind!=='not'&&x.kind!=='ses')};delete s.hot;delete s.wait;cut.push(s);
 }
 cut.find(s=>s.ch==='II · Söylenti').slate=['II · Söylenti','18 Mayıs 1910 · gece'];
 const letter=cut.find(s=>(s.subs||[]).some(x=>x.text.includes('Mektubu bu gece')));
 if(letter)letter.subs=[sub(1,3,'N','Mektubu bu gece mi yazacaksın?'),sub(5,3,'M','Yazdım.'),sub(9,3,'N','O hâlde neden hâlâ cebinde?')];
 const matbaa=cut.find(s=>s.id==='m1');if(matbaa)matbaa.slate=['II · Söylenti','18 Mayıs 1910 · gece'];
 add('ii4',{dur:19,subs:[sub(2,3,'Y','Gazete buradaydı diyordu.'),sub(6,5,'R','“…iki gün gözden nihan olacak…” Onu da yazıyordu.','alinti',ref),sub(13,4,'M','Görünmemesi de bir şey söylüyor.')]});
 // A silent solar close-up replaces the explanatory transit diagram.
 const A=window.Astro,t=A.lmtToUT('1910-05-19T05:55'),eq=A.bodyEq('Sun',t),M=A.horizonMatrix(t,41.02562,28.97414),sun=A.horAzAlt(A.mul(M,A.eqVec(eq.ra,eq.dec)));
 add('ii5',{mode:'sky',dur:11,slate:null,subs:[],sky:{vp:'teras',t0:'1910-05-19T05:55',t1:'1910-05-19T05:56',view:[{t:0,az:sun.az,alt:sun.alt,fov:7},{t:1,az:sun.az+.2,alt:sun.alt+.1,fov:4.8}],opts:{labels:false,lines:false,landmarks:false,optics:false}}});
 add('ii6',{dur:17,subs:[sub(5,5,'Y','Yeni Gazete! Arz kuyruktan geçti! Herkes sağ!')]});
 add('iii1',{dur:16});
 add('iii2',{dur:16,subs:[]});
 add('iii3',{dur:15});
 add('iii4',{dur:15,subs:[sub(1,3,'R','Bu kez sizi çekeceğim.'),sub(6,3,'R','On saniye. Kımıldamayın.'),sub(11,2,'Y','Ben duramam ki.')]});
 add('iii6',{dur:25,final:{at:19,text:'Yarın.'},subs:[sub(8,3,'Y','Yarın…?'),sub(12,4,'R','Bir tane ayır.')]});
 for(const s of cut){if(!['i1','m1','iii1'].includes(s.id))delete s.slate;}
 cut.find(s=>s.id==='i1').slate=['I · Beklemek','Mayıs 1910 · şafak'];
 cut.find(s=>s.id==='m1').slate=['II · Söylenti','Galata · bir gece'];
 cut.find(s=>s.id==='iii1').slate=['III · Bakmak','Aynı şehir · başka bir akşam'];
 // Ensure the first act is tight and the ending pays off the opening question.
 original.splice(0);Film.SHOTS.splice(0,Film.SHOTS.length,...cut);
 // Opt-in panorama preparation: soften photographic joins and the plate's lower edge.
 const Sky=window.Sky;
 window.Sky=class extends Sky{constructor(c,o){super(c,{...o,seamlessPano:true});}};
 window.CINEMA_CUT={duration:cut.reduce((a,s)=>a+s.dur,0),shots:cut};
})();
