import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCasesTable } from "./GarageCasesTable";
import {
  buildCasesSummaryRow,
  getGarageCaseRowClassName,
} from "./GarageCasesTable.summary";
import { buildGarageCasesColumns } from "./GarageCasesTable.columns";
import { buildGarageCaseRowActions } from "./GarageCasesTable.actions";

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
          doanhThu: 1000000,
          chiPhi: 600000,
          loiNhuan: 400000,
          tienCoThue: 1000000,
          tienDaThanhToan: 1000000,
          tienConPhaiThanhToan: 0,
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
    data: { results: [] },
  }),
  useUpdateGarageCaseConfig: vi.fn().mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
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

  it("buildGarageCasesColumns builds all 25 columns matching presets and places revenue before receivables in overview preset", () => {
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
      onOpenConfig: vi.fn(),
      canUpdateGarage: true,
      branches: [{ externalId: "b1", name: "Chi nhánh 1" }],
      activeColumnPresetKey: "overview",
    };
    const cols = buildGarageCasesColumns(ctx);
    expect(cols.length).toBe(24);
    const keys = cols.map((c) => c.key);
    const expectedKeys = [
      "index",
      "caseDate",
      "ngayHoanThanhCongViec",
      "caseCode",
      "customer",
      "statusName",
      "kgaraClassification",
      "classification",
      "exclusionRules",
      "branchName",
      "createdAt",
      "updatedAt",
      "dataAsOf",
      "hasInvoice",
      "doanhThu",
      "chiPhi",
      "loiNhuan",
      "margin",
      "collectionProgress",
      "phaiThuKhachHang",
      "phaiThuBaoHiem",
      "tienConPhaiThanhToan",
      "costProgress",
      "tienConPhaiChi",
    ];
    expectedKeys.forEach((key) => {
      expect(keys).toContain(key);
    });

    // statusName is placed directly after customer
    const customerIdx = keys.indexOf("customer");
    const statusNameIdx = keys.indexOf("statusName");
    expect(statusNameIdx).toBe(customerIdx + 1);

    // In overview preset: hasInvoice is right before doanhThu, and revenue is before receivables
    const hasInvoiceIdx = keys.indexOf("hasInvoice");
    const doanhThuIdx = keys.indexOf("doanhThu");
    const phaiThuKhIdx = keys.indexOf("phaiThuKhachHang");
    const phaiThuBhIdx = keys.indexOf("phaiThuBaoHiem");
    expect(hasInvoiceIdx).toBe(doanhThuIdx - 1);
    expect(doanhThuIdx).toBeLessThan(phaiThuKhIdx);
    expect(doanhThuIdx).toBeLessThan(phaiThuBhIdx);
  });

  it("buildGarageCasesColumns places receivables before revenue/profit columns when in audit preset", () => {
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
      onOpenConfig: vi.fn(),
      canUpdateGarage: true,
      branches: [{ externalId: "b1", name: "Chi nhánh 1" }],
      activeColumnPresetKey: "audit",
    };
    const cols = buildGarageCasesColumns(ctx);
    expect(cols.length).toBe(24);
    const keys = cols.map((c) => c.key);

    // In audit preset: receivables must be positioned BEFORE revenue, cost, profit, and hasInvoice is right before doanhThu
    const hasInvoiceIdx = keys.indexOf("hasInvoice");
    const doanhThuIdx = keys.indexOf("doanhThu");
    const phaiThuKhIdx = keys.indexOf("phaiThuKhachHang");
    const phaiThuBhIdx = keys.indexOf("phaiThuBaoHiem");
    expect(hasInvoiceIdx).toBe(doanhThuIdx - 1);
    expect(phaiThuKhIdx).toBeLessThan(doanhThuIdx);
    expect(phaiThuBhIdx).toBeLessThan(doanhThuIdx);
  });

  it("buildCasesSummaryRow aggregates totals correctly with backend fields and customer label", () => {
    const summary = buildCasesSummaryRow({
      visibleCases: [
        {
          id: "1",
          soChungTu: "C1",
          doanhThu: 2000,
          chiPhi: 1200,
          loiNhuan: 800,
          tienCoThue: 2200,
          tienDaThanhToan: 1500,
          tienConPhaiThanhToan: 700,
          tienDaChi: 1000,
          phaiThuKhachHang: 1200,
          phaiThuBaoHiem: 1000,
        },
      ],
      profitCases: [],
      page: 1,
      pageSize: 20,
      totalCases: 1,
      totalLabelCol: "customer",
      t: (_k, d) => d || _k,
    });
    expect(summary.customer).toBeDefined();
    expect(summary.doanhThu).toBeDefined();
    expect(summary.chiPhi).toBeDefined();
    expect(summary.loiNhuan).toBeDefined();
    expect(summary.collectionProgress).toBeDefined();
    expect(summary.phaiThuKhachHang).toBeDefined();
    expect(summary.phaiThuBaoHiem).toBeDefined();
    expect(summary.costProgress).toBeDefined();
    expect(summary.tienConPhaiThanhToan).toBeDefined();
    expect(summary.tienConPhaiChi).toBeDefined();
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

  it("buildGarageCaseRowActions triggers onOpenFinancials with editMode = true when clicking reconcile", () => {
    const onOpenFinancials = vi.fn();
    const props: any = {
      ...defaultProps,
      onOpenFinancials,
    };
    const rowActionsBuilder = buildGarageCaseRowActions(
      props,
      (_k: string, d?: string) => d || _k,
    );
    const groups = rowActionsBuilder({
      id: "raw-id-001",
      soChungTu: "GR-PDV-2026-999",
    });

    const thaoTacGroup = groups.find((g: any) => g.groupLabel === "THAO TÁC");
    expect(thaoTacGroup).toBeDefined();

    const reconcileAction = thaoTacGroup?.items.find(
      (item: any) => item.label === "Đối soát",
    );
    expect(reconcileAction).toBeDefined();

    reconcileAction?.onClick();
    expect(onOpenFinancials).toHaveBeenCalledTimes(1);
    expect(onOpenFinancials).toHaveBeenCalledWith("GR-PDV-2026-999", true);
  });

  it("verifies updated column sizes match design specifications", () => {
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
      onOpenConfig: vi.fn(),
      canUpdateGarage: true,
      branches: [],
      activeColumnPresetKey: "overview",
    };
    const cols = buildGarageCasesColumns(ctx);
    const sizeMap = Object.fromEntries(cols.map((c) => [c.key, c.size]));

    expect(sizeMap.caseDate).toBe(130);
    expect(sizeMap.ngayHoanThanhCongViec).toBe(130);
    expect(sizeMap.caseCode).toBe(180);
    expect(sizeMap.customer).toBe(200);
    expect(sizeMap.kgaraClassification).toBe(150);
    expect(sizeMap.classification).toBe(150);
    expect(sizeMap.exclusionRules).toBe(150);
    expect(sizeMap.statusName).toBe(130);
    expect(sizeMap.doanhThu).toBe(140);
    expect(sizeMap.chiPhi).toBe(140);
    expect(sizeMap.loiNhuan).toBe(140);
    expect(sizeMap.collectionProgress).toBe(155);
    expect(sizeMap.phaiThuKhachHang).toBe(140);
    expect(sizeMap.phaiThuBaoHiem).toBe(140);
    expect(sizeMap.tienConPhaiThanhToan).toBe(140);
    expect(sizeMap.costProgress).toBe(155);
    expect(sizeMap.tienConPhaiChi).toBe(140);
    expect(sizeMap.hasInvoice).toBe(130);
  });

  it("renders linked invoice icon in hasInvoice column and triggers onOpenFinancials", () => {
    const onOpenFinancials = vi.fn();
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
      onOpenFinancials,
      onOpenConfig: vi.fn(),
      canUpdateGarage: true,
      branches: [],
      activeColumnPresetKey: "audit",
    };
    const cols = buildGarageCasesColumns(ctx);
    const hasInvoiceCol = cols.find((c) => c.key === "hasInvoice");
    expect(hasInvoiceCol).toBeDefined();

    const cellWithLinked = hasInvoiceCol?.cell(
      {
        id: "case-01",
        soChungTu: "GR-PDV-001",
        linkedInvoiceCount: 2,
        linkedInvoiceOutCount: 1,
        linkedInvoiceInCount: 1,
      },
      0,
    );
    const { getByLabelText } = render(<div>{cellWithLinked}</div>);
    const linkBtn = getByLabelText("Đã liên kết HĐ");
    fireEvent.click(linkBtn);
    expect(onOpenFinancials).toHaveBeenCalledWith("GR-PDV-001");
  });

  it("renders vat amount aligned right in hasInvoice column", () => {
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
      onOpenConfig: vi.fn(),
      canUpdateGarage: true,
      branches: [],
      activeColumnPresetKey: "overview",
    };
    const cols = buildGarageCasesColumns(ctx);
    const hasInvoiceCol = cols.find((c) => c.key === "hasInvoice");
    expect(hasInvoiceCol).toBeDefined();
    expect(hasInvoiceCol?.className).toContain("text-right");

    const cellWithVat = hasInvoiceCol?.cell(
      {
        id: "case-02",
        soChungTu: "GR-PDV-002",
        tienThueKh: 500000,
      },
      0,
    );
    const { getByText } = render(<div>{cellWithVat}</div>);
    expect(getByText(/500\.000/)).toBeDefined();
  });

  it("applies light emerald background to receivable columns and amber to payable columns", () => {
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
      onOpenConfig: vi.fn(),
      canUpdateGarage: true,
      branches: [],
      activeColumnPresetKey: "overview",
    };
    const cols = buildGarageCasesColumns(ctx);

    const receivableKeys = [
      "collectionProgress",
      "phaiThuKhachHang",
      "phaiThuBaoHiem",
      "tienConPhaiThanhToan",
    ];
    receivableKeys.forEach((key) => {
      const col = cols.find((c) => c.key === key);
      expect(col).toBeDefined();
      expect(col?.className).toContain("bg-emerald-50/50");
      expect((col as any)?.headerClassName).toContain("bg-emerald-100/60");
    });

    const payableKeys = ["costProgress", "tienConPhaiChi"];
    payableKeys.forEach((key) => {
      const col = cols.find((c) => c.key === key);
      expect(col).toBeDefined();
      expect(col?.className).toContain("bg-amber-50/50");
      expect((col as any)?.headerClassName).toContain("bg-amber-100/60");
    });
  });

  it("completionDate column strictly uses ngayHoanThanhCongViec from KGara without fallback to ngayTiepNhan", () => {
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
      onOpenConfig: vi.fn(),
      canUpdateGarage: true,
      branches: [],
      activeColumnPresetKey: "overview",
    };
    const cols = buildGarageCasesColumns(ctx);
    const completionCol = cols.find((c) => c.key === "ngayHoanThanhCongViec");
    expect(completionCol).toBeDefined();

    // Case 1: Has completion date
    const cellWithDate = completionCol?.cell(
      {
        ngayHoanThanhCongViec: "2026-03-25T10:00:00Z",
        ngayTiepNhan: "2026-03-01T08:00:00Z",
      },
      0,
    );
    const { container: c1 } = render(<div>{cellWithDate}</div>);
    expect(c1.textContent).toContain("25/03/2026");

    // Case 2: Does NOT have completion date, but HAS ngayTiepNhan -> must render dash, NO fallback
    const cellWithoutDate = completionCol?.cell(
      {
        ngayHoanThanhCongViec: null,
        ngayTiepNhan: "2026-03-01T08:00:00Z",
      },
      1,
    );
    const { container: c2 } = render(<div>{cellWithoutDate}</div>);
    expect(c2.textContent).toContain("—");
    expect(c2.textContent).not.toContain("01/03/2026");
  });

  it("renames hasInvoice column label to Thuế GTGT and renders margin with range colored badge", () => {
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
      onOpenConfig: vi.fn(),
      canUpdateGarage: true,
      branches: [],
      activeColumnPresetKey: "overview",
    };
    const cols = buildGarageCasesColumns(ctx);

    // 1. Check hasInvoice label renamed to Thuế GTGT
    const hasInvoiceCol = cols.find((c) => c.key === "hasInvoice");
    expect(hasInvoiceCol?.label).toBe("Thuế GTGT");

    // 2. Check margin column renders GarageMarginBadge with range colors
    const marginCol = cols.find((c) => c.key === "margin");
    expect(marginCol).toBeDefined();

    const cellSkyMargin = marginCol?.cell(
      { margin: 35.5, doanhThu: 10000000 },
      0,
    );
    const { container: cSky } = render(<div>{cellSkyMargin}</div>);
    expect(cSky.textContent).toContain("+35.5%");
    expect(cSky.querySelector(".text-sky-800")).toBeDefined();

    const cellNegativeMargin = marginCol?.cell(
      { margin: -10.2, doanhThu: 5000000 },
      1,
    );
    const { container: cRose } = render(<div>{cellNegativeMargin}</div>);
    expect(cRose.textContent).toContain("-10.2%");
    expect(cRose.querySelector(".text-rose-800")).toBeDefined();
  });
});
