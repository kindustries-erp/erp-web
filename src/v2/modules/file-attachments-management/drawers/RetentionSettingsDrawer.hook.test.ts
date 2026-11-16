import { describe, expect, it } from "vitest";
import { parseRetentionDays } from "./RetentionSettingsDrawer.hook";

describe("parseRetentionDays", () => {
  it("nhận số nguyên 1..3650", () => {
    expect(parseRetentionDays("1")).toBe(1);
    expect(parseRetentionDays("30")).toBe(30);
    expect(parseRetentionDays("3650")).toBe(3650);
  });
  it("từ chối rỗng, 0, âm, thập phân, vượt trần, chữ", () => {
    for (const bad of ["", "0", "-5", "1.5", "3651", "abc"]) {
      expect(parseRetentionDays(bad)).toBeNull();
    }
  });
});
