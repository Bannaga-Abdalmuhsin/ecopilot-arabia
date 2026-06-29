import { pgTable, serial, integer, real, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { assessmentsTable } from "./assessments";

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").notNull().references(() => assessmentsTable.id),
  energyScore: real("energy_score").notNull(),
  estimatedWastePct: real("estimated_waste_pct").notNull(),
  annualWasteSar: real("annual_waste_sar").notNull(),
  potentialSavingsSar: real("potential_savings_sar").notNull(),
  executiveSummary: text("executive_summary").notNull(),
  recommendations: jsonb("recommendations").notNull().$type<Array<{
    title: string;
    savingsSar: number;
    roiYears: number;
    priorityStars: number;
    rationale: string;
  }>>(),
  carbonReductionTons: real("carbon_reduction_tons").notNull(),
  treesEquivalent: integer("trees_equivalent").notNull(),
  breakdown: jsonb("breakdown").notNull().$type<{ hvac: number; lighting: number; other: number }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({ id: true, createdAt: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
