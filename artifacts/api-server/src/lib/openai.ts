import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AssessmentData {
  buildingType: string;
  areaM2: number;
  monthlyBillSar: number;
  acUnits: number;
  lightingType: string;
  workingHours?: number | null;
  buildingAge: number;
  hasSolar: boolean;
  hasSmartThermostat: boolean;
}

export interface EnergyReport {
  energy_score: number;
  estimated_waste_pct: number;
  annual_waste_sar: number;
  potential_savings_sar: number;
  executive_summary: string;
  carbon_reduction_tons: number;
  trees_equivalent: number;
  recommendations: Array<{
    title: string;
    savings_sar: number;
    roi_years: number;
    priority_stars: number;
    rationale: string;
  }>;
  breakdown: {
    hvac: number;
    lighting: number;
    other: number;
  };
}

export async function analyzeEnergyAssessment(data: AssessmentData): Promise<EnergyReport> {
  const annualBill = data.monthlyBillSar * 12;

  const systemPrompt = `You are a Certified Energy Consultant with expertise in Saudi Arabian buildings and the Gulf climate. 
You specialize in energy efficiency analysis, HVAC optimization, and reducing electricity costs in hot climates.
You MUST respond with ONLY valid JSON matching the exact schema provided — no markdown, no explanation, just the JSON object.`;

  const userPrompt = `Analyze this building's energy profile and provide a detailed assessment. 
The Saudi Arabian context is critical: HVAC/cooling is typically 60-70% of energy consumption in the Gulf region.

Building Data:
- Type: ${data.buildingType}
- Area: ${data.areaM2} m²
- Monthly Electricity Bill: ${data.monthlyBillSar} SAR (Annual: ${annualBill} SAR)
- AC Units: ${data.acUnits}
- Lighting Type: ${data.lightingType}
- ${data.buildingType === "commercial" ? `Working Hours: ${data.workingHours || 8} hours/day` : `Occupancy hours per day`}
- Building Age: ${data.buildingAge} years
- Solar Panels: ${data.hasSolar ? "Yes" : "No"}
- Smart Thermostat: ${data.hasSmartThermostat ? "Yes" : "No"}

Respond with ONLY this JSON structure (no markdown, no extra text):
{
  "energy_score": <integer 0-100, where 100 is perfectly efficient>,
  "estimated_waste_pct": <percentage of energy being wasted, 0-100>,
  "annual_waste_sar": <SAR wasted annually due to inefficiency>,
  "potential_savings_sar": <total realistic annual savings achievable>,
  "executive_summary": <3-4 sentence professional summary in English focusing on key findings and biggest opportunities, mentioning Saudi context>,
  "carbon_reduction_tons": <tons of CO2 reducible annually>,
  "trees_equivalent": <number of trees equivalent to the CO2 reduction>,
  "recommendations": [
    {
      "title": <specific actionable recommendation>,
      "savings_sar": <annual SAR savings from this action>,
      "roi_years": <payback period in years, use 0.5 for 6 months>,
      "priority_stars": <1-5 priority rating where 5 is highest priority>,
      "rationale": <1-2 sentence explanation of why this is recommended>
    }
  ],
  "breakdown": {
    "hvac": <percentage of total bill from HVAC/cooling>,
    "lighting": <percentage from lighting>,
    "other": <percentage from other appliances/equipment>
  }
}

Provide 4-6 specific, actionable recommendations ranked by impact. Ensure all numbers are realistic for Saudi Arabia (SAR currency, Gulf climate context).`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  const parsed = JSON.parse(content) as EnergyReport;
  return parsed;
}

export async function chatWithContext(
  assessmentData: AssessmentData,
  report: EnergyReport,
  chatHistory: Array<{ role: "user" | "assistant"; content: string }>,
  userMessage: string
): Promise<string> {
  const systemPrompt = `You are a Certified Energy Consultant specializing in Saudi Arabian buildings and Gulf climate conditions. 
You have already analyzed this building and generated a detailed energy report. Answer the user's questions using the report data as context.
Be specific, professional, and helpful. Reference actual numbers from the report when relevant. Keep responses concise (2-4 sentences typically).

Building context:
- Type: ${assessmentData.buildingType}, ${assessmentData.areaM2}m²
- Monthly bill: ${assessmentData.monthlyBillSar} SAR
- AC units: ${assessmentData.acUnits}, Lighting: ${assessmentData.lightingType}
- Solar: ${assessmentData.hasSolar ? "Yes" : "No"}, Smart thermostat: ${assessmentData.hasSmartThermostat ? "Yes" : "No"}
- Building age: ${assessmentData.buildingAge} years

Report summary:
- Energy Score: ${report.energy_score}/100
- Estimated waste: ${report.estimated_waste_pct}% (${report.annual_waste_sar} SAR/year)
- Potential savings: ${report.potential_savings_sar} SAR/year
- HVAC share: ${report.breakdown.hvac}%`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content ?? "I'm sorry, I couldn't generate a response. Please try again.";
}
