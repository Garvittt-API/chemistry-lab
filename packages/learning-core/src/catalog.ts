import {
  catalog as experimentCatalog,
  getPublicExperimentByIdOrSlug,
} from "@virtual-chemistry-lab/experiment-library";

import {
  assessmentSchema,
  glossaryEntrySchema,
  learningPathwaySchema,
  lessonSchema,
  type Assessment,
  type ChemistryCategory,
  type GlossaryEntry,
  type LearningPathway,
  type LearningStage,
  type Lesson,
} from "./schemas.js";
import { RAW_ASSESSMENTS } from "./content/assessments.js";
import { RAW_GLOSSARY_ENTRIES } from "./content/glossary.js";
import { RAW_LESSONS } from "./content/lessons.js";
import { RAW_PATHWAYS } from "./content/pathways.js";

export interface ValidatedLearningCatalog {
  readonly glossary: ReadonlyArray<GlossaryEntry>;
  readonly lessons: ReadonlyArray<Lesson>;
  readonly assessments: ReadonlyArray<Assessment>;
  readonly pathways: ReadonlyArray<LearningPathway>;
}

function buildValidatedLearningCatalog(): ValidatedLearningCatalog {
  const disciplineSet = new Set(experimentCatalog.taxonomy.disciplines.map((d) => d.id));
  const topicSet = new Set(
    experimentCatalog.taxonomy.disciplines.flatMap((d) => d.topics.map((t) => t.id)),
  );
  const curriculumMap = new Map(
    experimentCatalog.curricula.curricula.map((c) => [c.id, new Set(c.topics.map((t) => t.id))]),
  );

  const glossary = RAW_GLOSSARY_ENTRIES.map((raw) => glossaryEntrySchema.parse(raw));
  const glossaryIds = new Set<string>();
  for (const entry of glossary) {
    if (glossaryIds.has(entry.id)) {
      throw new Error(`Duplicate glossary entry id "${entry.id}"`);
    }
    glossaryIds.add(entry.id);
    for (const expId of entry.relatedExperimentIds) {
      if (!getPublicExperimentByIdOrSlug(experimentCatalog, expId)) {
        throw new Error(`Glossary entry "${entry.id}" references non-public experiment "${expId}"`);
      }
    }
  }
  for (const entry of glossary) {
    for (const rel of entry.relatedConceptIds) {
      if (!glossaryIds.has(rel)) {
        throw new Error(`Glossary entry "${entry.id}" references unknown concept "${rel}"`);
      }
    }
  }

  const lessons = RAW_LESSONS.map((raw) => lessonSchema.parse(raw));
  const lessonMap = new Map<string, Lesson>();
  const lessonSlugs = new Set<string>();
  for (const lesson of lessons) {
    if (lessonMap.has(lesson.id)) {
      throw new Error(`Duplicate lesson id "${lesson.id}"`);
    }
    if (lessonSlugs.has(lesson.slug)) {
      throw new Error(`Duplicate lesson slug "${lesson.slug}"`);
    }
    if (!disciplineSet.has(lesson.disciplineId)) {
      throw new Error(`Lesson "${lesson.id}" uses unknown discipline "${lesson.disciplineId}"`);
    }
    for (const topicId of lesson.topicIds) {
      if (!topicSet.has(topicId)) {
        throw new Error(`Lesson "${lesson.id}" uses unknown topic "${topicId}"`);
      }
    }
    for (const termId of lesson.glossaryTermIds) {
      if (!glossaryIds.has(termId)) {
        throw new Error(`Lesson "${lesson.id}" references unknown glossary term "${termId}"`);
      }
    }
    for (const expId of lesson.relatedExperimentIds) {
      if (!getPublicExperimentByIdOrSlug(experimentCatalog, expId)) {
        throw new Error(`Lesson "${lesson.id}" references non-public experiment "${expId}"`);
      }
    }
    lessonMap.set(lesson.id, lesson);
    lessonSlugs.add(lesson.slug);
  }

  const assessments = RAW_ASSESSMENTS.map((raw) => assessmentSchema.parse(raw));
  const assessmentMap = new Map<string, Assessment>();
  for (const assessment of assessments) {
    if (assessmentMap.has(assessment.id)) {
      throw new Error(`Duplicate assessment id "${assessment.id}"`);
    }
    if (
      assessment.experimentId &&
      !getPublicExperimentByIdOrSlug(experimentCatalog, assessment.experimentId)
    ) {
      throw new Error(
        `Assessment "${assessment.id}" references non-public experiment "${assessment.experimentId}"`,
      );
    }
    assessmentMap.set(assessment.id, assessment);
  }

  for (const lesson of lessons) {
    for (const assessmentId of lesson.relatedAssessmentIds) {
      if (!assessmentMap.has(assessmentId)) {
        throw new Error(`Lesson "${lesson.id}" references unknown assessment "${assessmentId}"`);
      }
    }
  }

  const pathways = RAW_PATHWAYS.map((raw) => learningPathwaySchema.parse(raw));
  const pathwayIds = new Set(pathways.map((p) => p.id));
  const pathwaySlugs = new Set<string>();

  for (const pathway of pathways) {
    if (pathwaySlugs.has(pathway.slug)) {
      throw new Error(`Duplicate pathway slug "${pathway.slug}"`);
    }
    pathwaySlugs.add(pathway.slug);

    for (const dId of pathway.disciplineIds) {
      if (!disciplineSet.has(dId)) {
        throw new Error(`Pathway "${pathway.id}" uses unknown discipline "${dId}"`);
      }
    }
    for (const tId of pathway.topicIds) {
      if (!topicSet.has(tId)) {
        throw new Error(`Pathway "${pathway.id}" uses unknown topic "${tId}"`);
      }
    }
    for (const prereqId of pathway.prerequisitePathwayIds) {
      if (!pathwayIds.has(prereqId) || prereqId === pathway.id) {
        throw new Error(`Pathway "${pathway.id}" has invalid prerequisite pathway "${prereqId}"`);
      }
    }
    let durationSum = 0;
    for (const item of pathway.items) {
      durationSum += item.estimatedDurationMinutes;
      if (item.kind === "lesson" && !lessonMap.has(item.targetId)) {
        throw new Error(`Pathway "${pathway.id}" references unknown lesson "${item.targetId}"`);
      }
      if (
        item.kind === "experiment" &&
        !getPublicExperimentByIdOrSlug(experimentCatalog, item.targetId)
      ) {
        throw new Error(
          `Pathway "${pathway.id}" references non-public experiment "${item.targetId}"`,
        );
      }
      if (item.kind === "assessment" && !assessmentMap.has(item.targetId)) {
        throw new Error(`Pathway "${pathway.id}" references unknown assessment "${item.targetId}"`);
      }
    }
    if (pathway.estimatedDurationMinutes !== durationSum) {
      throw new Error(
        `Pathway "${pathway.id}" duration (${pathway.estimatedDurationMinutes}) does not match item sum (${durationSum})`,
      );
    }
    for (const note of pathway.curriculumNotes) {
      const validTopics = curriculumMap.get(note.curriculumId);
      if (!validTopics) {
        throw new Error(
          `Pathway "${pathway.id}" references unknown curriculum "${note.curriculumId}"`,
        );
      }
      for (const topicId of note.curriculumTopicIds) {
        if (!validTopics.has(topicId)) {
          throw new Error(
            `Pathway "${pathway.id}" references unknown curriculum topic "${topicId}"`,
          );
        }
      }
    }
  }

  for (const assessment of assessments) {
    if (assessment.pathwayId && !pathwayIds.has(assessment.pathwayId)) {
      throw new Error(
        `Assessment "${assessment.id}" references unknown pathway "${assessment.pathwayId}"`,
      );
    }
  }

  return Object.freeze({
    glossary: Object.freeze(glossary),
    lessons: Object.freeze(lessons),
    assessments: Object.freeze(assessments),
    pathways: Object.freeze(pathways),
  });
}

