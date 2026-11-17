import { describe, expect, it } from "vitest";

/**
 * Chặn tái phạm: mã web không được gọi lại route V1 ghi/đọc file đính kèm hóa đơn.
 * File hóa đơn chỉ đi qua `invoiceFilesV2Api` (`/api/v2/invoices/:id/attachments`).
 * Pipeline PDF gốc nhà cung cấp (`original-pdf`) KHÔNG bị chặn: đó là tra cứu, không phải đính kèm.
 */
const SOURCES = import.meta.glob(
  ["/src/**/*.{ts,tsx}", "!/src/**/*.{test,spec}.{ts,tsx}", "!/src/**/*.d.ts"],
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

const FORBIDDEN: Array<{ name: string; pattern: RegExp }> = [
  {
    name: "hàm V1 file hóa đơn đã gỡ",
    pattern:
      /\b(getPdfDownloadUrl|downloadPdfsZip|uploadPdfs|deletePdf|getPdfBlob|linkAttachment|unlinkAttachment)\b/,
  },
  {
    name: "route V1 erp-attachments",
    pattern: /\/api\/v1\/erp-attachments/,
  },
  {
    name: "route V1 pdfs của hóa đơn",
    pattern: /erp-invoices\/[^"'`]*\/pdfs/,
  },
];

describe("invoice files V1 guard", () => {
  it("quét được mã nguồn", () => {
    expect(Object.keys(SOURCES).length).toBeGreaterThan(100);
  });

  for (const rule of FORBIDDEN) {
    it(`không còn ${rule.name}`, () => {
      const hits = Object.entries(SOURCES)
        .filter(([, text]) => rule.pattern.test(text))
        .map(([path]) => path);
      expect(hits).toEqual([]);
    });
  }
});
