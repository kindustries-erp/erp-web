// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GeneralJournalPage } from "../GeneralJournalPage";
import { useQuery } from "@tanstack/react-query";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, def: string) => def || key,
}));

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => ({ setCustomBreadcrumbs: vi.fn() }),
}));

vi.mock("@/shared/hooks/useFilterPanel", () => ({
  useFilterPanel: () => ({
    state: { custom: {} },
    inputs: {},
    setSearchInput: vi.fn(),
  }),
}));

vi.mock("@/modules/erp-invoices-core/components/InvoiceDetailWrapper", () => ({
  InvoiceDetailWrapper: ({ invoiceId }: any) => (
    <div data-testid="invoice-drawer">{invoiceId}</div>
  ),
}));

vi.mock("@/pages/finance/components/BankTransactionDetailDrawer", () => ({
  BankTransactionDetailDrawer: ({ transactionId }: any) => (
    <div data-testid="bank-drawer">{transactionId}</div>
  ),
}));

describe("GeneralJournalPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockJournalData = {
    items: [
      {
        id: "entry-1",
        entryNo: "HD-001",
        date: "2026-07-17",
        documentDate: "2026-07-10",
        reference: "0000123",
        sourceType: "INVOICE",
        sourceId: "inv-1",
        lines: [
          {
            id: "line-1",
            account: { accountCode: "152" },
            debit: 100,
            credit: 0,
            sort: 0,
          },
          {
            id: "line-2",
            account: { accountCode: "331" },
            debit: 0,
            credit: 100,
            sort: 1,
          },
        ],
      },
      {
        id: "entry-2",
        entryNo: "PT-001",
        date: "2026-07-17",
        reference: "PT001",
        sourceType: "BANK",
        sourceId: "bank-1",
        lines: [
          {
            id: "line-3",
            account: { accountCode: "112" },
            debit: 100,
            credit: 0,
            sort: 0,
          },
        ],
      },
    ],
  };

  it("render cột Ngày chứng từ và mapping _documentDate", async () => {
    (useQuery as any).mockImplementation((opts: any) => {
      if (opts.queryKey[0] === "journal-entries")
        return { data: mockJournalData, isFetching: false };
      return { data: [] }; // branches
    });

    render(<GeneralJournalPage />);

    // Check if column header exists
    expect(screen.getByText("Ngày chứng từ")).toBeInTheDocument();

    // Check if document date is rendered correctly (formatted)
    // 2026-07-10 formatting is likely 10/07/2026 based on formatGMT7 logic
    const docs = await screen.findAllByText("10/07/2026");
    expect(docs.length).toBeGreaterThan(0);
  });

  it("click reference mở đúng drawer tương ứng", async () => {
    (useQuery as any).mockImplementation((opts: any) => {
      if (opts.queryKey[0] === "journal-entries")
        return { data: mockJournalData, isFetching: false };
      return { data: [] };
    });

    render(<GeneralJournalPage />);

    // Check invoice reference click
    const invRef = screen.getAllByText("0000123")[0];
    fireEvent.click(invRef);

    await waitFor(() => {
      expect(screen.getByTestId("invoice-drawer")).toHaveTextContent("inv-1");
    });

    // Check bank reference click
    const bankRef = screen.getAllByText("PT001")[0];
    fireEvent.click(bankRef);

    await waitFor(() => {
      expect(screen.getByTestId("bank-drawer")).toHaveTextContent("bank-1");
    });
  });
});
