# Bilimsel yöntem ve sınırlar

## Ne hesaplanıyor, ne temsil ediliyor?

| Öğe | Durum | Kaynak / yöntem |
|---|---|---|
| Halley’in başının konumu | **Hesaplanan** | NASA/JPL Horizons, çözüm SAO/1910 (kayıt 90000029). Topo-merkezli görünür RA/Dec, tarihin ekinoksu, 10 dk örnek. Ham yanıt: `research/raw/halley.txt` |
| Güneş, Ay, gezegenler | **Hesaplanan** | astronomy-engine 2.1.19 (MIT), topo-merkezli görünür, 1 sa örnek, doğrusal ara değer |
| Yıldızlar | **Katalog** | Hipparcos (d3-celestial 0.7.35 `stars.6.json`, 5.044 yıldız, 6 kadire kadar). Bütün dönem için tek bir çerçeve: 1910-05-15 için presesyon, nütasyon ve yıllık sapınç. Öz hareket uygulanmadı (Arcturus için ~3,5′). |
| Takımyıldız çizgileri ve adları | Geleneksel çizim | d3-celestial; adlar Türkçe |
| Samanyolu | **Katalog konturu + temsilî parlaklık** | d3-celestial `mw.json` konturları 1910 ekinoksuna taşınıp dokuya dönüştürüldü |
| Gök parlaklığı, alacakaranlık renkleri, Ay ışığı | **Model / temsil** | Güneş ve Ay yüksekliğine bağlı yaklaşık fiziksel model; ölçülmüş bir gök parlaklığı değildir |
| Çıplak göz sınır kadiri | **Model** | Gök parlaklığından türetilir; atmosferik sönüm k = 0,28 kadir/hava kütlesi |
| Halley’in parlaklığı | **Horizons nominal modeli** | T-mag (M1 = 5,5, k1 = 8). 1910 gözlem ölçümü değildir |
| Kuyruk yönü | **Hesaplanan** | Güneş’in tersi yönündeki konum açısı: Horizons PsAng, ICRF kuzeyinden tarihin gerçek kuzeyine döndürülmüş (−0,53°…+0,02°), 10 dk |
| Kuyruk uzunluğu, genişliği, parlaklığı | **Tanımlı model, sanatsal** | Aşağıya bakın |
| Atmosferik kırılma | Seçilebilir | Sæmundsson formülü (10 °C, 1010 hPa, standart atmosfer). Horizons verisi havasızdır; gerçek 1910 havası bilinmiyor |
| İstanbul mekânı | **Yorum / çizim**: dönem fotoğraflarından esinlenen stilize çatılar; ölçülmüş ufuk değil | Sahne künyeleri; gök sahneleri Galata, araştırma görünümü referans İstanbul konumu. Eski fotoğraf panorama yüklenmez. |
| Hava durumu | **Varsayım** | Bütün geceler açık hava ile sahnelendi. Hesaplanan görünürlük tarihsel hava raporu yerine konmaz. Belgelenen tek hava olayı: 18 Mayıs sabahı şafaktan önce İstanbul’da çıkan fırtına ve gün boyu süren yağmur (Yeni Gazete, 19 Mayıs 1910; aktaran Fettahoğlu 2025); yalnız sözle anılır. |

## Kuyruk modeli

Kuyruk, çekirdekten Güneş’in tersi yönünde uzanan, fiziksel uzunluğu *L* olan düz bir çizgi kabul edilir. Varsayılan *L* = 0,30 AU’dur; anlatı sahnelerinde kullanılır; gözlem masasında kuyruk açılıp kapatılabilir. Çekirdekten *s* uzaklığındaki bir noktanın başa göre görünür açısı:

θ(s) = atan2( s · sin β , Δ + s · cos β )

Burada Δ Halley–Dünya uzaklığı, β faz açısıdır (Horizons S-T-O). Nokta, başın konum açısı yönünde θ kadar ilerletilerek göğe yerleştirilir. Horizons PsAng değerini referans sistemin (ICRF/J2000) kuzey kutbuna göre verir; görünür RA/Dec ise 1910 tarihinin gerçek ekvatoruna göredir. Bu iki “kuzey” arasındaki fark (yerel olarak en çok 0,53°) veri üretiminde giderilir: her örnekte J2000 kutbunun tarih çerçevesindeki konum açısı PsAng’a eklenir (`tools/build_halley.js`). Yüzey parlaklığı e^(−s / 0,38L) ile azalır. Görünürlüğü gök parlaklığına ve hava kütlesine göre belirlenir; genişlik 0,004 + 0,07·s AU kabul edilir. Bu bir **görselleştirme modelidir**: eğrilik, toz ve iyon kuyruğu ayrımı ve fotometri yoktur.

Karşılaştırma için Barnard’ın Yerkes’ten (Wisconsin) çıplak gözle verdiği kuyruk uzunlukları araştırma karşılaştırması olarak kaydedilmiştir: 9 Mayıs ~15°, 27 Mayıs ~53° (ApJ 39, 1914). Bunlar İstanbul gözlemi değildir. İstanbul’a özgü 100–120° kuyruk ya da doğrulanmamış parlaklık zirveleri kullanılmadı.

