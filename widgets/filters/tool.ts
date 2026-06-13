import { tool } from "ai";

import { type SetFiltersInput, setFiltersInput } from "./schema";

export const setFilters = tool({
  description:
    "Turn a vague refinement request (e.g. 'something roomier and cheaper') into a set of " +
    "toggleable filter chips. YOU derive the filters as the arguments; the user can toggle " +
    "them and apply. Mark the chips that match the request as active.",
  inputSchema: setFiltersInput,
  // Passthrough — the model sets the initial chip state; the user adjusts it.
  execute: (input: SetFiltersInput): SetFiltersInput => input,
});
