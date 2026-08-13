#!/usr/bin/env node
/* Genererar syntetiska bostadsbilder med KÄND rumstyp, så att bildanalysen
   och regissören kan verifieras mot facit. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'test-photos');

const DRAW = `
function px(g,w,h,amount){ // korn så kantdetektorn har något att bita i
  const img=g.getImageData(0,0,w,h),d=img.data;
  for(let i=0;i<d.length;i+=4){const n=(Math.random()-0.5)*amount;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}
  g.putImageData(img,0,0);
}
const SCENES = {
  exterior(g,w,h){
    const sky=g.createLinearGradient(0,0,0,h*0.55);
    sky.addColorStop(0,'#7fb3dd'); sky.addColorStop(1,'#cfe2ef');
    g.fillStyle=sky; g.fillRect(0,0,w,h*0.58);
    g.fillStyle='#5c7a4a'; g.fillRect(0,h*0.58,w,h*0.42);
    g.fillStyle='#e8e3d9'; g.fillRect(w*0.18,h*0.26,w*0.64,h*0.42);
    g.fillStyle='#7d5a44'; g.beginPath(); g.moveTo(w*0.13,h*0.27); g.lineTo(w*0.5,h*0.11); g.lineTo(w*0.87,h*0.27); g.closePath(); g.fill();
    g.fillStyle='#2f3a42';
    for(let i=0;i<4;i++) g.fillRect(w*(0.24+i*0.14),h*0.34,w*0.08,h*0.12);
    g.fillStyle='#4a3b2f'; g.fillRect(w*0.46,h*0.5,w*0.09,h*0.18);
  },
  drone(g,w,h){
    g.fillStyle='#6d8f5e'; g.fillRect(0,0,w,h);
    const sky=g.createLinearGradient(0,0,0,h*0.2); sky.addColorStop(0,'#8fc0e6'); sky.addColorStop(1,'#b9d6e8');
    g.fillStyle=sky; g.fillRect(0,0,w,h*0.2);
    g.fillStyle='#b8b0a2'; g.fillRect(w*0.3,h*0.36,w*0.4,h*0.34);
    g.fillStyle='#8a5f48'; g.fillRect(w*0.3,h*0.36,w*0.4,h*0.1);
    g.strokeStyle='#c8c0b0'; g.lineWidth=3;
    g.beginPath(); g.moveTo(0,h*0.86); g.lineTo(w,h*0.78); g.stroke();
    for(let i=0;i<9;i++){ g.fillStyle='#4d6b3f'; g.beginPath(); g.arc(w*(0.08+i*0.11),h*(0.26+(i%3)*0.2),w*0.032,0,7); g.fill(); }
  },
  livingroom(g,w,h){
    g.fillStyle='#dedad2'; g.fillRect(0,0,w,h);
    g.fillStyle='#a98868'; g.fillRect(0,h*0.68,w,h*0.32);
    for(let i=0;i<16;i++){g.strokeStyle='rgba(70,50,32,.3)';g.lineWidth=2;g.beginPath();g.moveTo(i*w/16,h*0.68);g.lineTo(i*w/16-w*0.09,h);g.stroke();}
    g.fillStyle='#f6f4f0'; g.fillRect(0,h*0.655,w,h*0.03);
    g.fillStyle='#ffffff'; g.fillRect(w*0.62,h*0.16,w*0.3,h*0.42);
    g.fillStyle='#eaf2f7'; g.fillRect(w*0.635,h*0.175,w*0.27,h*0.39);
    g.strokeStyle='#5f6468'; g.lineWidth=4;
    g.beginPath(); g.moveTo(w*0.77,h*0.175); g.lineTo(w*0.77,h*0.565); g.stroke();
    g.fillStyle='#6f7a72'; g.fillRect(w*0.1,h*0.52,w*0.34,h*0.19);
    g.fillStyle='#828d84'; g.fillRect(w*0.1,h*0.49,w*0.34,h*0.05);
    g.fillStyle='#3d4145'; g.fillRect(w*0.3,h*0.2,w*0.16,h*0.14);
  },
  kitchen(g,w,h){
    g.fillStyle='#e9e6e0'; g.fillRect(0,0,w,h);
    g.fillStyle='#2f3336'; g.fillRect(0,h*0.5,w,h*0.06);          // bänkskiva
    g.fillStyle='#c9a276'; g.fillRect(0,h*0.56,w,h*0.28);          // underskåp
    for(let i=0;i<7;i++){g.strokeStyle='#8f7250';g.lineWidth=2;g.strokeRect(i*w/7+3,h*0.57,w/7-6,h*0.26);}
    g.fillStyle='#d8d4cc'; g.fillRect(0,h*0.08,w,h*0.2);           // överskåp
    for(let i=0;i<5;i++){g.strokeStyle='#a8a49c';g.lineWidth=2;g.strokeRect(i*w/5+3,h*0.09,w/5-6,h*0.18);}
    g.fillStyle='#9aa0a4'; g.fillRect(w*0.42,h*0.44,w*0.16,h*0.07);
    g.fillStyle='#8d7250'; g.fillRect(0,h*0.84,w,h*0.16);
  },
  bedroom(g,w,h){
    g.fillStyle='#dcd8d4'; g.fillRect(0,0,w,h);
    g.fillStyle='#b09a82'; g.fillRect(0,h*0.74,w,h*0.26);
    g.fillStyle='#f2efe9'; g.fillRect(w*0.16,h*0.5,w*0.62,h*0.28);  // säng
    g.fillStyle='#e3ded6'; g.fillRect(w*0.16,h*0.46,w*0.62,h*0.07);
    g.fillStyle='#c9c2b6'; g.fillRect(w*0.22,h*0.44,w*0.16,h*0.06);
    g.fillStyle='#c9c2b6'; g.fillRect(w*0.56,h*0.44,w*0.16,h*0.06);
    g.fillStyle='#8b7a68'; g.fillRect(w*0.14,h*0.24,w*0.66,h*0.2);  // sänggavel
    g.fillStyle='#ffffff'; g.fillRect(w*0.84,h*0.2,w*0.13,h*0.4);
  },
  bathroom(g,w,h){
    g.fillStyle='#eceef0'; g.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=h*0.09) { g.strokeStyle='#d3d8dc'; g.lineWidth=2; g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
    for(let x=0;x<w;x+=w*0.07) { g.strokeStyle='#d3d8dc'; g.lineWidth=2; g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); }
    g.fillStyle='#ffffff'; g.fillRect(w*0.1,h*0.5,w*0.3,h*0.22);
    g.fillStyle='#f7f9fa'; g.fillRect(w*0.55,h*0.14,w*0.3,h*0.36);
    g.strokeStyle='#b9c0c6'; g.lineWidth=3; g.strokeRect(w*0.55,h*0.14,w*0.3,h*0.36);
    g.fillStyle='#c4ccd2'; g.fillRect(w*0.22,h*0.36,w*0.06,h*0.14);
  },
  detail(g,w,h){
    g.fillStyle='#cbb79c'; g.fillRect(0,0,w,h);
    g.fillStyle='#2f2a24'; g.beginPath(); g.arc(w*0.5,h*0.52,Math.min(w,h)*0.2,0,7); g.fill();
    g.fillStyle='#8d8578'; g.beginPath(); g.arc(w*0.5,h*0.52,Math.min(w,h)*0.14,0,7); g.fill();
    g.fillStyle='rgba(190,175,150,.75)'; g.fillRect(0,0,w,h*0.14); g.fillRect(0,h*0.86,w,h*0.14);
    g.fillStyle='rgba(190,175,150,.75)'; g.fillRect(0,0,w*0.12,h); g.fillRect(w*0.88,0,w*0.12,h);
  },
  garden(g,w,h){
    g.fillStyle='#5f8348'; g.fillRect(0,0,w,h);
    g.fillStyle='#6f9553'; g.fillRect(0,h*0.4,w,h*0.6);
    for(let i=0;i<26;i++){ g.fillStyle='rgba(50,80,40,.5)'; g.beginPath(); g.arc(Math.random()*w,h*0.4+Math.random()*h*0.6,w*0.02,0,7); g.fill(); }
    g.fillStyle='#9d8a6a'; g.fillRect(w*0.3,h*0.62,w*0.4,h*0.1);
    g.fillStyle='#cfe2ef'; g.fillRect(0,0,w,h*0.16);
  },
};
window.__shoot = function(kind,w,h){
  const c=document.createElement('canvas'); c.width=w; c.height=h;
  const g=c.getContext('2d');
  SCENES[kind](g,w,h);
  px(g,w,h,14);
  return c.toDataURL('image/jpeg',0.9);
};
`;

const SHOTS = [
  ['exterior', 'exterior-front'], ['drone', 'drone-overview'], ['exterior', 'exterior-side'],
  ['livingroom', 'livingroom-1'], ['livingroom', 'livingroom-2'],
  ['kitchen', 'kitchen-1'], ['kitchen', 'kitchen-2'],
  ['bedroom', 'bedroom-1'], ['bedroom', 'bedroom-2'],
  ['bathroom', 'bathroom-1'],
  ['detail', 'detail-1'], ['detail', 'detail-2'],
  ['garden', 'garden-1'],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent('<body></body>');
  await p.addScriptTag({ content: DRAW });
  for (const [kind, name] of SHOTS) {
    const url = await p.evaluate(([k]) => window.__shoot(k, 1600, 1067), [kind]);
    const data = Buffer.from(url.split(',')[1], 'base64');
    fs.writeFileSync(path.join(OUT, `${name}.jpg`), data);
    process.stdout.write(`  ${name}.jpg (${kind}) ${(data.length / 1024).toFixed(0)} KB\n`);
  }
  await b.close();
  fs.writeFileSync(path.join(OUT, 'truth.json'), JSON.stringify(
    SHOTS.map(([kind, name]) => ({ file: name + '.jpg', room: kind })), null, 2));
  console.log(`\n${SHOTS.length} bilder + facit i truth.json`);
})();
