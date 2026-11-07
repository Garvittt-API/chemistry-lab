import { describe, expect, it } from "vitest";

import {
  calculationKindSchema,
  evaluateAssessmentAttempt,
  evaluateSingleQuestion,
  getAssessmentByIdOrSlug,
  runAcidBasePhCalculation,
  runDilutionCalculation,
  runMolarityCalculation,
  runMolarMassCalculation,
  runMolesAndMassCalculation,
  runPercentYieldCalculation,
  runReactionBalancingCalculation,
  runStoichiometryCalculation,
  toLearnerQuestions,
} from "./index.js";

describe("simulation-core backed calculation adapters", () => {
  it("lists all 8 engine-supported calculation types", () => {
    expect(calculationKindSchema.options.length).toBe(8);
  });

  it("computes molar mass with IUPAC atomic weights and model provenance", () => {
    const record = runMolarMassCalculation("CuSO4·5H2O");
    expect(Number(record.result.value)).toBeCloseTo(249.677, 3);
    expect(record.result.unit).toBe("g/mol");
    expect(record.provenance.modelId).toBe("molar-mass");
  });

  it("computes moles-from-mass and mass-from-moles with explicit unit conversions", () => {
    const molesRec = runMolesAndMassCalculation({
      mode: "moles_from_mass",
      formula: "NaCl",
      quantity: 5844,
      unit: "mg",
    });
    expect(Number(molesRec.result.value)).toBeCloseTo(0.1, 3);
    expect(molesRec.result.unit).toBe("mol");

    const massRec = runMolesAndMassCalculation({
      mode: "mass_from_moles",
      formula: "NaOH",
      quantity: 50,
      unit: "mmol",
    });
    expect(Number(massRec.result.value)).toBeCloseTo(2.0, 2);
    expect(massRec.result.unit).toBe("g");
  });

  it("computes molarity and dilution with unit conversion and rejects physically impossible volumes", () => {
    const molRec = runMolarityCalculation({
      solveFor: "molarity",
      amountValue: 25,
      amountUnit: "mmol",
      volumeValue: 250,
      volumeUnit: "mL",
    });
    expect(Number(molRec.result.value)).toBeCloseTo(0.1, 3);
    expect(molRec.result.unit).toBe("mol/L");

    const dilRec = runDilutionCalculation({
      solveFor: "final_concentration",
      stockConcentrationMolL: 1.0,
      stockVolume: 25,
      finalVolume: 250,
      volumeUnit: "mL",
    });
    expect(Number(dilRec.result.value)).toBeCloseTo(0.1, 4);

    expect(() =>
      runDilutionCalculation({
        solveFor: "final_concentration",
        stockConcentrationMolL: 1.0,
        stockVolume: 300,
        finalVolume: 250,
        volumeUnit: "mL",
      }),
    ).toThrow();
  });

  it("balances chemical equations, solves limiting-reagent stoichiometry, percent yield and pH", () => {
    const bal = runReactionBalancingCalculation("Fe + O2 -> Fe2O3");
    expect(bal.result.formattedValue).toContain("4 Fe + 3 O2 -> 2 Fe2O3");

    const stoich = runStoichiometryCalculation({
      equation: "2 H2 + O2 -> 2 H2O",
      reagents: [
        { formula: "H2", amountMoles: 2.0 },
        { formula: "O2", amountMoles: 0.5 },
      ],
      targetProductFormula: "H2O",
    });
    expect(Number(stoich.result.value)).toBeCloseTo(18.015, 2);
    expect(stoich.steps.some((s) => s.includes("limiting reagent(s): O2"))).toBe(true);

    const yieldRec = runPercentYieldCalculation({
      actualYield: 8.5,
      theoreticalYield: 10.0,
      unit: "g",
    });
    expect(Number(yieldRec.result.value)).toBeCloseTo(85.0, 2);

    const phRec = runAcidBasePhCalculation({
      systemKind: "strong_acid",
      concentrationMolL: 0.01,
    });
    expect(Number(phRec.result.value)).toBeCloseTo(2.0, 2);
  });
});

