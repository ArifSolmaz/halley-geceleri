/* Playwright ile uçtan uca duman testi: node tests/browser.cjs  (CHROMIUM_PATH isteğe bağlı) */
const { chromium } = require('playwright'), path = require('path');
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const errs = []; let ok = true;
  for (const vp of [{ width: 1440, height: 860 }, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
    const p = await b.newPage({ viewport: vp }); p.on('pageerror', e => errs.push(vp.width + ': ' + e.message));
    await p.goto('file://' + path.join(__dirname, '..', 'index.html')); await p.waitForTimeout(600);
    await p.click('#start-silent'); await p.waitForTimeout(300);
    const res = await p.evaluate(async () => {
      const F = __halley.film; F.pause(); let guard = 0;
      while (document.body.classList.contains('mode-film') && guard++ < 500) {
        const s = F.shot; F.render();
        if (s.wait) { F.step(0.01); const w = F.waitState;
          if (s.wait.type === 'choice') { const o = s.wait.options.find(o => !F.done[o.id]); F.pick(o.id); continue; }
          if (s.wait.type === 'search') { F.onPick({ type: 'planet', id: 'Venus', name: 'Zühre' }); F.onPick({ type: 'halley', name: 'Halley' }); }
          if (s.wait.type === 'continue') F.resolveWait(true); }
        F.t = s.dur - 0.001; F.step(0.01); }
      return { mode: document.body.className, shots: F.queue.length, overflow: document.documentElement.scrollWidth > innerWidth };
    });
    if (!res.mode.includes('mode-sky') || res.overflow) ok = false;
    console.log(vp.width, JSON.stringify(res));
    await p.evaluate(() => openDoc('yeni9')); await p.waitForTimeout(200); await p.keyboard.press('Escape');
    await p.close();
  }
  if (errs.length) { ok = false; console.log(errs.join('\n')); }
  await b.close(); console.log(ok ? 'TAMAM' : 'HATA'); process.exit(ok ? 0 : 1);
})();
