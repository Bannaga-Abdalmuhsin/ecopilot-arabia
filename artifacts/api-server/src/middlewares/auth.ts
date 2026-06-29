import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

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

function isAuthenticated(payload: SupabaseJwtPayload): boolean {
  // sub must be a non-empty string (Supabase user UUID)
  if (!payload.sub || typeof payload.sub !== "string" || payload.sub.trim() === "") {
    return false;
  }

  // aud must include "authenticated" — Supabase sets this for real user sessions
  const aud = payload.aud;
  if (Array.isArray(aud)) {
    if (!aud.includes("authenticated")) return false;
  } else {
    if (aud !== "authenticated") return false;
  }

  // role must be "authenticated" — anon/service-role tokens have a different role
  if (payload.role !== "authenticated") {
    return false;
  }

  return true;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, SUPABASE_JWT_SECRET!, {
      algorithms: ["HS256"],
    }) as SupabaseJwtPayload;

    if (!isAuthenticated(payload)) {
      res.status(401).json({ error: "Token does not represent an authenticated user" });
      return;
    }

    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Parses the token if present and valid.
 * If an Authorization header IS present but the token is invalid, rejects with 401.
 * If no Authorization header, proceeds as anonymous.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, SUPABASE_JWT_SECRET!, {
        algorithms: ["HS256"],
      }) as SupabaseJwtPayload;
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
