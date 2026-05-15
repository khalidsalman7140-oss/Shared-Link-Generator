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
- Required env: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` — auto-set by Replit Clerk integration

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS (dark theme, Arabic RTL support)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: Clerk (email + Google, managed via Replit Auth pane)
- AI: Gemini 2.5 Flash via Replit AI Integrations (streaming SSE + image analysis)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- i18n: Custom React context (AR, EN, FR, TR, ES)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/conversations.ts` + `messages.ts` — DB schema
- `artifacts/api-server/src/routes/gemini/` — Gemini AI routes (auth-protected)
- `artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts` — Clerk FAPI proxy
- `artifacts/khalid-agent/src/` — React frontend
- `artifacts/khalid-agent/src/lib/i18n.tsx` — Multilingual context (5 languages)
- `artifacts/khalid-agent/src/pages/` — landing, chat, sign-in, sign-up, pricing, services
- `artifacts/khalid-agent/.env.local` — VITE_CLERK_PUBLISHABLE_KEY for dev (auto-generated)

## Architecture decisions

- Gemini 2.5 Flash for chat (streaming SSE) — the backend maps "assistant" → "model" role for Gemini
- Image upload sends base64 with format `[IMAGE:mimeType:base64data]` embedded in the message content
- esbuild external list was modified to include `@google/genai` (removed from externals) so it bundles correctly
- `lib/api-zod/src/index.ts` only exports from `./generated/api` (not `./generated/types`) to avoid duplicate export conflicts
- Clerk auth: `requireAuth` middleware on all gemini routes; conversations filtered by `userId`
- `VITE_CLERK_PUBLISHABLE_KEY` must be written to `artifacts/khalid-agent/.env.local` for Vite dev to pick it up (system env vars not exposed to Vite workflow automatically)
- `tailwindcss({ optimize: false })` in vite.config.ts for Clerk CSS layer compatibility

## Product

- Landing page (`/`) — hero, services, pricing teaser, contact info, copyright
- Sign In (`/sign-in`) + Sign Up (`/sign-up`) — Clerk auth with dark Arabic UI
- Chat (`/chat`) — streaming AI agent (auth required), image upload, conversation history
- Services (`/services`) — 4 service categories showcase
- Pricing (`/pricing`) — 4 subscription plans with WhatsApp contact for payment

## Auth & Subscription Flow

- Users must sign in (email or Google) to access the chat
- Conversations are tied to Clerk `userId` — fully isolated per user
- Subscription plans: Free → Weekly ($2.99) → Monthly ($9.99) → Annual ($79.99)
- Payment is manual via WhatsApp — no payment gateway integrated

## Multilingual Support

- 5 UI languages: Arabic (default, RTL), English, French, Turkish, Spanish
- Language stored in `localStorage` as `ks_lang`
- Gemini AI responds in the same language as the user (instructed via system prompt)

## User preferences

- Light/white theme by default (user requested switch from dark to white)
- Arabic RTL support
- Khaled Salman's contact: WhatsApp +967783701365 / +967779435445, Telegram @kshskshg, Email khalidsalman7140@gmail.com
- Khaled's photo: not yet added — landing page uses KS logo placeholder. When received, save to `artifacts/khalid-agent/public/khalid.jpg`

## Gotchas

- After changing OpenAPI spec, always run codegen, then fix `lib/api-zod/src/index.ts` to remove `export * from "./generated/types"` (codegen adds it back)
- `@google/genai` must NOT be in esbuild's external list in `artifacts/api-server/build.mjs`
- Gemini role mapping: DB stores "assistant", Gemini needs "model"
- Clerk proxy middleware (`/api/__clerk`) is production-only; dev uses direct Clerk accounts.dev FAPI
- `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local` must be regenerated if the Clerk instance is reset
- The `publishableKeyFromHost` approach causes Clerk to use the Replit subdomain (inaccessible in dev) — use `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY` directly instead

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Manage auth providers (Google, etc.) and Clerk branding via the Auth pane in the Replit workspace toolbar
