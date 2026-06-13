import { tool } from "ai";

import { type GetStockOrCryptoOutput, getStockOrCryptoInput } from "./schema";

const TIMEOUT_MS = 8000;

/** Reduce a long series to at most `max` evenly-spaced points for the sparkline. */
function downsample(values: number[], max = 40): number[] {
  if (values.length <= max) return values;
  const step = values.length / max;
  return Array.from({ length: max }, (_, i) => values[Math.floor(i * step)]);
}

export const getStockOrCrypto = tool({
  description:
    "Get the live price, 24h change and a 7-day sparkline for a crypto coin or a stock. Use " +
    "when the user asks about a price or how an asset is doing. For crypto pass the CoinGecko " +
    "id (e.g. 'bitcoin'); for stocks pass the ticker (e.g. 'AAPL'). Live data — do not invent.",
  inputSchema: getStockOrCryptoInput,
  execute: async ({ symbol, name }): Promise<GetStockOrCryptoOutput> => {
    // Crypto first (CoinGecko, keyless).
    try {
      const id = symbol.toLowerCase();
      const priceRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd&include_24hr_change=true`,
        { signal: AbortSignal.timeout(TIMEOUT_MS) },
      );
      const priceData = (await priceRes.json()) as Record<
        string,
        { usd?: number; usd_24h_change?: number }
      >;
      const entry = priceData[id];
      if (entry?.usd != null) {
        const price = entry.usd;
        const changePercent = entry.usd_24h_change ?? 0;
        const chartRes = await fetch(
          `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=7`,
          { signal: AbortSignal.timeout(TIMEOUT_MS) },
        );
        const chart = (await chartRes.json()) as { prices?: Array<[number, number]> };
        const sparkline = downsample((chart.prices ?? []).map(([, p]) => p));
        return {
          symbol: id,
          name,
          price,
          change24h: (price * changePercent) / 100,
          changePercent,
          sparkline: sparkline.length ? sparkline : [price],
          source: "crypto",
        };
      }
    } catch {
      // fall through to stock
    }

    // Stock fallback (Yahoo Finance, unofficial — needs a UA header).
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=7d`,
        { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(TIMEOUT_MS) },
      );
      const data = (await res.json()) as {
        chart?: {
          result?: Array<{
            meta?: { regularMarketPrice?: number; chartPreviousClose?: number };
            indicators?: { quote?: Array<{ close?: Array<number | null> }> };
          }>;
        };
      };
      const r = data.chart?.result?.[0];
      if (r?.meta?.regularMarketPrice != null) {
        const price = r.meta.regularMarketPrice;
        const prev = r.meta.chartPreviousClose ?? price;
        const closes = (r.indicators?.quote?.[0]?.close ?? []).filter(
          (v): v is number => v != null,
        );
        const change24h = price - prev;
        return {
          symbol: symbol.toUpperCase(),
          name,
          price,
          change24h,
          changePercent: prev ? (change24h / prev) * 100 : 0,
          sparkline: downsample(closes.length ? closes : [price]),
          source: "stock",
        };
      }
    } catch {
      // fall through to error
    }

    return { error: `Couldn't find market data for "${name}".` };
  },
});
