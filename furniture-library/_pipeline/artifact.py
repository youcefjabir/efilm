# -*- coding: utf-8 -*-
"""
GRANSKNINGSARKET

Sidan har ett enda jobb: låta beställaren avgöra om den visuella
standarden går att låsa. Den är därför byggd som ett provark från en
renderingsstudio och inte som en presentation — grunden är sval och
neutral så att de varma möblerna är det enda färgade på sidan, och
transparensen ligger mot rutigt fält så den går att kontrollera med ögat.

Det som väger tyngst i granskningen ligger överst i varje avsnitt:
paret katalog/top bredvid varandra, skalremsan där alla topvyer ligger
i verklig inbördes storlek, och omfärgningsbeviset.
"""
import os, json, glob, base64, io, math
from PIL import Image
from recolor import recolor
from lib.mats import PALETTE

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PX_PER_CM = 6.0

def b64(path, maxw=None, fmt="WEBP", q=86):
    im = Image.open(path).convert("RGBA")
    if maxw and im.width > maxw:
        im = im.resize((maxw, max(1, round(im.height*maxw/im.width))), Image.LANCZOS)
    bio = io.BytesIO(); im.save(bio, fmt, quality=q, method=6)
    return "data:image/%s;base64,%s" % (fmt.lower(), base64.b64encode(bio.getvalue()).decode())

def load():
    out = []
    for p in sorted(glob.glob(os.path.join(ROOT, "*", "*", "*", "metadata.json"))):
        with open(p, encoding="utf-8") as fh: m = json.load(fh)
        m["_dir"] = os.path.dirname(p); out.append(m)
    order = ["living-room", "dining", "bedroom", "rugs", "office", "outdoor"]
    out.sort(key=lambda m: (order.index(m["category"]) if m["category"] in order else 9,
                            m["subcategory"], m["id"]))
    return out

CAT_SV = {"living-room":"Vardagsrum", "dining":"Matplats", "bedroom":"Sovrum",
          "rugs":"Mattor", "office":"Kontor", "outdoor":"Uteplats"}

def card(m):
    d = m["_dir"]; a = m["assets"]
    cat = b64(os.path.join(d, "catalog.webp"), 620)
    top = b64(os.path.join(d, "top.webp"), 620)
    dm, fp = m["dimensions_cm"], m["footprint_cm"]
    mk = a.get("masks", {})
    chips = ""
    for view in ("catalog", "top"):
        for x in mk.get(view, []):
            chips += ('<span class="chip"><b>%s</b>%s · %.1f%%</span>'
                      % (x["material"], view, x["coverage_pct"]))
    intent = m.get("design_intent_cm", {})
    dev = max((abs(dm[k]-intent[k]) for k in ("width","depth","height") if k in intent),
              default=0)
    return f'''<article class="mdl" id="{m['id']}">
  <div class="views">
    <figure><div class="chk"><img src="{cat}" alt="{m['name']} katalogvy"></div>
      <figcaption>Katalog · 3/4 perspektiv 85 mm</figcaption></figure>
    <figure><div class="chk"><img src="{top}" alt="{m['name']} topvy"></div>
      <figcaption>Top · ortografisk 90°, {a['top']['px'][0]} × {a['top']['px'][1]} px</figcaption></figure>
  </div>
  <div class="facts">
    <h3>{m['name']}</h3>
    <code class="id">{m['id']}</code>
    <p class="style">{m['style'].replace('-', ' ')}</p>
    <dl>
      <div><dt>Mått</dt><dd>{dm['width']} × {dm['depth']} × {dm['height']} cm</dd></div>
      <div><dt>Fotavtryck</dt><dd>{fp['width']} × {fp['depth']} cm
        <span class="sub">{a['top']['footprint_px'][0]} × {a['top']['footprint_px'][1]} px</span></dd></div>
      <div><dt>Avvikelse</dt><dd>{dev} cm <span class="sub">mot ritad avsikt</span></dd></div>
      <div><dt>Material</dt><dd>{' · '.join(m['materials'])}</dd></div>
    </dl>
    <div class="chips">{chips}</div>
  </div>
</article>'''

