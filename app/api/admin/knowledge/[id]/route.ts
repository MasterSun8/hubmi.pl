import { getId, parseBody, requireAdmin, route, type IdContext } from "@/server/http";
import { getDocument, retireDocument, updateDocument } from "@/server/services/knowledge";
import { knowledgePatch } from "@/server/validation";

export const GET = route(async (request, context: IdContext) => {
  requireAdmin(request);
  return Response.json(await getDocument(await getId(context)));
});

// Zmiana treści lub tytułu przebudowuje fragmenty i ich embeddingi.
export const PATCH = route(async (request, context: IdContext) => {
  requireAdmin(request);
  const id = await getId(context);
  return Response.json(await updateDocument(id, await parseBody(request, knowledgePatch)));
});

export const DELETE = route(async (request, context: IdContext) => {
  requireAdmin(request);
  return Response.json(await retireDocument(await getId(context)));
});
