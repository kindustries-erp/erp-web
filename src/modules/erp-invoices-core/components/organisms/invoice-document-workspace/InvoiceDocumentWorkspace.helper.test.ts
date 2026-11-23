import { describe, it, expect } from "vitest";
import type { InvoiceFileV2 } from "@/modules/erp-invoices-core/api/invoiceFilesV2Api";
import { normalizeInvoiceDocuments } from "./InvoiceDocumentWorkspace.helper";

const file = (over: Partial<InvoiceFileV2>): InvoiceFileV2 => ({
  id: "f1",
  category: "HOA_DON",
  isOriginal: false,
  fileName: "a.pdf",
  fileSize: 100,
  mimeType: "application/pdf",
  origin: "V2",
  createdAt: "2026-10-19T00:00:00Z",
  ...over,
});

describe("normalizeInvoiceDocuments", () => {
  it("trả mảng rỗng khi không có file", () => {
    expect(normalizeInvoiceDocuments()).toEqual([]);
  });

  it("map file V2, isOriginal thành isLegacy (nhãn PDF gốc), size 0 thành undefined", () => {
    const docs = normalizeInvoiceDocuments([
      file({ id: "z", isOriginal: true, fileSize: 0, fileName: "pkg.zip" }),
    ]);
    expect(docs[0]).toMatchObject({
      id: "z",
      attachmentId: "z",
      name: "pkg.zip",
      isLegacy: true,
      documentType: "HOA_DON",
    });
    expect(docs[0].size).toBeUndefined();
  });

  it("ẩn file .xml thuần", () => {
    expect(normalizeInvoiceDocuments([file({ fileName: "a.XML" })])).toEqual(
      [],
    );
  });

  it("thêm file chờ lưu và loại file đánh dấu xóa", () => {
    const pending = [{ file: new File(["x"], "n.pdf"), documentType: "KHAC" }];
    const docs = normalizeInvoiceDocuments(
      [file({ id: "a" }), file({ id: "b", fileName: "b.pdf" })],
      pending,
      ["a"],
    );
    expect(docs.map((d) => d.id)).toEqual(["b", "pending-0-n.pdf"]);
    expect(docs[1].isPending).toBe(true);
  });
});
