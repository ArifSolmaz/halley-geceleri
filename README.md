# Halley Geceleri

1910 İstanbul’una ait bir görsel düş. Üç gece; bir gazete, bir mektup, henüz çekilmemiş bir fotoğraf.

**Deneyim:** https://arifsolmaz.github.io/halley-geceleri/

Ana ürün süreli bir film ve aynı gökte serbest bakıştır. Araştırma bir ders olarak görüntünün üstüne yerleştirilmez. Kaynak ve yöntem isteyenler için bu depo, sahne içindeki küçük “İzler” girişi ve ikincil yöntem sayfası vardır.

Film 28 plan, 388,5 saniyedir. Atmosfer sesi ve altyazı kullanır; oyuncu seslendirmesi yoktur. Yusuf, Rıza ve Münevver kurmacadır. Görsel fotoğraflar gerçek arşiv görüntüleridir; gök NASA/JPL Horizons ve yardımcı astronomi verileriyle hesaplanır.

## İzler

- [Film yaklaşımı](docs/film-tretman.md)
- [Tam süreli senaryo](docs/film-senaryo.md)
- [Bilimsel yöntem ve sınırlar](docs/05-bilim.md)
- [Mekân ve görüntü kaynakları](docs/03-mekan-kaynaklari.md)
- [Künyeler ve haklar](CREDITS.md)
- [Veriyi yeniden üretmek](tools/README.md)

## Yerel çalıştırma

```sh
python3 -m http.server 8000
```

`index.html` ana film; `film.html` aynı filmin çalışma şablonudur. `#gok` serbest bakış; `#belgeler` isteğe bağlı arşiv.

Senaryo kaynağı `js/cinema-cut.js`, sanat yönetimi `css/cinema.css`, düşük profilli arayüz `js/cinema-ui.js` içindedir. Başlangıçtaki film motoru ve hesaplar korunur. Şablonu ve süreli senaryoyu güncellemek için:

```sh
node tools/build_docs.js
python3 tools/build_yontem.py  # Markdown==3.9
node --test tests/ephemeris.test.cjs
```

Eski bilgi ağırlıklı okuma prototipinin üreticisi `tools/build_documentary.py` araştırma geçmişi olarak tutulur; ana sayfayı üretmez. GitHub Pages `main` dalının kökünü yayımlar; yollar göreli ve `.nojekyll` dahildir.
