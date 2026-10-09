import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DrawerSection } from "./DrawerSection";

const wrapperOf = () => screen.getByTestId("drawer-section-body-wrapper");

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

    fireEvent.click(screen.getByText("Chi Tiết Đơn Hàng"));
    expect(wrapperOf()).toHaveAttribute("aria-hidden", "false");

    const toggleBtn = screen.getByTestId("drawer-section-toggle-btn");
    fireEvent.click(toggleBtn);

    // Thu gọn: nội dung vẫn trong DOM (animate như V1) nhưng bị ẩn khỏi a11y và không tương tác được
    expect(screen.getByTestId("section-content")).toBeInTheDocument();
    expect(wrapperOf()).toHaveAttribute("aria-hidden", "true");
    expect(wrapperOf()).toHaveClass("grid-rows-[0fr]", "opacity-0");

    fireEvent.click(toggleBtn);
    expect(wrapperOf()).toHaveAttribute("aria-hidden", "false");
    expect(wrapperOf()).toHaveClass("grid-rows-[1fr]", "opacity-100");
  });

  it("exposes aria-expanded and aria-controls pointing at the body", () => {
    render(
      <DrawerSection title="Section">
        <p>x</p>
      </DrawerSection>,
    );

    const toggleBtn = screen.getByTestId("drawer-section-toggle-btn");
    expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
    expect(toggleBtn.getAttribute("aria-controls")).toBe(wrapperOf().id);

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
  });

  it("labels the toggle in Vietnamese based on state (i18n, not hardcoded English)", () => {
    render(
      <DrawerSection title="Section">
        <p>x</p>
      </DrawerSection>,
    );

    const toggleBtn = screen.getByTestId("drawer-section-toggle-btn");
    expect(toggleBtn).toHaveAttribute("aria-label", "Thu gọn phân vùng");
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-label", "Mở rộng phân vùng");
  });

  it("shows the count as (N) next to the title when count is provided", () => {
    render(
      <DrawerSection title="Danh sách" count={12}>
        <p>x</p>
      </DrawerSection>,
    );

    expect(screen.getByText("(12)")).toBeInTheDocument();
  });

  it("does not show a count when count is omitted", () => {
    render(
      <DrawerSection title="Danh sách">
        <p>x</p>
      </DrawerSection>,
    );

    expect(screen.queryByText(/^\(\d+\)$/)).not.toBeInTheDocument();
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

    expect(wrapperOf()).toHaveAttribute("aria-hidden", "true");

    fireEvent.click(screen.getByTestId("drawer-section-toggle-btn"));
    expect(handleToggle).toHaveBeenCalledTimes(1);

    rerender(
      <DrawerSection
        title="Section Có Kiểm Soát"
        collapsed={false}
        onToggleCollapse={handleToggle}
      >
        <p data-testid="controlled-content">Nội dung</p>
      </DrawerSection>,
    );
    expect(wrapperOf()).toHaveAttribute("aria-hidden", "false");
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
