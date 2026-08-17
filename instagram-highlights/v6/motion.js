/* =====================================================================
   07 · MOTION — audit och keyframes

   Ingenting här animeras. Sektionen finns för att kunna JÄMFÖRA riktningar
   innan någon animationsarkitektur byggs: varje kandidat visas som tre
   designriktningar × tre stillbilder — startbild, nyckelbild, slutbild.

   Stage-parametern är ett designtillstånd, inte en tidsaxel. Den säger
   "så här ser kompositionen ut när tre av sex signaler är lästa", inte
   "det här händer vid 1,4 s". Tidsättningen ligger i storyboarden.
   ===================================================================== */

/* ---------- audit ---------- */
var MAUDIT = [
 /* primitiv, klass, syfte, motivering, vad som rör sig, vad som står still */
 {p:"flow", n:"Flow", k:"A", use:"annonsen-2",
  purpose:"Input → bearbetning → resultat. Annonsskrivarens hela kedja.",
  why:"Ett förlopp som ritas som ett diagram ber tittaren själv föreställa sig tiden. Rörelse behöver inte läggas på — den finns redan i innehållet.",
  move:"Bilderna matas in, signalerna tänds en och en, texten sätts rad för rad.",
  still:"Rutnätet, kolumnbredden, typskalan och kickern."},
 {p:"split", n:"Split", k:"A", use:"estyling-2, estyling-3, atmosphere-2, atmosphere-3, motion-2",
  purpose:"Före och efter på samma bostad.",
  why:"Två bilder bredvid varandra tvingar ögat att jämföra i minnet. En wipe lägger förändringen på SAMMA pixlar — det är mätbart lättare att läsa, och det är hela tjänstens bevis.",
  move:"Wipe-kanten. Ingenting annat.",
  still:"Etiketterna, ramen, rubriken. Bilderna får inte panorera under wipen."},
 {p:"matrix", n:"Format matrix", k:"A", use:"motion-4, kampanjen-2",
  purpose:"Samma objekt i 9:16, 4:5 och 1:1.",
  why:"Poängen är att ETT material blir TRE ytor. Statiskt visas tre rutor och man får själv anta släktskapet; i rörelse ser man att det är samma bild som beskärs om.",
  move:"En bild delar sig i tre format som växer ut till sina proportioner.",
  still:"Måttsättningen och formatnamnen — de är fakta, inte effekt."},
 {p:"phases", n:"Phases", k:"A", use:"kampanjen-3",
  purpose:"Kommande → Till salu → Visning → Såld.",
  why:"Kampanjen ÄR en tidsaxel. Fyra miniatyrer bredvid varandra är en lista; i rörelse blir det ett förlopp med en riktning.",
  move:"Statusen vandrar. Varje mall tänds när den blir aktuell.",
  still:"Adressen, faktaraden och bilden — det är samma objekt hela vägen, och det är poängen."},
 {p:"whitelabel", n:"White label", k:"A", use:"visning-3, omradeskarta-3",
  purpose:"Samma leverans i kundens varumärke.",
  why:"Påståendet är att uttrycket byts men innehållet står still. Det går inte att bevisa med två kort bredvid varandra — det bevisas av att man ser bytet ske.",
  move:"Logotyp, färg och knappstil byts. Innehållet står kvar orört.",
  still:"Layouten, bilden, textmassan. Om något av det rör sig faller argumentet."},
 {p:"product", n:"Product moment", k:"A", use:"visning-2 (3D)",
  purpose:"Ren presentation av 3D-visningen.",
  why:"Rumslig förståelse är den enda sak som verkligen kräver rörelse. En planritning som reser sig till volym förklarar Matterport på två sekunder.",
  move:"Plan → volym. En enda kontrollerad kamerarörelse.",
  still:"Hörnmarkeringarna, rubriken, brödtexten.",
  note:"Bara för 3D. Samma primitiv på portalen (systemet-1, systemet-4) är B."},

 {p:"system", n:"System", k:"B", use:"8 bildrutor",
  purpose:"Numrerad ryggrad.",
  why:"Legitimt när posterna är STEG (Boka → Produktion → Leverans → Publicera). Meningslöst när de är en uppräkning av jämbördiga tjänster — då är ordningen inte innehåll.",
  move:"Vid steg: posterna tonar in i ordning, 90 ms isär.",
  still:"Vid uppräkning: allt. Låt den vara stilla."},
 {p:"mark", n:"Mark", k:"B", use:"8 bildrutor",
  purpose:"Logotypen som mask eller vattenmärke.",
  why:"En långsam skalning av fotografiet inuti V:et är smakfull men tillför ingen förståelse. Ren dekoration — tillåten som öppningsbild i en sekvens, aldrig mitt i.",
  move:"Fotografiet inuti masken, 4 % över 6 s. Aldrig masken själv.",
  still:"Geometrin. Logotypen skalas — den animeras inte."},
 {p:"fullbleed", n:"Full bleed", k:"B", use:"12 bildrutor",
  purpose:"Bilden äger ytan.",
  why:"Push-in är den mest använda och mest urvattnade effekten som finns. Fungerar när bildrutan är ett andningshål i en sekvens; blir billig i samma sekund den läggs på alla.",
  move:"Högst 3 % skala över hela klippet, linjärt.",
  still:"Typografin. Rör sig texten samtidigt som bilden blir det musikvideo."},
 {p:"case", n:"Case cover", k:"B", use:"objekt-0",
  purpose:"Objektet med kolofon.",
  why:"Samma bedömning som full bleed, men kolofonen gör den till en titelbild — och titelbilder tål en långsam rörelse.",
  move:"Bilden, mycket lite.",
  still:"Kolofonen."},

 {p:"quiet", n:"Quiet statement", k:"C", use:"16 bildrutor",
  purpose:"En mening som får bära.",
  why:"Hela primitivet är byggt på stillhet. Det finns ingenting att förklara och ingenting att demonstrera — bara en mening man ska hinna läsa. Animerar man den förstör man exakt det den är till för.",
  move:"Ingenting.",
  still:"Allt."},
 {p:"editorial", n:"Editorial", k:"C", use:"14 bildrutor",
  purpose:"Kontrollerad typografi i komponerad relation till bilden.",
  why:"Kompositionen ÄR budskapet. Varje rörelse bryter den relation som primitivet finns till för att hålla.",
  move:"Ingenting.",
  still:"Allt."},
 {p:"cta", n:"CTA", k:"C", use:"14 bildrutor",
  purpose:"Slutbilden.",
  why:"En uppmaning ska landa, inte röra sig. Sista bildrutan i en sekvens är den enda tittaren står still inför — där ska ingenting konkurrera.",
  move:"Ingenting.",
  still:"Allt."},
 {p:"cover", n:"Omslagen (alla tre system)", k:"C", use:"14 kapitel",
  purpose:"Kapitelmärket i profilraden.",
  why:"Instagram visar omslaget som en STILLBILD i en cirkel, 56 px. Plattformen spelar inte upp det. Att animera exportfilen är inte återhållsamhet — det är arbete som aldrig når någon.",
  move:"Ingenting. Tekniskt omöjligt i den yta märket visas.",
  still:"Allt."},
 {p:"post", n:"Kampanjmallarna p1–p4 som inlägg", k:"C", use:"4 mallar × 3 format",
  purpose:"Inlägg och annonsmaterial.",
  why:"De exporteras som JPG/PNG till flöde och annonsköp. Som Story täcks förloppet redan av phases; som inlägg finns ingen tidsaxel att röra sig i.",
  move:"Ingenting.",
  still:"Allt."}
];

