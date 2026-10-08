import { describe, expect, it } from "vitest";
import {
  DateFilterOperator,
  NumberFilterOperator,
  TextFilterOperator,
} from "@/v2/shared/types/v2-table";
import {
  evaluateDateOperator,
  evaluateDateRange,
  evaluateNumber,
  evaluateText,
} from "./v2TableEvaluate";

describe("evaluateText", () => {
  const run = (operator: TextFilterOperator, value: string, cell: unknown) =>
    evaluateText(cell, { operator, value });

  it("handles every operator", () => {
    expect(run(TextFilterOperator.CONTAINS, "d-0", "HD-01")).toBe(true);
    expect(run(TextFilterOperator.NOT_CONTAINS, "zz", "HD-01")).toBe(true);
    expect(run(TextFilterOperator.STARTS_WITH, "hd", "HD-01")).toBe(true);
    expect(run(TextFilterOperator.ENDS_WITH, "01", "HD-01")).toBe(true);
    expect(run(TextFilterOperator.EQUALS, "hd-01", "HD-01")).toBe(true);
    expect(run(TextFilterOperator.NOT_EQUALS, "hd-01", "HD-01")).toBe(false);
    expect(run(TextFilterOperator.IS_EMPTY, "", null)).toBe(true);
    expect(run(TextFilterOperator.IS_NOT_EMPTY, "", "x")).toBe(true);
  });

  it("does not filter when the operand is empty", () => {
    expect(run(TextFilterOperator.CONTAINS, "  ", "HD-01")).toBe(true);
  });
});

describe("evaluateNumber", () => {
  const run = (
    operator: NumberFilterOperator,
    value: string,
    cell: unknown,
    valueTo?: string,
  ) => evaluateNumber(cell, { operator, value, valueTo });

  it("compares numbers", () => {
    expect(run(NumberFilterOperator.GREATER_THAN, "5", 6)).toBe(true);
    expect(run(NumberFilterOperator.GREATER_THAN_OR_EQUAL, "5", 5)).toBe(true);
    expect(run(NumberFilterOperator.LESS_THAN, "5", 5)).toBe(false);
    expect(run(NumberFilterOperator.EQUALS, "5", "5")).toBe(true);
  });

  it("supports BETWEEN with and without upper bound", () => {
    expect(run(NumberFilterOperator.BETWEEN, "5", 10, "20")).toBe(true);
    expect(run(NumberFilterOperator.BETWEEN, "5", 30, "20")).toBe(false);
    expect(run(NumberFilterOperator.BETWEEN, "5", 999)).toBe(true);
  });

  it("rejects non numeric cells only when a filter is set", () => {
    expect(run(NumberFilterOperator.EQUALS, "5", null)).toBe(false);
    expect(run(NumberFilterOperator.EQUALS, "", null)).toBe(true);
  });
});

describe("date evaluators", () => {
  it("evaluates inclusive ranges on the date part", () => {
    const range = { from: "2026-01-10", to: "2026-02-15" };
    expect(evaluateDateRange("2026-01-10T23:59:00Z", range)).toBe(true);
    expect(evaluateDateRange("2026-02-16", range)).toBe(false);
    expect(evaluateDateRange("", range)).toBe(false);
    expect(evaluateDateRange("", {})).toBe(true);
  });

  it("evaluates date operators", () => {
    const op = (
      operator: DateFilterOperator,
      value: string,
      valueTo?: string,
    ) => evaluateDateOperator("2026-02-15", { operator, value, valueTo });
    expect(op(DateFilterOperator.EQUALS, "2026-02-15")).toBe(true);
    expect(op(DateFilterOperator.BEFORE, "2026-02-16")).toBe(true);
    expect(op(DateFilterOperator.AFTER, "2026-02-15")).toBe(false);
    expect(op(DateFilterOperator.BETWEEN, "2026-02-01", "2026-02-28")).toBe(
      true,
    );
  });
});
