import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const profilesTable = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  displayName: text("display_name"),
  mobile: text("mobile"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Profile = typeof profilesTable.$inferSelect;
