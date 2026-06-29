import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createPublicKey } from "crypto";

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;

if (!SUPABASE_JWT_SECRET) {
  throw new Error("SUPABASE_JWT_SECRET environment variable is required");
}

export interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  role?: string;
  aud?: string | string[];
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: SupabaseJwtPayload;
    }
  }
}

// ---------------------------------------------------------------------------
// JWKS public key cache — supports RS256 and ES256
// ---------------------------------------------------------------------------
interface CachedKey {
  pem: string;
  alg: string;
}

const jwksCache = new Map<string, CachedKey>(); // kid → { pem, alg }

async function loadJwks(): Promise<void> {
  if (!SUPABASE_URL) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
    if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
    const jwks = await res.json() as { keys?: Record<string, unknown>[] };
    for (const key of (jwks.keys ?? [])) {
      if (key.use !== "sig") continue;
      const kid = key.kid as string ?? "default";
      const alg = key.alg as string ?? "ES256";
      try {
        const pubKey = createPublicKey({ key: key as Parameters<typeof createPublicKey>[0], format: "jwk" });
        const pem = pubKey.export({ type: "spki", format: "pem" }) as string;
        jwksCache.set(kid, { pem, alg });
        console.log(`[auth] Loaded JWKS key kid=${kid} alg=${alg}`);
      } catch (e) {
        console.warn(`[auth] Could not import JWKS key kid=${kid}:`, e);
      }
    }
  } catch (err) {
    console.warn("[auth] Could not fetch Supabase JWKS — asymmetric tokens will be rejected:", err);
  }
}

// Load at startup; don't block server start
loadJwks().catch(() => {});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isAuthenticated(payload: SupabaseJwtPayload): boolean {
  if (!payload.sub || typeof payload.sub !== "string" || payload.sub.trim() === "") {
    return false;
  }
  const aud = payload.aud;
  if (Array.isArray(aud)) {
    if (!aud.includes("authenticated")) return false;
  } else {
    if (aud !== "authenticated") return false;
  }
  if (payload.role !== "authenticated") {
    return false;
  }
  return true;
}

function verifyToken(token: string): SupabaseJwtPayload {
  const decoded = jwt.decode(token, { complete: true });
  const headerAlg = decoded?.header?.alg as string | undefined;
  const kid = decoded?.header?.kid as string | undefined;

  // Asymmetric token (RS256 / ES256) — look up by kid or first cached key
  if (headerAlg && headerAlg !== "HS256") {
    const cached = kid ? jwksCache.get(kid) : jwksCache.values().next().value;
    if (!cached) {
      throw new Error(`No JWKS key available for alg=${headerAlg} kid=${kid}`);
    }
    return jwt.verify(token, cached.pem, { algorithms: [cached.alg as jwt.Algorithm] }) as SupabaseJwtPayload;
  }

  // Symmetric HS256 — use the shared secret
  return jwt.verify(token, SUPABASE_JWT_SECRET!, { algorithms: ["HS256"] }) as SupabaseJwtPayload;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);

    if (!isAuthenticated(payload)) {
      res.status(401).json({ error: "Token does not represent an authenticated user" });
      return;
    }

    req.user = payload;
    next();
  } catch (err) {
    req.log.warn({ err: (err as Error).message }, "JWT verify failed");
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = verifyToken(token);
      if (!isAuthenticated(payload)) {
        res.status(401).json({ error: "Token does not represent an authenticated user" });
        return;
      }
      req.user = payload;
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
  }
  next();
}
