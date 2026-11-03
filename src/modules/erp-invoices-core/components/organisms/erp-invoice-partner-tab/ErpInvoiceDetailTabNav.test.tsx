import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErpInvoiceDetailTabNav } from "./ErpInvoiceDetailTabNav";

function ControlledNavigation() {
  const [mode, setMode] = useState<"template" | "pdf">("template");
  return (
    <ErpInvoiceDetailTabNav
      detailViewMode={mode}
      onDetailViewModeChange={setMode}
    />
  );
}

describe("ErpInvoiceDetailTabNav view mode controls", () => {
  it("marks the content-matching button active in both directions", () => {
    render(<ControlledNavigation />);
    const template = screen.getByRole("tab", { name: /Xem trước HĐ thuần/ });
    const documents = screen.getByRole("tab", { name: /Tài liệu & PDF/ });

    expect(template).toHaveAttribute("aria-selected", "true");
    expect(template).toHaveAttribute("data-state", "active");
    expect(documents).toHaveAttribute("aria-selected", "false");
    expect(documents).toHaveAttribute("data-state", "inactive");

    fireEvent.click(documents);
    expect(template).toHaveAttribute("aria-selected", "false");
    expect(documents).toHaveAttribute("aria-selected", "true");

    fireEvent.click(template);
    expect(template).toHaveAttribute("aria-selected", "true");
    expect(documents).toHaveAttribute("aria-selected", "false");
  });
});
