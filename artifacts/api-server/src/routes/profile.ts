import { Router } from "express";
import { db } from "@workspace/db";
import { profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// GET /profile — returns the current user's profile
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.sub;
    const [profile] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId));
    res.json(profile ?? { userId, displayName: null, mobile: null });
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    res.status(500).json({ error: "Failed to retrieve profile" });
  }
});

// PATCH /profile — upserts display name and/or mobile
router.patch("/profile", requireAuth, async (req, res) => {
  const userId = req.user!.sub;
  const { displayName, mobile } = req.body ?? {};

  // Basic validation — both fields are optional strings (or null)
  if (
    (displayName !== undefined && displayName !== null && (typeof displayName !== "string" || displayName.length > 100)) ||
    (mobile !== undefined && mobile !== null && (typeof mobile !== "string" || mobile.length > 20))
  ) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  try {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (displayName !== undefined) set.displayName = displayName ?? null;
    if (mobile !== undefined) set.mobile = mobile ?? null;

    await db
      .insert(profilesTable)
      .values({ userId, displayName: displayName ?? null, mobile: mobile ?? null })
      .onConflictDoUpdate({ target: profilesTable.userId, set });

    const [profile] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId));
    res.json(profile);
  } catch (err) {
    req.log.error({ err }, "Failed to update profile");
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
