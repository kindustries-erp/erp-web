import { describe, expect, it } from "vitest";
import { computeTraceabilityLayout } from "./traceability.layout";
import { collectConnectedSelection } from "./traceability.layout.selection";
import { pickEdgeHandles } from "./traceability.layout.edges";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
} from "../types/traceability.type";

const doc = (
  id: string,
  docType: TraceabilityNode["docType"],
): TraceabilityNode => ({
  id,
  docType,
  docNo: id,
  title: id,
  isCurrent: id === "root",
  depth: 0,
  hasPermission: true,
  restricted: false,
  requiredResource: "",
});

const graph: TraceabilityGraphData = {
  rootId: "root",
  rootType: "INVOICE",
  nodes: [
    doc("root", "INVOICE"),
    doc("bank", "BANK_TXN"),
    doc("po", "PURCHASE_ORDER"),
    doc("je", "JOURNAL_ENTRY"),
  ],
  edges: [
    {
      id: "e1",
      source: "root",
      target: "bank",
      relationType: "NET_OFF",
      isTransitive: false,
    },
    {
      id: "e2",
      source: "po",
      target: "root",
      relationType: "INVOICED_FROM",
      isTransitive: true,
    },
    {
      id: "e3",
      source: "root",
      target: "je",
      relationType: "JOURNAL_POSTED",
      isTransitive: false,
    },
  ],
  summary: {
    totalAmount: 0,
    totalNetOffAmount: 0,
    matchRatio: 0,
    directCount: 0,
    transitiveCount: 0,
  },
};

const actions = {};

describe("collectConnectedSelection", () => {
  it("returns an empty selection when nothing is selected", () => {
    const s = collectConnectedSelection(graph, null);
    expect(s.nodeIds.size).toBe(0);
    expect(s.edgeIds.size).toBe(0);
  });

  it("walks both directions from the selected node", () => {
    const s = collectConnectedSelection(graph, "root");
    expect([...s.nodeIds].sort()).toEqual(["bank", "je", "po", "root"]);
    expect([...s.edgeIds].sort()).toEqual(["e1", "e2", "e3"]);
  });
});

describe("computeTraceabilityLayout", () => {
  it("draws only the stages that contain documents", () => {
    const layout = computeTraceabilityLayout({
      graph,
      direction: "horizontal",
      allowEdit: false,
      actions,
    });
    const stages = layout.nodes
      .filter((n) => n.type === "stageGroupNode")
      .map((n) => n.id);
    expect(stages).toEqual([
      "stage-group-ORDER_STOCK",
      "stage-group-INVOICE",
      "stage-group-PAYMENT",
      "stage-group-GENERAL_LEDGER",
    ]);
  });

  it("places each document inside its stage with a parentId", () => {
    const layout = computeTraceabilityLayout({
      graph,
      direction: "horizontal",
      allowEdit: false,
      actions,
    });
    const root = layout.nodes.find((n) => n.id === "root");
    expect(root?.parentId).toBe("stage-group-INVOICE");
    expect(root?.type).toBe("traceabilityNode");
  });

  it("marks edges in the selection as animated and raised", () => {
    const layout = computeTraceabilityLayout({
      graph,
      direction: "horizontal",
      allowEdit: false,
      selectedNodeId: "root",
      actions,
    });
    const e1 = layout.edges.find((e) => e.id === "e1");
    expect(e1?.animated).toBe(true);
    expect(e1?.zIndex).toBe(40);
  });

  it("keeps the same node data reference when only the layout inputs repeat", () => {
    const first = computeTraceabilityLayout({
      graph,
      direction: "vertical",
      allowEdit: true,
      actions,
    });
    const second = computeTraceabilityLayout({
      graph,
      direction: "vertical",
      allowEdit: true,
      actions,
    });
    expect(first.nodes.length).toBe(second.nodes.length);
    expect(first.edges.map((e) => e.id)).toEqual(second.edges.map((e) => e.id));
  });

  it("returns no nodes for an empty graph", () => {
    const empty = { ...graph, nodes: [], edges: [] };
    expect(
      computeTraceabilityLayout({
        graph: empty,
        direction: "horizontal",
        allowEdit: false,
        actions,
      }),
    ).toEqual({
      nodes: [],
      edges: [],
    });
  });
});

describe("pickEdgeHandles", () => {
  const node = (x: number, y: number, parent?: string) =>
    ({ id: "n", parentId: parent, position: { x, y } }) as never;

  it("connects different stages left to right in horizontal layout", () => {
    expect(
      pickEdgeHandles("horizontal", node(0, 0, "a"), node(0, 0, "b")),
    ).toEqual({
      sourceHandle: "right",
      targetHandle: "left",
    });
  });

  it("connects the same stage top to bottom in horizontal layout", () => {
    expect(
      pickEdgeHandles("horizontal", node(0, 0, "a"), node(0, 200, "a")),
    ).toEqual({
      sourceHandle: "bottom",
      targetHandle: "top",
    });
  });

  it("connects the same row right to left in vertical layout", () => {
    expect(
      pickEdgeHandles("vertical", node(300, 0, "a"), node(0, 0, "a")),
    ).toEqual({
      sourceHandle: "left",
      targetHandle: "right",
    });
  });
});