## Zaman

- Tarihler **Gregoryen**dir. Rumi tarihli gazeteler çevrilmiştir: Yeni Gazete’nin 9 Mayıs sayısı 26 Nisan 1326 tarihini de taşır.
- Saatler **İstanbul yerel ortalama güneş saati (LMT)** ile verilir: LMT = UT + 1 sa 55 dk 54,816 sn (28,9784° D). Bu bir **seçilmiş gösterim kuralıdır**; dönemin sivil saat uygulamasına dair bir iddia değildir. Osmanlı ezanî (alaturka) saat ve Avrupa saati o yıllarda birlikte kullanılıyordu; bir gazetenin verdiği saatin hangi kurala göre olduğu ayrıca yorumlanmalıdır. Ana saat göstergesi LMT’dir; Güneş geçişinin UT aralığı ayrıca belirtilir.
- Aynı kuralı Galata’nın kendi boylamıyla uygulamak 1,02 sn fark eder; IANA saat dilimi veritabanı Mayıs 1910 için `Europe/Istanbul` = UT + 1:56:56 verir (bu sitenin kuralından 61,2 sn fazla). Bu değerler birbirinin yerine aynı an değişmeden konamaz.
- **UT**, 1910 için Horizons’un yeniden kurduğu UT’dir (**UT1**), bugünkü UTC değildir. Kodda zaman, JavaScript’in `Date` sayısı içinde taşınır; bu yalnız bir sayı kabıdır, saat dilimi iddiası değildir.
- Bugünün Türkiye saatiyle (UTC+3) karşılaştırmak için LMT’ye yaklaşık 1 sa 4 dk eklenir; bu yalnız sezgi içindir.

## Korunan hesap sonuçları

- **Günberi:** 20 Nisan 1910, 04:17 TDB; q = 0,5872 AU (Horizons oskülasyon elemanları).
- **Dünya’ya en yakın geçiş:** 20 Mayıs 1910, 12:51 UT; 0,151357 AU = 22,64 milyon km. Kullanılan çözümde **ışık-zamanı düzeltilmiş yer merkezli gözlemci uzaklığının** en küçük değeridir (bağımsız denetim: 12:50:50,09 UT, 0,1513571505 AU). Eşzamanlı geometrik en yakın yaklaşım ayrı bir tanımdır ve burada hesaplanmadı.
- **İstanbul’dan Güneş diski geçişi:** 19 Mayıs 1910.

  | Olay | LMT | UT | Güneş yüksekliği |
  |---|---|---|---|
  | Giriş | 05:34:49,55 | 03:38:54,73 | 8,8° |
  | En yakın | 06:04:24,58 | 04:08:29,76 | 14,2° (merkezler arası 0,045°) |
  | Çıkış | 06:33:53,75 | 04:37:58,94 | 19,6° |

  Geçiş ayrı bir bilimsel çizimde gösterilir; konum işareti **büyütülmüştür**. İstanbul’dan görülmüş bir çekirdek silueti ya da gözlem kaydı varmış izlenimi verilmez.

## Doğrulama

Bu sürüm için `tests/` altında yeniden çalıştırılabilen denetimler bulunur (`node --test tests/ephemeris.test.cjs`, 8 test).

