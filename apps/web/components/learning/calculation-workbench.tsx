"use client";

import {
  runAcidBasePhCalculation,
  runDilutionCalculation,
  runMolarityCalculation,
  runMolarMassCalculation,
  runMolesAndMassCalculation,
  runPercentYieldCalculation,
  runReactionBalancingCalculation,
  runStoichiometryCalculation,
  type CalculationKind,
  type CalculationRecord,
} from "@virtual-chemistry-lab/learning-core";
import { Calculator, PlusCircle } from "lucide-react";
import { useState } from "react";

const CALC_OPTIONS: Array<{ kind: CalculationKind; label: string }> = [
  { kind: "molar_mass", label: "Molar Mass (CIAAW 2021)" },
  { kind: "moles_and_mass", label: "Moles ↔ Mass Conversion" },
  { kind: "molarity", label: "Solution Molarity (c = n / V)" },
  { kind: "dilution", label: "Solution Dilution (c1 V1 = c2 V2)" },
  { kind: "reaction_balancing", label: "Exact Equation Balancing" },
  { kind: "stoichiometry_limiting_reagent", label: "Limiting Reagent & Theoretical Yield" },
  { kind: "percent_yield", label: "Percentage Yield" },
  { kind: "acid_base_ph", label: "Dilute Acid/Base pH & pOH (25 °C)" },
];

