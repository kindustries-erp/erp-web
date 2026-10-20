import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { GarageCasesExportColumnSelector } from "../GarageCasesExportColumnSelector";
import {
  ALL_GARAGE_CASES_EXPORT_COLUMNS,
  DEFAULT_GARAGE_CASES_EXPORT_COLUMNS,
} from "../garageCasesExportColumns";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: unknown) =>
      typeof fallback === "string" ? fallback : key,
  }),
}));

const total = ALL_GARAGE_CASES_EXPORT_COLUMNS.length;

describe("GarageCasesExportColumnSelector", () => {
  it("hiển thị số cột đã chọn trên tổng số cột", () => {
    render(
      <GarageCasesExportColumnSelector
        selectedColumns={["soChungTu", "doanhThu"]}
        onChange={vi.fn()}
        defaultCollapsed={false}
      />,
    );

    expect(screen.getByText(`(2/${total})`)).toBeDefined();
  });

  it("Bỏ chọn trả về danh sách rỗng; Mặc định trả về cột mặc định", () => {
    const onChange = vi.fn();
    render(
      <GarageCasesExportColumnSelector
        selectedColumns={["soChungTu"]}
        onChange={onChange}
        defaultCollapsed={false}
      />,
    );

    fireEvent.click(screen.getByText("Bỏ chọn"));
    expect(onChange).toHaveBeenLastCalledWith([]);

    fireEvent.click(screen.getByText("Mặc định"));
    expect(onChange).toHaveBeenLastCalledWith(
      DEFAULT_GARAGE_CASES_EXPORT_COLUMNS,
    );
  });

  it("bật một cột chưa chọn thì thêm key vào cuối danh sách", () => {
    const onChange = vi.fn();
    render(
      <GarageCasesExportColumnSelector
        selectedColumns={["soChungTu"]}
        onChange={onChange}
        defaultCollapsed={false}
      />,
    );

    fireEvent.click(screen.getByLabelText("Chi phí / Giá vốn"));
    expect(onChange).toHaveBeenLastCalledWith(["soChungTu", "chiPhi"]);
  });
});
