import { LEARNING_SCHEMA_VERSION, type Assessment } from "../schemas.js";
import { SHARED_REFERENCES } from "./glossary.js";

export const RAW_ASSESSMENTS: ReadonlyArray<Assessment> = [
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "quiz-foundations-solutions",
    slug: "foundations-moles-and-standard-solutions",
    title: "Standard Solution Preparation & Mole Concept Check",
    description:
      "Assess your understanding of SI amount of substance, molar mass of hydrates and volumetric standard solution technique.",
    experimentId: "standard-solution-preparation",
    pathwayId: "pathway-beginner-foundations",
    stage: "beginner",
    passPercentage: 70,
    allowRetry: true,
    estimatedDurationMinutes: 10,
    questions: [
      {
        id: "q-std-1",
        type: "numerical",
        prompt:
          "Calculate the amount of substance (in mol) in 5.2994 g of anhydrous sodium carbonate (Na2CO3, M = 105.988 g/mol).",
        difficulty: "introductory",
        marks: 2,
        learningObjective: "Convert weighed primary-standard mass to chemical amount in moles.",
        expectedValue: 0.05,
        expectedUnit: "mol",
        acceptedUnits: ["mol", "mmol"],
        tolerance: 0.0005,
        toleranceKind: "absolute",
        explanation: "n = m / M = 5.2994 g / 105.988 g/mol = 0.05000 mol (or 50.00 mmol).",
        reference: SHARED_REFERENCES.ciaaw2021!,
      },
      {
        id: "q-std-2",
        type: "multiple_choice",
        prompt:
          "When preparing 250.0 mL of a standard aqueous solution in a volumetric flask, which procedure is quantitatively sound?",
        difficulty: "introductory",
        marks: 2,
        learningObjective: "Apply volumetric flask dissolution and meniscus technique.",
        options: [
          {
            id: "opt-a",
            label:
              "Fill the volumetric flask to the 250.0 mL mark with water first, then add the solid solute.",
          },
          {
            id: "opt-b",
            label:
              "Dissolve the weighed solute completely in a smaller volume of deionized water, transfer with rinsings to the flask, then make up until the bottom of the meniscus rests on the mark at eye level.",
          },
          {
            id: "opt-c",
            label: "Measure 250 mL in a graduated beaker and stir the solid until dissolved.",
          },
          {
            id: "opt-d",
            label:
              "Heat the calibrated volumetric flask over a Bunsen burner to speed dissolution.",
          },
        ],
        correctOptionId: "opt-b",
        explanation:
          "Dissolving first with quantitative rinsing ensures complete solute transfer, making up to the calibration mark gives an exact total solution volume, and never heating calibrated glassware preserves its volumetric calibration.",
        reference: SHARED_REFERENCES.ncertLabManual!,
      },
      {
        id: "q-std-3",
        type: "true_false",
        prompt:
          "True or false: Reading an aqueous meniscus from above eye level causes the liquid level to appear lower than it actually is, leading to over-addition of solvent and a lower-than-intended concentration.",
        difficulty: "intermediate",
        marks: 1,
        learningObjective: "Diagnose directional systematic error from meniscus parallax.",
        correctAnswer: true,
        explanation:
          "Viewing from above projects the bottom of the meniscus downward against the neck graduations, so the analyst adds extra water to reach the mark, increasing V and decreasing c = n/V.",
        reference: SHARED_REFERENCES.ncertLabManual!,
      },
      {
        id: "q-std-4",
        type: "chemical_equation",
        mode: "chemical_formula",
        prompt:
          "Write the chemical formula of copper(II) sulfate pentahydrate using a middle dot (·) or period for its five waters of crystallization.",
        difficulty: "introductory",
        marks: 2,
        learningObjective: "Represent hydrated crystalline formulas accurately.",
        canonicalExpected: "CuSO4·5H2O",
        hintNotation: "Use element symbols and dot hydrate notation, e.g. CuSO4·5H2O",
        explanation:
          "Each formula unit of copper(II) sulfate pentahydrate incorporates one Cu, one S, nine O and ten H atoms (CuSO4·5H2O, M = 249.677 g/mol using CIAAW 2021 abridged atomic weights).",
        reference: SHARED_REFERENCES.ciaaw2021!,
      },
    ],
    references: [SHARED_REFERENCES.ciaaw2021!, SHARED_REFERENCES.ncertLabManual!],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "quiz-solution-dilution",
    slug: "serial-dilution-and-concentration",
    title: "Solution Dilution & Solute Conservation Quiz",
    description:
      "Verify quantitative dilution calculations (c1 V1 = c2 V2), unit handling and glassware selection.",
    experimentId: "solution-dilution",
    pathwayId: "pathway-beginner-foundations",
    stage: "beginner",
    passPercentage: 70,
    allowRetry: true,
    estimatedDurationMinutes: 10,
    questions: [
      {
        id: "q-dil-1",
        type: "numerical",
        prompt:
          "10.0 mL of 0.500 mol/L CuSO4 stock solution is diluted with deionized water to a final total volume of 100.0 mL. What is the final molar concentration c2?",
        difficulty: "introductory",
        marks: 2,
        learningObjective: "Calculate final concentration using c1 V1 = c2 V2.",
        expectedValue: 0.05,
        expectedUnit: "mol/L",
        acceptedUnits: ["mol/L", "mmol/L"],
        tolerance: 0.0005,
        toleranceKind: "absolute",
        explanation:
          "c2 = c1 × (V1 / V2) = 0.500 mol/L × (10.0 mL / 100.0 mL) = 0.0500 mol/L (50.0 mmol/L).",
        reference: SHARED_REFERENCES.ncert12Part1!,
      },
      {
        id: "q-dil-2",
        type: "numerical",
        prompt:
          "What volume V1 (in mL) of 2.00 mol/L HCl stock is required to prepare 250.0 mL of 0.100 mol/L HCl?",
        difficulty: "introductory",
        marks: 2,
        learningObjective: "Determine required stock aliquot volume for a target concentration.",
        expectedValue: 12.5,
        expectedUnit: "mL",
        acceptedUnits: ["mL", "L"],
        tolerance: 0.05,
        toleranceKind: "absolute",
        explanation:
          "V1 = (c2 × V2) / c1 = (0.100 mol/L × 250.0 mL) / 2.00 mol/L = 12.5 mL (0.0125 L).",
        reference: SHARED_REFERENCES.ncert12Part1!,
      },
      {
        id: "q-dil-3",
        type: "multiple_select",
        prompt:
          "Select ALL statements that remain true when a non-reactive aqueous stock solution is diluted with pure water at constant temperature:",
        difficulty: "intermediate",
        marks: 2,
        learningObjective:
          "Distinguish conserved solute amount from changing intensive concentration.",
        options: [
          {
            id: "opt-moles",
            label: "The amount of dissolved solute (in mol) in the flask stays constant.",
          },
          { id: "opt-conc", label: "The molar concentration decreases proportionally to V1 / V2." },
          {
            id: "opt-vadd",
            label:
              "V2 must always equal V1 plus solvent volume to infinite precision even for concentrated acids.",
          },
          {
            id: "opt-safety",
            label:
              "When diluting concentrated sulfuric acid, acid must be added slowly to water, never water into concentrated acid.",
          },
        ],
        correctOptionIds: ["opt-moles", "opt-conc", "opt-safety"],
        explanation:
          "Solute moles are conserved and c2 = c1(V1/V2). Concentrated mixing can show non-ideal volume contraction and strong exothermicity (hence adding acid to water).",
        reference: SHARED_REFERENCES.ncertLabManual!,
      },
      {
        id: "q-dil-4",
        type: "short_answer",
        prompt:
          "In one phrase, state what physical quantity of the dissolved solute is conserved during simple dilution.",
        difficulty: "introductory",
        marks: 1,
        learningObjective: "Articulate the conservation basis of c1 V1 = c2 V2.",
        requiredConceptGroups: [["mole", "moles", "amount of substance", "solute mass"]],
        sampleAnswer: "Amount of substance (moles) of dissolved solute.",
        explanation:
          "Adding pure solvent changes solution volume and concentration while keeping the moles (and mass) of dissolved solute constant.",
        reference: SHARED_REFERENCES.ncert11Part1!,
      },
    ],
    references: [SHARED_REFERENCES.ncert11Part1!, SHARED_REFERENCES.ncert12Part1!],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "quiz-ph-and-indicators",
    slug: "ph-measurement-and-acid-base-indicators-quiz",
    title: "Aqueous pH, Weak Electrolytes & Indicators Assessment",
    description:
      "Evaluate dilute-solution pH/pOH calculations at 25 °C, indicator ranges and model validity assumptions.",
    experimentId: "ph-and-indicators",
    pathwayId: "pathway-school-acids-indicators",
    stage: "school",
    passPercentage: 70,
    allowRetry: true,
    estimatedDurationMinutes: 12,
    questions: [
      {
        id: "q-ph-1",
        type: "numerical",
        prompt:
          "What is the pH of a 0.010 mol/L aqueous HCl solution at 25 °C assuming ideal dilute behaviour?",
        difficulty: "introductory",
        marks: 2,
        learningObjective: "Compute pH of a dilute strong monoprotic acid at 25 °C.",
        expectedValue: 2.0,
        expectedUnit: "pH",
        acceptedUnits: ["pH", "dimensionless"],
        tolerance: 0.02,
        toleranceKind: "absolute",
        explanation:
          "HCl dissociates completely in dilute water; [H+] = 0.010 mol/L, so pH = -log10(0.010) = 2.00.",
        reference: SHARED_REFERENCES.ncert11Part2!,
      },
      {
        id: "q-ph-2",
        type: "multiple_choice",
        prompt:
          "At equal analytical concentration (0.010 mol/L at 25 °C), how does aqueous acetic acid (CH3COOH, Ka = 1.75 × 10^-5) compare with hydrochloric acid (HCl)?",
        difficulty: "intermediate",
        marks: 2,
        learningObjective:
          "Contrast partial ionization of weak acids with complete dissociation of strong acids.",
        options: [
          { id: "opt-1", label: "Both have pH = 2.00 because their molarity is identical." },
          {
            id: "opt-2",
            label:
              "Acetic acid is only partially ionized, so [H+] < 0.010 mol/L and its pH (~3.38) is higher than 2.00.",
          },
          {
            id: "opt-3",
            label:
              "Acetic acid has a lower pH than HCl because it contains four hydrogen atoms per molecule.",
          },
          { id: "opt-4", label: "Acetic acid cannot turn blue litmus red." },
        ],
        correctOptionId: "opt-2",
        explanation:
          "Only the carboxyl proton of CH3COOH ionizes, and only partially (α ≈ 4.1% at 0.010 M), giving pH ≈ 3.38 > 2.00.",
        reference: SHARED_REFERENCES.ncert11Part2!,
      },
      {
        id: "q-ph-3",
        type: "true_false",
        prompt:
          "True or false: Using pH = -log10(c) without water autoionization predicts pH = 8.0 for 1.0 × 10^-8 mol/L HCl at 25 °C, which is unphysical because adding acid to neutral water cannot make it basic.",
        difficulty: "intermediate",
        marks: 2,
        learningObjective: "Recognize water autoionization coupling in ultra-dilute strong acids.",
        correctAnswer: true,
        explanation:
          "Solving electroneutrality [H+] = c + Kw/[H+] for c = 10^-8 mol/L yields [H+] ≈ 1.05 × 10^-7 mol/L and pH ≈ 6.98 (slightly acidic, never > 7.00 at 25 °C).",
        reference: SHARED_REFERENCES.ncert11Part2!,
      },
      {
        id: "q-ph-4",
        type: "multiple_select",
        prompt: "Which conditions limit the accuracy of the textbook formula pH = -log10([H+])?",
        difficulty: "advanced",
        marks: 2,
        learningObjective:
          "Identify thermodynamic activity and temperature limitations of dilute pH models.",
        options: [
          {
            id: "lim-ionic",
            label:
              "High ionic strength (e.g. > 0.5 mol/L), where activity coefficients deviate substantially from 1.",
          },
          {
            id: "lim-temp",
            label:
              "Temperatures away from 25 °C when assuming pH + pOH = 14.00, since Kw varies with temperature.",
          },
          {
            id: "lim-beaker",
            label:
              "Storing the solution in borosilicate rather than soda-lime glass for 10 seconds.",
          },
        ],
        correctOptionIds: ["lim-ionic", "lim-temp"],
        explanation:
          "Thermodynamic pH depends on hydrogen ion activity a_{H+} = γ_{H+}[H+]/c°, and pKw = 14.00 holds specifically near 25 °C.",
        reference: SHARED_REFERENCES.iupacGoldBook!,
      },
    ],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncert11Part2!],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "quiz-chromatography-and-qualitative",
    slug: "chromatography-and-flame-tests-assessment",
    title: "Chromatography Separation & Qualitative Flame Analysis Quiz",
    description:
      "Check retention factor calculations, chromatographic experimental controls and flame emission interpretation.",
    experimentId: "paper-chromatography",
    pathwayId: "pathway-school-acids-indicators",
    stage: "school",
    passPercentage: 70,
    allowRetry: true,
    estimatedDurationMinutes: 10,
    questions: [
      {
        id: "q-chr-1",
        type: "numerical",
        prompt:
          "A pigment spot travels 4.20 cm from the pencil origin while the solvent front travels 7.00 cm. Calculate the retention factor Rf.",
        difficulty: "introductory",
        marks: 2,
        learningObjective:
          "Calculate dimensionless Rf from solute and solvent migration distances.",
        expectedValue: 0.6,
        expectedUnit: "dimensionless",
        acceptedUnits: ["dimensionless"],
        tolerance: 0.01,
        toleranceKind: "absolute",
        explanation: "Rf = d_solute / d_solvent = 4.20 cm / 7.00 cm = 0.600.",
        reference: SHARED_REFERENCES.iupacGoldBook!,
      },
      {
        id: "q-chr-2",
        type: "multiple_choice",
        prompt:
          "Why is the origin line in paper chromatography drawn with a graphite pencil rather than a ballpoint pen?",
        difficulty: "introductory",
        marks: 1,
        learningObjective: "Avoid mobile-phase contamination from soluble marker dyes.",
        options: [
          { id: "p-1", label: "Graphite catalyses pigment hydrolysis." },
          {
            id: "p-2",
            label:
              "Pen inks contain soluble dyes that elute with the solvent and contaminate the chromatogram, whereas graphite is insoluble.",
          },
          { id: "p-3", label: "Graphite increases the vapour pressure of the solvent." },
        ],
        correctOptionId: "p-2",
        explanation:
          "Graphite remains fixed at the baseline, whereas soluble pen dyes migrate and obscure analyte spots.",
        reference: SHARED_REFERENCES.ncertLabManual!,
      },
      {
        id: "q-chr-3",
        type: "multiple_choice",
        prompt:
          "During a qualitative flame test, why is cobalt blue glass useful when testing a sample suspected of containing potassium ions?",
        difficulty: "intermediate",
        marks: 2,
        learningObjective: "Account for sodium yellow emission interference in flame tests.",
        options: [
          { id: "f-1", label: "It increases the Bunsen flame temperature above 3000 K." },
          {
            id: "f-2",
            label:
              "It absorbs intense yellow sodium D-line (~589 nm) contamination so the paler violet/lilac potassium emission can be seen.",
          },
          { id: "f-3", label: "It converts potassium ions into copper(II) ions." },
        ],
        correctOptionId: "f-2",
        explanation:
          "Trace Na+ produces a bright yellow 589 nm doublet that visually overwhelms K+ violet emission; cobalt glass filters out yellow wavelengths.",
        reference: SHARED_REFERENCES.ncertLabManual!,
      },
    ],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.ncertLabManual!],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "quiz-stoichiometry-and-titration",
    slug: "stoichiometry-and-volumetric-titration-quiz",
    title: "Reaction Balancing, Limiting Reagent & Acid-Base Titration Assessment",
    description:
      "Test exact equation balancing, diprotic acid-base titration calculations and indicator selection.",
    experimentId: "acid-base-titration",
    pathwayId: "pathway-intermediate-quantitative-analysis",
    stage: "intermediate",
    passPercentage: 70,
    allowRetry: true,
    estimatedDurationMinutes: 15,
    questions: [
      {
        id: "q-tit-1",
        type: "chemical_equation",
        mode: "balanced_reaction",
        prompt:
          "Write the lowest-terms balanced chemical equation for the neutralization of oxalic acid (H2C2O4) with sodium hydroxide (NaOH) forming sodium oxalate (Na2C2O4) and water (H2O).",
        difficulty: "intermediate",
        marks: 3,
        learningObjective: "Balance diprotic neutralization reactions exactly.",
        canonicalExpected: "H2C2O4 + 2 NaOH -> Na2C2O4 + 2 H2O",
        hintNotation:
          "Use '->' between reactants and products, e.g. H2C2O4 + 2 NaOH -> Na2C2O4 + 2 H2O",
        explanation:
          "Diprotic H2C2O4 donates two protons per molecule, requiring 2 NaOH to form Na2C2O4 and 2 H2O.",
        reference: SHARED_REFERENCES.ncertLabManual!,
      },
      {
        id: "q-tit-2",
        type: "numerical",
        prompt:
          "25.00 mL of 0.0500 mol/L H2C2O4(aq) is titrated to equivalence with 20.00 mL of NaOH(aq). Calculate the molar concentration of NaOH.",
        difficulty: "intermediate",
        marks: 3,
        learningObjective: "Apply 1:2 stoichiometric equivalence in volumetric titration.",
        expectedValue: 0.125,
        expectedUnit: "mol/L",
        acceptedUnits: ["mol/L", "mmol/L"],
        tolerance: 0.001,
        toleranceKind: "absolute",
        explanation:
          "n(H2C2O4) = 0.0500 × 0.02500 = 0.001250 mol. Since n(NaOH) = 2 × n(H2C2O4) = 0.002500 mol, c(NaOH) = 0.002500 mol / 0.02000 L = 0.125 mol/L.",
        reference: SHARED_REFERENCES.ncertLabManual!,
      },
      {
        id: "q-tit-3",
        type: "multiple_choice",
        prompt:
          "Which indicator is best suited for titrating weak oxalic acid with strong sodium hydroxide?",
        difficulty: "intermediate",
        marks: 2,
        learningObjective: "Match indicator pKa transition window to alkaline equivalence pH.",
        options: [
          { id: "ind-mo", label: "Methyl orange (transition pH 3.1–4.4)" },
          { id: "ind-pp", label: "Phenolphthalein (transition pH 8.2–10.0)" },
          { id: "ind-tb", label: "Thymol blue first acidic range (pH 1.2–2.8)" },
        ],
        correctOptionId: "ind-pp",
        explanation:
          "At equivalence, aqueous oxalate C2O4^2- hydrolyses slightly to make the solution basic (pH ~8.5–9), which falls squarely within phenolphthalein's transition interval.",
        reference: SHARED_REFERENCES.ncertLabManual!,
      },
      {
        id: "q-tit-4",
        type: "true_false",
        prompt:
          "True or false: Rinsing the conical titration flask with the analyte solution (after pipetting the measured aliquot) leaves the analyte mole count unchanged.",
        difficulty: "intermediate",
        marks: 1,
        learningObjective: "Prevent systematic positive bias during titration flask preparation.",
        correctAnswer: false,
        explanation:
          "False! The conical flask must be rinsed only with deionized water; rinsing it with analyte solution introduces extra unmeasured moles of analyte and inflates the required burette volume.",
        reference: SHARED_REFERENCES.ncertLabManual!,
      },
    ],
    references: [SHARED_REFERENCES.ncert11Part1!, SHARED_REFERENCES.ncertLabManual!],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "quiz-kinetics-and-equilibrium",
    slug: "kinetics-and-chemical-equilibrium-assessment",
    title: "Chemical Kinetics & Iron(III)–Thiocyanate Equilibrium Quiz",
    description:
      "Assess reaction rate interpretation in the thiosulfate clock reaction and Le Chatelier / Q vs K analysis in FeSCN^2+ equilibria.",
    experimentId: "reaction-rates-thiosulfate",
    pathwayId: "pathway-physical-kinetics-equilibrium",
    stage: "college",
    passPercentage: 70,
    allowRetry: true,
    estimatedDurationMinutes: 12,
    questions: [
      {
        id: "q-kin-1",
        type: "numerical",
        prompt:
          "In a thiosulfate–acid turbidity run, the cross mark disappears at t = 40.0 s. Calculate the relative rate proxy 1/t in s^-1.",
        difficulty: "introductory",
        marks: 2,
        learningObjective:
          "Compute reciprocal obscuration time 1/t with explicit inverse-time units.",
        expectedValue: 0.025,
        expectedUnit: "s^-1",
        acceptedUnits: ["s^-1", "1/s"],
        tolerance: 0.0005,
        toleranceKind: "absolute",
        explanation: "1 / t = 1 / 40.0 s = 0.0250 s^-1.",
        reference: SHARED_REFERENCES.ncert12Part1!,
      },
      {
        id: "q-kin-2",
        type: "multiple_choice",
        prompt:
          "In the equilibrium Fe^3+(aq) + SCN^-(aq) ⇌ [Fe(SCN)]^2+(aq) (blood-red), adding sodium fluoride (NaF) causes the red colour to fade markedly. Why?",
        difficulty: "intermediate",
        marks: 2,
        learningObjective: "Explain coupled complexation shifts using Q versus K.",
        options: [
          { id: "eq-1", label: "F^- oxidizes SCN^- to sulfate." },
          {
            id: "eq-2",
            label:
              "F^- forms stable colourless fluoro-complexes with Fe^3+, lowering free [Fe^3+] so Q > K and [Fe(SCN)]^2+ dissociates.",
          },
          {
            id: "eq-3",
            label: "NaF permanently decreases the equilibrium constant K at constant temperature.",
          },
        ],
        correctOptionId: "eq-2",
        explanation:
          "Sequestering Fe^3+ into [FeF_n]^(3-n) lowers the denominator of Q = [FeSCN^2+]/([Fe^3+][SCN^-]), making Q > K and driving net reverse dissociation.",
        reference: SHARED_REFERENCES.ncert11Part2!,
      },
      {
        id: "q-kin-3",
        type: "true_false",
        prompt:
          "True or false: Adding a catalyst lowers the activation energy pathway for both forward and reverse directions equally and therefore does not shift the equilibrium constant K.",
        difficulty: "intermediate",
        marks: 1,
        learningObjective: "Distinguish kinetic catalysis from thermodynamic equilibrium state.",
        correctAnswer: true,
        explanation:
          "A catalyst accelerates attainment of equilibrium without altering reactant or product standard Gibbs energies, leaving Δ_rG° and K unchanged.",
        reference: SHARED_REFERENCES.ncert12Part1!,
      },
    ],
    references: [SHARED_REFERENCES.ncert11Part2!, SHARED_REFERENCES.ncert12Part1!],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "quiz-electrochemistry-daniell",
    slug: "daniell-cell-and-nernst-equation-quiz",
    title: "Electrochemistry & Daniell Cell Assessment",
    description:
      "Verify ionic redox equation conservation, galvanic cell polarity and concentration shifts in cell EMF.",
    experimentId: "electrochemical-cell-daniell",
    pathwayId: "pathway-electrochemistry-redox",
    stage: "college",
    passPercentage: 70,
    allowRetry: true,
    estimatedDurationMinutes: 12,
    questions: [
      {
        id: "q-el-1",
        type: "chemical_equation",
        mode: "balanced_reaction",
        prompt:
          "Write the balanced net ionic equation for the spontaneous Daniell cell reaction between solid zinc (Zn) and copper(II) ions (Cu^2+) forming zinc(II) ions (Zn^2+) and solid copper (Cu).",
        difficulty: "intermediate",
        marks: 3,
        learningObjective: "Conserve both mass and ionic charge in redox equations.",
        canonicalExpected: "Zn + Cu^2+ -> Zn^2+ + Cu",
        hintNotation: "Use caret notation for multivalent ions, e.g. Zn + Cu^2+ -> Zn^2+ + Cu",
        explanation:
          "Zinc is oxidized (Zn -> Zn^2+ + 2e^-) at the anode and copper(II) is reduced (Cu^2+ + 2e^- -> Cu) at the cathode; net charge is +2 on both sides.",
        reference: SHARED_REFERENCES.ncert12Part1!,
      },
      {
        id: "q-el-2",
        type: "numerical",
        prompt:
          "Given standard reduction potentials E°(Cu^2+/Cu) = +0.34 V and E°(Zn^2+/Zn) = -0.76 V at 25 °C, calculate the standard cell potential E°_cell in volts.",
        difficulty: "introductory",
        marks: 2,
        learningObjective: "Compute E°_cell = E°_cathode - E°_anode.",
        expectedValue: 1.1,
        expectedUnit: "V",
        acceptedUnits: ["V", "mV"],
        tolerance: 0.01,
        toleranceKind: "absolute",
        explanation: "E°_cell = (+0.34 V) - (-0.76 V) = +1.10 V (1100 mV).",
        reference: SHARED_REFERENCES.ncert12Part1!,
      },
      {
        id: "q-el-3",
        type: "multiple_choice",
        prompt:
          "According to the Nernst equation at 25 °C, how does diluting [Zn^2+] ten-fold while holding [Cu^2+] constant affect the open-circuit Daniell cell potential?",
        difficulty: "intermediate",
        marks: 2,
        learningObjective:
          "Predict directional Nernst potential shifts with electrolyte concentration.",
        options: [
          {
            id: "n-1",
            label:
              "E_cell increases by approximately 0.030 V because Q = [Zn^2+]/[Cu^2+] decreases by a factor of 10.",
          },
          { id: "n-2", label: "E_cell decreases by 0.059 V." },
          { id: "n-3", label: "E_cell drops immediately to 0.00 V." },
        ],
        correctOptionId: "n-1",
        explanation:
          "With n = 2 at 298.15 K, E_cell = E°_cell - (0.05916/2) log10([Zn^2+]/[Cu^2+]); reducing Q ten-fold adds +0.0296 V.",
        reference: SHARED_REFERENCES.ncert12Part1!,
      },
    ],
    references: [SHARED_REFERENCES.ncert12Part1!, SHARED_REFERENCES.iupacGoldBook!],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "quiz-vsepr-and-structure",
    slug: "vsepr-molecular-geometry-and-bonding-quiz",
    title: "VSEPR Molecular Geometry & 3D Bonding Assessment",
    description:
      "Assess electron-domain versus molecular shapes, reference bond angles and functional-group geometry.",
    experimentId: "vsepr-molecular-geometry",
    pathwayId: "pathway-structure-bonding-organic",
    stage: "college",
    passPercentage: 70,
    allowRetry: true,
    estimatedDurationMinutes: 10,
    questions: [
      {
        id: "q-vs-1",
        type: "multiple_choice",
        prompt:
          "Which sequence orders the H–X–H bond angles from largest to smallest in gas-phase reference structures?",
        difficulty: "introductory",
        marks: 2,
        learningObjective:
          "Order bond angles across isoelectronic tetrahedral electron-domain hydrides.",
        options: [
          { id: "v-1", label: "H2O (104.5°) > NH3 (106.7°) > CH4 (109.5°)" },
          { id: "v-2", label: "CH4 (109.5°) > NH3 (106.7°) > H2O (104.5°)" },
          { id: "v-3", label: "NH3 > CH4 > H2O" },
        ],
        correctOptionId: "v-2",
        explanation:
          "Increasing the number of lone pairs on the central atom (0 in CH4, 1 in NH3, 2 in H2O) progressively compresses bonding-pair angles.",
        reference: SHARED_REFERENCES.ncert11Part1!,
      },
      {
        id: "q-vs-2",
        type: "numerical",
        prompt: "What is the ideal O=C=O bond angle (in degrees) of linear carbon dioxide (CO2)?",
        difficulty: "introductory",
        marks: 1,
        learningObjective:
          "Identify 180° geometry for two electron domains with zero lone pairs on carbon.",
        expectedValue: 180,
        expectedUnit: "deg",
        acceptedUnits: ["deg"],
        tolerance: 0.5,
        toleranceKind: "absolute",
        explanation:
          "Carbon in CO2 has two double-bond electron domains and zero lone pairs (AX2), arranging linearly at 180°.",
        reference: SHARED_REFERENCES.ncert11Part1!,
      },
      {
        id: "q-vs-3",
        type: "short_answer",
        prompt:
          "Name the molecular shape (atoms-only geometry) of an AX3E molecule such as ammonia (NH3).",
        difficulty: "introductory",
        marks: 2,
        learningObjective:
          "Distinguish trigonal pyramidal molecular shape from tetrahedral electron-domain arrangement.",
        requiredConceptGroups: [["trigonal"], ["pyramidal", "pyramid"]],
        sampleAnswer: "Trigonal pyramidal",
        explanation:
          "With three bonding pairs and one lone pair around nitrogen, the four electron domains are tetrahedral while the atomic nuclei form a trigonal pyramid.",
        reference: SHARED_REFERENCES.ncert11Part1!,
      },
    ],
    references: [SHARED_REFERENCES.ncert11Part1!],
    scientificReviewStatus: "pending_scientific_review",
  },
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    id: "quiz-advanced-modeling-uncertainty",
    slug: "advanced-conservation-and-uncertainty-assessment",
    title: "Advanced Seminar Check: Stoichiometric Nullspaces & Uncertainty",
    description:
      "Evaluate conservation matrix uniqueness, yield anomalies and relative volumetric uncertainty propagation.",
    pathwayId: "pathway-advanced-modeling-uncertainty",
    stage: "advanced",
    passPercentage: 75,
    allowRetry: true,
    estimatedDurationMinutes: 15,
    questions: [
      {
        id: "q-adv-1",
        type: "multiple_choice",
        prompt:
          "When balancing a proposed chemical reaction via the composition matrix A ν = 0, what does a 2-dimensional rational nullspace indicate?",
        difficulty: "advanced",
        marks: 3,
        learningObjective: "Interpret matrix nullity > 1 in reaction stoichiometry.",
        options: [
          { id: "a-1", label: "Floating-point round-off occurred." },
          {
            id: "a-2",
            label:
              "At least two stoichiometrically independent reactions connect the listed species, so infinitely many positive ratios conserve atoms and charge unless relative pathway selectivity is specified.",
          },
          { id: "a-3", label: "The reaction violates conservation of mass." },
        ],
        correctOptionId: "a-2",
        explanation:
          "Nullity > 1 means independent reaction pathways coexist among the given species; refusing an arbitrary linear combination preserves scientific exactness.",
        reference: SHARED_REFERENCES.iupacGoldBook!,
      },
      {
        id: "q-adv-2",
        type: "numerical",
        prompt:
          "A student isolates 2.64 g of wet precipitate when the limiting-reagent theoretical yield of pure dry product is 2.40 g. What is the apparent percentage yield (unclamped)?",
        difficulty: "intermediate",
        marks: 2,
        learningObjective:
          "Compute unclamped apparent percentage yield to diagnose incomplete drying.",
        expectedValue: 110,
        expectedUnit: "%",
        acceptedUnits: ["%"],
        tolerance: 0.2,
        toleranceKind: "absolute",
        explanation:
          "Apparent % yield = (2.64 g / 2.40 g) × 100 % = 110 %. Clamping to 100 % would conceal residual solvent or co-precipitated impurities.",
        reference: SHARED_REFERENCES.ncert11Part1!,
      },
      {
        id: "q-adv-3",
        type: "true_false",
        prompt:
          "True or false: Values computed by a virtual chemistry simulation engine may be reported in a laboratory record as physical experimental measurements if rounded to two decimal places.",
        difficulty: "introductory",
        marks: 2,
        learningObjective:
          "Uphold data provenance separation between simulated outputs and physical measurements.",
        correctAnswer: false,
        explanation:
          "Never! Simulated and engine-calculated values reflect mathematical models under stated assumptions and must always carry explicit simulation/model provenance.",
        reference: SHARED_REFERENCES.siBrochure9!,
      },
    ],
    references: [SHARED_REFERENCES.iupacGoldBook!, SHARED_REFERENCES.siBrochure9!],
    scientificReviewStatus: "pending_scientific_review",
  },
];