def scale_strip(models, px_per_cm_page=1.05):
    """Alla topvyer i VERKLIG inbördes skala. Det är det enskilt starkaste
       beviset för att biblioteket fungerar: en fåtölj ska vara liten
       bredvid en soffa, och en matta ska rymma båda."""
    items = []
    for m in models:
        w = m["footprint_cm"]["width"]*px_per_cm_page
        src = b64(os.path.join(m["_dir"], "top.webp"), 520)
        items.append((w, src, m["id"], m["footprint_cm"]))
    items.sort(key=lambda x: -x[0])
    cells = "".join(
        f'<div class="sc" style="width:{w:.0f}px"><img src="{s}" alt="{i}">'
        f'<span>{i}<em>{f["width"]}×{f["depth"]}</em></span></div>'
        for w, s, i, f in items)
    return f'<div class="strip">{cells}</div>'

def recolor_proof(models):
    """Tar första modellen med både tyg och trä och färgar om tyget."""
    for m in models:
        mk = m["assets"].get("masks", {}).get("catalog", [])
        names = [x["material"] for x in mk]
        if "fabric" in names and len(names) > 1:
            d = m["_dir"]
            src = os.path.join(d, "catalog.webp")
            msk = os.path.join(d, "masks", "catalog", "fabric.png")
            outs = []
            for col in ("olive", "charcoal", "warm-brown"):
                p = "/tmp/qa/rc_%s.png" % col
                recolor(src, msk, PALETTE[col], p)
                outs.append((col, b64(p, 460)))
            return m, b64(src, 460), b64(msk, 460), outs
    return None, None, None, []

