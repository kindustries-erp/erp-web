import { afterEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useV2ChartTheme } from "./useV2ChartTheme";

describe("useV2ChartTheme", () => {
  afterEach(() => document.documentElement.classList.remove("dark"));

  it("is light by default with fallback colours", () => {
    const { result } = renderHook(() => useV2ChartTheme());
    expect(result.current.mode).toBe("light");
    expect(result.current.surface).toBe("#ffffff");
  });

  it("switches to dark when the dark class is applied", async () => {
    const { result } = renderHook(() => useV2ChartTheme());
    await act(async () => {
      document.documentElement.classList.add("dark");
      await Promise.resolve();
    });
    expect(result.current.mode).toBe("dark");
    expect(result.current.surface).toBe("#18181b");
  });
});
