import { describe, it, expect } from "vitest";
import { getPastMonthPresets, getCurrentMonthPreset } from "../datePresets";
import { format, startOfMonth, endOfMonth } from "date-fns";

describe("datePresets utilities", () => {
  describe("getPastMonthPresets", () => {
    it("should only generate options from the current month into the past", () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const presets = getPastMonthPresets(2);

      expect(presets.length).toBeGreaterThan(0);

      // First item must be the current month
      expect(presets[0].value).toBe(`month-${currentMonth}-${currentYear}`);
      expect(presets[0].label).toBe(`Tháng ${currentMonth}/${currentYear}`);

      // Verify no future months exist for current year
      for (let m = currentMonth + 1; m <= 12; m++) {
        const futureValue = `month-${m}-${currentYear}`;
        const found = presets.some((p) => p.value === futureValue);
        expect(found).toBe(false);
      }

      // Verify past months of previous year (all 12 months)
      const prevYear = currentYear - 1;
      for (let m = 1; m <= 12; m++) {
        const pastValue = `month-${m}-${prevYear}`;
        const found = presets.some((p) => p.value === pastValue);
        expect(found).toBe(true);
      }
    });

    it("should respect custom labelFormatter", () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const presets = getPastMonthPresets(1, (m, y) => `${m}/${y}`);
      expect(presets[0].label).toBe(`${currentMonth}/${currentYear}`);
    });
  });

  describe("getCurrentMonthPreset", () => {
    it("should return correct preset key, start of month, and end of month", () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const current = getCurrentMonthPreset();

      expect(current.presetKey).toBe(`month-${currentMonth}-${currentYear}`);
      expect(current.from).toBe(format(startOfMonth(now), "yyyy-MM-dd"));
      expect(current.to).toBe(format(endOfMonth(now), "yyyy-MM-dd"));
    });
  });
});
