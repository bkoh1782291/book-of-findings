"use client";

import { useMemo, useState } from "react";
import { FRAMEWORKS, COMPLIANCE, type RefSet } from "@/lib/mappings";

type TabId = "frameworks" | "compliance";

export default function Mappings() {
  const [tab, setTab] = useState<TabId>("frameworks");
  const [query, setQuery] = useState("");

  const sets = tab === "frameworks" ? FRAMEWORKS : COMPLIANCE;
  const [activeSetId, setActiveSetId] = useState<string>(FRAMEWORKS[0].id);

  // resolve the active set within whichever tab is showing (fall back to first)
  const activeSet: RefSet = useMemo(() => {
    return sets.find((s) => s.id === activeSetId) ?? sets[0];
  }, [sets, activeSetId]);

  const switchTab = (t: TabId) => {
    setTab(t);
    setQuery("");
    setActiveSetId((t === "frameworks" ? FRAMEWORKS : COMPLIANCE)[0].id);
  };

  const q = query.trim().toLowerCase();
  const entries = useMemo(() => {
    if (!q) return activeSet.entries;
    return activeSet.entries.filter((e) => {
      return (
        e.id.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        (e.desc?.toLowerCase().includes(q) ?? false) ||
        (e.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
      );
    });
  }, [activeSet, q]);

  return (
    <div className="view-head-wrap">
      <div className="view-head">
        <h2 className="view-title">Framework &amp; Compliance Mapping</h2>
        <p className="view-sub">
          Reference summaries to align findings with security frameworks and compliance standards.
          Authoritative control text lives at each linked source.
        </p>
      </div>

      {/* tabs */}
      <div className="maps-tabs">
        <button className="maps-tab" data-active={tab === "frameworks" ? "true" : "false"} onClick={() => switchTab("frameworks")}>
          Frameworks
          <span className="maps-tab-sub">CWE · OWASP · MITRE</span>
        </button>
        <button className="maps-tab" data-active={tab === "compliance" ? "true" : "false"} onClick={() => switchTab("compliance")}>
          Compliance
          <span className="maps-tab-sub">ISO 27001 · PCI DSS · NIST CSF</span>
        </button>
      </div>

      {/* toolbar: set selector + search */}
      <div className="maps-toolbar">
        <div className="map-selector">
          {sets.map((s) => (
            <button
              key={s.id}
              className="map-pill"
              data-active={activeSet.id === s.id ? "true" : "false"}
              onClick={() => setActiveSetId(s.id)}
            >
              {s.label}
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
            placeholder={`Search ${activeSet.label}…`}
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

      {/* set header */}
      <div className="map-setinfo">
        <p className="map-setblurb">{activeSet.blurb}</p>
        <a className="map-source" href={activeSet.sourceUrl} target="_blank" rel="noreferrer">
          {activeSet.sourceLabel}
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </a>
      </div>

      {/* cards */}
      <div className="map-grid">
        {entries.map((e) => {
          const card = (
            <>
              <div className="map-card-top">
                <span className="map-id">{e.id}</span>
                {e.link && (
                  <svg className="map-ext" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                )}
              </div>
              <div className="map-title">{e.title}</div>
              {e.desc && <p className="map-desc">{e.desc}</p>}
              {e.tags && e.tags.length > 0 && (
                <div className="map-tags">
                  {activeSet.tagLabel && <span className="map-tags-label">{activeSet.tagLabel}</span>}
                  <div className="map-tag-row">
                    {e.tags.map((t) => (
                      <span key={t} className="map-tag">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          );
          return e.link ? (
            <a key={e.id} className="map-card map-card-link" href={e.link} target="_blank" rel="noreferrer">
              {card}
            </a>
          ) : (
            <div key={e.id} className="map-card">{card}</div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div className="empty">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
          </svg>
          <p className="empty-title">No entries match “{query}”</p>
          <p className="empty-sub">Try a different term or clear the search.</p>
        </div>
      )}
    </div>
  );
}
