import { createClient } from "https://esm.sh/@supabase/supabase-js@2.114.0";

export type AdminCheck =
  | { ok: true; userId: string }
  | { ok: false; error: string; status: number };

/**
 * Verify the caller is a signed-in admin. Extracted from unsubscribe-mailchimp,
 * which was the only function doing this correctly, so the same check can guard
 * every privileged endpoint.
 *
 * Uses the anon key with the caller's Authorization header so RLS applies as
 * that user -- never the service role, which would bypass the very check we are
 * making.
 */
export async function requireAdmin(req: Request): Promise<AdminCheck> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { ok: false, error: "Unauthorized", status: 401 };
  }

  const client = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) {
    return { ok: false, error: "Unauthorized", status: 401 };
  }

  const { data: roles } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin");

  if (!roles || roles.length === 0) {
    return { ok: false, error: "Admin access required", status: 403 };
  }

  return { ok: true, userId: user.id };
}
