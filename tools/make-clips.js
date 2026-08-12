#!/usr/bin/env node
/* Genererar syntetiska testklipp med KÄND kamerarörelse, så att
   stabiliseringsanalysen kan verifieras mot facit. Kräver Playwright. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'test-media');

const SCENE = `
function buildScene(w, h){
  const c = document.createElement('canvas'); c.width=w; c.height=h;
  const g = c.getContext('2d');
  // vägg
  const grd = g.createLinearGradient(0,0,0,h); grd.addColorStop(0,'#d9d6d0'); grd.addColorStop(1,'#c3c0b9');
  g.fillStyle=grd; g.fillRect(0,0,w,h);
  // golv
  g.fillStyle='#8a7358'; g.fillRect(0,h*0.70,w,h*0.30);
  for(let i=0;i<26;i++){ g.strokeStyle='rgba(60,45,30,.35)'; g.lineWidth=2; g.beginPath(); g.moveTo(i*w/26,h*0.70); g.lineTo(i*w/26-60,h); g.stroke(); }
  // golvlist
  g.fillStyle='#f2f0ec'; g.fillRect(0,h*0.685,w,h*0.022);
  // dörrkarm (starka vertikaler)
  g.fillStyle='#f4f2ee'; g.fillRect(w*0.10,h*0.18,w*0.16,h*0.52);
  g.fillStyle='#2e2a26'; g.fillRect(w*0.115,h*0.20,w*0.13,h*0.50);
  g.fillStyle='#f4f2ee'; g.fillRect(w*0.10,h*0.18,w*0.16,h*0.02);
  // fönster (ljust, hårda kanter)
  g.fillStyle='#ffffff'; g.fillRect(w*0.58,h*0.14,w*0.30,h*0.40);
  g.fillStyle='#eef4f8'; g.fillRect(w*0.595,h*0.155,w*0.27,h*0.37);
  g.strokeStyle='#5a5f63'; g.lineWidth=4;
  g.beginPath(); g.moveTo(w*0.73,h*0.155); g.lineTo(w*0.73,h*0.525); g.stroke();
  g.beginPath(); g.moveTo(w*0.595,h*0.34); g.lineTo(w*0.865,h*0.34); g.stroke();
  // tavla + soffa
  g.fillStyle='#3b3f42'; g.fillRect(w*0.33,h*0.24,w*0.16,h*0.14);
  g.fillStyle='#9aa0a4'; g.fillRect(w*0.335,h*0.245,w*0.15,h*0.13);
  g.fillStyle='#6b6f6a'; g.fillRect(w*0.30,h*0.56,w*0.26,h*0.16);
  g.fillStyle='#7d817c'; g.fillRect(w*0.30,h*0.54,w*0.26,h*0.04);
  // textur/korn så blockmatchningen har något att bita i
  const img = g.getImageData(0,0,w,h); const d = img.data;
  for(let i=0;i<d.length;i+=4){ const n=(Math.random()-0.5)*16; d[i]+=n; d[i+1]+=n; d[i+2]+=n; }
  g.putImageData(img,0,0);
  return c;
}
async function record(profile, seconds, fps, W, H){
  const scene = buildScene(Math.round(W*1.6), Math.round(H*1.6));
  const cv = document.createElement('canvas'); cv.width=W; cv.height=H; document.body.appendChild(cv);
  const g = cv.getContext('2d');
  const stream = cv.captureStream(fps);
  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6000000 });
  const chunks=[]; rec.ondataavailable=e=>{ if(e.data.size) chunks.push(e.data); };
  const done = new Promise(r=> rec.onstop = r);
  rec.start();
  const t0 = performance.now();
  const total = seconds*1000;
  await new Promise(resolve => {
    function frame(){
      const t = (performance.now()-t0)/1000;
      if(t*1000 > total){ resolve(); return; }
      const m = profile(t);
      g.save();
      g.fillStyle='#000'; g.fillRect(0,0,W,H);
      g.translate(W/2, H/2);
      g.rotate(m.rot||0);
      g.scale(m.scale||1, m.scale||1);
      g.translate(-(scene.width/2) + (m.x||0), -(scene.height/2) + (m.y||0));
      if(m.wobble){
        const strips = 24, sh = scene.height/strips;
        for(let i=0;i<strips;i++){
          const off = Math.sin(t*3.1 + i*0.55)*m.wobble;
          const off2 = Math.cos(t*2.2 + i*0.4)*m.wobble*0.5;
          g.drawImage(scene, 0, i*sh, scene.width, sh, off, i*sh+off2, scene.width, sh+1);
        }
      } else {
        g.drawImage(scene, 0, 0);
      }
      g.restore();
      requestAnimationFrame(frame);
    }
    frame();
  });
  rec.stop();
  await done;
  const blob = new Blob(chunks, {type:'video/webm'});
  const buf = await blob.arrayBuffer();
  cv.remove();
  let s=''; const u8=new Uint8Array(buf);
  for(let i=0;i<u8.length;i+=8192) s += String.fromCharCode.apply(null, u8.subarray(i,i+8192));
  return btoa(s);
}
`;

const PROFILES = {
  'handheld-pushin.webm': `t => {
     const jitterX = Math.sin(t*41)*1.9 + Math.sin(t*17.3)*1.3 + Math.sin(t*7.1)*2.4;
     const jitterY = Math.cos(t*37)*1.6 + Math.cos(t*13.7)*1.7 + Math.sin(t*5.3)*2.0;
     return { x: jitterX, y: jitterY, rot: Math.sin(t*3.3)*0.004, scale: 1.02 + t*0.012 };
   }`,
  'walking-bob.webm': `t => {
     const bob = Math.sin(t*2*Math.PI*1.7)*9;          // 1,7 Hz gångrytm
     const sway = Math.sin(t*2*Math.PI*0.85)*5;
     return { x: sway + Math.sin(t*29)*1.1, y: bob + Math.cos(t*31)*0.9,
              rot: Math.sin(t*2*Math.PI*0.85)*0.006, scale: 1.02 + t*0.010 };
   }`,
  'ai-wobble.webm': `t => ({
     x: Math.sin(t*1.3)*6 + Math.sin(t*23)*1.2,
     y: Math.cos(t*1.1)*4 + Math.cos(t*19)*1.0,
     rot: Math.sin(t*0.9)*0.010, scale: 1.03 + Math.sin(t*0.7)*0.01, wobble: 7,
   })`,
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  await page.setContent('<body style="margin:0;background:#111"></body>');
  await page.addScriptTag({ content: SCENE });
  for (const [name, profile] of Object.entries(PROFILES)) {
    process.stdout.write('  ' + name + ' … ');
    const b64 = await page.evaluate(async ([p, secs]) => {
      // eslint-disable-next-line no-eval
      return await record(eval('(' + p + ')'), secs, 30, 960, 540);
    }, [profile, 6]);
    fs.writeFileSync(path.join(OUT, name), Buffer.from(b64, 'base64'));
    console.log((fs.statSync(path.join(OUT, name)).size / 1024).toFixed(0) + ' KB');
  }
  await browser.close();

  // musik: 20 s WAV med tydliga transienter (~100 BPM)
  const sr = 44100, dur = 20, n = sr * dur;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  const bpm = 100, beat = 60 / bpm;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const phase = (t % beat) / beat;
    const env = Math.exp(-phase * 14);
    const kick = Math.sin(2 * Math.PI * 55 * t) * env * 0.55;
    const hat = (Math.random() - .5) * Math.exp(-((t % (beat / 2)) / (beat / 2)) * 40) * 0.12;
    const pad = (Math.sin(2 * Math.PI * 220 * t) + Math.sin(2 * Math.PI * 277 * t)) * 0.06;
    const s = Math.max(-1, Math.min(1, kick + hat + pad));
    buf.writeInt16LE(Math.round(s * 32000), 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT, 'music-100bpm.wav'), buf);
  console.log('  music-100bpm.wav ' + (buf.length / 1024).toFixed(0) + ' KB');
})();
