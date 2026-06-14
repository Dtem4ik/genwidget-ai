import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Shared Upstash Redis client, or `null` when Upstash isn't configured (local dev
 * without creds, CI). Callers must treat `null` as "feature disabled" and no-op.
 */
export const redis = url && token ? new Redis({ url, token }) : null;
