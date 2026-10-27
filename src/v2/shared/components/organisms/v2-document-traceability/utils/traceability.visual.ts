import { DOC_TYPE_META } from "../constants/traceability.constants";
import {
  NEUTRAL_BADGE,
  type TraceabilityVisualInput,
  type TraceabilityVisualMeta,
} from "./traceability.visual.tokens";
import { getInvoiceVisualMeta } from "./traceability.visual.invoice";
import { getBankVisualMeta } from "./traceability.visual.bank";

export type {
  TraceabilityVisualInput,
  TraceabilityVisualMeta,
} from "./traceability.visual.tokens";
export { isManualSettlementNode } from "./traceability.visual.bank";

/** Nhãn, màu và cờ thu/chi của một node; loại khác dùng nhãn mặc định của DOC_TYPE_META */
export function getTraceabilityVisualMeta(
  node: TraceabilityVisualInput,
): TraceabilityVisualMeta {
  if (node.docType === "INVOICE") return getInvoiceVisualMeta(node);
  if (node.docType === "BANK_TXN") return getBankVisualMeta(node);
  const meta = DOC_TYPE_META[node.docType];
  return {
    label: meta?.label ?? node.docType,
    fullTitleKey: meta?.fullTitleKey ?? node.docType,
    badgeCls: meta?.badgeCls ?? NEUTRAL_BADGE,
  };
}
