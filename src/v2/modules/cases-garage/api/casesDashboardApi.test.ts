import { beforeEach, describe, expect, it, vi } from "vitest";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { casesDashboardApi } from "./casesDashboardApi";

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { get: vi.fn() },
}));

const get = vi.mocked(v2HttpClient.get);
const BASE = "/api/v2/cases-dashboard-garage";

describe("casesDashboardApi", () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ data: {} } as never);
  });

  it("overview gọi đúng route; không truyền tham số thì không gửi param", async () => {
    await casesDashboardApi.getOverview();
    expect(get).toHaveBeenCalledWith(`${BASE}/overview`, { params: {} });
  });

  it("overview gửi date và khoảng ngày, bỏ giá trị rỗng", async () => {
    await casesDashboardApi.getOverview({
      date: "2026-11-18",
      date_from: "2026-11-01",
      date_to: "",
    });
    expect(get).toHaveBeenCalledWith(`${BASE}/overview`, {
      params: { date: "2026-11-18", date_from: "2026-11-01" },
    });
  });

  it("danh sách xe gọi route gốc với bộ lọc và phân trang", async () => {
    await casesDashboardApi.listVehicles({
      date_from: "2026-11-01",
      date_to: "2026-11-30",
      stage: "quotation",
      classification: "SUA_CHUA_CHUNG",
      page: 2,
      pageSize: 20,
    });
    expect(get).toHaveBeenCalledWith(BASE, {
      params: {
        date_from: "2026-11-01",
        date_to: "2026-11-30",
        stage: "quotation",
        classification: "SUA_CHUA_CHUNG",
        page: 2,
        pageSize: 20,
      },
    });
  });

  it("trả về data của response", async () => {
    get.mockResolvedValueOnce({ data: { items: [] } } as never);
    await expect(casesDashboardApi.listVehicles()).resolves.toEqual({
      items: [],
    });
  });
});
