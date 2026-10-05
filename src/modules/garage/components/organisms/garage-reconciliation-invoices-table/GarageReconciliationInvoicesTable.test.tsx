import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageReconciliationInvoicesTable } from "./GarageReconciliationInvoicesTable";
import { buildReconciliationInvoiceColumns } from "./GarageReconciliationInvoicesTable.columns";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

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

vi.mock("@/modules/erp-invoices-core/api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    getColumnOptions: vi
      .fn()
      .mockResolvedValue({ items: [], total: 0, page: 1, totalPages: 1 }),
  },
}));

describe("GarageReconciliationInvoicesTable", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const mockTableState: any = {
    sorts: ["invoiceNo"],
    setSort: vi.fn(),
    columnSearch: {},
    setColumnSearch: vi.fn(),
    columnFilters: {},
    setColumnFilter: vi.fn(),
    activeFilterCount: 0,
    resetFilters: vi.fn(),
  };

  const mockInvoices: ErpInvoice[] = [
    {
      id: "inv-1",
      invoiceNo: "HD001",
      serialNo: "C26TGA",
      invoiceDate: "2026-03-01",
      direction: "OUT",
      status: "APPROVED",
      buyerName: "CÔNG TY ABC",
      licensePlate: "51B12345",
      description: "Sửa chữa xe",
      preVatAmount: "1000000",
      vatAmount: "100000",
      totalAmount: "1100000",
      discountAmount: "0",
    },
  ];

  it("builds columns with correct keys and formats", () => {
    const columns = buildReconciliationInvoiceColumns({
      invoiceDirection: "OUT",
      editMode: true,
      isAllSelected: false,
      selectedMap: {},
      tableState: mockTableState,
      dateFrom: "",
      dateTo: "",
      t: (k: string, def?: string) => def || k,
      onSelectAll: vi.fn(),
      onToggle: vi.fn(),
      onDateFromChange: vi.fn(),
      onDateToChange: vi.fn(),
      onPageReset: vi.fn(),
      onViewDetail: vi.fn(),
      onPreviewPdf: vi.fn(),
    });

    const keys = columns.map((c) => c.key);
    expect(keys).toContain("selection");
    expect(keys).toContain("stt");
    expect(keys).toContain("invoiceDate");
    expect(keys).toContain("invoiceNo");
    expect(keys).toContain("serialNo");
    expect(keys).toContain("partnerName");
    expect(keys).toContain("licensePlate");
    expect(keys).toContain("description");
    expect(keys).toContain("preVatAmount");
    expect(keys).toContain("vatAmount");
    expect(keys).toContain("totalAmount");
  });

  it("renders table with items correctly", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <GarageReconciliationInvoicesTable
          invoiceDirection="OUT"
          items={mockInvoices}
          selectedMap={{}}
          tableState={mockTableState}
          page={1}
          pageSize={50}
          total={1}
          totalPages={1}
          onPageChange={vi.fn()}
          onPageSizeChange={vi.fn()}
          onDateFromChange={vi.fn()}
          onDateToChange={vi.fn()}
          onToggleInvoice={vi.fn()}
          onSelectAllInvoices={vi.fn()}
          onViewInvoiceDetail={vi.fn()}
          onPreviewInvoicePdf={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText("HD001")).toBeInTheDocument();
    expect(screen.getByText("51B12345")).toBeInTheDocument();
  });
});
