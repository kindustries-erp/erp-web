import { beforeEach, describe, expect, it, vi } from "vitest";

const { post, get } = vi.hoisted(() => ({ post: vi.fn(), get: vi.fn() }));

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { post, get },
  V2_API_BASE_URL: "http://test",
}));

import { createExportJobApi } from "./createExportJobApi";

const api = createExportJobApi<{ a: number }>("/api/x/export/excel/background");

describe("createExportJobApi", () => {
  beforeEach(() => {
    post.mockReset();
    get.mockReset();
  });

  it("posts the payload to the base path", async () => {
    post.mockResolvedValue({ data: { jobId: "j1", message: "ok" } });
    const result = await api.startBackgroundExport({ a: 1 });
    expect(post).toHaveBeenCalledWith("/api/x/export/excel/background", {
      a: 1,
    });
    expect(result.jobId).toBe("j1");
  });

  it("lists history with paging params", async () => {
    get.mockResolvedValue({ data: { items: [] } });
    await api.listBackgroundHistory(2, 5);
    expect(get).toHaveBeenCalledWith("/api/x/export/excel/background/history", {
      params: { page: 2, pageSize: 5 },
    });
  });

  it("downloads as blob and encodes the job id", async () => {
    const blob = new Blob(["x"]);
    get.mockResolvedValue({ data: blob });
    expect(await api.downloadBackgroundFile("a/b")).toBe(blob);
    expect(get).toHaveBeenCalledWith(
      "/api/x/export/excel/background/a%2Fb/download",
      { responseType: "blob" },
    );
  });

  it("surfaces the server message from a blob error body", async () => {
    get.mockRejectedValue({
      response: {
        data: new Blob([JSON.stringify({ message: "File chưa sẵn sàng" })]),
      },
    });
    await expect(api.downloadBackgroundFile("j1")).rejects.toThrow(
      "File chưa sẵn sàng",
    );
  });
});
