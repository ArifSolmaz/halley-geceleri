# Verinin yeniden üretimi

Site derleme gerektirmez; bu araçlar veri, senaryo ve yöntem sayfalarını yeniden üretmek içindir. Hepsi proje kökünden çalıştırılır.

| Çıktı | Üretici | Gerekenler |
|---|---|---|
| `data/sky.js` (tamamı) | `node tools/build_sky.js` | Node 18+, `astronomy-engine@2.1.19`, d3-celestial **0.7.35** veri dosyaları |
| `data/sky.js` içindeki `halley` alanı | `node tools/build_halley.js` | Node 18+, `astronomy-engine@2.1.19`, `research/raw/halley.txt` |
| `data/milkyway.js` | `python3 tools/mw_tex.py` (önce `build_sky.js`) | Python 3, NumPy, Pillow |
| `data/transit.js` | `python3 tools/build_transit.py` | Python 3, NumPy, SciPy, `research/raw/audit_transit_*.txt` |
| `assets/pano/*`, `data/pano.js` | `BERGGREN=… python3 tools/pano/build_pano.py` | Python 3, NumPy, SciPy, Pillow; Berggren panoramasının 16000 px genişliğe küçültülmüş JPEG’i |
| `index.html`, `docs/02-senaryo.md`, `docs/film-senaryo.md`, `data/cinema.json` | `node tools/build_docs.js` | Node; şablon: `film.html`, kurgu: `js/film-timeline.js` |
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


## Tam filmin üretimi ve denetimi

`node tools/build_docs.js`, gerçek kurgu kaynağı `js/film-timeline.js` içinden manifest ve süreli senaryo üretir; `film.html` şablonunu ana sayfaya kopyalar. `python3 tools/build_film_sound.py` (NumPy, SciPy, ffmpeg) kaynak dosyalardan 214 saniyelik ses masterını üretir. Görüntü üretimi `workbench.html`, `js/film-compositor.js` ve `js/film-stage.js` içindedir. Three.js 0.170.0 yerel ve MIT lisanslıdır.

Çalışma tezgâhındaki tam kurgu 24 fps tuval videosuna kaydedilir; H.264 masaüstü / portre masterlar hazırlanır ve AAC sesle birleştirilir. Yayımlanan filmde bu masterlar kullanılır. Arşiv filmleri, son MP4 ve ses kaynakları yeniden üretilmez; lisans/künye için `docs/film-sound.md`.

`tests/browser.cjs`, masaüstü ve telefon oynatımı, ses kod çözme, duraklatma/arama, kaynak diyaloğu ve Türkçe font kullanımını sınar. `tests/layout.cjs` tüm kurgu planlarının masaüstü / portre yerleşimini kontrol eder. Astronomi denetimi `tests/ephemeris.test.cjs` içindedir. Bu testler görsel beğeninin yerine geçmez.

Eski `js/cinema-cut.js` ve fotoğraf filmi geçmiş çalışma dosyalarıdır; yeni ana oynatıcı bunları yüklemez. Araştırma için serbest gök `observatory.html#gok` üzerinden korunur.

### Video dışa aktarımı

Video araması için byte-range destekli yerel sunucu kullanın; sıradan `http.server` bazı tarayıcılarda medya aramasını sıfırlayabilir.

```sh
node tools/serve.cjs
# Ayrı terminalde, Playwright ve Chrome erişilebilirken:
node tools/render_film.cjs --out .film-render/desktop
node tools/render_film.cjs --portrait --out .film-render/portrait
```

Bu araç tüm 214 saniyeyi gerçek zamanlı kaydeder; sonra ffmpeg ile 24 fps H.264 ve mevcut AAC masterı birleştirir. Varsayılan Chrome yolu macOS içindir; başka kurulumlarda `CHROMIUM_PATH` ayarlayın. Üretilen masaüstü ve portre MP4’leri `assets/motion/halley-geceleri-film.mp4` ve `assets/motion/halley-geceleri-portrait.mp4` olarak yerleştirilir. İki master birlikte yayımlanmalıdır.
