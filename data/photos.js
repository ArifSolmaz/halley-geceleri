/* Halley Geceleri — kullanılan fotoğraflar ve görsel belgeler: künye, tarih, 1910’a uzaklık, hak durumu.
   kind: 'arsiv' (fotoğrafın kendisi; yalnız kadraj/ton), 'gece' (aynı fotoğraf, gece görünümü için renk düzenlemesi),
         'belge' (basılı belge taraması), 'hesap' (hesaplanan gökten üretilen görüntü). */
'use strict';
window.PHOTOS = {
  'galata-sokak': {
    src: 'assets/photo/galata-sokak-1913.jpg', title: 'Galata Kulesi’ne çıkan sokak', who: 'Auguste Léon (Albert Kahn, Dünya Arşivleri)', date: 'Haziran 1913', gap: '1910’dan 3 yıl sonra',
    rights: 'CC0 · Albert-Kahn Müzesi (Hauts-de-Seine)', url: 'https://commons.wikimedia.org/wiki/File:Rue_montant_vers_la_tour_de_Galata_-_A2306S.jpg', tech: 'Otokrom (renkli cam plaka)' },
  'karakoy-yokus': {
    src: 'assets/photo/karakoy-yokus-1913.jpg', title: 'Karaköy köprüsü semtinde yokuşlu bir sokak', who: 'Auguste Léon (Albert Kahn, Dünya Arşivleri)', date: 'Haziran 1913', gap: '1910’dan 3 yıl sonra',
    rights: 'CC0 · Albert-Kahn Müzesi', url: 'https://commons.wikimedia.org/wiki/File:Une_rue_en_pente_dans_le_quartier_du_pont_de_Karakoy_-_A2300.jpg', tech: 'Otokrom' },
  'halic-aksam': {
    src: 'assets/photo/halic-aksam-1913.jpg', title: 'Akşam alacakaranlığında Haliç, kuzey kıyısından (büyük olasılıkla Galata)', who: 'Auguste Léon (Albert Kahn, Dünya Arşivleri)', date: 'Haziran 1913', gap: '1910’dan 3 yıl sonra',
    rights: 'CC0 · Albert-Kahn Müzesi', url: 'https://commons.wikimedia.org/wiki/File:La_Corne_d%27Or_au_cr%C3%A9puscule,_vue_depuis_la_rive_gauche_nord_(sans_doute_Galata)_-_A2287.jpg', tech: 'Otokrom; fenerler fotoğrafın kendisinde yanıyor' },
  'kopru-1910': {
    src: 'assets/photo/kopru-1910.jpg', title: 'Galata Köprüsü, Eminönü yönüne', who: 'Bilinmeyen fotoğrafçı (Rijksmuseum koleksiyonu)', date: 'yaklaşık 1900 – Nisan 1910 öncesi', gap: '1910 ya da biraz öncesi',
    rights: 'CC0 · Rijksmuseum, Amsterdam (RP-F-F01141-CD)', url: 'https://commons.wikimedia.org/wiki/File:Galatabrug_in_Istanbul_gezien_richting_de_wijk_Emin%C3%B6n%C3%BC_Le_Pont_de_Galata_(titel_op_object),_RP-F-F01141-CD.jpg', tech: 'Albümin/jelatin baskı' },
  'kopru-loc': {
    src: 'assets/photo/kopru-loc.jpg', title: 'Galata Köprüsü', who: 'National Photo Company (Library of Congress)', date: '1909–1919 arası', gap: '1910 civarı (kesin tarih yok)',
    rights: 'Kamu malı · Library of Congress (LCCN 2016820955)', url: 'https://www.loc.gov/pictures/item/2016820955/', tech: 'Cam negatif' },
  'kahvehane': {
    src: 'assets/photo/kahvehane.jpg', title: 'Constantinople. Café Turc', who: 'Nicholas Catsimpoolas koleksiyonu (Boston Public Library / DPLA)', date: '19. yüzyıl sonu (tarihsiz)', gap: '1910’dan önce (kesin tarih yok)',
    rights: 'Kamu malı · Boston Public Library', url: 'https://commons.wikimedia.org/wiki/File:Constantinople._Caf%C3%A9_Turc_-_DPLA_-_4be3d18de3391ec09c54e52ef1bd1000_(page_1).jpg', tech: 'Baskı',
    warn: 'Fotoğraftaki kişiler bu hikâyenin kişileri değildir; duyulan sesler kurmacadır.' },
  'ebuzziya': {
    src: 'assets/photo/ebuzziya-matbaasi-1890.jpg', title: 'Imprimerie Eb-uz-zia, Constantinople, fondée 1881 — Matbaa-i Ebüzziyâ tanıtım sayfası', who: 'Ebüzziya Tevfik (matbaacı)', date: '1890', gap: '1910’dan 20 yıl önce',
    rights: 'Kamu malı · Library of Congress (LCCN 2009631575)', url: 'https://www.loc.gov/pictures/item/2009631575/', tech: 'Renkli baskı' },
  'velid-kapak': {
    src: 'assets/photo/velid-kapak.jpg', title: 'Ebüzziyazâde Velid, “Kuyruklu Yıldızlar ve Hâle Kuyruklu Yıldızı” — kapak', who: 'Matbaa-i Ebüzziyâ, İstanbul', date: '1328 (Hicrî) = 1910', gap: '1910',
    rights: 'Eser kamu malı; sayısallaştırma ve filigran: İBB Atatürk Kitaplığı', url: '', tech: 'Kitap kapağı (filigranlı sayısal kopya)' },
  'velid-yorunge': {
    src: 'assets/photo/velid-yorunge.jpg', title: 'Aynı kitap, s. 12: kuyrukluyıldız yörüngesi şekli (Şekil 2)', who: 'Matbaa-i Ebüzziyâ', date: '1910', gap: '1910',
    rights: 'Eser kamu malı; sayısallaştırma: İBB Atatürk Kitaplığı', url: '', tech: 'Kitap sayfası' },
  'velid-dalga': {
    src: 'assets/photo/velid-dalga.jpg', title: 'Aynı kitap: kuyrukluyıldız ve dev dalga gravürü (Laplace’ın varsayımına gönderme)', who: 'Matbaa-i Ebüzziyâ', date: '1910', gap: '1910',
    rights: 'Eser kamu malı; sayısallaştırma: İBB Atatürk Kitaplığı', url: '', tech: 'Gravür baskı' },
  'berggren': {
    src: 'assets/pano/berggren-4.webp', title: 'Galata Kulesi’nden İstanbul panoraması (10 levha)', who: 'Guillaume Berggren', date: '1880’ler', gap: '1910’dan yaklaşık 25–30 yıl önce',
    rights: 'Kamu malı · Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Guillaume_Berggren_-_Panorama_of_Constantinople_(1880s).jpg', tech: 'Albümin baskı; gök ve gece tonu hesaplanmış gökten' }
};
