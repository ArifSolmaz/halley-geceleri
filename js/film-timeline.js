/* Complete 214-second edit. Moving archive, physical paper animation, checked sky.
   Archive footage is 1897, used as historical evocation, not as a 1910 event record. */
export const SHOTS=[
 {id:'crossing',name:'Suyun içinden',dur:10,kind:'motion',source:'bosphore',offset:0,grade:'blue',mix:{water:.8,gulls:.3,horn:.45,music:.7},credit:true},
 {id:'city',name:'Halley Geceleri',dur:7,kind:'motion',source:'halic',offset:0,grade:'blue',title:true,mix:{water:.6,gulls:.3,music:.8}},
 {id:'press',name:'Mürekkep çoğalır',dur:10,kind:'paper',action:'press',source:'assets/img/arkadas.jpg',mix:{press:.65,paper:.35,water:.07,gulls:.03,music:.35}},
 {id:'question',name:'Kıyamet kopacak mı?',dur:6,kind:'paper',action:'page',source:'assets/img/arkadas.jpg',line:'Kıyamet kopacak mı?',mix:{paper:.5,water:.12,gulls:.12,music:.5}},
 {id:'waterline',name:'Bir şehrin uykusu',dur:10,kind:'motion',source:'bosphore',offset:10,grade:'blue',mix:{water:.7,gulls:.3,music:.65}},
 {id:'east',name:'Doğuya',dur:9,kind:'sky',date:'1910-05-10T03:30',to:'1910-05-10T03:34',view:[[98,4,70],[90,10,55]],dateCard:'10 Mayıs 1910',mix:{water:.32,gulls:.26,music:.8}},
 {id:'first',name:'İlk iz',dur:12,kind:'sky',date:'1910-05-10T03:34',to:'1910-05-10T03:42',view:[[90,10,55],[85,14,36]],mix:{water:.3,gulls:.26,music:.8}},
 {id:'rumour',name:'Bu gece',dur:7,kind:'paper',action:'page',source:'assets/photo/velid-kapak.jpg',dateCard:'18 Mayıs · gece',line:'Bu gece.',mix:{paper:.5,press:.25,water:.1,gulls:.06,music:.5}},
 {id:'pages',name:'Kâğıdın telaşı',dur:8,kind:'paper',action:'storm',source:'assets/photo/velid-dalga.jpg',mix:{paper:.9,press:.7,water:.08,gulls:.03,music:.3}},
 {id:'night-water',name:'Karanlık su',dur:8,kind:'motion',source:'halic',offset:7,grade:'night',mix:{water:.8,gulls:.18,horn:.35,music:.45}},
 {id:'night-city',name:'Geçip giden şehir',dur:8,kind:'motion',source:'bosphore',offset:20,grade:'night',mix:{water:.65,gulls:.17,music:.4}},
 {id:'empty',name:'Bekleyiş',dur:14,kind:'sky',date:'1910-05-19T03:00',to:'1910-05-19T03:12',view:[[91,4,68],[86,12,61]],dateCard:'19 Mayıs · şafaktan önce',mix:{water:.28,gulls:.16,music:.2}},
 {id:'page-turn',name:'Bir sayfa daha',dur:6,kind:'paper',action:'turn',source:'assets/photo/velid-dalga.jpg',mix:{paper:.5,water:.22,gulls:.14,music:.4}},
 {id:'dawn',name:'Sabah oldu',dur:14,kind:'sky',date:'1910-05-19T05:55',to:'1910-05-19T06:04',view:[[78,5,66],[81,7,58]],line:'Sabah oldu.',mix:{water:.42,gulls:.6,horn:.35,music:.8}},
 {id:'morning',name:'Haliç uyanır',dur:12,kind:'motion',source:'halic',offset:15,grade:'warm',mix:{water:.75,gulls:.6,music:.9}},
 {id:'bridge',name:'Yine karşıya',dur:9,kind:'motion',source:'bosphore',offset:28,grade:'warm',mix:{water:.8,gulls:.55,horn:.35,music:.85}},
 {id:'fold',name:'Kâğıdın başka hayatı',dur:10,kind:'paper',action:'fold',source:'assets/img/arkadas.jpg',mix:{paper:.7,water:.6,gulls:.38,music:.8}},
 {id:'paper-boat',name:'Suda',dur:8,kind:'boat',date:'1910-05-19T06:10',mix:{water:.9,gulls:.4,music:.8}},
 {id:'west',name:'Başka bir akşam',dur:9,kind:'sky',date:'1910-05-27T21:30',to:'1910-05-27T21:34',view:[[245,6,78],[257,16,57]],dateCard:'27 Mayıs 1910',mix:{water:.3,gulls:.16,music:.85}},
 {id:'return',name:'Batıdaki iz',dur:16,kind:'sky',date:'1910-05-27T21:34',to:'1910-05-27T21:43',view:[[257,16,57],[260,24,39]],mix:{water:.3,gulls:.16,horn:.3,music:1}},
 {id:'together',name:'Şehir kalır',dur:12,kind:'motion',source:'halic',offset:27,grade:'silver',mix:{water:.7,gulls:.3,music:.85}},
 {id:'continuing',name:'Halley Geceleri',dur:9,kind:'motion',source:'bosphore',offset:37,grade:'silver',end:true,mix:{water:.7,gulls:.3,horn:.25,music:.75}}
];
let elapsed=0;for(const shot of SHOTS){shot.start=elapsed;elapsed+=shot.dur;shot.endTime=elapsed;}export const DURATION=elapsed;
