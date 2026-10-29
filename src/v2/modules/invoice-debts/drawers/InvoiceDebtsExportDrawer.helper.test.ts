import { describe, expect, it } from "vitest";
import {
  buildExportPayload,
  buildFilterSummary,
  toDisplayDate,
  toDisplayRange,
  toHistoryViewItem,
} from "./InvoiceDebtsExportDrawer.helper";
import type { InvoiceDebtExportHistoryItem } from "../api/dtos/invoiceDebtsExport.dto";

describe("InvoiceDebtsExportDrawer.helper", () => {
  describe("toDisplayDate", () => {
    it("returns - for empty or invalid input", () => {
      expect(toDisplayDate()).toBe("-");
      expect(toDisplayDate("invalid-date")).toBe("-");
    });

    it("formats valid ISO date string correctly", () => {
      expect(toDisplayDate("2026-10-26T10:30:00.000Z")).toContain("26/10/2026");
    });
  });

  describe("toDisplayRange", () => {
    it("returns - when both dates are missing", () => {
      expect(toDisplayRange()).toBe("-");
    });

    it("formats range with both dates", () => {
      const range = toDisplayRange(
        "2026-01-01T12:00:00.000Z",
        "2026-01-31T12:00:00.000Z",
      );
      expect(range).toContain("01/01/2026");
      expect(range).toContain("31/01/2026");
    });
  });

  describe("buildExportPayload", () => {
    it("builds payload for by-period mode overriding date_from and date_to", () => {
      const payload = buildExportPayload({
        exportMode: "by-period",
        baseQuery: { search: "test" },
        partnerType: "CUSTOMER",
        dateFrom: "2026-02-01",
        dateTo: "2026-02-28",
        selectedColumns: ["stt", "taxCode"],
      });

      expect(payload).toEqual({
        search: "test",
        partner_type: "CUSTOMER",
        date_from: "2026-02-01",
        date_to: "2026-02-28",
        selectedColumns: ["stt", "taxCode"],
      });
    });

    it("builds payload for by-current-filter keeping base dates", () => {
      const payload = buildExportPayload({
        exportMode: "by-current-filter",
        baseQuery: { search: "test", date_from: "2025-12-01" },
        partnerType: undefined,
        dateFrom: "2026-02-01",
        dateTo: "2026-02-28",
        selectedColumns: ["stt"],
      });

      expect(payload).toEqual({
        search: "test",
        date_from: "2025-12-01",
        partner_type: undefined,
        selectedColumns: ["stt"],
      });
    });
  });

  describe("buildFilterSummary", () => {
    const labels = {
      partnerAll: "Tất cả",
      partnerCustomer: "Khách hàng",
      partnerSupplier: "Nhà cung cấp",
      noKeyword: "Không có",
      keywordLabel: "Từ khóa",
      partnerTypeLabel: "Đối tượng",
    };

    it("creates filter summary with ALL partners", () => {
      const summary = buildFilterSummary({}, undefined, labels);
      expect(summary.rows).toEqual([
        { label: "Đối tượng", value: "Tất cả" },
        { label: "Từ khóa", value: "Không có" },
      ]);
      expect(summary.filterCount).toBe(0);
    });

    it("creates filter summary with CUSTOMER and search keyword", () => {
      const summary = buildFilterSummary(
        {
          search: "VinFast",
          column_filters: JSON.stringify({ status: "ACTIVE" }),
        },
        "CUSTOMER",
        labels,
      );
      expect(summary.rows).toEqual([
        { label: "Đối tượng", value: "Khách hàng" },
        { label: "Từ khóa", value: "VinFast" },
      ]);
      expect(summary.filterCount).toBe(3); // partner + keyword + 1 column filter
    });
  });

  describe("toHistoryViewItem", () => {
    const labels = {
      allRange: "Tất cả",
      statusReady: "Sẵn sàng tải",
      statusFailed: "Thất bại",
      statusRunning: (pct: number) => `Đang tạo ${pct}%`,
    };

    it("maps COMPLETED row to ready view item", () => {
      const row: InvoiceDebtExportHistoryItem = {
        jobId: "job-1",
        fileName: "report.xlsx",
        status: "COMPLETED",
        current: 100,
        total: 100,
        message: "Done",
        createdAt: "2026-10-26T10:00:00.000Z",
        canDownload: true,
      };

      const item = toHistoryViewItem(row, labels);
      expect(item.id).toBe("job-1");
      expect(item.statusTone).toBe("ready");
      expect(item.statusLabel).toBe("Sẵn sàng tải");
      expect(item.canDownload).toBe(true);
    });

    it("maps RUNNING row with percentage", () => {
      const row: InvoiceDebtExportHistoryItem = {
        jobId: "job-2",
        fileName: "report.xlsx",
        status: "RUNNING",
        current: 30,
        total: 100,
        message: "Processing",
        createdAt: "2026-10-26T10:00:00.000Z",
        canDownload: false,
      };

      const item = toHistoryViewItem(row, labels);
      expect(item.statusTone).toBe("running");
      expect(item.statusLabel).toBe("Đang tạo 30%");
    });

    it("maps FAILED row with error message", () => {
      const row: InvoiceDebtExportHistoryItem = {
        jobId: "job-3",
        fileName: "report.xlsx",
        status: "FAILED",
        current: 0,
        total: 100,
        message: "DB connection timeout",
        createdAt: "2026-10-26T10:00:00.000Z",
        canDownload: false,
      };

      const item = toHistoryViewItem(row, labels);
      expect(item.statusTone).toBe("failed");
      expect(item.statusLabel).toBe("DB connection timeout");
    });
  });
});
