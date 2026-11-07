import { z } from "zod";
import {
  difficultySchema,
  educationalLevelIdSchema,
} from "@virtual-chemistry-lab/experiment-schema";

export const LEARNING_SCHEMA_VERSION = "1.0.0" as const;
export const NOTEBOOK_STORE_SCHEMA_VERSION = "1.0.0" as const;

const boundedShortText = z.string().trim().min(1).max(300);
const boundedText = z.string().trim().min(1).max(4000);
const kebabId = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Identifier must be lowercase kebab-case");
const isoTimestampSchema = z
  .string()
  .datetime({ offset: true })
  .or(
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/, "Invalid ISO-8601 UTC timestamp"),
  );

/**
 * Explicit data provenance categories for practical notebook entries, data tables
 * and reports. Simulated outputs must NEVER be represented as physical laboratory
 * measurements.
 */
export const notebookProvenanceSchema = z.enum([
  "user_entered",
  "engine_calculated",
  "simulation_generated",
  "reference_expected",
  "imported_external",
]);
export type NotebookProvenance = z.infer<typeof notebookProvenanceSchema>;

/** Honest learner progress states — never fabricated or inflated. */
export const learningProgressStateSchema = z.enum([
  "not_attempted",
  "started",
  "in_progress",
  "completed",
  "failed",
]);
export type LearningProgressState = z.infer<typeof learningProgressStateSchema>;

/** Broad educational stage tags for pathway discovery. */
export const learningStageSchema = z.enum([
  "beginner",
  "school",
  "intermediate",
  "college",
  "advanced",
]);
export type LearningStage = z.infer<typeof learningStageSchema>;

/** Subject-specific chemistry categories grounded in repository taxonomy. */
export const chemistryCategorySchema = z.enum([
  "general-chemistry",
  "solutions-and-concentration",
  "acid-base-chemistry",
  "analytical-chemistry",
  "physical-chemistry",
  "chemical-kinetics",
  "thermodynamics",
  "electrochemistry",
  "inorganic-chemistry",
  "organic-chemistry",
  "biochemistry",
  "environmental-chemistry",
]);
export type ChemistryCategory = z.infer<typeof chemistryCategorySchema>;

export const learningReferenceSchema = z.object({
  id: kebabId,
  citation: boundedText,
  url: z.string().url().optional(),
  sourceType: z.enum([
    "textbook",
    "official_standard",
    "reference_database",
    "curriculum_circular",
    "laboratory_manual",
  ]),
  verificationNote: boundedShortText.optional(),
});
export type LearningReference = z.infer<typeof learningReferenceSchema>;

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------

export const glossaryEntrySchema = z.object({
  id: kebabId,
  term: boundedShortText,
  definition: boundedText,
  chemicalSymbols: z.array(z.string().trim().min(1).max(40)).default([]),
  units: z.array(z.string().trim().min(1).max(40)).default([]),
  relatedConceptIds: z.array(kebabId).default([]),
  relatedExperimentIds: z.array(kebabId).default([]),
  references: z.array(learningReferenceSchema).min(1),
});
export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>;

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export const scientificClaimKindSchema = z.enum([
  "established_fact",
  "model_approximation",
  "illustrative_example",
]);
export type ScientificClaimKind = z.infer<typeof scientificClaimKindSchema>;

export const lessonTheoryBlockSchema = z.object({
  heading: boundedShortText,
  body: boundedText,
  claimKind: scientificClaimKindSchema,
  claimNote: boundedShortText.optional(),
});
export type LessonTheoryBlock = z.infer<typeof lessonTheoryBlockSchema>;

export const lessonEquationSchema = z.object({
  id: kebabId,
  equation: boundedShortText,
  description: boundedText,
  conditions: boundedShortText.optional(),
});
export type LessonEquation = z.infer<typeof lessonEquationSchema>;

export const lessonFormulaVariableSchema = z.object({
  symbol: z.string().trim().min(1).max(32),
  meaning: boundedShortText,
  unit: z.string().trim().min(1).max(40),
});

export const lessonFormulaSchema = z.object({
  id: kebabId,
  expression: boundedShortText,
  displayForm: boundedShortText,
  description: boundedText,
  variables: z.array(lessonFormulaVariableSchema).min(1),
  conditions: z.array(boundedShortText).default([]),
  assumptions: z.array(boundedShortText).default([]),
});
export type LessonFormula = z.infer<typeof lessonFormulaSchema>;

