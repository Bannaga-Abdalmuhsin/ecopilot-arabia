import { pgTable, serial, text, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const assessmentsTable = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  guestToken: text("guest_token"),
  buildingType: text("building_type").notNull(),
  areaM2: real("area_m2").notNull(),
  monthlyBillSar: real("monthly_bill_sar").notNull(),
  acUnits: integer("ac_units").notNull(),
  lightingType: text("lighting_type").notNull(),
  workingHours: real("working_hours"),
  buildingAge: integer("building_age").notNull(),
  hasSolar: boolean("has_solar").notNull().default(false),
  hasSmartThermostat: boolean("has_smart_thermostat").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAssessmentSchema = createInsertSchema(assessmentsTable).omit({ id: true, createdAt: true });
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessmentsTable.$inferSelect;
