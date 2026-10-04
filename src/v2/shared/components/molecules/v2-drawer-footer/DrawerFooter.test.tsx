import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DrawerFooter } from "./DrawerFooter";

describe("V2 DrawerFooter Molecule", () => {
  it("renders null when actions is empty and footerLeft is undefined", () => {
    const { container } = render(<DrawerFooter actions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders footerLeft and action buttons properly", () => {
    const handleSave = vi.fn();
    const handleCancel = vi.fn();
    const handleDelete = vi.fn();

    render(
      <DrawerFooter
        footerLeft={
          <span data-testid="left-summary">Tổng cộng: 1,000,000đ</span>
        }
        actions={[
          {
            label: "Xóa",
            variant: "danger",
            align: "left",
            onClick: handleDelete,
          },
          {
            label: "Hủy",
            variant: "secondary",
            onClick: handleCancel,
          },
          {
            label: "Lưu thay đổi",
            primary: true,
            onClick: handleSave,
          },
        ]}
      />,
    );

    expect(screen.getByTestId("left-summary")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xóa" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hủy" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Lưu thay đổi" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    expect(handleSave).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Xóa" }));
    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  it("respects disabled and loading action states", () => {
    render(
      <DrawerFooter
        actions={[
          {
            label: "Vô hiệu hóa",
            disabled: true,
          },
          {
            label: "Đang tải",
            loading: true,
          },
        ]}
      />,
    );

    const disabledBtn = screen.getByRole("button", { name: "Vô hiệu hóa" });
    expect(disabledBtn).toBeDisabled();

    const loadingBtn = screen.getByRole("button", { name: "Đang tải" });
    expect(loadingBtn).toBeDisabled();
  });
});
