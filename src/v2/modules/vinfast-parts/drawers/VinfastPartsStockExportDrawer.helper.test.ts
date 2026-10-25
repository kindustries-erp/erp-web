import { describe, expect, it } from "vitest";
import type { VinfastPartsStockExportHistoryItem } from "@/pages/api/vinfastPartsStockExportApi";
import {
  buildPeriodOptions,
  toHistoryViewItem,
  type VinfastExportHistoryLabels,
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

describe("buildPeriodOptions", () => {
  it("wraps monthly options with the all-range and custom entries", () => {
    const options = buildPeriodOptions({
      allRange: "Tất cả",
      customRange: "Tùy chỉnh",
    });
    expect(options[0]).toEqual({ value: "all", label: "Tất cả" });
    expect(options[options.length - 1]).toEqual({
      value: "custom",
      label: "Tùy chỉnh",
    });
    expect(options.length).toBeGreaterThan(2);
  });
});
