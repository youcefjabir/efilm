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
  editorial:[["0,0 s","Uppslaget ligger färdigt men tomt: fyra faktarader med sina rubriker, sex tomma bildplatser och textytans radlinjer. Rutnätet syns från första bildrutan — det är därför plåten aldrig känns halvfärdig."],
   ["0,3 s","Adress, ort och stadsdel, storlek och bostadstyp skrivs in rad för rad med clip-mask, 200 ms isär. Det är de 30 sekunder mäklaren faktiskt lägger."],
   ["2,3 s","Bilderna faller in i sina platser, 85 ms isär. Platserna flyttar sig inte — de fylls."],
   ["4,1 s","Rubriken sätts ord för ord."],
   ["5,0 s","De tre styckena ersätter radlinjerna, ett i taget, avslöjade uppifrån."],
   ["7,8 s","Slutbild: uppgifter, underlag och färdig text på samma yta."]],
  system:[["0,0 s","Diagrammet är komplett och släckt: tre ingångar, fyra signaler, ett resultat. Man kan läsa hela mekaniken redan här."],
   ["0,2 s","Ingångarna tänds i tur och ordning — bostadens uppgifter (30 s), sex bilder, områdets karaktär. Punkten går från linjefärg till oliv."],
   ["2,5 s","Signalbandet: ljusinsläpp, takhöjd, material och planlösning tänds var för sig, 150 ms isär. Det är vad verktyget läser ur bilderna."],
   ["4,7 s","Rubriken skrivs ut under nedersta mätlinjen, sedan fylls textraderna från vänster."],
   ["7,0 s","Fotnoten tonar in: 1 credit · två omskrivningar ingår."]],
  object:[["0,0 s","Fotografiet på 68 cqw, papper under. Faktaraden och textblockets radlinjer ligger redan där."],
   ["0,4 s","Faktaraden skrivs fram: adress, rum, boarea, bostadstyp."],
   ["1,4 s","Rubriken sätts, sedan de två styckena."],
   ["4,8 s","Tonlägeschipsen tonar in — Saklig, Varm, Exklusiv — med Saklig aktiv."],
   ["5,4 s","Omskrivningen: markeringen flyttar till Varm och rubrik och ingress SKRIVS OM till en annan formulering. Det är den delen av produkten som är lättast att missa i en stillbild."],
   ["6,9 s","Andra omskrivningen till Exklusiv. Fotnot: två omskrivningar ingår."]]},
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
  editorial:[["0,0 s","Den färdiga KOMMANDE-artboarden ligger på uppslaget — samma mall som exporteras i vy 05, nedskalad till 70 cqw. Under den: fasnamnet i Cormorant, en rad om vad mallen gör, och fyra förloppsstreck med det första i oliv."],
   ["2,1 s","TILL SALU sätts över den föregående med en maskerad övergång från vänster, som ett tryckark. Faktaraden — 4 rum, 112 kvadratmeter, 1968 — kommer med i mallen, inte som påhäng."],
   ["4,2 s","VISNING. Mallen tömmer sig själv: en enda uppgift satt stort. Adressen i kicklinjen överst har inte rört sig en enda bildruta — det är beviset för att underlaget är detsamma."],
   ["6,3 s","SÅLD. Ordet tar 24 cqw och bilden backar bakom en ljus slöja. Alla fyra streck i oliv."],
   ["8,4 s","Slutbild hålls."]],
  system:[["0,0 s","Alla fyra artboards ligger uppe samtidigt i ett 2 × 2-rutnät, renderade med produktionens post(). Den första i full opacitet med olivram, övriga på 30 %. Hela uppsättningen är läsbar från första bildrutan."],
   ["2,1 s","Läget vandrar till Till salu. Ingen skalning, ingen förflyttning — bara ljusstyrka och ram. Passerade mallar stannar på 72 % så att förloppet syns."],
   ["4,2 s","Visning."],
   ["6,3 s","Såld. Alla fyra står nu tända."],
   ["7,4 s","Brödtexten under rutnätet: <i>Adress och faktarad står still. Bara mallen byts.</i>"]],
  object:[["0,0 s","Mallarna som en bunt tryckta ark. Översta arket är KOMMANDE-artboarden i 66 cqw med två skuggark under sig. Ovanför: <i>Vecka 1 · Kommande</i> spärrat i versaler. Under: adressen i Cormorant, som står still hela klippet."],
   ["2,1 s","Översta arket lyfts av — 8 cqw uppåt, opacitet till noll — och TILL SALU ligger redan under. Ingen korsfade: ett ark tas bort, nästa är redan tryckt."],
   ["4,2 s","Visning."],
   ["6,3 s","Såld. Förloppsstrecken fylls sist."],
   ["8,4 s","Slutbild hålls: fyra tryckfärdiga inlägg ur samma underlag."]]},
 format:{
  editorial:[["0,0 s","Till salu-mallen satt i 9:16, i full storlek på uppslaget. Under den: formatets namn i Cormorant och dess mått. Det är en riktig artboard ur vy 05, inte en beskuren bild."],
   ["2,2 s","Formatbytet sker under en vandrande kant: den gamla ytan tas bort uppifrån samtidigt som 4:5 sätts av samma kant. Höjden är låst, så det är BREDDEN som växer — och mallen sätter om sig själv i den."],
   ["4,4 s","1:1. Faktaraden får mer luft, bandhöjden räknas om, kolofonen står kvar. Samma mall, tredje ytan."],
   ["6,6 s","Slutbild: 1080 × 1080 · 1:1."]],
  system:[["0,0 s","Alla tre formaten uppe samtidigt, satta vid samma BREDD — eftersom alla tre exporteras 1080 px breda. Story till vänster, Inlägg och Kvadrat staplade till höger."],
   ["2,2 s","Läget vandrar till 4:5. Ram och ljusstyrka, ingen förflyttning."],
   ["4,4 s","1:1."],
   ["5,6 s","Brödtexten: <i>Alla tre är 1080 px breda. Bandet räknas om, inte layouten.</i>"]],
  object:[["0,0 s","Trimytan. En tom yta i 9:16 med olivfärgad hårlinje, och mallen redan satt i den."],
   ["2,2 s","Trimmen morfar till 4:5 på 440 ms — som en tom yta, utan innehåll. Först när ytan står stilla sätts mallen in i den, maskerad uppifrån och ned."],
   ["4,4 s","Samma sak till 1:1."],
   ["6,6 s","Slutbild: <i>Kvadrat.</i>"]]},
 white:{
  editorial:[["0,0 s","Den faktiska visningssidan, satt men utan varumärke: list, hero, status, adress, faktarad, tre ingångar och knapp. Allt utom loggan och accentfärgen är på plats."],
   ["2,2 s","Nordvik. Accentfärgen sveper över sidan från vänster som en maskerad övergång — logotypruta, statusrad, knapp och domän färgas i samma svep. Bild, adress och faktarad rör sig inte en pixel."],
   ["4,4 s","Alvhem. Samma svep, en annan färg."],
   ["6,6 s","Slutbild: <i>Samma sida, ett annat varumärke.</i>"]],
  system:[["0,0 s","Två färdiga visningssidor sida vid sida, Nordvik och Alvhem, båda dämpade. Att de står bredvid varandra är hela beviset."],
   ["2,2 s","Nordviks sida får olivram och full opacitet."],
   ["4,4 s","Markeringen flyttar till Alvhem."],
   ["5,6 s","Brödtext: <i>Innehållet är identiskt. Bara uttrycket byts.</i>"]],
  object:[["0,0 s","Sidan på 86 cqw — nästan hela ramen. Ingen förklaring: leveransen får stå för sig själv. Kontorets namn står i listen, Viewly bara i kolofonen."],
   ["2,2 s","Nordvik sveper in."],
   ["4,4 s","Alvhem."],
   ["6,6 s","Slutbild."]]},
 tredim:{
  editorial:[["0,0 s","Visningsytan som kunden faktiskt klickar i: lägesväljaren Dollhouse / Planvy / Rundvandring, vyn, och sidfoten med adress och boarea. Dollhouse aktivt."],
   ["2,2 s","Planvy sätts genom en maskerad övergång, och planritningen reser sig från platt till volym inne i vyn — en enda kamerarörelse, ease-in-out, ingen rotation."],
   ["4,4 s","Rundvandring. Samma modell, tredje läget."],
   ["6,6 s","Slutbild: <i>Kunden går igenom rummen själv.</i>"]],
  system:[["0,0 s","De tre lägena uppe samtidigt som tre visningsytor. Att det är EN modell läst på tre sätt syns bara när de står bredvid varandra."],
   ["2,0 s","Planvyn reser sig medan läget vandrar."],
   ["4,4 s","Rundvandringen tänds."],
   ["5,6 s","Brödtext: <i>Skannas en gång. Levereras i kontorets varumärke.</i>"]],
  object:[["0,0 s","Visningsytan på 92 cqw. Rubriken står på pappret ovanför, aldrig i bilden — den förra versionen satte vit text rakt på ljusa fotografier och gick inte att läsa."],
   ["2,2 s","Planvy, maskerat byte. Volymen reser sig."],
   ["4,4 s","Rundvandring."],
   ["6,6 s","Slutbild."]]}

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
      var dur = (MDUR[c.id]||6).toFixed(1).replace(".",",");
      /* Allt som går att se ska gå att få ut: de tre nyckelbilderna, hela
         klippet som bildsekvens för klippning i annat program, och samma
         klipp inspelat som video. Tidigare fanns ingenting av det här —
         man var tvungen att gå in i studion och välja rörelsen på en Story
         först, vilket inte var uppenbart för någon. */
      return '<div class="mdir">'
       +'<div class="mdirh"><b>'+esc(d.n)+'</b><span>'+esc(d.d)+'</span></div>'
       +'<div class="mkfs">'+frames+'</div>'
       + (f ? '<div class="dlrow">'
           + zipBtn("mkf",{cand:c.id, mdir:d.id, ddir:state.dir},"3 nyckelbilder · ZIP","kf-"+c.id+"-"+d.id,null)
           + zipBtn("mseq",{cand:c.id, mdir:d.id, ddir:state.dir, n:24},"Bildsekvens · 24 PNG · ZIP","seq-"+c.id+"-"+d.id,null)
           + '<button class="dlb pri" type="button" data-mv="1" data-mvcand="'+c.id
             +'" data-mvmdir="'+d.id+'" data-mvdir="'+state.dir+'">Video · '+dur+' s</button>'
           +'</div>' : '')
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
   +'<div class="dlbar"><span class="eyebrow">Ladda ner</span>'
   + zipBtn("allmkf",{ddir:state.dir},"Alla "+(MCAND.length*MDIRS.length*3)+" nyckelbilder · ZIP","nyckelbilder")
   +'<span class="mut" style="font-size:11.5px">'+MCAND.length+' kandidater × '+MDIRS.length
   +' riktningar × 3 lägen. Video och bildsekvens finns per riktning nedan.</span></div>'
   + cands;
}
