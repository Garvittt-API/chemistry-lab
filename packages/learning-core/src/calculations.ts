import {
  ENGINE_NAME,
  ENGINE_VERSION,
  amountFromConcentrationVolume,
  balanceReaction,
  convert,
  dilutionFinalConcentration,
  dilutionFinalVolume,
  dilutionRequiredStockVolume,
  formatReaction,
  getModel,
  limitingReagent,
  massFromMoles,
  molarConcentration,
  molarMass,
  molarMassBreakdown,
  molesFromMass,
  percentYield,
  pohFromPh,
  roundToSignificantFigures,
  strongAcidSolution,
  strongBaseSolution,
  theoreticalYield,
  weakAcidSolution,
  weakBaseSolution,
  type ReagentAmount,
} from "@virtual-chemistry-lab/simulation-core";

import { calculationRecordSchema, type CalculationRecord } from "./schemas.js";

function nextCalcId(prefix: string): string {
  return `calc-${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function modelProvenance(modelId: string): CalculationRecord["provenance"] {
  const model = getModel(modelId);
  return {
    source: "engine_calculated",
    engineName: ENGINE_NAME,
    engineVersion: ENGINE_VERSION,
    modelId: model.id,
    modelVersion: model.version,
    verificationStatus: `reference-verified (${model.verification.independentScientificReview})`,
  };
}

function sigFigString(value: number, sigFigs = 4): string {
  const rounded = roundToSignificantFigures(value, sigFigs);
  if (Math.abs(rounded) > 0 && (Math.abs(rounded) < 1e-3 || Math.abs(rounded) >= 1e5)) {
    return rounded.toExponential(sigFigs - 1);
  }
  const magnitude = rounded === 0 ? 0 : Math.floor(Math.log10(Math.abs(rounded)));
  const decimals = Math.max(0, sigFigs - 1 - magnitude);
  return rounded.toFixed(Math.min(decimals, 6));
}

export function runMolarMassCalculation(formula: string, id = nextCalcId("mm")): CalculationRecord {
  const trimmed = formula.trim();
  const breakdown = molarMassBreakdown(trimmed);
  const model = getModel("molar-mass");

  const termStrings = breakdown.breakdown.map(
    (entry) =>
      `${entry.count} × Aᵣ(${entry.symbol} = ${entry.atomicWeight} g/mol) = ${entry.massContribution.toFixed(3)} g/mol`,
  );

  return calculationRecordSchema.parse({
    id,
    timestamp: new Date().toISOString(),
    kind: "molar_mass",
    title: `Molar mass of ${trimmed}`,
    inputs: [{ name: "Chemical formula", symbol: "formula", value: trimmed, unit: "formula" }],
    formula: "M = Σ νᵢ Aᵣ(Eᵢ)",
    steps: [
      `Parse formula "${trimmed}" into elemental stoichiometric counts.`,
      ...termStrings,
      `Sum elemental contributions: M(${trimmed}) = ${breakdown.molarMass.toFixed(4)} g/mol.`,
    ],
    result: {
      label: `M(${trimmed})`,
      value: breakdown.molarMass,
      formattedValue: breakdown.molarMass.toFixed(3),
      unit: "g/mol",
      secondaryOutputs: breakdown.breakdown.map((entry) => ({
        label: `${entry.symbol} (${entry.count} atom${entry.count === 1 ? "" : "s"})`,
        value: entry.massContribution,
        formattedValue: entry.massContribution.toFixed(3),
        unit: "g/mol",
      })),
    },
    assumptions: [...model.assumptions],
    limitations: [...model.limitations],
    precisionConvention:
      "Displayed to 3 decimal places using CIAAW 2021 abridged standard atomic weights; full precision retained internally.",
    provenance: modelProvenance("molar-mass"),
  });
}

export interface MolesMassCalculationInput {
  readonly mode: "moles_from_mass" | "mass_from_moles";
  readonly formula: string;
  readonly quantity: number;
  readonly unit: "g" | "mg" | "kg" | "mol" | "mmol";
}

export function runMolesAndMassCalculation(
  input: MolesMassCalculationInput,
  id = nextCalcId("qty"),
): CalculationRecord {
  const formula = input.formula.trim();
  const mm = molarMass(formula);
  const model = getModel("chemical-quantity");
  const steps: string[] = [
    `Determine formula molar mass via simulation-core: M(${formula}) = ${mm.toFixed(4)} g/mol.`,
  ];

  if (input.mode === "moles_from_mass") {
    if (input.unit !== "g" && input.unit !== "mg" && input.unit !== "kg") {
      throw new Error(`Expected mass unit (g, mg or kg), received "${input.unit}"`);
    }
    const massGrams =
      input.unit === "g" ? input.quantity : convert(input.quantity, input.unit, "g");
    if (input.unit !== "g") {
      steps.push(
        `Convert mass explicitly to grams: ${input.quantity} ${input.unit} = ${massGrams} g.`,
      );
    }
    const n = molesFromMass(massGrams, mm);
    steps.push(
      `Compute n = m / M = ${massGrams} g / ${mm.toFixed(4)} g/mol = ${sigFigString(n, 4)} mol.`,
    );
    return calculationRecordSchema.parse({
      id,
      timestamp: new Date().toISOString(),
      kind: "moles_and_mass",
      title: `Amount of substance in ${input.quantity} ${input.unit} ${formula}`,
      inputs: [
        { name: "Formula", symbol: "formula", value: formula, unit: "formula" },
        { name: "Sample mass", symbol: "m", value: input.quantity, unit: input.unit },
      ],
      formula: "n = m / M",
      steps,
      result: {
        label: `n(${formula})`,
        value: n,
        formattedValue: sigFigString(n, 4),
        unit: "mol",
        secondaryOutputs: [
          {
            label: `M(${formula})`,
            value: mm,
            formattedValue: mm.toFixed(3),
            unit: "g/mol",
          },
          {
            label: `n(${formula}) in mmol`,
            value: convert(n, "mol", "mmol"),
            formattedValue: sigFigString(convert(n, "mol", "mmol"), 4),
            unit: "mmol",
          },
        ],
      },
      assumptions: [...model.assumptions],
      limitations: [...model.limitations],
      precisionConvention: "Displayed to 4 significant figures.",
      provenance: modelProvenance("chemical-quantity"),
    });
  }

  if (input.unit !== "mol" && input.unit !== "mmol") {
    throw new Error(`Expected amount unit (mol or mmol), received "${input.unit}"`);
  }
  const amountMol =
    input.unit === "mol" ? input.quantity : convert(input.quantity, input.unit, "mol");
  if (input.unit !== "mol") {
    steps.push(
      `Convert amount explicitly to moles: ${input.quantity} ${input.unit} = ${amountMol} mol.`,
    );
  }
  const massG = massFromMoles(amountMol, mm);
  steps.push(
    `Compute m = n × M = ${amountMol} mol × ${mm.toFixed(4)} g/mol = ${sigFigString(massG, 4)} g.`,
  );
  return calculationRecordSchema.parse({
    id,
    timestamp: new Date().toISOString(),
    kind: "moles_and_mass",
    title: `Mass of ${input.quantity} ${input.unit} ${formula}`,
    inputs: [
      { name: "Formula", symbol: "formula", value: formula, unit: "formula" },
      { name: "Amount of substance", symbol: "n", value: input.quantity, unit: input.unit },
    ],
    formula: "m = n × M",
    steps,
    result: {
      label: `m(${formula})`,
      value: massG,
      formattedValue: sigFigString(massG, 4),
      unit: "g",
      secondaryOutputs: [
        {
          label: `M(${formula})`,
          value: mm,
          formattedValue: mm.toFixed(3),
          unit: "g/mol",
        },
      ],
    },
    assumptions: [...model.assumptions],
    limitations: [...model.limitations],
    precisionConvention: "Displayed to 4 significant figures.",
    provenance: modelProvenance("chemical-quantity"),
  });
}

export interface MolarityCalculationInput {
  readonly solveFor: "molarity" | "amount";
  readonly amountValue?: number;
  readonly amountUnit?: "mol" | "mmol";
  readonly molarityValue?: number;
  readonly volumeValue: number;
  readonly volumeUnit: "L" | "mL";
}

export function runMolarityCalculation(
  input: MolarityCalculationInput,
  id = nextCalcId("mol"),
): CalculationRecord {
  const model = getModel("chemical-quantity");
  const volumeL =
    input.volumeUnit === "L" ? input.volumeValue : convert(input.volumeValue, "mL", "L");
  const steps: string[] = [];
  if (input.volumeUnit === "mL") {
    steps.push(`Convert solution volume explicitly: V = ${input.volumeValue} mL = ${volumeL} L.`);
  }

  if (input.solveFor === "molarity") {
    const aUnit = input.amountUnit ?? "mol";
    const rawN = input.amountValue ?? 0;
    const nMol = aUnit === "mol" ? rawN : convert(rawN, "mmol", "mol");
    if (aUnit === "mmol") {
      steps.push(`Convert solute amount explicitly: n = ${rawN} mmol = ${nMol} mol.`);
    }
    const c = molarConcentration(nMol, volumeL);
    steps.push(
      `Compute molar concentration: c = n / V = ${nMol} mol / ${volumeL} L = ${sigFigString(c, 4)} mol/L.`,
    );
    return calculationRecordSchema.parse({
      id,
      timestamp: new Date().toISOString(),
      kind: "molarity",
      title: "Molar concentration (c = n / V)",
      inputs: [
        { name: "Amount of solute", symbol: "n", value: rawN, unit: aUnit },
        {
          name: "Total solution volume",
          symbol: "V",
          value: input.volumeValue,
          unit: input.volumeUnit,
        },
      ],
      formula: "c = n / V",
      steps,
      result: {
        label: "Molarity c",
        value: c,
        formattedValue: sigFigString(c, 4),
        unit: "mol/L",
        secondaryOutputs: [],
      },
      assumptions: [...model.assumptions],
      limitations: [...model.limitations],
      precisionConvention: "Displayed to 4 significant figures.",
      provenance: modelProvenance("chemical-quantity"),
    });
  }

  const cVal = input.molarityValue ?? 0;
  const n = amountFromConcentrationVolume(cVal, volumeL);
  steps.push(
    `Compute dissolved solute amount: n = c × V = ${cVal} mol/L × ${volumeL} L = ${sigFigString(n, 4)} mol.`,
  );
  return calculationRecordSchema.parse({
    id,
    timestamp: new Date().toISOString(),
    kind: "molarity",
    title: "Dissolved solute amount (n = c × V)",
    inputs: [
      { name: "Molar concentration", symbol: "c", value: cVal, unit: "mol/L" },
      { name: "Solution volume", symbol: "V", value: input.volumeValue, unit: input.volumeUnit },
    ],
    formula: "n = c × V",
    steps,
    result: {
      label: "Solute amount n",
      value: n,
      formattedValue: sigFigString(n, 4),
      unit: "mol",
      secondaryOutputs: [
        {
          label: "Solute amount in mmol",
          value: convert(n, "mol", "mmol"),
          formattedValue: sigFigString(convert(n, "mol", "mmol"), 4),
          unit: "mmol",
        },
      ],
    },
    assumptions: [...model.assumptions],
    limitations: [...model.limitations],
    precisionConvention: "Displayed to 4 significant figures.",
    provenance: modelProvenance("chemical-quantity"),
  });
}

export interface DilutionCalculationInput {
  readonly solveFor: "final_concentration" | "required_stock_volume" | "final_volume";
  readonly stockConcentrationMolL: number;
  readonly stockVolume?: number;
  readonly finalConcentrationMolL?: number;
  readonly finalVolume?: number;
  readonly volumeUnit: "mL" | "L";
}

export function runDilutionCalculation(
  input: DilutionCalculationInput,
  id = nextCalcId("dil"),
): CalculationRecord {
  const model = getModel("chemical-quantity");
  const u = input.volumeUnit;

  if (input.solveFor === "final_concentration") {
    const v1Raw = input.stockVolume ?? 0;
    const v2Raw = input.finalVolume ?? 0;
    const v1L = u === "L" ? v1Raw : convert(v1Raw, "mL", "L");
    const v2L = u === "L" ? v2Raw : convert(v2Raw, "mL", "L");
    const c2 = dilutionFinalConcentration(input.stockConcentrationMolL, v1L, v2L);
    const moles = amountFromConcentrationVolume(input.stockConcentrationMolL, v1L);
    return calculationRecordSchema.parse({
      id,
      timestamp: new Date().toISOString(),
      kind: "dilution",
      title: "Dilution final concentration (c₁V₁ = c₂V₂)",
      inputs: [
        {
          name: "Stock concentration",
          symbol: "c₁",
          value: input.stockConcentrationMolL,
          unit: "mol/L",
        },
        { name: "Stock aliquot volume", symbol: "V₁", value: v1Raw, unit: u },
        { name: "Final solution volume", symbol: "V₂", value: v2Raw, unit: u },
      ],
      formula: "c₂ = (c₁ × V₁) / V₂",
      steps: [
        u === "mL"
          ? `Convert volumes explicitly to litres: V₁ = ${v1Raw} mL = ${v1L} L, V₂ = ${v2Raw} mL = ${v2L} L.`
          : `Volumes supplied in litres: V₁ = ${v1L} L, V₂ = ${v2L} L.`,
        `Conserved solute amount: n = c₁ × V₁ = ${sigFigString(moles, 4)} mol.`,
        `Compute c₂ = (${input.stockConcentrationMolL} mol/L × ${v1L} L) / ${v2L} L = ${sigFigString(c2, 4)} mol/L.`,
      ],
      result: {
        label: "Final concentration c₂",
        value: c2,
        formattedValue: sigFigString(c2, 4),
        unit: "mol/L",
        secondaryOutputs: [
          {
            label: "Conserved solute n",
            value: moles,
            formattedValue: sigFigString(moles, 4),
            unit: "mol",
          },
          {
            label: "Dilution factor (V₂ / V₁)",
            value: v2L / v1L,
            formattedValue: sigFigString(v2L / v1L, 3),
            unit: "dimensionless",
          },
        ],
      },
      assumptions: [...model.assumptions],
      limitations: [...model.limitations],
      precisionConvention: "Displayed to 4 significant figures.",
      provenance: modelProvenance("chemical-quantity"),
    });
  }

  if (input.solveFor === "required_stock_volume") {
    const c2 = input.finalConcentrationMolL ?? 0;
    const v2Raw = input.finalVolume ?? 0;
    const v2L = u === "L" ? v2Raw : convert(v2Raw, "mL", "L");
    const v1L = dilutionRequiredStockVolume(c2, v2L, input.stockConcentrationMolL);
    const v1Out = u === "L" ? v1L : convert(v1L, "L", "mL");
    return calculationRecordSchema.parse({
      id,
      timestamp: new Date().toISOString(),
      kind: "dilution",
      title: "Required stock aliquot volume (V₁ = c₂V₂ / c₁)",
      inputs: [
        {
          name: "Stock concentration",
          symbol: "c₁",
          value: input.stockConcentrationMolL,
          unit: "mol/L",
        },
        { name: "Target concentration", symbol: "c₂", value: c2, unit: "mol/L" },
        { name: "Final volume", symbol: "V₂", value: v2Raw, unit: u },
      ],
      formula: "V₁ = (c₂ × V₂) / c₁",
      steps: [
        `Convert V₂ to litres if needed: V₂ = ${v2L} L.`,
        `Compute V₁ = (${c2} mol/L × ${v2L} L) / ${input.stockConcentrationMolL} mol/L = ${v1L} L.`,
        `Express in requested volume unit (${u}): V₁ = ${sigFigString(v1Out, 4)} ${u}.`,
      ],
      result: {
        label: "Required stock volume V₁",
        value: v1Out,
        formattedValue: sigFigString(v1Out, 4),
        unit: u,
        secondaryOutputs: [],
      },
      assumptions: [...model.assumptions],
      limitations: [...model.limitations],
      precisionConvention: "Displayed to 4 significant figures.",
      provenance: modelProvenance("chemical-quantity"),
    });
  }

  const c2 = input.finalConcentrationMolL ?? 0;
  const v1Raw = input.stockVolume ?? 0;
  const v1L = u === "L" ? v1Raw : convert(v1Raw, "mL", "L");
  const v2L = dilutionFinalVolume(input.stockConcentrationMolL, v1L, c2);
  const v2Out = u === "L" ? v2L : convert(v2L, "L", "mL");
  return calculationRecordSchema.parse({
    id,
    timestamp: new Date().toISOString(),
    kind: "dilution",
    title: "Target final dilution volume (V₂ = c₁V₁ / c₂)",
    inputs: [
      {
        name: "Stock concentration",
        symbol: "c₁",
        value: input.stockConcentrationMolL,
        unit: "mol/L",
      },
      { name: "Stock aliquot volume", symbol: "V₁", value: v1Raw, unit: u },
      { name: "Target concentration", symbol: "c₂", value: c2, unit: "mol/L" },
    ],
    formula: "V₂ = (c₁ × V₁) / c₂",
    steps: [
      `Convert V₁ to litres if needed: V₁ = ${v1L} L.`,
      `Compute V₂ = (${input.stockConcentrationMolL} mol/L × ${v1L} L) / ${c2} mol/L = ${v2L} L.`,
      `Express in ${u}: V₂ = ${sigFigString(v2Out, 4)} ${u}.`,
    ],
    result: {
      label: "Final volume V₂",
      value: v2Out,
      formattedValue: sigFigString(v2Out, 4),
      unit: u,
      secondaryOutputs: [],
    },
    assumptions: [...model.assumptions],
    limitations: [...model.limitations],
    precisionConvention: "Displayed to 4 significant figures.",
    provenance: modelProvenance("chemical-quantity"),
  });
}

export function runReactionBalancingCalculation(
  unbalancedOrProposedEquation: string,
  id = nextCalcId("rxn"),
): CalculationRecord {
  const model = getModel("reaction");
  const balanced = balanceReaction(unbalancedOrProposedEquation);
  const formatted = formatReaction(balanced.reactants, balanced.products);

  return calculationRecordSchema.parse({
    id,
    timestamp: new Date().toISOString(),
    kind: "reaction_balancing",
    title: "Exact rational equation balancing",
    inputs: [
      {
        name: "Proposed reaction",
        symbol: "rxn",
        value: unbalancedOrProposedEquation.trim(),
        unit: "equation",
      },
    ],
    formula: "A · ν = 0 (exact BigInt rational nullspace; gcd(νᵢ) = 1)",
    steps: [
      `Parse reactant and product formulas and ionic charges.`,
      `Construct atom-and-charge conservation matrix and compute unique 1D rational nullspace.`,
      `Scale to lowest-terms positive integer stoichiometric coefficients: ${formatted}.`,
    ],
    result: {
      label: "Balanced equation",
      value: formatted,
      formattedValue: formatted,
      unit: "equation",
      secondaryOutputs: [
        ...balanced.reactants.map((r) => ({
          label: `Reactant ν(${r.formula})`,
          value: r.coefficient,
          formattedValue: String(r.coefficient),
          unit: "dimensionless",
        })),
        ...balanced.products.map((p) => ({
          label: `Product ν(${p.formula})`,
          value: p.coefficient,
          formattedValue: String(p.coefficient),
          unit: "dimensionless",
        })),
      ],
    },
    assumptions: [...model.assumptions],
    limitations: [...model.limitations],
    precisionConvention: "Exact positive integers (zero floating-point tolerance).",
    provenance: modelProvenance("reaction"),
  });
}

export interface StoichiometryCalculationInput {
  readonly equation: string;
  readonly reagents: ReadonlyArray<ReagentAmount>;
  readonly targetProductFormula: string;
}

export function runStoichiometryCalculation(
  input: StoichiometryCalculationInput,
  id = nextCalcId("stoich"),
): CalculationRecord {
  const model = getModel("reaction-stoichiometry");
  const balanced = balanceReaction(input.equation);
  const balancedStr = formatReaction(balanced.reactants, balanced.products);
  const lim = limitingReagent(balanced, input.reagents);
  const theo = theoreticalYield(balanced, input.reagents, input.targetProductFormula);

  const steps: string[] = [
    `Verify balanced reaction via simulation-core: ${balancedStr}.`,
    ...lim.reagents.map(
      (r) =>
        `Reactant ${r.formula}: n₀ / ν = ${r.amountMoles} mol / ${r.coefficient} = ${sigFigString(r.maxExtentMoles, 4)} mol${r.isLimiting ? " (limiting)" : ""}.`,
    ),
    `Maximum reaction extent ξ_max = ${sigFigString(lim.extentMoles, 4)} mol; limiting reagent(s): ${lim.limitingReagents.join(", ")}.`,
    `Theoretical yield of ${theo.productFormula}: n = ${sigFigString(theo.amountMoles, 4)} mol (${sigFigString(theo.massGrams, 4)} g).`,
  ];

  return calculationRecordSchema.parse({
    id,
    timestamp: new Date().toISOString(),
    kind: "stoichiometry_limiting_reagent",
    title: `Limiting reagent & theoretical yield of ${theo.productFormula}`,
    inputs: [
      { name: "Reaction", symbol: "rxn", value: balancedStr, unit: "equation" },
      ...input.reagents.map((r) => ({
        name: `Initial ${r.formula}`,
        symbol: `n₀(${r.formula})`,
        value: r.amountMoles,
        unit: "mol",
      })),
    ],
    formula: "ξ_max = minᵢ(nᵢ⁰ / νᵢ) ;  n_product = ν_product × ξ_max",
    steps,
    result: {
      label: `Theoretical yield (${theo.productFormula})`,
      value: theo.massGrams,
      formattedValue: `${sigFigString(theo.massGrams, 4)} g (${sigFigString(theo.amountMoles, 4)} mol)`,
      unit: "g",
      secondaryOutputs: [
        {
          label: "Limiting reagent(s)",
          value: lim.limitingReagents.join(", "),
          formattedValue: lim.limitingReagents.join(", "),
          unit: "species",
        },
        {
          label: "Reaction extent ξ_max",
          value: lim.extentMoles,
          formattedValue: sigFigString(lim.extentMoles, 4),
          unit: "mol",
        },
        ...lim.reagents.map((r) => ({
          label: `Excess remaining ${r.formula}`,
          value: r.remainingMoles,
          formattedValue: sigFigString(r.remainingMoles, 4),
          unit: "mol",
        })),
      ],
    },
    assumptions: [...model.assumptions],
    limitations: [...model.limitations],
    precisionConvention:
      "Exact rational stoichiometric coefficients; extents and masses displayed to 4 significant figures.",
    provenance: modelProvenance("reaction-stoichiometry"),
  });
}

export interface PercentYieldCalculationInput {
  readonly actualYield: number;
  readonly theoreticalYield: number;
  readonly unit: "g" | "mol";
}

export function runPercentYieldCalculation(
  input: PercentYieldCalculationInput,
  id = nextCalcId("yld"),
): CalculationRecord {
  const model = getModel("chemical-quantity");
  const pct = percentYield(input.actualYield, input.theoreticalYield);
  const warnings: string[] = [];
  if (pct > 100) {
    warnings.push(
      "Apparent percentage yield exceeds 100 %. Value is intentionally NOT clamped: check for residual solvent/moisture, co-precipitated impurities or balance error.",
    );
  }

  return calculationRecordSchema.parse({
    id,
    timestamp: new Date().toISOString(),
    kind: "percent_yield",
    title: "Percentage yield",
    inputs: [
      {
        name: "Actual isolated yield",
        symbol: "y_actual",
        value: input.actualYield,
        unit: input.unit,
      },
      {
        name: "Theoretical yield",
        symbol: "y_theor",
        value: input.theoreticalYield,
        unit: input.unit,
      },
    ],
    formula: "% yield = (actual / theoretical) × 100 %",
    steps: [
      `Confirm identical units (${input.unit}) for actual and theoretical yield.`,
      `Compute (${input.actualYield} ${input.unit} / ${input.theoreticalYield} ${input.unit}) × 100 % = ${pct.toFixed(2)} %.`,
    ],
    result: {
      label: "Percentage yield",
      value: pct,
      formattedValue: pct.toFixed(2),
      unit: "%",
      secondaryOutputs: [],
    },
    assumptions: [...model.assumptions],
    limitations: [...model.limitations],
    precisionConvention: "Displayed to 2 decimal places; never artificially clamped at 100 %.",
    warnings,
    provenance: modelProvenance("chemical-quantity"),
  });
}

export interface AcidBasePhCalculationInput {
  readonly systemKind: "strong_acid" | "strong_base" | "weak_acid" | "weak_base";
  readonly concentrationMolL: number;
  readonly kaOrKb?: number;
}

export function runAcidBasePhCalculation(
  input: AcidBasePhCalculationInput,
  id = nextCalcId("ph"),
): CalculationRecord {
  const model = getModel("acid-base");
  const warnings: string[] = [];
  if (input.concentrationMolL > 0.1) {
    warnings.push(
      "Analytical concentration exceeds 0.1 mol/L: ionic-strength activity effects become significant and dilute-solution ideal pH deviates from glass-electrode activity readings.",
    );
  }

  if (input.systemKind === "strong_acid") {
    const res = strongAcidSolution(input.concentrationMolL, 1);
    return calculationRecordSchema.parse({
      id,
      timestamp: new Date().toISOString(),
      kind: "acid_base_ph",
      title: "Strong monoprotic acid pH & pOH (25 °C)",
      inputs: [
        {
          name: "Analytical concentration",
          symbol: "c",
          value: input.concentrationMolL,
          unit: "mol/L",
        },
      ],
      formula: "[H⁺] = (c + √(c² + 4K_w)) / 2 ;  pH = −log₁₀([H⁺]/c°)",
      steps: [
        `Solve exact water-coupled electroneutrality quadratic at 25 °C (K_w = 1.0 × 10⁻¹⁴).`,
        `[H⁺] = ${res.hydrogenConcentration.toExponential(3)} mol/L; [OH⁻] = ${res.hydroxideConcentration.toExponential(3)} mol/L.`,
        `pH = ${res.ph.toFixed(2)}, pOH = ${res.poh.toFixed(2)}.`,
      ],
      result: {
        label: "pH (25 °C)",
        value: res.ph,
        formattedValue: res.ph.toFixed(2),
        unit: "pH",
        secondaryOutputs: [
          { label: "pOH", value: res.poh, formattedValue: res.poh.toFixed(2), unit: "pOH" },
          {
            label: "[H⁺]",
            value: res.hydrogenConcentration,
            formattedValue: res.hydrogenConcentration.toExponential(3),
            unit: "mol/L",
          },
          {
            label: "[OH⁻]",
            value: res.hydroxideConcentration,
            formattedValue: res.hydroxideConcentration.toExponential(3),
            unit: "mol/L",
          },
        ],
      },
      assumptions: [...model.assumptions],
      limitations: [...model.limitations],
      precisionConvention:
        "pH and pOH displayed to 2 decimal places (standard pH-meter convention).",
      warnings,
      provenance: modelProvenance("acid-base"),
    });
  }

  if (input.systemKind === "strong_base") {
    const res = strongBaseSolution(input.concentrationMolL, 1);
    return calculationRecordSchema.parse({
      id,
      timestamp: new Date().toISOString(),
      kind: "acid_base_ph",
      title: "Strong monoprotic base pH & pOH (25 °C)",
      inputs: [
        {
          name: "Analytical concentration",
          symbol: "c",
          value: input.concentrationMolL,
          unit: "mol/L",
        },
      ],
      formula: "[OH⁻] = (c + √(c² + 4K_w)) / 2 ;  pH = 14.00 − pOH",
      steps: [
        `Solve exact water-coupled quadratic for [OH⁻] at 25 °C (K_w = 1.0 × 10⁻¹⁴).`,
        `[OH⁻] = ${res.hydroxideConcentration.toExponential(3)} mol/L; pOH = ${res.poh.toFixed(2)}.`,
        `pH = ${res.ph.toFixed(2)}.`,
      ],
      result: {
        label: "pH (25 °C)",
        value: res.ph,
        formattedValue: res.ph.toFixed(2),
        unit: "pH",
        secondaryOutputs: [
          { label: "pOH", value: res.poh, formattedValue: res.poh.toFixed(2), unit: "pOH" },
          {
            label: "[OH⁻]",
            value: res.hydroxideConcentration,
            formattedValue: res.hydroxideConcentration.toExponential(3),
            unit: "mol/L",
          },
        ],
      },
      assumptions: [...model.assumptions],
      limitations: [...model.limitations],
      precisionConvention: "pH and pOH displayed to 2 decimal places.",
      warnings,
      provenance: modelProvenance("acid-base"),
    });
  }

  const eqConst = input.kaOrKb ?? 1.75e-5;
  if (input.systemKind === "weak_acid") {
    const res = weakAcidSolution(input.concentrationMolL, eqConst);
    const poh = pohFromPh(res.ph);
    return calculationRecordSchema.parse({
      id,
      timestamp: new Date().toISOString(),
      kind: "acid_base_ph",
      title: "Weak monoprotic acid pH & dissociation (25 °C)",
      inputs: [
        {
          name: "Analytical concentration",
          symbol: "c",
          value: input.concentrationMolL,
          unit: "mol/L",
        },
        { name: "Acid dissociation constant", symbol: "Kₐ", value: eqConst, unit: "dimensionless" },
      ],
      formula: "x² + Kₐx − Kₐc = 0 ;  pH = −log₁₀(x / c°)",
      steps: [
        `Solve exact quadratic x = (−Kₐ + √(Kₐ² + 4Kₐc)) / 2 = ${res.hydrogenConcentration.toExponential(3)} mol/L.`,
        `Degree of dissociation α = x / c = ${(res.degreeOfDissociation * 100).toFixed(2)} % (${res.approximationValidAt5Percent ? "5 % approximation valid" : "5 % approximation invalid; exact root used"}).`,
        `pH = ${res.ph.toFixed(2)}, pOH = ${poh.toFixed(2)}.`,
      ],
      result: {
        label: "pH (25 °C)",
        value: res.ph,
        formattedValue: res.ph.toFixed(2),
        unit: "pH",
        secondaryOutputs: [
          { label: "pOH", value: poh, formattedValue: poh.toFixed(2), unit: "pOH" },
          {
            label: "Degree of dissociation α",
            value: res.degreeOfDissociation,
            formattedValue: res.degreeOfDissociation.toFixed(4),
            unit: "dimensionless",
          },
        ],
      },
      assumptions: [...model.assumptions],
      limitations: [...model.limitations],
      precisionConvention: "pH displayed to 2 decimal places; exact quadratic root reported.",
      warnings,
      provenance: modelProvenance("acid-base"),
    });
  }

  const res = weakBaseSolution(input.concentrationMolL, eqConst);
  return calculationRecordSchema.parse({
    id,
    timestamp: new Date().toISOString(),
    kind: "acid_base_ph",
    title: "Weak monoprotic base pH & dissociation (25 °C)",
    inputs: [
      {
        name: "Analytical concentration",
        symbol: "c",
        value: input.concentrationMolL,
        unit: "mol/L",
      },
      { name: "Base dissociation constant", symbol: "K_b", value: eqConst, unit: "dimensionless" },
    ],
    formula: "x² + K_b x − K_b c = 0 ;  pOH = −log₁₀(x / c°) ;  pH = 14.00 − pOH",
    steps: [
      `Solve exact quadratic for [OH⁻] = ${res.hydroxideConcentration.toExponential(3)} mol/L.`,
      `Degree of ionization α = ${(res.degreeOfDissociation * 100).toFixed(2)} %.`,
      `pOH = ${res.poh.toFixed(2)}, pH = ${res.ph.toFixed(2)}.`,
    ],
    result: {
      label: "pH (25 °C)",
      value: res.ph,
      formattedValue: res.ph.toFixed(2),
      unit: "pH",
      secondaryOutputs: [
        { label: "pOH", value: res.poh, formattedValue: res.poh.toFixed(2), unit: "pOH" },
        {
          label: "Degree of ionization α",
          value: res.degreeOfDissociation,
          formattedValue: res.degreeOfDissociation.toFixed(4),
          unit: "dimensionless",
        },
      ],
    },
    assumptions: [...model.assumptions],
    limitations: [...model.limitations],
    precisionConvention: "pH displayed to 2 decimal places; exact quadratic root reported.",
    warnings,
    provenance: modelProvenance("acid-base"),
  });
}
