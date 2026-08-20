# -*- coding: utf-8 -*-
import sys, math, re, hashlib
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from logogen import *

def kt(x):
    """Kontrast med svenskt decimaltecken."""
    return ("%.1f" % x).replace(".", ",") + ":1"

def svg_in(bg, ink, dot, rund=False, w=BREDD):
    """Inbäddad SVG utan fasta mått — CSS bestämmer storleken."""
    # Pythons hash() saltas om vid varje körning, så ett id byggt på den
    # gör sidan olik sig själv mellan två byggen. Stabil summa i stället.
    kid = 'k' + hashlib.md5(('%s|%s|%s|%s|%s' % (bg,ink,dot,rund,w)).encode()).hexdigest()[:8]
    inre = ('<rect width="100" height="100" fill="%s"/>' % bg) + marke(ink, dot, w)
    if rund:
        return ('<svg viewBox="0 0 100 100" class="mk" aria-hidden="true">'
          '<defs><clipPath id="%s"><circle cx="50" cy="50" r="50"/></clipPath></defs>'
          '<g clip-path="url(#%s)">%s</g></svg>' % (kid, kid, inre))
    return '<svg viewBox="0 0 100 100" class="mk" aria-hidden="true">%s</svg>' % inre

def kort(namn, bg, ink, dot, txt, tva=False):
    k1, k2 = kontrast(P[bg], P[ink]), kontrast(P[bg], P[dot])
    matt = ('<span class="m">lem <b>%s</b></span><span class="m">punkt <b>%s</b></span>'
            % (kt(k1), kt(k2))) if tva else ('<span class="m">kontrast <b>%s</b></span>' % kt(k1))
    hexar = ('<code>%s</code><code>%s</code><code>%s</code>' % (P[bg], P[ink], P[dot])) if tva \
            else ('<code>%s</code><code>%s</code>' % (P[bg], P[ink]))
    return ('<figure class="kort">'
      '<div class="stor">%s</div>'
      '<div class="prov"><span class="p44">%s</span><span class="p24">%s</span>'
      '<span class="prund">%s</span><span class="plab">44 · 24 · rund</span></div>'
      '<figcaption><h4>%s</h4><p>%s</p><div class="matt">%s</div><div class="hex">%s</div></figcaption>'
      '</figure>' % (svg_in(P[bg],P[ink],P[dot]), svg_in(P[bg],P[ink],P[dot]),
                     svg_in(P[bg],P[ink],P[dot]), svg_in(P[bg],P[ink],P[dot],True),
                     namn, txt, matt, hexar))

NAMN = {"papper":"Papper","sand":"Sand","ljus":"Ljus","salvia":"Salvia","salvia2":"Salvia dov",
        "oliv":"Oliv","mossa":"Mossa","djup":"Djup oliv","skog":"Skog","natt":"Natt",
        "svart":"Svart","skugga":"Skugga"}


