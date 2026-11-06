import type { ExperimentRecord } from "@virtual-chemistry-lab/experiment-schema";

import acidBaseTitration from "./acid-base-titration.json";
import basicSpectroscopicInterpretation from "./basic-spectroscopic-interpretation.json";
import chemicalEquilibriumFescn from "./chemical-equilibrium-fescn.json";
import electrochemicalCellDaniell from "./electrochemical-cell-daniell.json";
import flameTestsQualitativeInorganic from "./flame-tests-qualitative-inorganic.json";
import paperChromatography from "./paper-chromatography.json";
import phAndIndicators from "./ph-and-indicators.json";
import reactionRatesThiosulfate from "./reaction-rates-thiosulfate.json";
import solutionDilution from "./solution-dilution.json";
import standardSolutionPreparation from "./standard-solution-preparation.json";
import vseprMolecularGeometry from "./vsepr-molecular-geometry.json";

/**
 * Bundled experiment documents.
 *
 * Each experiment lives in its own JSON file so contributors can add content
 * without understanding the application codebase (docs/experiments/experiment-authoring-guide.md).
 * Add a new experiment by creating a JSON record and registering it here.
 *
 * The documents are untrusted input: the catalog loader validates every record
 * against the versioned schema and checks referential integrity before use.
 */
const experimentDocuments: unknown[] = [
  standardSolutionPreparation,
  solutionDilution,
  acidBaseTitration,
  phAndIndicators,
  paperChromatography,
  reactionRatesThiosulfate,
  chemicalEquilibriumFescn,
  electrochemicalCellDaniell,
  vseprMolecularGeometry,
  flameTestsQualitativeInorganic,
  basicSpectroscopicInterpretation,
];

export default experimentDocuments;

export type { ExperimentRecord };