- **Bağımsız denetim (17 Ekim 2026):** taze Horizons yanıtlarıyla (Halley için açıkça SAO/1910, kayıt 90000029) site aralığında 30 dakikada bir, sitenin örnekleri arasına düşen anlarda 24.920 konum karşılaştırması yapıldı. Havasız en büyük farklar: Halley 0,241′, Güneş 0,241′, Ay 0,579′ (Galata’da 0,568′), Merkür 0,349′, Zühre 0,192′, Merih 0,227′, Müşteri 0,186′, Zühal 0,241′. Bunlar sınanan ızgaradaki en büyük değerlerdir; her an için matematiksel bir üst sınır değildir.
- O denetimde Halley, Güneş ve Zühal’in ortak 0,241′ farkının kaynağı **ekinoks denkleminin** atlanmasıydı: görünür koordinatlar ortalama yıldız zamanıyla döndürülüyordu. Gerçek yıldız zamanına geçildi; Halley’in Horizons azimut/yükseklik sütunlarıyla farkı 7.488 örnekte **0,241′’ten 0,011′’e** indi.
- Yerleşik denetim: Güneş ve Ay, eski paketteki Horizons tablosuyla (`data/ephemeris.json`, 7.488 örnek) karşılaştırılır.
- **Galata yaklaşımı:** Güneş, Ay ve gezegenlerin topo-merkezli RA/Dec’i referans noktası için (41,0082 K, 28,9784 D, 30 m) üretilir ve Galata’da (41,0256 K, 28,9741 D, 87 m) yalnız ufuk dönüşümü değiştirilir. İki nokta 2 km arayla Ay paralaksında yay saniyesi düzeyinde fark yaratır; denetim bunu Ay için 0,57′ en büyük farkın içinde buldu.
- Kuyruk yönü: düzeltilmiş PA, sitenin kendi verisinden hesaplanan Güneş’ten uzağa büyük daire yönüyle en çok 0,006° farklıdır (Güneş’ten 3°’den uzak anlar). Kavuşum yakınında yön hızla döndüğü için PA 10 dakikada bir saklanır.
- Uç noktalar: Halley dizileri yayımlanan aralığı iki uçta da kuşatır; ilk 5 dk 55 sn ve son 4 dk 5 sn’de baş artık sabit kalmaz.
- Güneş diski geçişi bağımsız denetimde aynen yeniden üretildi (aşağıdaki tablo); veri artık tek bir üreticiden gelir (`tools/build_transit.py`).
- Yeni Gazete’nin 9 Mayıs yazısındaki yön bilgisi (“Hâle, Zühre’nin sol cihetindedir”) 10 Mayıs 03:30 LMT hesabıyla uyumludur: Galata’dan Zühre 94,0° azimut / +4,6°, Halley 85,3° / +10,3°.
- Aynı yazıdaki “günde altı milyon kilometro” yaklaşma hızı, Horizons’un o günkü yaklaşma hızıyla uyumludur: 67,5 km/sn ≈ 5,8 milyon km/gün.
- Gazetenin öngördüğü “18 Mayıs’tan sonra iki gün görünmeyecek” bilgisi, 19 Mayıs 03:00’te başın ufkun ~15° altında olmasıyla uyumludur.
- **Doğruluğun anlamı:** Horizons’un SAO/1910 başlığında kovaryans (RMS) yoktur ve kaynak elemanların dönem saatinde bir belirsizlik notu bulunur. Yukarıdaki sayılar **model uyumudur**; 1910 gözlemine göre ölçülmüş bir belirsizlik değildir. Fazla ondalık basamak tarihsel doğruluk göstermez.
- Stellarium karşılaştırması yapılmadı. Yapılacaksa 1910 görünümüne uygun yörünge elemanları (geriye uzatılmış modern Halley yörüngesi değil), aynı gözlem noktası, UT anı ve kırılma ayarı kullanılmalı; sürüm ve eleman kaynağı kaydedilmelidir.

## Gözlem altyapısı, 1910

İstanbul’da 1910 baharında işleyen bir resmî rasathane yoktu. Beyoğlu’ndaki Rasathane-i Âmire 31 Mart olaylarında (31 Mart 1325 = 13 Nisan 1909) tahrip edilmiş, onarım sürüyordu (Günergün; Fettahoğlu 2025). Basın, Halley bilgisini büyük ölçüde Avrupa kaynaklarından aktardı. Bu nedenle deneyimde İstanbul’dan yapılmış bir bilimsel ölçüm gösterilmez; karşılaştırma için Yerkes (Wisconsin) fotoğrafları ve Barnard’ın ölçümleri, yerleri açıkça yazılarak kullanılır.

## Kaynaklardaki hataların düzeltilmesi

- Bazı ikincil kaynaklarda Rumî tarihe 13 gün eklemenin “Hicrî tarihe” uygulandığı yazılır; çeviri Rumî (mali) takvim içindir. Hicrî tarih ayrı bir ay takvimidir.
- Velid’in kitabının basım yılı 1328 Hicrî’dir (1910). “Rumî 1328 / 1912” okuması, kitabın Mayıs 1910 ilanlarıyla çelişir.
- Gürpınar’ın romanı Sabah’ta 12 Nisan – 26 Mayıs 1326 (Rumî) arasında tefrika edildi; Gregoryen karşılığı 25 Nisan – 8 Haziran 1910’dur.
- Halley ekmeği, kanto ve “panzehir” gibi forum kaynaklı anlatılar doğrulanamadığı için kullanılmadı. Romandaki sarnıç ve pencere macunu sahneleri kurgudur; tarihsel olay gibi sunulmaz.
- Yerkes’in 2 ayaklık reflektör plakası Ocak 1910 tarihlidir; Mayıs gözlemi gibi gösterilmez.

## Sınırlar

- Bulut, pus, ışık kirliliği ve gerçek hava kayıtları modelde yoktur.
- Ay diskinin yüzey ayrıntısı yoktur; evre ve yönü doğrudur. Güneş ve Ay diskleri uzaklıktan hesaplanan görünür yarıçapla çizilir; geniş görüş açısında görünür kalsınlar diye birkaç piksellik bir alt sınır vardır.
- Yeni ana sayfada panorama kullanılmaz. Şehir çizimi ölçülmüş bir ufuk değildir; gökcisimlerini gerçek binaların örtüp örtmediği bu görünümden çıkarılamaz. Eski panorama kalibrasyonu araştırma geçmişi olarak korunur.
- Gezegen konumları ~1′ doğruluktadır (astronomy-engine). Horizons’la doğrudan karşılaştırma yalnız Güneş ve Ay için yapıldı.
- Gazete metinlerinin çevriyazısı bu çalışmanın okumasıdır; görüntüyle birlikte verilir ve uzman denetimi önerilir.
