# Mekân, görüntü ve toplumsal bağlam kaynakları

Bu dosya, deneyimdeki her mekân için **belgelenen** ayrıntıyı ve **olasılıklı tamamlamayı** ayırır. Etiketler: **[B]** kaynakta açıkça var · **[O]** olası; yakın tarihli kaynaktan, fotoğraftan ya da çıkarımdan · **[T]** temsil; görsel tamamlama, kaynakla sınanmadı.

Tarihi belirsiz fotoğraflar kesin kanıt sayılmadı. Kaynaklar 2026 Ekim’inde erişildi.

## Seçilen mekânlar ve aralarındaki mesafe

Bu sürümde mekânlar **çizilmez**. Her mekân ya gerçek bir fotoğrafla, ya özgün bir belge taramasıyla, ya da hesaplanan gökyüzü ile bir panorama fotoğrafının birleşimiyle gösterilir. Kurmaca kişiler görüntüde yer almaz; yalnız sesleri ve altyazıları vardır.

| Mekân | Görüntü | Kullanıldığı yer | Not |
|---|---|---|---|
| Galata’da bir dam (gözlem noktası) | Hesaplanan gök + Berggren panoraması (Galata Kulesi’nden, 1880’ler) | Açılış sonu, I, II/19 Mayıs, III, Son | Gök, Kule’nin konumu (41,0256 K, 28,9741 D; göz ~87 m) için hesaplanır. Kurmaca dam Kule’nin dibindedir ve biraz daha alçaktır **[O]**. |
| Fotoğrafhanenin bulunduğu sokak | Kahn arşivi otokromu, Galata Kulesi’ne çıkan sokak (Haziran 1913) | Açılış | Gece görünümü renk düzenlemesidir **[T]**; stüdyo kurmacadır, içi gösterilmez. |
| Matbaa | Yeni Gazete 19 Mayıs 1910 sayfası (tarama) + Matbaa-i Ebüzziyâ tanıtım sayfası (1890, LoC) | II (seçmeli) | Sahnedeki matbaa kurmacadır ve görünmez; yalnız sesi vardır. Ebüzziyâ sayfası, Velid’in kitabının basıldığı matbaayı tanıtır. |
| Kahvehane | “Constantinople. Café Turc” (19. yy sonu, BPL) + Hayâl-i Cedid ve Kalem taramaları | II (seçmeli) | Fotoğraftaki kişiler hikâyenin kişileri değildir; bu, ekranda yazılıdır. |
| Münevver’in evi | Velid’in kitabının kapağı ve iç sayfası (1910) + Kahn, Haliç’te akşam (1913) | II (seçmeli) | Ev görünmez; kitap ve pencereden bakış gösterilir. |
| Karaköy, sabah | Kahn, Karaköy’de yokuş (1913) + Galata Köprüsü (Nisan 1910 öncesi, Rijksmuseum) | II/19 Mayıs sabahı | Köprüdeki kişiler hikâyenin kişileri değildir; Yusuf yalnız sesiyle vardır. |

Yürüme süreleri (yaklaşık): Babıali → Galata Köprüsü ~1,2 km, ~15 dk; köprü ~480 m; Karaköy → Yüksekkaldırım → Galata ~500 m, ~10 dk yokuş. Yusuf’un sabah turu bu ölçekte kurgulandı **[O]**.

## Bakış yönleri ve panoramanın yerleştirilmesi

Manzara, **Guillaume Berggren’in 1880’lerde Galata Kulesi’nden çektiği on levhalık panoramadır** (albümin baskı; kamu malı, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Guillaume_Berggren_-_Panorama_of_Constantinople_(1880s).jpg)). Fotoğraf 1910’dan yaklaşık 25–30 yıl öncedir. Haydarpaşa Garı (1909) ve 1880’lerden sonraki yapılar fotoğrafta yoktur; bu farklar bilinçli olarak düzeltilmedi **[B]**.

Yerleştirme yöntemi (`tools/pano/build_pano.py`):

