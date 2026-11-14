import { describe, expect, it } from "vitest";
import { renameV2TablePreferenceIds } from "./v2TablePreferences.rename";

const entry = (order: string[]) => ({
  columns: { visibility: {}, order, sizing: {} },
});

describe("renameV2TablePreferenceIds", () => {
  it("moves a legacy id to the feature id", () => {
    const result = renameV2TablePreferenceIds({
      "erp-garage-procurement-requests-table": entry(["a"]),
    });
    expect(result).toEqual({
      "procurement-requests-garage-table": entry(["a"]),
    });
  });

  it("keeps the new id when both ids exist and drops the legacy one", () => {
    const result = renameV2TablePreferenceIds({
      "erp-garage-procurement-orders-table": entry(["old"]),
      "procurement-orders-garage-table": entry(["new"]),
    });
    expect(result).toEqual({
      "procurement-orders-garage-table": entry(["new"]),
    });
  });

  it("returns null when there is nothing to rename (idempotent)", () => {
    const tables = { "erp-customers-table": entry(["x"]) };
    expect(renameV2TablePreferenceIds(tables)).toBeNull();

    const once = renameV2TablePreferenceIds({
      "erp-garage-procurement-requests-table": entry(["a"]),
    });
    expect(renameV2TablePreferenceIds(once!)).toBeNull();
  });

  it("does not mutate the input", () => {
    const tables = {
      "erp-garage-procurement-requests-table": entry(["a"]),
    };
    renameV2TablePreferenceIds(tables);
    expect(tables).toHaveProperty("erp-garage-procurement-requests-table");
  });
});
