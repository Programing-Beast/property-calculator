import type { WizardStep } from "@/components/wizard/types";
import {
  SelectList,
  SelectGrid,
  CurrencyInput,
  ExternalLink,
} from "@/components/wizard/fields";

const DC_RATE_URL =
  "https://es.punjab-zameen.gov.pk/eStampCitizenPortal/ChallanFormView/RateOfChallanView?name=PropertyDCValuation&vCount=286459";
const FILER_URL = "https://iris.fbr.gov.pk/login";

export const registrySteps: WizardStep[] = [
  {
    id: "transactionType",
    field: "transactionType",
    question: "Select Transaction Type",
    autoSubmit: true,
    validate: (val) => ["sale", "gift", "poa"].includes(val),
    render: ({ value, setValue }) => (
      <SelectList
        value={value}
        onSelect={(v) => setValue("transactionType", v)}
        options={[
          {
            value: "sale",
            label: "Sale",
            desc: "Standard sale transaction between buyer and seller.",
          },
          {
            value: "gift",
            label: "Gift",
            desc: "Property transfer as a gift to legal heirs or non-heirs.",
          },
          {
            value: "poa",
            label: "Power of Attorney",
            desc: "Legal authorization to represent or act on another person's behalf in property matters.",
          },
        ]}
      />
    ),
  },
  {
    id: "giftType",
    field: "giftType",
    question: (values) =>
      values.transactionType === "poa" ? "Select Power of Attorney Type" : "Select Gift Type",
    autoSubmit: true,
    shouldSkip: (values) => values.transactionType !== "gift" && values.transactionType !== "poa",
    validate: (val, values) => {
      if (values.transactionType !== "gift" && values.transactionType !== "poa") return true;
      if (values.transactionType === "poa") return ["heir", "non-heir"].includes(val);
      return ["heir", "non-heir", "tamleek"].includes(val);
    },
    render: ({ value, values, setValue, patch }) => {
      const isPoa = values.transactionType === "poa";
      const options = isPoa
        ? [
            {
              value: "heir",
              label: "Legal Heir",
              desc: "Power of Attorney granted to immediate legal heirs.",
            },
            {
              value: "non-heir",
              label: "Non-Heir",
              desc: "Power of Attorney granted to other relatives or individuals.",
            },
          ]
        : [
            {
              value: "heir",
              label: "Heir",
              desc: "Property transfer to immediate legal heirs (exempt from withholding taxes).",
            },
            {
              value: "non-heir",
              label: "Non-Heir",
              desc: "Property transfer as gift to other relatives or individuals.",
            },
            {
              value: "tamleek",
              label: (
                <>
                  Tamleek{" "}
                  <span className="text-xs sm:text-sm font-normal text-neutral-500">
                    (Family Agricultural Land Transfer)
                  </span>
                </>
              ),
              desc: "Property transfer between immediate family members for agricultural/rural land (exempt from Registration Fee, Baldia/TMA, and FBR taxes).",
            },
          ];
      return (
        <SelectList
          value={value}
          onSelect={(v) => {
            if (v === "tamleek") {
              patch("propertyType", "plot");
              patch("tamleekConfirmations", {
                relationshipConfirmed: false,
                landConfirmed: false,
              });
            } else if (v === "non-heir" && values.transactionType === "poa") {
              patch("poaValue", 0);
            }
            setValue("giftType", v);
          }}
          options={options}
        />
      );
    },
  },
  {
    id: "tamleekConfirmations",
    field: "tamleekConfirmations",
    question: "Confirm Tamleek Eligibility Requirements",
    shouldSkip: (values) =>
      values.transactionType !== "gift" || values.giftType !== "tamleek",
    validate: (val) => !!val && val.relationshipConfirmed === true && val.landConfirmed === true,
    render: ({ value, patch }) => {
      const rel = !!value?.relationshipConfirmed;
      const land = !!value?.landConfirmed;
      const set = (key: "relationshipConfirmed" | "landConfirmed", checked: boolean) => {
        patch("tamleekConfirmations", {
          relationshipConfirmed: rel,
          landConfirmed: land,
          [key]: checked,
        });
      };
      return (
        <div className="grid grid-cols-1 gap-4 text-left">
          <label
            className={`card-option p-5 rounded-lg cursor-pointer flex items-start gap-4 select-none ${rel ? "selected" : ""}`}
          >
            <input
              type="checkbox"
              className="w-5 h-5 mt-0.5 accent-brand-orange rounded border-neutral-300 cursor-pointer"
              checked={rel}
              onChange={(e) => set("relationshipConfirmed", e.target.checked)}
            />
            <div className="flex flex-col">
              <span className="font-bold text-neutral-800 text-sm sm:text-base">
                Relationship Confirmation
              </span>
              <span className="text-xs sm:text-sm text-neutral-600 mt-1">
                I confirm this transfer is between immediate family members (parents, children, or
                spouses).
              </span>
            </div>
          </label>
          <label
            className={`card-option p-5 rounded-lg cursor-pointer flex items-start gap-4 select-none ${land ? "selected" : ""}`}
          >
            <input
              type="checkbox"
              className="w-5 h-5 mt-0.5 accent-brand-orange rounded border-neutral-300 cursor-pointer"
              checked={land}
              onChange={(e) => set("landConfirmed", e.target.checked)}
            />
            <div className="flex flex-col">
              <span className="font-bold text-neutral-800 text-sm sm:text-base">
                Agricultural/Rural Land Confirmation
              </span>
              <span className="text-xs sm:text-sm text-neutral-600 mt-1">
                I confirm this property is agricultural/rural land eligible for Tamleek transfer.
              </span>
            </div>
          </label>
        </div>
      );
    },
  },
  {
    id: "propertyType",
    field: "propertyType",
    question: "Select Property Type",
    autoSubmit: true,
    shouldSkip: (values) =>
      values.giftType === "tamleek" ||
      (values.transactionType === "poa" && values.giftType === "heir"),
    validate: (val) => ["plot", "building"].includes(val),
    render: ({ value, setValue }) => (
      <SelectGrid
        value={value}
        onSelect={(v) => setValue("propertyType", v)}
        options={[
          { value: "plot", label: "Plot Only", desc: "Vacant land or open plot." },
          {
            value: "building",
            label: "Building",
            desc: "Constructed property (house, plaza, apartment, etc.).",
          },
        ]}
      />
    ),
  },
  {
    id: "plotValue",
    field: "plotValue",
    question: "What is the Plot Value?",
    shouldSkip: (values) =>
      values.giftType === "tamleek" ||
      (values.transactionType === "poa" && values.giftType === "heir"),
    validate: (val, values) => {
      if (values.giftType === "tamleek" || (values.transactionType === "poa" && values.giftType === "heir"))
        return true;
      return val !== undefined && val !== null && val > 0 && !isNaN(val);
    },
    render: ({ value, patch }) => (
      <>
        <CurrencyInput value={value} onChange={(n) => patch("plotValue", n)} />
        <p className="mt-2 text-xs text-neutral-500 text-left">
          Please enter the land evaluation value in Pakistani Rupees (PKR) without decimals.
        </p>
        <div className="mt-4 text-left">
          <ExternalLink href={DC_RATE_URL}>Check DC rate of your plot and building</ExternalLink>
        </div>
      </>
    ),
  },
  {
    id: "buildingValue",
    field: "buildingValue",
    question: "What is the Building/material Value?",
    shouldSkip: (values) =>
      values.propertyType === "plot" ||
      (values.transactionType === "poa" && values.giftType === "heir"),
    validate: (val, values) => {
      if (values.propertyType === "plot" || (values.transactionType === "poa" && values.giftType === "heir"))
        return true;
      return val !== undefined && val !== null && val > 0 && !isNaN(val);
    },
    render: ({ value, patch }) => (
      <>
        <CurrencyInput value={value} onChange={(n) => patch("buildingValue", n)} />
        <p className="mt-2 text-xs text-neutral-500 text-left">
          Please enter the building construction value in Pakistani Rupees (PKR).
        </p>
        <div className="mt-4 text-left">
          <ExternalLink href={DC_RATE_URL}>Check DC rate of your plot and building</ExternalLink>
        </div>
      </>
    ),
  },
  {
    id: "mapApproved",
    field: "mapApproved",
    question: "Is the Building Map Approved?",
    autoSubmit: true,
    shouldSkip: (values) =>
      values.propertyType === "plot" ||
      (values.transactionType === "poa" && values.giftType === "heir"),
    validate: (val, values) => {
      if (values.propertyType === "plot" || (values.transactionType === "poa" && values.giftType === "heir"))
        return true;
      return val !== undefined && val !== null;
    },
    render: ({ value, setValue }) => (
      <SelectGrid
        value={value}
        onSelect={(v) => setValue("mapApproved", v)}
        options={[
          {
            value: true,
            label: "Yes",
            desc: "Approved map is registered with Baldia/TMA.",
          },
          {
            value: false,
            label: "No",
            desc: "Map is not approved (2% map penalty applies on Plot Value).",
          },
        ]}
      />
    ),
  },
  {
    id: "buyerStatus",
    field: "buyerStatus",
    question: (values) =>
      values.transactionType === "gift" ? "Select Donee FBR Status" : "Select Buyer FBR Status",
    autoSubmit: true,
    shouldSkip: (values) =>
      (values.transactionType === "gift" &&
        (values.giftType === "heir" || values.giftType === "tamleek")) ||
      values.transactionType === "poa",
    validate: (val, values) => {
      if (
        (values.transactionType === "gift" &&
          (values.giftType === "heir" || values.giftType === "tamleek")) ||
        values.transactionType === "poa"
      )
        return true;
      return ["filer", "non-filer"].includes(val);
    },
    render: ({ value, values, setValue }) => {
      const isGift = values.transactionType === "gift";
      const who = isGift ? "Donee" : "Buyer";
      return (
        <>
          <SelectGrid
            value={value}
            onSelect={(v) => setValue("buyerStatus", v)}
            options={[
              {
                value: "filer",
                label: "Active Tax Filer",
                desc: `${who} FBR Section 236K tax rate is 1.25%.`,
              },
              {
                value: "non-filer",
                label: "Non-Filer",
                desc: `${who} FBR Section 236K tax rate is 10.5%.`,
              },
            ]}
          />
          <div className="mt-6 text-left">
            <ExternalLink href={FILER_URL}>Check your filer status</ExternalLink>
          </div>
        </>
      );
    },
  },
  {
    id: "sellerStatus",
    field: "sellerStatus",
    question: (values) =>
      values.transactionType === "gift" ? "Select Donor FBR Status" : "Select Seller FBR Status",
    autoSubmit: true,
    shouldSkip: (values) =>
      (values.transactionType === "gift" &&
        (values.giftType === "heir" || values.giftType === "tamleek")) ||
      values.transactionType === "poa",
    validate: (val, values) => {
      if (
        (values.transactionType === "gift" &&
          (values.giftType === "heir" || values.giftType === "tamleek")) ||
        values.transactionType === "poa"
      )
        return true;
      return ["filer", "non-filer"].includes(val);
    },
    render: ({ value, values, setValue }) => {
      const isGift = values.transactionType === "gift";
      const who = isGift ? "Donor" : "Seller";
      return (
        <>
          <SelectGrid
            value={value}
            onSelect={(v) => setValue("sellerStatus", v)}
            options={[
              {
                value: "filer",
                label: "Active Tax Filer",
                desc: `${who} FBR Section 236C tax rate is 2.75%.`,
              },
              {
                value: "non-filer",
                label: "Non-Filer",
                desc: `${who} FBR Section 236C tax rate is 11.5%.`,
              },
            ]}
          />
          <div className="mt-6 text-left">
            <ExternalLink href={FILER_URL}>Check your filer status</ExternalLink>
          </div>
        </>
      );
    },
  },
];
