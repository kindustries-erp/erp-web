import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { V2Tooltip, AppTooltip } from "./V2Tooltip";
import * as useViewportModule from "@/v2/shared/hooks/useViewport";

describe("V2Tooltip Atom", () => {
  it("renders trigger element properly", () => {
    render(
      <V2Tooltip content="Gợi ý thao tác">
        <button type="button">Nút thử nghiệm</button>
      </V2Tooltip>,
    );

    expect(screen.getByText("Nút thử nghiệm")).toBeInTheDocument();
  });

  it("displays tooltip content on focus on desktop", async () => {
    vi.spyOn(useViewportModule, "useViewport").mockReturnValue({
      width: 1280,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    render(
      <V2Tooltip content="Nội dung tooltip hữu ích" delayDuration={0}>
        <button type="button">Di chuột vào tôi</button>
      </V2Tooltip>,
    );

    const trigger = screen.getByText("Di chuột vào tôi");
    fireEvent.focus(trigger);

    await waitFor(() => {
      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent("Nội dung tooltip hữu ích");
    });
  });

  it("bypasses tooltip and renders only children when disabled is true", () => {
    render(
      <V2Tooltip content="Tooltip không được hiện" disabled>
        <button type="button">Nút bị tắt tooltip</button>
      </V2Tooltip>,
    );

    const trigger = screen.getByText("Nút bị tắt tooltip");
    fireEvent.focus(trigger);

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("bypasses tooltip and renders only children when isMobile is true", () => {
    vi.spyOn(useViewportModule, "useViewport").mockReturnValue({
      width: 375,
      height: 667,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    render(
      <V2Tooltip content="Tooltip ẩn trên mobile">
        <button type="button">Nút trên điện thoại</button>
      </V2Tooltip>,
    );

    const trigger = screen.getByText("Nút trên điện thoại");
    fireEvent.focus(trigger);

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("exports AppTooltip as alias of V2Tooltip", () => {
    expect(AppTooltip).toBe(V2Tooltip);
  });
});
