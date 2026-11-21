import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { casesDashboardApi } from "../casesDashboardApi";
import { useCasesDashboardOverviewQuery } from "./useCasesDashboardOverviewQuery";
import { useCasesDashboardVehiclesQuery } from "./useCasesDashboardVehiclesQuery";
import { casesDashboardKeys } from "./casesDashboardKeys";

vi.mock("../casesDashboardApi", () => ({
  casesDashboardApi: {
    getOverview: vi.fn(),
    listVehicles: vi.fn(),
  },
}));

const api = vi.mocked(casesDashboardApi);

function wrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe("hook react-query dashboard garage V2", () => {
  beforeEach(() => {
    api.getOverview
      .mockReset()
      .mockResolvedValue({ period: {}, funnel: {} } as never);
    api.listVehicles.mockReset().mockResolvedValue({ items: [] } as never);
  });

  it("overview gọi API với tham số và trả về cả KPI lẫn phễu", async () => {
    const params = { date: "2026-11-18", date_from: "2026-11-01" };
    const { result } = renderHook(
      () => useCasesDashboardOverviewQuery(params),
      {
        wrapper: wrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getOverview).toHaveBeenCalledWith(params);
    expect(result.current.data).toEqual({ period: {}, funnel: {} });
  });

  it("danh sách xe không gọi API khi enabled = false", () => {
    renderHook(() => useCasesDashboardVehiclesQuery({ page: 1 }, false), {
      wrapper: wrapper(),
    });

    expect(api.listVehicles).not.toHaveBeenCalled();
  });

  it("danh sách xe gọi API với đúng tham số trang", async () => {
    const params = { date_from: "2026-11-01", page: 2, pageSize: 20 };
    const { result } = renderHook(
      () => useCasesDashboardVehiclesQuery(params),
      {
        wrapper: wrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.listVehicles).toHaveBeenCalledWith(params);
  });

  it("khóa cache tách theo tham số và theo loại truy vấn", () => {
    const a = casesDashboardKeys.overview({ date_from: "2026-11-01" });
    const b = casesDashboardKeys.overview({ date_from: "2026-10-01" });
    expect(a).not.toEqual(b);
    expect(a[0]).toBe("cases-dashboard-garage");
    expect(casesDashboardKeys.overview()).toEqual(
      casesDashboardKeys.overview({}),
    );
    expect(casesDashboardKeys.vehicles({ page: 1 })).not.toEqual(
      casesDashboardKeys.overview({}),
    );
  });
});
