import { downloadBlob, downloadDataUrl } from "./downloadBlob";
import { cardElementToPng } from "./exportCardImage";
import {
  batchPdfFileName,
  buildBatchPdfBytes,
  type BatchCaption,
  type BatchPdfItem,
} from "./exportBatchPdf";
import { batchZipFileName, buildBatchZipBytes } from "./exportBatchZip";

/** Một mã QR đã có ảnh, kèm chữ dưới mã cho PDF. */
export interface BatchDownloadItem {
  fileName: string;
  qrDataUrl: string;
  caption: BatchCaption;
}

export type CardElementLookup = (
  fileName: string,
) => HTMLElement | null | undefined;

interface CapturedCardImage {
  dataUrl: string;
  width?: number;
  height?: number;
}

/** Chụp DOM thẻ thanh toán sang PNG kèm kích thước thực; trả null nếu thiếu element hoặc lỗi. */
async function captureCardImage(
  cardElement?: HTMLElement | null,
): Promise<CapturedCardImage | null> {
  if (!cardElement) return null;
  try {
    const dataUrl = await cardElementToPng(cardElement);
    const rect = cardElement.getBoundingClientRect();
    const width = cardElement.offsetWidth || rect.width;
    const height = cardElement.offsetHeight || rect.height;
    return {
      dataUrl,
      width: width > 0 ? width : undefined,
      height: height > 0 ? height : undefined,
    };
  } catch {
    return null;
  }
}

/** Tải một thẻ thanh toán dạng ảnh PNG đẹp mắt; fallback mã QR thô nếu không có element. */
export async function downloadRowCard(
  item: { fileName: string; qrDataUrl: string },
  cardElement?: HTMLElement | null,
): Promise<void> {
  if (!item.qrDataUrl) return;
  const captured = await captureCardImage(cardElement);
  downloadDataUrl(captured ? captured.dataUrl : item.qrDataUrl, item.fileName);
}

/** Tải ZIP chứa mọi ảnh thẻ thanh toán đẹp mắt (hoặc ảnh QR thô nếu fallback). */
export async function downloadBatchZip(
  items: readonly BatchDownloadItem[],
  now: Date = new Date(),
  getCardElement?: CardElementLookup,
): Promise<void> {
  if (items.length === 0) return;
  const itemsToZip = getCardElement
    ? await Promise.all(
        items.map(async (item) => {
          const captured = await captureCardImage(
            getCardElement(item.fileName),
          );
          return captured ? { ...item, qrDataUrl: captured.dataUrl } : item;
        }),
      )
    : items;
  const bytes = await buildBatchZipBytes(itemsToZip);
  downloadBlob(
    new Blob([bytes], { type: "application/zip" }),
    batchZipFileName(now),
  );
}

/** Tải PDF A4 xếp lưới các thẻ thanh toán (fallback vector nếu thiếu DOM thẻ). */
export async function downloadBatchPdf(
  items: readonly BatchDownloadItem[],
  now: Date = new Date(),
  getCardElement?: CardElementLookup,
): Promise<void> {
  if (items.length === 0) return;
  const pdfItems: readonly BatchPdfItem[] = getCardElement
    ? await Promise.all(
        items.map(async (item) => {
          const captured = await captureCardImage(
            getCardElement(item.fileName),
          );
          return captured
            ? {
                ...item,
                cardImageDataUrl: captured.dataUrl,
                cardWidth: captured.width,
                cardHeight: captured.height,
              }
            : item;
        }),
      )
    : items;
  const bytes = await buildBatchPdfBytes(pdfItems);
  downloadBlob(
    new Blob([bytes], { type: "application/pdf" }),
    batchPdfFileName(now),
  );
}
