<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>D2 Museum Gothic Reading Room</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&family=Marcellus&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
<style>
/* Layout idea: the room fills the frame; the interface sits at its edges like gallery labels, in ink and brass. Single dark theme by choice. */
:root{
  color-scheme: dark;
  --ink:#0c121c;
  --ink-soft:rgba(12,18,28,.86);
  --paper:#efe8d8;
  --muted:#a8a294;
  --brass:#cfa95e;
  --line:rgba(207,169,94,.3);
  --duke:#8fa9e6;
  --dku:#86cdb6;
  --display:"Marcellus","Iowan Old Style","Palatino Linotype",Georgia,serif;
  --body:"Source Sans 3","Segoe UI",system-ui,-apple-system,sans-serif;
  --hand:"Caveat","Segoe Script","Bradley Hand",cursive;
}
*{box-sizing:border-box}
html,body{height:100%;margin:0}
body{background:var(--ink);color:var(--paper);font-family:var(--body);font-size:16px;line-height:1.5;overflow:hidden}
canvas#c{position:fixed;inset:0;width:100%;height:100%;display:block;outline:none}
button{font:inherit;color:inherit;cursor:pointer}
button:focus-visible,a:focus-visible{outline:2px solid var(--brass);outline-offset:3px}
h1,h2,h3{font-family:var(--display);font-weight:400;text-wrap:balance;margin:0}
.eyebrow{font-size:.75rem;letter-spacing:.18em;text-transform:uppercase;color:var(--brass)}
.btn{background:var(--brass);color:#1a1408;border:0;padding:.8rem 1.6rem;font-weight:600;letter-spacing:.06em;border-radius:2px}
.btn:hover{background:#e0bd75}
.btn.ghost{background:transparent;color:var(--paper);border:1px solid var(--line)}
.btn.ghost:hover{border-color:var(--brass);background:rgba(207,169,94,.08)}
.btn.small{padding:.45rem .9rem;font-size:.9rem}
.btn[disabled]{opacity:.45;cursor:not-allowed}
kbd{font-family:var(--body);font-size:.8rem;border:1px solid var(--line);border-radius:3px;padding:.05rem .4rem;color:var(--paper);background:rgba(255,255,255,.04);white-space:nowrap}
[hidden]{display:none !important}

/* Start */
#start{position:fixed;inset:0;display:flex;align-items:flex-end;padding:clamp(20px,5vw,64px);
  background:linear-gradient(100deg,rgba(8,12,20,.94) 0%,rgba(8,12,20,.78) 38%,rgba(8,12,20,.12) 78%);overflow:auto}
#start .inner{max-width:34rem;display:flex;flex-direction:column;gap:1.1rem;margin:auto 0}
#start h1{font-size:clamp(2rem,4.6vw,3.3rem);line-height:1.08}
#start .sub{font-family:var(--display);font-size:1.15rem;color:var(--muted);letter-spacing:.04em}
#start p{margin:0;color:var(--muted);max-width:30rem}
.controls{display:grid;grid-template-columns:auto 1fr;gap:.35rem 1rem;font-size:.92rem;color:var(--muted);border-top:1px solid var(--line);padding-top:1rem}
.controls span:nth-child(odd){display:flex;gap:.25rem;flex-wrap:wrap}
.row{display:flex;gap:.75rem;flex-wrap:wrap;align-items:center}
.fine{font-size:.82rem;color:var(--muted)}

/* HUD */
#hud{position:fixed;inset:0;pointer-events:none}
#counter{position:absolute;top:18px;right:18px;display:flex;align-items:center;gap:.7rem;background:var(--ink-soft);border:1px solid var(--line);padding:.45rem .8rem;border-radius:2px;font-size:.85rem;letter-spacing:.06em}
#counter b{font-family:var(--display);font-weight:400;font-size:1.05rem;font-variant-numeric:tabular-nums;color:var(--paper)}
#pips{display:flex;gap:5px}
#pips i{width:8px;height:8px;transform:rotate(45deg);border:1px solid var(--brass);display:block}
#pips i.on{background:var(--brass)}
#cross{position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:rgba(239,232,216,.7);box-shadow:0 0 0 1px rgba(0,0,0,.35);transition:transform .2s,background .2s}
#cross.hot{transform:scale(2.2);background:transparent;box-shadow:0 0 0 1.5px var(--brass)}
#prompt{position:absolute;left:50%;top:calc(50% + 46px);transform:translateX(-50%);text-align:center;background:var(--ink-soft);border:1px solid var(--line);padding:.5rem 1rem;border-radius:2px;opacity:0;transition:opacity .25s;white-space:nowrap}
#prompt.on{opacity:1}
#prompt small{display:block;color:var(--muted);font-size:.78rem;letter-spacing:.08em;text-transform:uppercase}
#tutorial{position:absolute;left:18px;bottom:18px;background:var(--ink-soft);border:1px solid var(--line);padding:.7rem .9rem;border-radius:2px;font-size:.88rem;color:var(--muted);display:flex;flex-direction:column;gap:.3rem;max-width:min(22rem,calc(100vw - 36px));transition:opacity .8s}
#tutorial.off{opacity:0}
#toast{position:absolute;left:50%;top:18px;transform:translateX(-50%);background:var(--ink-soft);border:1px solid var(--brass);padding:.55rem 1.1rem;border-radius:2px;opacity:0;transition:opacity .5s;font-family:var(--display);letter-spacing:.04em;text-align:center;max-width:calc(100vw - 36px)}
#toast.on{opacity:1}

/* Artifact panel */
#panel{position:fixed;top:0;right:0;height:100%;width:min(520px,100vw);background:var(--ink-soft);border-left:1px solid var(--line);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  transform:translateX(104%);transition:transform .45s cubic-bezier(.2,.7,.2,1);display:flex;flex-direction:column}
#panel.open{transform:none}
#panel header{padding:1.4rem 1.6rem 1rem;border-bottom:1px solid var(--line);display:flex;flex-direction:column;gap:.5rem}
#panel header .top{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem}
#panel h2{font-size:1.9rem;line-height:1.12}
#pBody{padding:1.2rem 1.6rem 2rem;overflow-y:auto;display:flex;flex-direction:column;gap:1.1rem;flex:1}
#pBody p{margin:0;max-width:65ch}
.meta{display:grid;grid-template-columns:auto 1fr;gap:.2rem 1rem;font-size:.9rem}
.meta dt{color:var(--muted);letter-spacing:.08em;text-transform:uppercase;font-size:.72rem;padding-top:.2rem}
.meta dd{margin:0}
.flag{font-size:.8rem;color:var(--muted);border:1px dashed var(--line);padding:.45rem .7rem;border-radius:2px}
.card{border:1px solid var(--line);background:rgba(255,255,255,.03);padding:1rem;border-radius:2px;display:flex;flex-direction:column;gap:.6rem}
.card h3{font-size:1.1rem}
.duke{color:var(--duke)} .dku{color:var(--dku)}
.letter{background:#f2e9d4;color:#2a2318;font-family:var(--hand);font-size:1.45rem;line-height:1.35;padding:1.4rem 1.3rem;border-radius:1px;box-shadow:0 8px 24px rgba(0,0,0,.4);white-space:pre-line}
.chips{display:flex;flex-wrap:wrap;gap:.4rem}
.chips span{border:1px solid var(--line);padding:.1rem .6rem;border-radius:999px;font-size:.82rem;color:var(--paper)}
.gallery{display:flex;flex-direction:column;gap:1rem}
.gallery figure{margin:0;display:flex;flex-direction:column;gap:.5rem}
.gallery img{max-width:100%;border:6px solid #2a1d12;outline:1px solid var(--line)}
.gallery figcaption b{font-family:var(--display);font-weight:400;font-size:1.05rem;display:block}
.qa{display:flex;flex-direction:column;gap:.9rem}
.qa .q{font-family:var(--display);font-size:1.08rem}
.qa .a{color:var(--paper);padding-left:.9rem;border-left:2px solid var(--line)}
.qa small{color:var(--muted);letter-spacing:.06em;text-transform:uppercase;font-size:.72rem}
.track{display:flex;gap:.9rem;align-items:center}
.track .t{flex:1;min-width:0}
.track .t b{font-family:var(--display);font-weight:400;font-size:1.05rem;display:block}
.track .t span{font-size:.88rem;color:var(--muted)}
.status{font-size:.82rem;color:var(--muted);min-height:1.2em}
#panel footer{padding:.8rem 1.6rem;border-top:1px solid var(--line);font-size:.82rem;color:var(--muted);display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}

/* Pause */
#pause{position:fixed;inset:0;background:rgba(8,12,20,.72);display:flex;align-items:center;justify-content:center;padding:16px}
#pause .box{background:var(--ink);border:1px solid var(--line);padding:2rem;max-width:26rem;width:100%;display:flex;flex-direction:column;gap:1.1rem}
#pause h2{font-size:1.7rem}
#fatal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;background:var(--ink)}
@media (max-width:520px){#counter span.lbl{display:none}}
@media (prefers-reduced-motion:reduce){#panel,#prompt,#tutorial,#toast,#cross{transition:none}}
</style>
</head>
<body>
<canvas id="c" tabindex="0" aria-label="First-person view of the Gothic Reading Room museum"></canvas>

<div id="hud" hidden>
  <div id="counter" aria-live="polite"><span class="lbl">Discovered</span><b id="count">0 / 6</b><div id="pips"></div></div>
  <div id="cross"></div>
  <div id="prompt"><span><kbd>E</kbd> Press E to Explore</span><small id="promptTheme"></small></div>
  <div id="tutorial">
    <span><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or arrow keys to walk, <kbd>Shift</kbd> to walk faster</span>
    <span id="lookHint">Move the mouse to look around</span>
    <span><kbd>E</kbd> to explore an artifact, <kbd>Esc</kbd> to pause, <kbd>M</kbd> to mute</span>
  </div>
  <div id="toast" role="status"></div>
</div>

<section id="start">
  <div class="inner">
    <div class="eyebrow">Duke and Duke Kunshan Presence Lab</div>
    <h1>D2: The Half a Day Away Sessions</h1>
    <div class="sub">Gothic Reading Room | Prototype 01</div>
    <p>Walk through a reading room that has become a museum of shared memories. Six artifacts are waiting somewhere among the tables and bookcases.</p>
    <div class="row">
      <button class="btn" id="enter">Enter Museum</button>
      <span class="fine">Best with a keyboard and mouse on a desktop browser.</span>
    </div>
    <div class="controls">
      <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / arrows</span><span>Walk</span>
      <span><kbd>Mouse</kbd></span><span>Look around</span>
      <span><kbd>E</kbd></span><span>Explore an artifact</span>
      <span><kbd>Shift</kbd></span><span>Walk slightly faster</span>
      <span><kbd>Esc</kbd></span><span>Release the mouse and pause</span>
    </div>
    <div class="fine">Every story, letter, image and sound in this prototype is fictional placeholder content, not a real student submission.</div>
  </div>
</section>

<aside id="panel" aria-hidden="true" aria-labelledby="pTitle">
  <header>
    <div class="top">
      <div class="eyebrow" id="pEyebrow"></div>
      <button class="btn ghost small" id="pClose">Close <kbd>E</kbd></button>
    </div>
    <h2 id="pTitle"></h2>
    <dl class="meta" id="pMeta"></dl>
  </header>
  <div id="pBody"></div>
  <footer><span>Prototype placeholder, fictional sample content</span><span id="pFoot"></span></footer>
</aside>

<section id="pause" hidden>
  <div class="box">
    <div class="eyebrow">Paused</div>
    <h2>Gothic Reading Room</h2>
    <div class="fine" id="pauseCount"></div>
    <div class="row">
      <button class="btn" id="resume">Resume</button>
      <button class="btn ghost" id="restart">Restart</button>
    </div>
    <div class="fine"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> walk · <kbd>Mouse</kbd> look · <kbd>E</kbd> explore · <kbd>M</kbd> mute</div>
  </div>
</section>

<div id="fatal" hidden><p>This prototype needs WebGL, which this browser could not start. Try a current desktop version of Chrome, Edge, Firefox or Safari.</p></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
(function(){
'use strict';
var $=function(id){return document.getElementById(id);};
if(!window.THREE){ $('fatal').hidden=false; $('start').hidden=true; return; }

/* ============================================================
   Renderer
   ============================================================ */
var canvas=$('c'), renderer;
try{
  renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,powerPreference:'high-performance'});
}catch(e){ $('fatal').hidden=false; $('start').hidden=true; return; }
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.0;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
var MAXAN=Math.min(8,renderer.capabilities.getMaxAnisotropy());
var scene=new THREE.Scene();
scene.background=new THREE.Color(0x0b0d12);
var camera=new THREE.PerspectiveCamera(68,1,0.08,120);
camera.rotation.order='YXZ';
var world=new THREE.Group(); scene.add(world);
var REDUCED=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   Helpers
   ============================================================ */
function rng(seed){var a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function tex(w,h,draw,rx,ry){
  var c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  var t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.repeat.set(rx||1,ry||1);t.anisotropy=MAXAN;t._cv=c;return t;
}
function rep(t,rx,ry){var c=t.clone();c.repeat.set(rx,ry);c._cv=t._cv;c.needsUpdate=true;return c;}
function grain(g,w,h,base,streak,n,seed,vertical){
  var r=rng(seed);g.fillStyle=base;g.fillRect(0,0,w,h);
  for(var i=0;i<n;i++){
    var a=0.03+r()*0.1;
    g.fillStyle=r()<0.62?'rgba('+streak+','+a+')':'rgba(255,220,170,'+(a*0.45)+')';
    var len=40+r()*320,t=1+r()*1.6,x=r()*w-40,y=r()*h;
    if(vertical)g.fillRect(y/h*w,x/w*h,t,len);else g.fillRect(x,y,len,t);
  }
}
function speckle(g,w,h,n,seed,rgb,amax,smax){
  var r=rng(seed);
  for(var i=0;i<n;i++){g.fillStyle='rgba('+rgb+','+(r()*amax)+')';var s=1+r()*smax;g.fillRect(r()*w,r()*h,s,s);}
}
function wrapText(g,text,x,y,maxW,lh){
  var paras=text.split('\n');
  for(var p=0;p<paras.length;p++){
    var words=paras[p].split(' '),line='';
    for(var i=0;i<words.length;i++){
      var test=line?line+' '+words[i]:words[i];
      if(g.measureText(test).width>maxW&&line){g.fillText(line,x,y);y+=lh;line=words[i];}else line=test;
    }
    g.fillText(line,x,y);y+=lh;
  }
  return y;
}
function std(o){var m=new THREE.MeshStandardMaterial(o);if(o.envMapIntensity===undefined)m.envMapIntensity=0.3;return m;}
function mesh(geo,mat,x,y,z,parent,noShadow){
  var m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);
  if(!noShadow){m.castShadow=true;m.receiveShadow=true;}
  (parent||world).add(m);return m;
}
function box(w,h,d){return new THREE.BoxGeometry(w,h,d);}
function part(geo,x,y,z,ry,rx,rz){
  var m=new THREE.Matrix4();
  if(ry||rx||rz)m.makeRotationFromEuler(new THREE.Euler(rx||0,ry||0,rz||0,'YXZ'));
  m.setPosition(x,y,z);return [geo,m];
}
function merge(parts){
  var pos=[],nor=[],uv=[];
  parts.forEach(function(p){
    var g=p[0].toNonIndexed();if(p[1])g.applyMatrix4(p[1]);
    var a=g.attributes.position.array,b=g.attributes.normal.array,c=g.attributes.uv.array,i;
    for(i=0;i<a.length;i++)pos.push(a[i]);for(i=0;i<b.length;i++)nor.push(b[i]);for(i=0;i<c.length;i++)uv.push(c[i]);
  });
  var out=new THREE.BufferGeometry();
  out.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  out.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  out.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  return out;
}
function instanced(geo,mat,transforms,parent){
  var im=new THREE.InstancedMesh(geo,mat,transforms.length),d=new THREE.Object3D();
  transforms.forEach(function(t,i){
    d.position.set(t.x,t.y||0,t.z);d.rotation.set(t.rx||0,t.ry||0,t.rz||0);d.scale.set(t.sx||1,t.sy||1,t.sz||1);
    d.updateMatrix();im.setMatrixAt(i,d.matrix);
    if(t.color)im.setColorAt(i,new THREE.Color(t.color));
  });
  im.castShadow=true;im.receiveShadow=true;(parent||world).add(im);return im;
}
function archPts(P,cx,y0,w,ys,ya){
  var k=0.62;
  P.moveTo(cx-w/2,y0);P.lineTo(cx+w/2,y0);P.lineTo(cx+w/2,ys);
  P.quadraticCurveTo(cx+w/2,ys+(ya-ys)*k,cx,ya);
  P.quadraticCurveTo(cx-w/2,ys+(ya-ys)*k,cx-w/2,ys);
  P.lineTo(cx-w/2,y0);return P;
}
function circlePath(x,y,r){var p=new THREE.Path();p.absarc(x,y,r,0,Math.PI*2,false);return p;}
function extrude(shape,depth){return new THREE.ExtrudeGeometry(shape,{depth:depth,bevelEnabled:false,curveSegments:20});}

/* ============================================================
   Procedural textures and materials
   ============================================================ */
var T={};
T.woodDark=tex(512,512,function(g,w,h){grain(g,w,h,'#4f2c1b','30,12,4',1500,11);});
T.woodMid=tex(512,512,function(g,w,h){grain(g,w,h,'#6a4630','40,20,8',1400,12);});
T.woodBeam=tex(512,512,function(g,w,h){grain(g,w,h,'#5a341f','28,12,4',1500,13);},0.35,0.35);
T.plaster=tex(512,512,function(g,w,h){
  g.fillStyle='#dccb9f';g.fillRect(0,0,w,h);
  var r=rng(5);
  for(var i=0;i<90;i++){var x=r()*w,y=r()*h,rad=30+r()*110,gr=g.createRadialGradient(x,y,0,x,y,rad);
    var dark=r()<0.5;gr.addColorStop(0,dark?'rgba(150,125,85,0.07)':'rgba(255,248,225,0.08)');gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr;g.fillRect(x-rad,y-rad,rad*2,rad*2);}
  speckle(g,w,h,5000,6,'120,100,70',0.05,2);
},0.3,0.3);
T.stone=tex(512,512,function(g,w,h){
  g.fillStyle='#b7ab95';g.fillRect(0,0,w,h);
  speckle(g,w,h,9000,7,'80,72,60',0.1,3);speckle(g,w,h,5000,8,'240,232,215',0.08,3);
  g.strokeStyle='rgba(70,62,52,0.35)';g.lineWidth=2;
  for(var y=0;y<h;y+=128){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();
    for(var x=(y/128%2)*128;x<w;x+=256){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+128);g.stroke();}}
},1.2,1.2);
T.parquet=tex(512,512,function(g,w,h){
  var r=rng(21),n=4,s=w/n;
  for(var i=0;i<n;i++)for(var j=0;j<n;j++){
    var horiz=(i+j)%2===0;
    for(var k=0;k<4;k++){
      var l=44+r()*12;g.fillStyle='hsl('+(27+r()*5)+','+(40+r()*8)+'%,'+(l-9)+'%)';
      if(horiz)g.fillRect(i*s,j*s+k*s/4,s,s/4);else g.fillRect(i*s+k*s/4,j*s,s/4,s);
      g.strokeStyle='rgba(60,32,10,0.35)';g.lineWidth=1;
      if(horiz)g.strokeRect(i*s+0.5,j*s+k*s/4+0.5,s-1,s/4-1);else g.strokeRect(i*s+k*s/4+0.5,j*s+0.5,s/4-1,s-1);
    }
  }
  for(var q=0;q<1600;q++){g.fillStyle='rgba(70,38,12,'+(0.03+r()*0.06)+')';var x=r()*w,y=r()*h;
    var ci=Math.floor(x/s),cj=Math.floor(y/s);if((ci+cj)%2===0)g.fillRect(x,y,10+r()*40,1);else g.fillRect(x,y,1,10+r()*40);}
});
T.ceiling=tex(256,256,function(g,w,h){
  g.fillStyle='#dccba6';g.fillRect(0,0,w,h);
  speckle(g,w,h,2500,31,'120,95,60',0.06,2);
  g.strokeStyle='rgba(110,85,50,0.3)';g.lineWidth=2;
  for(var y=0;y<h;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
});
T.panel=tex(512,512,function(g,w,h){
  grain(g,w,h,'#55301d','30,12,4',1400,41,true);
  var cols=2,rows=2,pw=w/cols,ph=h/rows;
  for(var i=0;i<cols;i++)for(var j=0;j<rows;j++){
    var x=i*pw+26,y=j*ph+26,ww=pw-52,hh=ph-52;
    g.strokeStyle='rgba(20,8,2,0.75)';g.lineWidth=5;g.strokeRect(x,y,ww,hh);
    g.strokeStyle='rgba(255,210,160,0.16)';g.lineWidth=2;g.strokeRect(x+5,y+5,ww-10,hh-10);
    g.fillStyle='rgba(0,0,0,0.08)';g.fillRect(x+5,y+5,ww-10,hh-10);
  }
  g.fillStyle='rgba(20,8,2,0.5)';g.fillRect(0,0,w,5);g.fillRect(0,0,4,h);
});
T.books=tex(1024,1024,function(g,w,h){
  grain(g,w,h,'#532e1c','30,12,4',2600,51);
  var r=rng(52),top=46,plinth=150,doors=3,dw=w/doors;
  g.fillStyle='#3d2012';g.fillRect(0,0,w,top);g.fillStyle='rgba(255,210,160,0.18)';g.fillRect(0,top-10,w,3);g.fillRect(0,12,w,2);
  g.fillStyle='rgba(0,0,0,0.35)';g.fillRect(0,top,w,6);
  var pal=['#6b1f1f','#1f3454','#26452f','#8a6a3a','#3a2a22','#7a3b1e','#2b2b33','#5d4a1e','#4a1f33','#9a8660','#1f4a4a','#7d1d14'];
  for(var d=0;d<doors;d++){
    var x0=d*dw+22,x1=(d+1)*dw-22,y0=top+26,y1=h-plinth-16;
    g.fillStyle='#120c08';g.fillRect(x0,y0,x1-x0,y1-y0);
    var shelves=5,sh=(y1-y0)/shelves;
    for(var s=0;s<shelves;s++){
      var by=y0+(s+1)*sh-7,x=x0+3;
      while(x<x1-8){
        var bw=9+r()*17,bh=sh*(0.62+r()*0.3);
        if(r()<0.07){x+=bw*1.2;continue;}
        if(x+bw>x1-3)break;
        var col=pal[Math.floor(r()*pal.length)];
        g.fillStyle=col;g.fillRect(x,by-bh,bw,bh);
        g.fillStyle='rgba(255,255,255,0.10)';g.fillRect(x,by-bh,2,bh);
        g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(x+bw-2,by-bh,2,bh);
        if(r()<0.55){g.fillStyle='rgba(214,178,96,0.75)';g.fillRect(x+1,by-bh*0.8,bw-3,2);g.fillRect(x+1,by-bh*0.3,bw-3,2);}
        x+=bw+0.5;
      }
      g.fillStyle='#3a1f12';g.fillRect(x0,by,x1-x0,7);g.fillStyle='rgba(0,0,0,0.5)';g.fillRect(x0,by+7,x1-x0,6);
    }
    var sgr=g.createLinearGradient(0,y0,0,y0+60);sgr.addColorStop(0,'rgba(0,0,0,0.6)');sgr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=sgr;g.fillRect(x0,y0,x1-x0,60);
    g.save();g.beginPath();g.rect(x0,y0,x1-x0,y1-y0);g.clip();
    g.strokeStyle='rgba(215,185,130,0.13)';g.lineWidth=1.5;
    for(var k=-h;k<w+h;k+=26){g.beginPath();g.moveTo(x0+k,y0);g.lineTo(x0+k+(y1-y0),y1);g.stroke();g.beginPath();g.moveTo(x0+k,y1);g.lineTo(x0+k+(y1-y0),y0);g.stroke();}
    var gl=g.createLinearGradient(x0,y0,x1,y1);gl.addColorStop(0,'rgba(255,255,255,0.10)');gl.addColorStop(0.4,'rgba(255,255,255,0)');gl.addColorStop(0.7,'rgba(255,255,255,0.05)');gl.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=gl;g.fillRect(x0,y0,x1-x0,y1-y0);g.restore();
    g.fillStyle='#4a2817';g.fillRect((x0+x1)/2-7,y0,14,y1-y0);
    g.strokeStyle='rgba(20,8,2,0.8)';g.lineWidth=4;g.strokeRect(x0-2,y0-2,x1-x0+4,y1-y0+4);
    g.strokeStyle='rgba(255,210,160,0.14)';g.lineWidth=2;g.strokeRect(x0-9,y0-9,x1-x0+18,y1-y0+18);
    g.fillStyle='#b8974e';g.fillRect((x0+x1)/2-14,(y0+y1)/2,5,16);g.fillRect((x0+x1)/2+9,(y0+y1)/2,5,16);
    var py=h-plinth+12;
    g.fillStyle='#1a0f09';g.fillRect(x0,py,x1-x0,plinth-44);
    g.strokeStyle='rgba(170,130,80,0.5)';g.lineWidth=2;
    for(var gx=x0+6;gx<x1;gx+=9){g.beginPath();g.moveTo(gx,py+4);g.lineTo(gx,py+plinth-48);g.stroke();}
    g.strokeStyle='rgba(20,8,2,0.8)';g.lineWidth=4;g.strokeRect(x0-2,py-2,x1-x0+4,plinth-40);
  }
  g.fillStyle='#2e170c';g.fillRect(0,h-26,w,26);
});
T.glass=tex(256,512,function(g,w,h){
  var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#f4f8fb');gr.addColorStop(0.55,'#eef2e6');gr.addColorStop(1,'#dfe8cf');
  g.fillStyle=gr;g.fillRect(0,0,w,h);
  var r=rng(61);
  for(var i=0;i<40;i++){var x=r()*w,y=h*0.45+r()*h*0.55,rad=20+r()*60,rg=g.createRadialGradient(x,y,0,x,y,rad);
    rg.addColorStop(0,'rgba(120,160,95,0.22)');rg.addColorStop(1,'rgba(120,160,95,0)');g.fillStyle=rg;g.fillRect(x-rad,y-rad,rad*2,rad*2);}
  g.strokeStyle='rgba(70,74,70,0.85)';g.lineWidth=2.5;
  for(var cx=0;cx<=w;cx+=w/6){g.beginPath();g.moveTo(cx,0);g.lineTo(cx,h);g.stroke();}
  for(var cy=0;cy<=h;cy+=h/16){g.beginPath();g.moveTo(0,cy);g.lineTo(w,cy);g.stroke();}
});
T.rug=tex(512,384,function(g,w,h){
  g.fillStyle='#7a2a22';g.fillRect(0,0,w,h);
  var r=rng(71);
  g.strokeStyle='#d9c39a';g.lineWidth=6;g.strokeRect(14,14,w-28,h-28);
  g.strokeStyle='#1f2f4a';g.lineWidth=14;g.strokeRect(30,30,w-60,h-60);
  g.strokeStyle='#d9c39a';g.lineWidth=3;g.strokeRect(44,44,w-88,h-88);
  for(var i=0;i<26;i++)for(var j=0;j<18;j++){
    var x=60+i*(w-120)/25,y=60+j*(h-120)/17;
    g.fillStyle=((i+j)%2)?'rgba(217,195,154,0.5)':'rgba(31,47,74,0.6)';
    g.beginPath();g.moveTo(x,y-5);g.lineTo(x+5,y);g.lineTo(x,y+5);g.lineTo(x-5,y);g.fill();
  }
  g.save();g.translate(w/2,h/2);
  g.fillStyle='#1f2f4a';g.beginPath();g.ellipse(0,0,110,75,0,0,7);g.fill();
  g.fillStyle='#d9c39a';g.beginPath();g.ellipse(0,0,84,54,0,0,7);g.fill();
  g.fillStyle='#7a2a22';g.beginPath();g.ellipse(0,0,56,34,0,0,7);g.fill();
  g.restore();
  speckle(g,w,h,6000,72,'0,0,0',0.12,2);
});
function portraitTex(seed){
  return tex(256,352,function(g,w,h){
    var r=rng(seed),hue=20+r()*120;
    var gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'hsl('+hue+',22%,'+(16+r()*8)+'%)');gr.addColorStop(1,'hsl('+(hue+20)+',25%,7%)');
    g.fillStyle=gr;g.fillRect(0,0,w,h);
    for(var i=0;i<140;i++){g.strokeStyle='hsla('+(hue+r()*30)+',25%,'+(15+r()*25)+'%,0.12)';g.lineWidth=3+r()*8;g.beginPath();var x=r()*w,y=r()*h;g.moveTo(x,y);g.lineTo(x+r()*60-30,y+r()*60-30);g.stroke();}
    var cx=w*(0.45+r()*0.1),sy=h*0.56;
    g.fillStyle='hsl('+(210+r()*30)+',18%,'+(9+r()*8)+'%)';
    g.beginPath();g.moveTo(cx-88,h);g.quadraticCurveTo(cx-84,sy+12,cx-28,sy);g.lineTo(cx+28,sy);g.quadraticCurveTo(cx+84,sy+12,cx+88,h);g.fill();
    g.fillStyle='rgba(235,228,214,0.85)';g.beginPath();g.moveTo(cx-13,sy);g.lineTo(cx,sy+34);g.lineTo(cx+13,sy);g.fill();
    g.fillStyle='hsl('+(22+r()*10)+','+(16+r()*12)+'%,'+(30+r()*20)+'%)';
    g.beginPath();g.ellipse(cx,sy-44,27,35,0,0,7);g.fill();
    var fg=g.createLinearGradient(cx-27,0,cx+27,0);fg.addColorStop(0,'rgba(0,0,0,0)');fg.addColorStop(1,'rgba(10,6,2,0.6)');g.fillStyle=fg;g.beginPath();g.ellipse(cx,sy-44,27,35,0,0,7);g.fill();
    var vg=g.createRadialGradient(w/2,h*0.42,40,w/2,h/2,h*0.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0.6)');
    g.fillStyle=vg;g.fillRect(0,0,w,h);
  });
}
var portraitTexs=[101,102,103,104,105,106,107].map(portraitTex);

var M={
  woodDark:std({map:T.woodDark,roughness:0.55}),
  woodMid:std({map:T.woodMid,roughness:0.42,envMapIntensity:0.45}),
  beam:std({map:T.woodBeam,roughness:0.62}),
  beamPlain:std({color:0x56311d,roughness:0.62}),
  plaster:std({map:T.plaster,roughness:0.95,envMapIntensity:0.15}),
  stone:std({map:T.stone,roughness:0.9,envMapIntensity:0.15}),
  floor:std({map:T.parquet,roughness:0.5,envMapIntensity:0.32}),
  ceiling:std({map:T.ceiling,roughness:0.95,side:THREE.DoubleSide,envMapIntensity:0.15}),
  gold:std({color:0xb9933f,roughness:0.36,metalness:0.85,envMapIntensity:1.1}),
  brass:std({color:0xb08a45,roughness:0.3,metalness:0.9,envMapIntensity:1.2}),
  black:std({color:0x15151a,roughness:0.5,metalness:0.4}),
  tan:std({color:0x8a6844,roughness:0.85}),
  red:std({color:0x7d2416,roughness:0.85}),
  glow:new THREE.MeshBasicMaterial({color:new THREE.Color(2.6,2.0,1.25),side:THREE.DoubleSide})
};
M.floor.map.repeat.set(1,1);

/* ============================================================
   Room: Gothic Reading Room
   Returns colliders, spawn point and per-frame update, so other
   rooms can be added later with the same contract.
   ============================================================ */
var L=34,W=11,H=7.6,R=12.5,HL=L/2,HW=W/2;
var TRUSS_Z=[-15.6,-10.4,-5.2,0,5.2,10.4,15.6];
var BAY_C=[-13,-7.8,-2.6,2.6,7.8,13];
var SUN_POS=new THREE.Vector3(30,27,5);

function buildGothicReadingRoom(root){
  var colliders=[];
  function wallGroup(x,z,ry){var g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;root.add(g);return g;}
  var walls={
    east:{g:wallGroup(HW,0,-Math.PI/2),s:1,w:function(u,d){return [HW-d,u];}},
    west:{g:wallGroup(-HW,0,Math.PI/2),s:-1,w:function(u,d){return [-HW+d,-u];}},
    north:{g:wallGroup(0,-HL,0),s:1,w:function(u,d){return [u,-HL+d];}},
    south:{g:wallGroup(0,HL,Math.PI),s:-1,w:function(u,d){return [-u,HL-d];}}
  };
  function addCollider(wall,u0,u1,depth){
    var a=wall.w(u0,0),b=wall.w(u1,depth);
    colliders.push({x0:Math.min(a[0],b[0]),x1:Math.max(a[0],b[0]),z0:Math.min(a[1],b[1]),z1:Math.max(a[1],b[1])});
  }
  function addBox(x,z,hx,hz){colliders.push({x0:x-hx,x1:x+hx,z0:z-hz,z1:z+hz});}

  /* Floor and roof */
  var floorTex=rep(T.parquet,(W+1.2)/1.7,(L+1.2)/1.7);floorTex.center.set(0.5,0.5);floorTex.rotation=Math.PI/4;
  M.floor.map=floorTex;
  var floor=mesh(new THREE.PlaneGeometry(W+1.2,L+1.2),M.floor,0,0,0,root);floor.rotation.x=-Math.PI/2;floor.castShadow=false;

  var slope=Math.sqrt(HW*HW+(R-H)*(R-H)),ang=Math.atan2(R-H,HW);
  [1,-1].forEach(function(sg){
    var g=new THREE.BufferGeometry(),x=sg*(HW+0.02),z=HL+0.6;
    g.setAttribute('position',new THREE.Float32BufferAttribute([x,H,z, x,H,-z, 0,R,-z, x,H,z, 0,R,-z, 0,R,z],3));
    var ul=(2*z)/1.4,vl=slope/1.4;
    g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0, ul,0, ul,vl, 0,0, ul,vl, 0,vl],2));
    g.computeVertexNormals();
    var m=mesh(g,M.ceiling,0,0,0,root);m.material.shadowSide=THREE.DoubleSide;
  });
  var rafterGeo=box(slope,0.17,0.1),rt=[];
  for(var rz=-HL+0.45;rz<HL;rz+=0.87){
    var near=TRUSS_Z.some(function(t){return Math.abs(t-rz)<0.3;});if(near)continue;
    rt.push({x:HW/2,y:(H+R)/2-0.1,z:rz,rz:-ang});rt.push({x:-HW/2,y:(H+R)/2-0.1,z:rz,rz:ang});
  }
  instanced(rafterGeo,M.beamPlain,rt,root).castShadow=false;
  [0.34,0.67].forEach(function(f){[1,-1].forEach(function(sg){
    var p=mesh(box(0.2,0.26,L),M.beam,sg*HW*(1-f),H+(R-H)*f-0.22,0,root);p.rotation.z=-sg*ang;p.castShadow=false;
  });});
  mesh(box(0.22,0.32,L),M.beam,0,R-0.24,0,root).castShadow=false;

  /* Trusses */
  var ts=new THREE.Shape();
  ts.moveTo(-HW-0.05,5.6);ts.lineTo(-HW-0.05,H+0.15);ts.lineTo(0,R+0.15);ts.lineTo(HW+0.05,H+0.15);ts.lineTo(HW+0.05,5.6);
  ts.lineTo(HW-0.3,5.6);ts.quadraticCurveTo(4.75,8.9,0,11.15);ts.quadraticCurveTo(-4.75,8.9,-HW+0.3,5.6);ts.lineTo(-HW-0.05,5.6);
  var trussGeo=extrude(ts,0.34);
  var ts2=new THREE.Shape();
  ts2.moveTo(HW-0.3,5.75);ts2.quadraticCurveTo(4.6,8.75,0,10.95);ts2.quadraticCurveTo(-4.6,8.75,-HW+0.3,5.75);
  ts2.lineTo(-HW+0.42,5.75);ts2.quadraticCurveTo(-4.5,8.6,0,10.78);ts2.quadraticCurveTo(4.5,8.6,HW-0.42,5.75);ts2.lineTo(HW-0.3,5.75);
  var ribGeo=extrude(ts2,0.5);
  var pend=[];
  TRUSS_Z.forEach(function(tz,i){
    mesh(trussGeo,M.beam,0,0,tz-0.17,root);
    mesh(ribGeo,M.beamPlain,0,0,tz-0.25,root).castShadow=false;
    [1,-1].forEach(function(sg){
      mesh(box(0.36,0.5,0.56),M.stone,sg*(HW-0.17),5.36,tz,root);
      mesh(box(0.26,0.22,0.42),M.stone,sg*(HW-0.12),5.02,tz,root);
    });
    if(i%3!==1){pend.push({x:2.6,y:8.9,z:tz+0.3});pend.push({x:-2.6,y:8.9,z:tz+0.3});}
  });
  var pendGeo=merge([part(new THREE.CylinderGeometry(0.07,0.17,0.34,14),0,0,0),part(new THREE.CylinderGeometry(0.008,0.008,1.6,5),0,0.95,0)]);
  instanced(pendGeo,M.black,pend,root).castShadow=false;

  /* Windows */
  function windowUnit(wall,cx,y0,w,ys,ya,big){
    var g=wall.g;
    var sur=archPts(new THREE.Shape(),cx,y0-0.16,w+0.36,ys,ya+0.2);sur.holes.push(archPts(new THREE.Path(),cx,y0,w,ys,ya));
    mesh(extrude(sur,0.1),M.stone,0,0,-0.03,g).castShadow=false;
    mesh(box(w+0.5,0.12,0.3),M.stone,cx,y0-0.2,0.06,g).castShadow=false;
    var tr=archPts(new THREE.Shape(),cx,y0,w,ys,ya),n=big?4:2,m=big?0.14:0.11,lw=(w-(n+1)*m)/n;
    for(var i=0;i<n;i++){
      var lc=cx-w/2+m+lw/2+i*(lw+m);
      tr.holes.push(archPts(new THREE.Path(),lc,y0+m,lw,ys-(big?0.6:0.25),ys+(big?0.3:0.4)));
    }
    if(big){tr.holes.push(circlePath(cx-1.1,ys+0.95,0.42));tr.holes.push(circlePath(cx+1.1,ys+0.95,0.42));tr.holes.push(circlePath(cx,ys+2.0,0.5));}
    else tr.holes.push(circlePath(cx,ys+0.72,0.2));
    mesh(extrude(tr,0.14),M.stone,0,0,-0.4,g);
    var bars=big?[0.36,0.7]:[0.5];
    bars.forEach(function(f){mesh(box(w,0.09,0.14),M.stone,cx,y0+(ys-0.3-y0)*f,-0.33,g);});
    var gt=rep(T.glass,big?3:1,big?1.6:1);
    var gm=new THREE.MeshBasicMaterial({map:gt,color:new THREE.Color(1.9,1.85,1.7)});
    var gl=new THREE.Mesh(new THREE.PlaneGeometry(w,ya-y0),gm);gl.position.set(cx,(y0+ya)/2,-0.43);g.add(gl);
  }
  /* East wall with window openings */
  var WIN={y0:3.1,w:1.5,ys:5.5,ya:6.9},eastWins=[];
  BAY_C.forEach(function(c){eastWins.push(c-1.05);eastWins.push(c+1.05);});
  var es=new THREE.Shape();es.moveTo(-HL-0.6,0);es.lineTo(HL+0.6,0);es.lineTo(HL+0.6,H+0.3);es.lineTo(-HL-0.6,H+0.3);es.lineTo(-HL-0.6,0);
  eastWins.forEach(function(c){es.holes.push(archPts(new THREE.Path(),c,WIN.y0,WIN.w,WIN.ys,WIN.ya));});
  mesh(extrude(es,0.6),M.plaster,0,0,-0.6,walls.east.g);
  eastWins.forEach(function(c){windowUnit(walls.east,c,WIN.y0,WIN.w,WIN.ys,WIN.ya,false);});
  /* West wall */
  var wp=std({map:rep(T.plaster,L/3.3,H/3.3),roughness:0.95,envMapIntensity:0.15});
  var ww=mesh(new THREE.PlaneGeometry(L+1.2,H+0.3),wp,0,(H+0.3)/2,0,walls.west.g);ww.castShadow=false;
  /* Gable walls */
  function gable(wall,hole){
    var s=new THREE.Shape();s.moveTo(-HW-0.6,0);s.lineTo(HW+0.6,0);s.lineTo(HW+0.6,H);s.lineTo(0,R+0.55);s.lineTo(-HW-0.6,H);s.lineTo(-HW-0.6,0);
    if(hole)s.holes.push(hole);
    mesh(extrude(s,0.6),M.plaster,0,0,-0.6,wall.g);
  }
  var GW={y0:2.95,w:4.6,ys:6.2,ya:9.4};
  gable(walls.north,archPts(new THREE.Path(),0,GW.y0,GW.w,GW.ys,GW.ya));
  windowUnit(walls.north,0,GW.y0,GW.w,GW.ys,GW.ya,true);
  gable(walls.south,null);

  /* Bookcases */
  var cornice=[];
  function bookcase(wall,a,b){
    var u0=Math.min(wall.s*a,wall.s*b),u1=Math.max(wall.s*a,wall.s*b),len=u1-u0,h=2.3,d=0.5;
    mesh(box(len,h,d),M.woodDark,(u0+u1)/2,h/2,d/2,wall.g);
    var fm=std({map:rep(T.books,len/2.6,1),roughness:0.24,envMapIntensity:0.6});
    var f=mesh(new THREE.PlaneGeometry(len,h),fm,(u0+u1)/2,h/2,d+0.004,wall.g);f.castShadow=false;
    mesh(box(len+0.06,0.09,d+0.08),M.woodDark,(u0+u1)/2,h+0.045,d/2+0.02,wall.g);
    addCollider(wall,u0,u1,d+0.02);
  }
  function pier(wall,a){
    var u=wall.s*a,pm=std({map:rep(T.panel,0.5,1),roughness:0.5});
    mesh(box(1.3,2.95,0.62),M.woodDark,u,1.475,0.31,wall.g);
    var f=mesh(new THREE.PlaneGeometry(1.2,2.75),pm,u,1.475,0.624,wall.g);f.castShadow=false;
    mesh(box(1.42,0.12,0.72),M.woodDark,u,3.0,0.33,wall.g);
    addCollider(wall,u-0.65,u+0.65,0.64);
  }
  bookcase(walls.east,-HL,HL);
  TRUSS_Z.forEach(function(z){pier(walls.east,z);});
  bookcase(walls.west,-HL,-5.0);bookcase(walls.west,-2.6,HL);
  bookcase(walls.south,-5.0,-1.5);bookcase(walls.south,1.5,5.0);
  /* West alcove backing for framed photographs */
  var alc=mesh(new THREE.PlaneGeometry(2.4,2.9),std({map:rep(T.panel,1,1),roughness:0.5}),3.8,1.45,0.02,walls.west.g);alc.castShadow=false;
  mesh(box(2.5,0.1,0.12),M.woodDark,3.8,2.92,0.06,walls.west.g);
  /* North wainscot */
  var wn=mesh(new THREE.PlaneGeometry(W,2.6),std({map:rep(T.panel,5,1),roughness:0.5}),0,1.3,0.02,walls.north.g);wn.castShadow=false;
  mesh(box(W,0.1,0.12),M.woodDark,0,2.62,0.06,walls.north.g);
  /* South door and clock */
  mesh(box(2.1,2.85,0.1),M.stone,0,1.425,0.03,walls.south.g);
  var dr=mesh(box(1.8,2.65,0.1),std({map:rep(T.panel,1,1),roughness:0.5}),0,1.325,0.07,walls.south.g);dr.castShadow=false;
  mesh(new THREE.SphereGeometry(0.035,10,8),M.brass,0.1,1.1,0.14,walls.south.g);
  mesh(new THREE.SphereGeometry(0.035,10,8),M.brass,-0.1,1.1,0.14,walls.south.g);
  var clockTex=tex(256,256,function(g,w,h){
    g.fillStyle='#f1ead8';g.beginPath();g.arc(128,128,126,0,7);g.fill();
    g.fillStyle='#1c1814';g.font='24px Georgia';g.textAlign='center';g.textBaseline='middle';
    ['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'].forEach(function(s,i){var a=i*Math.PI/6;g.fillText(s,128+Math.sin(a)*98,128-Math.cos(a)*98);});
    g.strokeStyle='#1c1814';g.lineCap='round';g.lineWidth=7;g.beginPath();g.moveTo(128,128);g.lineTo(128+52,128-30);g.stroke();
    g.lineWidth=4;g.beginPath();g.moveTo(128,128);g.lineTo(128-22,128-84);g.stroke();
  });
  var ck=mesh(new THREE.CylinderGeometry(0.42,0.42,0.08,32),M.woodDark,0,6.9,0.04,walls.south.g);ck.rotation.x=Math.PI/2;
  var cf=mesh(new THREE.CircleGeometry(0.36,32),std({map:clockTex,roughness:0.6}),0,6.9,0.085,walls.south.g);cf.castShadow=false;

  /* Portraits */
  var frameGeo=box(1,1,0.07),picGeo=new THREE.PlaneGeometry(1,1),pi=0;
  function portrait(wall,a,y,w,h){
    var u=wall.s*a;
    var f=mesh(frameGeo,M.gold,u,y,0.045,wall.g);f.scale.set(w,h,1);
    var pm=std({map:portraitTexs[pi++%portraitTexs.length],roughness:0.55});
    var p=mesh(picGeo,pm,u,y,0.083,wall.g);p.scale.set(w-0.16,h-0.16,1);p.castShadow=false;
  }
  TRUSS_Z.forEach(function(z){portrait(walls.east,z,4.25,1.0,1.4);});
  TRUSS_Z.forEach(function(z){portrait(walls.west,z,4.45,1.25,1.7);});
  BAY_C.forEach(function(z){portrait(walls.west,z,4.3,0.95,1.3);});
  portrait(walls.north,-3.95,4.3,1.0,1.4);portrait(walls.north,3.95,4.3,1.0,1.4);
  portrait(walls.south,-3.3,4.3,1.2,1.6);portrait(walls.south,3.3,4.3,1.2,1.6);portrait(walls.south,0,4.6,1.3,1.7);

  /* Chandeliers */
  var chZ=[-10.4,0,10.4],chLights=[];
  var ringParts=[],bandParts=[];
  [[0.95,0.3,7.55],[0.7,0.28,7.24],[0.42,0.24,6.96]].forEach(function(r){
    ringParts.push(part(new THREE.CylinderGeometry(r[0],r[0],r[1],28,1,true),0,r[2],0));
    bandParts.push(part(new THREE.TorusGeometry(r[0],0.028,6,28),0,r[2]+r[1]/2,0,0,Math.PI/2));
    bandParts.push(part(new THREE.TorusGeometry(r[0],0.028,6,28),0,r[2]-r[1]/2,0,0,Math.PI/2));
  });
  ringParts.push(part(new THREE.CircleGeometry(0.42,24),0,6.84,0,0,Math.PI/2));
  for(var c4=0;c4<4;c4++){var ca=c4*Math.PI/2+0.4;bandParts.push(part(new THREE.CylinderGeometry(0.012,0.012,1.1,5),Math.cos(ca)*0.5,8.2,Math.sin(ca)*0.5,0,0,0));}
  bandParts.push(part(new THREE.CylinderGeometry(0.02,0.02,2.5,6),0,9.95,0));
  bandParts.push(part(new THREE.CylinderGeometry(0.55,0.95,0.06,24,1,true),0,7.72,0));
  var ringGeo=merge(ringParts),bandGeo=merge(bandParts);
  chZ.forEach(function(z){
    mesh(ringGeo,M.glow,0,0,z,root,true);
    var b=mesh(bandGeo,M.brass,0,0,z,root,true);b.material.side=THREE.DoubleSide;
    var pl=new THREE.PointLight(0xffca82,0.85,19,1.6);pl.position.set(0,6.7,z);root.add(pl);chLights.push(pl);
  });

  /* Furniture */
  var tableGeo=merge([part(box(2.6,0.07,1.1),0,0.735,0),part(box(0.09,0.7,0.92),-1.12,0.35,0),part(box(0.09,0.7,0.92),1.12,0.35,0),part(box(2.2,0.1,0.06),0,0.63,0.4),part(box(2.2,0.1,0.06),0,0.63,-0.4),part(box(2.2,0.07,0.07),0,0.14,0)]);
  var chairGeo=merge([part(box(0.46,0.05,0.44),0,0.45,0),part(box(0.46,0.12,0.035),0,0.9,-0.215),part(box(0.46,0.07,0.03),0,0.72,-0.215),
    part(box(0.045,0.96,0.045),-0.21,0.48,-0.2),part(box(0.045,0.96,0.045),0.21,0.48,-0.2),part(box(0.045,0.45,0.045),-0.21,0.225,0.2),part(box(0.045,0.45,0.045),0.21,0.225,0.2),
    part(box(0.04,0.04,0.4),-0.21,0.2,0),part(box(0.04,0.04,0.4),0.21,0.2,0)]);
  var tableRows=[12,8.5,5,-5.5,-9],tables=[],chairs=[],bookT=[],r=rng(301);
  var bookCols=['#6b1f1f','#1f3454','#26452f','#8a6a3a','#e8e0cc','#7a3b1e','#2b2b33'];
  tableRows.forEach(function(z){[-2.35,2.35].forEach(function(x){
    tables.push({x:x,z:z});addBox(x,z,1.32,0.98);
    [-0.85,0,0.85].forEach(function(dx){
      chairs.push({x:x+dx+(r()-0.5)*0.06,z:z+0.62+r()*0.14,ry:Math.PI+(r()-0.5)*0.3});
      chairs.push({x:x+dx+(r()-0.5)*0.06,z:z-0.62-r()*0.14,ry:(r()-0.5)*0.3});
    });
    var n=Math.floor(r()*3)+1;
    for(var i=0;i<n;i++){
      var bx=x+(r()-0.5)*1.5+(x>0?0.35:-0.35),bz=z+(r()-0.5)*0.6,stack=1+Math.floor(r()*3),ry=r()*3;
      for(var k=0;k<stack;k++)bookT.push({x:bx,y:0.79+k*0.042,z:bz,ry:ry+(r()-0.5)*0.4,sx:0.8+r()*0.4,color:bookCols[Math.floor(r()*bookCols.length)]});
    }
  });});
  instanced(tableGeo,M.woodMid,tables,root);
  instanced(chairGeo,std({map:T.woodDark,roughness:0.5,color:0xb9a79a}),chairs,root);
  instanced(box(0.2,0.04,0.27),std({color:0xffffff,roughness:0.7}),bookT,root);

  var armGeo=merge([part(box(0.84,0.26,0.8),0,0.32,0),part(box(0.84,0.56,0.18),0,0.66,-0.33),part(box(0.16,0.4,0.78),-0.36,0.5,0.01),part(box(0.16,0.4,0.78),0.36,0.5,0.01),part(box(0.6,0.1,0.56),0,0.48,0.06)]);
  var legGeo=merge([part(box(0.06,0.2,0.06),-0.36,0.1,-0.34),part(box(0.06,0.2,0.06),0.36,0.1,-0.34),part(box(0.06,0.2,0.06),-0.36,0.1,0.34),part(box(0.06,0.2,0.06),0.36,0.1,0.34)]);
  var tanCh=[{x:-1.65,z:0.3,ry:Math.PI/2},{x:1.65,z:0.3,ry:-Math.PI/2},{x:-0.62,z:-1.35,ry:0.12},{x:0.62,z:-1.35,ry:-0.12}];
  var redCh=[{x:-0.62,z:2.0,ry:Math.PI-0.1},{x:0.62,z:2.0,ry:Math.PI+0.1},{x:-3.3,z:-15.6,ry:0.5},{x:3.3,z:-15.6,ry:-0.5}];
  instanced(armGeo,M.tan,tanCh,root);instanced(armGeo,M.red,redCh,root);instanced(legGeo,M.woodDark,tanCh.concat(redCh),root);
  tanCh.concat(redCh).forEach(function(c){addBox(c.x,c.z,0.47,0.47);});
  mesh(box(1.1,0.06,0.6),M.woodMid,0,0.42,0.3,root);mesh(box(0.9,0.36,0.44),M.woodDark,0,0.2,0.3,root);addBox(0,0.3,0.57,0.32);
  var rug=mesh(new THREE.PlaneGeometry(4.6,5.0),std({map:rep(T.rug,1,1),roughness:0.95,envMapIntensity:0.1}),0,0.012,0.3,root);
  rug.rotation.x=-Math.PI/2;rug.rotation.z=Math.PI/2;rug.castShadow=false;

  /* Light */
  var hemi=new THREE.HemisphereLight(0xd3dcea,0x5a4630,0.42);root.add(hemi);
  var sun=new THREE.DirectionalLight(0xfff0d6,3.1);sun.position.copy(SUN_POS);sun.target.position.set(0,2,0);root.add(sun);root.add(sun.target);
  sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);
  var sc=sun.shadow.camera;sc.left=-22;sc.right=22;sc.top=14;sc.bottom=-14;sc.near=5;sc.far=90;sc.updateProjectionMatrix();
  sun.shadow.bias=-0.0004;sun.shadow.normalBias=0.04;
  var fill=new THREE.DirectionalLight(0xdde6f4,0.38);fill.position.set(10,5,1);root.add(fill);

  /* Sun shafts and dust */
  var d=SUN_POS.clone().multiplyScalar(-1).sub(new THREE.Vector3(0,-2,0)).normalize();
  var sp=[],su=[];
  eastWins.forEach(function(zc){[-0.38,0.38].forEach(function(o){
    var z=zc+o,x=HW-0.05,l0=WIN.y0/-d.y,l1=(WIN.ya-0.5)/-d.y;
    var p0=[x,WIN.y0,z],p1=[x,WIN.ya-0.5,z],p2=[x+d.x*l1,0.02,z+d.z*l1],p3=[x+d.x*l0,0.02,z+d.z*l0];
    [p0,p1,p2,p0,p2,p3].forEach(function(p){sp.push(p[0],p[1],p[2]);});
    su.push(0,0,1,0,1,1,0,0,1,1,0,1);
  });});
  var shaftGeo=new THREE.BufferGeometry();
  shaftGeo.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));shaftGeo.setAttribute('uv',new THREE.Float32BufferAttribute(su,2));
  var shaftTex=tex(64,256,function(g,w,h){
    var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,240,205,0)');gr.addColorStop(0.08,'rgba(255,240,205,1)');gr.addColorStop(1,'rgba(255,240,205,0.25)');
    g.fillStyle=gr;g.fillRect(0,0,w,h);
    g.globalCompositeOperation='destination-in';
    var e=g.createLinearGradient(0,0,w,0);e.addColorStop(0,'rgba(0,0,0,0)');e.addColorStop(0.3,'rgba(0,0,0,1)');e.addColorStop(0.7,'rgba(0,0,0,1)');e.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=e;g.fillRect(0,0,w,h);
  });
  shaftTex.flipY=true;
  var shafts=new THREE.Mesh(shaftGeo,new THREE.MeshBasicMaterial({map:shaftTex,transparent:true,opacity:0.05,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  root.add(shafts);
  var DN=420,dpos=new Float32Array(DN*3),dr2=rng(401),dvel=[];
  for(var i=0;i<DN;i++){dpos[i*3]=-2.5+dr2()*7.5;dpos[i*3+1]=0.4+dr2()*5.5;dpos[i*3+2]=-HL+1+dr2()*(L-2);dvel.push([(dr2()-0.5)*0.03,(dr2()-0.5)*0.02,(dr2()-0.5)*0.03]);}
  var dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(dpos,3));
  var dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xfff1cf,size:0.022,transparent:true,opacity:0.45,blending:THREE.AdditiveBlending,depthWrite:false}));
  root.add(dust);

  return {
    colliders:colliders,walls:walls,addBox:addBox,
    bounds:{x0:-HW,x1:HW,z0:-HL,z1:HL},
    spawn:{x:0,z:15.2,yaw:0,pitch:-0.02},
    tables:tables,effects:[shafts,dust],
    update:function(t,dt){
      if(REDUCED)return;
      var a=dustGeo.attributes.position.array;
      for(var i=0;i<DN;i++){
        a[i*3]+=dvel[i][0]*dt;a[i*3+1]+=(dvel[i][1]+Math.sin(t*0.3+i)*0.004)*dt;a[i*3+2]+=dvel[i][2]*dt;
        if(a[i*3+1]>6)a[i*3+1]=0.4;if(a[i*3+1]<0.3)a[i*3+1]=5.9;
        if(a[i*3]>5)a[i*3]=-2.5;if(a[i*3]<-2.5)a[i*3]=5;
      }
      dustGeo.attributes.position.needsUpdate=true;
      var f=1+Math.sin(t*1.7)*0.012+Math.sin(t*4.3)*0.006;chLights.forEach(function(l){l.intensity=0.85*f;});
    }
  };
}

