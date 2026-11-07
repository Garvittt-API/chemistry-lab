"use client";

import { PackagePlus } from "lucide-react";

import type { EquipmentDefinition } from "@virtual-chemistry-lab/laboratory-core";

/**
 * Equipment selection tray. Learner picks items and they appear in the
 * workspace. The tray presents ONLY the equipment items relevant to the
 * current experiment (passed in via `available`).
 */
export function EquipmentTray({
  available,
  placed,
  onAdd,
}: {
  available: ReadonlyArray<EquipmentDefinition>;
  placed: ReadonlySet<string>;
  onAdd: (id: string) => void;
}) {
  return (
    <section className="lab-tray" aria-labelledby="tray-title">
      <div className="lab-panel-header">
        <h3 id="tray-title">
          <PackagePlus size={16} aria-hidden={true} /> Equipment
        </h3>
      </div>
      <p className="lab-tray-hint">
        Click to add glassware and instruments to the workspace. You can also select items by
        keyboard (Enter adds / selects).
      </p>
      <ul className="lab-tray-list" role="list">
        {available.map((eq) => {
          const alreadyPlaced = placed.has(eq.id);
          return (
            <li key={eq.id}>
              <button
                type="button"
                className={"lab-tray-item" + (alreadyPlaced ? " lab-tray-item-placed" : "")}
                onClick={() => onAdd(eq.id)}
                disabled={alreadyPlaced}
                aria-label={
                  alreadyPlaced
                    ? `${eq.accessibilityLabel} (already on workspace)`
                    : eq.accessibilityLabel
                }
                aria-pressed={alreadyPlaced}
              >
                <span className="lab-tray-item-label">{eq.label}</span>
                <span className="lab-tray-item-meta">
                  {eq.capacityMl ? `${eq.capacityMl} mL` : eq.category.replace("_", " ")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
