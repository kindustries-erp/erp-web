import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  BankStatementExportConditions,
  type BankStatementExportConditionsProps,
} from "./BankStatementExportConditions";

const baseProps: BankStatementExportConditionsProps = {
  exportMode: "by-period",
  onExportModeChange: vi.fn(),
  periodType: "month",
  onPeriodTypeChange: vi.fn(),
  period: "2026-10",
  onPeriodChange: vi.fn(),
  periodOptions: [{ value: "2026-10", label: "Tháng 10/2026" }],
  quarter: "2026-Q4",
  onQuarterChange: vi.fn(),
  quarterOptions: [{ value: "2026-Q4", label: "Quý 4/2026" }],
  dateFrom: "2026-10-01",
  onDateFromChange: vi.fn(),
  dateTo: "2026-10-31",
  onDateToChange: vi.fn(),
  starting: false,
  onStart: vi.fn(),
  noColumnSelected: false,
  accountLabel: "Tài khoản ngân hàng",
  accountPlaceholder: "Tất cả tài khoản ngân hàng",
  accountOptions: [{ value: "acc-1", label: "TCB - 111 (Test)" }],
  accountId: "",
  onAccountChange: vi.fn(),
  transactionTypeLabel: "Loại giao dịch",
  transactionTypePlaceholder: "Tất cả loại giao dịch",
  transactionTypeOptions: [{ value: "IN", label: "Tiền vào (Thu)" }],
  transactionType: "",
  onTransactionTypeChange: vi.fn(),
};

describe("BankStatementExportConditions", () => {
  it("renders the account and transaction type selectors next to the period", () => {
    render(<BankStatementExportConditions {...baseProps} />);

    expect(screen.getByText("Tài khoản ngân hàng")).toBeInTheDocument();
    expect(screen.getByText("Loại giao dịch")).toBeInTheDocument();
    expect(screen.getByText("Tất cả tài khoản ngân hàng")).toBeInTheDocument();
  });

  it("calls onStart when the export button is pressed", () => {
    const onStart = vi.fn();
    render(<BankStatementExportConditions {...baseProps} onStart={onStart} />);

    fireEvent.click(screen.getByRole("button", { name: "Xuất Excel" }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("disables export when no column is selected", () => {
    render(<BankStatementExportConditions {...baseProps} noColumnSelected />);

    expect(screen.getByRole("button", { name: "Xuất Excel" })).toBeDisabled();
  });

  it("chỉ mở một dropdown tại một thời điểm và click ra ngoài thì đóng", async () => {
    render(
      <div>
        <span>outside</span>
        <BankStatementExportConditions {...baseProps} />
      </div>,
    );
    const period = screen.getByRole("combobox", { name: "Chọn kỳ..." });
    const account = screen.getByRole("combobox", {
      name: "Tài khoản ngân hàng",
    });

    fireEvent.click(period);
    await new Promise((r) => setTimeout(r, 50));
    expect(period).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(account);
    await new Promise((r) => setTimeout(r, 50));
    expect(account).toHaveAttribute("aria-expanded", "true");
    expect(period).toHaveAttribute("aria-expanded", "false");

    fireEvent.pointerDown(screen.getByText("outside"), {
      pointerType: "mouse",
      button: 0,
    });
    expect(account).toHaveAttribute("aria-expanded", "false");
  });
});