1. Her levha ayrı bir perspektif fotoğraftır; levhalar arasında 2–5°’lik bindirmeler vardır. Levha sınırlarındaki koyu birleşim çizgileri yatay ara değerle silindi.
2. Her levhanın yönü, gerçek enlem/boylamdan hesaplanan yapı yönlerine göre ayarlandı: Kız Kulesi ve Selimiye (levha 2), Adalet Kulesi (3), Ayasofya ve Sultanahmet (4), Beyazıt Yangın Kulesi ve Süleymaniye (5), Fatih ve Yavuz Selim (7). Ölçek levhalar arasında 46–50 piksel/derece çıktı; aynı objektif için tutarlıdır.
3. Ufuk satırı, tepe yükseklikleri bilinen yapılardan ve uzak tepelerden (Kayışdağı, Çamlıca) hesaplandı. Doğrulama: Nuruosmaniye iki ayrı levhada aynı yöne (191°) düştü.
4. Doğruluk: yönlerde yaklaşık ±0,5°, ufuk yüksekliğinde levhaya göre ±0,3–0,7° **[O]**. Kuzeydeki 347°–39° aralığı (Pera yamacı) panoramada yoktur; orada koyu, alçak bir sırt gösterilir **[T]**.
5. Gökyüzü fotoğraftan maskeyle çıkarıldı; yerine hesaplanan gök konur. Fotoğraf gündüz çekilmiştir: gece ve şafak görünümü, Güneş’in hesaplanan yüksekliğine bağlı bir karartma ve renk düzenlemesidir **[T]**. Pencere ve fener ışıkları temsilîdir; yerleri fotoğraftaki yapı dokusundan rastgele seçilir **[T]**.

Galata Kulesi’nden hesaplanan yönler (tepe noktası) ve levha kalibrasyonu (`tools/build_docs.js` üretir):

| Yapı | Yön (az.) | Yükseklik açısı (tepe) | Uzaklık |
|---|---|---|---|
| Ayasofya | 165.0° | 0.14° | 1.96 km |
| Sultanahmet Camii | 174.4° | 0.32° | 2.26 km |
| Adalet Kulesi (Topkapı) | 154.0° | 0.03° | 1.73 km |
| Yeni Cami | 197.4° | -2.32° | 0.99 km |
| Beyazıt Yangın Kulesi | 207.8° | 1.83° | 1.75 km |
| Süleymaniye | 219.1° | 1.63° | 1.36 km |
| Fatih Camii | 251.1° | 0.78° | 2.17 km |
| Yavuz Selim Camii | 275.7° | 0.73° | 2.09 km |
| Kız Kulesi | 101.3° | -1.44° | 2.56 km |
| Üsküdar iskelesi (Mihrimah Sultan Camii) | 87.9° | -0.73° | 3.44 km |
| Büyük Çamlıca | 88.5° | 1.24° | 7.88 km |
| Kayışdağı | 110.6° | 1.08° | 17.56 km |
| Selimiye Kışlası | 121.0° | -0.38° | 4.32 km |
| Haydarpaşa Garı (1909) | 130.3° | -0.58° | 4.97 km |
| Nusretiye Camii (Tophane) | 77.8° | -1.41° | 0.69 km |

| Levha | Yön aralığı | Ölçek (px/°) | Ufuk satırı |
|---|---|---|---|
| 0 | 39.3° – 70.2° | 49 | 303 |
| 1 | 68.1° – 100.7° | 49.5 | 300 |
| 2 | 100.7° – 132.9° | 49.5 | 300 |
| 3 | 131.0° – 163.3° | 49 | 222 |
| 4 | 160.2° – 192.6° | 48.9 | 214 |
| 5 | 188.4° – 221.3° | 48.5 | 176 |
| 6 | 219.2° – 252.0° | 48.5 | 180 |
| 7 | 249.9° – 284.3° | 46.3 | 185 |
| 8 | 282.3° – 316.1° | 47 | 175 |
| 9 | 314.1° – 347.2° | 47 | 170 |


Sonuçlar:

- 10 Mayıs 03:30 LMT’de Halley ~85° azimutta, **Üsküdar’ın ve Çamlıca sırtının üstündedir**. Zühre (Venüs) aynı saatte ~89–94° azimutta, Çamlıca’nın üstünden yükselir.
- 27 Mayıs 21:30 LMT’de Halley ~259° azimutta, tarihî yarımadada **Fatih (251°) ile Yavuz Selim (276°) camilerinin arasındaki sırtın üstündedir**.
- Birbirinden görülmeyen anıtlar aynı ufka toplanmadı: manzara tek bir noktadan çekilmiş gerçek bir fotoğraftır.
- Önceki sürümdeki Beyazıt Yangın Kulesi koordinatı yanlıştı (41,01225 K, 28,9633 D); doğru değer 41,0117 K, 28,9644 D’dir ve panoramayla doğrulandı.

