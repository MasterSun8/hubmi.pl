import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fetchHtml, sleep } from './fetcher.js'; // Assuming fetcher has the ESM fix

const CONTACT_START_URL = 'https://rops.krakow.pl/kontakt/regionalny-osrodek-polityki-spolecznej-w-krakowie';
const BASE_DOMAIN = 'https://rops.krakow.pl';

export interface ContactRecord {
  departmentName: string;
  address: string;
  openingHours: string;
  phone: string;
  email: string;
  nip: string;
  regon: string;
  director: string;
  deputyDirector: string;
  dpo: string; 
  accessibilityCoordinator: string;
  sourceUrl: string;
}

function normalizeUrl(url: string, baseUrl: string = BASE_DOMAIN): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return baseUrl + url;
  return baseUrl + '/' + url;
}

async function extractContactLinks(html: string): Promise<string[]> {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  // Szukamy linków do kontaktów w menu
  $('a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('/kontakt/')) {
      links.add(normalizeUrl(href));
    }
  });

  return Array.from(links);
}

function parseContactPage(html: string, sourceUrl: string): ContactRecord {
  const $ = cheerio.load(html);

  // Nazwa działu
  let departmentName = $('.page-title').text().trim().replace('Kontakt', '').trim();
  if (!departmentName) departmentName = $('h1').text().trim();

  let address = '';
  let openingHours = '';
  let phone = '';
  let email = '';

  $('.contact__box').each((_, el) => {
    if ($(el).find('.icon-pin').length) {
      address = $(el).find('p').eq(1).text().trim().replace(/\s+/g, ' ');
    }
    if ($(el).find('.icon-time').length) {
      openingHours = $(el).find('p').eq(1).text().trim().replace(/\s+/g, ' ');
    }
    if ($(el).find('.icon-phone').length) {
      phone = $(el).text().replace('Telefon:', '').replace('Fax:', '').trim().replace(/\s+/g, ' ');
    }
    if ($(el).find('.icon-mail').length) {
      email = $(el).find('a').text().trim() || $(el).text().replace('Email:', '').trim().replace(/\s+/g, ' ');
    }
  });

  let nip = '';
  let regon = '';
  $('.contact__doublebox p').each((_, el) => {
    const text = $(el).text().trim();
    if (text.includes('NIP:')) nip = text.replace('NIP:', '').trim();
    if (text.includes('REGON:')) regon = text.replace('REGON:', '').trim();
  });

  let director = '';
  let deputyDirector = '';
  let dpo = '';
  let accessibilityCoordinator = '';

  $('.contact-group__box').each((_, el) => {
    const title = $(el).find('.contact-group__title').text().trim().toLowerCase();
    const content = $(el).find('div').first().text().trim().replace(/\s+/g, ' ');

    if (title.includes('zastępc')) {
      deputyDirector = content;
    } else if (title.includes('dyrektor') || title.includes('kierownik')) {
      director = content;
    } else if (title.includes('inspektor')) {
      dpo = content;
    } else if (title.includes('koordynator')) {
      accessibilityCoordinator = content;
    }
  });

  return {
    departmentName,
    address,
    openingHours,
    phone,
    email,
    nip,
    regon,
    director,
    deputyDirector,
    dpo,
    accessibilityCoordinator,
    sourceUrl
  };
}

async function saveContactsToJson(data: ContactRecord[], filename: string = 'scraped_contacts.json'): Promise<void> {
  const filePath = path.resolve(process.cwd(), 'app', 'data', filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[JSON] Zapisano ${data.length} kontaktów do pliku: ${filePath}`);
}

async function runContactsScraper() {
  console.log(`[ContactScraper] Start dla: ${CONTACT_START_URL}`);
  
  try {
    const mainHtml = await fetchHtml(CONTACT_START_URL);
    const links = await extractContactLinks(mainHtml);
    console.log(`[ContactScraper] Znaleziono ${links.length} działów kontaktowych.`);

    const records: ContactRecord[] = [];

    for (const link of links) {
      console.log(`[ContactScraper] Pobieranie: ${link}`);
      try {
        const html = await fetchHtml(link);
        const record = parseContactPage(html, link);
        records.push(record);
      } catch (err) {
        console.error(`[ContactScraper] Błąd podczas pobierania ${link}:`, err);
      }
      await sleep(1000);
    }

    await saveContactsToJson(records);
    console.log(`[ContactScraper] Sukces. Pobrane departamenty: ${records.length}`);
  } catch (error) {
    console.error(`[ContactScraper] Główny błąd:`, error);
  }
}

runContactsScraper();
