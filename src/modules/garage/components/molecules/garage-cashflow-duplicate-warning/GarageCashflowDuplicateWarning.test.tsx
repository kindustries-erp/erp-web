import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCashflowDuplicateWarning } from "./GarageCashflowDuplicateWarning";

const item = (i: number) => ({
  id: `v${i}`,
  voucherCode: `PT-${i}`,
  voucherType: "RECEIPT" as const,
  amount: 1000,
  transDate: "2026-10-10",
  licensePlate: "51A-123.45",
  caseCode: "GR-PDV-0001",
  partnerName: "Anh Dũng",
});
const empty = { items: [], total: 0 };

describe("GarageCashflowDuplicateWarning", () => {
  it("shows only non-empty groups with vouchers and amount", () => {
    render(
      <GarageCashflowDuplicateWarning
        amount={1000000}
        result={{
          nearbyDate: { items: [item(1)], total: 1 },
          sameCase: empty,
          samePlate: empty,
        }}
      />,
    );
    expect(screen.getByText(/PT-1/)).toBeInTheDocument();
    expect(screen.getByText(/Cùng số tiền trong 7 ngày/)).toBeInTheDocument();
    expect(screen.queryByText(/phiếu dịch vụ này/)).not.toBeInTheDocument();
    expect(screen.getByText(/1\.000\.000/)).toBeInTheDocument();
    expect(
      screen.getByText(/10\/10\/2026 · 51A-123\.45 · GR-PDV-0001 · Anh Dũng/),
    ).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
  });

  it("shows '+N more' when total exceeds shown items", () => {
    render(
      <GarageCashflowDuplicateWarning
        amount={1000}
        result={{
          nearbyDate: empty,
          sameCase: empty,
          samePlate: {
            items: [1, 2, 3, 4, 5].map(item),
            total: 8,
          },
        }}
      />,
    );
    expect(screen.getByText("+3 phiếu khác")).toBeInTheDocument();
  });
});
