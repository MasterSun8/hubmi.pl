import "server-only";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getOpenAI } from "./client";
import { getAiConfig } from "./config";
import { RISK_ASSESSMENT_PROMPT } from "./prompts/risk-assessment";

// The reasoning comes first, so the factors follow from it instead of contradicting it.
const RiskFactors = z.object({
  riskReasoning: z.string(),
  genuine: z.enum(["yes", "unclear", "no"]),
  harm: z.enum(["none", "quality_of_life", "basic_needs", "life_or_health"]),
  urgency: z.enum(["not_urgent", "soon", "now"]),
  vulnerable: z.boolean(),
  threatToOthers: z.boolean(),
});

export type RiskFactors = z.infer<typeof RiskFactors>;
export type RiskLevel = 1 | 2 | 3 | 4;

const baseLevel: Record<RiskFactors["harm"], number> = {
  none: 1,
  quality_of_life: 1,
  basic_needs: 2,
  life_or_health: 3,
};

// The level from the factors, by fixed rules instead of the model's gut feeling:
// - a threat to others is critical (high when it looks like a joke, still for staff to check);
// - trolls, tests and off-topic requests are low;
// - otherwise severity sets the base, and it goes up when help is needed now and when
//   it concerns people who cannot ask for help themselves (a quality-of-life hardship
//   stops at medium);
// - an unclear submission is never critical, staff verify it first.
export function riskLevelFrom(factors: Omit<RiskFactors, "riskReasoning">): RiskLevel {
  if (factors.threatToOthers) return factors.genuine === "no" ? 3 : 4;
  if (factors.genuine === "no") return 1;

  let level = baseLevel[factors.harm];
  if (factors.harm === "quality_of_life") {
    // A hardship for someone who cannot fight for help alone is never just "low".
    if (factors.vulnerable || factors.urgency === "now") level = 2;
  } else if (factors.harm !== "none") {
    if (factors.urgency === "now") level += 1;
    if (factors.vulnerable && factors.urgency !== "not_urgent") level += 1;
  }
  if (factors.genuine === "unclear") level = Math.min(level, 3);
  return Math.min(4, Math.max(1, level)) as RiskLevel;
}

export async function assessRisk(input: string): Promise<{ riskLevel: RiskLevel; riskReasoning: string }> {
  const response = await getOpenAI().responses.parse({
    model: getAiConfig().model,
    instructions: RISK_ASSESSMENT_PROMPT,
    input,
    text: { format: zodTextFormat(RiskFactors, "risk_factors") },
    store: false,
  });

  if (!response.output_parsed) throw new Error(`No parsed output (status: ${response.status})`);
  const { riskReasoning, ...factors } = response.output_parsed;
  return { riskLevel: riskLevelFrom(factors), riskReasoning };
}
