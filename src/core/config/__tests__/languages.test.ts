import { describe, it, expect } from "vitest";
import {
  getActiveSystemLanguages,
  getSystemLanguage,
  getDefaultSystemLanguage,
  DEFAULT_LANGUAGE_CODE,
} from "../languages";
import { resolveOptionLabel } from "@/core/api/moduleConfigApi";

describe("System Language Registry (languages.ts)", () => {
  it("defines default system languages correctly", () => {
    expect(DEFAULT_LANGUAGE_CODE).toBe("vi");
    const activeLangs = getActiveSystemLanguages();
    expect(activeLangs.length).toBeGreaterThanOrEqual(2);
    expect(activeLangs.some((l) => l.code === "vi")).toBe(true);
    expect(activeLangs.some((l) => l.code === "en")).toBe(true);
  });

  it("finds language by code case-insensitively", () => {
    const viLang = getSystemLanguage("VI");
    expect(viLang).toBeDefined();
    expect(viLang?.code).toBe("vi");
    expect(viLang?.flag).toBe("🇻🇳");

    const enLang = getSystemLanguage("en");
    expect(enLang).toBeDefined();
    expect(enLang?.shortLabel).toBe("EN");
  });

  it("returns default system language", () => {
    const defLang = getDefaultSystemLanguage();
    expect(defLang.code).toBe("vi");
    expect(defLang.isDefault).toBe(true);
  });
});

describe("resolveOptionLabel helper", () => {
  it("resolves from labels object based on locale", () => {
    const opt = {
      value: "PO",
      label: "Đơn mua hàng",
      labelEn: "Purchase Order",
      labels: {
        vi: "Đơn mua",
        en: "PO English",
        zh: "采购订单",
      },
    };

    expect(resolveOptionLabel(opt, "vi")).toBe("Đơn mua");
    expect(resolveOptionLabel(opt, "en")).toBe("PO English");
    expect(resolveOptionLabel(opt, "zh")).toBe("采购订单");
  });

  it("falls back to labelEn when locale is en and labels.en is missing", () => {
    const opt = {
      value: "SALE",
      label: "Bán lẻ",
      labelEn: "Retail Sale",
    };

    expect(resolveOptionLabel(opt, "en")).toBe("Retail Sale");
  });

  it("falls back to primary label or value", () => {
    const opt = {
      value: "OTHER",
      label: "Khác",
    };

    expect(resolveOptionLabel(opt, "vi")).toBe("Khác");
    expect(resolveOptionLabel(opt, "en")).toBe("Khác");
  });
});
