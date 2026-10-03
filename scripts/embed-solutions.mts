// Liczy embeddingi dla tabeli solutions. Przelicza tylko wiersze bez wektora
// albo takie, w których zmieniła się treść lub model (porównanie content_hash),
// więc można go puszczać wielokrotnie.
//
// Uruchomienie: node --env-file=.env scripts/embed-solutions.mts
import { createHash } from "node:crypto";
import OpenAI from "openai";
import postgres from "postgres";

const BATCH_SIZE = 50;
// ~3k tokenów; najdłuższy opis w bazie ma ~4k znaków, limit modelu to 8192 tokeny.
const MAX_INPUT_CHARS = 12_000;
// Pozostałość po scrapowaniu przycisków ze strony ROPS – szum dla embeddingu.
const UI_NOISE = /dowiedz się więcej zobacz film pobierz materiały sprawdź zasady wykorzystania otwórz w telefonie/gi;

const { DATABASE_URL, OPENAI_EMBEDDING_MODEL: model } = process.env;
const dimensions = Number(process.env.OPENAI_EMBEDDING_DIMENSIONS) || 1536;
if (!DATABASE_URL || !model) throw new Error("Missing DATABASE_URL or OPENAI_EMBEDDING_MODEL in .env");

const sql = postgres(DATABASE_URL, { max: 1 });
const openai = new OpenAI();

type Row = { id: string; title: string; description: string; content_hash: string | null };

function embeddingText(row: Row): string {
  const description = row.description.replace(UI_NOISE, " ").replace(/\s+/g, " ").trim();
  return `${row.title}\n\n${description}`.slice(0, MAX_INPUT_CHARS);
}

// Model w hashu: zmiana OPENAI_EMBEDDING_MODEL wymusza przeliczenie wszystkiego.
function contentHash(text: string): string {
  return createHash("sha256").update(`${model}\n${dimensions}\n${text}`).digest("hex");
}

try {
  const rows = await sql<Row[]>`select id, title, description, content_hash from solutions`;
  const todo = rows
    .map((row) => {
      const text = embeddingText(row);
      return { id: row.id, text, hash: contentHash(text), current: row.content_hash };
    })
    .filter((r) => r.hash !== r.current);

  console.log(`solutions: ${rows.length}, do przeliczenia: ${todo.length} (model ${model})`);

  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE);
    const { data } = await openai.embeddings.create({
      model,
      input: batch.map((r) => r.text),
      dimensions,
    });

    await sql.begin(async (tx) => {
      for (const { index, embedding } of data) {
        const r = batch[index];
        await tx`
          update solutions set
            embedding = ${JSON.stringify(embedding)}::vector,
            embedding_model = ${model},
            embedding_updated_at = now(),
            content_hash = ${r.hash}
          where id = ${r.id}`;
      }
    });
    console.log(`  ${Math.min(i + BATCH_SIZE, todo.length)}/${todo.length}`);
  }
} finally {
  await sql.end();
}
