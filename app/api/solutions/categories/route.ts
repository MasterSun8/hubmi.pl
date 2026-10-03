import { route } from "@/server/http";
import { listSolutionCategories } from "@/server/services/solutions";

// Kategorie biblioteki innowacji z liczbą rozwiązań – do filtrów (?category=...).
export const GET = route(async () => {
  return Response.json({ items: await listSolutionCategories() });
});
