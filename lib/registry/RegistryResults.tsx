"use client";

import { useState } from "react";
import DownloadPdfButton from "@/components/DownloadPdfButton";
import OfficeAddress from "@/components/OfficeAddress";
import { formatRupees, type RegistryResult } from "./engine";
import { buildRegistryShareText, shareText } from "./share";

function Row({
  label,
  value,
  sub,
  red,
  italic,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  sub?: React.ReactNode;
  red?: boolean;
  italic?: boolean;
}) {
  return (
    <div
      className={`invoice-line flex justify-between gap-4 ${red ? "text-red-600 font-medium" : ""} ${italic ? "text-neutral-500 italic" : ""}`}
    >
      <div className="flex flex-col">
        <span className={red ? "" : "text-neutral-600"}>{label}</span>
        {sub && <span className="text-[10px] text-neutral-500 font-medium">{sub}</span>}
      </div>
      <span className={red ? "" : "font-semibold text-neutral-800 self-start"}>{value}</span>
    </div>
  );
}

export default function RegistryResults({
  result,
  onGoHome,
}: {
  result: RegistryResult;
  onGoHome: () => void;
}) {
  const [toast, setToast] = useState<string | null>(null);
  const { inputs, summary } = result;

  const isGift = inputs.transactionType === "gift";
  const isPoa = inputs.transactionType === "poa";
  const isTamleek = isGift && inputs.giftType === "tamleek";
  const isGiftNonHeir = isGift && inputs.giftType === "non-heir";
  const isPoaHeir = isPoa && inputs.giftType === "heir";

  let transactionText = "Sale";
  if (isGift) {
    transactionText = isTamleek
      ? "Gift (Tamleek)"
      : inputs.giftType === "heir"
        ? "Gift (Heir)"
        : "Gift (Non-Heir)";
  } else if (isPoa) {
    transactionText = inputs.giftType === "heir" ? "Power of Attorney (Heir)" : "Power of Attorney (Non-Heir)";
  }

  const propTypeText = isPoaHeir
    ? "N/A"
    : isTamleek
      ? "Agricultural Land"
      : inputs.propertyType === "plot"
        ? "Plot Only"
        : "Building";

  const buyerPaymentsTitle = isPoa
    ? "Attorney Payments"
    : isGift
      ? "Donee Payments"
      : "Buyer Payments";
  const sellerPaymentsTitle = isPoa
    ? "Principal Payments"
    : isGift
      ? "Donor Payments"
      : "Seller Payments";
  const buyerTotalLabel = isPoa ? "Attorney Total" : isGift ? "Donee Total" : "Buyer Total";
  const sellerTotalLabel = isPoa ? "Principal Total" : isGift ? "Donor Total" : "Seller Total";

  const displayTotalVal = isPoaHeir || isTamleek ? "N/A" : formatRupees(summary.totalValue);
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const stampLabel =
    isPoa && inputs.giftType === "non-heir"
      ? "Stamp Duty (2%)"
      : isTamleek || isPoa
        ? "Stamp Duty"
        : "Stamp Duty (1%)";
  const plraLabel = isPoa ? "PLRA (3.6K)" : "PLRA (0.1% / Min 3.6K)";

  async function onShare() {
    const mode = await shareText(
      buildRegistryShareText(result),
      "Property Registry · Expense Invoice",
    );
    if (mode === "copied") {
      setToast("Calculation copied to clipboard! Paste it anywhere to share.");
      setTimeout(() => setToast(null), 3000);
    }
  }

  return (
    <div id="results-screen">
      {/* Success banner */}
      <div className="text-center mb-8 no-print">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Calculation Complete
        </h2>
        <p className="text-neutral-500 mt-1 text-sm">
          Below is the detailed registry expenses invoice.
        </p>
      </div>

      <div
        className={`invoice-document print-invoice-box bg-white border border-neutral-200 rounded-lg shadow-sm p-6 sm:p-8 mb-8 text-left ${isGiftNonHeir ? "gift-non-heir-invoice" : ""}`}
      >
        {/* Print header */}
        <div className="invoice-heading print-header mb-8 pb-6 border-b-2 border-neutral-800">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Chaudhary Law Associates
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">Property Registry · Expense Invoice</p>
            </div>
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-6 border-b border-neutral-200 text-xs sm:text-sm">
          {[
            ["Transaction", transactionText],
            ["Property Type", propTypeText],
            ["Total Valuation", displayTotalVal],
            ["Date", dateStr],
          ].map(([label, val]) => (
            <div key={label}>
              <span className="text-neutral-500 block uppercase tracking-wider font-semibold text-[10px] sm:text-xs">
                {label}
              </span>
              <span className="font-bold text-neutral-800 text-xs sm:text-sm uppercase">{val}</span>
            </div>
          ))}
        </div>

        {/* Grand total */}
        <div className="invoice-total rounded-xl p-6 mb-8 border">
          <span className="text-neutral-500 uppercase tracking-widest text-xs font-semibold block mb-1">
            Grand Total Expenses
          </span>
          <span className="text-3xl sm:text-4xl font-black text-brand-orange block tracking-tight">
            {formatRupees(summary.grandTotal)}
          </span>
        </div>

        {/* Gift-to-heir exemption notice */}
        {isGift && inputs.giftType === "heir" && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md text-left mb-8 text-xs sm:text-sm text-blue-700 font-medium">
            FBR Withholding Taxes are exempt for Legal Heir Transfers.
          </div>
        )}

        {/* Breakdown */}
        {isGift || isPoa ? (
          <div className="border border-neutral-200 rounded-lg p-5 sm:p-6 bg-white flex flex-col justify-between max-w-2xl mx-auto w-full">
            <div>
              <div className="border-b border-neutral-100 pb-3 mb-4">
                <h3 className="font-bold text-neutral-800 text-lg uppercase tracking-tight">
                  {isPoa ? "Power of Attorney Expenses" : "Gift/Hiba Expenses"}
                </h3>
              </div>
              <div className="space-y-3 text-xs sm:text-sm mb-6">
                <Row label={stampLabel} value={formatRupees(summary.stampDuty)} />
                {summary.registrationFee !== 0 && (
                  <Row label="Registration Fee" value={formatRupees(summary.registrationFee)} />
                )}
                {summary.baldiaTma !== 0 && (
                  <Row label="Baldia / TMA (1%)" value={formatRupees(summary.baldiaTma)} />
                )}
                <Row label={plraLabel} value={formatRupees(summary.plra)} />
                {summary.mapPenalty > 0 && (
                  <Row label="Map Penalty (2% of Plot)" value={formatRupees(summary.mapPenalty)} red />
                )}
                <Row label="Miscellaneous Charges" value={formatRupees(summary.miscCharges)} />
                {summary.buyerTax > 0 && (
                  <div className="border-t border-neutral-100 pt-3">
                    <Row
                      label="FBR Withholding Tax (236K) - Paid by Donee"
                      sub={inputs.buyerStatus === "filer" ? "Filer: 1.25%" : "Non-Filer: 10.5%"}
                      value={formatRupees(summary.buyerTax)}
                    />
                  </div>
                )}
                {summary.sellerTax > 0 && (
                  <div className="border-t border-neutral-100 pt-3">
                    <Row
                      label="FBR Withholding Tax (236C) - Paid by Donor"
                      sub={inputs.sellerStatus === "filer" ? "Filer: 2.75%" : "Non-Filer: 11.5%"}
                      value={formatRupees(summary.sellerTax)}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-neutral-200 pt-4 mt-auto flex justify-between items-center bg-neutral-50 -mx-5 -mb-5 p-5 rounded-b-lg">
              <span className="font-bold text-neutral-700 text-sm uppercase">
                {isGift ? "Total Expenses" : "Total Registry Expenses"}
              </span>
              <span className="font-black text-neutral-900 text-lg sm:text-xl">
                {formatRupees(summary.grandTotal)}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid-print-cols grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buyer card */}
            <div className="border border-neutral-200 rounded-lg p-5 sm:p-6 bg-white flex flex-col justify-between">
              <div>
                <div className="border-b border-neutral-100 pb-3 mb-4">
                  <h3 className="font-bold text-neutral-800 text-lg uppercase tracking-tight">
                    {buyerPaymentsTitle}
                  </h3>
                </div>
                <div className="space-y-3 text-xs sm:text-sm mb-6">
                  <Row label="Stamp Duty (1%)" value={formatRupees(summary.stampDuty)} />
                  <Row label="Registration Fee" value={formatRupees(summary.registrationFee)} />
                  <Row label="Baldia / TMA (1%)" value={formatRupees(summary.baldiaTma)} />
                  <Row label="PLRA (0.1% / Min 3.6K)" value={formatRupees(summary.plra)} />
                  <Row label="Miscellaneous Charges" value={formatRupees(summary.miscCharges)} />
                  {summary.buyerTax > 0 ? (
                    <div className="border-t border-neutral-100 pt-3">
                      <Row
                        label="FBR Withholding Tax (236K)"
                        sub={inputs.buyerStatus === "filer" ? "Filer: 1.25%" : "Non-Filer: 10.5%"}
                        value={formatRupees(summary.buyerTax)}
                      />
                    </div>
                  ) : (
                    <div className="border-t border-neutral-100 pt-3">
                      <Row label="FBR Withholding Tax (236K)" value="Exempt" italic />
                    </div>
                  )}
                  <Row label="Council fees" value={formatRupees(summary.councilFees)} />
                </div>
              </div>
              <div className="border-t border-neutral-200 pt-4 mt-auto flex justify-between items-center bg-neutral-50 -mx-5 -mb-5 p-5 rounded-b-lg">
                <span className="font-bold text-neutral-700 text-sm uppercase">{buyerTotalLabel}</span>
                <span className="font-black text-neutral-900 text-lg sm:text-xl">
                  {formatRupees(summary.buyerTotal)}
                </span>
              </div>
            </div>

            {/* Seller card */}
            <div className="border border-neutral-200 rounded-lg p-5 sm:p-6 bg-white flex flex-col justify-between">
              <div>
                <div className="border-b border-neutral-100 pb-3 mb-4">
                  <h3 className="font-bold text-neutral-800 text-lg uppercase tracking-tight">
                    {sellerPaymentsTitle}
                  </h3>
                </div>
                <div className="space-y-3 text-xs sm:text-sm mb-6">
                  {summary.sellerTax > 0 ? (
                    <Row
                      label="FBR Withholding Tax (236C)"
                      sub={inputs.sellerStatus === "filer" ? "Filer: 2.75%" : "Non-Filer: 11.5%"}
                      value={formatRupees(summary.sellerTax)}
                    />
                  ) : (
                    <Row label="FBR Withholding Tax (236C)" value="Exempt" italic />
                  )}
                  {summary.mapPenalty > 0 && (
                    <Row label="Map Penalty (2% of Plot)" value={formatRupees(summary.mapPenalty)} red />
                  )}
                </div>
              </div>
              <div className="border-t border-neutral-200 pt-4 mt-auto flex justify-between items-center bg-neutral-50 -mx-5 -mb-5 p-5 rounded-b-lg">
                <span className="font-bold text-neutral-700 text-sm uppercase">{sellerTotalLabel}</span>
                <span className="font-black text-neutral-900 text-lg sm:text-xl">
                  {formatRupees(summary.sellerTotal)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tamleek notice */}
        {isTamleek && (
          <div className="mt-8 bg-amber-50 border-l-4 border-brand-orange p-4 rounded text-left text-xs sm:text-sm text-amber-800 font-medium leading-relaxed">
            <strong className="font-bold text-brand-orange">Notice:</strong> This Tamleek transfer
            qualifies for exemption from Registration Fee, Baldia/TMA charges, and Federal
            Withholding Taxes (Sections 236K and 236C), provided the transfer is between eligible
            immediate family members and relates to qualifying agricultural/rural land.
          </div>
        )}

        <div className="mt-8">
          <OfficeAddress />
        </div>

        {/* FY disclaimer */}
        <div className="mt-5 pt-5 border-t border-neutral-200 text-center text-xs text-neutral-400 leading-relaxed max-w-xl mx-auto italic">
          Disclaimer: This calculation is for informational purposes only for the Financial Year 2026
          - 2027. Chaudhary Law Associates assumes no responsibility for any discrepancies or changes
          in government tax rates.
        </div>
      </div>

      {/* Action buttons */}
      <div className="controls-wrapper flex flex-wrap flex-col sm:flex-row gap-4 justify-center items-center mt-8 no-print">
        <DownloadPdfButton filename="chaudhary-law-associates-registry-invoice" />
        <button
          className="btn btn-secondary px-6 py-3.5 rounded-lg font-semibold text-sm cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2"
          onClick={onGoHome}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Go to Home
        </button>
        <button
          className="btn btn-secondary px-6 py-3.5 rounded-lg font-semibold text-sm cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2"
          onClick={() => window.print()}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print Invoice
        </button>
        <button
          className="btn btn-primary px-8 py-3.5 rounded-lg font-semibold text-sm cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2"
          onClick={onShare}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 10.742l4.028-2.014m0 0a3 3 0 10-2.243-4.077L7.3 6.16m11.66 1.84m-9.66 2.742l4.028 2.014m0 0a3 3 0 102.243-4.077L14.7 13.84M18 19a3 3 0 100-6 3 3 0 000 6z"
            />
          </svg>
          Share Calculation
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
