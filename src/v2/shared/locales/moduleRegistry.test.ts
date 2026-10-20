import { describe, expect, it } from "vitest";
import {
  lookupV2ModuleKey,
  registerV2ModuleLocale,
  walkV2Dictionary,
} from "./moduleRegistry";

describe("walkV2Dictionary", () => {
  it("walks nested keys", () => {
    expect(walkV2Dictionary({ a: { b: "x" } }, ["a", "b"])).toBe("x");
  });

  it("returns undefined for a missing path", () => {
    expect(walkV2Dictionary({ a: {} }, ["a", "b"])).toBeUndefined();
    expect(walkV2Dictionary(undefined, ["a"])).toBeUndefined();
  });
});

describe("module locale registry", () => {
  it("looks up registered keys per locale", () => {
    registerV2ModuleLocale("regtest", {
      vi: { title: "Hóa đơn", tabs: { in: "Mua vào" } },
      en: { title: "Invoices", tabs: { in: "Purchases" } },
    });
    expect(lookupV2ModuleKey("vi", "v2.regtest.title")).toBe("Hóa đơn");
    expect(lookupV2ModuleKey("en", "v2.regtest.tabs.in")).toBe("Purchases");
  });

  it("returns undefined for unknown namespaces and keys", () => {
    expect(lookupV2ModuleKey("vi", "v2.unknown.title")).toBeUndefined();
    expect(lookupV2ModuleKey("vi", "v2.regtest.missing")).toBeUndefined();
    expect(lookupV2ModuleKey("vi", "common.close")).toBeUndefined();
  });

  it("rejects a namespace that collides with the shared dictionary", () => {
    expect(() => registerV2ModuleLocale("common", { vi: {}, en: {} })).toThrow(
      /trùng/,
    );
    expect(() => registerV2ModuleLocale("table", { vi: {}, en: {} })).toThrow();
  });

  it("overwrites on re-registration of the same namespace", () => {
    registerV2ModuleLocale("regtest2", { vi: { a: "1" }, en: { a: "1" } });
    registerV2ModuleLocale("regtest2", { vi: { a: "2" }, en: { a: "2" } });
    expect(lookupV2ModuleKey("vi", "v2.regtest2.a")).toBe("2");
  });
});
