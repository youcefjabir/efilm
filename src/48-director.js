/* ============================================================
   48 — AI-regissören

   Får bildanalysen, musikanalysen, rörelsebiblioteket och önskad längd.
   Levererar en Director Plan: ordning, klipppunkter, längder, rörelser och
   en motivering per shot. Planen skapas FÖRE generering — musiken bestämmer
   klippningen, och videogeneratorn får rätta sig efter den.

   Motorn är deterministisk och förklarar varje beslut med de mått som
   faktiskt drev det. När LLM-regissören är inkopplad får den samma underlag
   och kan skriva om planen; validate() ser till att den håller samma regler.
   ============================================================ */
const Director = (() => {

  /** Användarens rättningar. Regissören är ett förslag, inte ett facit —
   *  allt som ändras för hand måste överleva att planen byggs om. */
  const noOverrides = () => ({ moves: new Map(), durations: new Map(), rooms: new Map(), names: new Map() });

  /* ---------- 1. ORDNING ---------- */
  /** Bygger en rundtur. Bilderna grupperas först i rum efter hur lika de är,
   *  så att samma rum fotograferat från flera håll alltid hamnar ihop. Ingen
   *  gissning om vad rummet heter behövs för det. */
  function orderImages(assets, ia, ov = noOverrides()) {
    const items = assets.map(a => ({ a, f: ia.get(a.id) })).filter(x => x.f);
    if (!items.length) return [];
    ImageAnalyze.clusterRooms(items.map(x => x.f));
    applyRoomOverrides(items, ov);

    const seq = [];
    const take = (x, role, why) => { if (!x || x.used) return false; x.used = true; x.role = role; x.why = why; seq.push(x); return true; };
    const free = pred => items.filter(x => !x.used && pred(x));
    const best = list => list.slice().sort((p, q) => q.f.heroScore - p.f.heroScore)[0];

    // Öppning: starkaste utomhusbilden — annars starkaste bilden alls
    const opener = best(free(x => x.f.isExterior)) || best(free(() => true));
    take(opener, 'hero', 'Starkaste etableringsbilden — den öppnar filmen och placerar bostaden.');

    // Interiören rum för rum. Störst rum först — det är normalt sällskapsytan,
    // och en rundtur som börjar där känns igen från riktig bostadsfilm.
    const interior = items.filter(x => !x.f.isExterior && !x.f.isDetail);
    const clusters = [...new Set(interior.map(x => x.f.clusterId))]
      .sort((p, q) => interior.filter(x => x.f.clusterId === q).length
        - interior.filter(x => x.f.clusterId === p).length);
    let sinceDetail = 0;
    for (const cid of clusters) {
      const group = free(x => x.f.clusterId === cid).sort((p, q) => q.f.heroScore - p.f.heroScore);
      group.forEach((x, i) => {
        const role = i === 0 && x.f.heroScore > 0.5 ? 'hero' : 'support';
        take(x, role, i === 0
          ? `${x.f.roomLabel} — rummets starkaste vinkel.`
          : `${x.f.roomLabel}, ny vinkel i samma rum.`);
        sinceDetail++;
      });
      // Detaljen läggs MELLAN rum, aldrig mitt i ett. Ett rum som avbryts av
      // en närbild och sedan fortsätter ser ut som ett klippfel.
      if (sinceDetail >= 2) {
        const det = best(free(x => x.f.isDetail));
        if (det) { take(det, 'detail', 'Detalj som övergång till nästa rum.'); sinceDetail = 0; }
      }
    }
    for (const x of free(x => x.f.isDetail).sort((p, q) => q.f.heroScore - p.f.heroScore))
      take(x, 'detail', 'Detalj som ger filmen andrum.');
    for (const x of free(() => true).sort((p, q) => q.f.heroScore - p.f.heroScore))
      take(x, 'support', 'Kompletterar rundturen.');

    // Avslutning: spara en stark utomhusbild till sist
    const ext = seq.filter(x => x.f.isExterior);
    if (ext.length > 1 && seq.length > 3) {
      const closer = ext.slice(1).sort((p, q) => q.f.heroScore - p.f.heroScore)[0];
      if (closer && seq[seq.length - 1] !== closer) {
        seq.splice(seq.indexOf(closer), 1);
        closer.role = 'closer';
        closer.why = 'Avslutande reveal — filmen lämnar bostaden utifrån.';
        seq.push(closer);
      }
    }
    return separateDuplicates(seq);
  }

  /** Klustringen är bra men inte ofelbar. Flyttar användaren en bild till ett
   *  annat rum, eller döper om ett rum, gäller det före maskinens gruppering —
   *  och det gäller för alla bilder i samma rum, inte bara den man klickade på. */
  function applyRoomOverrides(items, ov) {
    for (const x of items) {
      const forced = ov.rooms.get(x.a.id);
      if (!forced) continue;
      x.f.clusterId = forced;
      x.f.roomType = forced;
      // Flyttar användaren en bild till Exteriör eller Drönare är det ett
      // besked om vad bilden FÖRESTÄLLER, inte bara var den ska ligga i
      // rundturen — kamerareglerna måste följa med.
      x.f.isExterior = forced === 'exterior' || forced === 'drone';
      x.f.isDrone = forced === 'drone';
      x.f.isDetail = forced === 'detail';
      x.f.scene = x.f.isDrone ? 'drone' : x.f.isExterior ? 'exterior' : x.f.isDetail ? 'detail' : 'interior';
    }
    const sizes = new Map();
    for (const x of items) sizes.set(x.f.clusterId, (sizes.get(x.f.clusterId) || 0) + 1);
    for (const x of items) {
      const cid = x.f.clusterId;
      const named = ov.names.get(cid);
      if (named) x.f.roomLabel = named;
      else if (cid === 'exterior') x.f.roomLabel = 'Exteriör';
      else if (cid === 'drone') x.f.roomLabel = 'Drönare';
      else if (x.f.isDetail && sizes.get(cid) === 1) x.f.roomLabel = 'Detalj';
      else x.f.roomLabel = 'Rum ' + String(cid).replace(/^room/, '');
      x.f.clusterSize = sizes.get(cid);
    }
  }

  /** Alla rum som finns i materialet — underlag till rullgardinen i planen. */
  function roomsOf(assets, ia, ov = noOverrides()) {
    const items = assets.map(a => ({ a, f: ia.get(a.id) })).filter(x => x.f);
    ImageAnalyze.clusterRooms(items.map(x => x.f));
    applyRoomOverrides(items, ov);
    const out = [];
    for (const x of items) if (!out.some(r => r.id === x.f.clusterId))
      out.push({ id: x.f.clusterId, label: x.f.roomLabel, size: x.f.clusterSize });
    return out;
  }

  /** Två nästan identiska bilder efter varandra ser ut som ett fel. Skjut isär
   *  dem — men bara om de är nästan identiska, inte bara samma rum. */
  function separateDuplicates(seq) {
    for (let i = 1; i < seq.length; i++) {
      if (ImageAnalyze.similarity(seq[i - 1].f, seq[i].f) < 0.92) continue;
      for (let j = i + 2; j < seq.length; j++) {
        if (ImageAnalyze.similarity(seq[i - 1].f, seq[j].f) < 0.85) {
          const tmp = seq[i]; seq[i] = seq[j]; seq[j] = tmp;
          seq[i].why += ' Flyttad för att inte hamna intill en nästan identisk bild.';
          break;
        }
      }
    }
    return seq;
  }

  /* ---------- 2. LÄNGDER PÅ MUSIKENS PUNKTER ---------- */
  /* Premium bostadsfilm klipper i 2,5–4 sekunder. Kortare blir stressigt,
     längre blir dött — och Kling genererar bara heltalssekunder, så 3 s är
     både den rätta rytmen och det billigaste valet. */
  const SHOT_TARGET = { hero: 3.6, closer: 3.4, support: 3.0, detail: 2.4 };
  const SHOT_MIN = 1.8, SHOT_MAX = 4.5, SHOT_MAX_MANUAL = 7.0;

  /** Hur lång kan filmen bli med det bildmaterial som finns? */
  function feasibleDuration(seq, ma, targetDuration, ov) {
    const byImages = seq.reduce((a, x) => a + (ov.durations.get(x.a.id) || SHOT_TARGET[x.role] || 3.0), 0);
    return Math.min(targetDuration, ma.duration - 0.4, byImages);
  }

  /** Vilka längder kan det här klippet få utan att lämna musiken?
   *  Stegen är låtens egna klipppunkter — därför ligger varje längd
   *  användaren kan välja garanterat på en takt, fras eller sektion. */
  function durationOptions(ma, tStart, manual = true) {
    const max = manual ? SHOT_MAX_MANUAL : SHOT_MAX;
    const out = [];
    for (const c of ma.cutPoints) {
      const d = c.t - tStart;
      if (d < SHOT_MIN - 0.02 || d > max + 0.02) continue;
      if (c.t > ma.duration - 0.3) continue;
      out.push({ t: U.round(c.t, 3), duration: U.round(d, 2), kind: c.kind, strength: c.strength });
    }
    return out;
  }

  /** Klippunkterna hämtas ALLTID ur musiken. Går bilderna inte ihop med
   *  filmens längd får bilder utgå — de får aldrig klippas bredvid takten.
   *  Ett klipp som ligger en tredjedels sekund fel hörs direkt, och det är
   *  hela poängen med att låta musiken styra. */
  function planCuts(seq, ma, targetDuration, ov = noOverrides()) {
    const limit = feasibleDuration(seq, ma, targetDuration, ov);
    const cuts = [];
    let t = 0;

    for (let i = 0; i < seq.length; i++) {
      const forced = ov.durations.get(seq[i].a.id);
      const want = forced || SHOT_TARGET[seq[i].role] || 3.0;
      const rest = seq.length - i - 1;
      const opts = durationOptions(ma, t, !!forced);
      if (!opts.length) { for (let j = i; j < seq.length; j++) seq[j].dropped = true; break; }

      // ett automatiskt klipp måste lämna plats åt resten av bilderna
      const ceiling = forced ? ma.duration - 0.3 : limit;
      let cands = opts.filter(o => o.t + rest * SHOT_MIN <= ceiling + 0.01);
      if (!cands.length) cands = opts.filter(o => o.t <= ceiling + 0.01);
      if (!cands.length) { for (let j = i; j < seq.length; j++) seq[j].dropped = true; break; }

      // närmast önskad längd vinner; hero och avslut får dra mot en starkare
      // punkt i musiken när det finns en i närheten
      const pull = forced ? 0 : (seq[i].role === 'hero' || seq[i].role === 'closer') ? 0.5 : 0.18;
      let best = cands[0], bestS = -1e9;
      for (const o of cands) {
        const s = -Math.abs(o.duration - want) + o.strength * pull;
        if (s > bestS) { bestS = s; best = o; }
      }

      cuts.push({ in: U.round(t, 3), out: U.round(best.t, 3), cut: best, forced: !!forced });
      t = best.t;
    }
    return cuts;
  }

  /* ---------- 3. KAMERARÖRELSER ---------- */
  /** Poängsätter en rörelse mot bilden, grannarna och musiken.
   *  Scentypen sätter hårda ramar: en drönarbild ska aldrig få en sidled-slide,
   *  och en närbild ska aldrig få något annat än en mycket lugn push in. */
  function scoreMove(mv, x, prev, prev2, energy) {
    const f = x.f;
    if (prev && prev.movementId === mv.id) return -Infinity;    // aldrig samma två i rad

    // --- hårda ramar per scentyp ---
    // Varje rörelse säger själv vilka scener den hör hemma i. En drönarbild
    // kan inte slidas i sidled, ett badrum kan inte lyftas som en fasad, och
    // en närbild tål inget annat än en lugn push. Det är regler, inte poäng:
    // en dålig rörelse ska inte kunna vinna för att bilden i övrigt passar.
    const scene = f.scene || (f.isDrone ? 'drone' : f.isExterior ? 'exterior' : f.isDetail ? 'detail' : 'interior');
    if (!mv.scenes || !mv.scenes.includes(scene)) return -Infinity;

    let s = 0;
    // --- bildens geometri avgör ---
    if (f.symmetry > 0.58 && mv.axis === 'z') s += 1.0;         // symmetriskt rum vill ha push
    if (f.depthScore > 0.42 && mv.axis === 'x') s += 0.85;      // djup åt sidan vill ha slide
    if (f.depthScore > 0.5 && mv.axis === 'z') s += 0.5;        // djup rakt in vill ha push
    if (f.isExterior && !f.isDrone) {
      if (mv.id === 'slow_push_in') s += 0.9;
      if (mv.id === 'slow_rise' || mv.id === 'rise_tilt_down') s += 0.8;
    }
    if (f.isDrone && mv.droneOnly) s += 1.2;
    if (f.isDetail && mv.id === 'slow_push_in') s += 1.2;
    if (mv.wants) {
      if (mv.wants.symmetry) s += f.symmetry * mv.wants.symmetry;
      if (mv.wants.depth) s += f.depthScore * mv.wants.depth;
      if (mv.wants.width) s += U.clamp(f.aspect / 1.8, 0, 1) * mv.wants.width * 0.6;
      if (mv.wants.height) s += (1 - f.horizonY) * mv.wants.height * 0.6;
    }
    // Riktningen är inte godtycklig: rör kameran mot det ljusare hållet så
    // avslöjas fönstret, vilket är vad en fotograf gör. Utan det här blir
    // vänster och höger likvärdiga och vänster vinner alltid av en slump.
    if (mv.axis === 'x' || mv.axis === 'xz') s += (mv.dir || 0) * (f.lumBalance || 0) * 2.6;
    // sammansatta rörelser bara när bilden har både djup och bredd
    if (mv.axis === 'xz' || mv.axis === 'yz') s += (f.depthScore > 0.45 ? 0.3 : -0.9);
    if (mv.sparse) s -= 0.7;

    // --- musiken ---
    s -= Math.abs(mv.energy - U.clamp(0.3 + energy * 0.5, 0.3, 0.7)) * 0.8;

    // --- variation utan konstlat mönster ---
    if (prev) {
      const pm = MM.moveById(prev.movementId);
      if (pm.axis === mv.axis) s -= 0.45;
      if (pm.axis === mv.axis && pm.dir === -mv.dir) s -= 0.6;   // fram-och-tillbaka
      if (prev2) {
        const pm2 = MM.moveById(prev2.movementId);
        if (pm2.movementId === mv.id) s -= 0.7;
        if (pm2.axis === mv.axis && pm.axis !== mv.axis) s -= 0.5;
      }
    }
    return s;
  }

  function chooseMove(x, prev, prev2, energy) {
    let best = null, bestS = -Infinity, runnerUp = null;
    for (const mv of MM.MOVES) {
      const s = scoreMove(mv, x, prev, prev2, energy);
      if (s > bestS) { runnerUp = best; bestS = s; best = mv; }
    }
    return { move: best || MM.MOVES[0], score: bestS, runnerUp };
  }

  /* ---------- 4. HELA PLANEN ---------- */
  function buildPlan({ assets, imageAnalysis, musicAnalysis, targetDuration, provider, aspect, overrides }) {
    const ov = overrides || noOverrides();
    const seq = orderImages(assets, imageAnalysis, ov);
    if (!seq.length) throw new Error('Inga analyserade bilder att regissera.');
    const cuts = planCuts(seq, musicAnalysis, targetDuration, ov);
    const shots = [];
    const planId = U.uid('plan');

    for (let i = 0; i < cuts.length; i++) {
      const x = seq[i];
      if (!x || x.dropped) break;
      const c = cuts[i];
      const energy = MusicStructure.energyAt(musicAnalysis, (c.in + c.out) / 2);
      const prev = shots[shots.length - 1], prev2 = shots[shots.length - 2];
      const forcedMove = ov.moves.get(x.a.id);
      const move = forcedMove ? MM.moveById(forcedMove) : chooseMove(x, prev, prev2, energy).move;
      const d = MM.planDurations(c.out - c.in, provider);
      const sec = MusicStructure.sectionAt(musicAnalysis, c.in);

      shots.push(MM.newShot({
        planId, index: i, assetId: x.a.id, movementId: move.id,
        timelineIn: c.in, timelineOut: c.out,
        generatedDuration: d.generatedDuration, sourceIn: d.sourceIn, sourceOut: d.sourceOut,
        role: x.role, roomType: x.f.roomType, roomLabel: x.f.roomLabel || null,
        clusterId: x.f.clusterId || null,
        movementLocked: !!forcedMove, durationLocked: !!c.forced,
        motivation: forcedMove || c.forced
          ? handEdited(x, move, c, !!forcedMove, !!c.forced)
          : motivate(x, move, c, sec, prev),
      }));
    }

    const dropped = seq.filter(x => x.dropped).length;
    return {
      id: planId, version: 1, createdBy: 'engine', createdAt: Date.now(),
      shots, provider, aspect,
      duration: shots.length ? shots[shots.length - 1].timelineOut : 0,
      droppedImages: dropped,
      rationale: summarize(shots, musicAnalysis, dropped),
    };
  }

  /** Har användaren bestämt något själv säger vi det rakt ut i stället för att
   *  hitta på en motivering åt ett val regissören inte gjorde. */
  function handEdited(x, move, cut, movedByHand, timedByHand) {
    const bits = [x.why];
    if (movedByHand) bits.push(`${move.name} — vald för hand.`);
    else bits.push(`${move.name}.`);
    if (timedByHand) bits.push(`Längden satt för hand, snäppt till närmaste ${cutWord(cut.cut.kind)}.`);
    return bits.join(' ');
  }
  const cutWord = k => ({ section: 'sektionsbyte', phrase: 'frasgräns', downbeat: 'downbeat', halfbar: 'halvtakt', accent: 'accent' }[k] || 'taktpunkt');

  /** Motiveringen speglar de mått som faktiskt styrde valet. */
  function motivate(x, move, cut, section, prev) {
    const f = x.f, bits = [x.why];
    const geo = [];
    if (f.symmetry > 0.6) geo.push('symmetrisk komposition');
    if (f.depthScore > 0.45) geo.push('tydligt djup');
    if (f.horizonY < 0.4) geo.push('hög horisont');
    if (f.isDetail) geo.push('närbild');
    bits.push(`${move.name} — ${geo.length ? geo.join(', ') + ' passar rörelsen' : 'lugn rörelse som inte konkurrerar med motivet'}.`);
    if (cut.cut.kind === 'section') bits.push('Klippet ligger på ett sektionsbyte i musiken.');
    else if (cut.cut.kind === 'phrase') bits.push('Klippet ligger på en frasgräns.');
    else if (cut.cut.kind === 'accent') bits.push('Klippet ligger på en accent.');
    else if (cut.cut.kind === 'downbeat') bits.push('Klippet ligger på en downbeat.');
    if (prev && MM.moveById(prev.movementId).axis === move.axis) bits.push('Följer föregående shots axel medvetet.');
    return bits.join(' ');
  }

  function summarize(shots, ma, dropped) {
    const rooms = [...new Set(shots.map(s => s.roomLabel || MM.roomName(s.roomType)))];
    const moves = [...new Set(shots.map(s => MM.moveById(s.movementId).name))];
    const onMusic = shots.filter((s, i) => i > 0).length;
    return `${shots.length} shots över ${U.round(shots.length ? shots[shots.length - 1].timelineOut : 0, 1)} s. ` +
      `Rundturen går genom ${rooms.join(', ')}. ${moves.length} olika kamerarörelser. ` +
      `Alla ${onMusic} klippunkter ligger på musikaliska punkter (${ma.bpm} BPM). ` +
      (dropped ? `${dropped} bilder rymdes inte inom filmens längd.` : 'Alla valda bilder fick plats.');
  }

  /* ---------- 5. VALIDERING (även för LLM-planer) ---------- */
  function validate(plan, { assets, musicAnalysis, provider }) {
    const errs = [];
    const ids = new Set(assets.map(a => a.id));
    const p = MM.providerById(provider);
    if (!plan || !Array.isArray(plan.shots) || !plan.shots.length) return ['Planen saknar shots.'];
    let t = 0;
    plan.shots.forEach((s, i) => {
      if (!ids.has(s.assetId)) errs.push(`Shot ${i + 1}: okänd bild.`);
      if (!MM.MOVES.some(m => m.id === s.movementId)) errs.push(`Shot ${i + 1}: okänd kamerarörelse "${s.movementId}".`);
      if (Math.abs(s.timelineIn - t) > 0.05) errs.push(`Shot ${i + 1}: glapp eller överlapp i timelinen.`);
      if (s.timelineDuration < 1.5) errs.push(`Shot ${i + 1}: för kort (${s.timelineDuration}s).`);
      if (s.timelineDuration > 8) errs.push(`Shot ${i + 1}: för långt (${s.timelineDuration}s).`);
      if (s.generatedDuration < p.minDuration || s.generatedDuration > p.maxDuration)
        errs.push(`Shot ${i + 1}: genereringslängd utanför modellens gränser.`);
      if (s.sourceOut - s.sourceIn > s.generatedDuration + 0.01)
        errs.push(`Shot ${i + 1}: segmentet ryms inte i det genererade klippet.`);
      t = s.timelineOut;
    });
    if (musicAnalysis && t > musicAnalysis.duration + 0.5) errs.push('Filmen är längre än musiken.');
    return errs;
  }

  /* ---------- 6. UNDERLAG TILL LLM-REGISSÖREN ---------- */
  /** Kompakt brief som kan skickas till Claude när bryggan finns. */
  function brief({ assets, imageAnalysis, musicAnalysis, targetDuration }) {
    return {
      task: 'Regissera en bostadsfilm. Returnera shots i samma schema.',
      targetDuration,
      movements: MM.MOVES.map(m => ({ id: m.id, name: m.name, scenes: m.scenes, energy: m.energy, sparse: !!m.sparse })),
      music: {
        bpm: musicAnalysis.bpm, duration: musicAnalysis.duration,
        sections: musicAnalysis.sections, phrases: musicAnalysis.phrases.map(p => p.t),
        cutPoints: musicAnalysis.cutPoints,
      },
      images: assets.map(a => {
        const f = imageAnalysis.get(a.id);
        if (!f) return null;
        return {
          assetId: a.id, name: a.name, roomGuess: f.roomGuess, heroScore: f.heroScore,
          symmetry: f.symmetry, depth: f.depthScore, horizonY: f.horizonY,
          isExterior: f.isExterior, isDrone: f.isDrone, isDetail: f.isDetail,
          brightness: f.meanL, contrast: f.contrast, sharpness: f.sharpness,
        };
      }).filter(Boolean),
      rules: [
        'Klippunkter måste ligga på angivna cutPoints.',
        'Ingen rörelse får upprepas två shots i rad.',
        'Undvik mekaniska mönster; rörelsen ska motiveras av bild, grannar och musik.',
        'Nästan identiska bilder får inte ligga intill varandra.',
        'Hero-bilder får längre tid, detaljer kortare.',
      ],
    };
  }

  /** Vilka rörelser passar den här bilden? Regissören rangordnar dem, men
   *  användaren får se hela biblioteket — de olämpliga tydligt märkta. */
  function moveOptions(x, prev, prev2, energy) {
    return MM.MOVES.map(mv => {
      const s = scoreMove(mv, x, prev, prev2, energy);
      return { move: mv, score: s, suitable: s > -Infinity };
    }).sort((a, b) => b.score - a.score);
  }

  return {
    buildPlan, orderImages, planCuts, chooseMove, scoreMove, validate, brief, motivate,
    durationOptions, moveOptions, roomsOf, noOverrides, applyRoomOverrides,
    SHOT_MIN, SHOT_MAX, SHOT_MAX_MANUAL,
  };
})();