describe("assessment engine & pre-submission answer stripping", () => {
  it("strips all answer keys, expected values and explanations from learner-facing questions", () => {
    const quiz = getAssessmentByIdOrSlug("quiz-stoichiometry-and-titration")!;
    const learnerQs = toLearnerQuestions(quiz);
    expect(learnerQs.length).toBe(quiz.questions.length);

    const serialized = JSON.stringify(learnerQs);
    expect(serialized).not.toContain("correctOptionId");
    expect(serialized).not.toContain("correctOptionIds");
    expect(serialized).not.toContain("correctAnswer");
    expect(serialized).not.toContain("expectedValue");
    expect(serialized).not.toContain("requiredConceptGroups");
    expect(serialized).not.toContain("canonicalExpected");
    expect(serialized).not.toContain("explanation");
  });

  it("evaluates numerical questions with unit conversion and rejects wrong units", () => {
    const dilutionQuiz = getAssessmentByIdOrSlug("quiz-solution-dilution")!;
    const v1Question = dilutionQuiz.questions.find((q) => q.id === "q-dil-2")!;

    // Expected is 12.5 mL -> submitting 0.0125 L passes via simulation-core unit conversion!
    const inLiters = evaluateSingleQuestion(v1Question, {
      questionId: "q-dil-2",
      type: "numerical",
      value: 0.0125,
      unit: "L",
    });
    expect(inLiters.correct).toBe(true);

    const wrongUnit = evaluateSingleQuestion(v1Question, {
      questionId: "q-dil-2",
      type: "numerical",
      value: 12.5,
      unit: "g",
    });
    expect(wrongUnit.correct).toBe(false);
  });

  it("evaluates formula and balanced reaction questions using simulation-core", () => {
    const titrationQuiz = getAssessmentByIdOrSlug("quiz-stoichiometry-and-titration")!;
    const rxnQ = titrationQuiz.questions.find((q) => q.id === "q-tit-1")!;

    const balanced = evaluateSingleQuestion(rxnQ, {
      questionId: "q-tit-1",
      type: "chemical_equation",
      expression: "H2C2O4 + 2 NaOH -> Na2C2O4 + 2 H2O",
    });
    expect(balanced.correct).toBe(true);

    const unbalanced = evaluateSingleQuestion(rxnQ, {
      questionId: "q-tit-1",
      type: "chemical_equation",
      expression: "H2C2O4 + NaOH -> Na2C2O4 + H2O",
    });
    expect(unbalanced.correct).toBe(false);
    expect(unbalanced.validationDetail).toContain("not balanced");

    const stdQuiz = getAssessmentByIdOrSlug("quiz-foundations-solutions")!;
    const hydrateQ = stdQuiz.questions.find((q) => q.id === "q-std-4")!;
    const hydrateCheck = evaluateSingleQuestion(hydrateQ, {
      questionId: "q-std-4",
      type: "chemical_equation",
      expression: "CuSO4·5H2O",
    });
    expect(hydrateCheck.correct).toBe(true);
  });

  it("scores full attempts accurately and distinguishes failed vs passed attempts", () => {
    const quiz = getAssessmentByIdOrSlug("quiz-ph-and-indicators")!;
    const failedAttempt = evaluateAssessmentAttempt(quiz, [], {
      startedAt: "2026-11-07T10:00:00.000Z",
      submittedAt: "2026-11-07T10:01:00.000Z",
    });
    expect(failedAttempt.passed).toBe(false);
    expect(failedAttempt.percentage).toBe(0);

    const passedAttempt = evaluateAssessmentAttempt(
      quiz,
      [
        { questionId: "q-ph-1", type: "numerical", value: 2.0, unit: "pH" },
        { questionId: "q-ph-2", type: "multiple_choice", selectedOptionId: "opt-2" },
        { questionId: "q-ph-3", type: "true_false", answer: true },
        {
          questionId: "q-ph-4",
          type: "multiple_select",
          selectedOptionIds: ["lim-ionic", "lim-temp"],
        },
      ],
      {
        startedAt: "2026-11-07T10:02:00.000Z",
        submittedAt: "2026-11-07T10:05:00.000Z",
      },
    );
    expect(passedAttempt.passed).toBe(true);
    expect(passedAttempt.percentage).toBe(100);
  });
});
