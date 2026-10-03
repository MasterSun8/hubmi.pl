import type { z } from "zod";
import { getAi } from "../ai";
import { getDb } from "../db/client";
import { implementationRecommendations } from "../db/schema";
import { HttpError } from "../http";
import type { recommendationBody } from "../validation";
import { getConversation, toChatTurns } from "./conversations";
import { getSolutionsByIds } from "./solutions";
export async function createRecommendation(conversationId: string, body: z.infer<typeof recommendationBody>) {
  const conversation = await getConversation(conversationId);
  const found = (await getSolutionsByIds(body.solutionIds)).filter((s) => s.status === "published");
  if (found.length !== body.solutionIds.length) throw new HttpError(400, "Unknown or unpublished solution");

  const output = await getAi().recommendImplementation({
    history: toChatTurns(conversation.messages),
    solutions: found.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      targetGroups: s.targetGroups,
      sourceUrl: s.sourceUrl,
      similarity: 1,
      implementationNotes: s.implementationNotes,
      requiredResources: s.requiredResources,
    })),
    context: body.context,
  });

  const [recommendation] = await getDb()
    .insert(implementationRecommendations)
    .values({ conversationId, solutionIds: body.solutionIds, context: body.context, ...output })
    .returning();
  return recommendation;
}