CSS = """
:root{
  --paper:#F2F2F0; --panel:#FFFFFF; --ink:#191A1C; --mut:#75767A;
  --line:#DCDCD8; --line2:#C8C8C3; --blue:#3A5A69; --blue-s:#EAEFF1;
  --ok:#3F6B4A; --warn:#8A5A2B; --chk-a:#EAEAE7; --chk-b:#DCDCD8;
  --f-d:Archivo,-apple-system,'Segoe UI',sans-serif;
  --f-b:Newsreader,Georgia,'Times New Roman',serif;
}
:root:not([data-theme="light"]){}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --paper:#141517; --panel:#1B1D1F; --ink:#E9E9E6; --mut:#8E8F92;
    --line:#2B2D30; --line2:#3A3D40; --blue:#7FA8B8; --blue-s:#1D262B;
    --ok:#7FB08C; --warn:#C79A62; --chk-a:#232426; --chk-b:#1C1D1F;
  }
}
:root[data-theme="dark"]{
  --paper:#141517; --panel:#1B1D1F; --ink:#E9E9E6; --mut:#8E8F92;
  --line:#2B2D30; --line2:#3A3D40; --blue:#7FA8B8; --blue-s:#1D262B;
  --ok:#7FB08C; --warn:#C79A62; --chk-a:#232426; --chk-b:#1C1D1F;
}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--f-b);
  font-size:16px;line-height:1.62;-webkit-font-smoothing:antialiased}
.wrap{max-width:1220px;margin:0 auto;padding:0 30px 110px}
h1,h2,h3,.lab,.id,dt,.chip,figcaption,th,.sc span{font-family:var(--f-d)}
.lab{font-size:11px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;
  color:var(--blue);margin:0}
h1{font-size:clamp(34px,5.6vw,62px);font-weight:600;line-height:1.02;margin:16px 0 0;
  letter-spacing:-.022em;text-wrap:balance}
h2{font-size:clamp(23px,2.8vw,31px);font-weight:600;letter-spacing:-.014em;margin:0;
  text-wrap:balance}
h3{font-size:17px;font-weight:600;letter-spacing:-.008em;margin:0}
p{margin:0}
.lede{font-size:19px;line-height:1.66;color:var(--mut);max-width:66ch;margin-top:20px}
.lede b{color:var(--ink);font-weight:600;font-family:var(--f-d);font-size:17px}
header{padding:74px 0 46px;border-bottom:1px solid var(--line)}
section{padding:60px 0 0}
.shead{display:flex;align-items:baseline;gap:18px;flex-wrap:wrap;margin-bottom:10px}
.snote{color:var(--mut);max-width:64ch;font-size:15.5px}

/* nyckeltal */
.kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1px;
  background:var(--line);border:1px solid var(--line);margin-top:34px}
.kpi>div{background:var(--panel);padding:15px 17px}
.kpi dt{font-size:10px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
  color:var(--mut);margin:0 0 6px}
.kpi dd{margin:0;font-family:var(--f-d);font-size:25px;font-weight:600;
  font-variant-numeric:tabular-nums;line-height:1;letter-spacing:-.02em}
.kpi dd small{display:block;font-size:11px;font-weight:500;color:var(--mut);
  margin-top:6px;letter-spacing:.02em}

/* principdiagram */
.flow{display:grid;grid-template-columns:1fr;gap:0;margin-top:30px;
  border:1px solid var(--line);background:var(--panel);padding:26px}
.flow pre{margin:0;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:12.5px;
  line-height:1.85;color:var(--ink);overflow-x:auto}

/* modellkort */
.mdl{display:grid;grid-template-columns:1fr 300px;gap:26px;padding:30px 0;
  border-top:1px solid var(--line)}
.views{display:grid;grid-template-columns:1fr 1fr;gap:18px;min-width:0}
.views figure{margin:0;min-width:0}
.chk{border:1px solid var(--line);display:flex;align-items:center;justify-content:center;
  padding:12px;min-height:220px;
  background-image:linear-gradient(45deg,var(--chk-b) 25%,transparent 25%),
    linear-gradient(-45deg,var(--chk-b) 25%,transparent 25%),
    linear-gradient(45deg,transparent 75%,var(--chk-b) 75%),
    linear-gradient(-45deg,transparent 75%,var(--chk-b) 75%);
  background-size:16px 16px;
  background-position:0 0,0 8px,8px -8px,-8px 0;background-color:var(--chk-a)}
.chk img{max-width:100%;height:auto;display:block}
figcaption{font-size:10.5px;font-weight:500;letter-spacing:.13em;text-transform:uppercase;
  color:var(--mut);margin-top:9px}
.facts h3{margin-bottom:6px}
.id{display:inline-block;font-size:11px;font-weight:500;letter-spacing:.04em;
  background:var(--blue-s);color:var(--blue);padding:3px 7px}
.style{font-size:13px;color:var(--mut);margin-top:8px;text-transform:capitalize}
.facts dl{margin:16px 0 0;display:grid;gap:0}
.facts dl>div{display:flex;justify-content:space-between;gap:14px;align-items:baseline;
  padding:8px 0;border-bottom:1px solid var(--line)}
.facts dt{font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;
  color:var(--mut)}
.facts dd{margin:0;font-size:14px;text-align:right;font-variant-numeric:tabular-nums}
.sub{display:block;font-size:11px;color:var(--mut)}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}
.chip{font-size:10px;letter-spacing:.06em;border:1px solid var(--line2);color:var(--mut);
  padding:3px 7px;display:inline-flex;gap:6px}
.chip b{color:var(--ink);font-weight:600}

/* skalremsan */
.strip{display:flex;flex-wrap:wrap;align-items:flex-end;gap:20px;margin-top:28px;
  padding:30px 26px;border:1px solid var(--line);
  background-color:var(--panel);
  background-image:linear-gradient(var(--line) 1px,transparent 1px),
                   linear-gradient(90deg,var(--line) 1px,transparent 1px);
  background-size:63px 63px;background-position:-1px -1px}
.sc{flex:0 0 auto}
.sc img{width:100%;height:auto;display:block}
.sc span{display:block;font-size:9px;letter-spacing:.08em;text-transform:uppercase;
  color:var(--mut);margin-top:7px;line-height:1.35}
.sc em{display:block;font-style:normal;color:var(--line2)}

/* omfärgning */
.rc{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px;
  margin-top:28px}
.rc figure{margin:0}
.rc .chk{min-height:180px}

/* tabell */
.tw{overflow-x:auto;margin-top:26px;border:1px solid var(--line)}
table{border-collapse:collapse;width:100%;min-width:760px;font-size:13.5px}
th{background:var(--panel);text-align:left;padding:11px 14px;font-size:10px;font-weight:600;
  letter-spacing:.15em;text-transform:uppercase;color:var(--mut);
  border-bottom:1px solid var(--line);white-space:nowrap}
td{padding:9px 14px;border-bottom:1px solid var(--line);vertical-align:middle;
  font-variant-numeric:tabular-nums}
tr:last-child td{border-bottom:none}
td.y{color:var(--ok);font-family:var(--f-d);font-size:12px;font-weight:600}
td.n{color:var(--warn);font-family:var(--f-d);font-size:12px;font-weight:600}
td.mono{font-family:ui-monospace,Menlo,monospace;font-size:11.5px}

/* noter */
.notes{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:26px;
  margin-top:30px}
.note{border-left:2px solid var(--blue);padding-left:18px}
.note h3{margin-bottom:8px}
.note p{font-size:14.5px;line-height:1.62;color:var(--mut)}
.note p+p{margin-top:9px}
.stop{margin-top:60px;padding:26px 28px;border:1px solid var(--blue);
  background:var(--blue-s)}
.stop h2{margin-bottom:10px}
.stop p{max-width:70ch;font-size:15.5px}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
@media (max-width:900px){
  .mdl{grid-template-columns:1fr} .views{grid-template-columns:1fr}
  .wrap{padding:0 18px 70px}
}
"""