/* ============================================================
   Artifacts: structured data + physical builders
   Add an entry here (and a builder if it needs a new display
   format) to place a new artifact in any room.
   ============================================================ */
function drawFood(kind){
  return function(g,w,h){
    var r=rng(kind*7+3);
    grain(g,w,h,kind===1?'#3a2a1e':kind===2?'#7d2f28':'#2b3440','0,0,0',260,kind+80);
    if(kind===2){g.fillStyle='rgba(255,255,255,0.16)';for(var i=0;i<w;i+=40)for(var j=0;j<h;j+=40)if((i/40+j/40)%2===0)g.fillRect(i,j,40,40);}
    function shadow(x,y,rx,ry){g.fillStyle='rgba(0,0,0,0.35)';g.beginPath();g.ellipse(x+6,y+8,rx,ry,0,0,7);g.fill();}
    var cx=w*0.48,cy=h*0.53;
    if(kind===1){
      shadow(cx,cy,118,92);g.fillStyle='#b98b4e';g.beginPath();g.ellipse(cx,cy,118,92,0,0,7);g.fill();
      g.fillStyle='#d9b673';g.beginPath();g.ellipse(cx,cy,102,78,0,0,7);g.fill();
      g.strokeStyle='rgba(120,85,40,0.5)';g.lineWidth=2;for(var k=-90;k<100;k+=14){g.beginPath();g.moveTo(cx+k,cy-76);g.lineTo(cx+k,cy+76);g.stroke();}
      for(var n=0;n<6;n++){var a=n*Math.PI/3+0.3,x=cx+Math.cos(a)*52,y=cy+Math.sin(a)*38;
        g.fillStyle='rgba(0,0,0,0.2)';g.beginPath();g.ellipse(x+3,y+4,25,19,a,0,7);g.fill();
        g.fillStyle='#f4ecdc';g.beginPath();g.ellipse(x,y,25,19,a,0,7);g.fill();
        g.strokeStyle='rgba(170,150,120,0.8)';g.lineWidth=1.5;for(var p=-3;p<=3;p++){g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a+p*0.22)*20,y+Math.sin(a+p*0.22)*15);g.stroke();}}
      shadow(w*0.86,h*0.26,26,20);g.fillStyle='#f1ede4';g.beginPath();g.ellipse(w*0.86,h*0.26,26,20,0,0,7);g.fill();g.fillStyle='#2a140c';g.beginPath();g.ellipse(w*0.86,h*0.26,19,14,0,0,7);g.fill();
    }else if(kind===2){
      shadow(cx,cy,125,96);g.fillStyle='#f3efe6';g.beginPath();g.ellipse(cx,cy,125,96,0,0,7);g.fill();
      g.strokeStyle='rgba(0,0,0,0.08)';g.lineWidth=3;g.beginPath();g.ellipse(cx,cy,100,74,0,0,7);g.stroke();
      for(var q=0;q<70;q++){g.fillStyle='hsl('+(14+r()*14)+',55%,'+(20+r()*18)+'%)';g.beginPath();g.ellipse(cx-36+(r()-0.5)*80,cy+6+(r()-0.5)*56,7+r()*9,3+r()*5,r()*3,0,7);g.fill();}
      g.fillStyle='#d9a93a';g.fillRect(cx+38,cy-52,52,42);g.fillStyle='rgba(255,255,255,0.25)';g.fillRect(cx+38,cy-52,52,6);
      for(var s=0;s<60;s++){g.strokeStyle=r()<0.7?'#cfe0b0':'#e9a45a';g.lineWidth=2;var sx=cx+62+(r()-0.5)*50,sy=cy+34+(r()-0.5)*30;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+(r()-0.5)*18,sy+(r()-0.5)*14);g.stroke();}
    }else{
      shadow(cx,cy,122,90);g.fillStyle='#e9e4d8';g.beginPath();g.ellipse(cx,cy,122,90,0,0,7);g.fill();
      [[-46,-12],[42,-18],[2,30]].forEach(function(o){var x=cx+o[0],y=cy+o[1];
        g.fillStyle='rgba(0,0,0,0.25)';g.beginPath();g.ellipse(x+4,y+6,36,30,0,0,7);g.fill();
        g.fillStyle='#b9772c';g.beginPath();g.ellipse(x,y,36,30,0,0,7);g.fill();
        g.fillStyle='#d79a45';g.beginPath();g.ellipse(x,y-3,30,24,0,0,7);g.fill();
        g.strokeStyle='rgba(120,65,15,0.8)';g.lineWidth=2;g.beginPath();g.ellipse(x,y-3,20,15,0,0,7);g.stroke();
        for(var k=0;k<8;k++){var a=k*Math.PI/4;g.beginPath();g.moveTo(x+Math.cos(a)*8,y-3+Math.sin(a)*6);g.lineTo(x+Math.cos(a)*19,y-3+Math.sin(a)*14);g.stroke();}});
      shadow(w*0.87,h*0.25,28,22);g.fillStyle='#dfe6e2';g.beginPath();g.ellipse(w*0.87,h*0.25,28,22,0,0,7);g.fill();g.fillStyle='#8a6a2c';g.beginPath();g.ellipse(w*0.87,h*0.25,21,16,0,0,7);g.fill();
    }
    var vg=g.createRadialGradient(w/2,h/2,h*0.3,w/2,h/2,h*0.85);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0.45)');g.fillStyle=vg;g.fillRect(0,0,w,h);
  };
}
var FOOD=[1,2,3].map(function(k){var t=tex(400,300,drawFood(k));t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;return t;});

