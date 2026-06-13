"use client";

import { createContext, type ReactNode, useContext } from "react";

type WidgetActions = {
  /** Send a follow-up message into the chat — closes the UI → AI → UI loop. */
  ask: (text: string) => void;
};

const WidgetActionsContext = createContext<WidgetActions | null>(null);

export function WidgetActionsProvider({
  ask,
  children,
}: {
  ask: (text: string) => void;
  children: ReactNode;
}) {
  return <WidgetActionsContext.Provider value={{ ask }}>{children}</WidgetActionsContext.Provider>;
}

/** No-op fallback when rendered outside a provider (e.g. in tests). */
export function useWidgetActions(): WidgetActions {
  return useContext(WidgetActionsContext) ?? { ask: () => {} };
}
