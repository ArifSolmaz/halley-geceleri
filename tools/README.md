# Verinin yeniden üretimi

Site derleme gerektirmez; bu araçlar veri, senaryo ve yöntem sayfalarını yeniden üretmek içindir. Hepsi proje kökünden çalıştırılır.

| Çıktı | Üretici | Gerekenler |
|---|---|---|
| `data/sky.js` (tamamı) | `node tools/build_sky.js` | Node 18+, `astronomy-engine@2.1.19`, d3-celestial **0.7.35** veri dosyaları |
| `data/sky.js` içindeki `halley` alanı | `node tools/build_halley.js` | Node 18+, `astronomy-engine@2.1.19`, `research/raw/halley.txt` |
| `data/milkyway.js` | `python3 tools/mw_tex.py` (önce `build_sky.js`) | Python 3, NumPy, Pillow |
| `data/transit.js` | `python3 tools/build_transit.py` | Python 3, NumPy, SciPy, `research/raw/audit_transit_*.txt` |
| `assets/pano/*`, `data/pano.js` | `BERGGREN=… python3 tools/pano/build_pano.py` | Python 3, NumPy, SciPy, Pillow; Berggren panoramasının 16000 px genişliğe küçültülmüş JPEG’i |
| `index.html`, `docs/02-senaryo.md` | `python3 tools/build_documentary.py` veya `node tools/build_docs.js` | Python 3; kaynak: `data/documentary.json` |
| `yontem.html` | `python3 tools/build_yontem.py` | Python 3, `markdown` |

## Sabitlenmiş dış bağımlılıklar

```sh
npm i --no-save astronomy-engine@2.1.19
npm pack d3-celestial@0.7.35 && tar xzf d3-celestial-0.7.35.tgz
D3C_DATA=package/data node tools/build_sky.js
```

`build_sky.js` d3-celestial’den yalnız `stars.6.json`, `starnames.json`, `constellations.json`, `constellations.lines.json` ve `mw.json` dosyalarını okur. 17 Ekim 2026’da bu sürümlerle yapılan tam yeniden üretim, yayımlanan `data/sky.js` ile bayt bayt aynı çıktı.

## Halley verisi (`build_halley.js`)

- Kaynak: Horizons, 1P/Halley, **SAO/1910 çözümü, kayıt 90000029**; topo-merkezli, havasız, 10 dk.
- Yayımlanan zaman aralığı (`js/astro.js` → `RANGE`): 19 Nisan 1910 22:04:05,184 UT – 10 Haziran 1910 22:04:05,184 UT (LMT gün sınırları). Halley dizileri bu aralığı **iki uçta da** en az bir örnekle kuşatır (22:00 UT – 23:00 UT); aralık uçlarında konum sabitlenmez.
- Kuyruk yönü: Horizons `PsAng` (nicelik 27) ICRF kuzey kutbuna göre ölçülür; görünür RA/Dec ise tarihin gerçek ekvatoruna göredir. Her örnekte J2000 kutbunun tarih çerçevesindeki konum açısı eklenir (astronomy-engine `Rotation_EQJ_EQD`: presesyon + nütasyon). Düzeltme −0,53° ile +0,02° arasındadır. PA 10 dakikada bir saklanır.
- Denetim: düzeltilmiş PA, kendi verimizden hesaplanan “Güneş’ten uzağa” büyük daire yönüyle en çok 0,006° farklıdır (düzeltmeden önce 0,53°). `tests/ephemeris.test.cjs` bunu sınar.

## Güneş geçişi (`build_transit.py`)

`data/transit.js` dosyasının tek üreticisidir. Eski `research/audit_claims.py` aynı hesabı yapıp `verification-data.js` yazar; bu dosya artık sitede kullanılmaz. 17 Ekim 2026’da yeniden üretilen olaylar önceki veriyle aynı çıktı: giriş 03:38:54,73 UT, en yakın 04:08:29,76 UT (0,0453912°), çıkış 04:37:58,94 UT. Giriş, en yakın geçiş ve çıkış düğmeleri model zamanını saniyeleri atılmış olarak gösterir; ekranda saniye bulunması tarihsel gözlem doğruluğu iddiası değildir.

## Yayın öncesi yeniden denetim — 17 Ekim 2026

Yayın adresi: **https://arifsolmaz.github.io/halley-geceleri/**; depo adı `halley-geceleri`. Kurulum adımları ana `README.md` içindedir.

Sekiz astronomi testi ve 1440 / 390 / 320 px tarayıcı denetimleri geçti. `/halley-geceleri/` alt yolunda ana sayfa ve yöntem sayfası yerel HTTP sunucusunda denetlendi; eksik yerel kaynak veya JavaScript hatası görülmedi. Sabitlenmiş bağımlılıklarla yeniden üretilen `data/sky.js` ve `tests/horizons_azel.json` bayt bayt aynı çıktı. Güneş geçişi yeniden üretiminde olay zaman damgaları aynı kaldı; sayısal zaman alanındaki en büyük fark yaklaşık 2,82 × 10⁻⁸ saniyeydi. NumPy/SciPy ve platform farkları son basamaklarda değişiklik yaratabilir; geçiş çıktısı için bayt eşitliği yerine sayısal tolerans kullanılmalıdır. Bu denetim yereldir. Site GitHub Pages üzerinde yayımlanır; `main` dalındaki değişikliklerin dağıtımı tamamlandıktan sonra canlı sürüm ayrıca denetlenir.


## Yeni anlatının denetimi

Yeni giriş noktası `js/documentary.js` ve beş bölümlü senaryodur. `tests/browser.cjs` bu akışı, arşivi, geçiş çizimini ve gözlem masasını; `tests/layout.cjs` masaüstü/telefon yerleşimini denetler. Önceki 31 planlı film için yapılan ölçümler yeni tasarımın estetik doğrulaması olarak kullanılmaz. Ekran görüntüleri ayrıca görsel olarak incelenir.

Fotoğraf panoraması yeni ana sayfada kullanılmaz. `tools/pano/` ve `tools/yonler.md` eski prototipin yeniden üretim kaydıdır.
