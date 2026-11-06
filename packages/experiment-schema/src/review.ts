import { z } from "zod";

import { dateOnly, nonEmptyText, semanticVersion } from "./common.js";

/**
 * Review, publication and content-integrity sub-schemas (schema version 2.x).
 *
 * Three independent axes are modelled deliberately (docs/experiments/experiment-review-workflow.md):
 *
 * 1. `publicationStatus` — the editorial workflow state controlling what public
 *    browsing may show. "published" means editorially released, NOT scientifically
 *    approved.
 * 2. `scientificReviewStatus` — the scientific validation vocabulary from
 *    docs/science/validation-policy.md. Only a qualified human reviewer may move
 *    content to "reviewed" or "validated_for_education".
 * 3. `integrityLabel` — the honesty label shown to learners, describing what
 *    evidence actually backs the content.
 *
 * AI-generated content is a draft until a qualified human reviews it. The schema
 * enforces provenance requirements: reviewer name and date are mandatory for any
 * reviewed/validated status.
 */

export const publicationStatusSchema = z.enum([
  "draft",
  "in_review",
  "approved",
  "published",
  "archived",
]);

export const scientificReviewStatusSchema = z.enum([
  "draft",
  "in_review",
  "reviewed",
  "validated_for_education",
  "deprecated",
]);

export const integrityLabelSchema = z.enum([
  "scientifically_sourced",
  "editorially_reviewed",
  "independently_validated",
  "pending_scientific_review",
  "demonstration_content",
]);

export const contributorSchema = z.object({
  name: nonEmptyText,
  role: nonEmptyText,
  affiliation: nonEmptyText.optional(),
  contact: z.email().optional(),
});

export const reviewEventSchema = z.object({
  reviewer: nonEmptyText,
  reviewerQualification: nonEmptyText,
  role: z.enum([
    "scientific_reviewer",
    "safety_reviewer",
    "editorial_reviewer",
    "educator_reviewer",
  ]),
  status: z.enum(["approved", "changes_requested", "reviewed_with_concerns"]),
  date: dateOnly,
  scope: nonEmptyText,
  notes: nonEmptyText.optional(),
});

export const revisionEntrySchema = z.object({
  contentVersion: semanticVersion,
  date: dateOnly,
  summary: nonEmptyText,
  changedBy: nonEmptyText,
});

export const licensingSchema = z.object({
  /** Content license identifier or explicit pending state; application code licensing is separate. */
  license: nonEmptyText,
  licenseStatus: z.enum(["applied", "pending_owner_decision", "third_party_permission_required"]),
  source: nonEmptyText,
  attribution: nonEmptyText.optional(),
  notes: nonEmptyText.optional(),
});

export const reviewSectionSchema = z
  .object({
    authors: z.array(contributorSchema).min(1),
    scientificReviewStatus: scientificReviewStatusSchema,
    /** Required once scientificReviewStatus is reviewed or validated_for_education. */
    scientificReviewer: contributorSchema.optional(),
    scientificReviewDate: dateOnly.optional(),
    scientificReviewScope: nonEmptyText.optional(),
    safetyReviewStatus: z.enum(["not_started", "in_review", "reviewed", "requires_review"]),
    reviewEvents: z.array(reviewEventSchema).default([]),
    revisionHistory: z.array(revisionEntrySchema).min(1),
    validationNotes: z.array(nonEmptyText).default([]),
    outstandingConcerns: z.array(nonEmptyText).default([]),
    integrityLabel: integrityLabelSchema,
    licensing: licensingSchema,
  })
  .superRefine((review, context) => {
    const requiresReviewer =
      review.scientificReviewStatus === "reviewed" ||
      review.scientificReviewStatus === "validated_for_education";

    if (requiresReviewer && !review.scientificReviewer) {
      context.addIssue({
        code: "custom",
        message: "A named scientific reviewer is required for reviewed content",
        path: ["scientificReviewer"],
      });
    }
    if (requiresReviewer && !review.scientificReviewDate) {
      context.addIssue({
        code: "custom",
        message: "A scientific review date is required for reviewed content",
        path: ["scientificReviewDate"],
      });
    }
    if (requiresReviewer && !review.scientificReviewScope) {
      context.addIssue({
        code: "custom",
        message: "The scope of the scientific review must be recorded",
        path: ["scientificReviewScope"],
      });
    }
    if (
      review.integrityLabel === "independently_validated" &&
      review.scientificReviewStatus !== "validated_for_education"
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Content may only claim independent validation when its scientific status is validated_for_education",
        path: ["integrityLabel"],
      });
    }
    if (
      review.integrityLabel === "scientifically_sourced" &&
      review.scientificReviewStatus === "draft"
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Draft content cannot claim scientifically_sourced as its integrity label; use pending_scientific_review",
        path: ["integrityLabel"],
      });
    }
    const versions = new Set<string>();
    review.revisionHistory.forEach((entry, index) => {
      if (versions.has(entry.contentVersion)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate revision entry for content version ${entry.contentVersion}`,
          path: ["revisionHistory", index, "contentVersion"],
        });
      }
      versions.add(entry.contentVersion);
    });
  });

export type PublicationStatus = z.infer<typeof publicationStatusSchema>;
export type ScientificReviewStatus = z.infer<typeof scientificReviewStatusSchema>;
export type IntegrityLabel = z.infer<typeof integrityLabelSchema>;
export type ReviewSection = z.infer<typeof reviewSectionSchema>;
export type Contributor = z.infer<typeof contributorSchema>;
export type ReviewEvent = z.infer<typeof reviewEventSchema>;
export type RevisionEntry = z.infer<typeof revisionEntrySchema>;
export type Licensing = z.infer<typeof licensingSchema>;
