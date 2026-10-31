import { act, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { useV2LocaleStore } from "@/v2/shared/stores/useV2LocaleStore";
import { V2FormField } from "./V2FormField";
import { V2FormFieldType, V2FormFieldViewMode } from "./V2FormField.type";

describe("V2FormField - View Mode", () => {
  it("renders DrawerRow gọn gàng ở chế độ viewing mặc định", () => {
    render(<V2FormField label="Tên" value="Công ty Liouni" viewing />);

    expect(screen.getByText("Tên")).toBeInTheDocument();
    expect(screen.getByText("Công ty Liouni")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("hỗ trợ viewMode STACK (nhãn trên text dưới)", () => {
    render(
      <V2FormField
        label="Mô tả"
        value="Chi nhánh chính"
        viewing
        viewMode={V2FormFieldViewMode.STACK}
      />,
    );

    expect(screen.getByText("Mô tả")).toBeInTheDocument();
    expect(screen.getByText("Chi nhánh chính")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("hỗ trợ viewMode BOX khi cần ô input viền", () => {
    render(
      <V2FormField
        label="Mã số thuế"
        value="0101234567"
        viewing
        viewMode={V2FormFieldViewMode.BOX}
      />,
    );

    expect(screen.getByText("Mã số thuế")).toBeInTheDocument();
    expect(screen.getByText("0101234567")).toBeInTheDocument();
  });

  it("hiển thị nút copy khi có copyable trong viewing mode", () => {
    render(<V2FormField label="Mã đối tác" value="NCC-888" viewing copyable />);

    expect(screen.getByText("NCC-888")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
  });

  it("hiển thị nhãn option thay vì raw ID trong viewing mode cho select", () => {
    const options = [
      { value: "BR_HN", label: "Chi nhánh Hà Nội" },
      { value: "BR_HCM", label: "Chi nhánh TP.HCM" },
    ];

    render(
      <V2FormField
        label="Chi nhánh"
        type={V2FormFieldType.SELECT}
        options={options}
        value="BR_HN"
        viewing
      />,
    );

    expect(screen.getByText("Chi nhánh Hà Nội")).toBeInTheDocument();
    expect(screen.queryByText("BR_HN")).not.toBeInTheDocument();
  });

  it("format ngày chuẩn DD/MM/YYYY trong viewing mode cho date", () => {
    render(
      <V2FormField label="Ngày sinh" type="date" value="2026-10-30" viewing />,
    );

    expect(screen.getByText("30/10/2026")).toBeInTheDocument();
  });

  it("format số có dấu phân cách nghìn trong viewing mode cho number", () => {
    render(
      <V2FormField label="Số tiền" type="number" value={15000000} viewing />,
    );

    expect(screen.getByText("15.000.000")).toBeInTheDocument();
  });

  it("hiển thị nhãn switch tương ứng trong viewing mode", () => {
    const { rerender } = render(
      <V2FormField
        label="Trạng thái"
        type="switch"
        value={true}
        switchLabels={{ on: "Đang bật", off: "Đã tắt" }}
        viewing
      />,
    );

    expect(screen.getByText("Đang bật")).toBeInTheDocument();

    rerender(
      <V2FormField
        label="Trạng thái"
        type="switch"
        value={false}
        switchLabels={{ on: "Đang bật", off: "Đã tắt" }}
        viewing
      />,
    );

    expect(screen.getByText("Đã tắt")).toBeInTheDocument();
  });

  it("hiển thị nhãn switch theo i18n mặc định và tự đổi khi chuyển locale", () => {
    act(() => {
      useV2LocaleStore.getState().setLocale("vi");
    });
    const { rerender } = render(
      <V2FormField label="Trạng thái" type="switch" value={true} viewing />,
    );
    expect(screen.getByText("Hoạt động")).toBeInTheDocument();

    act(() => {
      useV2LocaleStore.getState().setLocale("en");
    });
    rerender(
      <V2FormField label="Trạng thái" type="switch" value={true} viewing />,
    );
    expect(screen.getByText("Active")).toBeInTheDocument();

    // Reset về vi
    act(() => {
      useV2LocaleStore.getState().setLocale("vi");
    });
  });
});
