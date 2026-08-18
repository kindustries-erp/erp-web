import type {
  TraceabilityGraphData,
  TraceabilityNode,
  TraceabilityNodeType,
} from "@/shared/types/traceability";

export type BusinessStageKey =
  | "ORDER_STOCK"
  | "INVOICE"
  | "PAYMENT"
  | "GENERAL_LEDGER";

export interface StageConfig {
  key: BusinessStageKey;
  stageNo: number;
  title: string;
  shortTitle: string;
  types: TraceabilityNodeType[];
  accentBorder: string;
  badgeCls: string;
  bgCls: string;
}

export type TraceabilityViewMode = "canvas" | "pipeline" | "table";
export type CanvasLayoutDirection = "horizontal" | "vertical";

export interface DrawerDocumentTraceabilityProps {
  rootId: string;
  rootType?: TraceabilityNodeType;
  fetchGraph: (id: string) => Promise<TraceabilityGraphData>;
  editMode?: boolean;
  allowEdit?: boolean;
  allowedDocTypes?: TraceabilityNodeType[];
  onAddLink?: (
    stageKey?: BusinessStageKey,
    docType?: TraceabilityNodeType,
  ) => void;
  onUnlinkNode?: (node: TraceabilityNode) => Promise<void> | void;
  /** Callback mở modal / drawer chỉnh sửa chi tiết giao dịch thu chi ngoài (số tiền, ngày, nội dung) */
  onEditManualSettlement?: (node: TraceabilityNode) => void;
  className?: string;
}

export interface NodeCardCustomData
  extends TraceabilityNode, Record<string, unknown> {
  allowEdit?: boolean;
  onUnlink?: (node: TraceabilityNode) => void;
  onEditManualSettlement?: (node: TraceabilityNode) => void;
}

export interface StageGroupData extends Record<string, unknown> {
  stage: StageConfig;
  count: number;
  width: number;
  height: number;
  allowEdit?: boolean;
  onAddLink?: (
    stageKey: BusinessStageKey,
    docType?: TraceabilityNodeType,
  ) => void;
  allowedDocTypes?: TraceabilityNodeType[];
}
