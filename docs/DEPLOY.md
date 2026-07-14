# Deploy — Property Motion Studio

Två sätt att köra appen. Båda är helt självförsörjande (ingen tredjepartstjänst
krävs; Gemini/Supabase är valfria tillägg).

## 1. Docker (rekommenderat för server/NAS)

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
