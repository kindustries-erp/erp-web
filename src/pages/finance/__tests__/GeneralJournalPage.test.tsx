// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GeneralJournalPage } from "../GeneralJournalPage";
import { useQuery } from "@tanstack/react-query";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useInfiniteQuery: vi.fn().mockReturnValue({
    data: { pages: [{ items: [] }] },
    isLoading: false,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  }),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, def: string) => def || key,
}));

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => ({ setCustomBreadcrumbs: vi.fn(), locale: "vi" }),
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
    total: 2,
    page: 1,
    pageSize: 50,
    totalPages: 1,
  };

  it("render cột Ngày chứng từ, STT và mapping _documentDate", async () => {
    (useQuery as any).mockImplementation((opts: any) => {
      if (opts.queryKey[0] === "journal-entries")
        return { data: mockJournalData, isLoading: false, isFetching: false };
      return { data: [] };
    });

    render(<GeneralJournalPage />);

    // Check header exists
    expect(screen.getByText("Ngày chứng từ")).toBeInTheDocument();
    expect(screen.getByText("#")).toBeInTheDocument();
    expect(screen.getByText("Số CT")).toBeInTheDocument();

    // Check STT 1-based index (1, 2, 3)
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    // Check if document date is rendered correctly
    const docs = await screen.findAllByText("10/07/2026");
    expect(docs.length).toBeGreaterThan(0);
  });

  it("click reference mở đúng drawer tương ứng", async () => {
    (useQuery as any).mockImplementation((opts: any) => {
      if (opts.queryKey[0] === "journal-entries")
        return { data: mockJournalData, isLoading: false, isFetching: false };
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

  it("render Toolbar PillTabs với 4 nhóm nguồn chứng từ", () => {
    (useQuery as any).mockImplementation(() => ({
      data: mockJournalData,
      isLoading: false,
      isFetching: false,
    }));

    render(<GeneralJournalPage />);

    expect(screen.getByText("Tất cả")).toBeInTheDocument();
    expect(screen.getByText("Dòng tiền")).toBeInTheDocument();
    expect(screen.getByText("Hóa đơn")).toBeInTheDocument();
    expect(screen.getByText("Khác")).toBeInTheDocument();
  });

  it("render SubtotalSummaryCell trong summaryRow và mở popover đối soát cân đối Nợ - Có", async () => {
    (useQuery as any).mockImplementation((opts: any) => {
      if (opts.queryKey[0] === "journal-entries")
        return { data: mockJournalData, isLoading: false, isFetching: false };
      return { data: [] };
    });

    render(<GeneralJournalPage />);

    // Kiểm tra label "Tổng cộng:"
    expect(screen.getByText("Tổng cộng:")).toBeInTheDocument();

    // Click trigger tiền Nợ trong summaryRow (total debit = 200, total credit = 100 -> Lệch +100 đ)
    const debitTriggers = screen.getAllByText(/200/);
    expect(debitTriggers.length).toBeGreaterThan(0);
    fireEvent.click(debitTriggers[debitTriggers.length - 1]);

    // Popover hiển thị Đối soát Cân đối Kế toán
    expect(screen.getByText("Đối soát Cân đối Kế toán")).toBeInTheDocument();
    expect(
      screen.getAllByText("Tổng phát sinh Nợ").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("Tổng phát sinh Có").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Lệch Nợ - Có/)).toBeInTheDocument();
  });
});
