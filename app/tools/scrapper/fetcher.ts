import fetch from 'node-fetch';

/**
 * Funkcja wstrzymująca wykonanie (sleep) na x milisekund,
 * aby nie obciążać serwera zbyt wieloma zapytaniami na raz.
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Zwykłe pobieranie HTML przez fetch.
 * Używamy node-fetch, aby wspierać starsze wersje Node, lub wbudowanego fetch w Node 18+.
 */
export async function fetchHtml(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`NOT_FOUND: ${url}`);
      }
      throw new Error(`HTTP error! status: ${response.status} na URL: ${url}`);
    }

    return await response.text();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('NOT_FOUND')) {
      throw error;
    }
    console.error(`Błąd podczas pobierania URL ${url}:`, error);
    throw error;
  }
}
