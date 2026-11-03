import type { Metadata } from "next";

import { SettingsView } from "../../components/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Display settings for Virtual Chemistry Lab.",
};

export default function SettingsPage() {
  return (
    <div className="page">
      <section className="container page-intro">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Shape the reading environment.</h1>
          <p className="page-intro-copy">
            Only local display preferences are available in this foundation. No account, tracking or
            saved learner data is involved.
          </p>
        </div>
      </section>
      <SettingsView />
    </div>
  );
}
