import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { V2StatusBar } from "./V2StatusBar";

describe("V2StatusBar Molecule", () => {
  it("renders with 28px height, breadcrumbs and branch badge", () => {
    const handleBranch = vi.fn();

    render(
      <V2StatusBar
        breadcrumbs={[{ label: "Bán hàng" }, { label: "Đơn bán hàng" }]}
        branchName="Chi nhánh Sài Gòn"
        companyName="Enterprise HQ"
        onBranchClick={handleBranch}
      />,
    );

    const statusBar = screen.getByTestId("v2-status-bar");
    expect(statusBar).toBeInTheDocument();
    expect(statusBar).toHaveClass("h-7");

    expect(screen.getByText("Bán hàng")).toBeInTheDocument();
    expect(screen.getByText("Đơn bán hàng")).toBeInTheDocument();
    expect(screen.getByText("Chi nhánh Sài Gòn")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Chi nhánh: Chi nhánh Sài Gòn" }),
    );
    expect(handleBranch).toHaveBeenCalledTimes(1);
  });

  it("renders statusActions when provided", () => {
    render(
      <V2StatusBar
        breadcrumbs={[{ label: "Kho" }]}
        statusActions={<span data-testid="custom-action">Sync OK</span>}
      />,
    );

    expect(screen.getByTestId("custom-action")).toBeInTheDocument();
  });
});
