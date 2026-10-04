import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "../env";
import * as schema from "./schema";

function createClient() {
  const env = getEnv();
  return postgres(env.DATABASE_URL, { max: env.DATABASE_POOL_MAX });
}

function createDb(client: ReturnType<typeof createClient>) {
  return drizzle(client, { schema, casing: "snake_case" });
}

export type Db = ReturnType<typeof createDb>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

// Jedna pula połączeń na proces – także przy hot reloadzie w `next dev`. Drizzle budujemy
// od nowa, gdy hot reload podmieni schemat: inaczej nowe kolumny wywalają zapytania aż do restartu.
const globalForDb = globalThis as unknown as {
  hubmiDbClient?: ReturnType<typeof createClient>;
  hubmiDb?: { schema: typeof schema; db: Db };
};

export function getDb(): Db {
  globalForDb.hubmiDbClient ??= createClient();
  if (globalForDb.hubmiDb?.schema !== schema) {
    globalForDb.hubmiDb = { schema, db: createDb(globalForDb.hubmiDbClient) };
  }
  return globalForDb.hubmiDb.db;
}
