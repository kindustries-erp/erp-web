import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  V2_URL_CHANGE_EVENT,
  readV2SearchParams,
  subscribeV2Url,
  updateV2SearchParams,
} from "./v2Url";

describe("v2Url", () => {
  beforeEach(() => window.history.replaceState(null, "", "/v2/x?a=1#top"));
  afterEach(() => vi.restoreAllMocks());

  it("reads the current query string", () => {
    expect(readV2SearchParams().get("a")).toBe("1");
  });

  it("updates params and keeps path and hash", () => {
    updateV2SearchParams((p) => p.set("b", "2"));
    expect(window.location.pathname).toBe("/v2/x");
    expect(window.location.search).toBe("?a=1&b=2");
    expect(window.location.hash).toBe("#top");
  });

  it("removes the query string when no params remain", () => {
    updateV2SearchParams((p) => p.delete("a"));
    expect(window.location.search).toBe("");
  });

  it("notifies subscribers on change and skips no-op updates", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeV2Url(listener);
    updateV2SearchParams((p) => p.set("a", "1"));
    expect(listener).not.toHaveBeenCalled();
    updateV2SearchParams((p) => p.set("a", "9"));
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    updateV2SearchParams((p) => p.set("a", "10"));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("pushes a new history entry in push mode", () => {
    const push = vi.spyOn(window.history, "pushState");
    updateV2SearchParams((p) => p.set("b", "2"), "push");
    expect(push).toHaveBeenCalledTimes(1);
  });

  it("dispatches the shared change event", () => {
    const handler = vi.fn();
    window.addEventListener(V2_URL_CHANGE_EVENT, handler);
    updateV2SearchParams((p) => p.set("z", "1"));
    window.removeEventListener(V2_URL_CHANGE_EVENT, handler);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
