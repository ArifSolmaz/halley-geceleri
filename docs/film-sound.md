# Film — hareket ve ses kaynakları

## Hareketli İstanbul

Alexandre Promio (1868–1926), *Panorama de la Corne d’or*, 1897; ve *Panorama des rives du Bosphore*, Nisan 1897. Wikimedia Commons kaynak dosyaları kamu malı olarak işaretlenmiştir. Orijinal dosyalar çalışma arşivinde korunur; sitede sessiz H.264 türevleri vardır. Seçim, renk/gece tonlaması, kurgu ve başlık ekleme yapılmıştır. Kadrajın 4:3 oranı korunur. Bunlar 1910 Halley gecelerinin olay kaydı değildir.

- https://commons.wikimedia.org/wiki/File:Panorama_Golden_Horn_Instanbul_1897.webm
- https://commons.wikimedia.org/wiki/File:Panorama_des_rives_du_Bosphore_1897.webm

## Müzik

*Dil Verme Gönül / Isfahan Gazel*. Mulla Uthman al-Mawsili (1854–1923), ses; Tanbûrî Cemil Bey (1873–1916), tanbur. Kaynak künyesi: İstanbul, yaklaşık 1912. Kamu malı. Bu kayıt 1910’a veya Halley olayına aitmiş gibi sunulmaz. Filmde kayıt düzeyi, frekans aralığı ve hafif gürültü azaltma düzenlemesi yapılmıştır; modern bir yeniden icra veya yapay ses değildir.

https://commons.wikimedia.org/wiki/File:ملا_عثمان_الموصلي_-_غزل_اصفهان_Isfahan_Gazel_-_Uthman_al-Mosuli.ogg

## Alan kayıtları ve foley — tümü CC0

- Félix Blume, Adalar / İstanbul martıları, Haziran 2012: https://freesound.org/people/felix.blume/sounds/167129/
- Félix Blume, İstanbul tekne düdüğü, Haziran 2012: https://freesound.org/people/felix.blume/sounds/162350/ — kayıtçı bir kruvaziyer düdüğü olarak tanımlar; 1910 vapurunun doğrulanmış düdüğü değildir.
- SpliceSound, kürekli/pedallı tekne ve su, 2013, konum belirtilmemiş: https://freesound.org/people/SpliceSound/sounds/188199/
- mr101986, gazete şirketinde baskı makinesi odası, 2010: https://freesound.org/people/mr101986/sounds/94713/ — belirli bir 1910 makinesine ait değildir.
- OozerName, kâğıt hışırtısı: https://freesound.org/people/OozerName/sounds/677255/

Fission9 adım kaydı, geliştirme sırasında indirilmiştir; son kurguda yürüyen bir karakter olmadığı için kullanılmaz. Önceki kıyı çalışmasının sesi ana film değildir.

## Karışım

`tools/build_film_sound.py` kaynakları çözümler; film manifestindeki düzeyler, 1,2 saniyelik kesme çevresi geçişleri, filtreleme, düdük uzaklık yankıları ve son loudness düzenlemesiyle 214 saniyelik stereo AAC master üretir. Dağıtım masterı yaklaşık −20 LUFS için hazırlanır; AAC kodlama payı için son düzey 0,8 dB azaltılır. Hedef true peak en fazla −2 dBTP. Müzik tek kayıt olarak sürer; 3–4 saniyelik bir parça döngüye alınmaz. Kıyı kayıtlarında uzun kaynaklar ve birleşim yumuşatma kullanılır.

Oynatıcı durduğunda filmin görüntüsü ve sesi birlikte durur. Kaynaklar açılırken film duraklar; kapanınca önceki duruma döner. Ses ancak ziyaretçi filmi başlatınca açılır.

Seviye, süre ve kod çözme denetimleri işitsel beğeni denetimi değildir. Bu çalışma ortamında asistan son sesi dinleyerek değerlendirememiştir.
