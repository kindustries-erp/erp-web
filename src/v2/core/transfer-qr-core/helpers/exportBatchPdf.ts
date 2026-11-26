import { formatBatchStamp, type BatchExportItem } from "./exportBatchZip";
import { PDF_PER_PAGE, layoutBatchCell } from "./layoutBatchPage";
import {
  drawPageHeaderAndFooter,
  drawBatchCardCell,
  type PdfCanvas,
} from "./batchPdfRender";

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

export interface BatchPdfItem extends BatchExportItem {
  caption: BatchCaption;
  /** Ảnh chụp DOM thẻ TransferQrPaymentCard (ưu tiên nhúng vào PDF để đồng nhất UI). */
  cardImageDataUrl?: string;
  cardWidth?: number;
  cardHeight?: number;
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

/**
 * Xếp các mã QR thành PDF A4 chuẩn chuyên nghiệp (Header trang, Thẻ đóng khung 2 tầng, Footer).
 * `jspdf` được nạp động để không làm nặng bundle chính.
 */
export async function buildBatchPdfBytes(
  items: readonly BatchPdfItem[],
): Promise<ArrayBuffer> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const totalPages = pageCountFor(items.length);
  const now = new Date();
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.caption.amount || 0),
    0,
  );

  let currentPage = 1;
  drawPageHeaderAndFooter(
    doc as unknown as PdfCanvas,
    currentPage,
    totalPages,
    items.length,
    totalAmount,
    now,
  );

  items.forEach((item, index) => {
    if (index > 0 && index % PDF_PER_PAGE === 0) {
      doc.addPage();
      currentPage++;
      drawPageHeaderAndFooter(
        doc as unknown as PdfCanvas,
        currentPage,
        totalPages,
        items.length,
        totalAmount,
        now,
      );
    }
    const cell = layoutBatchCell(index % PDF_PER_PAGE);
    drawBatchCardCell(doc as unknown as PdfCanvas, cell, index, item);
  });

  return doc.output("arraybuffer");
}

export const batchPdfFileName = (date: Date): string =>
  `QR_nhieu_lenh_${formatBatchStamp(date)}.pdf`;
