import { describe, expect, it } from "vitest";
import {
  joinDateTime,
  minutesBefore,
  splitDateTime,
  toLocalDateTime,
} from "./V2DateTimePicker.helper";

describe("V2DateTimePicker.helper", () => {
  it("tách và ghép ngày giờ", () => {
    expect(splitDateTime("2026-11-24T08:05")).toEqual({
      date: "2026-11-24",
      time: "08:05",
    });
    expect(splitDateTime("")).toEqual({ date: "", time: "" });
    expect(joinDateTime("2026-11-24", "", "09:00")).toBe("2026-11-24T09:00");
    expect(joinDateTime("", "09:00", "09:00")).toBe("");
  });

  it("định dạng giờ máy và lùi theo phút", () => {
    const now = new Date(2026, 10, 24, 10, 0);
    expect(toLocalDateTime(now)).toBe("2026-11-24T10:00");
    expect(minutesBefore(30, now)).toBe("2026-11-24T09:30");
    expect(minutesBefore(0, now)).toBe("2026-11-24T10:00");
  });
});
