"use client";

import { useState } from "react";
import Wizard from "@/components/wizard/Wizard";
import type { WizardValues } from "@/components/wizard/types";
import { registrySteps } from "@/lib/registry/steps";
import {
  calculateRegistry,
  formatRupees,
  type RegistryInputs,
  type RegistryResult,
} from "@/lib/registry/engine";
import RegistryResults from "@/lib/registry/RegistryResults";

type Screen = "landing" | "wizard" | "review" | "results";

export default function RegistryCalculator() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [values, setValues] = useState<WizardValues>({});
  const [result, setResult] = useState<RegistryResult | null>(null);

  function goHome() {
    setScreen("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onComplete(v: WizardValues) {
    setValues(v);
    setScreen("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onCalculate() {
    setResult(calculateRegistry(values as RegistryInputs));
    setScreen("results");
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
            Property Registry
            <br className="hidden sm:inline" /> Expenses Calculator
          </h1>
          <p className="text-neutral-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-10">
            Calculate buyer and seller property registration expenses through a simple, secure, and
            guided onboarding process.
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
          steps={registrySteps}
          initialValues={values}
          onComplete={onComplete}
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
          Please review your input selections before generating the final invoice.
        </p>

        <ReviewSummary values={values} />

        <div className="flex justify-between items-center mt-8">
          <button
            className="btn btn-secondary px-6 py-3.5 rounded-lg font-semibold text-sm cursor-pointer"
            onClick={() => setScreen("wizard")}
          >
            Back &amp; Edit
          </button>
          <button
            className="btn btn-primary px-6 py-3.5 rounded-lg font-semibold text-sm cursor-pointer"
            onClick={onCalculate}
          >
            Calculate Expenses
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-10">
      {result && <RegistryResults result={result} onGoHome={goHome} />}
    </main>
  );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center p-4 sm:p-5">
      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-left">
        {label}
      </span>
      <span className="font-bold text-neutral-800 text-sm sm:text-base text-right">{value}</span>
    </div>
  );
}

const GreenCheck = () => (
  <span className="font-bold text-green-600 text-sm sm:text-base flex items-center gap-1">
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
    <span>Confirmed</span>
  </span>
);

function ReviewSummary({ values }: { values: WizardValues }) {
  const isGift = values.transactionType === "gift";
  const isPoa = values.transactionType === "poa";

  const transLabel = isPoa ? "Power of Attorney" : isGift ? "Gift" : "Sale";

  const giftTypeLabel =
    values.giftType === "tamleek" ? (
      <>
        Tamleek{" "}
        <span className="text-xs font-normal text-neutral-500">
          (Family Agricultural Land Transfer)
        </span>
      </>
    ) : values.giftType === "heir" ? (
      isPoa ? "Legal Heir" : "Heir"
    ) : (
      "Non-Heir"
    );

  const propLabel =
    values.giftType === "tamleek"
      ? "Land"
      : values.propertyType === "plot"
        ? "Plot Only"
        : "Building";

  const rows: React.ReactNode[] = [];
  rows.push(<ReviewRow key="tx" label="Transaction Type" value={transLabel} />);

  if (isGift || isPoa) {
    rows.push(
      <ReviewRow key="gt" label={isPoa ? "Relationship Type" : "Gift Type"} value={giftTypeLabel} />,
    );
  }

  if (!isPoa || values.giftType === "non-heir") {
    rows.push(<ReviewRow key="pt" label="Property Type" value={propLabel} />);
  }

  if ((!isPoa || values.giftType === "non-heir") && values.giftType !== "tamleek") {
    rows.push(
      <ReviewRow key="pv" label="Plot Value" value={formatRupees(values.plotValue)} />,
    );
  }

  if (values.giftType === "tamleek") {
    rows.push(<ReviewRow key="rc" label="Relationship Confirmation" value={<GreenCheck />} />);
    rows.push(<ReviewRow key="lc" label="Agricultural/Rural Land Confirmation" value={<GreenCheck />} />);
  }

  if (values.propertyType === "building" && (!isPoa || values.giftType === "non-heir")) {
    rows.push(
      <ReviewRow key="bv" label="Building Value" value={formatRupees(values.buildingValue)} />,
    );
    rows.push(
      <ReviewRow
        key="ma"
        label="Building Map Status"
        value={values.mapApproved ? "Approved" : "Not Approved"}
      />,
    );
  }

  const skipFbr =
    (isGift && (values.giftType === "heir" || values.giftType === "tamleek")) || isPoa;
  if (!skipFbr) {
    rows.push(
      <ReviewRow
        key="bs"
        label={isGift ? "Donee FBR Status" : "Buyer FBR Status"}
        value={values.buyerStatus === "filer" ? "Filer" : "Non-Filer"}
      />,
    );
    rows.push(
      <ReviewRow
        key="ss"
        label={isGift ? "Donor FBR Status" : "Seller FBR Status"}
        value={values.sellerStatus === "filer" ? "Filer" : "Non-Filer"}
      />,
    );
  }

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden divide-y divide-neutral-200 bg-white max-w-lg mx-auto">
      {rows}
    </div>
  );
}
