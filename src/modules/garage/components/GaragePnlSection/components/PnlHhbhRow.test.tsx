import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PnlHhbhRow } from "./PnlHhbhRow";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

const makeReport = (amount: number, ojAmount = 0): any => ({
  sellingExpenses: {
    total: amount,
    items: [{ categoryKey: "HHBH", categoryName: "HHBH", amount, ojAmount }],
  },
});

const renderRow = (props: Partial<React.ComponentProps<typeof PnlHhbhRow>>) =>
  render(
    <table>
      <tbody>
        <PnlHhbhRow
          report={makeReport(1500000, 200000)}
          isLoadingPrev={false}
          {...props}
        />
      </tbody>
    </table>,
  );

describe("PnlHhbhRow (mục 4.2 HHBH)", () => {
  it("hiển thị nhãn 4.2. HHBH và số tiền của kỳ hiện tại", () => {
    renderRow({});
    expect(screen.getByText("4.2. HHBH")).toBeInTheDocument();
    expect(screen.getByText(/1.500.000/)).toBeInTheDocument();
  });

  it("chế độ OJ dùng ojAmount", () => {
    renderRow({ isOjOnly: true });
    expect(screen.getByText(/200.000/)).toBeInTheDocument();
    expect(screen.queryByText(/1.500.000/)).not.toBeInTheDocument();
  });

  it("không có HHBH trong kỳ thì hiển thị 0", () => {
    renderRow({ report: { sellingExpenses: { total: 0, items: [] } } as any });
    expect(screen.getByText("4.2. HHBH")).toBeInTheDocument();
    expect(screen.queryByText(/1.500.000/)).not.toBeInTheDocument();
  });
});
