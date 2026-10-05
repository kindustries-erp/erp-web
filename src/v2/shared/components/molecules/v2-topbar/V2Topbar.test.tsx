import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { useAppStore } from "@/core/config/appStore";
import { V2Topbar } from "./V2Topbar";

describe("V2Topbar Molecule", () => {
  beforeEach(() => {
    act(() => {
      useAppStore.getState().setLocale("vi");
    });
  });

  it("renders with 36px height, breadcrumbs, search button, language switcher and branch badge", () => {
    const handleSearch = vi.fn();
    const handleBranch = vi.fn();

    render(
      <V2Topbar
        breadcrumbs={[{ label: "Bán hàng" }, { label: "Đơn bán hàng" }]}
        branchName="Chi nhánh Sài Gòn"
        companyName="Enterprise HQ"
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

    // Language switcher
    expect(screen.getByRole("button", { name: "VI" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "EN" })).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Tìm kiếm nhanh hệ thống" }),
    );
    expect(handleSearch).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("button", { name: "Chi nhánh: Chi nhánh Sài Gòn" }),
    );
    expect(handleBranch).toHaveBeenCalledTimes(1);
  });

  it("updates quick search placeholder and aria-label when switching language", () => {
    const { rerender } = render(
      <V2Topbar
        breadcrumbs={[{ label: "Bán hàng" }]}
        branchName="Chi nhánh Sài Gòn"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Tìm kiếm nhanh hệ thống" }),
    ).toBeInTheDocument();

    // Click EN in language switcher
    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    rerender(
      <V2Topbar
        breadcrumbs={[{ label: "Bán hàng" }]}
        branchName="Chi nhánh Sài Gòn"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Quick system search" }),
    ).toBeInTheDocument();
  });
});
