import { beforeEach, describe, expect, it, vi } from "vitest";

const { post, get } = vi.hoisted(() => ({ post: vi.fn(), get: vi.fn() }));

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { post, get },
  V2_API_BASE_URL: "http://test",
}));

import { vinfastStockExportApi } from "./vinfastStockExportApi";

describe("vinfastStockExportApi", () => {
  beforeEach(() => {
    post.mockReset();
    get.mockReset();
  });

  it("posts the export payload and returns the start result", async () => {
    post.mockResolvedValue({ data: { jobId: "job-1", message: "ok" } });

    const result = await vinfastStockExportApi.startBackgroundExport({
      vehicleType: "oto",
      selectedColumns: ["sku"],
    });

    expect(post).toHaveBeenCalledWith(
      "/api/v1/vinfast-parts/stock/export/excel/background",
      { vehicleType: "oto", selectedColumns: ["sku"] },
    );
    expect(result.jobId).toBe("job-1");
  });

  it("rethrows the server message when starting the export fails", async () => {
    post.mockRejectedValue({
      response: { data: { message: "Trùng tiến trình" } },
    });

    await expect(
      vinfastStockExportApi.startBackgroundExport({}),
    ).rejects.toThrow("Trùng tiến trình");
  });

  it("requests history with page and pageSize params", async () => {
    get.mockResolvedValue({ data: { items: [], total: 0 } });

    await vinfastStockExportApi.listBackgroundHistory(2, 20);

    expect(get).toHaveBeenCalledWith(
      "/api/v1/vinfast-parts/stock/export/excel/background/history",
      { params: { page: 2, pageSize: 20 } },
    );
  });

  it("downloads a job file as a blob with the encoded job id", async () => {
    const blob = new Blob(["xlsx"]);
    get.mockResolvedValue({ data: blob });

    await expect(
      vinfastStockExportApi.downloadBackgroundFile("a/b"),
    ).resolves.toBe(blob);
    expect(get).toHaveBeenCalledWith(
      "/api/v1/vinfast-parts/stock/export/excel/background/a%2Fb/download",
      { responseType: "blob" },
    );
  });
});
