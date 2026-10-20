import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  ColumnValueType,
  DateFilterOperator,
  NumberFilterOperator,
  TextFilterOperator,
} from "@/v2/shared/types/v2-table";
import { getDatePreset, toISODate } from "./V2ColumnHeaderFilter.date";
import { useDebouncedValue } from "./V2ColumnHeaderFilter.field";
import {
  buildOperatorFilter,
  getDefaultOperator,
  getOperatorGroup,
  getOperators,
  operatorNeedsRange,
  operatorNeedsValue,
} from "./V2ColumnHeaderFilter.operators";

describe("operators", () => {
  it("maps value types to operator groups", () => {
    expect(getOperatorGroup(ColumnValueType.TEXT)).toBe("text");
    expect(getOperatorGroup(ColumnValueType.NUMBER)).toBe("number");
    expect(getOperatorGroup(ColumnValueType.DATE)).toBe("date");
    expect(getOperatorGroup(ColumnValueType.STATUS)).toBeNull();
  });

  it("lists every operator of a group and picks the first as default", () => {
    expect(getOperators("text")).toHaveLength(8);
    expect(getOperators("number")).toHaveLength(7);
    expect(getOperators("date")).toHaveLength(4);
    expect(getDefaultOperator("text")).toBe(TextFilterOperator.CONTAINS);
  });

  it("knows which operators need a value or a range", () => {
    expect(operatorNeedsValue(TextFilterOperator.IS_EMPTY)).toBe(false);
    expect(operatorNeedsValue(TextFilterOperator.CONTAINS)).toBe(true);
    expect(operatorNeedsRange(NumberFilterOperator.BETWEEN)).toBe(true);
    expect(operatorNeedsRange(DateFilterOperator.BETWEEN)).toBe(true);
    expect(operatorNeedsRange(NumberFilterOperator.EQUALS)).toBe(false);
  });

  it("builds a filter only when it can actually filter", () => {
    expect(
      buildOperatorFilter(TextFilterOperator.CONTAINS, " ", ""),
    ).toBeNull();
    expect(buildOperatorFilter(TextFilterOperator.IS_EMPTY, "", "")).toEqual({
      operator: TextFilterOperator.IS_EMPTY,
      value: "",
    });
    expect(buildOperatorFilter(NumberFilterOperator.BETWEEN, "1", "9")).toEqual(
      {
        operator: NumberFilterOperator.BETWEEN,
        value: "1",
        valueTo: "9",
      },
    );
    expect(
      buildOperatorFilter(NumberFilterOperator.GREATER_THAN, "1", "9"),
    ).toEqual({
      operator: NumberFilterOperator.GREATER_THAN,
      value: "1",
    });
  });
});

describe("date presets", () => {
  const now = new Date(2026, 2, 15, 10, 30);

  it("formats local dates", () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("computes each preset relative to today", () => {
    expect(getDatePreset("today", now)).toEqual({
      from: "2026-03-15",
      to: "2026-03-15",
    });
    expect(getDatePreset("last7", now)).toEqual({
      from: "2026-03-09",
      to: "2026-03-15",
    });
    expect(getDatePreset("last30", now)).toEqual({
      from: "2026-02-14",
      to: "2026-03-15",
    });
    expect(getDatePreset("thisMonth", now)).toEqual({
      from: "2026-03-01",
      to: "2026-03-15",
    });
  });
});

describe("useDebouncedValue", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns the first value at once and the latest one after the delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );
    expect(result.current).toBe("a");
    rerender({ value: "ab" });
    rerender({ value: "abc" });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe("a");
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("abc");
  });
});
