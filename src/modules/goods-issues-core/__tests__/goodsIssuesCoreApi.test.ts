import { beforeEach, describe, expect, it, vi } from "vitest";
import { goodsIssuesCoreApi } from "@/modules/goods-issues-core/api/goodsIssuesCoreApi";
import axiosInstance from "@/core/api/axiosInstance";

vi.mock("@/core/api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("goodsIssuesCoreApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list calls GET with pagination/search params", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { items: [{ id: "gi-1" }], total: 1, page: 1, pageSize: 20 },
    } as any);

    const result = await goodsIssuesCoreApi.list({
      page: 3,
      pageSize: 25,
      search: "XK-01",
    });

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/goods-issues", {
      params: { page: 3, pageSize: 25, search: "XK-01" },
    });
    expect(result.items).toHaveLength(1);
  });

  it("get returns detail data", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { message: "ok", data: { id: "gi-1", issueNo: "XK-01" } },
    } as any);

    const result = await goodsIssuesCoreApi.get("gi-1");

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/goods-issues/gi-1");
    expect(result.id).toBe("gi-1");
  });

  it("create posts payload and returns created data", async () => {
    const payload = {
      issueNo: "XK-01",
      issueDate: "2026-07-20",
      issueType: "SALE",
      lines: [{ itemId: "item-1", qtyIssued: "1" }],
    };
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: { message: "ok", data: { id: "gi-1", ...payload } },
    } as any);

    const result = await goodsIssuesCoreApi.create(payload as any);

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/v1/goods-issues",
      payload,
    );
    expect(result.id).toBe("gi-1");
  });

  it("update patches payload to id route", async () => {
    const payload = { remarks: "updated" };
    vi.mocked(axiosInstance.patch).mockResolvedValue({
      data: { message: "ok", data: { id: "gi-1", remarks: "updated" } },
    } as any);

    const result = await goodsIssuesCoreApi.update("gi-1", payload);

    expect(axiosInstance.patch).toHaveBeenCalledWith(
      "/api/v1/goods-issues/gi-1",
      payload,
    );
    expect(result.remarks).toBe("updated");
  });

  it("post sends warehouseCode to post endpoint", async () => {
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: { message: "ok", data: { id: "gi-1", status: "POSTED" } },
    } as any);

    const result = await goodsIssuesCoreApi.post("gi-1", "WH1");

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/v1/goods-issues/gi-1/post",
      { warehouseCode: "WH1" },
    );
    expect(result.status).toBe("POSTED");
  });

  it("remove calls DELETE and returns data", async () => {
    vi.mocked(axiosInstance.delete).mockResolvedValue({
      data: { message: "ok", data: { id: "gi-1" } },
    } as any);

    const result = await goodsIssuesCoreApi.remove("gi-1");

    expect(axiosInstance.delete).toHaveBeenCalledWith(
      "/api/v1/goods-issues/gi-1",
    );
    expect(result.id).toBe("gi-1");
  });

  it("cancel calls cancel endpoint", async () => {
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: { message: "ok", data: { id: "gi-1", status: "CANCELLED" } },
    } as any);

    const result = await goodsIssuesCoreApi.cancel("gi-1");

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/v1/goods-issues/gi-1/cancel",
      {},
    );
    expect(result.status).toBe("CANCELLED");
  });

  it("exportXlsx requests blob response", async () => {
    const blob = new Blob(["test"]);
    vi.mocked(axiosInstance.get).mockResolvedValue({ data: blob } as any);

    const result = await goodsIssuesCoreApi.exportXlsx("gi-1");

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/v1/goods-issues/gi-1/export-xlsx",
      { responseType: "blob" },
    );
    expect(result).toBe(blob);
  });
});
