import type { Metadata } from "next";
import { MoleculeExplorer } from "../../components/visualization/molecule-explorer";

export const metadata: Metadata = {
  title: "Molecule library",
  description:
    "Traceable 3D molecular structures with 2D and text alternatives, geometry annotations and explicit scientific limitations.",
};

export default function MoleculesPage() {
  return (
    <div className="page molecules-page">
      <header className="container page-intro molecule-page-intro">
        <div>
          <p className="eyebrow">Structure you can inspect</p>
          <h1>Molecule library</h1>
        </div>
        <p className="page-intro-copy">
          Explore bonding and three-dimensional shape through traceable models. Experimental
          reference geometries and idealized teaching constructions are clearly distinguished. Every
          model has equivalent 2D and textual information.
        </p>
      </header>
      <main className="container molecule-main">
        <div className="science-integrity-banner">
          <strong>Scientific status</strong>
          <p>
            Ten structures are available. Schema and coordinate checks pass, but all await
            independent qualified scientific review. No electron density, orbital, molecular
            dynamics or quantum-accuracy claims are made.
          </p>
        </div>
        <MoleculeExplorer />
      </main>
    </div>
  );
}
