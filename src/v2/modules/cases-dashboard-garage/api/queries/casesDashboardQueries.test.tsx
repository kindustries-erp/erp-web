import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { casesDashboardApi } from "../casesDashboardApi";
import { useCasesDashboardPeriodKpisQuery } from "./useCasesDashboardPeriodKpisQuery";
import { useCasesDashboardFunnelQuery } from "./useCasesDashboardFunnelQuery";
import { useCasesDashboardCasesQuery } from "./useCasesDashboardCasesQuery";
import { casesDashboardKeys } from "./casesDashboardKeys";

vi.mock("../casesDashboardApi", () => ({
  casesDashboardApi: {
    getPeriodKpis: vi.fn(),
    getFunnel: vi.fn(),
    listCases: vi.fn(),
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
    api.getPeriodKpis.mockReset().mockResolvedValue({ month: {} } as never);
    api.getFunnel.mockReset().mockResolvedValue({ overall: {} } as never);
    api.listCases.mockReset().mockResolvedValue({ items: [] } as never);
  });

  it("KPI kỳ gọi API với ngày gốc và trả về dữ liệu", async () => {
    const { result } = renderHook(
      () => useCasesDashboardPeriodKpisQuery("2026-11-18"),
      { wrapper: wrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getPeriodKpis).toHaveBeenCalledWith("2026-11-18");
    expect(result.current.data).toEqual({ month: {} });
  });

  it("phễu gọi API với khoảng ngày", async () => {
    const params = { date_from: "2026-11-01", date_to: "2026-11-30" };
    const { result } = renderHook(() => useCasesDashboardFunnelQuery(params), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getFunnel).toHaveBeenCalledWith(params);
  });

  it("danh sách lệnh không gọi API khi enabled = false", () => {
    renderHook(() => useCasesDashboardCasesQuery({ page: 1 }, false), {
      wrapper: wrapper(),
    });

    expect(api.listCases).not.toHaveBeenCalled();
  });

  it("danh sách lệnh gọi API với đúng tham số trang", async () => {
    const params = { date_from: "2026-11-01", page: 2, pageSize: 20 };
    const { result } = renderHook(() => useCasesDashboardCasesQuery(params), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.listCases).toHaveBeenCalledWith(params);
  });

  it("khóa cache tách theo tham số (đổi khoảng ngày là khóa khác)", () => {
    const a = casesDashboardKeys.funnel({ date_from: "2026-11-01" });
    const b = casesDashboardKeys.funnel({ date_from: "2026-10-01" });
    expect(a).not.toEqual(b);
    expect(a[0]).toBe("cases-dashboard-garage");
    expect(casesDashboardKeys.periodKpis()).toEqual(
      casesDashboardKeys.periodKpis(undefined),
    );
  });
});
