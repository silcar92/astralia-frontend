# Astralia Frontend

Web de Astralia* — Next.js 15 + TypeScript + Tailwind v4 + HeroUI v3. *Nombre de trabajo, no despejado legalmente todavía.

Producto completo: `../Docs/Initial Docs 26-09-2026/Astralia_PRD_v1_0.docx`. Backend: `../astralia-backend/` (API en `NEXT_PUBLIC_API_URL`).

## Stack
- Next.js 15.5 (App Router, sin `src/`) + React 19 + TypeScript — misma familia de versión que WiiGold frontend (WiiGold usó 15.5 exacto).
- Tailwind v4 + HeroUI v3 (`@heroui/react`). HeroUI v3 no usa `<Provider>` ni `tailwind.config.js` — solo `@import "@heroui/styles";` en `app/globals.css`. Distinto de HeroUI v2 (el que probablemente usa WiiGold, project más viejo) — no copiar snippets de v2 (`NextUIProvider`, plugin en `tailwind.config.js`) de ahí.
- Capas por dominio, igual patrón que WiiGold: `contexts/` (un Context por dominio, no monolítico), `hooks/` (envuelven contexts), `services/` (acceso a API, separado de componentes) + `services/apiStateHandler.ts` genérico para estados loading/success/error.

## Rutas (`app/`) — Information Architecture del PRD §7
| Ruta | Sección PRD |
|---|---|
| `/cosmos` | Feed social — §16 |
| `/discover` | Recomendaciones (Today's 5 Cosmic Suggestions) — §13 |
| `/cosmic-storm` | Swipe ilimitado, secundario — §17 |
| `/communities` | Comunidades — §18 |
| `/events` | Eventos — §19 |
| `/chats` | Mensajería, solo tras conexión mutua — §20 |
| `/galaxy` | My Galaxy — §15 |
| `/(auth)/onboarding` | Onboarding + verificación — §8 |

Todas son stubs por ahora — sin lógica de negocio, solo el esqueleto de rutas.

## Reglas de producto no negociables (PRD)
- Terminología: "Connect / Connected / Disconnect", nunca "Follow / Unfollow".
- Chat solo visible/accesible tras conexión mutua.
- Nunca mostrar ubicación exacta ni fecha de nacimiento exacta en el perfil de otro usuario.
- Publicidad siempre distinguible visualmente del contenido de usuarios/comunidades.

## Setup local
```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## Deploy
Render, vía `render.yaml` en la raíz. `NEXT_PUBLIC_API_URL` se configura manualmente en el dashboard de Render (no en el blueprint) apuntando a la URL pública del backend.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
