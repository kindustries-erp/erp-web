import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { garageApi } from "@/modules/garage/api/garageApi";
import { GarageMonthClassificationCasesDrawer } from "./GarageMonthClassificationCasesDrawer";

vi.mock("@/modules/garage/api/garageApi", () => ({
  garageApi: {
    getCases: vi.fn().mockResolvedValue({
      data: [],
      pagination: { total: 0, page: 1, pageSize: 20 },
    }),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_k: string, def?: string) => def || _k }),
}));

function renderDrawer(props: Record<string, unknown>) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <GarageMonthClassificationCasesDrawer
        open
        onClose={vi.fn()}
        monthLabel="Quá hạn 31-60 ngày"
        filterType="CLASSIFICATION"
        filterKey="SUA_CHUA_CHUNG"
        filterLabel="Sửa chữa chung"
        activeTab="RECEIPT"
        branchId="branch-01"
        {...props}
      />
    </QueryClientProvider>,
  );
}

function lastServerFilters(): Record<string, string[]> {
  const calls = vi.mocked(garageApi.getCases).mock.calls;
  const raw = calls[calls.length - 1]?.[6] as string | undefined;
  return raw ? JSON.parse(raw) : {};
}

describe("GarageMonthClassificationCasesDrawer: drill-down theo mốc", () => {
  beforeEach(() => {
    vi.mocked(garageApi.getCases).mockClear();
  });

  it("mốc: lọc theo agingHorizon và mốc đối soát, không lọc theo khoảng tháng", async () => {
    renderDrawer({ horizon: "overdue31To60", month: undefined });
    await waitFor(() => expect(garageApi.getCases).toHaveBeenCalled());
    const filters = lastServerFilters();
    expect(filters.agingHorizon).toEqual(["overdue31To60"]);
    expect(filters.ngayHoanThanhCongViec).toEqual(["2026-07-01.."]);
    expect(filters.statusTab).toEqual(["completed"]);
  });

  it("tháng: giữ khoảng ngày của tháng, không có agingHorizon", async () => {
    renderDrawer({ month: "2026-10" });
    await waitFor(() => expect(garageApi.getCases).toHaveBeenCalled());
    const filters = lastServerFilters();
    expect(filters.agingHorizon).toBeUndefined();
    expect(filters.ngayHoanThanhCongViec).toEqual(["2026-10-01..2026-10-31"]);
  });
});