var LETTER_TEXT='Dear future student,\n\nYou will feel behind in your first month. Everyone does, and almost nobody says so.\n\nEat in the dining hall alone at least once and sit down with strangers. Learn the name of one tree on campus. Call home at a strange hour. Twelve hours apart means someone is always just waking up.\n\nThe work will get done. The people are the part you cannot make up later.\n\nFrom a student who was once as nervous as you';

var ARTIFACTS=[
  {id:'audio',no:'01',theme:'Audio Memories',title:'Rain on the Quad',origin:'Duke University, Durham',format:'Audio station',
   pos:[4.55,1.15,2.6],radius:2.3,build:'audioStation',ry:-Math.PI/2,
   description:'A listening post beside the bookcases. A Duke student remembers the afternoon a rainstorm introduced her to her closest friend.',
   media:{type:'speech',label:'Play recording',parts:[{pitch:1.05,text:'It was the second week of my first semester, and it rained so hard that the quad turned into a mirror. I was hiding under the arches outside the library with someone I had never met, both of us pretending to check our phones. Eventually she laughed and said, we are going to be late either way. So we walked. We were soaked by the time we reached class, and she has been my closest friend ever since. Whenever it rains now, I think about how close I came to waiting it out alone.'}]}},
  {id:'letter',no:'02',theme:'Letters to Future Students',title:'To Whoever Sits Here Next',origin:'Duke Kunshan University, Kunshan',format:'Open letter on a reading table',
   pos:[1.5,0.85,8.5],radius:2.0,build:'letter',
   description:'A handwritten letter left on a reading table by a DKU student at the end of a semester in Durham, addressed to someone they will never meet.',
   media:{type:'letter',text:LETTER_TEXT}},
  {id:'capsule',no:'03',theme:'Shared Memory Capsule',title:'Two First Days',origin:'Duke and Duke Kunshan, recorded together',format:'Glass display case',
   pos:[0,1.15,-14.2],radius:2.4,build:'displayCase',
   description:'Two students describe arriving on their own campus for the first time. Read side by side, the same small moments keep appearing.',
   media:{type:'capsule',motifs:['Suitcase wheels','Getting lost','A stranger who helped','The first meal'],sides:[
     {cls:'duke',place:'Durham',who:'A Duke student',pitch:1.1,text:'My suitcase wheels were so loud on the stone path that I carried the bag the last hundred metres. I got lost looking for my dorm, and a sophomore walked me there without being asked. Dinner was a biscuit bigger than my hand.'},
     {cls:'dku',place:'Kunshan',who:'A DKU student',pitch:0.85,text:'I remember the sound of suitcase wheels on the bridge over the water, dozens of us arriving at once. I could not find the academic building, and a security guard drew me a map on the back of a receipt. Dinner was soup dumplings, and I burned my tongue on the first one.'}]}},
  {id:'food',no:'04',theme:'Culture and Food',title:'What We Ate When We Missed Home',origin:'Duke and Duke Kunshan',format:'Framed photographs',
   pos:[-5.35,1.6,-3.8],radius:2.5,build:'frames',
   description:'Three framed meals with a note from the person who chose each one. The images are illustrated stand-ins for photographs students will contribute.',
   media:{type:'gallery',items:[
     {title:'Sunday dumplings',from:'Kunshan',cls:'dku',text:'Six of us folded these in a dorm kitchen with one cutting board. Mine fell apart in the pot and nobody let me forget it.'},
     {title:'Barbecue after the game',from:'Durham',cls:'duke',text:'My roommate insisted this was the real welcome to North Carolina. I still think about the cornbread.'},
     {title:'Mooncakes in the common room',from:'Durham',cls:'duke',text:'A visiting DKU student brought a box for Mid-Autumn Festival and cut each one into eight pieces so the whole floor could try them.'}]}},
  {id:'qa',no:'05',theme:'Question and Answer Archive',title:'Questions Across Twelve Hours',origin:'Duke and Duke Kunshan',format:'Journal on a lectern',
   pos:[-3.7,1.15,14.5],radius:2.3,build:'lectern',ry:Math.PI/2,
   description:'An open journal where students on one campus leave a question and students on the other answer it, often half a day later.',
   media:{type:'qa',items:[
     {q:'What do you eat when you are homesick?',qf:'Asked from Durham',a:'Tomato and egg over rice. It takes ten minutes and tastes like my kitchen at home.',af:'Answered from Kunshan',qc:'duke',ac:'dku'},
     {q:'What does your campus sound like at night?',qf:'Asked from Kunshan',a:'Crickets, the chapel bells on the hour, and someone practising trumpet badly.',af:'Answered from Durham',qc:'dku',ac:'duke'},
     {q:'Where do you go when you need to be alone?',qf:'Asked from Durham',a:'The path beside the water behind the library. Early, before the first class.',af:'Answered from Kunshan',qc:'duke',ac:'dku'},
     {q:'What surprised you most about the other campus?',qf:'Asked from Kunshan',a:'How old it tries to look. Then you find out the stone is younger than my grandmother.',af:'Answered from Durham',qc:'dku',ac:'duke'}]}},
  {id:'media',no:'06',theme:'Media and Music',title:'A Playlist for the Time Difference',origin:'Duke and Duke Kunshan',format:'Display set into the bookcases',
   pos:[4.95,1.45,-13],radius:2.6,build:'screen',
   description:'Short pieces of music that students said sound like their campus at a particular hour. These sketches are generated in the browser as stand-ins.',
   media:{type:'tracks',items:[
     {title:'Chapel Bells at Five',from:'Durham, late afternoon',cls:'duke',text:'Slow and bright, for the walk back across the quad.'},
     {title:'Canal Lights',from:'Kunshan, after dark',cls:'dku',text:'A plucked melody for the bridge over the water.'},
     {title:'Half a Day Away',from:'Both campuses',cls:'',text:'One phrase, answered a moment later from the other side.'}]}}
];

