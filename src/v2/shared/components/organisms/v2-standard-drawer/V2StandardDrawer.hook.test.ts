import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStandardDrawer } from "./V2StandardDrawer.hook";
import { resetDrawerStack } from "./v2DrawerStack";
import {
  V2_DRAWER_SIZE_CLASSES,
  type V2StandardDrawerProps,
} from "./V2StandardDrawer.type";

const tabs = [
  { key: "details", label: "Chi tiết" },
  { key: "history", label: "Lịch sử" },
] as unknown as V2StandardDrawerProps["tabs"];

const makeProps = (overrides: Partial<V2StandardDrawerProps> = {}) =>
  ({
    open: true,
    onClose: vi.fn(),
    tabs,
    id: "drawer-hook-test",
    ...overrides,
  }) as unknown as V2StandardDrawerProps;

describe("useStandardDrawer", () => {
  beforeEach(() => {
    resetDrawerStack();
  });

  it("defaults to the first header tab and the 2-column xl layout", () => {
    const { result } = renderHook(() => useStandardDrawer(makeProps()));

    expect(result.current.activeTabKey).toBe("details");
    expect(result.current.activeTabItem?.key).toBe("details");
    expect(result.current.effectiveLayout).toBe("2-columns");
    expect(result.current.enableFullscreen).toBe(true);
    expect(result.current.collapsibleRightPanel).toBe(true);
    expect(result.current.sizeClass).toBe(V2_DRAWER_SIZE_CLASSES.xl);
  });

  it("uses 1-column layout and disables fullscreen and collapse for sm size", () => {
    const { result } = renderHook(() =>
      useStandardDrawer(makeProps({ size: "sm" })),
    );

    expect(result.current.effectiveLayout).toBe("1-column");
    expect(result.current.enableFullscreen).toBe(false);
    expect(result.current.collapsibleRightPanel).toBe(false);
  });

  it("closes immediately in view mode", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useStandardDrawer(makeProps({ onClose })),
    );

    act(() => result.current.requestClose());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(result.current.showConfirmClose).toBe(false);
  });

  it("asks for confirmation in edit mode and closes only after confirm", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useStandardDrawer(
        makeProps({ onClose, mode: "edit", confirmOnClose: true }),
      ),
    );

    act(() => result.current.requestClose());
    expect(result.current.showConfirmClose).toBe(true);
    expect(onClose).not.toHaveBeenCalled();

    act(() => result.current.cancelClose());
    expect(result.current.showConfirmClose).toBe(false);

    act(() => result.current.requestClose());
    act(() => result.current.confirmClose());
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(result.current.showConfirmClose).toBe(false);
  });

  it("toggles fullscreen with internal state and notifies the parent", () => {
    const onFullscreenChange = vi.fn();
    const { result } = renderHook(() =>
      useStandardDrawer(makeProps({ onFullscreenChange })),
    );

    act(() => result.current.toggleFullscreen());

    expect(result.current.isFullscreen).toBe(true);
    expect(result.current.sizeClass).toContain("w-screen");
    expect(onFullscreenChange).toHaveBeenCalledWith(true);
  });

  it("keeps fullscreen controlled by the parent when isFullscreen is provided", () => {
    const onFullscreenChange = vi.fn();
    const { result } = renderHook(() =>
      useStandardDrawer(makeProps({ isFullscreen: false, onFullscreenChange })),
    );

    act(() => result.current.toggleFullscreen());

    expect(result.current.isFullscreen).toBe(false);
    expect(onFullscreenChange).toHaveBeenCalledWith(true);
  });

  it("toggles right panel collapse and notifies the parent", () => {
    const onRightPanelCollapseChange = vi.fn();
    const { result } = renderHook(() =>
      useStandardDrawer(makeProps({ onRightPanelCollapseChange })),
    );

    act(() => result.current.toggleRightPanel());

    expect(result.current.isRightPanelCollapsed).toBe(true);
    expect(onRightPanelCollapseChange).toHaveBeenCalledWith(true);
  });

  it("closes the topmost drawer on Escape", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useStandardDrawer(makeProps({ onClose })),
    );
    expect(result.current.isTopmost).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("exits fullscreen on Escape before closing the drawer", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useStandardDrawer(makeProps({ onClose })),
    );

    act(() => result.current.toggleFullscreen());
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(result.current.isFullscreen).toBe(false);
    expect(onClose).not.toHaveBeenCalled();
  });
});
