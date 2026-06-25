"use client";

/*
  Login screen for the Book of Findings console.

  This is a REAL gate: the password is validated server-side by POST /api/login,
  which sets a signed, HttpOnly session cookie. The Edge middleware (middleware.ts)
  enforces that cookie on every route, so this screen cannot be bypassed from the
  browser. The password itself never reaches the client (it lives in APP_PASSWORD).
*/

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "loading" | "denied" | "granted";

export default function LoginPage() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (status === "loading" || status === "granted" || value.length === 0) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: value }),
      });

      if (res.ok) {
        setStatus("granted");
        // Session cookie is set; reveal the app. refresh() re-runs the middleware.
        window.setTimeout(() => {
          router.replace("/");
          router.refresh();
        }, 850);
      } else {
        setStatus("denied");
        setValue("");
        window.setTimeout(() => setStatus("idle"), 600);
        inputRef.current?.focus();
      }
    } catch {
      setStatus("denied");
      setValue("");
      window.setTimeout(() => setStatus("idle"), 600);
    }
  };

  return (
    <div
      className="gate"
      data-status={status}
      role="dialog"
      aria-modal="true"
      aria-label="Locked. Enter the passcode to continue."
    >
      <div className="gate-scanline" aria-hidden="true" />

      <div className="gate-card">
        <div className="gate-mark" aria-hidden="true">
          {status === "granted" ? (
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
              <path d="M8 10.5V7a4 4 0 0 1 7.7-1.4" />
              <circle cx="12" cy="15.3" r="1.25" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
              <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
              <circle cx="12" cy="15.3" r="1.25" />
            </svg>
          )}
        </div>

        <div className="gate-termline">
          <span>&gt; ./unlock --console</span>
          <span className="gate-caret" aria-hidden="true" />
        </div>

        <h1 className="gate-title">
          {status === "granted" ? "ACCESS GRANTED" : "AUTHENTICATION REQUIRED"}
        </h1>
        <p className="gate-sub">
          {status === "granted"
            ? "Decrypting console…"
            : "Book of Findings · PT Console — restricted. Enter passcode to continue."}
        </p>

        <form className="gate-form" onSubmit={submit}>
          <div className="gate-input-wrap">
            <svg className="gate-lock-ico" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
            </svg>
            <input
              ref={inputRef}
              type="password"
              className="gate-input"
              placeholder="passcode"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (status === "denied") setStatus("idle");
              }}
              autoComplete="off"
              name="bof-console-key"
              spellCheck={false}
              disabled={status === "granted" || status === "loading"}
              aria-invalid={status === "denied"}
              aria-label="Passcode"
            />
          </div>
          <button
            type="submit"
            className="gate-btn"
            disabled={status === "granted" || status === "loading" || value.length === 0}
          >
            {status === "granted" ? "GRANTED" : status === "loading" ? "CHECKING…" : "UNLOCK"}
          </button>
        </form>

        <p className="gate-msg" data-status={status} aria-live="assertive">
          {status === "denied" ? "ACCESS DENIED — invalid passcode" : " "}
        </p>

        <div className="gate-foot">
          <span className="gate-foot-dot" aria-hidden="true" />
          SECURE CONSOLE · AUTHORIZED PERSONNEL ONLY
        </div>
      </div>
    </div>
  );
}
