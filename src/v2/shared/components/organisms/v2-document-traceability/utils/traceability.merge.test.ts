import { describe, expect, it } from "vitest";
import type {
  TraceabilityEdge,
  TraceabilityGraphData,
  TraceabilityNode,
} from "../types/traceability.type";
import { mergeTraceabilityGraph } from "./traceability.merge";

const node = (
  id: string,
  overrides: Partial<TraceabilityNode> = {},
): TraceabilityNode => ({
  id,
  docType: "INVOICE",
  docNo: id.toUpperCase(),
  title: id,
  isCurrent: false,
  depth: 1,
  hasPermission: true,
  restricted: false,
  requiredResource: "invoices",
  ...overrides,
});

const edge = (
  id: string,
  source: string,
  target: string,
  overrides: Partial<TraceabilityEdge> = {},
): TraceabilityEdge => ({
  id,
  source,
  target,
  relationType: "INVOICED_FROM",
  isTransitive: false,
  ...overrides,
});

const ROOT = node("case", {
  docType: "GARAGE_CASE",
  isCurrent: true,
  depth: 0,
  amount: 1000,
});

const graph = (
  nodes: TraceabilityNode[],
  edges: TraceabilityEdge[],
): TraceabilityGraphData => ({
  rootId: ROOT.id,
  rootType: "GARAGE_CASE",
  nodes,
  edges,
  summary: {
    totalAmount: 1000,
    totalNetOffAmount: 0,
    matchRatio: 0,
    directCount: 0,
    transitiveCount: 0,
  },
});

const ids = (items: { id: string }[]) => items.map((i) => i.id).sort();

