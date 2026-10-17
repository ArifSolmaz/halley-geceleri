/* Halley Geceleri — İstanbul ufku: gözlem noktaları ve yapıların yönleri.
   Manzaranın kendisi bir FOTOĞRAFTIR: Guillaume Berggren’in 1880’lerde Galata Kulesi’nden çektiği 10 levhalık panorama
   (data/pano.js; kalibrasyon: docs/03-mekan-kaynaklari.md). Burada yalnız gerçek enlem/boylamlardan hesaplanan yapı yönleri
   tutulur; bunlar etiket ve doğrulama içindir, çizilmez. */
'use strict';
(function () {
  const A = window.Astro;

  /* Gözlem noktaları. eye: göz yüksekliği (m, deniz seviyesi). */
  const VIEWPOINTS = {
    teras: { id: 'teras', name: 'Galata · Kule hizasında bir dam', short: 'Galata', lat: 41.02562, lon: 28.97414, eye: 87, pano: true,
      note: 'Gök, Galata Kulesi’nin konumu için hesaplanır. Manzara Berggren’in Kule’den çektiği panoramadır (1880’ler); kurmaca damın göz hizası bundan biraz aşağıdadır.' },
    acik: { id: 'acik', name: 'Engelsiz ufuk (karşılaştırma)', short: 'Engelsiz ufuk', lat: 41.0082, lon: 28.9784, eye: 2,
      note: 'Horizons hesabındaki konum; manzara gösterilmez, yalnız düz ufuk. Bilimsel karşılaştırma içindir.' }
  };

  /* 1910’da mevcut, panoramada seçilebilen yapılar. top: tepe noktası (m, deniz seviyesi; yaklaşık). */
  const LANDMARKS = [
    { id: 'ayasofya', name: 'Ayasofya', lat: 41.00858, lon: 28.98017, top: 92 },
    { id: 'sultanahmet', name: 'Sultanahmet Camii', lat: 41.00539, lon: 28.97677, top: 100 },
    { id: 'adalet', name: 'Adalet Kulesi (Topkapı)', lat: 41.01160, lon: 28.98320, top: 88 },
    { id: 'yenicami', name: 'Yeni Cami', lat: 41.01714, lon: 28.97062, top: 47 },
    { id: 'beyazitkule', name: 'Beyazıt Yangın Kulesi', lat: 41.01170, lon: 28.96440, top: 143, note: '1828 tarihli yangın gözetleme kulesi.' },
    { id: 'suleymaniye', name: 'Süleymaniye', lat: 41.01611, lon: 28.96389, top: 126 },
    { id: 'fatih', name: 'Fatih Camii', lat: 41.01930, lon: 28.94970, top: 117 },
    { id: 'yavuz', name: 'Yavuz Selim Camii', lat: 41.02750, lon: 28.94930, top: 114 },
    { id: 'kizkulesi', name: 'Kız Kulesi', lat: 41.02111, lon: 29.00406, top: 23, note: '1763 taş yapı; fener olarak kullanılıyordu.' },
    { id: 'mihrimah', name: 'Üsküdar iskelesi (Mihrimah Sultan Camii)', lat: 41.02676, lon: 29.01513, top: 44 },
    { id: 'camlica', name: 'Büyük Çamlıca', lat: 41.0274, lon: 29.0680, top: 262 },
    { id: 'kayisdagi', name: 'Kayışdağı', lat: 40.9700, lon: 29.1700, top: 438 },
    { id: 'selimiye', name: 'Selimiye Kışlası', lat: 41.00560, lon: 29.01820, top: 60 },
    { id: 'haydarpasa', name: 'Haydarpaşa Garı (1909)', lat: 40.99670, lon: 29.01930, top: 38, note: '1909’da açıldı; panorama ondan önce çekildiği için fotoğrafta yoktur.', notInPhoto: true },
    { id: 'nusretiye', name: 'Nusretiye Camii (Tophane)', lat: 41.02694, lon: 28.98222, top: 70 }
  ];

  function get(vpId) {
    const vp = VIEWPOINTS[vpId] || VIEWPOINTS.teras;
    const marks = [];
    if (vpId !== 'acik') for (const m of LANDMARKS) {
      const g = A.geoView(vp, m.lat, m.lon, m.top);
      if (g.dist < 200) continue;
      marks.push(Object.assign({}, m, g));
    }
    return { vp, marks };
  }
  function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }

  window.Landscape = { VIEWPOINTS, LANDMARKS, get, hash };
})();
