// Shared CORS handling for public edge functions.
//
// IMPORTANT — what this does and does not do. CORS is enforced by browsers, not
// by us. Restricting the allowed origins stops a page on someone else's domain
// from calling these endpoints with a visitor's browser. It does NOT stop curl,
// a script, or anything outside a browser. Treat the rate limiter and the input
// caps as the actual protection; this is defence in depth, not the control.

const ALLOWED_ORIGINS = [
  "https://xeda.ai",
  "https://www.xeda.ai",
];

// Vite dev server origins, allowed unconditionally.
//
// These were previously gated on the function itself running locally, which
// broke the ordinary workflow: a local frontend against deployed functions got
// no Access-Control-Allow-Origin and the browser dropped every response.
//
// Allowing them costs nothing real. A remote attacker's page cannot present an
// Origin of http://localhost:8080 -- only a page actually served from the
// visitor's own machine can, and anything that can do that can equally call
// these endpoints with curl, which CORS never restrained anyway. The rate limit
// and the input caps are the controls; this list only decides which *browsers*
// are allowed to read a response.
const DEV_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173",
];

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin) || DEV_ORIGINS.includes(origin);
}

/**
 * CORS headers for a request. When the origin is not allowed we omit
 * Access-Control-Allow-Origin entirely, which makes the browser drop the
 * response. `Vary: Origin` keeps caches from serving one origin's headers
 * to another.
 */
export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Vary": "Origin",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin as string;
  }
  return headers;
}

/** Standard preflight response. Returns null when this is not a preflight. */
export function handlePreflight(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

/** JSON response helper that always carries the right CORS headers. */
export function jsonResponse(
  req: Request,
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(req) },
  });
}

/** Best-effort client IP, used as the rate-limit identifier. */
export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
