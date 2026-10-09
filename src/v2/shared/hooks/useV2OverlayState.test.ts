import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useV2OverlayState } from "./useV2OverlayState";

const setup = (url = "/v2/invoices") => {
  window.history.replaceState(null, "", url);
  return renderHook(() => useV2OverlayState());
};

describe("useV2OverlayState", () => {
  beforeEach(() => window.history.replaceState(null, "", "/v2/invoices"));

  it("starts empty", () => {
    const { result } = setup();
    expect(result.current.stack).toEqual([]);
    expect(result.current.topId).toBeNull();
  });

  it("restores the stack from the URL", () => {
    const { result } = setup("/v2/invoices?overlay=invoice%3A12,posting");
    expect(result.current.stack).toEqual(["invoice:12", "posting"]);
    expect(result.current.topId).toBe("posting");
    expect(result.current.isOpen("invoice:12")).toBe(true);
  });

  it("opens overlays on top and writes them to the URL", () => {
    const { result } = setup();
    act(() => result.current.open("invoice:12"));
    act(() => result.current.open("posting"));
    expect(result.current.stack).toEqual(["invoice:12", "posting"]);
    expect(new URLSearchParams(window.location.search).get("overlay")).toBe(
      "invoice%3A12,posting",
    );
  });

  it("moves an overlay to the top instead of duplicating it", () => {
    const { result } = setup();
    act(() => result.current.open("a"));
    act(() => result.current.open("b"));
    act(() => result.current.open("a"));
    expect(result.current.stack).toEqual(["b", "a"]);
  });

  it("opens with push so Back can close it", () => {
    const push = vi.spyOn(window.history, "pushState");
    const { result } = setup();
    act(() => result.current.open("a"));
    expect(push).toHaveBeenCalledTimes(1);
    push.mockRestore();
  });

  it("closes the top overlay, a specific one, or all", () => {
    const { result } = setup("/v2/invoices?overlay=a,b,c");
    act(() => result.current.close());
    expect(result.current.stack).toEqual(["a", "b"]);
    act(() => result.current.close("a"));
    expect(result.current.stack).toEqual(["b"]);
    act(() => result.current.closeAll());
    expect(result.current.stack).toEqual([]);
    expect(window.location.search).toBe("");
  });

  it("keeps ids that contain a comma intact", () => {
    const { result } = setup();
    act(() => result.current.open("a,b"));
    expect(result.current.stack).toEqual(["a,b"]);
  });

  it("supports a custom param name", () => {
    window.history.replaceState(null, "", "/v2/invoices?drawer=x");
    const { result } = renderHook(() =>
      useV2OverlayState({ paramName: "drawer" }),
    );
    expect(result.current.stack).toEqual(["x"]);
  });
});
