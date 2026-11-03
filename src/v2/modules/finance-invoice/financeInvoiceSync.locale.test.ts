import { describe, expect, it } from "vitest";
import { financeInvoiceSyncLocale } from "./financeInvoiceSync.locale";

/** Liệt kê mọi đường dẫn lá của một từ điển, để so khớp vi/en */
const leafPaths = (node: Record<string, unknown>, prefix = ""): string[] =>
  Object.entries(node).flatMap(([key, value]) =>
    value && typeof value === "object"
      ? leafPaths(value as Record<string, unknown>, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );

describe("financeInvoiceSync locale", () => {
  it("vi và en có cùng bộ khóa", () => {
    expect(leafPaths(financeInvoiceSyncLocale.en).sort()).toEqual(
      leafPaths(financeInvoiceSyncLocale.vi).sort(),
    );
  });

  it("mọi giá trị đều là chuỗi không rỗng", () => {
    for (const path of leafPaths(financeInvoiceSyncLocale.vi)) {
      const value = path
        .split(".")
        .reduce<unknown>(
          (node, key) => (node as Record<string, unknown>)[key],
          financeInvoiceSyncLocale.vi,
        );
      expect(typeof value === "string" && value.length > 0).toBe(true);
    }
  });
});
