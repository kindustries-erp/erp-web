import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useV2TableFullscreen } from "./V2StandardTable.fullscreen.hook";

describe("useV2TableFullscreen", () => {
  it("bật/tắt bằng toggle", () => {
    const { result } = renderHook(() => useV2TableFullscreen());
    expect(result.current.isFullscreen).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.isFullscreen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isFullscreen).toBe(false);
  });

  it("ESC thoát fullscreen, phím khác thì không", () => {
    const { result } = renderHook(() => useV2TableFullscreen());
    act(() => result.current.toggle());
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    });
    expect(result.current.isFullscreen).toBe(true);
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.isFullscreen).toBe(false);
  });
});