## Fiziki şehir, Mayıs 1910

- **Galata Köprüsü:** 1872–1875’te yapılan demir dubalı, ahşap kalas döşemeli köprüdür. Yaklaşık 480 m uzunluğunda, 13–14 m genişliğindedir. Ağustos 1912’de yerini Hüttenwerk Oberhausen yapımı yeni köprüye bıraktı **[B]**. Geçiş ücretlidir (1930’a kadar) **[B]**; 1910 tarifesi doğrulanamadı. Kaynaklar: [Prometheus, 8.2.1913 (Max Buchwald)](https://dbc.wroc.pl//Content/18512/PDF/20683.pdf), [Wikipedia: Galata Bridge](https://en.wikipedia.org/wiki/Galata_Bridge), [LoC fotokrom, yak. 1890–1900, tarihi kesin değil](https://www.loc.gov/pictures/item/2001699426/).
- **Tramvay:** Mayıs 1910’da yalnız **atlı tramvay** çalışıyordu. Elektrikli tramvay Şubat 1914’te başladı **[B]**. Kadınlar için perdeli bölme vardı; tramvayın önünde vardacı boru çalarak koşardı **[B]**. Kaynak: [İstanbul’da kara ulaşımı (istanbultarihi.ist)](https://istanbultarihi.ist/assets/uploads/pdf/istanbulda-kara-ulasimi-219.pdf). Seste uzaktan nal sesi bu nedenle kullanıldı; motorlu araç sesi kullanılmadı.
- **Tünel:** 1875’ten beri Karaköy–Beyoğlu arasında kablolu çekişle çalışıyordu **[B]** ([Wikipedia: Tünel](https://en.wikipedia.org/wiki/T%C3%BCnel)).
- **Aydınlatma:** 1910–1914 arasında İstanbul’da 8.742 gaz feneri ve 2.316 gaz yağı lambası vardı. Galata ve Tophane 1859’dan beri gazla aydınlatılıyordu. **Elektrikli sokak aydınlatması yoktu**; Silahtarağa santrali 1914’te çalışmaya başladı **[B]**. Kaynaklar: [İstanbul’un gazhaneleri](https://istanbultarihi.ist/assets/uploads/pdf/istanbulun-gazhaneleri-358.pdf), [İstanbul’un aydınlatılmasında elektrik dönemi](https://istanbultarihi.ist/assets/uploads/pdf/istanbulun-aydinlatilmasinda-elektrik-donemi-357.pdf). Panoramadaki pencere ve fener ışıkları sıcak, küçük ve seyrektir **[O]**; yerleri **[T]**.
- **Galata Kulesi:** 1875 fırtınasında külahını yitirdi. 1910’da taş gövdenin üstünde **iki ahşap çokgen oda ve uzun bir bayrak direği** vardı. Külah 1964–67’de yeniden yapıldı **[B]** ([TDV İA, “Galata Kulesi”](https://islamansiklopedisi.org.tr/galata-kulesi)). Kulenin yangın gözetleme işlevi belgelidir **[B]**.
- **Yapı dokusu:** 1870 yangınından sonra kâgir yapı teşvik edildi; Cadde-i Kebir genişletildi; parke taşı kullanıldı **[B]** ([Cem Doğan](https://ctad.hacettepe.edu.tr/22_44/03_CemDogan.pdf)). Pera’da 1911’de hâlâ ahşap evler vardı **[B]**. Kat sayıları, sıva renkleri ve dam terasları için 1910’a özgü kaynak bulunamadı **[T]**.
- **Haydarpaşa Garı** 1909’da tamamlandı **[B]** ([Wikipedia](https://en.wikipedia.org/wiki/Haydarpa%C5%9Fa_railway_station)). **Sirkeci Büyük Postane** 1905–1909 arasında yapıldı **[B]** ([Wikipedia](https://en.wikipedia.org/wiki/Grand_Post_Office)). **Selimiye Kışlası** ve **Kız Kulesi** bugünkü biçimlerine yakındı **[B]**.
- **Vapurlar:** Şirket-i Hayriye (numaralı vapurlar) ve İdare-i Mahsusa çalışıyordu; İdare-i Mahsusa Eylül 1910’da adını değiştirdi **[B]** ([Osmanlı İstanbulu’nda deniz ulaşımı](https://istanbultarihi.ist/assets/uploads/pdf/osmanli-istanbulunda-deniz-ulasimi-yeni-cag-221.pdf)). Sesteki uzak vapur düdüğü bu yoğun trafiğe dayanır **[O]**.
- **Gece sesleri:** Bekçinin yangını “Yangın var!” diye duyurması ancak popüler kaynaklarda geçer, bu yüzden kullanılmadı. Bozacı ve salepçi kış satıcılarıdır; Mayıs gecesi için kullanılmadı.

## Fotoğraf: araçlar ve sınırlar

- Stüdyolarda 13×18 ve 18×24 cm cam kuru plakalar, tepe camından gelen gün ışığı ve uzun poz için baş destekleri kullanılırdı **[B]** ([Musée suisse de l’appareil photographique](https://www.cameramuseum.ch/en/discover/permanent-exhibition/the-plate-era/the-photographic-portrait/)).
- Magnezyum flaş tozu patlayıcıydı ve gürültüyle dumana yol açardı **[B]** ([Ilford el kitabı](https://photomemorabilia.co.uk/Ilford/FlashPowder_Manual_of_Photography.html)). Damdaki gece sahnesinde kullanılmadı; poz lamba ışığıyla verildi ve bu fotoğraf gösterilmez.
- 1910’da kuyrukluyıldız fotoğrafları gökyüzünü izleyen teleskop-kameralarla, dakikalarca ya da saatlerce poz verilerek çekildi:
  - Johannesburg, 6 Mayıs: 60 dakika ([Science Museum Group](https://collection.sciencemuseumgroup.org.uk/objects/co56888/glass-positive-halleys-comet-and-venus)).
  - Barnard, Yerkes: 12 dakika ile 1 sa 57 dakika arası ([ApJ 39, 1914](https://articles.adsabs.harvard.edu/pdf/1914ApJ....39..373B)).
  Rıza’nın 30 saniyelik, izlemesiz plakasında yıldızlar kısa iz bırakır, Halley ancak bir leke olur **[O]**: fiziksel çıkarım, amatör belgesi yok.
- Pera stüdyoları (Sébah & Joaillier, Phébus/Febüs, Abdullah Frères) belgelidir **[B]**. Rıza’nın stüdyosu **adsız ve kurmacadır**; hiçbirine bağlanmadı.

## Toplumsal bağlam (Münevver ve Yusuf)

- **Darülmuallimat** 1870’te açıldı. 1910–11’de yatılı kısmı Fatih-Çarşamba’da açıldı. Öğrencilere harçlık verilir, karşılığında mecburi hizmet doğardı **[B]** ([TDV İA, “Dârülmuallimât”](https://islamansiklopedisi.org.tr/darulmuallimat), [Küre Ansiklopedi](https://kureansiklopedi.com/tr/detay/darulmuallimat-2)).
- **Taşraya tayin** gerçek bir seçenekti. Bursa Kız Rüşdiyesi örneklerinde 250–700 kuruş maaşlar ve naklen tayinler, Trabzon, Ankara, Selanik, İzmir görevleri ve itirazlar belgelidir **[B]** ([Bursa Kız Rüşdiye Mektebi, 1882–1909](https://www.historystudies.net/dergi/bursa-kiz-rusdiye-mektebi-1882-190920220817012453.pdf)). Taşrada muallime açığı vardı ([Adana İnas Rüşdiyesi](https://avesis.cumhuriyet.edu.tr/yayin/66d22115-919a-43e0-aa2e-24bd14822fa0/adana-inas-kiz-rustiyesi-baglaminda-osmanlida-muallime-kadin-ogretmen-sorunlari-1892-1913)). Münevver’in tayini ve mektubu kurgudur.
- Tramvay ve vapurlarda kadın bölmeleri vardı; tramvaydaki perde 1923’te kaldırıldı **[B]** ([ATAM Dergi](https://atamdergi.gov.tr/ozet/1149/eng)). Münevver damda annesiyle ve aynı binanın komşularıyla bulunur. Galata’da karma bir apartmanda bu **[O]** düzeyindedir.
- **Çocuk müvezziler:** İlk çocuk gazete satıcısı 1892’de Üsküdar iskelesinde görüldü. 1910’da Babıali’den gazete alıp çocuklara dağıtan aracılar vardı. Satıcı çocuklar çoğunlukla yalınayaktı **[B]** ([İstanbul Ansiklopedisi](https://istanbulansiklopedisi.org/handle/rek/27780), [aracılar](https://istanbulansiklopedisi.org/handle/rek/32537), [yalınayaklık](https://istanbulansiklopedisi.org/handle/rek/11997)). 1910 gazete fiyatları doğrulanamadığı için sahnelerde fiyat söylenmez.
- **Kahvehane ve kıraathane:** Gazete bulundurulan kıraathaneler belgelidir **[B]** ([TDV İA, “Kahvehane”](https://islamansiklopedisi.org.tr/kahvehane)). Sesli okuma alışkanlığı için akademik kaynak bulunamadı **[O]**.

## Görsel kaynak dosyası ve kullanım hakları

Etiketler ekranda da gösterilir: **arşiv fotoğrafı**, **belge** (tarama), **fotoğraf + hesap** (panorama ve hesaplanan gök), **kurmaca plaka** (hesaplanan gökten üretilmiş benzetim).

| Görsel | Tarih (1910’a uzaklık) | Tür | Kaynak ve hak durumu | İşlem |
|---|---|---|---|---|
| Berggren, Galata Kulesi’nden panorama | 1880’ler (~25–30 yıl önce) | fotoğraf + hesap | Kamu malı · Wikimedia Commons (Palais Dorotheum, 2014) | Gök maskesi, levha hizalama, ton eşitleme, gece tonu |
| Auguste Léon, Galata Kulesi’ne çıkan sokak (A2306S) | Haziran 1913 (+3 yıl) | arşiv fotoğrafı | CC0 · Albert-Kahn Müzesi | Kırpma; gece görünümü renk düzenlemesi |
| Auguste Léon, Karaköy’de yokuş (A2300) | Haziran 1913 (+3) | arşiv fotoğrafı | CC0 · Albert-Kahn Müzesi | Kırpma |
| Auguste Léon, Haliç akşam (A2287) | Haziran 1913 (+3) | arşiv fotoğrafı | CC0 · Albert-Kahn Müzesi | Kırpma, karartma |
| Galata Köprüsü, Eminönü yönüne (RP-F-F01141-CD) | yak. 1900 – Nisan 1910 öncesi | arşiv fotoğrafı | CC0 · Rijksmuseum | Kırpma |
| Galata Köprüsü (LCCN 2016820955) | 1909–1919 | arşiv fotoğrafı (yedek) | Kamu malı · Library of Congress | — |
| Constantinople. Café Turc | 19. yy sonu (tarihsiz) | arşiv fotoğrafı | Kamu malı · Boston Public Library / DPLA | Karartma, lamba ışığı |
| Imprimerie Eb-uz-zia (LCCN 2009631575) | 1890 (−20) | belge | Kamu malı · Library of Congress | Lamba ışığı |
| Velid, *Kuyruklu Yıldızlar ve Hâle Kuyruklu Yıldızı* — kapak ve iç sayfalar | 1910 (1328 Hicrî) | belge | Eser kamu malı; sayısal kopya ve filigran İBB Atatürk Kitaplığı | Kırpma |
| Gazete ve dergi kupürleri (`assets/img/*.jpg`) | 1910 | belge | Beyazıt Devlet Kütüphanesi – TUFS, Hakkı Tarık Us Koleksiyonu | Kırpma, küçültme, ton |
| Yerkes fotoğrafları, 29 Mayıs ve 6 Haziran 1910 | 1910 | belge (bilim) | Kamu malı (ABD) · Wikimedia Commons | Yalnız belgeler masasında; Wisconsin’de çekildi |
| Odak camı, kontak baskı, cam negatif | — | kurmaca plaka | Bu deneyim | Hesaplanan gökten üretilir; arşiv fotoğrafı değildir |

Fotoğraflardaki gerçek kişiler (kahvehane, köprü, sokak) hiçbir zaman kurmaca karakter olarak sunulmaz. Yerkes’in Ocak 1910 tarihli 2 ayaklık reflektör plakası Mayıs gözlemi gibi gösterilmez.

İncelenip kullanılmayanlar: Sébah & Joaillier’in Galata Kulesi’nden panoraması (LoC, 1890 civarı; çözünürlüğü düşük olduğu için yedek); Kahn’ın limonata satıcısı çocuk fotoğrafı (A2185; gerçek bir çocuk Yusuf sanılmasın diye kullanılmadı).
