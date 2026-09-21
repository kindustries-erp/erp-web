import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { InvoiceDebtsExportDrawer } from "../InvoiceDebtsExportDrawer";

const standardTableSpy = vi.fn();
const mockRefetch = vi.fn();
const useQuerySpy = vi.fn();

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
            jobId: "job-debt-1",
            fileName: "Bao_cao_cong_no_khach_hang_2026-09-21.xlsx",
            status: "COMPLETED",
            current: 50,
            total: 50,
            message: "Đã tạo xong file XLSX. Sẵn sàng tải xuống.",
            createdAt: "2026-09-21T10:00:00.000Z",
            expiresAt: "2026-09-22T10:00:00.000Z",
            dateFrom: "2026-09-01",
            dateTo: "2026-09-21",
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
      data-testid="combobox"
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

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

describe("InvoiceDebtsExportDrawer", () => {
  beforeEach(() => {
    standardTableSpy.mockClear();
    useQuerySpy.mockClear();
    mockRefetch.mockClear();
  });

  function renderDrawer(partnerType: "CUSTOMER" | "SUPPLIER" = "CUSTOMER") {
    return render(
      <InvoiceDebtsExportDrawer
        open={true}
        onClose={() => {}}
        initialPartnerType={partnerType}
        buildBaseQuery={() => ({})}
      />,
    );
  }

  it("renders export drawer with period combobox and date pickers", () => {
    renderDrawer();

    const datePickers = screen.getAllByTestId("date-picker");
    expect(datePickers).toHaveLength(2);
    expect(datePickers[0]).toHaveAttribute("data-disabled", "false");
    expect(datePickers[1]).toHaveAttribute("data-disabled", "false");
  });

  it("renders StandardTable with history and correct column config", () => {
    renderDrawer();

    expect(standardTableSpy).toHaveBeenCalled();
    const props = standardTableSpy.mock.calls[0][0];

    expect(props.enableColumnResizing).toBe(true);

    const actionColumn = props.columns[0];
    expect(actionColumn.key).toBe("action");
    expect(actionColumn.size).toBe(40);

    const messageColumn = props.columns.find((c: any) => c.key === "message");
    expect(messageColumn).toBeDefined();
    expect(messageColumn.size).toBe(200);
  });
});
