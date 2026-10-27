import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2LinkSelectionModal } from "./V2LinkSelectionModal";
import "@/v2/modules/finance-invoice/components/organisms/invoice-link-selection/invoice-link-selection.locale";

describe("V2LinkSelectionModal", () => {
  it("renders the title and its children when open", () => {
    render(
      <V2LinkSelectionModal open onClose={vi.fn()} title="Chọn đơn mua hàng">
        <p>Nội dung bảng</p>
      </V2LinkSelectionModal>,
    );
    expect(screen.getByText("Chọn đơn mua hàng")).toBeInTheDocument();
    expect(screen.getByText("Nội dung bảng")).toBeInTheDocument();
  });

  it("closes through the cancel button", () => {
    const onClose = vi.fn();
    render(
      <V2LinkSelectionModal open onClose={onClose} title="T">
        <p>x</p>
      </V2LinkSelectionModal>,
    );
    fireEvent.click(screen.getByText("Hủy"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders extra footer actions next to cancel", () => {
    render(
      <V2LinkSelectionModal
        open
        onClose={vi.fn()}
        title="T"
        footerActions={<button>Xác nhận</button>}
      >
        <p>x</p>
      </V2LinkSelectionModal>,
    );
    expect(screen.getByText("Xác nhận")).toBeInTheDocument();
  });
});
