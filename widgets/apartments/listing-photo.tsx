"use client";

import { ImageOffIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Builds a free, no-key, query-matched photo URL.
 *
 * Two things bit us here, both encoded below:
 *  - Unsplash Source (source.unsplash.com) was shut down in 2024 (503s now), and
 *    Pollinations now requires payment — so we use LoremFlickr, which is keyless.
 *  - LoremFlickr OR-matches tags, so a location word like "tel aviv" pulls a tourist
 *    photo (a cat statue, in testing) instead of an interior. We therefore send a
 *    curated, interior-only tag set and use `lock` for a stable, distinct image per
 *    card. `imageQuery` is kept on the schema for the alt text and for a future
 *    upgrade to a keyed provider (e.g. Unsplash API) where it becomes the search term.
 */
export function photoUrl(query: string, lock: number, width = 400, height = 240) {
  const roomWord = /studio/i.test(query) ? "studio" : "bedroom";
  const tags = ["apartment", "interior", roomWord].join(",");
  return `https://loremflickr.com/${width}/${height}/${tags}?lock=${lock}`;
}

export function ListingPhoto({ query, alt, lock }: { query: string; alt: string; lock: number }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <div className="bg-muted relative h-40 w-full overflow-hidden rounded-lg">
      {status === "loading" && <div className="absolute inset-0 animate-pulse" />}
      {status === "error" ? (
        <div className="text-muted-foreground/70 absolute inset-0 flex items-center justify-center">
          <ImageOffIcon className="size-5" />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- external keyless image host; next/image remotePatterns not wanted here
        <img
          alt={alt}
          className={cn(
            "h-40 w-full object-cover transition-opacity duration-300",
            status === "loaded" ? "opacity-100" : "opacity-0",
          )}
          loading="lazy"
          onError={() => setStatus("error")}
          onLoad={() => setStatus("loaded")}
          src={photoUrl(query, lock)}
        />
      )}
    </div>
  );
}
