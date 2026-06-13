import type { DeepPartial, ToolUIPart } from "ai";
import { getStaticToolName } from "ai";
import type { ComponentType } from "react";

import { AlertCircleIcon } from "lucide-react";

import type { ChatTools } from "@/lib/ai/tools";
import { ApartmentResults } from "@/widgets/apartments/component";
import { ApartmentResultsSkeleton } from "@/widgets/apartments/skeleton";

/**
 * A widget pack binds one tool to its UI:
 * - Skeleton renders while tool input is still streaming (partial args)
 * - Component renders the tool output once it is available
 *
 * Adding a new widget = one folder under widgets/ + one entry in `registry`.
 * See docs/adding-a-widget.md.
 */
export interface WidgetPack<Input, Output> {
  Component: ComponentType<{ input: Input; output: Output }>;
  Skeleton: ComponentType<{ input?: DeepPartial<Input> }>;
}

type Registry = {
  [Name in keyof ChatTools]: WidgetPack<ChatTools[Name]["input"], ChatTools[Name]["output"]>;
};

const registry: Registry = {
  showApartments: {
    Component: ApartmentResults,
    Skeleton: ApartmentResultsSkeleton,
  },
};

export type ChatToolPart = ToolUIPart<ChatTools>;

function WidgetError({ message }: { message?: string }) {
  return (
    <div className="border-destructive/50 bg-destructive/10 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
      <AlertCircleIcon className="size-4 shrink-0" />
      <span>{message ?? "The widget failed to load."}</span>
    </div>
  );
}

/** Renders the right widget for a tool part based on its streaming state. */
export function ToolWidget({ part }: { part: ChatToolPart }) {
  const name = getStaticToolName(part) as keyof ChatTools;
  // The registry guarantees Input/Output match the tool name, but TypeScript
  // cannot carry that correlation through a keyed lookup — narrow once here.
  const pack = registry[name] as unknown as WidgetPack<unknown, unknown>;

  switch (part.state) {
    case "input-streaming":
    case "input-available":
      return <pack.Skeleton input={part.input} />;
    case "output-available":
      return <pack.Component input={part.input} output={part.output} />;
    case "output-error":
      return <WidgetError message={part.errorText} />;
    default:
      return null;
  }
}
