import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNowTick } from "./useNowTick";

describe("useNowTick", () => {
  afterEach(() => vi.useRealTimers());

  it("nhích theo chu kỳ và dừng khi gỡ", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 24, 10, 0));
    const { result, unmount } = renderHook(() => useNowTick(60_000));
    expect(result.current.getMinutes()).toBe(0);
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.getMinutes()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
