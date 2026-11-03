import { beforeEach, describe, expect, it, vi } from "vitest";

const { post, get } = vi.hoisted(() => ({ post: vi.fn(), get: vi.fn() }));

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { post, get },
  V2_API_BASE_URL: "http://test",
}));

import {
  invoiceDebtsExportApi,
  readBlobErrorMessage,
} from "./invoiceDebtsExportApi";

describe("invoiceDebtsExportApi", () => {
  beforeEach(() => {
    post.mockReset();
    get.mockReset();
  });

  it("posts the export payload and returns the start result", async () => {
    post.mockResolvedValue({
      data: { jobId: "job-debt-1", message: "ok", reused: false },
    });

    const result = await invoiceDebtsExportApi.startBackgroundExport({
      partner_type: "CUSTOMER",
      date_from: "2026-01-01",
      date_to: "2026-01-31",
      selectedColumns: ["stt", "taxCode"],
    });

    expect(post).toHaveBeenCalledWith(
      "/api/v1/erp-invoices/debts/export/excel/background",
      {
        partner_type: "CUSTOMER",
        date_from: "2026-01-01",
        date_to: "2026-01-31",
        selectedColumns: ["stt", "taxCode"],
      },
    );
    expect(result.jobId).toBe("job-debt-1");
  });

  it("rethrows the server message when starting the export fails", async () => {
    post.mockRejectedValue({
      response: { data: { message: "Đang có tiến trình chạy" } },
    });

    await expect(
      invoiceDebtsExportApi.startBackgroundExport({}),
    ).rejects.toThrow("Đang có tiến trình chạy");
  });

  it("requests history with page and pageSize params", async () => {
    get.mockResolvedValue({ data: { items: [], total: 0 } });

    await invoiceDebtsExportApi.listBackgroundHistory(2, 20);

    expect(get).toHaveBeenCalledWith(
      "/api/v1/erp-invoices/debts/export/excel/background/history",
      { params: { page: 2, pageSize: 20 } },
    );
  });

  it("downloads a job file as a blob with encoded job id", async () => {
    const blob = new Blob(["xlsx-data"]);
    get.mockResolvedValue({ data: blob });

    const result =
      await invoiceDebtsExportApi.downloadBackgroundFile("job/123");
    expect(result).toBe(blob);
    expect(get).toHaveBeenCalledWith(
      "/api/v1/erp-invoices/debts/export/excel/background/job%2F123/download",
      { responseType: "blob" },
    );
  });

  it("extracts json error message from blob error in readBlobErrorMessage", async () => {
    const blobError = {
      response: {
        data: new Blob([JSON.stringify({ message: "File hết hạn" })], {
          type: "application/json",
        }),
      },
    };
    const msg = await readBlobErrorMessage(blobError);
    expect(msg).toBe("File hết hạn");
  });
});
