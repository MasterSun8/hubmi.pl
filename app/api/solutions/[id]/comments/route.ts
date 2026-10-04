import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { innovationComments } from "@/server/db/schema";
import { z } from "zod";

const schema = z.object({
  authorName: z.string().min(2, "Podaj imię / pseudonim"),
  content: z.string().min(5, "Komentarz jest za krótki"),
});

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id: solutionId } = params;
    const db = getDb();
    
    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues?.[0]?.message || "Błędne dane komentarza" },
        { status: 400 }
      );
    }

    await db.insert(innovationComments).values({
      solutionId,
      authorName: parsed.data.authorName,
      content: parsed.data.content,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error adding comment:", error);
    return NextResponse.json(
      { success: false, error: "Wystąpił błąd podczas zapisywania komentarza" },
      { status: 500 }
    );
  }
}