# ---- placeringsdiagrammet: måtten ritade, inte bara påstådda ----
def diagram():
    m = lambda cy: marke(P['svart'], P['svart'], BREDD, 50, cy)
    lin = ('<line x1="0" y1="%s" x2="100" y2="%s" stroke="%s" stroke-width=".5"'
           ' stroke-dasharray="%s"/>')
    etikett = ('<text x="%s" y="%s" font-size="3.4" font-family="Montserrat,sans-serif"'
               ' font-weight="500" letter-spacing=".08" fill="%s">%s</text>')
    a = ('<svg viewBox="0 0 100 100" class="dia" role="img" aria-label="Tyngdpunkt mot ramens mitt">'
      '<rect width="100" height="100" fill="#EFECE7"/>'
      + marke("#141416", "#141416", BREDD, 50, 50)
      + lin % ("49.93","49.93","#141416","2 1.6")
      + lin % ("37.13","37.13","#B4472F","2 1.6")
      + etikett % ("2","47.6","#141416","ramens mitt 49,9")
      + etikett % ("2","34.8","#B4472F","tyngdpunkt 37,1")
      + '</svg>')
    b = ('<svg viewBox="0 0 100 100" class="dia" role="img" aria-label="Vald placering 52,5">'
      '<rect width="100" height="100" fill="#EFECE7"/>'
      + marke("#141416", "#141416", BREDD, 50, 52.5)
      + lin % ("52.5","52.5","#6E7266","2 1.6")
      + etikett % ("2","50.2","#6E7266","vald 52,5")
      + '</svg>')
    h = BREDD/RATIO
    hd = (BREDD/2*BREDD/2 + h/2*h/2) ** 0.5
    c = ('<svg viewBox="0 0 100 100" class="dia" role="img" aria-label="Cirkelbeskärning">'
      '<rect width="100" height="100" fill="#EFECE7"/>'
      '<circle cx="50" cy="50" r="50" fill="none" stroke="#B4472F" stroke-width=".7"/>'
      '<circle cx="50" cy="52.5" r="%.2f" fill="none" stroke="#6E7266" stroke-width=".5" stroke-dasharray="2 1.6"/>'
      % hd
      + marke("#141416", "#141416", BREDD, 50, 52.5)
      + '<rect x="0" y="88" width="100" height="12" fill="#EFECE7"/>'
      + etikett % ("2","93.4","#B4472F","beskärning r 50")
      + etikett % ("40","93.4","#6E7266","märket r %s" % ("%.1f" % hd).replace(".", ","))
      + '</svg>')
    return ('<div class="diagrid">'
      '<figure>%s<figcaption>Ramcentrerat. Tyngdpunkten ligger 12,8 enheter över mitten '
      'och märket ser topptungt ut.</figcaption></figure>'
      '<figure>%s<figcaption>Nedflyttat till 52,5. Inte hela vägen till tyngdpunkten — '
      'då hänger det i stället.</figcaption></figure>'
      '<figure>%s<figcaption>Med rund beskärning. Märkets halvdiagonal är %.1f mot radien 50, '
      'alltså %.0f&nbsp;%% marginal.</figcaption></figure>'
      '</div>') % (a, b, c, hd, (1-hd/50)*100)

ren  = "".join(kort(NAMN[bg]+" · "+NAMN[ink].lower(), bg, ink, ink, txt) for _,bg,ink,txt in REN)
tva  = "".join(kort(NAMN[bg]+" · "+NAMN[ink].lower()+" och "+NAMN[dot].lower(), bg, ink, dot, txt, True)
               for _,bg,ink,dot,txt in TVA)

ensam = ""
for nm, ink, dot, txt in [("Svart","svart","svart","För ljusa underlag."),
                          ("Papper","papper","papper","För mörka underlag."),
                          ("Två toner","svart","oliv","Punkten bär oliven.")]:
    ensam += ('<figure class="kort fri"><div class="stor rutigt">'
      '<svg viewBox="%s" class="mk fri" aria-hidden="true">'
      '<path d="%s" fill="%s"/><circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s"/></svg></div>'
      '<figcaption><h4>%s</h4><p>%s</p></figcaption></figure>'
      % (VB, LIMB, P[ink], DOT[0], DOT[1], DOT[2], P[dot], nm, txt))

# alla mått i en tabell
rader = ""
for _,bg,ink,txt in REN:
    k = kontrast(P[bg],P[ink])
    rader += ('<tr><td>Ren</td><td>%s</td><td><span class="sw" style="background:%s"></span>%s</td>'
              '<td><span class="sw" style="background:%s"></span>%s</td>'
              '<td class="n en" colspan="2">%s<em>en färg</em></td><td class="%s">%s</td></tr>'
              % (NAMN[bg]+" · "+NAMN[ink].lower(), P[bg], P[bg], P[ink], P[ink], kt(k),
                 "ja" if k>=4.5 else "nja", "håller som text också" if k>=4.5 else "grafik, inte text"))
