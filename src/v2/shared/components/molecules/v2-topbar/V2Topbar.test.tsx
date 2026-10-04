import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { V2Topbar } from "./V2Topbar";

describe("V2Topbar Molecule", () => {
  it("renders with 36px height, breadcrumbs, search button and branch badge", () => {
    const handleSearch = vi.fn();
    const handleBranch = vi.fn();

    render(
      <V2Topbar
        breadcrumbs={[{ label: "Bán hàng" }, { label: "Đơn bán hàng" }]}
        branchName="Chi nhánh Sài Gòn"
        companyName="Liouni HQ"
        onSearchClick={handleSearch}
        onBranchClick={handleBranch}
      />,
    );

    const topbar = screen.getByTestId("v2-topbar");
    expect(topbar).toBeInTheDocument();
    expect(topbar).toHaveClass("h-9");

    expect(screen.getByText("Bán hàng")).toBeInTheDocument();
    expect(screen.getByText("Đơn bán hàng")).toBeInTheDocument();
    expect(screen.getByText("Chi nhánh Sài Gòn")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Tìm kiếm nhanh hệ thống" }),
    );
    expect(handleSearch).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("button", { name: "Chi nhánh: Chi nhánh Sài Gòn" }),
    );
    expect(handleBranch).toHaveBeenCalledTimes(1);
  });
});
