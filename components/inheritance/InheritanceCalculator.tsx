"use client";

import { useState } from "react";
import Wizard from "@/components/wizard/Wizard";
import type { WizardValues } from "@/components/wizard/types";
import { inheritanceSteps } from "@/lib/inheritance/steps";
import { formatRupees, type InheritanceValues } from "@/lib/inheritance/engine";
import InheritanceResults from "@/lib/inheritance/InheritanceResults";

type Screen = "landing" | "wizard" | "review" | "results";

export default function InheritanceCalculator() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [values, setValues] = useState<WizardValues>({});

  function goHome() {
    setScreen("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (screen === "landing") {
    return (
      <main className="flex-grow flex flex-col items-center justify-center py-16 sm:py-24 px-4">
        <div className="w-full max-w-2xl text-center">
          <span className="text-xs font-bold text-brand-orange tracking-widest uppercase mb-3 block">
            Chaudary Property Advisor
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight mb-5 leading-tight">
            Inheritance Calculator
          </h1>
          <p className="text-neutral-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-6">
            Determine the legal inheritance distribution of amount and property according to Fiqh
            Hanafi and Muslim Family Laws Ordinance 1961.
          </p>
          <p className="text-red-600 text-sm font-semibold mb-8">
            Note: This calculator is currently not valid for step-siblings.
          </p>
          <button
            className="btn btn-primary px-10 py-4 rounded-lg font-bold text-base cursor-pointer shadow-md"
            onClick={() => {
              setValues({});
              setScreen("wizard");
            }}
          >
            Start Calculation
          </button>
        </div>
      </main>
    );
  }

  if (screen === "wizard") {
    return (
      <main className="flex-grow w-full max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Wizard
          steps={inheritanceSteps}
          initialValues={values}
          onComplete={(v) => {
            setValues(v);
            setScreen("review");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onExit={goHome}
        />
      </main>
    );
  }

  if (screen === "review") {
    return (
      <main className="flex-grow w-full max-w-3xl mx-auto px-4 py-10 sm:py-16 text-center">
        <span className="text-xs font-bold text-brand-orange tracking-widest uppercase mb-2 block">
          Chaudary Property Advisor
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mb-2">
          Review Details
        </h1>
        <p className="text-neutral-500 text-sm mb-8">
          Please review the family structure and asset details before generating the final
          distribution.
        </p>

        <ReviewSummary values={values} />

        <div className="flex justify-center gap-4 mt-8">
          <button
            className="btn btn-secondary px-6 py-3.5 rounded-lg font-semibold text-sm cursor-pointer"
            onClick={() => setScreen("wizard")}
          >
            Back &amp; Edit
          </button>
          <button
            className="btn btn-primary px-6 py-3.5 rounded-lg font-semibold text-sm cursor-pointer"
            onClick={() => {
              setScreen("results");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Calculate Inheritance
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-10">
      <InheritanceResults
        values={values as InheritanceValues}
        onBack={() => setScreen("review")}
        onGoHome={goHome}
      />
    </main>
  );
}

function ReviewSummary({ values }: { values: WizardValues }) {
  const estate = values.estate || { amount: 0, kanals: 0, marlas: 0 };
  let propertyText = "Nil";
  if (estate.kanals > 0 || estate.marlas > 0) {
    const parts: string[] = [];
    if (estate.kanals > 0) parts.push(`${estate.kanals} K`);
    if (estate.marlas > 0) parts.push(`${estate.marlas} M`);
    propertyText = parts.join(" ");
  }

  const rows: { label: string; val: React.ReactNode }[] = [
    { label: "Amount (PKR)", val: formatRupees(estate.amount) },
    { label: "Property", val: propertyText },
    { label: "Deceased", val: values.gender === "male" ? "Male" : "Female" },
    { label: "Father", val: values.fatherAlive === "yes" ? "Alive" : "Deceased" },
    { label: "Mother", val: values.motherAlive === "yes" ? "Alive" : "Deceased" },
    {
      label: "Living Wives",
      val:
        values.gender === "male"
          ? `${values.spouse || 0}`
          : values.spouse === "yes"
            ? "Alive"
            : "Deceased",
    },
    { label: "Living Sons", val: values.children ? values.children.sons : 0 },
    { label: "Living Daughters", val: values.children ? values.children.daughters : 0 },
  ];

  const pList = values.predeceased || [];
  rows.push({
    label: "Predeceased Children",
    val: values.predeceasedStatus === "yes" && pList.length > 0 ? `${pList.length}` : "0",
  });

  const fatherAlive = values.fatherAlive === "yes";
  const sonsCount = values.children ? parseInt(String(values.children.sons || 0), 10) : 0;
  const hasPredeceasedSonWithGrandson = pList.some(
    (c: { type: string; grandsons?: number }) =>
      c.type === "son" && parseInt(String(c.grandsons || 0), 10) > 0,
  );
  const isSiblingsBlocked = fatherAlive || sonsCount > 0 || hasPredeceasedSonWithGrandson;

  if (!isSiblingsBlocked) {
    const sibs = values.siblings || { brothers: 0, sisters: 0 };
    const bro = parseInt(String(sibs.brothers || 0), 10);
    const sis = parseInt(String(sibs.sisters || 0), 10);
    rows.push({
      label: "Living Siblings",
      val: bro > 0 || sis > 0 ? `${bro} Brothers, ${sis} Sisters` : "None",
    });
  } else {
    rows.push({ label: "Living Siblings", val: "Blocked" });
  }

  const daughtersCount = values.children ? parseInt(String(values.children.daughters || 0), 10) : 0;
  const predeceasedDaughters = pList.filter((c: { type: string; grandsons?: number; granddaughters?: number }) => {
    const gs = parseInt(String(c.grandsons || 0), 10);
    const gd = parseInt(String(c.granddaughters || 0), 10);
    return c.type === "daughter" && gs + gd > 0;
  });
  const virtualDaughtersCount = daughtersCount + predeceasedDaughters.length;
  const isNephewsBlocked =
    fatherAlive ||
    sonsCount > 0 ||
    hasPredeceasedSonWithGrandson ||
    (values.siblings && parseInt(String(values.siblings.brothers || 0), 10) > 0) ||
    (values.siblings &&
      parseInt(String(values.siblings.sisters || 0), 10) > 0 &&
      virtualDaughtersCount > 0);
  if (!isNephewsBlocked) {
    rows.push({ label: "Nephews", val: String(parseInt(String(values.nephews || 0), 10)) });
  }

  return (
    <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden text-left max-w-lg mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="p-4 flex justify-between items-center bg-white border-b border-neutral-100"
          >
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {row.label}
            </span>
            <span className="text-sm font-extrabold text-neutral-800">{row.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
