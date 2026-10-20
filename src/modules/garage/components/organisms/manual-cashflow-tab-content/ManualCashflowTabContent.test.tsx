import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ManualCashflowTabContent } from "./ManualCashflowTabContent";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, defaultVal: string) => defaultVal,
  }),
}));

describe("ManualCashflowTabContent Organism", () => {
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

  it("should render form inputs in edit mode and disable 'Thêm vào danh sách' button when amount is empty", () => {
    render(<ManualCashflowTabContent {...baseProps} manualAmount="" />);

    expect(
      screen.getByPlaceholderText(/Ví dụ: Anh Nam \(Tài xế\), Chị Hương.../i),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Nhập lý do thu\/chi ngoài sổ sách.../i),
    ).toBeInTheDocument();

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

  it("should trigger input change callbacks when user types", () => {
    const onSetAmount = vi.fn();
    const onSetPartner = vi.fn();
    const onSetNote = vi.fn();

    render(
      <ManualCashflowTabContent
        {...baseProps}
        onSetManualAmount={onSetAmount}
        onSetManualPartner={onSetPartner}
        onSetManualNote={onSetNote}
      />,
    );

    const partnerInput = screen.getByPlaceholderText(
      /Ví dụ: Anh Nam \(Tài xế\), Chị Hương.../i,
    );
    fireEvent.change(partnerInput, { target: { value: "Nguyễn Văn A" } });
    expect(onSetPartner).toHaveBeenCalledWith("Nguyễn Văn A");

    const amountInput = screen.getByPlaceholderText("0");
    fireEvent.change(amountInput, { target: { value: "1500000" } });
    expect(onSetAmount).toHaveBeenCalledWith("1500000");

    const noteInput = screen.getByPlaceholderText(
      /Nhập lý do thu\/chi ngoài sổ sách.../i,
    );
    fireEvent.change(noteInput, { target: { value: "Tiền mặt sửa phanh" } });
    expect(onSetNote).toHaveBeenCalledWith("Tiền mặt sửa phanh");
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

    expect(screen.getByText("Chờ lưu")).toBeInTheDocument();
  });

  it("should display count including pending status in titleExtra", () => {
    const activeSettlements = [
      {
        id: "persisted-1",
        settlement_type: "RECEIPT",
        source_channel: "OFF_SYSTEM_MANUAL",
        category: "TIEN_MAT_NGOAI",
        amount: 500000,
        trans_date: "2026-10-05",
      },
      {
        id: "tmp-item-2",
        tempId: "tmp-item-2",
        isPending: true,
        settlement_type: "RECEIPT",
        source_channel: "OFF_SYSTEM_MANUAL",
        category: "CHUYEN_KHOAN_CA_NHAN",
        amount: 300000,
        trans_date: "2026-10-05",
      },
    ];

    render(
      <ManualCashflowTabContent
        {...baseProps}
        activeSettlements={activeSettlements}
      />,
    );

    expect(screen.getByText(/2 GD, 1 chờ lưu/i)).toBeInTheDocument();
  });

  it("should hide form when editMode is false", () => {
    render(<ManualCashflowTabContent {...baseProps} editMode={false} />);

    expect(
      screen.queryByPlaceholderText(/Ví dụ: Anh Nam \(Tài xế\), Chị Hương.../i),
    ).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("0")).not.toBeInTheDocument();
  });
});
