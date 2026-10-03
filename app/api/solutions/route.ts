import { NextResponse } from "next/server";
import { listSolutions } from "@/lib/server/solutions";

// All innovations with the fields the library needs, plus `matchedSubmissions`:
// how many submissions have the innovation among their closest matches.
export async function GET() {
  try {
    const data = await listSolutions();

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("[API] Error fetching solutions:", error);
    return NextResponse.json(
      { success: false, error: "Błąd podczas pobierania danych o rozwiązaniach" },
      { status: 500 }
    );
  }
}
