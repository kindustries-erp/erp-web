/** Một mã QR đã sẵn sàng để đưa vào ZIP hoặc PDF. */
export interface BatchExportItem {
  /** Tên file, ví dụ 01_QR_VCB_0123456789_1500000.png */
  fileName: string;
  /** Ảnh QR dạng data URL PNG */
  qrDataUrl: string;
}

/** Dấu thời gian cho tên file hàng loạt: yyyymmdd-hhmm. */
export function formatBatchStamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}`
  );
}

/**
 * Đóng gói các ảnh QR thành ZIP. `jszip` được nạp động để không làm nặng bundle chính.
 * Trả về ArrayBuffer để test đọc lại được; người gọi tự bọc thành Blob khi tải.
 */
export async function buildBatchZipBytes(
  items: readonly BatchExportItem[],
): Promise<ArrayBuffer> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const item of items) {
    const base64 = item.qrDataUrl.split(",")[1] ?? "";
    zip.file(item.fileName, base64, { base64: true });
  }
  return zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE" });
}

export const batchZipFileName = (date: Date): string =>
  `QR_nhieu_lenh_${formatBatchStamp(date)}.zip`;
