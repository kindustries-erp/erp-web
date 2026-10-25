// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BankTransactionDetailDrawer } from "../BankTransactionDetailDrawer";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";

vi.mock("@/shared/components/StandardFormDrawer", () => ({
  StandardFormDrawer: ({
    open,
    leftPanel,
    rightPanel,
    rightPanelTitle,
    title,
    onToggleEdit,
    panelClassName,
    layout,
    size,
    tabs,
  }: any) => {
    if (!open) return null;
    return (
      <div
        data-testid="drawer"
        data-panel-class={panelClassName || ""}
        data-layout={layout || ""}
        data-size={size || ""}
      >
        <h1>{title}</h1>
        {onToggleEdit && (
          <button type="button" onClick={onToggleEdit}>
            Chỉnh sửa
          </button>
        )}
        <div>{leftPanel}</div>
        {rightPanelTitle && <div>{rightPanelTitle}</div>}
        <div data-testid="drawer-right-panel">{rightPanel}</div>
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
  PostingSection: ({ postingState }: any) => (
    <pre data-testid="posting-lines">{JSON.stringify(postingState.lines)}</pre>
  ),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/modules/bank-statements/api/bankStatementApi", () => ({
  bankStatementApi: {
    getTransaction: vi.fn(),
    getTransactions: vi.fn().mockResolvedValue({ total: 5, items: [] }),
    getTraceabilityGraph: vi.fn().mockResolvedValue({ nodes: [], edges: [] }),
    postTransaction: vi.fn(),
    unpostTransaction: vi.fn(),
    removeInvoice: vi.fn(),
    linkInvoice: vi.fn(),
  },
}));

describe("BankTransactionDetailDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDrawer = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
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
  };

  const resolveDrawer = () => screen.getByTestId("drawer");

  it("render 3 Top Tabs chuẩn erp-invoice: Chi tiết, Chi tiết theo đối tác, Lịch sử & Kiểm duyệt", async () => {
    (bankStatementApi.getTransaction as any).mockResolvedValue({
      id: "txn-1",
      sourceType: "BANK",
      transDate: "2026-06-30T00:00:00.000Z",
      referenceNumber: "REF-001",
      description: "Thu tien khach hang",
      creditAmount: 23452,
      debitAmount: 0,
      postingStatus: "POSTED",
      bankAccount: { accountingAccountId: "acc-1121" },
      branch: { name: "Chi nhánh A" },
      correspondentName: "Công ty ABC",
      correspondentAccount: "123456789",
      invoiceNetOffs: [],
    });

    renderDrawer();

    await waitFor(() => {
      expect(screen.getByTestId("tab-txn_details")).toBeTruthy();
      expect(screen.getByTestId("tab-txn_partner")).toBeTruthy();
      expect(screen.getByTestId("tab-history")).toBeTruthy();
      expect(screen.getByText("Chi tiết theo đối tác")).toBeTruthy();
      expect(screen.getByText("Lịch sử & Kiểm duyệt")).toBeTruthy();
    });

    // Kiểm tra sub-nav pills trong tab Chi tiết
    expect(screen.getByText("1. Chi tiết giao dịch")).toBeTruthy();
    expect(screen.getByText("2. Hạch toán kế toán")).toBeTruthy();
    expect(screen.getByText("3. Chứng từ liên kết")).toBeTruthy();
  });

  it("auto tạo dòng đối ứng cho giao dịch tiền vào, để trống tài khoản đối ứng", async () => {
    (bankStatementApi.getTransaction as any).mockResolvedValue({
      id: "txn-1",
      sourceType: "BANK",
      transDate: "2026-06-30T00:00:00.000Z",
      referenceNumber: "REF-001",
      description: "Thu tien khach hang",
      note: "Thu tien khach hang",
      creditAmount: 23452,
      debitAmount: 0,
      postingStatus: "UNPOSTED",
      bankAccount: { accountingAccountId: "acc-1121" },
      branch: { name: "Chi nhánh A" },
      cashBook: null,
      correspondentName: "Công ty ABC",
      correspondentAccount: "123456789",
      correspondentBank: "Eximbank",
      correspondentAccountingAccountId: null,
      invoiceNetOffs: [],
    });

    renderDrawer();

    await waitFor(() => {
      expect(screen.getByText("THÔNG TIN CHUNG")).toBeTruthy();
      expect(screen.getByText("Chỉnh sửa")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Chỉnh sửa"));

    // Chuyển sang sub-tab Hạch toán kế toán
    fireEvent.click(screen.getByText("2. Hạch toán kế toán"));

    await waitFor(() => {
      const linesRaw = screen.getByTestId("posting-lines").textContent || "[]";
      const lines = JSON.parse(linesRaw);
      expect(lines).toHaveLength(2);

      expect(lines[0].accountId).toBe("acc-1121");
      expect(lines[0].debit).toBe(23452);
      expect(lines[0].credit).toBe(0);
      expect(lines[0].description).toBe("Thu tien khach hang");

      expect(lines[1].accountId).toBe("");
      expect(lines[1].debit).toBe(0);
      expect(lines[1].credit).toBe(23452);
      expect(lines[1].description).toBe("Thu tien khach hang");
    });

    expect(resolveDrawer().getAttribute("data-layout")).toBe("2-columns");
    expect(resolveDrawer().getAttribute("data-size")).toBe("xl");
  });

  it("hiển thị nút bật/tắt hạch toán trong sub-tab Hạch toán khi vào chế độ chỉnh sửa", async () => {
    (bankStatementApi.getTransaction as any).mockResolvedValue({
      id: "txn-1",
      sourceType: "BANK",
      transDate: "2026-06-30T00:00:00.000Z",
      referenceNumber: "REF-003",
      description: "Giao dịch kiểm thử",
      note: "Giao dịch kiểm thử",
      creditAmount: 1000,
      debitAmount: 0,
      postingStatus: "UNPOSTED",
      bankAccount: { accountingAccountId: "acc-1121" },
      cashBook: null,
      correspondentAccountingAccountId: null,
      invoiceNetOffs: [],
    });

    renderDrawer();

    await waitFor(() => {
      expect(screen.getByText("Chỉnh sửa")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Chỉnh sửa"));
    fireEvent.click(screen.getByText("2. Hạch toán kế toán"));

    await waitFor(() => {
      expect(screen.getByText("Bật hạch toán")).toBeTruthy();
    });
  });

  it("hiển thị sub-tab Chứng từ liên kết và tab Lịch sử & Kiểm duyệt", async () => {
    (bankStatementApi.getTransaction as any).mockResolvedValue({
      id: "txn-1",
      sourceType: "BANK",
      transDate: "2026-06-30T00:00:00.000Z",
      referenceNumber: "REF-005",
      description: "Thanh toan hoa don vat",
      creditAmount: 10000000,
      debitAmount: 0,
      postingStatus: "POSTED",
      bankAccount: { accountingAccountId: "acc-1121" },
      correspondentName: "Cong ty Thuong Mai X",
      invoiceNetOffs: [
        {
          id: "netoff-1",
          invoiceId: "inv-1",
          netOffAmount: 5000000,
        },
      ],
    });

    renderDrawer();

    await waitFor(() => {
      expect(screen.getByText("3. Chứng từ liên kết")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("3. Chứng từ liên kết"));

    await waitFor(() => {
      expect(screen.getByTestId("traceability-mock")).toBeTruthy();
    });

    expect(screen.getByTestId("audit-timeline-mock")).toBeTruthy();
  });
});
