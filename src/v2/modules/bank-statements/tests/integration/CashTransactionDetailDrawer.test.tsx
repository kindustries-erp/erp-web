import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

describe("CashTransactionDetailDrawer (tích hợp)", () => {
  beforeEach(() => {
    [getTransaction, updateTransaction, listBranches].forEach((fn) =>
      fn.mockReset(),
    );
    getTransaction.mockResolvedValue(TX);
    listBranches.mockResolvedValue([{ value: "b1", label: "HN — Hà Nội" }]);
  });

  it("hiện thông tin phiếu ở tab Chi tiết", async () => {
    renderDrawer();
    expect(await screen.findByText("Quỹ ĐT")).toBeTruthy();
    expect(screen.getByText("Nguyễn A")).toBeTruthy();
  });

  it("sửa ghi chú rồi lưu gửi PATCH đúng trường đã đổi", async () => {
    updateTransaction.mockResolvedValue(TX);
    renderDrawer();
    await screen.findByText("Quỹ ĐT");

    fireEvent.click(
      screen.getByRole("button", { name: "Chuyển sang chế độ chỉnh sửa" }),
    );
    const note = await screen.findByDisplayValue("ghi chú cũ");
    fireEvent.change(note, { target: { value: "ghi chú mới" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await waitFor(() =>
      expect(updateTransaction).toHaveBeenCalledWith("t1", {
        note: "ghi chú mới",
        cashflowClassification: null,
        cashflowPurpose: null,
      }),
    );
  });

  it("lưu thất bại báo lỗi đúng bước cập nhật thông tin", async () => {
    updateTransaction.mockRejectedValue({
      response: { data: { message: "Sai chi nhánh" } },
    });
    renderDrawer();
    await screen.findByText("Quỹ ĐT");

    fireEvent.click(
      screen.getByRole("button", { name: "Chuyển sang chế độ chỉnh sửa" }),
    );
    fireEvent.change(await screen.findByDisplayValue("ghi chú cũ"), {
      target: { value: "x" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    expect(
      await screen.findByText("Lỗi lưu thông tin giao dịch: Sai chi nhánh"),
    ).toBeTruthy();
  });
});
