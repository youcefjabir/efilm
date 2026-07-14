# Deploy — Property Motion Studio

Tre sätt att köra appen.

## 0. Vercel + Supabase (publik URL, delbar länk)

Webbappen körs på Vercel (serverless). Databasen och filerna (bilder/videor)
ligger i Supabase, eftersom Vercels serverless-funktioner inte har ett
beständigt filsystem. **Render-workern (Python) kan inte köras på Vercel**
— serverless-funktioner tillåter inte långlivade processer — den behöver en
egen, alltid-igång värd (steg 4).

### 1. Supabase-projekt

1. Skapa ett projekt på supabase.com (gratisnivån räcker för test/utvärdering)
2. **Storage** → skapa sex **privata** buckets med exakt dessa namn:
   `originals`, `proxies`, `thumbs`, `masks`, `renders`, `exports`
3. Notera från **Project Settings → API**: `Project URL` och `service_role`-nyckeln
   (hemlig — delas aldrig med webbläsaren)
4. Notera från **Project Settings → Database**: connection string (`URI`-format,
   använd "Transaction pooler"-varianten för serverless)

### 2. Vercel-projekt

1. Importera GitHub-repot i Vercel, sätt **Root Directory** till `apps/web`
   (Vercel upptäcker automatiskt pnpm-workspacet och installerar från repo-roten)
2. Environment Variables (Production):
   ```
   OWNER_EMAIL              = din e-postadress
   AUTH_SECRET               = openssl rand -hex 32
   WORKER_SHARED_SECRET      = openssl rand -hex 32
   STORAGE_SIGNING_SECRET    = openssl rand -hex 32
   DATABASE_PROVIDER         = postgres
   DATABASE_URL               = <connection string från Supabase, steg 1.4>
   STORAGE_PROVIDER          = supabase
   NEXT_PUBLIC_SUPABASE_URL  = <Project URL från Supabase, steg 1.3>
   SUPABASE_SERVICE_ROLE_KEY = <service_role-nyckel från Supabase, steg 1.3>
   ```
3. Deploy. Notera den publika URL:en Vercel ger dig (`https://<projekt>.vercel.app`).

### 3. Logga in

Inget mejl skickas i det här läget (för att slippa ännu ett tredjepartskonto).
Begär en inloggningslänk på sidan, öppna sedan **Vercel Dashboard → ditt
projekt → Logs** och sök efter `[auth] Magic link` — raden innehåller den
kompletta länken. (Vill du ha riktiga mejl går det att koppla in `AUTH_PROVIDER=supabase`,
men det kräver ytterligare arbete med Supabase Auth-flödet — hör av dig om du vill ha det.)

### 4. Render-worker (måste köras separat, alltid igång)

Rekommendation: **Railway** (enklast — deployar `infrastructure/Dockerfile.worker`
direkt från GitHub, generös gratisnivå, stödjer långlivade processer).

1. Nytt Railway-projekt → "Deploy from GitHub repo" → välj detta repo
2. Settings → Dockerfile Path: `infrastructure/Dockerfile.worker`, Root: `/` (repo-roten)
3. Environment Variables:
   ```
   WEB_INTERNAL_URL      = https://<ditt-projekt>.vercel.app
   WORKER_SHARED_SECRET  = <samma värde som i Vercel, steg 2.2>
   WORKER_CONCURRENCY    = 2
   ```
4. Deploy. Workern börjar polla webbappen omedelbart.

Alternativ till Railway: Render.com, Fly.io, eller din egen VPS — samma
Dockerfile fungerar överallt som stödjer långlivade Docker-containrar.

## 1. Docker (självhostat, en maskin — enklast om du inte behöver en publik länk)

Krav: Docker med compose-plugin.

```bash
cp .env.example .env
# Redigera .env:
#   OWNER_EMAIL       = din e-postadress (enda kontot som kan logga in)
#   AUTH_SECRET, WORKER_SHARED_SECRET, STORAGE_SIGNING_SECRET
#                     = tre olika värden från: openssl rand -hex 32

docker compose up --build -d
```

Öppna http://localhost:3000, ange din e-postadress. I lokal-läge skickas inget
mejl — inloggningslänken skrivs i webbcontainerns logg:

```bash
docker compose logs web | grep "auth/callback"
```

All data (databas + bilder + videor) ligger i den namngivna volymen `pms-data`.

### Postgres istället för inbyggd databas (valfritt)

```bash
# I .env:  DATABASE_PROVIDER=postgres
#          DATABASE_URL=postgres://pms:pms@postgres:5432/pms
docker compose --profile postgres up --build -d
```

## 2. Direkt på en maskin (utveckling)

Krav: Node 22 + pnpm, Python 3.11+, ffmpeg.

```bash
pnpm install
pip install -r services/worker/requirements.txt

cp .env.example apps/web/.env.local   # fyll i OWNER_EMAIL + tre secrets

# Terminal 1 — webbappen
cd apps/web && pnpm build && pnpm start

# Terminal 2 — render-workern
cd services/worker
WORKER_SHARED_SECRET=<samma som i .env.local> python3 -m pms_worker.jobs.loop
```

Inloggningslänken skrivs i terminal 1.

## Prestanda

Renderingen är CPU-bunden. `WORKER_CONCURRENCY` styr antalet parallella
render-processer (standard: hälften av kärnorna, max 4). Riktvärde på en
4-kärnig maskin: 8 bilder → färdig ~28 s-film på ca 1,5 minut totalt.

## Uppgradering

```bash
git pull
docker compose up --build -d   # migrationer körs automatiskt vid start
```

## Felsökning

- **Workern får 401** — `WORKER_SHARED_SECRET` skiljer sig mellan web och worker.
- **"ffmpeg not found"** (direkt-läge) — installera ffmpeg, eller
  `pip install imageio-ffmpeg`.
- **Skott får status "skipped"** — alla kvalitetsförsök underkändes för bilden;
  öppna storyboarden, välj ett försiktigare rörelsemall och rendera om skottet.