for _,bg,ink,dot,txt in TVA:
    k1,k2 = kontrast(P[bg],P[ink]), kontrast(P[bg],P[dot])
    lo = min(k1,k2)
    rader += ('<tr><td>Två</td><td>%s</td><td><span class="sw" style="background:%s"></span>%s</td>'
              '<td><span class="sw" style="background:%s"></span>%s / <span class="sw" style="background:%s"></span>%s</td>'
              '<td class="n">%s</td><td class="n">%s</td><td class="%s">%s</td></tr>'
              % (NAMN[bg]+" · "+NAMN[ink].lower()+" och "+NAMN[dot].lower(), P[bg], P[bg],
                 P[ink], P[ink], P[dot], P[dot], kt(k1), kt(k2),
                 "ja" if lo>=4.5 else "nja", "håller som text också" if lo>=4.5 else "grafik, inte text"))

HTML = """<title>Märket i färg</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@400;500;600&display=swap">
<style>
/* En provvägg, inte en webbsida. Grunden är fast och neutral med avsikt:
   ska man välja färg på ett märke får underlaget inte byta ton med
   betraktarens systeminställning. Väggen bakom brickorna går däremot att
   ställa om — det är själva verktyget. */
:root{
  --botten:#15171A; --panel:#1B1E21; --linje:#2B3034; --linje2:#3A4046;
  --text:#E9EAE6; --dov:#98A09A; --oliv:#8E9682; --varm:#C7CBBD;
  /* Väggen och det som står på den hänger ihop. Byter man vägg måste
     bildtexterna byta med, annars försvinner de mot mörkt underlag. */
  --vagg:#8E9084; --vagg-ink:rgba(0,0,0,.9); --vagg-dov:rgba(0,0,0,.62);
  --vagg-svag:rgba(0,0,0,.5); --vagg-kant:rgba(0,0,0,.16); --vagg-chip:rgba(0,0,0,.09);
  --f-d:'Cormorant Garamond',Georgia,'Times New Roman',serif;
  --f-b:Montserrat,-apple-system,'Segoe UI',sans-serif;
}
*{box-sizing:border-box}
body{margin:0;background:var(--botten);color:var(--text);
  font-family:var(--f-b);font-size:15px;line-height:1.65;
  -webkit-font-smoothing:antialiased}
.wrap{max-width:1180px;margin:0 auto;padding:0 28px 96px}
.eb{font-size:11px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;
  color:var(--oliv);margin:0}
h1{font-family:var(--f-d);font-weight:300;font-size:clamp(40px,7vw,76px);
  line-height:1.02;margin:14px 0 0;text-wrap:balance;letter-spacing:-.005em}
h1 em{font-style:italic;color:var(--varm)}
h2{font-family:var(--f-d);font-weight:300;font-size:clamp(28px,3.6vw,40px);
  line-height:1.1;margin:0;text-wrap:balance}
h3{font-family:var(--f-b);font-size:12px;font-weight:600;letter-spacing:.2em;
  text-transform:uppercase;color:var(--oliv);margin:0 0 14px}
h4{font-family:var(--f-b);font-size:13.5px;font-weight:600;margin:0;letter-spacing:.005em}
p{margin:0}
.lede{font-size:17px;line-height:1.7;color:var(--dov);max-width:62ch;margin-top:20px}
.lede b{color:var(--text);font-weight:500}

header{padding:76px 0 52px;border-bottom:1px solid var(--linje)}

/* geometrin: siffrorna som inte fick röras */
.geo{display:grid;grid-template-columns:repeat(auto-fit,minmax(158px,1fr));gap:1px;
  background:var(--linje);border:1px solid var(--linje);margin:44px 0 0}
.geo div{background:var(--panel);padding:16px 18px}
.geo dt{font-size:10.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
  color:var(--dov);margin:0 0 6px}
.geo dd{margin:0;font-family:var(--f-d);font-size:26px;font-weight:400;
  font-variant-numeric:tabular-nums;line-height:1}
.geo dd small{font-family:var(--f-b);font-size:11px;font-weight:500;color:var(--dov);
  display:block;margin-top:5px;letter-spacing:.02em}

section{padding:64px 0 0}
.shead{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 20px;margin-bottom:8px}
.snote{color:var(--dov);max-width:60ch;margin-top:12px;font-size:14.5px}

/* väggen — det som gör arket till ett verktyg */
.diagrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));
  gap:22px;margin-top:30px}
.diagrid figure{margin:0}
.dia{width:100%;height:auto;display:block;outline:1px solid var(--linje2);outline-offset:-1px}
.diagrid figcaption{font-size:12px;line-height:1.55;color:var(--dov);margin-top:10px}

.styr{display:flex;align-items:center;gap:12px;flex-wrap:wrap;
  margin:32px 0 0;padding:14px 16px;background:var(--panel);
  border:1px solid var(--linje)}
.styr span{font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;
  color:var(--dov)}
.styr button{font:inherit;font-size:12px;font-weight:500;letter-spacing:.04em;
  color:var(--text);background:transparent;border:1px solid var(--linje2);
  padding:7px 13px 7px 8px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;
  transition:border-color .16s,color .16s}
.styr button i{width:15px;height:15px;display:block;border:1px solid rgba(255,255,255,.22)}
.styr button:hover{border-color:var(--oliv)}
.styr button[aria-pressed="true"]{border-color:var(--varm);color:var(--varm)}
.styr button:focus-visible{outline:2px solid var(--oliv);outline-offset:2px}

.vagg{background:var(--vagg);padding:28px;margin-top:1px;transition:background .28s}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(206px,1fr));gap:26px}
.grid.tre{grid-template-columns:repeat(3,minmax(0,1fr))}
@media (max-width:760px){.grid.tre{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}}
.kort{margin:0}
.stor{position:relative}
.mk{width:100%;height:auto;display:block}
.stor .mk{outline:1px solid var(--vagg-kant);outline-offset:-1px}
.prov{display:flex;align-items:center;gap:9px;margin-top:10px}
.prov span{display:block;flex:0 0 auto}
.p44 .mk{width:44px}.p24 .mk{width:24px}.prund .mk{width:36px}
.prov .mk{outline:1px solid var(--vagg-kant);outline-offset:-1px}
.prund .mk{outline:none}
.plab{font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;
  color:var(--vagg-svag);margin-left:auto;text-align:right;line-height:1.3}
figcaption{margin-top:12px}
figcaption p{font-size:12px;line-height:1.5;color:var(--vagg-dov);margin-top:4px}
figcaption h4{color:var(--vagg-ink)}
.matt{display:flex;gap:14px;flex-wrap:wrap;margin-top:9px}
.matt .m{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--vagg-svag)}
.matt b{font-weight:600;color:var(--vagg-ink);font-variant-numeric:tabular-nums;letter-spacing:0}
.hex{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.hex code{font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:10px;
  background:var(--vagg-chip);color:var(--vagg-dov);padding:2px 5px;letter-spacing:.02em}

/* märket utan fält */
.fri .stor{background:
   repeating-conic-gradient(var(--vagg-chip) 0% 25%, transparent 0% 50%) 50%/22px 22px;
  padding:26px;display:flex;align-items:center;justify-content:center;min-height:150px}
.mk.fri{width:78%;outline:none}

/* mätbordet */
.tabellhalla{overflow-x:auto;margin-top:26px;border:1px solid var(--linje)}
table{border-collapse:collapse;width:100%;min-width:720px;font-size:12.5px}
th{background:var(--panel);text-align:left;padding:11px 14px;font-size:10px;font-weight:600;
  letter-spacing:.16em;text-transform:uppercase;color:var(--dov);
  border-bottom:1px solid var(--linje);white-space:nowrap}
td{padding:10px 14px;border-bottom:1px solid var(--linje);vertical-align:middle}
tr:last-child td{border-bottom:none}
td.n{font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}
td.en em{font-style:normal;color:var(--dov);font-size:10px;letter-spacing:.14em;
  text-transform:uppercase;margin-left:10px}
.sw{display:inline-block;width:11px;height:11px;margin-right:7px;vertical-align:-1px;
  border:1px solid rgba(255,255,255,.2)}
td.ja{color:var(--varm)}
td.nja{color:var(--dov)}
tbody tr:hover td{background:rgba(255,255,255,.022)}

.slut{margin-top:64px;padding-top:30px;border-top:1px solid var(--linje);
  display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:30px}
.slut h3{margin-bottom:9px}
.slut p{font-size:13.5px;line-height:1.62;color:var(--dov)}
.slut p + p{margin-top:9px}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
@media (max-width:640px){
  .wrap{padding:0 18px 64px} header{padding:48px 0 36px}
  .vagg{padding:18px} .grid{gap:20px}
}
</style>

<div class="wrap">
<header>
  <p class="eb">Viewly · logotyp</p>
  <h1>Märket i färg,<br><em>utan cirkel</em></h1>
  <p class="lede">Fjorton fält och tre fria märken. <b>Geometrin är orörd</b> — sökvägen
  och punkten är spårade ur logotyp-filen med en överlappning på 0,9925 mot originalet,
  och de talen står oförändrade i varje variant här. Det enda som varieras är färg.
  Fältet är en fyrkant, aldrig en cirkel: den runda formen hör till Instagrams omslag
  och ska inte byggas in i logotypen.</p>

  <div class="geo">
    <div><dt>Ram</dt><dd>858,6 × 756,3<small>förhållande 1,1353</small></dd></div>
    <div><dt>Lemvinkel</dt><dd>58,0°<small>tangent 1,6003</small></dd></div>
    <div><dt>Punkt</dt><dd>r 153,4<small>vid 705,2 / 153,4</small></dd></div>
    <div><dt>Överlappning</dt><dd>0,9925<small>mot originalfilen</small></dd></div>
  </div>
</header>

<section>
  <div class="shead"><h2>Var märket sitter i fältet</h2></div>
  <p class="snote">Två mått avgjorde placeringen, och båda är mätta i stället för gissade.
  Märkets <b>tyngdpunkt ligger på y&nbsp;37,1</b> medan ramens mitt ligger på 49,9 — lemmen är
  bred upptill och slutar i en spets, punkten sitter högt. Ramcentrerat ser märket därför
  topptungt ut. Ett prov på fyra lägen gav <b>52,5</b> som det som står stilla.
  Bredden <b>50 av 100</b> valdes med cirkelbeskärningen påslagen: halvdiagonalen blir
  33,3 mot radien 50, så märket klarar den runda beskärning som Instagram och LinkedIn
  lägger på ändå.</p>
  __DIAG__
</section>

<section>
  <div class="shead"><h2>Ren</h2></div>
  <p class="snote">Ett fält, en märkesfärg. Lem och punkt i samma ton, så märket läses
  som en enda form. Det här är den enklaste versionen och den som tål mest — tryck,
  gravyr, broderi, en enfärgad stämpel.</p>
  <div class="styr" role="group" aria-label="Vägg bakom brickorna">
    <span>Vägg</span>
    <button type="button" data-vagg="#EFECE7" data-ljus="0" aria-pressed="false"><i style="background:#EFECE7"></i>Papper</button>
    <button type="button" data-vagg="#8E9084" data-ljus="0" aria-pressed="true"><i style="background:#8E9084"></i>Grå</button>
    <button type="button" data-vagg="#101210" data-ljus="1" aria-pressed="false"><i style="background:#101210"></i>Mörk</button>
  </div>
  <div class="vagg"><div class="grid">__REN__</div></div>
</section>

<section>
  <div class="shead"><h2>Två toner</h2></div>
  <p class="snote">Husets eget uppträdande: lemmen bär ink, punkten bär oliven. Samma
  geometri, två färger. Använd den där märket får plats att synas — omslag, sidfot,
  profilbild. Under ungefär 24&nbsp;bildpunkter tappar punkten sin egen färg och den rena
  versionen är bättre.</p>
  <div class="vagg"><div class="grid">__TVA__</div></div>
</section>

<section>
  <div class="shead"><h2>Utan fält</h2></div>
  <p class="snote">Märket i sin egen ram, utan bakgrund. Ingen optisk förskjutning här —
  den hör till fältet, inte till formen. Den som placerar märket i en egen layout gör
  sin egen justering.</p>
  <div class="vagg"><div class="grid tre">__FRI__</div></div>
</section>

<section>
  <div class="shead"><h2>Måtten</h2></div>
  <p class="snote">Kontrasten är räknad mot fältet för varje färg i märket. En logotyp
  är en grafisk form och inte text, så kravet är <b>3:1</b> — alla fjorton klarar det,
  lägst är 3,7:1. Kolumnen längst till höger säger vilka som dessutom klarar 4,5:1,
  alltså textkravet, och därför också går att sätta ord bredvid i samma färg.</p>
  <div class="tabellhalla"><table>
    <thead><tr><th>Familj</th><th>Namn</th><th>Fält</th><th>Märke</th>
      <th class="n">Lem</th><th class="n">Punkt</th><th>Håller</th></tr></thead>
    <tbody>__RADER__</tbody>
  </table></div>
</section>

<div class="slut">
  <div>
    <h3>Vad som inte ändrats</h3>
    <p>Sökvägen, punktens plats och radie, och förhållandet mellan bredd och höjd.
    Ingen variant har en egen geometri.</p>
    <p>Cirkeln som funnits runt märket i omslagen finns inte här. Den hör till
    Instagram, inte till logotypen.</p>
  </div>
  <div>
    <h3>Vad som är förslag</h3>
    <p>Färgparen. Paletten är hämtad ur systemet — papper, sand, salvia, oliv, skog,
    natt, svart — men vilka som är husets egna och vilka som är tillfälliga är
    er sak att bestämma.</p>
  </div>
  <div>
    <h3>Filerna</h3>
    <p>Alla sjutton finns som SVG och som PNG i 1024&nbsp;bildpunkter, levererade
    vid sidan av den här sidan. SVG:erna är rena — en rect, en path, en circle.</p>
  </div>
</div>
</div>

<script>
/* Väggen bakom brickorna. Att kunna byta underlag är hela poängen med ett
   provark: en logotyp som ser bra ut på grått kan tappa fotfästet på vitt. */
(function(){
  var knappar = document.querySelectorAll('.styr button');
  knappar.forEach(function(b){
    b.addEventListener('click', function(){
      var r = document.documentElement, mork = b.dataset.ljus === "1";
      r.style.setProperty('--vagg', b.dataset.vagg);
      r.style.setProperty('--vagg-ink',  mork ? 'rgba(255,255,255,.92)' : 'rgba(0,0,0,.9)');
      r.style.setProperty('--vagg-dov',  mork ? 'rgba(255,255,255,.62)' : 'rgba(0,0,0,.62)');
      r.style.setProperty('--vagg-svag', mork ? 'rgba(255,255,255,.48)' : 'rgba(0,0,0,.5)');
      r.style.setProperty('--vagg-kant', mork ? 'rgba(255,255,255,.20)' : 'rgba(0,0,0,.16)');
      r.style.setProperty('--vagg-chip', mork ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.09)');
      knappar.forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)) });
    });
  });
})();
</script>
"""
HTML = (HTML.replace("__DIAG__", diagram()).replace("__REN__", ren).replace("__TVA__", tva)
            .replace("__FRI__", ensam).replace("__RADER__", rader))
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'index.html'),'w',encoding='utf-8').write(HTML)
print("skrivet %.1f kB" % (len(HTML.encode())/1024))
