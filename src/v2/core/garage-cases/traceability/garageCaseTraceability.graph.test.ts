import { describe, expect, it } from "vitest";
import type { TraceabilityGraphData } from "@/v2/shared/components/organisms/v2-document-traceability";
import { buildGarageCaseTraceabilityGraph } from "./garageCaseTraceability.graph";

const t = (key: string) => key.split(".").pop() as string;
const caseInfo = { id: "case-1", tienCoThue: 1000, bienSoXe: "30A" };

const serverGraph = (
  over: Partial<TraceabilityGraphData> = {},
): TraceabilityGraphData => ({
  rootId: "case-1",
  rootType: "GARAGE_CASE",
  nodes: [],
  edges: [],
  summary: {
    totalAmount: 1000,
    totalNetOffAmount: 0,
    matchRatio: 0,
    directCount: 0,
    transitiveCount: 0,
  },
  ...over,
});

const node = (id: string, docType: string, depth = 1) =>
  ({
    id,
    docType,
    docNo: id,
    title: id,
    depth,
    isCurrent: false,
    hasPermission: true,
    restricted: false,
    requiredResource: "x",
  }) as never;

describe("buildGarageCaseTraceabilityGraph", () => {
  it("tạo node gốc khi chưa có đồ thị server", () => {
    const g = buildGarageCaseTraceabilityGraph({
      caseInfo,
      serverGraph: null,
      settlements: [],
      linkedInvoices: [],
      t,
    });
    expect(g.nodes).toHaveLength(1);
    expect(g.nodes[0].title).toBe("rootTitle (30A)");
  });

  it("không nhân đôi cạnh khi id cạnh client khác id cạnh server", () => {
    const g = buildGarageCaseTraceabilityGraph({
      caseInfo,
      serverGraph: serverGraph({
        nodes: [node("case-1", "GARAGE_CASE", 0), node("inv-1", "INVOICE")],
        edges: [
          {
            id: "e-case-case-1-inv-inv-1",
            source: "case-1",
            target: "inv-1",
            relationType: "CASE_ATTACHED",
            isTransitive: false,
          },
        ],
      }),
      settlements: [],
      linkedInvoices: [{ invoiceId: "inv-1", totalAmount: 500 }],
      t,
    });
    expect(g.edges).toHaveLength(1);
    expect(g.nodes.filter((n) => n.id === "inv-1")).toHaveLength(1);
  });

  it("không nhân đôi node thủ công (manual-<id> của server)", () => {
    const g = buildGarageCaseTraceabilityGraph({
      caseInfo,
      serverGraph: serverGraph({
        nodes: [
          node("case-1", "GARAGE_CASE", 0),
          node("manual-s1", "BANK_TXN"),
        ],
        edges: [
          {
            id: "e-x",
            source: "case-1",
            target: "manual-s1",
            relationType: "NET_OFF",
            amount: 300,
            isTransitive: false,
          },
        ],
      }),
      settlements: [{ id: "s1", amount: 300, settlement_type: "RECEIPT" }],
      linkedInvoices: [],
      t,
    });
    expect(g.nodes.filter((n) => n.docType === "BANK_TXN")).toHaveLength(1);
    expect(g.edges).toHaveLength(1);
    expect(g.summary.matchRatio).toBe(30);
  });

  it("bỏ hóa đơn đã gỡ khi sửa và node phụ thuộc nó", () => {
    const g = buildGarageCaseTraceabilityGraph({
      caseInfo,
      serverGraph: serverGraph({
        nodes: [
          node("case-1", "GARAGE_CASE", 0),
          node("inv-1", "INVOICE"),
          node("po-1", "PURCHASE_ORDER", 2),
        ],
        edges: [
          {
            id: "a",
            source: "case-1",
            target: "inv-1",
            relationType: "CASE_ATTACHED",
            isTransitive: false,
          },
          {
            id: "b",
            source: "inv-1",
            target: "po-1",
            relationType: "INVOICED_FROM",
            isTransitive: true,
          },
        ],
      }),
      settlements: [],
      linkedInvoices: [],
      t,
    });
    expect(g.nodes.map((n) => n.id)).toEqual(["case-1"]);
  });

  it("giữ node chặng sau còn nối với root", () => {
    const g = buildGarageCaseTraceabilityGraph({
      caseInfo,
      serverGraph: serverGraph({
        nodes: [
          node("case-1", "GARAGE_CASE", 0),
          node("inv-1", "INVOICE"),
          node("po-1", "PURCHASE_ORDER", 2),
        ],
        edges: [
          {
            id: "a",
            source: "case-1",
            target: "inv-1",
            relationType: "CASE_ATTACHED",
            isTransitive: false,
          },
          {
            id: "b",
            source: "inv-1",
            target: "po-1",
            relationType: "INVOICED_FROM",
            isTransitive: true,
          },
        ],
      }),
      settlements: [],
      linkedInvoices: [{ invoiceId: "inv-1" }],
      t,
    });
    expect(g.nodes.map((n) => n.id)).toContain("po-1");
    expect(g.summary.transitiveCount).toBe(1);
  });

  it("thêm khoản thu ngân hàng và thu ngoài ERP chưa lưu", () => {
    const g = buildGarageCaseTraceabilityGraph({
      caseInfo,
      serverGraph: null,
      settlements: [
        { tempId: "tmp", amount: 200, settlement_type: "PAYMENT" },
        {
          id: "s2",
          amount: 100,
          settlement_type: "RECEIPT",
          source_channel: "ON_SYSTEM",
          bank_transaction_id: "bt-1",
        },
      ],
      linkedInvoices: [],
      t,
    });
    expect(g.nodes.map((n) => n.id).sort()).toEqual(
      ["bt-1", "case-1", "manual-tmp"].sort(),
    );
    expect(g.summary.totalNetOffAmount).toBe(300);
  });
});
