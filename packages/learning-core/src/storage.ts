import {
  NOTEBOOK_STORE_SCHEMA_VERSION,
  learningStoreSnapshotSchema,
  notebookSessionSchema,
  type AssessmentAttempt,
  type LearningStoreSnapshot,
  type NotebookSession,
} from "./schemas.js";

export const DEFAULT_LEARNING_STORAGE_KEY = "vcl-learning-store-v1";
export const CORRUPTED_LEARNING_BACKUP_KEY = "vcl-learning-store-corrupt-backup";

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class MemoryStorageAdapter implements KeyValueStorage {
  private readonly store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }
}

export function createEmptyStoreSnapshot(
  localProfileId = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
  now = new Date().toISOString(),
): LearningStoreSnapshot {
  return {
    schemaVersion: NOTEBOOK_STORE_SCHEMA_VERSION,
    localProfileId,
    updatedAt: now,
    startedLessonIds: [],
    completedLessonIds: [],
    sessions: [],
    assessmentAttempts: [],
    generatedReportSessionIds: [],
  };
}

export interface LoadStoreResult {
  readonly snapshot: LearningStoreSnapshot;
  readonly recoveredFromCorruption: boolean;
  readonly warningMessage?: string;
}

/**
 * Local-first repository managing learner progress, practical notebook sessions
 * and assessment attempts without requiring accounts or external databases.
 */
export class NotebookStoreRepository {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly storageKey = DEFAULT_LEARNING_STORAGE_KEY,
  ) {}

  load(): LoadStoreResult {
    const raw = this.storage.getItem(this.storageKey);
    if (!raw) {
      const fresh = createEmptyStoreSnapshot();
      this.save(fresh);
      return { snapshot: fresh, recoveredFromCorruption: false };
    }

    try {
      const parsedJson: unknown = JSON.parse(raw);
      const validated = learningStoreSnapshotSchema.safeParse(parsedJson);
      if (validated.success) {
        return { snapshot: validated.data, recoveredFromCorruption: false };
      }
      // Preserve raw string under backup key so no user work is silently lost
      this.storage.setItem(CORRUPTED_LEARNING_BACKUP_KEY, raw);
      const reset = createEmptyStoreSnapshot();
      this.save(reset);
      return {
        snapshot: reset,
        recoveredFromCorruption: true,
        warningMessage:
          "Stored local notebook data did not match schema v1.0.0; a backup was preserved locally and a clean workspace was initialized.",
      };
    } catch {
      this.storage.setItem(CORRUPTED_LEARNING_BACKUP_KEY, raw);
      const reset = createEmptyStoreSnapshot();
      this.save(reset);
      return {
        snapshot: reset,
        recoveredFromCorruption: true,
        warningMessage:
          "Stored local notebook JSON could not be parsed; a backup was preserved locally and a clean workspace was initialized.",
      };
    }
  }

  save(snapshot: LearningStoreSnapshot): LearningStoreSnapshot {
    const validated = learningStoreSnapshotSchema.parse(snapshot);
    this.storage.setItem(this.storageKey, JSON.stringify(validated));
    return validated;
  }

  markLessonStarted(lessonId: string, now = new Date().toISOString()): LearningStoreSnapshot {
    const { snapshot } = this.load();
    if (
      snapshot.startedLessonIds.includes(lessonId) ||
      snapshot.completedLessonIds.includes(lessonId)
    ) {
      return snapshot;
    }
    return this.save({
      ...snapshot,
      updatedAt: now,
      startedLessonIds: [...snapshot.startedLessonIds, lessonId],
    });
  }

  toggleLessonCompleted(
    lessonId: string,
    completed: boolean,
    now = new Date().toISOString(),
  ): LearningStoreSnapshot {
    const { snapshot } = this.load();
    const started = snapshot.startedLessonIds.includes(lessonId)
      ? snapshot.startedLessonIds
      : [...snapshot.startedLessonIds, lessonId];
    const completedIds = completed
      ? snapshot.completedLessonIds.includes(lessonId)
        ? snapshot.completedLessonIds
        : [...snapshot.completedLessonIds, lessonId]
      : snapshot.completedLessonIds.filter((id) => id !== lessonId);

    return this.save({
      ...snapshot,
      updatedAt: now,
      startedLessonIds: started,
      completedLessonIds: completedIds,
    });
  }

  upsertSession(session: NotebookSession, now = new Date().toISOString()): LearningStoreSnapshot {
    const validatedSession = notebookSessionSchema.parse(session);
    const { snapshot } = this.load();
    const exists = snapshot.sessions.some((s) => s.sessionId === validatedSession.sessionId);
    const nextSessions = exists
      ? snapshot.sessions.map((s) =>
          s.sessionId === validatedSession.sessionId ? validatedSession : s,
        )
      : [validatedSession, ...snapshot.sessions];

    return this.save({
      ...snapshot,
      updatedAt: now,
      sessions: nextSessions,
    });
  }

  deleteSession(sessionId: string, now = new Date().toISOString()): LearningStoreSnapshot {
    const { snapshot } = this.load();
    return this.save({
      ...snapshot,
      updatedAt: now,
      sessions: snapshot.sessions.filter((s) => s.sessionId !== sessionId),
      generatedReportSessionIds: snapshot.generatedReportSessionIds.filter(
        (id) => id !== sessionId,
      ),
    });
  }

  recordAssessmentAttempt(
    attempt: AssessmentAttempt,
    now = new Date().toISOString(),
  ): LearningStoreSnapshot {
    const { snapshot } = this.load();
    return this.save({
      ...snapshot,
      updatedAt: now,
      assessmentAttempts: [attempt, ...snapshot.assessmentAttempts],
    });
  }

  markReportGenerated(sessionId: string, now = new Date().toISOString()): LearningStoreSnapshot {
    const { snapshot } = this.load();
    if (snapshot.generatedReportSessionIds.includes(sessionId)) {
      return snapshot;
    }
    return this.save({
      ...snapshot,
      updatedAt: now,
      generatedReportSessionIds: [...snapshot.generatedReportSessionIds, sessionId],
    });
  }

  clearAll(now = new Date().toISOString()): LearningStoreSnapshot {
    const fresh = createEmptyStoreSnapshot(undefined, now);
    return this.save(fresh);
  }
}
