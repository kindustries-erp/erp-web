import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { V2ConfirmModal } from "./V2ConfirmModal";
import * as viewportHook from "@/v2/shared/hooks/useViewport";

describe("V2ConfirmModal Molecule", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders Desktop confirm modal with title, message and action buttons", () => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 1200,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <V2ConfirmModal
        open={true}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa bản ghi này không?"
        confirmLabel="Đồng ý xóa"
        cancelLabel="Bỏ qua"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
    );

    expect(screen.getByText("Xác nhận xóa")).toBeInTheDocument();
    expect(
      screen.getByText("Bạn có chắc chắn muốn xóa bản ghi này không?"),
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: "Đồng ý xóa" });
    const cancelBtn = screen.getByRole("button", { name: "Bỏ qua" });

    expect(confirmBtn).toHaveClass("bg-destructive");

    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it("disables buttons when isLoading is true", () => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 1200,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    const handleConfirm = vi.fn();

    render(
      <V2ConfirmModal
        open={true}
        title="Đang xử lý"
        message="Vui lòng đợi trong giây lát"
        isLoading={true}
        onConfirm={handleConfirm}
        onCancel={() => {}}
      />,
    );

    const cancelBtn = screen.getByRole("button", { name: "Hủy" });
    expect(cancelBtn).toBeDisabled();

    const confirmBtn = screen.getByRole("button", { name: "Xác nhận" });
    expect(confirmBtn).toBeDisabled();
    expect(confirmBtn).toHaveAttribute("aria-busy", "true");

    fireEvent.click(confirmBtn);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it("renders Mobile Bottom Sheet when isMobile is true", () => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 375,
      height: 667,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    render(
      <V2ConfirmModal
        open={true}
        title="Xác nhận trên Mobile"
        message="Nội dung cảnh báo cho mobile"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByText("Xác nhận trên Mobile")).toBeInTheDocument();
    expect(
      screen.getByText("Nội dung cảnh báo cho mobile"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("v2-confirm-modal-grab-handle"),
    ).toBeInTheDocument();
  });
});
