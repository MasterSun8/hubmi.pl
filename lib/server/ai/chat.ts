import "server-only";
import type {
  FunctionTool,
  ResponseFunctionToolCall,
  ResponseInputItem,
} from "openai/resources/responses/responses";
import type { ChatEvent, ChatMessage, SolutionRef } from "@/types/chat";
import { getOpenAI } from "./client";
import { getAiConfig } from "./config";
import { SYSTEM_PROMPT } from "./prompts/system";
import { searchSolutions } from "./rag/search";

// Upper bound on model -> tool -> model rounds in one turn. The last round
// runs with tool_choice "none", so the user always gets a text answer.
const MAX_TOOL_ROUNDS = 3;
const MAX_DESCRIPTION_CHARS = 1_500;

const SEARCH_SOLUTIONS_TOOL: FunctionTool = {
  type: "function",
  name: "search_solutions",
  description:
    "Wyszukuje w bazie sprawdzonych innowacji społecznych (ROPS) rozwiązania pasujące do problemu " +
    "lub pomysłu użytkownika. Użyj, gdy wiesz już, czego dotyczy problem i kogo. " +
    "Proponuj użytkownikowi wyłącznie rozwiązania zwrócone przez to narzędzie; " +
    "jeśli żadne nie pasuje, powiedz to wprost.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "Opis potrzeby po polsku, 1–3 zdania: czego brakuje, kogo dotyczy (grupa docelowa) i w jakiej sytuacji.",
      },
    },
    required: ["query"],
    additionalProperties: false,
  },
  strict: true,
};

// Runs one assistant turn via the Responses API and translates the OpenAI
// stream into our ChatEvent protocol. When the model calls a tool we execute
// it, append the result to the input and start another round.
export async function* streamChat(
  messages: ChatMessage[],
  signal: AbortSignal,
): AsyncGenerator<ChatEvent> {
  const { model } = getAiConfig();
  const input: ResponseInputItem[] = messages.map((m) => ({ role: m.role, content: m.content }));

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const stream = await getOpenAI().responses.create(
      {
        model,
        instructions: SYSTEM_PROMPT,
        input,
        tools: [SEARCH_SOLUTIONS_TOOL],
        tool_choice: round < MAX_TOOL_ROUNDS ? "auto" : "none",
        stream: true,
        store: false,
      },
      { signal },
    );

    let text = "";
    const calls: ResponseFunctionToolCall[] = [];
    let completed = false;

    for await (const event of stream) {
      switch (event.type) {
        case "response.output_text.delta":
          text += event.delta;
          yield { type: "delta", text: event.delta };
          break;
        case "response.output_item.done":
          if (event.item.type === "function_call") calls.push(event.item);
          break;
        case "response.completed":
          completed = true;
          break;
        case "response.incomplete":
        case "response.failed":
        case "error":
          console.error("[chat] OpenAI stream ended abnormally", event);
          yield { type: "error", message: "Asystent nie dokończył odpowiedzi." };
          return;
      }
    }

    if (!completed) {
      yield { type: "error", message: "Połączenie z asystentem zostało przerwane." };
      return;
    }
    if (calls.length === 0) {
      yield { type: "done" };
      return;
    }

    // Text streamed before the call ("Sprawdzę w bazie...") must stay in
    // context, or the next round may repeat it.
    if (text) input.push({ role: "assistant", content: text });

    for (const call of calls) {
      // Sent back without `id`: with store:false the API would otherwise
      // require the reasoning item that preceded the call.
      input.push({
        type: "function_call",
        call_id: call.call_id,
        name: call.name,
        arguments: call.arguments,
      });
      const { output, sources } = await runTool(call);
      if (sources.length > 0) yield { type: "sources", items: sources };
      input.push({ type: "function_call_output", call_id: call.call_id, output });
    }
  }
}

type ToolResult = { output: string; sources: SolutionRef[] };

// Tool failures go back to the model as text instead of throwing, so the
// user still gets an answer ("nie udało się przeszukać bazy") rather than
// a broken stream.
async function runTool(call: ResponseFunctionToolCall): Promise<ToolResult> {
  if (call.name !== SEARCH_SOLUTIONS_TOOL.name) {
    return { output: `Nieznane narzędzie: ${call.name}`, sources: [] };
  }

  try {
    const { query } = JSON.parse(call.arguments) as { query: string };
    const hits = await searchSolutions(query);

    if (hits.length === 0) {
      return { output: JSON.stringify({ results: [], note: "Brak rozwiązań w bazie." }), sources: [] };
    }

    const results = hits.map((h) => ({
      id: h.id,
      title: h.title,
      description: h.description.slice(0, MAX_DESCRIPTION_CHARS),
      problem: h.problem,
      targetGroups: h.targetGroups,
      implementers: h.implementers,
      effectiveness: h.effectiveness,
      url: h.sourceUrl,
      similarity: Number((1 - h.distance).toFixed(3)),
    }));
    const sources = hits.map((h) => ({ id: h.id, title: h.title, url: h.sourceUrl ?? undefined }));

    return { output: JSON.stringify({ results }), sources };
  } catch (err) {
    console.error("[chat] search_solutions failed", err);
    return { output: "Wyszukiwarka rozwiązań jest chwilowo niedostępna.", sources: [] };
  }
}
