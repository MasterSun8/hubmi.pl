import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { solutions } from "@/server/db/schema";

export async function GET(request: Request) {
  try {
    const db = getDb();
    
    // Zwracamy tylko określone ("relevant") kolumny
    const data = await db
      .select({
        title: solutions.title,
        description: solutions.description,
        targetGroups: solutions.targetGroups,
        authorName: solutions.authorName,
        organization: solutions.organization,
        sourceName: solutions.sourceName,
        sourceUrl: solutions.sourceUrl,
        externalId: solutions.externalId,
        contactUrl: solutions.contactUrl,
        status: solutions.status,
        searchText: solutions.searchText,
        authors: solutions.authors,
        materialsUrls: solutions.materialsUrls,
        videoUrls: solutions.videoUrls,
        termsOfUseUrl: solutions.termsOfUseUrl,
      })
      .from(solutions);

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
