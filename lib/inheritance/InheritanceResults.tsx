"use client";

import { Fragment, useMemo, useState } from "react";
import { Fraction } from "./fraction";
import {
  calculateInheritance,
  formatRupees,
  formatProperty,
  type InheritanceValues,
} from "./engine";
import {
  buildInheritanceShareText,
  buildLivingHeirs,
  groupHeirsList,
  sortHeirs,
} from "./present";
import { shareText } from "@/lib/registry/share";

export default function InheritanceResults({
  values,
  onBack,
  onGoHome,
}: {
  values: InheritanceValues;
  onBack: () => void;
  onGoHome: () => void;
}) {
  const [toast, setToast] = useState<string | null>(null);

  const distribution = useMemo(() => calculateInheritance(values), [values]);

  const estate = values.estate || { amount: 0, kanals: 0, marlas: 0 };
  const totalMarlas =
    parseInt(String(estate.kanals || 0), 10) * 20 + parseInt(String(estate.marlas || 0), 10);
  const hasAmount = estate.amount > 0;
  const hasProperty = totalMarlas > 0;

  const grouped = useMemo(() => sortHeirs(groupHeirsList(distribution)), [distribution]);
  const livingHeirs = useMemo(() => buildLivingHeirs(distribution, values), [distribution, values]);

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const propertyTotal = formatProperty(new Fraction(1, 1), totalMarlas);

  const colCount = 3 + (hasAmount ? 1 : 0) + (hasProperty ? 1 : 0);

  async function onShare() {
    const mode = await shareText(
      buildInheritanceShareText(distribution, values),
      "Inheritance Distribution Report",
    );
    if (mode === "copied") {
      setToast("Distribution report copied to clipboard! Paste it anywhere to share.");
      setTimeout(() => setToast(null), 3000);
    }
  }

  return (
    <div id="results-screen">
      <div className="print-invoice-box bg-white border border-neutral-200 rounded-3xl shadow-sm p-6 sm:p-10 text-left flex flex-col min-h-[500px] md:min-h-[600px]">
        {/* Report header */}
        <div className="print-header flex flex-row justify-between items-center border-b-2 border-neutral-200 pb-6 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-none">
                CHAUDARY PROPERTY ADVISOR
              </h1>
              <p className="text-xs text-neutral-500 mt-1 uppercase font-bold tracking-wider">
                Inheritance Calculator (Fiqh Hanafi &amp; MFLO 1961)
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Generated On
            </span>
            <span className="text-sm font-extrabold text-neutral-800">{dateStr}</span>
          </div>
        </div>

        {/* Metadata */}
        {(hasAmount || hasProperty) && (
          <div
            className={`bg-neutral-50 rounded-xl p-4 sm:p-6 mb-8 border border-neutral-100 grid gap-4 ${hasAmount && hasProperty ? "grid-cols-2" : "grid-cols-1"}`}
          >
            {hasAmount && (
              <div>
                <span className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Amount
                </span>
                <span className="text-lg font-black text-neutral-800">
                  {formatRupees(estate.amount)}
                </span>
              </div>
            )}
            {hasProperty && (
              <div>
                <span className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Property
                </span>
                <span className="text-lg font-black text-neutral-800">{propertyTotal}</span>
              </div>
            )}
          </div>
        )}

        {/* Living heirs */}
        <div className="border border-neutral-200 rounded-2xl p-4 sm:p-5 mb-8 bg-white/50 text-xs">
          <h3 className="font-extrabold text-neutral-700 uppercase tracking-wider mb-3 border-b border-neutral-100 pb-2 text-left">
            Living Heirs
          </h3>
          <div className="flex flex-wrap gap-2 justify-start">
            {livingHeirs.map((h, i) => (
              <span
                key={`${h}-${i}`}
                className="bg-neutral-100 text-neutral-800 px-3 py-1.5 rounded-lg font-bold text-xs"
              >
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* Distribution table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200 mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <th className="px-4 py-3 sm:px-6 text-left">Relationship</th>
                <th className="px-4 py-3 text-center">Fraction Share</th>
                <th className="px-4 py-3 text-center">Percentage</th>
                {hasAmount && <th className="px-4 py-3 text-right">Amount Allocation</th>}
                {hasProperty && <th className="px-4 py-3 sm:px-6 text-right">Property Allocation</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {grouped.map((heir) => {
                const fractionStr = heir.share.toString();
                const pctStr = (heir.share.toFloat() * 100).toFixed(2) + "%";
                const amountStr = formatRupees(heir.share.toFloat() * estate.amount);
                const propertyStr = formatProperty(heir.share, totalMarlas, hasAmount);
                return (
                  <Fragment key={heir.id}>
                    <tr
                      className="border-b border-neutral-200 hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="px-4 py-4 sm:px-6 text-sm font-bold text-neutral-800 text-left">
                        {heir.name}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-neutral-600 text-center font-mono">
                        {fractionStr}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-neutral-600 text-center font-mono">
                        {pctStr}
                      </td>
                      {hasAmount && (
                        <td className="px-4 py-4 text-sm font-bold text-neutral-800 text-right font-mono">
                          {amountStr}
                        </td>
                      )}
                      {hasProperty && (
                        <td className="px-4 py-4 sm:px-6 text-sm font-bold text-neutral-800 text-right font-mono">
                          {propertyStr}
                        </td>
                      )}
                    </tr>
                    <tr className="bg-neutral-50/20 border-b border-neutral-200">
                      <td
                        colSpan={colCount}
                        className="px-4 py-2 sm:px-6 text-xs text-neutral-500 text-left italic leading-relaxed"
                      >
                        {heir.expl}
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Disclaimer */}
        <div className="w-full mt-auto pt-6 border-t border-neutral-200">
          <p className="text-[10px] text-neutral-400 w-full leading-normal text-left">
            Disclaimer: This calculation is performed in accordance with Fiqh Hanafi (Ahl-e-Sunnat)
            and Muslim Family Laws Ordinance (MFLO) 1961. This information is for educational purposes
            only and cannot be used in a court of law.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="no-print flex flex-wrap justify-center items-center gap-4 mt-10">
        <button
          className="btn btn-secondary px-6 py-3 rounded-lg font-bold text-sm cursor-pointer shadow-sm"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="btn btn-primary px-6 py-3 rounded-lg font-bold text-sm cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          onClick={() => window.print()}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          <span>Print / Save PDF</span>
        </button>
        <button
          className="btn btn-secondary px-6 py-3 rounded-lg font-bold text-sm cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          onClick={onShare}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 10.742l4.636-2.318a3 3 0 11.83 1.667L9.513 12.4a3.376 3.376 0 010 1.2l4.636 2.318a3 3 0 11-.83 1.667L8.684 13.258a3 3 0 110-2.516z"
            />
          </svg>
          <span>Share Report</span>
        </button>
        <button
          className="btn btn-secondary px-6 py-3 rounded-lg font-bold text-sm cursor-pointer shadow-sm"
          onClick={onGoHome}
        >
          Go to Home
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-4 py-3 rounded-lg text-xs font-semibold shadow-md z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
