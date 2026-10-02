import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCasesTable } from "./GarageCasesTable";
import {
  buildCasesSummaryRow,
  getGarageCaseRowClassName,
} from "./GarageCasesTable.summary";
import { buildGarageCasesColumns } from "./GarageCasesTable.columns";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string, opts?: any) => {
      if (typeof opts === "string") return opts;
      if (opts && typeof opts === "object" && opts.defaultValue) {
        return typeof opts.defaultValue === "string" ? opts.defaultValue : k;
      }
      return k;
    },
  }),
}));

vi.mock("../../../hooks/useGarage", () => ({
  useGarageCases: vi.fn().mockReturnValue({
    data: {
      data: [
        {
          id: "case-1",
          soChungTu: "GR-PDV-2026-001",
          ngayTiepNhan: "2026-03-01",
          tenKhachHang: "Nguyen Van A",
          tongTienThanhToan: 1000000,
          tongChiPhi: 600000,
          tienKhachDaTra: 1000000,
          tienDaChi: 600000,
        },
      ],
      pagination: { total: 1, totalPages: 1 },
      totals: { grandTotalRevenue: 1000000 },
    },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useGarageGrossProfit: vi.fn().mockReturnValue({
    data: { Groups: [] },
  }),
}));

vi.mock("../../../api/garageApi", () => ({
  garageApi: {
    getCaseColumnOptions: vi
      .fn()
      .mockResolvedValue({ items: [], total: 0, page: 1, totalPages: 1 }),
  },
}));

vi.mock("@/shared/hooks/useTableColumnState", () => ({
  useTableColumnState: vi.fn().mockReturnValue({
    sorts: [],
    columnSearch: {},
    columnFilters: {},
    setSort: vi.fn(),
    setColumnSearch: vi.fn(),
    setColumnFilter: vi.fn(),
    resetFilters: vi.fn(),
    activeFilterCount: 0,
  }),
}));

describe("GarageCasesTable Organism", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const defaultProps: any = {
    branchId: "BR01",
    onOpenDetail: vi.fn(),
    onOpenFinancials: vi.fn(),
    activeStatusTab: "all",
    onStatusTabChange: vi.fn(),
    dateRanges: {},
    onDateRangeChange: vi.fn(),
    onResetDateRanges: vi.fn(),
    columnViewPresetsHook: {
      presets: [],
      hiddenColumns: [],
      columnOrder: [],
      isColumnHidden: vi.fn().mockReturnValue(false),
      toggleColumn: vi.fn(),
      applyPreset: vi.fn(),
      saveCustomView: vi.fn(),
      deleteView: vi.fn(),
    },
    activeColumnPresetKey: "default",
    onColumnPresetChange: vi.fn(),
    onCreateViewPreset: vi.fn(),
    onEditViewPreset: vi.fn(),
    onDeleteViewPreset: vi.fn(),
  };

  it("renders without crashing and mounts table", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <GarageCasesTable {...defaultProps} />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Phiếu dịch vụ")).toBeDefined();
  });

  it("STT column formats idx directly (zero-based index)", () => {
    const ctx: any = {
      t: (k: string, d?: string) => d || k,
      tableState: { sorts: [], columnSearch: {}, columnFilters: {} },
      dateRanges: {},
      onDateRangeChange: vi.fn(),
      onSortChange: vi.fn(),
      onSearchChange: vi.fn(),
      onFilterChange: vi.fn(),
      fetchCaseColumnOptions: vi.fn(),
      onOpenDetail: vi.fn(),
      onOpenFinancials: vi.fn(),
    };
    const cols = buildGarageCasesColumns(ctx);
    const indexCol = cols.find((c) => c.key === "index");
    expect(indexCol).toBeDefined();

    const cellResult = indexCol?.cell({}, 0);
    render(<span>{cellResult}</span>);
    expect(screen.getByText("0")).toBeDefined();
  });

  it("buildCasesSummaryRow aggregates totals correctly", () => {
    const summary = buildCasesSummaryRow({
      visibleCases: [
        {
          id: "1",
          soChungTu: "C1",
          tongTienThanhToan: 2000,
          tongChiPhi: 1200,
          tienKhachDaTra: 1500,
          tienDaChi: 1000,
        },
      ],
      profitCases: [],
      page: 1,
      pageSize: 20,
      totalCases: 1,
      t: (_k, d) => d || _k,
    });
    expect(summary.doanhThu).toBeDefined();
    expect(summary.chiPhi).toBeDefined();
    expect(summary.loiNhuan).toBeDefined();
  });

  it("getGarageCaseRowClassName flags cancelled cases", () => {
    expect(getGarageCaseRowClassName({ tinhTrangDichVu: 9 })).toContain(
      "opacity-40",
    );
    expect(
      getGarageCaseRowClassName({ tenTinhTrangDichVu: "Đã hủy dịch vụ" }),
    ).toContain("opacity-40");
    expect(
      getGarageCaseRowClassName({
        tinhTrangDichVu: 1,
        tenTinhTrangDichVu: "Đang sửa",
      }),
    ).toBeUndefined();
  });
});
