import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { BankStatementExportDrawer } from "./BankStatementExportDrawer";

const standardTableSpy = vi.fn();
const mockRefetch = vi.fn();
const useQuerySpy = vi.fn();
const startExportExcelBackgroundSpy = vi.fn().mockResolvedValue({
  jobId: "mock-job-bank-123",
  reused: false,
  message: "Started",
});

vi.mock("@/modules/bank-statements/api/bankStatementApi", () => ({
  bankStatementApi: {
    listExportExcelHistory: vi.fn(),
    startExportExcelBackground: (...args: any[]) =>
      startExportExcelBackgroundSpy(...args),
  },
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (_key: string, fallbackOrOptions?: any) => {
    if (typeof fallbackOrOptions === "string") return fallbackOrOptions;
    if (fallbackOrOptions?.defaultValue) return fallbackOrOptions.defaultValue;
    return _key;
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: (opts: any) => {
    useQuerySpy(opts);
    return {
      data: {
        items: [
          {
            jobId: "bank-job-1",
            fileName: "Sao_ke_ngan_hang.xlsx",
            status: "COMPLETED",
            current: 100,
            total: 100,
            message: "Đã tạo xong file XLSX. Sẵn sàng tải xuống.",
            createdAt: "2026-10-05T10:00:00.000Z",
            expiresAt: "2026-10-06T10:00:00.000Z",
            dateFrom: "2026-10-01",
            dateTo: "2026-10-31",
            canDownload: true,
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    };
  },
}));

vi.mock("@/shared/components/StandardFormDrawer", () => ({
  StandardFormDrawer: ({ leftPanel, rightPanel }: any) => (
    <div data-testid="drawer-content">
      {leftPanel}
      {rightPanel}
    </div>
  ),
}));

vi.mock("@/shared/components/StandardTable", () => ({
  StandardTable: (props: any) => {
    standardTableSpy(props);
    return <div data-testid="standard-table" />;
  },
}));

vi.mock("@/shared/components/Combobox", () => ({
  Combobox: ({ options, value, onChange }: any) => (
    <select
      data-testid="combobox"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/shared/components/DatePicker", () => ({
  DatePicker: ({ value, onChange, disabled }: any) => (
    <input
      data-testid="date-picker"
      value={value || ""}
      data-disabled={String(Boolean(disabled))}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock("@/shared/components/ui/Button", () => ({
  Button: ({ children, onClick, disabled, ...rest }: any) => (
    <button onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock("@/core/components/ui/Tooltip", () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
}));

vi.mock("@/shared/components/ActionDropdown", () => ({
  ActionDropdown: ({ items }: any) => (
    <button data-testid="action-dropdown">{items?.[0]?.label}</button>
  ),
}));

vi.mock(
  "@/modules/bank-statements/hooks/useBankStatementExportProgress",
  () => ({
    useBankStatementExportProgress: () => ({
      downloadReadyFile: vi.fn().mockResolvedValue(undefined),
    }),
  }),
);

vi.mock("@/shared/stores/useBankStatementExportProgressStore", () => ({
  useBankStatementExportProgressStore: () => ({
    jobId: "bank-job-1",
    fileName: "Sao_ke_ngan_hang.xlsx",
    current: 100,
    total: 100,
    isRunning: false,
    completed: true,
    ready: true,
    failed: false,
    message: "Đã tạo xong file XLSX. Sẵn sàng tải xuống.",
    sseConnected: true,
    lastEventAt: Date.now(),
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("BankStatementExportDrawer", () => {
  beforeEach(() => {
    standardTableSpy.mockClear();
    useQuerySpy.mockClear();
    mockRefetch.mockClear();
    startExportExcelBackgroundSpy.mockClear();
  });

  function renderDrawer(extraProps: any = {}) {
    return render(
      <BankStatementExportDrawer
        open={true}
        onClose={() => {}}
        type="bank"
        accountsData={[
          {
            id: "acc-1",
            bankCode: "TCB",
            accountNumber: "111888",
            accountName: "LIOUNI",
          },
        ]}
        {...extraProps}
      />,
    );
  }

  it("renders with period and date pickers in default by-period mode", () => {
    renderDrawer();

    const datePickers = screen.getAllByTestId("date-picker");
    expect(datePickers).toHaveLength(2);

    const radioOptions = screen.getAllByRole("radio");
    expect(radioOptions).toHaveLength(2);
    expect(radioOptions[0]).toBeChecked(); // by-period
    expect(radioOptions[1]).not.toBeChecked(); // by-current-filter
  });

  it("switches to by-current-filter mode and shows filter preview instead of date pickers", () => {
    renderDrawer({
      currentFilterSummary: {
        dateFrom: "2026-10-01",
        dateTo: "2026-10-31",
        search: "Cong ty ABC",
        accountName: "TCB - 111888",
        transactionType: "IN",
        hasActiveFilters: true,
        filterCount: 3,
      },
    });

    const radioOptions = screen.getAllByRole("radio");
    fireEvent.click(radioOptions[1]);

    // In by-current-filter mode, date pickers are hidden
    expect(screen.queryByTestId("date-picker")).toBeNull();

    // Summary texts are shown
    expect(screen.getByText("Cong ty ABC")).toBeInTheDocument();
    expect(screen.getByText("TCB - 111888")).toBeInTheDocument();
  });

  it("submits export with current filter payload when in by-current-filter mode", async () => {
    renderDrawer({
      buildBaseQuery: () => ({
        sourceType: "BANK",
        search: "Cong ty ABC",
        bankAccountId: "acc-1",
        startDate: "2026-10-01 00:00:00",
        endDate: "2026-10-31 23:59:59",
      }),
      currentFilterSummary: {
        search: "Cong ty ABC",
      },
    });

    // Switch to by-current-filter
    const radioOptions = screen.getAllByRole("radio");
    fireEvent.click(radioOptions[1]);

    // Click Export
    const exportBtn = screen.getByText("Xuất Excel");
    fireEvent.click(exportBtn);

    expect(startExportExcelBackgroundSpy).toHaveBeenCalledWith({
      sourceType: "BANK",
      search: "Cong ty ABC",
      bankAccountId: "acc-1",
      startDate: "2026-10-01 00:00:00",
      endDate: "2026-10-31 23:59:59",
    });
  });

  it("displays column filters and branch name in filter preview", () => {
    renderDrawer({
      currentFilterSummary: {
        hasActiveFilters: true,
        filterCount: 3,
        branchName: "Chi nhánh Nam Sài Gòn",
        columnFiltersSummary: [
          {
            columnKey: "description",
            columnLabel: "Nội dung giao dịch",
            displayValue: '"TT POS VinFast"',
          },
          {
            columnKey: "transactionType",
            columnLabel: "Loại giao dịch",
            displayValue: "Tiền vào",
          },
        ],
      },
    });

    const radioOptions = screen.getAllByRole("radio");
    fireEvent.click(radioOptions[1]);

    // Checks for branch name badge
    expect(screen.getByText("Chi nhánh:")).toBeInTheDocument();
    expect(screen.getByText("Chi nhánh Nam Sài Gòn")).toBeInTheDocument();

    // Checks for column filter badges
    expect(screen.getByText("Nội dung giao dịch:")).toBeInTheDocument();
    expect(screen.getByText('"TT POS VinFast"')).toBeInTheDocument();
    expect(screen.getByText("Loại giao dịch:")).toBeInTheDocument();
    expect(screen.getByText("Tiền vào")).toBeInTheDocument();

    // Check for 'Tất cả thời gian' when dates are omitted
    expect(screen.getByText("Tất cả thời gian")).toBeInTheDocument();
  });

  it("renders both values and search filters on the same column without duplicate key warning", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderDrawer({
      currentFilterSummary: {
        hasActiveFilters: true,
        filterCount: 2,
        columnFiltersSummary: [
          {
            id: "description-values",
            columnKey: "description",
            columnLabel: "Nội dung giao dịch",
            displayValue: "TT POS",
            type: "values",
          },
          {
            id: "description-search",
            columnKey: "description",
            columnLabel: "Nội dung giao dịch (từ khóa)",
            displayValue: '"VinFast"',
            type: "search",
          },
        ],
      },
    });

    const radioOptions = screen.getAllByRole("radio");
    fireEvent.click(radioOptions[1]);

    // Expect both badges to render
    expect(screen.getByText("Nội dung giao dịch:")).toBeInTheDocument();
    expect(screen.getByText("TT POS")).toBeInTheDocument();
    expect(
      screen.getByText("Nội dung giao dịch (từ khóa):"),
    ).toBeInTheDocument();
    expect(screen.getByText('"VinFast"')).toBeInTheDocument();

    // Verify no React duplicate key warnings were emitted
    const duplicateKeyWarnings = consoleErrorSpy.mock.calls.filter((call) =>
      call.some(
        (arg) =>
          typeof arg === "string" &&
          arg.includes("Encountered two children with the same key"),
      ),
    );
    expect(duplicateKeyWarnings).toHaveLength(0);

    consoleErrorSpy.mockRestore();
  });
});
