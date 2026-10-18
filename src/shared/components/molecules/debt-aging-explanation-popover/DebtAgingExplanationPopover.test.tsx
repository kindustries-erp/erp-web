import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DebtAgingExplanationPopover } from "./DebtAgingExplanationPopover";

describe("DebtAgingExplanationPopover", () => {
  it("renders trigger button and opens popover on click", () => {
    render(<DebtAgingExplanationPopover />);
    const trigger = screen.getByRole("button");
    expect(trigger).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByText("4 Nhóm Tuổi Nợ")).toBeInTheDocument();
    expect(screen.getByText("Dự Báo Thuật Toán")).toBeInTheDocument();
  });

  it("switches to algorithms tab on click", () => {
    render(<DebtAgingExplanationPopover context="invoice" />);
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);

    const algoTab = screen.getByText("Dự Báo Thuật Toán");
    fireEvent.click(algoTab);
    expect(screen.getByText(/1\. Dự báo dòng tiền/i)).toBeInTheDocument();
  });
});
