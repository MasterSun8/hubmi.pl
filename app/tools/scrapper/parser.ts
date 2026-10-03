import * as cheerio from 'cheerio';
import { InnovationRecord } from './types';

const BASE_DOMAIN = 'https://rops.krakow.pl';

/**
 * Normalizuje linki - dodaje domenę do linków względnych
 */
function normalizeUrl(url: string, baseUrl: string = BASE_DOMAIN): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return baseUrl + url;
  return baseUrl + '/' + url;
}

/**
 * Wyciąga listę kategorii innowacji ze strony głównej (Kategorie).
 */
export function extractCategoryLinks(html: string): string[] {
  const $ = cheerio.load(html);
  const categoryLinks = new Set<string>();

  // Szukamy linków na podstronach w div.text-content a także w menu
  // Linki kategorii zwykle wyglądają: /innowacje-spoleczne/biblioteka-innowacji-spolecznych/dla-...
  $('a').each((_, el) => {
    let href = $(el).attr('href');
    if (href && href.includes('biblioteka-innowacji-spolecznych/dla-') && !href.includes(',')) {
      // Ignorujemy linki z przecinkiem, bo przecinek to zwykle konkretna innowacja
      categoryLinks.add(normalizeUrl(href));
    }
  });

  return Array.from(categoryLinks);
}

/**
 * Interfejs zwracany z listy
 */
export interface ListExtractionResult {
  innovationLinks: string[];
  nextPageUrl: string | null;
}

/**
 * Wyciąga listę linków do konkretnych innowacji z danej kategorii
 */
export function extractInnovationsFromCategory(html: string, currentUrl: string): ListExtractionResult {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  // Lista innowacji przeważnie wyświetlana jest w .news-list
  $('.news-list__item a.news-list__title, .news-list__item a.btn-read-more').each((_, el) => {
    let href = $(el).attr('href');
    if (href) {
      links.add(normalizeUrl(href));
    }
  });

  // Dodatkowe zabezpieczenie: jeśli strona używa innej klasy, zbierzmy wszystkie linki do innowacji
  $('a').each((_, el) => {
    let href = $(el).attr('href');
    // Link do innowacji posiada strukturę: .../dla-kategorii,innowacja
    if (href && href.includes('biblioteka-innowacji-spolecznych/') && href.includes(',')) {
      links.add(normalizeUrl(href));
    }
  });

  // Wsparcie ewentualnej paginacji (jeśli istnieje) np. link do "Następna" lub po query ?page=
  let nextPageUrl = null;
  $('.pagination a.next, a.page-link[aria-label="Next"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      nextPageUrl = normalizeUrl(href, currentUrl);
    }
  });

  return {
    innovationLinks: Array.from(links),
    nextPageUrl
  };
}

/**
 * Parsuje stronę konkretnej innowacji i zwraca obiekt rekordu
 */
export function parseInnovationDetails(html: string, sourceUrl: string, titleHint?: string, shortDescHint?: string): InnovationRecord {
  const $ = cheerio.load(html);

  // Tytuł
  let title = $('.page-title').text().trim();
  if (!title) title = $('h1').first().text().trim();
  if (!title && titleHint) title = titleHint;

  const textContent = $('.text-content');
  const fullDescriptionHtml = textContent.html() || '';
  const fullDescriptionText = textContent.text().trim().replace(/\s+/g, ' ');

  // Wyodrębnienie poszczególnych sekcji z użyciem nagłówków h3/h4/strong
  let targetGroup = '';
  let author = '';
  let contactData = '';

  // Szukamy kluczowych fraz w nagłówkach i pobieramy kolejny paragraf
  textContent.find('h3, h4, strong').each((_, el) => {
    const headerText = $(el).text().trim().toLowerCase();

    // Używamy .parent() lub .next() w zależności od struktury DOM
    let nextText = '';
    if (el.tagName.toLowerCase() === 'strong') {
      const parentP = $(el).parent('p');
      nextText = parentP.text().replace($(el).text(), '').trim();
      if (!nextText) {
        nextText = parentP.next('p').text().trim();
      }
    } else {
      nextText = $(el).next('p, div, ul').text().trim();
    }

    if (headerText.includes('grupa docelowa') || headerText.includes('odbiorc')) {
      targetGroup = nextText;
    } else if (headerText.includes('autor') || headerText.includes('twórc')) {
      author = nextText;
    } else if (headerText.includes('kontakt') || headerText.includes('dane kontaktowe')) {
      contactData = nextText;
    }
  });

  // Jeżeli nie udało się z nagłówków, użyjmy regex-a na całym tekście (fallback)
  if (!author && fullDescriptionText.includes('Autor:')) {
    const match = fullDescriptionText.match(/Autor[y]?:\s*([^\.]+)/i);
    if (match) author = match[1].trim();
  }

  // Odnośniki do materiałów, wideo, zasady użycia
  const videoLinks: string[] = [];
  const materialsLinks: Set<string> = new Set();
  let termsOfUse = '';

  textContent.find('a').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    const lowerHref = href.toLowerCase();
    const url = normalizeUrl(href);

    if (lowerHref.includes('youtube.com') || lowerHref.includes('youtu.be') || lowerHref.includes('vimeo.com')) {
      videoLinks.push(url);
    } else if (lowerHref.endsWith('.pdf') || lowerHref.endsWith('.doc') || lowerHref.endsWith('.docx') || lowerHref.endsWith('.zip')) {
      if (lowerHref.includes('zasady') || lowerHref.includes('regulamin') || lowerHref.includes('licencja')) {
        termsOfUse = url;
      } else {
        materialsLinks.add(url);
      }
    } else if (lowerHref.includes('creativecommons.org')) {
      termsOfUse = url;
    } else if (lowerHref.includes('mailto:')) {
      contactData += (contactData ? ', ' : '') + href.replace('mailto:', '');
    }
  });

  return {
    title,
    shortDescription: fullDescriptionText,
    fullDescription: '',
    targetGroup,
    author,
    contactData,
    termsOfUse,
    materialsLinks: Array.from(materialsLinks),
    videoLinks,
    sourceUrl
  };
}
