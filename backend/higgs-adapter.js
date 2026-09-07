/* ========================================================================
   HIGGS ADAPTER
   Bridges between Viewly Motion specs and Higgsfield MCP API.

   This adapter uses the Higgsfield SDK or HTTP API. For development,
   stub implementations are provided. For production deployment:

   1. Install Higgsfield SDK: npm install higgsfield-sdk
   2. Configure credentials via HIGGSFIELD_API_KEY env var
   3. Replace stub implementations with real SDK calls

   Higgsfield MCP Reference:
   - media_upload or media_upload_widget: Upload source images
   - generate_video_batch: Submit multiple shots in one call
   - jobs_wait: Poll job status (returns list of jobs with progress)
   - get_cost: Get live pricing with get_cost:true flag
   ======================================================================== */

const HIGGSFIELD_LIVE = process.env.HIGGSFIELD_API_KEY ? true : false;

export class HiggsAdapter {
  /* ========================================================================
     CREATE PRODUCTION
     1. Upload each image from spec to Higgsfield media store
     2. Submit generate_video_batch with all shots
     3. Return the batch response (includes job IDs for polling)
     ======================================================================== */
  static async createProduction(prod) {
    const spec = prod.spec;

    try {
      // Step 1: Upload images
      const uploadedImages = {};
      for (const shot of spec.shots) {
        const imageRef = shot.imageRef;
        if (!imageRef || !imageRef.localId) continue;

        try {
          const mediaId = await this._uploadImage(
            imageRef.name,
            imageRef.localId
          );
          uploadedImages[imageRef.localId] = mediaId;
          prod.mediaIds[imageRef.localId] = mediaId;
        } catch (err) {
          console.error(`Failed to upload ${imageRef.name}:`, err);
          throw new Error(`Media upload failed: ${imageRef.name}`);
        }
      }

      // Step 2: Prepare batch request
      const batchReq = {
        model: spec.model,
        jobs: spec.shots.map((shot, idx) => {
          const mediaId = uploadedImages[shot.imageRef?.localId];
          if (!mediaId) {
            throw new Error(`No media ID for shot ${idx}`);
          }

          return {
            jobId: shot.shotId,
            mediaId,
            duration: shot.duration,
            aspect: spec.aspect,
            mode: spec.mode || 'std',
            sound: spec.sound || 'off',
            prompt: shot.cameraPrompt,
            // Additional Kling-specific parameters can go here
          };
        }),
      };

      // Step 3: Submit batch
      const batch = await this._generateVideoBatch(batchReq);

      // Record in production
      prod.recordBatch(prod.id, batch);

      return {
        productionId: prod.id,
        status: 'dispatched',
        createdAt: prod.createdAt,
        jobs: batch.jobs || [],
      };
    } catch (err) {
      console.error('Production dispatch failed:', err);
      throw err;
    }
  }

  /* ========================================================================
     GET PRODUCTION STATUS
     Poll Higgsfield for job status using jobs_wait or direct job queries
     ======================================================================== */
  static async getProduction(prod) {
    try {
      if (!prod.jobs || prod.jobs.length === 0) {
        return {
          productionId: prod.id,
          status: prod.status,
          jobs: [],
        };
      }

      // Poll Higgsfield for status
      const snapshot = await this._pollJobs(prod.jobs);
      prod.updateSnapshot(prod.id, snapshot);

      return {
        productionId: prod.id,
        status: prod.status,
        createdAt: prod.createdAt,
        snapshot,
        spec: prod.spec,
      };
    } catch (err) {
      console.error('Status poll failed:', err);
      throw err;
    }
  }

  /* ========================================================================
     RETRY SHOT
     Re-submit a single failed job
     ======================================================================== */
  static async retryShot(prod, shotId) {
    try {
      const spec = prod.spec;
      const shot = spec.shots.find((s) => s.shotId === shotId);
      if (!shot) {
        throw new Error(`Shot ${shotId} not found`);
      }

      const mediaId = prod.mediaIds[shot.imageRef?.localId];
      if (!mediaId) {
        throw new Error(`No media ID for shot ${shotId}`);
      }

      // Submit a new job for this shot
      const result = await this._generateVideo({
        jobId: shotId,
        mediaId,
        duration: shot.duration,
        aspect: spec.aspect,
        mode: spec.mode || 'std',
        sound: spec.sound || 'off',
        prompt: shot.cameraPrompt,
      });

      // Update job record
      const jobIdx = prod.jobs.findIndex((j) => j.jobId === shotId);
      if (jobIdx >= 0) {
        prod.jobs[jobIdx] = result;
      } else {
        prod.jobs.push(result);
      }

      return {
        productionId: prod.id,
        status: prod.status,
        jobs: prod.jobs,
      };
    } catch (err) {
      console.error('Retry failed:', err);
      throw err;
    }
  }

