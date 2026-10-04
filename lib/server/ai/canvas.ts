import "server-only";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { loadHistory } from "@/lib/server/chat/history";
import { CANVAS_FIELDS, type Canvas } from "@/types/canvas";
import { getOpenAI } from "./client";
import { getAiConfig } from "./config";
import { CANVAS_PROMPT } from "./prompts/canvas";

const MAX_TRANSCRIPT_MESSAGES = 50;

const CanvasDraft = z.object(Object.fromEntries(CANVAS_FIELDS.map((field) => [field.key, z.string()])));

// The canvas drafted by AI from the conversation; null while the user has not written anything.
export async function draftCanvas(conversationId: string): Promise<Canvas | null> {
  const history = await loadHistory(conversationId, MAX_TRANSCRIPT_MESSAGES);
  if (!history.some((m) => m.role === "user")) return null;

  const transcript = history
    .map((m) => `${m.role === "user" ? "Użytkownik" : "Asystent"}: ${m.content}`)
    .join("\n\n");

  const response = await getOpenAI().responses.parse({
    model: getAiConfig().model,
    instructions: CANVAS_PROMPT,
    input: `Rozmowa:\n${transcript}`,
    text: { format: zodTextFormat(CanvasDraft, "innovation_canvas") },
    store: false,
  });

  if (!response.output_parsed) throw new Error(`No parsed output (status: ${response.status})`);
  return response.output_parsed as Canvas;
}
