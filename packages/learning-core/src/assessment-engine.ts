import {
  analyzeReaction,
  convert,
  formatSpecies,
  isKnownUnit,
  parseFormula,
  parseReaction,
} from "@virtual-chemistry-lab/simulation-core";

import {
  assessmentAttemptSchema,
  type Assessment,
  type AssessmentAttempt,
  type AssessmentQuestion,
  type ChoiceOption,
  type EvaluatedQuestionItem,
  type QuestionResponse,
} from "./schemas.js";

/**
 * Learner-facing question shape prior to submission: never exposes correct
 * answers, target numerical values or explanations before submission.
 */
export type LearnerAssessmentQuestion =
  | {
      readonly id: string;
      readonly type: "multiple_choice";
      readonly prompt: string;
      readonly difficulty: string;
      readonly marks: number;
      readonly learningObjective: string;
      readonly options: ReadonlyArray<ChoiceOption>;
    }
  | {
      readonly id: string;
      readonly type: "multiple_select";
      readonly prompt: string;
      readonly difficulty: string;
      readonly marks: number;
      readonly learningObjective: string;
      readonly options: ReadonlyArray<ChoiceOption>;
    }
  | {
      readonly id: string;
      readonly type: "true_false";
      readonly prompt: string;
      readonly difficulty: string;
      readonly marks: number;
      readonly learningObjective: string;
    }
  | {
      readonly id: string;
      readonly type: "numerical";
      readonly prompt: string;
      readonly difficulty: string;
      readonly marks: number;
      readonly learningObjective: string;
      readonly acceptedUnits: ReadonlyArray<string>;
      readonly expectedUnit: string;
    }
  | {
      readonly id: string;
      readonly type: "short_answer";
      readonly prompt: string;
      readonly difficulty: string;
      readonly marks: number;
      readonly learningObjective: string;
    }
  | {
      readonly id: string;
      readonly type: "chemical_equation";
      readonly mode: "balanced_reaction" | "chemical_formula";
      readonly prompt: string;
      readonly difficulty: string;
      readonly marks: number;
      readonly learningObjective: string;
      readonly hintNotation: string;
    };

export function toLearnerQuestions(
  assessment: Assessment,
): ReadonlyArray<LearnerAssessmentQuestion> {
  return assessment.questions.map((q): LearnerAssessmentQuestion => {
    switch (q.type) {
      case "multiple_choice":
        return {
          id: q.id,
          type: q.type,
          prompt: q.prompt,
          difficulty: q.difficulty,
          marks: q.marks,
          learningObjective: q.learningObjective,
          options: q.options,
        };
      case "multiple_select":
        return {
          id: q.id,
          type: q.type,
          prompt: q.prompt,
          difficulty: q.difficulty,
          marks: q.marks,
          learningObjective: q.learningObjective,
          options: q.options,
        };
      case "true_false":
        return {
          id: q.id,
          type: q.type,
          prompt: q.prompt,
          difficulty: q.difficulty,
          marks: q.marks,
          learningObjective: q.learningObjective,
        };
      case "numerical":
        return {
          id: q.id,
          type: q.type,
          prompt: q.prompt,
          difficulty: q.difficulty,
          marks: q.marks,
          learningObjective: q.learningObjective,
          acceptedUnits: q.acceptedUnits,
          expectedUnit: q.expectedUnit,
        };
      case "short_answer":
        return {
          id: q.id,
          type: q.type,
          prompt: q.prompt,
          difficulty: q.difficulty,
          marks: q.marks,
          learningObjective: q.learningObjective,
        };
      case "chemical_equation":
        return {
          id: q.id,
          type: q.type,
          mode: q.mode,
          prompt: q.prompt,
          difficulty: q.difficulty,
          marks: q.marks,
          learningObjective: q.learningObjective,
          hintNotation: q.hintNotation,
        };
    }
  });
}

const DISPLAY_UNIT_TO_ENGINE_ID: Readonly<Record<string, string>> = {
  "mol/L": "mol_per_l",
  "mmol/L": "mmol_per_l",
  "g/mol": "g_per_mol",
  "kg/mol": "kg_per_mol",
  "°C": "degC",
};

function convertAssessmentNumericalUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
): number | null {
  if (fromUnit === toUnit) return value;
  if (
    (fromUnit === "pH" && toUnit === "dimensionless") ||
    (fromUnit === "dimensionless" && toUnit === "pH")
  ) {
    return value;
  }
  if ((fromUnit === "s^-1" && toUnit === "1/s") || (fromUnit === "1/s" && toUnit === "s^-1")) {
    return value;
  }
  if (fromUnit === "mV" && toUnit === "V") return value * 1e-3;
  if (fromUnit === "V" && toUnit === "mV") return value * 1e3;

  const engineFrom = DISPLAY_UNIT_TO_ENGINE_ID[fromUnit] ?? fromUnit;
  const engineTo = DISPLAY_UNIT_TO_ENGINE_ID[toUnit] ?? toUnit;
  if (isKnownUnit(engineFrom) && isKnownUnit(engineTo)) {
    try {
      return convert(value, engineFrom, engineTo);
    } catch {
      return null;
    }
  }
  return null;
}

function gcdTwo(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function normalizeHydrateDot(formula: string): string {
  return formula.trim().replace(/\s+/g, "").replace(/\*/g, "·").replace(/\./g, "·");
}

function evaluateChemicalEquation(
  question: Extract<AssessmentQuestion, { type: "chemical_equation" }>,
  submittedRaw: string,
): { correct: boolean; detail: string } {
  const trimmed = submittedRaw.trim();
  if (trimmed.length === 0) {
    return { correct: false, detail: "No formula or equation entered." };
  }

  if (question.mode === "chemical_formula") {
    try {
      const normalizedStudent = normalizeHydrateDot(trimmed);
      const normalizedExpected = normalizeHydrateDot(question.canonicalExpected);
      const studentParsed = parseFormula(normalizedStudent);
      const expectedParsed = parseFormula(normalizedExpected);
      const studentKeys = Object.keys(studentParsed.atoms).sort();
      const expectedKeys = Object.keys(expectedParsed.atoms).sort();
      const sameElements =
        studentKeys.length === expectedKeys.length &&
        studentKeys.every(
          (k, idx) => k === expectedKeys[idx] && studentParsed.atoms[k] === expectedParsed.atoms[k],
        );
      const expectedHasHydrate = normalizedExpected.includes("·");
      const studentHasHydrate = normalizedStudent.includes("·");
      if (!sameElements) {
        return {
          correct: false,
          detail: "Elemental composition does not match the target formula.",
        };
      }
      if (expectedHasHydrate && !studentHasHydrate) {
        return {
          correct: false,
          detail:
            "Atom counts match, but hydrate water of crystallization must be written with dot notation (·).",
        };
      }
      return {
        correct: true,
        detail: "Verified elemental and hydrate formula composition via simulation-core.",
      };
    } catch (err) {
      return {
        correct: false,
        detail: err instanceof Error ? err.message : "Invalid chemical formula syntax.",
      };
    }
  }

  try {
    const studentRxn = parseReaction(trimmed);
    const analysis = analyzeReaction(studentRxn);
    if (!analysis.balanced) {
      return {
        correct: false,
        detail: `Equation is not balanced (atoms unbalanced: ${analysis.unbalancedElements.join(", ") || "none"}; net charge: reactants ${analysis.reactantCharge} vs products ${analysis.productCharge}).`,
      };
    }
    const expectedRxn = parseReaction(question.canonicalExpected);
    const allCoeffs = [
      ...studentRxn.reactants.map((r) => r.coefficient),
      ...studentRxn.products.map((p) => p.coefficient),
    ];
    if (!allCoeffs.every((c) => Number.isInteger(c) && c >= 1)) {
      return {
        correct: false,
        detail: "Stoichiometric coefficients must be positive integers.",
      };
    }
    const overallGcd = allCoeffs.reduce((acc, c) => gcdTwo(acc, c), allCoeffs[0] ?? 1);
    if (overallGcd !== 1) {
      return {
        correct: false,
        detail: `Coefficients must be reduced to lowest integer terms (common factor ${overallGcd} found).`,
      };
    }

    const toCoeffMap = (
      side: ReadonlyArray<{
        formula: string;
        charge: number;
        atoms: Readonly<Record<string, number>>;
        coefficient: number;
      }>,
    ) => {
      const m = new Map<string, number>();
      for (const sp of side) {
        const key = formatSpecies(sp);
        m.set(key, (m.get(key) ?? 0) + sp.coefficient);
      }
      return m;
    };

    const sReactants = toCoeffMap(studentRxn.reactants);
    const eReactants = toCoeffMap(expectedRxn.reactants);
    const sProducts = toCoeffMap(studentRxn.products);
    const eProducts = toCoeffMap(expectedRxn.products);

    const mapsMatch = (a: Map<string, number>, b: Map<string, number>): boolean => {
      if (a.size !== b.size) return false;
      for (const [k, v] of a.entries()) {
        if (b.get(k) !== v) return false;
      }
      return true;
    };

    if (!mapsMatch(sReactants, eReactants) || !mapsMatch(sProducts, eProducts)) {
      return {
        correct: false,
        detail: "Balanced equation does not match the expected reactant and product species.",
      };
    }

    return {
      correct: true,
      detail:
        "Verified atom balance, charge conservation and lowest-terms stoichiometry via simulation-core.",
    };
  } catch (err) {
    return {
      correct: false,
      detail: err instanceof Error ? err.message : "Could not parse reaction equation.",
    };
  }
}

export function evaluateSingleQuestion(
  question: AssessmentQuestion,
  response: QuestionResponse | undefined,
): EvaluatedQuestionItem {
  if (!response || response.type !== question.type) {
    return {
      questionId: question.id,
      correct: false,
      earnedMarks: 0,
      maxMarks: question.marks,
      submittedDisplay: "(No answer submitted)",
      expectedDisplay: formatExpectedAnswer(question),
      explanation: question.explanation,
      learningObjective: question.learningObjective,
      referenceCitation: question.reference.citation,
    };
  }

  switch (question.type) {
    case "multiple_choice": {
      if (response.type !== "multiple_choice") break;
      const chosen = question.options.find((o) => o.id === response.selectedOptionId);
      const correct = response.selectedOptionId === question.correctOptionId;
      return {
        questionId: question.id,
        correct,
        earnedMarks: correct ? question.marks : 0,
        maxMarks: question.marks,
        submittedDisplay: chosen ? chosen.label : response.selectedOptionId,
        expectedDisplay: formatExpectedAnswer(question),
        explanation: question.explanation,
        learningObjective: question.learningObjective,
        referenceCitation: question.reference.citation,
      };
    }
    case "multiple_select": {
      if (response.type !== "multiple_select") break;
      const selectedSet = new Set(response.selectedOptionIds);
      const expectedSet = new Set(question.correctOptionIds);
      const correct =
        selectedSet.size === expectedSet.size &&
        [...expectedSet].every((id) => selectedSet.has(id));
      const labels = question.options.filter((o) => selectedSet.has(o.id)).map((o) => o.label);
      return {
        questionId: question.id,
        correct,
        earnedMarks: correct ? question.marks : 0,
        maxMarks: question.marks,
        submittedDisplay: labels.length > 0 ? labels.join(" | ") : "(None selected)",
        expectedDisplay: formatExpectedAnswer(question),
        explanation: question.explanation,
        learningObjective: question.learningObjective,
        referenceCitation: question.reference.citation,
      };
    }
    case "true_false": {
      if (response.type !== "true_false") break;
      const correct = response.answer === question.correctAnswer;
      return {
        questionId: question.id,
        correct,
        earnedMarks: correct ? question.marks : 0,
        maxMarks: question.marks,
        submittedDisplay: response.answer ? "True" : "False",
        expectedDisplay: formatExpectedAnswer(question),
        explanation: question.explanation,
        learningObjective: question.learningObjective,
        referenceCitation: question.reference.citation,
      };
    }
    case "numerical": {
      if (response.type !== "numerical") break;
      const unitAccepted = question.acceptedUnits.includes(response.unit);
      if (!unitAccepted) {
        return {
          questionId: question.id,
          correct: false,
          earnedMarks: 0,
          maxMarks: question.marks,
          submittedDisplay: `${response.value} ${response.unit}`,
          expectedDisplay: formatExpectedAnswer(question),
          explanation: question.explanation,
          learningObjective: question.learningObjective,
          referenceCitation: question.reference.citation,
          validationDetail: `Unit "${response.unit}" is not among accepted units (${question.acceptedUnits.join(", ")}).`,
        };
      }
      const converted = convertAssessmentNumericalUnit(
        response.value,
        response.unit,
        question.expectedUnit,
      );
      if (converted === null || !Number.isFinite(converted)) {
        return {
          questionId: question.id,
          correct: false,
          earnedMarks: 0,
          maxMarks: question.marks,
          submittedDisplay: `${response.value} ${response.unit}`,
          expectedDisplay: formatExpectedAnswer(question),
          explanation: question.explanation,
          learningObjective: question.learningObjective,
          referenceCitation: question.reference.citation,
          validationDetail: "Incompatible unit conversion.",
        };
      }
      const absDiff = Math.abs(converted - question.expectedValue);
      const withinTolerance =
        question.toleranceKind === "absolute"
          ? absDiff <= question.tolerance + 1e-12
          : absDiff <= Math.abs(question.expectedValue) * question.tolerance + 1e-12;
      return {
        questionId: question.id,
        correct: withinTolerance,
        earnedMarks: withinTolerance ? question.marks : 0,
        maxMarks: question.marks,
        submittedDisplay: `${response.value} ${response.unit}`,
        expectedDisplay: formatExpectedAnswer(question),
        explanation: question.explanation,
        learningObjective: question.learningObjective,
        referenceCitation: question.reference.citation,
        validationDetail: withinTolerance
          ? `Within ±${question.tolerance} ${question.toleranceKind === "relative" ? "(relative)" : question.expectedUnit} tolerance.`
          : `Converted value ${converted.toPrecision(4)} ${question.expectedUnit} differs from ${question.expectedValue} ${question.expectedUnit} beyond ±${question.tolerance}.`,
      };
    }
    case "short_answer": {
      if (response.type !== "short_answer") break;
      const normalized = response.text
        .toLowerCase()
        .replace(/[^a-z0-9\s+-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const matchedAllGroups =
        normalized.length > 0 &&
        question.requiredConceptGroups.every((group) =>
          group.some((term) => normalized.includes(term.toLowerCase())),
        );
      return {
        questionId: question.id,
        correct: matchedAllGroups,
        earnedMarks: matchedAllGroups ? question.marks : 0,
        maxMarks: question.marks,
        submittedDisplay: response.text.trim() || "(Blank)",
        expectedDisplay: formatExpectedAnswer(question),
        explanation: question.explanation,
        learningObjective: question.learningObjective,
        referenceCitation: question.reference.citation,
        validationDetail:
          "Evaluated by deterministic concept-term rule (not automated natural-language inference).",
      };
    }
    case "chemical_equation": {
      if (response.type !== "chemical_equation") break;
      const eqCheck = evaluateChemicalEquation(question, response.expression);
      return {
        questionId: question.id,
        correct: eqCheck.correct,
        earnedMarks: eqCheck.correct ? question.marks : 0,
        maxMarks: question.marks,
        submittedDisplay: response.expression.trim() || "(Blank)",
        expectedDisplay: formatExpectedAnswer(question),
        explanation: question.explanation,
        learningObjective: question.learningObjective,
        referenceCitation: question.reference.citation,
        validationDetail: eqCheck.detail,
      };
    }
  }

  return {
    questionId: question.id,
    correct: false,
    earnedMarks: 0,
    maxMarks: question.marks,
    submittedDisplay: "(Type mismatch)",
    expectedDisplay: formatExpectedAnswer(question),
    explanation: question.explanation,
    learningObjective: question.learningObjective,
    referenceCitation: question.reference.citation,
  };
}

function formatExpectedAnswer(question: AssessmentQuestion): string {
  switch (question.type) {
    case "multiple_choice":
      return (
        question.options.find((o) => o.id === question.correctOptionId)?.label ??
        question.correctOptionId
      );
    case "multiple_select":
      return question.options
        .filter((o) => question.correctOptionIds.includes(o.id))
        .map((o) => o.label)
        .join(" | ");
    case "true_false":
      return question.correctAnswer ? "True" : "False";
    case "numerical":
      return `${question.expectedValue} ${question.expectedUnit} (±${question.tolerance} ${question.toleranceKind === "relative" ? "rel." : question.expectedUnit})`;
    case "short_answer":
      return question.sampleAnswer;
    case "chemical_equation":
      return question.canonicalExpected;
  }
}

export interface EvaluateAttemptOptions {
  readonly attemptId?: string;
  readonly startedAt: string;
  readonly submittedAt?: string;
  readonly sessionId?: string;
}

export function evaluateAssessmentAttempt(
  assessment: Assessment,
  responses: ReadonlyArray<QuestionResponse>,
  options: EvaluateAttemptOptions,
): AssessmentAttempt {
  const responseMap = new Map<string, QuestionResponse>();
  for (const r of responses) {
    responseMap.set(r.questionId, r);
  }

  const evaluations = assessment.questions.map((q) =>
    evaluateSingleQuestion(q, responseMap.get(q.id)),
  );
  const totalMarks = assessment.questions.reduce((sum, q) => sum + q.marks, 0);
  const earnedMarks = evaluations.reduce((sum, e) => sum + e.earnedMarks, 0);
  const percentage = totalMarks > 0 ? Number(((earnedMarks / totalMarks) * 100).toFixed(2)) : 0;
  const passed = percentage >= assessment.passPercentage;

  return assessmentAttemptSchema.parse({
    attemptId:
      options.attemptId ??
      `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    assessmentId: assessment.id,
    experimentId: assessment.experimentId,
    sessionId: options.sessionId,
    startedAt: options.startedAt,
    submittedAt: options.submittedAt ?? new Date().toISOString(),
    earnedMarks,
    totalMarks,
    percentage,
    passed,
    responses: [...responses],
    evaluations,
  });
}
