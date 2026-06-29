---
name: Supabase Auth Setup
description: Key decisions and quirks for the energy-advisor Supabase auth integration
---

## Supabase client initialization
- SUPABASE_URL and SUPABASE_ANON_KEY are Replit secrets (not VITE_-prefixed)
- Exposed to the Vite frontend via `define: { __SUPABASE_URL__: ..., __SUPABASE_ANON_KEY__: ... }` in vite.config.ts
- Must declare `declare const __SUPABASE_URL__: string;` in supabase.ts for TypeScript
- A full Vite workflow restart is required whenever secrets are added/changed (HMR reload alone does NOT pick up new process.env values at define-time)

## JWT verification (backend)
- Middleware at `artifacts/api-server/src/middlewares/auth.ts`
- Verifies HS256 signature AND enforces `aud === 'authenticated'`, `role === 'authenticated'`, and non-empty `sub`
- This rejects anon/service-role tokens that share the same JWT secret

**Why:** Supabase uses the same JWT secret for all token types; checking only the signature would accept non-user tokens.

## Frontend auth token injection
- `setAuthTokenGetter` from `@workspace/api-client-react` wires the Supabase session access_token into every API request automatically
- Called once at module level in App.tsx before the component tree renders

## RTL / language direction
- `LanguageDirectionSync` component in App.tsx handles `document.documentElement.dir` globally
- Also duplicated in Navbar for completeness
- Must be INSIDE the WouterRouter so it has access to i18n context from I18nextProvider

## Navbar visibility
- Navbar always rendered (outside ProtectedRoute) so it shows on /auth page too
- Navbar checks `user` from useAuth and conditionally shows sign-out / user email only when logged in
