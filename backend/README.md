# Viewly Motion Backend

Backend adapter that connects the Viewly Motion frontend to Higgsfield MCP for actual video generation.

## Setup

### Development (Mock Mode)

Run with mock backend — no Higgsfield credentials needed:

```bash
npm install
npm run dev
```

Then update the frontend's `API_BASE` in `index.html`:
```javascript
const API_BASE = "http://localhost:3001";
```

The mock backend simulates the full job lifecycle, so you can test the entire UI flow without real video generation.

### Production (Live Mode)

1. **Install Higgsfield SDK** (or configure HTTP client)
```bash
npm install higgsfield-sdk
```

2. **Set Higgsfield API credentials**
```bash
export HIGGSFIELD_API_KEY="your-api-key"
```

3. **Update `higgs-adapter.js`**

Replace the stub implementations in `HiggsAdapter` class with actual Higgsfield SDK calls:

- `_uploadImage()` → `higgsfield.media.upload()`
- `_generateVideoBatch()` → `higgsfield.video.generateBatch()`
- `_pollJobs()` → `higgsfield.jobs.wait()`
- `_getCost()` → `higgsfield.cost.get({ get_cost: true })`

Example (using hypothetical Higgsfield SDK):

```javascript
static async _uploadImage(filename, localId) {
  // In the frontend, imageRef includes base64 data in a file upload
  // The backend needs to decode and upload to Higgsfield
  const { media_id } = await higgsfield.media.upload({ filename });
  return media_id;
}

static async _generateVideoBatch(req) {
  const batch = await higgsfield.video.generateBatch({
    model: req.model,
    jobs: req.jobs.map(j => ({
      jobId: j.jobId,
      startImage: j.mediaId,
      duration: j.duration,
      aspectRatio: j.aspect,
      ...j
    }))
  });
  return batch;
}

static async _pollJobs(jobIds) {
  return await higgsfield.jobs.wait({ jobIds });
}

static async _getCost(params) {
  return await higgsfield.cost.get({ 
    ...params,
    get_cost: true  // This flag gets live pricing
  });
}
```

4. **Deploy**

```bash
npm start
```

Point the frontend's `API_BASE` to your deployed server.

## API Routes

### `POST /api/motion/production`

Create a new production and dispatch video generation jobs.

**Request:**
```json
{
  "projectId": "proj_...",
  "model": "kling3_0",
  "aspect": "16:9",
  "mode": "std",
  "sound": "off",
  "shots": [
    {
      "shotId": "shot_0",
      "index": 0,
      "duration": 3.5,
      "cameraPrompt": "Slow dolly forward.",
      "imageRef": {
        "localId": "img_0",
        "name": "exterior_01.jpg"
      }
    }
  ]
}
```

**Response:**
```json
{
  "productionId": "prod_...",
  "status": "dispatched",
  "createdAt": 1694029800000,
  "jobs": [
    {
      "jobId": "job_...",
      "status": "queued"
    }
  ]
}
```

### `GET /api/motion/production/:id`

Poll production status.

**Response:**
```json
{
  "productionId": "prod_...",
  "status": "running",
  "snapshot": {
    "jobs": [
      {
        "jobId": "job_...",
        "status": "generating",
        "progress": 0.45,
        "resultUrl": null
      }
    ]
  }
}
```

### `POST /api/motion/production/:id/retry`

Retry a single failed shot.

**Request:**
```json
{
  "shotId": "shot_0"
}
```

**Response:**
Same as `GET /api/motion/production/:id`.

### `POST /api/motion/cost`

Get live cost estimate from Higgsfield.

**Request:**
```json
{
  "model": "kling3_0",
  "mode": "std",
  "sound": "off",
  "aspect": "16:9",
  "shots": [
    {
      "shotId": "shot_0",
      "duration": 3.5
    }
  ]
}
```

**Response:**
```json
{
  "total": 5.25,
  "perShot": [
    {
      "shotId": "shot_0",
      "cost": 5.25,
      "rate": 1.5,
      "billedSeconds": 4,
      "verified": true
    }
  ],
  "source": "higgsfield-live"
}
```

## State Management

The `Productions` class manages production lifecycle:

- **created**: Production record created, images queued for upload
- **dispatched**: Jobs submitted to Higgsfield, polling started
- **running**: Jobs in flight (generating or queued)
- **partial**: Some jobs completed, some failed
- **completed**: All jobs completed successfully

For production use, back `Productions` with a real database (PostgreSQL, MongoDB, etc.) so production state survives server restarts and can be queried across multiple backend instances.

## Architecture

```
Frontend (HTML/JS)
    ↓
API_BASE → Backend (Node.js Express)
            ├─ Productions (state)
            └─ HiggsAdapter (Higgsfield SDK/HTTP)
                    ↓
                    Higgsfield MCP
                    ├─ media_upload
                    ├─ generate_video_batch
                    ├─ jobs_wait
                    └─ get_cost
```

## Image Uploads

The frontend cannot upload images directly to Higgsfield (no server-side authentication). Instead:

1. Frontend loads image as base64 or File object
2. Frontend sends to backend's `/api/motion/production`
3. Backend uploads to Higgsfield `media_upload` endpoint
4. Backend stores `media_id` → `shotId` mapping
5. Backend submits video generation with media IDs

The actual image data flow depends on how the frontend passes images. Check the Viewly Motion index.html for how images are prepared before sending the production spec.

## Troubleshooting

**"Mock-backend" showing in UI?**
- Set `HIGGSFIELD_API_KEY` environment variable
- Verify `higgs-adapter.js` has real SDK calls (not stubs)

**Jobs stuck in "queued"?**
- Check Higgsfield API logs for errors
- Verify media uploads succeeded (`media_id` is valid)
- Check job parameters match Higgsfield model requirements

**Cost mismatch?**
- Frontend has audited rates for common configurations
- Live cost from backend should match or be lower (due to bulk discounts)
- If cost endpoint fails, frontend falls back to local calculation

## Environment Variables

```bash
PORT=3001                           # Server port
HIGGSFIELD_API_KEY=...             # Higgsfield API key (enables live mode)
NODE_ENV=production                # Set to production for deployment
```