/* ---------- de utvalda kandidaterna ---------- */
var MCAND = [
 {id:"annons", num:"01", n:"Annonsskrivaren", ref:["annonsen",2], prim:"flow",
  claim:"Färdig bostadsannons på 30 sekunder.",
  rank:"Starkast i hela biblioteket. Produkten är ett förlopp, och förloppet är osynligt i en stillbild."},
 {id:"motion", num:"02", n:"Motion", ref:["motion",2], prim:"split",
  claim:"Bostadsfilm, byggd av fotograferingen.",
  rank:"Produkten ÄR rörelse. Att sälja den med en stillbild är att visa fel sak."},
 {id:"estyl", num:"03", n:"E-styling", ref:["estyling",2], prim:"split",
  claim:"Vi skapar liv i tomma rum.",
  rank:"Före/efter på samma pixlar. Den enda bildruta där rörelse gör beviset mätbart tydligare."},
 {id:"kampanj", num:"04", n:"Kampanjfaserna", ref:["kampanjen",3], prim:"phases",
  claim:"Fyra mallar. En kampanj.",
  rank:"Innehållet är en tidsaxel. Statiskt blir det en lista över mallar."},
 {id:"format", num:"05", n:"Ett objekt, tre format", ref:["kampanjen",2], prim:"matrix",
  claim:"Samma mall exporterar samtliga.",
  rank:"Släktskapet mellan formaten är hela argumentet, och det syns bara när de växer ur samma bild."},
 {id:"white", num:"06", n:"White label", ref:["visning",3], prim:"whitelabel",
  claim:"Levereras i ert varumärke.",
  rank:"Ett påstående som bara går att bevisa genom att visa bytet."},
 {id:"tredim", num:"07", n:"3D — plan till volym", ref:["visning",2], prim:"product",
  claim:"Dollhouse och planritning.",
  rank:"Rumslig förståelse är det enda som genuint kräver rörelse."}
];

