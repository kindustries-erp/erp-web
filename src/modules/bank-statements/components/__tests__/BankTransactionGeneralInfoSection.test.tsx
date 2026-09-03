// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BankTransactionGeneralInfoSection } from "../BankTransactionGeneralInfoSection";

describe("BankTransactionGeneralInfoSection", () => {
  it("renders null when transaction is null", () => {
    const { container } = render(
      <BankTransactionGeneralInfoSection transaction={null} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders THÔNG TIN CHUNG with partner name, branch, source account, and date with icons, but excludes accounting account and posting status", () => {
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
      correspondentAccountingAccountId: "1121",
      postingStatus: "POSTED",
    };

    render(<BankTransactionGeneralInfoSection transaction={mockTxn} />);

    expect(screen.getByText("THÔNG TIN CHUNG")).toBeTruthy();
    expect(screen.getByText("Tập Đoàn Công Nghệ A")).toBeTruthy();
    expect(screen.getByText("Chi nhánh Lê Văn Lương")).toBeTruthy();
    expect(
      screen.getByText("Techcombank Hoạt động - 19033456789"),
    ).toBeTruthy();
    expect(screen.getByText("15/08/2026")).toBeTruthy();

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

    render(<BankTransactionGeneralInfoSection transaction={mockTxn} />);

    expect(screen.getByText("554 Lê Văn Lương")).toBeTruthy();
    expect(screen.getByText("Sổ quỹ tiền mặt VP")).toBeTruthy();
    expect(screen.getByText("16/08/2026")).toBeTruthy();
    expect(screen.queryByText("Chưa hạch toán")).toBeNull();
  });
});
