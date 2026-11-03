"use client";

import { MonitorCog, Moon, Sun } from "lucide-react";

import { useTheme } from "./theme-provider";

export function SettingsView() {
  const { theme, setTheme } = useTheme();

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
          <MonitorCog size={25} aria-hidden="true" />
          <h2>More settings later</h2>
          <p>
            Language, content preferences and learner records require separate product, privacy and
            persistence decisions.
          </p>
        </aside>
      </div>
    </section>
  );
}
