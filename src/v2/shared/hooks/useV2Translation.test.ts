import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAppStore } from "@/core/config/appStore";
import { useV2Translation } from "./useV2Translation";

describe("useV2Translation", () => {
  beforeEach(() => {
    act(() => {
      useAppStore.getState().setLocale("vi");
    });
  });

  it("translates v2 keys in Vietnamese by default", () => {
    const { result } = renderHook(() => useV2Translation());
    expect(result.current.locale).toBe("vi");
    expect(result.current.isVietnamese).toBe(true);
    expect(result.current.isEnglish).toBe(false);

    expect(result.current.t("v2.sidebar.appName")).toBe("ERP");
    expect(result.current.t("v2.topbar.languageVi")).toBe("Tiếng Việt");
  });

  it("interpolates template parameters in v2 keys", () => {
    const { result } = renderHook(() => useV2Translation());
    expect(
      result.current.t("v2.tabBar.closeTab", { name: "Đơn bán hàng" }),
    ).toBe("Đóng tab Đơn bán hàng");
  });

  it("delegates to core navigation keys correctly", () => {
    const { result } = renderHook(() => useV2Translation());
    expect(result.current.t("nav.items.dashboard")).toBe("Tổng quan");
    expect(result.current.t("nav.sections.sales")).toBe("BÁN HÀNG");
  });

  it("reactively switches translations when setLocale is called", () => {
    const { result } = renderHook(() => useV2Translation());

    act(() => {
      result.current.setLocale("en");
    });

    expect(result.current.locale).toBe("en");
    expect(result.current.isEnglish).toBe(true);
    expect(result.current.isVietnamese).toBe(false);

    // V2 dictionary in English
    expect(result.current.t("v2.sidebar.expand")).toBe("Expand sidebar");
    expect(result.current.t("v2.topbar.languageEn")).toBe("English");
    expect(
      result.current.t("v2.tabBar.closeTab", { name: "Sales Orders" }),
    ).toBe("Close tab Sales Orders");

    // Core dictionary in English
    expect(result.current.t("nav.items.dashboard")).toBe("Dashboard");
    expect(result.current.t("nav.sections.sales")).toBe("SALES");
  });

  it("returns fallback string when key is not found", () => {
    const { result } = renderHook(() => useV2Translation());
    expect(result.current.t("non.existent.key", "Mặc định")).toBe("Mặc định");
    expect(
      result.current.t("v2.non.existent.key", { defaultValue: "Fallback V2" }),
    ).toBe("Fallback V2");
  });
});
