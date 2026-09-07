# Viewly Motion

**Plan first, generate second.** A production system for premium real-estate video from still images. Music drives timing. Higgsfield is an adapter.

## What's Included

### Frontend (`viewly-motion/`)

Complete single-page application for planning and generating property videos:

- **8-step workflow**: Material → Direction → Music → Timing → Camera → Brand → Preflight → Production → Editor
- **Music-driven timing**: Analyzes audio to align shots with musical events within learned room-duration ranges
- **Real-time cost tracking**: Uses verified Kling 3.0 rates (1.50 credits/second standard mode)
- **Motion graphics**: Editable, layer-based graphics with timing controls
- **Timeline editor**: Full shot and graphics editing with snap-to-music
- **Export**: WebM rendering with optional H.264 server-side conversion

Static HTML page — no build step. Open `viewly-motion/index.html` in a browser or:

```bash
npx serve viewly-motion
```

Then point to mock backend at http://localhost:3001 (see below).

### Backend (`backend/`)

Node.js/Express server that bridges the frontend to Higgsfield MCP:

- **Production API**: `POST /api/motion/production`, `GET /api/motion/production/:id`, `POST /api/motion/production/:id/retry`
- **Cost API**: `POST /api/motion/cost` (live pricing from Higgsfield)
- **Mock mode**: Full job lifecycle simulation for testing (no credentials needed)
- **Live mode**: Integrates Higgsfield MCP for real video generation

Development (mock backend):

```bash
cd backend
npm install
npm run dev
```

Update frontend `API_BASE` to `http://localhost:3001`.

Production (live Higgsfield):

1. Set `HIGGSFIELD_API_KEY` environment variable
2. Replace stub implementations in `higgs-adapter.js` with real Higgsfield SDK calls
3. Deploy and update `API_BASE` to your server URL

See `backend/README.md` for full setup instructions.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Frontend (HTML/JS)                         │
│  • Project management                       │
│  • 8-step workflow UI                       │
│  • Music analysis + timing                  │
│  • Timeline editor                          │
│  • Graphics system                          │
│  • WebM export                              │
└────────────────┬────────────────────────────┘
                 │ API_BASE
                 ↓
┌─────────────────────────────────────────────┐
│  Backend (Node.js/Express)                  │
│  • Production state management              │
│  • Image upload to Higgsfield               │
│  • Job dispatch & polling                   │
│  • Cost lookup (live pricing)               │
│  • Mock mode for testing                    │
└────────────────┬────────────────────────────┘
                 │ Higgsfield SDK/HTTP
                 ↓
