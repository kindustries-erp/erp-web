import { describe, expect, it } from "vitest";
import type { VinfastPartsStockExportHistoryItem } from "../api/dtos/vinfastStockExport.dto";
import {
  buildExportPayload,
  buildFilterSummary,
  toHistoryViewItem,
  type VinfastExportHistoryLabels,
  type VinfastFilterSummaryLabels,
} from "./VinfastPartsStockExportDrawer.helper";

const labels: VinfastExportHistoryLabels = {
  allRange: "Tất cả",
  statusReady: "Sẵn sàng tải",
  statusFailed: "Thất bại",
  statusRunning: (percent) => `Đang tạo ${percent}%`,
};

const row = (
  overrides: Partial<VinfastPartsStockExportHistoryItem>,
): VinfastPartsStockExportHistoryItem => ({
  jobId: "job-1",
  fileName: "bao-cao.xlsx",
  status: "COMPLETED",
  current: 0,
  total: 0,
  message: "",
  createdAt: "2026-10-25T02:00:00.000Z",
  canDownload: true,
  ...overrides,
});

describe("toHistoryViewItem", () => {
  it("marks completed rows as ready and downloadable", () => {
    const item = toHistoryViewItem(
      row({ dateFrom: "2026-03-01", dateTo: "2026-03-31" }),
      { jobId: null, current: 0, total: 0 },
      labels,
    );
    expect(item.statusTone).toBe("ready");
    expect(item.statusLabel).toBe("Sẵn sàng tải");
    expect(item.canDownload).toBe(true);
    expect(item.periodLabel).toBe("01/03/2026 - 31/03/2026");
  });

  it("falls back to the all-range label when no dates are set", () => {
    const item = toHistoryViewItem(
      row({}),
      { jobId: null, current: 0, total: 0 },
      labels,
    );
    expect(item.periodLabel).toBe("Tất cả");
  });

  it("prefers live SSE progress when the running job matches", () => {
    const item = toHistoryViewItem(
      row({ status: "RUNNING", canDownload: false, current: 1, total: 10 }),
      { jobId: "job-1", current: 5, total: 10 },
      labels,
    );
    expect(item.statusTone).toBe("running");
    expect(item.statusLabel).toBe("Đang tạo 50%");
    expect(item.canDownload).toBe(false);
  });

  it("uses stored progress when the live event belongs to another job", () => {
    const item = toHistoryViewItem(
      row({ status: "RUNNING", canDownload: false, current: 2, total: 4 }),
      { jobId: "job-other", current: 9, total: 10 },
      labels,
    );
    expect(item.statusLabel).toBe("Đang tạo 50%");
  });

  it("marks failed rows as failed and not downloadable", () => {
    const item = toHistoryViewItem(
      row({ status: "FAILED", canDownload: true }),
      { jobId: null, current: 0, total: 0 },
      labels,
    );
    expect(item.statusTone).toBe("failed");
    expect(item.canDownload).toBe(false);
  });
});

describe("buildExportPayload", () => {
  const baseQuery = { vehicleType: "oto", search: "lọc" };
  const columns = ["sku", "amount"];

  it("overrides the table range with the selected period in by-period mode", () => {
    expect(
      buildExportPayload({
        exportMode: "by-period",
        baseQuery,
        dateFrom: "2026-10-01",
        dateTo: "2026-10-31",
        selectedColumns: columns,
      }),
    ).toEqual({
      vehicleType: "oto",
      search: "lọc",
      dateFrom: "2026-10-01",
      dateTo: "2026-10-31",
      selectedColumns: columns,
    });
  });

  it("keeps the table query and sends no period override in current-filter mode", () => {
    const payload = buildExportPayload({
      exportMode: "by-current-filter",
      baseQuery: { ...baseQuery, dateFrom: "2026-09-01" },
      dateFrom: "2026-10-01",
      dateTo: "2026-10-31",
      selectedColumns: columns,
    });
    expect(payload.dateFrom).toBe("2026-09-01");
    expect(payload.dateTo).toBeUndefined();
    expect(payload.selectedColumns).toEqual(columns);
  });
});

describe("buildFilterSummary", () => {
  const labels: VinfastFilterSummaryLabels = {
    vehicleTypeLabel: "Loại xe",
    vehicleTypeAll: "Tất cả",
    vehicleTypeCar: "Ô tô",
    vehicleTypeMotorbike: "Xe máy",
    keywordLabel: "Từ khóa",
    noKeyword: "Không có",
  };

  it("maps vehicle type and keyword into summary rows", () => {
    const summary = buildFilterSummary(
      { vehicleType: "xemay", search: " sku1 " },
      labels,
    );
    expect(summary.rows).toEqual([
      { label: "Loại xe", value: "Xe máy" },
      { label: "Từ khóa", value: "sku1" },
    ]);
    expect(summary.filterCount).toBe(1);
  });

  it("counts only column filters that have values", () => {
    const summary = buildFilterSummary(
      {
        vehicleType: undefined,
        columnFilters: JSON.stringify({ sku: ["A"], name: [], uom: "" }),
      },
      labels,
    );
    expect(summary.rows[0].value).toBe("Tất cả");
    expect(summary.rows[1].value).toBe("Không có");
    expect(summary.filterCount).toBe(1);
  });

  it("returns zero filters for malformed column filter JSON", () => {
    expect(
      buildFilterSummary({ columnFilters: "{bad" }, labels).filterCount,
    ).toBe(0);
  });
});
