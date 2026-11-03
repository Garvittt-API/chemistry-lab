import type { Metadata } from "next";

import "./global.css";

export const metadata: Metadata = {
  title: "Virtual Chemistry Lab",
  description: "Foundation application for a scientifically responsible virtual chemistry lab.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
