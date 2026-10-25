# Chaudhary Law Associates — Next.js

A faithful Next.js (App Router + TypeScript + Tailwind v4) rebuild of
[hafeezproperty.com](https://hafeezproperty.com/): two client-side property
calculators for Pakistan, with the same design and functionality.

## Features

- **Landing page** — two calculator cards.
- **Registry Expenses Calculator** — dynamic guided wizard (Sale / Gift / Power of
  Attorney; Plot / Building; Tamleek; Heir / Non-Heir), FBR 236K/236C filer &
  non-filer rates, stamp duty, Baldia/TMA, PLRA, map penalty, and a detailed
  buyer/seller invoice. Direct PDF download + Print + Share.
- **Inheritance Calculator** — exact-fraction Fiqh Hanafi + MFLO 1961 Section 4
  engine (Sharers, Asabah, Aul, Radd, Umariyyatayn, predeceased-child branches),
  amount + Kanal/Marla property allocation. Direct PDF download + Print + Share.
- 100% client-side — no data leaves the browser.

Scope note: English-only (the original's Urdu/RTL toggle was intentionally out of
scope for this build).

## Verified parity with the original

- Registry — Sale / Plot / Rs. 10,000,000 / Filer / Filer → **Grand Total Rs. 631,000**
  (Buyer 356,000, Seller 275,000), including fixed Rs. 5,000 miscellaneous charges and Rs. 15,000 Council fees, all line items matching.
- Inheritance — 10,000,000 / Male / Father+Mother alive / 1 wife / 1 son / 1 daughter →
  Wife 1/8, Mother 1/6, Father 1/6, Son 13/36, Daughter 13/72 (identical amounts).

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Structure

```
app/
  page.tsx                                   # landing
  tools/calculators/property-registry-expenses/page.tsx
  tools/calculators/islamic-inheritance/page.tsx
components/
  Header.tsx  Footer.tsx
  wizard/     Wizard.tsx  fields.tsx  types.ts   # generic step wizard + inputs
  registry/   RegistryCalculator.tsx
  inheritance/ InheritanceCalculator.tsx
lib/
  registry/   engine.ts  steps.tsx  RegistryResults.tsx  share.ts
  inheritance/ fraction.ts  engine.ts  steps.tsx  present.ts  InheritanceResults.tsx
```

The calculation engines in `lib/*/engine.ts` are pure, framework-free ports of the
original site's logic and can be unit-tested in isolation.
