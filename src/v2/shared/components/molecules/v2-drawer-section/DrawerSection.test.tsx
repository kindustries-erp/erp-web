import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DrawerSection } from "./DrawerSection";

describe("V2 DrawerSection Molecule", () => {
  it("renders title, titleExtra, and children properly", () => {
    render(
      <DrawerSection
        title="Thông Tin Chung"
        titleExtra={<span data-testid="extra-badge">Đang xử lý</span>}
      >
        <p>Nội dung section</p>
      </DrawerSection>,
    );

    expect(screen.getByText("Thông Tin Chung")).toBeInTheDocument();
    expect(screen.getByTestId("extra-badge")).toBeInTheDocument();
    expect(screen.getByText("Nội dung section")).toBeInTheDocument();
  });

  it("collapses when chevron icon is clicked, but NOT when header text is clicked (Arrow-Only Mandate)", () => {
    render(
      <DrawerSection title="Chi Tiết Đơn Hàng">
        <p data-testid="section-content">Nội dung không bị ẩn khi click text</p>
      </DrawerSection>,
    );

    const titleEl = screen.getByText("Chi Tiết Đơn Hàng");
    fireEvent.click(titleEl);
    // Content should still be visible because header click is disabled
    expect(screen.getByTestId("section-content")).toBeInTheDocument();

    // Now click the chevron button
    const toggleBtn = screen.getByTestId("drawer-section-toggle-btn");
    fireEvent.click(toggleBtn);

    // Content should now be collapsed (hidden)
    expect(screen.queryByTestId("section-content")).not.toBeInTheDocument();

    // Click again to expand
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId("section-content")).toBeInTheDocument();
  });

  it("respects controlled collapsed state and onToggleCollapse callback", () => {
    const handleToggle = vi.fn();
    const { rerender } = render(
      <DrawerSection
        title="Section Có Kiểm Soát"
        collapsed={true}
        onToggleCollapse={handleToggle}
      >
        <p data-testid="controlled-content">Nội dung</p>
      </DrawerSection>,
    );

    expect(screen.queryByTestId("controlled-content")).not.toBeInTheDocument();

    const toggleBtn = screen.getByTestId("drawer-section-toggle-btn");
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);

    // Rerender with collapsed=false
    rerender(
      <DrawerSection
        title="Section Có Kiểm Soát"
        collapsed={false}
        onToggleCollapse={handleToggle}
      >
        <p data-testid="controlled-content">Nội dung</p>
      </DrawerSection>,
    );
    expect(screen.getByTestId("controlled-content")).toBeInTheDocument();
  });

  it("renders container without header when hideHeader is true", () => {
    render(
      <DrawerSection title="Tiêu đề ẩn" hideHeader>
        <p>Nội dung thẻ kính mờ không tiêu đề</p>
      </DrawerSection>,
    );

    expect(screen.queryByText("Tiêu đề ẩn")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("drawer-section-toggle-btn"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Nội dung thẻ kính mờ không tiêu đề"),
    ).toBeInTheDocument();
  });
});
