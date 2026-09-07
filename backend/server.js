import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Productions } from './productions.js';
import { HiggsAdapter } from './higgs-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize storage
const productions = new Productions();

/* =================================================================
   POST /api/motion/production
   Create a new production. Uploads images to Higgsfield, submits
   generate_video_batch jobs for each shot.
   ================================================================= */
app.post('/api/motion/production', async (req, res) => {
  try {
    const spec = req.body;
    if (!spec.projectId || !spec.shots || !Array.isArray(spec.shots)) {
      return res.status(400).json({ error: 'Invalid spec' });
    }

    // Create production record
    const prod = await productions.create(spec);

    // Dispatch to Higgsfield adapter
    try {
      const result = await HiggsAdapter.createProduction(prod);
      res.json(result);
    } catch (err) {
      console.error('Higgsfield error:', err);
      res.status(500).json({ error: err.message });
    }
  } catch (err) {
    console.error('Production creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* =================================================================
   GET /api/motion/production/:id
   Poll production status. Queries Higgsfield job status and returns
   the latest snapshot.
   ================================================================= */
app.get('/api/motion/production/:id', async (req, res) => {
  try {
    const prod = productions.get(req.params.id);
    if (!prod) {
      return res.status(404).json({ error: 'Production not found' });
    }

    try {
      const result = await HiggsAdapter.getProduction(prod);
      res.json(result);
    } catch (err) {
      console.error('Higgsfield poll error:', err);
      res.status(500).json({ error: err.message });
    }
  } catch (err) {
    console.error('Production poll error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* =================================================================
   POST /api/motion/production/:id/retry
   Retry a single failed shot.
   ================================================================= */
app.post('/api/motion/production/:id/retry', async (req, res) => {
  try {
    const prod = productions.get(req.params.id);
    if (!prod) {
      return res.status(404).json({ error: 'Production not found' });
    }

    const { shotId } = req.body;
    if (!shotId) {
      return res.status(400).json({ error: 'shotId required' });
    }

    try {
      const result = await HiggsAdapter.retryShot(prod, shotId);
      res.json(result);
    } catch (err) {
      console.error('Higgsfield retry error:', err);
      res.status(500).json({ error: err.message });
    }
  } catch (err) {
    console.error('Retry error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* =================================================================
   POST /api/motion/cost
   Live cost estimate — proxies get_cost:true to Higgsfield and
   returns the provider's own figures. If Higgsfield is unavailable,
   falls back to audited rates.
   ================================================================= */
app.post('/api/motion/cost', async (req, res) => {
  try {
    const spec = req.body;
    if (!spec.shots || !Array.isArray(spec.shots)) {
      return res.status(400).json({ error: 'Invalid spec' });
    }

    try {
      const cost = await HiggsAdapter.getCost(spec);
      res.json(cost);
    } catch (err) {
      console.error('Cost lookup error:', err);
      // Fallback to frontend calculation (not ideal, but acceptable)
      res.status(500).json({ error: err.message });
    }
  } catch (err) {
    console.error('Cost error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Uncaught error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Viewly Motion backend listening on port ${port}`);
  console.log(`Set API_BASE to http://localhost:${port} in the frontend`);
});
