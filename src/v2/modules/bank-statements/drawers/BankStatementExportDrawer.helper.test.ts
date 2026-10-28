import { describe, expect, it } from "vitest";
import type { BankStatementExportHistoryItem } from "../api/dtos/bankStatementExport.dto";
import {
  buildExportPayload,
  buildFilterSummary,
  toHistoryViewItem,
  type BankStatementExportHistoryLabels,
} from "./BankStatementExportDrawer.helper";
import { BANK_STATEMENT_EXPORT_DEFAULT_COLUMNS } from "./BankStatementExportDrawer.columns.config";

const basePayload = {
  type: "bank" as const,
  baseQuery: {},
  dateFrom: "2026-03-01",
  dateTo: "2026-03-31",
  accountId: "",
  transactionType: "",
  selectedColumns: ["stt", "cashflowClassification"],
};

describe("buildExportPayload", () => {
  it("theo kỳ: ghi đè khoảng ngày, gắn tài khoản ngân hàng và loại giao dịch", () => {
    const payload = buildExportPayload({
      ...basePayload,
      exportMode: "by-period",
      accountId: "acc-1",
      transactionType: "OUT",
    });

    expect(payload).toEqual({
      sourceType: "BANK",
      startDate: "2026-03-01 00:00:00",
      endDate: "2026-03-31 23:59:59",
      selected_columns: ["stt", "cashflowClassification"],
      bankAccountId: "acc-1",
      transactionType: "OUT",
    });
  });

  it("theo kỳ với sổ quỹ: dùng cashBookId thay cho bankAccountId", () => {
    const payload = buildExportPayload({
      ...basePayload,
      type: "cash",
      exportMode: "by-period",
      accountId: "cb-1",
    });

    expect(payload.sourceType).toBe("CASH");
    expect(payload.cashBookId).toBe("cb-1");
    expect(payload.bankAccountId).toBeUndefined();
  });

  it("theo filter hiện tại: giữ bộ lọc bảng, bỏ phân trang, không ghi đè ngày", () => {
    const payload = buildExportPayload({
      ...basePayload,
      exportMode: "by-current-filter",
      baseQuery: { search: "pos", page: 3, pageSize: 50 },
    });

    expect(payload).toEqual({
      search: "pos",
      sourceType: "BANK",
      selected_columns: ["stt", "cashflowClassification"],
    });
  });
});

describe("buildFilterSummary", () => {
  const labels = {
    accountLabel: "Tài khoản",
    transactionTypeLabel: "Loại giao dịch",
    branchLabel: "Chi nhánh",
    keywordLabel: "Từ khóa",
    allLabel: "Tất cả",
    noKeyword: "Không có",
  };

  it("điền giá trị đang lọc, thiếu thì dùng nhãn Tất cả / Không có", () => {
    const summary = buildFilterSummary(
      { search: " pos ", accountName: "TCB - 111", filterCount: 2 },
      labels,
    );

    expect(summary.filterCount).toBe(2);
    expect(summary.rows).toEqual([
      { label: "Tài khoản", value: "TCB - 111" },
      { label: "Loại giao dịch", value: "Tất cả" },
      { label: "Chi nhánh", value: "Tất cả" },
      { label: "Từ khóa", value: "pos" },
    ]);
  });

  it("không có tóm tắt thì không có bộ lọc", () => {
    const summary = buildFilterSummary(undefined, labels);

    expect(summary.filterCount).toBe(0);
    expect(summary.rows[3]).toEqual({ label: "Từ khóa", value: "Không có" });
  });
});

describe("toHistoryViewItem", () => {
  const labels: BankStatementExportHistoryLabels = {
    allRange: "Tất cả",
    statusReady: "Sẵn sàng tải",
    statusFailed: "Thất bại",
    statusRunning: (percent) => `Đang tạo ${percent}%`,
  };

  const row = (
    overrides: Partial<BankStatementExportHistoryItem>,
  ): BankStatementExportHistoryItem => ({
    jobId: "job-1",
    fileName: "sao_ke.xlsx",
    status: "RUNNING",
    current: 0,
    total: 100,
    message: "",
    createdAt: "2026-03-14T14:01:32.000Z",
    canDownload: false,
    ...overrides,
  });

  it("COMPLETED: sẵn sàng tải theo canDownload", () => {
    const item = toHistoryViewItem(
      row({ status: "COMPLETED", canDownload: true }),
      { jobId: null, current: 0, total: 0 },
      labels,
    );

    expect(item.statusTone).toBe("ready");
    expect(item.statusLabel).toBe("Sẵn sàng tải");
    expect(item.canDownload).toBe(true);
  });

  it("RUNNING: dùng tiến độ SSE khi đúng job", () => {
    const item = toHistoryViewItem(
      row({ current: 10, total: 100 }),
      { jobId: "job-1", current: 50, total: 100 },
      labels,
    );

    expect(item.statusTone).toBe("running");
    expect(item.statusLabel).toBe("Đang tạo 50%");
    expect(item.canDownload).toBe(false);
  });

  it("FAILED: không cho tải", () => {
    const item = toHistoryViewItem(
      row({ status: "FAILED", canDownload: true }),
      { jobId: null, current: 0, total: 0 },
      labels,
    );

    expect(item.statusTone).toBe("failed");
    expect(item.canDownload).toBe(false);
  });
});

describe("BANK_STATEMENT_EXPORT_DEFAULT_COLUMNS", () => {
  it("gồm 25 cột, trong đó có 3 cột phân loại / mục đích / ghi chú và đối tượng", () => {
    expect(BANK_STATEMENT_EXPORT_DEFAULT_COLUMNS).toHaveLength(25);
    expect(BANK_STATEMENT_EXPORT_DEFAULT_COLUMNS).toEqual(
      expect.arrayContaining([
        "cashflowClassification",
        "cashflowPurpose",
        "note",
        "businessPartner",
      ]),
    );
  });
});
