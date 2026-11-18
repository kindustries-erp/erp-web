import { downloadBlob } from "./downloadBlob";
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

/** Tải ZIP chứa mọi ảnh PNG đã sẵn sàng. Không làm gì khi danh sách rỗng. */
export async function downloadBatchZip(
  items: readonly BatchDownloadItem[],
  now: Date = new Date(),
): Promise<void> {
  if (items.length === 0) return;
  const bytes = await buildBatchZipBytes(items);
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
