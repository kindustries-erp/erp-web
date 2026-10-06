import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { InvoiceExportDrawer } from "./InvoiceExportDrawer";

const standardTableSpy = vi.fn();
const mockRefetch = vi.fn();
const useQuerySpy = vi.fn();
const startExportExcelBackgroundSpy = vi.fn().mockResolvedValue({
  jobId: "mock-job-123",
  reused: false,
  message: "Started",
});

vi.mock("@/modules/erp-invoices-core/api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    listExportExcelBackgroundHistory: vi.fn(),
    startExportExcelBackground: (...args: any[]) =>
      startExportExcelBackgroundSpy(...args),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || _key,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: (opts: any) => {
    useQuerySpy(opts);
    return {
      data: {
        items: [
          {
            jobId: "job-1",
            fileName: "Bao_cao_hoa_don.xlsx",
            status: "COMPLETED",
            current: 100,
            total: 100,
            message: "Đã tạo xong file XLSX. Sẵn sàng tải xuống.",
            createdAt: "2026-08-05T10:00:00.000Z",
            expiresAt: "2026-08-06T10:00:00.000Z",
            dateFrom: "2026-08-01",
            dateTo: "2026-08-31",
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
      state: {
        data: {
          items: [{ status: "COMPLETED" }],
        },
      },
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
      data-testid="period-combobox"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt: any) => (
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

vi.mock("@/modules/erp-invoices-core/hooks/useInvoiceExportProgress", () => ({
  useInvoiceExportProgress: () => ({
    downloadReadyFile: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock("@/shared/stores/useInvoiceExportProgressStore", () => ({
  useInvoiceExportProgressStore: () => ({
    jobId: "job-1",
    fileName: "Bao_cao_hoa_don.xlsx",
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

describe("InvoiceExportDrawer", () => {
  beforeEach(() => {
    standardTableSpy.mockClear();
    useQuerySpy.mockClear();
    mockRefetch.mockClear();
  });

  function renderDrawer() {
    return render(
      <InvoiceExportDrawer
        open={true}
        onClose={() => {}}
        direction="IN"
        buildBaseQuery={() => ({})}
      />,
    );
  }

  it("keeps date pickers editable even after period selection", () => {
    renderDrawer();

    const period = screen.getByTestId("period-combobox");
    fireEvent.change(period, { target: { value: "2026-08" } });

    const datePickers = screen.getAllByTestId("date-picker");
    expect(datePickers).toHaveLength(2);
    expect(datePickers[0]).toHaveAttribute("data-disabled", "false");
    expect(datePickers[1]).toHaveAttribute("data-disabled", "false");
  });

  it("passes resizable table config with first action column width 40 and message width 200", () => {
    renderDrawer();

    expect(standardTableSpy).toHaveBeenCalled();
    const props = standardTableSpy.mock.calls[0][0];

    expect(props.enableColumnResizing).toBe(true);
    expect(props.actions).toBeUndefined();

    const actionColumn = props.columns[0];
    expect(actionColumn.key).toBe("action");
    expect(actionColumn.size).toBe(40);

    const messageColumn = props.columns.find((c: any) => c.key === "message");
    expect(messageColumn).toBeDefined();
    expect(messageColumn.size).toBe(200);
  });

  it("switches to by-current-filter mode and displays filter summary instead of date pickers", () => {
    render(
      <InvoiceExportDrawer
        open={true}
        onClose={() => {}}
        direction="IN"
        buildBaseQuery={() => ({
          search: "Cong ty ABC",
          status: "APPROVED",
        })}
        currentFilterSummary={{
          dateFrom: "2026-10-01",
          dateTo: "2026-10-31",
          hasActiveFilters: true,
          filterCount: 3,
          search: "Cong ty ABC",
        }}
      />,
    );

    // Initial state: date pickers are present
    expect(screen.getAllByTestId("date-picker")).toHaveLength(2);

    // Find and click the "by-current-filter" radio option
    const radioOptions = screen.getAllByRole("radio");
    expect(radioOptions).toHaveLength(2);
    expect(radioOptions[0]).toBeChecked(); // by-period
    expect(radioOptions[1]).not.toBeChecked(); // by-current-filter

    fireEvent.click(radioOptions[1]);

    // After switching, date pickers are no longer rendered
    expect(screen.queryByTestId("date-picker")).toBeNull();
    expect(screen.queryByTestId("period-combobox")).toBeNull();

    // Summary texts are displayed
    expect(screen.getByText("Cong ty ABC")).toBeInTheDocument();
  });

  it("exports using current filter payload when in by-current-filter mode", async () => {
    startExportExcelBackgroundSpy.mockClear();

    render(
      <InvoiceExportDrawer
        open={true}
        onClose={() => {}}
        direction="OUT"
        buildBaseQuery={() => ({
          search: "Customer XYZ",
          status: "PAID",
          date_from: "2026-10-01T00:00:00",
          date_to: "2026-10-15T23:59:59",
        })}
        currentFilterSummary={{
          dateFrom: "2026-10-01",
          dateTo: "2026-10-15",
          hasActiveFilters: true,
          filterCount: 1,
          search: "Customer XYZ",
        }}
      />,
    );

    // Switch to by-current-filter
    const radioOptions = screen.getAllByRole("radio");
    fireEvent.click(radioOptions[1]);

    // Click start export button
    const exportButton = screen.getByText("Xuất Excel");
    fireEvent.click(exportButton);

    expect(startExportExcelBackgroundSpy).toHaveBeenCalledWith({
      direction: "OUT",
      search: "Customer XYZ",
      status: "PAID",
      date_from: "2026-10-01T00:00:00",
      date_to: "2026-10-15T23:59:59",
    });
  });
});
