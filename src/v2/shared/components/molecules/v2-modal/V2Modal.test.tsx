import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { V2Modal } from "./V2Modal";
import * as viewportHook from "@/v2/shared/hooks/useViewport";

describe("V2Modal Molecule", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders Desktop modal with title, description, body and footer", () => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 1200,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    const handleOpenChange = vi.fn();

    render(
      <V2Modal
        open={true}
        onOpenChange={handleOpenChange}
        title="Tiêu đề Desktop"
        description="Mô tả Desktop"
        footer={<button type="button">Hành động</button>}
      >
        <p>Nội dung thân Desktop</p>
      </V2Modal>,
    );

    expect(screen.getByText("Tiêu đề Desktop")).toBeInTheDocument();
    expect(screen.getByText("Mô tả Desktop")).toBeInTheDocument();
    expect(screen.getByText("Nội dung thân Desktop")).toBeInTheDocument();
    expect(screen.getByText("Hành động")).toBeInTheDocument();
  });

  it("renders Mobile Bottom Sheet when isMobile is true", () => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 375,
      height: 667,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    render(
      <V2Modal open={true} onOpenChange={() => {}} title="Tiêu đề Mobile">
        <p>Nội dung thân Mobile</p>
      </V2Modal>,
    );

    expect(screen.getByText("Tiêu đề Mobile")).toBeInTheDocument();
    expect(screen.getByText("Nội dung thân Mobile")).toBeInTheDocument();
    expect(screen.getByTestId("v2-modal-grab-handle")).toBeInTheDocument();
  });

  it("renders custom sizes on Desktop correctly", () => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 1200,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    render(
      <V2Modal
        open={true}
        onOpenChange={() => {}}
        title="Modal Size Large"
        size="lg"
      >
        <div>Content</div>
      </V2Modal>,
    );

    const dialogContent = document.body.querySelector(".max-w-\\[560px\\]");
    expect(dialogContent).toBeInTheDocument();
  });

  it("triggers onOpenChange when close button is clicked", () => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 1200,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    const handleOpenChange = vi.fn();

    render(
      <V2Modal
        open={true}
        onOpenChange={handleOpenChange}
        title="Modal có nút đóng"
      >
        <div>Content</div>
      </V2Modal>,
    );

    const closeBtn = screen.getByRole("button", { name: "Close dialog" });
    fireEvent.click(closeBtn);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
