import { parseBody, route } from "@/server/http";
import { createCluster, listClusters } from "@/server/services/clusters";
import { clusterInput } from "@/server/validation";

export const GET = route(async () => {
  return Response.json({ items: await listClusters() });
});

export const POST = route(async (request) => {
  return Response.json(await createCluster(await parseBody(request, clusterInput)), { status: 201 });
});
