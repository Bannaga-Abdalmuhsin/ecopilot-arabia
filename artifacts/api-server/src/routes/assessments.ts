import { Router } from "express";
import { db } from "@workspace/db";
import { assessmentsTable, reportsTable, chatMessagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { analyzeEnergyAssessment, chatWithContext, type AssessmentData, type EnergyReport } from "../lib/openai";
import { CreateAssessmentBody, SendChatMessageBody, GetAssessmentParams, GetChatHistoryParams, SendChatMessageParams } from "@workspace/api-zod";

const router = Router();

// GET /assessments
router.get("/assessments", async (req, res) => {
  try {
    const assessments = await db
      .select()
      .from(assessmentsTable)
      .orderBy(assessmentsTable.createdAt);
    res.json(assessments.reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to list assessments");
    res.status(500).json({ error: "Failed to retrieve assessments" });
  }
});

// POST /assessments — atomic: inserts assessment, calls AI, inserts report; rolls back assessment on any failure
router.post("/assessments", async (req, res) => {
  const parsed = CreateAssessmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const input = parsed.data;

  let assessmentId: number | null = null;

  try {
    // Insert assessment
    const [assessment] = await db
      .insert(assessmentsTable)
      .values({
        buildingType: input.buildingType,
        areaM2: input.areaM2,
        monthlyBillSar: input.monthlyBillSar,
        acUnits: input.acUnits,
        lightingType: input.lightingType,
        workingHours: input.workingHours ?? null,
        buildingAge: input.buildingAge,
        hasSolar: input.hasSolar,
        hasSmartThermostat: input.hasSmartThermostat,
      })
      .returning();

    assessmentId = assessment.id;

    const assessmentData: AssessmentData = {
      buildingType: assessment.buildingType,
      areaM2: assessment.areaM2,
      monthlyBillSar: assessment.monthlyBillSar,
      acUnits: assessment.acUnits,
      lightingType: assessment.lightingType,
      workingHours: assessment.workingHours,
      buildingAge: assessment.buildingAge,
      hasSolar: assessment.hasSolar,
      hasSmartThermostat: assessment.hasSmartThermostat,
    };

    // Call AI — if this throws, we clean up the assessment below
    const aiReport = await analyzeEnergyAssessment(assessmentData);

    // Validate critical AI fields before persisting
    if (
      typeof aiReport.energy_score !== "number" ||
      typeof aiReport.estimated_waste_pct !== "number" ||
      typeof aiReport.annual_waste_sar !== "number" ||
      !Array.isArray(aiReport.recommendations)
    ) {
      throw new Error("AI returned malformed report structure");
    }

    // Insert report
    const [report] = await db
      .insert(reportsTable)
      .values({
        assessmentId: assessment.id,
        energyScore: aiReport.energy_score,
        estimatedWastePct: aiReport.estimated_waste_pct,
        annualWasteSar: aiReport.annual_waste_sar,
        potentialSavingsSar: aiReport.potential_savings_sar ?? 0,
        executiveSummary: aiReport.executive_summary,
        recommendations: aiReport.recommendations.map((r) => ({
          title: r.title,
          savingsSar: r.savings_sar,
          roiYears: r.roi_years,
          priorityStars: r.priority_stars,
          rationale: r.rationale,
        })),
        carbonReductionTons: aiReport.carbon_reduction_tons,
        treesEquivalent: aiReport.trees_equivalent,
        breakdown: {
          hvac: aiReport.breakdown.hvac,
          lighting: aiReport.breakdown.lighting,
          other: aiReport.breakdown.other,
        },
      })
      .returning();

    res.status(201).json({ assessment, report });
  } catch (err) {
    req.log.error({ err }, "Assessment creation failed");

    // Roll back: delete orphan assessment if it was inserted
    if (assessmentId !== null) {
      try {
        await db.delete(assessmentsTable).where(eq(assessmentsTable.id, assessmentId));
      } catch (cleanupErr) {
        req.log.error({ cleanupErr }, "Failed to clean up orphan assessment");
      }
    }

    const message = err instanceof Error && err.message.includes("AI")
      ? "AI analysis failed. Please try again."
      : "Failed to create assessment. Please try again.";
    res.status(500).json({ error: message });
  }
});

// GET /assessments/:id
router.get("/assessments/:id", async (req, res) => {
  const parsed = GetAssessmentParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const { id } = parsed.data;

    const [assessment] = await db
      .select()
      .from(assessmentsTable)
      .where(eq(assessmentsTable.id, id));

    if (!assessment) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }

    const [report] = await db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.assessmentId, id));

    if (!report) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    res.json({ assessment, report });
  } catch (err) {
    req.log.error({ err }, "Failed to get assessment");
    res.status(500).json({ error: "Failed to retrieve assessment" });
  }
});

