import { describe, expect, it } from "vitest";
import {
  barycenterSortStages,
  type StageNodeGroup,
} from "./traceability.layout.barycenter";
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

describe("barycenterSortStages", () => {
  it("preserves stage structure when no edges exist", () => {
    const stages: StageNodeGroup[] = [
      { stageKey: "ORDER_STOCK", nodes: [makeNode("A"), makeNode("B")] },
      { stageKey: "INVOICE", nodes: [makeNode("C"), makeNode("D")] },
    ];
    const result = barycenterSortStages(stages, []);
    expect(result[0].nodes.map((n) => n.id)).toEqual(["A", "B"]);
    expect(result[1].nodes.map((n) => n.id)).toEqual(["C", "D"]);
  });

  it("reorders nodes in downstream stage to untangle crossing edges", () => {
    // Stage 0: [A (idx 0), B (idx 1)]
    // Stage 1: [C (idx 0), D (idx 1)]
    // Cross edges: A connects to D, B connects to C
    const stages: StageNodeGroup[] = [
      { stageKey: "ORDER_STOCK", nodes: [makeNode("A"), makeNode("B")] },
      { stageKey: "INVOICE", nodes: [makeNode("C"), makeNode("D")] },
    ];
    const edges: TraceabilityEdge[] = [
      {
        id: "e1",
        source: "A",
        target: "D",
        relationType: "NET_OFF",
        isTransitive: false,
      },
      {
        id: "e2",
        source: "B",
        target: "C",
        relationType: "NET_OFF",
        isTransitive: false,
      },
    ];

    const result = barycenterSortStages(stages, edges);

    // After forward sweep, D's barycenter is pos(A)=0, C's barycenter is pos(B)=1
    // So Stage 1 should be reordered to [D, C]
    expect(result[1].nodes.map((n) => n.id)).toEqual(["D", "C"]);
  });

  it("calculates average barycenter for node with multiple parents", () => {
    // Stage 0: [A (0), B (1), C (2)]
    // Stage 1: [X, Y]
    // X connects to A (0) and C (2) => barycenter = (0 + 2)/2 = 1.0
    // Y connects to A (0) only => barycenter = 0
    const stages: StageNodeGroup[] = [
      {
        stageKey: "ORDER_STOCK",
        nodes: [makeNode("A"), makeNode("B"), makeNode("C")],
      },
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
        source: "C",
        target: "X",
        relationType: "NET_OFF",
        isTransitive: false,
      },
      {
        id: "e3",
        source: "A",
        target: "Y",
        relationType: "NET_OFF",
        isTransitive: false,
      },
    ];

    const result = barycenterSortStages(stages, edges);
    // Y (0) should come before X (1.0)
    expect(result[1].nodes.map((n) => n.id)).toEqual(["Y", "X"]);
  });

  it("handles single-node stages without error", () => {
    const stages: StageNodeGroup[] = [
      { stageKey: "ORDER_STOCK", nodes: [makeNode("A")] },
      { stageKey: "INVOICE", nodes: [makeNode("B")] },
    ];
    const edges: TraceabilityEdge[] = [
      {
        id: "e1",
        source: "A",
        target: "B",
        relationType: "NET_OFF",
        isTransitive: false,
      },
    ];
    const result = barycenterSortStages(stages, edges);
    expect(result[0].nodes[0].id).toBe("A");
    expect(result[1].nodes[0].id).toBe("B");
  });
});
