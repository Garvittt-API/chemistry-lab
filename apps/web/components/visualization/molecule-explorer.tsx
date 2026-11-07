"use client";

import { useState } from "react";
import { Atom, Search } from "lucide-react";
import { getMoleculeSummary, listMolecules } from "@virtual-chemistry-lab/molecular-visualization";
import { MoleculeViewer } from "./molecule-viewer";

export function MoleculeExplorer() {
  const molecules = listMolecules();
  const [selectedId, setSelectedId] = useState("water");
  const [query, setQuery] = useState("");
  const selected = molecules.find((molecule) => molecule.id === selectedId) ?? molecules[0]!;
  const filtered = molecules.filter((molecule) =>
    `${molecule.name} ${molecule.formula}`.toLowerCase().includes(query.toLowerCase()),
  );
  const summary = getMoleculeSummary(selected.id);
  return (
    <div className="molecule-explorer">
      <aside className="molecule-library" aria-label="Molecule library">
        <label className="molecule-search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search molecules</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or formula"
          />
        </label>
        <p>
          {filtered.length} of {molecules.length} structures
        </p>
        <div className="molecule-list">
          {filtered.map((molecule) => (
            <button
              key={molecule.id}
              type="button"
              className={
                selected.id === molecule.id ? "molecule-list-item selected" : "molecule-list-item"
              }
              aria-pressed={selected.id === molecule.id}
              onClick={() => setSelectedId(molecule.id)}
            >
              <Atom size={20} aria-hidden="true" />
              <span>
                <strong>{molecule.name}</strong>
                <small>
                  {molecule.formula} · {molecule.atoms.length} atoms
                </small>
              </span>
            </button>
          ))}
          {filtered.length === 0 ? <p>No structures match “{query}”.</p> : null}
        </div>
      </aside>
      <div className="molecule-stage">
        <header className="molecule-title">
          <div>
            <p className="eyebrow">Molecular structure</p>
            <h2>
              {selected.name} <span>{selected.formula}</span>
            </h2>
            <p>{selected.description}</p>
          </div>
          <span className="badge badge-demo">Pending scientific review</span>
        </header>
        <MoleculeViewer molecule={selected} />
        <section className="molecule-science-notes" aria-labelledby="science-notes-title">
          <h3 id="science-notes-title">Data, geometry and limitations</h3>
          <dl>
            <div>
              <dt>Structure source</dt>
              <dd>{selected.source.kind.replaceAll("_", " ")}</dd>
            </div>
            <div>
              <dt>Molar mass</dt>
              <dd>{summary.molarMassGramsPerMole.toFixed(3)} g/mol</dd>
            </div>
            <div>
              <dt>Structure version</dt>
              <dd>{selected.structureVersion}</dd>
            </div>
            <div>
              <dt>Schema / model</dt>
              <dd>
                {selected.schemaVersion} / {selected.source.modelId} {selected.source.modelVersion}
              </dd>
            </div>
          </dl>
          <p>{selected.source.coordinateNote}</p>
          {selected.geometry ? (
            <p>
              <strong>{selected.geometry.molecularShape.replaceAll("_", " ")}:</strong>{" "}
              {selected.geometry.explanation}
            </p>
          ) : null}
          <details>
            <summary>Assumptions, limitations and references</summary>
            <h4>Assumptions</h4>
            <ul>
              {selected.source.assumptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h4>Limitations</h4>
            <ul>
              {selected.source.limitations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>{selected.source.citation}</p>
            <ul>
              {selected.source.referenceUrls.map((url) => (
                <li key={url}>
                  <a className="text-link" href={url} target="_blank" rel="noreferrer">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </details>
          <small>
            Molar mass: <code>{summary.molarMassProvenance}</code>. Geometry values come only from
            the declared coordinates; the renderer never recomputes chemistry.
          </small>
        </section>
      </div>
    </div>
  );
}
