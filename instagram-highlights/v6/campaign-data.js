
/* --------------------------------------------------------------------
   KAMPANJFLÖDET — det lilla som inte redan finns

   Mallarna står INTE här. De är POSTS, byggda artboards som redan
   renderas i kapitel 10 och i vy 05, och rörelsen ritar dem med
   martb(). Att lägga platshållare bredvid dem vore att visa en sämre
   version av något färdigt.

   Kvar blir två saker flödet behöver och systemet inte redan har:
   ordrarna man börjar i, och kanalerna man går ut i. Ingetdera kopplar
   mot något — de är ritade, inte anslutna.
   -------------------------------------------------------------------- */
var ORDERS = [
  {id:"o1", addr:"Silvergården 9A", city:"Landskrona", n:42},
  {id:"o2", addr:"Kastanjevägen 12", city:"Lund",      n:28},
  {id:"o3", addr:"Strandgatan 4B",  city:"Malmö",      n:35}
];
var BKANAL = [{id:"ig", n:"Instagram"}, {id:"fb", n:"Facebook"}];
