"use client";

import { useMemo, useState } from "react";
import { CVSS40 } from "@pandatix/js-cvss";
import {
  CVSS40_GROUPS,
  buildVector,
  defaultValues,
  ratingToSev,
  ratingLabel,
} from "@/lib/cvss40";

const RATING_BANDS = [
  { label: "None", sev: "Info", from: 0.0 },
  { label: "Low", sev: "Low", from: 0.1 },
  { label: "Medium", sev: "Medium", from: 4.0 },
  { label: "High", sev: "High", from: 7.0 },
  { label: "Critical", sev: "Critical", from: 9.0 },
];

export default function Cvss40Calculator() {
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [copied, setCopied] = useState(false);

  const vector = useMemo(() => buildVector(values), [values]);

  const { score, rating, nomenclature, error } = useMemo(() => {
    try {
      const c = new CVSS40(vector);
      const s = c.Score();
      return { score: s, rating: CVSS40.Rating(s), nomenclature: c.Nomenclature(), error: false };
    } catch {
      return { score: 0, rating: "NONE", nomenclature: "CVSS-B", error: true };
    }
  }, [vector]);

  const sev = ratingToSev(rating);
  const set = (key: string, v: string) => setValues((prev) => ({ ...prev, [key]: v }));
  const reset = () => setValues(defaultValues());

  const copyVector = () => {
    navigator.clipboard.writeText(vector);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const markerPct = Math.min(100, Math.max(0, (score / 10) * 100));

  return (
    <div className="view-head-wrap">
      <div className="view-head">
        <h2 className="view-title">CVSS v4.0 Calculator</h2>
        <p className="view-sub">
          Common Vulnerability Scoring System v4.0 — scoring conformant with the{" "}
          <a href="https://www.first.org/cvss/v4.0/specification-document" target="_blank" rel="noreferrer">
            FIRST specification
          </a>
          .
        </p>
      </div>

      <div className="cvss">
        {/* metric groups */}
        <div className="cvss-main">
          {CVSS40_GROUPS.map((group) => (
            <section key={group.id} className="cvss-group" data-group={group.id}>
              <header className="cvss-group-head">
                <span className="cvss-group-name">{group.name}</span>
                {group.optional && <span className="cvss-group-flag">Optional</span>}
                <p className="cvss-group-blurb">{group.blurb}</p>
              </header>

              {group.subgroups.map((sub) => (
                <div key={sub.name} className="cvss-subgroup">
                  <div className="cvss-subgroup-title">{sub.name}</div>
                  <div className="cvss-metrics">
                    {sub.metrics.map((m) => (
                      <div key={m.key} className="cvss-metric">
                        <div className="cvss-metric-head" title={m.tip}>
                          <span className="cvss-metric-name">{m.name}</span>
                          <span className="cvss-metric-key">{m.key}</span>
                        </div>
                        <div className="cvss-opts" role="group" aria-label={m.name}>
                          {m.options.map((o) => (
                            <button
                              key={o.v}
                              type="button"
                              className="cvss-opt"
                              data-active={values[m.key] === o.v ? "true" : "false"}
                              onClick={() => set(m.key, o.v)}
                            >
                              {o.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>

        {/* sticky result panel */}
        <aside className="cvss-result" data-sev={sev}>
          <div className="cvss-result-inner">
            <div className="cvss-score-row">
              <div className="cvss-score">{error ? "—" : score.toFixed(1)}</div>
              <div className="cvss-score-meta">
                <span className="cvss-rating">{ratingLabel(rating)}</span>
                <span className="cvss-nom" title="Base / Threat / Environmental structure">
                  {nomenclature}
                </span>
              </div>
            </div>

            <div className="cvss-scale">
              <div className="cvss-scale-track">
                <span className="cvss-scale-marker" style={{ left: `${markerPct}%` }} />
              </div>
              <div className="cvss-scale-bands">
                {RATING_BANDS.map((b) => (
                  <span
                    key={b.label}
                    className="cvss-band"
                    data-sev={b.sev}
                    data-active={ratingLabel(rating) === b.label ? "true" : "false"}
                  >
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="cvss-vector-box">
              <div className="cvss-vector-label">Vector String</div>
              <code className="cvss-vector">{vector}</code>
            </div>

            <div className="cvss-actions">
              <button type="button" className="cvss-btn cvss-btn-primary" onClick={copyVector}>
                {copied ? (
                  <>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11" /></svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></svg>
                    Copy Vector
                  </>
                )}
              </button>
              <button type="button" className="cvss-btn" onClick={reset}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
                Reset
              </button>
            </div>

            <p className="cvss-hint">
              Supplemental metrics provide response context and do not change the score.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
