import { describe, expect, it } from "vitest";
import {
  DEFAULT_SELECTABLE_DOC_TYPES,
  getSelectableDocTypes,
  getStageForDocType,
  countLinkedNodes,
  removeNodeFromGraph,
} from "./traceability.helper";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
} from "../types/traceability.type";

const node = (id: string, amount = 0, isCurrent = false): TraceabilityNode => ({
  id,
  docType: "INVOICE",
  docNo: id,
  title: id,
  amount,
  isCurrent,
  depth: 0,
  hasPermission: true,
  restricted: false,
  requiredResource: "",
});

describe("getStageForDocType", () => {
  it("maps a bank transaction to the payment stage", () => {
    expect(getStageForDocType("BANK_TXN").key).toBe("PAYMENT");
  });

  it("maps an invoice to the invoice stage", () => {
    expect(getStageForDocType("INVOICE").key).toBe("INVOICE");
  });

  it("falls back to the first stage for an unknown type", () => {
    expect(getStageForDocType("UNKNOWN" as never).key).toBe("ORDER_STOCK");
  });
});

describe("countLinkedNodes", () => {
  it("excludes the root node", () => {
    const graph = {
      nodes: [node("root", 0, true), node("a"), node("b")],
    } as TraceabilityGraphData;
    expect(countLinkedNodes(graph)).toBe(2);
  });

  it("never returns a negative count", () => {
    expect(
      countLinkedNodes({ nodes: [] } as unknown as TraceabilityGraphData),
    ).toBe(0);
  });
});

describe("getSelectableDocTypes", () => {
  it("returns the default list when no allowed types are given", () => {
    expect(getSelectableDocTypes()).toEqual(DEFAULT_SELECTABLE_DOC_TYPES);
    expect(getSelectableDocTypes([])).toEqual(DEFAULT_SELECTABLE_DOC_TYPES);
  });

  it("returns the allowed types as-is when provided", () => {
    expect(getSelectableDocTypes(["SALES_ORDER", "INVOICE"])).toEqual([
      "SALES_ORDER",
      "INVOICE",
    ]);
  });
});

describe("removeNodeFromGraph", () => {
  it("drops the node, its edges and subtracts its amount", () => {
    const base = {
      rootId: "root",
      rootType: "INVOICE",
      nodes: [node("root", 0), node("a", 100), node("b", 50)],
      edges: [
        {
          id: "e1",
          source: "root",
          target: "a",
          relationType: "NET_OFF",
          isTransitive: false,
        },
        {
          id: "e2",
          source: "root",
          target: "b",
          relationType: "NET_OFF",
          isTransitive: false,
        },
      ],
      summary: {
        totalAmount: 150,
        totalNetOffAmount: 150,
        matchRatio: 1,
        directCount: 2,
        transitiveCount: 0,
      },
    } as unknown as TraceabilityGraphData;

    const next = removeNodeFromGraph(base, "a");
    expect(next.nodes.map((n) => n.id)).toEqual(["root", "b"]);
    expect(next.edges.map((e) => e.id)).toEqual(["e2"]);
    expect(next.summary.totalNetOffAmount).toBe(50);
    expect(next.summary.directCount).toBe(1);
    expect(base.nodes).toHaveLength(3);
  });

  it("clamps the net-off total at zero", () => {
    const base = {
      rootId: "root",
      rootType: "INVOICE",
      nodes: [node("root", 0), node("a", 100)],
      edges: [],
      summary: {
        totalAmount: 100,
        totalNetOffAmount: 10,
        matchRatio: 0,
        directCount: 1,
        transitiveCount: 0,
      },
    } as unknown as TraceabilityGraphData;
    expect(removeNodeFromGraph(base, "a").summary.totalNetOffAmount).toBe(0);
  });
});
