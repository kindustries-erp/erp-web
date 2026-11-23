import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { casesDashboardApi } from "../api/casesDashboardApi";
import {
  CASES_LIST_PAGE_SIZE,
  useCasesDashboardGarage,
} from "./useCasesDashboardGarage";

vi.mock("../api/casesDashboardApi", () => ({
  casesDashboardApi: { getOverview: vi.fn(), listVehicles: vi.fn() },
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

describe("useCasesDashboardGarage", () => {
  beforeEach(() => {
    api.getOverview.mockReset().mockResolvedValue({
      period: { month: {} },
      funnel: { overall: {} },
    } as never);
    api.listVehicles.mockReset().mockResolvedValue({ items: [] } as never);
  });

  it("một lần gọi overview cấp cả KPI lẫn phễu; chưa chọn giai đoạn thì không tải danh sách xe", async () => {
    const { result } = renderHook(() => useCasesDashboardGarage(), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(api.getOverview).toHaveBeenCalledTimes(1);
    expect(result.current.kpi).toEqual({ month: {} });
    expect(result.current.funnel).toEqual({ overall: {} });
    expect(api.listVehicles).not.toHaveBeenCalled();
  });

  it("chọn giai đoạn thì tải danh sách xe trang 1 theo giai đoạn đó", async () => {
    const { result } = renderHook(() => useCasesDashboardGarage(), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.openStage("quotation"));

    await waitFor(() =>
      expect(api.listVehicles).toHaveBeenCalledWith({
        stage: "quotation",
        page: 1,
        pageSize: CASES_LIST_PAGE_SIZE,
      }),
    );
    expect(result.current.selectedStage).toBe("quotation");

    act(() => result.current.closeStage());
    expect(result.current.selectedStage).toBeNull();
  });
});
