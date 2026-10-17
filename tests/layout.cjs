/* Browser layout regression checks for the cinematic overlays and scientific drawings.
   NODE_PATH=... CHROMIUM_PATH=... node tests/layout.cjs; requires Playwright. */
const { chromium } = require('playwright'), path = require('path'), assert = require('node:assert/strict');
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const errors = [];
  try {
    for (const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:640},{width:844,height:390}]) {
      const p = await b.newPage({viewport}); p.on('pageerror', e => errors.push(e.message));
      await p.goto('file://' + path.join(__dirname, '..', 'index.html'));
      await p.evaluate(() => document.fonts.ready);
      await p.click('#start-silent');
      await p.evaluate(async () => {
        const f = __halley.film; f.pause(); f.queue = Film.SHOTS.flatMap(s => s.id === 'ii0' ? [s, ...Object.values(Film.SEQ).flat()] : [s]);
        await Promise.all([...new Set(f.queue.flatMap(s => (s.photo?.layers || []).map(l => l.src)))].map(src => new Promise(resolve => { const im = Figures.img(src); if (im.complete) resolve(); else { im.onload = resolve; im.onerror = resolve; } })));
        const g = __halley.stage.g, original = g.fillText.bind(g); window.diagramText = [];
        g.fillText = function(text,x,y,...args) { const m=this.getTransform(), w=this.measureText(text).width, left=this.textAlign==='center'?x-w/2:this.textAlign==='right'?x-w:x; diagramText.push({text, left:m.a*left+m.e, right:m.a*(left+w)+m.e, y:m.d*y+m.f}); return original(text,x,y,...args); };
      });
      await p.addStyleTag({content:'*,*::before,*::after{transition:none!important;animation:none!important}.scene-fade{display:none!important}'});
      const n = await p.evaluate(() => __halley.film.queue.length);
      for(let i=0;i<n;i++) {
        await p.evaluate(i => { const f=__halley.film;f.goto(i);f.pause(); f.t=f.shot.dur*.5; if(f.shot.wait)f.step(0);window.diagramText=[];f.render(); },i);
        await p.evaluate(() => new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
        const result = await p.evaluate(() => {
          const rect=id=>document.getElementById(id).getBoundingClientRect(), s=__halley.film.shot, player=rect('player'), sub=rect('subs'), meta=rect('scene-meta');
          return {id:s.id,playerInside:player.left>=0&&player.right<=innerWidth&&player.bottom<=innerHeight,subClear:!document.getElementById('subs').innerText||sub.bottom<=player.top-8,
            diagramOverflow:diagramText.filter(t=>t.left < -1||t.right>innerWidth+1||t.y<0||t.y>innerHeight),
            diagramSubOverlap:document.getElementById('subs').innerText ? diagramText.filter(t=>t.y+4>sub.top-8) : [],
            promptClear:[...document.querySelectorAll('#hotspots > .prompt')].every(e=>e.getBoundingClientRect().top>=meta.bottom+8)};
        });
        assert.ok(result.playerInside,`${viewport.width} ${result.id}: player clipped`);
        assert.ok(result.subClear,`${viewport.width} ${result.id}: subtitles overlap controls`);
        assert.ok(result.promptClear,`${viewport.width} ${result.id}: prompt overlaps source credit`);
        assert.deepEqual(result.diagramSubOverlap,[],`${viewport.width} ${result.id}: drawing caption overlaps subtitles`);
        assert.deepEqual(result.diagramOverflow,[],`${viewport.width} ${result.id}: drawing text clipped`);
      }
      await p.evaluate(()=>__halley.enterSky(true));
      assert.equal(await p.locator('#sp-story').evaluate(e=>e.hidden),false); // Returning to a started story remains available.
      if(await p.locator('#sky-panel').evaluate(e=>e.classList.contains('collapsed')))await p.locator('#sp-collapse').click();
      await p.locator('[data-find="Halley"]').click();
      await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const target = await p.evaluate(()=>({x:__halley.sky.cx,y:__halley.sky.cy,panel:document.getElementById('sky-panel').getBoundingClientRect().toJSON()}));
      assert.ok(viewport.width<=760 ? target.y<target.panel.y : target.x<target.panel.x,`${viewport.width}: camera target covered by panel`);
      await p.locator('[data-clear-selection]').click();
      await p.close(); console.log(`${viewport.width}×${viewport.height}: ${n} scenes and observation panel passed`);
    }
    const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await p.goto('file://'+path.join(__dirname,'..','index.html')+'#belgeler');
    await p.locator('.clip').first().click();await p.locator('#doc-back').click();await p.locator('#archive-dialog').waitFor({state:'visible'});assert.equal(await p.locator('#archive-dialog').isVisible(),true);
    await p.keyboard.press('Escape');await p.locator('#go-sky').click();assert.equal(await p.locator('#sp-story').isVisible(),false);
    assert.deepEqual(errors,[]);console.log('Archive return, hidden controls and runtime checks passed');
    await p.close();
    const keyboard = await b.newPage({viewport:{width:390,height:844}});
    await keyboard.goto('file://'+path.join(__dirname,'..','index.html'));
    await keyboard.locator('.skip').focus(); await keyboard.locator('.skip').click();
    assert.equal(await keyboard.locator('body').evaluate(e=>e.classList.contains('mode-sky')),true);
    await keyboard.goto('file://'+path.join(__dirname,'..','index.html'));
    await keyboard.reload(); await keyboard.locator('#start-silent').click();
    const controls = await keyboard.evaluate(()=>{__halley.film.pause();document.body.classList.add('idle');return {playing:document.body.classList.contains('is-playing'),opacity:getComputedStyle(document.getElementById('player')).opacity};});
    assert.equal(controls.playing,false);assert.equal(controls.opacity,'1');
    await keyboard.close();console.log('Keyboard entry and paused-player visibility passed');
  } finally { await b.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
