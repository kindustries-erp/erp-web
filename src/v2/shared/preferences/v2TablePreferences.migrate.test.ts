import { describe, expect, it } from "vitest";
import { mapV1TablePreference } from "./v2TablePreferences.migrate";
import type { V1TablePreference } from "./v2TablePreferences.type";

describe("mapV1TablePreference", () => {
  it.each([
    ["object", { key: "x" }],
    ["string", "bad"],
    ["null", null],
    ["undefined", undefined],
  ])("không throw khi views là %s", (_, views) => {
    const legacy = { views } as unknown as V1TablePreference;

    expect(() => mapV1TablePreference(legacy)).not.toThrow();
    expect(mapV1TablePreference(legacy).views?.customViews).toEqual([]);
  });

  it("giữ nguyên custom view hợp lệ (hồi quy)", () => {
    const legacy: V1TablePreference = {
      columnOrder: ["a", "b"],
      columnVisibility: { a: true },
      views: [
        {
          key: "mine",
          label: "Của tôi",
          isCustom: true,
          columnVisibility: { b: false },
        },
        { key: "overview", label: "Tổng quan" },
      ],
      activeView: "legal_tax",
    };

    const result = mapV1TablePreference(legacy);

    expect(result.columns?.order).toEqual(["a", "b"]);
    expect(result.views?.customViews).toEqual([
      {
        key: "mine",
        label: "Của tôi",
        baseKey: "overview",
        visibility: { b: false },
        order: ["a", "b"],
      },
    ]);
    expect(result.views?.activeKey).toBe("legal");
  });

  it("bỏ qua phần tử view hỏng trong mảng", () => {
    const legacy = {
      views: [null, { isCustom: true, key: 1, label: "x" }],
    } as unknown as V1TablePreference;

    expect(mapV1TablePreference(legacy).views?.customViews).toEqual([]);
  });
});