var placardGeo=new THREE.PlaneGeometry(0.34,0.22);
function placard(a,x,z,ry,root){
  var t=tex(340,220,function(g,w,h){
    g.fillStyle='#efe7d3';g.fillRect(0,0,w,h);g.strokeStyle='#b08a45';g.lineWidth=6;g.strokeRect(3,3,w-6,h-6);
    g.fillStyle='#8a6a2c';g.font='22px Georgia';g.fillText('D2 MUSEUM  ·  '+a.no,22,42);
    g.fillStyle='#1c1814';g.font='30px Georgia';wrapText(g,a.theme,22,92,w-44,36);
    g.fillStyle='#6b6456';g.font='19px Georgia';g.fillText('Press E to explore',22,h-24);
  });
  t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
  var g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;root.add(g);
  mesh(new THREE.CylinderGeometry(0.012,0.012,0.98,6),M.brass,0,0.49,0,g);
  mesh(new THREE.CylinderGeometry(0.11,0.13,0.025,16),M.brass,0,0.012,0,g);
  var p=mesh(box(0.36,0.24,0.012),M.brass,0,1.02,0,g);p.rotation.x=-0.55;
  var f=mesh(placardGeo,std({map:t,roughness:0.6}),0,1.024,0.006,g,true);f.rotation.x=-0.55;f.position.y=1.0235;f.position.z=0.0075;
}
function glowMat(o){var m=std(o);m.emissive=new THREE.Color(0xffc56e);m.emissiveIntensity=0;return m;}

