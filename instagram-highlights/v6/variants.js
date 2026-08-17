/* =====================================================================
   FÖRSLAG B OCH C

   Varje bildruta finns i tre utföranden. A är originalet nedan i HL; B och
   C ligger här som PATCHAR ovanpå det. En patch byter komposition (`p`) och
   omformulerar budskapet — den ändrar aldrig originaldatan, och egna
   redigeringar läggs alltid ovanpå det valda förslaget.

   Principen bakom paren:

     B  samma budskap, annan komposition. Vill man ha samma sak sagd men
        med en annan bildyta väljer man B.
     C  annan ingång till samma sak — oftast kortare och mer konkret, ibland
        en faktaram i stället för en känsla.

   Byter en patch primitiv måste den bära med sig det primitivet ritar:
   `split` behöver två bilder och två etiketter, `system` behöver poster,
   `matrix` format. Därför ser vissa patchar längre ut än andra.

   All copy är hämtad ur eller förenlig med respektive sida på viewly.se.
   Förslag och riktning, inte låsta krav.
   ===================================================================== */
/* ALTS deklareras i draw.js; här fylls den. */
ALTS = {

/* ---------- 01 VIEWLY ---------- */
"viewly-0":[
 {p:"fullbleed", m:"hero", k:"Viewly", h:"Bostadspresentation"},
 {p:"quiet", k:"01 — Viewly", h:"Vi levererar inte bilder.", em:"Vi levererar presentationen.",
  s:"Foto, rum, rörelse och annonsmaterial i en och samma produktion."}],
"viewly-1":[
 {p:"editorial", m:"hero", k:"Utgångspunkten", h:"Ett objekt är inte en fotografering.",
  s:"Det är en presentation — och den avgör hur bostaden möts på Hemnet."},
 {p:"mark", m:"living", k:"VIEWLY", h:"En presentation", s:"inte en mapp med filer."}],
"viewly-2":[
 {p:"quiet", k:"Tjänsterna", h:"Sju delar. Ett flöde.", em:"Var och en står för sig.",
  s:"Fotografering · 3D visning · E-styling · Atmosphere · Drönarfotografering · Områdeskarta · Motion"},
 {p:"system", k:"Vad ingår", h:"Välj det bostaden behöver.", s:"Inget är obligatoriskt. Delarna fungerar var för sig och tillsammans.",
  items:["Fotografering","3D visning","E-styling","Atmosphere","Drönarfotografering","Områdeskarta","Motion"]}],
"viewly-3":[
 {p:"quiet", k:"01 — Viewly", h:"Foto är grunden.", em:"Resten bygger på den.",
  s:"3D, e-styling och atmosfär är det som får annonsen att sticka ut."},
 {p:"split", m:["kitchen","esLivAft"], la:"Bara foto", lb:"Foto och tillägg", k:"Grunden", h:"Skillnaden"}],
"viewly-4":[
 {p:"editorial", m:"living", k:"Hantverket", h:"Varje rum fotograferas för sitt bästa läge.",
  s:"Inte för att bocka av en lista."},
 {p:"fullbleed", m:"dining", k:"", h:""}],
"viewly-5":[
 {p:"editorial", m:"portal", k:"Portalen", h:"Allt om bostaden på ett ställe.",
  s:"Boka, följ produktionen, hämta materialet — utan mejltrådar."},
 {p:"system", k:"Portalen", h:"Fyra steg.", s:"Från bokning till publicerad kampanj.",
  items:["Boka","Produktion","Leverans","Publicera"]}],
"viewly-6":[
 {p:"cta", k:"01 — Viewly", h:"Se vad bostaden kan bli", s:"viewly.se"},
 {p:"mark", m:"hero", k:"VIEWLY", h:"viewly.se", s:"Bostadspresentation, samlad."}],

/* ---------- 02 FOTOGRAFERING ---------- */
"foto-0":[
 {p:"mark", m:"hero", k:"FOTOGRAFERING", h:"Bostadsfotografering", s:"Genomtänkta fotopaket, anpassade efter bostaden."},
 {p:"editorial", m:"hero", k:"02 — Fotografering", h:"Foto är grunden.",
  s:"Allt annat vi gör bygger på bilderna från den här dagen."}],
"foto-1":[
 {p:"editorial", m:"kitchen", k:"Ljuset", h:"Vi väntar in det.", s:"Vi lägger inte till det. Rätt timme gör mer för ett rum än någon efterbearbetning."},
 {p:"split", m:["kitchen","hero"], la:"Fel timme", lb:"Rätt timme", k:"Ljuset", h:"Timing"}],
"foto-2":[
 {p:"editorial", m:"kitchen", k:"Rymd", h:"Ett rum ska kännas.", s:"Inte mätas. Perspektivet ska visa hur bostaden används, inte hur stor den är på pappret."},
 {p:"quiet", k:"02 — Fotografering", h:"Rymd.", em:"Ett rum ska kännas.", s:"Inte mätas."}],
"foto-3":[
 {p:"fullbleed", m:"boucle", k:"Detalj", h:"Det som gör ett hus till ett hem"},
 {p:"split", m:["boucle","eames"], la:"Textur", lb:"Form", k:"Detalj", h:"Närbilderna"}],
"foto-4":[
 {p:"quiet", k:"Omfattning", h:"Inget fast antal.", em:"Alla bilder som tillför värde.",
  s:"Lägenhet 15–35 bilder, villa 25–50. Leverans 1–3 dagar. Från 1 800 kr exkl. moms."},
 {p:"system", k:"Vad du får", h:"Fyra löften.", s:"Samma för varje objekt, oavsett storlek.",
  items:["Alla bilder som tillför värde","Leverans 1–3 arbetsdagar","Bilder klara för Hemnet","Från 1 800 kr exkl. moms"]}],
"foto-5":[
 {p:"editorial", m:"drone", k:"Exteriör", h:"Bostaden i sitt sammanhang.", s:"Fasad, tomt och läge — fotograferat när ljuset gör dem rättvisa."},
 {p:"case", m:"drone", k:"Exteriör", h:"Fasaden", s:"Blue hour"}],
"foto-6":[
 {p:"cta", k:"02 — Fotografering", h:"Boka fotografering", s:"Från 1 800 kr exkl. moms"},
 {p:"quiet", k:"02 — Fotografering", h:"Fotograferingen är början.", em:"Inte leveransen.",
  s:"Se hela ekosystemet på viewly.se"}],

/* ---------- 03 3D VISNING ---------- */
"visning-0":[
 {p:"fullbleed", m:"matterport", k:"03 — 3D visning", h:"Visning dygnet runt"},
 {p:"quiet", k:"3D VISNING", h:"Annonsen stänger.", em:"Visningen gör det inte.",
  s:"En upplevelse som stannar kvar efter att annonsen är borta."}],
"visning-1":[
 {p:"editorial", m:"matterport", k:"Tillgänglighet", h:"Låt spekulanten kliva in.",
  s:"När som helst, var som helst, hur många gånger som helst."},
 {p:"system", k:"Vad det ger", h:"Fyra siffror.", s:"Från våra egna visningssidor.",
  items:["99 % vill ha 3D i annonsen","90 % väljer bostad med 3D först","32 % snabbare försäljning","9 % högre slutpris"]}],
"visning-2":[
 {p:"editorial", m:"threed", k:"I visningen", h:"Dollhouse och planritning.",
  s:"Inbyggt mätverktyg och guidade rundturspunkter leder blicken genom bostaden."},
 {p:"system", k:"Inbyggt", h:"Fyra verktyg.", s:"Ingen app, ingen inloggning.",
  items:["Dollhouse-vy","Planritning","Mätverktyg","Guidade rundturspunkter"]}],
"visning-3":[
 {p:"whitelabel", m:"matterport", k:"White label", h:"Er logga. Era färger.",
  s:"Kontoret sätter uttrycket en gång. Varje ny visningssida byggs automatiskt i det.",
  brands:[["Nordvik","#1F3A2E","Se bostaden"],["Alvhem","#7A3B2E","Boka visning"]]},
 {p:"whitelabel", m:"threedcam", k:"Levereras i ert varumärke", h:"Aldrig i vårt.",
  s:"Logotyp, färger, typografi och knappstil är kontorets. Viewly syns inte på sidan.",
  brands:[["Kontor A","#8A5A1A","Starta visning"],["Kontor B","#3D5A7A","Visa bostaden"]]}],
"visning-4":[
 {p:"quiet", k:"Så går det till", h:"Skanning på plats.", em:"Länk inom 1–3 dagar.",
  s:"Boka skanning · Matterport-produktion · Länk klar att publicera"},
 {p:"product", m:"threedcam", k:"Så går det till", h:"Vi skannar. Ni publicerar.",
  s:"1–3 arbetsdagar från skanning till färdig länk."}],
"visning-5":[
 {p:"system", k:"Räckvidd", h:"Fungerar där annonsen finns.", s:"En länk, alla kanaler.",
  items:["Hemnet","Booli","Hitta Hem","Mäklarsystem och egen hemsida"]},
 {p:"quiet", k:"03 — 3D visning", h:"En länk.", em:"Alla kanaler.",
  s:"Hemnet, Booli, Hitta Hem, mäklarsystem och egna hemsidor."}],
"visning-6":[
 {p:"cta", k:"03 — 3D visning", h:"Boka skanning", s:"Länk klar inom 1–3 dagar"},
 {p:"mark", m:"matterport", k:"3D VISNING", h:"Öppet dygnet runt", s:"viewly.se/3d-visning"}],

/* ---------- 04 E-STYLING ---------- */
"estyling-0":[
 {p:"mark", m:"esLivAft", k:"E-STYLING", h:"Starkare presentation", s:"Tydligare bostad."},
 {p:"split", m:["esLivBef","esLivAft"], la:"Tomt", lb:"Möblerat", k:"04 — E-styling", h:"Digital inredning"}],
"estyling-1":[
 {p:"editorial", m:"esBedAft", k:"Poängen", h:"Vi skapar liv i tomma rum.",
  s:"Ett tomt rum är svårt att läsa. Möblerat blir det en bostad att föreställa sig i."},
 {p:"system", k:"Vad det ger", h:"Fyra siffror.", s:"Från e-stylade objekt.",
  items:["83 % lättare att föreställa sig hemmet","60 % fler visningsbokningar","48 % kortare tid till affär","20 % höjde buden"]}],
"estyling-2":[
 {p:"split", m:["esLivBef","esLivAft"], la:"Original", lb:"E-stylat", k:"Vardagsrum", h:"Samma rum"},
 {p:"fullbleed", m:"esLivAft", k:"Vardagsrum", h:"E-stylat"}],
"estyling-3":[
 {p:"split", m:["esBedBef","esBedAft"], la:"Original", lb:"E-stylat", k:"Sovrum", h:"Samma rum"},
 {p:"editorial", m:"esBedAft", k:"Sovrum", h:"Möblerat för svensk marknad.",
  s:"Stilen väljs efter bostaden och köparen — inte efter en katalog."}],
"estyling-4":[
 {p:"quiet", k:"Så går det till", h:"Ladda upp bilderna.", em:"Annonsklart på 1–3 dagar.",
  s:"Välj stil och paket. Vi gör resten."},
 {p:"product", m:"esLivAft", k:"Så går det till", h:"Tre steg.", s:"Ladda upp · välj stil och paket · annonsklart på 1–3 dagar."}],
"estyling-5":[
 {p:"quiet", k:"Transparens", h:"Både original och e-stylat.", em:"Alltid båda.",
  s:"Alla e-stylade bilder är tydligt märkta, så att marknadsföringen följer kraven på transparens."},
 {p:"system", k:"Villkoren", h:"Tre löften.", s:"Så att ingen behöver fråga.",
  items:["Du får både original och e-stylat","Alla e-stylade bilder är märkta","Omgjort inom 24 timmar utan kostnad"]}],
"estyling-6":[
 {p:"cta", k:"04 — E-styling", h:"Ladda upp bilderna", s:"Annonsklart på 1–3 dagar"},
 {p:"quiet", k:"04 — E-styling", h:"Bostadens fulla potential.", em:"Alltid ärligt mot rummet.",
  s:"Vi möblerar. Vi flyttar inga väggar."}],

/* ---------- 05 ATMOSPHERE ---------- */
"atmosphere-0":[
 {p:"fullbleed", m:"skyAft", k:"05 — Atmosphere", h:"Ge annonsen wow-faktorn"},
 {p:"quiet", k:"ATMOSPHERE", h:"Vädret bestämde.", em:"Nu gör det inte det.",
  s:"Ljus, väder och årstid — justerat efter hur bostaden faktiskt ser ut när den är som bäst."}],
"atmosphere-1":[
 {p:"editorial", m:"vadBef", k:"Problemet", h:"Grå himmel. Skarpa skuggor.",
  s:"Många bostäder fotograferas när förutsättningarna är som sämst — och annonsen ligger uppe i månader."},
 {p:"split", m:["vadBef","vadAft"], la:"Som det var", lb:"Som det kan vara", k:"05 — Atmosphere", h:"Samma dag"}],
"atmosphere-2":[
 {p:"split", m:["skyBef","skyAft"], la:"Eftermiddag", lb:"Skymning", k:"Effekt 01", h:"Skymning"},
 {p:"fullbleed", m:"skyAft", k:"Effekt 01 — Skymning", h:""}],
"atmosphere-3":[
 {p:"split", m:["vadBef","vadAft"], la:"Mulet", lb:"Klart", k:"Effekt 02", h:"Blå himmel"},
 {p:"editorial", m:"vadAft", k:"Effekt 02", h:"Blå himmel.", s:"Himlen byts, inte huset. Fasad, tomt och skuggor följer med i rätt riktning."}],
"atmosphere-4":[
 {p:"quiet", k:"Effekt 03", h:"Sommar.", em:"Trädgården som ännu inte blommat fram.",
  s:"Grön, i juni — även när bilderna togs i mars.",
  need:"Före/efter-par för sommareffekten saknas. Behövs: samma tomt grå respektive grönskande."},
 {p:"system", k:"Effekterna", h:"Tre lägen.", s:"Väljs per bild, inte per objekt.",
  items:["Skymning","Blå himmel","Sommar"]}],
"atmosphere-5":[
 {p:"editorial", m:"skyAft", k:"Gränsen", h:"Inga möbler flyttas.",
  s:"Vi ändrar ljus, väder och årstid. Ingenting annat. Annonsklara bilder inom 1–3 arbetsdagar."},
 {p:"system", k:"Gränsen", h:"Vad vi rör.", s:"Och vad vi aldrig rör.",
  items:["Ljus — ja","Väder — ja","Årstid — ja","Möbler och objekt — aldrig"]}],
"atmosphere-6":[
 {p:"cta", k:"05 — Atmosphere", h:"Rätt förutsättningar", s:"Annonsklart inom 1–3 dagar"},
 {p:"mark", m:"skyAft", k:"ATMOSPHERE", h:"Wow-faktorn", s:"viewly.se/atmosphere"}],

/* ---------- 06 DRÖNARE ---------- */
"dronare-0":[
 {p:"mark", m:"drone", k:"DRÖNARFOTOGRAFERING", h:"Upplev från luften", s:"Perspektivet som visar mer än bostaden."},
 {p:"editorial", m:"drone", k:"06 — Drönare", h:"Läget syns inte från marken.",
  s:"Luftbilder visar tomt, omgivning och avstånd på ett sätt en fasadbild aldrig kan."}],
"dronare-1":[
 {p:"editorial", m:"drone", k:"Perspektivet", h:"Marken visar bostaden. Luften visar läget.",
  s:"Tomtens storlek, grannskapet, vattnet bakom huset — sådant som avgör men sällan syns."},
 {p:"case", m:"drone", k:"Från luften", h:"Läget", s:"Tomt, omgivning, helhet"}],
"dronare-2":[
 {p:"fullbleed", m:"drone", k:"Vad bilderna visar", h:"Läge, tomt och omgivning"},
 {p:"quiet", k:"06 — Drönare", h:"Ett perspektiv marken inte kan ge.", em:"Läget, tomten, helheten.",
  s:"Efterbearbetade flygbilder och korta klipp."}],
"dronare-3":[
 {p:"quiet", k:"Leverans", h:"Bilder och klipp.", em:"Klara att publicera.",
  s:"Flygbilder för Hemnet och prospekt, korta klipp för sociala medier. Flygning enligt gällande regler. 1–3 dagar."},
 {p:"system", k:"Leverans", h:"Vad du får.", s:"Efterbearbetat och publiceringsklart.",
  items:["Flygbilder — Hemnet och prospekt","Korta klipp — sociala medier","Flygning enligt gällande regler","Leverans 1–3 dagar"]}],
"dronare-4":[
 {p:"editorial", m:"hero", k:"Helheten", h:"Bostaden i sitt kvarter.",
  s:"En bild som placerar objektet — inte bara visar det.",
  need:"Flygbild i blue hour — helheten med bostaden i sitt kvarter."},
 {p:"split", m:["hero","drone"], la:"Från marken", lb:"Från luften", k:"Helheten", h:"Två perspektiv",
  need:"Flygbild i blue hour som B-sida."}],
"dronare-5":[
 {p:"cta", k:"06 — Drönare", h:"Lägg till flygning", s:"Bokas med fotograferingen"},
 {p:"quiet", k:"06 — Drönare", h:"Boka flygning.", em:"Läget säljer.",
  s:"viewly.se/dronarfotografering"}],

/* ---------- 07 OMRÅDESKARTA ---------- */
"omradeskarta-0":[
 {p:"fullbleed", m:"drone", k:"07 — Områdeskarta", h:"Läget, servicen, sammanhanget",
  need:"Ingen områdeskarta finns i biblioteket. Behövs: renderad karta 9:16."},
 {p:"quiet", k:"OMRÅDESKARTA", h:"En stiliserad karta.", em:"Bostaden i sitt sammanhang.",
  s:"Kommunikationer, skolor, service och natur — samlat i en bild.",
  need:"Ingen områdeskarta finns i biblioteket."}],
"omradeskarta-1":[
 {p:"editorial", m:"drone", k:"Varför", h:"Köparen väljer inte bara bostad.",
  s:"Hen väljer läge. Kartan svarar på den frågan innan någon hinner ställa den.",
  need:"Produktbild: faktisk områdeskarta."},
 {p:"mark", m:"drone", k:"OMRÅDESKARTA", h:"Läget", s:"Köparen väljer inte bara bostad — hen väljer läge.",
  need:"Produktbild: faktisk områdeskarta."}],
"omradeskarta-2":[
 {p:"system", k:"På kartan", h:"Fyra lager.", s:"Markerade runt bostaden, i kontorets uttryck.",
  items:["Kommunikationer","Skolor","Service","Natur"], need:"Produktbild: faktisk områdeskarta i 9:16."},
 {p:"editorial", m:"drone", k:"Kartan", h:"Ett elegant komplement till annonsen.",
  s:"Inte en skärmdump från Google — en ritad karta i kontorets grafiska profil.",
  need:"Produktbild: faktisk områdeskarta i 9:16."}],
"omradeskarta-3":[
 {p:"whitelabel", m:"drone", k:"White label", h:"Ert formspråk. Varje objekt.",
  s:"Samma uttryck på varje karta gör kontorets annonser igenkännbara i flödet.",
  brands:[["Nordvik","#1F3A2E","Se området"],["Alvhem","#7A3B2E","Se området"]],
  need:"Korten ska visa två faktiska kartor, en i vardera kontors färger."},
 {p:"whitelabel", m:"drone", k:"Levereras i ert varumärke", h:"Inte i vårt.",
  s:"Färger, typsnitt och format anpassas efter kontorets grafiska profil.",
  brands:[["Kontor A","#8A5A1A","Se området"],["Kontor B","#3D5A7A","Se området"]],
  need:"Korten ska visa två faktiska kartor."}],
"omradeskarta-4":[
 {p:"quiet", k:"Leverans", h:"Högupplöst PNG.", em:"Inom 1–2 arbetsdagar.",
  s:"Klar för prospekt, Hemnet och sociala medier.",
  need:"Kartan i användning — i prospekt eller Hemnet-annons."},
 {p:"system", k:"Leverans", h:"Tre saker.", s:"Inget mer behöver beställas.",
  items:["Högupplöst PNG","Kontorets grafiska profil","Inom 1–2 arbetsdagar"],
  need:"Kartan i användning."}],
"omradeskarta-5":[
 {p:"cta", k:"07 — Områdeskarta", h:"Beställ områdeskarta", s:"Klar inom 1–2 arbetsdagar"},
 {p:"mark", m:"drone", k:"OMRÅDESKARTA", h:"Läget", s:"viewly.se/omradeskarta",
  need:"Renderad karta 9:16."}],

/* ---------- 08 MOTION ---------- */
"motion-0":[
 {p:"fullbleed", m:"dining", k:"08 — Motion", h:"Bostadsfilm", need:"Nyckelbildruta ur faktisk Motion-film."},
 {p:"quiet", k:"MOTION", h:"Bostadsfilm.", em:"Utan en separat filmning.",
  s:"Motion bygger filmen av fotograferingen som redan är gjord."}],
"motion-1":[
 {p:"editorial", m:"dining", k:"Idén", h:"Bilderna finns redan.",
  s:"Motion skapar en sammanhängande film av dem — kamerarörelser, klippning och musik.",
  need:"Nyckelbildruta ur faktisk Motion-film."},
 {p:"mark", m:"living", k:"MOTION", h:"Nästa steg", s:"Filmen byggs av fotograferingen."}],
"motion-2":[
 {p:"editorial", m:"dining2", k:"Rörelsen", h:"Naturliga kamerarörelser.",
  s:"Ingen zoom, ingen effekt — en långsam rörelse som låter rummet tala.",
  need:"Motion-frame med synlig rörelseoskärpa."},
 {p:"fullbleed", m:"dining2", k:"Rörelse", h:"", need:"Motion-frame med synlig rörelseoskärpa."}],
"motion-3":[
 {p:"quiet", k:"Så byggs filmen", h:"Fyra steg.", em:"Bilderna, rörelsen, redigeringen, filmen.",
  s:"Genomtänkt klippning och musik som lyfter helheten."},
 {p:"product", m:"dining", k:"Så byggs filmen", h:"Bilderna blir en berättelse.",
  s:"Rörelse, klippning och musik — i den ordningen."}],
"motion-4":[
 {p:"system", k:"Format", h:"En film, tre format.", s:"Samma klipp genom hela kanalen.",
  items:["9:16 — Story och Reel","1:1 — Kvadrat i flödet","4:5 — Inlägg"]},
 {p:"matrix", m:"living", k:"Format", h:"Ett klipp, alla ytor.",
  fmts:[["9:16","Reel",9,16],["4:5","Inlägg",4,5],["1:1","Kvadrat",1,1]],
  s:"Instagram, Facebook och LinkedIn ur samma film."}],
"motion-5":[
 {p:"system", k:"Varför", h:"Tre skäl.", s:"Utan en extra produktionsdag.",
  items:["Syns i flödet","Ger bostaden sammanhang","Kostar ingen extra fotografering"]},
 {p:"editorial", m:"dining", k:"Varför", h:"Kostar ingen extra fotografering.",
  s:"Rörligt syns i flödet där stillbilden scrollas förbi — och bostaden får sammanhang."}],
"motion-6":[
 {p:"cta", k:"08 — Motion", h:"Beställ Motion", s:"Byggs av fotograferingen"},
 {p:"quiet", k:"08 — Motion", h:"Låt bostaden ta plats.", em:"I rörelse.", s:"viewly.se/motion"}],

/* ---------- 09 ANNONSEN ---------- */
"annonsen-0":[
 {p:"fullbleed", m:"kitchen", k:"09 — Annonsskrivaren", h:"Annonsen på trettio sekunder"},
 {p:"quiet", k:"ANNONSSKRIVAREN", h:"Objektbeskrivningen.", em:"Inte längre en flaskhals.",
  s:"Fyll i bostaden, ladda upp bilderna, få ett färdigt utkast."}],
"annonsen-1":[
 {p:"editorial", m:"kitchen", k:"Så snabbt", h:"Färdig bostadsannons på 30 sekunder.",
  s:"Fyll i bostaden. Ladda upp bilderna. Läs igenom och justera."},
 {p:"product", m:"portal", k:"Så snabbt", h:"30 sekunder.", s:"Från uppladdade bilder till läsbart utkast.",
  need:"Produktbild Annonsskrivaren 9:16."}],
"annonsen-2":[
 {p:"system", k:"Vad AI:n läser", h:"Sex signaler.", s:"Ur bilderna du laddar upp — inte ur en mall.",
  items:["Ljusinsläpp","Takhöjd och volym","Material och ytskikt","Planlösning","Utsikt och läge","Områdets karaktär"]},
 {p:"editorial", m:"living", k:"Underlaget", h:"Texten skrivs ur bilderna.",
  s:"Ljus, takhöjd, material, planlösning, utsikt och områdets karaktär — läst ur det du laddat upp."}],
"annonsen-3":[
 {p:"quiet", k:"Tonläge", h:"Tre röster.", em:"Samma bostad, olika tilltal.",
  s:"Saklig, varm eller exklusiv. Två omskrivningar ingår."},
 {p:"split", m:["kitchen","boucle"], la:"Saklig", lb:"Exklusiv", k:"Tonläge", h:"Samma bostad"}],
"annonsen-4":[
 {p:"quiet", k:"Din text", h:"Utkastet är ditt att ändra.", em:"Ingenting publiceras automatiskt.",
  s:"Du redigerar, kortar och godkänner.", need:"Produktbild Annonsskrivaren 9:16: redigeringsvyn."},
 {p:"system", k:"Kontrollen", h:"Tre saker som gäller.", s:"Verktyget skriver. Du bestämmer.",
  items:["Ingenting publiceras automatiskt","Två omskrivningar ingår","Texten är din att ändra"]}],
"annonsen-5":[
 {p:"cta", k:"09 — Annonsen", h:"Testa Annonsskrivaren", s:"viewly.se/annonsskrivaren"},
 {p:"mark", m:"kitchen", k:"ANNONSSKRIVAREN", h:"Trettio sekunder", s:"till ett färdigt utkast."}],

/* ---------- 10 KAMPANJEN ---------- */
"kampanjen-0":[
 {p:"fullbleed", m:"hero", k:"10 — Social / Ads Studio", h:"Ett objekt, en kampanj"},
 {p:"quiet", k:"SOCIAL / ADS STUDIO", h:"Ett objekt.", em:"En komplett kampanj.",
  s:"Mallarna är satta. Innehållet fylls i åt dig."}],
"kampanjen-1":[
 {p:"quiet", k:"Mallbiblioteket", h:"Kontorets egna mallar.", em:"Obegränsat antal.",
  s:"I valfritt format. Designen är satt — innehållet fylls i åt dig.",
  need:"Skärmbild ur Social / Ads Studio: mallbiblioteket."},
 {p:"system", k:"Mallbiblioteket", h:"Tre saker som är satta.", s:"En gång, sedan aldrig igen.",
  items:["Kontorets design","Obegränsat antal mallar","Valfritt format"],
  need:"Skärmbild ur Social / Ads Studio."}],
"kampanjen-2":[
 {p:"matrix", m:"living", k:"Format", h:"Samma mall, alla ytor.",
  fmts:[["9:16","Story",9,16],["4:5","Inlägg",4,5],["1:1","Kvadrat",1,1]],
  s:"Instagram, Facebook och LinkedIn ur en och samma export."},
 {p:"system", k:"Format", h:"Tre ytor.", s:"Exporteras samtidigt ur samma mall.",
  items:["4:5 — Inlägg, störst yta i flödet","1:1 — Kvadrat i profilrutnätet","9:16 — Story och Reel"]}],
"kampanjen-3":[
 {p:"phases", k:"Kampanjen", h:"Fyra lägen. Ett objekt.", now:2,
  items:["p1","p2","p3","p4"],
  s:"Mallen byts när kampanjen går vidare — bilden, adressen och fakta står kvar."},
 {p:"phases", k:"Status styr allt", h:"Inte en etikett i hörnet.", now:3,
  items:["p1","p2","p3","p4"],
  s:"Kommande håller tillbaka. Till salu är tätast. Visning säger en sak. Såld låter ordet ta över."}],
"kampanjen-4":[
 {p:"system", k:"Export", h:"Fyra vägar ut.", s:"När mallarna är satta tar det under en minut.",
  items:["JPG","PNG","PDF","Hela serien som zip"]},
 {p:"editorial", m:"portal", k:"Export", h:"Under en minut.", s:"Ladda ner som JPG, PNG eller PDF — eller hela serien som zip.",
  need:"Skärmbild: exportvyn."}],
"kampanjen-5":[
 {p:"cta", k:"10 — Kampanjen", h:"Öppna Social / Ads Studio", s:"viewly.se/some-studio"},
 {p:"mark", m:"hero", k:"SOCIAL / ADS STUDIO", h:"Ett objekt", s:"Hela kampanjen."}],

/* ---------- 11 SYSTEMET ---------- */
"systemet-0":[
 {p:"mark", m:"portal", k:"SYSTEMET", h:"Mäklarportalen", s:"Mer tid för affären."},
 {p:"editorial", m:"hero", k:"11 — Systemet", h:"Mindre tid i mappar.",
  s:"Beställning, produktion, material och fakturering på samma ställe."}],
"systemet-1":[
 {p:"editorial", m:"portal", k:"Mäklarportalen", h:"Ett ställe för hela bostaden.",
  s:"Boka, följ produktionen, hämta materialet, publicera.",
  need:"Vertikala portalskärmar 9:16."},
 {p:"quiet", k:"Mäklarportalen", h:"Ett ställe.", em:"Hela bostaden.",
  s:"Boka, följ, hämta, publicera — utan en enda mejltråd."}],
"systemet-2":[
 {p:"quiet", k:"Flödet", h:"Fyra steg.", em:"Från bokning till publicerad kampanj.",
  s:"Boka · Produktion · Leverans · Publicera"},
 {p:"product", m:"portal", k:"Flödet", h:"Du ser var objektet står.", s:"Hela vägen, i realtid.",
  need:"Vertikal portalvy: produktionsstatus."}],
"systemet-3":[
 {p:"quiet", k:"Skillnaden", h:"Inte en mapp med filer.", em:"En färdig presentation.",
  s:"Redo att publiceras, i rätt format, med rätt text."},
 {p:"split", m:["hero","portal"], la:"Filer", lb:"Presentation", k:"Skillnaden", h:"Vad du får"}],
"systemet-4":[
 {p:"system", k:"Samlat", h:"Fyra saker på ett ställe.", s:"En faktura. Ett konto.",
  items:["Beställning","Mallar","Material","Fakturering"]},
 {p:"editorial", m:"portal", k:"Samlat", h:"En faktura. Ett konto.",
  s:"Beställning, mallar, material och fakturering på samma ställe.",
  need:"Vertikal portalvy: faktureringsöversikt."}],
"systemet-5":[
 {p:"cta", k:"11 — Systemet", h:"Skapa konto", s:"viewly.se"},
 {p:"mark", m:"portal", k:"SYSTEMET", h:"Ett ställe", s:"Hela produktionen."}],

/* ---------- 12 OBJEKT ---------- */
"objekt-0":[
 {p:"mark", m:"drone", k:"OBJEKT 01", h:"Silvergården 9A", s:"Landskrona",
  need:"Verklig exteriör för caset."},
 {p:"fullbleed", m:"drone", k:"Objekt 01 — Landskrona", h:"Silvergården 9A",
  need:"Verklig exteriör för caset."}],
"objekt-1":[
 {p:"editorial", m:"living", k:"Interiör", h:"Samma dag, samma ljus.",
  s:"Alla bilder i kapitlet kommer från ett och samma objekt.", need:"Interiör från samma objekt."},
 {p:"case", m:"living", k:"Objekt 01", h:"Interiören", s:"Silvergården 9A", need:"Interiör från samma objekt."}],
"objekt-2":[
 {p:"fullbleed", m:"eames", k:"Detalj", h:"", need:"Detalj från samma objekt."},
 {p:"split", m:["eames","boucle"], la:"Detalj", lb:"Material", k:"Objekt 01", h:"Närbilderna",
  need:"Två detaljer från samma objekt."}],
"objekt-3":[
 {p:"editorial", m:"threed", k:"3D", h:"Planlösningen.", s:"Samma bostad, nu att gå igenom.",
  need:"3D-vy från samma objekt."},
 {p:"fullbleed", m:"threed", k:"3D-visning", h:"", need:"3D-vy från samma objekt."}],
"objekt-4":[
 {p:"editorial", m:"dining2", k:"Rörelse", h:"Och som film.", s:"Motion byggd av samma fotografering.",
  need:"Motion-frame från samma objekt."},
 {p:"case", m:"dining2", k:"Objekt 01", h:"Filmen", s:"Motion", need:"Motion-frame från samma objekt."}],
"objekt-5":[
 {p:"system", k:"Ett objekt", h:"Fem leveranser.", s:"Silvergården 9A, från en enda bokning.",
  items:["Fotografering","3D visning","Motion","Annonstext","Kampanjmallar"]},
 {p:"cta", k:"12 — Objekt", h:"Se fler objekt", s:"viewly.se"}],

/* ---------- 13 INIFRÅN ---------- */
"inifran-0":[
 {p:"fullbleed", m:"om1", k:"13 — Inifrån", h:"Människorna bakom"},
 {p:"editorial", m:"om1", k:"INIFRÅN", h:"Vilka vi är.", s:"Fotografer, redigerare och utvecklare i samma organisation."}],
"inifran-1":[
 {p:"editorial", m:"om3", k:"Hållningen", h:"Vi bygger inte för igår.",
  s:"Bostäder marknadsförs på skärm nu. Presentationen borde vara byggd för det."},
 {p:"mark", m:"om3", k:"INIFRÅN", h:"Byggt för idag", s:"inte för hur det såg ut igår."}],
"inifran-2":[
 {p:"quiet", k:"Så arbetar vi", h:"Hantverk och teknik.", em:"Ingen av delarna räcker ensam.",
  s:"Fotografen ser rummet. Systemet ser till att det kommer fram."},
 {p:"system", k:"Så arbetar vi", h:"Fyra roller.", s:"Samma organisation, samma leverans.",
  items:["Fotograf på plats","Redigering","Produktion","Support"]}],
"inifran-3":[
 {p:"editorial", m:"om4", k:"Platsen", h:"Vi är där bostaden är.", s:"Fotograferna arbetar lokalt, systemet är detsamma överallt."},
 {p:"fullbleed", m:"om4", k:"", h:""}],
"inifran-4":[
 {p:"quiet", k:"Fotograferna", h:"Fotografen är inte en underleverantör.", em:"Fotografen är Viewly.",
  s:"Samma hantverk, samma standard, samma leverans.", need:"Reportagebild: fotograf i arbete på plats."},
 {p:"case", m:"kontakt", k:"Fotograferna", h:"Fotografen är Viewly", s:"Inte en underleverantör",
  need:"Reportagebild: fotograf i arbete på plats."}],
"inifran-5":[
 {p:"editorial", m:"om1", k:"Att arbeta med oss", h:"Din blick. Ditt hantverk.",
  s:"Vår organisation, våra kunder, vårt system. Du fotograferar."},
 {p:"system", k:"Att arbeta med oss", h:"Fyra saker vi står för.", s:"Du tar med dig blicken.",
  items:["Uppdrag i ditt område","Fast ersättning","Redigering ingår","Utrustningsstöd"]}],
"inifran-6":[
 {p:"cta", k:"13 — Inifrån", h:"Fotografera med Viewly", s:"viewly.se/fotografer"},
 {p:"mark", m:"kontakt", k:"INIFRÅN", h:"Bli fotograf", s:"viewly.se/fotografer"}],

/* ---------- 14 DITT HEM ---------- */
"ditthem-0":[
 {p:"mark", m:"dining", k:"DITT HEM", h:"Din bostad", s:"säljs en gång."},
 {p:"editorial", m:"dining", k:"14 — Ditt hem", h:"Presentationen betyder något.",
  s:"De flesta möter bostaden på en skärm, långt innan de går på visning."}],
"ditthem-1":[
 {p:"editorial", m:"living", k:"Varför", h:"Ditt hem säljs en gång.",
  s:"Det första intrycket sker på Hemnet, i en scroll, på några sekunder."},
 {p:"fullbleed", m:"living", k:"14 — Ditt hem", h:"En gång"}],
"ditthem-2":[
 {p:"editorial", m:"living", k:"Vad som ingår", h:"Foto, rum och rörelse.",
  s:"Din mäklare beställer. Vi producerar. Du ser resultatet i annonsen."},
 {p:"quiet", k:"14 — Ditt hem", h:"Din mäklare beställer.", em:"Vi producerar.",
  s:"Foto, 3D, e-styling och film — i en och samma presentation."}],
"ditthem-3":[
 {p:"system", k:"Vad Viewly tillför", h:"Fyra delar.", s:"Beställs av mäklaren, syns i annonsen.",
  items:["Fotografering","3D visning","E-styling","Motion"]},
 {p:"split", m:["esLivBef","esLivAft"], la:"Utan", lb:"Med Viewly", k:"Vad Viewly tillför", h:"Skillnaden"}],
"ditthem-4":[
 {p:"cta", k:"14 — Ditt hem", h:"Fråga din mäklare om Viewly", s:"viewly.se"},
 {p:"quiet", k:"14 — Ditt hem", h:"Arbetar din mäklare med Viewly?", em:"Fråga innan ni bestämmer.",
  s:"viewly.se"}],

/* ---------- 15 EKOSYSTEMET ----------
   Inga fotografier här heller, i något av förslagen. Kapitlet ska bära
   sambandet mellan delarna, och det syns bara i geometri och typografi. */
"ekosystem-0":[
 {p:"quiet", k:"15 — Ekosystemet", h:"Sju tjänster.", em:"En kedja.",
  s:"Varje del gör nästa enklare. Det är det som skiljer ett ekosystem från en prislista."},
 {p:"chain", k:"Ekosystemet", h:"Så hänger det ihop.", now:4,
  items:[["Ett besök","All produktion sker vid samma tillfälle."],
         ["Ett underlag","Materialet återanvänds i alla kanaler."],
         ["En leverans","Portalen samlar allt färdigt att publicera."]],
  s:"Ett objekt bär hela marknadsföringen."}],

"ekosystem-1":[
 {p:"system", k:"Grundmaterialet", h:"Fem produktioner, ett besök.",
  items:["Fotografering — grunden allt annat bygger på",
         "3D visning — bostaden att gå igenom",
         "Drönare — läget och omgivningen",
         "E-styling — tomma rum får möbler",
         "Atmosphere — känslan och ljuset"],
  s:"Det som spelas in på plats blir underlaget för allt som kommer sedan."},
 {p:"quiet", k:"Grundmaterialet", h:"Allt börjar i bostaden.", em:"En gång.",
  s:"Foto, 3D, drönare, e-styling och Atmosphere i samma produktion."}],

"ekosystem-2":[
 {p:"system", k:"Förädlingen", h:"Samma objekt, vidare.",
  items:["Planritning — måtten ur 3D-skanningen",
         "Motion — bostadsfilmen ur fotograferingen",
         "Områdeskarta — läget satt i kontorets varumärke",
         "Annonstext — objektbeskrivningen ur underlaget",
         "Social / Ads — kampanjen i alla format"],
  s:"Ingenting produceras om. Materialet arbetar vidare genom hela plattformen."},
 {p:"chain", k:"Förädlingen", h:"Underlaget arbetar vidare.",
  items:[["Ur skanningen","Planritning och rundvandring."],
         ["Ur fotograferingen","Bostadsfilm och stillbilder till annonsen."],
         ["Ur uppgifterna","Annonstext, kampanj och sociala medier."]],
  s:"Tre led, ett underlag."}],

"ekosystem-3":[
 {p:"orbit", k:"Arbetsflödet", dir:"out", h:"Fem steg ur ett intag.",
  items:["Intagning","Produktion","Portal","Annons","Kampanj"],
  s:"Du beställer i steg ett och hämtar i steg fem. Däremellan gör vi arbetet."},
 {p:"quiet", k:"Arbetsflödet", h:"En beställning.", em:"Fem steg.",
  s:"Intagning, produktion, mäklarportal, annonsskrivaren, Social / Ads Studio."}],

"ekosystem-4":[
 {p:"system", k:"Administrationen", h:"Vad du slipper.",
  items:["Boka och samordna fotograf och filmare",
         "Beställa 3D och vänta på leverans",
         "Ladda upp samma bilder i tre verktyg",
         "Skriva objektbeskrivningen från början",
         "Bygga om kampanjen för varje format"],
  s:"Allt det ligger i ett flöde i stället för hos fem leverantörer."},
 {p:"chain", k:"Administrationen", h:"Från sex kontakter till en.",
  items:[["Förut","Fotograf, filmare, 3D, stylist, textbyrå, annonsverktyg."],
         ["Nu","En beställning i portalen."],
         ["Vinsten","Tiden går till försäljningen i stället."]],
  s:"Mäklaren slutar koordinera leverantörer."}],

"ekosystem-5":[
 {p:"chain", k:"Vad det ger", h:"Fyra effekter.",
  items:[["Vinna fler uppdrag","En starkare presentation redan i intaget."],
         ["Starkare varumärke","Allt levereras i kontorets uttryck."],
         ["Ökade intäkter","Fler objekt genom mindre administration."],
         ["Starkare affärer","Bättre underlag ger bättre budgivning."]],
  s:"Målet är inte bättre bostadsbilder utan en mer komplett marknadsföring."},
 {p:"quiet", k:"Vad det ger", h:"Fler uppdrag.", em:"Mindre administration.",
  s:"Starkare varumärke, ökade intäkter och bättre underlag i varje affär."}],

"ekosystem-6":[
 {p:"orbit", k:"Kedjan", dir:"out", h:"Produktion, presentation, marknadsföring.",
  items:["Produktion","Presentation","Marknadsföring"],
  s:"Tre led som brukar ligga hos tre leverantörer. Här är de ett."},
 {p:"portal", k:"Kedjan", h:"Tre led, en leverantör.",
  before:["Produktion","Presentation","Marknadsföring"],
  plate:"Viewly",
  after:["Materialet skapas en gång","Objektet sätts i portalen","Kampanjen går ut ur samma underlag"],
  s:"Sambandet är hela produkten."}],

"ekosystem-7":[
 {p:"quiet", k:"15 — Ekosystemet", h:"Ett objekt.", em:"Hela marknadsföringen.",
  s:"Se hela flödet på viewly.se"},
 {p:"cta", h:"Vill du se hur det fungerar?", s:"Ansök om mäklarkonto", k:"15 — Ekosystemet"}]
};
