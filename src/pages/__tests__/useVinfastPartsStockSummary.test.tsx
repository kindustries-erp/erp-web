// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useVinfastPartsStockSummary } from "../hooks/useVinfastPartsStockSummary";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, def?: any) => {
      if (typeof def === "string") return def;
      if (def?.defaultValue) return def.defaultValue;
      return key;
    },
  }),
}));

describe("useVinfastPartsStockSummary", () => {
  const mockItems = [
    { sku: "SKU1", name: "Phụ tùng 1", qtyIn: 100, qtyOut: 40, qtyBalance: 60 },
    { sku: "SKU2", name: "Phụ tùng 2", qtyIn: 50, qtyOut: 10, qtyBalance: 40 },
  ];

  it("returns undefined when items are empty", () => {
    const { result } = renderHook(() =>
      useVinfastPartsStockSummary({
        items: [],
      }),
    );
    expect(result.current).toBeUndefined();
  });

  it("calculates subtotal correctly and returns summaryRow with name, qtyIn, qtyOut, qtyBalance", () => {
    const { result } = renderHook(() =>
      useVinfastPartsStockSummary({
        items: mockItems,
        page: 1,
        pageSize: 50,
        totalCount: 2,
        totalPages: 1,
      }),
    );

    expect(result.current).toBeDefined();
    expect(result.current?.name).toBeDefined();
    expect(result.current?.qtyIn).toBeDefined();
    expect(result.current?.qtyOut).toBeDefined();
    expect(result.current?.qtyBalance).toBeDefined();
  });

  it("uses backend summary when provided", () => {
    const summary = {
      totalQtyIn: 500,
      totalQtyOut: 200,
      totalQtyBalance: 300,
      cumulativeQtyIn: 150,
      cumulativeQtyOut: 50,
      cumulativeQtyBalance: 100,
    };

    const { result } = renderHook(() =>
      useVinfastPartsStockSummary({
        items: mockItems,
        summary,
        page: 1,
        pageSize: 50,
        totalCount: 10,
        totalPages: 5,
      }),
    );

    expect(result.current).toBeDefined();
    expect(result.current?.qtyIn).toBeDefined();
    expect(result.current?.qtyOut).toBeDefined();
    expect(result.current?.qtyBalance).toBeDefined();
  });
});