var BUILDERS={
  audioStation:function(a,root,room){
    var g=new THREE.Group();g.position.set(a.pos[0],0,a.pos[2]);g.rotation.y=a.ry;root.add(g);
    var m1=glowMat({map:T.woodMid,roughness:0.45}),m2=glowMat({map:T.woodDark,roughness:0.4});
    mesh(box(0.5,0.95,0.42),m1,0,0.475,0,g);mesh(box(0.58,0.05,0.5),M.woodDark,0,0.975,0,g);
    mesh(box(0.42,0.3,0.22),m2,0,1.15,-0.03,g);
    var gr=tex(128,128,function(c,w,h){c.fillStyle='#2a2118';c.fillRect(0,0,w,h);c.fillStyle='#b08a45';for(var i=6;i<w;i+=10)for(var j=6;j<h;j+=10){c.beginPath();c.arc(i,j,2.4,0,7);c.fill();}});
    var grille=mesh(new THREE.CircleGeometry(0.105,28),std({map:gr,roughness:0.4,metalness:0.5}),-0.07,1.15,0.082,g,true);
    mesh(new THREE.TorusGeometry(0.108,0.012,8,28),M.brass,-0.07,1.15,0.082,g,true);
    [1.21,1.12].forEach(function(y){var k=mesh(new THREE.CylinderGeometry(0.022,0.022,0.03,14),M.brass,0.13,y,0.09,g,true);k.rotation.x=Math.PI/2;});
    var led=mesh(new THREE.SphereGeometry(0.012,8,8),new THREE.MeshBasicMaterial({color:new THREE.Color(3,1.6,0.4)}),0.13,1.05,0.085,g,true);
    var hp=new THREE.Group();hp.position.set(0,1.42,-0.03);g.add(hp);
    mesh(new THREE.TorusGeometry(0.1,0.011,8,24,Math.PI),M.black,0,0,0,hp);
    [-0.1,0.1].forEach(function(x){var c=mesh(new THREE.CylinderGeometry(0.045,0.045,0.035,16),M.black,x,-0.02,0,hp);c.rotation.z=Math.PI/2;});
    mesh(box(0.02,0.12,0.02),M.brass,0,1.36,-0.03,g);
    room.addBox(a.pos[0],a.pos[2],0.26,0.3);
    placard(a,a.pos[0]-0.15,a.pos[2]+0.75,-Math.PI/2+0.35,root);
    return [m1,m2];
  },
  letter:function(a,root,room){
    var lt=tex(420,600,function(g,w,h){
      g.fillStyle='#f2e9d3';g.fillRect(0,0,w,h);speckle(g,w,h,900,91,'140,110,60',0.06,2);
      g.fillStyle='#2b2a45';g.font='italic 21px "Segoe Script","Bradley Hand","Brush Script MT",cursive';wrapText(g,LETTER_TEXT,34,56,w-64,27);
    });lt.wrapS=lt.wrapT=THREE.ClampToEdgeWrapping;
    var m1=glowMat({map:lt,roughness:0.8}),m2=glowMat({color:0xe9dfc6,roughness:0.8});
    var p=mesh(new THREE.PlaneGeometry(0.3,0.42),m1,a.pos[0],0.774,a.pos[2],root);p.rotation.x=-Math.PI/2;p.rotation.z=Math.PI/2+0.12;
    var e=mesh(box(0.24,0.004,0.12),m2,a.pos[0]+0.28,0.774,a.pos[2]+0.33,root);e.rotation.y=0.5;
    var pen=mesh(new THREE.CylinderGeometry(0.006,0.006,0.15,8),M.black,a.pos[0]+0.02,0.778,a.pos[2]-0.3,root);pen.rotation.z=Math.PI/2;pen.rotation.y=0.3;
    var st=mesh(box(0.16,0.07,0.01),M.brass,a.pos[0]-0.3,0.81,a.pos[2]-0.3,root);st.rotation.y=Math.PI/2;
    return [m1,m2];
  },
  displayCase:function(a,root,room){
    var g=new THREE.Group();g.position.set(a.pos[0],0,a.pos[2]);root.add(g);
    var m1=glowMat({map:T.woodDark,roughness:0.45});
    mesh(box(1.3,0.86,0.7),m1,0,0.43,0,g);mesh(box(1.38,0.05,0.78),M.woodDark,0,0.885,0,g);
    mesh(box(1.24,0.01,0.64),std({color:0x24382c,roughness:1}),0,0.915,0,g);
    var glass=mesh(box(1.26,0.46,0.66),std({color:0xffffff,roughness:0.04,metalness:0,transparent:true,opacity:0.14,envMapIntensity:2.2,depthWrite:false}),0,1.14,0,g,true);
    var eg=new THREE.LineSegments(new THREE.EdgesGeometry(box(1.26,0.46,0.66)),new THREE.LineBasicMaterial({color:0xb08a45}));eg.position.set(0,1.14,0);g.add(eg);
    function card(label,sub,c1,c2,draw){return tex(300,200,function(c,w,h){
      var gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,c1);gr.addColorStop(1,c2);c.fillStyle=gr;c.fillRect(0,0,w,h);draw(c,w,h);
      c.fillStyle='rgba(255,255,255,0.92)';c.font='26px Georgia';c.fillText(label,16,h-40);c.font='15px Georgia';c.fillText(sub,16,h-16);
      c.strokeStyle='rgba(255,255,255,0.8)';c.lineWidth=5;c.strokeRect(3,3,w-6,h-6);});}
    var c1=card('Durham','First day, 9:10 a.m.','#2f4d8f','#17264a',function(c,w,h){c.fillStyle='rgba(215,205,185,0.9)';for(var i=0;i<3;i++){var x=70+i*70;c.beginPath();c.moveTo(x-22,120);c.lineTo(x-22,70);c.quadraticCurveTo(x-22,40,x,24);c.quadraticCurveTo(x+22,40,x+22,70);c.lineTo(x+22,120);c.fill();}});
    var c2=card('Kunshan','First day, 9:10 p.m.','#1f6f68','#0f2f3a',function(c,w,h){c.strokeStyle='rgba(235,225,200,0.9)';c.lineWidth=9;c.beginPath();c.moveTo(30,105);c.quadraticCurveTo(150,20,270,105);c.stroke();c.fillStyle='rgba(255,220,140,0.9)';[80,150,220].forEach(function(x){c.beginPath();c.arc(x,118,5,0,7);c.fill();});});
    [c1,c2].forEach(function(t,i){t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
      var p=mesh(new THREE.PlaneGeometry(0.36,0.24),std({map:t,roughness:0.6}),i?0.3:-0.3,1.03,-0.06,g,true);p.rotation.x=-0.5;p.rotation.y=i?-0.18:0.18;});
    [[-0.38,0x3a5fb0],[0.38,0x2a8a78]].forEach(function(o){
      var tag=mesh(box(0.09,0.008,0.15),std({color:o[1],roughness:0.6}),o[0],0.926,0.2,g,true);tag.rotation.y=o[0]*1.4;});
    mesh(new THREE.CylinderGeometry(0.035,0.03,0.06,16),std({color:0xf1ede4,roughness:0.3}),0,0.95,0.16,g,true);
    room.addBox(a.pos[0],a.pos[2],0.7,0.4);
    placard(a,a.pos[0]+1.05,a.pos[2]+0.35,-0.3,root);
    return [m1];
  },
  frames:function(a,root,room){
    var wg=room.walls.west.g,mats=[];
    [4.55,3.8,3.05].forEach(function(u,i){
      var fm=glowMat({color:0x2a1d12,roughness:0.4});mats.push(fm);
      mesh(box(0.66,0.51,0.05),fm,u,1.6,0.05,wg);
      mesh(box(0.6,0.45,0.012),std({color:0xf1ead8,roughness:0.9}),u,1.6,0.074,wg,true);
      var pm=glowMat({map:FOOD[i],roughness:0.5});mats.push(pm);
      mesh(new THREE.PlaneGeometry(0.48,0.36),pm,u,1.6,0.082,wg,true);
    });
    mesh(box(1.9,0.03,0.07),M.brass,3.8,2.12,0.12,wg,true);
    placard(a,-4.75,-2.95,Math.PI/2-0.3,root);
    return mats;
  },
  lectern:function(a,root,room){
    var g=new THREE.Group();g.position.set(a.pos[0],0,a.pos[2]);g.rotation.y=a.ry;root.add(g);
    var m1=glowMat({map:T.woodDark,roughness:0.45});
    mesh(box(0.5,0.06,0.42),m1,0,0.03,0,g);mesh(box(0.14,1.0,0.14),m1,0,0.53,0,g);
    var top=new THREE.Group();top.position.set(0,1.06,0.02);top.rotation.x=0.42;g.add(top);
    mesh(box(0.66,0.04,0.48),m1,0,0,0,top);mesh(box(0.66,0.04,0.03),m1,0,0.035,0.225,top);
    var pg=tex(512,340,function(c,w,h){
      c.fillStyle='#f3ecd9';c.fillRect(0,0,w,h);var gr=c.createLinearGradient(w/2-40,0,w/2+40,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(0.5,'rgba(0,0,0,0.28)');gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.fillRect(w/2-40,0,80,h);
      c.fillStyle='#8a6a2c';c.font='16px Georgia';c.fillText('QUESTIONS',28,34);c.fillText('ANSWERS',w/2+28,34);
      c.fillStyle='#2b2a45';c.font='italic 15px Georgia';
      var y=64;ARTIFACTS[4].media.items.forEach(function(it){var y2=wrapText(c,it.q,28,y,w/2-60,19);wrapText(c,it.a,w/2+28,y,w/2-60,19);y=Math.max(y2,y+64)+8;});
    });pg.wrapS=pg.wrapT=THREE.ClampToEdgeWrapping;
    var m2=glowMat({map:pg,roughness:0.8});
    mesh(box(0.56,0.035,0.37),std({color:0x3a1f12,roughness:0.6}),0,0.036,-0.01,top);
    var pgs=mesh(new THREE.PlaneGeometry(0.53,0.35),m2,0,0.056,-0.01,top,true);pgs.rotation.x=-Math.PI/2;
    var rb=mesh(box(0.012,0.002,0.42),std({color:0x8a1f1f,roughness:0.7}),0.02,0.058,0.02,top,true);
    room.addBox(a.pos[0],a.pos[2],0.3,0.36);
    placard(a,a.pos[0]+0.15,a.pos[2]-0.8,Math.PI/2-0.4,root);
    return [m1,m2];
  },
  screen:function(a,root,room){
    var wg=room.walls.east.g,u=a.pos[2];
    var m1=glowMat({color:0x1a120c,roughness:0.4});
    mesh(box(1.56,1.0,0.07),m1,u,1.45,0.54,wg);
    var cv=document.createElement('canvas');cv.width=560;cv.height=340;
    var st=new THREE.CanvasTexture(cv);st.encoding=THREE.sRGBEncoding;st.anisotropy=MAXAN;
    var c=cv.getContext('2d');
    function draw(t){
      var w=cv.width,h=cv.height,gr=c.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#0f1a2e');gr.addColorStop(1,'#0c2a2a');c.fillStyle=gr;c.fillRect(0,0,w,h);
      c.fillStyle='#cfa95e';c.font='15px Georgia';c.fillText('D2 MUSEUM  ·  06  ·  MEDIA AND MUSIC',28,40);
      c.fillStyle='#efe8d8';c.font='30px Georgia';c.fillText('A Playlist for the',28,84);c.fillText('Time Difference',28,120);
      for(var i=0;i<44;i++){var v=0.25+0.75*Math.abs(Math.sin(i*0.55+t*1.6)*Math.cos(i*0.21-t*0.9));
        c.fillStyle=i<22?'rgba(143,169,230,0.9)':'rgba(134,205,182,0.9)';c.fillRect(28+i*11.6,250-v*88,7,v*88);}
      c.fillStyle='#a8a294';c.font='15px Georgia';c.fillText('Durham',28,280);c.fillText('Kunshan',w-92,280);
      c.fillStyle='#efe8d8';c.font='16px Georgia';c.fillText('Press E to listen',28,314);
    }
    draw(0);
    var scr=mesh(new THREE.PlaneGeometry(1.44,0.875),new THREE.MeshBasicMaterial({map:st,color:new THREE.Color(1.25,1.25,1.25)}),u,1.45,0.578,wg,true);
    var acc=0;
    a.update=function(t,dt,dist){acc+=dt;if(dist<9&&acc>0.12&&!REDUCED){acc=0;draw(t);st.needsUpdate=true;}};
    placard(a,4.25,a.pos[2]+1.15,-Math.PI/2+0.3,root);
    return [m1];
  }
};

