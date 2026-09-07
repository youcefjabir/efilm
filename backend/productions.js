/* ========================================================================
   PRODUCTIONS
   In-memory production registry with basic persistence.
   For a real deployment, back this with a database.
   ======================================================================== */

export class Productions {
  constructor() {
    this.registry = new Map();
  }

  async create(spec) {
    const id = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const prod = {
      id,
      projectId: spec.projectId,
      status: 'created',
      createdAt: Date.now(),
      spec,
      mediaIds: {},      // Maps shot imageRef.localId -> media_id
      jobs: [],          // Higgsfield job records
      snapshot: null     // Latest status snapshot
    };

    this.registry.set(id, prod);
    return prod;
  }

  get(id) {
    return this.registry.get(id);
  }

  update(id, updates) {
    const prod = this.registry.get(id);
    if (!prod) throw new Error('Production not found');
    Object.assign(prod, updates);
    return prod;
  }

  /* Store the result of a Higgsfield generate_video_batch call */
  recordBatch(prodId, batch) {
    const prod = this.registry.get(prodId);
    if (!prod) throw new Error('Production not found');

    prod.jobs = batch.jobs || [];
    prod.status = 'dispatched';
    prod.dispatchedAt = Date.now();
  }

  /* Update production snapshot from a jobs_wait poll */
  updateSnapshot(prodId, snapshot) {
    const prod = this.registry.get(prodId);
    if (!prod) throw new Error('Production not found');

    prod.snapshot = snapshot;

    // Infer overall status from job states
    const all = snapshot.jobs || [];
    const completed = all.filter(j => j.status === 'completed').length;
    const failed = all.filter(j => j.status === 'failed').length;

    if (all.length === 0) {
      prod.status = 'running';
    } else if (completed + failed === all.length) {
      if (failed > 0) {
        prod.status = 'partial';
      } else {
        prod.status = 'completed';
      }
    } else {
      prod.status = 'running';
    }
  }
}
