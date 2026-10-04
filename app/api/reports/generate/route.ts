import { NextResponse } from "next/server";
import { generateTrendReport } from "@/lib/server/ai/reports";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { region } = body;
    
    // Generowanie raportu AI na podstawie z agregowanych danych
    const reportMarkdown = await generateTrendReport(region);

    return NextResponse.json({
      success: true,
      report: reportMarkdown,
    });
  } catch (error) {
    console.error("[API] Error generating AI report:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Dodano GET, abyś mógł łatwo testować z poziomu przeglądarki! (np. /api/reports/generate?region=Kraków)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const region = url.searchParams.get("region") || undefined;
    
    const reportMarkdown = await generateTrendReport(region);

    return NextResponse.json({
      success: true,
      report: reportMarkdown,
    });
  } catch (error) {
    console.error("[API] Error generating AI report via GET:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
