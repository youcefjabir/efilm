/* ============================================================
   70 — Rendering: WebGL-kompositor + 2D-överlägg

   All geometri (crop, stabilisering, rörelsepresets, skala, position,
   perspektivkorrigering) läggs ihop till en homografi som inverteras och
   skickas till vertex-shadern. All färg körs i fragment-shadern.
   Utkanvasen är 2D och innehåller GL-bilden + text, watermark och guider,
   så att canvas.captureStream() fångar exakt det man ser.
   ============================================================ */

/* --- 3x3 matriser (radvis) --- */
const m3 = {
  id: () => [1, 0, 0, 0, 1, 0, 0, 0, 1],
  mul(A, B) {
    const C = new Array(9);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
      C[r * 3 + c] = A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c];
    return C;
  },
  chain(...ms) { return ms.reduce((a, b) => m3.mul(a, b)); },
  translate: (x, y) => [1, 0, x, 0, 1, y, 0, 0, 1],
  scale: (x, y) => [x, 0, 0, 0, y, 0, 0, 0, 1],
  rotate: r => { const c = Math.cos(r), s = Math.sin(r); return [c, -s, 0, s, c, 0, 0, 0, 1]; },
  shear: k => [1, k, 0, 0, 1, 0, 0, 0, 1],
  persp: (kx, ky) => [1, 0, 0, 0, 1, 0, kx, ky, 1],
  invert(m) {
    const [a, b, c, d, e, f, g, h, i] = m;
    const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
    const det = a * A + b * B + c * C;
    if (Math.abs(det) < 1e-12) return m3.id();
    const id = 1 / det;
    return [
      A * id, (c * h - b * i) * id, (b * f - c * e) * id,
      B * id, (a * i - c * g) * id, (c * d - a * f) * id,
      C * id, (b * g - a * h) * id, (a * e - b * d) * id,
    ];
  },
  toGL(m) { return new Float32Array([m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]); },
};

