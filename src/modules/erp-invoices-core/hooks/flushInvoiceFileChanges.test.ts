import { beforeEach, describe, expect, it, vi } from "vitest";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import { invoiceFilesV2Api } from "../api/invoiceFilesV2Api";
import { flushInvoiceFileChanges } from "./flushInvoiceFileChanges";

vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: { deletePdf: vi.fn().mockResolvedValue({}) },
}));
vi.mock("../api/invoiceFilesV2Api", () => ({
  invoiceFilesV2Api: {
    remove: vi.fn().mockResolvedValue(undefined),
    upload: vi.fn().mockResolvedValue([]),
  },
}));

const UUID = "3f2b8c1e-1a2b-4c3d-8e4f-5a6b7c8d9e0f";

describe("flushInvoiceFileChanges", () => {
  beforeEach(() => vi.clearAllMocks());

  it("id UUID xóa qua V2, khóa cũ xóa qua V1", async () => {
    await flushInvoiceFileChanges("inv", [UUID, "invoices/a.pdf"], []);
    expect(invoiceFilesV2Api.remove).toHaveBeenCalledWith("inv", UUID);
    expect(erpInvoicesCoreApi.deletePdf).toHaveBeenCalledWith(
      "inv",
      "invoices/a.pdf",
    );
  });

  it("gom file chờ theo loại, mỗi loại một lần upload", async () => {
    const f = (n: string) => new File(["x"], n);
    await flushInvoiceFileChanges(
      "inv",
      [],
      [
        { file: f("1.pdf"), documentType: "HOA_DON" },
        { file: f("2.pdf"), documentType: "HOA_DON" },
        { file: f("3.pdf"), documentType: "KHAC" },
      ],
    );
    expect(invoiceFilesV2Api.upload).toHaveBeenCalledTimes(2);
    expect(vi.mocked(invoiceFilesV2Api.upload).mock.calls[0][1]).toHaveLength(
      2,
    );
  });

  it("lỗi một mục không chặn các mục còn lại", async () => {
    vi.mocked(invoiceFilesV2Api.remove).mockRejectedValueOnce(new Error("x"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await flushInvoiceFileChanges(
      "inv",
      [UUID, "k.pdf"],
      [{ file: new File(["x"], "n.pdf"), documentType: "KHAC" }],
    );
    expect(erpInvoicesCoreApi.deletePdf).toHaveBeenCalled();
    expect(invoiceFilesV2Api.upload).toHaveBeenCalled();
  });
});
