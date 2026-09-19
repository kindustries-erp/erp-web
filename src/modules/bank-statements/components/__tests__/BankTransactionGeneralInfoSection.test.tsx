// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BankTransactionGeneralInfoSection } from "../BankTransactionGeneralInfoSection";

vi.mock("@/modules/branches/api/branchApi", () => ({
  getBranchOptionsApi: vi.fn().mockResolvedValue([
    { value: "branch-uuid-1", label: "01 — Chi nhánh Lê Văn Lương" },
    { value: "branch-uuid-2", label: "02 — Chi nhánh Đào Trí" },
  ]),
}));

describe("BankTransactionGeneralInfoSection", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const renderComponent = (props: any) =>
    render(
      <QueryClientProvider client={queryClient}>
        <BankTransactionGeneralInfoSection {...props} />
      </QueryClientProvider>,
    );

  it("renders null when transaction is null", () => {
    const { container } = renderComponent({ transaction: null });
    expect(container.firstChild).toBeNull();
  });

  it("renders THÔNG TIN CHUNG with partner name, branch, source account, and date with icons in view mode", () => {
    const mockTxn = {
      id: "txn-101",
      sourceType: "BANK",
      transDate: "2026-08-15T00:00:00.000Z",
      correspondentName: "Tập Đoàn Công Nghệ A",
      branch: { name: "Chi nhánh Lê Văn Lương" },
      bankAccount: {
        accountName: "Techcombank Hoạt động",
        accountNumber: "19033456789",
      },
      description: "Thanh toán dịch vụ tháng 8",
      correspondentAccountingAccountId: "1121",
      postingStatus: "POSTED",
    };

    renderComponent({ transaction: mockTxn });

    expect(screen.getByText("THÔNG TIN CHUNG")).toBeTruthy();
    expect(screen.getByText("Tập Đoàn Công Nghệ A")).toBeTruthy();
    expect(screen.getByText("Chi nhánh Lê Văn Lương")).toBeTruthy();
    expect(
      screen.getByText("Techcombank Hoạt động - 19033456789"),
    ).toBeTruthy();
    expect(screen.getByText("15/08/2026")).toBeTruthy();
    expect(screen.getByText("Thanh toán dịch vụ tháng 8")).toBeTruthy();

    // Verify removed fields are NOT rendered
    expect(screen.queryByText("1121")).toBeNull();
    expect(screen.queryByText("Đã hạch toán")).toBeNull();
  });

  it("renders fallback dash when partner is missing", () => {
    const mockTxn = {
      id: "txn-102",
      sourceType: "CASH",
      transDate: "2026-08-16T00:00:00.000Z",
      correspondentName: "",
      branchName: "554 Lê Văn Lương",
      cashBook: { name: "Sổ quỹ tiền mặt VP" },
      correspondentAccountingAccountId: "",
      postingStatus: "UNPOSTED",
    };

    renderComponent({ transaction: mockTxn });

    expect(screen.getByText("554 Lê Văn Lương")).toBeTruthy();
    expect(screen.getByText("Sổ quỹ tiền mặt VP")).toBeTruthy();
    expect(screen.getByText("16/08/2026")).toBeTruthy();
    expect(screen.queryByText("Chưa hạch toán")).toBeNull();
  });

  it("renders in edit mode with Combobox for branch and BufferedTextarea for notes", () => {
    const mockTxn = {
      id: "txn-103",
      sourceType: "BANK",
      transDate: "2026-08-15T00:00:00.000Z",
      correspondentName: "Công ty TNHH Minh Long",
      branchId: "branch-uuid-1",
      description: "Chuyển tiền mua vật tư",
      bankAccount: {
        accountName: "Techcombank",
        accountNumber: "190112233",
      },
    };

    const handleBranchChange = vi.fn();
    const handleDescriptionChange = vi.fn();

    renderComponent({
      transaction: mockTxn,
      editMode: true,
      branchId: "branch-uuid-1",
      onBranchChange: handleBranchChange,
      description: "Chuyển tiền mua vật tư",
      onDescriptionChange: handleDescriptionChange,
    });

    expect(screen.getByText("THÔNG TIN CHUNG")).toBeTruthy();
    expect(screen.getByText("Công ty TNHH Minh Long")).toBeTruthy();
    expect(
      screen.getByPlaceholderText("Nhập ghi chú / diễn giải..."),
    ).toBeTruthy();
  });
});
