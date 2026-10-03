import fs from 'fs/promises';
import path from 'path';

// Zdefiniujmy nowe, czystsze interfejsy dla poprawionych danych
export interface CleanedInnovationRecord {
  title: string;
  shortDescription: string;
  fullDescription: string;
  targetGroup: string;
  author: string;
  contactData: string;
  termsOfUse: string;
  materialsLinks: string[];
  videoLinks: string[];
  sourceUrl: string;
}

export interface CleanedContactRecord {
  departmentName: string;
  address: string;
  openingHours: { days: string; hours: string }[];
  phones: string[];
  email: string;
  nip: string;
  regon: string;
  director: any;
  deputyDirector: any;
  dpo: any;
  accessibilityCoordinator: any;
  sourceUrl: string;
}

// Pomocnicza funkcja do czyszczenia autora (usuwa myślniki, kropki i białe znaki z przodu)
function cleanAuthor(author: string): string {
  return author.replace(/^[-.,\s]+/, '').trim();
}

// Pomocnicza funkcja do parsowania godzin otwarcia
// "7:00-16:00 | poniedziałek-czwartek, 7:00-18:00 | piątek" -> obiekty {days, hours}
function parseOpeningHours(raw: string): { days: string; hours: string }[] {
  if (!raw) return [];
  const parts = raw.split(',');
  return parts.map(part => {
    // Często separator to '|'
    if (part.includes('|')) {
      const [hours, days] = part.split('|').map(s => s.trim());
      // W rzadkich przypadkach układ bywa odwrotny, ale z danych wynika, że zazwyczaj jest "godziny | dni"
      return { days: days || '', hours: hours || '' };
    }
    return { days: '', hours: part.trim() }; // fallback
  });
}

// Pomocnicza funkcja do czyszczenia telefonów - wydziela logicznie numery
function parsePhones(raw: string): string[] {
  if (!raw) return [];
  // Aktualizacja regexa na różne warianty: (+48) 12 123 45 67, (+48 12) 123 45 67 itd.
  const phonePattern = /(?:(?:SEKRETARIAT)?\s*(?:\(\+48\s*\d{2}\)\s*\d{3}\s*\d{2}\s*\d{2}|\(\+48\)\s*\d{2}\s*\d{3}\s*\d{2}\s*\d{2}|\(\+48\)\s*\d{3}\s*\d{3}\s*\d{3}|\+48\s*\d{3}\s*\d{3}\s*\d{3})(?:\s*\|\s*w\.\s*\d+)?)/g;
  
  const matches = raw.match(phonePattern);
  if (matches) {
    return Array.from(new Set(matches.map(m => m.trim().replace(/\s+/g, ' '))));
  }
  
  // Jeśli regex nic nie znalazł (może nietypowy format), próbujemy podzielić po (+48
  if (raw.includes('(+48')) {
     const parts = raw.split(/(?=\(\+48)/g).map(p => p.trim()).filter(Boolean);
     if (parts.length > 1) return parts;
  }

  return [raw.trim()];
}

// Pomocnicza funkcja do parsowania pól takich jak dyrektor - gdzie jest imię, tel, email
function parsePerson(raw: string): jakisPerson[] {
  if (!raw) return [];
  // Z racji że może być ich kilku (jak Zastępcy) - podzielmy po znanych stanowiskach
  const personStrings = raw.split(/(?=(?:I Zastępca|II Zastępca|Inspektor Ochrony|Z-ca Inspektora))/g);
  
  return personStrings.map(str => {
    let email = '';
    let emailMatch = str.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/);
    if (emailMatch) email = emailMatch[0];

    const phones = parsePhones(str);
    
    // Imię i nazwisko - wyrzucamy słowa kluczowe
    let name = str
      .replace(email, '')
      .replace(/tel\.?:?/gi, '')
      .replace(/e-mail:?/gi, '')
      .replace(/I Zastępca Dyrektora|II Zastępca Dyrektora|Inspektor Ochrony Danych|Z-ca Inspektora Ochrony Danych/gi, '')
      .trim();

    // Wyrzucamy z nazwy również numery telefonów
    phones.forEach(p => {
      name = name.replace(p, '');
    });
    
    name = name.replace(/\s+/g, ' ').trim();

    return { name, email, phones, originalRaw: str.trim() };
  }).filter(p => p.name.length > 2); // Filtrujemy błędne/puste pozycje (jak samotne 'I')
}

type jakisPerson = { name: string, email: string, phones: string[], originalRaw: string };

async function runCleaner() {
  try {
    // 1. Czyszczenie innowacji
    const innPath = path.resolve(process.cwd(), 'app', 'data', 'scraped_innovations.json');
    const innRaw = await fs.readFile(innPath, 'utf-8');
    const innData: any[] = JSON.parse(innRaw);

    const cleanedInnovations: CleanedInnovationRecord[] = innData.map(item => ({
      ...item,
      author: cleanAuthor(item.author),
      // inne pola można by tu dodatkowo oczyścić
    }));

    await fs.writeFile(
      path.resolve(process.cwd(), 'app', 'data', 'cleaned_innovations.json'), 
      JSON.stringify(cleanedInnovations, null, 2), 
      'utf-8'
    );
    console.log(`[Cleaner] Zapisano poprawione innowacje (ilość: ${cleanedInnovations.length}).`);

    // 2. Czyszczenie kontaktów
    const contactsPath = path.resolve(process.cwd(), 'app', 'data', 'scraped_contacts.json');
    const contactsRaw = await fs.readFile(contactsPath, 'utf-8');
    const contactsData: any[] = JSON.parse(contactsRaw);

    const cleanedContacts: CleanedContactRecord[] = contactsData.map(c => ({
      departmentName: c.departmentName,
      address: c.address,
      openingHours: parseOpeningHours(c.openingHours),
      phones: parsePhones(c.phone),
      email: c.email,
      nip: c.nip,
      regon: c.regon,
      director: parsePerson(c.director),
      deputyDirector: parsePerson(c.deputyDirector),
      dpo: parsePerson(c.dpo),
      accessibilityCoordinator: parsePerson(c.accessibilityCoordinator),
      sourceUrl: c.sourceUrl
    }));

    await fs.writeFile(
      path.resolve(process.cwd(), 'app', 'data', 'cleaned_contacts.json'), 
      JSON.stringify(cleanedContacts, null, 2), 
      'utf-8'
    );
    console.log(`[Cleaner] Zapisano poprawione kontakty (ilość: ${cleanedContacts.length}).`);

  } catch (err) {
    console.error(`[Cleaner] Błąd podczas czyszczenia:`, err);
  }
}

runCleaner();
