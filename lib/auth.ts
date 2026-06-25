// Server-side session helpers for the shared-password gate.
//
// This module is imported by BOTH the Edge middleware and the Node login route,
// so it must stay Edge-compatible: it uses `jose` (Web Crypto) only — never
// node:crypto. The password comparison itself lives in the login route (Node).

import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "bof_session";

// Hard cap on a single token's validity. The cookie is also session-scoped
// (no maxAge → cleared on browser close), so the gate re-locks when the browser
// is closed even before this expires.
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    // A weak/missing secret means forgeable sessions — refuse in production.
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must be set to a 32+ character value in production.");
    }
    // Dev-only fallback so the app runs out of the box. Do NOT rely on this.
    return new TextEncoder().encode("dev-only-insecure-secret-change-me-please-32");
  }
  return new TextEncoder().encode(secret);
}

/** Mint a signed session token after a successful password check. */
export async function createSessionToken(): Promise<string> {
  return new SignJWT({ authed: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

/** Verify a session token's signature and claims. Safe to call in middleware. */
export async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.authed === true;
  } catch {
    return false;
  }
}
