import { formatBatchStamp, type BatchExportItem } from "./exportBatchZip";
import {
  PDF_PER_PAGE,
  fitTextLines,
  layoutBatchCell,
  lineHeightMm,
  type BatchCellLayout,
} from "./layoutBatchPage";

export { PDF_COLUMNS, PDF_PER_PAGE, PDF_ROWS } from "./layoutBatchPage";

/**
 * Bỏ dấu để jsPDF (font mặc định, không có glyph tiếng Việt) in được.
 * Dùng cho mọi chữ trong PDF; QR vẫn giữ nguyên dữ liệu gốc.
 */
export function foldForPdf(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export interface BatchCaption {
  accountName: string;
  bankCode: string;
  accountNumber: string;
  amount: number | null;
  content: string;
}

export interface CaptionBlock {
  text: string;
  bold: boolean;
  size: number;
  /** Số dòng tối đa; dư thì rút gọn bằng "...". */
  maxLines: number;
}

/** Các khối chữ dưới mỗi QR trong PDF, theo thứ tự từ trên xuống. */
export function buildCaptionBlocks(caption: BatchCaption): CaptionBlock[] {
  const amountText =
    caption.amount === null
      ? "So tien: tu nhap"
      : `So tien: ${caption.amount.toLocaleString("vi-VN")} VND`;
  return [
    {
      text: foldForPdf(caption.accountName),
      bold: true,
      size: 9,
      maxLines: 2,
    },
    {
      text: foldForPdf(`${caption.bankCode} - ${caption.accountNumber}`),
      bold: false,
      size: 8,
      maxLines: 1,
    },
    { text: amountText, bold: true, size: 8, maxLines: 1 },
    {
      text: foldForPdf(`Noi dung: ${caption.content || "(trong)"}`),
      bold: false,
      size: 8,
      maxLines: 2,
    },
  ];
}

/** Số trang PDF cần để xếp hết n mã QR (6 mã mỗi trang). */
export function pageCountFor(itemCount: number): number {
  return Math.max(1, Math.ceil(itemCount / PDF_PER_PAGE));
}

type PdfDoc = {
  addImage: (
    data: string,
    format: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ) => void;
  rect: (x: number, y: number, w: number, h: number) => void;
  text: (
    text: string,
    x: number,
    y: number,
    options?: { align?: "center" | "left" | "right" },
  ) => void;
  setFont: (family: string, style: string) => void;
  setFontSize: (size: number) => void;
  setDrawColor: (r: number, g?: number, b?: number) => void;
  setTextColor: (r: number, g?: number, b?: number) => void;
  splitTextToSize: (text: string, width: number) => string[];
  getTextWidth: (text: string) => number;
};

function drawCell(
  doc: PdfDoc,
  cell: BatchCellLayout,
  index: number,
  item: BatchExportItem & { caption: BatchCaption },
): void {
  doc.setDrawColor(190, 190, 190);
  doc.rect(cell.x, cell.y, cell.width, cell.height);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(String(index + 1), cell.x + 2, cell.y + 4);
  doc.setTextColor(0, 0, 0);

  doc.addImage(
    item.qrDataUrl,
    "PNG",
    cell.qrX,
    cell.qrY,
    cell.qrSize,
    cell.qrSize,
  );

  let top = cell.textTopY;
  for (const block of buildCaptionBlocks(item.caption)) {
    doc.setFont("helvetica", block.bold ? "bold" : "normal");
    doc.setFontSize(block.size);
    const lineHeight = lineHeightMm(block.size);
    const lines = fitTextLines(
      block.text,
      block.maxLines,
      cell.textWidth,
      (text, width) => doc.splitTextToSize(text, width),
      (text) => doc.getTextWidth(text),
    );
    for (const line of lines) {
      doc.text(line, cell.centerX, top + lineHeight * 0.8, { align: "center" });
      top += lineHeight;
    }
  }
}

/**
 * Xếp các mã QR thành PDF A4, lưới 2 cột x 3 hàng. QR canh giữa trong ô,
 * chữ canh giữa và ngắt dòng để không tràn sang ô bên cạnh.
 * `jspdf` được nạp động để không làm nặng bundle chính.
 */
export async function buildBatchPdfBytes(
  items: readonly (BatchExportItem & { caption: BatchCaption })[],
): Promise<ArrayBuffer> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  items.forEach((item, index) => {
    if (index > 0 && index % PDF_PER_PAGE === 0) doc.addPage();
    const cell = layoutBatchCell(index % PDF_PER_PAGE);
    drawCell(doc as unknown as PdfDoc, cell, index, item);
  });

  return doc.output("arraybuffer");
}

export const batchPdfFileName = (date: Date): string =>
  `QR_nhieu_lenh_${formatBatchStamp(date)}.pdf`;
