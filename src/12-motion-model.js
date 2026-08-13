/* ============================================================
   12 — Motion: datamodell, rörelsebibliotek, statusmaskin

   Motion producerar ett vanligt editorprojekt (M.newProject) plus ett
   motion-dokument. Ingen konvertering behövs för att öppna resultatet i
   Master Editor — det ÄR samma projekt.
   ============================================================ */
const MM = (() => {

  /* ---------- kamerarörelser ----------
     Prompterna är avsiktligt korta och restriktiva. Långa, beskrivande
     prompter får videomodellen att hitta på rörelse: walking bob, wobble,
     deformerad arkitektur. Kort och konkret ger stabil bild. */
  const MOVES = [
    {
      id: 'slow_push_in', name: 'Slow push in',
      prompt: 'Make a slow cinematic push in to the image. Keep the camera movement smooth and stable.',
      editorPreset: 'pushin', energy: 0.35, axis: 'z', dir: 1,
      scenes: ['interior', 'exterior', 'detail'],
      wants: { symmetry: 0.45, depth: 0.35 },
    },
    {
      id: 'slow_push_out', name: 'Slow push out',
      prompt: 'Make a slow cinematic pull back from the image. Keep the camera movement smooth and stable.',
      editorPreset: 'pullout', energy: 0.35, axis: 'z', dir: -1,
      scenes: ['interior', 'exterior', 'detail'],
      wants: { depth: 0.25 },
    },
    {
      id: 'slow_slide_left', name: 'Slide left',
      prompt: 'Make a slow smooth cinematic camera slide to the left. Keep the camera stable.',
      editorPreset: 'panl', energy: 0.5, axis: 'x', dir: -1,
      scenes: ['interior', 'exterior'],
      wants: { width: 0.5, depth: 0.3 },
    },
    {
      id: 'slow_slide_right', name: 'Slide right',
      prompt: 'Make a slow smooth cinematic camera slide to the right. Keep the camera stable.',
      editorPreset: 'panr', energy: 0.5, axis: 'x', dir: 1,
      scenes: ['interior', 'exterior'],
      wants: { width: 0.5, depth: 0.3 },
    },
    {
      id: 'slow_pan_left', name: 'Pan left',
      prompt: 'Make a slow smooth cinematic pan to the left. Keep the camera stable.',
      editorPreset: 'panl', energy: 0.45, axis: 'x', dir: -1, sparse: true,
      scenes: ['interior', 'exterior'],
    },
    {
      id: 'slow_pan_right', name: 'Pan right',
      prompt: 'Make a slow smooth cinematic pan to the right. Keep the camera stable.',
      editorPreset: 'panr', energy: 0.45, axis: 'x', dir: 1, sparse: true,
      scenes: ['interior', 'exterior'],
    },
    {
      id: 'slow_rise', name: 'Rise',
      prompt: 'Make the camera slowly rise upward. Keep the movement smooth and stable.',
      editorPreset: 'rise', energy: 0.45, axis: 'y', dir: -1,
      scenes: ['exterior'],
      wants: { height: 0.4 },
    },
    {
      id: 'slow_lower', name: 'Lower',
      prompt: 'Make the camera slowly move downward. Keep the movement smooth and stable.',
      editorPreset: 'descend', energy: 0.45, axis: 'y', dir: 1, sparse: true,
      scenes: ['exterior'],
    },
    {
      id: 'rise_tilt_down', name: 'Rise + tilt down',
      prompt: 'Make the camera slowly rise while gently tilting down. Keep the movement smooth and stable.',
      editorPreset: 'risetilt', energy: 0.6, axis: 'y', dir: -1,
      scenes: ['exterior', 'drone'],
      wants: { height: 0.5 },
    },
    {
      id: 'descend_tilt_up', name: 'Descend + tilt up',
      prompt: 'Make the camera slowly descend while gently tilting upward. Keep the movement smooth and stable.',
      editorPreset: 'desctilt', energy: 0.6, axis: 'y', dir: 1, sparse: true,
      scenes: ['exterior'],
    },
    {
      id: 'push_in_slide_left', name: 'Push in + slide left',
      prompt: 'Make a slow cinematic push in while gently moving left. Keep the camera smooth and stable.',
      editorPreset: 'pushin', energy: 0.65, axis: 'xz', dir: -1,
      scenes: ['interior', 'exterior'],
      wants: { depth: 0.55, width: 0.4 },
    },
    {
      id: 'push_in_slide_right', name: 'Push in + slide right',
      prompt: 'Make a slow cinematic push in while gently moving right. Keep the camera smooth and stable.',
      editorPreset: 'pushin', energy: 0.65, axis: 'xz', dir: 1,
      scenes: ['interior', 'exterior'],
      wants: { depth: 0.55, width: 0.4 },
    },
    {
      id: 'pull_back_rise', name: 'Pull back + rise',
      prompt: 'Make the camera slowly pull back while gently rising. Keep the movement smooth and stable.',
      editorPreset: 'pullout', energy: 0.6, axis: 'yz', dir: -1,
      scenes: ['exterior', 'drone'],
    },
    {
      id: 'drone_push_forward', name: 'Drone push forward',
      prompt: 'Make a slow smooth cinematic forward camera movement. Keep the camera stable.',
      editorPreset: 'pushin', energy: 0.55, axis: 'z', dir: 1, droneOnly: true,
      scenes: ['drone'],
    },
    {
      id: 'drone_rise', name: 'Drone rise',
      prompt: 'Make the camera slowly rise upward. Keep the movement smooth and stable.',
      editorPreset: 'rise', energy: 0.5, axis: 'y', dir: -1, droneOnly: true,
      scenes: ['drone'],
    },
    {
      id: 'drone_pullback_rise', name: 'Drone pull back + rise',
      prompt: 'Make the camera slowly pull back while rising. Keep the movement smooth and stable.',
      editorPreset: 'pullout', energy: 0.6, axis: 'yz', dir: -1, droneOnly: true,
      scenes: ['drone'],
    },
  ];
  const moveById = id => MOVES.find(m => m.id === id) || MOVES[0];

  /* ---------- rumstyper ---------- */
  const ROOMS = [
    ['exterior', 'Exteriör'], ['drone', 'Drönare'], ['entry', 'Entré'],
    ['livingroom', 'Vardagsrum'], ['kitchen', 'Kök'], ['diningroom', 'Matplats'],
    ['bedroom', 'Sovrum'], ['bathroom', 'Badrum'], ['balcony', 'Balkong'],
    ['garden', 'Trädgård'], ['detail', 'Detalj'], ['other', 'Övrigt'],
  ];
  const roomName = id => (ROOMS.find(r => r[0] === id) || ['other', 'Övrigt'])[1];

  /** Ordningen en bostadsvisning normalt följer. Regissören använder den som
   *  ramverk men får avvika utifrån vad bildmaterialet faktiskt innehåller. */
  const TOUR_ORDER = ['exterior', 'drone', 'entry', 'livingroom', 'diningroom', 'kitchen',
    'bedroom', 'bathroom', 'balcony', 'garden', 'detail', 'other'];

  /* ---------- generering ---------- */
  const PROVIDERS = {
    higgsfield_kling3: {
      id: 'higgsfield_kling3', name: 'Higgsfield · Kling v3.0', model: 'kling3_0',
      minDuration: 3, maxDuration: 15, integerDuration: true,
      creditsPer5s: 7.5, aspects: ['16:9', '9:16', '1:1'],
      note: 'Standardläge, ljud av. 7,5 credits per 5-sekundersklipp.',
    },
    stub: {
      id: 'stub', name: 'Simulerad (ingen kostnad)', model: 'stub',
      minDuration: 3, maxDuration: 15, integerDuration: true,
      creditsPer5s: 0, aspects: ['16:9', '9:16', '1:1'],
      note: 'Renderar rörelsen lokalt i stället för att generera. Kostar inget och används för att prova flödet.',
    },
  };
  const providerById = id => PROVIDERS[id] || PROVIDERS.stub;

  /** Kostnaden skalar linjärt med längden — 7,5 cr per 5 s. */
  function shotCost(provider, seconds) {
    const p = providerById(provider);
    return U.round(p.creditsPer5s * (seconds / 5), 2);
  }
  function planCost(plan, provider) {
    return U.round((plan.shots || []).reduce((a, s) => a + shotCost(provider, s.generatedDuration), 0), 1);
  }

  /* ---------- statusar ---------- */
  const PROJECT_STATUS = ['draft', 'analyzing', 'planned', 'generating', 'qc', 'ready', 'failed'];
  const SHOT_STATUS = ['planned', 'queued', 'generating', 'generated', 'qc_fail', 'approved', 'failed'];
  const JOB_STATUS = ['pending', 'submitted', 'running', 'done', 'failed', 'cancelled'];

  /* ---------- fabriker ---------- */
  function newMotionProject(name = 'Ny bostadsfilm') {
    return {
      id: U.uid('mp'), projectId: null, propertyName: name,
      status: 'draft', createdAt: Date.now(), updatedAt: Date.now(),
      imageIds: [], musicAssetId: null,
      targetDuration: 45, aspect: '16:9',
      provider: 'higgsfield_kling3',
      aiOrder: true,
      credits: { estimated: 0, spent: 0 },
      planId: null,
    };
  }
  function newShot(o) {
    return {
      id: U.uid('shot'), planId: o.planId, index: o.index,
      assetId: o.assetId, movementId: o.movementId, prompt: moveById(o.movementId).prompt,
      timelineIn: o.timelineIn, timelineOut: o.timelineOut,
      timelineDuration: U.round(o.timelineOut - o.timelineIn, 3),
      generatedDuration: o.generatedDuration,
      sourceIn: o.sourceIn, sourceOut: o.sourceOut,
      role: o.role || 'support', roomType: o.roomType || 'other',
      roomLabel: o.roomLabel || null, clusterId: o.clusterId || null,
      movementLocked: !!o.movementLocked, durationLocked: !!o.durationLocked,
      motivation: o.motivation || '',
      status: 'planned', jobId: null, outputAssetId: null, qc: null, attempts: 0,
    };
  }
  function newJob(shot, provider, aspect) {
    const p = providerById(provider);
    return {
      id: U.uid('job'), shotId: shot.id, provider: p.id, model: p.model,
      params: {
        prompt: shot.prompt, duration: shot.generatedDuration,
        mode: 'std', sound: 'off', aspect_ratio: aspect,   // ljud av: musiken läggs på i editorn
      },
      status: 'pending', attempts: 0, cost: shotCost(provider, shot.generatedDuration),
      requestId: null, outputUrl: null, error: null, log: [],
      createdAt: Date.now(),
    };
  }

  /** Genereringslängd: modellen tar heltalssekunder. Vi lägger på marginal så
   *  att klippets in-/utpunkt kan flyttas utan att hamna utanför materialet,
   *  och trimmar sedan i timelinen. Klippningen styr — aldrig tvärtom. */
  function planDurations(timelineDuration, provider) {
    const p = providerById(provider);
    // Kling tar heltalssekunder och 3 s är standard: bostadsfilm klipper i
    // 2,5–4 s, så längre generering är bortkastade credits. Marginalen räcker
    // för att kunna flytta in-/utpunkten något i editorn.
    let gen = Math.max(p.minDuration, Math.ceil(timelineDuration + 0.4));
    gen = U.clamp(gen, p.minDuration, p.maxDuration);
    const slack = Math.max(0, gen - timelineDuration);
    const sourceIn = U.round(Math.min(slack * 0.5, 0.6), 2);
    return { generatedDuration: gen, sourceIn, sourceOut: U.round(sourceIn + timelineDuration, 3) };
  }

  return {
    MOVES, moveById, ROOMS, roomName, TOUR_ORDER,
    PROVIDERS, providerById, shotCost, planCost, planDurations,
    PROJECT_STATUS, SHOT_STATUS, JOB_STATUS,
    newMotionProject, newShot, newJob,
  };
})();
