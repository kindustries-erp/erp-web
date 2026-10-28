import { describe, expect, it } from "vitest";
import { Position } from "@xyflow/react";
import { computeEdgeGeometry } from "./traceability.edge-path";

describe("computeEdgeGeometry", () => {
  it("uses a smooth path and centres the label for a near horizontal edge", () => {
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

  it("detours below the stages when the target is far to the right", () => {
    const g = computeEdgeGeometry({
      sourceX: 0,
      sourceY: 100,
      targetX: 900,
      targetY: 100,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });
    expect(g.labelY).toBe(165);
    expect(g.path.startsWith("M 0 100")).toBe(true);
  });

  it("detours to the right of the stages when the target is far below", () => {
    const g = computeEdgeGeometry({
      sourceX: 50,
      sourceY: 0,
      targetX: 50,
      targetY: 500,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
    expect(g.labelX).toBe(230);
    expect(g.path.startsWith("M 50 0")).toBe(true);
  });
});
