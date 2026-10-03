import { sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { route } from "@/server/http";

export const GET = route(async () => {
  await getDb().execute(sql`select 1`);
  return Response.json({ status: "ok" });
});
