import fs from 'fs/promises';
import path from 'path';

export interface InnovationRecord {
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

export interface DatabaseAdapter {
  saveToDatabase: (data: InnovationRecord[]) => Promise<void>;
}

// Przykład pustej implementacji dla głównego skryptu
export async function saveToDatabase(data: InnovationRecord[]): Promise<void> {
  console.log(`[DB] Zapisano ${data.length} rekordów do bazy danych (mock).`);
}

// Zapis do pliku JSON w celu weryfikacji
export async function saveToJson(data: InnovationRecord[], filename: string = 'innovations.json'): Promise<void> {
  const filePath = path.resolve(process.cwd(), 'app', 'data', filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[JSON] Zapisano ${data.length} rekordów do pliku: ${filePath}`);
}
