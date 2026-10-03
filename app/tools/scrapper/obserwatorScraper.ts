import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://obserwator.rops.krakow.pl';

// Funkcja pomocnicza: opóźnienie
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Pobieranie strony z powtórzeniami i zwracaniem ciasteczek
async function fetchPage(url: string, retries = 3): Promise<{ html: string, cookie: string } | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const cookie = response.headers.get('set-cookie') || '';
      const html = await response.text();
      return { html, cookie };
    } catch (error) {
      console.error(`Błąd pobierania ${url} (próba ${i + 1}/${retries}):`, error);
      await sleep(2000);
    }
  }
  return null;
}

// Pobieranie obrazka
async function fetchImage(url: string, cookie: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'Cookie': cookie
      }
    });
    if (!response.ok) {
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`Błąd pobierania obrazka ${url}:`, error);
    return null;
  }
}

// Mapowanie danych do CSV
function parseTableToCsv($: cheerio.CheerioAPI): string {
  let csv = '';
  const table = $('#myChart02sorttable, .table').first();
  
  if (!table.length) return '';

  // Nagłówki
  const headers: string[] = [];
  table.find('thead tr th').each((_, el) => {
    headers.push($(el).text().trim());
  });
  csv += headers.map(escapeCsvCell).join(',') + '\n';

  // Wiersze
  table.find('tbody tr').each((_, tr) => {
    const row: string[] = [];
    $(tr).find('td, th').each((_, td) => {
      row.push($(td).text().trim());
    });
    csv += row.map(escapeCsvCell).join(',') + '\n';
  });

  return csv;
}

function escapeCsvCell(cell: string): string {
  // Jeśli zawiera przecinek, cudzysłów lub nową linię, otocz cudzysłowami
  if (/[,"\n]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

// Bezpieczna nazwa pliku/folderu
function sanitizeName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim();
}

async function startObserwatorScraper() {
  console.log('[ObserwatorScraper] Rozpoczynam pobieranie z:', BASE_URL);
  
  const result = await fetchPage(BASE_URL);
  if (!result) {
    console.error('Nie udało się pobrać strony głównej.');
    return;
  }

  const $ = cheerio.load(result.html);
  
  // Znajdźmy wszystkie kategorie i ich podkategorie
  // Szukamy elementów .side-menu__nav-item, w nich .collapse-toggle (nazwa kategorii)
  // i wewnątrz nich .side-menu__subnav-link (nazwa podkategorii i link)
  
  const categories: { name: string, links: { title: string, url: string }[] }[] = [];

  $('.side-menu__nav-item').each((_, item) => {
    const categoryBtn = $(item).find('button.collapse-toggle');
    const categoryName = categoryBtn.text().trim();
    
    if (!categoryName) return;

    const links: { title: string, url: string }[] = [];
    $(item).find('.side-menu__subnav-link').each((_, linkEl) => {
      const link = $(linkEl);
      const url = link.attr('href');
      const title = link.text().trim();
      
      if (url && url.startsWith('/differenceanalysis/')) {
        links.push({ title, url: BASE_URL + url });
      }
    });

    if (links.length > 0) {
      categories.push({ name: categoryName, links });
    }
  });

  console.log(`[ObserwatorScraper] Znaleziono ${categories.length} kategorii głównych.`);

  const outputDir = path.resolve(process.cwd(), 'app', 'data', 'obserwator');
  await fs.mkdir(outputDir, { recursive: true });

  let totalFiles = 0;

  for (const category of categories) {
    const categoryDir = path.join(outputDir, sanitizeName(category.name));
    await fs.mkdir(categoryDir, { recursive: true });

    console.log(`[Kategoria] ${category.name} (${category.links.length} wskaźników)`);

    for (const link of category.links) {
      console.log(`  -> Pobieranie: ${link.title}...`);
      const pageResult = await fetchPage(link.url);
      
      if (pageResult) {
        const $page = cheerio.load(pageResult.html);
        const csvContent = parseTableToCsv($page);
        
        if (csvContent) {
          const fileName = `${sanitizeName(link.title)}`;
          const csvPath = path.join(categoryDir, fileName + '.csv');
          await fs.writeFile(csvPath, csvContent, 'utf-8');
          totalFiles++;
          
          // Pobieranie obrazka mapy
          const imgBuffer = await fetchImage(BASE_URL + '/differenceanalysis/mapimg', pageResult.cookie);
          if (imgBuffer) {
             const imgPath = path.join(categoryDir, fileName + '.png');
             await fs.writeFile(imgPath, imgBuffer);
          }
        } else {
          console.warn(`  [!] Nie znaleziono tabeli dla: ${link.title}`);
        }
      }
      
      await sleep(1000); // Grzeczne opóźnienie
    }
  }

  console.log(`[ObserwatorScraper] Zakończono pomyślnie. Zapisano ${totalFiles} plików CSV w ${outputDir}.`);
}

startObserwatorScraper().catch(err => {
  console.error('[ObserwatorScraper] Błąd krytyczny:', err);
});
