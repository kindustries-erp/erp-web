import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CashflowTopRow } from "./CashflowTopRow";

describe("CashflowTopRow (L2 Molecule)", () => {
  const mockItem = {
    id: "v-1",
    voucherCode: "PT-GARA-001",
    transDate: "2026-10-15",
    amount: 15000000,
    partnerName: "Nguyễn Văn A",
    licensePlate: "51K-999.99",
    caseCode: "GR-PDV-001",
  };

  it("renders voucherCode, partnerName, licensePlate and amount", () => {
    render(<CashflowTopRow item={mockItem} type="RECEIPT" index={0} />);

    expect(screen.getByText("PT-GARA-001")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText("51K-999.99")).toBeInTheDocument();
    expect(screen.getByText("GR-PDV-001")).toBeInTheDocument();
  });

  it("triggers onClickItem and onClickCase when clicked", () => {
    const onItemClick = vi.fn();
    const onCaseClick = vi.fn();

    render(
      <CashflowTopRow
        item={mockItem}
        type="RECEIPT"
        index={0}
        onClickItem={onItemClick}
        onClickCase={onCaseClick}
      />,
    );

    fireEvent.click(screen.getByText("PT-GARA-001"));
    expect(onItemClick).toHaveBeenCalledWith(mockItem);

    fireEvent.click(screen.getByText("GR-PDV-001"));
    expect(onCaseClick).toHaveBeenCalledWith("GR-PDV-001");
  });
});
