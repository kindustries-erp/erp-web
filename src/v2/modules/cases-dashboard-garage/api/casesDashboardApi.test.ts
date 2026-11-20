import { beforeEach, describe, expect, it, vi } from "vitest";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { casesDashboardApi } from "./casesDashboardApi";

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { get: vi.fn() },
}));

const get = vi.mocked(v2HttpClient.get);

describe("casesDashboardApi", () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ data: {} } as never);
  });

  it("period-kpis gọi đúng route; không truyền date thì không gửi param", async () => {
    await casesDashboardApi.getPeriodKpis();

    expect(get).toHaveBeenCalledWith(
      "/api/v2/cases-dashboard-garage/period-kpis",
      {
        params: {},
      },
    );
  });

  it("period-kpis gửi date khi có", async () => {
    await casesDashboardApi.getPeriodKpis("2026-11-18");

    expect(get).toHaveBeenCalledWith(
      "/api/v2/cases-dashboard-garage/period-kpis",
      {
        params: { date: "2026-11-18" },
      },
    );
  });

  it("funnel gửi khoảng ngày và bỏ giá trị rỗng", async () => {
    await casesDashboardApi.getFunnel({ date_from: "2026-11-01", date_to: "" });

    expect(get).toHaveBeenCalledWith("/api/v2/cases-dashboard-garage/funnel", {
      params: { date_from: "2026-11-01" },
    });
  });

  it("cases gửi bộ lọc giai đoạn, phân loại và phân trang", async () => {
    await casesDashboardApi.listCases({
      date_from: "2026-11-01",
      date_to: "2026-11-30",
      stage: "quotation",
      classification: "OJ_NGOAI",
      page: 2,
      pageSize: 50,
    });

    expect(get).toHaveBeenCalledWith("/api/v2/cases-dashboard-garage/cases", {
      params: {
        date_from: "2026-11-01",
        date_to: "2026-11-30",
        stage: "quotation",
        classification: "OJ_NGOAI",
        page: 2,
        pageSize: 50,
      },
    });
  });

  it("trả về đúng data từ HTTP client", async () => {
    get.mockResolvedValueOnce({ data: { items: [], pagination: {} } } as never);

    await expect(casesDashboardApi.listCases()).resolves.toEqual({
      items: [],
      pagination: {},
    });
  });
});
