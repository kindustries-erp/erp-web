import { beforeEach, describe, expect, it, vi } from "vitest";
import { goodsReceiptsCoreApi } from "@/modules/goods-receipts-core/api/goodsReceiptsCoreApi";
import axiosInstance from "@/core/api/axiosInstance";

vi.mock("@/core/api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("goodsReceiptsCoreApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list calls GET with pagination/search params", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { items: [{ id: "gr-1" }], total: 1, page: 1, pageSize: 20 },
    } as any);

    const result = await goodsReceiptsCoreApi.list({
      page: 2,
      pageSize: 50,
      search: "NK-01",
    });

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/goods-receipts", {
      params: { page: 2, pageSize: 50, search: "NK-01" },
    });
    expect(result.items).toHaveLength(1);
  });

  it("get returns detail data", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { message: "ok", data: { id: "gr-1", receiptNo: "NK-01" } },
    } as any);

    const result = await goodsReceiptsCoreApi.get("gr-1");

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/v1/goods-receipts/gr-1",
    );
    expect(result.id).toBe("gr-1");
  });

  it("create posts payload and returns created data", async () => {
    const payload = {
      receiptDate: "2026-07-20",
      receiptNo: "NK-01",
      lines: [{ itemId: "item-1", qtyReceived: "2" }],
    };
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: { message: "ok", data: { id: "gr-1", ...payload } },
    } as any);

    const result = await goodsReceiptsCoreApi.create(payload as any);

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/v1/goods-receipts",
      payload,
    );
    expect(result.id).toBe("gr-1");
  });

  it("update patches payload to id route", async () => {
    const payload = { remarks: "updated" };
    vi.mocked(axiosInstance.patch).mockResolvedValue({
      data: { message: "ok", data: { id: "gr-1", remarks: "updated" } },
    } as any);

    const result = await goodsReceiptsCoreApi.update("gr-1", payload);

    expect(axiosInstance.patch).toHaveBeenCalledWith(
      "/api/v1/goods-receipts/gr-1",
      payload,
    );
    expect(result.remarks).toBe("updated");
  });

  it("post sends warehouseCode to post endpoint", async () => {
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: { message: "ok", data: { id: "gr-1", status: "POSTED" } },
    } as any);

    const result = await goodsReceiptsCoreApi.post("gr-1", "WH1");

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/v1/goods-receipts/gr-1/post",
      { warehouseCode: "WH1" },
    );
    expect(result.status).toBe("POSTED");
  });

  it("cancel calls cancel endpoint", async () => {
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: { message: "ok", data: { id: "gr-1", status: "CANCELLED" } },
    } as any);

    const result = await goodsReceiptsCoreApi.cancel("gr-1");

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/v1/goods-receipts/gr-1/cancel",
      {},
    );
    expect(result.status).toBe("CANCELLED");
  });

  it("remove calls DELETE and returns data", async () => {
    vi.mocked(axiosInstance.delete).mockResolvedValue({
      data: { message: "ok", data: { id: "gr-1" } },
    } as any);

    const result = await goodsReceiptsCoreApi.remove("gr-1");

    expect(axiosInstance.delete).toHaveBeenCalledWith(
      "/api/v1/goods-receipts/gr-1",
    );
    expect(result.id).toBe("gr-1");
  });

  it("nextNo calls next-no endpoint with optional date", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { nextNo: "NK-20260720-99" },
    } as any);

    const result = await goodsReceiptsCoreApi.nextNo("2026-07-20");

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/v1/goods-receipts/next-no",
      { params: { date: "2026-07-20" } },
    );
    expect(result).toBe("NK-20260720-99");
  });

  it("exportXlsx requests blob response", async () => {
    const blob = new Blob(["test"]);
    vi.mocked(axiosInstance.get).mockResolvedValue({ data: blob } as any);

    const result = await goodsReceiptsCoreApi.exportXlsx("gr-1");

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/v1/goods-receipts/gr-1/export-xlsx",
      { responseType: "blob" },
    );
    expect(result).toBe(blob);
  });
});
