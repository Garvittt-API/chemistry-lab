"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Box, FlaskConical, Shapes } from "lucide-react";
import { Laboratory3d } from "../visualization/laboratory-3d";

export function ExperimentWorkspace({
  experimentId,
  children,
}: {
  experimentId: string;
  children: ReactNode;
}) {
  const [view, setView] = useState<"2d" | "3d">("2d");
  return (
    <div className="container experiment-workspace">
      <div className="lab-view-switcher segmented-control" aria-label="Laboratory representation">
        <button type="button" aria-pressed={view === "2d"} onClick={() => setView("2d")}>
          <FlaskConical size={16} />
          2D laboratory
        </button>
        <button type="button" aria-pressed={view === "3d"} onClick={() => setView("3d")}>
          <Box size={16} />
          3D equipment
        </button>
        <Link href="/molecules">
          <Shapes size={16} />
          Molecular library
        </Link>
      </div>
      <div hidden={view !== "2d"}>{children}</div>
      {view === "3d" ? <Laboratory3d experimentId={experimentId} /> : null}
    </div>
  );
}
