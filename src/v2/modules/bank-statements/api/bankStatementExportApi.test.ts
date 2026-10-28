import { beforeEach, describe, expect, it, vi } from "vitest";

const { post, get } = vi.hoisted(() => ({ post: vi.fn(), get: vi.fn() }));

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { post, get },
  V2_API_BASE_URL: "http://test",
}));

import { bankStatementExportApi } from "./bankStatementExportApi";

describe("bankStatementExportApi", () => {
  beforeEach(() => {
    post.mockReset();
    get.mockReset();
  });

  it("posts the export payload to the bank-transactions-core background endpoint", async () => {
    post.mockResolvedValue({ data: { jobId: "job-1", message: "ok" } });

    const result = await bankStatementExportApi.startBackgroundExport({
      sourceType: "BANK",
      selected_columns: ["cashflowClassification"],
    });

    expect(post).toHaveBeenCalledWith(
      "/api/v1/bank-transactions-core/export/excel/background",
      { sourceType: "BANK", selected_columns: ["cashflowClassification"] },
    );
    expect(result.jobId).toBe("job-1");
  });

  it("lists history with paging params", async () => {
    get.mockResolvedValue({ data: { items: [], total: 0 } });

    await bankStatementExportApi.listBackgroundHistory(2, 10);

    expect(get).toHaveBeenCalledWith(
      "/api/v1/bank-transactions-core/export/excel/background/history",
      { params: { page: 2, pageSize: 10 } },
    );
  });

  it("requests the download as a blob for a job id", async () => {
    get.mockResolvedValue({ data: new Blob(["x"]) });

    await bankStatementExportApi.downloadBackgroundFile("job/1");

    expect(get).toHaveBeenCalledWith(
      "/api/v1/bank-transactions-core/export/excel/background/job%2F1/download",
      { responseType: "blob" },
    );
  });
});
