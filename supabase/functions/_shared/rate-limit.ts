import type { SupabaseClient } from "./supabase.ts";

export interface RateLimitOptions {
  /** Logical bucket, e.g. "contact" or "chat". Keeps limits independent. */
  bucket: string;
  /** Usually the client IP. */
  identifier: string;
  /** Requests permitted per window. */
  max: number;
  /** Window length in seconds. */
  windowSeconds: number;
}

/**
 * Durable rate limit backed by public.rate_limits. Shared across isolates and
 * survives cold starts, unlike the in-memory Map this replaces.
 *
 * Caveat worth knowing: the identifier is the client IP from x-forwarded-for.
 * Supabase sets that at the edge so it is not trivially forged, but it is still
 * per-IP -- it slows a single scripted caller down, it does not stop a
 * distributed one.
 *
 * Fails OPEN. If the database call errors we allow the request and log it:
 * losing a genuine lead to a transient DB hiccup is worse than letting one
 * extra request through. Change this if a bucket ever guards something
 * expensive enough to justify the opposite trade.
 */
export async function isRateLimited(
  admin: SupabaseClient | null,
  opts: RateLimitOptions,
): Promise<boolean> {
  if (!admin) {
    console.error("Rate limit skipped: no admin client.");
    return false;
  }

  const { data, error } = await admin.rpc("check_rate_limit", {
    p_bucket: opts.bucket,
    p_identifier: opts.identifier,
    p_max: opts.max,
    p_window: `${opts.windowSeconds} seconds`,
  });

  if (error) {
    console.error("Rate limit check failed, allowing request:", error.message);
    return false;
  }

  return data !== true;
}