┌─────────────────────────────────────────────┐
│  Higgsfield MCP                             │
│  • media_upload: Image storage              │
│  • generate_video_batch: Submit jobs        │
│  • jobs_wait: Poll status                   │
│  • get_cost: Live pricing (get_cost:true)   │
└─────────────────────────────────────────────┘
```

## Provider: Kling v3.0

**Verified pricing** (audited 2026-09-06):

| Mode | Sound | Rate |
|------|-------|------|
| Standard | off | 1.50 cr/s |
| Standard | on | 2.00 cr/s |
| Pro | off | 1.75 cr/s |
| Pro | on | 2.50 cr/s |
| 4K | off | 6.00 cr/s |

- Duration range: 3–15 seconds
- Aspect ratios: 16:9, 9:16, 1:1 (cost identical)
- Kling bills whole seconds (3.7s planned → 4s billed → 4s × rate = cost)

## Creative Vocabulary

### Room Types (13 detected via filename hints)

Exterior, Living Room, Kitchen, Dining Room, Bedroom, Bathroom, Hall, Balcony, Patio, View, Detail, Area, Other

Each has preferred duration range and default camera motion.

### Creative Directions

- **Lugn (Calm)**: 1.16× duration, few cuts, soft motion
- **Balanserad (Balanced)**: 1.0× duration, standard tempo, typical for properties
- **Dynamisk (Dynamic)**: 0.84× duration, tight editing, documentary style

### Camera Motions

11 canonical moves (slow push in, pan left, subtle drift, cinematic push, etc.) with simple prompts.

### Motion Graphics Families

5 styles with different line weights, easing, pacing: Editorial, Architectural, Quiet Luxury, Modern Precision, Cinematic.

## Workflow

1. **Upload images** (6–12 property photos)
   - Auto-detects room type from filename
   - User can override room and mark "hero" shots
   - Shot importance (hero/high/normal/supporting) affects duration weighting

2. **Choose creative direction** (Calm/Balanced/Dynamic)
   - Scales timing, motion intensity, graphics density

3. **Select music** from library or upload
   - Real DSP analysis: onset detection, tempo, beat grid, energy novelty
   - Shot times snap to musical events

4. **Timing plan**
   - Music drives shot durations within learned room-type ranges
   - Total film length is computed, not set
   - Can manually adjust individual shots

5. **Camera motions**
   - Pick per-shot or auto-assign (based on room type)
   - Simple, directional prompts (no over-specification)

6. **Brand settings**
   - Office name, address, living area, brand lock
   - Graphics family and density (minimal/balanced/expressive)

7. **Preflight & cost review**
   - Shows each shot's billed duration and cost
   - Live cost from Higgsfield if backend is connected
   - Fallback to audited rates if backend unavailable

8. **Production dispatch**
   - Uploads images to Higgsfield
   - Submits `generate_video_batch` with all shots
   - Polls job status in real-time
   - Shows per-shot progress and errors
   - Retry failed shots

9. **Editor**
   - Timeline with shots + overlaid graphics
   - Trim shots, snap to music, adjust graphics timing
   - Render preview or export

## Data Model

**Project**
- id, name, createdAt, updatedAt
- property: { address, city, living_area_m2 }
- images: array of SourceImage
- direction: LUGN | BALANSERAD | DYNAMISK
- music: MusicTrack (if selected)
- plan: TimingPlan (computed from images + music + direction)
- production: ProductionRun (if generated)
- graphics: array of Graphic
- output: { model, aspect, mode, sound, resolution }
- brandId, brandLock, graphicFamily, graphicDensity

**SourceImage**
- id, name, url, el (DOM reference)
- include: boolean (is this shot in the film?)
- room: EXTERIOR | VARDAGSRUM | KOK | etc.
- importance: HERO | HIGH | NORMAL | SUPPORTING
- motion: camera motion assigned

**TimingPlan**
- shots: array of TimelineShot
- total: computed film duration (seconds)
- alignedCuts: how many shots align with music events
- endsOnResolution: does the last shot land on a strong beat?

**ProductionRun**
- id, status (created/dispatched/running/partial/completed)
- spec: the exact request sent to Higgsfield
- jobs: array of HiggsJob
- snapshot: latest job status from jobs_wait

## Tech Stack

**Frontend**
- Vanilla JavaScript (ES2024)
- Canvas for graphics preview and export
- IndexedDB for image blobs
- localStorage for project persistence
- Web Audio API for music analysis (FFT, spectral flux, autocorrelation)

**Backend**
- Node.js + Express
- Higgsfield SDK or HTTP client (to be configured)
- In-memory production registry (swap for database in production)

**Deployment**
- Frontend: Static file host (Netlify, Vercel, S3+CloudFront)
- Backend: Any Node.js host (Heroku, Render, AWS Lambda, VPS)

## Next Steps

1. **Test mock backend locally**
   ```bash
   cd backend && npm install && npm run dev
   # In another terminal
   cd viewly-motion && npx serve
   # Set frontend API_BASE to http://localhost:3001
   ```

2. **Integrate live Higgsfield**
   - Get Higgsfield API key
   - Update `backend/higgs-adapter.js` with real SDK calls
   - Deploy backend with `HIGGSFIELD_API_KEY` environment variable

3. **Add persistent storage**
   - Back `Productions` class with PostgreSQL or MongoDB
   - Store project history and analytics

4. **Enhance graphics**
   - Add more motion graphic templates
   - Build typography and color library from brand profiles

5. **Polish UI**
   - Dark mode refinements
   - Mobile responsiveness (currently desktop-focused)
   - Keyboard shortcuts and undo/redo

## License & Credits

Built with Higgsfield and Kling v3.0. See individual directories for detailed documentation.
