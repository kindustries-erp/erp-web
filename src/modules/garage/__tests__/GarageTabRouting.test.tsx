import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGarageTabLogic } from "../components/GarageTab/useGarageTabLogic";

describe("useGarageTabLogic Routing & 2-Way URL Sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/garage-cases");
  });

  it("initializes with default tab 'dashboard' and adds ?tab=dashboard to URL", () => {
    const { result } = renderHook(() => useGarageTabLogic());

    expect(result.current.currentTabKey).toBe("dashboard");
    expect(window.location.search).toContain("tab=dashboard");
  });

  it("initializes with 'cases' if URL already has ?tab=cases", () => {
    window.history.replaceState(null, "", "/garage-cases?tab=cases");
    const { result } = renderHook(() => useGarageTabLogic());

    expect(result.current.currentTabKey).toBe("cases");
  });

  it("initializes with 'services' if URL already has ?tab=services", () => {
    window.history.replaceState(null, "", "/garage-cases?tab=services");
    const { result } = renderHook(() => useGarageTabLogic());

    expect(result.current.currentTabKey).toBe("services");
  });

  it("updates state and URL when handleTabChange is called", () => {
    const { result } = renderHook(() => useGarageTabLogic());

    act(() => {
      result.current.handleTabChange("cases");
    });

    expect(result.current.currentTabKey).toBe("cases");
    expect(window.location.search).toContain("tab=cases");

    act(() => {
      result.current.handleTabChange("services");
    });

    expect(result.current.currentTabKey).toBe("services");
    expect(window.location.search).toContain("tab=services");

    act(() => {
      result.current.handleTabChange("dashboard");
    });

    expect(result.current.currentTabKey).toBe("dashboard");
    expect(window.location.search).toContain("tab=dashboard");
  });

  it("syncs state on popstate event (browser back/forward)", () => {
    const { result } = renderHook(() => useGarageTabLogic());

    expect(result.current.currentTabKey).toBe("dashboard");

    act(() => {
      window.history.replaceState(null, "", "/garage-cases?tab=services");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(result.current.currentTabKey).toBe("services");
  });

  it("provides 3 page tabs (dashboard, cases, services)", () => {
    const { result } = renderHook(() => useGarageTabLogic());

    expect(result.current.pageTabs).toHaveLength(3);
    expect(result.current.pageTabs[0].value).toBe("dashboard");
    expect(result.current.pageTabs[1].value).toBe("cases");
    expect(result.current.pageTabs[2].value).toBe("services");
  });
});
