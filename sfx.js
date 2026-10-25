(() => {
  let ctx, last = 0;
  const on = () => { try { return JSON.parse(localStorage.getItem('pixel-settings') || '{}').sound !== false } catch { return true } };
  function tone(f, d = .08, type = 'square', t0 = 0, vol = .04, slide = 0) {
    const c = ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (c.state === 'suspended') c.resume();
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + .02);
  }
  const seq = (notes, step = .07, type = 'square', vol = .04) => notes.forEach((f, i) => tone(f, step * 1.5, type, i * step, vol));
  const play = fn => (...a) => { if (!on()) return; try { fn(...a) } catch {} };
  window.SFX = {
    click: play(() => tone(660, .05, 'square', 0, .035, -220)),
    hover: play(() => { const n = performance.now(); if (n - last < 90) return; last = n; tone(1320, .03, 'triangle', 0, .015) }),
    add: play(() => seq([988, 1319], .07)),                 // coin
    wish: play(() => seq([523, 659, 784], .06, 'triangle')), // heart
    nav: play(() => tone(440, .09, 'square', 0, .025, 440)), // page blip
    open: play(() => seq([330, 440, 660], .05)),
    close: play(() => seq([660, 440, 330], .05)),
    error: play(() => { tone(180, .18, 'sawtooth', 0, .04, -80); tone(130, .2, 'sawtooth', .12, .04, -60) }),
    win: play(() => seq([523, 659, 784, 1047, 784, 1047], .09))
  };
  document.addEventListener('pointerover', e => { if (e.pointerType === 'mouse' && e.target.closest?.('.product-card,.cabinet,.btn,.small-btn,.main-nav a')) SFX.hover() });
})();
