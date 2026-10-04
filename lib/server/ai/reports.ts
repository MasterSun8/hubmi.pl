import "server-only";
import { getOpenAI } from "./client";
import { getAiConfig } from "./config";
import { getTrendsData } from "@/app/api/reports/trends/route";

export async function generateTrendReport(regionQuery?: string) {
  const { model } = getAiConfig();
  
  if (!model) {
    throw new Error("Missing OPENAI_MODEL (see .env.example)");
  }

  // Pobieramy złączone dane (Zgłoszenia + GUS)
  const data = await getTrendsData();
  
  // Jeśli podano konkretny region, filtrujemy dane, aby nie obciążać kontekstu LLMa
  let filteredData = data;
  if (regionQuery) {
    const normalizedRegion = regionQuery.toLowerCase();
    filteredData = {
      trends: data.trends[normalizedRegion] ? { [normalizedRegion]: data.trends[normalizedRegion] } : {},
      contextStats: data.contextStats[normalizedRegion] ? { [normalizedRegion]: data.contextStats[normalizedRegion] } : {},
    };
  }

  const systemPrompt = `Jesteś ekspertem ds. polityki społecznej i analitykiem Małopolskiego Hubu Innowacji Społecznych (ROPS Kraków).
Twoim zadaniem jest wygenerowanie syntetycznego, czytelnego raportu diagnozującego wyzwania społeczne na podstawie dostarczonych danych.

Dane otrzymasz w formacie JSON i składają się z:
1. trends - Zgłoszenia od mieszkańców (oddolne potrzeby) zebrane przez chat bota, podzielone na lokalizacje i kategorie.
2. contextStats - Twarde dane statystyczne (GUS / Obserwator) dla danych powiatów (np. wskaźnik starzenia, bezrobocie).

Instrukcje:
- Zwróć szczególną uwagę na korelacje. Np. jeśli mieszkańcy zgłaszają problemy z "opieką", a twarde dane pokazują wysoki "wskaźnik starzenia się", powiąż to.
- Wypunktuj 3 główne wnioski analityczne.
- Zarekomenduj obszary, w których ROPS powinien poszukać lub wdrożyć innowacje społeczne.
- Twój ton powinien być profesjonalny, raportowy, używaj pogrubień dla kluczowych wskaźników.
- Format wyjściowy to czysty Markdown.`;

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: `Wygeneruj raport na podstawie poniższych danych. Region docelowy: ${regionQuery || 'Cała Małopolska'}.\n\nDane w JSON:\n${JSON.stringify(filteredData)}` 
      }
    ],
  });

  return completion.choices[0].message.content;
}
