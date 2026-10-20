import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHoverIntent } from "./useHoverIntent";

describe("useHoverIntent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mở sau openDelay khi hover đủ lâu", () => {
    const { result } = renderHook(() => useHoverIntent());

    act(() => result.current.onEnter());
    expect(result.current.open).toBe(false);

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current.open).toBe(true);
  });

  it("không mở nếu rời chuột trước openDelay", () => {
    const { result } = renderHook(() => useHoverIntent());

    act(() => result.current.onEnter());
    act(() => {
      vi.advanceTimersByTime(100);
    });
    act(() => result.current.onLeave());
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.open).toBe(false);
  });

  it("đóng sau closeDelay khi rời chuột", () => {
    const { result } = renderHook(() => useHoverIntent());

    act(() => result.current.onEnter());
    act(() => {
      vi.advanceTimersByTime(250);
    });
    act(() => result.current.onLeave());
    act(() => {
      vi.advanceTimersByTime(120);
    });

    expect(result.current.open).toBe(false);
  });

  it("chuột quay lại trong closeDelay thì giữ mở", () => {
    const { result } = renderHook(() => useHoverIntent());

    act(() => result.current.onEnter());
    act(() => {
      vi.advanceTimersByTime(250);
    });
    act(() => result.current.onLeave());
    act(() => {
      vi.advanceTimersByTime(60);
    });
    act(() => result.current.onEnter());
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.open).toBe(true);
  });

  it("close() đóng ngay và hủy timer", () => {
    const { result } = renderHook(() => useHoverIntent());

    act(() => result.current.onEnter());
    act(() => {
      vi.advanceTimersByTime(250);
    });
    act(() => result.current.close());

    expect(result.current.open).toBe(false);
  });
});
