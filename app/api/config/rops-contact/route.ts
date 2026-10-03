import { getEnv } from "@/server/env";
import { route } from "@/server/http";

// Moduł 5: kontakt telefoniczny z ROPS w godzinach dyżuru (wartości z konfiguracji).
export const GET = route(async () => {
  const env = getEnv();
  return Response.json({ phone: env.ROPS_PHONE ?? null, dutyHours: env.ROPS_DUTY_HOURS ?? null });
});
