/** Kiểu đồ thị chứng từ liên kết cho V2 (độc lập V1: không import `@/shared/types`) */
export type TraceabilityNodeType =
  | "INVOICE"
  | "BANK_TXN"
  | "PURCHASE_ORDER"
  | "SALES_ORDER"
  | "GOODS_RECEIPT"
  | "GOODS_ISSUE"
  | "JOURNAL_ENTRY"
  | "GARAGE_CASE"
  | "INVENTORY_ITEM"
  | "PRODUCTION_ORDER"
  | "BOM";

export type TraceabilityRelationType =
  | "NET_OFF"
  | "INVOICED_FROM"
  | "EXPENSE_FOR"
  | "RECEIPT_OF"
  | "ISSUE_OF"
  | "JOURNAL_POSTED"
  | "REPLACES"
  | "REPLACED_BY"
  | "ADJUSTS"
  | "ADJUSTED_BY"
  | "CASE_ATTACHED"
  | "MATERIAL_FOR"
  | "OUTPUT_OF";

export type TraceabilityStatusVariant =
  | "default"
  | "secondary"
  | "outline"
  | "danger"
  | "warning";

export interface TraceabilityNode {
  id: string;
  docType: TraceabilityNodeType;
  docNo: string;
  title: string;
  date?: string | null;
  amount?: number | null;
  netOffAmount?: number | null;
  status?: string | null;
  statusVariant?: TraceabilityStatusVariant;
  isCurrent: boolean;
  depth: number;
  partnerName?: string | null;
  hasPermission: boolean;
  restricted: boolean;
  requiredResource: string;
  sourceChannel?: string;
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

export type TraceabilityStageKey =
  | "ORDER_STOCK"
  | "INVOICE"
  | "PAYMENT"
  | "GENERAL_LEDGER";

export interface TraceabilityStageConfig {
  key: TraceabilityStageKey;
  stageNo: number;
  /** i18n key cho tiêu đề đầy đủ (vd: "v2.traceability.stage.invoice.title") */
  titleKey: string;
  /** i18n key cho nhãn ngắn hiển thị trên đầu cột */
  shortTitleKey: string;
  types: TraceabilityNodeType[];
  accentBorder: string;
  badgeCls: string;
  bgCls: string;
}

export type TraceabilityViewMode = "canvas" | "pipeline" | "table";
export type TraceabilityLayoutDirection = "horizontal" | "vertical";
