# Gökyüzü verisi ve yeniden üretim (araştırma klasörü)

> **Not (17 Ekim 2026):** Bu klasör, sitenin ilk sürümünün araştırma betiklerini ve Horizons ham yanıtlarını korur. Yayımlanan sitenin verisi artık `tools/` altındaki üreticilerle yapılır (bkz. `tools/README.md`): `data/sky.js` → `tools/build_sky.js` ve `tools/build_halley.js`, `data/transit.js` → `tools/build_transit.py`. Aşağıdaki `ephemeris.json`, `validation.json` ve `verification-data.js` yalnız karşılaştırma ve arşiv içindir.

## Kayıt

- NASA/JPL Horizons; indirme tarihi: 7 Ekim 2026.
- Halley çözümü: **SAO/1910**, Horizons kayıt no. **90000029**. Oskülasyon dönemi: 1910-05-09 TDB (2418800.5).
- Konum: **41.0082° K, 28.9784° D, 30 m**.
- Atmosfer kırılması: **AIRLESS / kapalı**.
- Ham tablolar: 1 Nisan–11 Haziran 1910, 10 dakika aralık.
- Site tablosu: 20 Nisan–10 Haziran 1910, her LMT günü için 00:00–23:50 arasında 144 örnek.
- Yerel ortalama güneş saati: **LMT = UT + 28.9784/15 saat = UT + 1:55:54.816**. Sivil saat uygulamasına dair iddia değildir.
- Kaynak dokümanı: https://ssd.jpl.nasa.gov/horizons/manual.html

`raw/` klasörü yeniden üretilebilir URL ve parametreleri, ayrıca kullanılan yanıtları korur. `fetch_horizons.py` mevcut yanıtları atlamadan önce kontrol eder; `--refresh` kaynak servisten yeniden ister. Yeni cevap, servisin güncellenmesi nedeniyle birebir aynı olmayabilir.

## Alanlar

`../data/ephemeris.json` içindeki `rows[day][sample]` dizisi:

| İndeks | Alan | Birim |
|---|---|---|
| 0 | Halley azimut | derece, kuzey 0, doğu 90 |
| 1 | Halley yükseklik | derece |
| 2 | Güneş azimut | derece |
| 3 | Güneş yükseklik | derece |
| 4 | Ay azimut | derece |
| 5 | Ay yükseklik | derece |
| 6 | Ay aydınlanması | yüzde |
| 7 | Halley güneş uzanımı | derece |
| 8 | Halley gözlemci uzaklığı | AU |

`dates` ve `rows` aynı indeks düzenindedir. `twilight`, Güneş'in −12° kesişimlerinin yaklaşık 10 dakikalık indeksidir; web arayüzünün görüş göstergesi doğrudan anlık Güneş yüksekliğini kullanır. Ham UT tablosu, Python'da açıları açarak kübik eğriyle LMT zamanlarına taşınır. Arayüz örnekler arasında doğrusal enterpolasyon yapar; azimut farkı 360° kesiminde sarılır.

## Yeniden üretim

Python 3, NumPy ve SciPy gerekir. Sitenin kendisi Python gerektirmez.

```sh
cd research
python3 fetch_horizons.py
python3 build_data.py
```

Sıra önemlidir: `build_data.py`, `analyze.py`’yi içe aktarır (o da `summary.json`, `summary.csv`, `ephemeris_10min.csv` yazar) ve `validation.json`’u üretir; `audit_claims.py` bu dosyayı okuduğu için ondan **sonra** çalıştırılmalıdır. Oluşan `simulation_data.json`, ilk site tablosuyla karşılaştırılabilir. `analyze.py` ayrıca `summary.json`, `summary.csv` ve `ephemeris_10min.csv` üretir. Ham tablolar için başlangıç ve sütun alanları kodda açıktır. Bu komutlar web paketini otomatik güncellemez.

`validation.json`, önceki hesapta yapılan bağımsız çözüm karşılaştırmasının sonucudur: 577 örnekte azimut farkı en çok yaklaşık 0.0048°, yükseklik farkı 0.0015°. Bu karşılaştırma tarihsel gözlemlerle doğrulama değildir ve Horizons yörünge belirsizliğinin ölçüsü sayılmaz. Dünya merkezine en yakın yaklaşım yaklaşık 20 Mayıs 12:51 UT, 0.151357 AU bulunmuştur. Bu an Dünya’nın kuyruğu kesmesiyle eşitlenmez.

## 8 Ekim ek denetimi

`audit_claims.py`, kaydedilmiş `raw/audit_*.txt` yanıtlarından `data/verification.json` ve eski arayüz için `verification-data.js` dosyalarını üretir. `verification-data.js` yayımlanan sitede **kullanılmaz**; geçiş verisinin tek üreticisi `tools/build_transit.py`’dir.

