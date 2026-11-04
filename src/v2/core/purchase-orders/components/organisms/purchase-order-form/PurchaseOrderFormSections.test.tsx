import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { emptyPurchaseOrderForm } from "../../../domain/purchaseOrder";
import { PurchaseOrderFormSections } from "./PurchaseOrderFormSections";

const renderSections = (
  props: {
    viewing?: boolean;
    creating?: boolean;
    setField?: () => void;
    onRegenerateNo?: () => void;
  } = {},
) =>
  render(
    <PurchaseOrderFormSections
      form={{
        ...emptyPurchaseOrderForm(),
        poNo: "GPO-1",
        supplierName: "NCC mẫu",
      }}
      viewing={props.viewing ?? false}
      creating={props.creating ?? false}
      onRegenerateNo={props.onRegenerateNo ?? vi.fn()}
      errorField={null}
      errorMessage=""
      t={(_key, fallback) => fallback ?? ""}
      setField={(props.setField ?? vi.fn()) as never}
    />,
  );

describe("PurchaseOrderFormSections", () => {
  it("ở chế độ xem không có ô nhập", () => {
    renderSections({ viewing: true });
    expect(screen.getAllByText("NCC mẫu").length).toBeGreaterThan(0);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("số đơn chỉ sửa được và có nút sinh số khi đang tạo mới", () => {
    const onRegenerateNo = vi.fn();
    renderSections({ creating: true, onRegenerateNo });
    fireEvent.click(screen.getByRole("button", { name: "Sinh số mới" }));
    expect(onRegenerateNo).toHaveBeenCalledTimes(1);
  });

  it("sửa nhà cung cấp gọi setField đúng khóa", () => {
    const setField = vi.fn();
    renderSections({ setField });
    const input = screen.getByDisplayValue("NCC mẫu");
    fireEvent.change(input, { target: { value: "NCC mới" } });
    expect(setField).toHaveBeenCalledWith("supplierName", "NCC mới");
  });
});
