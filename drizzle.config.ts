import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile();
} catch {
  // brak pliku .env – zmienne mogą pochodzić ze środowiska
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema.ts",
  out: "./server/db/migrations",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
