import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, renderHook } from "@testing-library/react";
import { createRef } from "react";
import { useV2PopoverDismiss } from "./useV2PopoverDismiss";

const PANEL = "[data-test-panel]";

const makeContainer = () => {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
};

describe("useV2PopoverDismiss", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("đóng khi pointerdown nằm ngoài container", () => {
    const onClose = vi.fn();
    const container = makeContainer();
    const ref = createRef<HTMLElement>();
    (ref as { current: HTMLElement | null }).current = container;
    renderHook(() =>
      useV2PopoverDismiss({
        open: true,
        onClose,
        containerRef: ref,
        panelSelector: PANEL,
      }),
    );

    fireEvent.pointerDown(document.body, { button: 0 });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("không đóng khi pointerdown bên trong container hoặc panel", () => {
    const onClose = vi.fn();
    const container = makeContainer();
    const panel = document.createElement("div");
    panel.setAttribute("data-test-panel", "");
    document.body.appendChild(panel);
    const ref = createRef<HTMLElement>();
    (ref as { current: HTMLElement | null }).current = container;
    renderHook(() =>
      useV2PopoverDismiss({
        open: true,
        onClose,
        containerRef: ref,
        panelSelector: PANEL,
      }),
    );

    fireEvent.pointerDown(container, { button: 0 });
    fireEvent.pointerDown(panel, { button: 0 });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("không lắng nghe khi đang đóng", () => {
    const onClose = vi.fn();
    const ref = createRef<HTMLElement>();
    renderHook(() =>
      useV2PopoverDismiss({
        open: false,
        onClose,
        containerRef: ref,
        panelSelector: PANEL,
      }),
    );

    fireEvent.pointerDown(document.body, { button: 0 });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("mở popover thứ hai thì đóng popover thứ nhất", () => {
    const closeA = vi.fn();
    const closeB = vi.fn();
    const ref = createRef<HTMLElement>();
    const first = renderHook(
      ({ open }) =>
        useV2PopoverDismiss({
          open,
          onClose: closeA,
          containerRef: ref,
          panelSelector: PANEL,
        }),
      { initialProps: { open: true } },
    );
    expect(closeA).not.toHaveBeenCalled();

    renderHook(() =>
      useV2PopoverDismiss({
        open: true,
        onClose: closeB,
        containerRef: ref,
        panelSelector: PANEL,
      }),
    );
    expect(closeA).toHaveBeenCalledTimes(1);
    expect(closeB).not.toHaveBeenCalled();
    first.unmount();
  });

  it("gỡ listener khi unmount", () => {
    const onClose = vi.fn();
    const ref = createRef<HTMLElement>();
    const { unmount } = renderHook(() =>
      useV2PopoverDismiss({
        open: true,
        onClose,
        containerRef: ref,
        panelSelector: PANEL,
      }),
    );

    unmount();
    fireEvent.pointerDown(document.body, { button: 0 });
    expect(onClose).not.toHaveBeenCalled();
  });
});
