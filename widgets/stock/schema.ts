import { z } from "zod";

export const getStockOrCryptoInput = z.object({
  symbol: z
    .string()
    .describe(
      "CoinGecko id for crypto (lowercase, e.g. 'bitcoin', 'ethereum', 'solana') OR a stock " +
        "ticker (e.g. 'AAPL', 'TSLA', 'NVDA').",
    ),
  name: z.string().describe("Human-readable name, e.g. 'Bitcoin' or 'Apple'"),
});

export type GetStockOrCryptoInput = z.infer<typeof getStockOrCryptoInput>;

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent: number;
  sparkline: number[];
  source: "crypto" | "stock";
}

export type GetStockOrCryptoOutput = StockData | { error: string };
