"use client";

import { useState } from "react";

export default function DownloadPdfButton({ filename }: { filename: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function download() {
    setBusy(true);
    setError(false);
    try {
      const { downloadInvoicePdf } = await import("@/lib/invoice-pdf");
      await downloadInvoicePdf(filename);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button type="button" onClick={download} disabled={busy} aria-busy={busy}
        className="btn btn-primary inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold shadow-sm disabled:cursor-wait">
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m-4-4 4 4 4-4M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
        </svg>
        {busy ? "Preparing PDF…" : "Download PDF"}
      </button>
      {error && <p role="alert" className="max-w-xs text-center text-xs text-red-600">PDF download failed. Please try again or use Print to save as PDF.</p>}
    </div>
  );
}
