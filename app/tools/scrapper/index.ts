import { fetchHtml, sleep } from './fetcher';
import {
  extractCategoryLinks,
  extractInnovationsFromCategory,
  parseInnovationDetails
} from './parser';
import { saveToDatabase, saveToJson, InnovationRecord } from './types';

const START_URL = 'https://rops.krakow.pl/innowacje-spoleczne/biblioteka-innowacji-spolecznych/kategorie';
const SLEEP_BETWEEN_REQUESTS_MS = 1000;

async function scrapeInnovation(url: string): Promise<InnovationRecord | null> {
  try {
    console.log(`[Scraper] Pobieranie szczegółów innowacji: ${url}`);
    const html = await fetchHtml(url);
    const innovation = parseInnovationDetails(html, url);
    await sleep(SLEEP_BETWEEN_REQUESTS_MS);
    return innovation;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('NOT_FOUND')) {
      console.warn(`[Scraper] Ominięto błąd 404 dla innowacji: ${url}`);
      return null;
    }
    console.error(`[Scraper] Błąd podczas pobierania innowacji ${url}:`, err);
    return null; // Zwracamy null zamiast rzucać, by nie przerywać całej pętli
  }
}

async function scrapeCategory(categoryUrl: string): Promise<InnovationRecord[]> {
  console.log(`\n[Scraper] Rozpoczęto analizę kategorii: ${categoryUrl}`);
  const records: InnovationRecord[] = [];
  let currentUrl: string | null = categoryUrl;

  while (currentUrl) {
    console.log(`[Scraper] Pobieranie strony listy kategorii: ${currentUrl}`);
    try {
      const html = await fetchHtml(currentUrl);
      const { innovationLinks, nextPageUrl } = extractInnovationsFromCategory(html, currentUrl);

      console.log(`[Scraper] Znaleziono ${innovationLinks.length} innowacji na stronie.`);

      for (const link of innovationLinks) {
        const record = await scrapeInnovation(link);
        if (record) {
          records.push(record);
        }
      }

      currentUrl = nextPageUrl; // Kontynuuj jeśli istnieje kolejna strona
      if (currentUrl) {
        await sleep(SLEEP_BETWEEN_REQUESTS_MS);
      }
    } catch (err) {
      console.error(`[Scraper] Błąd podczas analizy kategorii ${currentUrl}:`, err);
      break; // Przerywamy tę paginację, ale idziemy do następnej kategorii
    }
  }

  return records;
}

async function run() {
  console.log(`[Scraper] Start procesu dla: ${START_URL}`);
  const allRecords: InnovationRecord[] = [];

  try {
    const mainHtml = await fetchHtml(START_URL);
    const categoryLinks = extractCategoryLinks(mainHtml);
    console.log(`[Scraper] Znaleziono ${categoryLinks.length} linków do kategorii.`);

    await sleep(SLEEP_BETWEEN_REQUESTS_MS);

    for (const catLink of categoryLinks) {
      const catRecords = await scrapeCategory(catLink);
      allRecords.push(...catRecords);
    }

    console.log(`\n[Scraper] Ekstrakcja zakończona. Łącznie pobrano ${allRecords.length} rekordów.`);

    // Zapisanie do bazy danych
    await saveToDatabase(allRecords);

    // Zapisanie do pliku JSON w celu weryfikacji i analizy danych
    await saveToJson(allRecords, 'scraped_innovations.json');

  } catch (error) {
    console.error(`[Scraper] Główny błąd podczas działania scrapera:`, error);
  }
}

// Uruchomienie skryptu
run();
