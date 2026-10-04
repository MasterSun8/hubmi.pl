import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { conversations } from "@/server/db/schema";
import { CANVAS_FIELDS, emptyCanvas, type Canvas } from "@/types/canvas";

// Stored canvases may lack fields added later; fill the gaps so clients always get every key.
function normalize(stored: Record<string, string>): Canvas {
  const canvas = emptyCanvas();
  for (const field of CANVAS_FIELDS) canvas[field.key] = stored[field.key] ?? "";
  return canvas;
}

export async function getCanvas(conversationId: string): Promise<Canvas | null> {
  const [row] = await getDb()
    .select({ canvas: conversations.canvas })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);
  return row?.canvas ? normalize(row.canvas) : null;
}

export async function saveCanvas(conversationId: string, canvas: Canvas): Promise<void> {
  await getDb().update(conversations).set({ canvas }).where(eq(conversations.id, conversationId));
}
