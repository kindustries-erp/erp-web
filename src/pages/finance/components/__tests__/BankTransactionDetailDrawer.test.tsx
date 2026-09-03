// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BankTransactionDetailDrawer } from "../BankTransactionDetailDrawer";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";

vi.mock("@/shared/components/StandardFormDrawer", () => ({
  StandardFormDrawer: ({
    leftPanel,
    rightPanel,
    rightPanelTitle,
    title,
    onToggleEdit,
    panelClassName,
    layout,
    size,
    relatedTabs,
    tabs,
  }: any) => (
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
      <div>{rightPanel}</div>
      {tabs && (
        <div data-testid="top-tabs">
          {tabs.map((t: any) => (
            <div key={t.key}>
              <h3>{t.label}</h3>
              <div>{t.content}</div>
            </div>
          ))}
        </div>
      )}
      {relatedTabs && (
        <div data-testid="related-tabs">
          {relatedTabs.map((t: any) => (
            <div key={t.key}>
              <h3>{t.label}</h3>
              <div>{t.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  ),
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
    postTransaction: vi.fn(),
    unpostTransaction: vi.fn(),
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

  it("auto tạo dòng đối ứng cho giao dịch tiền vào, để trống tài khoản đối ứng", async () => {
    (bankStatementApi.getTransaction as any).mockResolvedValue({
      id: "txn-1",
      sourceType: "BANK",
      transDate: "2026-06-30T00:00:00.000Z",
      referenceNumber: "REF-001",
      description: "Thu tien khach hang",
      accountingDescription: "Thu tien khach hang",
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
      expect(screen.getByText("Xem trước chứng từ")).toBeTruthy();
      expect(screen.getByText("THÔNG TIN CHUNG")).toBeTruthy();
      expect(screen.getByText("Chỉnh sửa")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Chỉnh sửa"));

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

  it("auto tạo dòng đối ứng cho giao dịch tiền ra, để trống tài khoản đối ứng", async () => {
    (bankStatementApi.getTransaction as any).mockResolvedValue({
      id: "txn-1",
      sourceType: "BANK",
      transDate: "2026-06-30T00:00:00.000Z",
      referenceNumber: "REF-002",
      description: "Chi tien nha cung cap",
      accountingDescription: "Chi tien nha cung cap",
      creditAmount: 0,
      debitAmount: 500000,
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

    await waitFor(() => {
      const linesRaw = screen.getByTestId("posting-lines").textContent || "[]";
      const lines = JSON.parse(linesRaw);
      expect(lines).toHaveLength(2);

      expect(lines[0].accountId).toBe("acc-1121");
      expect(lines[0].debit).toBe(0);
      expect(lines[0].credit).toBe(500000);
      expect(lines[0].description).toBe("Chi tien nha cung cap");

      expect(lines[1].accountId).toBe("");
      expect(lines[1].debit).toBe(500000);
      expect(lines[1].credit).toBe(0);
      expect(lines[1].description).toBe("Chi tien nha cung cap");
    });

    expect(resolveDrawer().getAttribute("data-size")).toBe("xl");
  });

  it("hiển thị nút bật/tắt hạch toán khi vào chế độ chỉnh sửa", async () => {
    (bankStatementApi.getTransaction as any).mockResolvedValue({
      id: "txn-1",
      sourceType: "BANK",
      transDate: "2026-06-30T00:00:00.000Z",
      referenceNumber: "REF-003",
      description: "Giao dịch kiểm thử",
      accountingDescription: "Giao dịch kiểm thử",
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

    await waitFor(() => {
      expect(screen.getByText("Bật hạch toán")).toBeTruthy();
    });
  });

  it("hiển thị DrawerSection Xem trước chứng từ và Thông tin chung", async () => {
    (bankStatementApi.getTransaction as any).mockResolvedValue({
      id: "txn-1",
      sourceType: "BANK",
      transDate: "2026-06-30T00:00:00.000Z",
      referenceNumber: "REF-004",
      description: "Thanh toan hop dong",
      creditAmount: 5000000,
      debitAmount: 0,
      postingStatus: "POSTED",
      bankAccount: {
        accountName: "TK BIDV",
        accountNumber: "12345678",
        bankName: "BIDV",
      },
      branch: { name: "Chi nhánh Lê Văn Lương" },
      correspondentName: "Đối tác Công ty TNHH Liouni",
      correspondentAccountingAccountId: "131",
      invoiceNetOffs: [],
    });

    renderDrawer();

    await waitFor(() => {
      expect(screen.getByText("Xem trước chứng từ")).toBeTruthy();
      expect(screen.getByText("THÔNG TIN CHUNG")).toBeTruthy();
      expect(screen.getByText("Chi nhánh Lê Văn Lương")).toBeTruthy();
      expect(
        screen.getAllByText("Đối tác Công ty TNHH Liouni").length,
      ).toBeGreaterThanOrEqual(2);
      expect(screen.getByText("Đã hạch toán")).toBeTruthy();
    });
  });
});
