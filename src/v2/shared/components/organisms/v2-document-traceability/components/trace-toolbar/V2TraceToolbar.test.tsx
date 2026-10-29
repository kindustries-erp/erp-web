import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2TraceToolbar, type V2TraceToolbarProps } from "./V2TraceToolbar";
import { V2TraceLinkTypeMenu } from "./V2TraceLinkTypeMenu";
import "../../traceability.locale";

const baseProps = (
  over: Partial<V2TraceToolbarProps> = {},
): V2TraceToolbarProps => ({
  linkedCount: 2,
  canLink: true,
  linkTypes: ["BANK_TXN", "PURCHASE_ORDER"],
  linkOpen: false,
  onLinkOpenChange: vi.fn(),
  onSelectLinkType: vi.fn(),
  viewMode: "canvas",
  onViewModeChange: vi.fn(),
  isFullscreen: false,
  onToggleFullscreen: vi.fn(),
  ...over,
});

describe("V2TraceToolbar", () => {
  it("shows the number of linked documents", () => {
    render(<V2TraceToolbar {...baseProps({ linkedCount: 3 })} />);
    expect(screen.getByText("Tổng chứng từ: 3")).toBeInTheDocument();
  });

  it("switches the view mode", () => {
    const onViewModeChange = vi.fn();
    render(<V2TraceToolbar {...baseProps({ onViewModeChange })} />);
    fireEvent.click(screen.getByText("Bảng kê"));
    expect(onViewModeChange).toHaveBeenCalledWith("table");
  });

  it("hides the link button when linking is not allowed", () => {
    render(<V2TraceToolbar {...baseProps({ canLink: false })} />);
    expect(screen.queryByText("Ghép nối chứng từ")).toBeNull();
  });

  it("toggles full screen", () => {
    const onToggleFullscreen = vi.fn();
    render(<V2TraceToolbar {...baseProps({ onToggleFullscreen })} />);
    fireEvent.click(screen.getByLabelText("Toàn màn hình"));
    expect(onToggleFullscreen).toHaveBeenCalledTimes(1);
  });
});

describe("V2TraceLinkTypeMenu", () => {
  it("links at once when only one type is allowed", () => {
    const onSelect = vi.fn();
    render(
      <V2TraceLinkTypeMenu
        types={["SALES_ORDER"]}
        open={false}
        onOpenChange={vi.fn()}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText("Ghép nối chứng từ"));
    expect(onSelect).toHaveBeenCalledWith("SALES_ORDER");
  });

  it("lists every allowed type and reports the chosen one", () => {
    const onSelect = vi.fn();
    render(
      <V2TraceLinkTypeMenu
        types={["BANK_TXN", "PURCHASE_ORDER"]}
        open
        onOpenChange={vi.fn()}
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText("Đơn mua hàng (PO)")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Sao kê / Sổ quỹ"));
    expect(onSelect).toHaveBeenCalledWith("BANK_TXN");
  });
});
