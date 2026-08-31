import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePageUrlState } from "../usePageUrlState";

describe("usePageUrlState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.history.replaceState(null, "", "/erp-invoices");
  });

  it("initializes with empty state when URL has no params", () => {
    const { result } = renderHook(() =>
      usePageUrlState({
        pageKey: "erp-invoices",
        filterKeys: ["status", "dateFrom"],
      }),
    );

    expect(result.current.filters).toEqual({});
    expect(result.current.drawerOpen).toBe(false);
    expect(result.current.drawerId).toBeNull();
  });

  it("parses filters and drawer from URL on mount using detail or legacy drawer", () => {
    window.history.replaceState(
      null,
      "",
      "/erp-invoices?status=CONFIRMED&detail=84398_K26TAT&dmode=edit",
    );

    const { result } = renderHook(() =>
      usePageUrlState({
        pageKey: "erp-invoices",
        filterKeys: ["status"],
      }),
    );

    expect(result.current.filters.status).toBe("CONFIRMED");
    expect(result.current.drawerOpen).toBe(true);
    expect(result.current.drawerId).toBe("84398_K26TAT");
    expect(result.current.drawerMode).toBe("edit");
  });

  it("updates URL immediately on openDrawer with pushState using detail=", () => {
    const { result } = renderHook(() =>
      usePageUrlState({
        pageKey: "erp-invoices",
      }),
    );

    act(() => {
      result.current.openDrawer("84398_K26TAT", "view");
    });

    expect(result.current.drawerOpen).toBe(true);
    expect(result.current.drawerId).toBe("84398_K26TAT");
    expect(window.location.search).toContain("detail=84398_K26TAT");
  });

  it("clears detail param on closeDrawer", () => {
    window.history.replaceState(null, "", "/erp-invoices?detail=84398_K26TAT");

    const { result } = renderHook(() =>
      usePageUrlState({
        pageKey: "erp-invoices",
      }),
    );

    act(() => {
      result.current.closeDrawer();
    });

    expect(result.current.drawerOpen).toBe(false);
    expect(result.current.drawerId).toBeNull();
    expect(window.location.search).not.toContain("detail=84398_K26TAT");
  });

  it("supports instanceIndex 2 by appending _i=2", () => {
    const { result } = renderHook(() =>
      usePageUrlState({
        pageKey: "erp-invoices",
        instanceIndex: 2,
      }),
    );

    act(() => {
      result.current.setFilter("status", "DRAFT");
    });

    act(() => {
      vi.advanceTimersByTime(550);
    });

    expect(window.location.search).toContain("_i=2");
    expect(window.location.search).toContain("status=DRAFT");
  });

  it("updates URL immediately on setView without debounce lag", () => {
    const { result } = renderHook(() =>
      usePageUrlState({
        pageKey: "erp-invoices",
      }),
    );

    act(() => {
      result.current.setView("replacement");
    });

    expect(result.current.view).toBe("replacement");
    expect(window.location.search).toContain("view=replacement");

    act(() => {
      result.current.setView("all");
    });

    expect(result.current.view).toBe("");
    expect(window.location.search).not.toContain("view=");
  });

  it("supports sorts and columnFilters serialization in URL", () => {
    const { result } = renderHook(() =>
      usePageUrlState({
        pageKey: "erp-invoices",
      }),
    );

    act(() => {
      result.current.setSorts(["-invoiceDate", "invoiceNo"]);
      result.current.setColumnFilters({ status: ["CONFIRMED", "DRAFT"] });
    });

    act(() => {
      vi.advanceTimersByTime(550);
    });

    expect(window.location.search).toContain("sorts=");
    expect(window.location.search).toContain("cf=");
  });
});
