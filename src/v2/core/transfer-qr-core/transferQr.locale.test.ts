import { describe, expect, it } from "vitest";
import { transferQrLocale } from "./transferQr.locale";

const keysOf = (value: unknown, prefix = ""): string[] => {
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) => keysOf(child, prefix ? `${prefix}.${key}` : key),
  );
};

describe("transferQr locale", () => {
  it("vi và en có cùng bộ khóa", () => {
    expect(keysOf(transferQrLocale.en).sort()).toEqual(
      keysOf(transferQrLocale.vi).sort(),
    );
  });

  it("mọi giá trị đều là chuỗi không rỗng", () => {
    for (const key of keysOf(transferQrLocale.vi)) {
      const value = key
        .split(".")
        .reduce<any>((node, part) => node?.[part], transferQrLocale.vi);
      expect(typeof value === "string" && value.length > 0).toBe(true);
    }
  });
});
