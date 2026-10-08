import { describe, expect, it } from "vitest";
import {
  V2_ALL_MATCHING_VALUE,
  V2_BLANK_VALUE,
} from "@/v2/shared/types/v2-table";
import {
  areAllVisibleSelected,
  hasSameValues,
  resolveOptionLabel,
  syncAllMatching,
  toggleAllMatching,
  toggleAllVisible,
  toggleValue,
} from "./V2ColumnHeaderFilter.selection";

const OPTIONS = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
];

describe("selection helpers", () => {
  it("toggles single values and falls back to explicit mode", () => {
    expect(toggleValue([], "a")).toEqual(["a"]);
    expect(toggleValue(["a"], "a")).toEqual([]);
    expect(toggleValue([V2_ALL_MATCHING_VALUE, "x"], "a")).toEqual(["a"]);
  });

  it("toggles all-matching with the current keyword", () => {
    expect(toggleAllMatching([], "x")).toEqual([V2_ALL_MATCHING_VALUE, "x"]);
    expect(toggleAllMatching([V2_ALL_MATCHING_VALUE, "x"], "x")).toEqual([]);
  });

  it("syncs or clears the keyword only in all-matching mode", () => {
    expect(syncAllMatching(["a"], "x")).toBeNull();
    expect(syncAllMatching([V2_ALL_MATCHING_VALUE, "x"], "x")).toBeNull();
    expect(syncAllMatching([V2_ALL_MATCHING_VALUE, "x"], "xy")).toEqual([
      V2_ALL_MATCHING_VALUE,
      "xy",
    ]);
    expect(syncAllMatching([V2_ALL_MATCHING_VALUE, "x"], "  ")).toEqual([]);
  });

  it("selects and clears every visible option", () => {
    expect(areAllVisibleSelected([], OPTIONS)).toBe(false);
    expect(areAllVisibleSelected(["a", "b"], OPTIONS)).toBe(true);
    expect(areAllVisibleSelected([], [])).toBe(false);
    expect(toggleAllVisible([], OPTIONS)).toEqual(["a", "b"]);
    expect(toggleAllVisible(["a", "b"], OPTIONS)).toEqual([]);
    expect(toggleAllVisible(["a"], OPTIONS)).toEqual(["a", "b"]);
    expect(toggleAllVisible([V2_ALL_MATCHING_VALUE, "x"], OPTIONS)).toEqual([
      "a",
      "b",
    ]);
  });

  it("compares selections by order and content", () => {
    expect(hasSameValues(["a", "b"], ["a", "b"])).toBe(true);
    expect(hasSameValues(["a"], ["a", "b"])).toBe(false);
    expect(hasSameValues(["a", "b"], ["b", "a"])).toBe(false);
  });

  it("resolves labels for blank, formatted and composite values", () => {
    expect(
      resolveOptionLabel({ value: V2_BLANK_VALUE, label: "" }, "(Trống)"),
    ).toBe("(Trống)");
    expect(
      resolveOptionLabel({ value: "1", label: "1" }, "", (v) => `#${v}`),
    ).toBe("#1");
    expect(
      resolveOptionLabel(
        { value: "1066:::C25MDP", label: "1066:::C25MDP" },
        "",
      ),
    ).toBe("1066 (C25MDP)");
  });
});
