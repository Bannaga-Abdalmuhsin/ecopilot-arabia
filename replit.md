# Energy Efficiency Advisor

An AI-Powered Energy Efficiency Advisor for the Saudi Arabian market. Users fill out a multi-step building assessment form and instantly receive a full AI-analyzed energy health report with scores, charts, ranked recommendations, and an AI chat consultant.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/energy-advisor run dev` — run the frontend (port 24779)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)
- Required env: `OPENAI_API_KEY` — OpenAI API key for AI analysis and chat

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Recharts, Framer Motion, wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4), drizzle-zod
- AI: OpenAI (gpt-4o-mini) with JSON mode for structured energy reports
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/src/schema/` — assessments, reports, chatMessages tables
- `artifacts/api-server/src/routes/assessments.ts` — all assessment/chat routes
- `artifacts/api-server/src/lib/openai.ts` — AI analysis and chat functions
- `artifacts/energy-advisor/src/` — React frontend

## Architecture decisions

- Assessment creation is atomic: the assessment row is deleted if AI analysis or report insertion fails, preventing orphaned history entries.
- Chat messages are rolled back on AI failure to keep conversation history consistent.
- OpenAI JSON mode (`response_format: { type: "json_object" }`) used for structured energy reports.
- AI output is validated for critical fields before DB insert.
- Saudi market context is baked into the system prompt (HVAC dominance, SAR currency).

## Product

- **Landing + Form**: 3-step animated assessment form collecting building specs
- **Dashboard**: Energy score dial, waste/savings metrics, cost breakdown pie chart, savings bar chart, AI executive summary, ranked recommendations, AI chat sidebar
- **History**: List of all past assessments linking to their dashboards

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm run typecheck:libs` after changing any `lib/*` schema before running artifact typechecks.
- The AI prompt enforces Saudi context (SAR, HVAC focus, Gulf climate) — keep this in system prompts.
- Do not change `info.title` in openapi.yaml — it controls generated filenames.
