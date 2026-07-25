"use client";

import type { ReactNode } from "react";

const Check = ({ show }: { show: boolean }) => (
  <div className="check-indicator w-6 h-6 rounded-full border-2 border-neutral-300 flex items-center justify-center flex-shrink-0">
    <svg
      className={`w-3.5 h-3.5 text-white ${show ? "block" : "hidden"}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </div>
);

export type SelectOption = {
  value: string | boolean;
  label: ReactNode;
  desc?: ReactNode;
};

/** Stacked full-width option cards (checkmark on the right). */
export function SelectList({
  options,
  value,
  onSelect,
}: {
  options: SelectOption[];
  value: any;
  onSelect: (value: any) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <div
            key={String(opt.value)}
            className={`card-option p-5 rounded-lg cursor-pointer flex items-center justify-between ${selected ? "selected" : ""}`}
            onClick={() => onSelect(opt.value)}
          >
            <div className="flex flex-col text-left">
              <span className="font-bold text-neutral-800 text-base sm:text-lg">{opt.label}</span>
              {opt.desc && <span className="text-xs text-neutral-600 mt-1">{opt.desc}</span>}
            </div>
            <Check show={selected} />
          </div>
        );
      })}
    </div>
  );
}

/** Grid of taller option cards (checkmark bottom-right). */
export function SelectGrid({
  options,
  value,
  onSelect,
}: {
  options: SelectOption[];
  value: any;
  onSelect: (value: any) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <div
            key={String(opt.value)}
            className={`card-option p-6 rounded-lg cursor-pointer flex flex-col justify-between min-h-[140px] text-left ${selected ? "selected" : ""}`}
            onClick={() => onSelect(opt.value)}
          >
            <div className="flex flex-col">
              <span className="font-bold text-neutral-800 text-base sm:text-lg">{opt.label}</span>
              {opt.desc && <span className="text-xs text-neutral-600 mt-2">{opt.desc}</span>}
            </div>
            <div className="flex justify-end mt-4">
              <Check show={selected} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Formatted currency (Rs.) text input. */
export function CurrencyInput({
  value,
  onChange,
  placeholder = "0",
}: {
  value: number | undefined;
  onChange: (n: number) => void;
  placeholder?: string;
}) {
  const display = value ? Number(value).toLocaleString("en-US") : "";
  return (
    <div className="currency-input-wrapper relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <span className="text-neutral-600 font-bold sm:text-lg">Rs.</span>
      </div>
      <input
        type="text"
        inputMode="numeric"
        className="block w-full pl-12 pr-4 py-4 sm:py-5 border-2 border-neutral-200 rounded-lg text-neutral-800 text-lg sm:text-xl font-bold tracking-wide text-left"
        placeholder={placeholder}
        value={display}
        autoComplete="off"
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          onChange(digits === "" ? 0 : parseInt(digits, 10));
        }}
      />
    </div>
  );
}

/** Big +/- counter (used for Living Wives). */
export function BigCounter({
  value,
  min = 0,
  max = 99,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="flex items-center gap-6">
        <button
          type="button"
          className="w-14 h-14 rounded-full border-2 border-neutral-300 hover:border-neutral-800 flex items-center justify-center font-bold text-xl cursor-pointer"
          onClick={() => value > min && onChange(value - 1)}
        >
          -
        </button>
        <span className="text-4xl font-extrabold text-neutral-800 w-12 text-center">{value}</span>
        <button
          type="button"
          className="w-14 h-14 rounded-full border-2 border-neutral-300 hover:border-neutral-800 flex items-center justify-center font-bold text-xl cursor-pointer"
          onClick={() => value < max && onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

/** Row with a label + description and a compact +/- counter. */
export function CounterRow({
  title,
  desc,
  value,
  min = 0,
  max = 99,
  onChange,
}: {
  title: ReactNode;
  desc?: ReactNode;
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl bg-neutral-50">
      <div className="flex flex-col">
        <span className="font-bold text-neutral-800">{title}</span>
        {desc && <span className="text-xs text-neutral-500">{desc}</span>}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="w-10 h-10 rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 flex items-center justify-center font-bold cursor-pointer"
          onClick={() => value > min && onChange(value - 1)}
        >
          -
        </button>
        <span className="text-xl font-extrabold text-neutral-800 w-8 text-center">{value}</span>
        <button
          type="button"
          className="w-10 h-10 rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 flex items-center justify-center font-bold cursor-pointer"
          onClick={() => value < max && onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

/** External link with an arrow-box icon (DC rate / filer status). */
export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs font-bold text-brand-orange hover:underline inline-flex items-center gap-1.5"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
      <span>{children}</span>
    </a>
  );
}
