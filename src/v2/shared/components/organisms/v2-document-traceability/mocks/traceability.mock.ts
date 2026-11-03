import type {
  TraceabilityGraphData,
  TraceabilityNode,
} from "../types/traceability.type";

const doc = (
  id: string,
  docType: TraceabilityNode["docType"],
  docNo: string,
  over: Partial<TraceabilityNode> = {},
): TraceabilityNode => ({
  id,
  docType,
  docNo,
  title: `Chứng từ ${docNo}`,
  date: "2026-10-26",
  amount: 1413720,
  isCurrent: id === "root",
  depth: id === "root" ? 0 : 1,
  hasPermission: true,
  restricted: false,
  requiredResource: "",
  ...over,
});

/** Đồ thị mẫu cho story và test: hóa đơn gốc, một giao dịch ngân hàng, một PO, một bút toán */
export const TRACEABILITY_MOCK_GRAPH: TraceabilityGraphData = {
  rootId: "root",
  rootType: "INVOICE",
  nodes: [
    doc("root", "INVOICE", "2148", { partnerName: "CÔNG TY CỔ PHẦN HAPS" }),
    doc("bank", "BANK_TXN", "UNC-77", {
      netOffAmount: 500000,
      partnerName: "CÔNG TY CỔ PHẦN HAPS",
    }),
    doc("po", "PURCHASE_ORDER", "PO-12", { partnerName: "NCC A" }),
    doc("je", "JOURNAL_ENTRY", "GL-9"),
  ],
  edges: [
    {
      id: "e1",
      source: "root",
      target: "bank",
      relationType: "NET_OFF",
      isTransitive: false,
      label: "Thanh toán: 500.000 đ",
    },
    {
      id: "e2",
      source: "po",
      target: "root",
      relationType: "INVOICED_FROM",
      isTransitive: false,
    },
    {
      id: "e3",
      source: "root",
      target: "je",
      relationType: "JOURNAL_POSTED",
      isTransitive: true,
      label: "Bút toán (HĐ mua)",
    },
  ],
  summary: {
    totalAmount: 1413720,
    totalNetOffAmount: 500000,
    matchRatio: 0.35,
    directCount: 2,
    transitiveCount: 1,
  },
};

/** Một chứng từ đơn lẻ dùng cho story thẻ */
export const TRACEABILITY_MOCK_NODE = doc("bank", "BANK_TXN", "UNC-77", {
  netOffAmount: 500000,
});
