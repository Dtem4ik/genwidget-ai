import { createGoogleGenerativeAI, google } from "@ai-sdk/google";

// $0/mo constraint: free-tier models only. Switching provider or model is a
// one-line change here (or an env override) — see docs/models.md.
const DEFAULT_CHAT_MODEL = "gemini-3.1-flash-lite";
const modelId = () => process.env.AI_CHAT_MODEL ?? DEFAULT_CHAT_MODEL;

// Default server-side model — uses GOOGLE_GENERATIVE_AI_API_KEY from the env.
export const chatModel = google(modelId());

/**
 * Returns the chat model. With a bring-your-own-key value (the visitor's own free
 * Google AI Studio key, passed per-request), builds a provider bound to that key so
 * the request runs on the visitor's quota instead of ours.
 */
export function getChatModel(byokKey?: string) {
  if (!byokKey) return chatModel;
  return createGoogleGenerativeAI({ apiKey: byokKey })(modelId());
}
