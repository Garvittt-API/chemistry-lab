# Reference Cases — Simulation Engine (Phase 04)

Machine-readable source of truth: `packages/simulation-core/src/reference-cases.ts`
(frozen registry, version 1.0.0). `reference-cases.test.ts` executes every case against the
implementation. Status below is what the suite asserted on **2026-11-07** with
`pnpm test` — 52 cases, all green, on commit branch `arena/d66f498a-chemistry-lab`.

**Tolerance semantics:** absolute → |actual − expected| ≤ tol; relative → tol × |expected|.

| Case ID | Model | Description | Expected | Tolerance | Source | Status |
|---|---|---|---|---|---|---|
| REF-UNIT-001 | unit-system | 1 standard atmosphere = 101325 Pa (exact conventional definition) | 101325 Pa | 1e-9 (rel) | SI Brochure, 9th ed. (BIPM, 2019), conventional definition of the standard atmosphere; ISO 80000-4 | PASS |
| REF-UNIT-002 | unit-system | 760 Torr = 1 standard atmosphere exactly (101325/760 Pa per Torr) | 101325 Pa | 1e-9 (rel) | Conventional torr definition (1 Torr = 101325/760 Pa exactly); ISO 80000-4 | PASS |
| REF-UNIT-003 | unit-system | 1 L = 1000 mL = 1000 cm³ (definition of the litre) | 1000 mL | 1e-9 (rel) | SI Brochure, 9th ed. (BIPM, 2019), §4 table 8 (special names for 1e-3 m³) | PASS |
| REF-UNIT-004 | unit-system | °C ↔ K: 298.15 K = 25 °C | 25 °C | 1e-9 (abs) | ITS-90 / SI definition (T/K = t/°C + 273.15) | PASS |
| REF-UNIT-005 | unit-system | °C ↔ °F: −40 °C = −40 °F (the unique equal point) | -40 °F | 1e-9 (abs) | Affine temperature conversion definition (t/°F = 1.8·t/°C + 32) | PASS |
| REF-UNIT-006 | unit-system | °F ↔ K: 212 °F = 373.15 K (boiling point of water, 1 atm) | 373.15 K | 1e-9 (abs) | Affine temperature conversion definition; boiling point of water is 100 °C at 101325 Pa | PASS |
| REF-UNIT-007 | unit-system | Thermochemical calorie: 1 cal = 4.184 J exactly | 4.184 J | 1e-9 (rel) | Thermochemical calorie definition (4.184 J exactly); IUPAC/ISO; consistent with CODATA conventions | PASS |
| REF-UNIT-008 | unit-system | 1 mol/L = 1000 mol/m³ | 1000 mol/m³ | 1e-9 (rel) | Definition of the litre (1 L = 1e-3 m³, SI Brochure 9th ed.) | PASS |
| REF-UNIT-009 | unit-system | Mass concentration identity: 58.44 g/L = 58.44 kg/m³ | 58.44 kg/m³ | 1e-9 (rel) | Unit definition (1 g/L = 1e-3 kg / 1e-3 m³ = 1 kg/m³) | PASS |
| REF-UNIT-010 | unit-system | 1 g/mol = 1e-3 kg/mol (molar mass) | 0.001 kg/mol | 1e-9 (rel) | SI prefix definitions (kilo = 1e3) | PASS |
| REF-UNIT-011 | unit-system | 1 atm = 1.01325 bar | 1.01325 bar | 1e-9 (rel) | Definitions: 1 atm = 101325 Pa; 1 bar = 1e5 Pa (exact) | PASS |
| REF-UNIT-012 | unit-system | 1 day = 86400 s | 86400 s | 1e-9 (rel) | Unit definition (1 d = 24 h = 86400 s) | PASS |
| REF-CON-001 | constants-registry | Molar gas constant R = 8.31446261815324 J·mol⁻¹·K⁻¹ (exact from SI definition) | 8.31446261815324 J/(mol·K) | 1e-9 (rel) | SI Brochure, 9th ed. (BIPM, 2019): R = N_A × k, both SI defining constants | PASS |
| REF-CON-002 | constants-registry | Faraday constant F = N_A × e = 96485.3321 C/mol | 96485.33212331 C/mol | 1e-9 (rel) | SI Brochure, 9th ed. (BIPM, 2019): F = N_A × e; CODATA 2018 value 96485.3322 C/mol (4 s.f.) | PASS |
| REF-CON-003 | constants-registry | Avogadro constant N_A = 6.02214076e23 mol⁻¹ (exact) | 6.02214076e+23 mol⁻¹ | 1e-9 (rel) | SI Brochure, 9th ed. (BIPM, 2019), §2.1 SI defining constants | PASS |
| REF-CON-004 | constants-registry | Conventional ion product of water K_w = 1.0e-14 mol² dm⁻⁶ (25 °C) | 1e-14 mol² dm⁻⁶ | 0 (abs) | Conventional 25 °C value for dilute aqueous solutions (CRC Handbook 104th ed.); pK_w = 14.00 | PASS |
| REF-EL-001 | elements-registry | Iron standard atomic weight = 55.845 g·mol⁻¹ (CIAAW 2021) | 55.845 g/mol | 0 (abs) | IUPAC Technical Report, Standard atomic weights of the elements 2021, Pure Appl. Chem. (DOI 10.1515/pac-2019-0603); table republished at https://iupac.qmul.ac.uk/AtWt/AtWt21.html | PASS |
| REF-EL-002 | elements-registry | Hafnium standard atomic weight = 178.486 g·mol⁻¹ (2021 revision; supersedes 178.49) | 178.486 g/mol | 0 (abs) | IUPAC Technical Report, Standard atomic weights of the elements 2021, Pure Appl. Chem. (DOI 10.1515/pac-2019-0603): Hf revised from 178.49 to 178.486 ± 0.006 | PASS |
| REF-MM-001 | molar-mass | Water H₂O = 18.015 g/mol | 18.015 g/mol | 0.000001 (rel) | CIAAW Standard Atomic Weights 2021 (H 1.008, O 15.999), value independently reproducible | PASS |
| REF-MM-002 | molar-mass | Sodium chloride NaCl = 58.44 g/mol | 58.44 g/mol | 0.000001 (rel) | CIAAW Standard Atomic Weights 2021 (Na 22.990, Cl 35.45) | PASS |
| REF-MM-003 | molar-mass | Sulfuric acid H₂SO₄ = 98.072 g/mol | 98.072 g/mol | 0.000001 (rel) | CIAAW Standard Atomic Weights 2021 (H 1.008, S 32.06, O 15.999); NCERT quotes ≈ 98 g/mol | PASS |
| REF-MM-004 | molar-mass | Glucose C₆H₁₂O₆ = 180.156 g/mol | 180.156 g/mol | 0.000001 (rel) | CIAAW Standard Atomic Weights 2021 (C 12.011, H 1.008, O 15.999) | PASS |
| REF-MM-005 | molar-mass | Calcium hydroxide Ca(OH)₂ = 74.092 g/mol | 74.092 g/mol | 0.000001 (rel) | CIAAW Standard Atomic Weights 2021 (Ca 40.078, O 15.999, H 1.008) | PASS |
| REF-MM-006 | molar-mass | Potassium ferrocyanide K₄[Fe(CN)₆] = 368.345 g/mol (nested brackets) | 368.345 g/mol | 0.000001 (rel) | CIAAW Standard Atomic Weights 2021 (K 39.098, Fe 55.845, C 12.011, N 14.007) | PASS |
| REF-MM-007 | molar-mass | Copper(II) sulfate pentahydrate CuSO₄·5H₂O = 249.677 g/mol (hydrate) | 249.677 g/mol | 0.000001 (rel) | CIAAW Standard Atomic Weights 2021; conventional tabulated value ≈ 249.7 g/mol | PASS |
| REF-MM-008 | molar-mass | Sodium sulfate decahydrate (Glauber's salt) Na₂SO₄·10H₂O = 322.186 g/mol | 322.186 g/mol | 0.000001 (rel) | CIAAW Standard Atomic Weights 2021; conventional tabulated value ≈ 322.2 g/mol | PASS |
| REF-QTY-001 | chemical-quantity | 0.5 mol H₂O weighs 9.0075 g | 9.0075 g | 1e-9 (rel) | Definition m = n × M; applied to CIAAW-2021 molar mass of water | PASS |
| REF-QTY-002 | chemical-quantity | 5.000 g of NaCl = 0.08556 mol | 0.085558 mol | 0.00001 (rel) | Definition n = m / M; applied to CIAAW-2021 molar mass of NaCl | PASS |
| REF-QTY-003 | chemical-quantity | 0.270 mol solute in 2.50 L → 0.108 mol/L | 0.108 mol/L | 1e-12 (rel) | Definition c = n / V; consistent with volumetric-analysis practice (NCERT Class XI, Some Basic Concepts of Chemistry) | PASS |
| REF-QTY-004 | chemical-quantity | Dilution: 2.0 mol/L stock, 100 mL → 500 mL final gives 0.400 mol/L | 0.4 mol/L | 1e-9 (rel) | Dilution law C₁V₁ = C₂V₂ (conservation of amount of solute); NCERT Class XI | PASS |
| REF-QTY-005 | chemical-quantity | 58.44 g/L NaCl solution = 1.000 mol/L | 1 mol/L | 1e-9 (rel) | Definition c = γ / M with γ in g/L and M in g/mol | PASS |
| REF-QTY-006 | chemical-quantity | Percent yield: 9.60 g actual against 10.00 g theoretical = 96.0 % | 96 % | 1e-9 (rel) | Definition %yield = actual/theoretical × 100 (NCERT Class XI) | PASS |
| REF-STOICH-001 | reaction-stoichiometry | 2 H₂ + O₂ → 2 H₂O: 2.00 mol H₂ + 1.50 mol O₂ → 2.00 mol H₂O (H₂ limiting) | 2 mol H₂O | 1e-9 (rel) | Atom conservation on the balanced equation (limiting-reagent method, NCERT Class XI, Some Basic Concepts of Chemistry) | PASS |
| REF-STOICH-002 | reaction-stoichiometry | N₂ + 3 H₂ → 2 NH₃: exact stoichiometric feed yields 2.00 mol NH₃ | 2 mol NH₃ | 1e-9 (rel) | Atom conservation; Haber process stoichiometry (NCERT Class XI/XII) | PASS |
| REF-STOICH-003 | reaction-stoichiometry | Zn + 2 HCl → ZnCl₂ + H₂: 1.00 mol Zn + 1.00 mol HCl → 0.500 mol H₂ (HCl limiting) | 0.5 mol H₂ | 1e-9 (rel) | Limiting-reagent method (NCERT Class XI, Some Basic Concepts of Chemistry) | PASS |
| REF-STOICH-004 | reaction-stoichiometry | 4 Fe + 3 O₂ → 2 Fe₂O₃: 2.00 mol Fe + 1.00 mol O₂ → 0.667 mol Fe₂O₃ (O₂ limiting) | 0.6666666666666666 mol Fe₂O₃ | 1e-12 (rel) | Limiting-reagent method; rusting stoichiometry | PASS |
| REF-STOICH-005 | reaction-stoichiometry | Limiting set is complete for Zn + 2 HCl: reagents report remaining HCl = 0 | 0 mol HCl remaining | 0 (abs) | Limiting-reagent accounting (definition) | PASS |
| REF-RXN-001 | reaction | Balance H₂ + O₂ → H₂O: coefficient of O₂ is 1 (2,1,2 solution) | 1 (stoichiometric coefficient) | 0 (abs) | Atom conservation; exact rational nullspace of the stoichiometry matrix | PASS |
| REF-RXN-002 | reaction | Balance Fe + O₂ → Fe₂O₃: coefficient of Fe₂O₃ is 2 (4,3,2 solution) | 2 (stoichiometric coefficient) | 0 (abs) | Atom conservation | PASS |
| REF-RXN-003 | reaction | Permanganate–iron(II) titration: MnO₄⁻ + Fe²⁺ + H⁺ → Mn²⁺ + Fe³⁺ + H₂O balances to 1:5:8 → 1:5:4 | 4 (stoichiometric coefficient of H₂O) | 0 (abs) | Half-reaction method; charge balance requires −1 + 10 + 8 = +2 + 15 = 17 elementary charges per side (NCERT Class XII, Electrochemistry) | PASS |
| REF-RXN-004 | reaction | Charge balance check passes for the balanced permanganate equation (both sides = +17) | 17 elementary charges (per side) | 0 (abs) | Charge conservation; NCERT Class XII, Electrochemistry | PASS |
| REF-RXN-005 | reaction | Aluminium combustion: Al + O₂ → Al₂O₃ balances to 4,3,2 | 2 (stoichiometric coefficient of Al₂O₃) | 0 (abs) | Atom conservation | PASS |
| REF-AB-001 | acid-base | Strong acid: pH of 0.010 mol/L HCl = 2.00 | 2 pH | 0.000001 (abs) | Strong monoprotic acid fully dissociated; NCERT Class XI, Equilibrium (ionic equilibrium) | PASS |
| REF-AB-002 | acid-base | Very dilute strong acid: pH of 1.0e-8 mol/L HCl ≈ 6.978 (water autoionization matters) | 6.9783 pH | 0.001 (abs) | Exact solution of [H⁺]² − c·[H⁺] − K_w = 0 (self-derived); standard textbook treatment of dilute strong acids (e.g. Brown & LeMay, Chemistry: The Central Science, 14th ed., Chapter 16). Value independently reproducible. | PASS |
| REF-AB-003 | acid-base | Pure water (c = 0): pH = 7.000 at K_w = 1e-14 | 7 pH | 0.000001 (abs) | K_w = 1.0e-14 → pK_w = 14.00; neutrality where [H⁺] = [OH⁻] = √K_w | PASS |
| REF-AB-004 | acid-base | Strong base: pH of 0.010 mol/L NaOH = 12.00 | 12 pH | 0.000001 (abs) | Strong base fully dissociated; pOH = 2.00; pH = pK_w − pOH (NCERT Class XI, Equilibrium) | PASS |
| REF-AB-005 | acid-base | Diprotic strong base: pH of 0.020 mol/L Ca(OH)₂ (fully dissociated) ≈ 12.60 | 12.602 pH | 0.001 (abs) | Full dissociation assumption for Ca(OH)₂ in dilute solution (introductory chemistry convention, NCERT Class XI) | PASS |
| REF-AB-006 | acid-base | Weak acid: pH of 0.100 mol/L acetic acid, K_a = 1.8e-5 → 2.875 (exact quadratic) | 2.8753 pH | 0.001 (abs) | K_a(CH₃COOH) = 1.8×10⁻⁵ (NCERT Class XI, Equilibrium); exact solution of x² + K_a·x − K_a·C = 0 | PASS |
| REF-AB-007 | acid-base | Weak base: pH of 0.100 mol/L NH₃, K_b = 1.8e-5 → 11.12 (exact quadratic) | 11.125 pH | 0.001 (abs) | K_b(NH₃/NH₄OH) = 1.8×10⁻⁵ (NCERT Class XI, Equilibrium); exact solution of x² + K_b·x − K_b·C = 0; pH = pK_w − pOH | PASS |
| REF-AB-008 | acid-base | pH + pOH = 14.00 at 25 °C (K_w = 1e-14): pH(pOH = 2) = 12.00 | 12 pH | 0.000001 (abs) | Definition pK_w = pH + pOH with the conventional 25 °C K_w | PASS |
| REF-AB-009 | acid-base | Neutral pH under the K_w = 1e-14 convention: 7.000 | 7 pH | 0.000001 (abs) | [H⁺] = [OH⁻] = √K_w at neutrality | PASS |
| REF-AB-010 | acid-base | Round trip: pH 3.00 → [H⁺] = 1.0e-3 mol/L → pH 3.00 | 3 pH | 1e-12 (abs) | Definition pH = −log₁₀[H⁺] | PASS |

Totals: 52 cases across 8 models — 12 unit-system, 4 constants-registry, 2 elements-registry,
8 molar-mass, 6 chemical-quantity, 5 reaction-stoichiometry, 5 reaction, 10 acid-base.

**Caveat (policy):** an automated pass proves the implementation reproduces independently
sourced or independently derived numbers within stated tolerances. It does **not** prove scientific
correctness of the model for every context, and it does not replace qualified human review
(`docs/science/validation-policy.md`). Every model remains `pending_scientific_review`.
