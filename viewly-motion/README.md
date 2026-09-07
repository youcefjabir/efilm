# Viewly Motion

Semi-automatiserat produktionssystem för premium bostadsfilm.
Plan first, generate second — musiken driver timingen, Higgsfield är en adapter.

## Köra

Statisk sida, inga byggsteg:

    npx serve viewly-motion

## Backend-kontrakt

Allt utom själva Higgsfield-anropet kör i webbläsaren. Sätt `API_BASE` i
`index.html` till er server så försvinner mock-transporten utan
frontend-ändringar.

| Route | Ansvar |
|---|---|
| `POST /api/motion/production` | Tar emot production spec, laddar upp bilder (`media_upload`), mappar varje shot till `generate_video_batch` |
| `GET /api/motion/production/:id` | Pollar `jobs_wait`, returnerar status + `resultUrl` per jobb |
| `POST /api/motion/production/:id/retry` | Kör om ett enskilt shot |
| `POST /api/motion/cost` | Proxar `get_cost:true` — live-pris blir facit över den auditerade tabellen |

## Provider-audit (2026-09-06)

Kling v3.0 via Higgsfield MCP. Varje siffra kommer från en riktig
`get_cost`-preflight, inget är gissat.

| Läge | Ljud | Credits/s | Verifierat på |
|---|---|---|---|
| std | off | 1.50 | 3s=4.5 · 4s=6 · 5s=7.5 · 6s=9 · 10s=15 |
| std | on | 2.00 | 5s=10 |
| pro | off | 1.75 | 5s=8.75 · 10s=17.5 |
| pro | on | 2.50 | 5s=12.5 |
| 4k | off | 6.00 | 5s=30 · 8s=48 |

Aspect ratio påverkar inte priset (verifierat på 16:9, 9:16, 1:1).
Kling debiterar hela sekunder — planerad längd genereras uppåtavrundad och
trimmas exakt på musikeventet i editorn.
