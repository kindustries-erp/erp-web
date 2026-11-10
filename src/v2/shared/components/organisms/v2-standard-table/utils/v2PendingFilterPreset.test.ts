import { describe, expect, it } from "vitest";
import {
  consumePendingFilterPreset,
  setPendingFilterPreset,
} from "./v2PendingFilterPreset";

describe("v2PendingFilterPreset", () => {
  it("consume trả đúng snapshot đã đặt, rồi xóa", () => {
    setPendingFilterPreset("t-1", { q: "PO" });

    expect(consumePendingFilterPreset("t-1")).toEqual({ q: "PO" });
    expect(consumePendingFilterPreset("t-1")).toBeUndefined();
  });

  it("tách theo tableId", () => {
    setPendingFilterPreset("t-a", { q: "A" });
    setPendingFilterPreset("t-b", { q: "B" });

    expect(consumePendingFilterPreset("t-b")).toEqual({ q: "B" });
    expect(consumePendingFilterPreset("t-a")).toEqual({ q: "A" });
  });

  it("chưa đặt thì trả undefined", () => {
    expect(consumePendingFilterPreset("t-none")).toBeUndefined();
  });
});
