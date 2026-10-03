import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "../env";
import * as schema from "./schema";

function createDb() {
  const env = getEnv();
  const client = postgres(env.DATABASE_URL, { max: env.DATABASE_POOL_MAX });
  return drizzle(client, { schema, casing: "snake_case" });
}

export type Db = ReturnType<typeof createDb>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

// Jedna pula połączeń na proces – także przy hot reloadzie w `next dev`.
const globalForDb = globalThis as unknown as { hubmiDb?: Db };

export function getDb(): Db {
  globalForDb.hubmiDb ??= createDb();
  return globalForDb.hubmiDb;
}
