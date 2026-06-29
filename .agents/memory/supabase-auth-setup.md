---
name: Supabase Auth Setup
description: Key decisions and quirks for the energy-advisor Supabase auth integration
---

## Supabase client initialization
- SUPABASE_URL and SUPABASE_ANON_KEY are Replit secrets (not VITE_-prefixed)
- Exposed to the Vite frontend via `define: { __SUPABASE_URL__: ..., __SUPABASE_ANON_KEY__: ... }` in vite.config.ts
- Must declare `declare const __SUPABASE_URL__: string;` in supabase.ts for TypeScript
- A full Vite workflow restart is required whenever secrets are added/changed (HMR reload alone does NOT pick up new process.env values at define-time)

## JWT verification (backend) — CRITICAL
- Middleware at `artifacts/api-server/src/middlewares/auth.ts`
- Supabase now issues **ES256** (ECDSA P-256) tokens, NOT HS256
- The JWKS endpoint is `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`
- At server startup, the middleware fetches the JWKS and caches the EC public key as PEM
- Token verification: checks the `alg` header, selects RS256/ES256 from JWKS cache or falls back to HS256 with SUPABASE_JWT_SECRET
- Also enforces `aud === 'authenticated'`, `role === 'authenticated'`, and non-empty `sub`
- `SUPABASE_JWT_SECRET` (HS256) is still used as a fallback but current Supabase issues ES256

**Why:** Supabase switched from HS256 to ES256 asymmetric signing. Hard-coding `algorithms: ['HS256']` causes `invalid algorithm` errors for all tokens.

**How to apply:** Any future auth middleware must load JWKS at startup and support ES256. Do not hard-code HS256 only.

## Frontend auth token injection
- `setAuthTokenGetter` from `@workspace/api-client-react` wires the Supabase session access_token into every API request automatically
- Called once at module level in App.tsx before the component tree renders
- For custom fetch calls (not using the generated client), always call `supabase.auth.getSession()` fresh — never use the stale `session.access_token` from React state (it can expire)

## RTL / language direction
- `LanguageDirectionSync` component in App.tsx handles `document.documentElement.dir` globally
- Also duplicated in Navbar for completeness
- Must be INSIDE the WouterRouter so it has access to i18n context from I18nextProvider

## Navbar visibility
- Navbar always rendered (outside ProtectedRoute) so it shows on /auth page too
- Navbar checks `user` from useAuth and conditionally shows profile avatar / sign-in only when logged in
