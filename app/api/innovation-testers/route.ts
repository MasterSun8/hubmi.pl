import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { innovationTesters } from "@/server/db/schema";
import { z } from "zod";

const schema = z.object({
  solutionId: z.string().uuid(),
  fullName: z.string().min(2, "Podaj imię i nazwisko"),
  email: z.string().email("Podaj poprawny adres e-mail"),
  organization: z.string().optional(),
  motivation: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json().catch(() => ({}));

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues?.[0]?.message || "Wypełnij poprawnie wszystkie pola." },
        { status: 400 }
      );
    }

    await db.insert(innovationTesters).values(parsed.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error creating innovation tester:", error);
    return NextResponse.json(
      { success: false, error: "Wystąpił wewnętrzny błąd serwera." },
      { status: 500 }
    );
  }
}
