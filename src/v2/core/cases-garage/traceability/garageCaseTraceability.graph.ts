import {
  mergeTraceabilityGraph,
  type TraceabilityEdge,
  type TraceabilityGraphData,
  type TraceabilityNode,
} from "@/v2/shared/components/organisms/v2-document-traceability";
import type {
  BuildGarageCaseTraceabilityInput,
  GarageCaseLinkedInvoice,
  GarageCaseSettlement,
  GarageCaseTraceabilityCase,
} from "./garageCaseTraceability.type";

const K = "v2.garageCases.traceability.";

const caseAmount = (c: GarageCaseTraceabilityCase): number =>
  Number(c.tienCoThue || c.rawData?.TongTienThanhToan || c.doanhThu || 0);

const invoiceIdOf = (inv: GarageCaseLinkedInvoice): string | undefined =>
  inv.invoiceId || inv.id || inv.invoice?.id;

/** Id node thủ công khớp backend: `manual-${settlement_id}` */
const manualNodeId = (s: GarageCaseSettlement): string =>
  `manual-${s.id ?? s.tempId ?? ""}`;

const bankTxnIdOf = (s: GarageCaseSettlement): string | null =>
  s.bank_transaction_id || s.bankTransactionId || null;

const isReceipt = (s: GarageCaseSettlement): boolean =>
  s.settlement_type === "RECEIPT" || s.settlementType === "RECEIPT";

const isOnSystem = (s: GarageCaseSettlement): boolean =>
  s.source_channel === "ON_SYSTEM" || s.sourceChannel === "ON_SYSTEM";

/** Id node mà khoản thu/chi sinh ra trên đồ thị */
const settlementNodeId = (s: GarageCaseSettlement): string =>
  (isOnSystem(s) ? bankTxnIdOf(s) : null) ?? manualNodeId(s);

function buildRootNode(
  c: GarageCaseTraceabilityCase,
  t: BuildGarageCaseTraceabilityInput["t"],
): TraceabilityNode {
  const plate = c.bienSoXe ? ` (${c.bienSoXe})` : "";
  return {
    id: c.id,
    docType: "GARAGE_CASE",
    docNo: c.soChungTu || `PDV-${c.id.slice(0, 8)}`,
    title: `${t(`${K}rootTitle`)}${plate}`,
    date: c.ngayPhatSinh
      ? new Date(c.ngayPhatSinh).toISOString().slice(0, 10)
      : null,
    amount: caseAmount(c),
    status: c.tenTinhTrangDichVu || t(`${K}statusProcessing`),
    statusVariant: c.tinhTrangDichVu === 3 ? "default" : "secondary",
    partnerName: c.khachHangName,
    depth: 0,
    isCurrent: true,
    hasPermission: true,
    restricted: false,
    requiredResource: "garage",
  };
}

function buildInvoiceOverlay(
  rootId: string,
  invoices: GarageCaseLinkedInvoice[],
  t: BuildGarageCaseTraceabilityInput["t"],
): { nodes: TraceabilityNode[]; edges: TraceabilityEdge[] } {
  const nodes: TraceabilityNode[] = [];
  const edges: TraceabilityEdge[] = [];
  for (const inv of invoices) {
    const id = invoiceIdOf(inv);
    if (!id) continue;
    const isOut = inv.linkType === "OUT" || inv.direction === "OUT";
    const serial = inv.serialNo || inv.invoice?.serialNo;
    const kind = t(`${K}${isOut ? "invoiceOut" : "invoiceIn"}`);
    nodes.push({
      id,
      docType: "INVOICE",
      docNo:
        inv.invoiceNo || inv.invoice?.invoiceNo || t(`${K}invoiceNoFallback`),
      title: `${kind}${serial ? ` (${serial})` : ""}`,
      date:
        inv.invoiceDate || inv.invoice?.invoiceDate || inv.createdAt || null,
      amount: Number(inv.totalAmount || inv.invoice?.totalAmount || 0),
      status: inv.status || inv.invoice?.status || "CONFIRMED",
      statusVariant: "default",
      partnerName:
        inv.partnerName ||
        inv.sellerName ||
        inv.buyerName ||
        inv.invoice?.sellerName ||
        inv.invoice?.buyerName ||
        "",
      depth: 1,
      isCurrent: false,
      hasPermission: true,
      restricted: false,
      requiredResource: "invoices",
    });
    edges.push({
      id: `e-case-${rootId}-${id}`,
      source: rootId,
      target: id,
      relationType: "CASE_ATTACHED",
      label: t(`${K}${isOut ? "invoiceOutEdge" : "invoiceInEdge"}`),
      isTransitive: false,
    });
  }
  return { nodes, edges };
}

