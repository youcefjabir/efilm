#!/usr/bin/env node
/* Genererar syntetiska bostadsbilder med KÄND rumstillhörighet.
   Varje rum fotograferas från TVÅ olika håll: möbler, fönster och
   perspektiv flyttas, medan rummets färgvärld är densamma. Det är precis
   det fall som fällde den gamla regissören — samma rum från en annan
   vinkel ska hamna i samma grupp, inte bli ett annat rum. */
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
// golvbrädor mot en flyktpunkt — vinkeln styr hur rummet upplevs
function floor(g,w,h,y0,vp,col,line){
  g.fillStyle=col; g.fillRect(0,y0,w,h-y0);
  for(let i=0;i<18;i++){
    g.strokeStyle=line; g.lineWidth=2; g.beginPath();
    g.moveTo(i*w/18,y0); g.lineTo(vp + (i*w/18-vp)*2.4, h); g.stroke();
  }
}
const SCENES = {
  // ---- ute ----
  exterior(g,w,h,v){
    const sky=g.createLinearGradient(0,0,0,h*0.55);
    sky.addColorStop(0,'#7fb3dd'); sky.addColorStop(1,'#cfe2ef');
    g.fillStyle=sky; g.fillRect(0,0,w,h*(v?0.52:0.58));
    g.fillStyle='#5c7a4a'; g.fillRect(0,h*(v?0.52:0.58),w,h);
    const x0=v?0.06:0.18, x1=v?0.72:0.82, top=v?0.3:0.26;
    g.fillStyle='#e8e3d9'; g.fillRect(w*x0,h*top,w*(x1-x0),h*0.42);
    g.fillStyle='#7d5a44'; g.beginPath();
    g.moveTo(w*(x0-0.05),h*(top+0.01)); g.lineTo(w*(x0+x1)/2,h*(top-0.15)); g.lineTo(w*(x1+0.05),h*(top+0.01)); g.closePath(); g.fill();
    g.fillStyle='#2f3a42';
    for(let i=0;i<4;i++) g.fillRect(w*(x0+0.06+i*0.14),h*(top+0.08),w*0.08,h*0.12);
    g.fillStyle='#4a3b2f'; g.fillRect(w*(v?0.55:0.46),h*(top+0.24),w*0.09,h*0.18);
    if(v){ g.fillStyle='#4d6b3f'; g.beginPath(); g.arc(w*0.88,h*0.5,w*0.12,0,7); g.fill(); }
  },
  drone(g,w,h,v){
    g.fillStyle='#6d8f5e'; g.fillRect(0,0,w,h);
    const sky=g.createLinearGradient(0,0,0,h*0.2); sky.addColorStop(0,'#8fc0e6'); sky.addColorStop(1,'#b9d6e8');
    g.fillStyle=sky; g.fillRect(0,0,w,h*(v?0.14:0.2));
    g.fillStyle='#b8b0a2'; g.fillRect(w*(v?0.18:0.3),h*(v?0.42:0.36),w*0.4,h*0.34);
    g.fillStyle='#8a5f48'; g.fillRect(w*(v?0.18:0.3),h*(v?0.42:0.36),w*0.4,h*0.1);
    g.strokeStyle='#c8c0b0'; g.lineWidth=3;
    g.beginPath(); g.moveTo(0,h*(v?0.9:0.86)); g.lineTo(w,h*(v?0.72:0.78)); g.stroke();
    for(let i=0;i<9;i++){ g.fillStyle='#4d6b3f'; g.beginPath(); g.arc(w*(0.08+i*0.11),h*(0.26+((i+(v?1:0))%3)*0.2),w*0.032,0,7); g.fill(); }
  },
  garden(g,w,h,v){
    g.fillStyle='#5f8348'; g.fillRect(0,0,w,h);
    g.fillStyle='#6f9553'; g.fillRect(0,h*(v?0.34:0.4),w,h);
    for(let i=0;i<26;i++){ g.fillStyle='rgba(50,80,40,.5)'; g.beginPath(); g.arc(Math.random()*w,h*0.4+Math.random()*h*0.6,w*0.02,0,7); g.fill(); }
    g.fillStyle='#9d8a6a'; g.fillRect(w*(v?0.12:0.3),h*(v?0.7:0.62),w*0.4,h*0.1);
    g.fillStyle='#cfe2ef'; g.fillRect(0,0,w,h*(v?0.12:0.16));
  },

  // ---- inne: samma färgvärld, två olika vinklar ----
  livingroom(g,w,h,v){
    g.fillStyle='#dedad2'; g.fillRect(0,0,w,h);
    floor(g,w,h,h*(v?0.63:0.68),w*(v?0.28:0.72),'#a98868','rgba(70,50,32,.3)');
    g.fillStyle='#f6f4f0'; g.fillRect(0,h*(v?0.605:0.655),w,h*0.03);
    // fönstret byter sida med vinkeln
    const wx=v?0.07:0.62;
    g.fillStyle='#ffffff'; g.fillRect(w*wx,h*0.16,w*(v?0.24:0.3),h*(v?0.38:0.42));
    g.fillStyle='#eaf2f7'; g.fillRect(w*(wx+0.014),h*0.175,w*(v?0.21:0.27),h*(v?0.35:0.39));
    g.strokeStyle='#5f6468'; g.lineWidth=4;
    g.beginPath(); g.moveTo(w*(wx+0.11),h*0.175); g.lineTo(w*(wx+0.11),h*0.54); g.stroke();
    // soffan sedd från andra hållet
    g.fillStyle='#6f7a72'; g.fillRect(w*(v?0.46:0.1),h*(v?0.48:0.52),w*(v?0.42:0.34),h*0.19);
    g.fillStyle='#828d84'; g.fillRect(w*(v?0.46:0.1),h*(v?0.45:0.49),w*(v?0.42:0.34),h*0.05);
    g.fillStyle='#3d4145'; g.fillRect(w*(v?0.14:0.3),h*(v?0.24:0.2),w*0.16,h*0.14);
    if(v){ g.fillStyle='#8d7250'; g.fillRect(w*0.82,h*0.42,w*0.14,h*0.22); }
  },
  kitchen(g,w,h,v){
    g.fillStyle='#e9e6e0'; g.fillRect(0,0,w,h);
    if(!v){
      g.fillStyle='#2f3336'; g.fillRect(0,h*0.5,w,h*0.06);
      g.fillStyle='#c9a276'; g.fillRect(0,h*0.56,w,h*0.28);
      for(let i=0;i<7;i++){g.strokeStyle='#8f7250';g.lineWidth=2;g.strokeRect(i*w/7+3,h*0.57,w/7-6,h*0.26);}
      g.fillStyle='#d8d4cc'; g.fillRect(0,h*0.08,w,h*0.2);
      for(let i=0;i<5;i++){g.strokeStyle='#a8a49c';g.lineWidth=2;g.strokeRect(i*w/5+3,h*0.09,w/5-6,h*0.18);}
      g.fillStyle='#9aa0a4'; g.fillRect(w*0.42,h*0.44,w*0.16,h*0.07);
      g.fillStyle='#8d7250'; g.fillRect(0,h*0.84,w,h);
    } else {
      // samma kök från motsatt håll: köksö i förgrunden, skåpen längs vänster vägg
      floor(g,w,h,h*0.72,w*0.4,'#8d7250','rgba(70,50,32,.28)');
      g.fillStyle='#c9a276'; g.fillRect(0,h*0.34,w*0.34,h*0.4);
      for(let i=0;i<4;i++){g.strokeStyle='#8f7250';g.lineWidth=2;g.strokeRect(4,h*(0.35+i*0.1),w*0.32,h*0.09);}
      g.fillStyle='#d8d4cc'; g.fillRect(0,h*0.06,w*0.3,h*0.2);
      g.fillStyle='#c9a276'; g.fillRect(w*0.42,h*0.5,w*0.5,h*0.3);
      g.fillStyle='#2f3336'; g.fillRect(w*0.4,h*0.46,w*0.54,h*0.05);
      g.fillStyle='#9aa0a4'; g.fillRect(w*0.6,h*0.38,w*0.14,h*0.08);
    }
  },
  bedroom(g,w,h,v){
    g.fillStyle='#dcd8d4'; g.fillRect(0,0,w,h);
    floor(g,w,h,h*(v?0.7:0.74),w*(v?0.75:0.35),'#b09a82','rgba(80,60,40,.26)');
    if(!v){
      g.fillStyle='#f2efe9'; g.fillRect(w*0.16,h*0.5,w*0.62,h*0.28);
      g.fillStyle='#e3ded6'; g.fillRect(w*0.16,h*0.46,w*0.62,h*0.07);
      g.fillStyle='#c9c2b6'; g.fillRect(w*0.22,h*0.44,w*0.16,h*0.06);
      g.fillStyle='#c9c2b6'; g.fillRect(w*0.56,h*0.44,w*0.16,h*0.06);
      g.fillStyle='#8b7a68'; g.fillRect(w*0.14,h*0.24,w*0.66,h*0.2);
      g.fillStyle='#ffffff'; g.fillRect(w*0.84,h*0.2,w*0.13,h*0.4);
    } else {
      // sängen från sidan, garderoben i bild
      g.fillStyle='#f2efe9'; g.fillRect(w*0.04,h*0.52,w*0.52,h*0.26);
      g.fillStyle='#e3ded6'; g.fillRect(w*0.04,h*0.48,w*0.52,h*0.06);
      g.fillStyle='#c9c2b6'; g.fillRect(w*0.06,h*0.45,w*0.15,h*0.055);
      g.fillStyle='#8b7a68'; g.fillRect(w*0.02,h*0.26,w*0.12,h*0.24);
      g.fillStyle='#cfc7bb'; g.fillRect(w*0.62,h*0.14,w*0.34,h*0.56);
      g.strokeStyle='#a9a094'; g.lineWidth=3;
      g.beginPath(); g.moveTo(w*0.79,h*0.14); g.lineTo(w*0.79,h*0.7); g.stroke();
      g.fillStyle='#ffffff'; g.fillRect(w*0.4,h*0.16,w*0.16,h*0.26);
    }
  },
  bathroom(g,w,h,v){
    g.fillStyle='#eceef0'; g.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=h*(v?0.075:0.09)) { g.strokeStyle='#d3d8dc'; g.lineWidth=2; g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
    for(let x=0;x<w;x+=w*(v?0.06:0.07)) { g.strokeStyle='#d3d8dc'; g.lineWidth=2; g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); }
    if(!v){
      g.fillStyle='#ffffff'; g.fillRect(w*0.1,h*0.5,w*0.3,h*0.22);
      g.fillStyle='#f7f9fa'; g.fillRect(w*0.55,h*0.14,w*0.3,h*0.36);
      g.strokeStyle='#b9c0c6'; g.lineWidth=3; g.strokeRect(w*0.55,h*0.14,w*0.3,h*0.36);
      g.fillStyle='#c4ccd2'; g.fillRect(w*0.22,h*0.36,w*0.06,h*0.14);
    } else {
      g.fillStyle='#ffffff'; g.fillRect(w*0.52,h*0.54,w*0.36,h*0.24);
      g.fillStyle='#f7f9fa'; g.fillRect(w*0.08,h*0.1,w*0.26,h*0.44);
      g.strokeStyle='#b9c0c6'; g.lineWidth=3; g.strokeRect(w*0.08,h*0.1,w*0.26,h*0.44);
      g.fillStyle='#c4ccd2'; g.fillRect(w*0.66,h*0.4,w*0.06,h*0.14);
      g.fillStyle='#e4e8ea'; g.fillRect(w*0.42,h*0.16,w*0.2,h*0.24);
    }
  },
  detail(g,w,h,v){
    g.fillStyle=v?'#c2ae94':'#cbb79c'; g.fillRect(0,0,w,h);
    g.fillStyle='#2f2a24';
    if(!v){ g.beginPath(); g.arc(w*0.5,h*0.52,Math.min(w,h)*0.2,0,7); g.fill();
      g.fillStyle='#8d8578'; g.beginPath(); g.arc(w*0.5,h*0.52,Math.min(w,h)*0.14,0,7); g.fill(); }
    else { g.fillRect(w*0.34,h*0.3,w*0.32,h*0.44);
      g.fillStyle='#8d8578'; g.fillRect(w*0.39,h*0.36,w*0.22,h*0.32); }
    g.fillStyle='rgba(190,175,150,.75)'; g.fillRect(0,0,w,h*0.14); g.fillRect(0,h*0.86,w,h*0.14);
    g.fillStyle='rgba(190,175,150,.75)'; g.fillRect(0,0,w*0.12,h); g.fillRect(w*0.88,0,w*0.12,h);
  },
};
window.__shoot = function(kind,w,h,v){
  const c=document.createElement('canvas'); c.width=w; c.height=h;
  const g=c.getContext('2d');
  SCENES[kind](g,w,h,v);
  px(g,w,h,14);
  return c.toDataURL('image/jpeg',0.9);
};
`;

/* [rumstyp, filnamn, vinkel] — samma rumstyp + samma nummer = samma rum */
const SHOTS = [
  ['exterior', 'exterior-front', 0], ['drone', 'drone-overview', 0], ['exterior', 'exterior-side', 1],
  ['livingroom', 'livingroom-1', 0], ['livingroom', 'livingroom-2', 1],
  ['kitchen', 'kitchen-1', 0], ['kitchen', 'kitchen-2', 1],
  ['bedroom', 'bedroom-1', 0], ['bedroom', 'bedroom-2', 1],
  ['bathroom', 'bathroom-1', 0], ['bathroom', 'bathroom-2', 1],
  ['detail', 'detail-1', 0], ['detail', 'detail-2', 1],
  ['garden', 'garden-1', 0],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent('<body></body>');
  await p.addScriptTag({ content: DRAW });
  for (const [kind, name, v] of SHOTS) {
    const url = await p.evaluate(([k, vv]) => window.__shoot(k, 1600, 1067, vv), [kind, v]);
    const data = Buffer.from(url.split(',')[1], 'base64');
    fs.writeFileSync(path.join(OUT, `${name}.jpg`), data);
    process.stdout.write(`  ${name}.jpg (${kind}, vinkel ${v + 1}) ${(data.length / 1024).toFixed(0)} KB\n`);
  }
  await b.close();
  fs.writeFileSync(path.join(OUT, 'truth.json'), JSON.stringify(
    SHOTS.map(([kind, name, v]) => ({ file: name + '.jpg', room: kind, angle: v })), null, 2));
  console.log(`\n${SHOTS.length} bilder + facit i truth.json`);
})();
