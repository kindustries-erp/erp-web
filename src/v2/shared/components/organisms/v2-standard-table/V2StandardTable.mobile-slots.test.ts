import { describe, expect, it } from "vitest";
import { resolveMobileSlots } from "./V2StandardTable.mobile-slots";
import type { V2Column } from "./V2StandardTable.type";

const col = (key: string, mobileSlot?: V2Column<unknown>["mobileSlot"]) =>
  ({ key, label: key, cell: () => key, mobileSlot }) as V2Column<unknown>;

const keys = (columns: V2Column<unknown>[]) => columns.map((c) => c.key);

describe("resolveMobileSlots", () => {
  it("puts the first column as title, the second as subtitle and the rest as meta", () => {
    const slots = resolveMobileSlots([col("a"), col("b"), col("c"), col("d")]);
    expect(slots.title?.key).toBe("a");
    expect(slots.subtitle?.key).toBe("b");
    expect(keys(slots.meta)).toEqual(["c", "d"]);
  });

  it("respects explicit slots and drops hidden columns", () => {
    const slots = resolveMobileSlots([
      col("a", "hidden"),
      col("b"),
      col("c", "title"),
      col("d", "subtitle"),
      col("e", "meta"),
    ]);
    expect(slots.title?.key).toBe("c");
    expect(slots.subtitle?.key).toBe("d");
    expect(keys(slots.meta)).toEqual(["b", "e"]);
  });

  it("handles a single column and an empty list", () => {
    expect(resolveMobileSlots([col("a")])).toMatchObject({
      title: { key: "a" },
      subtitle: undefined,
      meta: [],
    });
    expect(resolveMobileSlots([])).toEqual({
      title: undefined,
      subtitle: undefined,
      meta: [],
    });
  });
});
