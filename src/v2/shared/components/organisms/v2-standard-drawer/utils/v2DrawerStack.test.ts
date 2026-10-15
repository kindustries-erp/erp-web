import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import {
  useV2DrawerStack,
  registerDrawer,
  unregisterDrawer,
  resetDrawerStack,
  getActiveStackSnapshot,
  V2_DESKTOP_STACK_OFFSET_PX,
  V2_MOBILE_STACK_OFFSET_PX,
  V2_BASE_DRAWER_Z_INDEX,
  V2_Z_INDEX_STEP,
} from "./v2DrawerStack";

describe("v2DrawerStack Module", () => {
  beforeEach(() => {
    resetDrawerStack();
  });

  it("registers and unregisters drawers in sequence", () => {
    registerDrawer("d1");
    registerDrawer("d2");
    expect(getActiveStackSnapshot()).toEqual(["d1", "d2"]);

    unregisterDrawer("d1");
    expect(getActiveStackSnapshot()).toEqual(["d2"]);

    resetDrawerStack();
    expect(getActiveStackSnapshot()).toEqual([]);
  });

  it("calculates depth, zIndex, and offsets for a single open drawer", () => {
    const { result } = renderHook(() => useV2DrawerStack("drawer-root", true));

    expect(result.current.depth).toBe(0);
    expect(result.current.isTopmost).toBe(true);
    expect(result.current.isUnderlying).toBe(false);
    expect(result.current.desktopShiftPx).toBe(0);
    expect(result.current.mobileTopOffsetPx).toBe(0);
    expect(result.current.zIndex).toBe(V2_BASE_DRAWER_Z_INDEX);
  });

  it("calculates depth, zIndex, and 20px step offsets for multiple stacked drawers", () => {
    const { result: d1 } = renderHook(() => useV2DrawerStack("d1", true));
    const { result: d2 } = renderHook(() => useV2DrawerStack("d2", true));
    const { result: d3 } = renderHook(() => useV2DrawerStack("d3", true));

    // d1 (root drawer)
    expect(d1.current.depth).toBe(0);
    expect(d1.current.isTopmost).toBe(false);
    expect(d1.current.isUnderlying).toBe(true);
    expect(d1.current.desktopShiftPx).toBe(0);
    expect(d1.current.zIndex).toBe(V2_BASE_DRAWER_Z_INDEX);

    // d2 (1st stacked drawer)
    expect(d2.current.depth).toBe(1);
    expect(d2.current.isTopmost).toBe(false);
    expect(d2.current.isUnderlying).toBe(true);
    expect(d2.current.desktopShiftPx).toBe(V2_DESKTOP_STACK_OFFSET_PX); // 20px
    expect(d2.current.mobileTopOffsetPx).toBe(V2_MOBILE_STACK_OFFSET_PX); // 16px
    expect(d2.current.zIndex).toBe(V2_BASE_DRAWER_Z_INDEX + V2_Z_INDEX_STEP); // 60

    // d3 (2nd stacked drawer - topmost)
    expect(d3.current.depth).toBe(2);
    expect(d3.current.isTopmost).toBe(true);
    expect(d3.current.isUnderlying).toBe(false);
    expect(d3.current.desktopShiftPx).toBe(V2_DESKTOP_STACK_OFFSET_PX * 2); // 40px
    expect(d3.current.mobileTopOffsetPx).toBe(V2_MOBILE_STACK_OFFSET_PX * 2); // 32px
    expect(d3.current.zIndex).toBe(
      V2_BASE_DRAWER_Z_INDEX + V2_Z_INDEX_STEP * 2,
    ); // 70
  });

  it("promotes underlying drawer to topmost when topmost closes", () => {
    const { result: d1 } = renderHook(() => useV2DrawerStack("d1", true));
    const { result: d2, rerender: rerenderD2 } = renderHook(
      ({ isOpen }) => useV2DrawerStack("d2", isOpen),
      { initialProps: { isOpen: true } },
    );

    expect(d2.current.isTopmost).toBe(true);
    expect(d1.current.isTopmost).toBe(false);

    // Close d2
    act(() => {
      rerenderD2({ isOpen: false });
    });

    expect(d1.current.isTopmost).toBe(true);
    expect(d1.current.isUnderlying).toBe(false);
  });

  it("respects disableStackOffset and custom stackOffsetPx options", () => {
    registerDrawer("d1"); // depth 0

    const { result } = renderHook(() =>
      useV2DrawerStack("d2", true, {
        stackOffsetPx: 25,
        mobileOffsetPx: 12,
        disableStackOffset: false,
      }),
    );

    expect(result.current.depth).toBe(1);
    expect(result.current.desktopShiftPx).toBe(25);
    expect(result.current.mobileTopOffsetPx).toBe(12);

    const { result: disabledResult } = renderHook(() =>
      useV2DrawerStack("d3", true, {
        disableStackOffset: true,
      }),
    );

    expect(disabledResult.current.depth).toBe(2);
    expect(disabledResult.current.desktopShiftPx).toBe(0);
    expect(disabledResult.current.mobileTopOffsetPx).toBe(0);
  });
});
