# Künyeler, kaynaklar ve kullanım hakları

## Belgeler (gerçek taramalar)

Gazete ve dergi görüntüleri (`assets/img/`): **Beyazıt Devlet Kütüphanesi – Tokyo University of Foreign Studies, Hakkı Tarık Us Koleksiyonu.**
Katalog: https://www.tufs.ac.jp/common/fs/asw/tur/htu/list1.html · https://www.tufs.ac.jp/common/fs/asw/tur/htu/list2.html

Her kupürün yayın, tarih, sayı, basılı sayfa ve DjVu bağlantısı `data/archive.js` (`data/archive.json`) içindedir. Görüntülere yalnız kırpma, küçültme ve ton düzeltmesi uygulandı; üretken düzenleme yapılmadı. `yeni9-*.jpg` dosyaları Yeni Gazete’nin 9 Mayıs 1910, sayı 612, s. 3 taramasından (HTU2509-106/page0219) kırpıldı. Koleksiyonla bir ortaklık iddia edilmez. Taramaların yeniden kullanımında koleksiyonun koşulları ayrıca dikkate alınmalıdır.

Çevriyazılar ve sadeleştirmeler bu çalışmanın okumasıdır; görüntüyle birlikte verilir.

Edebî kaynak: Hüseyin Rahmi Gürpınar, *Kuyruklu Yıldız Altında Bir İzdivaç*, TDK baskısı (2019): https://www.tdk.gov.tr/wp-content/uploads/2019/12/Kuyruklu-Y%C4%B1ld%C4%B1z-WEB.pdf

Araştırma kılavuzu: Kübra Fettahoğlu, “Comets As Omens of Catastrophe: Halley’s Return in 1910 and the Ottoman Empire”, *Kadim* 10 (2025), 113–144, DOI 10.54462/kadim.1746785.

## Fotoğraflar

| Dosya | Görüntü | Kaynak · hak |
|---|---|---|
| `assets/pano/berggren-*.webp` | Guillaume Berggren, Galata Kulesi’nden İstanbul panoraması, 1880’ler | Kamu malı · https://commons.wikimedia.org/wiki/File:Guillaume_Berggren_-_Panorama_of_Constantinople_(1880s).jpg |
| `assets/photo/galata-sokak-1913.jpg` | Auguste Léon, “Rue montant vers la tour de Galata”, Haziran 1913 (A2306S) | CC0 · Albert-Kahn Müzesi, Hauts-de-Seine |
| `assets/photo/karakoy-yokus-1913.jpg` | Auguste Léon, “Une rue en pente dans le quartier du pont de Karakoy”, Haziran 1913 (A2300) | CC0 · Albert-Kahn Müzesi |
| `assets/photo/halic-aksam-1913.jpg` | Auguste Léon, “La Corne d’Or au crépuscule…”, Haziran 1913 (A2287) | CC0 · Albert-Kahn Müzesi |
| `assets/photo/halic-alacakaranlik-1913.jpg`, `pera-sokak-1912.jpg` | Kahn arşivi (A2311; Stéphane Passet, A1108) — yedek | CC0 · Albert-Kahn Müzesi |
| `assets/photo/kopru-1910.jpg` | Galata Köprüsü, Eminönü yönüne, yak. 1900 – Nisan 1910 öncesi | CC0 · Rijksmuseum (RP-F-F01141-CD) |
| `assets/photo/kopru-loc.jpg` | Galata Bridge, Constantinople, 1909–1919 | Kamu malı · Library of Congress, LCCN 2016820955 |
| `assets/photo/kahvehane.jpg` | “Constantinople. Café Turc”, Nicholas Catsimpoolas koleksiyonu | Kamu malı · Boston Public Library / DPLA |
| `assets/photo/ebuzziya-matbaasi-1890.jpg` | Imprimerie Eb-uz-zia, Constantinople, fondée 1881 (1890) | Kamu malı · Library of Congress, LCCN 2009631575 |
| `assets/photo/velid-*.jpg` | Ebüzziyazâde Velid, *Kuyruklu Yıldızlar ve Hâle Kuyruklu Yıldızı*, Matbaa-i Ebüzziyâ, 1328 (1910) | Eser kamu malı; sayısal kopya ve filigran İBB Atatürk Kitaplığı |
| `assets/img/yerkes-*.jpg` | Yerkes Rasathanesi (E. E. Barnard), Halley, 29 Mayıs ve 6 Haziran 1910 | Kamu malı (ABD) · Wikimedia Commons |

