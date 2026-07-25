"use client";

import { useCallback, useRef, useState } from "react";
import type { WizardStep, WizardValues } from "./types";

type WizardProps = {
  steps: WizardStep[];
  initialValues?: WizardValues;
  onComplete: (values: WizardValues) => void;
  /** Called when the user presses Back on the very first step. */
  onExit: () => void;
};

function resolve<T>(v: T | ((values: WizardValues) => T), values: WizardValues): T {
  return typeof v === "function" ? (v as (values: WizardValues) => T)(values) : v;
}

export default function Wizard({ steps, initialValues, onComplete, onExit }: WizardProps) {
  const valuesRef = useRef<WizardValues>({ ...(initialValues ?? {}) });
  const [, forceRender] = useState(0);
  const rerender = useCallback(() => forceRender((n) => n + 1), []);

  const initialActive = steps.filter(
    (s) => !(s.shouldSkip && s.shouldSkip(valuesRef.current)),
  );
  const firstId = initialActive[0]?.id ?? steps[0]?.id;
  const [currentStepId, setCurrentStepId] = useState<string>(firstId);
  const [fade, setFade] = useState<"in" | "out">("in");

  const values = valuesRef.current;
  const active = steps.filter((s) => !(s.shouldSkip && s.shouldSkip(values)));
  const index = Math.max(
    0,
    active.findIndex((s) => s.id === currentStepId),
  );
  const currentStep = active[index] ?? active[0];
  const total = active.length;
  const current = index + 1;

  const validateStep = useCallback(
    (step: WizardStep) => {
      const val = values[step.field];
      if (step.validate) return step.validate(val, values);
      return val !== undefined && val !== null && val !== "";
    },
    [values],
  );

  const isValid = currentStep ? validateStep(currentStep) : false;

  const transitionTo = useCallback((stepId: string) => {
    setFade("out");
    setTimeout(() => {
      setCurrentStepId(stepId);
      setFade("in");
    }, 250);
  }, []);

  const goNext = useCallback(() => {
    if (!currentStep || !validateStep(currentStep)) return;
    const act = steps.filter((s) => !(s.shouldSkip && s.shouldSkip(valuesRef.current)));
    const idx = act.findIndex((s) => s.id === currentStep.id);
    if (idx < act.length - 1) {
      transitionTo(act[idx + 1].id);
    } else {
      onComplete({ ...valuesRef.current });
    }
  }, [currentStep, steps, transitionTo, onComplete, validateStep]);

  const goBack = useCallback(() => {
    const act = steps.filter((s) => !(s.shouldSkip && s.shouldSkip(valuesRef.current)));
    const idx = act.findIndex((s) => s.id === currentStepId);
    if (idx > 0) {
      transitionTo(act[idx - 1].id);
    } else {
      onExit();
    }
  }, [steps, currentStepId, transitionTo, onExit]);

  const patch = useCallback(
    (field: string, value: any) => {
      valuesRef.current[field] = value;
      rerender();
    },
    [rerender],
  );

  const setValue = useCallback(
    (field: string, value: any) => {
      valuesRef.current[field] = value;
      rerender();
      const step = currentStep;
      if (!step) return;
      const auto = resolve(step.autoSubmit ?? false, valuesRef.current);
      if (auto && validateStep(step)) {
        setTimeout(() => goNext(), 250);
      }
    },
    [currentStep, goNext, rerender, validateStep],
  );

  if (!currentStep) return null;

  const questionText = resolve(currentStep.question, values);
  const autoSubmit = resolve(currentStep.autoSubmit ?? false, values);

  return (
    <div
      className={`wizard-slide bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden min-h-[300px] fade-${fade}`}
    >
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
        <div className="step-indicator text-xs font-semibold text-neutral-600 mb-2 uppercase tracking-widest text-left">
          Step {current} of {total}
        </div>

        <div className="w-full bg-neutral-100 h-1 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-neutral-800 h-full transition-all duration-300"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-8 leading-tight text-left">
          {questionText}
        </h2>

        <div className="mb-8 min-h-[180px]">
          {currentStep.render({
            value: values[currentStep.field],
            values,
            setValue,
            patch,
            refresh: rerender,
          })}
        </div>

        <div className="controls-wrapper flex justify-between items-center border-t border-neutral-200 pt-6">
          <button
            type="button"
            className="btn btn-secondary px-6 py-3 rounded-md font-semibold text-sm cursor-pointer"
            onClick={goBack}
          >
            Back
          </button>
          {!autoSubmit && (
            <button
              type="button"
              className="btn btn-primary px-8 py-3 rounded-md font-semibold text-sm cursor-pointer disabled:opacity-50"
              onClick={goNext}
              disabled={!isValid}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
