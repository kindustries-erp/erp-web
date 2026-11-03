import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { emptyCashVoucherForm } from "../../../domain/entities/cashVoucher";
import { CashVoucherFormSections } from "./CashVoucherFormSections";

const cashBooks = [{ id: "cb1", name: "Quỹ ĐT", branchId: "b1" }];
const t = (key: string, fallback?: string) => fallback ?? key;

const renderForm = (setField = vi.fn(), errorField: "amount" | null = null) =>
  render(
    <CashVoucherFormSections
      form={emptyCashVoucherForm()}
      cashBooks={cashBooks}
      errorField={errorField}
      errorMessage="Trường này là bắt buộc"
      amountErrorMessage="Nhập đúng một trong hai"
      t={t}
      setField={setField}
    />,
  );

describe("CashVoucherFormSections", () => {
  it("hiện các mục nhập chính", () => {
    renderForm();
    expect(screen.getByText("Sổ quỹ")).toBeTruthy();
    expect(screen.getByText("Ngày giao dịch")).toBeTruthy();
    expect(screen.getByText("Thu")).toBeTruthy();
    expect(screen.getByText("Chi")).toBeTruthy();
  });

  it("hiện thông báo lỗi số tiền khi được đánh dấu", () => {
    renderForm(vi.fn(), "amount");
    expect(screen.getByText("Nhập đúng một trong hai")).toBeTruthy();
  });

  it("gõ người nộp/nhận gọi setField đúng khóa", () => {
    const setField = vi.fn();
    renderForm(setField);
    const input = screen.getByPlaceholderText("Nhập tên người nộp/nhận");
    fireEvent.change(input, { target: { value: "Nguyễn A" } });
    expect(setField).toHaveBeenCalledWith("correspondentName", "Nguyễn A");
  });
});
