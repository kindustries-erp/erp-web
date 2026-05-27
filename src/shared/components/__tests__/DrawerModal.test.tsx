import { describe, it, expect, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { DrawerModal } from "@/shared/components/DrawerModal";

// Mock useT — returns identity function
vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => key,
}));

describe("DrawerModal overlay mount/unmount behavior", () => {
  it("does NOT render any DOM element when open=false (no blocker in DOM)", () => {
    const { baseElement } = render(
      <DrawerModal open={false} onClose={() => {}} title="Test">
        <p>content</p>
      </DrawerModal>,
    );

    const overlay = baseElement.querySelector(".slide-panel-overlay");
    expect(overlay).not.toBeInTheDocument();
  });

  it("renders overlay in DOM when open=true", async () => {
    vi.useFakeTimers();

    const { baseElement } = render(
      <DrawerModal open={true} onClose={() => {}} title="Test">
        <p>content</p>
      </DrawerModal>,
    );

    // After rAF triggers, visible becomes true
    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    const overlay = baseElement.querySelector(".slide-panel-overlay");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass("open");
    expect(overlay).toHaveStyle({ zIndex: "400" });

    vi.useRealTimers();
  });

  it("uses custom zIndex when open=true", async () => {
    vi.useFakeTimers();

    const { baseElement } = render(
      <DrawerModal open={true} onClose={() => {}} title="Test" zIndex={500}>
        <p>content</p>
      </DrawerModal>,
    );

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    const overlay = baseElement.querySelector(".slide-panel-overlay");
    expect(overlay).toHaveStyle({ zIndex: "500" });

    vi.useRealTimers();
  });

  it("keeps overlay in DOM during closing animation, then removes it", async () => {
    vi.useFakeTimers();

    const { baseElement, rerender } = render(
      <DrawerModal open={true} onClose={() => {}} title="Test">
        <p>content</p>
      </DrawerModal>,
    );

    // Let enter animation trigger
    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    let overlay = baseElement.querySelector(".slide-panel-overlay");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass("open");

    // Close the drawer
    rerender(
      <DrawerModal open={false} onClose={() => {}} title="Test">
        <p>content</p>
      </DrawerModal>,
    );

    // Immediately after close: overlay still in DOM for exit animation, but no "open" class
    overlay = baseElement.querySelector(".slide-panel-overlay");
    expect(overlay).toBeInTheDocument();
    expect(overlay).not.toHaveClass("open");

    // After animation delay (280ms), overlay is removed from DOM entirely
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    overlay = baseElement.querySelector(".slide-panel-overlay");
    expect(overlay).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it("multiple closed DrawerModals leave zero DOM footprint", () => {
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
    expect(overlays).toHaveLength(0);
  });

  it("re-opening after close works correctly", async () => {
    vi.useFakeTimers();

    const { baseElement, rerender } = render(
      <DrawerModal open={true} onClose={() => {}} title="Test">
        <p>content</p>
      </DrawerModal>,
    );

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    // Close
    rerender(
      <DrawerModal open={false} onClose={() => {}} title="Test">
        <p>content</p>
      </DrawerModal>,
    );

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Verify unmounted
    expect(
      baseElement.querySelector(".slide-panel-overlay"),
    ).not.toBeInTheDocument();

    // Re-open
    rerender(
      <DrawerModal open={true} onClose={() => {}} title="Test">
        <p>content</p>
      </DrawerModal>,
    );

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    const overlay = baseElement.querySelector(".slide-panel-overlay");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass("open");

    vi.useRealTimers();
  });
});
