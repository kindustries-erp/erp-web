import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InvoiceExportColumnActions } from "./InvoiceExportColumnActions";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || _key,
  }),
}));

describe("InvoiceExportColumnActions", () => {
  it("renders all 3 action buttons", () => {
    render(
      <InvoiceExportColumnActions
        onSelectAll={vi.fn()}
        onResetDefault={vi.fn()}
        onDeselectAll={vi.fn()}
      />,
    );

    expect(screen.getByText("Chọn tất cả")).toBeInTheDocument();
    expect(screen.getByText("Mặc định")).toBeInTheDocument();
    expect(screen.getByText("Bỏ chọn")).toBeInTheDocument();
  });

  it("triggers callback when each button is clicked", () => {
    const handleSelectAll = vi.fn();
    const handleResetDefault = vi.fn();
    const handleDeselectAll = vi.fn();

    render(
      <InvoiceExportColumnActions
        onSelectAll={handleSelectAll}
        onResetDefault={handleResetDefault}
        onDeselectAll={handleDeselectAll}
      />,
    );

    fireEvent.click(screen.getByText("Chọn tất cả"));
    expect(handleSelectAll).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Mặc định"));
    expect(handleResetDefault).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Bỏ chọn"));
    expect(handleDeselectAll).toHaveBeenCalledTimes(1);
  });

  it("stops propagation on click to avoid toggling parent collapsible header", () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick} data-testid="parent-container">
        <InvoiceExportColumnActions
          onSelectAll={vi.fn()}
          onResetDefault={vi.fn()}
          onDeselectAll={vi.fn()}
        />
      </div>,
    );

    fireEvent.click(screen.getByText("Chọn tất cả"));
    expect(parentClick).not.toHaveBeenCalled();
  });
});
