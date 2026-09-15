type PdfExportResult = {
  blob: Blob;
  filename: string;
  pageCount: number;
};

function safeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();
}

export async function createReportPdf(element: HTMLElement, reportTitle: string): Promise<PdfExportResult> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  if (document.fonts?.ready) await document.fonts.ready;

  const canvas = await html2canvas(element, {
    backgroundColor: "#f3f6fb",
    logging: false,
    scale: Math.min(1.35, Math.max(1, window.devicePixelRatio || 1)),
    useCORS: true,
    windowWidth: Math.max(element.scrollWidth, 980),
    onclone(clonedDocument) {
      clonedDocument.querySelectorAll<HTMLElement>("[data-pdf-exclude], .ambient").forEach((node) => {
        node.style.setProperty("display", "none", "important");
      });
      const clonedReport = clonedDocument.querySelector<HTMLElement>("[data-pdf-report]");
      if (clonedReport) {
        clonedReport.style.width = "980px";
        clonedReport.style.maxWidth = "980px";
        clonedReport.style.margin = "0 auto";
        clonedReport.style.padding = "32px";
      }
    },
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 8;
  const imageWidth = pageWidth - margin * 2;
  const imageHeight = pageHeight - margin * 2;
  const pixelsPerMm = canvas.width / imageWidth;
  const sliceHeight = Math.max(1, Math.floor(imageHeight * pixelsPerMm));
  const pageCount = Math.ceil(canvas.height / sliceHeight);

  for (let page = 0; page < pageCount; page += 1) {
    const sourceY = page * sliceHeight;
    const sourceHeight = Math.min(sliceHeight, canvas.height - sourceY);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sourceHeight;
    const context = pageCanvas.getContext("2d");
    if (!context) throw new Error("当前浏览器无法创建 PDF 画布");
    context.fillStyle = "#f3f6fb";
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    context.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);

    if (page > 0) pdf.addPage();
    const renderedHeight = sourceHeight / pixelsPerMm;
    pdf.addImage(pageCanvas.toDataURL("image/jpeg", 0.9), "JPEG", margin, margin, imageWidth, renderedHeight, undefined, "FAST");
    pageCanvas.width = 1;
    pageCanvas.height = 1;
  }

  const filename = safeFilename(`职业天赋报告-${reportTitle}.pdf`);
  return { blob: pdf.output("blob"), filename, pageCount };
}
