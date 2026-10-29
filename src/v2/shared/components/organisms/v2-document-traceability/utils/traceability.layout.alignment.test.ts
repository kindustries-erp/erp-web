import { describe, expect, it } from "vitest";
import {
  computeAlignedStagePositions,
  HORIZONTAL_METRICS,
} from "./traceability.layout.alignment";
import type { StageNodeGroup } from "./traceability.layout.barycenter";
import type {
  TraceabilityEdge,
  TraceabilityNode,
} from "../types/traceability.type";

const makeNode = (id: string): TraceabilityNode => ({
  id,
  docType: "INVOICE",
  docNo: id,
  title: id,
  isCurrent: false,
  depth: 0,
  hasPermission: true,
  restricted: false,
  requiredResource: "",
});

describe("computeAlignedStagePositions", () => {
  it("aligns 1-1 connected nodes on the exact same Y in horizontal mode", () => {
    // Stage 0: [A (0), B (1)] => A is at headerHeight (48), B is at 48 + 185 = 233
    // Stage 1: [C] connects to B
    const stages: StageNodeGroup[] = [
      { stageKey: "ORDER_STOCK", nodes: [makeNode("A"), makeNode("B")] },
      { stageKey: "INVOICE", nodes: [makeNode("C")] },
    ];
    const edges: TraceabilityEdge[] = [
      {
        id: "e1",
        source: "B",
        target: "C",
        relationType: "NET_OFF",
        isTransitive: false,
      },
    ];

    const result = computeAlignedStagePositions(stages, edges, "horizontal");
    const posB = result.nodePositions.get("B")!;
    const posC = result.nodePositions.get("C")!;

    expect(posB.y).toBe(
      HORIZONTAL_METRICS.headerHeight + HORIZONTAL_METRICS.rowGap,
    );
    // C should align exactly to B's Y coordinate!
    expect(posC.y).toBe(posB.y);
  });

  it("places multi-parent node at the average Y of parents", () => {
    // Stage 0: A (48), B (233)
    // Stage 1: X connects to both A and B => targetY = (48 + 233) / 2 = 140.5
    const stages: StageNodeGroup[] = [
      { stageKey: "ORDER_STOCK", nodes: [makeNode("A"), makeNode("B")] },
      { stageKey: "INVOICE", nodes: [makeNode("X")] },
    ];
    const edges: TraceabilityEdge[] = [
      {
        id: "e1",
        source: "A",
        target: "X",
        relationType: "NET_OFF",
        isTransitive: false,
      },
      {
        id: "e2",
        source: "B",
        target: "X",
        relationType: "NET_OFF",
        isTransitive: false,
      },
    ];

    const result = computeAlignedStagePositions(stages, edges, "horizontal");
    const posA = result.nodePositions.get("A")!;
    const posB = result.nodePositions.get("B")!;
    const posX = result.nodePositions.get("X")!;

    expect(posX.y).toBe((posA.y + posB.y) / 2);
  });

  it("prevents collisions by pushing subsequent nodes down", () => {
    // Stage 0: [A] at 48
    // Stage 1: [X, Y]. Both connect to A. Target Y for both is 48.
    // X will take 48, Y must be pushed down to at least 48 + rowGap (233)
    const stages: StageNodeGroup[] = [
      { stageKey: "ORDER_STOCK", nodes: [makeNode("A")] },
      { stageKey: "INVOICE", nodes: [makeNode("X"), makeNode("Y")] },
    ];
    const edges: TraceabilityEdge[] = [
      {
        id: "e1",
        source: "A",
        target: "X",
        relationType: "NET_OFF",
        isTransitive: false,
      },
      {
        id: "e2",
        source: "A",
        target: "Y",
        relationType: "NET_OFF",
        isTransitive: false,
      },
    ];

    const result = computeAlignedStagePositions(stages, edges, "horizontal");
    const posX = result.nodePositions.get("X")!;
    const posY = result.nodePositions.get("Y")!;

    expect(posX.y).toBe(HORIZONTAL_METRICS.headerHeight);
    expect(posY.y).toBeGreaterThanOrEqual(posX.y + HORIZONTAL_METRICS.rowGap);
  });

  it("dynamically sizes stage height to accommodate nodes positioned lower down", () => {
    const stages: StageNodeGroup[] = [
      { stageKey: "ORDER_STOCK", nodes: [makeNode("A"), makeNode("B")] },
      { stageKey: "INVOICE", nodes: [makeNode("C")] },
    ];
    const edges: TraceabilityEdge[] = [
      {
        id: "e1",
        source: "B",
        target: "C",
        relationType: "NET_OFF",
        isTransitive: false,
      },
    ];

    const result = computeAlignedStagePositions(stages, edges, "horizontal");
    const dimStage1 = result.stageDimensions.get("INVOICE")!;
    const posC = result.nodePositions.get("C")!;

    // Stage frame must comfortably contain node C
    expect(dimStage1.height).toBeGreaterThan(posC.y);
  });
});
