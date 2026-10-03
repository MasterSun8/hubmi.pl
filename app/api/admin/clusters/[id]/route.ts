import { getId, parseBody, route, type IdContext } from "@/server/http";
import { deleteCluster, getCluster, updateCluster } from "@/server/services/clusters";
import { clusterInput } from "@/server/validation";

export const GET = route(async (request, context: IdContext) => {
  return Response.json(await getCluster(await getId(context)));
});

export const PATCH = route(async (request, context: IdContext) => {
  const id = await getId(context);
  return Response.json(await updateCluster(id, await parseBody(request, clusterInput.partial())));
});

// Rozwiązanie grupy – zgłoszenia zostają, tracą tylko przypisanie.
export const DELETE = route(async (request, context: IdContext) => {
  await deleteCluster(await getId(context));
  return new Response(null, { status: 204 });
});
