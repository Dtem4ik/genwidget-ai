import { google } from "@ai-sdk/google";

// $0/mo constraint: free-tier models only. Switching provider or model is a
// one-line change here (or an env override) — see docs/models.md.
const DEFAULT_CHAT_MODEL = "gemini-3.1-flash-lite";

export const chatModel = google(process.env.AI_CHAT_MODEL ?? DEFAULT_CHAT_MODEL);