function buildSettlementOverlay(
  rootId: string,
  settlements: GarageCaseSettlement[],
  t: BuildGarageCaseTraceabilityInput["t"],
): { nodes: TraceabilityNode[]; edges: TraceabilityEdge[] } {
  const nodes: TraceabilityNode[] = [];
  const edges: TraceabilityEdge[] = [];
  for (const s of settlements) {
    const id = settlementNodeId(s);
    const receipt = isReceipt(s);
    const amount = Number(s.amount || 0);
    const partner = s.partner_name || s.partnerName;
    const onSystem = isOnSystem(s);
    const date =
      s.trans_date || s.transDate || s.created_at || s.createdAt || null;
    const base = {
      id,
      docType: "BANK_TXN" as const,
      date,
      amount,
      netOffAmount: amount,
      depth: 1,
      isCurrent: false,
      hasPermission: true,
      restricted: false,
      requiredResource: "bank_statements",
    };
    if (onSystem) {
      nodes.push({
        ...base,
        docNo:
          s.referenceNumber || s.reference_number || `TXN-${id.slice(0, 8)}`,
        title: `${t(`${K}${receipt ? "bankReceipt" : "bankPayment"}`)} (${s.bankName || "ERP"})`,
        status: "CLEARED",
        statusVariant: "default",
        partnerName: partner || s.correspondentName || t(`${K}partnerFallback`),
      });
    } else {
      const who = partner || t(`${K}internalPartner`);
      nodes.push({
        ...base,
        docNo: `NOTE-${s.category || "TIEN_MAT_NGOAI"}`,
        title: `${t(`${K}${receipt ? "manualReceipt" : "manualPayment"}`)} (${who})`,
        status: "MANUAL_NOTE",
        statusVariant: "outline",
        partnerName: who,
        metadata: { isOffSystem: true, note: s.note, category: s.category },
      });
    }
    const edgeKey = onSystem
      ? receipt
        ? "netOffReceipt"
        : "netOffPayment"
      : receipt
        ? "manualReceiptEdge"
        : "manualPaymentEdge";
    edges.push({
      id: `e-case-${rootId}-${id}`,
      source: rootId,
      target: id,
      relationType: "NET_OFF",
      label: `${t(`${K}${edgeKey}`)}: ${amount.toLocaleString("vi-VN")} ₫`,
      amount,
      isTransitive: false,
    });
  }
  return { nodes, edges };
}

/**
 * Dựng đồ thị chứng từ liên kết của phiếu garage: gộp đồ thị backend với
 * hóa đơn và khoản thu/chi đang hiệu lực (kể cả thay đổi chưa lưu khi sửa).
 */
export function buildGarageCaseTraceabilityGraph(
  input: BuildGarageCaseTraceabilityInput,
): TraceabilityGraphData {
  const { caseInfo, serverGraph, settlements, linkedInvoices, t, maxDepth } =
    input;
  const root = buildRootNode(caseInfo, t);
  const activeInvoiceIds = new Set(
    linkedInvoices.map(invoiceIdOf).filter((id): id is string => Boolean(id)),
  );
  const activeBankIds = new Set<string>();
  settlements.forEach((s) => {
    [s.id, s.tempId, bankTxnIdOf(s), manualNodeId(s)].forEach((id) => {
      if (id) activeBankIds.add(id);
    });
  });

  const invoices = buildInvoiceOverlay(root.id, linkedInvoices, t);
  const payments = buildSettlementOverlay(root.id, settlements, t);

  return mergeTraceabilityGraph({
    server: serverGraph,
    root,
    maxDepth,
    // Chỉ node gắn trực tiếp mới đối chiếu với danh sách đang hiệu lực; chặng sau giữ nếu còn nối root
    isNodeActive: (node) => {
      if (node.depth !== 1) return true;
      if (node.docType === "INVOICE") return activeInvoiceIds.has(node.id);
      if (node.docType === "BANK_TXN") return activeBankIds.has(node.id);
      return true;
    },
    overlayNodes: [...invoices.nodes, ...payments.nodes],
    overlayEdges: [...invoices.edges, ...payments.edges],
    totalAmount: caseAmount(caseInfo),
  });
}
