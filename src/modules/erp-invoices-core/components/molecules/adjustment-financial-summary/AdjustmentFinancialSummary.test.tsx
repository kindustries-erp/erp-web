import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdjustmentFinancialSummary } from "./AdjustmentFinancialSummary";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (params?.amount) return `Đã cấn trừ ${params.amount}`;
      return key;
    },
  }),
}));

describe("AdjustmentFinancialSummary", () => {
  it("renders financial amounts and remaining debt", () => {
    const mockFinancial = {
      originalAmount: 2000000,
      adjustedDeltaAmount: -500000,
      netEffectiveAmount: 1500000,
      isFullyCancelled: false,
      netoffOffsetAmount: 500000,
      remainingDebt: 0,
    };

    render(
      <AdjustmentFinancialSummary financial={mockFinancial} role="ADJUSTING" />,
    );

    expect(screen.getByText("Cân đối tài chính & Dư nợ")).toBeInTheDocument();
    expect(screen.getByText("Tiền HĐ gốc")).toBeInTheDocument();
    expect(screen.getByText("Chênh lệch ĐC")).toBeInTheDocument();
    expect(screen.getByText(/Đã cấn trừ/)).toBeInTheDocument();
  });
});
