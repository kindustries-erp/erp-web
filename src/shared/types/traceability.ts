export type TraceabilityNodeType =
  | "INVOICE"
  | "BANK_TXN"
  | "PURCHASE_ORDER"
  | "SALES_ORDER"
  | "GOODS_RECEIPT"
  | "GOODS_ISSUE"
  | "JOURNAL_ENTRY"
  | "GARAGE_CASE";

export type TraceabilityRelationType =
  | "NET_OFF"
  | "INVOICED_FROM"
  | "RECEIPT_OF"
  | "ISSUE_OF"
  | "JOURNAL_POSTED"
  | "REPLACED_BY"
  | "CASE_ATTACHED";

export interface TraceabilityNode extends Record<string, unknown> {
  id: string;
  docType: TraceabilityNodeType;
  docNo: string;
  title: string;
  date?: string | null;
  amount?: number | null;
  netOffAmount?: number | null;
  status?: string | null;
  statusVariant?: "default" | "secondary" | "outline" | "danger" | "warning";
  isCurrent: boolean;
  depth: number;
  partnerName?: string | null;

  // RBAC Security Fields
  hasPermission: boolean;
  restricted: boolean;
  requiredResource: string;

  metadata?: Record<string, unknown>;
}

export interface TraceabilityEdge {
  id: string;
  source: string;
  target: string;
  relationType: TraceabilityRelationType;
  label?: string | null;
  amount?: number | null;
  isTransitive: boolean;
}

export interface TraceabilitySummary {
  totalAmount: number;
  totalNetOffAmount: number;
  matchRatio: number;
  directCount: number;
  transitiveCount: number;
}

export interface TraceabilityGraphData {
  rootId: string;
  rootType: TraceabilityNodeType;
  nodes: TraceabilityNode[];
  edges: TraceabilityEdge[];
  summary: TraceabilitySummary;
}
