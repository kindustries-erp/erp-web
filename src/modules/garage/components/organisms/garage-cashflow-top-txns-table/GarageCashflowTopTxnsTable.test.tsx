import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GarageCashflowTopTxnsTable } from "./GarageCashflowTopTxnsTable";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => fallback || key,
}));

describe("GarageCashflowTopTxnsTable", () => {
  it("renders loading skeleton when loading is true", () => {
    const { container } = render(<GarageCashflowTopTxnsTable loading={true} />);
    expect(
      container.querySelectorAll(".animate-pulse").length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("renders empty state when top transactions are empty", () => {
    render(
      <GarageCashflowTopTxnsTable
        topTransactions={{ in: [], out: [] }}
        loading={false}
      />,
    );
    expect(screen.getAllByText("Chưa có dữ liệu").length).toBe(2);
  });

  it("renders top transactions and triggers onClick callbacks", () => {
    const onClickItem = vi.fn();
    const onClickCase = vi.fn();

    const mockData = {
      in: [
        {
          id: "v-1",
          voucherCode: "PT-001",
          transDate: "2026-03-01",
          amount: 15000000,
          partnerName: "Nguyễn Văn A",
          caseCode: "GR-001",
        },
      ],
      out: [
        {
          id: "v-2",
          voucherCode: "PC-001",
          transDate: "2026-03-02",
          amount: 5000000,
          partnerName: "Cty Phụ Tùng B",
        },
      ],
    };

    render(
      <GarageCashflowTopTxnsTable
        topTransactions={mockData}
        loading={false}
        onClickItem={onClickItem}
        onClickCase={onClickCase}
      />,
    );

    expect(screen.getByText("PT-001")).toBeInTheDocument();
    expect(screen.getByText("PC-001")).toBeInTheDocument();
    expect(screen.getByText("GR-001")).toBeInTheDocument();

    fireEvent.click(screen.getByText("PT-001"));
    expect(onClickItem).toHaveBeenCalledWith(mockData.in[0]);

    fireEvent.click(screen.getByText("GR-001"));
    expect(onClickCase).toHaveBeenCalledWith("GR-001");
  });
});