// GET /assessments/:id/chat
router.get("/assessments/:id/chat", async (req, res) => {
  const parsed = GetChatHistoryParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const { id } = parsed.data;

    const [assessment] = await db
      .select()
      .from(assessmentsTable)
      .where(eq(assessmentsTable.id, id));

    if (!assessment) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }

    const messages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.assessmentId, id))
      .orderBy(chatMessagesTable.createdAt);

    res.json(messages);
  } catch (err) {
    req.log.error({ err }, "Failed to get chat history");
    res.status(500).json({ error: "Failed to retrieve chat history" });
  }
});

// POST /assessments/:id/chat
router.post("/assessments/:id/chat", async (req, res) => {
  const paramsParsed = SendChatMessageParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = SendChatMessageBody.safeParse(req.body);

  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { id } = paramsParsed.data;
  const { content } = bodyParsed.data;

  let userMsgId: number | null = null;

  try {
    const [assessment] = await db
      .select()
      .from(assessmentsTable)
      .where(eq(assessmentsTable.id, id));

    if (!assessment) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }

    const [report] = await db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.assessmentId, id));

    if (!report) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    // Save user message
    const [userMsg] = await db
      .insert(chatMessagesTable)
      .values({ assessmentId: id, role: "user", content })
      .returning();
    userMsgId = userMsg.id;

    // Get chat history for context (exclude the message we just inserted)
    const history = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.assessmentId, id))
      .orderBy(chatMessagesTable.createdAt);

    const chatHistory = history
      .filter((m) => m.id !== userMsg.id)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const assessmentData: AssessmentData = {
      buildingType: assessment.buildingType,
      areaM2: assessment.areaM2,
      monthlyBillSar: assessment.monthlyBillSar,
      acUnits: assessment.acUnits,
      lightingType: assessment.lightingType,
      workingHours: assessment.workingHours,
      buildingAge: assessment.buildingAge,
      hasSolar: assessment.hasSolar,
      hasSmartThermostat: assessment.hasSmartThermostat,
    };

    const aiReportContext: EnergyReport = {
      energy_score: report.energyScore,
      estimated_waste_pct: report.estimatedWastePct,
      annual_waste_sar: report.annualWasteSar,
      potential_savings_sar: report.potentialSavingsSar,
      executive_summary: report.executiveSummary,
      carbon_reduction_tons: report.carbonReductionTons,
      trees_equivalent: report.treesEquivalent,
      recommendations: (report.recommendations as Array<{
        title: string; savingsSar: number; roiYears: number; priorityStars: number; rationale: string;
      }>).map((r) => ({
        title: r.title,
        savings_sar: r.savingsSar,
        roi_years: r.roiYears,
        priority_stars: r.priorityStars,
        rationale: r.rationale,
      })),
      breakdown: report.breakdown as { hvac: number; lighting: number; other: number },
    };

    const aiResponse = await chatWithContext(assessmentData, aiReportContext, chatHistory, content);

    // Save assistant message
    const [assistantMessage] = await db
      .insert(chatMessagesTable)
      .values({ assessmentId: id, role: "assistant", content: aiResponse })
      .returning();

    res.json(assistantMessage);
  } catch (err) {
    req.log.error({ err }, "Chat failed");

    // Roll back user message on AI failure so conversation stays consistent
    if (userMsgId !== null) {
      try {
        await db.delete(chatMessagesTable).where(eq(chatMessagesTable.id, userMsgId));
      } catch (cleanupErr) {
        req.log.error({ cleanupErr }, "Failed to clean up orphan user message");
      }
    }

    res.status(500).json({ error: "AI response failed. Please try again." });
  }
});

export default router;