export const lessonWorkedExampleSchema = z.object({
  id: kebabId,
  title: boundedShortText,
  problem: boundedText,
  given: z.array(boundedShortText).min(1),
  steps: z.array(boundedText).min(1),
  result: boundedShortText,
  unit: z.string().trim().min(1).max(40),
  precisionNote: boundedShortText,
  isIllustrative: z.literal(true),
});
export type LessonWorkedExample = z.infer<typeof lessonWorkedExampleSchema>;

export const lessonDiagramKindSchema = z.enum([
  "dilution_schematic",
  "ph_indicator_scale",
  "galvanic_cell_schematic",
  "vsepr_geometries",
  "reaction_energy_profile",
  "titration_curve_schematic",
]);
export type LessonDiagramKind = z.infer<typeof lessonDiagramKindSchema>;

export const lessonDiagramSchema = z.object({
  id: kebabId,
  kind: lessonDiagramKindSchema,
  title: boundedShortText,
  caption: boundedText,
  textAlternative: boundedText,
  disclosureNote: boundedShortText,
});
export type LessonDiagram = z.infer<typeof lessonDiagramSchema>;

export const lessonSchema = z.object({
  schemaVersion: z.literal(LEARNING_SCHEMA_VERSION),
  id: kebabId,
  slug: kebabId,
  title: boundedShortText,
  summary: boundedText,
  stage: learningStageSchema,
  educationalLevel: educationalLevelIdSchema,
  category: chemistryCategorySchema,
  disciplineId: kebabId,
  topicIds: z.array(kebabId).min(1),
  estimatedDurationMinutes: z.number().int().min(5).max(180),
  introduction: boundedText,
  learningObjectives: z.array(boundedShortText).min(1),
  theoryBlocks: z.array(lessonTheoryBlockSchema).min(1),
  importantConcepts: z.array(boundedShortText).min(1),
  chemicalEquations: z.array(lessonEquationSchema).default([]),
  glossaryTermIds: z.array(kebabId).default([]),
  formulas: z.array(lessonFormulaSchema).default([]),
  workedExamples: z.array(lessonWorkedExampleSchema).default([]),
  diagrams: z.array(lessonDiagramSchema).default([]),
  relatedExperimentIds: z.array(kebabId).default([]),
  relatedAssessmentIds: z.array(kebabId).default([]),
  references: z.array(learningReferenceSchema).min(1),
  furtherReading: z.array(boundedShortText).default([]),
  scientificReviewStatus: z.literal("pending_scientific_review"),
});
export type Lesson = z.infer<typeof lessonSchema>;

// ---------------------------------------------------------------------------
// Learning Pathways
// ---------------------------------------------------------------------------

export const pathwayItemSchema = z.object({
  id: kebabId,
  order: z.number().int().min(1),
  kind: z.enum(["lesson", "experiment", "assessment"]),
  targetId: kebabId,
  title: boundedShortText,
  summary: boundedText,
  required: z.boolean().default(true),
  estimatedDurationMinutes: z.number().int().min(5).max(240),
});
export type PathwayItem = z.infer<typeof pathwayItemSchema>;

export const pathwayCurriculumNoteSchema = z.object({
  curriculumId: kebabId,
  curriculumTopicIds: z.array(kebabId).min(1),
  alignmentConfidence: z.literal("proposed_pending_verification"),
  note: boundedText,
});
export type PathwayCurriculumNote = z.infer<typeof pathwayCurriculumNoteSchema>;

