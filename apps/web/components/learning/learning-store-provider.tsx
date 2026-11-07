"use client";

import type { ExperimentRecord } from "@virtual-chemistry-lab/experiment-schema";
import {
  createEmptyStoreSnapshot,
  createNotebookSession,
  DEFAULT_LEARNING_STORAGE_KEY,
  importSessionJson,
  MemoryStorageAdapter,
  NotebookStoreRepository,
  type AssessmentAttempt,
  type KeyValueStorage,
  type LearningStoreSnapshot,
  type NotebookSession,
  type SessionImportResult,
} from "@virtual-chemistry-lab/learning-core";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const SSR_EMPTY_SNAPSHOT = createEmptyStoreSnapshot("local-unhydrated", "1970-01-01T00:00:00.000Z");

function getBrowserStorage(): KeyValueStorage {
  if (typeof window === "undefined") {
    return new MemoryStorageAdapter();
  }
  try {
    const probeKey = "__vcl_storage_probe__";
    window.localStorage.setItem(probeKey, "1");
    window.localStorage.removeItem(probeKey);
    return window.localStorage;
  } catch {
    return new MemoryStorageAdapter();
  }
}

export interface LearningStoreContextValue {
  readonly hydrated: boolean;
  readonly snapshot: LearningStoreSnapshot;
  readonly recoveryWarning: string | null;
  dismissRecoveryWarning: () => void;
  markLessonStarted: (lessonId: string) => void;
  toggleLessonCompleted: (lessonId: string, completed: boolean) => void;
  createSession: (options: {
    experiment: Pick<ExperimentRecord, "identity" | "references">;
    title?: string;
    pathwayId?: string;
  }) => NotebookSession;
  saveSession: (session: NotebookSession) => void;
  deleteSession: (sessionId: string) => void;
  recordAssessmentAttempt: (attempt: AssessmentAttempt) => void;
  markReportGenerated: (sessionId: string) => void;
  importSession: (rawJson: string) => SessionImportResult;
  clearAllData: () => void;
}

const LearningStoreContext = createContext<LearningStoreContextValue | null>(null);

export function LearningStoreProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const repoRef = useRef<NotebookStoreRepository | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [snapshot, setSnapshot] = useState<LearningStoreSnapshot>(SSR_EMPTY_SNAPSHOT);
  const [recoveryWarning, setRecoveryWarning] = useState<string | null>(null);

  const getRepo = useCallback((): NotebookStoreRepository => {
    if (!repoRef.current) {
      repoRef.current = new NotebookStoreRepository(getBrowserStorage());
    }
    return repoRef.current;
  }, []);

  useEffect(() => {
    const repo = getRepo();
    const loaded = repo.load();
    setSnapshot(loaded.snapshot);
    if (loaded.recoveredFromCorruption && loaded.warningMessage) {
      setRecoveryWarning(loaded.warningMessage);
    }
    setHydrated(true);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === DEFAULT_LEARNING_STORAGE_KEY) {
        setSnapshot(repo.load().snapshot);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [getRepo]);

  const markLessonStarted = useCallback(
    (lessonId: string) => {
      const next = getRepo().markLessonStarted(lessonId);
      setSnapshot(next);
    },
    [getRepo],
  );

  const toggleLessonCompleted = useCallback(
    (lessonId: string, completed: boolean) => {
      const next = getRepo().toggleLessonCompleted(lessonId, completed);
      setSnapshot(next);
    },
    [getRepo],
  );

  const createSession = useCallback(
    (options: {
      experiment: Pick<ExperimentRecord, "identity" | "references">;
      title?: string;
      pathwayId?: string;
    }): NotebookSession => {
      const repo = getRepo();
      const current = repo.load().snapshot;
      const created = createNotebookSession({
        experiment: options.experiment,
        localProfileId: current.localProfileId,
        title: options.title,
        pathwayId: options.pathwayId,
      });
      const next = repo.upsertSession(created);
      setSnapshot(next);
      return created;
    },
    [getRepo],
  );

  const saveSession = useCallback(
    (session: NotebookSession) => {
      const next = getRepo().upsertSession(session);
      setSnapshot(next);
    },
    [getRepo],
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      const next = getRepo().deleteSession(sessionId);
      setSnapshot(next);
    },
    [getRepo],
  );

  const recordAssessmentAttempt = useCallback(
    (attempt: AssessmentAttempt) => {
      const next = getRepo().recordAssessmentAttempt(attempt);
      setSnapshot(next);
    },
    [getRepo],
  );

  const markReportGenerated = useCallback(
    (sessionId: string) => {
      const next = getRepo().markReportGenerated(sessionId);
      setSnapshot(next);
    },
    [getRepo],
  );

  const importSession = useCallback(
    (rawJson: string): SessionImportResult => {
      const repo = getRepo();
      const current = repo.load().snapshot;
      const existingIds = new Set(current.sessions.map((s) => s.sessionId));
      const result = importSessionJson(rawJson, {
        localProfileId: current.localProfileId,
        existingSessionIds: existingIds,
      });
      if (result.ok) {
        const next = repo.upsertSession(result.session);
        setSnapshot(next);
      }
      return result;
    },
    [getRepo],
  );

  const clearAllData = useCallback(() => {
    const next = getRepo().clearAll();
    setSnapshot(next);
  }, [getRepo]);

  const dismissRecoveryWarning = useCallback(() => {
    setRecoveryWarning(null);
  }, []);

  const value = useMemo<LearningStoreContextValue>(
    () => ({
      hydrated,
      snapshot,
      recoveryWarning,
      dismissRecoveryWarning,
      markLessonStarted,
      toggleLessonCompleted,
      createSession,
      saveSession,
      deleteSession,
      recordAssessmentAttempt,
      markReportGenerated,
      importSession,
      clearAllData,
    }),
    [
      hydrated,
      snapshot,
      recoveryWarning,
      dismissRecoveryWarning,
      markLessonStarted,
      toggleLessonCompleted,
      createSession,
      saveSession,
      deleteSession,
      recordAssessmentAttempt,
      markReportGenerated,
      importSession,
      clearAllData,
    ],
  );

  return <LearningStoreContext.Provider value={value}>{children}</LearningStoreContext.Provider>;
}

export function useLearningStore(): LearningStoreContextValue {
  const ctx = useContext(LearningStoreContext);
  if (!ctx) {
    throw new Error("useLearningStore must be used inside LearningStoreProvider");
  }
  return ctx;
}