describe("mergeTraceabilityGraph", () => {
  it("chỉ có node gốc khi chưa có dữ liệu server và overlay", () => {
    const result = mergeTraceabilityGraph({ server: null, root: ROOT });
    expect(ids(result.nodes)).toEqual(["case"]);
    expect(result.edges).toEqual([]);
    expect(result.summary).toMatchObject({
      directCount: 0,
      transitiveCount: 0,
      totalAmount: 1000,
    });
  });

  it("giữ nguyên node và cạnh server, kể cả node chặng sau còn nối tới gốc", () => {
    const server = graph(
      [ROOT, node("inv1"), node("txn1", { docType: "BANK_TXN", depth: 2 })],
      [edge("e1", "case", "inv1"), edge("e2", "inv1", "txn1")],
    );
    const result = mergeTraceabilityGraph({ server, root: ROOT });
    expect(ids(result.nodes)).toEqual(["case", "inv1", "txn1"]);
    expect(ids(result.edges)).toEqual(["e1", "e2"]);
    expect(result.summary).toMatchObject({
      directCount: 1,
      transitiveCount: 1,
    });
  });

  it("bỏ node không còn hiệu lực cùng cạnh và các node chỉ nối qua nó", () => {
    const server = graph(
      [ROOT, node("inv1"), node("txn1", { depth: 2 }), node("inv2")],
      [
        edge("e1", "case", "inv1"),
        edge("e2", "inv1", "txn1"),
        edge("e3", "case", "inv2"),
      ],
    );
    const result = mergeTraceabilityGraph({
      server,
      root: ROOT,
      isNodeActive: (n) => n.id !== "inv1",
    });
    expect(ids(result.nodes)).toEqual(["case", "inv2"]);
    expect(ids(result.edges)).toEqual(["e3"]);
  });

  it("không áp isNodeActive cho node gốc", () => {
    const server = graph([ROOT], []);
    const result = mergeTraceabilityGraph({
      server,
      root: ROOT,
      isNodeActive: () => false,
    });
    expect(ids(result.nodes)).toEqual(["case"]);
  });

  it("không thêm cạnh client khi server đã có cạnh cùng cặp node (cả chiều ngược)", () => {
    const server = graph(
      [ROOT, node("inv1")],
      [edge("e-case-case-inv-inv1", "case", "inv1")],
    );
    const result = mergeTraceabilityGraph({
      server,
      root: ROOT,
      overlayEdges: [
        edge("e-case-case-inv1", "case", "inv1", {
          relationType: "CASE_ATTACHED",
        }),
        edge("e-reverse", "inv1", "case"),
      ],
    });
    expect(ids(result.edges)).toEqual(["e-case-case-inv-inv1"]);
  });

  it("thêm node và cạnh client khi chưa có trong server", () => {
    const result = mergeTraceabilityGraph({
      server: graph([ROOT], []),
      root: ROOT,
      overlayNodes: [node("inv-new")],
      overlayEdges: [edge("e-new", "case", "inv-new")],
    });
    expect(ids(result.nodes)).toEqual(["case", "inv-new"]);
    expect(ids(result.edges)).toEqual(["e-new"]);
  });

  it("không nhân đôi node khi overlay trùng id với node server", () => {
    const server = graph(
      [ROOT, node("manual-1")],
      [edge("e1", "case", "manual-1")],
    );
    const result = mergeTraceabilityGraph({
      server,
      root: ROOT,
      overlayNodes: [node("manual-1", { title: "bản client" })],
    });
    expect(result.nodes.filter((n) => n.id === "manual-1")).toHaveLength(1);
    expect(result.nodes.find((n) => n.id === "manual-1")?.title).toBe(
      "manual-1",
    );
  });

  it("bỏ cạnh overlay trỏ tới node không tồn tại", () => {
    const result = mergeTraceabilityGraph({
      server: graph([ROOT], []),
      root: ROOT,
      overlayEdges: [edge("e-ghost", "case", "ghost")],
    });
    expect(result.edges).toEqual([]);
  });

  it("loại node mồ côi không nối được tới node gốc", () => {
    const server = graph([ROOT, node("lonely")], []);
    const result = mergeTraceabilityGraph({ server, root: ROOT });
    expect(ids(result.nodes)).toEqual(["case"]);
  });

  it("maxDepth giữ lại chỉ các liên kết trực tiếp", () => {
    const server = graph(
      [ROOT, node("inv1"), node("txn1", { depth: 2 })],
      [edge("e1", "case", "inv1"), edge("e2", "inv1", "txn1")],
    );
    const result = mergeTraceabilityGraph({ server, root: ROOT, maxDepth: 1 });
    expect(ids(result.nodes)).toEqual(["case", "inv1"]);
  });

  it("tính tổng cấn trừ theo cạnh sau dedupe và giới hạn tỷ lệ 100%", () => {
    const server = graph(
      [ROOT, node("t1", { docType: "BANK_TXN" })],
      [edge("e1", "case", "t1", { relationType: "NET_OFF", amount: 400 })],
    );
    const result = mergeTraceabilityGraph({
      server,
      root: ROOT,
      overlayEdges: [
        edge("dup", "case", "t1", { relationType: "NET_OFF", amount: 400 }),
      ],
    });
    expect(result.summary.totalNetOffAmount).toBe(400);
    expect(result.summary.matchRatio).toBe(40);

    const over = mergeTraceabilityGraph({
      server,
      root: ROOT,
      totalAmount: 100,
    });
    expect(over.summary.matchRatio).toBe(100);
  });

  it("matchRatio bằng 0 khi tổng tiền chứng từ gốc bằng 0", () => {
    const result = mergeTraceabilityGraph({
      server: null,
      root: { ...ROOT, amount: 0 },
    });
    expect(result.summary.matchRatio).toBe(0);
  });

  it("không đổi dữ liệu đầu vào", () => {
    const server = graph([ROOT, node("inv1")], [edge("e1", "case", "inv1")]);
    const snapshot = JSON.stringify(server);
    mergeTraceabilityGraph({
      server,
      root: ROOT,
      isNodeActive: () => false,
      overlayNodes: [node("x")],
    });
    expect(JSON.stringify(server)).toBe(snapshot);
  });
});
