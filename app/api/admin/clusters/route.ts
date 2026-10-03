import { parseBody, requireAdmin, route } from "@/server/http";
import { createCluster, listClusters } from "@/server/services/clusters";
import { clusterInput } from "@/server/validation";

export const GET = route(async (request) => {
  requireAdmin(request);
  return Response.json({ items: await listClusters() });
});

export const POST = route(async (request) => {
  requireAdmin(request);
  return Response.json(await createCluster(await parseBody(request, clusterInput)), { status: 201 });
});
