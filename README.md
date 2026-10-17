# Halley Geceleri

1910 İstanbul’una dair bir sinema düşü: kâğıttaki soru, gökteki bekleyiş, sabah ve Halley’nin batıya dönüşü.

**Film:** https://arifsolmaz.github.io/halley-geceleri/

Ana deneyim **3 dakika 34 saniyelik tam film**dir. Şehrin hareketi Alexandre Promio’nun 1897 tarihli Haliç ve Boğaziçi filmlerinden gelir; 1910 Halley gecelerinin olay kaydı değildir. Kâğıt sekansları 3D animasyon, gök doğrulanmış astronomi motorunun çizimidir. Müzik, İstanbul’da yaklaşık 1912’de kaydedilmiş *Dil Verme Gönül / Isfahan Gazel*; ses tasarımı gerçek alan kayıtları ve foley kullanır. Kaynakların gerçek tarihleri korunur.

Film, masaüstü ve portre telefon için ayrı hazırlanmış H.264/AAC sürümlerinden oynatılır. Site açılışında uzun bilgi sayfası veya deneysel çalışma seçimi bulunmaz. Araştırma ve hesaplara küçük **İzler** girişinden ulaşılır.

## İzler

- [Tam senaryo ve plan süreleri](docs/film-senaryo.md)
- [Film yaklaşımı](docs/film-tretman.md)
- [Ses ve hareketli görüntü kaynakları](docs/film-sound.md)
- [Bilimsel yöntem ve sınırlar](docs/05-bilim.md)
- [Mekân kaynakları](docs/03-mekan-kaynaklari.md)
- [Künyeler ve haklar](CREDITS.md)
- [Veri ve filmin yeniden üretimi](tools/README.md)
- [İsteğe bağlı gözlem defteri](https://arifsolmaz.github.io/halley-geceleri/observatory.html#gok)

## Yerel çalıştırma

```sh
node tools/serve.cjs
```

`index.html` ve `film.html` yayımlanan tam filmi oynatır. `workbench.html`, aynı kurgunun arşiv video, 3D kâğıt ve hesaplanan gök katmanlarından canlı üretimidir; WebGL ve HTTP gerektirir. `observatory.html#gok` araştırma için serbest gök görünümüdür.

Kurgu `js/film-timeline.js`, birleştirme `js/film-compositor.js`, 3D kâğıt `js/film-stage.js`, yayımlanan oynatıcı `js/film-player.js`, arayüz `css/animated-film.css` içindedir. `js/astro.js`, astronomi verileri ve denetimleri bu film yeniden yapımında değiştirilmedi.

```sh
node tools/build_docs.js
python3 tools/build_film_sound.py # NumPy, SciPy, ffmpeg
python3 tools/build_yontem.py    # Markdown==3.9
node --test tests/ephemeris.test.cjs
```

GitHub Pages `main` dalının kökünü yayımlar. Yollar göreli, `.nojekyll` dahildir. Eski fotoğraf filmi ve çalışma dosyaları araştırma geçmişidir; ana ürün olarak sunulmaz.
