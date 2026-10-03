import "server-only";
import OpenAI from "openai";
import { getAiConfig } from "./config";

let client: OpenAI | undefined;

// The only module allowed to import the OpenAI SDK, so swapping
// provider or adding tracing later touches a single file.
export function getOpenAI(): OpenAI {
  if (!client) {
    const { apiKey, timeoutMs } = getAiConfig();
    client = new OpenAI({ apiKey, timeout: timeoutMs });
  }
  return client;
}
