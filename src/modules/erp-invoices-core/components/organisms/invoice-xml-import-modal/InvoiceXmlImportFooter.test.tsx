import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InvoiceXmlImportFooter } from "./InvoiceXmlImportFooter";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: unknown) =>
      typeof fallback === "string" ? fallback : key,
  }),
}));

describe("InvoiceXmlImportFooter", () => {
  it("khóa nút import khi chưa chọn file nào và yêu cầu chọn ít nhất 1 file", () => {
    const onConfirm = vi.fn();
    render(
      <InvoiceXmlImportFooter
        selectedCount={0}
        totalCount={3}
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    expect(
      screen.getByText("Chọn ít nhất 1 file để import"),
    ).toBeInTheDocument();
    const confirm = screen.getByRole("button", { name: /Xác nhận Import/ });
    expect(confirm).toBeDisabled();
  });

  it("hiển thị số file đã chọn và gọi onConfirm khi bấm xác nhận", () => {
    const onConfirm = vi.fn();
    render(
      <InvoiceXmlImportFooter
        selectedCount={2}
        totalCount={3}
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText("2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Xác nhận Import/ }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("gọi onCancel khi bấm hủy", () => {
    const onCancel = vi.fn();
    render(
      <InvoiceXmlImportFooter
        selectedCount={1}
        totalCount={1}
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