export const learningPathwaySchema = z
  .object({
    schemaVersion: z.literal(LEARNING_SCHEMA_VERSION),
    id: kebabId,
    slug: kebabId,
    title: boundedShortText,
    description: boundedText,
    stage: learningStageSchema,
    educationalLevels: z.array(educationalLevelIdSchema).min(1),
    category: chemistryCategorySchema,
    disciplineIds: z.array(kebabId).min(1),
    topicIds: z.array(kebabId).min(1),
    prerequisites: z.array(boundedShortText).default([]),
    prerequisitePathwayIds: z.array(kebabId).default([]),
    learningObjectives: z.array(boundedShortText).min(1),
    items: z.array(pathwayItemSchema).min(2),
    estimatedDurationMinutes: z.number().int().min(10).max(1200),
    durationJustification: boundedShortText,
    completionRequirements: z.array(boundedShortText).min(1),
    curriculumNotes: z.array(pathwayCurriculumNoteSchema).default([]),
    references: z.array(learningReferenceSchema).min(1),
    scientificReviewStatus: z.literal("pending_scientific_review"),
  })
  .superRefine((pathway, ctx) => {
    const orders = new Set<number>();
    const ids = new Set<string>();
    for (let i = 0; i < pathway.items.length; i++) {
      const item = pathway.items[i]!;
      if (orders.has(item.order)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate pathway item order ${item.order}`,
          path: ["items", i, "order"],
        });
      }
      if (ids.has(item.id)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate pathway item id "${item.id}"`,
          path: ["items", i, "id"],
        });
      }
      orders.add(item.order);
      ids.add(item.id);
    }
  });
export type LearningPathway = z.infer<typeof learningPathwaySchema>;

// ---------------------------------------------------------------------------
// Assessments & Quizzes
// ---------------------------------------------------------------------------

const baseQuestionFields = {
  id: kebabId,
  prompt: boundedText,
  difficulty: difficultySchema,
  marks: z.number().int().min(1).max(10),
  learningObjective: boundedShortText,
  explanation: boundedText,
  reference: learningReferenceSchema,
};

export const choiceOptionSchema = z.object({
  id: kebabId,
  label: boundedShortText,
});
export type ChoiceOption = z.infer<typeof choiceOptionSchema>;

export const multipleChoiceQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal("multiple_choice"),
  options: z.array(choiceOptionSchema).min(2).max(6),
  correctOptionId: kebabId,
});

export const multipleSelectQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal("multiple_select"),
  options: z.array(choiceOptionSchema).min(3).max(6),
  correctOptionIds: z.array(kebabId).min(1),
});

export const trueFalseQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal("true_false"),
  correctAnswer: z.boolean(),
});

export const numericalQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal("numerical"),
  expectedValue: z.number().finite(),
  expectedUnit: z.string().trim().min(1).max(32),
  acceptedUnits: z.array(z.string().trim().min(1).max(32)).min(1),
  tolerance: z.number().positive(),
  toleranceKind: z.enum(["absolute", "relative"]),
});

export const shortAnswerQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal("short_answer"),
  /**
   * Transparent deterministic concept check: every group requires at least one
   * matching normalized keyword/phrase. Never claims AI grading.
   */
  requiredConceptGroups: z.array(z.array(z.string().trim().min(1).max(80)).min(1)).min(1),
  sampleAnswer: boundedShortText,
});

export const chemicalEquationQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal("chemical_equation"),
  mode: z.enum(["balanced_reaction", "chemical_formula"]),
  canonicalExpected: boundedShortText,
  hintNotation: boundedShortText,
});

export const assessmentQuestionSchema = z.discriminatedUnion("type", [
  multipleChoiceQuestionSchema,
  multipleSelectQuestionSchema,
  trueFalseQuestionSchema,
  numericalQuestionSchema,
  shortAnswerQuestionSchema,
  chemicalEquationQuestionSchema,
]);
export type AssessmentQuestion = z.infer<typeof assessmentQuestionSchema>;

export const assessmentSchema = z.object({
  schemaVersion: z.literal(LEARNING_SCHEMA_VERSION),
  id: kebabId,
  slug: kebabId,
  title: boundedShortText,
  description: boundedText,
  experimentId: kebabId.optional(),
  pathwayId: kebabId.optional(),
  stage: learningStageSchema,
  passPercentage: z.number().min(50).max(100).default(70),
  allowRetry: z.boolean().default(true),
  estimatedDurationMinutes: z.number().int().min(3).max(90),
  questions: z.array(assessmentQuestionSchema).min(2),
  references: z.array(learningReferenceSchema).min(1),
  scientificReviewStatus: z.literal("pending_scientific_review"),
});
export type Assessment = z.infer<typeof assessmentSchema>;

