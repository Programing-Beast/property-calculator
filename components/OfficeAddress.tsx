export default function OfficeAddress() {
  return (
    <div className="invoice-office flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-left print:break-inside-avoid">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-orange">
        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      </span>
      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Visit Our Office</p>
        <address className="text-xs not-italic leading-relaxed text-neutral-600">
          <span className="font-semibold text-neutral-800">Office No. 29, Sufi Barkat Law Building</span>
          <br />
          Ground Floor, District Court, Faisalabad
        </address>
      </div>
    </div>
  );
}
