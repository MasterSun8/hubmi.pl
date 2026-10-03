import fs from "fs/promises";
import path from "path";
import { getDb } from "./client";
import { solutions, contacts, regionalStatistics } from "./schema";

const db = getDb();

// Prosty parser CSV radzący sobie z wartościami w cudzysłowach
function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function seedInnovations() {
  const dataPath = path.join(process.cwd(), "app", "data", "cleaned_innovations.json");
  try {
    const content = await fs.readFile(dataPath, "utf-8");
    const innovations = JSON.parse(content);
    console.log(`[Seed] Wczytano ${innovations.length} innowacji.`);
    
    // Usuń stare dane
    await db.delete(solutions);
    
    const mapped = innovations.map((inv: any) => ({
      title: inv.title,
      description: inv.shortDescription || inv.fullDescription || "",
      categories: [inv.category].filter(Boolean),
      sourceName: "Biblioteka Innowacji Społecznych",
      sourceUrl: inv.sourceUrl,
      externalId: inv.id,
      authors: [inv.author].filter(Boolean),
      authorName: inv.author,
      organization: inv.organization,
      contactEmail: inv.email,
      contactPhone: inv.phone,
      contactUrl: inv.website,
      materialsUrls: inv.files?.map((f: any) => f.url) || [],
      searchText: `${inv.title} ${inv.shortDescription} ${inv.category}`.toLowerCase(),
    }));

    if (mapped.length > 0) {
      await db.insert(solutions).values(mapped);
      console.log(`[Seed] Zapisano ${mapped.length} innowacji do bazy.`);
    }
  } catch (err) {
    console.log(`[Seed] Brak pliku cleaned_innovations.json lub błąd:`, err);
  }
}

async function seedContacts() {
  const dataPath = path.join(process.cwd(), "app", "data", "cleaned_contacts.json");
  try {
    const content = await fs.readFile(dataPath, "utf-8");
    const contactsData = JSON.parse(content);
    console.log(`[Seed] Wczytano ${contactsData.length} kontaktów.`);
    
    await db.delete(contacts);
    
    const mapped = contactsData.map((c: any) => ({
      department: c.name || "Brak danych",
      address: c.address,
      openingHours: c.openingHours || [],
      phones: c.phones || [],
      emails: c.emails || [],
      roles: c.roles || [],
    }));

    if (mapped.length > 0) {
      await db.insert(contacts).values(mapped);
      console.log(`[Seed] Zapisano ${mapped.length} kontaktów do bazy.`);
    }
  } catch (err) {
    console.log(`[Seed] Brak pliku cleaned_contacts.json lub błąd:`, err);
  }
}

async function seedObserwator() {
  const baseDir = path.join(process.cwd(), "app", "data", "obserwator");
  
  try {
    await db.delete(regionalStatistics);
    const categories = await fs.readdir(baseDir);
    let totalInserted = 0;

    for (const category of categories) {
      const categoryPath = path.join(baseDir, category);
      const stat = await fs.stat(categoryPath);
      
      if (!stat.isDirectory()) continue;
      
      const files = await fs.readdir(categoryPath);
      for (const file of files) {
        if (!file.endsWith('.csv')) continue;
        
        const indicatorName = file.replace('.csv', '');
        const filePath = path.join(categoryPath, file);
        const csvContent = await fs.readFile(filePath, "utf-8");
        
        const lines = csvContent.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) continue;
        
        const headers = parseCsvLine(lines[0]);
        const recordsToInsert = [];
        
        for (let i = 1; i < lines.length; i++) {
          const row = parseCsvLine(lines[i]);
          const region = row[0]; // Pierwsza kolumna to "Obszar" np. "powiat bocheński"
          
          for (let j = 1; j < headers.length; j++) {
            const yearStr = headers[j].replace('Rok', '').trim();
            const year = parseInt(yearStr);
            if (isNaN(year)) continue;
            
            const valueStr = row[j];
            let value = null;
            let valueText = null;
            
            if (valueStr === '-' || valueStr === '.' || valueStr === '') {
               valueText = valueStr;
            } else {
               const parsedValue = parseFloat(valueStr.replace(',', '.').replace(/\s/g, ''));
               if (!isNaN(parsedValue)) {
                 value = parsedValue;
               } else {
                 valueText = valueStr;
               }
            }
            
            recordsToInsert.push({
              category: category,
              indicator: indicatorName,
              region: region,
              year: year,
              value: value,
              valueText: valueText
            });
          }
        }
        
        if (recordsToInsert.length > 0) {
          // Chunking the inserts to avoid "too many parameters" error in pg
          const chunkSize = 1000;
          for (let i = 0; i < recordsToInsert.length; i += chunkSize) {
            const chunk = recordsToInsert.slice(i, i + chunkSize);
            await db.insert(regionalStatistics).values(chunk);
          }
          totalInserted += recordsToInsert.length;
        }
      }
    }
    console.log(`[Seed] Zapisano ${totalInserted} wskaźników regionalnych do bazy.`);
  } catch (err) {
    console.log(`[Seed] Błąd podczas przetwarzania danych z Obserwatora:`, err);
  }
}

async function main() {
  console.log("Rozpoczynam seedowanie bazy danych...");
  await seedInnovations();
  await seedContacts();
  await seedObserwator();
  console.log("Seedowanie zakończone!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
