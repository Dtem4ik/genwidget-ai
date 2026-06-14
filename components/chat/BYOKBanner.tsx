"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const BYOK_STORAGE_KEY = "byok_gemini_key";

/** Shown when the daily limit is hit — lets the visitor continue with their own key. */
export function BYOKBanner() {
  const [value, setValue] = useState("");
  const valid = value.trim().startsWith("AIza");

  const save = () => {
    if (!valid) return;
    localStorage.setItem(BYOK_STORAGE_KEY, value.trim());
    location.reload();
  };

  return (
    <div className="border-primary/40 bg-primary/5 flex flex-col gap-2 rounded-lg border p-3 text-sm">
      <p className="font-medium">You&apos;ve used today&apos;s 10 free messages</p>
      <p className="text-muted-foreground text-xs">
        Paste your own Google AI Studio key to keep going — it&apos;s free.
      </p>
      <div className="flex gap-2">
        <Input
          aria-label="Google AI Studio API key"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="AIza..."
          type="password"
          value={value}
        />
        <Button disabled={!valid} onClick={save} size="sm">
          Use my key
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">
        Your key stays in your browser.{" "}
        <a
          className="underline"
          href="https://aistudio.google.com/apikey"
          rel="noreferrer"
          target="_blank"
        >
          Get a free key →
        </a>
      </p>
    </div>
  );
}
