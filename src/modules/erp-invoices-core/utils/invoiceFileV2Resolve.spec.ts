import { describe, expect, it } from "vitest";
import type { InvoiceFileV2 } from "../api/invoiceFilesV2Api";
import { pickInvoiceFileV2 } from "./invoiceFileV2Resolve";

const f = (
  id: string,
  fileName: string,
  isOriginal = false,
): InvoiceFileV2 => ({
  id,
  fileName,
  isOriginal,
  category: "HOA_DON",
  fileSize: 1,
  mimeType: null,
  origin: "V2",
  createdAt: "",
});

describe("pickInvoiceFileV2", () => {
  const files = [f("a", "a.pdf"), f("b", "b.pdf", true)];
  it("ưu tiên khớp tên", () => {
    expect(
      pickInvoiceFileV2(files, { fileName: "a.pdf", original: true })?.id,
    ).toBe("a");
  });
  it("không có tên thì lấy PDF gốc", () => {
    expect(pickInvoiceFileV2(files, { original: true })?.id).toBe("b");
  });
  it("không khớp gì thì lấy file đầu, rỗng thì null", () => {
    expect(pickInvoiceFileV2(files, { fileName: "zzz" })?.id).toBe("a");
    expect(pickInvoiceFileV2([], {})).toBeNull();
  });
});
