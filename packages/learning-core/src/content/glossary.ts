import type { GlossaryEntry, LearningReference } from "../schemas.js";

export const SHARED_REFERENCES: Readonly<Record<string, LearningReference>> = {
  iupacGoldBook: {
    id: "ref-iupac-gold-book",
    citation:
      "IUPAC. Compendium of Chemical Terminology, 2nd ed. (the 'Gold Book'), compiled by A. D. McNaught and A. Wilkinson; online version updated by S. J. Chalk (2019-).",
    url: "https://goldbook.iupac.org",
    sourceType: "official_standard",
    verificationNote: "Standard international chemical terminology reference.",
  },
  siBrochure9: {
    id: "ref-si-brochure-9",
    citation:
      "BIPM. The International System of Units (SI), 9th edition (2019, updated 2022), Bureau International des Poids et Mesures.",
    url: "https://www.bipm.org/en/publications/si-brochure",
    sourceType: "official_standard",
    verificationNote:
      "Authoritative definition of the mole, kelvin, Avogadro and Faraday constants.",
  },
  ciaaw2021: {
    id: "ref-ciaaw-2021",
    citation:
      "Prohaska, T. et al. Standard atomic weights of the elements 2021 (IUPAC Technical Report). Pure and Applied Chemistry 94(5), 573-600 (2022).",
    sourceType: "official_standard",
    verificationNote: "Source of abridged standard atomic weights used by simulation-core.",
  },
  ncert11Part1: {
    id: "ref-ncert-11-part-1",
    citation:
      "NCERT. Chemistry Part I, Textbook for Class XI (Units: Some Basic Concepts of Chemistry; Structure of Atom; Chemical Bonding and Molecular Structure).",
    sourceType: "textbook",
    verificationNote: "Standard higher-secondary chemistry reference.",
  },
  ncert11Part2: {
    id: "ref-ncert-11-part-2",
    citation:
      "NCERT. Chemistry Part II, Textbook for Class XI (Units: Thermodynamics; Equilibrium; Redox Reactions; Organic Chemistry — Some Basic Principles and Techniques).",
    sourceType: "textbook",
    verificationNote:
      "Standard higher-secondary equilibrium, thermodynamics and organic reference.",
  },
  ncert12Part1: {
    id: "ref-ncert-12-part-1",
    citation:
      "NCERT. Chemistry Part I, Textbook for Class XII (Units: Solutions; Electrochemistry; Chemical Kinetics).",
    sourceType: "textbook",
    verificationNote:
      "Standard higher-secondary solutions, electrochemistry and kinetics reference.",
  },
  ncertLabManual: {
    id: "ref-ncert-lab-manual",
    citation:
      "NCERT. Laboratory Manual: Chemistry, Classes XI and XII, National Council of Educational Research and Training.",
    sourceType: "laboratory_manual",
    verificationNote:
      "Reference for school and higher-secondary volumetric, qualitative and kinetics practicals.",
  },
  cbse2025Circular: {
    id: "ref-cbse-2025-26",
    citation:
      "CBSE. Secondary and Senior School Curriculum 2025-26, Circular Acad-14/2025, Central Board of Secondary Education.",
    url: "https://cbseacademic.nic.in/web_material/Circulars/2025/14_Circular_2025.pdf",
    sourceType: "curriculum_circular",
    verificationNote: "Topic alignments remain proposed_pending_verification until human review.",
  },
};

