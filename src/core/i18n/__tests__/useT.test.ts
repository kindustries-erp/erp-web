import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useT } from "../index";

vi.mock("@/core/config/appStore", () => ({
  useAppStore: (selector: any) => selector({ locale: "vi" }),
}));

describe("useT i18n hook", () => {
  it("returns fallback string when key is not found", () => {
    const { result } = renderHook(() => useT());
    const t = result.current;
    expect(t("non.existent.key", "Mặc định")).toBe("Mặc định");
  });

  it("extracts defaultValue from options object when key is not found", () => {
    const { result } = renderHook(() => useT());
    const t = result.current;
    expect(
      t("non.existent.key", { defaultValue: "Tài khoản đối tác" } as any),
    ).toBe("Tài khoản đối tác");
  });

  it("never returns an object even if options object is passed", () => {
    const { result } = renderHook(() => useT());
    const t = result.current;
    const res = t("bankStatement.columns.account", {
      defaultValue: "Tài khoản",
    } as any);
    expect(typeof res).toBe("string");
    expect(res).toBe("Tài khoản");
  });

  it("returns key when no fallback or options provided and key is not found", () => {
    const { result } = renderHook(() => useT());
    const t = result.current;
    expect(t("some.unknown.key")).toBe("some.unknown.key");
  });
});
