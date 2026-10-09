import { describe, expect, it } from "vitest";
import {
  filterV2ComboboxOptions,
  nextEnabledIndex,
  normalizeSearchText,
} from "./V2Combobox.helper";

const options = [
  { value: "1", label: "Hóa đơn bán ra" },
  { value: "2", label: "Hóa đơn mua vào", description: "MST 0100109106" },
  { value: "3", label: "Đối tác", disabled: true },
];

describe("V2Combobox helpers", () => {
  it("removes Vietnamese diacritics", () => {
    expect(normalizeSearchText("Đối Tác Hóa Đơn")).toBe("doi tac hoa don");
  });

  it("filters ignoring case and diacritics", () => {
    expect(
      filterV2ComboboxOptions(options, "HOA DON").map((o) => o.value),
    ).toEqual(["1", "2"]);
    expect(
      filterV2ComboboxOptions(options, "doi tac").map((o) => o.value),
    ).toEqual(["3"]);
  });

  it("also matches the description", () => {
    expect(
      filterV2ComboboxOptions(options, "0100109").map((o) => o.value),
    ).toEqual(["2"]);
  });

  it("returns every option for an empty query", () => {
    expect(filterV2ComboboxOptions(options, "  ")).toBe(options);
  });

  it("skips disabled options when moving", () => {
    expect(nextEnabledIndex(options, 0, 1)).toBe(1);
    expect(nextEnabledIndex(options, 1, 1)).toBe(1);
    expect(nextEnabledIndex(options, 1, -1)).toBe(0);
    expect(nextEnabledIndex(options, 0, -1)).toBe(0);
  });
});
