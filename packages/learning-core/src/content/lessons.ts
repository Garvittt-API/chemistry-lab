import { LEARNING_SCHEMA_VERSION, type Lesson } from "../schemas.js";
import { SHARED_REFERENCES } from "./glossary.js";

export const RAW_LESSONS: ReadonlyArray<Lesson> = [
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "lesson-moles-molar-mass-units",
    slug: "moles-molar-mass-and-si-units",
    title: "SI Units, Molar Mass and Amount of Substance",
    summary:
      "Connect macroscopic laboratory masses to microscopic chemical entities using SI units, CIAAW standard atomic weights and dimensional analysis.",
    stage: "beginner",
    educationalLevel: "beginner",
    category: "general-chemistry",
    disciplineId: "general-chemistry",
    topicIds: ["stoichiometry-and-mole-concept", "measurement-and-units"],
    estimatedDurationMinutes: 20,
    introduction:
      "Every quantitative measurement in chemistry carries both a numerical value and a unit. Because individual atoms and molecules are far too small to count directly on a balance, chemists relate weighed mass in grams to chemical amount in moles via molar mass.",
    learningObjectives: [
      "State the 2019 SI definition of the mole via the fixed Avogadro constant.",
      "Compute the molar mass of anhydrous and hydrated compounds from standard atomic weights.",
      "Convert accurately between mass (g) and amount of substance (mol) while tracking significant figures.",
    ],
    theoryBlocks: [
      {
        heading: "The Mole as an Exact Counting Unit",
        body: "Since the 2019 revision of the International System of Units (SI), one mole contains exactly 6.02214076 × 10^23 specified elementary entities. Specifying the entity (for example O atoms vs O2 molecules vs CuSO4·5H2O formula units) is essential to avoid factor-of-two or hydration errors.",
        claimKind: "established_fact",
        claimNote: "Exact defining constant in the 9th SI Brochure.",
      },
      {
        heading: "Abridged Standard Atomic Weights in Teaching Calculations",
        body: "Standard atomic weights published by IUPAC/CIAAW reflect normal terrestrial isotopic abundances. Using 5-significant-figure abridged values (for example C = 12.011, O = 15.999, Cu = 63.546) is accurate for routine school and undergraduate volumetric work, though high-precision isotope-ratio metrology requires sample-specific values.",
        claimKind: "model_approximation",
        claimNote: "Assumes normal terrestrial isotopic composition (CIAAW 2021 abridged table).",
      },
    ],
    importantConcepts: [
      "Quantity = numerical value × unit",
      "Avogadro constant N_A = 6.02214076 × 10^23 mol^-1",
      "Hydrate dot notation (CuSO4·5H2O includes five water molecules per formula unit)",
      "Significant-figure retention until final rounding",
    ],
    chemicalEquations: [
      {
        id: "eq-hydrate-dissolution",
        equation: "CuSO4·5H2O(s) -> Cu^2+(aq) + SO4^2-(aq) + 5 H2O(l)",
        description:
          "Dissolving copper(II) sulfate pentahydrate liberates one mole of Cu^2+(aq) per mole of weighed pentahydrate crystal.",
        conditions: "Aqueous dissolution at ambient temperature",
      },
    ],
    glossaryTermIds: ["amount-of-substance", "molar-mass", "standard-solution"],
    formulas: [
      {
        id: "form-amount-from-mass",
        expression: "n = m / M",
        displayForm: "n = m / M",
        description: "Relates amount of substance to sample mass and formula molar mass.",
        variables: [
          { symbol: "n", meaning: "Amount of substance", unit: "mol" },
          { symbol: "m", meaning: "Sample mass", unit: "g" },
          { symbol: "M", meaning: "Molar mass of specified formula", unit: "g/mol" },
        ],
        conditions: ["Chemically pure sample of known formula (including hydration state)."],
        assumptions: ["Terrestrial isotopic abundance matches CIAAW standard atomic weights."],
      },
    ],
    workedExamples: [
      {
        id: "we-na2co3-moles",
        title: "Amount of anhydrous sodium carbonate in a weighed primary standard",
        problem:
          "Calculate the amount of substance in 2.650 g of anhydrous sodium carbonate (Na2CO3).",
        given: [
          "m(Na2CO3) = 2.650 g",
          "A_r(Na) = 22.990, A_r(C) = 12.011, A_r(O) = 15.999 (CIAAW 2021)",
        ],
        steps: [
          "Compute molar mass: M(Na2CO3) = 2(22.990) + 12.011 + 3(15.999) = 105.988 g/mol.",
          "Divide mass by molar mass: n = 2.650 g / 105.988 g/mol = 0.0250028 mol.",
          "Round to 4 significant figures (matching 2.650 g): n = 0.02500 mol.",
        ],
        result: "0.02500",
        unit: "mol",
        precisionNote: "4 significant figures governed by the 4-figure mass reading (2.650 g).",
        isIllustrative: true,
      },
    ],
    diagrams: [],
    relatedExperimentIds: ["standard-solution-preparation", "solution-dilution"],
    relatedAssessmentIds: ["quiz-foundations-solutions"],
    references: [
      SHARED_REFERENCES.siBrochure9!,
      SHARED_REFERENCES.ciaaw2021!,
      SHARED_REFERENCES.ncert11Part1!,
    ],
    furtherReading: [
      "NCERT Class XI Chemistry, Unit 1: Some Basic Concepts of Chemistry.",
      "BIPM SI Brochure (9th ed.), Appendix 2: Practical realization of the definition of the mole.",
    ],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "lesson-concentration-and-dilution",
    slug: "solution-concentration-and-serial-dilution",
    title: "Solution Concentration, Volumetric Glassware and Dilution",
    summary:
      "Master molarity (c = n / V), solute conservation during dilution (c1 V1 = c2 V2), and why volumetric flasks outperform beakers for quantitative work.",
    stage: "beginner",
    educationalLevel: "beginner",
    category: "solutions-and-concentration",
    disciplineId: "general-chemistry",
    topicIds: ["solutions-and-concentration", "laboratory-techniques", "measurement-and-units"],
    estimatedDurationMinutes: 25,
    introduction:
      "Most wet-chemistry reactions are carried out in solution so reactants mix homogeneously and amounts can be metered by volume. Preparing a standard solution or diluting a stock requires distinguishing rough transfer vessels from calibrated volumetric glassware.",
    learningObjectives: [
      "Calculate molar concentration from solute amount and final solution volume.",
      "Apply solute conservation (c1 V1 = c2 V2) using consistent volume units.",
      "Explain why solute is dissolved before making up to the calibration mark in a volumetric flask.",
    ],
    theoryBlocks: [
      {
        heading: "Conservation of Solute Moles in Dilution",
        body: "Adding pure solvent to an aliquot of stock solution increases total volume V while leaving the number of dissolved solute moles n unchanged (provided no precipitation, volatilization or solvent reaction occurs). Therefore n = c1 V1 = c2 V2.",
        claimKind: "established_fact",
      },
      {
        heading: "Volume Additivity and Temperature Caveats",
        body: "Note that V2 represents the final total solution volume read at the volumetric flask mark—NOT necessarily V1 + V_water, because mixing concentrated solutions with water can cause slight volume contraction or expansion, and liquid density varies with temperature.",
        claimKind: "model_approximation",
        claimNote:
          "Dilution equation relates initial aliquot volume V1 to final total solution volume V2.",
      },
    ],
    importantConcepts: [
      "Molarity uses total solution volume in litres, not solvent volume alone",
      "Read the bottom of the aqueous meniscus at eye level to eliminate parallax error",
      "Volumetric flasks are 'to contain' (TC); volumetric pipettes are 'to deliver' (TD)",
    ],
    chemicalEquations: [],
    glossaryTermIds: ["molarity", "dilution", "standard-solution", "volumetric-flask"],
    formulas: [
      {
        id: "form-molarity",
        expression: "c = n / V",
        displayForm: "c = n / V",
        description: "Defines amount concentration (molarity) of a dissolved species.",
        variables: [
          { symbol: "c", meaning: "Molar concentration", unit: "mol/L" },
          { symbol: "n", meaning: "Amount of dissolved solute", unit: "mol" },
          { symbol: "V", meaning: "Total volume of final solution", unit: "L" },
        ],
        conditions: ["Homogeneous solution at specified temperature (commonly 20 °C or 25 °C)."],
        assumptions: ["Complete dissolution without precipitation."],
      },
      {
        id: "form-dilution",
        expression: "c1 * V1 = c2 * V2",
        displayForm: "c₁V₁ = c₂V₂",
        description:
          "Relates stock concentration and aliquot volume to diluted concentration and final volume.",
        variables: [
          { symbol: "c₁", meaning: "Stock concentration", unit: "mol/L" },
          { symbol: "V₁", meaning: "Stock aliquot volume", unit: "mL or L" },
          { symbol: "c₂", meaning: "Final diluted concentration", unit: "mol/L" },
          { symbol: "V₂", meaning: "Final solution volume (V₂ >= V₁)", unit: "same unit as V₁" },
        ],
        conditions: ["Pure solvent added; V1 and V2 expressed in identical volume units."],
        assumptions: ["No chemical reaction removes or generates the tracked solute."],
      },
    ],
    workedExamples: [
      {
        id: "we-cuso4-dilution",
        title: "Ten-fold dilution of 0.500 mol/L CuSO4 stock",
        problem:
          "A student transfers 10.0 mL of 0.500 mol/L CuSO4(aq) into a 100.0 mL volumetric flask and makes up to the calibration mark with deionized water. Find c2.",
        given: ["c1 = 0.500 mol/L", "V1 = 10.0 mL", "V2 = 100.0 mL"],
        steps: [
          "Verify consistent volume units: both V1 and V2 are in mL, and V2 >= V1.",
          "Rearrange c1 V1 = c2 V2 -> c2 = c1 * (V1 / V2).",
          "Substitute: c2 = 0.500 mol/L * (10.0 mL / 100.0 mL) = 0.0500 mol/L.",
        ],
        result: "0.0500",
        unit: "mol/L",
        precisionNote: "3 significant figures limited by c1 (0.500 mol/L) and V1 (10.0 mL).",
        isIllustrative: true,
      },
    ],
    diagrams: [
      {
        id: "diag-dilution-schematic",
        kind: "dilution_schematic",
        title: "Solute Conservation Across a Ten-Fold Volumetric Dilution",
        caption:
          "Transferring an aliquot V1 containing n moles of solute into a larger volumetric flask V2 spreads the same n moles across a greater total volume.",
        textAlternative:
          "Two-stage schematic: on the left, a 10.0 mL aliquot from 0.500 mol/L stock holds 0.00500 mol solute; on the right, making up to 100.0 mL with solvent keeps 0.00500 mol solute, yielding c2 = 0.0500 mol/L.",
        disclosureNote:
          "Schematic teaching diagram; particle counts and blue shading are illustrative.",
      },
    ],
    relatedExperimentIds: ["solution-dilution", "standard-solution-preparation"],
    relatedAssessmentIds: ["quiz-solution-dilution", "quiz-foundations-solutions"],
    references: [SHARED_REFERENCES.ncert12Part1!, SHARED_REFERENCES.ncertLabManual!],
    furtherReading: [
      "NCERT Chemistry Laboratory Manual (Class XI): Preparation of standard solutions.",
    ],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "lesson-acids-bases-ph-indicators",
    slug: "acids-bases-ph-and-indicators",
    title: "Aqueous Acids, Bases, the pH Scale and Indicators",
    summary:
      "Understand strong versus weak monoprotic electrolytes at 25 °C, water autoionization, indicator transition intervals and dilute-solution activity limits.",
    stage: "school",
    educationalLevel: "school",
    category: "acid-base-chemistry",
    disciplineId: "general-chemistry",
    topicIds: ["acids-and-bases", "indicator-foundations", "measurement-and-units"],
    estimatedDurationMinutes: 25,
    introduction:
      "Aqueous acidity spans many orders of magnitude in hydronium ion concentration. Sørensen's logarithmic pH scale compresses this span into readable numbers while acid-base indicators provide rapid visual estimates across characteristic transition ranges.",
    learningObjectives: [
      "Relate [H+], [OH-], pH and pOH at 25 °C using K_w = 1.0 × 10^-14.",
      "Distinguish complete dissociation of strong acids from equilibrium partial ionization of weak acids.",
      "Explain why indicator colour gives a pH range rather than an exact pH reading, and when dilute-solution pH formulas fail.",
    ],
    theoryBlocks: [
      {
        heading: "Autoionization of Water and the Temperature Dependence of Neutral pH",
        body: "Liquid water undergoes slight self-ionization: H2O(l) ⇌ H+(aq) + OH-(aq). At 25 °C, K_w = 1.0 × 10^-14 so neutral water ([H+] = [OH-]) has pH = 7.00. Because autoionization is endothermic, K_w increases at higher temperatures—neutral water at 50 °C has pH < 7 while remaining electrically and chemically neutral!",
        claimKind: "established_fact",
      },
      {
        heading: "Concentration versus Thermodynamic Activity",
        body: "Rigorously, pH = -log10(a_{H+}). Replacing activity a_{H+} by molarity [H+]/(1 mol/L) assumes unit activity coefficients (gamma -> 1), which holds well in dilute solutions (c <= 0.1 mol/L) of low ionic strength but introduces measurable deviations in concentrated acids or brines.",
        claimKind: "model_approximation",
        claimNote:
          "Phase 04 acid-base engine applies dilute-solution ideal-activity equations at 25 °C.",
      },
    ],
    importantConcepts: [
      "Each 1.00 unit decrease in pH corresponds to a ten-fold increase in hydrogen ion activity",
      "Very dilute strong acids (for example 10^-8 mol/L HCl) require coupled water autoionization so pH never exceeds 7.00 at 25 °C",
      "Indicators change colour across roughly pK_In ± 1",
    ],
    chemicalEquations: [
      {
        id: "eq-water-kw",
        equation: "H2O(l) <=> H^+(aq) + OH^-(aq)",
        description:
          "Autoionization equilibrium of water governing the coupling of [H+] and [OH-].",
        conditions: "25 °C conventional K_w = 1.0 × 10^-14",
      },
      {
        id: "eq-weak-acid",
        equation: "CH3COOH(aq) <=> H^+(aq) + CH3COO^-(aq)",
        description:
          "Partial dissociation of acetic acid in aqueous solution (K_a ≈ 1.75 × 10^-5 at 25 °C).",
        conditions: "Dilute aqueous solution at 25 °C",
      },
    ],
    glossaryTermIds: ["ph", "poh", "acid-dissociation-constant", "acid-base-indicator"],
    formulas: [
      {
        id: "form-ph-dilute",
        expression: "pH = -log10([H+]) ; pH + pOH = 14.00 (at 25 °C)",
        displayForm: "pH ≈ −log₁₀([H⁺]/c°),  pH + pOH = 14.00 (25 °C)",
        description:
          "Logarithmic acidity and basicity relations in dilute aqueous solution at 25 °C.",
        variables: [
          { symbol: "[H⁺]", meaning: "Equilibrium hydrogen ion concentration", unit: "mol/L" },
          { symbol: "c°", meaning: "Standard concentration (1 mol/L)", unit: "mol/L" },
          { symbol: "pH", meaning: "Acidity value", unit: "pH" },
          { symbol: "pOH", meaning: "Basicity value", unit: "pOH" },
        ],
        conditions: [
          "Temperature fixed at 25.0 °C (298.15 K).",
          "Dilute aqueous solution (low ionic strength).",
        ],
        assumptions: ["Activity coefficient gamma_i = 1."],
      },
    ],
    workedExamples: [
      {
        id: "we-hcl-ph",
        title: "pH and pOH of 0.010 mol/L hydrochloric acid at 25 °C",
        problem: "Calculate the pH and pOH of a 0.010 mol/L aqueous HCl solution at 25 °C.",
        given: ["c(HCl) = 0.010 mol/L (monoprotic strong acid)", "K_w = 1.0 × 10^-14 at 25 °C"],
        steps: [
          "Since c = 1.0 × 10^-2 mol/L >> 10^-7 mol/L, [H+] = 0.010 mol/L.",
          "Compute pH = -log10(0.010) = 2.00.",
          "Compute pOH = 14.00 - 2.00 = 12.00.",
        ],
        result: "2.00",
        unit: "pH",
        precisionNote:
          "2 decimal places matching 2 significant figures in concentration (0.010 mol/L).",
        isIllustrative: true,
      },
    ],
    diagrams: [
      {
        id: "diag-ph-scale",
        kind: "ph_indicator_scale",
        title: "Aqueous pH Scale (25 °C) and Common Indicator Transition Intervals",
        caption:
          "Comparison of methyl orange (pH 3.1–4.4), bromothymol blue (pH 6.0–7.6) and phenolphthalein (pH 8.2–10.0) transition ranges.",
        textAlternative:
          "Horizontal pH scale from 0 to 14 with neutral 7.00 marked at 25 °C. Methyl orange shifts red to yellow across pH 3.1 to 4.4; bromothymol blue shifts yellow to blue across pH 6.0 to 7.6; phenolphthalein shifts colourless to pink across pH 8.2 to 10.0.",
        disclosureNote:
          "Illustrative colour bars showing literature transition intervals at 25 °C.",
      },
    ],
    relatedExperimentIds: ["ph-and-indicators", "acid-base-titration"],
    relatedAssessmentIds: ["quiz-ph-and-indicators"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncert11Part2!],
    furtherReading: [
      "NCERT Class XI Chemistry, Unit 7: Equilibrium (Ionic Equilibrium in Solution).",
    ],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "lesson-chromatography-and-qualitative-ions",
    slug: "separation-by-chromatography-and-flame-emission",
    title: "Analytical Separation and Qualitative Ion Identification",
    summary:
      "Explore differential partitioning in paper chromatography (Rf values) and characteristic electronic emission lines in qualitative flame tests.",
    stage: "school",
    educationalLevel: "school",
    category: "analytical-chemistry",
    disciplineId: "analytical-chemistry",
    topicIds: ["separation-techniques", "analytical-uncertainty"],
    estimatedDurationMinutes: 20,
    introduction:
      "Before quantifying what is in an unknown mixture, chemists often separate components physically and identify candidate ions or pigments qualitatively. Paper chromatography separates solutes by differential distribution between stationary water trapped on cellulose fibres and a moving solvent, whereas flame tests probe atomic electronic transitions.",
    learningObjectives: [
      "Compute retention factors Rf = d_solute / d_solvent and explain why Rf lies between 0 and 1.",
      "Explain why chromatography baselines must be drawn in graphite pencil rather than ink.",
      "Identify major limitations of naked-eye flame tests, especially sodium D-line masking.",
    ],
    theoryBlocks: [
      {
        heading: "Partitioning and Retention Factor Reproducibility",
        body: "A solute that forms stronger hydrogen-bonding or polar interactions with the stationary aqueous phase moves more slowly than the mobile phase, giving a smaller Rf. Because Rf depends on solvent composition, paper grade, chamber saturation and temperature, authentic reference standards should be co-spotted on the same chromatogram.",
        claimKind: "established_fact",
      },
      {
        heading: "Atomic Emission and Visual Interference in Flame Tests",
        body: "Thermal excitation in a non-luminous Bunsen flame promotes valence electrons of volatile metal chlorides to higher energy levels; radiative relaxation emits photons at characteristic wavelengths (such as crimson for Sr, lilac for K, apple-green for Ba, blue-green for Cu). Trace sodium contamination produces intense 589 nm yellow emission that easily masks potassium unless viewed through cobalt blue glass.",
        claimKind: "established_fact",
      },
    ],
    importantConcepts: [
      "Measure solute travel to the geometric centre of the spot to minimize tailing bias",
      "Remove chromatogram before solvent overruns the top edge",
      "Confirmatory wet chemical or spectroscopic tests are needed when flame colours overlap",
    ],
    chemicalEquations: [],
    glossaryTermIds: ["retention-factor", "functional-group"],
    formulas: [
      {
        id: "form-rf",
        expression: "Rf = d_solute / d_solvent",
        displayForm: "R_f = d_solute / d_solvent",
        description: "Dimensionless migration ratio in planar chromatography.",
        variables: [
          { symbol: "R_f", meaning: "Retention (retardation) factor", unit: "dimensionless" },
          { symbol: "d_solute", meaning: "Distance from origin line to spot centre", unit: "cm" },
          {
            symbol: "d_solvent",
            meaning: "Distance from origin line to solvent front",
            unit: "cm",
          },
        ],
        conditions: ["Closed, vapour-saturated developing chamber; identical distance units."],
        assumptions: ["Uniform capillary flow prior to solvent reaching top edge."],
      },
    ],
    workedExamples: [
      {
        id: "we-rf-pigment",
        title: "Retention factor of a separated pigment spot",
        problem:
          "On a developed paper chromatogram, the solvent front rises 8.40 cm above the pencil origin while a blue dye spot centre rises 5.46 cm. Calculate Rf.",
        given: ["d_solute = 5.46 cm", "d_solvent = 8.40 cm"],
        steps: [
          "Verify 0 <= d_solute <= d_solvent and matching units (cm).",
          "Compute Rf = 5.46 cm / 8.40 cm = 0.650.",
        ],
        result: "0.650",
        unit: "dimensionless",
        precisionNote: "Dimensionless ratio reported to 3 significant figures.",
        isIllustrative: true,
      },
    ],
    diagrams: [],
    relatedExperimentIds: ["paper-chromatography", "flame-tests-qualitative-inorganic"],
    relatedAssessmentIds: ["quiz-chromatography-and-qualitative"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncertLabManual!],
    furtherReading: [
      "NCERT Class XI Chemistry, Unit 12: Purification and Characterization of Organic Compounds.",
    ],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "lesson-stoichiometry-and-volumetric-titration",
    slug: "stoichiometry-limiting-reagent-and-titration",
    title: "Exact Reaction Balancing, Limiting Reagent and Acid-Base Titration",
    summary:
      "Apply atom and electric-charge conservation to balance chemical equations, determine limiting reagents and interpret volumetric titration curves.",
    stage: "intermediate",
    educationalLevel: "higher-secondary",
    category: "analytical-chemistry",
    disciplineId: "analytical-chemistry",
    topicIds: ["volumetric-analysis", "acids-and-bases", "indicator-foundations"],
    estimatedDurationMinutes: 30,
    introduction:
      "Quantitative volumetric analysis rests on exact stoichiometric ratios. Whether neutralizing diprotic oxalic acid with sodium hydroxide or evaluating yield in synthesis, conservation of atoms and net charge determines the exact molar equivalence.",
    learningObjectives: [
      "Balance molecular and ionic equations conserving every element and net electric charge.",
      "Identify the limiting reagent and compute theoretical and percentage yields.",
      "Select an indicator whose transition pH range matches the steep equivalence region of an acid-base titration.",
    ],
    theoryBlocks: [
      {
        heading: "Conservation Laws Admit Zero Floating Tolerance",
        body: "In closed non-nuclear chemical reactions, every element's atom count and the total electric charge on reactants equal those on products exactly. A valid balanced equation has positive integer stoichiometric coefficients reduced to lowest terms.",
        claimKind: "established_fact",
      },
      {
        heading: "Matching Indicator Transition Range to Equivalence pH",
        body: "Strong acid + strong base titrations have equivalence at pH 7.00 (25 °C) with a steep jump spanning roughly pH 4–10. Weak acid + strong base titrations hydrolyse at equivalence (A^- + H2O ⇌ HA + OH^-) producing an alkaline equivalence point (typically pH 8.5–9.0), making phenolphthalein appropriate while methyl orange would turn prematurely.",
        claimKind: "established_fact",
      },
    ],
    importantConcepts: [
      "Concordant titres (typically agreeing within ±0.05 to ±0.10 mL) exclude the rough pilot run",
      "Never apply naive M1 V1 = M2 V2 without accounting for stoichiometric ratio ν_acid : ν_base",
      "Percentage yield > 100 % signals incomplete drying or impurity, never mass creation",
    ],
    chemicalEquations: [
      {
        id: "eq-oxalic-naoh",
        equation: "H2C2O4(aq) + 2 NaOH(aq) -> Na2C2O4(aq) + 2 H2O(l)",
        description:
          "Stoichiometric 1 : 2 reaction between diprotic oxalic acid and sodium hydroxide.",
      },
    ],
    glossaryTermIds: [
      "stoichiometry",
      "limiting-reagent",
      "theoretical-yield",
      "percent-yield",
      "titration",
      "equivalence-point",
    ],
    formulas: [
      {
        id: "form-titration-equivalence",
        expression: "n_analyte / nu_analyte = n_titrant / nu_titrant",
        displayForm: "(c_A V_A) / ν_A = (c_B V_B) / ν_B",
        description: "Stoichiometric equivalence condition relating analyte and titrant amounts.",
        variables: [
          {
            symbol: "c_A, c_B",
            meaning: "Analyte and titrant molar concentrations",
            unit: "mol/L",
          },
          {
            symbol: "V_A, V_B",
            meaning: "Analyte pipette volume and concordant titrant volume",
            unit: "mL",
          },
          {
            symbol: "ν_A, ν_B",
            meaning: "Balanced stoichiometric coefficients",
            unit: "dimensionless",
          },
        ],
        conditions: ["Complete, single quantitative reaction at the equivalence point."],
        assumptions: ["Negligible indicator titration blank error."],
      },
    ],
    workedExamples: [
      {
        id: "we-oxalic-titration",
        title: "Standardizing NaOH against primary-standard oxalic acid",
        problem:
          "20.00 mL of 0.0500 mol/L H2C2O4(aq) requires a concordant mean burette volume of 19.60 mL of NaOH(aq) to reach the phenolphthalein endpoint. Find c(NaOH).",
        given: [
          "V(H2C2O4) = 20.00 mL = 0.02000 L",
          "c(H2C2O4) = 0.0500 mol/L",
          "V(NaOH) = 19.60 mL = 0.01960 L",
          "Balanced ratio: 1 mol H2C2O4 reacts with 2 mol NaOH",
        ],
        steps: [
          "n(H2C2O4) = 0.0500 mol/L × 0.02000 L = 0.001000 mol.",
          "By 1:2 stoichiometry, n(NaOH) = 2 × 0.001000 mol = 0.002000 mol.",
          "c(NaOH) = 0.002000 mol / 0.01960 L = 0.10204 mol/L -> 0.102 mol/L (3 sig figs).",
        ],
        result: "0.102",
        unit: "mol/L",
        precisionNote: "3 significant figures governed by 0.0500 mol/L oxalic acid concentration.",
        isIllustrative: true,
      },
    ],
    diagrams: [
      {
        id: "diag-titration-curve",
        kind: "titration_curve_schematic",
        title: "Weak Acid–Strong Base Titration Curve and Phenolphthalein Window",
        caption:
          "Equivalence occurs above pH 7 due to conjugate-base hydrolysis; the phenolphthalein transition zone intersects the steep vertical jump.",
        textAlternative:
          "Plot of pH (0–14) versus added NaOH volume (mL): gradual buffer region near pH 4.7, sharp vertical rise from pH 7 to 10.5 at 25 mL equivalence with equivalence point at pH 8.7 inside the shaded phenolphthalein pH 8.2–10.0 band.",
        disclosureNote:
          "Schematic titration profile for monoprotic weak acid titrated with strong base at 25 °C.",
      },
    ],
    relatedExperimentIds: ["acid-base-titration", "standard-solution-preparation"],
    relatedAssessmentIds: ["quiz-stoichiometry-and-titration"],
    references: [SHARED_REFERENCES.ncert11Part1!, SHARED_REFERENCES.ncertLabManual!],
    furtherReading: [
      "NCERT Chemistry Laboratory Manual (Class XII): Quantitative Estimation (Volumetric Analysis).",
    ],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "lesson-chemical-kinetics-rate-laws",
    slug: "chemical-kinetics-and-temperature-dependence",
    title: "Chemical Kinetics: Rate Laws, Clock Methods and Activation Energy",
    summary:
      "Relate macroscopic reaction times (1/t) in fixed-extent clock experiments to initial concentrations and temperature via collision theory and the Arrhenius equation.",
    stage: "intermediate",
    educationalLevel: "higher-secondary",
    category: "chemical-kinetics",
    disciplineId: "physical-chemistry",
    topicIds: ["chemical-kinetics"],
    estimatedDurationMinutes: 25,
    introduction:
      "Thermodynamics tells us whether a reaction can proceed spontaneously, whereas chemical kinetics governs how fast it happens. In the classic sodium thiosulfate–acid turbidity experiment, timing when a fixed threshold of colloidal sulfur obscures a mark provides a direct window into initial reaction rate.",
    learningObjectives: [
      "Write differential rate expressions normalized by stoichiometric coefficients.",
      "Explain when reciprocal threshold time (1/t) approximates relative initial reaction rate.",
      "Interpret temperature effects on rate constants via the Arrhenius equation k = A exp(-E_a / RT).",
    ],
    theoryBlocks: [
      {
        heading: "Fixed-Extent Turbidity Approximation (r_initial ∝ 1/t)",
        body: "When a small, constant amount Δn_S of elemental sulfur is required to obscure an optical cross mark at constant path length, the average rate up to obscuration is Δ[S]/Δt. Because Δ[S] is fixed across runs in identical beakers, 1/t is proportional to average initial rate—provided Δ[S] consumes only a small fraction of the limiting reactant.",
        claimKind: "model_approximation",
        claimNote:
          "Visual endpoint assumes reproducible lighting, beaker geometry and nucleation behaviour.",
      },
      {
        heading: "Arrhenius Exponential Sensitivity to Temperature",
        body: "Increasing temperature raises the fraction of molecular collisions whose relative kinetic energy exceeds activation energy E_a, causing rate constant k to rise exponentially with T according to ln k = ln A - E_a / (RT).",
        claimKind: "established_fact",
      },
    ],
    importantConcepts: [
      "Reaction orders must be determined experimentally, never assumed from overall stoichiometry",
      "Control temperature strictly when varying concentration, and vice versa",
      "Sulfur dioxide (SO2) evolved in acid–thiosulfate runs is a respiratory irritant: work small-scale in well-ventilated spaces",
    ],
    chemicalEquations: [
      {
        id: "eq-thiosulfate-acid",
        equation: "S2O3^2-(aq) + 2 H^+(aq) -> S(s) + SO2(aq) + H2O(l)",
        description:
          "Acid-induced disproportionation of thiosulfate forming colloidal sulfur and aqueous sulfur dioxide.",
      },
    ],
    glossaryTermIds: ["reaction-rate", "activation-energy"],
    formulas: [
      {
        id: "form-arrhenius-two-point",
        expression: "ln(k2 / k1) = (Ea / R) * (1/T1 - 1/T2)",
        displayForm: "ln(k₂/k₁) = (Eₐ / R)(1/T₁ − 1/T₂)",
        description:
          "Two-temperature integrated Arrhenius relation using absolute temperatures in kelvin.",
        variables: [
          {
            symbol: "k₁, k₂",
            meaning: "Rate constants at temperatures T₁ and T₂",
            unit: "same rate-constant unit",
          },
          { symbol: "Eₐ", meaning: "Activation energy", unit: "J/mol" },
          { symbol: "R", meaning: "Molar gas constant (8.314462618 J/(mol·K))", unit: "J/(mol·K)" },
          { symbol: "T₁, T₂", meaning: "Thermodynamic temperatures", unit: "K" },
        ],
        conditions: [
          "Constant E_a and pre-exponential factor A over interval [T1, T2]; T in kelvin, never °C.",
        ],
        assumptions: ["Single rate-determining pathway across the studied temperature window."],
      },
    ],
    workedExamples: [
      {
        id: "we-arrhenius",
        title: "Estimating activation energy from two rate constants",
        problem:
          "A reaction's rate constant doubles (k2 / k1 = 2.00) when temperature rises from 298.15 K (25.0 °C) to 308.15 K (35.0 °C). Estimate E_a in kJ/mol.",
        given: ["k2 / k1 = 2.00", "T1 = 298.15 K", "T2 = 308.15 K", "R = 8.3145 J/(mol·K)"],
        steps: [
          "Compute (1/T1 - 1/T2) = (308.15 - 298.15) / (298.15 × 308.15) = 10.00 / 91875.1 K^-1 = 1.0884 × 10^-4 K^-1.",
          "Rearrange: E_a = R * ln(2.00) / (1.0884 × 10^-4 K^-1).",
          "Substitute: E_a = 8.3145 × 0.69315 / (1.0884 × 10^-4) = 5.295 × 10^4 J/mol = 53.0 kJ/mol.",
        ],
        result: "53.0",
        unit: "kJ/mol",
        precisionNote: "3 significant figures.",
        isIllustrative: true,
      },
    ],
    diagrams: [
      {
        id: "diag-energy-profile",
        kind: "reaction_energy_profile",
        title: "Reaction Coordinate Profile Showing Activation Barrier E_a and Reaction Enthalpy",
        caption:
          "Reactants must surmount the transition-state barrier E_a regardless of whether overall ΔH is negative or positive.",
        textAlternative:
          "Potential energy curve along reaction progress: reactants start at baseline energy, rise to a peak transition state labelled E_a above reactants, then descend to products at lower energy (ΔH < 0).",
        disclosureNote:
          "Qualitative conceptual energy profile; axes are not drawn to numerical scale.",
      },
    ],
    relatedExperimentIds: ["reaction-rates-thiosulfate"],
    relatedAssessmentIds: ["quiz-kinetics-and-equilibrium"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncert12Part1!],
    furtherReading: ["NCERT Class XII Chemistry, Unit 3: Chemical Kinetics."],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "lesson-equilibrium-and-thermodynamics",
    slug: "chemical-equilibrium-le-chatelier-and-gibbs-energy",
    title: "Chemical Equilibrium, Reaction Quotient and Thermodynamic Driving Force",
    summary:
      "Connect dynamic reversible equilibrium (Fe^3+ + SCN^- ⇌ [Fe(SCN)]^2+) to reaction quotient Q, equilibrium constant K and Gibbs energy Δ_rG.",
    stage: "college",
    educationalLevel: "undergraduate",
    category: "thermodynamics",
    disciplineId: "physical-chemistry",
    topicIds: ["chemical-equilibrium", "thermodynamics"],
    estimatedDurationMinutes: 25,
    introduction:
      "Many inorganic and biochemical reactions reach a dynamic balance where reactants and products coexist. Comparing the instantaneous reaction quotient Q against the thermodynamic equilibrium constant K predicts the direction of net shift without guesswork.",
    learningObjectives: [
      "Compare reaction quotient Q with K to predict net forward or reverse reaction after concentration perturbations.",
      "Distinguish perturbations that change Q (adding/removing species, dilution) from temperature changes that alter K itself.",
      "Relate standard Gibbs energy change Δ_rG° to K via Δ_rG° = -RT ln K.",
    ],
    theoryBlocks: [
      {
        heading: "Why Dilution Shifts Equilibria with Unequal Aqueous Stoichiometry",
        body: "In Fe^3+(aq) + SCN^-(aq) ⇌ [Fe(SCN)]^2+(aq), doubling total volume halves each molarity, so Q_c = ([FeSCN^2+]/2) / (([Fe^3+]/2)([SCN^-]/2)) = 2 K_c > K_c. Because Q_c now exceeds K_c, net dissociation occurs toward Fe^3+ + SCN^- beyond simple colour dilution.",
        claimKind: "established_fact",
      },
      {
        heading: "Higher Thiocyanate Complexes in Concentrated Solutions",
        body: "Treating blood-red iron(III)–thiocyanate solutions strictly as a 1:1 complex [Fe(SCN)]^2+ is a good model at low [SCN^-], whereas high thiocyanate concentrations form [Fe(SCN)2]^+ and higher complexes.",
        claimKind: "model_approximation",
        claimNote:
          "1:1 complexation model applies best in dilute thiocyanate excess Fe^3+ conditions.",
      },
    ],
    importantConcepts: [
      "Q < K drives net forward reaction; Q > K drives net reverse reaction; Q = K is equilibrium",
      "Adding a competitive ligand such as F^- or C2O4^2- sequesters Fe^3+ and shifts [Fe(SCN)]^2+ toward dissociation",
      "Only temperature changes the thermodynamic equilibrium constant K",
    ],
    chemicalEquations: [
      {
        id: "eq-fescn-complex",
        equation: "Fe^3+(aq) + SCN^-(aq) <=> [Fe(SCN)]^2+(aq)",
        description:
          "Reversible formation of blood-red monothiocyanatoiron(III) complex in acidic aqueous solution.",
      },
    ],
    glossaryTermIds: ["chemical-equilibrium", "gibbs-energy"],
    formulas: [
      {
        id: "form-gibbs-equilibrium",
        expression: "Delta_r G = Delta_r G0 + R * T * ln(Q) ; Delta_r G0 = -R * T * ln(K)",
        displayForm: "ΔᵣG = ΔᵣG° + RT ln Q,   ΔᵣG° = −RT ln K",
        description:
          "Thermodynamic criterion linking Gibbs energy change to reaction quotient and equilibrium constant.",
        variables: [
          { symbol: "ΔᵣG", meaning: "Reaction Gibbs energy at composition Q", unit: "J/mol" },
          { symbol: "ΔᵣG°", meaning: "Standard reaction Gibbs energy", unit: "J/mol" },
          { symbol: "R", meaning: "Molar gas constant (8.31446 J/(mol·K))", unit: "J/(mol·K)" },
          { symbol: "T", meaning: "Absolute temperature", unit: "K" },
          {
            symbol: "Q, K",
            meaning: "Dimensionless activity quotient and equilibrium constant",
            unit: "dimensionless",
          },
        ],
        conditions: ["Constant temperature T and pressure P in a closed system."],
        assumptions: [
          "Activities approximated by c_i / c° only in dilute low-ionic-strength media.",
        ],
      },
    ],
    workedExamples: [
      {
        id: "we-gibbs-from-k",
        title: "Standard Gibbs energy of FeSCN^2+ formation at 298.15 K",
        problem:
          "Taking an illustrative formation constant K = 1.40 × 10^2 for [Fe(SCN)]^2+ at 298.15 K, compute Δ_rG° in kJ/mol.",
        given: ["K = 140", "T = 298.15 K", "R = 8.31446 J/(mol·K)"],
        steps: [
          "Compute ln(140) = 4.9416.",
          "Δ_rG° = -(8.31446 J/(mol·K))(298.15 K)(4.9416) = -12250 J/mol = -12.3 kJ/mol.",
        ],
        result: "-12.3",
        unit: "kJ/mol",
        precisionNote:
          "3 significant figures; negative sign indicates spontaneous formation from standard states.",
        isIllustrative: true,
      },
    ],
    diagrams: [],
    relatedExperimentIds: ["chemical-equilibrium-fescn"],
    relatedAssessmentIds: ["quiz-kinetics-and-equilibrium"],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncert11Part2!],
    furtherReading: ["NCERT Class XI Chemistry, Units 6 & 7: Thermodynamics and Equilibrium."],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "lesson-electrochemistry-daniell-cell",
    slug: "redox-half-cells-and-the-daniell-cell",
    title: "Electrochemistry: Galvanic Cells, Electrode Potentials and the Nernst Relation",
    summary:
      "Trace electron flow, ion migration across the salt bridge and concentration-dependent cell EMF in the Zn | Zn^2+ || Cu^2+ | Cu Daniell cell.",
    stage: "college",
    educationalLevel: "undergraduate",
    category: "electrochemistry",
    disciplineId: "electrochemistry",
    topicIds: ["galvanic-cells", "electrode-potentials"],
    estimatedDurationMinutes: 25,
    introduction:
      "Separating spontaneous oxidation and reduction into two half-cells connected by a metallic wire and an ionic salt bridge harnesses chemical Gibbs energy as measurable electrical potential.",
    learningObjectives: [
      "Identify anode (oxidation) and cathode (reduction) in a galvanic cell using IUPAC cell notation.",
      "Compute standard cell potential E°_cell = E°_cathode - E°_anode and relate it to Δ_rG° = -nFE°_cell.",
      "Predict how changing [Zn^2+] or [Cu^2+] shifts open-circuit EMF via the Nernst equation.",
    ],
    theoryBlocks: [
      {
        heading: "Role of the Salt Bridge and Open-Circuit Measurement",
        body: "Electrons travel through the external wire from the zinc anode to the copper cathode, while inert ions in the salt bridge migrate to preserve electroneutrality in each half-cell. Measuring true electromotive force (EMF) requires a high-impedance digital voltmeter so negligible current is drawn and overpotentials/IR drop remain minimal.",
        claimKind: "established_fact",
      },
      {
        heading: "Dilute-Concentration Nernst Equation",
        body: "Replacing ion activities a(Zn^2+)/a(Cu^2+) with molar ratio [Zn^2+]/[Cu^2+] works well for symmetric 2+/2+ electrolytes at moderate concentrations, though liquid-junction potentials across the salt bridge introduce a few millivolts of uncertainty.",
        claimKind: "model_approximation",
        claimNote:
          "Assumes equal activity coefficients γ(Zn^2+) ≈ γ(Cu^2+) and negligible liquid-junction potential.",
      },
    ],
    importantConcepts: [
      "Oxidation always occurs at the anode; reduction always occurs at the cathode",
      "IUPAC notation: Zn(s) | Zn^2+(aq) || Cu^2+(aq) | Cu(s) places anode on the left and cathode on the right",
      "At 25 °C with n = 2 electrons, a 10-fold increase in [Zn^2+]/[Cu^2+] lowers E_cell by ~29.6 mV",
    ],
    chemicalEquations: [
      {
        id: "eq-daniell-overall",
        equation: "Zn(s) + Cu^2+(aq) -> Zn^2+(aq) + Cu(s)",
        description:
          "Two-electron spontaneous cell reaction of the Daniell galvanic cell (E°_cell ≈ +1.10 V at 25 °C).",
      },
    ],
    glossaryTermIds: ["galvanic-cell", "gibbs-energy"],
    formulas: [
      {
        id: "form-nernst",
        expression: "E_cell = E0_cell - (R * T / (n * F)) * ln(Q)",
        displayForm: "E_cell = E°_cell − (RT / nF) ln Q",
        description: "Nernst equation relating zero-current cell potential to reaction quotient Q.",
        variables: [
          { symbol: "E_cell", meaning: "Cell potential", unit: "V" },
          { symbol: "E°_cell", meaning: "Standard cell potential", unit: "V" },
          {
            symbol: "n",
            meaning: "Stoichiometric electron number (2 for Daniell cell)",
            unit: "dimensionless",
          },
          { symbol: "F", meaning: "Faraday constant (96485.33212 C/mol)", unit: "C/mol" },
          {
            symbol: "Q",
            meaning: "Reaction quotient [Zn²⁺]/[Cu²⁺] (ideal approximation)",
            unit: "dimensionless",
          },
        ],
        conditions: ["Zero-current (high-impedance) potential reading at temperature T."],
        assumptions: ["Negligible liquid-junction potential; ideal dilute activity ratio."],
      },
    ],
    workedExamples: [
      {
        id: "we-daniell-nernst",
        title: "Cell potential when [Zn^2+] = 0.10 mol/L and [Cu^2+] = 1.0 mol/L at 298.15 K",
        problem:
          "Given E°(Cu^2+/Cu) = +0.34 V and E°(Zn^2+/Zn) = -0.76 V at 298.15 K, find E_cell when [Zn^2+] = 0.10 mol/L and [Cu^2+] = 1.0 mol/L.",
        given: [
          "E°_cell = 0.34 - (-0.76) = 1.10 V",
          "n = 2",
          "Q = 0.10 / 1.0 = 0.10",
          "T = 298.15 K",
        ],
        steps: [
          "At 298.15 K, (RT ln 10) / F = 0.05916 V.",
          "E_cell = 1.10 V - (0.05916 V / 2) × log10(0.10) = 1.10 V - 0.02958 V × (-1) = 1.13 V.",
        ],
        result: "1.13",
        unit: "V",
        precisionNote: "2 decimal places matching two-decimal standard electrode potentials.",
        isIllustrative: true,
      },
    ],
    diagrams: [
      {
        id: "diag-daniell-cell",
        kind: "galvanic_cell_schematic",
        title: "Daniell Galvanic Cell Architecture: Zn(s) | Zn^2+(aq) || Cu^2+(aq) | Cu(s)",
        caption:
          "Electrons move from the zinc anode through the voltmeter to the copper cathode while anions and cations in the salt bridge maintain charge balance.",
        textAlternative:
          "Left beaker holds Zn electrode in ZnSO4(aq) (anode, oxidation Zn -> Zn^2+ + 2e^-); right beaker holds Cu electrode in CuSO4(aq) (cathode, reduction Cu^2+ + 2e^- -> Cu); U-tube salt bridge links solutions and top wire with voltmeter indicates e^- flow left to right.",
        disclosureNote:
          "Schematic cell diagram; ion hydration shells and junction potentials are not depicted.",
      },
    ],
    relatedExperimentIds: ["electrochemical-cell-daniell"],
    relatedAssessmentIds: ["quiz-electrochemistry-daniell"],
    references: [
      SHARED_REFERENCES.siBrochure9!,
      SHARED_REFERENCES.iupacGoldBook!,
      SHARED_REFERENCES.ncert12Part1!,
    ],
    furtherReading: ["NCERT Class XII Chemistry, Unit 2: Electrochemistry."],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "lesson-vsepr-and-organic-functional-structures",
    slug: "molecular-geometry-vsepr-and-organic-structures",
    title: "3D Molecular Geometry, VSEPR Theory and Organic Functional Groups",
    summary:
      "Predict electron-domain and molecular geometries (CO2, CH4, NH3, H2O) and extend 3D bonding concepts to alcohols (methanol, ethanol) and aromatic benzene.",
    stage: "college",
    educationalLevel: "undergraduate",
    category: "organic-chemistry",
    disciplineId: "general-chemistry",
    topicIds: ["structure-and-bonding"],
    estimatedDurationMinutes: 25,
    introduction:
      "Flat structural formulas hide the three-dimensional geometry that governs dipole moments, boiling points and biochemical recognition. Combining VSEPR electron-domain reasoning with experimental bond angles reveals both the power and limits of simple localized bonding models.",
    learningObjectives: [
      "Distinguish electron-domain geometry from molecular shape when lone pairs are present (AX4 vs AX3E vs AX2E2).",
      "Explain why lone-pair repulsion compresses H–N–H (106.7°) and H–O–H (104.5°) below the ideal tetrahedral angle (109.5°).",
      "Compare sp^3 tetrahedral alcohol centres in methanol/ethanol with planar delocalized aromatic bonding in benzene.",
    ],
    theoryBlocks: [
      {
        heading: "Lone-Pair Compression of Tetrahedral Angles",
        body: "Methane (CH4, AX4), ammonia (NH3, AX3E) and water (H2O, AX2E2) all have four valence electron domains around the central atom, giving tetrahedral electron-domain geometry. Because non-bonding lone pairs occupy greater angular volume near the central nucleus than shared bonding pairs, bond angles decrease in the order CH4 (109.5°) > NH3 (106.7°) > H2O (104.5°).",
        claimKind: "established_fact",
      },
      {
        heading: "Delocalization in Benzene Beyond Localized Double Bonds",
        body: "In benzene (C6H6), all six carbon–carbon bonds have equal length (~1.397 Å), intermediate between typical C–C single and C=C double bonds, with 120° planar hexagonal angles. Representing benzene as alternating single/double Kekulé bonds is a convenient bookkeeping shorthand, whereas true bonding involves pi-electron delocalization.",
        claimKind: "model_approximation",
        claimNote:
          "Phase 06 molecular viewer explicitly labels aromatic bond order without claiming quantum electron-density surfaces.",
      },
    ],
    importantConcepts: [
      "Multiple bonds (C=O in CO2) count as a single electron domain in VSEPR",
      "Symmetry can cancel individual bond dipoles (linear CO2 has zero net dipole; bent H2O is strongly polar)",
      "Hydroxyl (-OH) functional groups in methanol and ethanol enable intermolecular hydrogen bonding",
    ],
    chemicalEquations: [],
    glossaryTermIds: ["vsepr-model", "functional-group"],
    formulas: [],
    workedExamples: [
      {
        id: "we-vsepr-nh3",
        title: "Classifying ammonia (NH3) by VSEPR notation",
        problem:
          "Determine the VSEPR class, electron-domain geometry and molecular geometry of ammonia (NH3), and compare its bond angle with ideal tetrahedral geometry.",
        given: [
          "Central N has 5 valence electrons; 3 H atoms contribute 1 electron each -> 8 valence electrons (4 pairs).",
        ],
        steps: [
          "Three N–H single bonds form 3 bonding domains (X_3); one non-bonding pair remains on N (E_1) -> class AX3E.",
          "4 total domains adopt a tetrahedral electron-domain arrangement.",
          "Atoms-only molecular shape is trigonal pyramidal, with lone-pair repulsion compressing ∠H–N–H from 109.5° to ~106.7°.",
        ],
        result: "AX3E (trigonal pyramidal, ~106.7°)",
        unit: "deg",
        precisionNote: "Experimental gas-phase NIST reference angle is 106.7°.",
        isIllustrative: true,
      },
    ],
    diagrams: [
      {
        id: "diag-vsepr-geometries",
        kind: "vsepr_geometries",
        title: "Comparison of AX2, AX4, AX3E and AX2E2 Molecular Shapes",
        caption:
          "Progression from linear CO2 (180°) through tetrahedral CH4 (109.5°), trigonal pyramidal NH3 (106.7°) and bent H2O (104.5°).",
        textAlternative:
          "Four panels comparing CO2 (linear, 180°), CH4 (tetrahedral, 109.5°), NH3 (trigonal pyramidal with 1 lone pair, 106.7°) and H2O (bent with 2 lone pairs, 104.5°).",
        disclosureNote:
          "2D schematic wedge diagram; inspect full 3D coordinates in the Molecule Library.",
      },
    ],
    relatedExperimentIds: ["vsepr-molecular-geometry"],
    relatedAssessmentIds: ["quiz-vsepr-and-structure"],
    references: [SHARED_REFERENCES.ncert11Part1!, SHARED_REFERENCES.ncert11Part2!],
    furtherReading: ["NCERT Class XI Chemistry, Unit 4: Chemical Bonding and Molecular Structure."],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "lesson-advanced-uncertainty-and-model-limits",
    slug: "analytical-uncertainty-conservation-and-activity-limits",
    title: "Advanced Seminar: Conservation Nullspaces, Activity Limits and Volumetric Uncertainty",
    summary:
      "Examine why exact rational arithmetic is required for stoichiometric conservation, where dilute-solution models break down, and how glassware tolerances propagate into analytical results.",
    stage: "advanced",
    educationalLevel: "postgraduate",
    category: "physical-chemistry",
    disciplineId: "analytical-chemistry",
    topicIds: ["analytical-uncertainty", "volumetric-analysis", "acids-and-bases"],
    estimatedDurationMinutes: 30,
    introduction:
      "Advanced laboratory practice and scientific computing require knowing the exact mathematical domain of every model. Treating idealized equations outside their validity regime—or confusing numerical simulation outputs with physical measurements—is a primary source of scientific error.",
    learningObjectives: [
      "Formulate chemical equation balancing as the integer nullspace of an element-and-charge composition matrix A ν = 0.",
      "Diagnose when multi-pathway reactions have nullity > 1 (non-unique stoichiometric combinations).",
      "Propagate relative uncertainties across volumetric dilution and titration formulas.",
    ],
    theoryBlocks: [
      {
        heading: "Matrix Nullspace Structure of Chemical Conservation",
        body: "For s species across e elements plus net charge, the (e+1) × s composition matrix A assigns negative entries to reactants and positive entries to products (or signed stoichiometric coefficients). A single independent reaction corresponds to a 1-dimensional rational nullspace; if nullity(A) > 1, infinitely many linear combinations of independent sub-reactions conserve atoms and charge, so no unique 'balanced equation' exists without kinetic or mechanistic constraints.",
        claimKind: "established_fact",
      },
      {
        heading: "Breakdown of Ideal Dilute Models at Elevated Ionic Strength",
        body: "Above roughly I ≈ 0.01–0.1 mol/L, long-range Coulombic interactions among ions lower mean ionic activity coefficients γ_± below unity (described to first order by Debye–Hückel or Davies extensions). Consequently, glass-electrode pH (sensing activity) differs systematically from -log10(c_H+).",
        claimKind: "model_approximation",
        claimNote:
          "Explicitly documents why Phase 04 acid-base models restrict scope to dilute 25 °C solutions.",
      },
    ],
    importantConcepts: [
      "Exact rational arithmetic prevents floating-point drift in stoichiometric matrices",
      "Relative uncertainty in product/quotient quantities combines in quadrature: (u_c / c)^2 = (u_m / m)^2 + (u_V / V)^2",
      "Simulated numbers carry zero random instrument noise unless a noise model is declared—never report them as physical measurements",
    ],
    chemicalEquations: [],
    glossaryTermIds: ["stoichiometry", "ph", "titration", "volumetric-flask"],
    formulas: [
      {
        id: "form-uncertainty-propagation",
        expression: "u_rel(c) = sqrt((u(V1)/V1)^2 + (u(V2)/V2)^2 + (u(c1)/c1)^2)",
        displayForm: "u_r(c₂) = √[ (u(c₁)/c₁)² + (u(V₁)/V₁)² + (u(V₂)/V₂)² ]",
        description: "First-order uncorrelated uncertainty propagation for c2 = c1 V1 / V2.",
        variables: [
          {
            symbol: "u_r(c₂)",
            meaning: "Combined relative standard uncertainty in c₂",
            unit: "dimensionless",
          },
          { symbol: "u(x)", meaning: "Standard uncertainty in quantity x", unit: "same unit as x" },
        ],
        conditions: ["Independent, small relative uncertainties in c1, V1 and V2."],
        assumptions: ["Negligible covariance and linearizable sensitivity."],
      },
    ],
    workedExamples: [
      {
        id: "we-dilution-uncertainty",
        title: "Combined volumetric uncertainty in a 10.00 mL -> 100.0 mL Class A dilution",
        problem:
          "A stock of c1 = 0.5000 ± 0.0005 mol/L is diluted using a pipette (10.00 ± 0.02 mL) and volumetric flask (100.00 ± 0.08 mL). Find c2 and its uncertainty.",
        given: [
          "u(c1)/c1 = 0.0005 / 0.5000 = 0.0010",
          "u(V1)/V1 = 0.02 / 10.00 = 0.0020",
          "u(V2)/V2 = 0.08 / 100.00 = 0.0008",
        ],
        steps: [
          "Compute c2 = 0.5000 × (10.00 / 100.00) = 0.05000 mol/L.",
          "Compute u_r(c2) = sqrt(0.0010^2 + 0.0020^2 + 0.0008^2) = sqrt(5.64 × 10^-6) = 0.002375.",
          "Compute u(c2) = 0.05000 × 0.002375 = 0.00012 mol/L -> c2 = 0.05000 ± 0.00012 mol/L.",
        ],
        result: "0.05000 ± 0.00012",
        unit: "mol/L",
        precisionNote:
          "Uncertainty rounded to 2 significant digits with value matched to the same decimal place.",
        isIllustrative: true,
      },
    ],
    diagrams: [],
    relatedExperimentIds: ["solution-dilution", "acid-base-titration", "ph-and-indicators"],
    relatedAssessmentIds: ["quiz-advanced-modeling-uncertainty"],
    references: [SHARED_REFERENCES.siBrochure9!, SHARED_REFERENCES.iupacGoldBook!],
    furtherReading: [
      "JCGM 100:2008 (GUM) — Evaluation of measurement data: Guide to the expression of uncertainty in measurement.",
    ],
    scientificReviewStatus: "pending_scientific_review",
  },
];
