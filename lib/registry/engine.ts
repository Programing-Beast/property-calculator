// Central Tax Configuration for the Registry Expenses Calculator.
// Ported 1:1 from the original site (FY 2026-2027 schedule).
export const TAX_CONFIG = {
  STAMP_DUTY_RATE: 0.01,
  BALDIA_TMA_RATE: 0.01,
  MAP_PENALTY_RATE: 0.02,
  PLRA_RATE: 0.001,
  PLRA_MINIMUM: 3600,
  REGISTRATION_BELOW_500K: 500,
  REGISTRATION_ABOVE_500K: 1000,
  MISC_CHARGES: 800,
  FBR_236K_FILER: 0.0125,
  FBR_236K_NON_FILER: 0.105,
  FBR_236C_FILER: 0.0275,
  FBR_236C_NON_FILER: 0.115,
} as const;

export function formatRupees(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "Rs. 0";
  return "Rs. " + Math.round(amount).toLocaleString("en-US");
}

export type TransactionType = "sale" | "gift" | "poa";
export type GiftType = "heir" | "non-heir" | "tamleek" | null;
export type PropertyType = "plot" | "building";
export type FilerStatus = "filer" | "non-filer";

export type RegistryInputs = {
  transactionType: TransactionType;
  giftType?: GiftType;
  propertyType?: PropertyType;
  plotValue?: number;
  poaValue?: number;
  buildingValue?: number;
  mapApproved?: boolean;
  buyerStatus?: FilerStatus;
  sellerStatus?: FilerStatus;
  tamleekConfirmations?: { relationshipConfirmed: boolean; landConfirmed: boolean };
};

export type RegistrySummary = {
  totalValue: number;
  stampDuty: number;
  registrationFee: number;
  mapPenalty: number;
  baldiaTma: number;
  plra: number;
  miscCharges: number;
  buyerTaxRate: number;
  buyerTax: number;
  sellerTaxRate: number;
  sellerTax: number;
  buyerTotal: number;
  sellerTotal: number;
  grandTotal: number;
  isGiftToHeir: boolean;
};

export type RegistryResult = {
  inputs: Required<
    Pick<
      RegistryInputs,
      | "transactionType"
      | "giftType"
      | "propertyType"
      | "plotValue"
      | "poaValue"
      | "buildingValue"
      | "mapApproved"
      | "buyerStatus"
      | "sellerStatus"
    >
  >;
  summary: RegistrySummary;
};

export function calculateRegistry(inputs: RegistryInputs): RegistryResult {
  const config = TAX_CONFIG;

  const transactionType = inputs.transactionType;
  const giftType = inputs.giftType || null;
  const isGiftToHeir = transactionType === "gift" && giftType === "heir";
  const isTamleek = transactionType === "gift" && giftType === "tamleek";
  const isPoa = transactionType === "poa";
  const isPoaHeir = isPoa && giftType === "heir";
  const isPoaNonHeir = isPoa && giftType === "non-heir";

  const propertyType = inputs.propertyType as PropertyType;
  const plotValue = Number(inputs.plotValue) || 0;
  const poaValue = Number(inputs.poaValue) || 0;
  const buildingValue = propertyType === "building" ? Number(inputs.buildingValue) || 0 : 0;
  const mapApproved = propertyType === "building" ? !!inputs.mapApproved : true;
  const buyerStatus: FilerStatus =
    isGiftToHeir || isTamleek || isPoa ? "filer" : inputs.buyerStatus || "filer";
  const sellerStatus: FilerStatus =
    isGiftToHeir || isTamleek || isPoa ? "filer" : inputs.sellerStatus || "filer";

  const totalValue = isPoaHeir ? 0 : plotValue + buildingValue;

  // Stamp Duty
  let stampDuty: number;
  if (isTamleek) {
    stampDuty = 1000;
  } else if (isPoaHeir) {
    stampDuty = 3025;
  } else if (isPoaNonHeir) {
    stampDuty = totalValue * 0.02;
  } else {
    stampDuty = totalValue * config.STAMP_DUTY_RATE;
  }

  // Registration Fee
  const registrationFee =
    isTamleek || isPoaHeir
      ? 0
      : totalValue < 500000
        ? config.REGISTRATION_BELOW_500K
        : config.REGISTRATION_ABOVE_500K;

  // Map Penalty
  const mapPenalty =
    isTamleek || isPoaHeir || propertyType !== "building" || mapApproved
      ? 0
      : plotValue * config.MAP_PENALTY_RATE;

  // Baldia / TMA
  const baldiaTma = isTamleek || isPoa ? 0 : totalValue * config.BALDIA_TMA_RATE;

  // PLRA
  const plra =
    isTamleek || isPoa ? 3600 : Math.max(config.PLRA_MINIMUM, totalValue * config.PLRA_RATE);

  // Misc Charges
  let miscCharges: number = config.MISC_CHARGES;
  if (isTamleek) miscCharges = 800;
  else if (isPoaHeir) miscCharges = 500;
  else if (isPoaNonHeir) miscCharges = 1000;

  // Buyer/Donee Tax (Section 236K)
  let buyerTaxRate = 0;
  let buyerTax = 0;
  if (!isTamleek && !isPoa) {
    if (isGiftToHeir) buyerTaxRate = 0;
    else if (buyerStatus === "filer") buyerTaxRate = config.FBR_236K_FILER;
    else buyerTaxRate = config.FBR_236K_NON_FILER;
    buyerTax = totalValue * buyerTaxRate;
  }

  // Seller/Donor Tax (Section 236C)
  let sellerTaxRate = 0;
  let sellerTax = 0;
  if (!isTamleek && !isPoa) {
    if (isGiftToHeir) sellerTaxRate = 0;
    else if (sellerStatus === "filer") sellerTaxRate = config.FBR_236C_FILER;
    else sellerTaxRate = config.FBR_236C_NON_FILER;
    sellerTax = totalValue * sellerTaxRate;
  }

  const buyerTotal = isTamleek
    ? 5400
    : isPoaHeir
      ? 3025 + 3600 + 500
      : stampDuty + registrationFee + baldiaTma + plra + miscCharges + buyerTax;

  const sellerTotal = isTamleek ? 0 : isPoaHeir ? 0 : sellerTax + mapPenalty;

  const grandTotal = buyerTotal + sellerTotal;

  return {
    inputs: {
      transactionType,
      giftType,
      propertyType,
      plotValue,
      poaValue,
      buildingValue,
      mapApproved,
      buyerStatus,
      sellerStatus,
    },
    summary: {
      totalValue,
      stampDuty,
      registrationFee,
      mapPenalty,
      baldiaTma,
      plra,
      miscCharges,
      buyerTaxRate,
      buyerTax,
      sellerTaxRate,
      sellerTax,
      buyerTotal,
      sellerTotal,
      grandTotal,
      isGiftToHeir,
    },
  };
}
