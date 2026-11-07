import type { Metadata } from "next";

import { LearningStoreProvider } from "../components/learning/learning-store-provider";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { ThemeProvider } from "../components/theme-provider";
import "./global.css";
import "./visualization.css";
import "./learning.css";

export const metadata: Metadata = {
  title: {
    default: "Virtual Chemistry Lab",
    template: "%s · Virtual Chemistry Lab",
  },
  description: "A clear, accessible foundation for scientifically responsible chemistry learning.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <LearningStoreProvider>
            <a className="skip-link" href="#main-content">
              Skip to content
            </a>
            <SiteHeader />
            <main id="main-content">{children}</main>
            <SiteFooter />
          </LearningStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
