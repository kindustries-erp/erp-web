import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ManualCashflowTabContent } from "../ManualCashflowTabContent";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal: string) => defaultVal,
  }),
}));

describe("ManualCashflowTabContent UI Component", () => {
  const baseProps = {
    editMode: true,
    activeSettlements: [],
    onRemoveSettlement: vi.fn(),
    settlementType: "RECEIPT" as const,
    baseRemaining: 2200000,
    manualAmount: "",
    manualCategory: "TIEN_MAT_NGOAI",
    manualDate: "2026-10-05",
    manualPartner: "",
    manualNote: "",
    onSetManualAmount: vi.fn(),
    onSetManualCategory: vi.fn(),
    onSetManualDate: vi.fn(),
    onSetManualPartner: vi.fn(),
    onSetManualNote: vi.fn(),
    onAddManualSettlement: vi.fn(),
    manualDraftPending: false,
  };

  it("should render 'Thêm vào danh sách' button in edit mode and disable it when amount is empty", () => {
    render(<ManualCashflowTabContent {...baseProps} manualAmount="" />);

    const addButton = screen.getByRole("button", {
      name: /Thêm vào danh sách/i,
    });
    expect(addButton).toBeDefined();
    expect(addButton).toBeDisabled();
  });

  it("should enable 'Thêm vào danh sách' button when amount > 0 and call onAddManualSettlement on click", () => {
    const onAdd = vi.fn();
    render(
      <ManualCashflowTabContent
        {...baseProps}
        manualAmount={2200000}
        onAddManualSettlement={onAdd}
      />,
    );

    const addButton = screen.getByRole("button", {
      name: /Thêm vào danh sách/i,
    });
    expect(addButton).not.toBeDisabled();

    fireEvent.click(addButton);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("should display 'Chờ lưu' badge for pending added settlements in table", () => {
    const activeSettlements = [
      {
        id: "tmp-item-1",
        tempId: "tmp-item-1",
        isPending: true,
        settlement_type: "RECEIPT",
        source_channel: "OFF_SYSTEM_MANUAL",
        category: "TIEN_MAT_NGOAI",
        amount: 500000,
        trans_date: "2026-10-05",
        partner_name: "Anh Nam",
      },
    ];

    render(
      <ManualCashflowTabContent
        {...baseProps}
        activeSettlements={activeSettlements}
      />,
    );

    expect(screen.getByText("Chờ lưu")).toBeDefined();
  });
});
