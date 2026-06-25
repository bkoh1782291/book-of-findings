"use client";

/*
  PasscodeGate — entry "unlock" screen for the Book of Findings console.

  ⚠️ SECURITY CAVEAT — this is a SOFT, COSMETIC deterrent only, NOT real access control.
  The passcode below ships inside the client JS bundle: anyone can read it via browser
  devtools / "view source", and the gate can be bypassed outright (e.g. by editing React
  state in devtools). The findings data is delivered to the browser regardless of this gate.
  It will stop a casual onlooker glancing at the screen; it will NOT stop anyone technical.
  For genuine protection, gate the app server-side (middleware / HTTP Basic auth / SSO).

  Behaviour: locks on EVERY load. There is no persisted "unlocked" flag, so a refresh or a
  reopened tab always returns to this screen (by design). Because `unlocked` starts `false`
  on both the server render and the first client render, there is no hydration mismatch and
  no flash of the protected app.
*/

import { useEffect, useRef, useState } from "react";

const PASSCODE = "KPMG@1234";

type Status = "idle" | "denied" | "granted";

export default function PasscodeGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus the field on mount (client-only; no SSR attribute → no hydration mismatch).
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (status === "granted" || value.length === 0) return;

    if (value === PASSCODE) {
      setStatus("granted");
      // Brief "access granted" beat (scanline sweep) before revealing the app.
      window.setTimeout(() => setUnlocked(true), 950);
    } else {
      setStatus("denied");
      setValue("");
      // Re-arm after the shake so the selector re-triggers on the next wrong attempt.
      window.setTimeout(() => setStatus("idle"), 600);
      inputRef.current?.focus();
    }
  };

  if (unlocked) return <>{children}</>;

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
            // unlocked padlock
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
              <path d="M8 10.5V7a4 4 0 0 1 7.7-1.4" />
              <circle cx="12" cy="15.3" r="1.25" />
            </svg>
          ) : (
            // locked padlock
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
              disabled={status === "granted"}
              aria-invalid={status === "denied"}
              aria-label="Passcode"
            />
          </div>
          <button
            type="submit"
            className="gate-btn"
            disabled={status === "granted" || value.length === 0}
          >
            {status === "granted" ? "GRANTED" : "UNLOCK"}
          </button>
        </form>

        <p className="gate-msg" data-status={status} aria-live="assertive">
          {status === "denied" ? "ACCESS DENIED — invalid passcode" : " "}
        </p>

        <div className="gate-foot">
          <span className="gate-foot-dot" aria-hidden="true" />
          SECURE CONSOLE · AUTHORIZED PERSONNEL ONLY
        </div>
      </div>
    </div>
  );
}
