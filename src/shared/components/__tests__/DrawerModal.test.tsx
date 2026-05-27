import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { DrawerModal } from "@/shared/components/DrawerModal";

// Mock useT — returns identity function
vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => key,
}));

describe("DrawerModal overlay z-index behavior", () => {
  it("renders overlay with z-index -1 when open=false (idle)", () => {
    const { baseElement } = render(
      <DrawerModal open={false} onClose={() => {}} title="Test">
        <p>content</p>
      </DrawerModal>,
    );

    const overlay = baseElement.querySelector(".slide-panel-overlay");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveStyle({ zIndex: "-1" });
    expect(overlay).not.toHaveClass("open");
  });

  it("renders overlay with opacity 0 when open=false (via CSS class absence)", () => {
    const { baseElement } = render(
      <DrawerModal open={false} onClose={() => {}} title="Test">
        <p>content</p>
      </DrawerModal>,
    );

    const overlay = baseElement.querySelector(".slide-panel-overlay");
    // Without the "open" class, CSS applies opacity: 0 and pointer-events: none
    expect(overlay).not.toHaveClass("open");
  });

  it("renders overlay with elevated z-index when open=true", () => {
    const { baseElement } = render(
      <DrawerModal open={true} onClose={() => {}} title="Test">
        <p>content</p>
      </DrawerModal>,
    );

    const overlay = baseElement.querySelector(".slide-panel-overlay");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveStyle({ zIndex: "400" });
    expect(overlay).toHaveClass("open");
  });

  it("uses custom zIndex when open=true", () => {
    const { baseElement } = render(
      <DrawerModal open={true} onClose={() => {}} title="Test" zIndex={500}>
        <p>content</p>
      </DrawerModal>,
    );

    const overlay = baseElement.querySelector(".slide-panel-overlay");
    expect(overlay).toHaveStyle({ zIndex: "500" });
  });

  it("keeps elevated z-index during closing animation, then drops to -1", async () => {
    vi.useFakeTimers();

    const { baseElement, rerender } = render(
      <DrawerModal open={true} onClose={() => {}} title="Test">
        <p>content</p>
      </DrawerModal>,
    );

    const overlay = baseElement.querySelector(".slide-panel-overlay");
    expect(overlay).toHaveStyle({ zIndex: "400" });

    // Close the drawer
    rerender(
      <DrawerModal open={false} onClose={() => {}} title="Test">
        <p>content</p>
      </DrawerModal>,
    );

    // Immediately after close: z-index should still be elevated for animation
    expect(overlay).toHaveStyle({ zIndex: "400" });
    expect(overlay).not.toHaveClass("open");

    // After animation delay (280ms), z-index drops to -1
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(overlay).toHaveStyle({ zIndex: "-1" });

    vi.useRealTimers();
  });

  it("multiple DrawerModals all have z-index -1 when closed", () => {
    const { baseElement } = render(
      <>
        <DrawerModal open={false} onClose={() => {}} title="Drawer A">
          <p>A</p>
        </DrawerModal>
        <DrawerModal open={false} onClose={() => {}} title="Drawer B">
          <p>B</p>
        </DrawerModal>
        <DrawerModal open={false} onClose={() => {}} title="Drawer C">
          <p>C</p>
        </DrawerModal>
      </>,
    );

    const overlays = baseElement.querySelectorAll(".slide-panel-overlay");
    expect(overlays).toHaveLength(3);

    overlays.forEach((overlay) => {
      expect(overlay).toHaveStyle({ zIndex: "-1" });
      expect(overlay).not.toHaveClass("open");
    });
  });

  it("does not block interaction when closed (no pointer-events via class)", () => {
    const { baseElement } = render(
      <DrawerModal open={false} onClose={() => {}} title="Test">
        <p>content</p>
      </DrawerModal>,
    );

    const overlay = baseElement.querySelector(".slide-panel-overlay");
    // Without "open" class, CSS sets pointer-events: none
    expect(overlay).not.toHaveClass("open");
    // z-index -1 ensures it's below everything
    expect(overlay).toHaveStyle({ zIndex: "-1" });
  });
});