export const RAW_GLOSSARY_ENTRIES: ReadonlyArray<GlossaryEntry> = [
  {
    id: "amount-of-substance",
    term: "Amount of substance",
    definition:
      "Base physical quantity proportional to the number of specified elementary entities (atoms, molecules, ions, electrons or formula units) in a sample, defined in the 2019 SI via the fixed Avogadro constant N_A = 6.02214076 × 10^23 mol^-1.",
    chemicalSymbols: ["n", "N_A"],
    units: ["mol", "mmol"],
    relatedConceptIds: ["molar-mass", "molarity", "stoichiometry"],
    relatedExperimentIds: ["standard-solution-preparation", "solution-dilution"],
    references: [SHARED_REFERENCES.siBrochure9!, SHARED_REFERENCES.iupacGoldBook!],
  },
  {
    id: "molar-mass",
    term: "Molar mass",
    definition:
      "Mass of one mole of a substance of specified chemical formula, equal to the mass of the sample divided by its amount of substance (M = m / n).",
    chemicalSymbols: ["M"],
    units: ["g/mol", "kg/mol"],
    relatedConceptIds: ["amount-of-substance", "stoichiometry"],
    relatedExperimentIds: ["standard-solution-preparation"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ciaaw2021!],
  },
  {
    id: "molarity",
    term: "Amount concentration (Molarity)",
    definition:
      "Amount of dissolved solute divided by the total volume of the solution (c = n / V). Because liquid volume changes with temperature, molarity is slightly temperature-dependent.",
    chemicalSymbols: ["c", "M", "[B]"],
    units: ["mol/L", "mol/dm^3", "mmol/L"],
    relatedConceptIds: ["amount-of-substance", "dilution", "standard-solution"],
    relatedExperimentIds: [
      "standard-solution-preparation",
      "solution-dilution",
      "acid-base-titration",
    ],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncert12Part1!],
  },
  {
    id: "dilution",
    term: "Dilution",
    definition:
      "Reduction of solute concentration by adding solvent while conserving the amount of dissolved solute (n = c_1 V_1 = c_2 V_2 when no chemical reaction occurs).",
    chemicalSymbols: ["c_1", "V_1", "c_2", "V_2"],
    units: ["mol/L", "mL", "L"],
    relatedConceptIds: ["molarity", "volumetric-flask"],
    relatedExperimentIds: ["solution-dilution"],
    references: [SHARED_REFERENCES.ncert11Part1!, SHARED_REFERENCES.ncertLabManual!],
  },
  {
    id: "standard-solution",
    term: "Standard solution",
    definition:
      "A solution of accurately known concentration prepared either directly from a weighed primary standard in a calibrated volumetric flask or standardized by titration.",
    chemicalSymbols: ["c"],
    units: ["mol/L"],
    relatedConceptIds: ["molarity", "volumetric-flask", "titration"],
    relatedExperimentIds: ["standard-solution-preparation", "acid-base-titration"],
    references: [SHARED_REFERENCES.ncertLabManual!],
  },
  {
    id: "volumetric-flask",
    term: "Volumetric flask",
    definition:
      "Calibrated flat-bottomed laboratory vessel engineered to contain a single specified liquid volume at a stated reference temperature when the bottom of the meniscus rests on the calibration mark.",
    chemicalSymbols: ["V"],
    units: ["mL", "L"],
    relatedConceptIds: ["standard-solution", "dilution"],
    relatedExperimentIds: ["standard-solution-preparation", "solution-dilution"],
    references: [SHARED_REFERENCES.ncertLabManual!],
  },
  {
    id: "stoichiometry",
    term: "Stoichiometry",
    definition:
      "Quantitative relationship among reactants and products in a balanced chemical equation governed by conservation of atoms of each element and conservation of net electric charge.",
    chemicalSymbols: ["ν_i", "ξ"],
    units: ["mol", "dimensionless"],
    relatedConceptIds: ["amount-of-substance", "limiting-reagent", "theoretical-yield"],
    relatedExperimentIds: ["acid-base-titration", "standard-solution-preparation"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncert11Part1!],
  },
  {
    id: "limiting-reagent",
    term: "Limiting reagent",
    definition:
      "The reactant present in the smallest stoichiometric ratio n_i / |ν_i|, which is completely consumed first in an irreversible reaction and therefore limits the maximum extent of reaction.",
    chemicalSymbols: ["ξ_max"],
    units: ["mol"],
    relatedConceptIds: ["stoichiometry", "theoretical-yield", "percent-yield"],
    relatedExperimentIds: ["acid-base-titration"],
    references: [SHARED_REFERENCES.ncert11Part1!],
  },
  {
    id: "theoretical-yield",
    term: "Theoretical yield",
    definition:
      "Maximum amount or mass of a specified product obtainable from given reactant quantities assuming complete conversion of the limiting reagent according to a single balanced reaction with no side reactions or losses.",
    chemicalSymbols: ["m_theor", "n_theor"],
    units: ["g", "mol"],
    relatedConceptIds: ["limiting-reagent", "percent-yield"],
    relatedExperimentIds: ["standard-solution-preparation"],
    references: [SHARED_REFERENCES.ncert11Part1!],
  },
  {
    id: "percent-yield",
    term: "Percentage yield",
    definition:
      "Ratio of actual isolated product amount (or mass) to theoretical yield expressed as a percentage: (actual / theoretical) × 100 %. Apparent values above 100 % indicate residual solvent or impurities rather than creation of matter.",
    chemicalSymbols: ["% yield"],
    units: ["%"],
    relatedConceptIds: ["theoretical-yield", "limiting-reagent"],
    relatedExperimentIds: ["standard-solution-preparation"],
    references: [SHARED_REFERENCES.ncert11Part1!],
  },
  {
    id: "ph",
    term: "pH",
    definition:
      "Measure of aqueous acidity defined rigorously as pH = -log_10(a_{H+}), approximated in dilute ideal aqueous solutions as -log_10([H+]/(1 mol/L)). At 25 °C with K_w = 1.0 × 10^-14, neutral pure water has pH = 7.00.",
    chemicalSymbols: ["pH", "[H^+]", "a_{H+}"],
    units: ["pH", "dimensionless"],
    relatedConceptIds: ["poh", "acid-dissociation-constant", "acid-base-indicator"],
    relatedExperimentIds: ["ph-and-indicators", "acid-base-titration"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncert11Part2!],
  },
  {
    id: "poh",
    term: "pOH",
    definition:
      "Negative base-10 logarithm of relative hydroxide ion activity or dilute molar concentration: pOH ≈ -log_10([OH^-]/(1 mol/L)). Related to pH by pH + pOH = pK_w (14.00 at 25 °C).",
    chemicalSymbols: ["pOH", "[OH^-]", "K_w"],
    units: ["pOH", "dimensionless"],
    relatedConceptIds: ["ph", "acid-dissociation-constant"],
    relatedExperimentIds: ["ph-and-indicators"],
    references: [SHARED_REFERENCES.ncert11Part2!],
  },
  {
    id: "acid-dissociation-constant",
    term: "Acid dissociation constant",
    definition:
      "Equilibrium constant K_a quantifying partial ionization of a weak acid HA in water (HA ⇌ H^+ + A^-). Larger K_a (smaller pK_a = -log_10 K_a) corresponds to a stronger weak acid.",
    chemicalSymbols: ["K_a", "pK_a"],
    units: ["dimensionless"],
    relatedConceptIds: ["ph", "chemical-equilibrium"],
    relatedExperimentIds: ["ph-and-indicators", "acid-base-titration"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncert11Part2!],
  },
  {
    id: "acid-base-indicator",
    term: "Acid-base indicator",
    definition:
      "Weak organic acid or base whose protonated (HIn) and conjugate-base (In^-) forms exhibit distinct visible absorption colours across a characteristic transition pH interval (typically pK_In ± 1).",
    chemicalSymbols: ["HIn", "In^-", "pK_In"],
    units: ["pH"],
    relatedConceptIds: ["ph", "titration", "equivalence-point"],
    relatedExperimentIds: ["ph-and-indicators", "acid-base-titration"],
    references: [SHARED_REFERENCES.ncert11Part2!, SHARED_REFERENCES.ncertLabManual!],
  },
  {
    id: "titration",
    term: "Titration (Volumetric analysis)",
    definition:
      "Quantitative analytical method in which a titrant of known concentration is delivered from a burette into an analyte solution until chemical equivalence is signalled by an indicator endpoint or pH electrode.",
    chemicalSymbols: ["V_titrant"],
    units: ["mL"],
    relatedConceptIds: ["equivalence-point", "standard-solution", "acid-base-indicator"],
    relatedExperimentIds: ["acid-base-titration"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncertLabManual!],
  },
  {
    id: "equivalence-point",
    term: "Equivalence point vs endpoint",
    definition:
      "The equivalence point is the theoretical stoichiometric point where added titrant chemically equals the analyte; the endpoint is the observable physical change (such as indicator colour shift) used to estimate it.",
    chemicalSymbols: [],
    units: ["mL", "pH"],
    relatedConceptIds: ["titration", "acid-base-indicator"],
    relatedExperimentIds: ["acid-base-titration"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncertLabManual!],
  },
  {
    id: "retention-factor",
    term: "Retention factor (Retardation factor)",
    definition:
      "In planar chromatography, the ratio R_f = d_solute / d_solvent of the distance migrated by the centre of a solute spot to the distance travelled by the solvent front from the origin line ($0 \\le R_f \\le 1$).",
    chemicalSymbols: ["R_f"],
    units: ["dimensionless"],
    relatedConceptIds: [],
    relatedExperimentIds: ["paper-chromatography"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncertLabManual!],
  },
  {
    id: "reaction-rate",
    term: "Rate of chemical reaction",
    definition:
      "Time derivative of reaction extent per unit volume; for a constant-volume homogeneous system, r = (1/ν_i) d[i]/dt, commonly depending on reactant concentrations and temperature via the Arrhenius relation.",
    chemicalSymbols: ["r", "k", "E_a"],
    units: ["mol/(L·s)", "s^-1"],
    relatedConceptIds: ["activation-energy", "chemical-equilibrium"],
    relatedExperimentIds: ["reaction-rates-thiosulfate"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncert12Part1!],
  },
  {
    id: "activation-energy",
    term: "Activation energy",
    definition:
      "Minimum threshold energy barrier characterizing the temperature dependence of a rate coefficient in the empirical Arrhenius equation k = A exp(-E_a / RT).",
    chemicalSymbols: ["E_a", "R", "T"],
    units: ["J/mol", "kJ/mol"],
    relatedConceptIds: ["reaction-rate"],
    relatedExperimentIds: ["reaction-rates-thiosulfate"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncert12Part1!],
  },
  {
    id: "chemical-equilibrium",
    term: "Chemical equilibrium",
    definition:
      "Dynamic macroscopically stationary state of a reversible reaction in a closed system at constant T and P where forward and reverse rates match and Δ_r G = 0.",
    chemicalSymbols: ["K", "Q", "Δ_rG"],
    units: ["dimensionless", "kJ/mol"],
    relatedConceptIds: ["acid-dissociation-constant", "gibbs-energy"],
    relatedExperimentIds: ["chemical-equilibrium-fescn"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncert11Part2!],
  },
  {
    id: "gibbs-energy",
    term: "Gibbs energy of reaction",
    definition:
      "Thermodynamic state function criterion for spontaneity at constant temperature and pressure: Δ_r G = Δ_r H - T Δ_r S = Δ_r G° + RT ln Q, linked at equilibrium to K by Δ_r G° = -RT ln K.",
    chemicalSymbols: ["G", "Δ_rG°", "H", "S"],
    units: ["J/mol", "kJ/mol"],
    relatedConceptIds: ["chemical-equilibrium", "galvanic-cell"],
    relatedExperimentIds: ["chemical-equilibrium-fescn", "electrochemical-cell-daniell"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncert11Part2!],
  },
  {
    id: "galvanic-cell",
    term: "Galvanic (voltaic) cell",
    definition:
      "Electrochemical cell that converts chemical Gibbs energy from a spontaneous redox reaction into electrical work via spatially separated oxidation (anode) and reduction (cathode) half-cells joined by an ionic salt bridge.",
    chemicalSymbols: ["E_cell", "E°_cell", "F"],
    units: ["V"],
    relatedConceptIds: ["gibbs-energy"],
    relatedExperimentIds: ["electrochemical-cell-daniell"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncert12Part1!],
  },
  {
    id: "vsepr-model",
    term: "VSEPR model",
    definition:
      "Valence-Shell Electron-Pair Repulsion qualitative model predicting molecular geometry around a central atom by arranging bonding domains and non-bonding lone pairs to minimize electrostatic repulsion.",
    chemicalSymbols: ["AX_nE_m"],
    units: ["deg"],
    relatedConceptIds: ["functional-group"],
    relatedExperimentIds: ["vsepr-molecular-geometry"],
    references: [SHARED_REFERENCES.ncert11Part1!],
  },
  {
    id: "functional-group",
    term: "Functional group",
    definition:
      "Specific atom or bonded grouping within an organic or biomolecular structure (such as hydroxyl -OH in alcohols, carbonyl >C=O, carboxyl -COOH or aromatic ring) responsible for characteristic reactivity.",
    chemicalSymbols: ["-OH", "-COOH", "-NH_2"],
    units: [],
    relatedConceptIds: ["vsepr-model"],
    relatedExperimentIds: ["vsepr-molecular-geometry", "paper-chromatography"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncert11Part2!],
  },
];
