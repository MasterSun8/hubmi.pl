import "server-only";
import { createHash } from "node:crypto";
import { getEnv } from "@/server/env";
import { getOpenAI } from "./client";

const BATCH_SIZE = 50;
const MAX_INPUT_CHARS = 12_000;
const UI_NOISE = /dowiedz się więcej zobacz film pobierz materiały sprawdź zasady wykorzystania otwórz w telefonie/gi;

type SolutionText = { title: string; description: string };

export function solutionEmbeddingInput(row: SolutionText) {
  const { OPENAI_EMBEDDING_MODEL: model, OPENAI_EMBEDDING_DIMENSIONS: dimensions } = getEnv();
  if (!model) throw new Error("Missing OPENAI_EMBEDDING_MODEL (see .env.example)");
  const description = row.description.replace(UI_NOISE, " ").replace(/\s+/g, " ").trim();
  const text = `${row.title}\n\n${description}`.slice(0, MAX_INPUT_CHARS);
  const contentHash = createHash("sha256").update(`${model}\n${dimensions}\n${text}`).digest("hex");
  return { text, contentHash, model, dimensions };
}

// Generate all vectors before insertion so a failed request leaves existing data intact.
export async function withSolutionEmbeddings<T extends SolutionText>(rows: T[]) {
  const result = [];
  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    const batch = rows.slice(start, start + BATCH_SIZE);
    const inputs = batch.map(solutionEmbeddingInput);
    const { model, dimensions } = inputs[0];
    const { data } = await getOpenAI().embeddings.create({
      model, dimensions, input: inputs.map((input) => input.text),
    });
    const vectors = new Map(data.map((item) => [item.index, item.embedding]));
    if (data.length !== batch.length || vectors.size !== batch.length) {
      throw new Error("Incomplete solution embedding response");
    }
    for (let index = 0; index < batch.length; index++) {
      const embedding = vectors.get(index);
      if (!embedding || embedding.length !== dimensions || !embedding.every(Number.isFinite)) {
        throw new Error("Invalid solution embedding response");
      }
      result.push({
        ...batch[index], embedding, embeddingModel: model,
        embeddingUpdatedAt: new Date(), contentHash: inputs[index].contentHash,
      });
    }
  }
  return result;
}
