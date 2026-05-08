# الوكيل الذكي لخالد سلمان

وكيل ذكاء اصطناعي يمثل خالد سلمان ويتفاعل مع العملاء، يعرض الخدمات الإبداعية والبرمجية، ويحلل الصور.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/khalid-agent run dev` — run the frontend (port 18241)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `AI_INTEGRATIONS_GEMINI_BASE_URL`, `AI_INTEGRATIONS_GEMINI_API_KEY` — auto-set by Replit AI integrations

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS (dark theme, Arabic RTL support)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: Gemini 2.5 Flash via Replit AI Integrations (streaming SSE + image analysis)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/conversations.ts` + `messages.ts` — DB schema
- `artifacts/api-server/src/routes/gemini/` — Gemini AI routes
- `artifacts/khalid-agent/src/` — React frontend

## Architecture decisions

- Gemini 2.5 Flash for chat (streaming SSE) — the backend maps "assistant" → "model" role for Gemini
- Image upload sends base64 with format `[IMAGE:mimeType:base64data]` embedded in the message content
- esbuild external list was modified to include `@google/genai` (removed from externals) so it bundles correctly
- `lib/api-zod/src/index.ts` only exports from `./generated/api` (not `./generated/types`) to avoid duplicate export conflicts

## Product

- Main chat page (`/`) with streaming AI responses, image upload, conversation history sidebar
- Services showcase page (`/services`) with the 4 service categories
- Contact info (WhatsApp, Telegram, Email) visible in sidebar
- System prompt gives the agent Khaled Salman's persona and full service knowledge

## User preferences

- Dark theme by default
- Arabic RTL support
- Khaled Salman's contact: WhatsApp +967783701365 / +967779435445, Telegram @kshskshg, Email khalidsalman7140@gmail.com

## Gotchas

- After changing OpenAPI spec, always run codegen, then fix `lib/api-zod/src/index.ts` to remove `export * from "./generated/types"` (codegen adds it back)
- `@google/genai` must NOT be in esbuild's external list in `artifacts/api-server/build.mjs`
- Gemini role mapping: DB stores "assistant", Gemini needs "model"

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
