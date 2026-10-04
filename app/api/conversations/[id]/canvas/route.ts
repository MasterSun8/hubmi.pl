import { z } from "zod";
import { draftCanvas } from "@/lib/server/ai/canvas";
import { getCanvas, saveCanvas } from "@/lib/server/canvas";
import { getConversation, isConversationId } from "@/lib/server/chat/history";
import { CANVAS_FIELD_MAX, CANVAS_FIELDS, type Canvas } from "@/types/canvas";

// The innovation canvas of a "Zaoferuj pomoc" conversation. Like the conversation
// itself, the id works as the access key.
//   GET  → the saved canvas, or null when nobody has filled it in yet
//   PUT  → saves the canvas the user edited
//   POST → drafts the canvas with AI from the conversation (not saved)

type Ctx = { params: Promise<{ id: string }> };

const notFound = () => Response.json({ error: "Conversation not found" }, { status: 404 });

const CanvasBody = z.object(
  Object.fromEntries(CANVAS_FIELDS.map((field) => [field.key, z.string().max(CANVAS_FIELD_MAX)])),
);

async function ideaConversation(ctx: Ctx) {
  const { id } = await ctx.params;
  if (!isConversationId(id)) return null;
  const conversation = await getConversation(id);
  return conversation?.flow === "idea" ? conversation : null;
}

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const conversation = await ideaConversation(ctx);
    if (!conversation) return notFound();
    return Response.json({ data: await getCanvas(conversation.id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[canvas] read failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}

export async function PUT(request: Request, ctx: Ctx) {
  const parsed = CanvasBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid canvas" }, { status: 400 });

  try {
    const conversation = await ideaConversation(ctx);
    if (!conversation) return notFound();
    await saveCanvas(conversation.id, parsed.data as Canvas);
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("[canvas] save failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}

export async function POST(_request: Request, ctx: Ctx) {
  try {
    const conversation = await ideaConversation(ctx);
    if (!conversation) return notFound();
    return Response.json({ data: await draftCanvas(conversation.id) });
  } catch (err) {
    console.error("[canvas] draft failed", err);
    return Response.json({ error: "Canvas draft unavailable" }, { status: 503 });
  }
}
