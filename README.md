# Halley Geceleri — İstanbul, 1910

1910 İstanbul’unu eldeki gazeteler, fotoğraflar ve hesaplanan gökyüzüyle yeniden canlandıran etkileşimli bir bilim-belgesel-sanat çalışması.

**Yayın:** https://arifsolmaz.github.io/halley-geceleri/

**Depo:** https://github.com/ArifSolmaz/halley-geceleri

## Anlatı

Beş bölümde haberin gelişinden doğu ufkundaki arayışa, fırtına ve mizah yayınlarından görünmeyen Güneş geçişine, oradan batıdaki akşam göğüne ilerler. Ziyaretçi, Yeni Gazete’nin “Önce Zühre’yi bul” tarifini hesaplanan gökte deneyebilir.

Üç tarihli sahnede gök Galata için hesaplanır; çatılar dönem fotoğraflarından esinlenen stilize bir mekân yorumudur. Bunlar ölçülmüş 3B bina modelleri değildir. Eski prototipin dikişleri görünen fotoğraf panoraması yeni ana sayfada kullanılmaz. Arşiv fotoğraflarının gerçek yeri ve tarihi belirtilir. 16 kaynak kaydı anlatının içinden ve kaynak odasından açılır.

Gözlem masasında 20 Nisan–10 Haziran 1910 arasında tarih ve LMT saati, bakış yönü, takımyıldızlar, atmosferik kırılma ve kuyruk modeli seçilebilir. Bu araştırma görünümü referans İstanbul noktasını (41,0082° K, 28,9784° D) kullanır. Şehir çizimi kapatılabilir.

## Yerel çalıştırma ve yayın

Statik dosyalar; çalışma sırasında dış servis veya derleme gerekmez:

```sh
python3 -m http.server 8000
```

`http://localhost:8000/`, `index.html#gok`, `index.html#belgeler`; yöntem sayfası `yontem.html`.

GitHub Pages, `main` dalının kökünü yayımlar. Bütün kaynak yolları göreli; `.nojekyll` dahildir.

## Senaryo ve belgeler

`data/documentary.json` anlatıcı metninin kaynağıdır. `tools/build_documentary.py` bu metinden `index.html` ve `docs/02-senaryo.md` üretir. Görsel sahne şablonları aynı Python dosyasındadır; etkileşim `js/documentary.js`, tasarım `css/documentary.css` içindedir.

```sh
node tools/build_docs.js
python3 tools/build_yontem.py  # Markdown==3.9 gerekir
```

Eski `js/film.js`, `js/app.js`, panorama araçları ve ilgili araştırmalar çalışma geçmişi olarak korunur; yeni ana sayfanın giriş noktası değildir.

## Verinin yeniden üretimi

Sabitlenmiş sürümler (astronomy-engine 2.1.19, d3-celestial 0.7.35) ve üretici sırası `tools/README.md` içindedir. Bağımsız astronomi denetiminin (17 Ekim 2026) sonuçları ve yapılan düzeltmeler `docs/05-bilim.md` → Doğrulama bölümündedir.

## Kontroller

```sh
node --test tests/ephemeris.test.cjs
node tests/browser.cjs
node tests/layout.cjs
```

Tarayıcı kontrolleri Playwright ister. `SITE_URL` ile hedef URL, `CHROMIUM_PATH` ile yerel Chromium/Chrome yolu belirtilebilir. Fiziksel telefon/Safari denetimi yapılmış sayılmaz.

## Bilimsel sınırlar

Baş konumu Horizons SAO/1910, gezegenler astronomy-engine, yıldızlar Hipparcos verisinden gelir. Kuyruğun uzunluğu ve parlaklığı, göğün parlaklığı ve şehir çizimi model/yorumdur. Tarihler Gregoryen, saatler LMT = UT + 1:55:54,816. Tarihsel bulut ve hava durumu hesaplanmaz. Kaynaklar `CREDITS.md`, ayrıntılı yöntem `docs/05-bilim.md` içindedir.