export function CalculationWorkbench({
  onSaveCalculation,
}: Readonly<{
  onSaveCalculation: (record: CalculationRecord) => void;
}>) {
  const [kind, setKind] = useState<CalculationKind>("dilution");
  const [formula, setFormula] = useState("CuSO4·5H2O");
  const [mmMode, setMmMode] = useState<"moles_from_mass" | "mass_from_moles">("moles_from_mass");
  const [quantity, setQuantity] = useState("5.00");
  const [qtyUnit, setQtyUnit] = useState<"g" | "mg" | "kg" | "mol" | "mmol">("g");

  const [molSolveFor, setMolSolveFor] = useState<"molarity" | "amount">("molarity");
  const [amountVal, setAmountVal] = useState("0.025");
  const [amountUnit, setAmountUnit] = useState<"mol" | "mmol">("mol");
  const [molarityVal, setMolarityVal] = useState("0.100");
  const [volVal, setVolVal] = useState("250");
  const [volUnit, setVolUnit] = useState<"mL" | "L">("mL");

  const [dilSolveFor, setDilSolveFor] = useState<
    "final_concentration" | "required_stock_volume" | "final_volume"
  >("final_concentration");
  const [c1Val, setC1Val] = useState("0.500");
  const [v1Val, setV1Val] = useState("10.0");
  const [c2Val, setC2Val] = useState("0.050");
  const [v2Val, setV2Val] = useState("100.0");
  const [dilVolUnit, setDilVolUnit] = useState<"mL" | "L">("mL");

  const [equation, setEquation] = useState("H2C2O4 + NaOH -> Na2C2O4 + H2O");
  const [reagentAFormula, setReagentAFormula] = useState("H2C2O4");
  const [reagentAMoles, setReagentAMoles] = useState("0.050");
  const [reagentBFormula, setReagentBFormula] = useState("NaOH");
  const [reagentBMoles, setReagentBMoles] = useState("0.080");
  const [productFormula, setProductFormula] = useState("Na2C2O4");

  const [actualYield, setActualYield] = useState("4.20");
  const [theorYield, setTheorYield] = useState("5.00");
  const [yieldUnit, setYieldUnit] = useState<"g" | "mol">("g");

  const [phSystem, setPhSystem] = useState<
    "strong_acid" | "strong_base" | "weak_acid" | "weak_base"
  >("strong_acid");
  const [phConc, setPhConc] = useState("0.010");
  const [kaKb, setKaKb] = useState("1.75e-5");

  const [preview, setPreview] = useState<CalculationRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCompute = (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);
    try {
      let computed: CalculationRecord;
      switch (kind) {
        case "molar_mass":
          computed = runMolarMassCalculation(formula);
          break;
        case "moles_and_mass":
          computed = runMolesAndMassCalculation({
            mode: mmMode,
            formula,
            quantity: Number(quantity),
            unit: qtyUnit,
          });
          break;
        case "molarity":
          computed = runMolarityCalculation({
            solveFor: molSolveFor,
            amountValue: Number(amountVal),
            amountUnit,
            molarityValue: Number(molarityVal),
            volumeValue: Number(volVal),
            volumeUnit: volUnit,
          });
          break;
        case "dilution":
          computed = runDilutionCalculation({
            solveFor: dilSolveFor,
            stockConcentrationMolL: Number(c1Val),
            stockVolume: Number(v1Val),
            finalConcentrationMolL: Number(c2Val),
            finalVolume: Number(v2Val),
            volumeUnit: dilVolUnit,
          });
          break;
        case "reaction_balancing":
          computed = runReactionBalancingCalculation(equation);
          break;
        case "stoichiometry_limiting_reagent":
          computed = runStoichiometryCalculation({
            equation,
            reagents: [
              { formula: reagentAFormula.trim(), amountMoles: Number(reagentAMoles) },
              { formula: reagentBFormula.trim(), amountMoles: Number(reagentBMoles) },
            ],
            targetProductFormula: productFormula.trim(),
          });
          break;
        case "percent_yield":
          computed = runPercentYieldCalculation({
            actualYield: Number(actualYield),
            theoreticalYield: Number(theorYield),
            unit: yieldUnit,
          });
          break;
        case "acid_base_ph":
          computed = runAcidBasePhCalculation({
            systemKind: phSystem,
            concentrationMolL: Number(phConc),
            kaOrKb: phSystem === "weak_acid" || phSystem === "weak_base" ? Number(kaKb) : undefined,
          });
          break;
      }
      setPreview(computed);
    } catch (err) {
      setPreview(null);
      setErrorMsg(err instanceof Error ? err.message : "Engine calculation failed.");
    }
  };

  return (
    <div className="learning-card">
      <div className="learning-card-header">
        <h3>
          <Calculator size={18} aria-hidden="true" /> Scientific Engine Calculation Workbench
        </h3>
        <span className="status-pill">@virtual-chemistry-lab/simulation-core</span>
      </div>
      <p className="card-meta">
        All formulas execute directly through the deterministic Phase 04 scientific engine — no
        calculations are approximated in UI code.
      </p>

      <form onSubmit={handleCompute} className="pathway-step-list">
        <label className="learning-field">
          Calculation type
          <select
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as CalculationKind);
              setPreview(null);
              setErrorMsg(null);
            }}
          >
            {CALC_OPTIONS.map((opt) => (
              <option key={opt.kind} value={opt.kind}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {kind === "molar_mass" ? (
          <label className="learning-field">
            Chemical formula (supports parentheses and hydrates, e.g. CuSO4·5H2O)
            <input
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              required
            />
          </label>
        ) : null}

        {kind === "moles_and_mass" ? (
          <div className="learning-grid-2">
            <label className="learning-field">
              Conversion direction
              <select
                value={mmMode}
                onChange={(e) => {
                  const nextMode = e.target.value as "moles_from_mass" | "mass_from_moles";
                  setMmMode(nextMode);
                  setQtyUnit(nextMode === "moles_from_mass" ? "g" : "mol");
                }}
              >
                <option value="moles_from_mass">Mass → Amount (mol)</option>
                <option value="mass_from_moles">Amount (mol) → Mass (g)</option>
              </select>
            </label>
            <label className="learning-field">
              Chemical formula
              <input
                type="text"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                required
              />
            </label>
            <label className="learning-field">
              Input quantity
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </label>
            <label className="learning-field">
              Unit
              <select
                value={qtyUnit}
                onChange={(e) => setQtyUnit(e.target.value as typeof qtyUnit)}
              >
                {mmMode === "moles_from_mass" ? (
                  <>
                    <option value="g">g</option>
                    <option value="mg">mg</option>
                    <option value="kg">kg</option>
                  </>
                ) : (
                  <>
                    <option value="mol">mol</option>
                    <option value="mmol">mmol</option>
                  </>
                )}
              </select>
            </label>
          </div>
        ) : null}

        {kind === "molarity" ? (
          <div className="learning-grid-2">
            <label className="learning-field">
              Solve for
              <select
                value={molSolveFor}
                onChange={(e) => setMolSolveFor(e.target.value as "molarity" | "amount")}
              >
                <option value="molarity">Molar concentration c (mol/L)</option>
                <option value="amount">Dissolved solute amount n (mol)</option>
              </select>
            </label>
            {molSolveFor === "molarity" ? (
              <>
                <label className="learning-field">
                  Solute amount n
                  <input
                    type="number"
                    step="any"
                    value={amountVal}
                    onChange={(e) => setAmountVal(e.target.value)}
                    required
                  />
                </label>
                <label className="learning-field">
                  Amount unit
                  <select
                    value={amountUnit}
                    onChange={(e) => setAmountUnit(e.target.value as "mol" | "mmol")}
                  >
                    <option value="mol">mol</option>
                    <option value="mmol">mmol</option>
                  </select>
                </label>
              </>
            ) : (
              <label className="learning-field">
                Molarity c (mol/L)
                <input
                  type="number"
                  step="any"
                  value={molarityVal}
                  onChange={(e) => setMolarityVal(e.target.value)}
                  required
                />
              </label>
            )}
            <label className="learning-field">
              Solution volume V
              <input
                type="number"
                step="any"
                value={volVal}
                onChange={(e) => setVolVal(e.target.value)}
                required
              />
            </label>
            <label className="learning-field">
              Volume unit
              <select value={volUnit} onChange={(e) => setVolUnit(e.target.value as "mL" | "L")}>
                <option value="mL">mL</option>
                <option value="L">L</option>
              </select>
            </label>
          </div>
        ) : null}

        {kind === "dilution" ? (
          <div className="learning-grid-2">
            <label className="learning-field">
              Solve for
              <select
                value={dilSolveFor}
                onChange={(e) => setDilSolveFor(e.target.value as typeof dilSolveFor)}
              >
                <option value="final_concentration">Final concentration c2</option>
                <option value="required_stock_volume">Required stock volume V1</option>
                <option value="final_volume">Final volume V2</option>
              </select>
            </label>
            <label className="learning-field">
              Volume unit
              <select
                value={dilVolUnit}
                onChange={(e) => setDilVolUnit(e.target.value as "mL" | "L")}
              >
                <option value="mL">mL</option>
                <option value="L">L</option>
              </select>
            </label>
            <label className="learning-field">
              Stock concentration c1 (mol/L)
              <input
                type="number"
                step="any"
                value={c1Val}
                onChange={(e) => setC1Val(e.target.value)}
                required
              />
            </label>
            {dilSolveFor !== "required_stock_volume" ? (
              <label className="learning-field">
                Stock aliquot V1 ({dilVolUnit})
                <input
                  type="number"
                  step="any"
                  value={v1Val}
                  onChange={(e) => setV1Val(e.target.value)}
                  required
                />
              </label>
            ) : null}
            {dilSolveFor !== "final_concentration" ? (
              <label className="learning-field">
                Target concentration c2 (mol/L)
                <input
                  type="number"
                  step="any"
                  value={c2Val}
                  onChange={(e) => setC2Val(e.target.value)}
                  required
                />
              </label>
            ) : null}
            {dilSolveFor !== "final_volume" ? (
              <label className="learning-field">
                Final volume V2 ({dilVolUnit})
                <input
                  type="number"
                  step="any"
                  value={v2Val}
                  onChange={(e) => setV2Val(e.target.value)}
                  required
                />
              </label>
            ) : null}
          </div>
        ) : null}

        {kind === "reaction_balancing" ? (
          <label className="learning-field">
            Unbalanced or proposed chemical equation
            <input
              type="text"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              placeholder="e.g. Fe + O2 -> Fe2O3"
              required
            />
          </label>
        ) : null}

        {kind === "stoichiometry_limiting_reagent" ? (
          <div className="learning-grid-2">
            <label className="learning-field" style={{ gridColumn: "1 / -1" }}>
              Reaction equation
              <input
                type="text"
                value={equation}
                onChange={(e) => setEquation(e.target.value)}
                required
              />
            </label>
            <label className="learning-field">
              Reactant A formula
              <input
                type="text"
                value={reagentAFormula}
                onChange={(e) => setReagentAFormula(e.target.value)}
                required
              />
            </label>
            <label className="learning-field">
              Reactant A amount (mol)
              <input
                type="number"
                step="any"
                value={reagentAMoles}
                onChange={(e) => setReagentAMoles(e.target.value)}
                required
              />
            </label>
            <label className="learning-field">
              Reactant B formula
              <input
                type="text"
                value={reagentBFormula}
                onChange={(e) => setReagentBFormula(e.target.value)}
                required
              />
            </label>
            <label className="learning-field">
              Reactant B amount (mol)
              <input
                type="number"
                step="any"
                value={reagentBMoles}
                onChange={(e) => setReagentBMoles(e.target.value)}
                required
              />
            </label>
            <label className="learning-field">
              Target product formula
              <input
                type="text"
                value={productFormula}
                onChange={(e) => setProductFormula(e.target.value)}
                required
              />
            </label>
          </div>
        ) : null}

        {kind === "percent_yield" ? (
          <div className="learning-grid-3">
            <label className="learning-field">
              Actual yield
              <input
                type="number"
                step="any"
                value={actualYield}
                onChange={(e) => setActualYield(e.target.value)}
                required
              />
            </label>
            <label className="learning-field">
              Theoretical yield
              <input
                type="number"
                step="any"
                value={theorYield}
                onChange={(e) => setTheorYield(e.target.value)}
                required
              />
            </label>
            <label className="learning-field">
              Unit
              <select
                value={yieldUnit}
                onChange={(e) => setYieldUnit(e.target.value as "g" | "mol")}
              >
                <option value="g">g</option>
                <option value="mol">mol</option>
              </select>
            </label>
          </div>
        ) : null}

        {kind === "acid_base_ph" ? (
          <div className="learning-grid-3">
            <label className="learning-field">
              Electrolyte model
              <select
                value={phSystem}
                onChange={(e) => setPhSystem(e.target.value as typeof phSystem)}
              >
                <option value="strong_acid">Strong monoprotic acid</option>
                <option value="strong_base">Strong monoprotic base</option>
                <option value="weak_acid">Weak monoprotic acid</option>
                <option value="weak_base">Weak monoprotic base</option>
              </select>
            </label>
            <label className="learning-field">
              Analytical concentration c (mol/L)
              <input
                type="number"
                step="any"
                value={phConc}
                onChange={(e) => setPhConc(e.target.value)}
                required
              />
            </label>
            {phSystem === "weak_acid" || phSystem === "weak_base" ? (
              <label className="learning-field">
                {phSystem === "weak_acid" ? "Ka (25 °C)" : "Kb (25 °C)"}
                <input
                  type="number"
                  step="any"
                  value={kaKb}
                  onChange={(e) => setKaKb(e.target.value)}
                  required
                />
              </label>
            ) : null}
          </div>
        ) : null}

        <div className="notebook-actions-row">
          <button type="submit" className="button">
            <Calculator size={16} aria-hidden="true" /> Compute with engine
          </button>
        </div>
      </form>

      {errorMsg ? (
        <div className="quiz-feedback-fail" role="alert">
          {errorMsg}
        </div>
      ) : null}

      {preview ? (
        <div className="callout-banner" role="region" aria-label="Computed engine output">
          <div className="learning-card-header">
            <h4>{preview.title}</h4>
            <span className="prov-pill prov-pill-engine_calculated">
              {preview.provenance.modelId} v{preview.provenance.modelVersion}
            </span>
          </div>
          <p>
            <strong>Formula:</strong> <code>{preview.formula}</code>
          </p>
          <ol className="calc-step-list">
            {preview.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p>
            <strong>Result:</strong> {preview.result.label} ={" "}
            <code>
              {preview.result.formattedValue} {preview.result.unit}
            </code>
          </p>
          {preview.warnings.length > 0 ? (
            <div className="callout-banner callout-banner-warning">
              {preview.warnings.map((w) => (
                <p key={w}>{w}</p>
              ))}
            </div>
          ) : null}
          <p className="card-meta">
            <strong>Precision:</strong> {preview.precisionConvention} ·{" "}
            <strong>Assumptions:</strong> {preview.assumptions.join(" ")}
          </p>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => onSaveCalculation(preview)}
          >
            <PlusCircle size={15} aria-hidden="true" /> Save calculation to notebook session
          </button>
        </div>
      ) : null}
    </div>
  );
}
