import { z } from "zod";

import { nonEmptyText } from "./common.js";
import { referenceIdSchema } from "./references.js";

/**
 * Educational content sub-schemas (schema version 2.x).
 *
 * Theory, equations and definitions are structured so that symbol definitions
 * travel with their equations and claims can be linked to references. Prose is
 * plain text: content files carry no executable code and are rendered as text.
 */

export const equationVariableSchema = z.object({
  symbol: nonEmptyText,
  meaning: nonEmptyText,
  unit: nonEmptyText.optional(),
  dimensions: nonEmptyText.optional(),
});

export const equationSchema = z
  .object({
    id: z
      .string()
      .regex(/^eq-[a-z0-9]+(?:-[a-z0-9]+)*$/, "Equation IDs must use the eq-<kebab-case> format"),
    /** Plain-text mathematical expression using the declared symbols. */
    expression: nonEmptyText,
    /** Human-readable form for display, may use Unicode (for example ΔG = ...). */
    displayForm: nonEmptyText.optional(),
    description: nonEmptyText,
    variables: z.array(equationVariableSchema).min(1),
    /** Conditions under which the equation holds (temperature, dilute solution, ...). */
    applicableConditions: z.array(nonEmptyText).default([]),
    assumptions: z.array(nonEmptyText).default([]),
    sourceRefIds: z.array(referenceIdSchema).min(1),
    /** Theoretical (derived/defined) vs empirical (fitted/observed). */
    kind: z.enum(["definition", "theoretical_law", "empirical_relation", "working_relation"]),
  })
  .superRefine((equation, context) => {
    const symbols = new Set<string>();
    equation.variables.forEach((variable, index) => {
      if (symbols.has(variable.symbol)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate symbol "${variable.symbol}" in equation "${equation.id}"`,
          path: ["variables", index, "symbol"],
        });
      }
      symbols.add(variable.symbol);
    });
  });

export const definitionSchema = z.object({
  id: z
    .string()
    .regex(/^def-[a-z0-9]+(?:-[a-z0-9]+)*$/, "Definition IDs must use the def-<kebab-case> format"),
  term: nonEmptyText,
  definition: nonEmptyText,
  sourceRefIds: z.array(referenceIdSchema).default([]),
});

export const theorySectionSchema = z.object({
  overview: nonEmptyText,
  /** Thematic theory blocks; at least one is required for published content. */
  sections: z
    .array(
      z.object({
        heading: nonEmptyText,
        body: nonEmptyText,
        sourceRefIds: z.array(referenceIdSchema).default([]),
      }),
    )
    .default([]),
  scientificBackground: nonEmptyText.optional(),
  concepts: z.array(nonEmptyText).default([]),
  equations: z.array(equationSchema).default([]),
  definitions: z.array(definitionSchema).default([]),
});

export const educationalContentSchema = z.object({
  learningObjectives: z.array(nonEmptyText).min(1),
  expectedCompetencies: z.array(nonEmptyText).default([]),
  learningOutcomes: z.array(nonEmptyText).min(1),
  theory: theorySectionSchema,
});

export type Equation = z.infer<typeof equationSchema>;
export type EquationVariable = z.infer<typeof equationVariableSchema>;
export type Definition = z.infer<typeof definitionSchema>;
export type TheorySection = z.infer<typeof theorySectionSchema>;
export type EducationalContent = z.infer<typeof educationalContentSchema>;
