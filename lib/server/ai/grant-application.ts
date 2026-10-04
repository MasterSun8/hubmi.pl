import "server-only";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getCanvas } from "@/lib/server/canvas";
import { loadHistory } from "@/lib/server/chat/history";
import { CANVAS_FIELDS } from "@/types/canvas";
import type { GrantCall } from "@/types/grants";
import { getOpenAI } from "./client";
import { getAiConfig } from "./config";
import { GRANT_APPLICATION_PROMPT } from "./prompts/grant-application";

const MAX_TRANSCRIPT_MESSAGES = 50;

// Every section of the call, written by AI from the idea's canvas and conversation.
export async function draftGrantApplication(call: GrantCall, conversationId: string): Promise<Record<string, string>> {
  const [canvas, history] = await Promise.all([
    getCanvas(conversationId),
    loadHistory(conversationId, MAX_TRANSCRIPT_MESSAGES),
  ]);

  const callText = [
    `Nabór: ${call.title}`,
    call.description && `Opis: ${call.description}`,
    `Termin: ${call.startsOn} – ${call.endsOn}`,
    call.maxAmount ? `Maksymalna kwota: ${call.maxAmount} zł` : "Maksymalna kwota: nie określono",
    call.criteria && `Kryteria oceny:\n${call.criteria}`,
    `Sekcje wniosku:\n${call.sections.map((s) => `- ${s.key} (${s.label}): ${s.question}`).join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n");

  const canvasText = canvas
    ? CANVAS_FIELDS.map((field) => `- ${field.label}: ${canvas[field.key].trim() || "(puste)"}`).join("\n")
    : "(autor nie wypełnił kanwy)";

  const transcript = history
    .map((m) => `${m.role === "user" ? "Autor" : "Asystent"}: ${m.content}`)
    .join("\n\n");

  const Draft = z.object(Object.fromEntries(call.sections.map((section) => [section.key, z.string()])));

  const response = await getOpenAI().responses.parse({
    model: getAiConfig().model,
    instructions: GRANT_APPLICATION_PROMPT,
    input: `${callText}\n\nKanwa innowacji:\n${canvasText}\n\nRozmowa:\n${transcript}`,
    text: { format: zodTextFormat(Draft, "grant_application") },
    store: false,
  });

  if (!response.output_parsed) throw new Error(`No parsed output (status: ${response.status})`);
  return response.output_parsed as Record<string, string>;
}
