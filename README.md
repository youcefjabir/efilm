# Property Motion Studio

Private, owner-only web app that turns professional property still photos into
calm, living, photorealistic premium films. The original photo is always the
visual ground truth: no synthetic camera angles, no generative redesign, no
color grading.

Two motion categories, never combined within a shot:

- **CAMERA_MOTION** — a virtual camera moves through a depth-aware 2.5D
  reprojection of the original pixels (push-in, glide, arc…). Everything in the
  scene is static.
- **SCENE_LIFE** — the camera is perfectly still; only a verified naturally
  dynamic element (pool water, foliage, high grass, thin curtains at an open
  door) moves inside an exact mask.

## Repository layout

```
apps/web            Next.js app (auth, projects, upload, storyboard, render UI)
                    -- db/schema.ts + drizzle/migrations (PGlite locally, Postgres/Supabase in prod)
services/worker     Python render worker (perception, renderers, quality gate)
packages/config     Product config: motion templates, budgets, feature flags
reference           Permanent test dataset + curated benchmark outputs
evals               Quality-gate evaluation scripts
docs                Architecture and operations documentation
infrastructure      Deployment (Vercel/Supabase/Modal) and docker-compose
tests               Cross-cutting integration tests
```

## Quick start (local, zero external accounts)

```bash
pnpm install
cp .env.example apps/web/.env.local        # then set the three *_SECRET values
cd services/worker && pip install -r requirements.txt && cd ../..
pnpm dev                                   # web on :3000
pnpm worker                                # render worker (separate terminal)
```

Log in at http://localhost:3000 with the owner email. In local auth mode the
magic link is printed in the web server terminal.

See `docs/` for architecture, deployment (Vercel + Supabase + optional Modal
GPU), security model, and known limitations.

## Non-negotiable quality rules

The system must never invent image information: no new angles, no moved
furniture, no bent walls, no color grading, no full-frame generative video.
When a shot cannot pass its quality gate the system reduces motion, falls back
to a safer template, goes near-static, or skips the image — in that order.