Fotoğraflar Wikimedia Commons üzerinden indirildi (Ekim 2026). Yapılan işlemler: kırpma, küçültme, ton eşitleme; panoramada gök maskesi ve levha hizalaması; bazı planlarda gece görünümü için karartma ve renk düzenlemesi. Bu düzenlemeler ekranda belirtilir. Fotoğraflardaki gerçek kişiler kurmaca karakter olarak sunulmaz.

Ek araştırma kaynakları: Feza Günergün, Salih Zeki ve Rasathane-i Âmire üzerine makale (31 Mart olayları ve Rasathane); Bünyamin Tan, Velid’in kitabı üzerine yazı (kitabın tarihi için düzeltme: 1328 Hicrî = 1910).

## Astronomik veri

- NASA/JPL Horizons (https://ssd.jpl.nasa.gov/horizons/). Halley çözümü SAO/1910, kayıt 90000029. Ham yanıtlar `research/raw/` altındadır; indirme tarihi 7–8 Ekim 2026. Not: Özgün zip arşivi kesik olduğundan Güneş’in ham `sun.txt` yanıtı açılamadı ve bu pakette yok. Güneş’in Horizons değerleri `data/ephemeris.json` içinde korunur ve astronomy-engine ile karşılaştırılır.
- astronomy-engine 2.1.19, Don Cross, **MIT lisansı**: https://github.com/cosinekitty/astronomy. Yalnız veri üretiminde kullanıldı (`tools/`); tarayıcıya gömülmedi.
- Yıldız, takımyıldız ve Samanyolu verisi: **d3-celestial**, Olaf Frohn, **BSD-3-Clause** (`data/LICENSE-d3-celestial.txt`): https://github.com/ofrohn/d3-celestial. Yıldız konumları Hipparcos kataloğuna (ESA) dayanır.
- Barnard (1914), “Visual observations of Halley’s comet in 1910”, ApJ 39: kuyruk uzunluğu karşılaştırmaları (bilgi panelinde; İstanbul gözlemi değildir).

## Yazı tipleri (SIL Open Font License 1.1, `assets/fonts/LICENSE-*.txt`)

Cormorant Garamond, EB Garamond, IBM Plex Mono, Amiri. Fontsource paketlerinden alındı.

## Güncel görsel film için üretilenler

- Süreli film kurgusu: `js/cinema-cut.js`; 28 plan, üç bölüm.
- Berggren fotoğraf levhalarında yumuşak bindirme ve alt sınır maskesi; gece tonu ve pencere ışıkları temsilîdir.
- Hareketli arşiv kadrajları, hesaplanan gök ve serbest bakış. Bilimsel çizim ve ayrıntılar yalnız isteğe bağlı araştırma görünümünde.
- Sanat ve arayüz: `css/cinema.css`, `js/cinema-ui.js`; hesaplanan gök ve eski film motoru korunur.

İstanbul Time Machine, tarihsel kaynaklardan hareketle yeniden canlandırma yaklaşımı için kullanıcı tarafından önerilen örnektir (https://www.istanbultimemachine.org/project). Bu siteden görsel veya kod alınmadı.

## Film motorunun görsel ve ses malzemeleri

- HTML, CSS ve JavaScript.
- Odak camı görünümü, kurmaca kontak baskı ve cam negatif (hesaplanan gökten üretilir).
- Panoramadaki gece tonu ve pencere ışıkları (temsilî).
- Bütün sesler ve müzik motifi: Web Audio sentezi; kayıt kullanılmadı.
- Senaryo ve diyaloglar.

Bunların hiçbiri arşiv belgesi değildir ve ekranda böyle etiketlenir.

Kod ve özgün içerik için lisans seçimi depo sahibine bırakılmıştır. Üçüncü taraf taramalar herhangi bir kod lisansına dahil değildir.