/* ============================================================
   Build scene
   ============================================================ */
var room=buildGothicReadingRoom(world);
ARTIFACTS.forEach(function(a){a.glow=BUILDERS[a.build](a,world,room);a.found=false;a.heat=0;});
if(!BUILDERS.letter.placed){placard(ARTIFACTS[1],0.78,9.75,-0.9,world);room.addBox(0.78,9.75,0.1,0.1);}
var focusLight=new THREE.PointLight(0xffd9a0,0,4.5,2);world.add(focusLight);

/* Environment map: a small painted panorama of the room (cream vault, window wall to the east,
   wood and parquet below) so polished surfaces pick up believable reflections. */
(function(){
  var e=tex(512,256,function(g,w,h){
    var gr=g.createLinearGradient(0,0,0,h);
    gr.addColorStop(0,'#5a4630');gr.addColorStop(0.2,'#a8956c');gr.addColorStop(0.36,'#b9a987');gr.addColorStop(0.47,'#3b2517');gr.addColorStop(0.56,'#3b2517');gr.addColorStop(0.62,'#6b4526');gr.addColorStop(1,'#7a4f2a');
    g.fillStyle=gr;g.fillRect(0,0,w,h);
    g.fillStyle='#fff8e6';
    for(var i=0;i<12;i++){var x=w*0.5+(i-5.5)*w*0.031;g.fillRect(x-4,h*0.3,8,h*0.14);}
    g.fillRect(w*0.25-12,h*0.24,24,h*0.2);
    g.fillStyle='rgba(255,214,150,0.9)';[0.12,0.5,0.88].forEach(function(u){g.beginPath();g.ellipse(w*u,h*0.12,16,7,0,0,7);g.fill();});
    g.fillStyle='rgba(255,236,190,0.35)';g.fillRect(w*0.36,h*0.7,w*0.28,h*0.16);
  });
  e.wrapS=e.wrapT=THREE.ClampToEdgeWrapping;e.mapping=THREE.EquirectangularReflectionMapping;
  scene.environment=e;
})();
renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;

