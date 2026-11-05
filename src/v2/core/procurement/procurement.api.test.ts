import { beforeEach, describe, expect, it, vi } from "vitest";

const { del } = vi.hoisted(() => ({ del: vi.fn() }));

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { delete: del },
  V2_API_BASE_URL: "http://test",
}));

import { createProcurementApi } from "./procurement.api";

describe("createProcurementApi: xóa mềm và xóa cứng", () => {
  beforeEach(() => {
    del.mockReset();
    del.mockResolvedValue({ data: { id: "p1" } });
  });

  it("xóa cứng gọi DELETE {base}/{id}/permanent khi bật supportsPurge", async () => {
    const api = createProcurementApi("/api/v2/garage-procurement-requests", {
      supportsDelete: true,
      supportsPurge: true,
    });

    await api.purge?.("p1");

    expect(del).toHaveBeenCalledWith(
      "/api/v2/garage-procurement-requests/p1/permanent",
    );
  });

  it("không có purge khi không bật supportsPurge, không gọi HTTP", () => {
    const api = createProcurementApi("/api/v2/garage-procurement-orders", {
      supportsDelete: true,
    });

    expect(api.purge).toBeUndefined();
    expect(del).not.toHaveBeenCalled();
  });

  it("xóa mềm vẫn gọi DELETE {base}/{id} khi bật supportsDelete", async () => {
    const api = createProcurementApi("/api/v2/garage-procurement-orders", {
      supportsDelete: true,
    });

    await api.remove?.("o1");

    expect(del).toHaveBeenCalledWith("/api/v2/garage-procurement-orders/o1");
  });
});
