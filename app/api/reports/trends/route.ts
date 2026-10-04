import { NextResponse } from "next/server";
import { getTrendsData } from "@/lib/server/reports";

export async function GET() {
  try {
    const data = await getTrendsData();

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error("[API] Error fetching reports trends:", error);
    return NextResponse.json(
      { success: false, error: "Błąd podczas generowania raportu trendów" },
      { status: 500 }
    );
  }
}
