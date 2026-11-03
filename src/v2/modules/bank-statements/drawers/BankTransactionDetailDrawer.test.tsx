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

vi.mock("../api/cashTransactionApi", () => ({
  cashTransactionApi: {
    getTransaction,
    updateTransaction,
    postTransaction,
    unpostTransaction,
  },
}));

vi.mock("../api/accountingLookupApi", () => ({
  accountingLookupApi: {
    listChartOfAccounts: listAccounts,
    getJournalEntry: vi.fn(),
  },
}));

vi.mock("../api/branchOptionsApi", () => ({
  branchOptionsApi: { listBranchOptions: listBranches },
}));

vi.mock(
  "@/v2/modules/business-partners/components/organisms/business-partner-picker",
  () => ({
    BusinessPartnerPicker: () => <div data-testid="partner-picker" />,
  }),
);

import "../bankStatements.locale";
import { BankTransactionDetailDrawer } from "./BankTransactionDetailDrawer";

const BANK_TX = {
  id: "bt1",
  sourceType: "BANK",
  transDate: "2026-10-15",
  debitAmount: 5000000,
  creditAmount: 0,
  note: "thanh toán nhà cung cấp",
  description: "UNC 123456 chuyen tien",
  correspondentName: "Công ty TNHH Thép",
  correspondentAccount: "0123456789",
  correspondentBank: "Vietcombank",
  referenceNumber: "REF-BANK-001",
  branchIds: ["b1"],
  bankAccount: {
    id: "ba1",
    bankName: "BIDV",
    bankCode: "BIDV",
    accountNumber: "12410001234567",
    accountName: "CÔNG TY LIÊN MINH",
  },
  partner: null,
  cashflowClassification: null,
  cashflowPurpose: null,
  postingStatus: "UNPOSTED",
  createdAt: "2026-10-15T00:00:00Z",
};

const renderDrawer = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <BankTransactionDetailDrawer
        isOpen
        transactionId="bt1"
        onClose={vi.fn()}
      />
    </QueryClientProvider>,
  );

describe("BankTransactionDetailDrawer (V2)", () => {
  beforeEach(() => {
    [
      getTransaction,
      updateTransaction,
      unpostTransaction,
      listBranches,
      listAccounts,
    ].forEach((fn) => fn.mockReset());
    getTransaction.mockResolvedValue(BANK_TX);
    listBranches.mockResolvedValue([{ value: "b1", label: "HN — Hà Nội" }]);
    listAccounts.mockResolvedValue([]);
  });

  it("hiện thông tin giao dịch đúng thứ tự, ẩn loại GD & diễn giải riêng", async () => {
    renderDrawer();
    expect(await screen.findByText("BIDV")).toBeTruthy();
    expect(screen.getByText("THÔNG TIN GIAO DỊCH")).toBeTruthy();
    expect(screen.getByText("THIẾT LẬP & PHÂN LOẠI")).toBeTruthy();
    expect(screen.getByText("+ 5.000.000 ₫")).toBeTruthy();
    expect(
      screen.getAllByText("BIDV - 12410001234567").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Công ty TNHH Thép")).toBeTruthy();
    expect(screen.queryByText("Loại giao dịch")).toBeNull();
    expect(screen.queryByText("Diễn giải ngân hàng")).toBeNull();
  });

  it("chuyển sang chế độ sửa hiển thị các DrawerField label chuẩn V2", async () => {
    renderDrawer();
    await screen.findByText("BIDV");
    fireEvent.click(
      screen.getByRole("button", { name: "Chuyển sang chế độ chỉnh sửa" }),
    );
    expect(await screen.findByText("Phân loại dòng tiền")).toBeTruthy();
    expect(screen.getByText("Mục đích dòng tiền")).toBeTruthy();
  });

  it("chuyển sang sub-tab Hạch toán kế toán hiển thị vùng soạn bút toán", async () => {
    renderDrawer();
    await screen.findByText("BIDV");
    fireEvent.click(screen.getByText("Hạch toán kế toán"));
    expect(await screen.findByText(/Chưa hạch toán/)).toBeTruthy();
  });

  it("chuyển sang chế độ sửa và lưu ghi chú gửi PATCH đúng trường", async () => {
    updateTransaction.mockResolvedValue(BANK_TX);
    renderDrawer();
    await screen.findByText("BIDV");

    fireEvent.click(
      screen.getByRole("button", { name: "Chuyển sang chế độ chỉnh sửa" }),
    );
    const noteInput = await screen.findByDisplayValue(
      "thanh toán nhà cung cấp",
    );
    fireEvent.change(noteInput, { target: { value: "ghi chú mới" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await waitFor(() =>
      expect(updateTransaction).toHaveBeenCalledWith("bt1", {
        note: "ghi chú mới",
        cashflowClassification: null,
        cashflowPurpose: null,
      }),
    );
  });

  it("lưu thất bại hiển thị banner lỗi", async () => {
    updateTransaction.mockRejectedValue({
      response: { data: { message: "Lỗi kết nối ngân hàng" } },
    });
    renderDrawer();
    await screen.findByText("BIDV");

    fireEvent.click(
      screen.getByRole("button", { name: "Chuyển sang chế độ chỉnh sửa" }),
    );
    fireEvent.change(
      await screen.findByDisplayValue("thanh toán nhà cung cấp"),
      {
        target: { value: "nội dung mới" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    expect(
      await screen.findByText(/Không thể lưu thông tin giao dịch/),
    ).toBeTruthy();
  });

  it("ẩn tab Theo đối tác khi giao dịch không có tên đối ứng", async () => {
    getTransaction.mockResolvedValue({
      ...BANK_TX,
      correspondentName: null,
      correspondentAccount: null,
    });
    renderDrawer();
    await screen.findByText("BIDV");
    expect(screen.queryByText("Chi tiết theo đối tác")).toBeNull();
  });

  it("hiện tab Theo đối tác khi có đối tác đối ứng", async () => {
    renderDrawer();
    await screen.findByText("BIDV");
    expect(screen.getByText("Chi tiết theo đối tác")).toBeTruthy();
  });
});
