import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { TINY_PNG } from "./batchTestFixtures";
import {
  batchZipFileName,
  buildBatchZipBytes,
  formatBatchStamp,
  type BatchExportItem,
} from "./exportBatchZip";

const items: BatchExportItem[] = [
  { fileName: "01_QR_VCB_0123456789_1500000.png", qrDataUrl: TINY_PNG },
  { fileName: "02_QR_VCB_0123456789_1500000.png", qrDataUrl: TINY_PNG },
];

describe("buildBatchZipBytes", () => {
  it("đóng gói đúng số ảnh, giữ nguyên tên có số thứ tự", async () => {
    const bytes = await buildBatchZipBytes(items);
    const zip = await JSZip.loadAsync(bytes);
    expect(Object.keys(zip.files).sort()).toEqual([
      "01_QR_VCB_0123456789_1500000.png",
      "02_QR_VCB_0123456789_1500000.png",
    ]);
  });

  it("ảnh trong ZIP là đúng PNG đã đưa vào", async () => {
    const bytes = await buildBatchZipBytes([items[0]]);
    const zip = await JSZip.loadAsync(bytes);
    const png = await zip.file(items[0].fileName)!.async("base64");
    expect(png).toBe(TINY_PNG.split(",")[1]);
  });
});

describe("batchZipFileName", () => {
  it("dùng dấu thời gian yyyymmdd-hhmm", () => {
    const date = new Date(2026, 10, 18, 9, 5);
    expect(formatBatchStamp(date)).toBe("20261118-0905");
    expect(batchZipFileName(date)).toBe("QR_nhieu_lenh_20261118-0905.zip");
  });
});