export const questionResponseSchema = z.discriminatedUnion("type", [
  z.object({
    questionId: kebabId,
    type: z.literal("multiple_choice"),
    selectedOptionId: kebabId,
  }),
  z.object({
    questionId: kebabId,
    type: z.literal("multiple_select"),
    selectedOptionIds: z.array(kebabId),
  }),
  z.object({
    questionId: kebabId,
    type: z.literal("true_false"),
    answer: z.boolean(),
  }),
  z.object({
    questionId: kebabId,
    type: z.literal("numerical"),
    value: z.number().finite(),
    unit: z.string().trim().min(1).max(32),
  }),
  z.object({
    questionId: kebabId,
    type: z.literal("short_answer"),
    text: z.string().max(1000),
  }),
  z.object({
    questionId: kebabId,
    type: z.literal("chemical_equation"),
    expression: z.string().max(300),
  }),
]);
export type QuestionResponse = z.infer<typeof questionResponseSchema>;

export const evaluatedQuestionItemSchema = z.object({
  questionId: kebabId,
  correct: z.boolean(),
  earnedMarks: z.number().min(0),
  maxMarks: z.number().min(1),
  submittedDisplay: z.string().max(1000),
  expectedDisplay: z.string().max(1000),
  explanation: boundedText,
  learningObjective: boundedShortText,
  referenceCitation: boundedText,
  validationDetail: z.string().max(500).optional(),
});
export type EvaluatedQuestionItem = z.infer<typeof evaluatedQuestionItemSchema>;

export const assessmentAttemptSchema = z.object({
  attemptId: z.string().min(1).max(100),
  assessmentId: kebabId,
  experimentId: kebabId.optional(),
  sessionId: z.string().min(1).max(100).optional(),
  startedAt: isoTimestampSchema,
  submittedAt: isoTimestampSchema,
  earnedMarks: z.number().min(0),
  totalMarks: z.number().min(1),
  percentage: z.number().min(0).max(100),
  passed: z.boolean(),
  responses: z.array(questionResponseSchema),
  evaluations: z.array(evaluatedQuestionItemSchema),
});
export type AssessmentAttempt = z.infer<typeof assessmentAttemptSchema>;

// ---------------------------------------------------------------------------
// Practical Notebook: Observations, Data Tables, Calculations, Sessions
// ---------------------------------------------------------------------------

export const observationRecordSchema = z
  .object({
    id: z.string().min(1).max(100),
    sequence: z.number().int().min(1),
    timestamp: isoTimestampSchema,
    title: boundedShortText,
    description: z.string().max(2000).default(""),
    value: z.number().finite().nullable().default(null),
    unit: z.string().trim().min(1).max(40).optional(),
    precisionDecimals: z.number().int().min(0).max(8).optional(),
    apparatusId: z.string().trim().min(1).max(80).optional(),
    apparatusLabel: z.string().trim().min(1).max(120).optional(),
    notes: z.string().max(2000).optional(),
    provenance: notebookProvenanceSchema,
    modelId: z.string().trim().min(1).max(80).optional(),
    engineVersion: z.string().trim().min(1).max(40).optional(),
    referenceCitation: z.string().trim().min(1).max(400).optional(),
    importSourceNote: z.string().trim().min(1).max(300).optional(),
  })
  .superRefine((obs, ctx) => {
    if (obs.value !== null && (!obs.unit || obs.unit.trim().length === 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Quantitative observation values require an explicit unit.",
        path: ["unit"],
      });
    }
    if (
      (obs.provenance === "engine_calculated" || obs.provenance === "simulation_generated") &&
      (!obs.modelId || !obs.engineVersion)
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "Engine-calculated and simulation-generated observations must record modelId and engineVersion.",
        path: ["modelId"],
      });
    }
  });
export type ObservationRecord = z.infer<typeof observationRecordSchema>;

export const dataTableColumnSchema = z
  .object({
    id: kebabId,
    label: boundedShortText,
    kind: z.enum(["numeric", "text"]),
    unit: z.string().trim().min(1).max(40).optional(),
    precisionDecimals: z.number().int().min(0).max(6).default(2),
    min: z.number().finite().optional(),
    max: z.number().finite().optional(),
    required: z.boolean().default(false),
  })
  .superRefine((col, ctx) => {
    if (col.kind === "numeric" && (!col.unit || col.unit.length === 0)) {
      ctx.addIssue({
        code: "custom",
        message: `Numeric column "${col.label}" must specify an explicit unit (use "dimensionless" or "pH" where unitless).`,
        path: ["unit"],
      });
    }
    if (col.min !== undefined && col.max !== undefined && col.min > col.max) {
      ctx.addIssue({
        code: "custom",
        message: `Column "${col.label}" has min > max.`,
        path: ["min"],
      });
    }
  });
