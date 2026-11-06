import { z } from "zod";

import { nonEmptyText, numericRangeSchema, semanticVersion } from "./common.js";
import { referenceIdSchema } from "./references.js";

/**
 * Simulation configuration — the integration contract for Phase 04.
 *
 * Phase 03 records declare what a future scientific model would consume and
 * produce. This schema describes configuration DATA ONLY: it is not a
 * simulation engine, executes nothing, and must never be used to generate
 * readings in this phase (docs/experiments/experiment-library-architecture.md).
 */

export const simulationStatusSchema = z.enum([
  /** A model contract has been drafted for a future simulation core. */
  "planned",
  /** No simulation is planned for this experiment (for example theory-only content). */
  "not_planned",
  /** A model exists and has been integrated (only after Phase 04+). */
  "implemented",
]);

export const modelInputSchema = z.object({
  id: z
    .string()
    .regex(/^in-[a-z0-9]+(?:-[a-z0-9]+)*$/, "Input IDs must use the in-<kebab-case> format"),
  label: nonEmptyText,
  unit: nonEmptyText,
  defaultValue: z.number().finite().optional(),
  validRange: numericRangeSchema.optional(),
  description: nonEmptyText,
});

export const modelOutputSchema = z.object({
  id: z
    .string()
    .regex(/^out-[a-z0-9]+(?:-[a-z0-9]+)*$/, "Output IDs must use the out-<kebab-case> format"),
  label: nonEmptyText,
  unit: nonEmptyText,
  displayPrecision: nonEmptyText,
  description: nonEmptyText,
});

export const simulationConfigSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("planned"),
    model: z.object({
      /** Stable identifier for the future model implementation. */
      id: nonEmptyText,
      /** Contract version, separate from any future implementation version. */
      contractVersion: semanticVersion,
      summary: nonEmptyText,
      inputs: z.array(modelInputSchema).default([]),
      outputs: z.array(modelOutputSchema).default([]),
      assumptions: z.array(nonEmptyText).default([]),
      limitations: z.array(nonEmptyText).default([]),
      equations: z.array(z.string().regex(/^eq-[a-z0-9]+(?:-[a-z0-9]+)*$/)).default([]),
      sourceRefIds: z.array(referenceIdSchema).default([]),
    }),
  }),
  z.object({ status: z.literal("not_planned"), rationale: nonEmptyText }),
  z.object({
    status: z.literal("implemented"),
    model: z.object({
      id: nonEmptyText,
      contractVersion: semanticVersion,
      implementationVersion: semanticVersion,
      summary: nonEmptyText,
      inputs: z.array(modelInputSchema).default([]),
      outputs: z.array(modelOutputSchema).default([]),
      assumptions: z.array(nonEmptyText).default([]),
      limitations: z.array(nonEmptyText).default([]),
      equations: z.array(z.string().regex(/^eq-[a-z0-9]+(?:-[a-z0-9]+)*$/)).default([]),
      sourceRefIds: z.array(referenceIdSchema).default([]),
    }),
  }),
]);

export type SimulationConfig = z.infer<typeof simulationConfigSchema>;
export type ModelInput = z.infer<typeof modelInputSchema>;
export type ModelOutput = z.infer<typeof modelOutputSchema>;
export type SimulationStatus = z.infer<typeof simulationStatusSchema>;
