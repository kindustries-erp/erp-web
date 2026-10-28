import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

const {
  getTransaction,
  updateTransaction,
  postTransaction,
  unpostTransaction,
  listBranches,
  listAccounts,
} = vi.hoisted(() => ({
  getTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  postTransaction: vi.fn(),
  unpostTransaction: vi.fn(),
  listBranches: vi.fn(),
  listAccounts: vi.fn(),
}));

vi.mock("../../api/cashTransactionApi", () => ({
  cashTransactionApi: {
    getTransaction,
    updateTransaction,
    postTransaction,
    unpostTransaction,
  },
}));
vi.mock("../../api/accountingLookupApi", () => ({
  accountingLookupApi: {
    listChartOfAccounts: listAccounts,
    getJournalEntry: vi.fn(),
  },
}));
vi.mock("../../api/branchOptionsApi", () => ({
  branchOptionsApi: { listBranchOptions: listBranches },
}));
vi.mock(
  "@/v2/modules/business-partners/components/organisms/business-partner-picker",
  () => ({
    BusinessPartnerPicker: () => <div data-testid="partner-picker" />,
  }),
);

import "../../bankStatements.locale";
import { CashTransactionDetailDrawer } from "../../drawers/CashTransactionDetailDrawer";

const TX = {
  id: "t1",
  sourceType: "CASH",
  transDate: "2026-10-01",
  debitAmount: 0,
  creditAmount: 200,
  note: "ghi chú cũ",
  correspondentName: "Nguyễn A",
  referenceNumber: "REF-1",
  branchIds: ["b1"],
  cashBook: { name: "Quỹ ĐT" },
  partner: null,
  cashflowClassification: null,
  cashflowPurpose: null,
  postingStatus: "UNPOSTED",
  createdAt: "2026-10-01T00:00:00Z",
};

const renderDrawer = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <CashTransactionDetailDrawer
        isOpen
        transactionId="t1"
        onClose={vi.fn()}
      />
    </QueryClientProvider>,
  );

describe("CashTransactionDetailDrawer (hạch toán)", () => {
  it("bỏ hạch toán phải xác nhận trước khi gọi unpost", async () => {
    unpostTransaction.mockResolvedValue({});
    getTransaction.mockResolvedValue({
      ...TX,
      postingStatus: "POSTED",
      postingDate: "2026-10-02",
      journalEntryId: "J1",
      lines: [
        { accountId: "1111", debit: 200, credit: 0 },
        { accountId: "131", debit: 0, credit: 200 },
      ],
    });
    renderDrawer();
    await screen.findByText("Quỹ ĐT");

    fireEvent.click(
      screen.getByRole("button", { name: "Chuyển sang chế độ chỉnh sửa" }),
    );
    fireEvent.click(screen.getByText("2. Hạch toán"));
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    expect(await screen.findByText("Hủy hạch toán giao dịch?")).toBeTruthy();
    expect(unpostTransaction).not.toHaveBeenCalled();

    const confirm = screen.getAllByRole("button", { name: "Hủy hạch toán" });
    fireEvent.click(confirm[confirm.length - 1]);
    await waitFor(() => expect(unpostTransaction).toHaveBeenCalledWith("t1"));
  });

  it("bật hạch toán khi quỹ chưa có tài khoản kế toán thì báo thiếu dòng và không gửi", async () => {
    getTransaction.mockResolvedValue(TX);
    renderDrawer();
    await screen.findByText("Quỹ ĐT");

    fireEvent.click(
      screen.getByRole("button", { name: "Chuyển sang chế độ chỉnh sửa" }),
    );
    fireEvent.click(screen.getByText("2. Hạch toán"));
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    expect(
      await screen.findByText("Vui lòng nhập ít nhất 1 dòng hạch toán"),
    ).toBeTruthy();
    expect(postTransaction).not.toHaveBeenCalled();
  });
});
