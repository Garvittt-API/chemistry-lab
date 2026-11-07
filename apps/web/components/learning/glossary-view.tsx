"use client";

import { listGlossaryEntries } from "@virtual-chemistry-lab/learning-core";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export function GlossaryView() {
  const [query, setQuery] = useState("");
  const entries = useMemo(() => listGlossaryEntries(query), [query]);

  return (
    <div className="container">
      <p className="card-meta">
        <Link className="text-link" href="/learn">
          <ArrowLeft size={16} aria-hidden="true" /> Back to learning hub
        </Link>
      </p>

      <div className="learning-filter-bar">
        <label className="learning-field">
          <span>
            <Search size={15} aria-hidden="true" /> Search chemistry terms, symbols or units
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. molarity, pKa, equivalence point, mol/L, Beer-Lambert..."
          />
        </label>
      </div>

      <p className="card-meta" role="status">
        Showing {entries.length} glossary {entries.length === 1 ? "entry" : "entries"}.
      </p>

      <div className="learning-grid-2">
        {entries.map((entry) => (
          <article key={entry.id} id={entry.id} className="learning-card">
            <div className="learning-card-header">
              <h2>{entry.term}</h2>
              {entry.units.length > 0 ? (
                <span className="status-pill">Units: {entry.units.join(", ")}</span>
              ) : null}
            </div>
            {entry.chemicalSymbols.length > 0 ? (
              <p className="card-meta">
                Symbols: <code>{entry.chemicalSymbols.join(", ")}</code>
              </p>
            ) : null}
            <p>{entry.definition}</p>
            {entry.relatedExperimentIds.length > 0 ? (
              <p className="card-meta">
                Related experiments:{" "}
                {entry.relatedExperimentIds.map((expId, idx) => (
                  <span key={expId}>
                    {idx > 0 ? " · " : ""}
                    <Link className="text-link" href={`/experiments/${expId}`}>
                      {expId}
                    </Link>
                  </span>
                ))}
              </p>
            ) : null}
            <p className="card-meta">
              Source: {entry.references.map((r) => r.citation).join("; ")}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