/* =====================================================================
   KEYFRAMES
   Tre riktningar, tre bilder var. Riktningarna är samma tre genom hela
   uppsättningen så att kandidaterna går att jämföra mot varandra.
   ===================================================================== */
var MDIRS = [
 {id:"editorial", n:"01 · Editorial reveal",
  d:"Mycket luft. Stor typografi. Innehållet avslöjas genom masker och beskärningar. Magasinets kampanjuppslag."},
 {id:"system", n:"02 · System / process",
  d:"Visar hur Viewly arbetar. Tunna linjer, rutnät, rena geometriska element. Ingen HUD, inga sken."},
 {id:"object", n:"03 · Object / material",
  d:"Materialet är huvudpersonen. Fotografi, plan eller text byggs upp framför tittaren. Gränssnitt bara där det förklarar."}
];

/* ---------- storyboards ---------- */
var MSTORY = {
 annons:{
  editorial:[["0,0 s","Tomt uppslag. Bara kickern och rubriken <i>Sex bilder in.</i> Papper, ingenting annat."],
   ["1,2 s","Sex miniatyrer faller in underifrån, 70 ms isär, 12 cqw resa. Ease-out 420 ms. Ingen skalning."],
   ["3,0 s","Miniatyrerna tonas till 34 % och sjunker 7 cqw. Rubriken byts genom en maskerad radbyte — inte en fade."],
   ["4,2 s","Annonsrubriken sätts ord för ord genom en clip-mask från vänster, 90 ms per ord."],
   ["6,0 s","Ingressen tonar in på plats. Slutbild hålls 1,2 s."]],
  system:[["0,0 s","Rutnätet ligger. Sex signaler i grått, alla släckta. Statusrad: <i>Väntar på underlag.</i>"],
   ["1,0 s","Signalerna tänds en och en, 180 ms isär: punkten går från linjefärg till oliv, texten till bläck."],
   ["3,2 s","Statusraden byter till <i>Läser 3 av 6</i> — sifferbytet är ett rullande tal, inte en fade."],
   ["5,0 s","Sista signalen tänds. Statusraden byter till <i>Utkast klart.</i>"],
   ["6,0 s","Rubriken skrivs ut under den nedre mätlinjen. Slutbild hålls 1,5 s."]],
  object:[["0,0 s","Fotografiet fyller 88 cqw. Under: ordet <i>Utkast</i> och tomma radlinjer."],
   ["1,4 s","Textblocket bygger sig: fyra linjer växer i bredd, 120 ms isär, ease-out."],
   ["3,4 s","Bilden dras upp till 52 cqw med en maskerad beskärning — bilden själv står still, ramen krymper."],
   ["4,6 s","Rubriken ersätter ordet <i>Utkast</i>, maskerad från vänster."],
   ["6,4 s","Slutbild: halv bild, färdig text."]]},
 motion:{
  editorial:[["0,0 s","Stillbilden i sitt fönster. Rubrik: <i>Stillbilden.</i>"],
   ["1,5 s","Bilden börjar en push-in på 6 % — linjärt, inte ease. Rubriken byts maskerat till <i>Rörelsen.</i>"],
   ["4,5 s","Push-in fortsätter till 13 %. Ingenting annat händer. Det är hela poängen."],
   ["6,0 s","Rubriken byts till <i>Filmen.</i> Rörelsen stannar mjukt på slutbilden."]],
  system:[["0,0 s","Bilden ligger still. Beskärningsramen i oliv står till vänster. Fyra stegnamn, det första i bläck."],
   ["1,2 s","Ramen vandrar åt höger. Förloppslinjen under stegnamnen växer i takt med den."],
   ["3,6 s","Andra och tredje steget tänds när ramen passerar sina positioner."],
   ["5,4 s","Ramen når höger kant, fjärde steget tänds, linjen full."],
   ["6,4 s","Under nedre mätlinjen: <i>En film, tre format.</i>"]],
  object:[["0,0 s","Fotografiet i full bleed, mörkt vinjetterat. <i>Bilderna finns redan.</i>"],
   ["1,6 s","Spelknappen växer in i mitten, 92 % vit, från 0,88 till 1,00 i skala. En enda rörelse."],
   ["3,0 s","Knappen tonar till 18 %, bilden byts genom en korsning på 600 ms. Rubrik: <i>Rörelsen läggs på.</i>"],
   ["5,2 s","Andra bildbytet. Rubrik: <i>Filmen är klar.</i>"],
   ["6,6 s","Slutbild hålls."]]},
 estyl:{
  editorial:[["0,0 s","Originalbilden i sin ram. Rubrik: <i>Tomt.</i>"],
   ["1,4 s","Wipe-kanten startar från vänster. Ren clip-inset, ingen suddighet, ingen linje som glöder."],
   ["3,2 s","Halvvägs. En 1 px ljus linje markerar kanten — det enda grafiska tillägget."],
   ["5,0 s","Wipen når höger kant och linjen försvinner."],
   ["5,6 s","Rubriken byts maskerat till <i>Möblerat.</i> Slutbild hålls 1,4 s."]],
  system:[["0,0 s","Ramad bild, mätlinjer, etiketterna <i>Original</i> / <i>E-stylat</i> och räknaren på 0 %."],
   ["1,2 s","Wipen startar. Räknaren räknar upp med rullande siffror, inte fade."],
   ["3,4 s","Vid 50 % byter etiketternas vikt: <i>Original</i> går till grått, <i>E-stylat</i> till bläck."],
   ["5,4 s","100 %. Wipe-linjen står kvar i oliv vid högerkanten."],
   ["6,2 s","Brödtexten tonar in: <i>Inga väggar flyttas.</i>"]],
  object:[["0,0 s","Full bleed original. <i>Samma rum.</i>"],
   ["1,6 s","Wipen går över hela ytan, 3,2 s, ease-in-out. Texten står helt still under tiden."],
   ["5,0 s","Wipen klar."],
   ["5,4 s","Rubriken byts maskerat till <i>Ny känsla.</i> Slutbild hålls 1,6 s."]]},
 kampanj:{
  editorial:[["0,0 s","Bilden på objektet, rubrik <i>Kommande</i>, förloppsstrecken tomma utom det första."],
   ["1,8 s","Bild och rubrik byts samtidigt genom en gemensam maskerad övergång. Andra strecket fylls."],
   ["3,6 s","Tredje bytet. Adressen under rubriken står oförändrad hela vägen — det är beviset."],
   ["5,4 s","Fjärde: <i>Såld.</i> Alla fyra streck i oliv."],
   ["6,6 s","Slutbild hålls."]],
  system:[["0,0 s","Fyra artboards i rad, den första i full opacitet, resten på 32 %."],
   ["1,6 s","Läget vandrar: nästa kort går till full opacitet och får olivram, det förra dämpas."],
   ["3,4 s","Tredje kortet. Ingen skalning, ingen förflyttning — bara ljusstyrka och ram."],
   ["5,2 s","Fjärde kortet."],
   ["6,2 s","Brödtexten tonar in: <i>Adressen står still. Bara mallen byts.</i>"]],
  object:[["0,0 s","Full bleed, statusen spärrad i oliv överst, adressen i Cormorant nertill."],
   ["2,0 s","Bilden byts genom korsning 700 ms. Statusordet byts maskerat. Adressen rör sig inte."],
   ["4,0 s","Tredje bytet."],
   ["5,6 s","Fjärde: <i>Såld.</i> Förloppsstrecken fylls sist, 200 ms."],
   ["7,0 s","Slutbild hålls."]]},
 format:{
  editorial:[["0,0 s","En bild i 4:5 centrerad. Rubrik: <i>Ett objekt.</i>"],
   ["1,6 s","Ramen ändrar proportion till 1:1 — bilden inuti står still, det är ramen som rör sig."],
   ["3,4 s","Ny proportion, 9:16. Formatetiketten nertill byts i takt."],
   ["5,0 s","Rubriken byts till <i>Samma bild.</i>"],
   ["6,2 s","Slutbild."]],
  system:[["0,0 s","En ram, 9:16, med sitt mått."],
   ["1,4 s","Andra ramen växer ut från den första i sin sanna proportion, 420 ms, ease-out."],
   ["3,0 s","Tredje ramen."],
   ["4,6 s","Måtten skrivs ut under mätlinjen: 1080 × 1920 · 1080 × 1350 · 1080 × 1080."],
   ["6,0 s","Slutbild."]],
  object:[["0,0 s","Fotografiet i full bleed med en ljus 9:16-ram inritad."],
   ["1,8 s","Ramen dras in till 4:5. Bilden står still — beskärningen är det som rör sig."],
   ["3,6 s","Ramen dras in till 1:1."],
   ["5,2 s","Ramen tonar bort, bilden ligger kvar. Rubrik: <i>Ett objekt.</i>"]]},
 white:{
  editorial:[["0,0 s","Visningssidan utan varumärke — grå platshållare i logotypraden och på knappen."],
   ["1,6 s","Kontor A:s färg fyller logotypruta, rubrikstreck och knapp samtidigt, 320 ms."],
   ["3,6 s","Bytet till kontor B. Enbart färgytorna och namnet korsar; layout, bild och textmassa rör sig inte en pixel."],
   ["5,4 s","Rubriken byts till <i>Varje objekt.</i>"],
   ["6,4 s","Slutbild."]],
  system:[["0,0 s","Två färgprover, båda omarkerade. Två identiska sidor på 40 % opacitet."],
   ["1,4 s","Första provet får olivmarkering, vänstra sidan går till full opacitet och får sin färg."],
   ["3,4 s","Markeringen flyttar till andra provet, högra sidan färgas."],
   ["5,2 s","Brödtext: <i>Innehållet är identiskt. Bara uttrycket byts.</i>"]],
  object:[["0,0 s","Visningssidan med Viewlys egen olivlist."],
   ["2,0 s","Listen byter färg och namn till kontor A. Fotografiet under står helt still."],
   ["4,0 s","Byte till kontor B."],
   ["5,6 s","Texten under skrivs ut: <i>Levereras i kontorets varumärke, aldrig i vårt.</i>"]]},
 tredim:{
  editorial:[["0,0 s","Planritningen platt, sedd rakt uppifrån. Rubrik: <i>Planritningen.</i>"],
   ["1,8 s","Planen reser sig. En enda kamerarörelse, ease-in-out 2,4 s, ingen rotation."],
   ["4,2 s","Volymen står. Olivpunkten stiger med den — det är ståpunkten."],
   ["5,4 s","Rubriken byts maskerat till <i>Bostaden.</i>"],
   ["6,4 s","Slutbild."]],
  system:[["0,0 s","Planen i sin ram. Tre etiketter, den första i bläck."],
   ["1,6 s","Resningen börjar. Etiketterna tänds i takt med geometrin."],
   ["4,0 s","Dollhouse-läget."],
   ["5,2 s","Slutbild med alla tre etiketter tända."]],
  object:[["0,0 s","Fotografi av rummet, full bleed. <i>Ett rum.</i>"],
   ["1,6 s","Geometrin ritas ovanpå fotografiet i ljus hårlinje, 900 ms."],
   ["3,4 s","Bilden byts till skanningsvyn, geometrin tonas till 28 %."],
   ["5,4 s","Sista bytet till dollhouse. Rubrik: <i>Gå igenom det.</i>"]]}
};

