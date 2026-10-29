import { describe, expect, it } from "vitest";
import { cashDetailLocale } from "./bankStatements.cashDetail.locale";
import { cashflowLocale } from "./bankStatements.cashflow.locale";

/** Liệt kê mọi đường dẫn lá của một từ điển, để so khớp vi/en */
const leafPaths = (node: Record<string, unknown>, prefix = ""): string[] =>
  Object.entries(node).flatMap(([key, value]) =>
    value && typeof value === "object"
      ? leafPaths(value as Record<string, unknown>, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );

describe("bankStatements cash locales", () => {
  it("cashflow: vi và en có cùng bộ khóa", () => {
    expect(leafPaths(cashflowLocale.en).sort()).toEqual(
      leafPaths(cashflowLocale.vi).sort(),
    );
  });

  it("cashDetail: vi và en có cùng bộ khóa", () => {
    expect(leafPaths(cashDetailLocale.en).sort()).toEqual(
      leafPaths(cashDetailLocale.vi).sort(),
    );
  });

  it("cashDetail không ghi đè cashflow khi gộp (hai namespace con tách nhau)", () => {
    expect(Object.keys(cashflowLocale.vi)).toEqual(["cashflow"]);
    expect(Object.keys(cashDetailLocale.vi)).toEqual(["cashDetail"]);
  });
});
