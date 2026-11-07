"use client";

import type { ExperimentRecord } from "@virtual-chemistry-lab/experiment-schema";
import {
  duplicateNotebookSession,
  renameNotebookSession,
  type SessionStatus,
} from "@virtual-chemistry-lab/learning-core";
import { ArrowRight, Copy, FileText, FolderPlus, Pencil, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProgressStatusPill } from "./badges";
import { useLearningStore } from "./learning-store-provider";

export function NotebookListView({
  experiments,
  initialExperimentSlug,
}: Readonly<{
  experiments: ReadonlyArray<Pick<ExperimentRecord, "identity" | "references">>;
  initialExperimentSlug?: string;
}>) {
  const router = useRouter();
  const {
    hydrated,
    snapshot,
    recoveryWarning,
    dismissRecoveryWarning,
    createSession,
    saveSession,
    deleteSession,
    importSession,
  } = useLearningStore();

  const defaultExpId =
    experiments.find(
      (e) => e.identity.slug === initialExperimentSlug || e.identity.id === initialExperimentSlug,
    )?.identity.id ??
    experiments[0]?.identity.id ??
    "";

  const [selectedExpId, setSelectedExpId] = useState(defaultExpId);
  const [customTitle, setCustomTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SessionStatus>("all");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [importFeedback, setImportFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const filteredSessions = snapshot.sessions.filter((s) =>
    statusFilter === "all" ? true : s.status === statusFilter,
  );

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    const exp = experiments.find((e) => e.identity.id === selectedExpId);
    if (!exp) return;
    const created = createSession({
      experiment: exp,
      title: customTitle.trim() || undefined,
    });
    setCustomTitle("");
    router.push(`/notebook/${created.sessionId}`);
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const raw = await file.text();
      const result = importSession(raw);
      if (result.ok) {
        setImportFeedback({
          ok: true,
          message: `Imported session "${result.session.title}" successfully.`,
        });
      } else {
        setImportFeedback({ ok: false, message: result.error });
      }
    } catch {
      setImportFeedback({ ok: false, message: "Could not read selected file." });
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="container">
      {recoveryWarning ? (
        <div className="callout-banner callout-banner-warning" role="alert">
          <p>{recoveryWarning}</p>
          <button
            type="button"
            className="button button-secondary"
            onClick={dismissRecoveryWarning}
          >
            Dismiss notice
          </button>
        </div>
      ) : null}

      <div className="learning-grid-2">
        <section className="learning-card" aria-labelledby="new-session-heading">
          <h2 id="new-session-heading">
            <FolderPlus size={19} aria-hidden="true" /> Start a practical notebook session
          </h2>
          <p className="card-meta">
            Create a structured digital lab-book session tied to a versioned experiment record.
            Sessions are stored locally in this browser.
          </p>
          <form onSubmit={handleCreate} className="pathway-step-list">
            <label className="learning-field">
              Experiment
              <select
                value={selectedExpId}
                onChange={(e) => setSelectedExpId(e.target.value)}
                required
              >
                {experiments.map((exp) => (
                  <option key={exp.identity.id} value={exp.identity.id}>
                    {exp.identity.title} (v{exp.identity.contentVersion})
                  </option>
                ))}
              </select>
            </label>
            <label className="learning-field">
              Session title (optional)
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Serial Dilution Trial #1"
              />
            </label>
            <button type="submit" className="button">
              Create &amp; open session <ArrowRight size={16} aria-hidden="true" />
            </button>
          </form>
        </section>

        <section className="learning-card" aria-labelledby="import-session-heading">
          <h2 id="import-session-heading">
            <Upload size={19} aria-hidden="true" /> Import exported session (.json)
          </h2>
          <p className="card-meta">
            Restore a previously exported Virtual Chemistry Lab notebook session JSON file (maximum
            1 MiB; strictly schema-validated with provenance preserved).
          </p>
          <label className="learning-field">
            Select session JSON file
            <input type="file" accept=".json,application/json" onChange={handleFileImport} />
          </label>
          {importFeedback ? (
            <div
              className={importFeedback.ok ? "quiz-feedback-pass" : "quiz-feedback-fail"}
              role="status"
            >
              {importFeedback.message}
            </div>
          ) : null}
        </section>
      </div>

      <section className="section section-border" aria-labelledby="saved-sessions-heading">
        <div className="learning-card-header">
          <div>
            <p className="eyebrow">Local lab book</p>
            <h2 id="saved-sessions-heading">
              Saved practical sessions ({hydrated ? filteredSessions.length : 0})
            </h2>
          </div>
          <label className="learning-field" style={{ minWidth: "12rem" }}>
            Filter by status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | SessionStatus)}
            >
              <option value="all">All sessions</option>
              <option value="draft">Draft / Started</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>

        {!hydrated ? (
          <p className="card-meta">Loading local sessions...</p>
        ) : filteredSessions.length === 0 ? (
          <div className="learning-card">
            <h3>No practical sessions match this view yet</h3>
            <p className="card-meta">
              Start a session above or launch one from any experiment detail page to record
              observations, structured data tables, engine calculations and lab reports.
            </p>
          </div>
        ) : (
          <div className="pathway-step-list">
            {filteredSessions.map((session) => {
              const progStatus =
                session.status === "completed"
                  ? "completed"
                  : session.status === "in_progress"
                    ? "in_progress"
                    : "started";
              return (
                <article key={session.sessionId} className="learning-card">
                  <div className="learning-card-header">
                    <div className="learning-pill-row">
                      <ProgressStatusPill status={progStatus} />
                      <span className="card-meta">
                        Experiment v{session.experimentVersion} · Rev {session.revision}
                      </span>
                    </div>
                    <span className="card-meta">
                      Updated {session.updatedAt.slice(0, 16).replace("T", " ")} UTC
                    </span>
                  </div>

                  {renamingId === session.sessionId ? (
                    <div className="notebook-actions-row">
                      <label className="sr-only" htmlFor={`rename-${session.sessionId}`}>
                        New session title
                      </label>
                      <input
                        id={`rename-${session.sessionId}`}
                        type="text"
                        value={renameDraft}
                        onChange={(e) => setRenameDraft(e.target.value)}
                      />
                      <button
                        type="button"
                        className="button"
                        onClick={() => {
                          if (renameDraft.trim()) {
                            saveSession(renameNotebookSession(session, renameDraft));
                            setRenamingId(null);
                          }
                        }}
                      >
                        Save title
                      </button>
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => setRenamingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <h3>{session.title}</h3>
                  )}

                  <p className="card-meta">
                    Experiment: <strong>{session.experimentTitle}</strong> ·{" "}
                    {session.observations.length} observations · {session.calculations.length}{" "}
                    calculations · {session.dataTables.reduce((sum, t) => sum + t.rows.length, 0)}{" "}
                    table rows
                  </p>

                  {confirmDeleteId === session.sessionId ? (
                    <div className="confirm-box" role="alert">
                      <p>
                        <strong>Delete session &ldquo;{session.title}&rdquo;?</strong> This removes
                        it permanently from local browser storage.
                      </p>
                      <div className="notebook-actions-row">
                        <button
                          type="button"
                          className="button button-danger"
                          onClick={() => {
                            deleteSession(session.sessionId);
                            setConfirmDeleteId(null);
                          }}
                        >
                          Confirm delete
                        </button>
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="learning-card-footer">
                    <div className="notebook-actions-row">
                      <Link className="button" href={`/notebook/${session.sessionId}`}>
                        {session.status === "completed" ? "View session" : "Resume session"}
                      </Link>
                      <Link
                        className="button button-secondary"
                        href={`/notebook/${session.sessionId}/report`}
                      >
                        <FileText size={15} aria-hidden="true" /> Practical report
                      </Link>
                    </div>
                    <div className="notebook-actions-row">
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => {
                          setRenamingId(session.sessionId);
                          setRenameDraft(session.title);
                        }}
                      >
                        <Pencil size={14} aria-hidden="true" /> Rename
                      </button>
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => saveSession(duplicateNotebookSession(session))}
                      >
                        <Copy size={14} aria-hidden="true" /> Duplicate
                      </button>
                      <button
                        type="button"
                        className="button button-danger"
                        onClick={() => setConfirmDeleteId(session.sessionId)}
                      >
                        <Trash2 size={14} aria-hidden="true" /> Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
