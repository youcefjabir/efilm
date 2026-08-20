
/* --------------------------------------------------------------------
   KAMPANJBYGGAREN — data

   Fem steg, och varje steg har en egen sak att välja. Datan nedan är
   den som stegen plockar ur: färdiga ordrar med levererat material,
   mallarna som redan finns i POSTS, och de kanaler kampanjen kan gå ut
   i. Ingenting här kopplar mot något — det är ritat, inte anslutet.
   -------------------------------------------------------------------- */
var ORDERS = [
  {id:"o1", addr:"Silvergården 9A", city:"Landskrona", n:42, when:"Levererad 12 mars",
   ims:["hero","kitchen","living","dining"]},
  {id:"o2", addr:"Kastanjevägen 12", city:"Lund",      n:28, when:"Levererad 8 mars",
   ims:["dining2","boucle","eames"]},
  {id:"o3", addr:"Strandgatan 4B",  city:"Malmö",      n:35, when:"Levererad 2 mars",
   ims:["living","drone","hero"]}
];
/* mallarna är POSTS — samma fyra som kampanjkapitlet, inget nytt påhitt */
var BMALL = [
  {id:"kommande", n:"Kommande",  d:"Släpps snart", m:"hero"},
  {id:"tillsalu", n:"Till salu", d:"Med fakta",    m:"kitchen"},
  {id:"visning",  n:"Visning",   d:"Tid och plats",m:"living"},
  {id:"sald",     n:"Såld",      d:"Efteråt",      m:"drone"}
];
var BKANAL = [
  {id:"ig", n:"Instagram", h:"@viewly.se",       d:"Inlägg och story"},
  {id:"fb", n:"Facebook",  h:"Viewly",           d:"Sida och grupp"}
];
/* de fem stegen, i ordning */
var BSTEG = [
  {n:"Objekt",  d:"Välj ur en levererad order"},
  {n:"Mallar",  d:"Välj en eller flera"},
  {n:"Bilder",  d:"En bild per mall"},
  {n:"Kontroll",d:"Stämmer uppgifterna?"},
  {n:"Klar",    d:"Dela eller schemalägg"}
];
