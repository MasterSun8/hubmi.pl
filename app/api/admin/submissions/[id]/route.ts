import { getId, parseBody, route, type IdContext } from "@/server/http";
import { getSubmissionDetail, updateSubmission } from "@/server/services/submissions";
import { adminSubmissionPatch } from "@/server/validation";

export const GET = route(async (request, context: IdContext) => {
  return Response.json(await getSubmissionDetail(await getId(context)));
});

// Korekta klasyfikacji, statusu, priorytetu i przypisania do grupy problemów.
export const PATCH = route(async (request, context: IdContext) => {
  const id = await getId(context);
  return Response.json(await updateSubmission(id, await parseBody(request, adminSubmissionPatch)));
});
