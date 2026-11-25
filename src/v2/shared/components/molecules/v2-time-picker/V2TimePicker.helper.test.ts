import { describe, expect, it } from "vitest";
import {
  buildMinutes,
  formatTime,
  isAfterMax,
  parseTime,
} from "./V2TimePicker.helper";

describe("V2TimePicker.helper", () => {
  it("parseTime nhận HH:mm hợp lệ, còn lại null", () => {
    expect(parseTime("07:05")).toEqual({ hour: 7, minute: 5 });
    expect(parseTime("24:00")).toBeNull();
    expect(parseTime("7:5")).toBeNull();
    expect(parseTime("")).toBeNull();
    expect(formatTime({ hour: 7, minute: 5 })).toBe("07:05");
  });

  it("buildMinutes theo bước, giữ phút lệch bước", () => {
    expect(buildMinutes(15)).toEqual([0, 15, 30, 45]);
    expect(buildMinutes(15, 7)).toEqual([0, 7, 15, 30, 45]);
    expect(buildMinutes(0)).toHaveLength(60);
  });

  it("isAfterMax so theo phút trong ngày", () => {
    expect(isAfterMax(10, 1, "10:00")).toBe(true);
    expect(isAfterMax(10, 0, "10:00")).toBe(false);
    expect(isAfterMax(23, 59)).toBe(false);
  });
});
