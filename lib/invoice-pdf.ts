/** Capture only the invoice, at a desktop width even on mobile, without sending data away. */
export async function downloadInvoicePdf(filename: string): Promise<void> {
  const [{ toCanvas }, { jsPDF }] = await Promise.all([
    import("html-to-image"),
    import("jspdf"),
  ]);
  const source = document.querySelector<HTMLElement>("#results-screen .print-invoice-box");
  if (!source) throw new Error("Invoice not found");
  await document.fonts.ready;

  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-10000px;top:0;width:800px;background:white;pointer-events:none;";
  const invoice = source.cloneNode(true) as HTMLElement;
  invoice.classList.add("invoice-export");
  host.appendChild(invoice);
  document.body.appendChild(host);

  try {
    const canvas = await toCanvas(invoice, { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: false });
    const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
    pdf.setProperties({ title: filename, author: "Chaudhary Law Associates" });
    const margin = 12;
    let width = pdf.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2 - 6;
    const scale = canvas.width / invoice.getBoundingClientRect().width;
    // Fit short invoices onto one sheet rather than creating a nearly empty final page.
    if (canvas.height * width / canvas.width <= pageHeight * 1.15) {
      width = Math.min(width, pageHeight * canvas.width / canvas.height);
    }
    const left = (pdf.internal.pageSize.getWidth() - width) / 2;
    const pagePixels = Math.ceil(pageHeight * canvas.width / width);
    const top = invoice.getBoundingClientRect().top;
    // Keep payment lines, table rows, and the address together at page boundaries.
    const blocks = Array.from(invoice.querySelectorAll<HTMLElement>("tr, .invoice-line, .invoice-office, .invoice-heading"))
      .map(node => { const r = node.getBoundingClientRect(); return { top: (r.top - top) * scale, bottom: (r.bottom - top) * scale }; });
    let offset = 0;
    let page = 1;
    while (offset < canvas.height) {
      let end = Math.min(offset + pagePixels, canvas.height);
      if (end < canvas.height) {
        for (const block of blocks) {
          if (block.top < end && block.bottom > end && block.top > offset + 20) end = Math.floor(block.top);
        }
      }
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = end - offset;
      const context = slice.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      context.drawImage(canvas, 0, offset, canvas.width, slice.height, 0, 0, slice.width, slice.height);
      if (page > 1) pdf.addPage();
      pdf.addImage(slice.toDataURL("image/png"), "PNG", left, margin, width, slice.height * width / canvas.width);
      pdf.setFontSize(8);
      pdf.setTextColor(120);
      pdf.text(`Chaudhary Law Associates  |  Page ${page}`, margin, 287);
      offset = end;
      page++;
    }
    pdf.save(`${filename}.pdf`);
  } finally {
    host.remove();
  }
}
