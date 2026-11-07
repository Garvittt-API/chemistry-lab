"use client";

import { useState } from "react";
import { Box, Shapes } from "lucide-react";
import { getMolecule } from "@virtual-chemistry-lab/molecular-visualization";
import { MoleculeViewer } from "../visualization/molecule-viewer";

const EXAMPLES = ["water", "carbon-dioxide", "methane", "ammonia"] as const;

export function VseprLab() {
  const [moleculeId, setMoleculeId] = useState<(typeof EXAMPLES)[number]>("water");
  const molecule = getMolecule(moleculeId)!;
  return (
    <div className="container vsepr-workspace">
      <div className="science-integrity-banner">
        <Shapes size={22} aria-hidden="true" />
        <div>
          <strong>VSEPR molecular structure view</strong>
          <p>
            Compare electron-domain geometry, atoms-only shape and ideal/reference angles. The
            original experiment record remains the source of the learning procedure; this viewer
            supplies its spatial representation.
          </p>
        </div>
      </div>
      <div className="vsepr-picker segmented-control" aria-label="VSEPR example">
        {EXAMPLES.map((id) => (
          <button
            type="button"
            key={id}
            aria-pressed={moleculeId === id}
            onClick={() => setMoleculeId(id)}
          >
            <Box size={16} />
            {getMolecule(id)!.name}
          </button>
        ))}
      </div>
      <MoleculeViewer molecule={molecule} />
    </div>
  );
}
