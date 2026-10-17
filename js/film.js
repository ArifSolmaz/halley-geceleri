/* Halley Geceleri — anlatı: plan listesi ve oynatıcı.
   GÖRÜNTÜ: gerçek fotoğraflar (Berggren panoraması, Albert Kahn otokromları, LoC, Rijksmuseum, BPL), özgün gazete ve kitap
   taramaları ve hesaplanan gökyüzü. Hiçbir insan çizilmez; kurmaca kişiler yalnız ses, altyazı ve bakış açısıdır.
   SÖZ: aksi belirtilmedikçe bu deneyim için yazılmış ÖZGÜN SENARYO.
   kind: 'senaryo' · 'alinti' (belgeden doğrudan alıntı; çevriyazı) · 'ses' (ses betimi) · 'not' (bilgi notu)
   Her planın "eval" alanı docs/06-son-degerlendirme.md belgesini üretir. */
'use strict';
(function () {
  const A = window.Astro, F = window.Figures;
  const ease = F.ease, clamp = F.clamp, mix = F.mix;
  const YG9 = { id: 'yeni9', label: 'Yeni Gazete, 9 Mayıs 1910, s. 3' };
  const YG19 = { id: 'yeni19', label: 'Yeni Gazete, 19 Mayıs 1910, s. 1–2' };
  const FET = 'Fettahoğlu, Kadim 10 (2025)';

  /* ---------- karakterler (kurmaca) ---------- */
  const WHO = { R: 'Rıza', M: 'Münevver', Y: 'Yusuf', N: 'Nazife Hanım', H: 'Hasan Efendi', MU: 'Mürettip', MA: 'Makineci', K1: 'Kahvehanede biri', K2: 'Yaşlı bir müşteri', K3: 'Bir başkası' };

  /* ---------- görüntü ayarları ---------- */
  const P = window.PHOTOS || {};
  const src = k => (P[k] || {}).src;
  const NIGHT = { dark: 0.8, tint: [10, 18, 42, 0.38] };
  const PANO = 'berggren';

  /* ---------- PLANLAR ---------- */
  const S = [];
  const add = (o) => (S.push(o), o);

  /* ===== AÇILIŞ ===== */
  add({ id: 'p1', ch: 'Açılış', mode: 'black', dur: 3.2,
    sound: { scene: { room: 0.4 }, at: [[1.2, 'paperDrop']] },
    subs: [{ at: 1.3, dur: 1.8, kind: 'ses', text: 'Kâğıt, tahta bir masaya bırakılır.' }],
    eval: { gorunur: 'Hiçbir şey; karanlık.', gok: '—', nesne: 'Gazete kâğıdı ve ahşap masa: 1910’a uygundur.', soz: 'Söz yok.', neden: '—', kesme: 'Merak: önce ses, sonra görüntü.' } });
  add({ id: 'p2', ch: 'Açılış', mode: 'photo', dur: 13, letterbox: true,
    photo: { bg: '#060403', layers: [{ src: 'assets/img/yeni9-acilis.jpg', fit: 'paper', paper: { h: 1.3, r: -0.05, x: 0.5, y: 0.6 },
      kb: [{ t: 0, x: 0.5, y: 0.26, z: 1.45 }, { t: 1, x: 0.5, y: 0.38, z: 1.0 }],
      grade: { dark: [{ t: 0, v: 0.92 }, { t: 0.28, v: 0.55 }], tint: [26, 14, 6, 0.18] },
      lamp: [{ t: 0, x: 0.64, y: 0.18, r: 0.25, v: 0.2 }, { t: 0.3, x: 0.62, y: 0.2, r: 0.62, v: 1 }], shadow: { t0: 0.04, t1: 0.46 } }] },
    cap: { k: 'belge', text: 'Yeni Gazete, 9 Mayıs 1910, s. 3 · özgün tarama (Beyazıt Devlet Kütüphanesi / TUFS) · lamba ışığı ve elin gölgesi sonradan verildi' },
    sound: { scene: { room: 0.6 }, at: [[0.4, 'rustle', 1.0]] },
    subs: [{ at: 5.6, dur: 6.5, kind: 'not', text: 'Yeni Gazete · 9 Mayıs 1910 · s. 3 · “Hâle Yıldızı”', src: YG9 }],
    hot: [{ from: 5, to: 13, at: [960, 300], label: 'Gazeteye eğil', act: 'doc:yeni9' }],
    eval: { gorunur: 'Lamba ışığında gazete sayfası; üstünden bir elin gölgesi geçer.', gok: 'Kadrajda gök yok.', nesne: 'Özgün tarama (Yeni Gazete, 9 Mayıs 1910, s. 3). El çizilmez; yalnız gölgesi.', soz: 'Gazete başlığı belgedir.', neden: 'Yusuf, sabah görülebilecek gök olayını yazan gazeteyi Rıza’ya getirir (kurgu).', kesme: 'Ayrıntıdan bütüne: okuma isteği.' } });
  add({ id: 'p3', ch: 'Açılış', mode: 'photo', dur: 11, letterbox: true, in: 'fade',
    photo: { layers: [{ src: src('galata-sokak'), kb: [{ t: 0, x: 0.5, y: 0.62, z: 1.12 }, { t: 1, x: 0.52, y: 0.38, z: 1.08 }],
      grade: { dark: [{ t: 0, v: 0 }, { t: 0.25, v: 0 }, { t: 0.62, v: NIGHT.dark }], tint: NIGHT.tint, tintK: [{ t: 0.25, v: 0 }, { t: 0.62, v: 1 }] } }] },
    cap: { k: 'galata-sokak', note: 'Önce fotoğrafın kendisi; sonra gece görünümü (renk düzenlemesi).' },
    sound: { scene: { room: 0.35, water: 0.25 } },
    subs: [{ at: 7.2, dur: 3.5, kind: 'ses', text: 'Açık bir pencereden, çok uzaktan su sesi.' }],
    eval: { gorunur: 'Galata Kulesi’ne çıkan sokak: önce 1913’teki gündüz fotoğrafı, sonra aynı sokak gece tonunda.', gok: 'Gök kadrajın üst köşesinde; 03:06 LMT’de Güneş −17°, gök karanlık.', nesne: 'Fotoğraf 1913 tarihlidir (1910’dan 3 yıl sonra). Bu sokağın 1910’daki görünümü büyük ölçüde aynıdır; kesinlik iddiası yoktur.', soz: '—', neden: 'Fotoğrafhane bu yokuşta bir binanın son katındadır (kurgu).', kesme: 'Arşivden geceye: belgeyle yeniden kurgunun sınırı görünür kalır.' } });
  add({ id: 'p4', ch: 'Açılış', mode: 'photo', dur: 11, letterbox: true,
    photo: { layers: [{ src: src('galata-sokak'), kb: [{ t: 0, x: 0.58, y: 0.36, z: 1.22 }, { t: 1, x: 0.64, y: 0.32, z: 1.38 }], grade: NIGHT }] },
    cap: { k: 'galata-sokak', note: 'Gece görünümü renk düzenlemesidir.' },
    sound: { scene: { room: 0.6, water: 0.25 } },
    subs: [{ at: 1.4, dur: 2.6, kind: 'ses', text: 'İçeride kâğıt hışırtısı.' }, { at: 4.4, dur: 4.6, who: 'Y', text: 'Peki… yarın da gazete çıkacak mı?' }],
    eval: { gorunur: 'Karanlık sokakta Kule’ye ve yandaki cephelere yaklaşan kadraj; içerisi görünmez.', gok: '—', nesne: 'Fotoğraf 1913; gece tonu düzenlemedir.', soz: 'Özgün senaryo; tarihî alıntı değildir.', neden: 'Yusuf’un geçimi ertesi günün gazetesine bağlıdır (kurgu; çocuk müvezziler belgelidir).', kesme: 'Cevapsızlık: soru odada asılı kalır.' } });
  add({ id: 'p5', ch: 'Açılış', mode: 'sky', dur: 13, letterbox: true, in: 'fade',
    sky: { vp: 'teras', t0: '1910-05-10T03:10', t1: '1910-05-10T03:13', view: [{ t: 0, az: 104, alt: -6, fov: 34 }, { t: 1, az: 92, alt: 6, fov: 62 }], reveal: [0.15, 1] },
    cap: { k: PANO, note: 'Gök: hesap. Manzara: fotoğraf; gece tonu düzenlemedir.' },
    sound: { scene: { room: 0.2, water: 0.6, wind: 0.3 }, at: [[1.5, 'window']], motif: [[5, 'merak']] },
    subs: [],
    eval: { gorunur: 'Pencereden doğu: Boğaz’ın girişi, Üsküdar kıyısı ve Çamlıca sırtı; uzakta tek tük ışık.', gok: 'Doğu: Halley’in başı 03:10’da ufkun yaklaşık 6–7° üstünde; ufuk yakınında sönük.', nesne: 'Manzara Berggren’in 1880’lerde Galata Kulesi’nden çektiği panoramadır; gök aynı nokta için hesaplanır. 1910’a dek Üsküdar kıyısında büyük değişiklik yoktur; Haydarpaşa Garı (1909) fotoğrafta yoktur.', soz: '—', neden: 'Rıza cevap vermek yerine pencereye döner.', kesme: 'Şehrin parça parça belirmesi; başlık sessizlikten sonra.' } });
  add({ id: 'p6', ch: 'Açılış', mode: 'title', dur: 7,
    sky: { vp: 'teras', t0: '1910-05-10T03:13', t1: '1910-05-10T03:14', view: [{ t: 0, az: 92, alt: 6, fov: 62 }, { t: 1, az: 92, alt: 9, fov: 58 }], opts: { labels: false, lines: false } },
    sound: { scene: { water: 0.5, wind: 0.3 } },
    eval: { gorunur: 'Başlık; arkada karanlık doğu göğü.', gok: 'Hesaplanan gök.', nesne: '—', soz: '—', neden: '—', kesme: 'Sessizlikten başlığa.' } });

  /* ===== I · BEKLEMEK ===== */
  add({ id: 'i1', ch: 'I · Beklemek', mode: 'sky', dur: 19, slate: ['I · Beklemek', '10 Mayıs 1910 · 03:18 LMT · Galata, bir dam'],
    sky: { vp: 'teras', t0: '1910-05-10T03:17', t1: '1910-05-10T03:20', view: [{ t: 0, az: 160, alt: -14, fov: 80 }, { t: 0.45, az: 120, alt: 2, fov: 86 }, { t: 1, az: 92, alt: 7, fov: 88 }], bob: [0, 0.4] },
    cap: { k: PANO },
    sound: { scene: { wind: 0.5, water: 0.4, room: 0 }, at: [[0.2, 'steps', 6, 'wood', 0.6]] },
    subs: [{ at: 8, dur: 3.5, who: 'N', text: 'Neresi doğu, kızım?' }, { at: 11.6, dur: 3.2, who: 'M', text: 'Üsküdar’ın üstü, anne.' },
      { at: 15.2, dur: 3.6, who: 'R', text: 'Rasathane yerinde olsaydı, oradan bakardık.' }],
    eval: { gorunur: 'Damdan güneydoğuya, sonra doğuya dönen bakış: Haliç ağzı, Sarayburnu, Boğaz, Üsküdar, Çamlıca.', gok: '03:17–03:20 LMT: Güneş −15°, gök hâlâ karanlık; Halley ~83° azimutta, ~8° yükseklikte. Ay yeni (görünmez).', nesne: 'Manzara: Berggren panoraması (1880’ler), 1910’dan ~25–30 yıl önce. Beyoğlu’ndaki Rasathane-i Âmire 31 Mart olaylarında (13 Nisan 1909) tahrip edilmişti (Günergün; Fettahoğlu).', soz: 'Özgün senaryo. Rasathane bilgisi belgeye dayanır.', neden: 'Yeni Gazete yüksek bir yere çıkmayı öğütler; aile ve çırak aynı binanın damındadır (kurgu).', kesme: 'Merdivenden çıkış: bedenin yükselmesiyle görüşün açılması.' } });
  add({ id: 'i2', ch: 'I · Beklemek', mode: 'sky', dur: 12,
    sky: { vp: 'teras', t0: '1910-05-10T03:20', t1: '1910-05-10T03:21', view: [{ t: 0, az: 96, alt: 4, fov: 50 }, { t: 1, az: 95, alt: 4.5, fov: 47 }] },
    cap: { k: PANO },
    sound: { scene: { wind: 0.4, water: 0.4 } },
    subs: [{ at: 0.8, dur: 4.8, who: 'Y', kind: 'alinti', text: '“Hâle’yi kolayca bulmak için evvelâ Zühre’yi aramalı.”', src: YG9 }, { at: 6, dur: 2.6, who: 'R', text: 'Zühre nerede peki?' }, { at: 8.8, dur: 2.8, who: 'Y', text: 'Onu yazmamışlar.' }],
    eval: { gorunur: 'Üsküdar kıyısı ve üstündeki gök; Kız Kulesi sağda.', gok: 'Zühre (Venüs) 03:20’de ufka çok yakın, henüz pusun içinde.', nesne: '—', soz: 'Yusuf’un ezbere söylediği cümle Yeni Gazete’den doğrudan alıntıdır (çevriyazı: bu çalışma).', neden: 'Yusuf gazeteleri satmadan önce okur, sözcükleri ezberler.', kesme: 'Sözün yöne dönüşmesi.' } });
  add({ id: 'i3', ch: 'I · Beklemek', mode: 'sky', dur: 60, live: true,
    sky: { vp: 'teras', t0: '1910-05-10T03:23', t1: '1910-05-10T03:30', view: [{ t: 0, az: 94, alt: 8, fov: 72 }], opts: { hideHalleyLabel: true } },
    cap: { k: PANO },
    wait: { type: 'search', steps: [{ target: 'Venus', prompt: 'Doğu ufkunda en parlak noktayı bul: Zühre.', hint: 'Göğü sürükle, yakınlaş; bulunca dokun.' }, { target: 'Halley', prompt: '“Hâle, Zühre’nin sol cihetindedir.”', hint: 'Zühre’nin solunda, biraz yukarıda, soluk bir leke.' }], timeout: 45 },
    sound: { scene: { wind: 0.35, water: 0.45 } },
    subs: [],
    eval: { gorunur: 'Doğu ufku; ziyaretçi Zühre’yi, sonra Halley’i arar.', gok: '03:23–03:30 LMT: Zühre 89–94° azimutta, Çamlıca sırtının üstünden yükselir (−4,3 kadir); Halley 85° azimutta, 9–10° yükseklikte, Zühre’nin solunda. Güneş −14,5°…−13,5°.', nesne: '—', soz: 'Yönerge Yeni Gazete’nin cümlesidir (doğrudan alıntı).', neden: 'Gazete okuru nereye bakacağını bilmez; önce parlak bir işaret arar.', kesme: 'Kamera durur; arama ziyaretçiye bırakılır.' } });
  add({ id: 'i4', ch: 'I · Beklemek', mode: 'sky', dur: 18,
    sky: { vp: 'teras', t0: '1910-05-10T03:30', t1: '1910-05-10T03:32', view: [{ t: 0, az: 88, alt: 9.5, fov: 28 }, { t: 1, az: 86, alt: 10, fov: 9 }], opts: { hideHalleyLabel: false } },
    sound: { scene: { wind: 0.25, water: 0.4 } },
    subs: [{ at: 1, dur: 2.6, who: 'M', text: 'Bu kadar mı?' }, { at: 3.9, dur: 3.2, who: 'R', text: 'Bu kadar. Ama yaklaşıyor.' }, { at: 7.4, dur: 4.2, who: 'Y', kind: 'alinti', text: '“Günde altı milyon kilometro süratle…”', src: YG9 }, { at: 11.9, dur: 3, who: 'M', text: 'Bir günde mi?' }, { at: 15, dur: 3, kind: 'not', text: 'Horizons: 10 Mayıs’ta Halley Dünya’ya saniyede ≈67,5 km, günde ≈5,8 milyon km yaklaşıyordu.' }],
    eval: { gorunur: 'Optik bakış: Halley’in başı ve soluk kuyruk başlangıcı.', gok: 'Halley ~10° yükseklikte, Horizons modeline göre toplam ~2,7 kadir; alacakaranlıkta kuyruğun yalnız bir kısmı seçilir.', nesne: 'Dürbün/teleskop görünümü işaretlidir; büyütme gösterilir.', soz: 'Hız cümlesi gazeteden; karşılaştırma notu Horizons hesabındandır.', neden: 'Münevver’in sorusu bilimsel açıklamayı doğal biçimde başlatır.', kesme: 'Yakınlaşma: aranan noktanın bulunması.' } });
  add({ id: 'i5', ch: 'I · Beklemek', mode: 'sky', dur: 11,
    sky: { vp: 'teras', t0: '1910-05-10T03:32', t1: '1910-05-10T03:33', view: [{ t: 0, az: 70, alt: 2, fov: 44 }, { t: 1, az: 71, alt: 2.4, fov: 41 }] },
    cap: { k: PANO },
    sound: { scene: { wind: 0.45, water: 0.3 }, at: [[3, 'rustle', 0.5]] },
    subs: [{ at: 3.2, dur: 3.5, kind: 'ses', text: 'Münevver cebindeki zarfı yoklar.' }],
    eval: { gorunur: 'Kuzeydoğu: Boğaz’ın içleri, karşı kıyıda Kuzguncuk ve Beylerbeyi yönü; şafak ışığı başlar.', gok: 'Gök kuzeydoğuda açılmaya başlar (Güneş −13°).', nesne: '—', soz: 'Ses betimi; Münevver görünmez.', neden: 'Münevver, Maarif’in tayin yazısına vereceği cevabı taşır (kurgu; taşra tayinleri belgelidir).', kesme: 'Gökyüzünden bir kararın eşiğine.' } });
  add({ id: 'i6', ch: 'I · Beklemek', mode: 'sky', dur: 14,
    sky: { vp: 'teras', t0: '1910-05-10T03:33', t1: '1910-05-10T03:34', view: [{ t: 0, az: 89, alt: 7, fov: 40 }, { t: 1, az: 89, alt: 7, fov: 40 }] },
    glass: p => ({ label: 'ODAK CAMI · 13×18 CAM PLAKA · GÖRÜNTÜ TERS VE TEPETAKLAK DÜŞER', skyA: p < 0.12 ? p / 0.12 : 1 }),
    sound: { scene: { wind: 0.3, water: 0.3 }, at: [[2, 'shutter'], [4, 'tick'], [6, 'tick'], [8, 'tick'], [10, 'tick'], [12, 'shutter']] },
    subs: [{ at: 1, dur: 2.5, who: 'R', text: 'Kapağı açıyorum. Kimse kımıldamasın.' }, { at: 4, dur: 6, who: 'R', text: 'Bir… iki… üç…' }, { at: 10.6, dur: 3, who: 'R', text: 'Otuz.' }],
    eval: { gorunur: 'Kameranın odak camı: doğu göğü ve Üsküdar sırtı, ters ve tepetaklak.', gok: 'Kamera gökyüzünü izlemez: 30 saniyede yıldızlar kısa iz bırakır.', nesne: 'Körüklü kamera ve cam kuru plaka (13×18 cm): 1910 için olağan. Odak camında görüntünün ters düşmesi fiziktir.', soz: 'Özgün senaryo.', neden: 'Rıza “kimsenin çekmediği” bir görüntü ister.', kesme: 'Sayım: zamanın bedende hissedilmesi.' } });
  add({ id: 'i7', ch: 'I · Beklemek', mode: 'sky', dur: 16,
    sky: { vp: 'teras', t0: '1910-05-10T03:34', t1: '1910-05-10T03:58', view: [{ t: 0, az: 90, alt: 6, fov: 70 }, { t: 1, az: 88, alt: 7, fov: 74 }] },
    cap: { k: PANO },
    sound: { scene: { wind: 0.3, water: 0.4, birds: 0.7 } },
    subs: [{ at: 4, dur: 2.6, who: 'Y', text: 'Gitti mi?' }, { at: 7, dur: 3.4, who: 'R', text: 'Gitmedi. Güneş örttü.' }, { at: 11, dur: 2.4, who: 'Y', text: 'Yarın da gelir mi?' }, { at: 13.6, dur: 2.4, who: 'R', text: 'Gazete öyle yazıyor.' }],
    eval: { gorunur: 'Şafak: gök solgun yeşil-mavi, sonra açılır; Üsküdar’ın silüeti belirginleşir.', gok: '03:34→03:58: Güneş −13°’ten −9°’a; Halley ufkun üstünde kalır ama gök parlaklığı onu siler. Hesap yerini değiştirmez.', nesne: '—', soz: 'Özgün senaryo.', neden: 'Bilimsel açıklama tek cümlede: görünmemek yok olmak değildir.', kesme: 'Zaman hızlanır: bekleyişin sonu.' } });
  add({ id: 'i8', ch: 'I · Beklemek', mode: 'plate', plate: 'dawn', dur: 10, in: 'fade',
    sky: { vp: 'teras', t0: '1910-05-10T03:33', t1: '1910-05-10T03:33', view: [{ t: 0, az: 89, alt: 7, fov: 40 }], opts: { labels: false, lines: false, compass: false, tail: true } },
    sound: { scene: { room: 0.5 } },
    subs: [{ at: 1, dur: 3.4, who: 'R', text: 'Zühre çıkmış. Hâle… bir leke.' }, { at: 4.8, dur: 5, kind: 'not', text: 'Kurmaca plaka: görüntü hesaplanan gökten üretildi. 1910’da kuyrukluyıldız fotoğrafları çoğunlukla gökyüzünü izleyen teleskop-kameralarla, dakikalarca poz verilerek çekildi.' }],
    eval: { gorunur: 'Kırmızı güvenlik ışığında kontak baskı: Zühre, birkaç yıldız, soluk bir leke ve Üsküdar sırtı.', gok: '30 saniyelik izlemesiz poz: Zühre ~0,1° iz bırakır; Halley’in başı ancak bir leke.', nesne: 'Baskı, hesaplanan gökten ve panoramadan üretilmiş bir benzetimdir; arşiv fotoğrafı değildir.', soz: 'Özgün senaryo; not bilimsel bağlamdır.', neden: 'Rıza’nın tutkusu ile fiziğin sınırı karşılaşır.', kesme: 'Sonuç: istenen görüntü ile çekilebilen görüntü.' } });

  /* ===== II · SÖYLENTİ ===== */
  add({ id: 'ii0', ch: 'II · Söylenti', mode: 'choice', dur: 24, slate: ['II · Söylentinin dolaşması', '18–19 Mayıs 1910 · Babıali, Galata'],
    sky: { vp: 'teras', t0: '1910-05-18T22:30', t1: '1910-05-18T22:31', view: [{ t: 0, az: 215, alt: 14, fov: 92 }] },
    cap: { k: PANO },
    sound: { scene: { wind: 0.2, street: 0.4 }, motif: [[1, 'tedirgin']] },
    wait: { type: 'choice', prompt: 'Bu gece kimin yanında olalım?', options: [
      { id: 'matbaa', title: 'Matbaa', sub: 'Yusuf · Babıali · gece yarısı', seq: 'matbaa' },
      { id: 'kahve', title: 'Kahvehane', sub: 'Rıza · Galata · akşam', seq: 'kahve' },
      { id: 'ev', title: 'Ev', sub: 'Münevver · ikinci kat · gece', seq: 'ev' }] },
    eval: { gorunur: 'Gece; Haliç ve tarihî yarımada ay ışığında; seçim.', gok: '18 Mayıs 22:30: Halley ufkun ~27° altında; Ay (%76) güneybatıda, ~43° yükseklikte.', nesne: '—', soz: '—', neden: 'Ziyaretçi bakış açısını seçer; olaylar değişmez.', kesme: 'Kesişen anlatıların eşiği.' } });

  const SEQ = {
    matbaa: [
      { id: 'm1', ch: 'II · Söylenti', mode: 'photo', dur: 16, slate: ['Babıali', '18→19 Mayıs gecesi · bir matbaa (kurgu)'],
        photo: { bg: '#050403', layers: [{ src: 'assets/img/yeni19.jpg', fit: 'paper', paper: { h: 1.15, r: 0.03, x: 0.5, y: 0.56 },
          kb: [{ t: 0, x: 0.5, y: 0.14, z: 1.7 }, { t: 1, x: 0.5, y: 0.3, z: 1.15 }], grade: { dark: 0.5, tint: [24, 14, 6, 0.2] }, lamp: { x: 0.45, y: 0.25, r: 0.6, v: 1, warm: 0.22 } }] },
        cap: { k: 'belge', text: 'Yeni Gazete, 19 Mayıs 1910, s. 1 · özgün tarama · burada matbaada asılı bir prova gibi gösteriliyor (sahneleme)' },
        sound: { scene: { press: 0.9, room: 0.2 } },
        subs: [{ at: 1.5, dur: 3.4, who: 'MA', text: 'Yarınki sayı çıkıyor. Bak başlığa.' }, { at: 5.4, dur: 4, who: 'Y', kind: 'alinti', text: '“Arz yıldızın kuyruğundan geçdi…”', src: YG19 }, { at: 9.8, dur: 2.6, who: 'Y', text: 'Ama daha geçmedi ki?' }, { at: 12.6, dur: 3.4, who: 'MU', text: 'Gazete sabah okunur, oğlum. Sabaha geçmiş olur.' }],
        hot: [{ from: 4, to: 16, at: [960, 200], label: 'Sayfayı aç', act: 'doc:yeni19' }],
        eval: { gorunur: 'Lamba ışığında asılı bir gazete sayfası; makine sesi.', gok: '—', nesne: 'Sayfa özgün taramadır (Yeni Gazete, 19 Mayıs 1910). Matbaa görünmez; yalnız sesi duyulur (basım makinesi sesi temsilîdir).', soz: 'Başlık belgeden; diğer sözler özgün senaryo.', neden: 'Yusuf sabah satacağı gazeteleri matbaa önünde bekler (çocuk müvezziler belgeli).', kesme: 'Haber ile gök arasındaki zaman farkı: çocuğun sorusu tutarsızlığı açar.' } },
      { id: 'm2', ch: 'II · Söylenti', mode: 'photo', dur: 9,
        photo: { bg: '#050403', layers: [{ src: src('ebuzziya'), fit: 'paper', paper: { h: 1.0, r: -0.02, x: 0.5, y: 0.52 }, kb: [{ t: 0, x: 0.5, y: 0.45, z: 1.5 }, { t: 1, x: 0.5, y: 0.48, z: 1.1 }], grade: { dark: 0.45, tint: [24, 14, 6, 0.15] }, lamp: { x: 0.5, y: 0.35, r: 0.55, v: 1, warm: 0.18 } }] },
        cap: { k: 'ebuzziya', note: 'Velid’in Halley kitabı bu matbaada basıldı. Sahnedeki kurmaca matbaa bu değildir.' },
        sound: { scene: { press: 0.6 } }, subs: [{ at: 1.2, dur: 4.5, kind: 'ses', text: 'Harfler kasaya bir bir düşer.' }, { at: 5.8, dur: 3, kind: 'not', text: 'Dizgi elle yapılırdı: her harf ayrı bir kurşun döküm.' }],
        eval: { gorunur: 'Matbaa-i Ebüzziyâ’nın 1890 tarihli tanıtım sayfası, lamba ışığında.', gok: '—', nesne: 'Özgün baskı (Library of Congress). Elle dizgi (mürettiplik) 1910 basınında olağandır.', soz: 'Ses betimi ve bilgi notu.', neden: 'Haberin bir el işi olduğu.', kesme: 'Yakın plan: emeğin dokusu.' } }
    ],
    kahve: [
      { id: 'k1', ch: 'II · Söylenti', mode: 'photo', dur: 21, slate: ['Galata', '18 Mayıs akşamı · bir kahvehane (kurgu)'],
        photo: { layers: [
          { src: src('kahvehane'), kb: [{ t: 0, x: 0.42, y: 0.5, z: 1.08 }, { t: 0.45, x: 0.55, y: 0.45, z: 1.25 }], grade: { dark: 0.42, tint: [30, 18, 8, 0.2] }, lamp: { x: 0.55, y: 0.2, r: 0.55, v: 0.8, warm: 0.25 }, a: [{ t: 0, v: 1 }, { t: 0.36, v: 1 }, { t: 0.46, v: 0 }] },
          { src: 'assets/img/hayal18.jpg', fit: 'paper', paper: { h: 1.2, r: -0.04, x: 0.5, y: 0.6 }, kb: [{ t: 0.36, x: 0.5, y: 0.3, z: 1.25 }, { t: 1, x: 0.5, y: 0.34, z: 1.05 }], grade: { dark: 0.4, tint: [30, 18, 8, 0.16] }, lamp: { x: 0.5, y: 0.25, r: 0.6, v: 1, warm: 0.22 }, a: [{ t: 0.36, v: 0 }, { t: 0.46, v: 1 }] }],
          anchorLayer: 1 },
        cap: [{ to: 0.42, k: 'kahvehane' }, { from: 0.42, k: 'belge', text: 'Hayâl-i Cedid, 18 Mayıs 1910, s. 1 · özgün tarama (TUFS)' }],
        sound: { scene: { cafe: 1, room: 0.3 } },
        subs: [{ at: 1.2, dur: 4, who: 'K1', text: '“Kıyamet kopacak mı?” diye çocuk mecmuası bile yazmış.', src: { id: 'arkadas', label: 'Arkadaş, 21 Nisan 1910 — başlık' }, kind: 'alinti' }, { at: 5.4, dur: 2.8, who: 'K2', text: 'Kopsa haber verirler mi?' },
          { at: 8.6, dur: 4, who: 'K3', text: 'Bakın, yıldızın yüzü kime benziyor!' }, { at: 12.8, dur: 3, who: 'K2', text: 'Fotoğrafçı, söyle: makinen zehri görür mü?' }, { at: 16, dur: 3, who: 'R', text: 'Makine zehir görmez. Işık görür.' },
          { at: 19.1, dur: 1.9, kind: 'ses', text: 'Gülüşmeler.' }],
        hot: [{ from: 9, to: 21, at: [960, 420], label: 'Karikatür', act: 'doc:hayal18' }],
        eval: { gorunur: 'Önce 19. yüzyıl sonundan bir İstanbul kahvehanesi fotoğrafı; sonra masada açılan mizah gazetesi.', gok: '—', nesne: 'Kahvehane fotoğrafı tarihsizdir (19. yy sonu); fotoğraftaki kişiler hikâyenin kişileri değildir, ekranda belirtilir. Karikatür özgün taramadır (Hayâl-i Cedid, 18 Mayıs 1910).', soz: '“Kıyamet kopacak mı?” Arkadaş dergisinin başlığıdır; diğerleri özgün senaryo.', neden: 'Rıza müşterilere teslim ettiği portreler için dolaşır (kurgu).', kesme: 'Korkudan alaya, alaydan soruya.' } },
      { id: 'k2', ch: 'II · Söylenti', mode: 'photo', dur: 12,
        photo: { bg: '#050403', layers: [{ src: 'assets/img/kalem19.jpg', fit: 'paper', paper: { h: 1.1, r: 0.03, x: 0.5, y: 0.55 }, kb: [{ t: 0, x: 0.5, y: 0.3, z: 1.4 }, { t: 1, x: 0.5, y: 0.4, z: 1.1 }], grade: { dark: 0.6, tint: [30, 18, 8, 0.18] }, lamp: { x: 0.5, y: 0.3, r: 0.6, v: 0.65, warm: 0.2 } }] },
        cap: { k: 'belge', text: 'Kalem, 19 Mayıs 1910 · özgün tarama' },
        sound: { scene: { cafe: 0.7, room: 0.3 } },
        subs: [{ at: 0.8, dur: 5, who: 'K3', text: 'Kalem’de tramvay muhabbeti var: “Hocamız diyor ki kuyruktan geçince insanlar akıllarını kaybedecekmiş.”' }, { at: 6, dur: 3.4, who: 'K1', text: '“Öyleyse bizim kaybedecek bir şeyimiz yok.”' },
          { at: 9.6, dur: 2.4, kind: 'not', text: `Kalem’deki uydurma sohbetin aktarımı (${FET} özetinden); özgün metnin çevriyazısı değildir.`, src: { id: 'kalem19', label: 'Kalem, 19 Mayıs 1910' } }],
        eval: { gorunur: 'Kalem’in sayfası lamba ışığında.', gok: '—', nesne: 'Özgün tarama.', soz: 'Fıkra, Kalem’deki kurmaca tramvay sohbetinin Fettahoğlu’nun özetine dayalı aktarımıdır; doğrudan alıntı olarak sunulmaz.', neden: 'Kahvehanede gazete yüksek sesle okunur.', kesme: 'Kahkaha: korkunun dağılması.' } }
    ],
    ev: [
      { id: 'h1', ch: 'II · Söylenti', mode: 'photo', dur: 24, slate: ['Galata', '18 Mayıs gecesi · Münevver’in evi (kurgu)'],
        photo: { bg: '#050403', layers: [
          { src: src('velid-kapak'), fit: 'paper', paper: { h: 0.95, r: -0.03, x: 0.5, y: 0.52 }, kb: [{ t: 0, x: 0.5, y: 0.6, z: 1.35 }, { t: 0.42, x: 0.5, y: 0.45, z: 1.05 }], grade: { dark: 0.45, tint: [26, 16, 8, 0.16] }, lamp: { x: 0.55, y: 0.3, r: 0.55, v: 1, warm: 0.2 }, a: [{ t: 0, v: 1 }, { t: 0.42, v: 1 }, { t: 0.5, v: 0 }] },
          { src: src('velid-yorunge'), fit: 'paper', paper: { h: 1.0, r: 0.02, x: 0.5, y: 0.54 }, kb: [{ t: 0.42, x: 0.56, y: 0.42, z: 1.6 }, { t: 1, x: 0.55, y: 0.45, z: 1.3 }], grade: { dark: 0.45, tint: [26, 16, 8, 0.16] }, lamp: { x: 0.5, y: 0.4, r: 0.5, v: 1, warm: 0.2 }, a: [{ t: 0.42, v: 0 }, { t: 0.5, v: 1 }] }] },
        cap: [{ to: 0.46, k: 'velid-kapak' }, { from: 0.46, k: 'velid-yorunge' }],
        sound: { scene: { clock: 1, room: 0.4 }, at: [[2.4, 'rustle', 0.6], [11.2, 'rustle', 0.5]] },
        subs: [{ at: 0.8, dur: 4.4, kind: 'not', text: 'Kapak: “Kuyruklu Yıldızlar ve Hâle Kuyruklu Yıldızı — Neler olacak?” (çevriyazı: bu çalışma)', src: { id: 'velid', label: 'Ebüzziyazâde Velid, 1910' } },
          { at: 5.6, dur: 3.6, who: 'N', text: 'Bu sabahki fırtınada herkes kuyruk çarptı sandı.' }, { at: 9.4, dur: 3, who: 'H', text: 'Dükkânlar kapandı, Galata boşaldı.' },
          { at: 12.6, dur: 3.6, who: 'H', text: 'Bak, kitapta çizmiş: yıldızın yolu bu, Güneş burada.' }, { at: 16.4, dur: 3.6, who: 'M', text: 'Sabah biz o kuyruğun içinden mi geçeceğiz?' },
          { at: 20.2, dur: 3.8, who: 'H', text: 'Geçecek diyorlar. Bu odadaki havadan çok daha ince bir şeyden.' }],
        hot: [{ from: 1, to: 11, at: [960, 300], label: 'Kitabı aç', act: 'doc:velid' }],
        eval: { gorunur: 'Lamba ışığında Ebüzziyazâde Velid’in Halley kitabının kapağı (İstanbul silüeti üstünde kuyrukluyıldız), sonra kitaptaki yörünge şekli.', gok: '—', nesne: 'Kitap 1910 baskısıdır (Matbaa-i Ebüzziyâ, 1328 Hicrî); Tasvir-i Efkâr’daki 10 Mayıs ilanı belgelidir. 18 Mayıs sabahı İstanbul’da şafaktan önce çıkan fırtına ve paniği Yeni Gazete 19 Mayıs’ta yazar (Fettahoğlu).', soz: 'Özgün senaryo; fırtına ve dükkânların kapanması belgeye dayanır.', neden: 'Hasan Efendi (posta memuru, kurgu) kızının sorusuna kitaptaki şekille cevap verir.', kesme: 'Ev içi bekleyiş; soru bilgiye dönüşür.' } },
      { id: 'h2', ch: 'II · Söylenti', mode: 'photo', dur: 13,
        photo: { layers: [{ src: src('halic-aksam'), kb: [{ t: 0, x: 0.55, y: 0.35, z: 1.15 }, { t: 1, x: 0.6, y: 0.3, z: 1.3 }], grade: { dark: 0.55, tint: [8, 14, 34, 0.3] } }] },
        cap: { k: 'halic-aksam', note: 'Pencereden bakış; fotoğraf 1913 tarihlidir ve daha koyu tonlanmıştır.' },
        sound: { scene: { clock: 0.6, room: 0.3, water: 0.2 }, at: [[4.5, 'rustle', 0.6]] },
        subs: [{ at: 0.8, dur: 3, who: 'N', text: 'Mektubu bu gece mi yazacaksın?' }, { at: 4.4, dur: 5.6, kind: 'not', text: '“Maarif Nezâret-i Celîlesine…” — mektup açılır, yeniden katlanır. (Özgün senaryo)' }, { at: 10.2, dur: 2.6, kind: 'ses', text: 'Uzakta bir vapur düdüğü.' }],
        hot: [{ from: 2, to: 13, at: [1500, 300], label: 'Mektup', act: 'say:letter' }],
        eval: { gorunur: 'Pencereden Haliç: akşam karanlığında fenerler ve karşı kıyı.', gok: 'Fotoğrafın göğü (1913, alacakaranlık).', nesne: 'Otokrom, Haziran 1913; fenerler fotoğrafın kendisinde yanıyor. Mektup kurgusaldır ve gösterilmez.', soz: 'Özgün senaryo.', neden: 'Darülmuallimat mezunlarının taşraya tayini ve mecburi hizmet belgelidir; Münevver’in kararı kurgudur.', kesme: 'Karar ertelenir: geri alınan bir söz gibi.' } }
    ]
  };

  add({ id: 'ii4', ch: 'II · Söylenti', mode: 'sky', dur: 24, slate: ['19 Mayıs 1910', '03:00 LMT · aynı dam'],
    sky: { vp: 'teras', t0: '1910-05-19T02:58', t1: '1910-05-19T03:03', view: [{ t: 0, az: 92, alt: 6, fov: 76 }, { t: 1, az: 84, alt: 4, fov: 80 }], opts: { showBelow: true } },
    cap: { k: PANO },
    sound: { scene: { wind: 0.35, water: 0.35 }, at: [[16.4, 'applause', 0.5]] },
    subs: [{ at: 2, dur: 3, who: 'Y', text: 'Gazete buradaydı diyordu.' }, { at: 5.4, dur: 4.2, who: 'R', kind: 'alinti', text: '“…iki gün gözden nihan olacak…” Onu da yazıyordu.', src: YG9 }, { at: 10, dur: 3.6, who: 'M', text: 'Yani şimdi Güneş’le aynı yerde.' },
      { at: 14, dur: 2.2, kind: 'not', text: 'Hesap: Halley’in başı ufkun ~15° altında.' },
      { at: 16.6, dur: 7, kind: 'not', text: 'The Times’ın İstanbul muhabiri: o gece damlarda ve taraçalarda kalabalıklar vardı; amatör gözlemcilerin alkışı şehirde yankılandı (20 ve 25 Mayıs 1910; aktaran Fettahoğlu).' }],
    eval: { gorunur: 'Doğu; orada bir şey yoktur. Uzaktan alkış sesleri.', gok: '19 Mayıs 03:00 LMT: Halley’in başı ufkun ~15° altında (Horizons); Zühre ufukta; Ay (%78) batıda yeni batmış. Görmemek hesapla uyumludur.', nesne: 'Alkış sesi The Times muhabirinin aktarımına dayanır; sesin kendisi temsilîdir.', soz: 'Gazetenin “iki gün görünmeyecek” öngörüsü doğrudan alıntıdır; diğerleri özgün senaryo ve bilgi notu.', neden: 'Söylentinin doruğunda gök sessizdir; şehir yine de damlardadır.', kesme: 'Beklenen şeyin yokluğu.' } });
  add({ id: 'ii5', ch: 'II · Söylenti', mode: 'set', set: 'transit', dur: 16, in: 'fade', slate: ['Bilimsel çizim', '19 Mayıs 1910 · İstanbul için hesaplanan Güneş diski geçişi'],
    cam: [{ t: 0, x: 1150, y: 540, z: 1 }], params: p => ({ at: 0.12 + p * 0.76 }),
    sound: { scene: { wind: 0.15 }, motif: [[2, 'merak']] },
    subs: [{ at: 1.5, dur: 6, kind: 'not', text: 'İstanbul için hesaplanan geçiş: yaklaşık 05:35–06:34 LMT. Halley’in çekirdeği birkaç kilometredir; Güneş diskine karşı görülemez.' }, { at: 8, dur: 7, kind: 'not', text: 'Bu geçişin İstanbul’dan gözlendiğine dair kayıt bilinmiyor; şehirde işleyen bir rasathane de yoktu.' }],
    eval: { gorunur: 'Bilimsel çizim: Güneş diski ve hesaplanan merkez yolu.', gok: 'Giriş ~05:35, en yakın 06:04, çıkış ~06:34 LMT (Horizons, 1 dk örnek, kırılmasız).', nesne: '—', soz: 'Bilgi notu.', neden: 'Görülemeyeni hesapla göstermek.', kesme: 'Anlatıdan çizime: ölçek değişimi.' } });
  add({ id: 'ii6', ch: 'II · Söylenti', mode: 'photo', dur: 18, in: 'fade', slate: ['19 Mayıs 1910', 'sabah · Karaköy ve köprü'],
    photo: { layers: [
      { src: src('karakoy-yokus'), kb: [{ t: 0, x: 0.45, y: 0.62, z: 1.2 }, { t: 0.45, x: 0.4, y: 0.5, z: 1.35 }], a: [{ t: 0, v: 1 }, { t: 0.4, v: 1 }, { t: 0.5, v: 0 }] },
      { src: src('kopru-1910'), kb: [{ t: 0.4, x: 0.5, y: 0.6, z: 1.35 }, { t: 1, x: 0.52, y: 0.5, z: 1.12 }], grade: { mono: 0 }, a: [{ t: 0.4, v: 0 }, { t: 0.5, v: 1 }] }] },
    cap: [{ to: 0.45, k: 'karakoy-yokus' }, { from: 0.45, k: 'kopru-1910' }],
    sound: { scene: { water: 0.6, waterNear: true, street: 0.8 }, at: [[12, 'whistle', true]] },
    subs: [{ at: 1.5, dur: 3.6, kind: 'ses', text: 'Yokuştan aşağı koşan adımlar; gazete tomarı.' }, { at: 8.4, dur: 4, who: 'Y', text: 'Yeni Gazete! Arz kuyruktan geçti! Herkes sağ!' },
      { at: 12.8, dur: 5, kind: 'not', text: 'Yeni Gazete’nin 19 Mayıs sayısı korkuyu ve ardından gelen rahatlamayı haberleştirdi: “Ne Arz’ın haberi oldu, ne kuyruğun.” (aktaran Fettahoğlu)', src: YG19 }],
    eval: { gorunur: 'Önce Karaköy’de yokuşlu bir sokak (1913), sonra Galata Köprüsü’nde kalabalık (1910 öncesi).', gok: 'Sabah: Güneş ~26° yükseklikte; Halley’in başı ufkun üstünde ama gündüz göğünde görünmez.', nesne: 'Köprü fotoğrafı Nisan 1910’dan öncedir (Rijksmuseum); 1875 tarihli duba köprü 1912’de değiştirildi. Fotoğraftaki kişiler hikâyenin kişileri değildir; Yusuf yalnız sesiyle vardır.', soz: 'Satıcı bağırışı özgün senaryo; haber içeriği belgeye dayanır.', neden: 'Yusuf’un işi: kıyamet beklenen sabahın ertesinde gazete satmak.', kesme: 'Gece biter; şehir işine döner.' } });
  add({ id: 'ii7', ch: 'II · Söylenti', mode: 'card', card: 'gurpinar', dur: 15, in: 'fade',
    sound: { scene: { room: 0.3 } },
    eval: { gorunur: 'Edebî araoyun kartı.', gok: '—', nesne: '—', soz: 'Roman özeti ve önsözden kısa alıntı; konuşmalar röportaj olarak sunulmaz.', neden: 'Dönemin edebiyatında Halley korkusunun hicvi.', kesme: 'Nefes alma: belgeden edebiyata.' } });

  /* ===== III · BAKMAK ===== */
  add({ id: 'iii1', ch: 'III · Bakmak', mode: 'sky', dur: 18, in: 'fade', slate: ['III · Bakmak', '27 Mayıs 1910 · 21:30 LMT · aynı dam, batı'],
    sky: { vp: 'teras', t0: '1910-05-27T21:26', t1: '1910-05-27T21:29', view: [{ t: 0, az: 245, alt: 30, fov: 95 }, { t: 1, az: 258, alt: 12, fov: 88 }] },
    cap: { k: PANO },
    sound: { scene: { street: 0.8, wind: 0.25, water: 0.2 }, motif: [[3, 'sakin']] },
    subs: [{ at: 9, dur: 3.6, who: 'Y', text: 'Bu sefer kendisi geldi. Aramadık.' }],
    eval: { gorunur: 'Batı: Haliç’in ötesinde tarihî yarımada; Süleymaniye’den Fatih’e ve Yavuz Selim’e uzanan sırt; şehirde dağınık ışıklar.', gok: '21:30 LMT: Güneş −19° (karanlık); Halley 259° azimutta ~20° yükseklikte, Fatih ile Yavuz Selim arasının üstünde; Merih batıda alçakta, Müşteri güneybatıda yüksekte. Ay henüz doğmadı.', nesne: 'Manzara Berggren panoraması (1880’ler); gece tonu ve pencere ışıkları temsilîdir (konumları fotoğraftaki yapı dokusundan seçildi).', soz: 'Özgün senaryo.', neden: 'Akşam görünürlüğü Yeni Gazete’nin öngördüğü 22–30 Mayıs aralığındadır.', kesme: 'Aramak yerine bakmak.' } });
  add({ id: 'iii2', ch: 'III · Bakmak', mode: 'sky', dur: 26, live: true,
    sky: { vp: 'teras', t0: '1910-05-27T21:29', t1: '1910-05-27T21:31', view: [{ t: 0, az: 258, alt: 14, fov: 88 }], opts: { labels: true, hideHalleyLabel: false } },
    cap: { k: PANO },
    wait: { type: 'continue', prompt: 'Göğe bak.', hint: 'Sürükle, yakınlaş, bir cisme dokun. Hazır olduğunda devam et.', timeout: 26 },
    sound: { scene: { street: 0.6, wind: 0.25, water: 0.2 } },
    eval: { gorunur: 'Ziyaretçi göğe bakar.', gok: 'Hesaplanan gök; kuyruk tanımlı modeldir.', nesne: '—', soz: '—', neden: '—', kesme: 'Kamera durur; zaman ziyaretçinin.' } });
  add({ id: 'iii3', ch: 'III · Bakmak', mode: 'sky', dur: 16,
    sky: { vp: 'teras', t0: '1910-05-27T21:31', t1: '1910-05-27T21:32', view: [{ t: 0, az: 238, alt: -3, fov: 48 }, { t: 1, az: 240, alt: -2, fov: 44 }] },
    cap: { k: PANO },
    sound: { scene: { street: 0.5, wind: 0.2 }, at: [[4, 'rustle', 0.5]] },
    subs: [{ at: 1.5, dur: 3.4, who: 'M', text: 'Sabah Postane’ye uğrar mısın?' }, { at: 5.3, dur: 3.2, who: 'Y', text: 'Gazeteleri aldıktan sonra.' }, { at: 9.2, dur: 5, kind: 'ses', text: 'Münevver mektubu Yusuf’un gazetelerinin arasına bırakır.' }],
    eval: { gorunur: 'Aşağıda Haliç ve karşı kıyı; Sirkeci yönüne inen ışıklar. Kişiler görünmez.', gok: 'Arkada batı göğü.', nesne: 'Sirkeci’deki Büyük Postane 1909’da tamamlanmıştır.', soz: 'Özgün senaryo.', neden: 'Münevver kararını küçük bir hareketle verir (kurgu). Yusuf ertesi günün işini düşünür.', kesme: 'Karar anı: söz az, görüntü uzak.' } });
  add({ id: 'iii4', ch: 'III · Bakmak', mode: 'sky', dur: 18,
    sky: { vp: 'teras', t0: '1910-05-27T21:32', t1: '1910-05-27T21:33', view: [{ t: 0, az: 259, alt: 16, fov: 46 }, { t: 1, az: 262, alt: 12, fov: 52 }] },
    glass: p => p < 0.3 ? { label: 'ODAK CAMI · GÖK', skyA: 1 } : { sky: false, lamp: { x: 0.62, y: 0.7, r: 0.5, v: clamp((p - 0.3) * 4, 0, 1) }, label: 'ODAK CAMI · KAMERA İNSANLARA DÖNDÜ · YÜZLERİ GÖSTERMİYORUZ' },
    sound: { scene: { street: 0.4, wind: 0.2 }, at: [[5.5, 'shutter'], [7, 'tick'], [8, 'tick'], [9, 'tick'], [10, 'tick'], [11, 'tick'], [12, 'tick'], [13, 'tick'], [14, 'tick'], [15.5, 'shutter']] },
    subs: [{ at: 1.5, dur: 3.5, who: 'R', text: 'Gökyüzünü bırak. Siz durun orada.' }, { at: 5.6, dur: 3, who: 'R', text: 'Kımıldamayın. On saniye.' }, { at: 9.5, dur: 3.4, kind: 'ses', text: 'Yusuf gülmemek için dudağını ısırır; dayanamaz.' }],
    eval: { gorunur: 'Odak camında önce gök; sonra kamera döner ve camda yalnız odak dışı bir lamba ışığı kalır.', gok: 'Lamba ışığında 10 saniyelik poz.', nesne: 'Gaz yağı lambası; cam plaka; poz süresi dönem plakalarının duyarlılığına uygundur (gece, lamba ışığı: saniyeler).', soz: 'Özgün senaryo.', neden: 'Gökyüzünü kaydetme tutkusu, o göğün altındakileri hatırlama isteğine dönüşür.', kesme: 'Kameranın dönüşü: hikâyenin dönüşü.' } });
  add({ id: 'iii5', ch: 'III · Bakmak', mode: 'plate', plate: 'people', dur: 11, in: 'fade',
    sound: { scene: { room: 0.3 } },
    subs: [{ at: 1, dur: 4.2, kind: 'not', text: 'Kurmaca plaka. Bu fotoğraf hiç çekilmedi; yüzleri göstermiyoruz.' }, { at: 5.6, dur: 4.6, kind: 'ses', text: 'On saniyede kımıldayan biri camda yarı saydam bir iz olarak kalır.' }],
    eval: { gorunur: 'Banyo edilmiş cam negatif: lambanın kararmış lekesi ve yarı saydam izler; kişiler seçilmez.', gok: 'Gök plakada boştur: lamba ışığı pozu belirler.', nesne: 'Soyut bir benzetimdir; arşiv fotoğrafı değildir.', soz: 'Bilgi notu ve ses betimi.', neden: 'Rıza’nın fotoğrafı: hatırlanacak olan.', kesme: 'Zamanın camda bıraktığı iz.' } });
  add({ id: 'iii6', ch: 'Son', mode: 'finale', dur: 40,
    sky: { vp: 'teras', t0: '1910-05-27T21:34', t1: '1910-05-27T21:40', view: [{ t: 0, az: 250, alt: -4, fov: 40 }, { t: 0.35, az: 254, alt: 3, fov: 56 }, { t: 1, az: 262, alt: 16, fov: 100 }] },
    cap: { k: PANO },
    sound: { scene: { street: 0.5, wind: 0.25, water: 0.2 }, at: [[2, 'rustle', 0.6], [20, 'whistle', true]], motif: [[24, 'son']] },
    subs: [{ at: 1, dur: 4, kind: 'ses', text: 'Bir gazete katlanır.' }, { at: 5.5, dur: 3.5, kind: 'ses', text: 'Rıza yeni bir plaka yerleştirir.' }, { at: 10, dur: 3, who: 'Y', text: 'Yarın…?' }],
    final: { at: 27, text: 'Gökyüzü geçer. Hikâyesi kalır.' },
    eval: { gorunur: 'Kıyıdan yükselen kamera; şehir, ışıklar ve gök.', gok: '21:34–21:40: Halley batıda ~19°; hesaplanan yerindedir.', nesne: '—', soz: 'Son cümle özgün senaryodur.', neden: 'Yusuf yarını sorar; bu kez sessizlik bir cevaptır.', kesme: 'Uzaklaşma; deneyim kapanmaz, gökte kalınır.' } });

  /* ---------- OYNATICI ---------- */
  class Film {
    constructor({ sky, stage, ui }) {
      this.sky = sky; this.stage = stage; this.ui = ui;
      this.base = S; this.queue = S.slice(); this.i = 0; this.t = 0; this.playing = false; this.done = {};
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.lastFrame = 0; this.loop = this.loop.bind(this);
    }
    static get SHOTS() { return S; } static get SEQ() { return SEQ; } static get WHO() { return WHO; }
    chapters() { const out = []; this.queue.forEach((s, i) => { if (!out.find(c => c.ch === s.ch)) out.push({ ch: s.ch, i }); }); return out; }
    totalDur() { return this.queue.reduce((a, s) => a + s.dur, 0); }
    elapsed() { let e = 0; for (let k = 0; k < this.i; k++) e += this.queue[k].dur; return e + this.t; }
    start(i = 0) { this.i = i; this.enter(); this.play(); }
    play() { if (this.playing) return; this.playing = true; this.lastFrame = performance.now(); requestAnimationFrame(this.loop); this.ui.onPlay(true); }
    pause() { this.playing = false; this.ui.onPlay(false); }
    toggle() { this.playing ? this.pause() : this.play(); }
    goto(i) { this.i = clamp(i, 0, this.queue.length - 1); this.enter(); if (!this.playing) this.render(); }
    next() { if (this.i < this.queue.length - 1) this.goto(this.i + 1); else this.end(); }
    prev() { this.goto(this.t > 2 ? this.i : this.i - 1); }
    get shot() { return this.queue[this.i]; }
    /* bir sonraki birkaç planın görüntülerini önceden yükle */
    prefetch() {
      const list = [];
      for (let k = this.i; k < Math.min(this.queue.length, this.i + 4); k++) { const s = this.queue[k]; if (s.photo) s.photo.layers.forEach(L => list.push(L.src)); if (s.id === 'ii0') Object.values(SEQ).flat().forEach(x => x.photo && x.photo.layers.forEach(L => list.push(L.src))); }
      F.preload(list.filter(Boolean));
    }
    enter() {
      const s = this.shot; this.t = 0; this.waitState = null; this.subShown = {}; this.firedSfx = {};
      this.ui.onShot(s, this);
      if (s.sound && s.sound.scene) window.Sound.scene(s.sound.scene, s.in === 'fade' ? 2.5 : 1.5);
      if (s.wait) this.waitState = { step: 0, held: false, t0: 0 };
      const o = Object.assign({ labels: false, lines: false, landmarks: false, grid: false, hideHalleyLabel: true, showBelow: false, compass: false, tail: true }, (s.sky && s.sky.opts) || {});
      Object.assign(this.sky.opt, o); this.sky.selected = null;
      this.sky.revealLights = null; this.autoAim = null; this.holdView = null;
      if (s.live && s.sky && s.sky.view) this.sky.setView(s.sky.view[0]);
      this.prefetch();
    }
    loop(now) {
      if (!this.playing) return;
      const dt = Math.min(0.1, (now - this.lastFrame) / 1000); this.lastFrame = now;
      this.step(dt); this.render();
      if (this.playing) requestAnimationFrame(this.loop);
    }
    step(dt) {
      const s = this.shot; const w = this.waitState;
      if (s.wait && w && !w.done) {
        w.t0 += dt;
        if (s.wait.type === 'choice') {
          if (!w.shown) { w.shown = true; this.ui.showChoice(s.wait, this.done, id => this.pick(id)); }
          if (w.t0 > (s.wait.timeout || 30)) { const first = s.wait.options.find(o => !this.done[o.id]); if (first) this.pick(first.id); return; }
          this.t = Math.min(this.t + dt, s.dur * 0.5); return; }
        if (s.wait.type === 'search' || s.wait.type === 'continue') {
          if (!w.shown) { w.shown = true; this.ui.showSearch(s.wait, w.step, () => this.resolveWait(true)); }
          this.t = Math.min(this.t + dt, s.dur * 0.95);
          if (w.t0 > s.wait.timeout) this.resolveWait(false);
          return;
        }
      }
      this.t += dt;
      if (s.sound) {
        for (const [at, name, ...args] of (s.sound.at || [])) { const k = at + name; if (this.t >= at && !this.firedSfx[k]) { this.firedSfx[k] = 1; window.Sound.sfx(name, ...args); } }
        for (const [at, name] of (s.sound.motif || [])) { const k = 'm' + at + name; if (this.t >= at && !this.firedSfx[k]) { this.firedSfx[k] = 1; window.Sound.motif(name); } }
      }
      if (this.t >= s.dur) {
        if (s.mode === 'finale') { this.end(); return; }
        this.next();
      }
    }
    onPick(obj) {
      const s = this.shot, w = this.waitState; if (!s.wait || !w || w.done || s.wait.type !== 'search') return;
      const step = s.wait.steps[w.step]; if (!obj) return;
      const hit = (step.target === 'Venus' && obj.type === 'planet' && obj.id === 'Venus') || (step.target === 'Halley' && obj.type === 'halley');
      if (hit) {
        if (step.target === 'Venus') this.ui.say({ who: 'Y', kind: 'alinti', text: '“Hâle, Zühre’nin sol cihetindedir.”', src: YG9 }, 4.5);
        w.step++; w.t0 = Math.min(w.t0, s.wait.timeout - 18);
        if (w.step >= s.wait.steps.length) { this.ui.say({ who: 'R', text: 'İşte. Orada.' }, 3); this.resolveWait(true); }
        else this.ui.showSearch(s.wait, w.step, () => this.resolveWait(true));
      } else if (obj.type) this.ui.say({ kind: 'not', text: obj.name ? `${obj.name}${obj.modern ? ' · ' + obj.modern : ''} — aradığımız bu değil.` : 'Aradığımız bu değil.' }, 2.2);
    }
    resolveWait(found) {
      const w = this.waitState; if (!w || w.done) return; w.done = true; this.ui.hideInteract();
      const s = this.shot;
      if (s.wait.type === 'search' && !found) {
        this.ui.say({ who: 'R', text: 'Bak: en parlak olan Zühre. Solunda, biraz yukarıda… işte.' }, 4.5);
        this.autoAim = { from: { az: this.sky.az, alt: this.sky.alt, fov: this.sky.fov }, t: 0 };
      }
      this.holdView = found ? { az: this.sky.az, alt: this.sky.alt, fov: this.sky.fov } : null;
      this.t = Math.max(this.t, s.dur - 6);
    }
    pick(id) {
      const s = this.shot; this.done[id] = true; this.ui.hideInteract();
      const opt = s.wait.options.find(o => o.id === id); const seq = SEQ[opt.seq].map(x => Object.assign({}, x));
      const remaining = s.wait.options.filter(o => !this.done[o.id]);
      const back = remaining.length ? [Object.assign({}, s, { id: s.id + '_' + remaining.length, slate: null, dur: 14, sound: { scene: s.sound.scene } })] : [];
      this.queue.splice(this.i + 1, 0, ...seq, ...back);
      this.next();
    }
    end() { this.pause(); this.ui.onEnd(this); }

    /* ---------- çizim ---------- */
    interp(keys, p) {
      if (!keys || !keys.length) return null; if (keys.length === 1 || this.reduced && keys.length > 1 && !this.shot.live) return Object.assign({}, keys[this.reduced ? keys.length - 1 : 0]);
      let a = keys[0], b = keys[keys.length - 1];
      for (let k = 0; k < keys.length - 1; k++) if (p >= keys[k].t && p <= keys[k + 1].t) { a = keys[k]; b = keys[k + 1]; break; }
      const f = ease(clamp((p - a.t) / ((b.t - a.t) || 1), 0, 1)), o = {};
      for (const key in a) if (key !== 't') o[key] = key === 'az' ? A.wrap360(a.az + A.wrap180(b.az - a.az) * f) : mix(a[key], b[key], f);
      return o;
    }
    render() {
      const s = this.shot, p = clamp(this.t / s.dur, 0, 1), sky = this.sky, st = this.stage;
      const tsec = performance.now() / 1000;
      if (s.sky) {
        const t0 = A.lmtToUT(s.sky.t0), t1 = s.sky.t1 ? A.lmtToUT(s.sky.t1) : t0;
        sky.setViewpoint(s.sky.vp); sky.setTime(t0 + (t1 - t0) * p);
        const live = s.live && this.waitState && !this.waitState.done;
        if (!live && !this.userLook) {
          let v = this.holdView ? Object.assign({}, this.holdView) : this.interp(s.sky.view, p);
          if (this.autoAim) {
            this.autoAim.t += 1 / 60; const k = ease(clamp(this.autoAim.t / 3, 0, 1)), h = sky.where('Halley') || { az: 86, alt: 10 };
            v = { az: A.wrap360(this.autoAim.from.az + A.wrap180(h.az - this.autoAim.from.az) * k), alt: mix(this.autoAim.from.alt, h.alt, k), fov: mix(this.autoAim.from.fov, 18, k) };
          }
          if (v) { if (sky.W < sky.H && !s.glass && v.fov > 30) v.alt = Math.max(v.alt, v.fov * 0.2); if (s.sky.bob && !this.reduced && p >= s.sky.bob[0] && p <= s.sky.bob[1]) v.alt += Math.sin(this.t * 7.5) * 0.35; else if (!this.reduced && !s.glass) { v.az += Math.sin(tsec * 0.31) * 0.06; v.alt += Math.sin(tsec * 0.43) * 0.04; } sky.setView(v); }
        }
        if (s.sky.reveal) sky.revealLights = clamp((p - s.sky.reveal[0]) / (s.sky.reveal[1] - s.sky.reveal[0]), 0, 1);
        sky.draw();
      }
      st.clear(); st.anchor = null;
      if (s.mode === 'photo') F.drawPhoto(st, s.photo, p, tsec, this.reduced);
      else if (s.mode === 'set') { const cam = this.interp(s.cam, p) || { x: 960, y: 540, z: 1 }; st.camTransform(cam); window.SETS[s.set].draw(st, tsec, s.params ? s.params(p) : {}); }
      else if (s.glass) F.drawGroundGlass(st, sky.c, s.glass(p));
      else if (s.mode === 'black' || s.mode === 'card' || s.mode === 'plate') { st.g.setTransform(1, 0, 0, 1, 0, 0); st.g.fillStyle = '#030405'; st.g.fillRect(0, 0, st.c.width, st.c.height); if (s.mode === 'plate') this.drawPlate(s.plate, p, tsec); if (s.mode === 'card') this.ui.card(s.card, p); }
      this.ui.onFrame(s, this.t, p, this);
    }
    /* kurmaca cam plaka / kontak baskı */
    drawPlate(kind, p, tsec) {
      const st = this.stage, g = st.g, W = st.c.width, H = st.c.height, k = Math.min(W / (W < H ? 1100 : 1600), H / (H / st.dpr < 500 ? 1500 : 1200));
      const centerY = H * (H / st.dpr < 500 ? 0.34 : W < H && H / st.dpr < 720 ? 0.36 : 0.5);
      g.save(); g.translate(W / 2, centerY - 60 * k); g.scale(k, k);
      if (kind === 'dawn') {
        // karanlık oda: kırmızı güvenlik ışığı; plakanın kontak baskısı, HESAPLANAN gökten üretilir
        g.fillStyle = '#120403'; g.fillRect(-900, -600, 1800, 1200);
        const rg = g.createRadialGradient(0, -260, 40, 0, -260, 900); rg.addColorStop(0, 'rgba(170,30,18,.32)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(-900, -600, 1800, 1200);
        g.save(); g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 30; g.fillStyle = '#d9cdb4'; g.fillRect(-450, -320, 900, 640); g.restore();
        g.save(); g.beginPath(); g.rect(-420, -290, 840, 580); g.clip();
        const src = this.sky.c, sw = src.width, sh = src.height, s2 = Math.max(840 / sw, 580 / sh);
        // 30 sn izlemesiz poz: iki kopya, çok küçük kayma (yıldız izi)
        g.globalAlpha = 1; g.drawImage(src, -sw * s2 / 2, -sh * s2 / 2, sw * s2, sh * s2);
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.9; g.drawImage(src, -sw * s2 / 2, -sh * s2 / 2, sw * s2, sh * s2);
        g.globalAlpha = 0.5; g.drawImage(src, -sw * s2 / 2 + 1.2, -sh * s2 / 2 - 0.6, sw * s2, sh * s2); g.globalAlpha = 1;
        g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.fillRect(-420, -290, 840, 580);
        g.globalCompositeOperation = 'color'; g.fillStyle = 'rgba(150,104,62,.9)'; g.fillRect(-420, -290, 840, 580);
        g.globalCompositeOperation = 'source-over';
        // gümüş lekeleri ve kenar kararması
        for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(30,20,12,${0.06 + 0.1 * F.R(i * 3.3)})`; g.beginPath(); g.arc(-420 + F.R(i * 1.7) * 840, -290 + F.R(i * 2.9) * 580, 1 + F.R(i) * 3, 0, 7); g.fill(); }
        const vg = g.createRadialGradient(0, 0, 200, 0, 0, 560); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(40,20,10,.5)'); g.fillStyle = vg; g.fillRect(-420, -290, 840, 580);
        g.restore();
      } else {
        // cam negatif: lamba bir karartı, kımıldayan beden yarı saydam bir iz. Kişi seçilmez.
        g.fillStyle = '#0b0a09'; g.fillRect(-900, -600, 1800, 1200);
        const lg2 = g.createRadialGradient(0, -200, 50, 0, -200, 800); lg2.addColorStop(0, 'rgba(60,70,60,.25)'); lg2.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg2; g.fillRect(-900, -600, 1800, 1200);
        g.save(); g.translate(0, 10); g.rotate(-0.02);
        g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 30; g.fillStyle = 'rgba(178,186,170,.86)'; g.fillRect(-440, -310, 880, 620); g.shadowColor = 'transparent';
        g.beginPath(); g.rect(-420, -290, 840, 580); g.clip();
        const lamp = g.createRadialGradient(250, 70, 0, 250, 70, 200); lamp.addColorStop(0, 'rgba(10,10,8,.95)'); lamp.addColorStop(0.3, 'rgba(20,20,16,.6)'); lamp.addColorStop(1, 'rgba(20,20,16,0)'); g.fillStyle = lamp; g.fillRect(-420, -290, 840, 580);
        // kımıldayan bedenlerin bıraktığı yarı saydam, biçimsiz izler (yalnız yoğunluk farkı; bir kişi seçilmez)
        for (let i = 0; i < 26; i++) { const x = -260 + F.R(i * 4.7) * 360 + (i % 3) * 14, y = -40 + F.R(i * 9.1) * 260, r = 70 + F.R(i * 2.3) * 120;
          const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(48,52,44,${0.05 + 0.05 * F.R(i)})`); gr.addColorStop(1, 'rgba(48,52,44,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
        for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(60,64,56,${0.05 + 0.12 * F.R(i * 5.1)})`; g.fillRect(-420 + F.R(i * 1.3) * 840, -290 + F.R(i * 2.1) * 580, 1 + F.R(i) * 2, 1 + F.R(i * 7) * 2); }
        g.restore();
      }
      g.restore();
      const d = st.dpr;
      g.font = `${11 * d}px "IBM Plex Mono", monospace`; g.textAlign = 'center'; g.fillStyle = 'rgba(232,206,180,.9)';
      F.wrapText(g, kind === 'dawn' ? 'KURMACA PLAKA · HESAPLANAN GÖKTEN ÜRETİLDİ · 13×18 cm · 30 sn, izlemesiz' : 'KURMACA CAM NEGATİF · BU FOTOĞRAF HİÇ ÇEKİLMEDİ · KİŞİLER GÖSTERİLMEZ', W / 2, centerY + 310 * k, W - 40 * d, 17 * d);
    }
  }
  window.Film = Film; window.FilmWho = WHO;
})();
