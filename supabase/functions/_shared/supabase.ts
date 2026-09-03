import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.114.0";

/**
 * Service-role client for server-side writes. Bypasses RLS, so the anon key
 * does not need (and no longer has) direct INSERT access to the lead tables.
 *
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected into every edge
 * function by the platform -- they are not secrets you set by hand.
 */
export function getAdminClient(): SupabaseClient | null {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    console.error("Supabase admin client not configured (missing URL or service role key).");
    return null;
  }
  return createClient(url, serviceRoleKey);
}

export type { SupabaseClient };
