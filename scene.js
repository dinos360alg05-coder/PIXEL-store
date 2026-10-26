(() => {
  const canvas = document.getElementById('scene');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;

  let width = 0, height = 0, frame = 0, raf = 0, motion = true, depth = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const bubbles = Array.from({ length: 30 }, (_, i) => ({
    x: (i * 139 + 41) % 1000,
    y: (i * 83 + 19) % 900,
    size: i % 7 === 0 ? 4 : i % 3 === 0 ? 3 : 2,
    speed: .18 + (i % 5) * .07
  }));

  function resize() {
    const scale = Math.min(1, devicePixelRatio || 1) * .62;
    width = innerWidth;
    height = innerHeight;
    canvas.width = Math.max(1, Math.ceil(width * scale));
    canvas.height = Math.max(1, Math.ceil(height * scale));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    render();
  }

  function cloud(x, y, s) {
    ctx.fillRect(x, y, 48*s, 13*s);
    ctx.fillRect(x+10*s, y-9*s, 28*s, 10*s);
    ctx.fillRect(x+4*s, y+13*s, 39*s, 4*s);
  }

  function fish(x, y, scale, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y+3*scale, 18*scale, 6*scale);
    ctx.fillRect(x+4*scale, y, 9*scale, 12*scale);
    ctx.fillRect(x-4*scale, y+2*scale, 5*scale, 4*scale);
    ctx.fillRect(x-4*scale, y+6*scale, 5*scale, 4*scale);
    ctx.fillStyle = 'rgba(183,235,238,.45)';
    ctx.fillRect(x+13*scale, y+3*scale, Math.max(1, scale), Math.max(1, scale));
  }

  function render() {
    raf = 0;
    const progress = Math.max(depth, Math.min(1, scrollY / Math.max(900, document.documentElement.scrollHeight * .72)));
    const surface = height * (.43 - progress * .53);
    const sky = ctx.createLinearGradient(0, 0, 0, Math.max(1, surface));
    sky.addColorStop(0, '#b4e4e9');
    sky.addColorStop(1, '#e4f4e9');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, Math.max(0, surface));

    if (surface > height*.12) {
      ctx.fillStyle = 'rgba(255,255,255,.76)';
      const drift = (frame * .12) % Math.max(width, 1);
      cloud(width*.09-drift*.18, height*.10, .8);
      cloud(width*.58-drift*.09, height*.07, 1.05);
      cloud(width*.83-drift*.14, height*.18, .66);
    }

    const sea = ctx.createLinearGradient(0, surface, 0, height);
    sea.addColorStop(0, '#0c4560');
    sea.addColorStop(.17, '#082d48');
    sea.addColorStop(.55, '#06182d');
    sea.addColorStop(1, '#020914');
    ctx.fillStyle = sea;
    ctx.fillRect(0, Math.max(0, surface), width, height);

    // Pixelated light shafts fade as the viewer descends.
    ctx.save();
    ctx.globalAlpha = .14 * (1-progress*.82);
    for (let i=0;i<7;i++) {
      const x = width*(.05+i*.16) + Math.sin(frame*.004+i)*14;
      ctx.fillStyle = i%2 ? '#66d8df' : '#b9f2e8';
      ctx.beginPath();
      ctx.moveTo(x, Math.max(0,surface));
      ctx.lineTo(x+width*.045, Math.max(0,surface));
      ctx.lineTo(x+width*(.11+i*.005), height);
      ctx.lineTo(x+width*(.015+i*.003), height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // The rolling surface leaves frame gradually as the page scrolls deeper.
    if (surface > -22 && surface < height) {
      ctx.beginPath();
      ctx.moveTo(0, surface);
      for (let x=0;x<=width+12;x+=12) {
        const y=surface + Math.sin(x*.024+frame*.025)*3 + Math.sin(x*.008-frame*.018)*4;
        ctx.lineTo(x,y);
      }
      ctx.lineTo(width, surface+14);
      ctx.lineTo(0, surface+14);
      ctx.closePath();
      ctx.fillStyle='#2b8791';
      ctx.fill();
      ctx.fillStyle='rgba(190,247,229,.8)';
      for(let x=0;x<width;x+=18){
        const y=surface+Math.sin(x*.024+frame*.025)*3+Math.sin(x*.008-frame*.018)*4;
        ctx.fillRect(x,y,9+(x%3)*2,2);
      }
    }

    // Small pixel fish, bubble trails and distant seabed silhouettes.
    for(let i=0;i<4;i++) {
      const x=(i*width*.31+frame*(i%2?-.18:.14)+width*2)%(width+80)-35;
      const y=height*(.50+i*.105)+Math.sin(frame*.015+i)*8;
      fish(x,y, i===0?1.4:.8, i%2?'rgba(1,13,27,.5)':'rgba(15,52,68,.65)');
    }
    ctx.fillStyle='rgba(1,10,22,.66)';
    ctx.fillRect(0,height-18,width,18);
    for(let i=0;i<19;i++){
      const x=(i*67+13)%Math.max(width,1), h=5+(i*17)%18;
      ctx.fillRect(x,height-18-h,4,h);
      ctx.fillRect(x-4,height-18-h,12,4);
    }
    ctx.strokeStyle='rgba(175,238,239,.38)';
    ctx.lineWidth=1;
    for(const bubble of bubbles){
      const x=(bubble.x/1000*width + Math.sin(frame*.01+bubble.y)*8 + width)%width;
      const y=(height - ((bubble.y + frame*bubble.speed)%Math.max(height,1)));
      ctx.strokeRect(Math.round(x),Math.round(y),bubble.size,bubble.size);
      ctx.fillStyle='rgba(173,237,231,.34)';
      ctx.fillRect(Math.round(x)+1,Math.round(y)+1,1,1);
    }
    frame++;
    if (motion && !reduced.matches) raf=requestAnimationFrame(render);
  }

  function setMotion(on) {
    motion=!!on;
    if (motion && !reduced.matches && !raf) raf=requestAnimationFrame(render);
    if (!motion && raf) { cancelAnimationFrame(raf); raf=0; render(); }
  }
  function onScroll(){depth=Math.min(1,scrollY/Math.max(900,document.documentElement.scrollHeight*.72));if(!motion)render();}
  resize();
  addEventListener('resize',resize);
  addEventListener('scroll',onScroll,{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0;}
    else if(!document.hidden&&motion&&!reduced.matches&&!raf)raf=requestAnimationFrame(render);
  });
  reduced.addEventListener?.('change',()=>setMotion(motion));
  window.setSceneMotion=setMotion;
  render();
})();