export type DataTableColumn = z.infer<typeof dataTableColumnSchema>;

export const dataTableCellSchema = z.object({
  raw: z.string().max(400),
  numericValue: z.number().finite().nullable().default(null),
  missingReason: z.enum(["not_recorded", "not_applicable"]).optional(),
});
export type DataTableCell = z.infer<typeof dataTableCellSchema>;

export const dataTableRowSchema = z.object({
  id: z.string().min(1).max(100),
  sequence: z.number().int().min(1),
  provenance: notebookProvenanceSchema,
  modelId: z.string().trim().min(1).max(80).optional(),
  cells: z.record(z.string(), dataTableCellSchema),
});
export type DataTableRow = z.infer<typeof dataTableRowSchema>;

export const experimentalDataTableSchema = z
  .object({
    id: z.string().min(1).max(100),
    title: boundedShortText,
    description: z.string().max(1000).optional(),
    xAxisColumnId: kebabId.optional(),
    yAxisColumnId: kebabId.optional(),
    columns: z.array(dataTableColumnSchema).min(1).max(12),
    rows: z.array(dataTableRowSchema).max(200),
  })
  .superRefine((table, ctx) => {
    const colMap = new Map<string, DataTableColumn>();
    table.columns.forEach((col, index) => {
      if (colMap.has(col.id)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate column id "${col.id}"`,
          path: ["columns", index, "id"],
        });
      }
      colMap.set(col.id, col);
    });
    if (table.xAxisColumnId && !colMap.has(table.xAxisColumnId)) {
      ctx.addIssue({
        code: "custom",
        message: `xAxisColumnId "${table.xAxisColumnId}" does not match any column`,
        path: ["xAxisColumnId"],
      });
    }
    if (table.yAxisColumnId && !colMap.has(table.yAxisColumnId)) {
      ctx.addIssue({
        code: "custom",
        message: `yAxisColumnId "${table.yAxisColumnId}" does not match any column`,
        path: ["yAxisColumnId"],
      });
    }
    table.rows.forEach((row, rowIdx) => {
      for (const [colId, cell] of Object.entries(row.cells)) {
        const col = colMap.get(colId);
        if (!col) continue;
        if (col.kind === "numeric" && cell.numericValue !== null) {
          if (col.min !== undefined && cell.numericValue < col.min) {
            ctx.addIssue({
              code: "custom",
              message: `Row ${rowIdx + 1} "${col.label}" (${cell.numericValue}) is below minimum ${col.min} ${col.unit ?? ""}`,
              path: ["rows", rowIdx, "cells", colId, "numericValue"],
            });
          }
          if (col.max !== undefined && cell.numericValue > col.max) {
            ctx.addIssue({
              code: "custom",
              message: `Row ${rowIdx + 1} "${col.label}" (${cell.numericValue}) exceeds maximum ${col.max} ${col.unit ?? ""}`,
              path: ["rows", rowIdx, "cells", colId, "numericValue"],
            });
          }
        }
      }
    });
  });
export type ExperimentalDataTable = z.infer<typeof experimentalDataTableSchema>;

export const calculationKindSchema = z.enum([
  "molar_mass",
  "moles_and_mass",
  "molarity",
  "dilution",
  "reaction_balancing",
  "stoichiometry_limiting_reagent",
  "percent_yield",
  "acid_base_ph",
]);
export type CalculationKind = z.infer<typeof calculationKindSchema>;

export const calculationInputItemSchema = z.object({
  name: boundedShortText,
  symbol: z.string().trim().min(1).max(32),
  value: z.union([z.number().finite(), z.string().trim().min(1).max(200)]),
  unit: z.string().trim().min(1).max(40),
});
export type CalculationInputItem = z.infer<typeof calculationInputItemSchema>;

export const calculationSecondaryOutputSchema = z.object({
  label: boundedShortText,
  value: z.union([z.number().finite(), z.string().trim().min(1).max(200)]),
  formattedValue: boundedShortText,
  unit: z.string().trim().min(1).max(40),
});

export const calculationRecordSchema = z.object({
  id: z.string().min(1).max(100),
  timestamp: isoTimestampSchema,
  kind: calculationKindSchema,
  title: boundedShortText,
  inputs: z.array(calculationInputItemSchema).min(1),
  formula: boundedShortText,
  steps: z.array(boundedText).min(1),
  result: z.object({
    label: boundedShortText,
    value: z.union([z.number().finite(), z.string().trim().min(1).max(300)]),
    formattedValue: boundedShortText,
    unit: z.string().trim().min(1).max(40),
    secondaryOutputs: z.array(calculationSecondaryOutputSchema).default([]),
  }),
  assumptions: z.array(boundedText).min(1),
  limitations: z.array(boundedText).default([]),
  precisionConvention: boundedShortText,
  warnings: z.array(boundedText).default([]),
  provenance: z.object({
    source: z.literal("engine_calculated"),
    engineName: boundedShortText,
    engineVersion: z.string().trim().min(1).max(40),
    modelId: kebabId,
    modelVersion: z.string().trim().min(1).max(40),
    verificationStatus: boundedShortText,
  }),
});
export type CalculationRecord = z.infer<typeof calculationRecordSchema>;

export const simulationRunRecordSchema = z.object({
  id: z.string().min(1).max(100),
  recordedAt: isoTimestampSchema,
  engineName: boundedShortText,
  engineVersion: z.string().trim().min(1).max(40),
  modelId: z.string().trim().min(1).max(80),
  modelVersion: z.string().trim().min(1).max(40),
  inputs: z.array(
    z.object({
      label: boundedShortText,
      value: z.union([z.number().finite(), z.string().trim().min(1).max(200)]),
      unit: z.string().trim().min(1).max(40),
    }),
  ),
  outputs: z.array(
    z.object({
      label: boundedShortText,
      value: z.number().finite(),
      formattedValue: boundedShortText,
      unit: z.string().trim().min(1).max(40),
      provenance: z.enum(["engine_calculated", "simulation_generated"]),
    }),
  ),
  assumptions: z.array(boundedText).default([]),
  limitations: z.array(boundedText).default([]),
  completedStepCount: z.number().int().min(0),
  totalStepCount: z.number().int().min(1),
  disclosure: boundedText,
});
export type SimulationRunRecord = z.infer<typeof simulationRunRecordSchema>;

export const sessionHistoryActionSchema = z.enum([
  "created",
  "saved",
  "resumed",
  "renamed",
  "checklist_updated",
  "observation_added",
  "observation_updated",
  "observation_removed",
  "simulation_recorded",
  "table_updated",
  "calculation_added",
  "calculation_removed",
  "notes_updated",
  "assessment_linked",
  "completed",
  "duplicated",
  "reset",
  "imported",
]);
export type SessionHistoryAction = z.infer<typeof sessionHistoryActionSchema>;

export const sessionHistoryEntrySchema = z.object({
  id: z.string().min(1).max(100),
  timestamp: isoTimestampSchema,
  action: sessionHistoryActionSchema,
  summary: boundedShortText,
});
export type SessionHistoryEntry = z.infer<typeof sessionHistoryEntrySchema>;

export const sessionStatusSchema = z.enum(["draft", "in_progress", "completed"]);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

export const preLabChecklistSchema = z.object({
  objectiveReviewed: z.boolean().default(false),
  apparatusReviewed: z.boolean().default(false),
  safetyReviewed: z.boolean().default(false),
  procedureReviewed: z.boolean().default(false),
});
export type PreLabChecklist = z.infer<typeof preLabChecklistSchema>;

export const sessionUserNotesSchema = z.object({
  hypothesisOrPlan: z.string().max(4000).default(""),
  discussion: z.string().max(6000).default(""),
  conclusion: z.string().max(4000).default(""),
  errorAnalysis: z.string().max(4000).default(""),
});
export type SessionUserNotes = z.infer<typeof sessionUserNotesSchema>;

export const notebookSessionSchema = z.object({
  schemaVersion: z.literal(LEARNING_SCHEMA_VERSION),
  sessionId: z.string().min(1).max(100),
  /** Monotonic revision counter to support Phase 10 conflict resolution later. */
  revision: z.number().int().min(1).default(1),
  /** Forward-compatible ownership boundary for Phase 08 accounts. */
  ownerScope: z.object({
    kind: z.literal("local_device"),
    localProfileId: z.string().min(1).max(100),
  }),
  title: boundedShortText,
  experimentId: kebabId,
  experimentSlug: kebabId,
  experimentTitle: boundedShortText,
  experimentVersion: z.string().trim().min(1).max(40),
  experimentSchemaVersion: z.string().trim().min(1).max(40),
  pathwayId: kebabId.optional(),
  importedFromSessionId: z.string().max(100).optional(),
  createdAt: isoTimestampSchema,
  updatedAt: isoTimestampSchema,
  completedAt: isoTimestampSchema.optional(),
  status: sessionStatusSchema,
  preLabChecklist: preLabChecklistSchema,
  userNotes: sessionUserNotesSchema,
  simulationRuns: z.array(simulationRunRecordSchema).default([]),
  observations: z.array(observationRecordSchema).default([]),
  dataTables: z.array(experimentalDataTableSchema).default([]),
  calculations: z.array(calculationRecordSchema).default([]),
  assessmentAttemptIds: z.array(z.string().min(1).max(100)).default([]),
  referenceCitations: z.array(boundedText).default([]),
  history: z.array(sessionHistoryEntrySchema).min(1),
});
export type NotebookSession = z.infer<typeof notebookSessionSchema>;

// ---------------------------------------------------------------------------
// Practical Report Contracts
// ---------------------------------------------------------------------------

export const REPORT_SECTION_IDS = [
  "title",
  "identification",
  "session_info",
  "objective",
  "theory",
  "equations",
  "apparatus",
  "chemicals",
  "safety",
  "procedure",
  "observations",
  "data_tables",
  "calculations",
  "results",
  "graphs",
  "discussion",
  "conclusion",
  "sources_of_error",
  "references",
  "simulation_disclosure",
] as const;

export const reportSectionIdSchema = z.enum(REPORT_SECTION_IDS);
export type ReportSectionId = z.infer<typeof reportSectionIdSchema>;

export const reportConfigSchema = z.object({
  includedSections: z.array(reportSectionIdSchema).min(1),
  includeCharts: z.boolean().default(true),
});
export type ReportConfig = z.infer<typeof reportConfigSchema>;

export const reportChartPointSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  provenance: notebookProvenanceSchema,
});
export type ReportChartPoint = z.infer<typeof reportChartPointSchema>;

export const reportChartSeriesSchema = z.object({
  id: z.string().min(1).max(100),
  tableId: z.string().min(1).max(100),
  title: boundedShortText,
  xLabel: boundedShortText,
  xUnit: z.string().trim().min(1).max(40),
  yLabel: boundedShortText,
  yUnit: z.string().trim().min(1).max(40),
  points: z.array(reportChartPointSchema).min(2),
  provenanceSummary: boundedShortText,
});
export type ReportChartSeries = z.infer<typeof reportChartSeriesSchema>;

export const reportCompletenessIssueSchema = z.object({
  sectionId: reportSectionIdSchema,
  severity: z.enum(["missing_required", "incomplete_optional"]),
  message: boundedShortText,
});
export type ReportCompletenessIssue = z.infer<typeof reportCompletenessIssueSchema>;

// ---------------------------------------------------------------------------
// Local Store Snapshot & Session Export Envelope
// ---------------------------------------------------------------------------

export const learningStoreSnapshotSchema = z.object({
  schemaVersion: z.literal(NOTEBOOK_STORE_SCHEMA_VERSION),
  localProfileId: z.string().min(1).max(100),
  updatedAt: isoTimestampSchema,
  startedLessonIds: z.array(kebabId).default([]),
  completedLessonIds: z.array(kebabId).default([]),
  sessions: z.array(notebookSessionSchema).default([]),
  assessmentAttempts: z.array(assessmentAttemptSchema).default([]),
  generatedReportSessionIds: z.array(z.string().min(1).max(100)).default([]),
});
export type LearningStoreSnapshot = z.infer<typeof learningStoreSnapshotSchema>;

export const sessionExportEnvelopeSchema = z.object({
  format: z.literal("virtual-chemistry-lab-notebook-session"),
  schemaVersion: z.literal(LEARNING_SCHEMA_VERSION),
  exportedAt: isoTimestampSchema,
  provenanceDisclosure: boundedText,
  session: notebookSessionSchema,
});
export type SessionExportEnvelope = z.infer<typeof sessionExportEnvelopeSchema>;