/* ============================================================
   Audio: ambience, footsteps, generated music, speech
   ============================================================ */
var Sound={ctx:null,master:null,muted:false,noise:null,track:null,timer:null,
  init:function(){
    if(this.ctx)return;
    try{
      var C=window.AudioContext||window.webkitAudioContext;if(!C)return;
      var ctx=this.ctx=new C();this.master=ctx.createGain();this.master.gain.value=this.muted?0:1;this.master.connect(ctx.destination);
      var len=ctx.sampleRate*2,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0),last=0;
      for(var i=0;i<len;i++){var w=Math.random()*2-1;last=(last+0.02*w)/1.02;d[i]=last*3.5;}
      var wb=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),wd=wb.getChannelData(0);for(i=0;i<wd.length;i++)wd[i]=Math.random()*2-1;
      this.noise=wb;
      var src=ctx.createBufferSource();src.buffer=buf;src.loop=true;
      var lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=320;
      var g=ctx.createGain();g.gain.value=0.07;src.connect(lp);lp.connect(g);g.connect(this.master);src.start();
      this.schedule();
    }catch(e){this.ctx=null;}
  },
  resume:function(){if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume().catch(function(){});},
  setMuted:function(m){this.muted=m;if(this.master)this.master.gain.value=m?0:1;if(m)Speech.stop();},
  burst:function(freq,q,gain,dur,type,pos){
    var ctx=this.ctx;if(!ctx||!this.noise)return;
    var s=ctx.createBufferSource();s.buffer=this.noise;s.playbackRate.value=0.8+Math.random()*0.4;
    var f=ctx.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;
    var g=ctx.createGain(),t=ctx.currentTime;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+0.03);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(f);f.connect(g);
    if(pos){var p=ctx.createPanner();p.panningModel='equalpower';p.distanceModel='inverse';p.refDistance=2.5;p.rolloffFactor=1.2;
      if(p.positionX){p.positionX.value=pos[0];p.positionY.value=pos[1];p.positionZ.value=pos[2];}else p.setPosition(pos[0],pos[1],pos[2]);
      g.connect(p);p.connect(this.master);}else g.connect(this.master);
    s.start(t,Math.random()*0.5,dur+0.05);
  },
  schedule:function(){
    var self=this;clearTimeout(this.timer);
    this.timer=setTimeout(function(){
      if(game.state==='playing'||game.state==='panel'){
        var tb=room.tables[Math.floor(Math.random()*room.tables.length)],p=[tb.x+(Math.random()-0.5),0.8,tb.z];
        if(Math.random()<0.7)self.burst(3200,0.8,0.5,0.32,'bandpass',p);else self.burst(160,1.2,0.6,0.2,'lowpass',p);
      }
      self.schedule();
    },5000+Math.random()*9000);
  },
  step:function(){this.burst(380,0.7,0.16,0.11,'lowpass',null);},
  listener:function(pos,fx,fz){
    var ctx=this.ctx;if(!ctx)return;var l=ctx.listener;
    if(l.positionX){l.positionX.value=pos.x;l.positionY.value=pos.y;l.positionZ.value=pos.z;l.forwardX.value=fx;l.forwardY.value=0;l.forwardZ.value=fz;l.upX.value=0;l.upY.value=1;l.upZ.value=0;}
    else if(l.setPosition){l.setPosition(pos.x,pos.y,pos.z);l.setOrientation(fx,0,fz,0,1,0);}
  },
  TRACKS:[
    {bpm:76,wave:'sine',over:2.76,decay:2.4,notes:[[62,2],[66,2],[69,2],[74,4],[73,2],[69,2],[66,2],[62,4]]},
    {bpm:96,wave:'triangle',over:2,decay:0.9,notes:[[69,1],[72,1],[74,1],[76,2],[74,1],[72,1],[69,2],[67,1],[69,1],[72,2],[69,3]]},
    {bpm:88,wave:'triangle',over:2,decay:1.2,echo:true,notes:[[64,1],[67,1],[71,2],[69,1],[67,1],[64,2],[62,1],[64,1],[67,2],[64,4]]}
  ],
  playTrack:function(i,onend){
    this.stopTrack();var ctx=this.ctx;if(!ctx)return false;
    var tr=this.TRACKS[i],out=ctx.createGain();out.gain.value=0.5;out.connect(this.master);
    var beat=60/tr.bpm,t=ctx.currentTime+0.08,nodes=[];
    function note(midi,at,dur,wave,gain){
      var f=440*Math.pow(2,(midi-69)/12);
      [[f,gain],[f*tr.over,gain*0.22]].forEach(function(o){
        var osc=ctx.createOscillator(),g=ctx.createGain();osc.type=wave;osc.frequency.value=o[0];
        g.gain.setValueAtTime(0.0001,at);g.gain.exponentialRampToValueAtTime(o[1],at+0.012);g.gain.exponentialRampToValueAtTime(0.0001,at+dur*tr.decay+0.3);
        osc.connect(g);g.connect(out);osc.start(at);osc.stop(at+dur*tr.decay+0.35);nodes.push(osc);
      });
    }
    for(var rpt=0;rpt<2;rpt++)tr.notes.forEach(function(n){
      note(n[0],t,n[1]*beat,tr.wave,0.22);
      if(tr.echo)note(n[0]-12,t+beat*0.5,n[1]*beat,'sine',0.16);
      t+=n[1]*beat;
    });
    var self=this,total=(t-ctx.currentTime)+1.2;
    this.track={out:out,nodes:nodes,to:setTimeout(function(){self.track=null;if(onend)onend();},total*1000)};
    return true;
  },
  stopTrack:function(){
    if(!this.track)return;var tk=this.track;this.track=null;clearTimeout(tk.to);
    try{tk.out.gain.setTargetAtTime(0,this.ctx.currentTime,0.05);}catch(e){}
    setTimeout(function(){tk.nodes.forEach(function(n){try{n.stop();}catch(e){}});try{tk.out.disconnect();}catch(e){}},300);
  }
};
var Speech={
  ok:('speechSynthesis' in window)&&typeof window.SpeechSynthesisUtterance==='function',
  speak:function(parts,onend){
    if(!this.ok||Sound.muted)return false;
    try{
      window.speechSynthesis.cancel();
      parts.forEach(function(p,i){
        var u=new SpeechSynthesisUtterance(p.text);u.rate=0.94;u.pitch=p.pitch||1;u.lang='en-US';
        if(i===parts.length-1){u.onend=function(){if(onend)onend();};u.onerror=function(){if(onend)onend(true);};}
        window.speechSynthesis.speak(u);
      });
      return true;
    }catch(e){return false;}
  },
  pause:function(){try{window.speechSynthesis.pause();}catch(e){}},
  resume:function(){try{window.speechSynthesis.resume();}catch(e){}},
  stop:function(){if(!this.ok)return;try{window.speechSynthesis.cancel();}catch(e){}}
};

/* ============================================================
   Game state, input and movement
   ============================================================ */
var game={state:'start',lockMode:true,everLocked:false,found:0,focus:null,open:null};
var player={x:0,z:0,yaw:0,pitch:0,vx:0,vz:0,bob:0,stride:0,eye:1.66,r:0.32};
var keys={};
function resetPlayer(){var s=room.spawn;player.x=s.x;player.z=s.z;player.yaw=s.yaw;player.pitch=s.pitch;player.vx=player.vz=0;player.bob=0;player.stride=0;}
resetPlayer();

function blocked(x,z){
  var b=room.bounds,r=player.r;
  if(x<b.x0+r||x>b.x1-r||z<b.z0+r||z>b.z1-r)return true;
  for(var i=0;i<room.colliders.length;i++){
    var c=room.colliders[i],nx=Math.max(c.x0,Math.min(x,c.x1)),nz=Math.max(c.z0,Math.min(z,c.z1)),dx=x-nx,dz=z-nz;
    if(dx*dx+dz*dz<r*r)return true;
  }
  return false;
}
function movePlayer(dt){
  var f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
  var s=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
  if(game.state!=='playing'){f=0;s=0;}
  var speed=(keys.ShiftLeft||keys.ShiftRight)?2.45:1.55,len=Math.hypot(f,s)||1;
  var sin=Math.sin(player.yaw),cos=Math.cos(player.yaw);
  var tx=(-sin*f+cos*s)/len*speed,tz=(-cos*f-sin*s)/len*speed;
  var k=1-Math.exp(-((f||s)?9:11)*Math.min(dt,0.1));
  player.vx+=(tx-player.vx)*k;player.vz+=(tz-player.vz)*k;
  var steps=Math.max(1,Math.ceil(dt/0.034)),h=dt/steps;
  for(var i=0;i<steps;i++){
    var nx=player.x+player.vx*h,nz=player.z+player.vz*h;
    if(!blocked(nx,player.z))player.x=nx;else player.vx=0;
    if(!blocked(player.x,nz))player.z=nz;else player.vz=0;
  }
  var v=Math.hypot(player.vx,player.vz);
  if(v>0.2){player.stride+=v*dt;player.bob+=v*dt*4.4;if(player.stride>0.72){player.stride=0;Sound.step();}}
  var bob=REDUCED?0:Math.sin(player.bob)*0.018*Math.min(1,v/1.5);
  camera.position.set(player.x,player.eye+bob,player.z);
  camera.rotation.set(player.pitch,player.yaw,0);
}
function look(dx,dy){
  player.yaw-=dx*0.0022;player.pitch-=dy*0.0022;
  player.pitch=Math.max(-1.45,Math.min(1.45,player.pitch));
}

