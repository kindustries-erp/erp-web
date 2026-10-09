import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAppStore } from "@/core/config/appStore";
import { registerV2ModuleLocale } from "@/v2/shared/locales";
import { useV2Translation } from "./useV2Translation";

describe("useV2Translation with module locales", () => {
  beforeEach(() => {
    registerV2ModuleLocale("invoicetest", {
      vi: { title: "Hóa đơn điện tử", count: "{{n}} hóa đơn" },
      en: { title: "E-invoices", count: "{{n}} invoices" },
    });
    useAppStore.setState({ locale: "vi" });
  });

  it("resolves a module key in Vietnamese", () => {
    const { result } = renderHook(() => useV2Translation());
    expect(result.current.t("v2.invoicetest.title")).toBe("Hóa đơn điện tử");
  });

  it("follows the active locale", () => {
    useAppStore.setState({ locale: "en" });
    const { result } = renderHook(() => useV2Translation());
    expect(result.current.t("v2.invoicetest.title")).toBe("E-invoices");
  });

  it("interpolates variables", () => {
    const { result } = renderHook(() => useV2Translation());
    expect(result.current.t("v2.invoicetest.count", { n: 3 })).toBe(
      "3 hóa đơn",
    );
  });

  it("still resolves shared keys and falls back for unknown keys", () => {
    const { result } = renderHook(() => useV2Translation());
    expect(result.current.t("v2.common.close")).toBe("Đóng");
    expect(result.current.t("v2.invoicetest.nope", "Mặc định")).toBe(
      "Mặc định",
    );
  });
});
