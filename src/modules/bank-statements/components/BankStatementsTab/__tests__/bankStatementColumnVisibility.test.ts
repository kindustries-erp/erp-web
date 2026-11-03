import { describe, expect, it } from "vitest";
import {
  BANK_STATEMENT_COLUMN_GROUPS,
  BANK_STATEMENT_COLUMN_VIEW_PRESETS,
} from "../utils";

const CASHFLOW_COLUMN_KEYS = [
  "cashflowClassification",
  "cashflowPurpose",
  "note",
];

describe("bank statement cashflow columns visibility", () => {
  it("shows classification, purpose and note in the Tổng quan preset", () => {
    const overview = BANK_STATEMENT_COLUMN_VIEW_PRESETS.find(
      (p) => p.key === "overview",
    );

    CASHFLOW_COLUMN_KEYS.forEach((key) => {
      expect(overview?.columnVisibility?.[key]).toBe(true);
    });
  });

  it("exposes the cashflow columns in the view config drawer groups", () => {
    const keys = BANK_STATEMENT_COLUMN_GROUPS.flatMap((group) =>
      group.columns.map((col) => col.key),
    );

    CASHFLOW_COLUMN_KEYS.forEach((key) => {
      expect(keys).toContain(key);
    });
  });
});
