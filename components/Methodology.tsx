"use client";

import { useMemo, useState } from "react";
import { METHODOLOGIES, type Methodology, type MethodPhase } from "@/lib/methodology";

export default function Methodology() {
  const [methodId, setMethodId] = useState<string>(METHODOLOGIES[0].id);
  const [phaseId, setPhaseId] = useState<string>("all");
  const [query, setQuery] = useState("");

  const method: Methodology = useMemo(
    () => METHODOLOGIES.find((m) => m.id === methodId) ?? METHODOLOGIES[0],
    [methodId]
  );

  const switchMethod = (id: string) => {
    setMethodId(id);
    setPhaseId("all");
    setQuery("");
  };

  const q = query.trim().toLowerCase();

  // Filter by selected phase, then by search across check fields.
  const phases: MethodPhase[] = useMemo(() => {
    const scoped = phaseId === "all" ? method.phases : method.phases.filter((p) => p.id === phaseId);
    if (!q) return scoped;
    return scoped
      .map((p) => ({
        ...p,
        checks: p.checks.filter(
          (c) =>
            c.id.toLowerCase().includes(q) ||
            c.title.toLowerCase().includes(q) ||
            c.desc.toLowerCase().includes(q) ||
            (c.tools?.some((t) => t.toLowerCase().includes(q)) ?? false) ||
            (c.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
        ),
      }))
      .filter((p) => p.checks.length > 0);
  }, [method, phaseId, q]);

  const totalChecks = phases.reduce((n, p) => n + p.checks.length, 0);

  return (
    <div className="view-head-wrap">
      <div className="view-head">
        <h2 className="view-title">Penetration Testing Methodology</h2>
        <p className="view-sub">
          Phase-by-phase playbooks to structure engagements and scope reports. A curated reference —
          authoritative, exhaustive guidance lives at each linked source.
        </p>
      </div>

      {/* methodology tabs */}
      <div className="maps-tabs">
        {METHODOLOGIES.map((m) => (
          <button
            key={m.id}
            className="maps-tab"
            data-active={method.id === m.id ? "true" : "false"}
            onClick={() => switchMethod(m.id)}
          >
            {m.label}
            <span className="maps-tab-sub">{m.id === "web" ? "OWASP WSTG" : "PTES · MITRE ATT&CK"}</span>
          </button>
        ))}
      </div>

      {/* toolbar: phase selector + search */}
      <div className="maps-toolbar">
        <div className="map-selector">
          <button className="map-pill" data-active={phaseId === "all" ? "true" : "false"} onClick={() => setPhaseId("all")}>
            All phases
          </button>
          {method.phases.map((p) => (
            <button
              key={p.id}
              className="map-pill"
              data-active={phaseId === p.id ? "true" : "false"}
              onClick={() => setPhaseId(p.id)}
            >
              <span className="method-pill-num">{p.num}</span>
              {p.title}
            </button>
          ))}
        </div>
        <div className="searchbox maps-search">
          <svg className="search-ico" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
          </svg>
          <input
            type="text"
            placeholder={`Search ${method.label} checks…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery("")} aria-label="Clear search">
              ×
            </button>
          )}
        </div>
      </div>

      {/* methodology header */}
      <div className="map-setinfo">
        <p className="map-setblurb">{method.blurb}</p>
        <a className="map-source" href={method.sourceUrl} target="_blank" rel="noreferrer">
          {method.sourceLabel}
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </a>
      </div>

      {/* phases */}
      <div className="method-phases">
        {phases.map((p) => (
          <section key={p.id} className="method-phase">
            <header className="method-phase-head">
              <span className="method-phase-num">{p.num}</span>
              <div className="method-phase-titles">
                <h3 className="method-phase-title">{p.title}</h3>
                <p className="method-phase-summary">{p.summary}</p>
              </div>
              <div className="method-phase-meta">
                <span className="method-phase-tag">{p.tag}</span>
                <span className="method-phase-count">{p.checks.length} checks</span>
              </div>
            </header>

            <div className="method-checks">
              {p.checks.map((c) => (
                <div key={c.id} className="method-check">
                  <div className="method-check-top">
                    <span className="map-id method-check-id">{c.id}</span>
                    <span className="method-check-title">{c.title}</span>
                  </div>
                  <p className="method-check-desc">{c.desc}</p>
                  {((c.tools && c.tools.length > 0) || (c.tags && c.tags.length > 0)) && (
                    <div className="method-check-foot">
                      {c.tools && c.tools.length > 0 && (
                        <div className="method-tools">
                          {c.tools.map((t) => (
                            <span key={t} className="method-tool">{t}</span>
                          ))}
                        </div>
                      )}
                      {c.tags && c.tags.length > 0 && (
                        <div className="method-tagrow">
                          {c.tags.map((t) => (
                            <span key={t} className="map-tag method-tag">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {totalChecks === 0 && (
        <div className="empty">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
          </svg>
          <p className="empty-title">No checks match “{query}”</p>
          <p className="empty-sub">Try a different term or clear the search.</p>
        </div>
      )}
    </div>
  );
}