/* =====================================================================
   VYN
   ===================================================================== */
function secMotion(){
  var cls = {A:"lock", B:"semi", C:"edit"};   /* återanvänder lagerfärgerna */
  var counts = {A:0,B:0,C:0};
  MAUDIT.forEach(function(x){ counts[x.k]++ });

  var rows = MAUDIT.map(function(x){
    return '<tr><td><b>'+esc(x.n)+'</b><br><code class="mono" style="font-size:10px">'+esc(x.p)+'</code></td>'
     +'<td><span class="lay '+cls[x.k]+'" style="display:inline-block;padding:2px 7px;border-radius:4px;'
     +'font-size:10px;font-weight:700">'+x.k+'</span></td>'
     +'<td>'+esc(x.purpose)+'<br><span class="mut" style="font-size:11px">'+esc(x.use)+'</span></td>'
     +'<td>'+esc(x.why)+'</td>'
     +'<td>'+esc(x.move)+'</td>'
     +'<td class="mut">'+esc(x.still)+'</td></tr>';
  }).join("");

  var cands = MCAND.map(function(c){
    var dirs = MDIRS.map(function(d){
      var f = (MK[c.id]||{})[d.id];
      var frames = [0,.5,1].map(function(tt,st){
        return '<div class="mkf"><div class="frame">'+(f?f(state.dir, tt):'')+'</div>'
         +'<span class="mkfl">'+["Start","Nyckel","Slut"][st]+'</span></div>';
      }).join("");
      var board = (MSTORY[c.id]||{})[d.id] || [];
      return '<div class="mdir">'
       +'<div class="mdirh"><b>'+esc(d.n)+'</b><span>'+esc(d.d)+'</span></div>'
       +'<div class="mkfs">'+frames+'</div>'
       +'<ol class="mboard">'+board.map(function(b){
          return '<li><span class="t">'+esc(b[0])+'</span><span class="w">'+b[1]+'</span></li>' }).join("")+'</ol>'
       +'</div>';
    }).join("");
    return '<div class="mcand"><div class="mcandh">'
     +'<span class="mnum">'+c.num+'</span>'
     +'<div><b>'+esc(c.n)+'</b><span class="mut"> · '+esc(c.claim)+'</span>'
     +'<p class="mut" style="font-size:12.5px;line-height:1.6;margin-top:5px;max-width:80ch">'+esc(c.rank)+'</p></div>'
     +'<code class="mono">'+esc(c.prim)+'</code></div>'
     + dirs +'</div>';
  }).join("");

  return sechead("Motion", "Var rörelse faktiskt tillför något",
     "Ingenting här är animerat. Sektionen finns för att kunna jämföra riktningar innan någon "
    +"animationsarkitektur byggs. Först en klassificering av hela templatebiblioteket, sedan sju kandidater "
    +"med tre designriktningar var — startbild, nyckelbild, slutbild.")
   + dirbar()
   +'<div class="mstat">'
     +'<div><b>'+counts.A+'</b><span>A — motion rekommenderas</span></div>'
     +'<div><b>'+counts.B+'</b><span>B — valfritt</span></div>'
     +'<div><b>'+counts.C+'</b><span>C — behåll statisk</span></div>'
     +'<div><b>7</b><span>kandidater</span></div>'
   +'</div>'
   +'<h3 class="h3">Audit</h3>'
   +'<div class="tw"><table><thead><tr><th>Template</th><th>Klass</th><th>Syfte</th><th>Varför</th>'
   +'<th>Vad rör sig</th><th>Vad står still</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
   +'<h3 class="h3">Kandidater och riktningar</h3>'
   + cands;
}
