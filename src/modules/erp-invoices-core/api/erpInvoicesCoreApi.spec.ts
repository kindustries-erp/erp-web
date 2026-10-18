import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/core/api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import axiosInstance from "@/core/api/axiosInstance";
import { erpInvoicesCoreApi } from "./erpInvoicesCoreApi";

describe("erpInvoicesCoreApi blob error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns blob for bulkDownloadSelected on success", async () => {
    const blob = new Blob(["ok"], { type: "application/zip" });
    vi.mocked(axiosInstance.post).mockResolvedValue({ data: blob } as any);

    const result = await erpInvoicesCoreApi.bulkDownloadSelected({
      ids: ["inv-1"],
      types: ["pdf"],
    });

    expect(result).toBe(blob);
  });

  it("throws backend message parsed from blob json", async () => {
    const errorBlob = new Blob(
      [JSON.stringify({ message: "Không có hóa đơn nào được chọn" })],
      { type: "application/json" },
    );
    vi.mocked(axiosInstance.post).mockRejectedValue({
      response: { data: errorBlob },
    });

    await expect(
      erpInvoicesCoreApi.bulkDownloadSelected({ ids: [], types: ["pdf"] }),
    ).rejects.toThrow("Không có hóa đơn nào được chọn");
  });
});

describe("erpInvoicesCoreApi query methods with POST", () => {
  it("calls getSmartNetOffSuggestions with _silentSuccess: true", async () => {
    vi.mocked(axiosInstance.post).mockResolvedValue({ data: {} } as any);

    await erpInvoicesCoreApi.getSmartNetOffSuggestions(["inv-1", "inv-2"]);

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/v1/erp-invoices/smart-net-off-suggestions",
      { invoiceIds: ["inv-1", "inv-2"] },
      { _silentSuccess: true },
    );
  });

  it("calls getBulkNetOffs with _silentSuccess: true", async () => {
    vi.mocked(axiosInstance.post).mockResolvedValue({ data: [] } as any);

    await erpInvoicesCoreApi.getBulkNetOffs(["inv-1"]);

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/v1/erp-invoices/bulk-net-offs",
      { ids: ["inv-1"] },
      { _silentSuccess: true },
    );
  });
});
