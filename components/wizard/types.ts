import type { ReactNode } from "react";

export type WizardValues = Record<string, any>;

export type StepRenderProps = {
  value: any;
  values: WizardValues;
  /** Update a field. If the current step is autoSubmit and now valid, the wizard auto-advances. */
  setValue: (field: string, value: any) => void;
  /** Update a field WITHOUT triggering auto-advance (used for text/counter inputs). */
  patch: (field: string, value: any) => void;
  /** Force a re-render of the current step (e.g. after mutating an array in place). */
  refresh: () => void;
};

export type LocalizedText = string;

export type WizardStep = {
  id: string;
  field: string;
  question: LocalizedText | ((values: WizardValues) => LocalizedText);
  autoSubmit?: boolean | ((values: WizardValues) => boolean);
  shouldSkip?: (values: WizardValues) => boolean;
  validate?: (val: any, values: WizardValues) => boolean;
  render: (props: StepRenderProps) => ReactNode;
};
