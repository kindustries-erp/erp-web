import { describe, expect, it } from "vitest";
import { createInitialQuery } from "./v2TableQuery";
import { serializeOtherFilters } from "./v2TableSerialize";

describe("serializeOtherFilters", () => {
  it("returns undefined when no other column is filtered", () => {
    const query = createInitialQuery({
      pageSize: 20,
      columnFilters: { code: ["A"] },
    });
    expect(serializeOtherFilters(query, "code")).toBeUndefined();
  });

  it("includes only filters of the other columns", () => {
    const query = createInitialQuery({
      pageSize: 20,
      columnFilters: { code: ["A"], name: ["X"] },
      columnSearch: { code: "a" },
    });
    expect(JSON.parse(serializeOtherFilters(query, "code") ?? "{}")).toEqual({
      columnFilters: { name: ["X"] },
      columnSearch: {},
      columnOperators: {},
      dateRanges: {},
    });
  });
});
