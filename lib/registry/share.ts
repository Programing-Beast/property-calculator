import { formatRupees, type RegistryResult } from "./engine";

export function buildRegistryShareText(result: RegistryResult): string {
  const { inputs, summary } = result;
  const isGift = inputs.transactionType === "gift";
  const isTamleek = isGift && inputs.giftType === "tamleek";
  const isPoa = inputs.transactionType === "poa";

  let transLabel = isGift ? "Gift" : isPoa ? "Power of Attorney" : "Sale";
  if (inputs.giftType) {
    if (inputs.giftType === "tamleek") transLabel += " (Tamleek)";
    else
      transLabel += ` (${inputs.giftType === "heir" ? (isPoa ? "Legal Heir" : "Heir") : "Non-Heir"})`;
  }

  const propLabel = inputs.propertyType === "plot" ? "Plot Only" : "Building";
  const buyerLabel = isPoa ? "Attorney Total" : isGift ? "Donee Total" : "Buyer Total";
  const sellerLabel = isPoa ? "Principal Total" : isGift ? "Donor Total" : "Seller Total";

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const notice =
    "FBR Withholding Taxes are exempt for Tamleek Transfers, provided eligibility conditions are met.";

  if (isTamleek || (isPoa && inputs.giftType === "heir")) {
    return `Chaudhary Law Associates — Registry Expenses Calculator Invoice
--------------------------------------------------------------
Transaction : ${transLabel}
--------------------------------------------------------------
Stamp Duty   : ${formatRupees(summary.stampDuty)}
${isPoa ? "PLRA (3.6K)" : "PLRA (0.1% / Min 3.6K)"}   : ${formatRupees(summary.plra)}
Miscellaneous Charges   : ${formatRupees(summary.miscCharges)}
--------------------------------------------------------------
${buyerLabel}  : ${formatRupees(summary.buyerTotal)}
${sellerLabel} : ${formatRupees(summary.sellerTotal)}
--------------------------------------------------------------
Grand Total Expenses  : ${formatRupees(summary.grandTotal)}
${isTamleek ? `--------------------------------------------------------------\nNotice: ${notice}` : ""}
--------------------------------------------------------------
Calculate yours instantly at: ${shareUrl}
`;
  }

  return `Chaudhary Law Associates — Registry Expenses Calculator Invoice
--------------------------------------------------------------
Transaction : ${transLabel}
Property Type    : ${propLabel}
Total Valuation  : ${formatRupees(summary.totalValue)}
${inputs.transactionType === "sale" ? `Miscellaneous Charges : ${formatRupees(summary.miscCharges)}\nCouncil fees : ${formatRupees(summary.councilFees)}\n` : ""}--------------------------------------------------------------
${buyerLabel}  : ${formatRupees(summary.buyerTotal)}
${sellerLabel} : ${formatRupees(summary.sellerTotal)}
--------------------------------------------------------------
Grand Total Expenses  : ${formatRupees(summary.grandTotal)}
--------------------------------------------------------------
Calculate yours instantly at: ${shareUrl}
`;
}

export async function shareText(text: string, title: string): Promise<"shared" | "copied"> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url: window.location.href });
      return "shared";
    } catch {
      // fall through to clipboard
    }
  }
  await navigator.clipboard.writeText(text);
  return "copied";
}