/* Pointer lock, with drag-to-look when the browser refuses it */
function useDragMode(){
  game.lockMode=false;$('lookHint').textContent='Click and drag to look around';canvas.style.cursor='grab';
}
function requestLock(){
  if(!game.lockMode)return;
  var fail=function(){if(game.everLocked){if(game.state==='playing')pause();}else useDragMode();};
  try{
    if(!canvas.requestPointerLock){useDragMode();return;}
    var p=canvas.requestPointerLock();if(p&&p.catch)p.catch(fail);
  }catch(e){fail();}
}
document.addEventListener('pointerlockerror',function(){if(game.everLocked){if(game.state==='playing')pause();}else useDragMode();});
document.addEventListener('pointerlockchange',function(){
  if(document.pointerLockElement===canvas){game.everLocked=true;}
  else if(game.lockMode&&game.state==='playing')pause();
});
var dragging=false;
canvas.addEventListener('mousedown',function(){
  if(game.state!=='playing')return;
  if(game.lockMode&&document.pointerLockElement!==canvas)requestLock();
  dragging=true;if(!game.lockMode)canvas.style.cursor='grabbing';
});
window.addEventListener('mouseup',function(){dragging=false;if(!game.lockMode)canvas.style.cursor='grab';});
document.addEventListener('mousemove',function(e){
  if(game.state!=='playing')return;
  if(document.pointerLockElement===canvas)look(e.movementX||0,e.movementY||0);
  else if(dragging)look(-(e.movementX||0)*1.4,-(e.movementY||0)*1.4);
});

var MOVE={KeyW:1,KeyA:1,KeyS:1,KeyD:1,ArrowUp:1,ArrowDown:1,ArrowLeft:1,ArrowRight:1,ShiftLeft:1,ShiftRight:1,Space:1};
window.addEventListener('keydown',function(e){
  if(game.state==='start'){return;}
  if(MOVE[e.code]&&game.state==='playing')e.preventDefault();
  keys[e.code]=true;
  if(e.repeat)return;
  if(e.code==='KeyE'){
    if(game.state==='playing'&&game.focus)openPanel(game.focus);
    else if(game.state==='panel')closePanel();
  }else if(e.code==='Escape'){
    if(game.state==='panel')closePanel();
    else if(game.state==='playing'&&document.pointerLockElement!==canvas)pause();
  }else if(e.code==='KeyM'){
    Sound.setMuted(!Sound.muted);toast(Sound.muted?'Sound off':'Sound on',1400);
  }
});
window.addEventListener('keyup',function(e){keys[e.code]=false;});
window.addEventListener('blur',function(){keys={};});

/* ============================================================
   Interface
   ============================================================ */
var pips=$('pips');ARTIFACTS.forEach(function(){pips.appendChild(document.createElement('i'));});
function updateCounter(){
  $('count').textContent=game.found+' / '+ARTIFACTS.length;
  Array.prototype.forEach.call(pips.children,function(el,i){el.className=ARTIFACTS[i].found?'on':'';});
  $('pauseCount').textContent=game.found+' of '+ARTIFACTS.length+' artifacts discovered';
}
var toastT;
function toast(msg,ms){var t=$('toast');t.textContent=msg;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('on');},ms||3200);}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

function renderMedia(a){
  var m=a.media,h='';
  if(m.type==='speech'){
    h+='<div class="card"><h3>Recording</h3><div class="row"><button class="btn small" data-act="speak">'+esc(m.label)+'</button><button class="btn ghost small" data-act="stop">Stop</button></div><div class="status" id="mStatus">'+(Speech.ok?'Read aloud by your browser’s voice.':'This browser cannot read aloud, so the transcript is below.')+'</div></div>';
    h+='<div><div class="eyebrow">Transcript</div><p>'+esc(m.parts.map(function(p){return p.text;}).join(' '))+'</p></div>';
  }else if(m.type==='letter'){
    h+='<div class="letter">'+esc(m.text)+'</div>';
  }else if(m.type==='capsule'){
    h+='<div><div class="eyebrow">Shared motifs</div><div class="chips" style="margin-top:.5rem">'+m.motifs.map(function(x){return '<span>'+esc(x)+'</span>';}).join('')+'</div></div>';
    m.sides.forEach(function(s,i){h+='<div class="card"><h3 class="'+s.cls+'">'+esc(s.place)+'</h3><div class="fine">'+esc(s.who)+', fictional</div><p>'+esc(s.text)+'</p><div class="row"><button class="btn ghost small" data-act="side" data-i="'+i+'">Listen</button></div></div>';});
    h+='<div class="row"><button class="btn ghost small" data-act="stop">Stop audio</button><span class="status" id="mStatus"></span></div>';
  }else if(m.type==='gallery'){
    h+='<div class="gallery">'+m.items.map(function(it,i){
      return '<figure><img alt="Illustrated placeholder for '+esc(it.title)+'" src="'+FOOD[i]._cv.toDataURL('image/jpeg',0.85)+'"><figcaption><b>'+esc(it.title)+'</b><span class="fine '+it.cls+'">'+esc(it.from)+'</span><p>'+esc(it.text)+'</p></figcaption></figure>';
    }).join('')+'</div>';
  }else if(m.type==='qa'){
    h+='<div class="qa">'+m.items.map(function(it){
      return '<div><small class="'+it.qc+'">'+esc(it.qf)+'</small><div class="q">'+esc(it.q)+'</div><div class="a"><small class="'+it.ac+'">'+esc(it.af)+'</small><div>'+esc(it.a)+'</div></div></div>';
    }).join('')+'</div>';
  }else if(m.type==='tracks'){
    h+=m.items.map(function(it,i){
      return '<div class="card"><div class="track"><button class="btn small" data-act="track" data-i="'+i+'">Play</button><div class="t"><b>'+esc(it.title)+'</b><span class="'+it.cls+'">'+esc(it.from)+'</span></div></div><p class="fine">'+esc(it.text)+'</p></div>';
    }).join('');
    h+='<div class="status" id="mStatus">'+(Sound.muted?'Sound is muted. Press M to turn it on.':'')+'</div>';
  }
  return h;
}
function stopMedia(){
  Speech.stop();Sound.stopTrack();
  Array.prototype.forEach.call(document.querySelectorAll('#pBody [data-act="track"]'),function(b){b.textContent='Play';});
}
$('pBody').addEventListener('click',function(e){
  var b=e.target.closest('[data-act]');if(!b||!game.open)return;
  var m=game.open.media,st=$('mStatus'),act=b.getAttribute('data-act'),i=+b.getAttribute('data-i');
  Sound.resume();
  function say(parts){
    stopMedia();
    if(Sound.muted){if(st)st.textContent='Sound is muted. Press M to turn it on.';return;}
    var ok=Speech.speak(parts,function(){if(st)st.textContent='Finished.';});
    if(st)st.textContent=ok?'Playing…':'This browser cannot read aloud. The text is on this panel.';
  }
  if(act==='speak')say(m.parts);
  else if(act==='side')say([m.sides[i]]);
  else if(act==='stop'){stopMedia();if(st)st.textContent='Stopped.';}
  else if(act==='track'){
    var playing=b.textContent==='Stop';stopMedia();
    if(playing)return;
    if(Sound.muted){if(st)st.textContent='Sound is muted. Press M to turn it on.';return;}
    if(Sound.playTrack(i,function(){b.textContent='Play';})){b.textContent='Stop';if(st)st.textContent='';}
    else if(st)st.textContent='This browser could not start audio.';
  }
});

function openPanel(a){
  game.state='panel';game.open=a;keys={};
  if(!a.found){a.found=true;game.found++;updateCounter();if(game.found===ARTIFACTS.length)setTimeout(function(){toast('All six artifacts discovered',5000);},600);}
  $('pEyebrow').textContent='Artifact '+a.no+'  ·  '+a.theme;
  $('pTitle').textContent=a.title;
  $('pMeta').innerHTML='<dt>Origin</dt><dd>'+esc(a.origin)+'</dd><dt>Theme</dt><dd>'+esc(a.theme)+'</dd><dt>Display</dt><dd>'+esc(a.format)+'</dd>';
  $('pBody').innerHTML='<p>'+esc(a.description)+'</p>'+renderMedia(a);
  $('pBody').scrollTop=0;$('pFoot').textContent=a.no+' of 0'+ARTIFACTS.length;
  $('panel').classList.add('open');$('panel').setAttribute('aria-hidden','false');
  $('prompt').classList.remove('on');$('cross').style.opacity=0;
  if(document.pointerLockElement===canvas)document.exitPointerLock();
}
function closePanel(){
  if(game.state!=='panel')return;
  stopMedia();game.open=null;game.state='playing';
  $('panel').classList.remove('open');$('panel').setAttribute('aria-hidden','true');$('cross').style.opacity=1;
  canvas.focus();requestLock();
}
$('pClose').addEventListener('click',closePanel);

function pause(){
  if(game.state!=='playing')return;
  game.state='paused';keys={};$('pause').hidden=false;updateCounter();$('resume').focus();
}
function resume(){
  $('pause').hidden=true;game.state='playing';canvas.focus();Sound.resume();requestLock();
}
$('resume').addEventListener('click',resume);
$('restart').addEventListener('click',function(){
  ARTIFACTS.forEach(function(a){a.found=false;});game.found=0;updateCounter();resetPlayer();resume();
  toast('The room has been reset',2200);
});
$('enter').addEventListener('click',function(){
  $('start').hidden=true;$('hud').hidden=false;game.state='playing';resetPlayer();
  Sound.init();Sound.resume();canvas.focus();requestLock();
  setTimeout(function(){$('tutorial').classList.add('off');},14000);
});
updateCounter();

/* ============================================================
   Artifact focus and highlight
   ============================================================ */
function updateFocus(t,dt){
  var best=null,bs=0,fx=-Math.sin(player.yaw),fz=-Math.cos(player.yaw);
  ARTIFACTS.forEach(function(a){
    var dx=a.pos[0]-player.x,dz=a.pos[2]-player.z,d=Math.hypot(dx,dz);a.dist=d;
    if(a.update)a.update(t,dt,d);
    if(game.state!=='playing'||d>a.radius)return;
    var dot=d<0.5?1:(dx*fx+dz*fz)/d;if(dot<0.5)return;
    var s=dot*2-d/a.radius;if(!best||s>bs){best=a;bs=s;}
  });
  if(game.state==='panel')best=game.open;
  game.focus=game.state==='playing'?best:null;
  ARTIFACTS.forEach(function(a){
    var target=a===best?1:0;a.heat+=(target-a.heat)*(1-Math.exp(-6*dt));
    var e=a.heat*(0.06+0.025*Math.sin(t*3.2));
    a.glow.forEach(function(m){m.emissiveIntensity=e;});
  });
  if(best){
    var k=0.55/Math.max(0.6,best.dist);
    focusLight.position.set(best.pos[0]+(player.x-best.pos[0])*k,best.pos[1]+0.75,best.pos[2]+(player.z-best.pos[2])*k);
  }
  focusLight.intensity+=((best?0.45:0)-focusLight.intensity)*(1-Math.exp(-5*dt));
  var on=!!game.focus;
  $('prompt').classList.toggle('on',on);$('cross').classList.toggle('hot',on);
  if(on)$('promptTheme').textContent=game.focus.theme+(game.focus.found?'  ·  visited':'');
}

/* ============================================================
   Loop
   ============================================================ */
function resize(){
  var w=window.innerWidth,h=window.innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}
window.addEventListener('resize',resize);resize();
var last=performance.now(),time=0,expo=1;
function frame(now){
  var dt=Math.min(0.25,(now-last)/1000);last=now;time+=dt;
  if(game.state==='start'){
    camera.position.set(0.4+Math.sin(time*0.11)*0.5,1.72,15.4);
    camera.rotation.set(0.07,Math.sin(time*0.08)*0.16-0.03,0);
  }else if(game.state!=='paused'){
    movePlayer(dt);
    Sound.listener(camera.position,-Math.sin(player.yaw),-Math.cos(player.yaw));
  }
  if(game.state!=='paused'){
    room.update(time,dt);updateFocus(time,dt);
    var near=Math.max(0,Math.min(1,(camera.position.x+3)/7.5));
    expo+=((0.96+0.16*near)-expo)*(1-Math.exp(-1.5*dt));renderer.toneMappingExposure=expo;
  }
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* Hook for automated checks */
window.__d2={scene:scene,world:world,camera:camera,game:game,player:player,room:room,artifacts:ARTIFACTS,renderer:renderer,blocked:blocked,
  teleport:function(x,z,yaw,pitch){player.x=x;player.z=z;player.yaw=yaw||0;player.pitch=pitch||0;player.vx=player.vz=0;}};
})();
</script>
</body>
</html>
