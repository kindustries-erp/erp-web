import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { emptyGarageGoodsReceiptForm } from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";
import { GarageGoodsReceiptFormSections } from "./GarageGoodsReceiptFormSections";

const renderSections = (viewing: boolean, setField = vi.fn()) =>
  render(
    <GarageGoodsReceiptFormSections
      form={{
        ...emptyGarageGoodsReceiptForm(),
        receiptNo: "Mẫu",
        receiptDate: "Mẫu",
      }}
      viewing={viewing}
      codeEditable
      onRegenerateCode={vi.fn()}
      errorField={null}
      errorMessage=""
      t={(_key, fallback) => fallback ?? ""}
      setField={setField}
    />,
  );

describe("GarageGoodsReceiptFormSections", () => {
  it("renders read-only values in view mode without inputs", () => {
    renderSections(true);
    expect(screen.getAllByText("Mẫu").length).toBeGreaterThan(0);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("renders editable fields in edit mode", () => {
    renderSections(false);
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
  });

  it("allows adding a line item and updates lines", () => {
    const setField = vi.fn();
    renderSections(false, setField);
    const addButton = screen.getByRole("button", { name: /Thêm phụ tùng/i });
    fireEvent.click(addButton);
    expect(setField).toHaveBeenCalledWith("lines", expect.any(Array));
  });
});
