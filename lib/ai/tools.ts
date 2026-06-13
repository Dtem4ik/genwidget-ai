import type { InferUITools, ToolSet, UIDataTypes, UIMessage } from "ai";

import { showApartments } from "@/widgets/apartments/tool";

// Every widget pack contributes exactly one entry here.
export const tools = {
  showApartments,
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof tools>;

/** Chat message type shared by the API route and the client. */
export type ChatUIMessage = UIMessage<unknown, UIDataTypes, ChatTools>;
