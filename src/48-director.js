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

  /* ---------- 1. ORDNING ---------- */
  /** Bygger en rundtur i stället för en mekanisk rum-för-rum-sortering. */
  function orderImages(assets, ia) {
    const items = assets.map(a => ({ a, f: ia.get(a.id) })).filter(x => x.f);
    if (!items.length) return [];

    const by = t => items.filter(x => x.f.roomType === t && !x.used);
    const bestOf = list => list.slice().sort((p, q) => q.f.heroScore - p.f.heroScore)[0];
    const seq = [];
    const take = (x, role, why) => { if (!x || x.used) return false; x.used = true; x.role = role; x.why = why; seq.push(x); return true; };

    // Öppning: starkaste exteriör eller drönarbild — annars starkaste bilden alls
    const opener = bestOf(items.filter(x => x.f.isExterior || x.f.isDrone)) || bestOf(items);
    take(opener, 'hero', 'Starkaste etableringsbilden — den öppnar filmen och placerar bostaden.');

    // Entré efter etableringen om den finns
    take(bestOf(by('entry')), 'support', 'Entrén tar betraktaren in i bostaden.');

    // Interiören i rundturens ordning, hero först i varje rum
    const interior = MM.TOUR_ORDER.filter(t => !['exterior', 'drone', 'entry', 'detail', 'garden', 'balcony', 'other'].includes(t));
    let sinceDetail = 0;
    for (const room of interior) {
      const group = by(room).sort((p, q) => q.f.heroScore - p.f.heroScore);
      for (let i = 0; i < group.length; i++) {
        const role = i === 0 && group[i].f.heroScore > 0.5 ? 'hero' : 'support';
        take(group[i], role, `${MM.roomName(room)}${i === 0 ? ' — rummets starkaste vinkel' : ', kompletterande vinkel'}.`);
        sinceDetail++;
        // detalj som andhämtning efter några rumsbilder
        if (sinceDetail >= 3) {
          const det = bestOf(by('detail'));
          if (det) { take(det, 'detail', 'Detalj som andningspaus mellan rummen.'); sinceDetail = 0; }
        }
      }
    }
    // Uteplatser mot slutet
    for (const t of ['balcony', 'garden']) {
      for (const x of by(t).sort((p, q) => q.f.heroScore - p.f.heroScore))
        take(x, x.f.heroScore > 0.55 ? 'hero' : 'support', `${MM.roomName(t)} — övergången ut.`);
    }
    // Resten
    for (const x of items.filter(x => !x.used).sort((p, q) => q.f.heroScore - p.f.heroScore))
      take(x, x.f.isDetail ? 'detail' : 'support', 'Kompletterar rundturen.');

    // Avslutning: spara en stark exteriör till sist om vi har fler än en
    const exteriors = seq.filter(x => x.f.isExterior || x.f.isDrone);
    if (exteriors.length > 1 && seq.length > 3) {
      const closer = exteriors.slice(1).sort((p, q) => q.f.heroScore - p.f.heroScore)[0];
      if (closer && seq[seq.length - 1] !== closer) {
        seq.splice(seq.indexOf(closer), 1);
        closer.role = 'closer';
        closer.why = 'Avslutande reveal — filmen lämnar bostaden utifrån.';
        seq.push(closer);
      }
    }
    return separateDuplicates(seq);
  }

  /** Två nästan identiska bilder efter varandra ser ut som ett fel. Skjut isär dem. */
  function separateDuplicates(seq) {
    for (let i = 1; i < seq.length; i++) {
      const sim = ImageAnalyze.similarity(seq[i - 1].f, seq[i].f);
      if (sim < 0.88) continue;
      // hitta något att byta med längre fram som inte liknar grannarna
      for (let j = i + 2; j < seq.length; j++) {
        const okPrev = ImageAnalyze.similarity(seq[i - 1].f, seq[j].f) < 0.85;
        const okNext = i + 1 >= seq.length || ImageAnalyze.similarity(seq[j].f, seq[i + 1].f) < 0.85;
        if (okPrev && okNext) {
          const tmp = seq[i]; seq[i] = seq[j]; seq[j] = tmp;
          seq[i].why += ' Flyttad för att inte hamna intill en nästan identisk bild.';
          break;
        }
      }
    }
    return seq;
  }

  /* ---------- 2. LÄNGDER PÅ MUSIKENS PUNKTER ---------- */
  const ROLE_WEIGHT = { hero: 1.38, closer: 1.25, support: 1.0, detail: 0.72 };

  function planCuts(seq, ma, targetDuration) {
    const n = seq.length;
    const musicLimit = Math.min(targetDuration, ma.duration - 0.6);
    const totalWeight = seq.reduce((a, x) => a + (ROLE_WEIGHT[x.role] || 1), 0);
    const cuts = [];
    let t = 0;

    for (let i = 0; i < n; i++) {
      const w = ROLE_WEIGHT[seq[i].role] || 1;
      let want = musicLimit * (w / totalWeight);
      want = U.clamp(want, 1.8, 6.5);
      const rest = n - i - 1;
      // se till att det finns tid kvar åt de shots som återstår
      const maxHere = Math.max(1.8, musicLimit - t - rest * 1.9);
      want = Math.min(want, maxHere);

      // hero och sektionsstart vill ligga på starka punkter
      const minStrength = seq[i].role === 'hero' || seq[i].role === 'closer' ? 1.0 : 0.6;
      const desired = t + want;
      let cut = MusicStructure.nearestCut(ma, desired, minStrength);
      if (!cut || Math.abs(cut.t - desired) > want * 0.45) cut = MusicStructure.nearestCut(ma, desired, 0.6);
      let end = cut ? cut.t : desired;
      if (i === n - 1) end = Math.min(musicLimit, Math.max(t + 1.8, end));
      if (end - t < 1.6) end = t + 1.8;
      end = Math.min(end, musicLimit);                 // filmen får aldrig bli längre än musiken
      if (end - t < 1.5) { // resten ryms inte
        for (let j = i; j < n; j++) seq[j].dropped = true;
        break;
      }
      cuts.push({ in: U.round(t, 3), out: U.round(end, 3), cut: cut || { kind: 'free', strength: 0 } });
      t = end;
      if (t >= musicLimit - 1.5) {
        for (let j = i + 1; j < n; j++) seq[j].dropped = true;
        break;
      }
    }
    return cuts;
  }

  /* ---------- 3. KAMERARÖRELSER ---------- */
  /** Poängsätter en rörelse mot bilden, grannarna och musiken. */
  function scoreMove(mv, x, prev, prev2, energy) {
    const f = x.f;
    if (mv.droneOnly && !f.isDrone) return -Infinity;
    if (prev && prev.movementId === mv.id) return -Infinity;   // aldrig samma två i rad
    let s = 0;

    // passar rummet
    s += mv.fits.includes(f.roomType) ? 0.9 : (mv.fits.includes('exterior') && f.isExterior ? 0.5 : 0);

    // passar bildens geometri
    if (mv.wants) {
      if (mv.wants.symmetry) s += f.symmetry * mv.wants.symmetry * 1.5;
      if (mv.wants.depth) s += f.depthScore * mv.wants.depth * 1.6;
      if (mv.wants.width) s += U.clamp(f.aspect / 1.8, 0, 1) * mv.wants.width;
      if (mv.wants.height) s += (1 - f.horizonY) * mv.wants.height;
      if (mv.wants.openness) s += U.clamp(1 - f.edgeDensity * 5, 0, 1) * mv.wants.openness;
    }
    // symmetrisk interiör vill ha push in/out
    if (f.symmetry > 0.62 && mv.axis === 'z') s += 0.55;
    // brett rum med djup vill ha slide
    if (f.depthScore > 0.45 && f.symmetry < 0.55 && mv.axis === 'x') s += 0.45;
    // detalj: bara mycket subtil push in
    if (f.isDetail) s += mv.id === 'slow_push_in' ? 0.8 : -0.7;
    // drönare
    if (f.isDrone && mv.droneOnly) s += 0.7;

    // musikens energi: lugna rörelser i intro/outro, mer rörelse i höga partier
    s -= Math.abs(mv.energy - U.clamp(energy * 1.1, 0.25, 0.75)) * 0.7;

    // sparsamma rörelser kräver starkare motiv
    if (mv.sparse) s -= 0.45;

    // ---- grannregler ----
    if (prev) {
      const pm = MM.moveById(prev.movementId);
      if (pm.axis === mv.axis) s -= 0.35;                            // variera axel
      if (pm.axis === mv.axis && pm.dir === -mv.dir) s -= 0.5;       // fram-och-tillbaka ser konstlat ut
      if (prev2) {
        const pm2 = MM.moveById(prev2.movementId);
        if (pm2.axis === mv.axis && pm.axis !== mv.axis) s -= 0.4;   // A-B-A-mönster
        if (pm2.movementId === mv.id) s -= 0.6;
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
  function buildPlan({ assets, imageAnalysis, musicAnalysis, targetDuration, provider, aspect }) {
    const seq = orderImages(assets, imageAnalysis);
    if (!seq.length) throw new Error('Inga analyserade bilder att regissera.');
    const cuts = planCuts(seq, musicAnalysis, targetDuration);
    const shots = [];
    const planId = U.uid('plan');

    for (let i = 0; i < cuts.length; i++) {
      const x = seq[i];
      if (!x || x.dropped) break;
      const c = cuts[i];
      const energy = MusicStructure.energyAt(musicAnalysis, (c.in + c.out) / 2);
      const prev = shots[shots.length - 1], prev2 = shots[shots.length - 2];
      const { move } = chooseMove(x, prev, prev2, energy);
      const d = MM.planDurations(c.out - c.in, provider);
      const sec = MusicStructure.sectionAt(musicAnalysis, c.in);

      shots.push(MM.newShot({
        planId, index: i, assetId: x.a.id, movementId: move.id,
        timelineIn: c.in, timelineOut: c.out,
        generatedDuration: d.generatedDuration, sourceIn: d.sourceIn, sourceOut: d.sourceOut,
        role: x.role, roomType: x.f.roomType,
        motivation: motivate(x, move, c, sec, prev),
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
    const rooms = [...new Set(shots.map(s => MM.roomName(s.roomType)))];
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
      movements: MM.MOVES.map(m => ({ id: m.id, name: m.name, fits: m.fits, energy: m.energy, sparse: !!m.sparse, droneOnly: !!m.droneOnly })),
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

  return { buildPlan, orderImages, planCuts, chooseMove, scoreMove, validate, brief, motivate };
})();