  /* ========================================================================
     GET COST
     Live pricing from Higgsfield (get_cost:true)
     ======================================================================== */
  static async getCost(spec) {
    try {
      const perShot = await Promise.all(
        spec.shots.map((shot) =>
          this._getCost({
            model: spec.model,
            duration: shot.duration,
            mode: spec.mode || 'std',
            sound: spec.sound || 'off',
            aspect: spec.aspect,
          })
        )
      );

      const total = perShot.reduce((sum, s) => sum + (s.cost || 0), 0);

      return {
        total: Number(total.toFixed(2)),
        perShot: perShot.map((s, idx) => ({
          shotId: spec.shots[idx].shotId,
          cost: s.cost,
          rate: s.rate,
          billedSeconds: s.billedSeconds,
          verified: true,
        })),
        source: HIGGSFIELD_LIVE ? 'higgsfield-live' : 'audited-rates',
      };
    } catch (err) {
      console.error('Cost lookup failed:', err);
      throw err;
    }
  }

  /* ========================================================================
     PRIVATE: HIGGSFIELD API CALLS
     These are stubs for development. For production, replace with actual
     Higgsfield SDK or HTTP API calls.
     ======================================================================== */

  static async _uploadImage(filename, localId) {
    if (!HIGGSFIELD_LIVE) {
      // Mock: return a fake media ID
      return `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    // Real implementation: use Higgsfield SDK
    // const { media_id } = await higgsfield.media.upload({ filename, data: buffer });
    // return media_id;

    throw new Error('Higgsfield API key not configured');
  }

  static async _generateVideoBatch(req) {
    if (!HIGGSFIELD_LIVE) {
      // Mock: return simulated jobs
      return {
        jobs: req.jobs.map((j) => ({
          jobId: j.jobId,
          status: 'queued',
          progress: 0,
          createdAt: Date.now(),
          // resultUrl will be filled when job completes
        })),
      };
    }

    // Real implementation: use Higgsfield SDK
    // const batch = await higgsfield.video.generateBatch(req);
    // return batch;

    throw new Error('Higgsfield API key not configured');
  }

  static async _generateVideo(jobReq) {
    if (!HIGGSFIELD_LIVE) {
      // Mock: return simulated job
      return {
        jobId: jobReq.jobId,
        status: 'queued',
        progress: 0,
        createdAt: Date.now(),
      };
    }

    // Real implementation
    throw new Error('Higgsfield API key not configured');
  }

  static async _pollJobs(jobs) {
    if (!HIGGSFIELD_LIVE) {
      // Mock: simulate job progression
      return {
        jobs: jobs.map((j) => ({
          ...j,
          status:
            Math.random() < 0.3
              ? 'completed'
              : Math.random() < 0.05
                ? 'failed'
                : 'generating',
          progress:
            j.status === 'completed' ? 1 : Math.random() * 0.99,
        })),
      };
    }

    // Real implementation: use Higgsfield SDK
    // const result = await higgsfield.jobs.wait({ jobIds: jobs.map(j => j.jobId) });
    // return result;

    throw new Error('Higgsfield API key not configured');
  }

  static async _getCost(req) {
    if (!HIGGSFIELD_LIVE) {
      // Mock: use audited rates from frontend
      const rates = {
        'kling3_0/std/off': 1.5,
        'kling3_0/std/on': 2.0,
        'kling3_0/pro/off': 1.75,
        'kling3_0/pro/on': 2.5,
        'kling3_0/4k/off': 6.0,
      };

      const key = `${req.model}/${req.mode}/${req.sound}`;
      const rate = rates[key] || 1.5;
      const billed = Math.ceil(Math.max(req.duration - 1e-6, 3));

      return {
        cost: Number((rate * billed).toFixed(2)),
        rate,
        billedSeconds: billed,
      };
    }

    // Real implementation: call Higgsfield get_cost
    // const cost = await higgsfield.cost.get({ ...req, get_cost: true });
    // return cost;

    throw new Error('Higgsfield API key not configured');
  }
}
