import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { submissions, regionalStatistics } from "@/server/db/schema";
import { inArray } from "drizzle-orm";

// Kluczowe wskaźniki, które chcemy zestawiać ze zgłoszeniami na mapie i w raporcie
const KEY_INDICATORS = [
  "Ludność ogółem",
  "Wskaźnik obciążenia demograficznego",
  "Stopa bezrobocia",
  "Odsetek osób niepełnosprawnych prawnie",
  "Wskaźnik/ indeks starości",
];

export async function getTrendsData() {
  const db = getDb();

  // 1. Pobieramy zgłoszenia (problemy mieszkańców)
  const allSubmissions = await db
      .select({
        location: submissions.location,
        category: submissions.category,
        aiScore: submissions.aiScore,
        status: submissions.status,
      })
      .from(submissions);

    // Agregujemy zgłoszenia: po lokalizacji i po kategorii
    const submissionsByLocation: Record<string, { total: number; categories: Record<string, number>; avgScore: number }> = {};
    
    for (const sub of allSubmissions) {
      // Prosta normalizacja nazwy lokalizacji (np. zamiana na małe litery)
      const loc = sub.location ? sub.location.trim().toLowerCase() : "nieznana";
      
      if (!submissionsByLocation[loc]) {
        submissionsByLocation[loc] = { total: 0, categories: {}, avgScore: 0 };
      }
      
      submissionsByLocation[loc].total += 1;
      // Proste uśrednianie aiScore (w MVP wystarczy suma, a potem podzielimy przez total)
      submissionsByLocation[loc].avgScore += sub.aiScore || 0;
      
      const cat = sub.category || "inne";
      submissionsByLocation[loc].categories[cat] = (submissionsByLocation[loc].categories[cat] || 0) + 1;
    }

    // Wyliczamy ostateczną średnią dla aiScore
    for (const loc in submissionsByLocation) {
      if (submissionsByLocation[loc].total > 0) {
        submissionsByLocation[loc].avgScore = Math.round(submissionsByLocation[loc].avgScore / submissionsByLocation[loc].total);
      }
    }

    // 2. Pobieramy statystyki regionalne dla kluczowych wskaźników
    const stats = await db
      .select({
        region: regionalStatistics.region,
        indicator: regionalStatistics.indicator,
        value: regionalStatistics.value,
        valueText: regionalStatistics.valueText,
      })
      .from(regionalStatistics)
      .where(inArray(regionalStatistics.indicator, KEY_INDICATORS));

    // Agregujemy statystyki po regionie (powiecie)
    const statsByRegion: Record<string, any[]> = {};
    for (const stat of stats) {
      const region = stat.region ? stat.region.toLowerCase() : "nieznana";
      if (!statsByRegion[region]) {
        statsByRegion[region] = [];
      }
      statsByRegion[region].push({
        indicator: stat.indicator,
        value: stat.value !== null ? stat.value : stat.valueText,
      });
    }

    // 3. Zwracamy złączone dane
    return {
      trends: submissionsByLocation,
      contextStats: statsByRegion,
    };
}

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
