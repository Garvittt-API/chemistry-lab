"use client";

import { CheckCircle2, Circle, Play, RotateCcw } from "lucide-react";

import type { ProcedureState } from "@virtual-chemistry-lab/laboratory-core";

import { classNames } from "../../lib/utils";

/**
 * Step-by-step procedure panel with status indicators.
 */
export function ProcedurePanel({
  state,
  onStart,
  onReset,
}: {
  state: ProcedureState;
  onStart: () => void;
  onReset: () => void;
}) {
  return (
    <section className="lab-procedure-panel" aria-labelledby="procedure-title">
      <div className="lab-panel-header">
        <h3 id="procedure-title">Procedure</h3>
        <div className="lab-panel-actions">
          {state.status === "not_started" || state.status === "reset" ? (
            <button type="button" className="button" onClick={onStart}>
              <Play size={15} aria-hidden={true} /> Start
            </button>
          ) : null}
          {state.status !== "not_started" ? (
            <button type="button" className="button button-secondary" onClick={onReset}>
              <RotateCcw size={15} aria-hidden={true} /> Reset
            </button>
          ) : null}
        </div>
      </div>
      <ol className="lab-step-list">
        {state.steps.map((step, i) => {
          const status = state.stepStatus[step.id];
          const isCurrent = i === state.currentStepIndex;
          return (
            <li
              key={step.id}
              className={classNames(
                "lab-step",
                isCurrent && "lab-step-current",
                status === "completed" && "lab-step-completed",
                status === "invalid_action" && "lab-step-invalid",
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="lab-step-icon" aria-hidden={true}>
                {status === "completed" ? (
                  <CheckCircle2 size={18} />
                ) : status === "invalid_action" ? (
                  <Circle size={18} className="lab-step-icon-error" />
                ) : (
                  <Circle size={18} />
                )}
              </div>
              <div className="lab-step-body">
                <p className="lab-step-instruction">
                  <span className="lab-step-number">Step {i + 1}.</span> {step.instruction}
                </p>
                {step.explanation && isCurrent ? (
                  <p className="lab-step-explanation">{step.explanation}</p>
                ) : null}
                {status === "invalid_action" && state.lastError && isCurrent ? (
                  <p className="lab-step-error" role="alert">
                    {state.lastError}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
