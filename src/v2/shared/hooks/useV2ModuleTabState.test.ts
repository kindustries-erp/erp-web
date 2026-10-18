import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { updateV2SearchParams } from "@/v2/shared/utils/v2Url";
import { useV2ModuleTabState } from "./useV2ModuleTabState";

const tabKeys = ["overview", "in", "out"];
const setup = (url: string, defaultTab?: string) => {
  window.history.replaceState(null, "", url);
  return renderHook(() => useV2ModuleTabState({ tabKeys, defaultTab }));
};

describe("useV2ModuleTabState", () => {
  beforeEach(() => window.history.replaceState(null, "", "/v2/invoices"));

  it("opens the first tab when the URL has no tab", () => {
    const { result } = setup("/v2/invoices");
    expect(result.current.activeTab).toBe("overview");
  });

  it("opens the default tab when given", () => {
    const { result } = setup("/v2/invoices", "in");
    expect(result.current.activeTab).toBe("in");
  });

  it("reads the active tab from the URL", () => {
    const { result } = setup("/v2/invoices?tab=out");
    expect(result.current.activeTab).toBe("out");
  });

  it("falls back when the URL tab is unknown", () => {
    const { result } = setup("/v2/invoices?tab=nope");
    expect(result.current.activeTab).toBe("overview");
  });

  it("keeps only the target tab's params when switching", () => {
    const { result } = setup("/v2/invoices?tab=in&in.page=3&in.q=hd");
    act(() => result.current.setActiveTab("out"));
    expect(result.current.activeTab).toBe("out");
    expect(window.location.search).toBe("?tab=out");
  });

  it("restores a tab's params when coming back", () => {
    const { result } = setup("/v2/invoices?tab=in&in.page=3");
    act(() => result.current.setActiveTab("out"));
    act(() => updateV2SearchParams((p) => p.set("out.page", "2")));
    act(() => result.current.setActiveTab("in"));
    expect(window.location.search).toContain("tab=in");
    expect(window.location.search).toContain("in.page=3");
    expect(window.location.search).not.toContain("out.page");
    act(() => result.current.setActiveTab("out"));
    expect(window.location.search).toContain("out.page=2");
    expect(window.location.search).not.toContain("in.page");
  });

  it("does nothing when selecting the active tab", () => {
    const { result } = setup("/v2/invoices?tab=in&in.page=3");
    act(() => result.current.setActiveTab("in"));
    expect(window.location.search).toBe("?tab=in&in.page=3");
  });
});
