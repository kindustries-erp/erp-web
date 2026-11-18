import { describe, expect, it } from "vitest";
import { Position } from "@xyflow/react";
import { computeEdgeGeometry } from "./traceability.edge-path";

describe("computeEdgeGeometry", () => {
  it("uses a straight horizontal path and centres the label when Y is aligned", () => {
    const g = computeEdgeGeometry({
      sourceX: 0,
      sourceY: 100,
      targetX: 200,
      targetY: 100,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });
    expect(g.path.length).toBeGreaterThan(0);
    expect(g.labelY).toBe(100);
    expect(g.labelX).toBe(100);
  });

  it("takes the shortest direct path without detour even when target is far to the right", () => {
    const g = computeEdgeGeometry({
      sourceX: 0,
      sourceY: 100,
      targetX: 900,
      targetY: 100,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });
    expect(g.labelY).toBe(100);
    expect(g.labelX).toBe(450);
    expect(g.path.startsWith("M0 100")).toBe(true);
  });

  it("takes the shortest direct vertical path without detour when X is aligned", () => {
    const g = computeEdgeGeometry({
      sourceX: 50,
      sourceY: 0,
      targetX: 50,
      targetY: 500,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
    expect(g.labelX).toBe(50);
    expect(g.labelY).toBe(250);
    expect(g.path.startsWith("M50 0")).toBe(true);
  });

  it("steps vertically at the first gap when connecting multi-column with different Y", () => {
    const g = computeEdgeGeometry({
      sourceX: 300,
      sourceY: 270,
      targetX: 920,
      targetY: 540,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });
    // First gap is at sourceX + 60 = 360
    expect(g.labelX).toBe(360);
    expect(g.labelY).toBe((270 + 540) / 2);
    expect(g.path.includes("360")).toBe(true);
  });
});