def build():
    ms = load()
    with open(os.path.join(ROOT, "qa-report.json"), encoding="utf-8") as fh:
        q = json.load(fh)
    s = q["summary"]
    rc_m, rc_src, rc_mask, rc_outs = recolor_proof(ms)

    cats = []
    for m in ms:
        if m["category"] not in cats: cats.append(m["category"])
    body = ""
    for c in cats:
        items = [m for m in ms if m["category"] == c]
        body += ('<section><div class="shead"><h2>%s</h2><p class="lab">%d %s</p></div>'
                 % (CAT_SV.get(c, c), len(items), "modell" if len(items) == 1 else "modeller"))
        body += "".join(card(m) for m in items) + "</section>"

    qrows = "".join(
        '<tr><td class="mono">%s</td><td class="%s">%s</td><td class="%s">%s</td>'
        '<td class="mono">%s</td><td class="%s">%s</td><td>%s</td><td>%s</td></tr>'
        % (r["id"],
           "y" if r["catalog_alpha"] and r["top_alpha"] else "n",
           "ja" if r["catalog_alpha"] and r["top_alpha"] else "NEJ",
           "y" if r["top_scale_ok"] else "n", "exakt" if r["top_scale_ok"] else "avviker",
           "%d × %d" % tuple(r["top_px"]),
           "y" if r["no_empty_masks"] else "n", "inga tomma",
           ", ".join(r["masks_catalog"]) or "—",
           ", ".join(r["masks_top"]) or "—")
        for r in q["models"])

    rc_html = ""
    if rc_m:
        cells = ('<figure><div class="chk"><img src="%s" alt="original"></div>'
                 '<figcaption>Original · %s</figcaption></figure>'
                 % (rc_src, rc_m["default_colors"].get("fabric", "grund")))
        cells += ('<figure><div class="chk"><img src="%s" alt="mask"></div>'
                  '<figcaption>masks/catalog/fabric.png</figcaption></figure>' % rc_mask)
        for col, src in rc_outs:
            cells += ('<figure><div class="chk"><img src="%s" alt="%s"></div>'
                      '<figcaption>Tyg → %s</figcaption></figure>' % (src, col, col))
        rc_html = ('<div class="rc">%s</div>' % cells)

    nvar = sum(1 for m in ms if m.get("variant"))
    html = f'''<meta charset="utf-8">
<title>Furniture Library Phase 1</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600&family=Newsreader:opsz,wght@6..72,300;6..72,400;6..72,500&display=swap">
<style>{CSS}</style>
<div class="wrap">
<header>
  <p class="lab">Phase 1 · visual QA</p>
  <h1>Femton möbler ur<br>en mastermodell var</h1>
  <p class="lede">Ett komplett minibibliotek för granskning. Varje möbel är en
  parametrisk 3D-modell; katalogvyn och topvyn är <b>två kameror mot samma
  geometri</b>, inte två tolkningar. Topvyn är sann ortografisk projektion, och
  maskerna är samma render med andra färger — därför kan de inte glida ur läge.
  Ingen fullproduktion är påbörjad.</p>
  <div class="kpi">
    <div><dt>Modeller</dt><dd>{s['models']}<small>{nvar} geometriska varianter</small></dd></div>
    <div><dt>Topskala</dt><dd>6,0<small>px per cm, låst</small></dd></div>
    <div><dt>Transparens</dt><dd>{'100 %' if s['all_transparent'] else 'FEL'}<small>alla filer</small></dd></div>
    <div><dt>Skalfel</dt><dd>{'0' if s['all_top_scale_exact'] else 'JA'}<small>topvyns px mot fotavtryck</small></dd></div>
    <div><dt>Tomma masker</dt><dd>{'0' if s['no_empty_masks'] else 'JA'}<small>skrivs aldrig</small></dd></div>
    <div><dt>Största avvikelse</dt><dd>{s['largest_dimension_deviation_cm']} cm<small>mätt mot ritad avsikt</small></dd></div>
  </div>
  <div class="flow"><pre>        ONE MASTER DESIGN
                |
    +-----------+-----------+
    |                       |
3/4 PERSPECTIVE        90 GRADER ORTOGRAFISKT
  catalog.webp            top.webp
    |                       |
masks/catalog/*.png    masks/top/*.png</pre></div>
</header>

<section>
  <div class="shead"><h2>Allt i verklig inbördes skala</h2></div>
  <p class="snote">Samtliga topvyer, ritade i sin faktiska storlek i förhållande
  till varandra. Rutnätet är 60 cm. Det här är hela poängen med en låst skala:
  två objekt kan läggas på samma planritning utan att räknas om.</p>
  {scale_strip(ms)}
</section>

<section>
  <div class="shead"><h2>Fungerar maskerna?</h2></div>
  <p class="snote">Tyget färgas om med sin egen mask. Träben, skuggor, sömmar och
  dagrar ligger kvar — de bor i grundbildens luminans och rörs inte. Det är
  frågan i punkt 50, besvarad med bild i stället för med ord.</p>
  {rc_html}
</section>

{body}

<section>
  <div class="shead"><h2>Kontrollen</h2></div>
  <p class="snote">Punkt 47 som mätdata. Topvyns pixelmått räknas ur fotavtrycket
  gånger sex plus padding; stämmer de inte är projektionen eller skalan fel.</p>
  <div class="tw"><table>
    <thead><tr><th>Modell</th><th>Transparens</th><th>Topskala</th><th>Top px</th>
      <th>Masker</th><th>Katalogmasker</th><th>Topmasker</th></tr></thead>
    <tbody>{qrows}</tbody></table></div>
</section>

<section>
  <div class="shead"><h2>Två medvetna avsteg</h2></div>
  <div class="notes">
    <div class="note"><h3>Masker ligger per vy</h3>
      <p>Specen visar <code>masks/fabric.png</code> direkt under topvyn. En soffas
      träben är helt dolda rakt uppifrån, så <code>wood.png</code> i topvyn blir
      en tom fil — vilket punkt 12 förbjuder. Samtidigt syns träet i katalogvyn
      och måste gå att färga om.</p>
      <p>Därför <code>masks/catalog/</code> och <code>masks/top/</code>, och tomma
      masker skrivs aldrig. Alternativen var en tom fil eller ett bibliotek där
      trä inte går att färga om.</p></div>
    <div class="note"><h3>Måtten är mätta, inte skrivna</h3>
      <p>Fälten <code>dimensions_cm</code> och <code>footprint_cm</code> läses ur
      modellens verkliga omslutande volym efter rendering. Designens avsedda mått
      står kvar som <code>design_intent_cm</code>.</p>
      <p>Det är enda sättet att svara ärligt på frågan om fotavtrycket stämmer med
      tillgången. Avvikelserna syns i stället för att döljas.</p></div>
    <div class="note"><h3>Varför 3D och inte bildgenerering</h3>
      <p>Kravet att båda vyerna ska visa exakt samma fysiska möbel, att topvyn ska
      vara ortografisk, och att maskerna ska följa materialytan exakt — inget av
      det går att garantera med genererade bilder.</p>
      <p>Med en mastermodell följer alla tre av konstruktionen.</p></div>
  </div>
</section>

<div class="stop">
  <p class="lab">Stopp</p>
  <h2>Produktionen är pausad här</h2>
  <p>Phase 2 låser kameravinkel, ljus, rendering, skugga, materialbehandling,
  topvystandard, mappstruktur, metadataformat och namngivning — och först
  därefter produceras resten av biblioteket. Designsystemet ändras inte halvvägs.
  Säg till om något i standarden ska ändras innan den låses.</p>
</div>
</div>'''
    out = "/tmp/qa/library.html"
    with open(out, "w", encoding="utf-8") as fh: fh.write(html)
    print(out, "%.2f MB" % (len(html.encode())/1048576))
    return out

if __name__ == "__main__":
    build()
