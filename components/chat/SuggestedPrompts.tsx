"use client";

// One prompt per widget domain — covers everything the app can do, no docs needed.
const PROMPTS = [
  "Weather in Tel Aviv 🌤",
  "Bitcoin price 📈",
  "Show me 2BR apartments in Florentin",
  "Compare iPhone 15 Pro vs Pixel 9",
  "Best laptop for a developer under $1500",
  "I want something roomier and cheaper",
];

export function SuggestedPrompts({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="suggested-prompts">
      {PROMPTS.map((prompt) => (
        <button
          className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none sm:min-h-9"
          key={prompt}
          onClick={() => onSelect(prompt)}
          type="button"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
