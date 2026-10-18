import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DrawerRelatedDeck } from "./DrawerRelatedDeck";

describe("V2 DrawerRelatedDeck Molecule", () => {
  it("renders null when tabs is empty and no customContent", () => {
    const { container } = render(<DrawerRelatedDeck tabs={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders tabs, badges, and tab content correctly", () => {
    const handleTabChange = vi.fn();
    render(
      <DrawerRelatedDeck
        tabs={[
          {
            key: "history",
            label: "Lịch sử duyệt",
            badgeCount: 5,
            content: <div data-testid="tab-history">Dữ liệu lịch sử</div>,
          },
          {
            key: "docs",
            label: "Chứng từ liên quan",
            badgeCount: 2,
            content: <div data-testid="tab-docs">Dữ liệu chứng từ</div>,
          },
        ]}
        onTabChange={handleTabChange}
      />,
    );

    expect(screen.getByText("Lịch sử duyệt")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Chứng từ liên quan")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    // Default first tab is active
    expect(screen.getByTestId("tab-history")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-docs")).not.toBeInTheDocument();

    // Click second tab
    fireEvent.click(screen.getByText("Chứng từ liên quan"));
    expect(handleTabChange).toHaveBeenCalledWith("docs");
    expect(screen.getByTestId("tab-docs")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-history")).not.toBeInTheDocument();
  });

  it("collapses and expands deck when chevron toggle is clicked", () => {
    render(
      <DrawerRelatedDeck
        defaultCollapsed={false}
        tabs={[
          {
            key: "info",
            label: "Thông tin",
            content: <div data-testid="info-content">Nội dung chi tiết</div>,
          },
        ]}
      />,
    );

    expect(screen.getByTestId("info-content")).toBeInTheDocument();

    const toggleBtn = screen.getByRole("button", { name: "Thu gọn" });
    fireEvent.click(toggleBtn);

    // Collapsed -> content hidden
    expect(screen.queryByTestId("info-content")).not.toBeInTheDocument();

    // Expand again
    const expandBtn = screen.getByRole("button", { name: "Mở rộng" });
    fireEvent.click(expandBtn);
    expect(screen.getByTestId("info-content")).toBeInTheDocument();
  });

  it("renders customContent and customTitle fallback", () => {
    render(
      <DrawerRelatedDeck
        customTitle="Bảng Kê Hóa Đơn"
        customContent={<div data-testid="custom-table">Table data</div>}
      />,
    );

    expect(screen.getByText("Bảng Kê Hóa Đơn")).toBeInTheDocument();
    expect(screen.getByTestId("custom-table")).toBeInTheDocument();
  });
});