```sh
python3 research/build_data.py      # önce: validation.json
python3 research/audit_claims.py    # sonra
```

Bu komut proje kökünde çalıştırılabilir. NumPy/SciPy gerekir. Yeni ham yanıtları indirmek için `research/fetch_audit.py` kullanılır; kaydedilmiş isteklerin URL ve parametreleri `raw/audit_*_request.json` içinde de bulunur.

- Yıllık tablo: 19 tarih, 00:00 UT, yer merkezi, tarihin ekinoksuna göre görünür RA/Dec. Takımyıldızlar modern IAU sınırlarıdır.
- Gönderilen 13 gözlem saati: yalnız karşılaştırma için UT+2 yorumlanır; aynı anın Halley ve Güneş yüksekliği hesaplanır. Bu varsayım tarihsel sivil saat kabulü değildir.
- Geçiş: 19 Mayıs 03:20–04:50 UT, İstanbul, 1 dakikalık örnek. Görünür koordinatlardan küresel merkezler arası açı hesaplanır; Güneş yarıçapı aynı Horizons çıktısının `Ang-diam` alanından alınır. Kesişimler kübik enterpolasyonla bulunur. Halley merkezi nokta kabul edilir; atmosfer kırılması kapalıdır.
- Geçişin giriş/çıkışı yaklaşık 03:38:55 / 04:37:59 UT; merkezler arası açı en küçüğü 04:08:30 UT’de 0,045391°. Arayüz dakika hassasiyetine yuvarlar; daha çok basamak tarihsel doğruluk garantisi değildir.
- Geçiş çizimi eşit açısal ölçekli teğet düzlemdir, gök kuzeyi yukarı ve doğu soldadır. Görünür bir çekirdek silueti canlandırılmaz: büyütülmüş nokta yalnız konum işaretidir. Bu geçiş kuyruğun üç boyutlu Dünya kesişimini hesaplamaz.
- Günberi elemanı TDB ölçeğindedir. Gözlemci tablosundaki ışık-zamanı düzeltilmiş `r` minimumu dinamik günberi anı olarak kullanılmaz.
- En yakın Dünya yaklaşımı, `validation.json` dosyasındaki yer merkezli gözlemci uzaklığı minimumudur; gözlenmiş bir olay saati değildir.
- Fotometrik eğri ve ileri saçılma yasası simülasyona eklenmedi. Kullanıcının kadir değerleri doğrulanmış ölçüm gibi korunmadı.

17 başlıkta kaynak değerlendirmesi `verification.js` içinde; her kaynak bağlantısı sayfadaki açılır denetim bölümünde gösterilir. Sayısal yeniden üretim, tarihsel tanıklıkları doğrulamış sayılmaz.

## Görsel temsil sınırları (güncel site)

İlk sürümdeki sabit 31° kuyruk, süsleme yıldızlar ve dikdörtgensel izdüşüm kaldırıldı. Güncel durum:

- **İzdüşüm:** stereografik; yatay ve dikey açısal ölçek eşittir.
- **Yıldızlar:** Hipparcos (d3-celestial `stars.6.json`, 5.044 yıldız), 1910-05-15 için presesyon, nütasyon ve yıllık sapınç; öz hareket uygulanmadı.
- **Kuyruk:** fiziksel uzunluğu *L* (varsayılan 0,30 AU, 0,05–0,60 ayarlanabilir) olan, Güneş’in tersine uzanan düz bir model; yönü tarih çerçevesine döndürülmüş Horizons PsAng’dan. Uzunluk, genişlik ve parlaklık sanatsal varsayımdır.
- **Güneş ve Ay diski:** topo-merkezli uzaklıktan hesaplanan görünür yarıçapla çizilir; küçük ölçekte en az birkaç piksellik bir alt sınır vardır.
- **Manzara:** Berggren’in 1880’lerde Galata Kulesi’nden çektiği panorama, yapı yönlerine göre yerleştirilmiş (bkz. `docs/03-mekan-kaynaklari.md`).
- Bulut, gerçek hava kayıtları, ışık kirliliği ve kuyruk fotometrisi modelde yoktur.


## Yeni ana film

Yayımlanan tam kurgu `js/film-timeline.js` ve `data/animated-film.json` içindedir. `js/cinema-cut.js` önceki fotoğraf filminin araştırma geçmişidir; ana oynatıcıda kullanılmaz. Hareketli görüntülerin gerçek tarihi 1897, müziğin yaklaşık 1912’dir. Kaynaklar ve kullanım sınırları: `docs/film-sound.md`.