const Renderer = (() => {
  const VS = `
    attribute vec2 a_pos;
    uniform mat3 u_mat;
    varying vec3 v_uvh;
    varying vec2 v_pos;
    void main(){
      v_pos = a_pos;
      v_uvh = u_mat * vec3(a_pos, 1.0);
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }`;
  const FS = `
    precision highp float;
    varying vec3 v_uvh;
    varying vec2 v_pos;
    uniform sampler2D u_tex;
    uniform vec2 u_texel;
    uniform float u_alpha, u_isSolid, u_blur, u_feather;
    uniform vec3 u_solid;
    uniform float u_exposure,u_contrast,u_highlights,u_shadows,u_whites,u_blacks;
    uniform float u_temp,u_tintv,u_sat,u_vib,u_clarity,u_dehaze,u_sharpen,u_denoise;
    uniform float u_hlrec,u_shrec,u_winprot,u_vignette;

    float luma(vec3 c){ return dot(c, vec3(0.2126,0.7152,0.0722)); }
    vec3 tex(vec2 uv){ return texture2D(u_tex, uv).rgb; }

    void main(){
      if(u_isSolid > 0.5){ gl_FragColor = vec4(u_solid, u_alpha); return; }
      vec2 uv = v_uvh.xy / v_uvh.z;
      if(uv.x < -0.002 || uv.x > 1.002 || uv.y < -0.002 || uv.y > 1.002){ gl_FragColor = vec4(0.0); return; }
      uv = clamp(uv, 0.0005, 0.9995);

      vec3 c = tex(uv);
      vec3 n1 = tex(uv + vec2(u_texel.x,0.0));
      vec3 n2 = tex(uv - vec2(u_texel.x,0.0));
      vec3 n3 = tex(uv + vec2(0.0,u_texel.y));
      vec3 n4 = tex(uv - vec2(0.0,u_texel.y));
      vec3 avg4 = (n1+n2+n3+n4)*0.25;

      if(u_denoise > 0.001){
        vec3 soft = mix(c, (c + n1+n2+n3+n4)/5.0, 1.0);
        float edge = clamp(length(c - avg4)*7.0, 0.0, 1.0);   // spara kanter
        c = mix(mix(soft, c, edge), c, 1.0 - u_denoise);
      }
      if(u_blur > 0.001){
        float r = u_blur;
        vec3 b = vec3(0.0);
        b += tex(uv + vec2( u_texel.x*r, 0.0));
        b += tex(uv + vec2(-u_texel.x*r, 0.0));
        b += tex(uv + vec2(0.0,  u_texel.y*r));
        b += tex(uv + vec2(0.0, -u_texel.y*r));
        b += tex(uv + vec2( u_texel.x*r*0.7,  u_texel.y*r*0.7));
        b += tex(uv + vec2(-u_texel.x*r*0.7,  u_texel.y*r*0.7));
        b += tex(uv + vec2( u_texel.x*r*0.7, -u_texel.y*r*0.7));
        b += tex(uv + vec2(-u_texel.x*r*0.7, -u_texel.y*r*0.7));
        c = mix(c, b/8.0, clamp(u_blur*0.55, 0.0, 1.0));
      }
      if(u_sharpen > 0.001) c = clamp(c + (c - avg4) * u_sharpen * 2.2, 0.0, 4.0);
      if(abs(u_clarity) > 0.001){
        vec3 lp = (c + avg4 + tex(uv+u_texel*2.0) + tex(uv-u_texel*2.0))*0.25;
        c = clamp(c + (c - lp) * u_clarity * 1.6, 0.0, 4.0);
      }

      c *= exp2(u_exposure);

      // vitbalans
      c.r *= 1.0 + u_temp*0.30;
      c.b *= 1.0 - u_temp*0.30;
      c.g *= 1.0 + u_tintv*0.22;
      c.r *= 1.0 - u_tintv*0.07;
      c.b *= 1.0 - u_tintv*0.07;

      // dehaze: lyft bort dis genom att dra ner svartpunkten och öka mikro-kontrast
      if(abs(u_dehaze) > 0.001){
        float d = u_dehaze*0.10;
        c = clamp((c - d) / max(0.35, 1.0 - d), 0.0, 8.0);
      }

      float l = luma(c);
      // högdagrar / skuggor
      float hiMask = smoothstep(0.45, 1.0, l);
      float loMask = 1.0 - smoothstep(0.0, 0.55, l);
      c += u_highlights * hiMask * 0.45;
      c += u_shadows   * loMask * 0.45;
      // whites / blacks
      c += u_whites * smoothstep(0.6, 1.0, l) * 0.35;
      c += u_blacks * (1.0 - smoothstep(0.0, 0.35, l)) * 0.35;
      // återhämtning
      if(u_hlrec > 0.001){
        float k = u_hlrec;
        vec3 over = max(c - 0.72, 0.0);
        c = c - over * k * 0.75 / (1.0 + over);
      }
      if(u_shrec > 0.001){
        float k = u_shrec;
        c = c + (1.0 - smoothstep(0.0, 0.30, luma(c))) * k * 0.28;
      }
      // fönsterskydd: mjuk rolloff + avfärgning i mycket ljusa partier
      if(u_winprot > 0.001){
        float w = smoothstep(0.78, 1.0, luma(c));
        vec3 rolled = 1.0 - (1.0 - min(c, vec3(1.2)))*(1.0 - min(c, vec3(1.2)))*0.0;
        rolled = c / (1.0 + max(c - 0.80, 0.0) * u_winprot * 2.2);
        float g = luma(rolled);
        c = mix(c, mix(rolled, vec3(g), w * u_winprot * 0.35), u_winprot);
      }
      // kontrast kring en interiörvänlig pivot
      c = clamp((c - 0.45) * (1.0 + u_contrast) + 0.45, 0.0, 8.0);

      // mättnad & vibrance
      float g2 = luma(c);
      c = mix(vec3(g2), c, 1.0 + u_sat);
      if(abs(u_vib) > 0.001){
        float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b));
        float sat = (mx - mn) / max(0.001, mx);
        c = mix(vec3(luma(c)), c, 1.0 + u_vib * (1.0 - sat) * 1.4);
      }
      // vinjett
      if(abs(u_vignette) > 0.001){
        float d = length(v_pos * vec2(1.0, 1.0));
        c *= 1.0 - u_vignette * smoothstep(0.35, 1.45, d) * 0.75;
      }
      float a = u_alpha;
      if(u_feather > 0.001){
        vec2 e = min(uv, 1.0 - uv);
        a *= smoothstep(0.0, u_feather, min(e.x, e.y));
      }
      gl_FragColor = vec4(clamp(c, 0.0, 1.0) * a, a);
    }`;

  let gl = null, glc = null, prog = null, loc = {}, quad = null;
  let out = null, octx = null, W = 1920, H = 1080;
  const texCache = new WeakMap();
  let failed = false;

  function init(outCanvas) {
    out = outCanvas; octx = out.getContext('2d');
    glc = document.createElement('canvas');
    const opts = { alpha: false, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' };
    gl = glc.getContext('webgl', opts) || glc.getContext('experimental-webgl', opts);
    if (!gl) { failed = true; return false; }
    const vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) { failed = true; return false; }
    prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); failed = true; return false; }
    gl.useProgram(prog);
    quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    ['u_mat', 'u_tex', 'u_texel', 'u_alpha', 'u_isSolid', 'u_solid', 'u_blur', 'u_feather',
      'u_exposure', 'u_contrast', 'u_highlights', 'u_shadows', 'u_whites', 'u_blacks',
      'u_temp', 'u_tintv', 'u_sat', 'u_vib', 'u_clarity', 'u_dehaze', 'u_sharpen', 'u_denoise',
      'u_hlrec', 'u_shrec', 'u_winprot', 'u_vignette'].forEach(n => loc[n] = gl.getUniformLocation(prog, n));
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);   // förmultiplicerad alfa
    gl.uniform1i(loc.u_tex, 0);
    setSize(W, H);
    return true;
  }
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s), src); return null; }
    return s;
  }
  function setSize(w, h) {
    W = Math.max(2, Math.round(w)); H = Math.max(2, Math.round(h));
    if (glc.width !== W || glc.height !== H) { glc.width = W; glc.height = H; }
    if (out.width !== W || out.height !== H) { out.width = W; out.height = H; }
    if (gl) gl.viewport(0, 0, W, H);
  }
  function texFor(video) {
    let e = texCache.get(video);
    if (!e) {
      const t = gl.createTexture();
      e = { tex: t, filled: false };
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      texCache.set(video, e);
    }
    return e;
  }
  /** Laddar upp aktuell bildruta. Går den inte att läsa (t.ex. mitt i en
   *  sökning) behålls förra bildrutan i stället för att blinka svart. */
  function upload(video) {
    const e = texFor(video);
    gl.bindTexture(gl.TEXTURE_2D, e.tex);
    if (video.readyState < 2) return e.filled;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video); e.filled = true; }
    catch (err) { return e.filled; }
    return true;
  }

  /* ---------- geometri ---------- */
  /** Bygger matrisen som mappar clip-space → textur-uv (homografi). */
  function buildMatrix(o) {
    const aSrc = o.srcH / Math.max(1, o.srcW);         // halvhöjd i halvbredds-enheter
    const aOut = o.outH / Math.max(1, o.outW);
    const cr = o.crop || { l: 0, r: 0, t: 0, b: 0 };
    const cl = U.clamp(cr.l / 100, 0, .45), crr = U.clamp(cr.r / 100, 0, .45);
    const ct = U.clamp(cr.t / 100, 0, .45), cb = U.clamp(cr.b / 100, 0, .45);

    let F = m3.id();
    // 1. crop på källbilden
    F = m3.chain(m3.scale(1 / Math.max(.1, 1 - cl - crr), 1 / Math.max(.1, 1 - ct - cb)),
      m3.translate(-(cl - crr), -aSrc * (ct - cb)), F);
    // 2. perspektiv/vertikalkorrigering
    if (o.keystone) F = m3.mul(m3.persp(0, o.keystone / aSrc), F);
    // 3. stabilisering
    const s = o.stab;
    if (s) {
      // Skalan är ALLTID likformig. En separat aspektkorrigering skulle töja
      // bilden och ändra bildförhållandet, vilket aldrig är acceptabelt.
      const sc = Math.exp(s.scale || 0);
      const A = m3.chain(m3.rotate(s.rot || 0), m3.shear(s.shear || 0), m3.scale(sc, sc));
      F = m3.chain(m3.scale(s.zoom || 1, s.zoom || 1), m3.translate(s.tx || 0, s.ty || 0), A, F);
    }
    // 4. rörelsepreset
    const mo = o.motion;
    if (mo) F = m3.chain(m3.translate(mo.x || 0, mo.y || 0), m3.rotate(mo.rot || 0),
      m3.scale(mo.zoom || 1, mo.zoom || 1), mo.keystone ? m3.persp(0, mo.keystone / aSrc) : m3.id(), F);
    // 5. klippets egen transform
    const tr = o.transform;
    if (tr) F = m3.chain(m3.translate((tr.x || 0) / 50, (tr.y || 0) / 50),
      m3.rotate((tr.rot || 0) * Math.PI / 180), m3.scale((tr.scale || 100) / 100, (tr.scale || 100) / 100), F);
    // 6. fit/fill mot projektets bildformat
    const fs = o.fitMode === 'fill' ? Math.max(1, aOut / aSrc) : Math.min(1, aOut / aSrc);
    F = m3.mul(m3.scale(fs, fs), F);
    // 7. vy-zoom (detaljvy)
    if (o.viewZoom && o.viewZoom !== 1) F = m3.mul(m3.scale(o.viewZoom, o.viewZoom), F);

    const Finv = m3.invert(F);
    const clip2out = m3.scale(1, -aOut);                       // clip-space → utkoordinater (y ner)
    const src2uv = m3.chain(m3.translate(.5, .5), m3.scale(.5, .5 / aSrc));
    return m3.chain(src2uv, Finv, clip2out);
  }

  /* ---------- ritning ---------- */
  function clear(r = 0, g2 = 0, b = 0) {
    if (!gl) return;
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(r, g2, b, 1); gl.clear(gl.COLOR_BUFFER_BIT);
  }
  function setScissor(rect) {
    if (!gl) return;
    if (!rect) { gl.disable(gl.SCISSOR_TEST); return; }
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(Math.round(rect.x), Math.round(H - rect.y - rect.h), Math.round(rect.w), Math.round(rect.h));
  }
  const G = M.GRADE_DEFS;
  function drawVideo(video, mat, grade, opts = {}) {
    if (!gl || !video || !video.videoWidth) return false;
    if (!upload(video)) return false;
    gl.uniform1f(loc.u_isSolid, 0);
    gl.uniformMatrix3fv(loc.u_mat, false, m3.toGL(mat));
    gl.uniform2f(loc.u_texel, 1 / Math.max(1, video.videoWidth), 1 / Math.max(1, video.videoHeight));
    gl.uniform1f(loc.u_alpha, opts.alpha == null ? 1 : opts.alpha);
    gl.uniform1f(loc.u_blur, opts.blur || 0);
    gl.uniform1f(loc.u_feather, opts.feather || 0);
    const g = grade || M.emptyGrade();
    gl.uniform1f(loc.u_exposure, g.exposure);
    gl.uniform1f(loc.u_contrast, g.contrast / 160);
    gl.uniform1f(loc.u_highlights, g.highlights / 100);
    gl.uniform1f(loc.u_shadows, g.shadows / 100);
    gl.uniform1f(loc.u_whites, g.whites / 100);
    gl.uniform1f(loc.u_blacks, g.blacks / 100);
    gl.uniform1f(loc.u_temp, g.temperature / 100);
    gl.uniform1f(loc.u_tintv, g.tint / 100);
    gl.uniform1f(loc.u_sat, g.saturation / 100);
    gl.uniform1f(loc.u_vib, g.vibrance / 100);
    gl.uniform1f(loc.u_clarity, g.clarity / 100);
    gl.uniform1f(loc.u_dehaze, g.dehaze / 100);
    gl.uniform1f(loc.u_sharpen, g.sharpen / 100);
    gl.uniform1f(loc.u_denoise, g.denoise / 100);
    gl.uniform1f(loc.u_hlrec, g.highlightRecovery / 100);
    gl.uniform1f(loc.u_shrec, g.shadowRecovery / 100);
    gl.uniform1f(loc.u_winprot, g.windowProtect / 100);
    gl.uniform1f(loc.u_vignette, g.vignette / 100);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return true;
  }
  function drawSolid(rgb, alpha) {
    if (!gl) return;
    gl.uniform1f(loc.u_isSolid, 1);
    gl.uniform1f(loc.u_alpha, alpha);
    gl.uniform3f(loc.u_solid, rgb[0] * alpha, rgb[1] * alpha, rgb[2] * alpha);
    gl.uniformMatrix3fv(loc.u_mat, false, m3.toGL(m3.id()));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  /** Kopierar GL-bilden till utkanvasen (som är den som exporteras). */
  function present() {
    if (!octx) return;
    octx.clearRect(0, 0, W, H);
    octx.fillStyle = '#000'; octx.fillRect(0, 0, W, H);
    if (glc) octx.drawImage(glc, 0, 0);
  }
  const ctx2d = () => octx;
  const size = () => ({ w: W, h: H });
  return { init, setSize, clear, setScissor, drawVideo, drawSolid, present, buildMatrix, ctx2d, size, get ok() { return !failed && !!gl; }, get canvas() { return out; } };
})();
