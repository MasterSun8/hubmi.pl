import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { regionalStatistics } from "@/server/db/schema";

export async function GET(request: Request) {
  try {
    const db = getDb();
    
    // Wyciągamy wszystko z tabeli regional_statistics (zgodnie z "Select * From regional_statistics")
    const data = await db.select().from(regionalStatistics);

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("[API] Error fetching regional statistics:", error);
    return NextResponse.json(
      { success: false, error: "Błąd podczas pobierania danych" },
      { status: 500 }
    );
  }
}