export const learningCatalog: ValidatedLearningCatalog = buildValidatedLearningCatalog();

export interface PathwayQueryFilters {
  readonly stage?: LearningStage | "";
  readonly category?: ChemistryCategory | "";
  readonly query?: string;
}

export function listPathways(filters?: PathwayQueryFilters): ReadonlyArray<LearningPathway> {
  if (!filters) return learningCatalog.pathways;
  const q = filters.query?.trim().toLowerCase() ?? "";
  return learningCatalog.pathways.filter((pathway) => {
    if (filters.stage && pathway.stage !== filters.stage) return false;
    if (filters.category && pathway.category !== filters.category) return false;
    if (q.length > 0) {
      const hay =
        `${pathway.title} ${pathway.description} ${pathway.category} ${pathway.topicIds.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function getPathwayByIdOrSlug(idOrSlug: string): LearningPathway | undefined {
  return learningCatalog.pathways.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

export function getPathwaysForExperiment(experimentId: string): ReadonlyArray<LearningPathway> {
  return learningCatalog.pathways.filter((p) =>
    p.items.some((item) => item.kind === "experiment" && item.targetId === experimentId),
  );
}

export function listLessons(): ReadonlyArray<Lesson> {
  return learningCatalog.lessons;
}

export function getLessonByIdOrSlug(idOrSlug: string): Lesson | undefined {
  return learningCatalog.lessons.find((l) => l.id === idOrSlug || l.slug === idOrSlug);
}

export function getLessonsForExperiment(experimentId: string): ReadonlyArray<Lesson> {
  return learningCatalog.lessons.filter((l) => l.relatedExperimentIds.includes(experimentId));
}

export function listAssessments(): ReadonlyArray<Assessment> {
  return learningCatalog.assessments;
}

export function getAssessmentByIdOrSlug(idOrSlug: string): Assessment | undefined {
  return learningCatalog.assessments.find((a) => a.id === idOrSlug || a.slug === idOrSlug);
}

export function getAssessmentsForExperiment(experimentId: string): ReadonlyArray<Assessment> {
  return learningCatalog.assessments.filter((a) => a.experimentId === experimentId);
}

export function listGlossaryEntries(query?: string): ReadonlyArray<GlossaryEntry> {
  const q = query?.trim().toLowerCase() ?? "";
  if (q.length === 0) return learningCatalog.glossary;
  return learningCatalog.glossary.filter((entry) => {
    const hay =
      `${entry.term} ${entry.definition} ${entry.chemicalSymbols.join(" ")} ${entry.units.join(" ")}`.toLowerCase();
    return hay.includes(q);
  });
}

export function getGlossaryEntryById(id: string): GlossaryEntry | undefined {
  return learningCatalog.glossary.find((entry) => entry.id === id);
}
