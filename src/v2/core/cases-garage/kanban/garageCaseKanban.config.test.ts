import { describe, it, expect } from "vitest";
import {
  GARAGE_LANE_STATUS,
  getGarageKanbanLaneAccent,
  kgaraCodeToLane,
  statusToLane,
} from "./garageCaseKanban.config";
import type { GarageKanbanLaneKey } from "./garageCaseKanban.type";

describe("garageCaseKanban.config", () => {
  it("cột ↔ status v2 là ánh xạ 2 chiều (QUOTATION ↔ QUOTED)", () => {
    const lanes = Object.keys(GARAGE_LANE_STATUS) as GarageKanbanLaneKey[];
    expect(lanes).toHaveLength(5);
    for (const lane of lanes) {
      expect(statusToLane(GARAGE_LANE_STATUS[lane])).toBe(lane);
    }
    expect(GARAGE_LANE_STATUS.QUOTATION).toBe("QUOTED");
  });

  it("kgaraCodeToLane theo mã 0/1/2/3/9, mã thiếu hoặc lạ về INTAKE", () => {
    expect([0, 1, 2, 3, 9].map(kgaraCodeToLane)).toEqual([
      "INTAKE",
      "QUOTATION",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ]);
    expect(kgaraCodeToLane(null)).toBe("INTAKE");
    expect(kgaraCodeToLane(7)).toBe("INTAKE");
  });

  it("getGarageKanbanLaneAccent trả về đúng semantic token và class cho 5 mốc", () => {
    expect(getGarageKanbanLaneAccent("INTAKE")).toEqual({
      token: "var(--muted-fg)",
      className: "bg-muted-fg",
      fallbackHex: "#64748b",
    });
    expect(getGarageKanbanLaneAccent("QUOTATION")).toEqual({
      token: "var(--warn-fg)",
      className: "bg-warning",
      fallbackHex: "#eab308",
    });
    expect(getGarageKanbanLaneAccent("IN_PROGRESS")).toEqual({
      token: "var(--amber-500, #f59e0b)",
      className: "bg-amber-500",
      fallbackHex: "#f59e0b",
    });
    expect(getGarageKanbanLaneAccent("COMPLETED")).toEqual({
      token: "var(--approve-fg)",
      className: "bg-success",
      fallbackHex: "#10b981",
    });
    expect(getGarageKanbanLaneAccent("CANCELLED")).toEqual({
      token: "var(--destructive)",
      className: "bg-destructive",
      fallbackHex: "#ef4444",
    });
  });
});
