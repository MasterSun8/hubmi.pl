import { z } from "zod";
import { parseBody, parseQuery, requireAdmin, route } from "@/server/http";
import { createDocument, listDocuments } from "@/server/services/knowledge";
import { knowledgeInput } from "@/server/validation";

const listQuery = z.object({ status: z.enum(["draft", "published", "retired"]).optional() });

export const GET = route(async (request) => {
  requireAdmin(request);
  return Response.json({ items: await listDocuments(parseQuery(request, listQuery).status) });
});

export const POST = route(async (request) => {
  requireAdmin(request);
  return Response.json(await createDocument(await parseBody(request, knowledgeInput)), { status: 201 });
});
