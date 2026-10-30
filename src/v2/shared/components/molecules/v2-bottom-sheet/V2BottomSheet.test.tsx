import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { V2BottomSheet } from "./V2BottomSheet";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_k: string, fallback: string) => fallback,
    locale: "vi",
  }),
}));

describe("V2BottomSheet Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders bottom sheet content when open is true", () => {
    render(
      <V2BottomSheet
        open={true}
        onOpenChange={vi.fn()}
        title="Danh mục phân hệ"
      >
        <div>Nội dung phân hệ</div>
      </V2BottomSheet>,
    );

    expect(screen.getByTestId("v2-bottom-sheet-content")).toBeDefined();
    expect(screen.getByTestId("v2-bottom-sheet-drag-handle")).toBeDefined();
    expect(screen.getByText("Danh mục phân hệ")).toBeDefined();
    expect(screen.getByText("Nội dung phân hệ")).toBeDefined();
  });

  it("triggers onOpenChange(false) when clicking close button", () => {
    const handleOpenChange = vi.fn();
    render(
      <V2BottomSheet
        open={true}
        onOpenChange={handleOpenChange}
        title="Phân hệ"
      >
        <div>Nội dung</div>
      </V2BottomSheet>,
    );

    const closeBtn = screen.getByTestId("v2-bottom-sheet-close-btn");
    fireEvent.click(closeBtn);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders optional footer, subtitle, and icon properly", () => {
    render(
      <V2BottomSheet
        open={true}
        onOpenChange={vi.fn()}
        title="Tiêu đề"
        subtitle="Mô tả phụ"
        icon={<span data-testid="custom-icon">Icon</span>}
        footer={<button type="button">Xác nhận</button>}
      >
        <div>Body</div>
      </V2BottomSheet>,
    );

    expect(screen.getByText("Mô tả phụ")).toBeDefined();
    expect(screen.getByTestId("v2-bottom-sheet-icon")).toBeDefined();
    expect(screen.getByTestId("custom-icon")).toBeDefined();
    expect(screen.getByTestId("v2-bottom-sheet-footer")).toBeDefined();
    expect(screen.getByText("Xác nhận")).toBeDefined();
  });
});
