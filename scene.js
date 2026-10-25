(() => {
  const canvas=document.getElementById('scene'),ctx=canvas.getContext('2d'); let w=320,h=180,dpr=1,frame=0,raf,animate=false;
  const SCENE=window.STORE_CONFIG?.SCENE||'neon-arcade-city';
  function resize(){dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.min(640,innerWidth*dpr);canvas.height=Math.min(360,innerHeight*dpr);w=canvas.width;h=canvas.height;ctx.imageSmoothingEnabled=false}
  function render(){raf=0;if(document.hidden)return;if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)frame++;ctx.clearRect(0,0,w,h);const sx=w/320,sy=h/180;ctx.save();ctx.scale(sx,sy);
    const sky=ctx.createLinearGradient(0,0,0,180);sky.addColorStop(0,'#244d72');sky.addColorStop(.6,'#182d4c');sky.addColorStop(1,'#060d1b');ctx.fillStyle=sky;ctx.fillRect(0,0,320,180);
    // Pixel moon and stars
    ctx.fillStyle='#ffe993';ctx.fillRect(246,20,11,11);ctx.fillRect(242,24,19,3);ctx.fillStyle='#d9ebff';for(let i=0;i<22;i++){let x=(i*47+13)%320,y=(i*23+7)%95;if((frame+i*13)%140<120)ctx.fillRect(x,y,1,1)}
    // Skyline bands
    for(let layer=0;layer<3;layer++){let base=104+layer*12;ctx.fillStyle=['#142541','#0d1b32','#091426'][layer];for(let x=-5;x<325;x+=18){let bh=16+((x*13+layer*21)%34+34)%34;ctx.fillRect(x,base-bh,13,bh+52);for(let wy=base-bh+4;wy<base;wy+=7)if(((x+wy+frame/18)|0)%4!==0){ctx.fillStyle=layer===0?'#39d9ed':'#ff4d91';ctx.fillRect(x+3,wy,2,2);ctx.fillStyle=['#142541','#0d1b32','#091426'][layer]}}}
    // Ground and neon road
    ctx.fillStyle='#050a14';ctx.fillRect(0,145,320,35);ctx.fillStyle='#42e6ff';ctx.fillRect(0,145,320,1);ctx.fillStyle='#ff4d91';ctx.fillRect((frame%400)/2,159,24,1);ctx.fillRect(225-((frame%400)/2),170,34,1);
    ctx.restore();if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)raf=requestAnimationFrame(render)}
  function setMotion(on){animate=!!on&&!matchMedia('(prefers-reduced-motion: reduce)').matches;if(animate&&!raf&&!document.hidden)raf=requestAnimationFrame(render);else if(!animate&&raf){cancelAnimationFrame(raf);raf=0;render()}}
  resize();addEventListener('resize',resize);addEventListener('scroll',()=>{canvas.style.transform=`translateY(${Math.min(60,scrollY*.04)}px)`});document.addEventListener('visibilitychange',()=>{if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0}else if(!document.hidden)render()});window.setSceneMotion=setMotion;render();
})();
