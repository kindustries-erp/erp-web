import { describe, expect, it } from "vitest";
import {
  canOpenTraceNode,
  canUnlinkTraceNode,
  splitLinkedNodes,
} from "./traceability.access";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
} from "../types/traceability.type";

const node = (over: Partial<TraceabilityNode> = {}): TraceabilityNode => ({
  id: "n",
  docType: "INVOICE",
  docNo: "N",
  title: "N",
  isCurrent: false,
  depth: 1,
  hasPermission: true,
  restricted: false,
  requiredResource: "",
  ...over,
});

describe("canOpenTraceNode", () => {
  it("opens an ordinary document with permission", () => {
    expect(canOpenTraceNode(node(), false)).toBe(true);
  });

  it("refuses a restricted or unauthorised document", () => {
    expect(canOpenTraceNode(node({ restricted: true }), true)).toBe(false);
    expect(canOpenTraceNode(node({ hasPermission: false }), true)).toBe(false);
  });

  it("never opens a journal entry", () => {
    expect(canOpenTraceNode(node({ docType: "JOURNAL_ENTRY" }), true)).toBe(
      false,
    );
  });

  it("opens a manual settlement only while editing", () => {
    const manual = node({ docType: "BANK_TXN", id: "manual-1" });
    expect(canOpenTraceNode(manual, false)).toBe(false);
    expect(canOpenTraceNode(manual, true)).toBe(true);
  });
});

describe("canUnlinkTraceNode", () => {
  it("allows unlinking a direct link while editing", () => {
    expect(canUnlinkTraceNode(node(), true)).toBe(true);
  });

  it("blocks unlinking outside edit mode, the root, restricted and indirect nodes", () => {
    expect(canUnlinkTraceNode(node(), false)).toBe(false);
    expect(canUnlinkTraceNode(node({ isCurrent: true }), true)).toBe(false);
    expect(canUnlinkTraceNode(node({ restricted: true }), true)).toBe(false);
    expect(canUnlinkTraceNode(node({ depth: 2 }), true)).toBe(false);
  });
});

describe("splitLinkedNodes", () => {
  it("separates direct and indirect nodes and drops the root", () => {
    const graph = {
      rootId: "root",
      rootType: "INVOICE",
      nodes: [
        node({ id: "root", isCurrent: true, depth: 0 }),
        node({ id: "a", depth: 1 }),
        node({ id: "b", depth: 2 }),
      ],
      edges: [],
      summary: {
        totalAmount: 0,
        totalNetOffAmount: 0,
        matchRatio: 0,
        directCount: 1,
        transitiveCount: 1,
      },
    } as TraceabilityGraphData;
    const split = splitLinkedNodes(graph);
    expect(split.direct.map((n) => n.id)).toEqual(["a"]);
    expect(split.transitive.map((n) => n.id)).toEqual(["b"]);
  });
});
