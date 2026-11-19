import { downloadBlob, downloadDataUrl } from "./downloadBlob";
import { cardElementToPng } from "./exportCardImage";
import {
  batchPdfFileName,
  buildBatchPdfBytes,
  type BatchCaption,
} from "./exportBatchPdf";
import { batchZipFileName, buildBatchZipBytes } from "./exportBatchZip";

/** Một mã QR đã có ảnh, kèm chữ dưới mã cho PDF. */
export interface BatchDownloadItem {
  fileName: string;
  qrDataUrl: string;
  caption: BatchCaption;
}

/** Tải một thẻ thanh toán dạng ảnh PNG đẹp mắt; fallback mã QR thô nếu không có element. */
export async function downloadRowCard(
  item: { fileName: string; qrDataUrl: string },
  cardElement?: HTMLElement | null,
): Promise<void> {
  if (!item.qrDataUrl) return;
  if (cardElement) {
    try {
      const cardUrl = await cardElementToPng(cardElement);
      downloadDataUrl(cardUrl, item.fileName);
      return;
    } catch {
      // Fallback xuống mã QR thô
    }
  }
  downloadDataUrl(item.qrDataUrl, item.fileName);
}

/** Tải ZIP chứa mọi ảnh thẻ thanh toán đẹp mắt (hoặc ảnh QR thô nếu fallback). */
export async function downloadBatchZip(
  items: readonly BatchDownloadItem[],
  now: Date = new Date(),
  getCardElement?: (fileName: string) => HTMLElement | null | undefined,
): Promise<void> {
  if (items.length === 0) return;
  let itemsToZip = items;
  if (getCardElement) {
    itemsToZip = await Promise.all(
      items.map(async (item) => {
        const cardEl = getCardElement(item.fileName);
        if (!cardEl) return item;
        try {
          const cardUrl = await cardElementToPng(cardEl);
          return { ...item, qrDataUrl: cardUrl };
        } catch {
          return item;
        }
      }),
    );
  }
  const bytes = await buildBatchZipBytes(itemsToZip);
  downloadBlob(
    new Blob([bytes], { type: "application/zip" }),
    batchZipFileName(now),
  );
}

/** Tải PDF A4 xếp lưới các mã QR. Không làm gì khi danh sách rỗng. */
export async function downloadBatchPdf(
  items: readonly BatchDownloadItem[],
  now: Date = new Date(),
): Promise<void> {
  if (items.length === 0) return;
  const bytes = await buildBatchPdfBytes(items);
  downloadBlob(
    new Blob([bytes], { type: "application/pdf" }),
    batchPdfFileName(now),
  );
}
