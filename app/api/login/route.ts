import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";

// node:crypto requires the Node runtime (this route is excluded from middleware).
export const runtime = "nodejs";

// The shared password lives ONLY on the server (env var) and is never sent to the
// browser. Falls back to the legacy value for local dev if APP_PASSWORD is unset.
const PASSWORD = process.env.APP_PASSWORD ?? "KPMG@1234";

// Compare fixed-length SHA-256 digests so timingSafeEqual never throws on a length
// mismatch and no length information leaks through timing.
function passwordMatches(input: string): boolean {
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(PASSWORD).digest();
  return timingSafeEqual(a, b);
}

// --- Lightweight in-memory brute-force throttle (per server instance) ---
// Good enough for a single self-hosted Node process. For multi-instance/serverless
// deployments, replace with a shared store (e.g. Redis/Upstash).
const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; first: number }>();

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}

// Set the Secure flag only when the request is actually HTTPS, so the session
// cookie also works on plain-HTTP deployments (a browser silently drops a Secure
// cookie over HTTP). Behind a proxy/LB the real scheme is in x-forwarded-proto;
// otherwise fall back to the request URL's protocol. HTTPS is still recommended.
function isHttps(req: Request): boolean {
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (proto) return proto === "https";
  return new URL(req.url).protocol === "https:";
}
function isThrottled(ip: string): boolean {
  const rec = attempts.get(ip);
  if (!rec || Date.now() - rec.first > WINDOW_MS) return false;
  return rec.count >= MAX_ATTEMPTS;
}
function recordFailure(ip: string): void {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.first > WINDOW_MS) attempts.set(ip, { count: 1, first: now });
  else rec.count += 1;
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (isThrottled(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  let password = "";
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  if (!passwordMatches(password)) {
    recordFailure(ip);
    return NextResponse.json({ ok: false, error: "Invalid passcode" }, { status: 401 });
  }

  attempts.delete(ip); // reset throttle on success
  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isHttps(req),
    sameSite: "lax",
    path: "/",
    // No maxAge → session cookie: re-locks when the browser is closed.
  });
  return res;
}
