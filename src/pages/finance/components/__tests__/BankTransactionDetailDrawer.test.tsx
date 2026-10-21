// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BankTransactionDetailDrawer } from "../BankTransactionDetailDrawer";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";

vi.mock("@/shared/components/StandardFormDrawer", () => ({
  StandardFormDrawer: ({ open, title, tabs }: any) => {
    if (!open) return null;
    return (
      <div data-testid="drawer">
        <h1>{title}</h1>
        {tabs && (
          <div data-testid="top-tabs">
            {tabs.map((t: any) => (
              <div key={t.key} data-testid={`tab-${t.key}`}>
                <h3>{t.label}</h3>
                <div data-testid={`tab-${t.key}-content`}>{t.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
  DrawerDocumentTraceability: () => <div data-testid="traceability-mock" />,
  DrawerAuditTimeline: () => <div data-testid="audit-timeline-mock" />,
}));

vi.mock("@/shared/components/accounting/PostingSection", () => ({
  PostingSection: () => <div data-testid="posting-mock" />,
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/modules/bank-statements/api/bankStatementApi", () => ({
  bankStatementApi: {
    getTransaction: vi.fn(),
    getTransactions: vi.fn().mockResolvedValue({ total: 2, items: [] }),
    getTraceabilityGraph: vi.fn().mockResolvedValue({ nodes: [], edges: [] }),
    postTransaction: vi.fn(),
    unpostTransaction: vi.fn(),
    removeInvoice: vi.fn(),
  },
}));

describe("BankTransactionDetailDrawer Facade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("render đúng qua re-export facade", async () => {
    (bankStatementApi.getTransaction as any).mockResolvedValue({
      id: "txn-1",
      sourceType: "BANK",
      transDate: "2026-06-30T00:00:00.000Z",
      referenceNumber: "REF-001",
      description: "Thu tien",
      creditAmount: 100000,
      debitAmount: 0,
      postingStatus: "POSTED",
      bankAccount: { accountingAccountId: "acc-1121" },
      correspondentName: "Cong ty A",
      invoiceNetOffs: [],
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <BankTransactionDetailDrawer
          isOpen={true}
          onClose={() => {}}
          transactionId="txn-1"
        />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("drawer")).toBeTruthy();
      expect(screen.getByTestId("tab-txn_details")).toBeTruthy();
      expect(screen.getByTestId("tab-txn_partner")).toBeTruthy();
      expect(screen.getByTestId("tab-history")).toBeTruthy();
    });
  });
});
