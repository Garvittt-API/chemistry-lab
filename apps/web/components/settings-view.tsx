"use client";

import { Database, Moon, Sun, Trash2 } from "lucide-react";
import { useState } from "react";

import { useLearningStore } from "./learning/learning-store-provider";
import { useTheme } from "./theme-provider";

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { hydrated, snapshot, clearAllData } = useLearningStore();
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  return (
    <section className="container section section-border" aria-labelledby="display-settings-title">
      <div className="settings-grid">
        <div className="settings-panel">
          <p className="eyebrow">Display</p>
          <h2 id="display-settings-title">Theme preference</h2>
          <p>
            Choose a light or dark reading environment. The preference is stored locally in this
            browser.
          </p>
          <fieldset className="theme-options">
            <legend className="sr-only">Theme preference</legend>
            <label className="theme-option">
              <input
                type="radio"
                name="theme"
                checked={theme === "light"}
                onChange={() => setTheme("light")}
              />
              <Sun size={18} aria-hidden="true" />
              <span>Light</span>
            </label>
            <label className="theme-option">
              <input
                type="radio"
                name="theme"
                checked={theme === "dark"}
                onChange={() => setTheme("dark")}
              />
              <Moon size={18} aria-hidden="true" />
              <span>Dark</span>
            </label>
          </fieldset>
        </div>

        <aside className="about-note">
          <Database size={25} aria-hidden="true" />
          <h2>Local learning &amp; notebook storage</h2>
          <p>
            Practical notebook sessions, quiz attempts and pathway progress are stored locally in
            this browser (no user account or cloud sync).
          </p>
          {hydrated ? (
            <p className="card-meta">
              Stored locally: {snapshot.sessions.length} sessions ·{" "}
              {snapshot.completedLessonIds.length} completed lessons ·{" "}
              {snapshot.assessmentAttempts.length} quiz attempts.
            </p>
          ) : null}
          {clearedNotice ? (
            <p className="card-meta" role="status">
              Local learning and notebook records cleared.
            </p>
          ) : null}
          {confirmClear ? (
            <div className="confirm-box" role="alert">
              <p>
                <strong>Clear all local notebook sessions, assessments and progress?</strong> Export
                any important sessions as JSON first.
              </p>
              <div className="notebook-actions-row">
                <button
                  type="button"
                  className="button button-danger"
                  onClick={() => {
                    clearAllData();
                    setConfirmClear(false);
                    setClearedNotice(true);
                  }}
                >
                  Confirm clear all
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="button button-danger"
              onClick={() => setConfirmClear(true)}
            >
              <Trash2 size={15} aria-hidden="true" /> Clear local learning data
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}
